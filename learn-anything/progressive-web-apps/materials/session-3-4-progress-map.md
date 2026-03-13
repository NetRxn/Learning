# PWA Learning: Sessions 3 → 4 Progress Map

---

## Knowledge Graph — Current Mastery

```mermaid
flowchart TD
    subgraph CF["Caching Foundations"]
        HTTP["HTTP Caching<br/>Fundamentals<br/><b>60%</b>"]:::familiar
        BRL["Browser Request<br/>Lifecycle<br/><b>55%</b>"]:::familiar
        SEC["HTTPS & SW<br/>Security<br/><b>40%</b>"]:::familiar
    end

    subgraph SWC["Service Worker Core"]
        SWL["SW Lifecycle<br/><b>65%</b>"]:::familiar
        CAM["Cache API &<br/>Storage<br/><b>60%</b>"]:::familiar
        UPD["Update Flow &<br/>Versioning<br/><b>55%</b>"]:::familiar
    end

    subgraph CS["Caching Strategy"]
        CSS["Strategy<br/>Selection<br/><b>60%</b>"]:::familiar
        CDN["SW + CDN<br/>Interaction<br/><b>60%</b>"]:::familiar
        HCA["SW + HTTP Cache<br/>Alignment<br/><b>55%</b>"]:::familiar
    end

    subgraph AD["Architectural Decisions"]
        OSD["Offline Strategy<br/>Design<br/><b>65%</b>"]:::familiar
        PFE["PWA Fitness<br/>Evaluation<br/><b>60%</b>"]:::familiar
        MCA["Migration Cost<br/>Assessment<br/><b>55%</b>"]:::familiar
        PC["Platform<br/>Constraints<br/><b>5%</b>"]:::not_started
        HPT["htmx-PWA<br/>Tension<br/><b>25%</b>"]:::attempted
    end

    subgraph QE["Quality & Tooling"]
        APD["Anti-Pattern<br/>Detection<br/><b>40%</b>"]:::familiar
        WBX["Workbox &<br/>Serwist<br/><b>55%</b>"]:::familiar
        PB["Performance<br/>Budgeting<br/><b>15%</b>"]:::attempted
    end

    subgraph PS["PWA Shell"]
        WAM["Web App<br/>Manifest<br/><b>10%</b>"]:::attempted
        ASP["App Shell<br/>Pattern<br/><b>5%</b>"]:::not_started
    end

    subgraph AI["Advanced"]
        BGS["Background<br/>Sync<br/><b>35%</b>"]:::attempted
        PUSH["Push<br/>Notifications<br/><b>10%</b>"]:::attempted
        WASM["WASM in<br/>PWA<br/><b>15%</b>"]:::attempted
    end

    HTTP --> BRL
    HTTP --> CSS
    HTTP --> HCA
    HTTP --> CDN
    SEC --> SWL
    SWL --> CAM
    SWL --> CSS
    SWL --> UPD
    SWL --> APD
    CAM --> CSS
    CSS --> CDN
    CSS --> HCA
    CSS --> OSD
    CSS --> APD
    CDN --> PFE
    HCA --> PFE
    OSD --> PFE
    OSD --> MCA
    PC --> PFE
    PC --> OSD
    UPD --> APD
    UPD --> MCA
    WBX --> APD
    APD --> PFE
    HPT --> MCA
    HPT --> PFE
    ASP --> HPT
    ASP --> OSD
    PFE --> MCA

    classDef familiar fill:#3b82f6,color:white,stroke:#1d4ed8
    classDef attempted fill:#f59e0b,color:black,stroke:#d97706
    classDef not_started fill:#d1d5db,color:#374151,stroke:#9ca3af
```

**Legend:** <span style="color:#3b82f6">**Blue = Familiar (40-70%)**</span> | <span style="color:#f59e0b">**Amber = Attempted (10-39%)**</span> | <span style="color:#9ca3af">**Gray = Not Started (<10%)**</span>

---

## Session 3 Recap: What You Learned

```mermaid
flowchart LR
    subgraph S3["SESSION 3: Cache Layer Interactions & Serwist"]
        direction TB
        T1["Three-Layer<br/>Cache Model"]:::done
        T2["fetch({cache:'reload'})<br/>HTTP cache bypass"]:::done
        T3["CDN Purge vs TTL<br/>invalidation"]:::done
        T4["Versioned Cache<br/>Names by Purpose"]:::done
        T5["Serwist Introduction<br/>& Migration Plan"]:::done
        T6["SW Update Flow<br/>skipWaiting dangers"]:::done
    end

    style S3 fill:#eff6ff,stroke:#3b82f6,stroke-width:2px
    classDef done fill:#22c55e,color:white,stroke:#16a34a
```

