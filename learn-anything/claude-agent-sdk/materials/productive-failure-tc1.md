# Productive Failure: Session Storage Schema Design

**Target Vertices:** vertex-sdk-session-management, vertex-sdk-custom-tools
**Naive Theory to Surface:** "JSONL sessions are a flat list of messages that map cleanly to a Postgres table"
**Actual Model:** JSONL contains multiple entry types (messages, metadata, compaction summaries, sidechains) with a parentUuid DAG that requires careful filtering and graph modeling

---

## The Challenge

You need to design the Postgres + AGE schema for storing Claude Code session transcripts. Here's what you know:

- Sessions are JSONL files in `~/.claude/projects/<sanitized-cwd>/<uuid>.jsonl`
- Each line is a JSON object
- Messages have `uuid` and `parentUuid` fields forming a conversation chain
- You need to support: full transcript storage, conversation reconstruction, fork at arbitrary turn, branch detection

**Design the schema.** Create the Postgres tables and AGE graph model. Then write the ingestion logic: given a JSONL file path, ingest all entries into your schema.

**Constraints:**
- Must support the `list_sessions()` and `get_session_messages()` API contracts
- Must handle forked sessions (multiple branches from a single message)
- Must be queryable via AGE for tree operations

**Rules during this phase:**
- No hints will be given
- Try your best design based on what you know
- Think out loud about assumptions you're making

---

## What the Learner Will Likely Miss

### 1. Not All JSONL Lines Are Messages

A real session JSONL contains:
- **User/assistant entries** — the actual conversation (type: "user", "assistant")
- **System entries** — metadata like init, progress (type: "system")
- **Attachment entries** — (type: "attachment")
- **Sidechain entries** — subagent conversations (`isSidechain: true`) that should be EXCLUDED from the main chain
- **Compact summary entries** — (`isCompactSummary: true`) that REPLACE earlier messages after compaction
- **Meta entries** — (`isMeta: true`) — internal metadata, not visible messages
- **Custom-title entries** — (type: "custom-title") for session renaming
- **Tag entries** — (type: "tag") for session tagging

A naive schema that treats every line as a message will mix metadata, sidechains, and summaries into the conversation.

### 2. parentUuid vs logicalParentUuid

The SDK's `_build_conversation_chain` follows `parentUuid` but **NOT** `logicalParentUuid`. After compaction, the compact summary message has a `parentUuid` that links to the most recent pre-compaction message, and a `logicalParentUuid` that links to the original conversation position. Following logicalParentUuid would duplicate content.

A naive schema that creates AGE edges for both parentUuid and logicalParentUuid will produce incorrect conversation chains.

### 3. Chain Reconstruction Is Leaf-to-Root, Not Root-to-Leaf

`get_session_messages()` finds the **leaf** message (latest terminal node in the main chain, excluding sidechains/teams/meta), then walks BACKWARD via parentUuid to the root. It doesn't walk forward from the first message.

A naive reconstruction that starts from the root and walks forward will break when there are branches — it won't know which branch to follow.

### 4. Session Metadata Lives in the Tail

`list_sessions()` extracts metadata by reading the **tail** of the file (last 64KB), not parsing the whole thing. Custom titles, tags, summaries, and git branch info are extracted from the tail. The first prompt is extracted from the head (first 64KB).

A schema that doesn't distinguish between head-metadata and tail-metadata won't replicate `list_sessions()` behavior efficiently.

### 5. Sidechain Filtering Is Critical

Subagent conversations are marked `isSidechain: true` and must be excluded from the main conversation chain. But they should still be stored (for introspection and replay). The schema needs a way to query "main chain only" vs "everything including sidechains."

---

## Consolidation Instruction (delivered AFTER struggle)

### The Complete JSONL Entry Taxonomy

