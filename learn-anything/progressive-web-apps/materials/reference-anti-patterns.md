# Reference: PWA Anti-Pattern Detection Checklist

## Service Worker Anti-Patterns (Especially LLM-Generated)

### Critical Anti-Patterns (Red Flags)

| # | Anti-Pattern | What It Looks Like | Why It's Wrong | Fix |
|---|---|---|---|---|
| 1 | **skipWaiting() unconditional** | `self.skipWaiting()` in install event | Breaks open tabs mid-session | User-controlled update flow via postMessage |
| 2 | **Cache-first on mutable URLs** | Cache-first for `/api/*` or `/index.html` | Serves stale data forever | Network-first or SWR for mutable content |
| 3 | **Missing fetchOptions** | `fetch(request)` in network-first handler | Hits HTTP cache instead of network | `fetch(request, { cache: 'reload' })` |
| 4 | **Single cache for everything** | `caches.open('app-v1')` for all resources | Can't manage resources independently | Separate caches by purpose |
| 5 | **Catch-all offline fallback** | `.catch(() => caches.match('/offline.html'))` on every route | Masks real errors, serves offline page for non-navigation requests | Only fallback on navigation requests; let API failures surface |

### Moderate Anti-Patterns (Yellow Flags)

| # | Anti-Pattern | What It Looks Like | Why It's Risky | Fix |
|---|---|---|---|---|
| 6 | **No cache cleanup in activate** | Missing `caches.keys()` + `caches.delete()` | Old caches accumulate, waste storage | Delete non-current caches in activate event |
| 7 | **Stale tooling** | Using `next-pwa`, old Workbox versions | Deprecated, unpatched bugs | Use Serwist (for Next.js) or current Workbox |
| 8 | **No ExpirationPlugin** | Caching without maxEntries/maxAge | Cache grows unbounded, fills storage | Add ExpirationPlugin with appropriate limits |
| 9 | **Precaching too much** | 50+ files in precache manifest | Slow install, wastes bandwidth | Precache only critical path; lazy-cache the rest |
| 10 | **No error handling in install** | `event.waitUntil(cache.addAll([...]))` with no `.catch()` | One failed resource = entire SW fails to install | Handle individual resource failures gracefully |

### Structural Anti-Patterns

| # | Anti-Pattern | Detection | Impact |
|---|---|---|---|
| 11 | **Hand-written SW for production** | No Workbox/Serwist imports | Missing edge cases, hard to maintain |
| 12 | **No update notification** | No `controllerchange` listener in page | Users never know to refresh |
| 13 | **Caching POST responses** | `cache.put()` on POST requests | Cache API keys on URL — POSTs to same URL overwrite |
| 14 | **Ignoring scope** | SW scope doesn't match app routes | SW doesn't intercept expected requests |
| 15 | **No versioned cache names** | Static cache name like `'my-cache'` | Can't clean up old entries on deploy |

## Quick Code Review Checklist

When reviewing a PWA implementation, check these in order:

1. **Is Workbox/Serwist used?** If not → yellow flag (check for edge case handling)
2. **Is skipWaiting conditional?** Should be triggered by postMessage, not automatic
3. **Are caches separated by purpose?** At least: shell, assets, API, images
4. **Does network-first use `{ cache: 'reload' }`?** Check all fetch handlers
5. **Is there cache cleanup in activate?** Should delete old versioned caches
6. **Are ExpirationPlugins configured?** Check maxEntries and maxAgeSeconds
7. **Is there an update notification?** Page should listen for `controllerchange`
8. **Is the offline fallback scoped correctly?** Only for navigation requests
9. **Is the precache manifest reasonable?** Not too large, critical resources only
10. **Are the tools current?** No deprecated packages (check npm publish dates)

## Workbox vs. Raw SW Decision

| Use Workbox/Serwist When | Use Raw SW When |
|---|---|
| Production applications | Learning/prototyping only |
| Multiple caching strategies needed | Single simple strategy (e.g., cache-first for static site) |
| Team doesn't have SW expertise | You need fine control over edge cases |
| LLM is generating the code | You are the domain expert |
| Long-term maintenance expected | One-off demo |
