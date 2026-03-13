# Encoding Aids: PWA Concepts

## Memory Hooks & Mnemonics

### The 5 Cache Layers (Request Path)
**Mnemonic: "My Silly Horse Can't Originate"**
- **M**emory cache (in-process)
- **S**ervice Worker (Cache API)
- **H**TTP cache (browser disk)
- **C**DN edge
- **O**rigin server

*Visual: Imagine a package delivery going through 5 checkpoints, each closer to the warehouse. Each checkpoint might already have the item in stock.*

### The 5 Caching Strategies
**Mnemonic: "Can't No one Simply Network Completely?"**
- **C**ache-First (cache wins, network fallback)
- **N**etwork-First (network wins, cache fallback)
- **S**tale-While-Revalidate (cache wins NOW, network wins LATER)
- **N**etwork-Only (network or nothing)
- **C**ache-Only (cache or nothing)

*Arranged from most to least cache reliance. The extremes (Cache-Only, Network-Only) are rare.*

### SW Lifecycle Phases
**Mnemonic: "RIWA" (like "river" without the "e")**
- **R**egister → **I**nstall → **W**ait → **A**ctivate

*Visual: A new employee (SW) gets hired (registered), goes through onboarding (install), sits in the lobby while the old employee finishes their shift (wait), then starts working (activate).*

### The HTTP Cache Trap
**Analogy from your backend experience:** Think of the HTTP cache as a reverse proxy sitting between your service worker and the real network — similar to how nginx might cache upstream responses. When your SW calls `fetch()`, it's like your application code calling an upstream service through nginx. If nginx has a cached response, your code gets that instead of a fresh one. `{ cache: 'reload' }` is like adding `Cache-Control: no-cache` to the upstream request — it tells the "proxy" (HTTP cache) to pass through.

### The Double-Cache Problem
**Analogy:** Imagine two memos pinned to two different bulletin boards (SW cache and CDN cache). When you update the original document, you need to replace the memo on BOTH boards. If you only update one, people reading the other board still see the old version. Content-hashed URLs are like giving each version a unique color — you never update a memo, you just post a new one with a new color, and old ones are ignored.

### iOS Storage Eviction
**Rule of thumb:** "7 days of silence = data death on iOS." If your PWA is a library book, iOS is the librarian who reshelves (deletes) anything not checked out for a week. Android lets you put a "hold" on your shelf (persistent storage).

### App Shell Pattern
**Analogy from your architecture experience:** App Shell is like a picture frame. You cache the frame (navigation, header, footer) permanently, and only swap the picture (content) on each visit. For htmx apps, there IS no frame separate from the picture — the server paints the complete framed picture each time.

## Visual Organizers

### Strategy Selection Decision Tree

```
Is the URL immutable (content-hashed)?
├─ YES → Cache-First ✅
└─ NO → Is freshness critical?
    ├─ YES → Is slight staleness acceptable?
    │   ├─ YES → Stale-While-Revalidate
    │   └─ NO → Network-First + { cache: 'reload' }
    └─ NO (offline fallback is enough) → Does the user write data?
        ├─ YES → Network-Only (+ background sync queue)
        └─ NO → SWR with ExpirationPlugin
```

### htmx-PWA Compatibility Gradient

```
LOW TENSION ←──────────────────────────→ HIGH TENSION
Install | Push | Offline | SW POST | App Shell | Offline-
        |      | Reading | Queue   |           | First
  ✅     ✅     ✅        ⚠️         ❌          ❌

"Start from the left. Stop when the tension outweighs the value."
```

### Platform Constraint Impact Map

```
Feature          │ Android  │ iOS 16.4+ │ iOS <16.4 │ Desktop
─────────────────┼──────────┼───────────┼───────────┼─────────
Install          │ ✅ Auto   │ ✅ Manual  │ ✅ Manual  │ ✅ Auto
Persistent Store │ ✅        │ ❌ (7-day) │ ❌ (7-day) │ ✅
Background Sync  │ ✅        │ ❌         │ ❌         │ ✅
Web Push         │ ✅        │ ⚠️ PWA only│ ❌         │ ✅
```
