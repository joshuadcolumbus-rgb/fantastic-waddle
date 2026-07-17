#!/usr/bin/env python3
"""
NEXTDOOR LEAD WATCHER — browser-based feed monitor
==================================================
Logs into Nextdoor once with YOUR session (you type the password, the script
never sees it), then polls your news feed on a moderate, jittered schedule
between 7am and 8pm. New posts matching your keywords trigger a Pushover
notification to your phone with a snippet and a direct link to the post.

Usage:
    python nextdoor_watch.py --login          # one-time: opens a browser, log in manually
    python nextdoor_watch.py --test-pushover  # confirm your phone buzzes
    python nextdoor_watch.py --once           # single scan now (good for testing)
    python nextdoor_watch.py                  # run the 7am-8pm watch loop forever

Setup and tuning: see README.md in this folder. Config lives in config.json.
"""

import argparse
import json
import logging
import random
import re
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

import requests
from playwright.sync_api import sync_playwright

BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config.json"
STATE_DIR = BASE_DIR / "state"
PROFILE_DIR = STATE_DIR / "browser_profile"
SEEN_PATH = STATE_DIR / "seen_posts.json"
LOG_PATH = STATE_DIR / "watch.log"

FEED_URL = "https://nextdoor.com/news_feed/"
MAX_SEEN_REMEMBERED = 5000

log = logging.getLogger("nextdoor_watch")


# ------------------------------ config / state ------------------------------

def load_config():
    if not CONFIG_PATH.exists():
        sys.exit(
            "config.json not found. Copy config.example.json to config.json "
            "and fill in your Pushover keys."
        )
    with open(CONFIG_PATH, encoding="utf-8") as f:
        cfg = json.load(f)
    for key in ("pushover_app_token", "pushover_user_keys", "keywords"):
        if not cfg.get(key) or "PASTE" in str(cfg.get(key)):
            sys.exit(f"config.json: please fill in '{key}'.")
    return cfg


def load_seen():
    if SEEN_PATH.exists():
        with open(SEEN_PATH, encoding="utf-8") as f:
            return list(json.load(f))
    return []


def save_seen(seen):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    with open(SEEN_PATH, "w", encoding="utf-8") as f:
        json.dump(seen[-MAX_SEEN_REMEMBERED:], f)


# ------------------------------ notifications -------------------------------

def send_pushover(cfg, title, message, url=""):
    for user_key in cfg["pushover_user_keys"]:
        payload = {
            "token": cfg["pushover_app_token"],
            "user": user_key,
            "title": title,
            "message": message[:900],
        }
        if url:
            payload["url"] = url
            payload["url_title"] = "Open on Nextdoor"
        try:
            r = requests.post(
                "https://api.pushover.net/1/messages.json", data=payload, timeout=15
            )
            if r.status_code != 200:
                log.warning("Pushover error %s: %s", r.status_code, r.text[:200])
        except requests.RequestException as e:
            log.warning("Pushover request failed: %s", e)


# ------------------------------ time window ---------------------------------

def in_window(cfg, now=None):
    now = now or datetime.now()
    return cfg["alert_start_hour"] <= now.hour < cfg["alert_end_hour"]


def seconds_until_window(cfg):
    now = datetime.now()
    start = now.replace(hour=cfg["alert_start_hour"], minute=0, second=0, microsecond=0)
    if now.hour >= cfg["alert_end_hour"]:
        start += timedelta(days=1)
    return max(60, int((start - now).total_seconds()))


# ------------------------------ browser -------------------------------------

def launch_browser(p, cfg, headed=False):
    """Persistent profile so the login survives restarts. Tries your real
    Chrome first (if installed), falls back to Playwright's Chromium."""
    PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    kwargs = dict(
        user_data_dir=str(PROFILE_DIR),
        headless=(not headed) and cfg.get("headless", True),
        viewport={"width": 1366, "height": 850},
    )
    channel = cfg.get("browser_channel", "chrome")
    try:
        return p.chromium.launch_persistent_context(channel=channel, **kwargs)
    except Exception:
        return p.chromium.launch_persistent_context(**kwargs)


def looks_logged_out(page):
    if re.search(r"/(login|authenticate)", page.url):
        return True
    try:
        return page.locator("input[type='password']").count() > 0
    except Exception:
        return False


def fetch_posts(page):
    """DOM-structure-agnostic extraction: Nextdoor permalinks all contain /p/<id>,
    so we collect those anchors and climb to each post's text container. This
    survives most of their layout changes."""
    return page.evaluate(
        """() => {
            const seen = new Map();
            for (const a of document.querySelectorAll('a[href*="/p/"]')) {
                const m = a.href.match(/\\/p\\/([A-Za-z0-9_-]+)/);
                if (!m || seen.has(m[1])) continue;
                let node = a;
                for (let i = 0; i < 8 && node.parentElement; i++) {
                    node = node.parentElement;
                    if ((node.innerText || '').trim().length > 120) break;
                }
                seen.set(m[1], {
                    id: m[1],
                    url: 'https://nextdoor.com/p/' + m[1],
                    text: (node.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 1500),
                });
            }
            return Array.from(seen.values());
        }"""
    )


