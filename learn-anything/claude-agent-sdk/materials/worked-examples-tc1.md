# TC1: Full ~/.claude → Postgres Storage Backend — Worked Examples

## Topic Overview
Build a complete Postgres/AGE storage backend that replicates Claude Code's file-based system. Covers the full data model: session transcripts, subagent transcripts, tool results, plans, tasks, todos, teams, file history, debug logs, and global history. Uses @tool + create_sdk_mcp_server + query() for the ingestion pipeline.

---

## Full Worked Example: Multi-Layer Session Ingester

**Problem Statement:** Build an agent-driven pipeline that ingests a complete Claude Code session — including its subagent transcripts, tool results, linked plan, tasks, and todos — into Postgres with AGE graph edges preserving all relationships.

### Step 1: Understand the Complete Data Model
**Self-explanation prompt:** Why does Claude Code spread session data across multiple directories rather than putting everything in one file?

The `~/.claude/` directory contains 13+ data types linked by two keys:
- **Session UUID** — links: JSONL transcript, artifact dir (subagents/ + tool-results/), tasks/, todos/, debug/, file-history/, sessions/, security_warnings
- **Session slug** — links: plans/ only (human-readable name like `breezy-zooming-moon`)

The slug appears as a field inside JSONL entries: `{"slug": "breezy-zooming-moon", ...}`

```
Session feecab9a → projects/<cwd>/feecab9a.jsonl           (transcript)
                 → projects/<cwd>/feecab9a/subagents/       (35 agent transcripts)
                 → projects/<cwd>/feecab9a/tool-results/    (7 large outputs)
                 → tasks/feecab9a/                          (6 task JSON files)
                 → todos/feecab9a-agent-<id>.json           (per-agent todo lists)
                 → debug/feecab9a.txt                       (debug log)
                 → file-history/feecab9a/                   (105 file checkpoints)

slug "breezy-zooming-moon" → plans/breezy-zooming-moon.md         (main plan)
                            → plans/breezy-zooming-moon-agent-<id>.md (agent plans)
```

**Why this works:** Separation of concerns. The JSONL is the conversation record. Subagent transcripts are full detail that would bloat the parent. Tool results can be megabytes. Plans are human-readable markdown. Tasks are structured dependency graphs. Each format serves its purpose.

---

### Step 2: Design the Postgres Schema
**Self-explanation prompt:** Why do we need both relational tables AND an AGE graph? What can the graph do that SQL can't?

