# App Shell Pattern: Visual Reference

*The architectural pattern that makes PWAs feel instant — and when it doesn't fit.*

---

## What Is the App Shell?

The **app shell** is the minimal HTML + CSS + JS needed to render the UI **skeleton** — navigation, layout, loading states — without any content data. It's the "chrome" of your app.

```mermaid
flowchart LR
    subgraph SHELL["App Shell (cached, instant)"]
        NAV["Navigation bar"]
        SIDEBAR["Sidebar menu"]
        LAYOUT["Page layout scaffold"]
        LOADING["Loading spinners / skeletons"]
    end

    subgraph CONTENT["Dynamic Content (fetched)"]
        DATA["API data"]
        USER["User-specific state"]
        FEED["Feeds, lists, cards"]
    end

    SHELL -->|"renders immediately<br/>from cache"| SCREEN["What the user sees"]
    CONTENT -->|"fills in<br/>from network/IDB"| SCREEN

    style SHELL fill:#3b82f6,color:white
    style CONTENT fill:#22c55e,color:white
```

**The deal:** Cache the shell aggressively (cache-first or precache). Fetch content separately. The user sees *something* instantly, even offline, even on slow 3G.

---

## How It Works: The Two-Phase Load

```mermaid
sequenceDiagram
    participant User as Student
    participant SW as Service Worker
    participant Cache as Cache API
    participant Net as Network
    participant IDB as IndexedDB

    Note over User,IDB: PHASE 1: Shell (instant)
    User->>SW: Navigate to /modules/quiz
    SW->>Cache: cache.match("/modules/quiz") → shell HTML
    Cache-->>SW: Cached HTML + JS + CSS
    SW-->>User: Render layout, nav, skeleton cards

    Note over User,IDB: PHASE 2: Content (async)
    User->>SW: useEffect → fetch /api/v1/questions
    alt Online
        SW->>Net: NetworkFirst / SWR strategy
        Net-->>SW: [question1, question2, ...]
    else Offline
        SW->>IDB: contentStore.getRandomQuestions()
        IDB-->>SW: [cached questions]
    end
    SW-->>User: Fill skeleton with actual questions
```

**Phase 1** is why PWAs feel fast — the shell is precached during SW install. No network round-trip.
**Phase 2** is where your caching strategy decisions matter — and where IDB enters the picture for offline.

---

## App Shell vs Server-Side Rendering: The Tradeoff

```mermaid
flowchart TD
    subgraph SPA["App Shell Pattern (SPA / CSR)"]
        direction TB
        SPA1["Server sends: empty HTML shell"]
        SPA2["Browser: loads JS bundle"]
        SPA3["React: hydrates / renders"]
        SPA4["useEffect: fetches content from API"]
        SPA1 --> SPA2 --> SPA3 --> SPA4
    end

    subgraph SSR["Server-Side Rendering"]
        direction TB
        SSR1["Server: runs React, embeds data in HTML"]
        SSR2["Browser: receives full HTML with content"]
        SSR3["React: hydrates (attaches events)"]
        SSR4["Already painted — no second fetch"]
        SSR1 --> SSR2 --> SSR3 --> SSR4
    end

    subgraph TRADEOFF["The Tension"]
        T1["App shell = PWA-friendly<br/>Shell is cacheable, content is separate"]
        T2["SSR = SEO-friendly, fast first paint<br/>But the HTML changes per request → hard to cache"]
    end

    SPA --> T1
    SSR --> T2

    style SPA fill:#1e3a5f,color:#e2e8f0
    style SSR fill:#1e3a5f,color:#e2e8f0
    style T1 fill:#3b82f6,color:white
    style T2 fill:#f59e0b,color:white
```

### Why this matters for StudyElf

Your Session 2 discovery: StudyElf uses `"use client"` everywhere — the server only produces empty shells. This means **you're already doing the app shell pattern** without calling it that. The `standalone → export` migration makes it explicit: pre-built HTML shells served from CDN, content fetched client-side.

---

## When App Shell Fits vs Doesn't

