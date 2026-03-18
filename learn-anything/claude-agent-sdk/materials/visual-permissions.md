# Permission System — Visual Reference

## Decision Flow: "Can this tool run?"

```mermaid
flowchart TD
    REQ["Tool call requested\n(name + input)"] --> DIS{"In disallowed_tools?"}

    DIS -->|Yes| DENY1["DENIED\nClaude gets rejection message"]
    DIS -->|No| ALLOW{"In allowed_tools?"}

    ALLOW -->|Yes| RUN["AUTO-APPROVED\nTool executes immediately"]
    ALLOW -->|No| CALLBACK{"can_use_tool\ncallback set?"}

    CALLBACK -->|Yes| DYNAMIC["Callback invoked with\n(tool_name, tool_input, context)"]
    CALLBACK -->|No| MODE{"permission_mode?"}

    DYNAMIC --> RESULT{"Callback returns?"}
    RESULT -->|PermissionResultAllow| RUN2["ALLOWED\n(may have updated_input)"]
    RESULT -->|PermissionResultDeny| DENY2["DENIED\n(message sent to Claude)"]

    MODE -->|default| PROMPT["Would prompt user\n(denied if no UI)"]
    MODE -->|acceptEdits| EDIT{"Is it a file edit?"}
    MODE -->|bypassPermissions| RUN3["ALL ALLOWED\n(containers only!)"]

    EDIT -->|Yes| RUN4["Auto-approved"]
    EDIT -->|No| PROMPT

    style REQ fill:#4b5563,stroke:#9ca3af,color:#fff
    style DENY1 fill:#b91c1c,stroke:#fca5a5,color:#fff
    style DENY2 fill:#b91c1c,stroke:#fca5a5,color:#fff
    style RUN fill:#15803d,stroke:#86efac,color:#fff
    style RUN2 fill:#15803d,stroke:#86efac,color:#fff
    style RUN3 fill:#15803d,stroke:#86efac,color:#fff
    style RUN4 fill:#15803d,stroke:#86efac,color:#fff
    style DYNAMIC fill:#1e40af,stroke:#93c5fd,color:#fff
    style PROMPT fill:#92400e,stroke:#fbbf24,color:#fff
```

## The Two-Layer Model

```mermaid
flowchart LR
    subgraph "Layer 1: Static (config time)"
        AT["allowed_tools\nAuto-approve list"]
        DT["disallowed_tools\nBlock list"]
        PM["permission_mode\nBase policy"]
    end

    subgraph "Layer 2: Dynamic (runtime)"
        CUT["can_use_tool callback\nInspects actual input"]
        PU["PermissionUpdate\nMutate rules mid-session"]
    end

    AT -.->|"Can't inspect input"| STATIC["Fast, no overhead"]
    CUT -.->|"Sees tool_input dict"| DYNAMIC["Per-call decisions"]

    style AT fill:#15803d,stroke:#86efac,color:#fff
    style DT fill:#b91c1c,stroke:#fca5a5,color:#fff
    style PM fill:#92400e,stroke:#fbbf24,color:#fff
    style CUT fill:#1e40af,stroke:#93c5fd,color:#fff
    style PU fill:#7e22ce,stroke:#c4b5fd,color:#fff
```

## Scoped Tool Rules

```
allowed_tools examples:

"Read"                    → Allow all Read calls
"Bash(npm:*)"             → Allow Bash only for npm commands
"Bash(git:*)"             → Allow Bash only for git commands
"Edit(/app/worktrees/**)" → Allow Edit only in worktrees
"Write|Edit|MultiEdit"    → Allow all write-type tools

Hook matcher patterns (same syntax):
HookMatcher(matcher="Bash")           → Match all Bash calls
HookMatcher(matcher="Write|Edit")     → Match write tools
HookMatcher(matcher=None)             → Match ALL tools
```

## BHappy Permission Stack (8 Layers)

```mermaid
flowchart TD
    L1["1. Capability Matrix\n(worker type → allowed tools)"]
    L2["2. allowed_tools list\n(18 tools per worker)"]
    L3["3. permission_mode: acceptEdits"]
    L4["4. File-scoped settings\n(.claude_settings.json per worktree)"]
    L5["5. Sandbox enabled\n(autoAllowBashIfSandboxed)"]
    L6["6. PreToolUse hooks\n(bash_security_hook)"]
    L7["7. MCP tool filtering\n(18 allowed, 4 excluded)"]
    L8["8. Command exclusions\n(docker, docker-compose)"]

    L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> L8

    style L1 fill:#1e40af,stroke:#93c5fd,color:#fff
    style L2 fill:#15803d,stroke:#86efac,color:#fff
    style L3 fill:#92400e,stroke:#fbbf24,color:#fff
    style L4 fill:#92400e,stroke:#fbbf24,color:#fff
    style L5 fill:#7e22ce,stroke:#c4b5fd,color:#fff
    style L6 fill:#b91c1c,stroke:#fca5a5,color:#fff
    style L7 fill:#b91c1c,stroke:#fca5a5,color:#fff
    style L8 fill:#b91c1c,stroke:#fca5a5,color:#fff
```

## PermissionResult Types

```
PermissionResultAllow(
    updated_input=None,           # Optional: modify the tool input
    updated_permissions=None      # Optional: add/remove permission rules
)

PermissionResultDeny(
    message="Reason shown to Claude",  # Claude sees this and adjusts
    interrupt=False                     # True = stop the entire session
)
```
