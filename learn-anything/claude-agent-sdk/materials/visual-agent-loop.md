# Agent Loop Lifecycle — Visual Reference

## The Complete Agent Loop

```mermaid
sequenceDiagram
    participant App as Your Python App
    participant SDK as Agent SDK
    participant CLI as Claude Code CLI
    participant API as Anthropic API
    participant Tools as Tools (Built-in + MCP)

    App->>SDK: query(prompt, options)
    SDK->>CLI: Spawn subprocess
    CLI->>API: Send prompt + tools + system prompt

    Note over SDK,App: SystemMessage (subtype="init")

    loop Each Turn
        API-->>CLI: Claude response (text + tool_use blocks)
        CLI-->>SDK: Parse response
        SDK-->>App: AssistantMessage (content blocks)

        alt Has tool_use blocks
            CLI->>Tools: Execute tools (parallel if read-only)
            Note over CLI,Tools: PreToolUse hooks fire BEFORE
            Tools-->>CLI: Tool results
            Note over CLI,Tools: PostToolUse hooks fire AFTER
            CLI-->>SDK: Tool results
            SDK-->>App: UserMessage (tool results)
            CLI->>API: Send tool results back
        else Text only (no tools)
            Note over CLI,API: Loop ends
        end
    end

    SDK-->>App: AssistantMessage (final text)
    SDK-->>App: ResultMessage (cost, usage, session_id)
```

## Message Flow Within a Turn

```mermaid
flowchart LR
    subgraph "One Turn"
        A["Claude thinks"] --> B{"Tool calls?"}
        B -->|Yes| C["Execute tools"]
        C --> D["Return results to Claude"]
        D --> A
        B -->|No| E["Final text response"]
    end

    style A fill:#1e40af,stroke:#93c5fd,color:#fff
    style B fill:#92400e,stroke:#fbbf24,color:#fff
    style C fill:#15803d,stroke:#86efac,color:#fff
    style D fill:#15803d,stroke:#86efac,color:#fff
    style E fill:#be185d,stroke:#f9a8d4,color:#fff
```

## Turn Counting

```
max_turns counts TOOL-USE turns only (not the final text turn)

Turn 1: Claude calls Bash("npm test")       ← counts
Turn 2: Claude calls Read("auth.ts")        ← counts
Turn 3: Claude calls Edit("auth.ts", ...)   ← counts
Turn 4: "Fixed the bug, all tests pass"     ← does NOT count (text only)

max_turns=3 would have stopped BEFORE Turn 3
```

## What Accumulates in Context

```mermaid
flowchart TD
    subgraph "Always Present (prompt cached)"
        SP["System Prompt"]
        TD["Tool Definitions"]
        CM["CLAUDE.md via setting_sources"]
    end

    subgraph "Grows Each Turn"
        T1["Turn 1: prompt + response + tool I/O"]
        T2["Turn 2: + response + tool I/O"]
        T3["Turn 3: + response + tool I/O"]
        TN["Turn N: context approaching limit"]
    end

    TN --> COMPACT{"Auto-compaction"}
    COMPACT --> SUM["Summarized history"]

    style SP fill:#1e40af,stroke:#93c5fd,color:#fff
    style TD fill:#1e40af,stroke:#93c5fd,color:#fff
    style CM fill:#1e40af,stroke:#93c5fd,color:#fff
    style COMPACT fill:#92400e,stroke:#fbbf24,color:#fff
    style SUM fill:#15803d,stroke:#86efac,color:#fff
```

## Subagent Context Isolation

```mermaid
flowchart TD
    subgraph "Parent Agent Context"
        P1["System prompt + CLAUDE.md"]
        P2["Conversation history turns 1-N"]
        P3["Tool results accumulated"]
        P4["Full context window"]
    end

    P4 -->|"Agent tool call"| SA

    subgraph "Subagent Context FRESH"
        SA["Agent tool prompt string"]
        S1["Subagent system prompt"]
        S2["CLAUDE.md reloaded"]
        S3["Subagent tool definitions only"]
        S4["Clean context window"]
    end

    SA -->|"Only final message returns"| RET["Tool result in parent"]

    style P4 fill:#1e40af,stroke:#93c5fd,color:#fff
    style S4 fill:#15803d,stroke:#86efac,color:#fff
    style RET fill:#92400e,stroke:#fbbf24,color:#fff
```
