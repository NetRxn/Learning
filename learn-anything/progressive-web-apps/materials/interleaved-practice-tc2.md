# Interleaved Practice Set: TC2 — Caching Strategy

**Instructions:** Answer each problem, then note which strategy/concept you used and why. Problems are intentionally mixed across topics.

---

**Problem 1** (Current: Caching Strategy Selection)
A recipe app has user-uploaded photos at `/photos/[id].jpg`. The same URL always points to the same photo (photos aren't editable after upload). Which caching strategy should the SW use for these photos?

---

**Problem 2** (Review: Browser Request Lifecycle — TC1)
A user opens your PWA for the first time ever. They've never visited the site before. Which cache layers can possibly have a hit for the main HTML page? Which definitely won't?

---

**Problem 3** (Current: SW + CDN Interaction)
You deploy a new version of your app. JS bundles use content-hashed filenames. The CDN has a 1-year TTL on JS files. Will users get the new code? Why or why not?

---

**Problem 4** (Review: Service Worker Lifecycle — TC1)
Your new SW is installed but in the "waiting" state. The user has 3 tabs open. What must happen before the new SW activates? What's the alternative if you need immediate activation?

---

**Problem 5** (Current: Caching Strategy Selection — Discrimination Pair)
Two apps both serve a resource at `/data/config.json`. App A's config changes every deploy (daily). App B's config changes every 6 months. Should they use the same caching strategy? Assign strategies to each and explain.

---

**Problem 6** (Review: HTTP Caching Fundamentals — TC1)
A response has headers: `Cache-Control: max-age=300, ETag: "abc123"`. After 200 seconds, a request is made for the same resource. After 400 seconds, another request is made. Describe what happens in each case.

---

**Problem 7** (Current: SW + HTTP Cache Alignment)
Your SW uses stale-while-revalidate for HTML pages. The background revalidation fetch returns a response. How can you tell if this response came from the HTTP cache or from the actual network?

---

**Problem 8** (Current: App Shell Pattern)
Two PWAs: one is a React SPA, the other is a multi-page htmx app. Both want to show content instantly on repeat visits. How does each achieve this? (This is a discrimination pair — similar goal, different approaches.)

---

**Problem 9** (Review: Service Worker Lifecycle — TC1)
The browser checks for SW updates every 24 hours. A developer pushes a critical security fix to the SW. What's the maximum time before all active users get the fix? Can you speed this up?

---

**Problem 10** (Current: SW + CDN Interaction)
Your API endpoint returns `Cache-Control: no-store`. Your SW uses network-first for API calls but does NOT set `{ cache: 'reload' }` on the fetch. Will the API response ever be served from a stale cache? Why or why not?

---

## Answer Key (check after attempting all problems)

**1:** Cache-First. URLs are immutable (same photo always at same URL, not editable). Safe to cache forever. Add an ExpirationPlugin with maxEntries to prevent storage bloat.

**2:** Memory cache: no (new tab, nothing loaded). SW: no (not installed yet). HTTP cache: no (never visited). CDN: possibly (CDN caches for everyone, but user's request hasn't gone through it yet — first request for this user goes to CDN edge). Origin: yes (final fallback). The only layers that could have content are CDN and origin.

**3:** Yes. The new deploy produces new filenames (different hashes). Old URLs with old hashes are still cached by CDN (1-year TTL) but they're never requested again. New URLs miss CDN cache → CDN fetches from origin → caches the new files. Content-hashed URLs make long CDN TTLs safe.

**4:** All 3 tabs must close (or navigate away) so no clients are controlled by the old SW. Alternative: the waiting SW can call `skipWaiting()`, but this risks breaking open tabs that expect old SW behavior.

**5:** Different strategies. App A: **Stale-While-Revalidate** — serve cached config instantly, update in background. Frequent changes make SWR's eventual freshness acceptable. App B: **Cache-First** with long maxAge — config rarely changes, network requests are wasted. Add a version-check mechanism or rely on SW updates to refresh.

**6:** At 200s: max-age is 300s, so the response is still "fresh." Browser serves from HTTP cache without any network request. At 400s: max-age expired. Browser sends a conditional request with `If-None-Match: "abc123"`. Server responds 304 (not modified) if unchanged, or 200 with new content if changed.

**7:** You can't easily tell from the SW side. The response object looks the same either way. This is why `{ cache: 'reload' }` is important for freshness-critical revalidation — it bypasses the HTTP cache so you're guaranteed the response is from the actual network. Without it, your "background revalidation" might just be reading the HTTP cache.

**8:** React SPA: Cache the App Shell (HTML + JS + CSS) with cache-first. Shell renders instantly from cache. Dynamic content loads via API calls (network-first). htmx MPA: Cache each previously-visited complete HTML page with SWR. Pages serve instantly from cache, revalidate in background. No shell/content separation — each page is the complete content.

**9:** Maximum: 24 hours. Speed up by: (1) changing the SW URL (forces re-download on next visit), (2) using `registration.update()` in the page JS to check for updates more frequently, (3) deploying a page-level change that calls `navigator.serviceWorker.register()` with `updateViaCache: 'none'`.

**10:** No stale cache from HTTP cache. `Cache-Control: no-store` tells the browser NOT to store the response in the HTTP cache at all, so even without `{ cache: 'reload' }`, there's nothing stale in the HTTP cache to return. However, the SW's own Cache API could still hold a stale copy — `no-store` only affects the HTTP cache. Make sure the SW's network-first handler updates its Cache API entry on each network success.
