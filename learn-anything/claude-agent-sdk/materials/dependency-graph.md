# Claude Agent SDK: Knowledge Graph & Mastery Overlay

## Full Graph (20 vertices)

```mermaid
flowchart TD
    subgraph "Core (Gateway Nodes)"
        OPT["ClaudeAgentOptions (50%)"]:::familiar
        QRY["query() (45%)"]:::familiar
        MSG["Message Types (45%)"]:::familiar
        CB["Content Blocks (35%)"]:::attempted
        CLI["ClaudeSDKClient (35%)"]:::attempted
    end

    subgraph "Tools"
        TOOL["@tool Decorator (50%)"]:::familiar
        MCP["MCP Servers (50%)"]:::familiar
    end

    subgraph "Control"
        HOOK["Hooks (55%)"]:::familiar
        PERM["Permissions (30%)"]:::attempted
    end

    subgraph "Orchestration"
        AGNT["AgentDefinition (70%)"]:::proficient
        SUB["Subagent Lifecycle (40%)"]:::familiar
    end

    subgraph "Sessions"
        SESS["Session Mgmt (65%)"]:::familiar
    end

    subgraph "Production"
        COST["Cost/Budget (45%)"]:::familiar
        CTX["Context Mgmt (75%)"]:::proficient
        STRM["Streaming (25%)"]:::attempted
        SOUT["Structured Output (15%)"]:::attempted
        THINK["Thinking/Effort (40%)"]:::familiar
        MOD["Model Routing (50%)"]:::familiar
        SAND["Sandbox (45%)"]:::familiar
        SET["Settings/Plugins (70%)"]:::proficient
    end

    CB --> MSG
    MSG --> QRY
    OPT --> QRY
    MSG --> CLI
    OPT --> CLI
    QRY -.-> CLI
    TOOL --> MCP
    OPT --> HOOK
    OPT --> PERM
    HOOK -.-> PERM
    OPT --> AGNT
    AGNT --> SUB
    MSG --> SUB
    QRY -.-> SESS
    CLI -.-> SESS
    MSG --> COST
    OPT --> COST
    CLI --> STRM
    MSG --> STRM
    OPT --> SOUT
    OPT --> THINK
    OPT --> MOD
    OPT --> SAND
    OPT --> SET

    classDef proficient fill:#15803d,color:#fff,stroke:#86efac
    classDef familiar fill:#92400e,color:#fff,stroke:#fbbf24
    classDef attempted fill:#b91c1c,color:#fff,stroke:#fca5a5
    classDef not_started fill:#4b5563,color:#fff,stroke:#9ca3af
```

## Legend
- **Green (Proficient 70-89%):** AgentDefinition, Context Management, Settings/Plugins
- **Yellow (Familiar 40-69%):** query(), Options, Messages, Tools, MCP, Hooks, Subagent Lifecycle, Sessions, Cost, Thinking, Model Routing, Sandbox
- **Orange (Attempted 10-39%):** ClaudeSDKClient, Content Blocks, Permissions, Streaming, Structured Output

## Coverage: 44.3% weighted

## Task Class → Vertex Mapping

| TC | Focus | Key Vertices |
|---|---|---|
| **TC1** | Session Storage Backend | query, tools, MCP, messages, content-blocks, options, sessions |
| **TC2** | Cost & Observability | hooks, permissions, cost, streaming, thinking |
| **TC3** | Teams vs Subagents | subagent-lifecycle, client, model-routing, agent-definition |
| **TC4** | Intelligence & Eval | structured-output, sessions, tools, hooks |
