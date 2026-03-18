# BHappy ↔ SDK Integration Map — Visual Reference

## Current Architecture

```mermaid
flowchart TD
    subgraph "BHappy Orchestration Layer"
        META["MetaOrchestrator\nMulti-project coordination"]
        PROJ["ProjectOrchestrator\nPer-project execution"]
    end

    subgraph "SDK Integration Layer"
        WE["WorkerExecutor\nquery() for single workers"]
        TL["TeamLauncher\nClaudeSDKClient for Agent Teams"]
        EB["ExecutorBase\nShared: plugins, prompts, security"]
    end

    subgraph "Claude Code CLI subprocess"
        LOOP["Agent Loop"]
        BT["Built-in Tools\nRead, Write, Edit, Bash, Grep, Glob"]
        MCP_T["MCP Tools\nPlaywright (18 tools)"]
        SKILLS["Skills\n32 BHappy skills"]
    end

    subgraph "PostgreSQL"
        DB[(bhappy schema\n49 tables)]
    end

    META --> PROJ
    PROJ -->|"Sequential features"| WE
    PROJ -->|"Batched features"| TL
    WE --> EB
    TL --> EB
    EB -->|"ClaudeAgentOptions"| LOOP
    LOOP --> BT
    LOOP --> MCP_T
    LOOP --> SKILLS
    WE -->|"ResultMessage → worker_attempts"| DB
    TL -->|"completion_metadata"| DB
    PROJ -->|"feature status"| DB

    style META fill:#1e40af,stroke:#93c5fd,color:#fff
    style PROJ fill:#1e40af,stroke:#93c5fd,color:#fff
    style WE fill:#15803d,stroke:#86efac,color:#fff
    style TL fill:#7e22ce,stroke:#c4b5fd,color:#fff
    style EB fill:#92400e,stroke:#fbbf24,color:#fff
    style DB fill:#be185d,stroke:#f9a8d4,color:#fff
```

## What You're Building (TC1-TC4)

```mermaid
flowchart TD
    subgraph "TC1: Session Storage Backend"
        direction TB
        JSONL["~/.claude JSONL files"]
        INGEST["Ingestion Pipeline\n@tool + query()"]
        PG_SESS["Postgres Session Tables"]
        AGE_DAG["AGE Graph\nparentUuid DAG"]
        TOGGLE["Backend Toggle\nfile ↔ DB"]

        JSONL --> INGEST --> PG_SESS
        INGEST --> AGE_DAG
        PG_SESS -.-> TOGGLE
        JSONL -.-> TOGGLE
    end

    subgraph "TC2: Observability"
        direction TB
        COST_HOOK["PostToolUse Hooks\n→ cost tracking"]
        TRACE["Distributed Tracing\nsession → worker → tool"]
        LIVE["Live Monitoring\nStreamEvent → SSE → Dashboard"]
        PERM_FIX["Permission Architecture\nallowed_tools + can_use_tool"]

        COST_HOOK --> TRACE
        TRACE --> LIVE
    end

    subgraph "TC3: Teams vs Subagents"
        direction TB
        INST["Identical Instrumentation\nBoth paths: same metrics"]
        AB["A/B Framework\nwall-clock, tokens, cost, quality"]
        AGE_EXEC["AGE Execution Graphs\nTask dependency chains"]
        DECIDE["Decision Matrix\nFeature size × complexity → mode"]

        INST --> AB --> AGE_EXEC --> DECIDE
    end

    subgraph "TC4: Intelligence & Eval"
        direction TB
        VEC["pgvector Embeddings\nSemantic search over sessions"]
        CROSS["Cross-Project Graph\nsessions → projects → agents"]
        EVAL["Eval Framework\nScorecards + trigger testing"]
        REPLAY["Lifetime Replay"]

        VEC --> CROSS --> EVAL --> REPLAY
    end

    style JSONL fill:#15803d,stroke:#86efac,color:#fff
    style INGEST fill:#15803d,stroke:#86efac,color:#fff
    style PG_SESS fill:#15803d,stroke:#86efac,color:#fff
    style AGE_DAG fill:#15803d,stroke:#86efac,color:#fff
    style COST_HOOK fill:#1e40af,stroke:#93c5fd,color:#fff
    style TRACE fill:#1e40af,stroke:#93c5fd,color:#fff
    style LIVE fill:#1e40af,stroke:#93c5fd,color:#fff
    style INST fill:#7e22ce,stroke:#c4b5fd,color:#fff
    style AB fill:#7e22ce,stroke:#c4b5fd,color:#fff
    style AGE_EXEC fill:#7e22ce,stroke:#c4b5fd,color:#fff
    style DECIDE fill:#7e22ce,stroke:#c4b5fd,color:#fff
    style VEC fill:#92400e,stroke:#fbbf24,color:#fff
    style CROSS fill:#92400e,stroke:#fbbf24,color:#fff
    style EVAL fill:#92400e,stroke:#fbbf24,color:#fff
    style REPLAY fill:#92400e,stroke:#fbbf24,color:#fff
```

