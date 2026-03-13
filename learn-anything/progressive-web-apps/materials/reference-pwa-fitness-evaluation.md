# Reference: PWA Fitness Evaluation Framework

## The 5 Dimensions

### 1. Offline Strategy Tier

| Tier | Description | Effort | When Appropriate |
|---|---|---|---|
| 0: None | No offline capability | Zero | Real-time apps, always-connected users |
| 1: Fallback | Branded "you're offline" page | 1 day | Apps where offline is rare and temporary |
| 2: Reading | Cache previously-viewed content | 1-2 weeks | Field reference, commuter reading, low-connectivity environments |
| 3: Offline-first | Full read/write offline + sync | 1-3 months | Field data collection, forms, notes — domain must support eventual consistency |

**Decision key:** Map the user journey. Where are users when they lose connectivity? What are they trying to do?

### 2. Platform Constraints Checklist

| Constraint | iOS Impact | Android Impact | Decision Impact |
|---|---|---|---|
| Storage eviction | 7-day inactivity wipe | Persistent storage available | Blocks Tier 3 on iOS if data loss is unacceptable |
| Web Push | 16.4+ only, installed PWA only | Full support | Limits push reach on iOS |
| Background Sync | Not supported | Supported | Must build app-level fallback for iOS |
| Storage quota | ~50MB typical | Larger, varies | Limits offline content volume on iOS |
| Install prompt | No automatic prompt | beforeinstallprompt API | Must guide iOS users to "Add to Home Screen" manually |

**Decision key:** What % of target users are on iOS? Are iOS limitations deal-breakers for the core value prop?

### 3. Update Flow Assessment

| Criticality | Pattern | Example |
|---|---|---|
| Critical (safety/security) | Force-update + immediate reload | Medical dosage app, financial tool |
| High (data freshness) | User-controlled update toast | CMS, project management |
| Medium (features) | SWR background update | Blog, documentation |
| Low (cosmetic) | Silent auto-update via skipWaiting | Marketing site, static content |

**Decision key:** What's the cost of a user seeing stale content? How long can they tolerate the old version?

### 4. Architecture Compatibility Matrix

| Architecture | App Shell | Offline Read | Offline Write | Push | Install |
|---|---|---|---|---|---|
| React/Vue SPA | ✅ | ✅ | ✅ (with effort) | ✅ | ✅ |
| Next.js (SSR) | ⚠️ Partial | ✅ | ⚠️ Partial | ✅ | ✅ |
| Next.js (static export) | ✅ | ✅ | ✅ | ✅ | ✅ |
| htmx / MPA | ❌ | ✅ (cached pages) | ⚠️ (SW POST queue) | ✅ | ✅ |
| WordPress / CMS | ❌ | ✅ (cached pages) | ❌ | ✅ | ✅ |

### 5. Migration Cost vs. Value

**Cost levels:**
- **Add-on** (1-2 days): Manifest + basic SW. Installability + offline fallback.
- **Caching** (1-2 weeks): Intelligent per-resource strategies. Offline reading.
- **Offline-capable** (1-3 months): Full offline + sync. IndexedDB, conflict resolution.
- **Architecture change** (3+ months): Restructure app for offline-first.

**Value signals (GO):** Users in low-connectivity environments. Mobile-first app. Clear offline use case. Team has SW expertise or is willing to invest.

**Warning signals (PAUSE):** Always-connected desktop users. Real-time data dependency. Small team with no SW experience. iOS-dominant audience + Tier 3 need.

## Quick Evaluation Heuristic

Ask in order — stop at the first "no":

1. Do users ever need the app without connectivity? → No → Tier 0/1 only (add-on PWA at most)
2. Is the current architecture compatible with the needed offline tier? → No → Migration cost may exceed value
3. Do platform constraints block the core value prop? → Yes → Re-evaluate or target specific platforms
4. Is the maintenance cost (SW bugs, cache invalidation) justified by the user value? → No → Skip or minimal PWA
