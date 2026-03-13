# Interleaved Practice Set: TC3 — Architectural Decision-Making

**Instructions:** Mixed problems across all topics covered so far. For each, note the concept/strategy used.

---

**Problem 1** (Current: Offline Strategy Design)
A meditation app lets users download guided meditations (audio files, 5-15 MB each). Users often listen on flights. What offline strategy tier is appropriate? What caching strategy for the audio files?

---

**Problem 2** (Review: SW + CDN Interaction — TC2)
Your CDN has a 5-minute TTL on HTML pages. Your SW uses SWR. A user visits the page, gets the cached version, and the SW fires a background revalidation. The CDN still has the old HTML (TTL not expired). What does the user get on this visit? What about next visit?

---

**Problem 3** (Current: Platform Constraints)
A startup is building a PWA to replace their iOS native app. Their killer feature: offline data collection in the field with background sync when connectivity returns. What should you tell them about iOS?

---

**Problem 4** (Review: Caching Strategy Selection — TC2)
A PWA serves a dashboard at `/dashboard`. The HTML contains personalized user data embedded in the page (server-rendered). Should this be cached? If so, which strategy?

---

**Problem 5** (Current: htmx-PWA Tension — Discrimination Pair)
Two teams want PWA capabilities. Team A has a React SPA. Team B has a Go + htmx MPA. Both want "the app to work offline." How does the achievable offline tier differ, and why?

---

**Problem 6** (Review: Service Worker Lifecycle — TC1)
You deployed a new SW that changes caching strategy from cache-first to network-first for API calls. Users report they're still getting stale API data from cache. The new SW is installed but not activated. Why, and how do you verify this?

---

**Problem 7** (Current: Update Flow Design)
Your PWA has a critical security patch in the JS bundle (not the SW). The SW script itself hasn't changed. Will users get the patched JS? How quickly?

---

**Problem 8** (Current: PWA Fitness Evaluation)
A real-time multiplayer game (WebSocket-based, <50ms latency requirement). Someone proposes making it a PWA for "installability." Evaluate all 5 dimensions quickly — is any PWA investment justified?

---

**Problem 9** (Review: SW + HTTP Cache Alignment — TC2)
You set `Cache-Control: max-age=86400` on your API responses (24-hour cache). Your SW uses network-first WITHOUT `{ cache: 'reload' }`. The server returns updated data at hour 12. When will users see the update?

---

**Problem 10** (Current: Offline Strategy + Platform Constraints)
An education app wants to support offline flashcard review (Tier 2: offline reading) on both iOS and Android. Design the caching approach that handles iOS 7-day eviction gracefully.

---

## Answer Key

**1:** Tier 2 (offline reading/playback). Pre-download requested meditations to Cache API with cache-first strategy (audio files are immutable once published). Use ExpirationPlugin with maxEntries (storage limit). Consider storage quota check before download — alert user if insufficient space.

**2:** This visit: user gets the cached version (SWR serves from cache immediately). Background revalidation hits CDN → CDN serves old HTML (TTL not expired) → SW updates its cache with... the same old content. Next visit: same old content again (unless CDN TTL has now expired). The user is stuck seeing stale content until CDN TTL expires AND the background revalidation runs. Double-staleness in action.

**3:** Three critical warnings: (1) No Background Sync API on iOS — their killer feature doesn't work as designed. Must implement app-level sync queue. (2) 7-day storage eviction — unsynced field data could be lost if the user doesn't open the app for a week. (3) No persistent storage API. Recommendation: keep the native iOS app for field workers; PWA may work for Android users or as a supplement.

**4:** Tricky — personalized HTML should NOT be cached in a shared cache. But if it's per-user (single-user app, or the cache is per-origin which it is), you can use network-first with `{ cache: 'reload' }`. Fallback to cached version shows last-seen dashboard offline. SWR is also acceptable if slightly-stale dashboard is OK.

**5:** Team A (React SPA): Can achieve Tier 3 (offline-first). Client already renders UI, can add IndexedDB for data, App Shell for instant loads, background sync for writes. Team B (htmx MPA): Can achieve Tier 2 (offline reading) practically. Cached visited pages viewable offline. Offline writes are possible via SW POST interception + queue, but no new pages can be generated without the server. The architecture fundamentally determines the offline ceiling.

**6:** The SW is in the "waiting" state because the old SW still controls open tabs. Until all tabs close or the new SW calls skipWaiting(), the OLD SW handles all fetch events — using the old cache-first strategy. Verify in DevTools → Application → Service Workers: look for "waiting to activate" status. The user needs to close all tabs and reopen.

**7:** If the SW script is unchanged, there's no SW update cycle triggered. BUT — if JS bundles use content-hashed filenames, the new bundle has a new URL. The old SW might not know about this new URL. If the HTML references the new bundle URL: HTML loads (SWR updates HTML in background → new HTML has new JS URL → next visit loads new JS). Speed depends on SWR cycle: could be 1-2 visits. If the HTML IS cached and stale: until the SWR background update fetches new HTML → which then references the patched JS bundle.

**8:** Quick evaluation: Offline (none — real-time game is meaningless offline), Platform (not relevant — gaming), Update flow (low — cosmetic updates), Architecture (SPA compatible but no benefit beyond shell caching), Migration cost (minimal for installability). Verdict: Add-on PWA only — manifest for installability (desktop game feels more like an app), cache-first for static assets (faster cold loads). Don't invest in offline/caching of game state.

**9:** Not until hour 24. The SW calls fetch() → browser checks HTTP cache → finds "fresh" response (max-age 86400, only 12 hours old) → returns stale data without hitting the network. The server's updated data is invisible until the HTTP cache entry expires at hour 24. Fix: add `{ cache: 'reload' }` to bypass HTTP cache.

**10:** Cache flashcard decks in Cache API with SWR. On iOS: on every app open, immediately sync/refresh the cache (don't rely on cache persisting). Design for "cache is a convenience, not a guarantee." Store a lightweight metadata index in IndexedDB indicating what's cached. On app open: check if cache is intact, if not → prioritize re-downloading the user's active decks. On Android: request persistent storage via `navigator.storage.persist()` for reliable offline access.
