# Worked Examples: TC1 — The PWA Mental Model

## Problem: Trace a Request Through All Cache Layers

**Scenario:** A user opens your StudyElf flashcard app (Next.js static export, deployed behind Cloudflare CDN, with a service worker installed). They navigate to `/review` to start a flashcard session. The browser needs to load:

1. The HTML page (`/review/index.html`)
2. A JS bundle (`/static/js/main.a3f2b1.js`)
3. An API call (`GET /api/flashcards?deck=pharmacology`)

Trace each request through all 5 cache layers and predict what happens.

---

### Version 1: Full Worked Solution (observe and explain back)

**Request 1: HTML page `/review/index.html`**

| Layer | What happens | Why |
|---|---|---|
| Memory cache | Miss — new navigation, page not in memory | Memory cache only holds resources from the current page load |
| Service Worker | SW intercepts via `fetch` event. Strategy: **Stale-While-Revalidate**. Checks Cache API → finds cached version → serves it immediately. Meanwhile, fires background fetch to get fresh version. | HTML pages change on deploys, but serving stale is OK because the JS bundle URL (content-hashed) will also update |
| HTTP cache | (Background fetch) Browser's HTTP cache may have a copy. If `Cache-Control: max-age` hasn't expired, returns cached version without hitting network. | This is the HTTP cache trap — the background revalidation might just get the HTTP cache's stale copy |
| CDN edge | (If HTTP cache misses) Request reaches Cloudflare edge. If CDN TTL is valid, serves from edge cache. | CDN serves based on its own TTL, independent of SW decisions |
| Origin | (If CDN misses or purged) Request reaches your static file server/bucket. Returns the latest `/review/index.html`. | Final source of truth |

> **Self-explanation prompt:** Why does the SW serve the cached HTML immediately instead of waiting for the network? What's the tradeoff?

**Request 2: JS bundle `/static/js/main.a3f2b1.js`**

| Layer | What happens | Why |
|---|---|---|
| Memory cache | Miss — first time loading this resource in this navigation | Would hit if this script was already loaded on a previous page in same tab |
| Service Worker | SW intercepts. Strategy: **Cache-First**. Checks Cache API → if the exact URL exists, serves it. Done. No network request at all. | The filename contains a content hash (`a3f2b1`). If the content changes, the filename changes. So a cached entry for this URL is always correct. |
| HTTP cache | (Only if Cache API misses — e.g., first visit) Falls through to HTTP cache check. | Subsequent visits always hit Cache API first |
| CDN edge | (If HTTP cache misses) CDN serves the file. Long TTL is safe — URL is content-hashed. | CDN can cache this for a year because the URL is immutable |
| Origin | (First-ever request) Static file server returns the bundle. | Only happens once per unique hash |

> **Self-explanation prompt:** Why is cache-first safe for this URL but would be dangerous for `/review/index.html`?

**Request 3: API call `GET /api/flashcards?deck=pharmacology`**

| Layer | What happens | Why |
|---|---|---|
| Memory cache | Miss — API calls aren't memory-cached by the browser | Memory cache is for sub-resources of the current page (images, scripts), not XHR/fetch responses |
| Service Worker | SW intercepts. Strategy: **Network-First** with `{ cache: 'reload' }` fetchOptions. Attempts network request, bypassing HTTP cache. If network succeeds → caches response in Cache API → returns fresh data. If network fails (offline) → falls back to Cache API's last-good response. | API data should be fresh. `cache: 'reload'` bypasses the HTTP cache trap. Fallback enables offline access to last-seen flashcards. |
| HTTP cache | **Bypassed** — `{ cache: 'reload' }` tells the browser to skip this layer. | Without this, "network-first" would actually be "HTTP-cache-first" |
| CDN edge | Request hits CDN edge. For API routes, CDN should be configured to **not cache** (pass-through) or use very short TTL. | API responses are personalized/dynamic — CDN caching could serve one user's flashcards to another |
| Origin | API server processes the request, returns flashcard data. | Source of truth for dynamic data |

> **Self-explanation prompt:** What would happen if we forgot `{ cache: 'reload' }` on this network-first strategy?

---

### Version 2: Complete the last step (Request 3)

Requests 1 and 2 are worked as above. For Request 3 (the API call):

**Your task:** The SW uses Network-First strategy. Trace this request through all 5 layers. What specific fetchOptions should the SW use and why? What happens if the user is offline?

---

### Version 3: Complete the last 2 steps (Requests 2 and 3)

Request 1 is worked as above. For Requests 2 and 3:

**Your task:** The JS bundle has a content-hashed filename. The API call returns dynamic user data. Choose the appropriate caching strategy for each and trace the request through all 5 layers.

---

### Version 4: Full independent performance

**New scenario:** A recipe blog PWA. User navigates to `/recipes/chocolate-cake`. The page loads:
1. HTML page (`/recipes/chocolate-cake/index.html`) — server-rendered, changes when recipe is edited
2. A hero image (`/images/choc-cake-hero.webp`) — static, rarely changes
3. An API call (`GET /api/comments?recipe=chocolate-cake`) — user-generated content, changes frequently

Trace each through all 5 layers. Choose and justify caching strategies. Identify any traps.
