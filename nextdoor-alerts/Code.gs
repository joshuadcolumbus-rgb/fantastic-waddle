/**
 * NEXTDOOR LEAD ALERTS — Google Apps Script
 * =========================================
 * Watches your Gmail for Nextdoor notification emails, matches them against
 * your keywords, and sends an instant Pushover notification to your phone.
 *
 * Runs every 5 minutes (via time trigger), but only alerts 7am–8pm.
 * No servers, no scraping — it only reads your own inbox.
 *
 * SETUP: see README.md. Short version:
 *   1. Fill in CONFIG below (Pushover token + user keys, tweak keywords).
 *   2. Run setup() once and grant permissions.
 *   3. Run testPushover() to confirm phones buzz.
 */

// ============================== CONFIG ==============================

const CONFIG = {
  // From pushover.net → "Create an Application/API Token"
  PUSHOVER_APP_TOKEN: 'PASTE_APP_TOKEN_HERE',

  // Your Pushover user key (from your account page). Add more entries
  // later if another phone joins.
  PUSHOVER_USER_KEYS: [
    'PASTE_YOUR_USER_KEY',
  ],

  // A post CONTAINING any of these triggers an alert. Case-insensitive
  // substring match, so 'recommend' also catches 'recommendation(s)' and
  // 'landscap' catches landscaper/landscaping. Cast wide across all
  // home-service work — prune anything that gets too noisy.
  KEYWORDS: [
    // "hiring intent" phrases — catch requests for any kind of work
    'recommend', 'referral', 'looking for someone', 'looking for a good',
    'anyone know', 'who do you use', 'any suggestions', 'need someone',
    'need help with', 'hire', 'quote', 'estimate',
    // trades and services
    'handyman', 'contractor', 'electrician', 'electrical', 'plumber',
    'plumbing', 'hvac', 'air conditioning', 'furnace', 'water heater',
    'roofer', 'roofing', 'gutter', 'siding', 'insulation', 'window install',
    'window replacement', 'garage door', 'appliance repair', 'painter',
    'painting', 'drywall', 'carpenter', 'remodel', 'renovat', 'flooring',
    'tile work', 'carpet', 'concrete', 'driveway', 'paver', 'mason',
    'chimney', 'fence', 'fencing', 'deck', 'patio', 'landscap', 'lawn care',
    'mowing', 'yard work', 'tree removal', 'tree trimming', 'stump',
    'sprinkler', 'irrigation', 'pressure wash', 'power wash', 'junk removal',
    'hauling', 'demolition', 'excavat', 'grading', 'welding', 'locksmith',
    'pest control', 'house cleaning', 'gutter cleaning', 'movers',
    'moving help',
  ],

  // Alert window (24h clock, local time). 7 → 7:00am, 20 → 8:00pm.
  ALERT_START_HOUR: 7,
  ALERT_END_HOUR: 20,

  // Gmail search for Nextdoor mail. Catches all their sender addresses.
  GMAIL_SEARCH: 'from:(nextdoor.com) newer_than:1d',

  // Label applied to processed threads so nothing alerts twice.
  PROCESSED_LABEL: 'Nextdoor-Alerted',
};

// ======================= MAIN (runs on trigger) ======================

function checkNextdoorEmails() {
  const hour = Number(Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'H'));
  if (hour < CONFIG.ALERT_START_HOUR || hour >= CONFIG.ALERT_END_HOUR) {
    return; // outside 7am–8pm — do nothing
  }

  const label = getOrCreateLabel_(CONFIG.PROCESSED_LABEL);
  const query = CONFIG.GMAIL_SEARCH + ' -label:' + CONFIG.PROCESSED_LABEL;
  const threads = GmailApp.search(query, 0, 25);

  for (const thread of threads) {
    try {
      for (const message of thread.getMessages()) {
        const subject = message.getSubject() || '';
        const body = message.getPlainBody() || '';
        const haystack = (subject + '\n' + body).toLowerCase();

        const matched = CONFIG.KEYWORDS.filter(k => haystack.includes(k.toLowerCase()));
        if (matched.length === 0) continue;

        const link = extractNextdoorLink_(message.getBody() || '');
        const snippet = makeSnippet_(body, matched[0]);

        sendPushover_(
          '🔔 Nextdoor lead: ' + matched.slice(0, 3).join(', '),
          subject + '\n\n' + snippet,
          link
        );
      }
    } finally {
      // Label even on no-match/error so the same thread is never rescanned.
      thread.addLabel(label);
    }
  }
}

// ============================ HELPERS ===============================

function sendPushover_(title, message, url) {
  for (const userKey of CONFIG.PUSHOVER_USER_KEYS) {
    const payload = {
      token: CONFIG.PUSHOVER_APP_TOKEN,
      user: userKey,
      title: title,
      message: message.slice(0, 900), // Pushover limit is 1024
      priority: '0',
    };
    if (url) {
      payload.url = url;
      payload.url_title = 'Open on Nextdoor';
    }
    UrlFetchApp.fetch('https://api.pushover.net/1/messages.json', {
      method: 'post',
      payload: payload,
      muteHttpExceptions: true,
    });
  }
}

/** Short window of text around the first keyword hit, for the notification. */
function makeSnippet_(body, keyword) {
  const clean = body.replace(/\s+/g, ' ').trim();
  const idx = clean.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return clean.slice(0, 250);
  const start = Math.max(0, idx - 100);
  return (start > 0 ? '…' : '') + clean.slice(start, idx + 200) + '…';
}

/** First nextdoor.com post link in the email's HTML, if any. */
function extractNextdoorLink_(html) {
  const match = html.match(/https?:\/\/[a-z]*\.?nextdoor\.com\/[^\s"'<>]+/i);
  return match ? match[0] : '';
}

function getOrCreateLabel_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}

// ========================= ONE-TIME SETUP ===========================

/** Run this ONCE: creates the every-5-minutes trigger. */
function setup() {
  // Clear any old triggers for this function so it never doubles up.
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'checkNextdoorEmails')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('checkNextdoorEmails')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('Trigger created. The script now checks email every 5 minutes, alerting 7am–8pm.');
}

/** Run this to confirm Pushover reaches your phone. */
function testPushover() {
  sendPushover_(
    '✅ Nextdoor alerts are live',
    'Test notification — if your phone buzzed, setup is complete.',
    'https://nextdoor.com'
  );
}
