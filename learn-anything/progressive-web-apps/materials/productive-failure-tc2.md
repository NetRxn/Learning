# Productive Failure Scenario: TC2 — The Network-First Trap

## Target Misconception
**Naive theory:** "Network-first strategy guarantees fresh responses from the server."

## Problem Statement

You've deployed a bug fix to your StudyElf flashcard app. The fix corrects a scoring algorithm in the API response (`GET /api/flashcards?deck=pharmacology`). Your service worker uses a **network-first** strategy for API routes.

A user reports they're still seeing incorrect scores 2 hours after the deploy. You've confirmed:
- The deploy is live on the origin server (direct curl returns correct data)
- The CDN cache was purged
- The service worker hasn't been updated (no SW script change)
- The user's browser has the old SW installed

**Your task:** Explain why the user is still seeing stale API data despite the network-first strategy. Diagram the full request path and identify exactly where the staleness originates.

Consider:
- What does "network" actually mean when a service worker calls `fetch()`?
- Are there any intermediate layers between the SW and the origin server?
- Could the API responses have HTTP caching headers set?

*(No hints. Explore multiple hypotheses. Draw diagrams if helpful. Take your time.)*

---

## Consolidation (deliver AFTER the struggle)

### Bridging the Attempts

**Most common learner attempt:** "The CDN is still serving stale data" — This is a reasonable hypothesis, but we confirmed the CDN was purged. The staleness comes from a layer most people forget exists.

**The actual explanation:**

When the SW calls `fetch(request)` in its network-first handler, the browser's **HTTP cache** sits between the SW and the network:

```
SW fetch event → fetch(request) → [HTTP CACHE] → CDN → Origin
                                   ↑
                              THE TRAP IS HERE
```

The API endpoint has `Cache-Control: max-age=3600` set by the backend. The browser's HTTP cache stored the old response 1 hour ago and considers it "fresh." So when the SW's `fetch(request)` executes:

1. Browser checks HTTP cache → finds a fresh entry (max-age not yet expired)
2. Returns the cached (stale) API response
3. **The request never reaches the CDN or origin**
4. SW thinks it got a fresh "network" response — it didn't

**The fix:** Use `fetch(request, { cache: 'reload' })` which tells the browser to skip the HTTP cache entirely:

```
SW fetch event → fetch(request, { cache: 'reload' }) → CDN → Origin
                                                        ↑
                                   HTTP cache BYPASSED
```

### Why This Matters

"Network-first" is a **service worker** strategy describing SW behavior: "try the network, fall back to Cache API." But the SW's `fetch()` call is just a normal browser fetch — it respects all browser caching layers including the HTTP cache. The name "network-first" creates a false sense of security about freshness.

### Key Mental Model Update

The 5-layer model isn't just academic — each layer acts independently:
```
Memory → SW (Cache API) → HTTP Cache → CDN → Origin
                          ^^^^^^^^^
        This layer exists even when SW says "go to network"
```

---

## Transfer Problem

**New scenario:** A news app uses stale-while-revalidate for article pages. After publishing a correction to an article (changing factual claims), the editor reports the correction isn't appearing for some users. The SW is working correctly (SWR: serve from cache, revalidate in background). Where else could staleness persist, and what's the fix?

*(Hint: Think about ALL the layers the background revalidation request passes through.)*
