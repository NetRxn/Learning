# Worked Examples: TC3 — Architectural Decision-Making (PWA Fitness Evaluation)

## Problem: Evaluate 3 Contrasting Apps for PWA Fitness

Apply the 5-dimension evaluation framework to each app: (1) Offline strategy tier, (2) Platform constraints, (3) Update flow, (4) Architectural compatibility, (5) Migration cost vs. value.

---

### Version 1: Full Worked Solution — 3 Evaluations

#### App A: Field Service Inspection Tool

**Description:** Mobile-first app used by building inspectors. They visit construction sites (often poor connectivity), fill in inspection checklists, take photos, and submit reports. Currently a responsive web app (React SPA, REST API).

**Dimension 1: Offline Strategy Tier**
- **Tier 3 (offline-first)** is appropriate. Inspectors MUST be able to work without connectivity. They need to: load checklists, fill in forms, capture photos, and queue submissions. This is a textbook offline-first use case — the domain naturally supports eventual consistency (inspections are independent events, no real-time collaboration conflict).
- Implementation: Pre-cache inspection templates. Store form data + photos in IndexedDB. Background Sync queues submissions.

> **Self-explanation:** Why does "independent events" make offline-first feasible here?

**Dimension 2: Platform Constraints**
- **iOS is a risk.** Inspectors may have iPhones. iOS 7-day storage eviction means if an inspector doesn't open the app for a week, all cached templates and unsaved inspections could be wiped. **Mitigation:** aggressive sync-on-open, server-side backup of templates, clear UX indicating sync status. The app should sync aggressively whenever online.
- Background Sync unavailable on iOS — must implement app-level retry queue.

> **Self-explanation:** What's the worst-case scenario if an inspector submits 3 inspections offline on iOS and doesn't open the app for 8 days?

**Dimension 3: Update Flow**
- Medium criticality. Inspection checklist updates need to propagate, but a one-day delay is acceptable. **User-controlled update flow** with a clear "new checklist version available" notification. Don't force-update during an active inspection.

**Dimension 4: Architectural Compatibility**
- **Excellent.** React SPA already has client-side rendering. App Shell pattern fits naturally. REST API calls are straightforward to cache/queue. No fundamental architecture conflict.

**Dimension 5: Migration Cost vs. Value**
- **High value, medium cost.** The offline capability directly solves a real user pain point (poor site connectivity). Estimated: 4-6 weeks for full offline-first with Background Sync, IndexedDB queue, conflict handling.
- **Recommendation: STRONG GO.** PWA is the right tool. Consider native wrapper (Capacitor) for camera/storage access if web APIs are insufficient.

---

#### App B: Real-Time Analytics Dashboard

**Description:** Desktop-focused analytics dashboard showing live metrics (WebSocket updates, interactive charts). Used by operations teams monitoring production systems. React + D3.js.

**Dimension 1: Offline Strategy Tier**
- **Tier 1 (offline fallback page) or none.** The dashboard is meaningless without live data. Showing cached charts from 5 minutes ago could mislead operators into thinking systems are healthy when they're down. Offline capability has negative value here.

**Dimension 2: Platform Constraints**
- Not relevant — desktop-focused, Chrome/Edge primary browsers. No iOS concerns.

**Dimension 3: Update Flow**
- **Low criticality.** Dashboard updates are cosmetic/feature additions, not data-affecting. Standard SW update with automatic activation is fine — even skipWaiting is acceptable because the dashboard reloads frequently anyway.

**Dimension 4: Architectural Compatibility**
- SPA architecture is compatible with PWA shell, but there's no point. WebSocket connections require network. Charts require live data.

**Dimension 5: Migration Cost vs. Value**
- **Low value, low cost.** Adding a manifest + basic SW takes a day, but what does it buy? Installability is minor for a desktop tool that's always open in a browser tab. Caching static assets speeds up cold loads slightly, but the dashboard is typically a pinned tab.
- **Recommendation: WEAK NO / SKIP.** The effort is minimal but the value is near zero. If the team specifically wants an installable desktop "app" feel, do a minimal PWA (manifest + basic asset caching). Don't invest in offline or complex caching.

---

#### App C: htmx Content Management Tool

**Description:** Internal CMS for a marketing team. Built with htmx (server-rendered HTML), Go backend, SQLite. Used for writing, editing, and publishing blog posts. Moderate team (10 users).

**Dimension 1: Offline Strategy Tier**
- **Tier 2 (offline reading) max.** Users might want to review published posts offline (on flights, coffee shops). Creating/editing posts offline is impractical — htmx sends partial HTML fragments to the server for rendering. Without the server, no new content can be created.

**Dimension 2: Platform Constraints**
- Mixed devices (laptops + iPads). iOS storage eviction is manageable for Tier 2 — losing cached post reads is inconvenient but not data-losing.

**Dimension 3: Update Flow**
- **Low criticality.** CMS updates are infrequent. Standard SWR for HTML pages handles it naturally.

**Dimension 4: Architectural Compatibility**
- **Partial.** htmx composes well with: manifest (installability), basic SW (offline fallback + cached page reads), push notifications (for publish/review alerts). Conflicts with: App Shell pattern (no client-side rendering), offline writes (server generates HTML), SPA-style routing.
- **Progressive enhancement approach**: manifest + SW with SWR for visited pages + cache-first for static assets.

**Dimension 5: Migration Cost vs. Value**
- **Moderate value, low cost.** Installability + faster repeat loads + offline reading of published posts. 2-3 days of work. Push notifications for "your post is ready for review" would be genuinely useful (adds another 2-3 days).
- **Recommendation: MODERATE GO — progressive enhancement only.** Add manifest + basic SW + push notifications. Don't attempt deep offline. The 80% value comes from the first 20% of PWA features.

> **Self-explanation:** Why is the recommendation "progressive enhancement only" rather than a full PWA investment?

---

### Version 2: Complete the remaining sections

I provide the full evaluation for App A (field service tool). For App B and C:
- Offline strategy and platform constraints are done as above.
- **Your task:** Complete dimensions 3-5 (update flow, architectural compatibility, migration cost) for both apps. Produce the final recommendation.

---

### Version 3: Evaluate YOUR app (guided)

Choose one of your TypeScript/htmx applications. Walk through all 5 dimensions. I'll provide guidance only if asked.

---

### Version 4: Novel scenario (independent)

**Scenario:** A healthcare education platform where medical students study case files, take quizzes, and collaborate on study groups. React Native Web frontend, REST API. Students include those in remote/rural clinical rotations with unreliable internet. Evaluate for PWA fitness independently.
