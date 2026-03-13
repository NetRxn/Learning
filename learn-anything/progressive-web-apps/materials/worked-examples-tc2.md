# Worked Examples: TC2 — Caching Strategy & Layer Interactions

## Problem: Design a Complete Caching Architecture

**Scenario:** You're architecting the caching layer for a project management app (client-side React SPA, deployed on Cloudflare Pages with CDN). The app has these resource types:

1. App Shell HTML (`/index.html`)
2. JS bundles (`/assets/main.[hash].js`, `/assets/vendor.[hash].js`)
3. CSS (`/assets/styles.[hash].css`)
4. User avatar images (`/avatars/[user-id].jpg` — updated when users change photos)
5. API: project list (`GET /api/projects`)
6. API: real-time task updates (`GET /api/tasks?project=X&since=timestamp`)

---

### Version 1: Full Worked Solution

**Step 1: Classify each resource type**

| Resource | Mutability | Freshness need | Size | Offline value |
|---|---|---|---|---|
| App Shell HTML | Mutable (changes on deploy) | Medium — users need the current shell, but can tolerate one stale load | Small (~5KB) | High — needed to render anything |
| JS bundles | Immutable (content-hashed) | N/A — URL changes on content change | Medium (~200KB each) | High — app doesn't work without JS |
| CSS | Immutable (content-hashed) | N/A | Small (~30KB) | High |
| User avatars | Mutable (same URL, different content) | Low — stale avatar is fine | Small (~20KB each) | Low |
| Project list API | Mutable | Medium — updated when projects are created/archived | Small | Medium — useful offline for reference |
| Task updates API | Mutable | High — needs to be current for collaboration | Small-Medium | Low — stale task data could cause conflicts |

> **Self-explanation:** Why do content-hashed files have "N/A" for freshness need?

**Step 2: Assign caching strategies**

| Resource | Strategy | Rationale |
|---|---|---|
| App Shell HTML | **Stale-While-Revalidate** | Serve instantly from cache for fast first paint. Background revalidation picks up deploy changes. Acceptable because the JS bundle references (content-hashed) will also update, so stale HTML pointing to new JS URLs will trigger a cache miss on those bundles anyway. |
| JS bundles | **Cache-First** | Content-hashed URLs are immutable. Once cached, always correct. Maximizes speed, minimizes network traffic. |
| CSS | **Cache-First** | Same rationale as JS bundles — content-hashed. |
| User avatars | **Stale-While-Revalidate** with ExpirationPlugin (maxEntries: 50, maxAge: 7 days) | Serve cached avatar immediately, update in background. Size limit prevents unbounded growth. 7-day expiry handles users who leave the team. |
| Project list API | **Network-First** with `{ cache: 'reload' }` and cache fallback | Project list should be fresh, but offline access to last-known list is valuable. `cache: 'reload'` prevents HTTP cache trap. |
| Task updates API | **Network-Only** | Real-time data that MUST be fresh. Caching stale task state could cause users to work on outdated data. No offline fallback — show "offline" indicator instead. |

> **Self-explanation:** Why is the task updates API Network-Only while the project list is Network-First?

**Step 3: CDN interaction analysis**

| Resource | CDN TTL | SW+CDN coordination |
|---|---|---|
| App Shell HTML | **Short (60s)** or **no-cache** | Cloudflare Pages auto-sets short TTL for HTML. Combined with SW's SWR background fetch (using `{ cache: 'reload' }` to bypass HTTP cache), users get the latest HTML within one SWR cycle after deploy. |
| JS/CSS bundles | **Long (1 year)** | Safe because URLs change with content. CDN and SW cache-first are aligned — both serve the correct version for that URL forever. No invalidation needed. |
| User avatars | **Medium (1 hour)** | Same-URL mutation means CDN may serve stale avatar for up to 1 hour. Acceptable — avatars aren't mission-critical. |
| API routes | **No CDN caching** (pass-through) | API responses are personalized. CDN must not cache them. Configure Cloudflare: `Cache-Control: no-store` on API responses. |

> **Self-explanation:** What would happen if the CDN cached API responses with a 5-minute TTL?

**Step 4: Double-cache deploy scenario**

On deploy, new JS bundles have new hashes → new URLs. The SW script changes (updated precache manifest). What happens:

1. User visits → old SW serves old app shell + old JS from cache ✓ (consistent old version)
2. Browser detects new SW script (byte-diff) → downloads new SW → installs (precaches new bundles)
3. New SW enters waiting state (old tabs still open)
4. Next full navigation → old SW's SWR background fetch gets new HTML → updates cache
5. User closes all tabs and reopens → new SW activates → cleans old caches → serves new shell + new bundles ✓
6. **Or** with user-controlled update: toast notification → user clicks → new SW activates → page reloads with new version

**The double-cache risk is mitigated** by content-hashed URLs: CDN serves old hash URLs from its long cache, but they're never requested again. New hash URLs miss CDN cache, get forwarded to origin. CDN caches them fresh.

> **Self-explanation:** In step 1, why is the old version consistent? What would happen if skipWaiting was called during step 2?

---

### Version 2: Complete 3 of 6 strategies

Resources 1-3 (HTML, JS, CSS) strategies are worked as above.

**Your task:** Assign caching strategies and CDN TTLs for resources 4-6 (avatars, project list API, task updates API). Justify each choice and identify any CDN interaction issues.

---

### Version 3: Full strategy assignment, guided

**New scenario:** An internal documentation wiki (server-rendered with some client-side search). Resources:
1. HTML pages (`/docs/[slug]`)
2. Search index (`/search-index.json` — 500KB, rebuilt nightly)
3. Diagram images (`/diagrams/[name].svg` — updated by editors)
4. JS (`/assets/app.[hash].js`)
5. API: search suggestions (`GET /api/suggest?q=...`)
6. Fonts (`/fonts/inter.woff2`)

Assign strategies. I'll provide hints if asked.

---

### Version 4: Independent

**New scenario:** An e-commerce PWA. Assign complete caching architecture with CDN coordination for all resource types. No support.
