# Anthropic Weekly Brief — March 22, 2026
*Covering: Claude Code · Claude Agent SDK · Platform API · Cookbooks · Skills*
*Period: March 13 – 22, 2026*

---

## 🌟 Top Headlines This Week

1. **Claude Code Channels (Research Preview)** — MCP servers can now push messages into your Claude Code session from anywhere (Telegram, Discord, phone).
2. **MCP Elicitation** — MCP servers can request structured input from users mid-task via interactive dialogs.
3. **VSCode Remote Control** — Bridge any Claude Code session to `claude.ai/code` to continue from a phone or browser.
4. **Opus 4.6 token ceiling doubled** — Default max output raised to 64k tokens; upper bound is now 128k.
5. **Extended thinking `display` control (API)** — New field lets you suppress thinking content from responses without breaking multi-turn continuity.
6. **1M-token context GA** — No beta header needed for Opus 4.6 and Sonnet 4.6.
7. **Agent SDK v0.1.49–0.1.50** — Session tagging/renaming, typed `RateLimitEvent`, expanded `AgentDefinition`, per-turn usage tracking.
8. **New Cookbooks** — SRE incident-response agent and OpenAI → Claude Agent SDK migration guide.

---

## 🛠 Claude Code — Changelog (v2.1.74 → v2.1.81)

### v2.1.75 — March 13

**Features**
- **1M context window default for Opus 4.6** — Max, Team, and Enterprise plans now use 1M tokens by default with no extra config.
- **`/color` command** — Set a custom color for the prompt bar of the current session (handy when running multiple parallel sessions).
- **Session name on prompt bar** — `/rename` now also displays the session name in the prompt bar.
- **Memory file timestamps** — Last-modified timestamps added to memory files for audit visibility.
- **Hook source in permission prompts** — Prompts now identify which hook is requesting a permission.
- **Async hook completion messages suppressed by default** — Add `--verbose` to see them.

**Bug Fixes**
- Voice mode activation fixed on fresh installs.
- Model name in header now updates after `/model` switch.
- Fixed Bash tool mangling `!` in piped commands.
- Managed-disabled plugins no longer show in `/plugin` Installed tab.
- Token estimation no longer over-counts thinking and `tool_use` blocks.
- Fixed `/resume` losing session names.

**Breaking Change**
- Removed deprecated Windows managed settings fallback.

---

### v2.1.76 — March 14

**Features**
- **MCP Elicitation support** — MCP servers can now request structured input mid-task via an interactive dialog (form fields or browser URL). Comes with two new hook events: `Elicitation` and `ElicitationResult`.
- **`-n` / `--name <name>` CLI flag** — Set a display name for a session at startup without using a slash command.
- **`worktree.sparsePaths`** — Configure git sparse-checkout paths for large monorepos to limit which files Claude sees.
- **`PostCompact` hook** — Fires immediately after any compaction event; useful for re-injecting context.
- **`/effort` slash command** — Set model effort level mid-session.
- **Session quality survey** — Enterprise admins can configure a sample rate via `feedbackSurveyRate`.

**Bug Fixes**
- Fixed deferred tools losing input schemas after compaction.
- Fixed slash commands showing "Unknown skill."
- Fixed plan mode asking for re-approval after acceptance.
- Fixed voice mode swallowing keypresses during dialogs.
- Fixed auto-compaction retrying indefinitely.

---

### v2.1.77 — March 17 (morning release)

**Features**
- **Opus 4.6 max output raised to 64k** — Default maximum output token limit for Opus 4.6 increased from 32k to 64k; upper bound for Opus 4.6 and Sonnet 4.6 raised to 128k.
- **`allowRead` sandbox setting** — Re-allow specific reads within a `denyRead` region (fine-grained sandbox control).
- **`/copy N`** — Copy the Nth most-recent assistant response (previously only copied the latest).
- **Faster macOS startup** — Keychain credential reads now happen in parallel (~60ms improvement).
- **45% faster `--resume` on fork-heavy sessions** — ~100–150MB less peak memory when resuming large branched sessions.
- **Sessions auto-named from plan content** — When a plan is accepted, the session adopts the plan's heading as its name.
- **`SendMessage` auto-resumes stopped agents** — Background agents that have stopped are automatically resumed when you send them a message.
- **Renamed `/fork` to `/branch`** — `/fork` still works as an alias.

**Breaking Change**
- The `Agent` tool no longer accepts a `resume` parameter — use `SendMessage({to: agentId})` instead.