```mermaid
flowchart TD
    Q1{"How does the app render?"}
    Q1 -->|"Client-side rendering<br/>(SPA, 'use client', React CSR)"| FIT["App Shell is natural fit"]
    Q1 -->|"Server-side rendering<br/>(Next.js SSR, htmx, PHP)"| Q2{"Is the shell stable<br/>across routes?"}
    Q2 -->|"Yes — same nav/layout,<br/>content varies"| PARTIAL["Partial fit: cache the<br/>common layout, SW<br/>handles navigation"]
    Q2 -->|"No — every page is<br/>structurally different"| POOR["Poor fit: nothing<br/>meaningful to cache<br/>as a 'shell'"]

    Q1 -->|"Static site<br/>(Hugo, Astro, 11ty)"| STATIC["Already static —<br/>just precache pages.<br/>No shell pattern needed."]

    FIT --> BENEFIT["Benefits: instant load,<br/>offline skeleton, smooth<br/>route transitions"]
    POOR --> ALT["Alternative: cache full<br/>pages (page-level caching)<br/>or use navigation preload"]

    style FIT fill:#22c55e,color:white
    style PARTIAL fill:#eab308,color:black
    style POOR fill:#ef4444,color:white
    style STATIC fill:#6b7280,color:white
```

### Decision matrix

| App Architecture | App Shell Fit | Why | Cache Strategy |
|---|---|---|---|
| **SPA / CSR** (React, Vue, Angular) | Excellent | Single HTML entry point + JS bundle = natural shell | Precache shell; runtime cache API data |
| **Next.js `output: 'export'`** (your case) | Excellent | Static HTML shells per route; all rendering client-side | Precache shells; SWR/NetworkFirst for API |
| **Next.js `standalone` (SSR)** | Moderate | HTML varies per request, but layout is shared | Cache layout assets; navigation preload for pages |
| **htmx / server-rendered** | Poor | Server returns full HTML with data embedded; no clean shell/content split | Cache full pages or use SWR on HTML responses |
| **Static site** | Unnecessary | Pages are already static files — just precache them directly | Precache all pages |

---

## App Shell Failure Modes

These are the things that go wrong when you implement the pattern:

### 1. Shell-Content Version Mismatch

```mermaid
sequenceDiagram
    participant Cache as Cached Shell (v1)
    participant API as API Response
    participant UI as What Renders

    Note over Cache,UI: Deploy v2 changes both shell AND API format
    Cache-->>UI: Shell v1 (cached, old layout)
    API-->>UI: Content v2 (new data shape)
    Note over UI: CRASH: Shell v1 can't<br/>render Content v2 format

    Note over Cache,UI: Fix: SW update flow ensures<br/>shell + content stay in sync
```

**Prevention:** The SW update flow you designed in Session 3 (waiting state → toast → SKIP_WAITING → reload) ensures the shell updates atomically with the new code.

### 2. Empty Shell Offline (No Content Cached)

```
Student goes offline → sees shell (nav, layout) → content area is empty
→ "No offline content available" message (Edge Case #1 in your plan)
```

This is exactly why your plan adds the "Prepare for Offline Study" download and write-through IDB cache — the shell alone isn't useful without cached content to fill it.

### 3. Flash of Loading State (FOLS)

On fast connections, the two-phase load creates a visible flash: shell appears → spinner → content fills in. On slow connections this is desirable (progressive rendering). On fast connections it's janky.

**Mitigation:** Keep the shell-to-content transition under 100ms on fast networks. Your SWR strategy with write-through IDB means returning users almost always get instant content from cache.

---

## Quick Reference

| Concept | One-liner |
|---|---|
| App Shell | Minimal HTML/CSS/JS skeleton — no content data |
| Two-phase load | Shell from cache (instant), content from network/IDB (async) |
| Precaching | SW downloads shell during install, before any user request |
| Shell + CSR | Natural partners — React SPA IS an app shell |
| Shell + SSR | Tension — server-rendered HTML embeds data, hard to separate |
| Version mismatch | Old shell + new API = crash. SW update flow prevents this. |
| StudyElf fit | Already app-shell by architecture (`use client` + `output: export`) |
