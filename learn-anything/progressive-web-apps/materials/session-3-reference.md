# Session 3: Cache Layer Interactions & Serwist Migration

---

## The Three-Layer Cache Model

```mermaid
flowchart LR
    SW["Service Worker<br/><b>Cache API</b><br/>You control this"]
    HTTP["Browser<br/><b>HTTP Cache</b><br/>Cache-Control headers"]
    CDN["Edge<br/><b>CDN Cache</b><br/>Cloudflare"]
    ORIGIN["Origin<br/><b>Server</b><br/>FastAPI"]

    SW -->|"fetch(req, {cache:'reload'})<br/>BYPASSES HTTP cache"| HTTP
    HTTP -->|"If not bypassed,<br/>max-age can intercept"| CDN
    CDN -->|"If cache miss<br/>or purged"| ORIGIN

    style SW fill:#3b82f6,color:white,stroke:#1d4ed8
    style HTTP fill:#ef4444,color:white,stroke:#b91c1c
    style CDN fill:#f59e0b,color:white,stroke:#d97706
    style ORIGIN fill:#22c55e,color:white,stroke:#16a34a
```

### The Critical Bypass

```
fetch(request, { cache: "reload" })
```

Without this, `NetworkFirst` can be silently served by the browser's HTTP cache — the request never leaves the browser.

---

## Content Correction Invalidation Sequence

When you fix "Metformin is a sulfonylurea" → "Metformin is a biguanide":

```mermaid
flowchart TD
    FIX["1. Push fix to origin server"] --> PURGE["2. Trigger CDN cache purge<br/>(API-driven, specific URLs)"]
    PURGE --> REQ["3. Student opens deck"]
    REQ --> SWFETCH["4. SW: NetworkFirst → fetch(req, {cache:'reload'})"]
    SWFETCH --> BYPASS["5. Bypasses browser HTTP cache"]
    BYPASS --> CDNMISS["6. CDN: cache miss (purged) → hits origin"]
    CDNMISS --> FRESH["7. Fresh response returns"]
    FRESH --> SWCACHE["8. SW caches fresh response in Cache API"]
    SWCACHE --> DONE["9. Student sees corrected card<br/>Next offline load also correct"]

    style FIX fill:#22c55e,color:white
    style PURGE fill:#f59e0b,color:white
    style BYPASS fill:#ef4444,color:white
    style DONE fill:#3b82f6,color:white
```

---

## Cache Versioning: Multiple Named Caches

**Problem:** One versioned cache → every deploy re-downloads everything (including unchanged content packs).

**Solution:** Separate caches by lifecycle:

| Cache Name | Contents | Versioned? | Cleanup |
|---|---|---|---|
| `static-v12` | JS/CSS bundles (hashed) | Per deploy | Delete old on `activate` |
| `shell-v12` | HTML shell, offline page | Per deploy | Delete old on `activate` |
| `studyelf-api` | API responses | Never | ExpirationPlugin (entries + TTL) |
| `studyelf-content` | Drug cards, flashcards | Never | ExpirationPlugin (500 / 7 days) |

```js
// In activate handler: clean up only versioned caches
caches.keys().then(names =>
  names.filter(n => n.startsWith("static-") || n.startsWith("shell-"))
       .filter(n => n !== CURRENT_VERSION)
       .forEach(n => caches.delete(n))
)
```

---

## CDN Invalidation: Purge vs TTL

| Approach | How it works | Best for |
|---|---|---|
| **TTL** (time-based) | Content expires after N seconds | Frequently updated, low-stakes |
| **Cache Purge** (event-driven) | You call API to invalidate specific URLs | Infrequent updates, high-stakes |

**StudyElf choice:** Purge. Pharmacology errors can't wait for a timer. Long TTL + purge-on-update = fast by default, correct on demand.

---

## Serwist Configuration for StudyElf

```mermaid
flowchart TD
    subgraph "Route Matching (first match wins)"
        R1["/api/v1/content/*"]
        R2["/api/*"]
        R3["...defaultCache"]
    end

    R1 --> S1["StaleWhileRevalidate<br/>cache: studyelf-content<br/>500 entries / 7 days<br/>fetchOptions: {cache:'reload'}"]
    R2 --> S2["NetworkFirst<br/>cache: studyelf-api<br/>64 entries / 1 day<br/>fetchOptions: {cache:'reload'}"]
    R3 --> S3["CacheFirst for /_next/static/*<br/>SWR for images/fonts"]

    style R1 fill:#8b5cf6,color:white
    style R2 fill:#3b82f6,color:white
    style R3 fill:#6b7280,color:white
    style S1 fill:#8b5cf6,color:white
    style S2 fill:#3b82f6,color:white
    style S3 fill:#6b7280,color:white
```

**Key decisions:**
- `@serwist/next` (webpack) — NOT `@serwist/turbopack` (incompatible with `output: 'export'`)
- `disable: process.env.NODE_ENV === "development"` — Turbopack runs freely in dev
- Route order matters: specific `/api/v1/content/*` before generic `/api/*`
- `ExpirationPlugin` on all runtime caches — prevents unbounded growth

---

## Service Worker Update Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant Old as Old SW (v1)
    participant New as New SW (v2)
    participant UI as Toast UI

    B->>Old: 24hr check or navigation
    Note over B: Detects byte-diff in sw.js
    B->>New: Install (precache into new cache)
    New-->>New: Enters WAITING state
    Note over New: skipWaiting: false<br/>Old SW still controls tabs

    New->>UI: updatefound → statechange → "installed"
    UI->>B: Show toast: "Update available — Reload"
    Note over B: Student finishes study session

    B->>New: User clicks Reload → postMessage({type: "SKIP_WAITING"})
    New->>New: self.skipWaiting()
    New-->>Old: Takes control
    New->>New: activate → delete old caches
    B->>B: controllerchange → window.location.reload()
    Note over B: Fresh page with new SW active
```

**Critical guard:** Check `navigator.serviceWorker.controller` before showing update toast. If `null`, this is first install — don't prompt.

---

## Key Concepts Quick Reference

| Concept | One-liner |
|---|---|
| `cache: "reload"` | fetch option that bypasses browser HTTP cache |
| `skipWaiting: false` | New SW waits; protects mid-session users from version mismatch |
| `clientsClaim` | Only useful with skipWaiting:true; skip for StudyElf |
| Content hash in URL | `main.a3f8c2.js` — URL immutability makes cache-first safe |
| `activate` event | Safe moment to delete old versioned caches |
| `navigator.serviceWorker.controller` | `null` on first visit; gate update prompts on this |
| `ExpirationPlugin` | Prevents runtime caches from growing forever |
| CDN cache purge | API call to Cloudflare to invalidate specific cached URLs |
| `defaultCache` | Serwist's built-in strategies for Next.js static assets |
| Route order | First match wins — put specific routes before generic ones |
