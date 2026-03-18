# ~/.claude Complete Data Model Reference

## Directory Overview

```
~/.claude/
├── projects/                    # Session transcripts (per-project)
│   └── <sanitized-cwd>/
│       ├── <session-uuid>.jsonl           # Main session transcript
│       └── <session-uuid>/                # Session artifacts directory
│           ├── subagents/                 # Subagent transcripts
│           │   ├── agent-<agent-id>.jsonl # Full subagent transcript
│           │   └── agent-acompact-<id>.jsonl  # Compacted subagent
│           └── tool-results/              # Large tool outputs
│               └── toolu_<tool-use-id>.txt/.json
├── plans/                       # Plan files (markdown, by session slug)
├── tasks/                       # TaskCreate items (per session UUID)
├── todos/                       # TodoWrite items (per session+agent)
├── teams/                       # Agent Teams config + inboxes
├── debug/                       # Debug logs (per session UUID)
├── file-history/                # File checkpoints (per session UUID)
├── sessions/                    # Active session PID mapping
├── session-env/                 # Per-session environment (dirs, mostly empty)
├── shell-snapshots/             # Zsh state snapshots
├── ide/                         # IDE lock files (PID → workspace mapping)
├── history.jsonl                # Global prompt history
├── settings.json                # User settings
├── telemetry/                   # Anthropic telemetry events
├── statsig/                     # Feature flags cache
├── backups/                     # Backup storage
└── security_warnings_state_*.json  # Per-session security state
```

---

## 1. Session Transcripts (projects/)

**Path pattern:** `~/.claude/projects/<sanitized-cwd>/<session-uuid>.jsonl`

**Sanitization:** CWD path → replace non-alphanumeric with `-`, truncate to 200 chars + hash suffix if longer.

**Volume:** 77 project directories observed. Each can contain hundreds of sessions.

### JSONL Entry Types

Every line is a JSON object. The `type` field discriminates:

| Type | Purpose | In main chain? | Key fields |
|---|---|---|---|
| `user` | User input or tool results | Yes (unless filtered) | uuid, parentUuid, sessionId, message, slug |
| `assistant` | Claude response | Yes (unless filtered) | uuid, parentUuid, sessionId, message, model |
| `system` | Lifecycle events | Depends on subtype | subtype, data |
| `file-history-snapshot` | File checkpoint | No | messageId, snapshot.trackedFileBackups |
| `custom-title` | Session rename | No (metadata) | customTitle, sessionId |
| `tag` | Session tag | No (metadata) | tag, sessionId |

### Entry Filtering Flags

| Flag | Meaning | Effect on chain reconstruction |
|---|---|---|
| `isSidechain: true` | Subagent conversation in parent | Excluded from main chain |
| `isMeta: true` | Internal metadata | Excluded from visible messages |
| `isCompactSummary: true` | Post-compaction summary | Included (replaces earlier messages) |
| `teamName: "..."` | Agent team entry | Excluded from main chain |
| `tool_result` in message | Sidechain tool result | Excluded from main chain |

### Key Entry Fields

```json
{
  "type": "user",
  "uuid": "3ec08949-...",
  "parentUuid": "1379b7ae-...",
  "sessionId": "a88721ea-...",
  "slug": "breezy-zooming-moon",
  "version": "2.1.63",
  "cwd": "/path/to/project",
  "gitBranch": "main",
  "timestamp": "2026-03-03T18:02:37.969Z",
  "isSidechain": false,
  "userType": "external",
  "message": {"role": "user", "content": "..."}
}
```

**Critical linking fields:**
- `uuid` / `parentUuid` — conversation DAG (tree structure)
- `sessionId` — may differ from filename UUID (resumed/forked sessions)
- `slug` — human-readable name, links to `plans/<slug>.md`
- `logicalParentUuid` — DO NOT follow for chain reconstruction (post-compaction reference only)

### Chain Reconstruction Algorithm

