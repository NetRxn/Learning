# TC1: Session Storage Backend — Worked Examples with Backward Fading

## Topic Overview
Build a Postgres/AGE session storage layer that replaces Claude Code's file-based JSONL system. Learn SDK foundations (query, tools, messages, options) by building the ingestion pipeline and backend abstraction.

---

## Full Worked Example: JSONL Session Ingester with AGE Graph

**Problem Statement:** Build an agent tool that reads a Claude Code JSONL session file, parses the parentUuid conversation tree, and ingests it into Postgres with AGE graph edges preserving the DAG structure. Use `@tool` + `create_sdk_mcp_server` + `query()` to drive the pipeline.

### Step 1: Understand the JSONL Session Format
**Self-explanation prompt:** Why does Claude Code use parentUuid links instead of a flat message array?

The SDK's `_internal/sessions.py` reveals the format. Each line in `~/.claude/projects/<cwd>/<uuid>.jsonl` is:
```json
{"type": "user", "uuid": "abc-123", "parentUuid": null, "sessionId": "sess-001", "message": {"role": "user", "content": "Fix the bug"}}
{"type": "assistant", "uuid": "def-456", "parentUuid": "abc-123", "sessionId": "sess-001", "message": {"role": "assistant", "content": [...]}}
```

The parentUuid chain forms a tree (not flat list) — this is what enables forking and branching. `get_session_messages()` walks from leaf to root via these links.

**Why this works:** A tree structure supports conversation branching. When you fork a session, the new messages have parentUuid pointing into the original chain — both branches coexist in the same file.

---

### Step 2: Define the Postgres + AGE Schema
**Self-explanation prompt:** Why use AGE graph edges for parentUuid relationships instead of a simple foreign key?

```sql
-- Standard relational table for message data
CREATE TABLE claude_sessions.messages (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    parent_uuid UUID,  -- nullable for root messages
    message_type VARCHAR(20) NOT NULL,  -- user, assistant, system, etc.
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (session_id) REFERENCES claude_sessions.sessions(id)
);

-- AGE graph for the conversation tree
SELECT create_graph('session_graph');

-- Vertices: messages
-- Edges: PARENT_OF (from parent to child)
-- This enables: path queries, subtree extraction, branch detection
```

**Why this works:** AGE gives you graph traversal queries that would be complex recursive CTEs in pure SQL. Finding all descendants of a message (for fork extraction) is a simple path query in AGE.

---

### Step 3: Create the @tool Ingestion Functions
**Self-explanation prompt:** Why do we need separate tools for reading JSONL and writing to Postgres, rather than one monolithic tool?

```python
from claude_agent_sdk import tool, create_sdk_mcp_server
from typing import Any
import json
import asyncpg

@tool(
    "read_session_jsonl",
    "Read a Claude Code JSONL session file and return parsed messages",
    {"session_path": str}
)
async def read_session_jsonl(args: dict[str, Any]) -> dict[str, Any]:
    """Parse a JSONL session file into structured messages."""
    path = args["session_path"]
    messages = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            entry = json.loads(line)
            if entry.get("type") in ("user", "assistant", "system"):
                messages.append({
                    "uuid": entry.get("uuid"),
                    "parent_uuid": entry.get("parentUuid"),
                    "session_id": entry.get("sessionId"),
                    "type": entry["type"],
                    "message": entry.get("message", {})
                })
    return {
        "content": [{
            "type": "text",
            "text": json.dumps({"count": len(messages), "messages": messages})
        }]
    }

@tool(
    "ingest_to_postgres",
    "Write parsed session messages to Postgres and create AGE graph edges",
    {
        "type": "object",
        "properties": {
            "session_id": {"type": "string"},
            "messages": {"type": "array", "items": {"type": "object"}}
        },
        "required": ["session_id", "messages"]
    }
)
async def ingest_to_postgres(args: dict[str, Any]) -> dict[str, Any]:
    """Ingest messages into Postgres + AGE graph."""
    conn = await asyncpg.connect(dsn="postgresql://user:pass@localhost/bhappy")
    try:
        async with conn.transaction():
            for msg in args["messages"]:
                # Insert message row
                await conn.execute("""
                    INSERT INTO claude_sessions.messages
                    (id, session_id, parent_uuid, message_type, content)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (id) DO NOTHING
                """, msg["uuid"], args["session_id"],
                    msg.get("parent_uuid"), msg["type"],
                    json.dumps(msg["message"]))

                # Create AGE vertex
                await conn.execute("""
                    SELECT * FROM cypher('session_graph', $$
                        MERGE (m:Message {uuid: $1, session_id: $2, type: $3})
                    $$) AS (v agtype)
                """, msg["uuid"], args["session_id"], msg["type"])

                # Create parent edge if parent exists
                if msg.get("parent_uuid"):
                    await conn.execute("""
                        SELECT * FROM cypher('session_graph', $$
                            MATCH (parent:Message {uuid: $1})
                            MATCH (child:Message {uuid: $2})
                            MERGE (parent)-[:PARENT_OF]->(child)
                        $$) AS (e agtype)
                    """, msg["parent_uuid"], msg["uuid"])

        return {"content": [{"type": "text", "text": f"Ingested {len(args['messages'])} messages"}]}
    finally:
        await conn.close()

# Wire into MCP server
session_tools = create_sdk_mcp_server(
    name="session-storage",
    version="1.0.0",
    tools=[read_session_jsonl, ingest_to_postgres]
)
```

