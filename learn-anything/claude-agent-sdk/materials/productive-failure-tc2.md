# Productive Failure: Permissions Architecture

**Target Vertex:** vertex-sdk-permissions
**Naive Theory to Surface:** "allowed_tools is session-scoped and can_use_tool is for subagents"
**Actual Model:** allowed_tools is a static whitelist; can_use_tool is a dynamic runtime callback that inspects actual tool input

---

## The Challenge

You're building the session storage agent from TC1. Now you need to secure it for production in BHappy. Here are your requirements:

1. The agent can always read any JSONL file (Read tool)
2. The agent can query Postgres via your custom MCP tools
3. The agent can use Bash, but ONLY for `git log` and `git show` commands — nothing else
4. If the agent tries to write to any path outside the worktree, it should be blocked with an explanation
5. The agent should be able to request expanded permissions at runtime if it encounters a file it needs

**Design the permission configuration for this agent.** Use any combination of SDK features you think are appropriate. Write the ClaudeAgentOptions configuration.

**Rules during this phase:**
- No hints will be given
- Try multiple approaches if your first doesn't work
- Think out loud about your reasoning

---

## Expected Learner Approaches

**Approach A (naive — the misconception):** Try to use allowed_tools for the static stuff and assume can_use_tool only applies to subagents. May try to configure different permission sets for the main agent vs subagents.

**Approach B (partial):** Use allowed_tools correctly for Read and MCP tools, but try to use permission_mode to handle Bash restrictions. Gets stuck because permission_mode is too coarse — it's all-or-nothing for tool categories.

**Approach C (closer):** Use allowed_tools for Read and MCP, but struggle with Bash because allowed_tools can't inspect command content. May try scoped rules like `Bash(git:*)`.

**Approach D (correct direction):** Realize that input-dependent decisions require a callback. Start designing a can_use_tool function. May not know the exact PermissionResult types.

---

## Consolidation Instruction (delivered AFTER struggle)

### The Two-Layer Permission Model

The SDK has **two fundamentally different mechanisms** that work together:

**Layer 1: Static Configuration (compile-time decisions)**
```python
allowed_tools=["Read", "Grep", "Glob",
               "mcp__session-storage__read_session_jsonl",
               "mcp__session-storage__ingest_to_postgres"]
```
These tools are auto-approved. No callback, no prompting. Use for tools where you don't need to inspect the input.

**Layer 2: Dynamic Callback (runtime decisions)**
```python
async def can_use(name: str, input: dict, ctx: ToolPermissionContext) -> PermissionResult:
    if name == "Bash":
        cmd = input.get("command", "")
        if cmd.startswith("git log") or cmd.startswith("git show"):
            return PermissionResultAllow()
        return PermissionResultDeny(message=f"Only git log/show allowed. Blocked: {cmd}")

    if name in ("Write", "Edit"):
        path = input.get("file_path", "")
        if not path.startswith("/app/worktrees/"):
            return PermissionResultDeny(message=f"Write outside worktree blocked: {path}")
        return PermissionResultAllow()

    # Unknown tools — deny by default
    return PermissionResultDeny(message=f"Tool {name} not authorized")
```

**Why the naive theory breaks down:** Both layers apply to the SAME agent (and its subagents inherit the same rules). The distinction isn't session vs subagent — it's **"do I need to see the input before deciding?"**

- Don't need input → `allowed_tools` (static, fast)
- Need to inspect input → `can_use_tool` (dynamic, per-call)
- Need to block entirely → `disallowed_tools` (static blocklist)
- Need runtime rule changes → `PermissionUpdate` (mutate rules during session)

### The Complete Configuration

```python
options = ClaudeAgentOptions(
    # Static: always allow these without inspection
    allowed_tools=[
        "Read", "Grep", "Glob",
        "mcp__session-storage__read_session_jsonl",
        "mcp__session-storage__ingest_to_postgres"
    ],
    # Static: never allow these
    disallowed_tools=["WebFetch", "WebSearch"],
    # Dynamic: inspect input before deciding
    can_use_tool=can_use,
    # Base mode
    permission_mode="default",
    # MCP servers
    mcp_servers={"session-storage": session_tools},
)
```

---

## Transfer Problem (post-consolidation)

**New scenario:** You're now configuring permissions for BHappy's TeamLauncher. The team lead agent needs:
- Full read access to the codebase
- Bash access, but only for npm/pytest commands — no file system manipulation
- Write access only to files within the feature's worktree
- The ability to dynamically grant a teammate Write access to a specific test file

Design the permission configuration. Which features would you use for each requirement?
