# SK-EFT Hawking Radiation: Dependency Graph Visualizations

## Overview: Part 1 - Foundations through Formalism

This diagram traces the critical path from foundational physics through EFT frameworks to SK formalism fundamentals.

```mermaid
graph TD
    %% Foundations Cluster
    LM["🟢 Lagrangian Mechanics<br/>40%"]
    QM["🟡 Quantum Mechanics<br/>45%"]
    SM["⚫ Statistical Mechanics<br/>30%"]
    FD["🟢 Fluid Dynamics<br/>50%"]

    %% EFT Core Cluster
    EFTP["🟡 EFT Philosophy<br/>35%"]
    SONEFT["🟡 SoN Superfluid EFT<br/>40%"]
    SSB["🟡 Symmetry Breaking<br/>38%"]

    %% Analog Gravity Cluster
    AM["🟢 Acoustic Metric<br/>45%"]
    HR["🟡 Hawking Radiation<br/>42%"]
    TB["🟢 Transonic Backgrounds<br/>60%"]

    %% SK Formalism Cluster
    SKC["🟡 SK Contour<br/>35%"]
    KMS["🟡 KMS/FDR<br/>38%"]
    SKA["🟡 SK Axioms<br/>40%"]

    %% Connections: Foundations → EFT
    LM --> EFTP
    QM --> EFTP
    SM --> SSB
    FD --> AM

    %% Connections: EFT → Analog Gravity
    EFTP --> SONEFT
    SONEFT --> SSB
    SSB --> AM
    SONEFT --> HR

    %% Connections: Analog Gravity → SK Formalism
    AM --> SKC
    HR --> KMS
    TB --> SKC

    %% Internal SK connections
    SKC --> SKA
    KMS --> SKA

    style LM fill:#90EE90,color:#111
    style FD fill:#90EE90,color:#111
    style TB fill:#90EE90,color:#111
    style QM fill:#FFEB3B,color:#111
    style SM fill:#999999,color:#fff
    style EFTP fill:#FFEB3B,color:#111
    style SONEFT fill:#FFEB3B,color:#111
    style SSB fill:#FFEB3B,color:#111
    style AM fill:#90EE90,color:#111
    style HR fill:#FFEB3B,color:#111
    style SKC fill:#FFEB3B,color:#111
    style KMS fill:#FFEB3B,color:#111
    style SKA fill:#FFEB3B,color:#111
```

## Overview: Part 2 - Gauge, Gravity, Topology, and Synthesis

This diagram shows the more advanced pathways through gauge structure, emergent gravity, topological aspects, and synthesis achievements.

```mermaid
graph TD
    %% From SK Formalism prerequisites
    PHASE1["🟢 Phase 1-2 Results<br/>avg 41%"]
    PHASE3["🟡 Phase 3 WKB<br/>avg 38%"]

    %% Gauge Structure
    HFS["⚫ Higher-Form Symmetries<br/>25%"]
    GE["🟢 Gauge Erasure<br/>45%"]

    %% Emergent Gravity
    CW["⚫ Coleman-Weinberg<br/>20%"]
    ADW["🟡 ADW Mechanism<br/>35%"]
    VG["⚫ Vestigial Gravity<br/>30%"]

    %% Fracton/Topological
    SN["⚫ String Nets<br/>20%"]
    FH["⚫ Fracton Hydro<br/>20%"]

    %% Synthesis
    CW_SYN["⚫ Chirality Wall<br/>25%"]
    TW["🟢 Three Walls<br/>45%"]
    HA["🟡 Hybrid Architecture<br/>40%"]
    LV["🟢 Lean Verification<br/>80%"]

    %% Connections
    PHASE1 --> GE
    PHASE3 --> ADW
    HFS --> GE
    GE --> TW
    CW --> ADW
    ADW --> TW
    VG --> ADW
    SN --> FH
    FH --> HA
    CW_SYN --> TW
    TW --> HA
    HA --> LV

    style PHASE1 fill:#90EE90,color:#111
    style PHASE3 fill:#FFEB3B,color:#111
    style HFS fill:#999999,color:#fff
    style GE fill:#90EE90,color:#111
    style CW fill:#999999,color:#fff
    style ADW fill:#FFEB3B,color:#111
    style VG fill:#999999,color:#fff
    style SN fill:#999999,color:#fff
    style FH fill:#999999,color:#fff
    style CW_SYN fill:#999999,color:#fff
    style TW fill:#90EE90,color:#111
    style HA fill:#FFEB3B,color:#111
    style LV fill:#90EE90,color:#111
```

---

## Cluster-Focused Views

### Cluster 1: Foundations (4 nodes)

```mermaid
graph LR
    LM["🟢 Lagrangian<br/>40%"]
    QM["🟡 Quantum<br/>45%"]
    SM["⚫ Statistical<br/>30%"]
    FD["🟢 Fluids<br/>50%"]

    LM --> QM
    QM --> SM
    FD -.->|weak dependency| QM

    style LM fill:#90EE90,color:#111
    style QM fill:#FFEB3B,color:#111
    style SM fill:#999999,color:#fff
    style FD fill:#90EE90,color:#111
```

### Cluster 2: EFT Core (3 nodes)

```mermaid
graph TD
    EFTP["🟡 EFT Philosophy<br/>35%"]
    SONEFT["🟡 SoN Superfluid<br/>40%"]
    SSB["🟡 Symmetry Breaking<br/>38%"]

    EFTP --> SONEFT
    SONEFT --> SSB
    EFTP -.->|foundational| SSB

    style EFTP fill:#FFEB3B,color:#111
    style SONEFT fill:#FFEB3B,color:#111
    style SSB fill:#FFEB3B,color:#111
```