**Why this works:** Separate tools let the agent decide the workflow — read first, validate, then ingest. The agent can inspect the parsed data before committing to Postgres. The @tool decorator handles MCP protocol wrapping automatically.

---

### Step 4: Drive the Pipeline with query()
**Self-explanation prompt:** Why do we iterate messages from query() even though we only care about the final result?

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage, AssistantMessage

async def ingest_session(jsonl_path: str):
    """Use an agent to ingest a session file into Postgres."""
    options = ClaudeAgentOptions(
        mcp_servers={"session-storage": session_tools},
        allowed_tools=[
            "mcp__session-storage__read_session_jsonl",
            "mcp__session-storage__ingest_to_postgres"
        ],
        system_prompt="You are a data pipeline agent. Read the JSONL session file, then ingest all messages into Postgres.",
        max_turns=10,
        max_budget_usd=0.50
    )

    async for message in query(
        prompt=f"Ingest the session at {jsonl_path} into Postgres",
        options=options
    ):
        if isinstance(message, AssistantMessage):
            # Track progress
            for block in message.content:
                if hasattr(block, 'text'):
                    print(f"Agent: {block.text[:100]}...")
        if isinstance(message, ResultMessage):
            print(f"Done. Cost: ${message.total_cost_usd:.4f}, Turns: {message.num_turns}")
            return message

asyncio.run(ingest_session("/Users/john/.claude/projects/-Users-john-myproject/abc-123.jsonl"))
```

**Why this works:** query() manages the entire agent loop — the agent reads the file, parses it, decides to ingest, calls the Postgres tool, and reports results. We just configure and observe.

---

### Step 5: Query the Ingested Graph
**Self-explanation prompt:** Why is finding all descendants of a message useful for implementing fork-at-arbitrary-turn?

```python
@tool(
    "query_conversation_tree",
    "Query the conversation tree from AGE graph",
    {"message_uuid": str, "query_type": str}
)
async def query_conversation_tree(args: dict[str, Any]) -> dict[str, Any]:
    """Query conversation structure from AGE graph."""
    conn = await asyncpg.connect(dsn="postgresql://user:pass@localhost/bhappy")
    try:
        if args["query_type"] == "ancestors":
            # Walk from message to root — reconstruct conversation up to this point
            result = await conn.fetch("""
                SELECT * FROM cypher('session_graph', $$
                    MATCH path = (root:Message)-[:PARENT_OF*]->(target:Message {uuid: $1})
                    WHERE NOT EXISTS(()-[:PARENT_OF]->(root))
                    RETURN [n IN nodes(path) | n.uuid] AS chain
                $$) AS (chain agtype)
            """, args["message_uuid"])
        elif args["query_type"] == "descendants":
            # Find all messages downstream — for fork extraction
            result = await conn.fetch("""
                SELECT * FROM cypher('session_graph', $$
                    MATCH (start:Message {uuid: $1})-[:PARENT_OF*]->(desc:Message)
                    RETURN desc.uuid AS uuid, desc.type AS type
                $$) AS (uuid agtype, type agtype)
            """, args["message_uuid"])
        elif args["query_type"] == "branches":
            # Find messages with multiple children — branch points
            result = await conn.fetch("""
                SELECT * FROM cypher('session_graph', $$
                    MATCH (parent:Message)-[:PARENT_OF]->(child:Message)
                    WITH parent, count(child) AS child_count
                    WHERE child_count > 1
                    RETURN parent.uuid AS uuid, child_count
                $$) AS (uuid agtype, child_count agtype)
            """, )

        return {"content": [{"type": "text", "text": json.dumps([dict(r) for r in result])}]}
    finally:
        await conn.close()
```

**Why this works:** AGE graph queries make tree operations natural. Finding ancestors = walk to root. Finding descendants = traverse subtree. Finding branches = count children > 1. These are the building blocks for fork/rewind.

---

## Fading Version 1: Remove Step 5 (Graph Queries)

Steps 1-4 provided. **Your Task:** Implement the graph query tool that supports ancestors, descendants, and branch detection queries against the AGE session graph.

---

## Fading Version 2: Remove Steps 4-5 (Pipeline Driver + Graph Queries)

Steps 1-3 provided. **Your Task:** Write the `query()` call that drives the ingestion pipeline, handling message iteration and ResultMessage cost extraction. Then implement the graph query tool.

Surface change: Use a different session path and add error handling for malformed JSONL lines.

---

## Fading Version 3: Remove Steps 3-5 (Tools + Pipeline + Queries)

Steps 1-2 provided (JSONL format understanding + Postgres schema). **Your Task:** Create the @tool functions for reading JSONL and ingesting to Postgres+AGE, wire them into an MCP server, drive the pipeline with query(), and build the graph query tool.

Surface change: Add a `list_sessions` tool that wraps the SDK's `list_sessions()` function to let the agent discover available sessions.

---

## Key Takeaways for TC1

- **The SDK manages the loop** — you configure via ClaudeAgentOptions and observe via message iteration
- **@tool + create_sdk_mcp_server** is how you give Claude custom capabilities — the MCP response format is `{"content": [{"type": "text", "text": "..."}]}`
- **Tool names follow mcp__servername__toolname** — must match in allowed_tools
- **ResultMessage is always last** — check subtype before reading result. Cost/session_id always available.
- **Session JSONL is a parentUuid-linked tree** — AGE graph edges make this queryable for fork/rewind/branch
- **Separate read from write tools** — let the agent decide the workflow