```
JSONL Entry Types:
├── Messages (include in main chain)
│   ├── type: "user" (user input + tool results)
│   ├── type: "assistant" (Claude responses)
│   └── type: "system" (lifecycle metadata — init, compact_boundary)
│
├── Filtered (store but exclude from main chain)
│   ├── isSidechain: true (subagent conversations)
│   ├── isMeta: true (internal metadata)
│   ├── teamName: "..." (agent team conversations)
│   └── tool_result in message (sidechain tool results)
│
├── Metadata (store for session listing, not in chain)
│   ├── type: "custom-title" (session rename)
│   ├── type: "tag" (session tag)
│   └── summary field (in tail entries)
│
└── Compaction (special handling)
    └── isCompactSummary: true (replaces earlier messages)
        ├── parentUuid → links to post-compaction position
        └── logicalParentUuid → DO NOT FOLLOW (would duplicate)
```

### The Correct Schema

```sql
-- Sessions table (matches SDKSessionInfo)
CREATE TABLE claude_sessions.sessions (
    id UUID PRIMARY KEY,           -- session UUID from filename
    project_path TEXT NOT NULL,     -- sanitized cwd
    summary TEXT,                   -- from tail: custom_title || summary || first_prompt
    custom_title TEXT,              -- from tail: last custom-title entry
    first_prompt TEXT,              -- from head: first meaningful user prompt
    git_branch TEXT,                -- from tail: last gitBranch value
    file_size BIGINT,
    last_modified TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- All entries (raw, unfiltered)
CREATE TABLE claude_sessions.entries (
    id UUID PRIMARY KEY,           -- entry uuid
    session_id UUID NOT NULL REFERENCES claude_sessions.sessions(id),
    parent_uuid UUID,              -- parentUuid (nullable for root)
    logical_parent_uuid UUID,      -- logicalParentUuid (for reference, NOT for chain walking)
    entry_type VARCHAR(20) NOT NULL, -- user, assistant, system, custom-title, tag, etc.
    is_sidechain BOOLEAN DEFAULT FALSE,
    is_meta BOOLEAN DEFAULT FALSE,
    is_compact_summary BOOLEAN DEFAULT FALSE,
    team_name TEXT,                 -- non-null = agent team entry
    content JSONB NOT NULL,        -- full entry content
    position INTEGER NOT NULL,     -- line number in JSONL (for ordering)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for chain reconstruction (leaf-to-root walk)
CREATE INDEX idx_entries_parent ON claude_sessions.entries(parent_uuid);
CREATE INDEX idx_entries_session ON claude_sessions.entries(session_id, position);

-- AGE graph: ONLY main-chain messages get vertices and edges
-- Sidechains, meta, and metadata entries do NOT get graph representation
```

```sql
-- AGE: Create vertices only for visible messages
SELECT create_graph('session_graph');

-- Insert vertex only if entry is a visible message
-- (user or assistant, not sidechain, not meta, not team)
-- This mirrors _is_visible_message() from the SDK

-- Insert PARENT_OF edge only via parentUuid (NOT logicalParentUuid)
```

### Why the Naive Theory Breaks Down

The JSONL format is the serialization of a **conversation tree with metadata**, not a flat message log. The conversation chain is one path through that tree, and extracting it requires:

1. **Filtering** — exclude sidechains, meta, teams, tool_results
2. **Finding the leaf** — the latest terminal main-chain message
3. **Walking backward** — via parentUuid only
4. **Respecting compaction** — compact summaries replace earlier messages

Your Postgres schema needs to store everything (for replay/introspection) but reconstruct the chain using the same algorithm the SDK uses.

---

## Transfer Problem (post-consolidation)

**New scenario:** You need to implement `fork_at_turn(session_id, message_uuid)` — create a new session branching from a specific message in an existing session.

Given the schema above:
1. How would you create the fork? (Hint: think about what entries to copy vs reference)
2. How would you ensure `get_session_messages()` for the fork returns only the fork's chain?
3. How would you detect all forks of a session using an AGE query?
