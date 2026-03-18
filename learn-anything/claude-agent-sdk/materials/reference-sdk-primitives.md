# Claude Agent SDK Quick Reference

## Architecture
The SDK wraps the Claude Code CLI as a subprocess. You configure + observe; the CLI manages the agent loop.

## Entry Points

| Entry Point | Mode | Use When |
|---|---|---|
| `query(prompt, options)` | Stateless, one-shot | Scripts, batch, CI/CD, pipelines |
| `ClaudeSDKClient(options)` | Stateful, bidirectional | Interactive UIs, multi-turn, live monitoring |

## query() Pattern
```python
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage, AssistantMessage

async for msg in query(prompt="...", options=ClaudeAgentOptions(...)):
    if isinstance(msg, AssistantMessage):  # per-turn progress
        for block in msg.content:
            if hasattr(block, 'text'): print(block.text)
    if isinstance(msg, ResultMessage):     # always last
        if msg.subtype == "success": print(msg.result)
        print(f"Cost: ${msg.total_cost_usd:.4f}")
```

## ClaudeSDKClient Pattern
```python
async with ClaudeSDKClient(options=opts) as client:
    await client.query("Analyze code")
    async for msg in client.receive_response(): ...
    await client.set_model("claude-haiku-4-5")  # mid-conversation
    await client.query("Summarize")
    async for msg in client.receive_response(): ...
```

## Message Types

| Type | When | Key Fields |
|---|---|---|
| `SystemMessage` | Session init, compaction | subtype ("init", "compact_boundary") |
| `AssistantMessage` | Each turn | content: list[ContentBlock] |
| `UserMessage` | Tool results, inputs | content, parent_tool_use_id |
| `ResultMessage` | Always last | subtype, result, total_cost_usd, session_id |
| `StreamEvent` | If partial messages on | event (raw API delta) |
| `RateLimitEvent` | Rate limit changes | rate_limit_info |
| `TaskStartedMessage` | Subagent spawned | task_id, description |
| `TaskProgressMessage` | Subagent working | usage (tokens, tool_uses) |
| `TaskNotificationMessage` | Subagent done | status, summary |

## Content Blocks
```python
TextBlock(text)           # Text output
ThinkingBlock(thinking, signature)  # Extended thinking
ToolUseBlock(id, name, input)       # Tool call request
ToolResultBlock(tool_use_id, content, is_error)  # Tool result
```

## Custom Tools
```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool("my_tool", "Description", {"param": str})
async def my_tool(args: dict) -> dict:
    return {"content": [{"type": "text", "text": "result"}]}
    # Error: return {"content": [...], "is_error": True}

server = create_sdk_mcp_server("my-server", tools=[my_tool])
# Tool name in allowed_tools: "mcp__my-server__my_tool"
```

## ClaudeAgentOptions Key Fields

| Field | Purpose | Example |
|---|---|---|
| `allowed_tools` | Static whitelist (auto-approve) | `["Read", "Bash"]` |
| `disallowed_tools` | Static blocklist | `["WebSearch"]` |
| `can_use_tool` | Dynamic callback | `async (name, input, ctx) -> PermissionResult` |
| `mcp_servers` | Custom tool servers | `{"db": server}` |
| `permission_mode` | Base mode | `"default"`, `"acceptEdits"`, `"bypassPermissions"` |
| `max_turns` | Safety limit | `30` |
| `max_budget_usd` | Cost cap | `2.0` |
| `model` | Model selection | `"claude-sonnet-4-6"` |
| `fallback_model` | Auto failover | `"claude-haiku-4-5"` |
| `hooks` | Programmatic hooks | `{"PreToolUse": [HookMatcher(...)]}` |
| `agents` | Subagent definitions | `{"reviewer": AgentDefinition(...)}` |
| `setting_sources` | Load CLAUDE.md/skills | `["project"]` |
| `include_partial_messages` | Enable streaming | `True` |
| `resume` | Resume session | `"session-uuid"` |
| `fork_session` | Fork on resume | `True` |
| `effort` | Reasoning depth | `"low"`, `"high"`, `"max"` |
| `thinking` | Visible chain-of-thought | `{"type": "enabled", "budget_tokens": 10000}` |
| `output_format` | Structured output | `{"type": "json_schema", "schema": {...}}` |
| `sandbox` | Bash isolation | `SandboxSettings(enabled=True)` |

## ResultMessage.subtype Values

| Subtype | Meaning | `result` present? |
|---|---|---|
| `success` | Task completed | Yes |
| `error_max_turns` | Hit turn limit | No |
| `error_max_budget_usd` | Hit budget | No |
| `error_during_execution` | Runtime/API error | No |
| `error_max_structured_output_retries` | Schema validation failed | No |

## Hook Pattern
```python
from claude_agent_sdk import HookMatcher

async def my_hook(input, tool_use_id, ctx):
    if input["tool_name"] == "Bash" and "rm" in input["tool_input"]["command"]:
        return {"decision": "block", "reason": "Destructive command"}
    return {"continue_": True}  # note: continue_ with underscore

options = ClaudeAgentOptions(
    hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[my_hook])]}
)
```

## Session Management
```python
from claude_agent_sdk import list_sessions, get_session_messages

sessions = list_sessions(directory="/path/to/project")
msgs = get_session_messages(sessions[0].session_id)

# Resume: options = ClaudeAgentOptions(resume="session-uuid")
# Fork:   options = ClaudeAgentOptions(resume="session-uuid", fork_session=True)
```

Sessions stored as JSONL in `~/.claude/projects/<sanitized-cwd>/<uuid>.jsonl`. Conversation linked via `parentUuid` — tree structure supporting branching.

## Common Mistakes

1. **String prompt with custom MCP tools** → must use async generator with query()
2. **Wrong tool name format** → must be `mcp__servername__toolname` in allowed_tools
3. **Reading result before checking subtype** → result is None on error subtypes
4. **Confusing StreamEvent with AssistantMessage** → StreamEvent = partial deltas, AssistantMessage = complete turn
5. **Granting all tools to subagents** → wastes context, specify tools on AgentDefinition