### Cluster 3: Analog Gravity (4 nodes)

```mermaid
graph TD
    AM["🟢 Acoustic Metric<br/>45%"]
    HR["🟡 Hawking Radiation<br/>42%"]
    TB["🟢 Transonic<br/>60%"]
    EXP["🟡 Experimental<br/>40%"]

    AM --> HR
    TB --> AM
    HR --> EXP
    TB -.->|parallel| EXP

    style AM fill:#90EE90,color:#111
    style HR fill:#FFEB3B,color:#111
    style TB fill:#90EE90,color:#111
    style EXP fill:#FFEB3B,color:#111
```

### Cluster 4: SK Formalism (3 nodes)

```mermaid
graph LR
    SKC["🟡 SK Contour<br/>35%"]
    KMS["🟡 KMS/FDR<br/>38%"]
    SKA["🟡 SK Axioms<br/>40%"]

    SKC --> SKA
    KMS --> SKA
    SKC -.->|complementary| KMS

    style SKC fill:#FFEB3B,color:#111
    style KMS fill:#FFEB3B,color:#111
    style SKA fill:#FFEB3B,color:#111
```

### Cluster 5: Phase 1-2 Results (4 nodes)

```mermaid
graph TD
    DC["🟢 Dissipative Correction<br/>50%"]
    TC["🟡 Transport Counting<br/>42%"]
    SD["🟡 Spectral Distortion<br/>38%"]
    CGL["🟡 CGL Derivation<br/>35%"]

    DC --> TC
    TC --> SD
    CGL --> TC

    style DC fill:#90EE90,color:#111
    style TC fill:#FFEB3B,color:#111
    style SD fill:#FFEB3B,color:#111
    style CGL fill:#FFEB3B,color:#111
```

### Cluster 6: Emergent Gravity (3 nodes)

```mermaid
graph TD
    CW["⚫ Coleman-Weinberg<br/>20%"]
    ADW["🟡 ADW Mechanism<br/>35%"]
    VG["⚫ Vestigial<br/>30%"]

    CW --> ADW
    VG --> ADW

    style CW fill:#999999,color:#fff
    style ADW fill:#FFEB3B,color:#111
    style VG fill:#999999,color:#fff
```

### Cluster 7: Synthesis & Final Results (4 nodes)

```mermaid
graph TD
    CW_SYN["⚫ Chirality Wall<br/>25%"]
    TW["🟢 Three Walls<br/>45%"]
    HA["🟡 Hybrid Architecture<br/>40%"]
    LV["🟢 Lean Verification<br/>80%"]

    CW_SYN --> TW
    TW --> HA
    HA --> LV

    style CW_SYN fill:#999999,color:#fff
    style TW fill:#90EE90,color:#111
    style HA fill:#FFEB3B,color:#111
    style LV fill:#90EE90,color:#111
```

---

## Critical Path: Minimal Prerequisite Chain

This diagram shows the shortest path from foundational concepts to the complete synthesis. Follow the primary arrows for essential prerequisites.

```mermaid
graph TD
    START["START: Physics Fundamentals"]

    LM["Lagrangian Mechanics<br/>40%"]
    FD["Fluid Dynamics<br/>50%"]
    AM["Acoustic Metric<br/>45%"]
    HR["Hawking Radiation<br/>42%"]
    SKC["SK Contour<br/>35%"]
    SKA["SK Axioms<br/>40%"]
    PHASE1["Phase 1-2 Results<br/>50%"]
    ADW["ADW Mechanism<br/>35%"]
    TW["Three Walls<br/>45%"]
    HA["Hybrid Architecture<br/>40%"]
    LV["Lean Verification<br/>80%"]

    END["COMPLETION: Full Program Mastery"]

    START --> LM
    START --> FD
    LM --> AM
    FD --> AM
    AM --> HR
    HR --> SKC
    SKC --> SKA
    SKA --> PHASE1
    PHASE1 --> ADW
    ADW --> TW
    TW --> HA
    HA --> LV
    LV --> END

    style START fill:#FFB6C1,color:#111
    style LM fill:#90EE90,color:#111
    style FD fill:#90EE90,color:#111
    style AM fill:#90EE90,color:#111
    style HR fill:#FFEB3B,color:#111
    style SKC fill:#FFEB3B,color:#111
    style SKA fill:#FFEB3B,color:#111
    style PHASE1 fill:#90EE90,color:#111
    style ADW fill:#FFEB3B,color:#111
    style TW fill:#90EE90,color:#111
    style HA fill:#FFEB3B,color:#111
    style LV fill:#90EE90,color:#111
    style END fill:#FFB6C1,color:#111
```

**Critical Path Analysis:**
- **Essential Sequence Length:** 13 concepts (shortest viable learning path)
- **High Priority Gaps:** Statistical Mechanics (30%), Vestigial Gravity (30%), String Nets (20%)
- **Recommended Focus:** Consolidate developing (yellow) concepts before advancing
- **Bottlenecks:** SK Axioms and Phase 1-2 Results unlock synthesis (TW/HA)

---

## Legend & Interpretation

| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 Green | Mastered (40%+) | Ready to build on; review available |
| 🟡 Yellow | Developing (35-39%) | Active learning; needs practice |
| ⚫ Gray | Not Started (<30%) | Prerequisite or optional; plan ahead |
| ➖ Dashed | Locked | Requires prerequisites first |

**Nodes show:** Concept name, progress percentage
**Arrows:** Prerequisite flow (direction: dependency direction)
**Organization:** Grouped by academic cluster; prerequisites top-to-bottom
