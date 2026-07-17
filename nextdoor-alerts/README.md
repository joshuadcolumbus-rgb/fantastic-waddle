# Nextdoor Lead Alerts

> Two implementations live here — this file covers the **email pipeline**
> (Gmail + Apps Script, zero account risk). The **browser scraper** (direct
> feed polling, real-time but against Nextdoor's ToS) is in
> [`scraper/`](scraper/README.md). They share the same Pushover setup, so you
> can switch between them anytime.

Get a push notification on your phone within ~5 minutes whenever a Nextdoor
post in your area matches your keywords — every day, 7am–8pm.

**How it works:** Nextdoor emails you about new posts → a small Google Apps
Script watches your Gmail every 5 minutes → keyword match → Pushover buzzes
your phone with the post snippet and a link.

No server, no scraping, nothing to keep running at home. Total cost: **$5
one-time** (Pushover). Everything else is free.

---

## Step 1 — Make Nextdoor email you about every post (5 min)

The whole system is only as good as what Nextdoor emails you, so open the tap:

1. Nextdoor → profile picture → **Settings → Notifications**.
2. Under **Email**, turn ON notifications for **New posts / Your neighborhood
   activity** (naming varies) — choose the most frequent/instant option, not
   "daily digest".
3. Also turn on emails for **nearby neighborhoods** if offered — more coverage,
   more leads.

> Tip: these emails will get noisy. That's fine — the script reads them so you
> don't have to. Add a Gmail filter to archive them (skip inbox) if you like;
> the script still sees them.

## Step 2 — Pushover (5 min)

1. Create an account at [pushover.net](https://pushover.net) and install the
   **Pushover** app (iOS/Android). Free 30-day trial, then $5 one-time.
2. Your dashboard shows a **User Key** — copy it.
3. Click **Create an Application/API Token**, name it `Nextdoor Alerts`, and
   copy the **API Token**.

## Step 3 — Install the script (10 min)

1. Go to [script.google.com](https://script.google.com) **signed in as the
   Gmail account that receives the Nextdoor emails** → **New project**.
2. Delete the placeholder code, paste in all of `Code.gs`.
3. Fill in the `CONFIG` block at the top:
   - `PUSHOVER_APP_TOKEN` — the API token from Step 2.
   - `PUSHOVER_USER_KEYS` — your user key.
   - `KEYWORDS` — comes pre-loaded with a broad all-home-services list
     (hiring phrases + every major trade). Matching is "contains", so
     `recommend` also catches "recommendation". Prune whatever proves noisy.
4. **Project Settings (gear icon) → Time zone** → set to your local time zone
   (this is what makes 7am–8pm correct).
5. In the editor toolbar, select the function **`setup`** → **Run**. Google
   will ask for permissions (read Gmail, connect to external service) — approve.
   This creates the every-5-minutes timer.
6. Select **`testPushover`** → **Run**. Your phone should buzz. Done.

## Daily behavior

- Checks email every 5 minutes, around the clock.
- Only **sends alerts between 7:00am and 8:00pm** (edit `ALERT_START_HOUR` /
  `ALERT_END_HOUR` in CONFIG to change).
- Each email is processed once — a Gmail label `Nextdoor-Alerted` marks what's
  been handled, so no duplicate buzzes.
- Notification shows the matched keywords, a snippet of the post, and an
  **Open on Nextdoor** link — tap it and reply to the post fast. Speed wins
  these jobs.

## Tuning tips

- **Too many alerts?** The intent phrases (`recommend`, `hire`, `quote`) and
  broad terms (`painting`, `carpet`) buzz the most — remove the worst
  offenders first and keep the trade-specific terms.
- **Missing posts?** Nextdoor only emails what your notification settings
  allow — recheck Step 1, and consider joining/following nearby neighborhoods.
- **Change the schedule?** Edit the hours in CONFIG and save. The 5-minute
  check itself is fine to leave running 24/7 — it exits instantly outside the
  window and costs nothing.
- **Add a phone later?** Add its user key to `PUSHOVER_USER_KEYS` and save.

## Get more out of it (free, worth doing)

Since the goal is customers: claim a free **Nextdoor Business Page** for your
company. When you reply to a "can anyone recommend…" post, neighbors can tap
through to your page, reviews, and contact info. Fast reply + real page =
booked job.