### Session 3 Scorecard

| Area | Performance | Notes |
|---|---|---|
| Retrieval probes (3) | 3/3 correct | Cache-first safety, SW lifecycle, CDN path |
| Three-layer trace | Guided correct | Missed HTTP cache layer initially, then integrated |
| Cache versioning | Strong | Independently identified single-cache anti-pattern |
| Serwist plan review | Strong | Caught `next-pwa` deprecation before building on it |
| Plan bug detection | 5/6 found with prompts | Missed `fetchOptions` in own plan (caught when prompted) |
| Self-assessment | 3.5/5 | Accurate calibration — matches observed performance |

---

## Session 4 Preview: TC-2 Mastery Gate

```mermaid
flowchart TD
    subgraph GATE["MASTERY GATE: TC-2 Caching Deep Dive"]
        direction TB
        P1["Phase 1: Cold Recall<br/><i>No hints, no scaffolding</i>"]
        P2["Phase 2: Novel Application<br/><i>Design caching for an app<br/>you've never seen</i>"]
        P3["Phase 3: Explain to Teach<br/><i>Teach SW update lifecycle<br/>to a junior dev</i>"]
        PASS["PASS → Advance to TC-3<br/>Offline Data & Sync"]
        FAIL["FAIL → Targeted re-teach<br/>on weak areas"]

        P1 --> P2 --> P3
        P3 -->|"All 3 pass"| PASS
        P3 -->|"Any fail"| FAIL
    end

    style GATE fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style PASS fill:#22c55e,color:white
    style FAIL fill:#ef4444,color:white
```

### What You'll Be Tested On

| Phase | Tests These Vertices | What "Pass" Looks Like |
|---|---|---|
| **Cold Recall** | SW+HTTP alignment, SW+CDN interaction, cache versioning | Trace the three-layer model without prompts. Name the bypass. Explain versioned cache cleanup. |
| **Novel Application** | Strategy selection, offline strategy, anti-pattern detection | Given a new app (NOT StudyElf), correctly choose strategies per resource type, identify cache layer risks, size caches. |
| **Explain to Teach** | Update flow design, SW lifecycle, Serwist tooling | Explain why `skipWaiting:true` is dangerous, walk through the update prompt flow, describe what Serwist handles vs raw SW. |

### How to Prepare

```mermaid
flowchart LR
    subgraph PREP["Preparation Checklist"]
        direction TB
        C1["Can I draw the three-layer<br/>diagram from memory?"]
        C2["Can I trace a content fix<br/>through all layers?"]
        C3["Can I explain WHY<br/>cache:'reload' is needed?"]
        C4["Can I design caching for<br/>a NEW app without StudyElf<br/>as a reference?"]
        C5["Can I explain the update<br/>flow to someone who's<br/>never seen a service worker?"]
    end

    style PREP fill:#f0fdf4,stroke:#22c55e,stroke-width:2px
```

---

## Trajectory: Sessions 1–4

```mermaid
gantt
    title PWA Learning Journey
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section TC-1 Foundations
    Session 1 - Mental Model & StudyElf Grounding     :done, s1, 2026-03-09, 1d
    Session 2 - SW Lifecycle & Caching Strategies      :done, s2, 2026-03-10, 1d

    section TC-2 Caching Deep Dive
    Session 3 - Cache Layers & Serwist Migration       :done, s3, 2026-03-10, 1d
    Session 4 - MASTERY GATE                           :active, s4, after s3, 1d

    section TC-3 Offline Data & Sync
    Session 5+ - Background Sync, IndexedDB, Content Packs  :s5, after s4, 3d
```

### Mastery Growth Across Sessions

```
Session 1  ████░░░░░░░░░░░░░░░░  ~20% — Built mental model
Session 2  ████████░░░░░░░░░░░░  ~40% — SW lifecycle + strategies
Session 3  ████████████░░░░░░░░  ~58% — Cache layers + Serwist + update flow
Session 4  ████████████████░░░░  ~70%? — Gate determines if ready for TC-3
```

---

## Open Questions Carried Forward

| Question | Status | When |
|---|---|---|
| Content pack download + cache-only strategy | Deferred | TC-3 |
| Quiz answer queuing with Background Sync | Deferred | Separate plan |
| ExpirationPlugin maxEntries sizing from usage data | Open | Implementation phase |
| iOS Safari PWA limitations | Not covered | TC-3 or TC-4 |