```sql
-- Core session metadata
CREATE TABLE claude_store.sessions (
    id UUID PRIMARY KEY,                    -- session UUID (from filename)
    project_path TEXT NOT NULL,             -- sanitized cwd
    slug TEXT,                              -- human-readable name (links to plans)
    cwd TEXT,                               -- original working directory
    git_branch TEXT,
    model TEXT,
    cli_version TEXT,
    custom_title TEXT,                      -- from tail: last custom-title entry
    first_prompt TEXT,                      -- from head: first meaningful user prompt
    summary TEXT,                           -- custom_title || auto-summary || first_prompt
    file_size BIGINT,
    started_at TIMESTAMPTZ,
    last_modified TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- All JSONL entries (unfiltered — store everything for replay)
CREATE TABLE claude_store.entries (
    id UUID PRIMARY KEY,                    -- entry uuid
    session_id UUID NOT NULL REFERENCES claude_store.sessions(id),
    parent_uuid UUID,                       -- parentUuid (nullable for root)
    logical_parent_uuid UUID,               -- DO NOT follow for chain reconstruction
    entry_type VARCHAR(20) NOT NULL,        -- user, assistant, system, custom-title, tag...
    is_sidechain BOOLEAN DEFAULT FALSE,
    is_meta BOOLEAN DEFAULT FALSE,
    is_compact_summary BOOLEAN DEFAULT FALSE,
    team_name TEXT,                          -- non-null = agent team entry
    slug TEXT,                              -- session slug (if present on this entry)
    content JSONB NOT NULL,                 -- full entry JSON
    position INTEGER NOT NULL,              -- line number for ordering
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_entries_parent ON claude_store.entries(parent_uuid);
CREATE INDEX idx_entries_session ON claude_store.entries(session_id, position);

-- Subagent transcripts (separate JSONL files)
CREATE TABLE claude_store.subagent_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_session_id UUID NOT NULL REFERENCES claude_store.sessions(id),
    agent_id TEXT NOT NULL,                 -- e.g., "agent-a171df858282fe523"
    is_compacted BOOLEAN DEFAULT FALSE,     -- agent-acompact-* files
    entry_count INTEGER,
    content JSONB NOT NULL,                 -- parsed entries array
    file_size BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tool results (large outputs stored separately)
CREATE TABLE claude_store.tool_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES claude_store.sessions(id),
    tool_use_id TEXT NOT NULL,              -- toolu_<id> from filename
    format TEXT NOT NULL,                   -- txt, json
    content TEXT NOT NULL,                  -- raw content
    size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans (markdown, linked by slug)
CREATE TABLE claude_store.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_slug TEXT NOT NULL,             -- links to sessions.slug
    agent_id TEXT,                          -- null for main plan, set for agent plans
    content_md TEXT NOT NULL,               -- full markdown content
    file_size BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_plans_slug ON claude_store.plans(session_slug);

-- Tasks (TaskCreate dependency graphs)
CREATE TABLE claude_store.tasks (
    id TEXT NOT NULL,                       -- sequential number (string)
    session_id UUID NOT NULL REFERENCES claude_store.sessions(id),
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT,                            -- pending, in_progress, completed
    active_form TEXT,                       -- what agent is currently doing
    blocks TEXT[],                          -- task IDs this blocks
    blocked_by TEXT[],                      -- task IDs blocking this
    PRIMARY KEY (session_id, id)
);

-- Todos (TodoWrite items per session+agent)
CREATE TABLE claude_store.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    agent_id TEXT,                          -- null for session-level, set for per-agent
    items JSONB NOT NULL,                   -- [{content, status, id}, ...]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams (Agent Teams config + inboxes)
CREATE TABLE claude_store.teams (
    name TEXT PRIMARY KEY,
    description TEXT,
    lead_agent_id TEXT,
    lead_session_id UUID,
    config JSONB NOT NULL,                  -- full config.json
    created_at TIMESTAMPTZ
);

CREATE TABLE claude_store.team_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name TEXT NOT NULL REFERENCES claude_store.teams(name),
    inbox_agent TEXT NOT NULL,              -- which agent's inbox
    from_agent TEXT NOT NULL,
    message JSONB NOT NULL,                 -- parsed message (type, taskId, subject, description)
    timestamp TIMESTAMPTZ,
    read BOOLEAN DEFAULT FALSE
);

-- File history (checkpoints for rewind)
CREATE TABLE claude_store.file_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES claude_store.sessions(id),
    file_hash TEXT NOT NULL,                -- content hash from filename
    version INTEGER NOT NULL,              -- version number
    content TEXT NOT NULL,                  -- raw file content
    UNIQUE (session_id, file_hash, version)
);

-- Debug logs (operational telemetry)
CREATE TABLE claude_store.debug_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES claude_store.sessions(id),
    raw_log TEXT NOT NULL,                  -- full debug log text
    line_count INTEGER,
    file_size BIGINT
);

-- Global prompt history
CREATE TABLE claude_store.prompt_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt TEXT NOT NULL,
    project_path TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    pasted_contents JSONB
);
CREATE INDEX idx_history_project ON claude_store.prompt_history(project_path, timestamp DESC);

-- AGE graph for relationships
-- SELECT create_graph('claude_graph');
-- Vertex types: Message, Session, Subagent, Plan, Task, Team, Project
-- Edge types: PARENT_OF, SPAWNED_AGENT, HAS_PLAN, BLOCKED_BY, PART_OF_TEAM, IN_PROJECT
```

**Why this works:** Relational tables handle structured queries (list sessions, filter by status, aggregate metrics). AGE handles graph queries (walk parentUuid chains, find all descendants for fork extraction, trace decision chains across projects, detect branch points). pgvector (added in TC4) handles semantic search over content.

---

### Step 3: Build the @tool Ingestion Functions
**Self-explanation prompt:** Why split ingestion into multiple tools rather than one monolithic "ingest everything" function?

