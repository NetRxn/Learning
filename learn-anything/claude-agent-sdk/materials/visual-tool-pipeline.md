# Tool Pipeline & Hook System — Visual Reference

## Tool Creation → Registration → Execution

```mermaid
flowchart TD
    subgraph "1. Define"
        DEC["@tool(name, desc, schema)"]
        FUNC["async def handler(args) -> dict"]
        DEC --> SMT["SdkMcpTool object"]
        FUNC --> SMT
    end

    subgraph "2. Server"
        SMT --> CSS["create_sdk_mcp_server(\nname='my-server',\ntools=[tool1, tool2])"]
        CSS --> MSC["McpSdkServerConfig\n(in-process MCP server)"]
    end

    subgraph "3. Register"
        MSC --> OPT["ClaudeAgentOptions(\nmcp_servers={'my-server': config},\nallowed_tools=['mcp__my-server__tool1'])"]
    end

    subgraph "4. Execute"
        OPT --> QRY["query() / ClaudeSDKClient"]
        QRY --> CLAUDE["Claude decides to call tool"]
        CLAUDE --> HOOK["PreToolUse hook (if any)"]
        HOOK -->|allowed| EXEC["Handler runs IN-PROCESS"]
        HOOK -->|blocked| REJ["Rejection → Claude"]
        EXEC --> RES["Return MCP content blocks"]
        RES --> POST["PostToolUse hook (if any)"]
        POST --> BACK["Result → Claude for next turn"]
    end

    style DEC fill:#7e22ce,stroke:#c4b5fd,color:#fff
    style CSS fill:#1e40af,stroke:#93c5fd,color:#fff
    style OPT fill:#92400e,stroke:#fbbf24,color:#fff
    style EXEC fill:#15803d,stroke:#86efac,color:#fff
    style REJ fill:#b91c1c,stroke:#fca5a5,color:#fff
```

## Tool Naming Convention

```
create_sdk_mcp_server(name="db-tools", tools=[query_db, insert_record])
                            ▲                     ▲           ▲
                            │                     │           │
                     server name            tool name    tool name
                            │                     │           │
                            ▼                     ▼           ▼
allowed_tools = ["mcp__db-tools__query_db", "mcp__db-tools__insert_record"]
                  ^^^^  ^^^^^^^^^  ^^^^^^^^
                  prefix  server    tool
```

## MCP Server Types

```mermaid
flowchart LR
    subgraph "In-Process (fastest)"
        SDK["McpSdkServerConfig\ncreate_sdk_mcp_server()\nDirect function calls\nAccess app state"]
    end

    subgraph "External (separate process)"
        STDIO["McpStdioServerConfig\ncommand + args\nSubprocess over stdio"]
        SSE["McpSSEServerConfig\nurl + headers\nSSE endpoint"]
        HTTP["McpHttpServerConfig\nurl + headers\nHTTP endpoint"]
    end

    SDK -.->|"No IPC"| FAST["Fastest"]
    STDIO -.->|"Subprocess"| MED["Medium"]
    SSE -.->|"Network"| NET["Network"]
    HTTP -.->|"Network"| NET

    style SDK fill:#15803d,stroke:#86efac,color:#fff
    style FAST fill:#15803d,stroke:#86efac,color:#fff
    style MED fill:#92400e,stroke:#fbbf24,color:#fff
    style NET fill:#1e40af,stroke:#93c5fd,color:#fff
```

## Hook Execution Points in the Agent Loop

```mermaid
sequenceDiagram
    participant Loop as Agent Loop
    participant Pre as PreToolUse
    participant Tool as Tool Execution
    participant Post as PostToolUse
    participant Stop as Stop/SubagentStop

    Note over Loop: Turn starts

    Loop->>Pre: Hook fires BEFORE tool runs
    alt Hook blocks
        Pre-->>Loop: {decision: "block", reason: "..."}
        Note over Loop: Tool skipped, reason sent to Claude
    else Hook allows
        Pre-->>Loop: {continue_: True}
        Loop->>Tool: Execute tool
        Tool-->>Loop: Tool result
        Loop->>Post: Hook fires AFTER tool completes
        Post-->>Loop: {additionalContext: "..."} (optional)
    end

    Note over Loop: ... more turns ...

    Loop->>Stop: Hook fires when agent finishes
    Note over Stop: Save state, archive transcript, log metrics
```

## All Hook Events