**Bug Fixes**
- Fixed "Always Allow" on compound bash commands only saving a partial rule.
- Fixed auto-updater starting overlapping downloads (memory leak).
- Fixed `--resume` silently truncating recent history.
- Fixed `PreToolUse` hooks returning `"allow"` bypassing `deny` rules (security fix).
- Fixed Write tool converting line endings on CRLF files.
- Fixed memory growth in long-running sessions.

---

### v2.1.78 — March 17 (afternoon release)

**Features**
- **`StopFailure` hook event** — Fires when a turn ends due to an API error (not just clean exits), letting hooks handle cleanup or alerting.
- **`${CLAUDE_PLUGIN_DATA}` variable** — Plugins can now store and read persistent state across sessions using this env variable.
- **Plugin-shipped agent frontmatter** — `effort`, `maxTurns`, and `disallowedTools` are now supported in agent frontmatter within plugins.
- **Line-by-line response streaming** — Responses now stream line by line as they are generated (smoother UX; disabled on Windows/WSL in v2.1.81).
- **`ANTHROPIC_CUSTOM_MODEL_OPTION` env var** — Add a custom model entry to the model picker without editing config files.

**Security Fix**
- Previously, if sandbox dependencies (e.g., `bwrap`) were missing, the sandbox would silently disable. Now shows a visible warning.

**Bug Fixes**
- Fixed `cc log` and `--resume` silently truncating sessions larger than 5 MB.
- Fixed infinite loop when API errors triggered stop hooks.
- Fixed `deny: ["mcp__servername"]` not actually removing MCP server tools.
- Fixed `.git` and `.claude` being writable without prompt in `bypassPermissions` mode.
- Voice mode: Fixed modifier-combo push-to-talk, fixed WSL2/WSLg support.
- Fixed `--worktree` flag not loading skills and hooks.

---

### v2.1.79 — March 18

**Features**
- **`claude auth login --console`** — Log in via the Anthropic Console (API billing) instead of OAuth, useful for non-interactive/enterprise setups.
- **"Show turn duration" toggle** — Available in `/config`; displays how long each turn took.
- **Multi-path `CLAUDE_CODE_PLUGIN_SEED_DIR`** — Now accepts multiple seed directories separated by your OS path delimiter.
- **[VSCode] `/remote-control`** — Bridge your running VSCode session to `claude.ai/code`, so you can continue from a phone or another browser tab.
- **[VSCode] AI-generated session tab titles** — Session tabs now receive auto-generated titles based on the first message.
- **~18MB startup memory improvement** — Across all startup scenarios.

**Bug Fixes**
- Fixed `claude -p` hanging when spawned as a subprocess without explicit stdin.
- Fixed Ctrl+C not working in `-p` (print) mode.
- Fixed `/btw` returning the main agent's output instead of answering the side question.
- Fixed voice mode not activating on startup with `voiceEnabled: true`.
- Fixed enterprise users unable to retry on rate limit (429) errors.
- Fixed `SessionEnd` hooks not firing when using interactive `/resume`.

---

### v2.1.80 — March 19

**Features**
- **`rate_limits` field in statusline scripts** — Statusline hooks can now display Claude.ai rate limit usage (remaining tokens/requests).
- **`source: 'settings'` plugin marketplace** — Declare plugin entries directly inline in `settings.json` rather than requiring a separate marketplace URL.
- **`effort` frontmatter for skills and slash commands** — Skills can specify their preferred effort level in frontmatter.
- **CLI tool usage detection in plugin tips** — Claude now detects which CLI tools a plugin uses and surfaces tips accordingly.
- **`--channels` (Research Preview)** — MCP servers can push messages into your Claude Code session from outside the terminal. Enables Telegram/Discord bots, phone-based prompting, and other external-trigger workflows. *See deep-dive below.*
- **~80MB startup memory reduction** — On repositories with 250k+ files.

**Bug Fixes**
- Fixed `--resume` dropping parallel tool results (was breaking multi-tool session restores).
- Fixed voice mode WebSocket failures caused by Cloudflare bot detection.
- Fixed 400 errors when using fine-grained tool streaming through API proxies, Bedrock, or Vertex.
- Fixed `/remote-control` appearing in gateway deployments where it cannot function.

---

### v2.1.81 — March 20

