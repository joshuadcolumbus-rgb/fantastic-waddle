# Nextdoor Lead Watcher (browser scraper)

Polls your Nextdoor news feed with your own logged-in browser session on an
always-on computer, and Pushover-buzzes your phone when a post matches your
keywords. Checks every ~9–15 minutes (randomized), 7am–8pm only.

**Know the deal:** this automates a logged-in Nextdoor session, which is
against their Terms of Service and carries some risk to the account. The
defaults here are deliberately moderate — one persistent browser profile,
slow randomized polling, gentle scrolling. Don't lower `poll_minutes` below
~8, and don't run it from multiple machines at once.

## What you need

- A computer that stays on during the day (Windows/Mac/Linux is fine)
- Python 3.10+
- Pushover on your phone ($5 one-time): create an account at
  [pushover.net](https://pushover.net), grab your **User Key**, and create an
  **Application/API Token** named `Nextdoor Alerts`. (A second phone can be
  added anytime — just append its user key to the config.)

## Setup (15 min)

```bash
cd nextdoor-alerts/scraper
pip install -r requirements.txt
python -m playwright install chromium     # fallback browser; real Chrome is used if installed

cp config.example.json config.json        # then edit config.json:
#  - paste the Pushover app token + your user key
#  - review the keywords (broad home-services list; prune what's too noisy)
```

Then, one time only, log in by hand (the script never sees your password —
it just keeps the browser profile):

```bash
python nextdoor_watch.py --login    # browser opens; log in, wait for your feed, close the window
python nextdoor_watch.py --test-pushover   # your phone should buzz
python nextdoor_watch.py --once            # one real scan right now
```

## Run it

```bash
python nextdoor_watch.py
```

That's it — leave the terminal running. The loop sleeps outside 7am–8pm and
resumes on its own, so you start it once, not every morning.

**Start automatically on boot (optional):**
- **Windows:** Task Scheduler → Create Task → trigger *At log on* → action
  `pythonw.exe` with argument `C:\path\to\nextdoor_watch.py`.
- **Mac:** run it inside `caffeinate -i python3 nextdoor_watch.py` so the Mac
  doesn't sleep through the day, and add it as a Login Item (or a LaunchAgent).
- **Linux:** a `systemd` user service, or just `tmux` + your normal uptime.

## Day-to-day

- **Notification** = matched keywords + post snippet + **Open on Nextdoor**
  link. Tap, reply fast, win the job.
- **No duplicates** — seen post IDs are remembered in `state/seen_posts.json`.
- **First run** will alert on matching posts already sitting in the feed —
  that's a feature (they're current leads), not a bug.
- **Logged out?** You'll get one Pushover warning. On the computer, run
  `python nextdoor_watch.py --login` again; the loop picks the session back up
  on its next cycle.
- **Logs** are in `state/watch.log` if something looks off.

## Tuning

All in `config.json`:

| Setting | Default | Notes |
|---|---|---|
| `keywords` | all home services | substring match: `recommend` catches "recommendation", `landscap` catches "landscaping" |
| `alert_start_hour` / `alert_end_hour` | 7 / 20 | 24-hour clock, local time |
| `poll_minutes` / `jitter_minutes` | 12 / 3 | actual gap is 9–15 min; keep ≥ 8 |
| `headless` | true | set false to watch it work |
| `browser_channel` | chrome | uses installed Chrome; auto-falls back to Chromium |

## Heads-up on breakage

Nextdoor changes their site regularly. The post extractor is written to be
layout-agnostic (it keys off permalink URLs, not page styling), so it should
survive most redesigns — but if scans start reporting `0 posts visible` in the
log while the feed clearly has posts, the site changed in a bigger way and the
extractor needs a tweak.

If the account ever gets flagged or this becomes a maintenance headache, the
zero-risk fallback is already built in the parent folder: the Gmail + Apps
Script pipeline (`../README.md`) — same notifications, powered by Nextdoor's
own emails.
