# Consent Manager Integration Guide

**Audience:** the implementation team wiring a real Consent Management Platform
(CMP) into this site in a later phase.

**Status today:** the site ships with a *placeholder* consent implementation
(`scripts/consent-check.js`). It declines consent by default and can be forced on
for testing with a `?consent=accept` query parameter. No real CMP is connected
yet. Consent-gated features (currently the **embed-social "live"** social feed,
and anything added to `scripts/consented.js`) are wired to a small, CMP-agnostic
contract so you can swap in OneTrust / Usercentrics / Cookiebot / etc. without
touching the blocks.

---

## 1. The consent contract (what the site expects)

Everything consent-gated in this project depends on **one browser event** and
**one boolean**. Your CMP integration only has to produce these correctly.

### 1a. The event

```js
window.dispatchEvent(new CustomEvent('consent.update', {
  detail: { consented: true },   // true = consent granted, false = declined
}));
```

- **Event name:** `consent.update` (on `window`).
- **`detail.consented`:** `true` when the visitor has accepted the relevant
  category, `false` otherwise.
- **Dispatch it:**
  1. **once on page load**, as soon as the current consent state is known, and
  2. **again every time the visitor changes their choice** (accept, decline, or
     edit preferences in the CMP's second layer).

Consumers (blocks, `consented.js`) listen for this event and react. They also
tolerate the event being fired multiple times — loading a gated resource is
idempotent (guarded so it only happens once).

### 1b. The "already consented on load" case

A block may decorate *after* your CMP has already resolved consent (e.g. a
returning visitor with a stored choice). So, in addition to listening for future
`consent.update` events, gated code also checks the **current** state at load
time. Expose the current state in a way the code can read synchronously. Today
that check reads the `?consent=` query param; you will replace that with a call
into your CMP (see §3, step 3).

### 1c. Consent category

The social feed is a **third-party / marketing-and-social** integration
(Flockler → LinkedIn). Map it to whatever your CMP calls that category
(Usercentrics: *"Marketing and Social Media"*; OneTrust: *"Targeting"* /
*"Social Media Cookies"*; etc.). Only report `consented: true` for the social
feed when **that** category is accepted — not merely when "essential" is on.

> If you need finer granularity later (e.g. analytics vs. social as separate
> gates), extend `detail` with named flags, e.g.
> `detail: { consented, categories: { social: true, analytics: false } }`, and
> update the consumers to read the specific flag. The current single boolean is
> enough for what ships today.

---

## 2. Where this lives in the code

| File | Role |
|------|------|
| `scripts/consent-check.js` | **The placeholder CMP.** Decides consent and dispatches `consent.update`. **This is the file you replace/rewire.** Loaded from `loadDelayed()` in `scripts/scripts.js`. |
| `scripts/consented.js` | Where consent-gated *global* scripts go (analytics, martech). Imported once when consent is granted. |
| `blocks/embed-social/embed-social.js` | The social block. Its **live** variant listens for `consent.update` and loads RWE's Flockler wall only when `consented` is true. Consumer — **no change needed** when you wire the CMP. |

Current placeholder logic (abridged) in `scripts/consent-check.js`:

```js
function hasConsent() {
  const consent = new URLSearchParams(window.location.search).get('consent');
  if (consent !== null) return ['accept', 'true', '1', 'yes'].includes(consent.toLowerCase());
  return false; // default: decline
}

function onConsentUpdate() {
  const consented = hasConsent();
  window.dispatchEvent(new CustomEvent('consent.update', { detail: { consented } }));
  if (consented) import('./consented.js');
}

onConsentUpdate();
```

How the social block consumes it (in `blocks/embed-social/embed-social.js`,
already implemented — shown here so you can see both sides of the contract):

```js
function initLiveFeed(block, fallback) {
  // React to future consent changes.
  window.addEventListener('consent.update', (e) => {
    if (e.detail && e.detail.consented) loadFlocklerWall(block, fallback);
  });
  // Handle consent already granted before this block loaded.
  const p = new URLSearchParams(window.location.search).get('consent');
  if (p && ['accept', 'true', '1', 'yes'].includes(p.toLowerCase())) {
    loadFlocklerWall(block, fallback);
  }
}
```

When you wire the real CMP (§3), that second "already granted" check should read
your CMP's current state instead of the query param. Keeping a shared helper
(§3, step 3) means you change it in one place.

---

## 3. How to wire a real CMP

Replace the body of `scripts/consent-check.js` so that it derives consent from
your CMP instead of the query param, while **keeping the same public behaviour**:
dispatch `consent.update` on load and on every change.

**Step 1 — Load the CMP.** Add the CMP loader/script to `head.html` (or load it
from `consent-check.js`) per your vendor's install instructions. Note the CSP in
`head.html` uses `strict-dynamic`; scripts injected by our nonce'd scripts are
trusted, but if the CMP is added as a plain `<script src>` in `head.html` you may
need to add its host to `script-src` / `connect-src` / `frame-src`.

**Step 2 — Translate the CMP's callback into our event.** Every CMP exposes a
"consent changed" callback and a way to query current state. Bridge it:

```js
// Example shape — adapt to your CMP's real API.
function currentSocialConsent() {
  // Return true only when the marketing/social category is accepted.
  return window.MyCMP?.hasConsent('social-media') === true;
}

function publish() {
  const consented = currentSocialConsent();
  window.dispatchEvent(new CustomEvent('consent.update', { detail: { consented } }));
  if (consented) import('./consented.js');
}

// a) Fire once when the CMP is ready / initial state is known:
window.MyCMP?.onReady(publish);
// b) Fire again on every change (accept / decline / edit preferences):
window.MyCMP?.onConsentChanged(publish);
```

Vendor hooks for reference (check current vendor docs — APIs change):
- **Usercentrics:** `window.__ucCmp` / `UC_UI` events (`onConsentStatusChange`),
  or the `ucEvent` / `consent` `window` messages.
- **OneTrust:** `OptanonWrapper()` callback + `OnetrustActiveGroups` string;
  listen for the `OneTrustGroupsUpdated` event.
- **Cookiebot:** `window.Cookiebot.consent.marketing`; `CookiebotOnAccept` /
  `CookiebotOnDecline` events.

**Step 3 — Expose current state for late-decorating consumers.** So blocks that
decorate after consent is already resolved can check synchronously, export a
helper and use it in both `consent-check.js` and the block instead of the query
param:

```js
// scripts/consent-check.js
export function hasSocialConsent() {
  return currentSocialConsent(); // your CMP query from step 2
}
```

Then in `blocks/embed-social/embed-social.js`, replace the `?consent=` check in
`initLiveFeed` with an import of `hasSocialConsent()`. Keep the query-param
override **only** if you still want it for QA (harmless; or drop it once the CMP
is authoritative).

**Step 4 — Keep the test override (optional).** The `?consent=accept` param is
handy for QA and demos. You can keep honouring it as a manual override in
non-production environments, or gate it behind a hostname check.

---

## 4. What is consent-gated today

- **embed-social "live" variant** (`blocks/embed-social/`): loads RWE's Flockler
  social wall (`plugins.flockler.com/embed/<site>/<wall>`), which in turn embeds
  LinkedIn content. This is the main thing your CMP must gate under the
  marketing/social category. The block shows author-managed fallback cards until
  consent is granted, then swaps in the live wall.
- **`scripts/consented.js`**: currently empty; any analytics/martech added there
  loads only after `consent.update` reports `consented: true`.

The **default** embed-social variant (author-managed cards, no `live` class)
loads **no** third-party scripts and needs no consent — only the `live` variant
touches Flockler.

---

## 5. Acceptance checklist for the CMP wiring

- [ ] With consent **declined** (default): no request to `plugins.flockler.com`
      (or any third-party) is made; the social block shows the authored fallback
      cards. Verify in DevTools → Network.
- [ ] With consent **granted** via the real CMP: `consent.update` fires with
      `detail.consented === true`, the Flockler wall loads, and the fallback
      cards are hidden.
- [ ] **Changing** the choice in the CMP's preference centre re-fires
      `consent.update` and the page reflects the new state (a reload is
      acceptable if that matches the CMP's model — the live RWE site reloads
      after consent changes).
- [ ] Consent given by a **returning visitor** (stored choice) loads the feed on
      first paint without needing a query param (§1b / §3 step 3).
- [ ] `scripts/consented.js` contents (if any) load only after consent.
- [ ] CSP in `head.html` allows the CMP host and the Flockler host; no CSP
      violations in the console.

---

## 6. Quick reference

| Item | Value |
|------|-------|
| Event | `consent.update` on `window` |
| Payload | `{ detail: { consented: boolean } }` |
| Fire when | on load (initial state) **and** on every change |
| Category to map | marketing / social media |
| File to change | `scripts/consent-check.js` |
| Consumers (no change) | `blocks/embed-social/embed-social.js`, `scripts/consented.js` |
| Test override (pre-CMP) | `?consent=accept` (grant) · `?consent=decline` (deny) |
| Flockler wall gated | site `1740543370f005f9a7ee89ffd1e28277`, wall `1973f081d510ac80a2f9c9713a49f9e5` |
