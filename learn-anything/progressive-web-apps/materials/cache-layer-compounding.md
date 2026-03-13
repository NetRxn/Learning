# Cache Layer Compounding: When Caches Stack Against You

*The three-layer interaction problems that catch even experienced developers. This is TC-2's hard content.*

---

## The Three Layers (Recap)

```mermaid
flowchart LR
    SW["Layer 1<br/><b>Service Worker</b><br/>Cache API<br/><i>You control</i>"]
    HTTP["Layer 2<br/><b>HTTP Cache</b><br/>Browser built-in<br/><i>Headers control</i>"]
    CDN["Layer 3<br/><b>CDN Edge</b><br/>Cloudflare<br/><i>TTL/purge control</i>"]
    ORIGIN["Origin<br/>Server"]

    SW -->|"fetch()"| HTTP
    HTTP -->|"if not cached<br/>or expired"| CDN
    CDN -->|"if miss"| ORIGIN

    style SW fill:#3b82f6,color:white
    style HTTP fill:#ef4444,color:white
    style CDN fill:#f59e0b,color:white
```

Each layer operates **independently**. A request can be intercepted at any layer. The problem: when you think you're reaching the origin, you might be getting a cached copy from a layer you forgot about.

---

## Problem 1: Network-First + HTTP Cache = Stale "Fresh" Data

This is the productive failure from your learning plan — the naive theory that "network-first means fresh."

```mermaid
sequenceDiagram
    participant App as React
    participant SW as Service Worker
    participant HTTP as HTTP Cache
    participant CDN as CDN
    participant Server as Origin

    Note over App,Server: Network-First strategy for /api/v1/flashcards
    App->>SW: fetch("/api/v1/flashcards")
    SW->>SW: NetworkFirst: try network first...
    SW->>HTTP: fetch(request)
    Note over HTTP: Cache-Control: max-age=3600<br/>Cached 20 minutes ago<br/>Still "fresh" per HTTP spec
    HTTP-->>SW: Returns CACHED response (stale data!)
    Note over HTTP,Server: Request NEVER reaches CDN or origin
    SW-->>App: "Fresh" response that's actually 20 min old

    Note over App,Server: The fix: fetch(request, { cache: "reload" })
    App->>SW: fetch("/api/v1/flashcards")
    SW->>SW: NetworkFirst with fetchOptions
    SW->>HTTP: fetch(request, { cache: "reload" })
    Note over HTTP: "reload" = skip HTTP cache
    HTTP->>CDN: Request passes through
    CDN->>Server: Cache miss or purged
    Server-->>App: Actually fresh data
```

### When does this bite you?

**Only when ALL of these are true:**
1. Your SW uses NetworkFirst or SWR (strategies that hit the network)
2. Your server sends `Cache-Control` with `max-age > 0`
3. The HTTP cache has a recent copy

**StudyElf risk:** If your FastAPI backend sends `Cache-Control: max-age=300` on content endpoints, NetworkFirst will serve 5-minute-stale data and think it's fresh. The `fetchOptions: { cache: 'reload' }` in your Serwist config fixes this.

---

## Problem 2: Cache-First + CDN TTL on Deploy

```mermaid
sequenceDiagram
    participant User as Returning User
    participant SW as Service Worker (v1)
    participant Cache as Cache API
    participant HTTP as HTTP Cache
    participant CDN as CDN (TTL: 1hr)
    participant Server as Origin (v2 deployed)

    Note over User,Server: You deploy v2. What does the user see?
    User->>SW: Navigate to app
    SW->>SW: CacheFirst: check cache...
    SW->>Cache: cache.match(request)
    Cache-->>SW: HIT — v1 response
    SW-->>User: User sees v1 content

    Note over User,Server: But wait — SW itself is updating...
    Note over SW: 24hr check: is there a new sw.js?
    SW->>HTTP: fetch("/sw.js")
    HTTP->>CDN: CDN has sw.js cached (TTL not expired)
    CDN-->>SW: Returns OLD sw.js — no byte-diff detected!
    Note over SW: SW thinks it's up to date. NO UPDATE.

    Note over User,Server: User is stuck on v1 until CDN TTL expires
```

### The timeline

```
T=0:     Deploy v2 to origin
T=0-60m: CDN still serving v1 of sw.js (TTL not expired)
         → SW byte-diff check finds no change
         → No update triggered
         → Cache-first keeps serving v1 content
T=60m:   CDN TTL expires, next check gets v2 sw.js
         → SW detects byte-diff
         → Installs new SW, enters waiting state
T=60m+:  User navigates or 24hr check triggers
         → Update toast appears → reload → v2 active
```

**Worst case:** CDN TTL (1hr) + SW check interval (24hr) = **up to 25 hours** before update reaches user.

### Fixes