1. Parse all JSONL entries with uuid
2. Find leaf: latest terminal main-chain entry (not sidechain, not team, not meta)
3. Walk backward via `parentUuid` to root
4. Return chronological order (root → leaf)

### Session Artifact Directories

Each session can have a companion directory `<session-uuid>/`:

```
<session-uuid>/
├── subagents/
│   ├── agent-<agent-id>.jsonl      # Full subagent transcript
│   └── agent-acompact-<hash>.jsonl # Compacted subagent transcripts
└── tool-results/
    └── toolu_<tool-use-id>.txt     # Large tool outputs (grep results, file contents)
```

**179 sessions observed with subdirectories.** Subagent transcripts here are the FULL versions (every tool call, every reasoning step). The parent JSONL only has sidechain summaries.

---

## 2. Plans (plans/)

**Path pattern:** `~/.claude/plans/<session-slug>.md` (main agent plan)
**Agent plans:** `~/.claude/plans/<session-slug>-agent-<agent-id>.md`

**Volume:** 59 files total. 27 unique sessions with plans. 31 are agent plans.
**Sizes:** Range from 4KB to 93KB. Average ~25KB.

**Format:** Markdown with structured headers. Typically:
```markdown
# Plan Title

## Context
...

## Changes needed
### File: path/to/file.py
...
```

**Linking:** The `slug` field appears in JSONL entries. Plans are linked by slug, NOT by session UUID. To join:
- JSONL entry has `"slug": "breezy-zooming-moon"`
- Plan file is `plans/breezy-zooming-moon.md`
- Agent plan is `plans/breezy-zooming-moon-agent-<agent-id>.md`

**No hook or message provides plan_path.** You must reconstruct from slug.

---

## 3. Tasks (tasks/)

**Path pattern:** `~/.claude/tasks/<session-uuid>/<N>.json`

**Volume:** 93 session directories. Max 20 tasks in a single session.

**Format:** Individual numbered JSON files:
```json
{
  "id": "1",
  "subject": "Fix drug class chart label overlap",
  "description": "Long ATC Level 3 names overlap...",
  "activeForm": "Fixing drug class chart layout",
  "status": "completed",
  "blocks": [],
  "blockedBy": []
}
```

**Key fields:**
- `id` — sequential number (string)
- `subject` — task title
- `description` — full description
- `status` — pending/in_progress/completed
- `blocks` / `blockedBy` — dependency graph (task IDs)
- `activeForm` — what the agent is currently doing

**Linking:** Directory name = session UUID. Created by TaskCreate tool.

---

## 4. Todos (todos/)

**Path pattern:** `~/.claude/todos/<session-uuid>-agent-<agent-id>.json` or `<session-uuid>.json`

**Volume:** 19,892 files. 6 non-agent (session-level), rest are per-agent.

**Format:** JSON array of todo items:
```json
[
  {"content": "Execute clinical-pharmacology-agent...", "status": "completed", "id": "1"},
  {"content": "Execute safety-warnings-agent...", "status": "completed", "id": "2"}
]
```

**Linking:** Filename contains session UUID and agent ID. Created by TodoWrite tool.

---

## 5. Teams (teams/)

**Path pattern:** `~/.claude/teams/<team-name>/`

**Volume:** 3 teams observed (batch-worktree, command-center, default).

**Structure:**
```
<team-name>/
├── config.json    # Team configuration
└── inboxes/
    └── <agent-name>.json  # Message inbox per agent
```

**config.json:**
```json
{
  "name": "batch-worktree",
  "description": "Implement shared worktree per batch",
  "createdAt": 1770774687122,
  "leadAgentId": "team-lead@batch-worktree",
  "leadSessionId": "07a27da8-6f0e-478f-b888-75a1d58f4a71",
  "members": [
    {
      "agentId": "team-lead@batch-worktree",
      "name": "team-lead",
      "agentType": "team-lead",
      "model": "claude-opus-4-6",
      "joinedAt": 1770774687122,
      "cwd": "/path/to/project",
      "subscriptions": []
    }
  ]
}
```