## Teams vs Subagents: Current BHappy Flow

```mermaid
sequenceDiagram
    participant PO as ProjectOrchestrator
    participant TL as TeamLauncher
    participant Lead as Team Lead (Opus)
    participant TW as test-writer (Sonnet)
    participant DEV as developer (Sonnet)
    participant QA as reviewer (Sonnet)
    participant TR as test-runner (Haiku)

    PO->>TL: dispatch_team_batch([F1, F2])
    TL->>Lead: ClaudeSDKClient + Agent Teams

    Lead->>Lead: Create team (TeamCreate)
    Lead->>Lead: Create tasks with dependencies

    par Pipeline Parallelism
        Lead->>TW: Write tests for F1
        Lead->>TW: Write tests for F2
    end

    TW-->>Lead: Tests written (F1)
    Lead->>DEV: Implement F1 (blocked until tests done)

    TW-->>Lead: Tests written (F2)
    Lead->>DEV: Implement F2

    par
        DEV-->>Lead: F1 implemented
        DEV-->>Lead: F2 implemented
    end

    Lead->>TR: Run all tests
    TR-->>Lead: Results

    Lead->>QA: Review F1
    Lead->>QA: Review F2

    alt QA finds issues
        QA-->>Lead: Rework needed
        Lead->>DEV: Fix issues (rework task)
    end

    Lead->>Lead: Record results via API
    Lead->>Lead: TeamDelete (completion signal)

    TL-->>PO: completion_metadata + session_id
```

## What's Missing (Your Curriculum Fills These Gaps)

```mermaid
flowchart TD
    subgraph "EXISTS"
        E1["WorkerExecutor + query()"]
        E2["TeamLauncher + ClaudeSDKClient"]
        E3["8-layer security stack"]
        E4["ADR-046 completion detection"]
        E5["worker_attempts + session_id"]
        E6["Quality gates + TDD"]
    end

    subgraph "YOU ARE BUILDING"
        N1["Session transcript → Postgres"]
        N2["AGE DAG for fork/rewind/branch"]
        N3["Per-session cost tracking"]
        N4["Distributed trace IDs"]
        N5["Live session streaming → dashboard"]
        N6["Teams vs Subagents metrics"]
        N7["pgvector semantic search"]
        N8["Cross-project AGE graph"]
        N9["Eval framework"]
        N10["Lifetime replay"]
    end

    E5 -->|"extends"| N1
    N1 -->|"enables"| N2
    E4 -->|"extends"| N3
    N3 -->|"enables"| N4
    E2 -->|"extends"| N5
    E1 -->|"instruments"| N6
    E2 -->|"instruments"| N6
    N1 -->|"enables"| N7
    N7 -->|"enables"| N8
    N8 -->|"enables"| N9
    N1 -->|"enables"| N10

    style E1 fill:#15803d,stroke:#86efac,color:#fff
    style E2 fill:#15803d,stroke:#86efac,color:#fff
    style E3 fill:#15803d,stroke:#86efac,color:#fff
    style E4 fill:#15803d,stroke:#86efac,color:#fff
    style E5 fill:#15803d,stroke:#86efac,color:#fff
    style E6 fill:#15803d,stroke:#86efac,color:#fff
    style N1 fill:#1e40af,stroke:#93c5fd,color:#fff
    style N2 fill:#1e40af,stroke:#93c5fd,color:#fff
    style N3 fill:#1e40af,stroke:#93c5fd,color:#fff
    style N4 fill:#1e40af,stroke:#93c5fd,color:#fff
    style N5 fill:#1e40af,stroke:#93c5fd,color:#fff
    style N6 fill:#7e22ce,stroke:#c4b5fd,color:#fff
    style N7 fill:#92400e,stroke:#fbbf24,color:#fff
    style N8 fill:#92400e,stroke:#fbbf24,color:#fff
    style N9 fill:#92400e,stroke:#fbbf24,color:#fff
    style N10 fill:#92400e,stroke:#fbbf24,color:#fff
```