**Features**
- **`--bare` flag** — When using scripted `-p` calls, `--bare` skips hooks, LSP initialization, plugin sync, and skill directory walks. Useful for fast headless automation where those layers aren't needed.
- **`--channels` permission relay** — When Channels are active, tool approval prompts can be forwarded to the channel (e.g., your phone) for approval instead of requiring terminal interaction.
- **Worktree session restore** — Resuming a session that was in a git worktree now automatically switches back to that worktree.
- **MCP OAuth: CIMD / SEP-991 support** — Updated MCP OAuth flow now supports the Client ID Metadata Document standard.
- **Collapsible MCP tool calls** — `read` and `search` MCP tool calls now collapse to a single summary line ("Queried `{server}`"); expand with Ctrl+O.
- **`!` bash mode discoverability** — Claude proactively suggests `!` mode when you need to run an interactive shell command.
- **Ref-tracked plugin freshness** — Plugins using `ref:` in their config now re-clone on every load (previously could serve stale code).
- **Plan mode** — "Clear context" option now hidden by default (restore with `"showClearContextOnPlanAccept": true`).

**Bug Fixes**
- Fixed multiple concurrent sessions requiring repeated re-authentication after one session refreshes OAuth tokens.
- Fixed voice mode silently swallowing retry failures.
- Fixed voice mode audio not recovering after server drops WebSocket connection.
- Fixed `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` not suppressing structured-outputs beta header.
- Fixed plugin hooks blocking prompt submission when plugin directory is deleted mid-session.
- Fixed race condition where background agent task output could hang indefinitely.
- Fixed terminal tab title not updating with auto-generated session description.
- Fixed crash on Node.js 18.
- [VSCode] Fixed Windows PATH inheritance for Bash tool when using Git Bash.

---

## 🔬 Feature Deep-Dives

### Claude Code Channels (Research Preview)
*Introduced in v2.1.80, extended in v2.1.81*

Channels is a new MCP-based mechanism that lets external systems push messages *into* a running Claude Code session. Instead of typing at your terminal, you can send prompts from Telegram, Discord, a web UI, or any system that can talk to your channel MCP server.

**How it works:**
1. You run (or install) a Channel MCP server — e.g., a Telegram bot MCP server.
2. Claude Code connects to it as a standard MCP server.
3. Incoming messages on the channel are injected into Claude's context as if you typed them.
4. Tool approval prompts can be forwarded back out to the channel for remote approval.

**Practical use cases:**
- Kick off a long coding task from your phone, monitor and approve tool calls via Telegram.
- Connect a Discord bot so team members can trigger Claude Code sessions without terminal access.
- Integrate with CI/CD webhooks to trigger Claude-powered automation.

**Setup:** Pass `--channels` when starting Claude Code or configure via settings. The permission relay in v2.1.81 adds the ability to approve tool calls remotely.

---

### MCP Elicitation (v2.1.76)

MCP servers can now pause mid-task and request structured user input via an interactive dialog — without aborting the workflow. This enables patterns like:

- An MCP server surfacing a web form to collect OAuth credentials.
- A database MCP requesting a confirmation before a destructive operation.
- A tool asking for clarification data (e.g., which environment to target).

Two new hooks (`Elicitation`, `ElicitationResult`) let you intercept, customize, or log these interactions.

---

### VSCode Remote Control (v2.1.79)

New `/remote-control` command in the VSCode extension bridges your local Claude Code session to `claude.ai/code`. After running the command, you can:
- Continue the session from a phone browser.
- Hand off a session to a colleague.
- Monitor progress while away from your development machine.

Session titles in Remote Control sessions now auto-derive from the first prompt and refresh after your third message.

---

## 📡 Claude Platform / API Updates

### March 18 — Models API: Capability Fields
`GET /v1/models` and `GET /v1/models/{model_id}` now return `max_input_tokens`, `max_tokens`, and a `capabilities` object. You can now programmatically query what each model supports instead of hardcoding limits.

### March 16 — Extended Thinking: `display` Field
New `thinking.display` parameter for extended thinking responses:
- Set `thinking.display: "omitted"` to receive thinking blocks with an empty `thinking` field.
- The `signature` is preserved for multi-turn continuity — billing is unchanged.
- Useful when you want to reduce response payload size without breaking conversation state.

### March 13 — 1M Token Context Window: Generally Available
- **No beta header required** for Claude Opus 4.6 and Sonnet 4.6.
- Standard account rate limits now apply across all context lengths (dedicated 1M rate limits removed).
- Media limit raised from **100 to 600 images or PDF pages** per request when using the 1M context window.
- Sonnet 4.5 and Sonnet 4 retain beta access to 1M context.

---

## 🐍 Claude Agent SDK (Python) — v0.1.48 → v0.1.50

### v0.1.49 — March 14–16

**`AgentDefinition` expansion** — Three new fields now available when defining agents programmatically:
```python
AgentDefinition(
    skills=["pptx", "xlsx"],          # skills to load
    memory="project",                  # "user" | "project" | "local"
    mcpServers=["server-name", {...}]  # MCP servers (camelCase, wire format)
)
```

