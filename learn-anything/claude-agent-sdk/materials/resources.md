# Learning Resources

## Official Documentation (Primary)
- [Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [How the Agent Loop Works](https://platform.claude.com/docs/en/agent-sdk/agent-loop) — Messages, turns, context
- [Custom Tools](https://platform.claude.com/docs/en/agent-sdk/custom-tools) — @tool, create_sdk_mcp_server
- [Hooks](https://platform.claude.com/docs/en/agent-sdk/hooks) — PreToolUse, PostToolUse, etc.
- [Permissions](https://platform.claude.com/docs/en/agent-sdk/permissions) — allowed_tools, can_use_tool
- [Subagents](https://platform.claude.com/docs/en/agent-sdk/subagents) — AgentDefinition, context isolation
- [Sessions](https://platform.claude.com/docs/en/agent-sdk/sessions) — Resume, fork, continue
- [Python Reference](https://platform.claude.com/docs/en/agent-sdk/python) — Full API reference
- [Streaming](https://platform.claude.com/docs/en/agent-sdk/streaming-output) — StreamEvent
- [Skills in the SDK](https://platform.claude.com/docs/en/agent-sdk/skills) — Skill testing

## Official Engineering Blog
- [Building agents with the Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk) — Design philosophy
- [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) — Initializer+worker pattern
- [Equipping agents with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

## Source Code (Installed at .venv/lib/python3.14/site-packages/claude_agent_sdk/)
- `__init__.py` — Exports, @tool, create_sdk_mcp_server
- `query.py` — query() implementation
- `client.py` — ClaudeSDKClient
- `types.py` — All types and dataclasses
- `_internal/sessions.py` — Session JSONL parsing, parentUuid chain reconstruction

## BHappy Reference Implementation
- `~/Programming/AgentSandbox/bhappy-skill/src/bhappy/workers/executor.py` — WorkerExecutor
- `~/Programming/AgentSandbox/bhappy-skill/src/bhappy/meta/team_launcher.py` — TeamLauncher (Agent Teams)
- `~/Programming/AgentSandbox/bhappy-skill/src/bhappy/workers/executor_base.py` — Shared logic, security hooks
- `~/Programming/AgentSandbox/bhappy-skill/skills/orchestration/team-lead/` — Team lead agent + skill

## Eval Framework Reference
- [Anthropic skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) — Trigger testing, benchmarks
- `~/Programming/AgentSandbox/agent-hiring-manager/` — Scorecard-driven agent evaluation

## Community
- [Anthropic Discord](https://discord.gg/anthropic) — #agent-sdk channel
- [Claude Code GitHub Issues](https://github.com/anthropics/claude-code/issues)
