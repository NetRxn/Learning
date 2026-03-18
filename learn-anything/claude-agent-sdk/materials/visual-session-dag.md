# Session Storage & DAG Structure — Visual Reference

## JSONL → parentUuid Tree

```mermaid
flowchart TD
    subgraph "Session: abc-123.jsonl"
        M1["msg-001 (user)\nparentUuid: null\n'Fix the auth bug'"]
        M2["msg-002 (assistant)\nparentUuid: msg-001\n'Let me read the file...'"]
        M3["msg-003 (user)\nparentUuid: msg-002\n tool result: file contents"]
        M4["msg-004 (assistant)\nparentUuid: msg-003\n'I see the issue...'"]
        M5["msg-005 (user)\nparentUuid: msg-004\n tool result: edit applied"]
        M6["msg-006 (assistant)\nparentUuid: msg-005\n'Fixed! Tests pass.'"]
    end

    M1 --> M2 --> M3 --> M4 --> M5 --> M6

    style M1 fill:#15803d,stroke:#86efac,color:#fff
    style M2 fill:#1e40af,stroke:#93c5fd,color:#fff
    style M3 fill:#15803d,stroke:#86efac,color:#fff
    style M4 fill:#1e40af,stroke:#93c5fd,color:#fff
    style M5 fill:#15803d,stroke:#86efac,color:#fff
    style M6 fill:#1e40af,stroke:#93c5fd,color:#fff
```

## Fork at Turn 3: Two Branches, One File

```mermaid
flowchart TD
    M1["msg-001 (user)\n'Fix auth bug'"] --> M2["msg-002 (assistant)\n'Reading file...'"]
    M2 --> M3["msg-003 (user)\n BRANCH POINT"]

    M3 --> M4["msg-004 (assistant)\nORIGINAL BRANCH\n'Patching auth.ts'"]
    M4 --> M5["msg-005\n'Done, tests pass'"]

    M3 --> M4F["msg-007 (assistant)\nFORKED BRANCH\n'Different approach...'"]
    M4F --> M5F["msg-008\n'Refactored instead'"]

    style M3 fill:#92400e,stroke:#fbbf24,color:#fff,stroke-width:3px
    style M4 fill:#1e40af,stroke:#93c5fd,color:#fff
    style M5 fill:#1e40af,stroke:#93c5fd,color:#fff
    style M4F fill:#7e22ce,stroke:#c4b5fd,color:#fff
    style M5F fill:#7e22ce,stroke:#c4b5fd,color:#fff
```

```
Both branches coexist in the same JSONL file.
msg-007.parentUuid = msg-003.uuid  ← branches from turn 3
msg-004.parentUuid = msg-003.uuid  ← original continues from turn 3

get_session_messages() follows the LONGEST/LATEST chain.
To get the fork: walk from msg-008 back via parentUuid.
```

## SDK Session Operations

```mermaid
flowchart LR
    subgraph "Create"
        Q1["query(prompt)"] --> S1["New session\nnew UUID\nnew JSONL file"]
    end

    subgraph "Resume"
        Q2["query(prompt,\nresume=sid)"] --> S2["Same session\nsame JSONL\nfull context restored"]
    end

    subgraph "Fork"
        Q3["query(prompt,\nresume=sid,\nfork_session=True)"] --> S3["NEW session\nnew UUID\noriginal untouched"]
    end

    subgraph "Continue"
        Q4["query(prompt,\ncontinue_\nconversation=True)"] --> S4["Append to\nmost recent\nsession"]
    end

    style S1 fill:#15803d,stroke:#86efac,color:#fff
    style S2 fill:#1e40af,stroke:#93c5fd,color:#fff
    style S3 fill:#7e22ce,stroke:#c4b5fd,color:#fff
    style S4 fill:#92400e,stroke:#fbbf24,color:#fff
```

## File System Layout

