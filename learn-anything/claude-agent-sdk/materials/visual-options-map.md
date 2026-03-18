# ClaudeAgentOptions — Visual Map

## Option Groups

```mermaid
mindmap
  root((ClaudeAgentOptions))
    Tools & MCP
      tools
      allowed_tools
      disallowed_tools
      mcp_servers
    Permissions
      permission_mode
      can_use_tool
    Agent Control
      max_turns
      max_budget_usd
      effort
      model
      fallback_model
    Hooks
      hooks dict
        PreToolUse
        PostToolUse
        Stop
        SubagentStart
        ...7 more
    Subagents
      agents dict
        AgentDefinition
          description
          prompt
          tools
          model
    Sessions
      resume
      fork_session
      continue_conversation
    Context
      system_prompt
      setting_sources
      cwd
      add_dirs
      env
    Output
      include_partial_messages
      output_format
      thinking
    Security
      sandbox
      plugins
```

## Decision Guide: Which Options Do I Need?

```mermaid
flowchart TD
    START["What are you building?"] --> Q1{"One-shot or\ninteractive?"}

    Q1 -->|One-shot| BATCH["Use query()"]
    Q1 -->|Interactive| CLIENT["Use ClaudeSDKClient"]

    BATCH --> Q2{"Custom tools?"}
    Q2 -->|Yes| TOOLS["+ mcp_servers\n+ allowed_tools"]
    Q2 -->|No| MINIMAL["Minimal config:\nprompt + max_turns"]

    CLIENT --> Q3{"Need mid-session\ncontrol?"}
    Q3 -->|Yes| CONTROLS["+ set_model()\n+ interrupt()\n+ set_permission_mode()"]
    Q3 -->|No| BASIC_CLIENT["Basic client config"]

    TOOLS --> Q4{"Production?"}
    MINIMAL --> Q4
    CONTROLS --> Q4
    BASIC_CLIENT --> Q4

    Q4 -->|Yes| PROD["+ max_budget_usd\n+ hooks (security + logging)\n+ permission_mode\n+ sandbox\n+ setting_sources"]
    Q4 -->|No| DEV["+ max_turns (safety)\n+ permission_mode: acceptEdits"]

    PROD --> Q5{"Multi-agent?"}
    DEV --> DONE["Ready!"]

    Q5 -->|Yes| AGENTS["+ agents dict\n+ Agent in allowed_tools\n+ per-agent model/tools"]
    Q5 -->|No| DONE

    AGENTS --> DONE

    style START fill:#4b5563,stroke:#9ca3af,color:#fff
    style DONE fill:#15803d,stroke:#86efac,color:#fff
    style PROD fill:#92400e,stroke:#fbbf24,color:#fff
    style BATCH fill:#1e40af,stroke:#93c5fd,color:#fff
    style CLIENT fill:#7e22ce,stroke:#c4b5fd,color:#fff
```

## Minimal Configs by Use Case

### Batch Script
```python
ClaudeAgentOptions(
    allowed_tools=["Read", "Grep", "Glob"],
    max_turns=10,
    max_budget_usd=0.50,
)
```

### Autonomous Developer (BHappy Worker)
```python
ClaudeAgentOptions(
    model="claude-sonnet-4-6",
    allowed_tools=["Read", "Write", "Edit", "Bash", "Grep", "Glob"],
    permission_mode="acceptEdits",
    setting_sources=["project"],
    plugins=[{"type": "local", "path": "/app/skills/..."}],
    max_turns=500,
    max_budget_usd=5.0,
    hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[bash_security])]},
    sandbox=SandboxSettings(enabled=True),
)
```

### Agent Team Lead (BHappy TeamLauncher)
```python
ClaudeAgentOptions(
    model="claude-opus-4-6",
    system_prompt={"type": "preset", "preset": "claude_code", "append": team_prompt},
    allowed_tools=["Bash", "Read", "Write", "Edit", "Grep", "Glob",
                   "Task", "SendMessage", "TeamCreate", "TeamDelete",
                   "TaskCreate", "TaskList", "TaskUpdate", "TaskGet", "Skill"],
    permission_mode="acceptEdits",
    setting_sources=["project"],
    plugins=[{"type": "local", "path": skills_path}],
    hooks={
        "PreToolUse": [HookMatcher(matcher="Bash", hooks=[bash_security])],
        "PostToolUse": [HookMatcher(matcher="TeamDelete", hooks=[on_team_delete])],
        "SubagentStart": [HookMatcher(hooks=[on_agent_start])],
        "SubagentStop": [HookMatcher(hooks=[on_agent_stop])],
        "Stop": [HookMatcher(hooks=[on_stop])],
    },
    extra_args={"teammate-mode": "in-process"},
    env={"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"},
)
```

### Session Inspector (Read-only)
```python
ClaudeAgentOptions(
    mcp_servers={"sessions": session_query_server},
    allowed_tools=["Read", "Grep", "Glob",
                   "mcp__sessions__search", "mcp__sessions__get_chain"],
    max_turns=20,
    max_budget_usd=1.0,
    output_format={"type": "json_schema", "schema": report_schema},
)
```

## AgentDefinition Fields

```mermaid
flowchart LR
    AD["AgentDefinition"]
    AD --> DESC["description\nWhen to use this agent\n(drives auto-delegation)"]
    AD --> PROMPT["prompt\nSystem prompt\n(role, rules, output format)"]
    AD --> TOOLS_F["tools\nTool whitelist\n(omit = inherit all)"]
    AD --> MODEL["model\nsonnet|opus|haiku|inherit"]
    AD --> SKILLS["skills\nSkill names\n(TS SDK only currently)"]

    style DESC fill:#92400e,stroke:#fbbf24,color:#fff
    style PROMPT fill:#1e40af,stroke:#93c5fd,color:#fff
    style TOOLS_F fill:#15803d,stroke:#86efac,color:#fff
    style MODEL fill:#7e22ce,stroke:#c4b5fd,color:#fff
    style SKILLS fill:#4b5563,stroke:#9ca3af,color:#fff
```