def gentle_scroll(page):
    for _ in range(random.randint(2, 4)):
        page.mouse.wheel(0, random.randint(600, 1400))
        time.sleep(random.uniform(1.2, 3.5))


# ------------------------------ scanning ------------------------------------

def snippet_around(text, keyword, radius=150):
    idx = text.lower().find(keyword.lower())
    if idx == -1:
        return text[:250]
    start = max(0, idx - radius // 2)
    return ("…" if start else "") + text[start : idx + radius] + "…"


def scan_once(context, cfg, seen_ids, notify=True):
    page = context.pages[0] if context.pages else context.new_page()
    page.goto(FEED_URL, wait_until="domcontentloaded", timeout=60000)
    time.sleep(random.uniform(3, 6))

    if looks_logged_out(page):
        return None  # signal: session expired

    gentle_scroll(page)
    posts = fetch_posts(page)
    log.info("Scan: %d posts visible", len(posts))

    keywords = [k.lower() for k in cfg["keywords"]]
    new_matches = 0
    for post in posts:
        if post["id"] in seen_ids:
            continue
        seen_ids.append(post["id"])
        hits = [k for k in keywords if k in post["text"].lower()]
        if not hits:
            continue
        new_matches += 1
        title = "🔔 Nextdoor lead: " + ", ".join(hits[:3])
        body = snippet_around(post["text"], hits[0])
        log.info("MATCH %s (%s)", post["id"], ", ".join(hits[:3]))
        if notify:
            send_pushover(cfg, title, body, post["url"])
        else:
            print(f"\n--- MATCH [{', '.join(hits)}] {post['url']}\n{body}\n")

    save_seen(seen_ids)
    return new_matches


# ------------------------------ modes ----------------------------------------

def do_login(cfg):
    print("A browser window will open. Log into Nextdoor as usual, wait until")
    print("your feed loads, then close the window. Your session is saved locally.")
    with sync_playwright() as p:
        context = launch_browser(p, cfg, headed=True)
        page = context.pages[0] if context.pages else context.new_page()
        page.goto("https://nextdoor.com/login/", wait_until="domcontentloaded")
        try:
            page.wait_for_event("close", timeout=0)  # wait until user closes tab
        except Exception:
            pass
        try:
            context.close()
        except Exception:
            pass
    print("Session saved. Run `python nextdoor_watch.py --once` to test a scan.")


def watch_loop(cfg):
    seen_ids = load_seen()
    session_alerted = False
    first_ever_run = not SEEN_PATH.exists()
    if first_ever_run:
        log.info("First run: current matching posts in the feed WILL alert.")

    with sync_playwright() as p:
        context = launch_browser(p, cfg)
        while True:
            if not in_window(cfg):
                wait = seconds_until_window(cfg)
                log.info("Outside %d:00-%d:00 window; sleeping %d min.",
                         cfg["alert_start_hour"], cfg["alert_end_hour"], wait // 60)
                time.sleep(wait)
                continue

            try:
                result = scan_once(context, cfg, seen_ids)
                if result is None:
                    if not session_alerted:
                        session_alerted = True
                        send_pushover(
                            cfg, "⚠️ Nextdoor watcher logged out",
                            "Session expired. On the computer, run:  "
                            "python nextdoor_watch.py --login",
                        )
                    log.warning("Logged out; will retry next cycle.")
                else:
                    session_alerted = False
            except Exception as e:
                log.warning("Scan failed (%s); retrying next cycle.", e)

            base = cfg.get("poll_minutes", 12) * 60
            jitter = cfg.get("jitter_minutes", 3) * 60
            delay = base + random.uniform(-jitter, jitter)
            log.info("Next check in %.1f min.", delay / 60)
            time.sleep(max(300, delay))


def main():
    parser = argparse.ArgumentParser(description="Nextdoor lead watcher")
    parser.add_argument("--login", action="store_true", help="open browser to log in manually")
    parser.add_argument("--once", action="store_true", help="run a single scan, print matches, and notify")
    parser.add_argument("--test-pushover", action="store_true", help="send a test notification")
    args = parser.parse_args()

    STATE_DIR.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[logging.StreamHandler(), logging.FileHandler(LOG_PATH, encoding="utf-8")],
    )

    cfg = load_config()

    if args.test_pushover:
        send_pushover(cfg, "✅ Nextdoor watcher is live",
                      "Test notification — if your phone buzzed, setup works.",
                      "https://nextdoor.com")
        print("Sent. Check your phone.")
    elif args.login:
        do_login(cfg)
    elif args.once:
        with sync_playwright() as p:
            context = launch_browser(p, cfg)
            result = scan_once(context, cfg, load_seen())
            if result is None:
                print("Not logged in — run: python nextdoor_watch.py --login")
            else:
                print(f"Scan complete: {result} new matching post(s).")
    else:
        watch_loop(cfg)


if __name__ == "__main__":
    main()