**Inbox messages:** JSON array of task assignment messages from team lead to teammates. Contains full implementation specs:
```json
{
  "from": "team-lead",
  "text": "{\"type\":\"task_assignment\",\"taskId\":\"1\",\"subject\":\"...\",\"description\":\"full impl spec...\"}",
  "timestamp": "2026-02-11T01:52:59.410Z",
  "read": true
}
```

**Linking:** `leadSessionId` links to session UUID. `agentId` links to agent within session.

---

## 6. Debug Logs (debug/)

**Path pattern:** `~/.claude/debug/<session-uuid>.txt`

**Volume:** 17,796 files. Sizes range from 8KB to 81KB.

**Format:** Timestamped debug lines:
```
2026-03-17T18:17:49.727Z [DEBUG] MDM settings load completed in 10ms
2026-03-17T18:17:49.758Z [DEBUG] Loaded 47 installed plugins
2026-03-17T18:17:49.759Z [DEBUG] Registered 0 hooks from 0 plugins
2026-03-17T18:17:49.762Z [DEBUG] Loaded 3 unique skills
2026-03-17T18:17:49.785Z [DEBUG] Fast mode unavailable: not available in Agent SDK
```

**Contains:** Plugin loading timing, skill discovery, MCP connections, hook execution, LSP setup, settings file watches, security checks, feature flag evaluation.

**Linking:** Filename = session UUID.

---

## 7. File History (file-history/)

**Path pattern:** `~/.claude/file-history/<session-uuid>/<hash>@v<N>`

**Volume:** 86 session directories. Up to 105 checkpoints per session.

**Format:** Raw file content at that version. Hash is derived from file path. Version increments per edit.

**Naming:** `<content-hash>@v<version-number>` — e.g., `0307afa466cd053f@v2`

**Linking:** Directory name = session UUID. Used by `rewind_files()` in ClaudeSDKClient. The `file-history-snapshot` JSONL entry type records which files were tracked:
```json
{
  "type": "file-history-snapshot",
  "messageId": "2221f757-...",
  "snapshot": {
    "messageId": "2221f757-...",
    "trackedFileBackups": {},
    "timestamp": "2026-03-03T18:02:38.056Z"
  }
}
```

---

## 8. Active Sessions (sessions/)

**Path pattern:** `~/.claude/sessions/<pid>.json`

**Volume:** 3 files (currently active sessions).

**Format:**
```json
{
  "pid": 1876,
  "sessionId": "dfc9a140-307d-450a-b51e-4976bb456b77",
  "cwd": "/path/to/project",
  "startedAt": 1773587916154
}
```

**Purpose:** PID-to-session mapping for active CLI processes. Ephemeral — cleaned up when session ends.

---

## 9. IDE Integration (ide/)

**Path pattern:** `~/.claude/ide/<pid>.lock`

**Format:**
```json
{
  "pid": 1022,
  "workspaceFolders": ["/path/to/project1", "/path/to/project2"],
  "ideName": "Visual Studio Code",
  "transport": "ws",
  "authToken": "uuid"
}
```

**Purpose:** Links IDE instances to Claude Code sessions. Contains workspace folders and auth tokens.

---

## 10. Global History (history.jsonl)

**Path:** `~/.claude/history.jsonl`

**Volume:** 10,257 entries, ~5MB.

**Format:** One JSON object per line:
```json
{
  "display": "the user's prompt text",
  "pastedContents": {},
  "timestamp": 1773587916154,
  "project": "/path/to/project"
}
```

**Purpose:** Complete prompt history across all sessions and projects. Searchable for cross-project patterns.

---

## 11. Security Warnings (security_warnings_state_*.json)

**Path pattern:** `~/.claude/security_warnings_state_<session-uuid>.json`

**Format:** JSON array of warning strings (file paths + types):
```json
["/path/to/ci.yml-github_actions_workflow"]
```

**Purpose:** Tracks which security warnings have been acknowledged per session.