| Approach | How | Tradeoff |
|---|---|---|
| **Short TTL on sw.js** | `Cache-Control: max-age=0` on service worker file only | CDN always passes through for sw.js; tiny file, minimal cost |
| **CDN purge on deploy** | API call to purge `/sw.js` after each deploy | Requires CI/CD integration |
| **Both** (recommended) | Short TTL + purge as safety net | Belt and suspenders |

**Important:** Short TTL on `sw.js` does NOT mean short TTL on everything. Your hashed JS/CSS bundles can have `max-age=31536000` (1 year) because the URL changes with every deploy.

---

## Problem 3: SWR + CDN = Double Staleness

```mermaid
sequenceDiagram
    participant User as Student
    participant SW as Service Worker
    participant Cache as Cache API
    participant CDN as CDN (5min TTL)
    participant Server as Origin

    Note over User,Server: SWR for /api/v1/content/flashcards
    User->>SW: fetch flashcards
    SW->>Cache: Return cached (stale) immediately
    Cache-->>User: Shows 2-hour-old flashcards (Phase 1: fast)

    par Background revalidation
        SW->>CDN: fetch (background)
        Note over CDN: CDN has 4-minute-old copy<br/>(within 5min TTL)
        CDN-->>SW: Returns CDN-cached response
        Note over SW: "Revalidated!" But data is<br/>still 4 minutes stale
        SW->>Cache: Updates cache with CDN's copy
    end

    Note over User,Server: Next visit: user sees the CDN-stale copy<br/>NOT the truly fresh server response
```

### The staleness math

```
Total staleness = SW cache age + CDN TTL remaining

Worst case:
  SW cached 2 hours ago (no visit since)
  + CDN TTL has 5 minutes left
  = User sees 2-hour-old data on first paint
  = Revalidation fetches 5-minute-old data from CDN
  = Next visit shows 5-minute-old data (improved but still stale)
```

**Is this a problem?** Depends on content type:

| Content | 5-min staleness | 2-hour staleness |
|---|---|---|
| Drug card content | Acceptable | Acceptable (rarely changes) |
| Flashcard list | Acceptable | Acceptable |
| Leaderboard / scores | Noticeable | Unacceptable — use NetworkFirst |
| Corrected pharmacology error | Unacceptable | Unacceptable — purge CDN |

---

## Problem 4: Write-Through Cache + HTTP Cache (Your Plan's Risk)

This is Issue #5 from the plan review — the Session 3 callback.

```mermaid
sequenceDiagram
    participant App as apiClient
    participant HTTP as HTTP Cache
    participant CDN as CDN
    participant Server as Origin
    participant IDB as IndexedDB

    Note over App,IDB: Write-through: save API response to IDB
    App->>HTTP: fetch("/api/v1/questions/random?count=10")
    Note over HTTP: Cache-Control: max-age=300<br/>Has 3-minute-old response
    HTTP-->>App: Returns CACHED response (3-min stale)
    App->>IDB: saveQuestions(staleQuestions)
    Note over IDB: IDB now has stale data<br/>that looks authoritative

    Note over App,IDB: Student goes offline
    App->>IDB: getRandomQuestions()
    IDB-->>App: Returns the stale data
    Note over App: Student studies with stale questions<br/>If content was corrected 3 min ago,<br/>they see the OLD (wrong) version
```

### Why this matters more for write-through than normal caching

With normal SW caching, stale data is replaced on next network fetch. With write-through to IDB, stale data gets **persisted into a different storage layer** that has no automatic expiry. It can live in IDB for days (until the next write-through or explicit download overwrites it).

### Fix

For the download manager specifically (where freshness matters most):

```typescript
// Download manager: bypass HTTP cache
const response = await fetch(url, { cache: "no-cache" })
// "no-cache" = still uses HTTP cache but revalidates with server first
// "reload" = skips HTTP cache entirely
```

For normal write-through (user browsing online): `max-age=300` staleness is acceptable — the data refreshes on next visit anyway.

---

## Summary: Layer Interaction Quick Reference

| Scenario | Layers Involved | Problem | Fix |
|---|---|---|---|
| NetworkFirst serves stale | SW + HTTP Cache | HTTP cache intercepts before network | `fetch({ cache: 'reload' })` |
| Deploy doesn't reach users | SW + CDN | CDN caches old sw.js | Short TTL on sw.js + purge |
| SWR revalidation is stale | SW + CDN | Background fetch hits CDN, not origin | Accept (low stakes) or purge (high stakes) |
| Write-through persists stale | HTTP Cache + IDB | HTTP cache → stale response → saved to IDB | `{ cache: 'no-cache' }` on downloads |
| All three compound | SW + HTTP + CDN | Cache-first + max-age + CDN TTL = stuck | Content-hash URLs (bypass all three) |

### The universal escape hatch

**Content-hashed URLs** (`main.a3f8c2.js`) bypass the compounding problem entirely — every layer correctly caches forever because the URL itself changes when the content changes. The problems above only affect **mutable URLs** (API endpoints, unhashed HTML, `sw.js`).
