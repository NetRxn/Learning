# Anthropic Weekly Brief — March 12, 2026
*Covering: Claude Code · Claude Agent SDK · Cookbooks · Quickstarts · Skills*

---

## 🚨 Major Launch: Claude Code Review (March 9, 2026)

The biggest release this week is **Code Review for Claude Code**, a managed pull-request reviewer that runs multiple Claude agents in parallel, verifies and ranks their findings, then posts comments directly into GitHub.

**How it works:** Multiple specialized agents analyze changed files, adjacent code, and historically similar bugs. A verification layer filters false positives and ranks findings by severity. Larger PRs automatically spawn more agents for deeper analysis.

**Results so far:** In Anthropic's internal data, **54% of PRs now receive substantive comments**, up from 16% with prior approaches. Engineers flagged **fewer than 1% of findings as incorrect** — unusually low for automated review tooling.

**Pricing & availability:** Currently in **research preview for Team and Enterprise customers**. Typical cost is **$15–$25 per review**, with a typical completion time of ~20 minutes.

> Coverage: [TechCrunch](https://techcrunch.com/2026/03/09/anthropic-launches-code-review-tool-to-check-flood-of-ai-generated-code/) · [VentureBeat](https://venturebeat.com/technology/anthropic-rolls-out-code-review-for-claude-code-as-it-sues-over-pentagon) · [DEV Community deep-dive](https://dev.to/umesh_malik/anthropic-code-review-for-claude-code-multi-agent-pr-reviews-pricing-setup-and-limits-3o35)

---

## 🛠 Claude Code — Changelog (March 5–12, 2026)

Four releases this week: **v2.1.71 → v2.1.74**.

### v2.1.74 (March 12)
- **`/context` actionable suggestions** — identifies context-heavy tools, memory bloat, and capacity warnings with specific optimization tips.
- **`autoMemoryDirectory` setting** — configure a custom directory for auto-memory storage.
- **Memory leak fix** — resolved unbounded RSS growth in streaming API response buffers.
- Managed policy `ask` rules can no longer be bypassed by user `allow` rules.
- Full model IDs (e.g., `claude-opus-4-5`) now respected in agent frontmatter.
- MCP OAuth fixes: no longer hangs when callback port is busy; now prompts re-auth after token expiry.
- Voice mode on macOS native binary now correctly requests microphone permission.
- `SessionEnd` hooks timeout is now configurable via `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` (was a hard 1.5s).
- `/plugin install` now works in REPL for marketplace plugins.
- Unknown slash commands no longer silently drop user input.
- RTL text (Hebrew, Arabic) rendering fixed in Windows Terminal.
- `--plugin-dir` local copies now override installed plugins.
- VSCode: fixed delete button for Untitled sessions; improved scroll wheel responsiveness.

### v2.1.73 (March 11)
- **`modelOverrides` setting** — map model picker entries to custom provider model IDs (useful for Bedrock/Vertex/Foundry deployments).
- Actionable guidance for OAuth/SSL certificate errors.
- Fixed freezes and 100% CPU loops from complex bash permission prompts.
- Fixed deadlock when many skill files changed simultaneously.
- Fixed bash output loss with multiple concurrent sessions.
- Subagents with `model: opus/sonnet/haiku` shorthand no longer downgraded on Bedrock/Vertex/Foundry; default Opus on those providers is now **Opus 4.6**.
- Background bash processes now cleaned up when agent exits.
- `/resume` no longer shows the current session in the picker.
- SessionStart hooks no longer fire twice on `--resume`.
- JSON-output hooks no longer inject system-reminder messages.
- Linux sandbox fix: "ripgrep (rg) not found" resolved.
- Linux native modules now work on Amazon Linux 2 (glibc 2.26).
- VSCode: fixed HTTP 400 errors for proxy/Bedrock users with Claude 4.5.
- `/output-style` command deprecated — use `/config` instead.

### v2.1.72 (March 10)
- **`w` key in `/copy`** — writes selection directly to a file (great for SSH workflows).
- **`/plan` description argument** — e.g., `/plan fix the auth bug`.
- **`claude plugins`** — alias for `claude plugin`.
- **`ExitWorktree` tool** — cleanly exits an `EnterWorktree` session.
- **`CLAUDE_CODE_DISABLE_CRON`** — environment variable to suppress cron scheduling mid-session.
- Effort levels simplified to **low / medium / high** with new symbols: ○ ◐ ●.
- Fixed prompt cache invalidation issue that was inflating token costs up to 12×.
- Fixed skill hooks firing twice.
- Fixed `/clear` killing background tasks.
- Fixed worktree isolation issues with Task tool resume.
- VSCode: Shift+Enter now inserts newline (not submit); effort level shown on input border; new `vscode://anthropic.claude-code/open` URI handler.

### v2.1.71 (March 7)
- **`/loop` command** — runs a prompt or slash command on a recurring interval (e.g., `/loop 5m check the deploy`).
- **Cron scheduling tools** — schedule recurring prompts within a session.
- **`voice:pushToTalk`** rebindable keybinding in `keybindings.json`.
- Startup time improved — fixed 5–8s freeze with voice mode and OAuth token refresh.
- Bridge reconnection now completes within seconds after laptop wake.
- VSCode: activity bar spark icon lists all sessions; full markdown document view for plans; native MCP server management dialog via `/mcp`.

---

## 🐍 Claude Agent SDK (Python) — Changelog (March 5–7, 2026)

### v0.1.48 (March 7)
- **Fine-grained tool streaming fix** — `include_partial_messages=True` now correctly delivers `input_json_delta` events. This regression affected v0.1.36–0.1.47 for users without the server-side feature flag.
- Bundles Claude CLI **v2.1.71**.

### v0.1.47 (March 6)
- Bundles Claude CLI **v2.1.70**.

### v0.1.46 (March 5)
- **`list_sessions()` and `get_session_messages()`** — new top-level functions to retrieve past session data.
- **MCP control methods** — `add_mcp_server()`, `remove_mcp_server()`, and typed `McpServerStatus` for runtime MCP management.
- **Typed task messages** — `TaskStarted`, `TaskProgress`, and `TaskNotification` subclasses for better type safety.
- **`ResultMessage.stop_reason`** — inspect why a conversation turn ended.
- **Hook input enhancements** — `agent_id` and `agent_type` fields added to tool-lifecycle hook inputs.
- Fixed: passing a string prompt no longer closes stdin before MCP server initialization.

> PyPI: `pip install claude-agent-sdk==0.1.48`
> Full releases: [github.com/anthropics/claude-agent-sdk-python/releases](https://github.com/anthropics/claude-agent-sdk-python/releases)

---

## 📚 Cookbooks & Quickstarts — Activity (March 5–12, 2026)

**Claude Cookbooks** saw two minor commits:
- **Mar 10:** Removed a broken link (maintenance).
- **Mar 5:** Fixed contextual-embeddings cookbook — context is now prepended to chunks rather than appended, improving embedding quality.

**Claude Quickstarts** had no new commits this week. The most recent significant change (late February) standardized the computer-use demo to use only `EditTool20250728`, removing legacy tool versions.

---

## 🧰 Skills Repo — Activity (March 5–12, 2026)

- **Mar 6:** `skill-creator` no longer requires a separate `ANTHROPIC_API_KEY` for description optimization — it now calls `claude -p` as a subprocess, using the same auth pattern as the rest of the tool. This simplifies setup for users running the skill creator inside a Claude Code session.

---

## 📰 Noteworthy Blogs & External Coverage

| Title | Source |
|---|---|
| [Anthropic Launches Code Review Tool to Check Flood of AI-Generated Code](https://techcrunch.com/2026/03/09/anthropic-launches-code-review-tool-to-check-flood-of-ai-generated-code/) | TechCrunch |
| [Code Review for Claude Code: Multi-Agent PR Reviews, Pricing, Setup](https://dev.to/umesh_malik/anthropic-code-review-for-claude-code-multi-agent-pr-reviews-pricing-setup-and-limits-3o35) | DEV Community |
| [Getting Started with Claude Agent SDK — Python](https://medium.com/@aiablog/getting-started-with-anthropic-claude-agent-sdk-python-826a2216381d) | Medium |
| [Build Production AI Agents with Claude Agent SDK](https://letsdatascience.com/blog/claude-agent-sdk-tutorial) | Let's Data Science |
| [Claude Agent SDK — Promptfoo Integration](https://www.promptfoo.dev/docs/providers/claude-agent-sdk/) | Promptfoo |
| [Claude Code Review: $25 Per Review, Is It Worth It?](https://emelia.io/hub/claude-code-review-test) | Emelia.io |
| [Anthropic's Explosive Start to 2026](https://fazal-sec.medium.com/anthropics-explosive-start-to-2026-everything-claude-has-launched-and-why-it-s-shaking-up-the-668788c2c9de) | Medium |

---

## 🔮 On the Radar

- **Claude 5 ("Fennec")** — Early signals on Vertex AI logs suggest a Sonnet 5-class model with coding performance above Opus 4.6, a "Dev Team" multi-agent collaboration mode, and ~50% lower pricing than current flagships. No official announcement yet.
- **Claude Code Security** (launched Feb 20, research preview) — AI-powered vulnerability detection using multi-stage verification with human approval before patches are applied. Over 500 bugs discovered in production OSS codebases in Anthropic's internal testing.

---

*Brief generated automatically on March 12, 2026.*