---

## 12. Shell Snapshots (shell-snapshots/)

**Volume:** 7,568 files.

**Format:** Shell scripts capturing zsh state (functions, aliases, environment).

**Priority:** Low for storage layer. Useful for environment reproduction.

---

## 13. Telemetry (telemetry/)

**Volume:** 136 files.

**Format:** Failed telemetry event JSON files.

**Priority:** Low. Anthropic internal metrics.

---

## Linking Map

```
Session UUID is the primary key connecting most artifacts:

session-uuid ──┬── projects/<cwd>/<uuid>.jsonl      (transcript)
               ├── projects/<cwd>/<uuid>/subagents/  (subagent transcripts)
               ├── projects/<cwd>/<uuid>/tool-results/ (large outputs)
               ├── tasks/<uuid>/                      (TaskCreate items)
               ├── todos/<uuid>[-agent-<id>].json     (TodoWrite items)
               ├── debug/<uuid>.txt                   (debug log)
               ├── file-history/<uuid>/               (file checkpoints)
               ├── sessions/<pid>.json                (active session)
               └── security_warnings_state_<uuid>.json

Session slug links to plans (NOT UUID):

slug ──────────── plans/<slug>.md                     (main plan)
                  plans/<slug>-agent-<agent-id>.md    (agent plan)

slug is found in JSONL entries: {"slug": "breezy-zooming-moon", ...}

Team name links to team data:

team-name ─────── teams/<name>/config.json            (team config)
                  teams/<name>/inboxes/<agent>.json    (message inboxes)

config.json contains leadSessionId → links back to session UUID
```

---

## Postgres Schema Implications

### Core Tables
- `sessions` — from JSONL metadata (uuid, slug, project_path, cwd, git_branch, model, version)
- `entries` — from JSONL lines (uuid, parent_uuid, type, content, flags, position)
- `plans` — from plans/ files (session_slug, content_md, is_agent_plan, agent_id)
- `tasks` — from tasks/ JSON (session_uuid, task_id, subject, description, status, blocks, blockedBy)
- `todos` — from todos/ JSON (session_uuid, agent_id, items array)
- `subagent_transcripts` — from subagents/ dir (parent_session_uuid, agent_id, transcript content)
- `tool_results` — from tool-results/ dir (session_uuid, tool_use_id, content, format)
- `file_checkpoints` — from file-history/ (session_uuid, file_hash, version, content)
- `debug_logs` — from debug/ (session_uuid, log_text or parsed events)
- `prompt_history` — from history.jsonl (prompt, timestamp, project_path)
- `teams` — from teams/ (name, config, lead_session_id, members)
- `team_messages` — from inboxes/ (team_name, agent_name, message content)

### AGE Graph
- `Message` vertices with PARENT_OF edges (the conversation DAG)
- `Session` → `Subagent` edges (SPAWNED_AGENT)
- `Session` → `Plan` edges (HAS_PLAN, linked by slug)
- `Task` dependency graph (BLOCKED_BY edges)
- Cross-project relationships (SAME_TOPIC, USED_AGENT, MADE_DECISION)

### pgvector
- Embeddings on: entry content, plan content, task descriptions, prompt history
- Enables: "find all sessions discussing authentication" across all projects

---

## Volumes (your machine, March 2026)

| Artifact | Count | Size Range |
|---|---|---|
| Project directories | 77 | — |
| Session JSONL files | ~hundreds per project | varies |
| Session artifact dirs | 179 | subagents + tool-results |
| Plan files | 59 (27 unique sessions) | 4KB–93KB |
| Task directories | 93 | 1–20 items each |
| Todo files | 19,892 | small JSON arrays |
| Debug logs | 17,796 | 8KB–81KB |
| File history dirs | 86 | up to 105 checkpoints |
| Shell snapshots | 7,568 | — |
| History entries | 10,257 | 5MB total |
| Team configs | 3 | — |
| Security warnings | ~15 | — |