```python
from claude_agent_sdk import tool, create_sdk_mcp_server
from typing import Any
import json
import asyncpg
from pathlib import Path

@tool(
    "ingest_session",
    "Ingest a Claude Code session JSONL file into Postgres with full entry taxonomy filtering",
    {"session_path": str, "project_path": str}
)
async def ingest_session(args: dict[str, Any]) -> dict[str, Any]:
    """Parse JSONL, extract metadata, insert entries with proper flags."""
    path = Path(args["session_path"])
    session_id = path.stem  # UUID from filename

    conn = await asyncpg.connect(dsn=DB_URL)
    try:
        entries = []
        slug = None
        custom_title = None
        first_prompt = None

        with open(path) as f:
            for pos, line in enumerate(f):
                line = line.strip()
                if not line:
                    continue
                entry = json.loads(line)
                entry_type = entry.get("type", "unknown")

                # Extract session metadata from entries
                if not slug and entry.get("slug"):
                    slug = entry["slug"]
                if entry_type == "custom-title":
                    custom_title = entry.get("customTitle")
                    continue  # metadata, not a chain entry
                if entry_type == "tag":
                    continue  # metadata
                if entry_type == "file-history-snapshot":
                    continue  # handled separately via file-history/

                # Extract first meaningful user prompt
                if not first_prompt and entry_type == "user":
                    msg = entry.get("message", {})
                    content = msg.get("content", "")
                    if isinstance(content, str) and content.strip():
                        first_prompt = content[:200]

                uuid = entry.get("uuid")
                if not uuid:
                    continue

                entries.append({
                    "uuid": uuid,
                    "parent_uuid": entry.get("parentUuid"),
                    "logical_parent_uuid": entry.get("logicalParentUuid"),
                    "entry_type": entry_type,
                    "is_sidechain": entry.get("isSidechain", False),
                    "is_meta": entry.get("isMeta", False),
                    "is_compact_summary": entry.get("isCompactSummary", False),
                    "team_name": entry.get("teamName"),
                    "slug": entry.get("slug"),
                    "content": json.dumps(entry),
                    "position": pos
                })

        # Insert session
        await conn.execute("""
            INSERT INTO claude_store.sessions (id, project_path, slug, custom_title, first_prompt, summary)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug
        """, session_id, args["project_path"], slug, custom_title, first_prompt,
            custom_title or first_prompt)

        # Batch insert entries
        await conn.executemany("""
            INSERT INTO claude_store.entries
            (id, session_id, parent_uuid, logical_parent_uuid, entry_type,
             is_sidechain, is_meta, is_compact_summary, team_name, slug, content, position)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO NOTHING
        """, [(e["uuid"], session_id, e["parent_uuid"], e["logical_parent_uuid"],
               e["entry_type"], e["is_sidechain"], e["is_meta"], e["is_compact_summary"],
               e["team_name"], e["slug"], e["content"], e["position"]) for e in entries])

        # Create AGE vertices and edges for main-chain messages
        for e in entries:
            if e["entry_type"] in ("user", "assistant") and not e["is_sidechain"] and not e["is_meta"]:
                await conn.execute("""
                    SELECT * FROM cypher('claude_graph', $$
                        MERGE (m:Message {uuid: $1, session_id: $2, type: $3})
                    $$) AS (v agtype)
                """, e["uuid"], str(session_id), e["entry_type"])

                if e["parent_uuid"]:
                    await conn.execute("""
                        SELECT * FROM cypher('claude_graph', $$
                            MATCH (parent:Message {uuid: $1})
                            MATCH (child:Message {uuid: $2})
                            MERGE (parent)-[:PARENT_OF]->(child)
                        $$) AS (edge agtype)
                    """, e["parent_uuid"], e["uuid"])

        return {"content": [{"type": "text",
                "text": f"Ingested session {session_id}: {len(entries)} entries, slug={slug}"}]}
    finally:
        await conn.close()


@tool(
    "ingest_session_artifacts",
    "Ingest a session's subagent transcripts and tool results from the artifact directory",
    {"session_dir": str, "session_id": str}
)
async def ingest_session_artifacts(args: dict[str, Any]) -> dict[str, Any]:
    """Ingest subagents/ and tool-results/ directories."""
    session_dir = Path(args["session_dir"])
    session_id = args["session_id"]
    conn = await asyncpg.connect(dsn=DB_URL)

    try:
        agent_count = 0
        tool_count = 0

        # Ingest subagent transcripts
        subagents_dir = session_dir / "subagents"
        if subagents_dir.exists():
            for agent_file in subagents_dir.glob("*.jsonl"):
                agent_id = agent_file.stem  # e.g., "agent-a171df858282fe523"
                is_compacted = "acompact" in agent_id

                entries = []
                with open(agent_file) as f:
                    for line in f:
                        line = line.strip()
                        if line:
                            entries.append(json.loads(line))

                await conn.execute("""
                    INSERT INTO claude_store.subagent_transcripts
                    (parent_session_id, agent_id, is_compacted, entry_count, content, file_size)
                    VALUES ($1, $2, $3, $4, $5, $6)
                """, session_id, agent_id, is_compacted, len(entries),
                    json.dumps(entries), agent_file.stat().st_size)

                # AGE edge: session spawned agent
                await conn.execute("""
                    SELECT * FROM cypher('claude_graph', $$
                        MERGE (s:Session {id: $1})
                        MERGE (a:Subagent {id: $2, parent_session: $1})
                        MERGE (s)-[:SPAWNED_AGENT]->(a)
                    $$) AS (edge agtype)
                """, str(session_id), agent_id)
                agent_count += 1

        # Ingest tool results
        tool_dir = session_dir / "tool-results"
        if tool_dir.exists():
            for result_file in tool_dir.iterdir():
                tool_use_id = result_file.stem  # toolu_<id>
                fmt = result_file.suffix[1:]    # txt or json
                content = result_file.read_text()

                await conn.execute("""
                    INSERT INTO claude_store.tool_results
                    (session_id, tool_use_id, format, content, size_bytes)
                    VALUES ($1, $2, $3, $4, $5)
                """, session_id, tool_use_id, fmt, content, len(content.encode()))
                tool_count += 1

        return {"content": [{"type": "text",
                "text": f"Ingested artifacts for {session_id}: {agent_count} subagents, {tool_count} tool results"}]}
    finally:
        await conn.close()


@tool(
    "ingest_plans",
    "Ingest plan files linked by session slug",
    {"plans_dir": str}
)
async def ingest_plans(args: dict[str, Any]) -> dict[str, Any]:
    """Ingest all plan files, linking by slug to sessions."""
    plans_dir = Path(args["plans_dir"])
    conn = await asyncpg.connect(dsn=DB_URL)

    try:
        count = 0
        for plan_file in plans_dir.glob("*.md"):
            name = plan_file.stem
            # Parse: slug is everything before -agent-<id>
            if "-agent-" in name:
                parts = name.rsplit("-agent-", 1)
                slug = parts[0]
                agent_id = parts[1]
            else:
                slug = name
                agent_id = None

            content = plan_file.read_text()
            await conn.execute("""
                INSERT INTO claude_store.plans (session_slug, agent_id, content_md, file_size)
                VALUES ($1, $2, $3, $4)
            """, slug, agent_id, content, len(content.encode()))

            # AGE edge: session has plan (via slug)
            await conn.execute("""
                SELECT * FROM cypher('claude_graph', $$
                    MATCH (s:Session)
                    WHERE s.slug = $1
                    MERGE (p:Plan {slug: $1, agent_id: $2})
                    MERGE (s)-[:HAS_PLAN]->(p)
                $$) AS (edge agtype)
            """, slug, agent_id or "main")
            count += 1

        return {"content": [{"type": "text",
                "text": f"Ingested {count} plans from {plans_dir}"}]}
    finally:
        await conn.close()


@tool(
    "ingest_tasks_and_todos",
    "Ingest TaskCreate items and TodoWrite items for a session",
    {"session_id": str, "tasks_dir": str, "todos_dir": str}
)
async def ingest_tasks_and_todos(args: dict[str, Any]) -> dict[str, Any]:
    """Ingest tasks/ and todos/ for a session."""
    session_id = args["session_id"]
    conn = await asyncpg.connect(dsn=DB_URL)

    try:
        task_count = 0
        todo_count = 0

        # Tasks
        tasks_path = Path(args["tasks_dir"]) / session_id
        if tasks_path.exists():
            for task_file in sorted(tasks_path.glob("*.json")):
                task = json.loads(task_file.read_text())
                await conn.execute("""
                    INSERT INTO claude_store.tasks
                    (id, session_id, subject, description, status, active_form, blocks, blocked_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT DO NOTHING
                """, task["id"], session_id, task.get("subject"), task.get("description"),
                    task.get("status"), task.get("activeForm"),
                    task.get("blocks", []), task.get("blockedBy", []))

                # AGE: task dependency edges
                for blocked_id in task.get("blockedBy", []):
                    await conn.execute("""
                        SELECT * FROM cypher('claude_graph', $$
                            MERGE (t1:Task {id: $1, session_id: $2})
                            MERGE (t2:Task {id: $3, session_id: $2})
                            MERGE (t1)-[:BLOCKED_BY]->(t2)
                        $$) AS (edge agtype)
                    """, task["id"], str(session_id), blocked_id)
                task_count += 1

        # Todos
        todos_path = Path(args["todos_dir"])
        for todo_file in todos_path.glob(f"{session_id}*.json"):
            name = todo_file.stem
            agent_id = None
            if "-agent-" in name:
                agent_id = name.split("-agent-", 1)[1]

            items = json.loads(todo_file.read_text())
            await conn.execute("""
                INSERT INTO claude_store.todos (session_id, agent_id, items)
                VALUES ($1, $2, $3)
            """, session_id, agent_id, json.dumps(items))
            todo_count += 1

        return {"content": [{"type": "text",
                "text": f"Ingested {task_count} tasks, {todo_count} todo files for {session_id}"}]}
    finally:
        await conn.close()


# Wire all tools into MCP server
claude_store = create_sdk_mcp_server(
    name="claude-store",
    version="1.0.0",
    tools=[ingest_session, ingest_session_artifacts, ingest_plans, ingest_tasks_and_todos]
)
```

