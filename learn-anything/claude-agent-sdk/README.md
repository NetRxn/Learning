# Claude Agent SDK — Learning Curriculum

**Goal:** Build Postgres/pgvector/AGE-backed session storage, observability instrumentation, Agent Teams comparison framework, and cross-project intelligence + eval for BHappy.

**Duration:** 24 sessions over 3 weeks (90 min/session)

**Coverage:** Starting at 44% → targeting 95%

## Curriculum Structure

| TC | Sessions | Focus | You Build |
|---|---|---|---|
| **TC1** | 1–8 | Full ~/.claude → Postgres Storage | Complete data model: sessions, plans, tasks, todos, teams, subagent transcripts, tool results, file history, debug logs. AGE graph. Fork/rewind. Backend toggle. |
| **TC2** | 9–13 | Cost & Observability | Per-session cost, PostToolUse logging, distributed tracing, live monitoring, permissions fix |
| **TC3** | 14–19 | Teams vs Subagents | Identical instrumentation, AGE execution graphs, team inbox analysis, decision matrix |
| **TC4** | 20–24 | Intelligence & Eval | pgvector search, cross-project AGE graph, scorecard evals, lifetime replay |

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
| `reference-claude-data-model.md` | Data model reference | TC1 — complete ~/.claude directory map with every file type, format, and linking pattern |
| `worked-examples-tc1.md` | Worked example | TC1 — multi-layer session ingester (full data model) + 3 fading versions |
| `productive-failure-tc1.md` | Productive failure | TC1 — schema design surfacing 5+ naive assumptions about the data model |
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
