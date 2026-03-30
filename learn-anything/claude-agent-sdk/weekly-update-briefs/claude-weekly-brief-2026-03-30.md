# Claude Code & Agent SDK Weekly Update Brief

**Week of March 23-30, 2026**

## Executive Summary

This was an active week for both Claude Code and the Python Agent SDK, with four Claude Code releases (v2.1.84-v2.1.87) and two Agent SDK releases (v0.1.51-v0.1.52). Highlights include a new Windows PowerShell tool preview, major hook and scheduled-task enhancements, expanded AgentDefinition fields, session management improvements, and a new Knowledge Graph Construction cookbook. Research preview features (Auto Mode, Code Review, Computer Use in Cowork) continue to evolve.

---

## Claude Code

Four releases shipped this week. Below are the notable changes per version.

### v2.1.87

**March 29, 2026** | [anthropics/claude-code](https://github.com/anthropics/claude-code)

**Bug Fix**

- Fixed messages in Cowork Dispatch not getting delivered.

### v2.1.86

**March 27, 2026** | [anthropics/claude-code](https://github.com/anthropics/claude-code)

**New Features & Improvements**

- **Session tracing header:** Added `X-Claude-Code-Session-Id` to all API requests, enabling proxy-side session aggregation and debugging.
- **VCS exclusions:** Added `.jj` (Jujutsu) and `.sl` (Sapling) directories to the VCS exclusion list so they are not scanned.
- **Read tool compact format:** Read tool now outputs compact line numbers and deduplicates unchanged re-reads, cutting token overhead on repeated file access.
- **Skill descriptions capped:** Descriptions in the `/skills` listing are capped at 250 characters to reduce context usage.
- **Skills sorted alphabetically:** `/skills` menu now sorts entries alphabetically.
- **Auto mode plan messaging:** Auto mode now displays "unavailable for your plan" when disabled by account restrictions.
- **MCP startup performance:** Startup event-loop stalls for claude.ai MCP connectors reduced by extending keychain cache from 5s to 30s.
- **Prompt cache hit rate:** Improved cache hit rate on Bedrock, Vertex, and Foundry by removing dynamic tool descriptions.
- **Token overhead reduction:** Raw string content for @-file mentions is no longer JSON-escaped, reducing token overhead.
- **Memory filename UX:** Memory filenames in the "Saved N memories" notice now highlight on hover and open on click.

**Bug Fixes**

- Fixed `--resume` failing with `tool_use` ID errors on sessions created before v2.1.85.
- Fixed Write/Edit/Read failing on files outside project root when conditional skills/rules are configured.
- Fixed unnecessary config disk writes on every skill invocation (Windows performance & corruption).
- Fixed out-of-memory crash when using `/feedback` on very long sessions.
- Fixed `--bare` mode dropping MCP tools and silently discarding enqueued messages.
- Fixed OAuth URL copy shortcut (`c`) truncating to ~20 characters instead of the full URL.
- Fixed masked input leaking token start when wrapping on narrow terminals.
- Fixed marketplace plugin scripts failing with "Permission denied" on macOS/Linux since v2.1.83.
- Fixed statusline showing another session's model when running multiple Claude Code instances.
- Fixed scroll not following new messages after wheel scroll or click-to-select.
- Fixed `/plugin uninstall` dialog: `n` now correctly uninstalls while preserving the data directory.
- Fixed regression where pressing Enter after clicking could leave the transcript blank.
- Fixed ultrathink hint lingering after deleting the keyword.
- Fixed memory growth in long sessions from markdown/highlight render caches.
- **[VSCode]** Fixed extension showing "Not responding" during long-running operations.
- **[VSCode]** Fixed Max plan users defaulting to Sonnet after the 8-hour OAuth token refresh.

### v2.1.85

**March 26, 2026** | [anthropics/claude-code](https://github.com/anthropics/claude-code)

**New Features & Improvements**

- **Conditional hooks:** Added an `if` field to hook configs that accepts permission rule syntax (e.g., `Bash(git *)`) to filter exactly when a hook fires, reducing unnecessary hook invocations.
- **Scheduled task timestamps:** Added timestamp markers to transcripts when `/loop` or `CronCreate` tasks fire, making scheduled task history easier to audit.
- **PreToolUse AskUserQuestion:** PreToolUse hooks can now satisfy AskUserQuestion by returning `updatedInput` with `permissionDecision: "allow"`, enabling fully headless automation flows.
- **MCP env vars for headers:** Added `CLAUDE_CODE_MCP_SERVER_NAME` and `CLAUDE_CODE_MCP_SERVER_URL` environment variables available to MCP `headersHelper` scripts.
- **Deep link query expansion:** Deep link queries (`claude-cli://open?q=...`) now support up to 5,000 characters with a scroll-to-review warning.
- **MCP OAuth RFC 9728:** MCP OAuth now follows RFC 9728 Protected Resource Metadata discovery for standards-compliant authentication.
- **Organization policy enforcement:** Plugins blocked by organization policy are now hidden from the marketplace and cannot be installed or enabled by users.
- **OpenTelemetry gating:** `tool_parameters` in OpenTelemetry `tool_result` events are now gated behind `OTEL_LOG_TOOL_DETAILS=1` to reduce log verbosity by default.
- **Scroll performance:** Replaced WASM yoga-layout with a pure TypeScript implementation for substantially improved scroll performance on large transcripts.

**Bug Fixes**

- Fixed `/compact` failing with "context exceeded" on oversized conversations.
- Fixed `/plugin enable/disable` when the plugin install location differs from its settings declaration.
- Fixed `--worktree` exiting with an error in non-git repos before the WorktreeCreate hook fires.
- Fixed `deniedMcpServers` not blocking claude.ai MCP servers.
- Fixed `switch_display` returning "not available" on multi-monitor computer-use setups.
- Fixed crash when `OTEL_*_EXPORTER` is set to `none`.
- Fixed MCP step-up authorization failing when a refresh token already exists.
- Fixed memory leak in remote sessions on interrupted streaming.
- Fixed persistent ECONNRESET errors during edge connection churn.
- Fixed shift+enter and meta+enter being intercepted by typeahead instead of inserting newlines.
- Fixed terminal left in enhanced keyboard mode after exit in Ghostty, Kitty, and WezTerm.
- Fixed Python Agent SDK: `type:'sdk'` MCP servers no longer dropped during startup.
- Improved @-mention file autocomplete performance on large repos.
- Improved PowerShell dangerous command detection.

### v2.1.84

**March 26, 2026** | [anthropics/claude-code](https://github.com/anthropics/claude-code)

**New Features & Improvements**

- **PowerShell tool - Windows preview:** Added an opt-in PowerShell tool for Windows users. Enable via settings to use PowerShell as the shell for Bash tool commands on Windows.
- **TaskCreated hook event:** Added a new `TaskCreated` hook event type, enabling hooks that fire whenever an agent task is created.
- **WorktreeCreate HTTP hooks:** WorktreeCreate hooks now support `type: "http"` hooks in addition to the existing types.
- **allowedChannelPlugins managed setting:** New managed policy setting to control which plugins can use MCP channels.
- **Global system-prompt caching:** System-prompt caching is now applied globally when ToolSearch is enabled, improving prompt cache hit rates.
- **Idle-return prompt:** After 75+ minutes of inactivity, Claude Code now shows a prompt encouraging the user to check in on background work.
- **x-client-request-id header:** Added `x-client-request-id` to API requests for improved server-side request tracing.
- **Deep links open in preferred terminal:** Deep link opens now respect the user's configured preferred terminal.
- **Rules/skills paths as YAML list:** The `paths:` field in rules/skills configs now accepts a YAML list of glob patterns in addition to a single string.
- **MCP tool description cap:** MCP tool descriptions and server instructions are capped at 2KB to reduce context bloat.
- **MCP server deduplication:** Duplicate MCP server definitions are deduplicated at startup; local config takes priority.
- **Background task stuck detection:** Background Bash tasks notify users if stuck waiting for a prompt for ~45 seconds.
- **Large token count display:** Token counts >= 1M are now displayed in compact form (e.g., 1.5m).
- **Stats screenshot speed:** Stats screenshot generation is 16x faster.
- **ANTHROPIC_DEFAULT_*_MODEL_SUPPORTS env vars:** Added `ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTS`, `ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTS`, and `ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTS` env vars.
- **CLAUDE_STREAM_IDLE_TIMEOUT_MS:** Added configurable stream idle timeout (default 90s) via env var.
- **[VSCode]** Rate limit warning: VS Code extension now shows a rate limit warning banner when approaching API limits.

**Bug Fixes**

- Fixed voice push-to-talk character leaking.
- Fixed up/down arrow unresponsiveness.
- Fixed Ctrl+U at line boundaries.
- Fixed mouse events in transcript search.
- Fixed workflow subagents with `--json-schema`.
- Fixed MCP tool/resource cache leak.
- Fixed startup issue with partial-clone repositories.
- Fixed spurious "Not logged in" errors on macOS.
- Fixed cold-start core tool deferral.
- Improved interactive startup (~30ms faster).
- Improved p90 prompt cache rate.
- Improved Remote Control blocking reason messaging.

### Research Preview - Active Features

> The following features are available in research preview and may change:

- **Auto Mode** - Claude decides which actions are safe autonomously; each action is reviewed by AI safeguards for risky behavior and prompt injection.
- **Code Review** (multi-agent PR review) - Multi-agent automated pull request reviews with bug detection, high-level overviews, and inline comments. Available to Teams & Enterprise first.
- **Computer Use in Cowork** - Open files, run dev tools, point/click/navigate the screen with no setup. Available to Pro and Max plan users.
- **Claude Code Security** - Scans codebases for vulnerabilities and suggests targeted patches for human review.
- **MCP Channels** (`--channels`) - Allows MCP servers to push messages into an active Claude Code session.
- **Agent Teams** - Multi-agent collaboration inside Claude Code.

---

## Claude Agent SDK (Python)

Two releases shipped this week, bringing the SDK to v0.1.52 and bundling Claude Code CLI v2.1.87.

### v0.1.52

**March 29, 2026** | [anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python)

**New Features**

- **get_context_usage():** New method on `ClaudeSDKClient` that returns a breakdown of context window usage by category (input, output, cache_read, cache_write, etc.). Matches TypeScript SDK parity.
- **Annotated parameter descriptions:** The `@tool` decorator and `create_sdk_mcp_server` now support `typing.Annotated[type, "description"]` to attach JSON Schema descriptions to individual tool parameters, both in dict-style and TypedDict schemas.
- **ToolPermissionContext fields:** `tool_use_id` and `agent_id` are now exposed in `ToolPermissionContext` for `can_use_tool` callbacks, enabling callers to distinguish between parallel permission requests from different agents.
- **session_id option:** `ClaudeAgentOptions` now accepts a `session_id` field, letting callers specify a custom session ID instead of relying on auto-generation.

**Bug Fixes**

- **connect() string prompt fix:** Fixed `ClaudeSDKClient.connect(prompt="...")` silently dropping the string prompt, which caused `receive_messages()` to hang indefinitely. String prompts are now correctly forwarded to the CLI.
- **Cancel request handling:** Implemented `control_cancel_request` handling so in-flight hook callbacks are properly cancelled when the CLI abandons them, preventing AbortError noise and shutdown desync.

### v0.1.51

**March 27, 2026** | [anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python)

**New Features**

- **Session management:** Added `fork_session()`, `delete_session()`, and offset-based pagination for session listing, giving callers fine-grained control over the session lifecycle.
- **task_budget option:** New `task_budget` field in `ClaudeAgentOptions` for token budget management on long-running tasks.
- **SystemPromptFile:** Added `SystemPromptFile` support, exposing the `--system-prompt-file` CLI flag so callers can supply a system prompt from a file path.
- **AgentDefinition - disallowedTools:** New `list[str]` field to explicitly block named tools from being available in an agent.
- **AgentDefinition - maxTurns:** New `int` field to cap the number of agentic API round-trips in a single run.
- **AgentDefinition - initialPrompt:** New `str` field that, when set, is auto-submitted as the first turn for main-thread agents.
- **AgentDefinition - model field widened:** The `model` field now accepts full model ID strings (not just literal enum values), making it easier to target specific model versions.
- **Forward compatibility:** Dropped/unknown fields on `AssistantMessage` and `ResultMessage` are now preserved rather than silently discarded.

**Bug Fixes**

- Fixed Python 3.10 compatibility: `NotRequired` in TypedDict now imports from `typing_extensions` instead of stdlib `typing`.
- Added missing `errors` field to `ResultMessage`.
- Resolved cross-task cancel scope `RuntimeError` on async generator cleanup.
- Multiple additional fixes for MCP tool input schema conversion, timeouts, and process cleanup.

---

## Claude Cookbooks

One major new cookbook was merged this week, focused on knowledge graph construction using structured outputs.

### New: Knowledge Graph Construction Guide

`capabilities/knowledge_graph_construction.ipynb` - Merged March 27, 2026

A complete end-to-end guide to building knowledge graphs from unstructured text, covering:

- Named Entity Recognition (NER) and relation extraction using structured outputs with Pydantic models.
- Entity resolution with Claude-driven deduplication replacing string-similarity heuristics.
- Graph assembly, visualization, and multi-hop querying.
- Uses `client.messages.parse()` with Pydantic instead of forced `tool_choice`, demonstrating the structured outputs migration path.
- Requires `anthropic` SDK >=0.77.0 for structured outputs support.

---

## Other Repositories

**claude-quickstarts** - No commits in the past week. Last activity was February 5, 2026 (computer-use demo update).

**anthropics/skills** - Two automated claude-api skill sync commits (March 22 and March 25). No new skills or human-authored changes.

---

## Blog Posts & External Content

| Source | Title / Summary | Date |
|--------|----------------|------|
| Anthropic Engineering Blog | **Building Agents with the Claude Agent SDK** - Explains the core agent loop (Gather Context -> Take Action -> Verify Work), best practices for tool design, agentic search, context compaction, and use cases including finance, personal assistants, customer support, and deep research. | Sep 29, 2025 |
| TechCrunch | **Anthropic hands Claude Code more control, but keeps it on a leash** - Coverage of Auto Mode research preview: Claude Code autonomously decides safe actions, with AI safeguards reviewing each action for risky behavior and prompt injection. | Mar 24, 2026 |
| TechCrunch | **Anthropic launches code review tool to check flood of AI-generated code** - Covers the multi-agent Code Review research preview: automated PR review agents for bug detection, high-level summaries, and inline comments. First to Teams & Enterprise. | Mar 9, 2026 |

---

## Key Links

- [Claude Code Releases (GitHub)](https://github.com/anthropics/claude-code/releases)
- [Claude Code Changelog (official docs)](https://docs.anthropic.com/en/docs/claude-code/changelog)
- [Claude Agent SDK Python Releases (GitHub)](https://github.com/anthropics/claude-agent-sdk-python/releases)
- [Claude Agent SDK Python (PyPI)](https://pypi.org/project/claude-agent-sdk/)
- [Claude Cookbooks (GitHub)](https://github.com/anthropics/anthropic-cookbook)
- [Building Agents with the Claude Agent SDK (Blog)](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Agent SDK Overview (Docs)](https://docs.anthropic.com/en/docs/agent-sdk/overview)