**Why this works:** Each tool handles one data type — the agent decides the orchestration order. The entry taxonomy filtering (sidechains, meta, compaction) happens during ingestion. AGE edges are created alongside relational inserts for dual-query capability.

---

### Step 4: Drive the Pipeline with query()
**Self-explanation prompt:** Why do we let an agent orchestrate the ingestion rather than writing a sequential script?

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage, AssistantMessage

async def ingest_full_session(session_uuid: str, project_path: str):
    """Use an agent to ingest a complete session with all artifacts."""
    options = ClaudeAgentOptions(
        mcp_servers={"claude-store": claude_store},
        allowed_tools=[
            "mcp__claude-store__ingest_session",
            "mcp__claude-store__ingest_session_artifacts",
            "mcp__claude-store__ingest_plans",
            "mcp__claude-store__ingest_tasks_and_todos"
        ],
        system_prompt="""You are a data pipeline agent. Ingest the given Claude Code session and all its artifacts into Postgres.

        Order: 1) Session JSONL first (extracts slug), 2) Subagent transcripts + tool results,
        3) Plans (using the slug from step 1), 4) Tasks and todos.

        Report what was ingested at each step.""",
        max_turns=15,
        max_budget_usd=1.0
    )

    prompt = f"""Ingest session {session_uuid} from project {project_path}.

    Files:
    - JSONL: ~/.claude/projects/{project_path}/{session_uuid}.jsonl
    - Artifacts: ~/.claude/projects/{project_path}/{session_uuid}/
    - Plans: ~/.claude/plans/
    - Tasks: ~/.claude/tasks/
    - Todos: ~/.claude/todos/"""

    async for msg in query(prompt=prompt, options=options):
        if isinstance(msg, AssistantMessage):
            for block in msg.content:
                if hasattr(block, 'text'):
                    print(f"  {block.text[:150]}")
        if isinstance(msg, ResultMessage):
            print(f"\nDone. Cost: ${msg.total_cost_usd:.4f}, Turns: {msg.num_turns}")
            return msg