```mermaid
flowchart TD
    subgraph "Tool Lifecycle"
        PTU["PreToolUse\nBefore tool runs\nValidate/block/modify"]
        POTU["PostToolUse\nAfter tool succeeds\nAudit/log/enrich"]
        POTUF["PostToolUseFailure\nAfter tool errors\nError handling"]
    end

    subgraph "Session Lifecycle"
        UPS["UserPromptSubmit\nPrompt sent\nInject context"]
        STOP["Stop\nAgent finishes\nSave state"]
        PC["PreCompact\nBefore compaction\nArchive transcript"]
    end

    subgraph "Subagent Lifecycle"
        SS["SubagentStart\nSubagent spawned\nTrack agent set"]
        SSTOP["SubagentStop\nSubagent done\nAggregate results"]
    end

    subgraph "Other"
        NOT["Notification\nSystem events\nAlerts"]
        PR["PermissionRequest\nTool needs approval\nDynamic auth"]
    end

    style PTU fill:#15803d,stroke:#86efac,color:#fff
    style POTU fill:#1e40af,stroke:#93c5fd,color:#fff
    style POTUF fill:#b91c1c,stroke:#fca5a5,color:#fff
    style STOP fill:#92400e,stroke:#fbbf24,color:#fff
    style SS fill:#7e22ce,stroke:#c4b5fd,color:#fff
    style SSTOP fill:#7e22ce,stroke:#c4b5fd,color:#fff
```

## HookMatcher Configuration

```python
# Match specific tool
HookMatcher(matcher="Bash", hooks=[bash_hook])

# Match multiple tools
HookMatcher(matcher="Write|Edit|MultiEdit", hooks=[write_hook])

# Match ALL tools (matcher=None)
HookMatcher(matcher=None, hooks=[logging_hook])

# Multiple matchers on same event
hooks = {
    "PreToolUse": [
        HookMatcher(matcher="Bash", hooks=[bash_security]),
        HookMatcher(matcher=None, hooks=[universal_logger])
    ],
    "PostToolUse": [
        HookMatcher(matcher=None, hooks=[cost_tracker])
    ],
    "Stop": [
        HookMatcher(hooks=[save_state])
    ]
}
```

## Hook Return Values

```mermaid
flowchart LR
    subgraph "PreToolUse Returns"
        A1["{decision: 'block',\nreason: 'why'}"] --> E1["Tool blocked"]
        A2["{hookSpecificOutput: {\npermissionDecision: 'allow',\nupdatedInput: {...}}}"] --> E2["Tool runs\n(modified input)"]
        A3["{continue_: True}"] --> E3["Tool runs normally"]
    end

    subgraph "PostToolUse Returns"
        B1["{additionalContext: 'note'}"] --> F1["Context injected"]
        B2["{continue_: True}"] --> F2["No action"]
    end

    subgraph "Stop Returns"
        C1["{continue_: False,\nstopReason: 'done'}"] --> G1["Session ends"]
        C2["{continue_: True}"] --> G2["Continue"]
    end

    style E1 fill:#b91c1c,stroke:#fca5a5,color:#fff
    style E2 fill:#15803d,stroke:#86efac,color:#fff
    style E3 fill:#15803d,stroke:#86efac,color:#fff
```

## BHappy Hook Architecture

```mermaid
flowchart TD
    subgraph "WorkerExecutor Hooks"
        BSH["bash_security_hook\n(PreToolUse → Bash)\nBlock: rm -rf, fork bombs,\npsql, dangerouslyDisableSandbox"]
    end

    subgraph "TeamLauncher Hooks (ADR-046)"
        TD_HOOK["PostToolUse → TeamDelete\nPrimary completion signal"]
        SS_HOOK["SubagentStart/Stop\nTrack spawned vs stopped agents"]
        STOP_HOOK["Stop\nSolo-done detection"]
    end

    subgraph "Your TC2 Additions"
        COST["PostToolUse → ALL\nLog tool use + cost to Postgres"]
        TRACE["SubagentStart/Stop\nDistributed trace IDs"]
        STREAM["Stop\nFinalize metrics + archive"]
    end

    style BSH fill:#b91c1c,stroke:#fca5a5,color:#fff
    style TD_HOOK fill:#1e40af,stroke:#93c5fd,color:#fff
    style SS_HOOK fill:#1e40af,stroke:#93c5fd,color:#fff
    style COST fill:#15803d,stroke:#86efac,color:#fff
    style TRACE fill:#15803d,stroke:#86efac,color:#fff
    style STREAM fill:#15803d,stroke:#86efac,color:#fff
```
