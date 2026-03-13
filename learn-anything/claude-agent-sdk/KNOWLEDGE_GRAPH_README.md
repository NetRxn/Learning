# Claude Agent SDK Knowledge Graph

## File Location
`/sessions/laughing-clever-gates/mnt/Learning/learn-anything/claude-agent-sdk/knowledge-graph.json`

## Overview
This is the complete learner calibration knowledge graph for the Claude Agent SDK skill domain. It combines:
- **Graph structure**: 30 vertices (concepts) + 40 edges (relationships) from the skill dossier
- **Learner state**: Calibrated mastery levels, confidence, and learning model parameters for each vertex
- **Gap analysis**: Identified learning priorities and transfer leverage opportunities

## Key Metrics
- **Total vertices**: 30
- **Total edges**: 40
- **Coverage percentage**: 57.95% (impact-weighted)

### Mastery Distribution
- **Mastered** (≥0.90): 2 vertices (structured-output, builtin-tools)
- **Proficient** (0.70–0.89): 12 vertices
- **Familiar** (0.40–0.69): 10 vertices
- **Attempted** (0.10–0.39): 6 vertices
- **Not started** (<0.10): 0 vertices

## Learner State Structure
Each vertex includes:
- **mastery**: 0.0–1.0 score from calibration
- **mastery_category**: human-readable level (mastered/proficient/familiar/attempted/not_started)
- **confidence**: 0.0–1.0 calibration confidence
- **evidence**: type (calibration/propagation/cluster_inference), count, and summary
- **last_assessed**: ISO timestamp of calibration (2026-03-12T13:00:00Z)
- **bkt_model**: Bayesian Knowledge Tracing parameters (p_transit, p_slip, p_guess, state)
- **fsrs_model**: Spaced Repetition Scheduling System parameters (difficulty, stability, lapses, reps)
- **transfer_boost** (optional): Mastery boost from transfer learning (15 vertices have this)

## Assessment Breakdown

### Directly Assessed (via 7 diagnostic questions)
15 vertices with direct calibration evidence:
- agent-loop (0.55), custom-tools (0.65), hooks (0.75), permissions (0.75), subagents (0.60), orchestration (0.65), agent-teams (0.70)
- otel-tracing (0.10), observability-platforms (0.10), testing-strategies (0.10)
- sessions (0.75), structured-output (0.90), context-management (0.75)
- provider-config (0.15), evolution-tracking (0.10)

### Propagated / Transfer-Boosted (15 vertices)
- From Claude Code daily usage: system-prompts, builtin-tools, claude-code-integration, agent-skills
- From Python expertise: error-handling, tool-design
- From backend/systems knowledge: api-design, architecture-patterns, production-ops
- From database expertise: database-integration
- From LangChain experience: cost-management, external-mcp, handoff-patterns, conversation-state, streaming

## Top Priority Gaps (by frequency × impact × (1-mastery))
1. **Testing Agent Behavior** (0.6075) — Gap flagged by learner; no structured approach
2. **OpenTelemetry Instrumentation** (0.5737) — Self-identified gap; zero prior experience
3. **Observability Platforms** (0.5355) — Self-identified gap; no Langfuse/Arize/MLflow experience
4. **Production Operations & Monitoring** (0.4725) — Ops background but not applied to agents
5. **SDK Evolution & Changelog Management** (0.4388) — Wants systematic tracking

## Transfer Leverage Opportunities
- **Claude Code** → agent-loop, hooks, permissions, sessions (0.2–0.4 boost)
- **Python expertise** → custom-tools, error-handling (0.3 boost)
- **Backend/systems** → production-ops, architecture-patterns, api-design (0.2 boost)
- **Postgres/AGE** → database-integration (0.2 boost)

**Effective scope**: ~55% impact-weighted coverage from existing knowledge. Recommended curriculum: 2 weeks intensive (vs. 4+ weeks from scratch).

## Research Flags
⚠️ **Note**: Learner clarified that agent teams and agent skills work in the SDK itself, not just Claude Code. Dossier may under-represent SDK-native features. Recommend re-research with Anthropic engineering sources before curriculum design.

## Metadata
- **Calibration method**: Diagnostic questions (7 total)
- **Schema version**: 1.0
- **Learning theory**: Bayesian Knowledge Tracing + Spaced Repetition Scheduling System
- **Learner ID**: c4a40ef0-1947-41f9-8b47-898226c079fb
- **Dossier ID**: a7e3b2f1-4d89-4c2e-b6a1-8f3d2e1c5a90
- **Graph ID**: 192dbae4-fe62-4ac3-9cfe-d37fbaf7986d (auto-generated UUID)
- **Created**: 2026-03-12T13:00:00Z