asyncio.run(ingest_full_session(
    "feecab9a-052c-4f76-9158-38409081247f",
    "-Users-johnroehm-Programming-v0-Dev-StudyElf-Study-Elf-V3"
))
```

**Why this works:** The agent handles the orchestration logic — it reads the session JSONL first to extract the slug, then uses that slug to find plans. It can adapt if artifacts are missing. query() manages the loop; we just observe.

---

### Step 5: Query the Stored Data
**Self-explanation prompt:** Why is AGE better than recursive CTEs for these graph queries?

```sql
-- Reconstruct main conversation chain (same algorithm as SDK)
-- Find leaf, walk backward via parentUuid
SELECT * FROM cypher('claude_graph', $$
    MATCH path = (root:Message)-[:PARENT_OF*]->(leaf:Message)
    WHERE NOT EXISTS((leaf)-[:PARENT_OF]->())
      AND NOT EXISTS(()-[:PARENT_OF]->(root))
      AND leaf.session_id = 'feecab9a-...'
    RETURN [n IN nodes(path) | n.uuid] AS chain
    ORDER BY size(nodes(path)) DESC
    LIMIT 1
$$) AS (chain agtype);

-- Drill into subagent: from parent session → specific agent transcript
SELECT sa.agent_id, sa.entry_count, sa.is_compacted
FROM claude_store.subagent_transcripts sa
WHERE sa.parent_session_id = 'feecab9a-...'
ORDER BY sa.agent_id;