```
~/.claude/
├── projects/
│   ├── -Users-john-myproject/          ← sanitized cwd
│   │   ├── abc-123-def-456.jsonl       ← session transcript
│   │   ├── ghi-789-jkl-012.jsonl       ← another session
│   │   └── ...
│   └── -Users-john-otherproject/
│       └── ...
├── settings.json
└── ...
```

## AGE Graph Model (for Postgres backend)

```mermaid
flowchart TD
    subgraph "AGE Graph: session_graph"
        direction TB
        V1["Message\nuuid: msg-001\ntype: user"]
        V2["Message\nuuid: msg-002\ntype: assistant"]
        V3["Message\nuuid: msg-003\ntype: user"]
        V4["Message\nuuid: msg-004\ntype: assistant"]
        V4F["Message\nuuid: msg-007\ntype: assistant\n(fork)"]

        V1 -->|PARENT_OF| V2
        V2 -->|PARENT_OF| V3
        V3 -->|PARENT_OF| V4
        V3 -->|PARENT_OF| V4F
    end

    style V1 fill:#15803d,stroke:#86efac,color:#fff
    style V2 fill:#1e40af,stroke:#93c5fd,color:#fff
    style V3 fill:#15803d,stroke:#86efac,color:#fff
    style V4 fill:#1e40af,stroke:#93c5fd,color:#fff
    style V4F fill:#7e22ce,stroke:#c4b5fd,color:#fff
```

## Key AGE Queries

```sql
-- Reconstruct conversation to a specific message (ancestors)
SELECT * FROM cypher('session_graph', $$
    MATCH path = (root)-[:PARENT_OF*]->(target {uuid: 'msg-004'})
    WHERE NOT EXISTS(()-[:PARENT_OF]->(root))
    RETURN [n IN nodes(path) | n.uuid] AS chain
$$) AS (chain agtype);

-- Find all branch points (messages with >1 child)
SELECT * FROM cypher('session_graph', $$
    MATCH (parent)-[:PARENT_OF]->(child)
    WITH parent, count(child) AS branches
    WHERE branches > 1
    RETURN parent.uuid, branches
$$) AS (uuid agtype, branches agtype);

-- Extract a fork subtree (descendants of a branch point)
SELECT * FROM cypher('session_graph', $$
    MATCH (start {uuid: 'msg-003'})-[:PARENT_OF*]->(desc)
    RETURN desc.uuid, desc.type
    ORDER BY desc.uuid
$$) AS (uuid agtype, type agtype);
```

## Cross-Project Session Model (TC4 target)

```mermaid
flowchart TD
    subgraph "AGE: cross_project_graph"
        P1["Project A"] -->|HAS_SESSION| S1["Session 1"]
        P1 -->|HAS_SESSION| S2["Session 2"]
        P2["Project B"] -->|HAS_SESSION| S3["Session 3"]

        S1 -->|CONTAINS| M1["Messages..."]
        S2 -->|CONTAINS| M2["Messages..."]
        S3 -->|CONTAINS| M3["Messages..."]

        S1 -->|USED_AGENT| A1["test-writer"]
        S2 -->|USED_AGENT| A2["developer"]
        S3 -->|USED_AGENT| A1

        M1 -->|MADE_DECISION| D1["Use JWT auth"]
        M3 -->|MADE_DECISION| D2["Use JWT auth"]
        D1 -.->|SAME_TOPIC| D2
    end

    style P1 fill:#1e40af,stroke:#93c5fd,color:#fff
    style P2 fill:#1e40af,stroke:#93c5fd,color:#fff
    style S1 fill:#92400e,stroke:#fbbf24,color:#fff
    style S2 fill:#92400e,stroke:#fbbf24,color:#fff
    style S3 fill:#92400e,stroke:#fbbf24,color:#fff
    style A1 fill:#15803d,stroke:#86efac,color:#fff
    style A2 fill:#15803d,stroke:#86efac,color:#fff
    style D1 fill:#be185d,stroke:#f9a8d4,color:#fff
    style D2 fill:#be185d,stroke:#f9a8d4,color:#fff
```