**Per-turn usage tracking on `AssistantMessage`:**
```python
msg.usage  # dict with input_tokens, output_tokens,
           # cache_read_input_tokens, cache_creation_input_tokens
```

**Session management additions:**
- `tag_session(session_id, tag, directory=None)` — Tag a session with a searchable label. Most recent tag wins; `None` clears the tag. Unicode is sanitized for CLI compatibility.
- `rename_session(session_id, title, directory=None)` — Rename a session title atomically.

**Typed `RateLimitEvent`:**
```python
# New message type streamed when rate limits are hit
class RateLimitEvent:
    rate_limit_info: RateLimitInfo  # status, reset times, utilization, overage
    uuid: str
    session_id: str

class RateLimitInfo:
    status: Literal["allowed", "allowed_warning", "rejected"]
    # + reset_at, utilization, overage details
```

**Bug Fixes:**
- `CLAUDE_CODE_ENTRYPOINT` now acts as a default (overridable by callers), matching TypeScript SDK behavior.
- Fine-grained tool streaming regression (v0.1.36–0.1.47) resolved upstream — env-var workaround from v0.1.48 reverted.

---

### v0.1.50 — March 20

**`get_session_info()` and enhanced `SDKSessionInfo`:**
```python
from claude_agent_sdk import get_session_info

info = get_session_info(session_id="abc123", directory="/path/to/project")
print(info.tag)         # session tag (new)
print(info.created_at)  # ISO timestamp (new)
print(info.file_size)   # optional (forward-compat)
```

**Infrastructure:**
- Bundled CLI bumped to v2.1.81.
- PyPI publish workflow now handles partial-upload failures (`--skip-existing`, pre-flight quota checks, sdist-first upload order).
- Daily PyPI storage quota monitoring added to CI (currently 10.21 GiB / 50 GiB).
- macOS x86_64 wheel added to published matrix.

---

## 📚 Cookbooks — New Notebooks

Two new notebooks added to `anthropics/claude-cookbooks` in the `claude_agent_sdk/` directory (merged March 18):

### 03 — The Site Reliability Agent
A production-grade SRE incident-response agent featuring:
- **Prometheus integration** — queries PromQL metrics in real time.
- **Docker service management** — restart/inspect containers.
- **Safety hooks** — validates write operations before execution.
- **Full incident lifecycle** — detect → diagnose → mitigate → document.
- Optional integrations: PagerDuty alerting, Confluence runbook retrieval.

### 04 — Migrating from OpenAI Agents SDK
A hands-on migration guide mapping OpenAI Agents SDK primitives to Claude Agent SDK equivalents:

| OpenAI Concept | Claude Agent SDK Equivalent |
|---|---|
| Tools | MCP servers / built-in tools |
| Guardrails | Hooks (PreToolUse, PostToolUse) |
| Sessions | `ClaudeCodeSession` / `query()` |
| Handoffs | `Agent` tool + `SendMessage` |

Includes a worked example: an expense-approval agent converted from OpenAI to Claude. Requires `openai-agents==0.9.3` for comparison runs (Python < 3.13).

---

## 🧠 Skills Repo

- **`claude-api` skill auto-synced** (March 22) — The `claude-api` skill covering the Messages API, tool use, structured outputs, Agent SDK patterns, Batches/Files API, and model selection guidance was auto-synced. Supports Python, TypeScript, Java, Go, Ruby, C#, PHP, and cURL examples.
- **`skill-creator` improvement** (March 6) — The description optimizer in `skill-creator` no longer requires a separate `ANTHROPIC_API_KEY`. It now calls `claude -p` as a subprocess (same auth as the rest of Claude Code), stripping `CLAUDECODE` env to allow nesting.

---

## 🔗 Key Resources

- [Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- [Claude Code Docs](https://code.claude.com/docs/en/changelog)
- [Agent SDK Python Releases](https://github.com/anthropics/claude-agent-sdk-python/releases)
- [Agent SDK Docs](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Platform API Release Notes](https://platform.claude.com/docs/en/release-notes/overview)
- [Claude Cookbooks](https://github.com/anthropics/claude-cookbooks)
- [Skills Repo](https://github.com/anthropics/skills)
- [Claude Code Channels explained](https://www.aibase.com/news/26401) *(third-party coverage)*
- [DataCamp Agent SDK tutorial](https://www.datacamp.com/tutorial/how-to-use-claude-agent-sdk)
- [Anthropic engineering post: Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

---

*Brief generated: March 22, 2026 | Next edition: ~March 29, 2026*