-- Find the plan for this session (via slug)
SELECT p.session_slug, p.agent_id, left(p.content_md, 200) as preview
FROM claude_store.plans p
WHERE p.session_slug = (
    SELECT slug FROM claude_store.sessions WHERE id = 'feecab9a-...'
);

-- Task dependency chain for a team session
SELECT * FROM cypher('claude_graph', $$
    MATCH path = (t1:Task)-[:BLOCKED_BY*]->(t2:Task)
    WHERE t1.session_id = '07a27da8-...'
    RETURN t1.id, t2.id, length(path) as depth
    ORDER BY depth DESC
$$) AS (task_id agtype, blocked_by agtype, depth agtype);

-- Branch detection: find messages with >1 child (fork points)
SELECT * FROM cypher('claude_graph', $$
    MATCH (parent:Message)-[:PARENT_OF]->(child:Message)
    WITH parent, count(child) AS branches
    WHERE branches > 1
    RETURN parent.uuid, parent.session_id, branches
$$) AS (uuid agtype, session_id agtype, branches agtype);
```

---

## Fading Version 1: Remove Step 5 (Queries)

Steps 1-4 provided. **Your Task:** Write the AGE and SQL queries to: reconstruct a conversation chain, drill from parent session to subagent transcript, find the linked plan by slug, and detect fork branch points.

---

## Fading Version 2: Remove Steps 4-5 (Pipeline Driver + Queries)

Steps 1-3 provided. **Your Task:** Write the query() call that orchestrates the multi-step ingestion pipeline. Then write the queries. Surface change: use a different session UUID from your actual BHappy data.

---

## Fading Version 3: Remove Steps 3-5 (Tools + Pipeline + Queries)

Steps 1-2 provided (data model + schema). **Your Task:** Implement all @tool functions, wire them into an MCP server, drive the pipeline with query(), and write the queries. Surface change: add a `ingest_debug_log` tool and `ingest_file_history` tool.

---

## Key Takeaways for TC1

- **~/.claude is much richer than just JSONL files** — 13+ data types across multiple directories, linked by UUID and slug
- **Session UUID is the primary key** for most artifacts; **slug links to plans** (different join pattern)
- **Subagent transcripts live in companion directories** (`<uuid>/subagents/`) as separate JSONL files with full detail
- **Tool results are stored separately** (`<uuid>/tool-results/`) when large, named by tool_use_id
- **Tasks have dependency graphs** (blocks/blockedBy) — natural AGE edges
- **Team inboxes contain full implementation specs** — the detailed task assignments from team lead to teammates
- **The JSONL entry taxonomy is complex** — 13+ entry types, filtering flags (isSidechain, isMeta, isCompactSummary), and the logicalParentUuid trap
- **AGE handles graph operations** (tree traversal, fork detection, dependency chains) that would be complex recursive CTEs in pure SQL
- **Backend abstraction** must handle the slug→plan join pattern differently from UUID→everything-else
