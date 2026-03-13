# PWA Knowledge Graph — Mastery Overlay

## Module 1: Caching Foundations

```mermaid
flowchart TD
    subgraph "Caching Foundations"
        A["HTTP Caching Fundamentals (60%)"]:::developing
        B["Browser Request Lifecycle (55%)"]:::developing
        C["HTTPS & SW Security (40%)"]:::developing
    end

    A --> B
    C -.-> SW

    subgraph "Service Worker Core"
        SW["SW Lifecycle (65%)"]:::developing
        CA["Cache API & Storage (60%)"]:::developing
        UF["Update Flow Design (55%)"]:::developing
    end

    SW --> CA
    SW --> UF
    A --> SW

    classDef mastered fill:#22c55e,color:white,stroke:#16a34a
    classDef developing fill:#eab308,color:black,stroke:#ca8a04
    classDef not_started fill:#d1d5db,color:black,stroke:#9ca3af
    classDef locked fill:#d1d5db,color:#9ca3af,stroke:#9ca3af,stroke-dasharray: 5 5
```

## Module 2: Caching Strategy

```mermaid
flowchart TD
    subgraph "Caching Strategy"
        CS["Caching Strategy Selection (60%)"]:::developing
        SH["SW+HTTP Cache Alignment (55%)"]:::developing
        SC["SW+CDN Interaction (60%)"]:::developing
        AS["App Shell Pattern (5%)"]:::not_started
    end

    CS --> SH
    CS --> SC
    CS --> AS

    subgraph "Prerequisites (from Module 1)"
        HTTP["HTTP Caching (60%)"]:::developing
        BRL["Request Lifecycle (55%)"]:::developing
        SWL["SW Lifecycle (65%)"]:::developing
        CAM["Cache API (60%)"]:::developing
    end

    HTTP --> CS
    SWL --> CS
    CAM -.-> CS
    BRL --> SC
    HTTP --> SH
    HTTP --> SC

    classDef mastered fill:#22c55e,color:white,stroke:#16a34a
    classDef developing fill:#eab308,color:black,stroke:#ca8a04
    classDef not_started fill:#d1d5db,color:black,stroke:#9ca3af
```

## Module 3: Architectural Decisions

```mermaid
flowchart TD
    subgraph "Architectural Decisions"
        OFF["Offline Strategy Design (65%)"]:::developing
        PC["Platform Constraints (5%)"]:::not_started
        HT["htmx-PWA Tension (25%)"]:::not_started
        FIT["PWA Fitness Evaluation (60%)"]:::developing
        MIG["Migration Cost Assessment (55%)"]:::developing
    end

    OFF --> FIT
    PC --> FIT
    PC -.-> OFF
    HT --> FIT
    HT --> MIG
    OFF --> MIG
    FIT -.-> MIG

    subgraph "Prerequisites"
        CS2["Caching Strategy (60%)"]:::developing
        AS2["App Shell (5%)"]:::not_started
        UF2["Update Flow (55%)"]:::developing
    end

    CS2 --> OFF
    AS2 --> HT
    AS2 -.-> OFF
    UF2 -.-> MIG

    classDef mastered fill:#22c55e,color:white,stroke:#16a34a
    classDef developing fill:#eab308,color:black,stroke:#ca8a04
    classDef not_started fill:#d1d5db,color:black,stroke:#9ca3af
```

## Module 4: Quality Evaluation

```mermaid
flowchart TD
    subgraph "Quality Evaluation"
        WB["Workbox & Tooling (55%)"]:::developing
        AP["Anti-Pattern Detection (40%)"]:::developing
        PB["Performance Budgeting (15%)"]:::not_started
    end

    WB -.-> AP

    subgraph "Prerequisites"
        SWL3["SW Lifecycle (65%)"]:::developing
        CS3["Caching Strategy (60%)"]:::developing
        CAM3["Cache API (60%)"]:::developing
        UF3["Update Flow (55%)"]:::developing
    end

    SWL3 --> AP
    CS3 --> AP
    CAM3 -.-> AP
    UF3 -.-> AP

    classDef mastered fill:#22c55e,color:white,stroke:#16a34a
    classDef developing fill:#eab308,color:black,stroke:#ca8a04
    classDef not_started fill:#d1d5db,color:black,stroke:#9ca3af
```

## Module 5: Advanced Integration

```mermaid
flowchart TD
    subgraph "Advanced Integration"
        WA["WASM in PWA (15%)"]:::not_started
        PN["Push Notifications (10%)"]:::not_started
        BS["Background Sync (35%)"]:::developing
    end

    PN -.-> BS

    subgraph "Prerequisites"
        CS4["Caching Strategy (60%)"]:::developing
        OFF4["Offline Strategy (65%)"]:::developing
    end

    CS4 -.-> WA
    OFF4 -.-> BS

    classDef mastered fill:#22c55e,color:white,stroke:#16a34a
    classDef developing fill:#eab308,color:black,stroke:#ca8a04
    classDef not_started fill:#d1d5db,color:black,stroke:#9ca3af
```

## Legend

- 🟢 Green = Mastered (≥80%)
- 🟡 Yellow = Developing (30-79%)
- ⬜ Gray = Not started (<30%)
- Solid arrows = Hard prerequisites
- Dashed arrows = Soft prerequisites
