# Claude Agent SDK — Learning Curriculum

**Goal:** Build Postgres/pgvector/AGE-backed session storage, observability instrumentation, Agent Teams comparison framework, and cross-project intelligence + eval for BHappy.

**Duration:** 20 sessions over 2.5 weeks (90 min/session)

**Coverage:** Starting at 44% → targeting 95%

## Curriculum Structure

| TC | Sessions | Focus | You Build |
|---|---|---|---|
| **TC1** | 1–5 | SDK Foundations + Session Storage | Postgres/AGE session tables, JSONL ingestion, fork/rewind, file↔DB toggle |
| **TC2** | 6–10 | Cost & Observability | Per-session cost, PostToolUse logging, distributed tracing, live monitoring |
| **TC3** | 11–15 | Teams vs Subagents | Identical instrumentation on both paths, AGE execution graphs, decision matrix |
| **TC4** | 16–20 | Intelligence & Eval | pgvector search, cross-project AGE graph, scorecard evals, lifetime replay |

## Files

### State (pipeline output — don't edit manually)
| File | Purpose |
|---|---|
| `domain-assessment.json` | Skill classification + learner profile |
| `skill-dossier.json` | 20 vertices, dependency graph, transfer pathways, failure points |
| `knowledge-graph.json` | Mastery overlay from calibration (44.3% coverage) |
| `learning-plan.json` | 4 task classes, 20 sessions, schedule, motivation architecture |
| `srs-cards.json` | 38 flashcards across 4 decks |
| `claude-agent-sdk-flashcards.apkg` | Anki deck ready for import |

### Materials
| File | Type | For |
|---|---|---|
| `reference-sdk-primitives.md` | Quick reference | All TCs — SDK API cheat sheet |
| `visual-agent-loop.md` | Visual reference | TC1 — message lifecycle, context, subagent isolation |
| `visual-permissions.md` | Visual reference | TC2 — permission decision flow, BHappy 8-layer stack |
| `visual-session-dag.md` | Visual reference | TC1 — parentUuid tree, fork/rewind, AGE model |
| `visual-tool-pipeline.md` | Visual reference | TC1-2 — @tool → MCP → hooks → execution |
| `visual-options-map.md` | Visual reference | All TCs — option groups, decision guide, BHappy configs |
| `visual-bhappy-integration.md` | Visual reference | All TCs — current architecture, what you're building, gap map |
| `worked-examples-tc1.md` | Worked example | TC1 — JSONL ingester with AGE graph + 3 fading versions |
| `productive-failure-tc1.md` | Productive failure | TC1 — session schema design edge cases |
| `productive-failure-tc2.md` | Productive failure | TC2 — permissions misconception (allowed_tools vs can_use_tool) |
| `dependency-graph.md` | Knowledge map | All TCs — Mermaid graph with mastery overlay |
| `resources.md` | Resource list | All TCs — official docs, source code, BHappy references |

### Archive
Old materials from the initial curriculum (based on incorrect raw-API assumptions). Preserved for reference, not used.

## How to Start

1. Import `claude-agent-sdk-flashcards.apkg` into Anki
2. Review the visual references to build your mental model
3. Start TC1 Session 1: `/learn claude-agent-sdk`

## Key References

- SDK source: `.venv/lib/python3.14/site-packages/claude_agent_sdk/`
- BHappy workers: `~/Programming/AgentSandbox/bhappy-skill/src/bhappy/workers/`
- BHappy team launcher: `~/Programming/AgentSandbox/bhappy-skill/src/bhappy/meta/team_launcher.py`
- Official docs: https://platform.claude.com/docs/en/agent-sdk/overview
