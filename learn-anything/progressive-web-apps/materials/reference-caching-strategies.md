# Reference: PWA Caching Strategy Selection

## The 5 Strategies — Decision Rules

| Strategy | When to Use | Risk | Offline Behavior |
|---|---|---|---|
| **Cache-First** | Immutable resources: content-hashed JS/CSS, fonts, uploaded images | Stale forever if URL is mutable | Serves from cache; network never hit |
| **Network-First** | Data that must be fresh: API calls, personalized content | Slow (waits for network); HTTP cache trap | Falls back to last-cached version |
| **Stale-While-Revalidate** | Tolerably-stale content: HTML pages, article lists, search indices | Shows stale content on current visit (updates on next) | Serves from cache; no revalidation possible |
| **Network-Only** | Non-cacheable: POST requests, real-time data, auth tokens | No offline support | Fails — shows error or offline page |
| **Cache-Only** | Fully pre-cached: app shell, offline page, critical fonts | Must be pre-cached during install | Serves from pre-cache only |

## Strategy Selection by Resource Type

| Resource Type | Default Strategy | Exceptions |
|---|---|---|
| JS/CSS (content-hashed) | Cache-First | — |
| JS/CSS (NOT hashed) | SWR or Network-First | Add version param to URL if possible |
| HTML (SPA shell) | Cache-First (pre-cached) | Must update via SW update cycle |
| HTML (server-rendered) | SWR or Network-First | Network-First if freshness-critical |
| API (read, dynamic) | Network-First + `{ cache: 'reload' }` | SWR if slight staleness OK |
| API (write, POST/PUT) | Network-Only | Queue for background sync if offline needed |
| Images (immutable) | Cache-First + ExpirationPlugin | Set maxEntries to prevent bloat |
| Images (mutable, same URL) | SWR + ExpirationPlugin | Network-First if freshness matters |
| Fonts | Cache-First | Long-lived, rarely change |
| Large files (WASM, video) | Cache-First + quota check | May exceed storage limits |

## Critical Traps

**Trap 1: "Network-First = Fresh"**
SW's `fetch()` hits the HTTP cache first. Add `{ cache: 'reload' }` to actually reach the network.

**Trap 2: "Cache-First is Fast and Safe"**
Only safe for immutable URLs. Mutable URLs + cache-first = stale forever.

**Trap 3: "SWR Revalidation = Instant Update"**
The background fetch also passes through HTTP cache + CDN. Double-staleness is possible.

## ExpirationPlugin Rules of Thumb

| Resource | maxEntries | maxAgeSeconds |
|---|---|---|
| API responses | 50-100 | 86400 (1 day) |
| Images | 60 | 604800 (7 days) |
| HTML pages | 30 | 86400 (1 day) |
| Fonts | 10 | 2592000 (30 days) |
