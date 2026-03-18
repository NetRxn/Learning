# Claude Agent SDK: Encoding Aids for High-Difficulty Vertices

This document provides mnemonics, analogies, and visual organizers for the most difficult concepts in the Claude Agent SDK curriculum. These vertices have the lowest mastery levels and represent the biggest learning gaps.

---

## 1. OTel Tracing (10% Attempted) — Distributed Request Tracking

**Difficulty:** High | **Bloom Level:** Understand/Apply | **Transfer Gap:** Far → Near

### Mnemonic: "SPAN-TREE"
- **S**tart/Stop times (latency)
- **P**arent-child relationships (causality)
- **A**ttributes (metadata tags)
- **N**aming (meaningful span names)
- **T**race ID (connects all spans from one request)
- **R**esource (service, host, version)
- **E**vents (milestones within a span)
- **E**nd states (success/error/timeout)

### Analogy: Database Query Plans (PostgreSQL/AGE)

You're familiar with `EXPLAIN ANALYZE` output for PostgreSQL:

```
Seq Scan on users (cost=0.00..35.50 rows=1000)
  Filter: (status = 'active')
```

This shows:
- **Scan type** (sequential) = **Span name** (tool_call, database_query)
- **Cost estimate** = **Duration estimate**
- **Filter** = **Attributes** (input parameters)
- **Rows returned** = **Output size**
- **Nested operations** (joins, subqueries) = **Child spans**

**OTel Tracing works the same way:**
- Each tool call is a "span" (like a query plan node)
- Child spans represent substeps (like nested subqueries)
- Trace ID is like a "query session" (connects all related operations)
- Tags are like filter conditions (metadata)

**Visual parallel:**
```
EXPLAIN trace for agent_conversation:
├─ span: query_database (duration=45ms)
│  ├─ event: connection_opened (0ms)
│  ├─ event: sql_executed (30ms)
│  └─ event: results_fetched (15ms)
├─ span: text_generation (duration=1200ms)
│  ├─ event: prompt_built (100ms)
│  └─ event: model_inference (1100ms)
└─ span: write_results (duration=50ms)
```

You're already comfortable thinking about "what operations happen, in what order, how long each took." Tracing is just that—instrumenting each operation.

### Transfer Strategy: From PostgreSQL EXPLAIN to OTel

**Exercise:** Take a 3-tool workflow (PostgreSQL query → text generation → HTTP POST) and sketch the EXPLAIN-style trace. Then convert to OTel span hierarchy.

---

## 2. Observability Platforms (10% Attempted) — Seeing into Distributed Systems

**Difficulty:** High | **Bloom Level:** Understand/Apply | **Transfer Gap:** Near → Far

### Mnemonic: "LAD-TAB"
- **L**ogs (what happened)
- **A**lerts (when to care)
- **D**ashboards (overview at a glance)
- **T**races (causality chains)
- **A**nalytics (patterns across many traces)
- **B**udgets (cost tracking)

### Analogy: PostgreSQL Monitoring Stack

You're familiar with monitoring a PostgreSQL database. Observability platforms work the same way:

| PostgreSQL Monitoring | Agent Observability |
|---|---|
| `pg_stat_statements` (slow queries) | Trace logs (slow tool calls) |
| Query logs (`log_statement=all`) | Request logs (every API call) |
| `pg_stat_database` (conn count, latency p50/p95/p99) | Metrics (error rate, latency percentiles) |
| `EXPLAIN ANALYZE` (deep dive on one query) | Trace inspector (deep dive on one request) |
| PgAdmin/pgBadger dashboards | Grafana/DataDog dashboards |
| `pg_terminate_backend()` for runaway queries | Alert + auto-retry for stuck agents |

**Concrete mapping:**

Your agent makes a slow tool call (45s). You have an observability platform. You want to diagnose it.

**With PostgreSQL:**
```sql
-- Find slow queries
SELECT query, calls, mean_exec_time FROM pg_stat_statements 
WHERE mean_exec_time > 30000;

-- Detailed explain
EXPLAIN ANALYZE SELECT * FROM large_table WHERE date > now() - '1 day'::interval;
```

**With Agent Observability:**
```
// Find slow traces (same structure)
SELECT trace_id, span_name, duration_ms FROM traces 
WHERE duration_ms > 30000;

// Detailed trace (same idea)
Open trace viewer → expand 45s span → see child spans (connection, query, fetch)
```

The platforms are fundamentally the same: logs + metrics + traces + dashboards.

### Visual: Observability as Layers

```
┌─────────────────────────────────────┐
│  Dashboards (Grafana-style)         │  ← High-level view
│  "Error rate: 0.5%, Latency p95: 2s"│
├─────────────────────────────────────┤
│  Alerts (PagerDuty-style)           │  ← Action layer
│  "IF error_rate > 1% THEN page dev" │
├─────────────────────────────────────┤
│  Traces (Jaeger-style)              │  ← Causality layer
│  Tool A (100ms) → Tool B (500ms) → Tool C (200ms)
├─────────────────────────────────────┤
│  Metrics (Prometheus-style)         │  ← Aggregate layer
│  error_count, latency_ms, cost_usd  │
├─────────────────────────────────────┤
│  Logs (ELK/Splunk-style)            │  ← Raw layer
│  2026-03-12T10:45:23Z ERROR: timeout │
└─────────────────────────────────────┘
```

**Transfer exercise:** You have a PostgreSQL slowness. You know how to:
1. Look at `pg_stat_statements` (like logs)
2. Check connection count (like metrics)
3. `EXPLAIN ANALYZE` a query (like traces)
4. Set up alerts in your DBA tool

Now apply this to agents: replace "query" with "tool call", "database" with "agent".

---

## 3. Testing Strategies (10% Attempted) — Verification Beyond Manual Checks

**Difficulty:** High | **Bloom Level:** Apply/Analyze | **Transfer Gap:** Moderate

### Mnemonic: "FUCT-MAP"
- **F**unctional (does the agent produce correct output?)
- **U**nit (can individual tools be tested in isolation?)
- **C**ontroller (does safety/governance work as designed?)
- **T**emperamental (how does agent behave under stress: latency, errors, cost overruns?)
- **M**ulti-agent (do teams coordinate correctly?)
- **A**rchitectural (do sessions, state, long-running patterns hold up?)
- **P**roduction (does it work with real services/data?)

### Analogy: Database Testing Pyramid

You're familiar with testing PostgreSQL changes. The same pyramid applies to agents:

```
        ╱╲             Integration tests
       ╱  ╲            (real DB, real fixtures)
      ╱────╲
     ╱      ╲           Unit tests
    ╱________╲          (single function, mocked I/O)
```

For agents:

```
        ╱╲             Integration tests
       ╱  ╲            (real tools, real tool APIs)
      ╱────╲
     ╱      ╲           Unit tests
    ╱________╲          (single tool call, mocked responses)
```

**Testing examples:**

**Unit test (mocked):**
```python
def test_query_tool_with_empty_result():
    # Mock database returns []
    tool = QueryTool(mock_db=[])
    result = tool.execute("SELECT * FROM users")
    assert result == {"data": [], "error": None}
    assert tool.cost == 0.01  # Small query
```

This is like testing a PostgreSQL function: `SELECT my_function(input)` with known input, assert output.

**Integration test (real tool):**
```python
def test_query_tool_with_real_database():
    # Connect to test database
    tool = QueryTool(db_conn=test_db)
    result = tool.execute("SELECT COUNT(*) FROM users")
    assert result["data"][0]["count"] > 0  # At least some users exist
```

This is like running a full query against a test Postgres instance.

**Multi-agent test:**
```python
def test_planner_dataagent_analyst_flow():
    # Execute full team workflow
    team = AgentTeam([Planner, DataAgent, AnalystAgent])
    output = team.run(user_query="Find top 5 products by revenue")
    
    # Assert end-to-end correctness
    assert output["top_products"] is not None
    assert len(output["top_products"]) == 5
    assert all(p["revenue"] for p in output["top_products"])
```

This is like running a multi-step ETL: extract data, transform it, load results, assert final state.

### Transfer Strategy: From Database Testing to Agent Testing

**Your PostgreSQL testing knowledge → Agent testing:**

1. **Unit tests with fixtures**
   - PostgreSQL: `INSERT INTO test_users VALUES (...); SELECT * FROM test_users;`
   - Agents: Mock tool responses → agent processes mocked data
   
2. **Assertion patterns**
   - PostgreSQL: `assert result.row_count == expected; assert result.columns == [...]`
   - Agents: `assert output["data"] == expected; assert output["error"] == None`

3. **Rollback after tests**
   - PostgreSQL: Run in transaction, rollback after test
   - Agents: Reset session state after test

4. **Scaling tests**
   - PostgreSQL: Test with 10, 1000, 100,000 rows
   - Agents: Test with 1, 10, 100 tool calls

### Visual: Test Coverage Map

```
┌──────────────────────────────────────────────┐
│ INTEGRATION: Full conversation + real tools  │
├──────────────────────────────────────────────┤
│ MULTI-AGENT: Team coordination + handoffs    │
├──────────────────────────────────────────────┤
│ FUNCTIONAL: Agent responds correctly         │
├──────────────────────────────────────────────┤
│ CONTROLLER: Permissions, hooks, error paths  │
├──────────────────────────────────────────────┤
│ UNIT: Individual tool calls (mocked)         │
└──────────────────────────────────────────────┘
      What you have now: mostly manual
      What you need: all 5 layers automated
```

---

## 4. Secure Deployment (0% Not Started) — Keeping Secrets Safe in Production

**Difficulty:** Very High | **Bloom Level:** Apply/Analyze | **Transfer Gap:** Far

### Mnemonic: "SACRED-S"
- **S**ecrets manager (never hardcode)
- **A**uthentication (verify agent identity)
- **C**ryptography (encrypt in transit)
- **R**otation (refresh credentials regularly)
- **E**ncryption (protect at rest)
- **D**ata classification (know what's sensitive)
- **Least privilege** (agent can only access what it needs)
- **S**udits (log everything)

### Analogy: Database User Permissions

You're familiar with PostgreSQL role-based access control:

```sql
-- Create a read-only role
CREATE ROLE analyst WITH LOGIN PASSWORD 'secret';
GRANT SELECT ON schema public TO analyst;
REVOKE DELETE, UPDATE ON schema public FROM analyst;

-- Log activity
ALTER SYSTEM SET log_statement = 'all';
SELECT * FROM pg_stat_statements WHERE query LIKE '%analyst%';
```

**Agent security works the same way:**

| PostgreSQL Security | Agent Security |
|---|---|
| Role names (analyst, admin) | Agent names (DataAgent, Planner) |
| Permissions (SELECT, INSERT) | Tool permissions (read_db, write_staging) |
| Password vault (pg_password file) | Secrets manager (Vault, AWS Secrets Manager) |
| Audit logs (pg_stat_statements) | Request logs + OTel traces |
| Principle of least privilege | Agent gets only tools it needs |
| Password rotation policy | Credential rotation (weekly/monthly) |
| Connection encryption (SSL) | Request encryption (TLS) |
| Row-level security (RLS) | Data filtering (agent sees only its data) |

### Visual: Security Layers

```
┌─────────────────────────────────────┐
│ User Request                        │
│ (agent.run("query"))                │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 1. AUTHENTICATION                   │ ← Is this really my agent?
│    (Verify agent signing key)       │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 2. AUTHORIZATION                    │ ← Can this agent use this tool?
│    (Check permissions via policy)   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 3. SECRETS LOADING                  │ ← Fetch DB credentials
│    (From Vault, not code)           │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 4. REQUEST ENCRYPTION               │ ← Send request over TLS
│    (Protect credentials in transit) │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 5. TOOL EXECUTION                   │
│    (With mocked/test credentials)   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 6. AUDIT LOGGING                    │ ← Log who ran what, when
│    (OTel traces + request logs)     │
└─────────────────────────────────────┘
```

### Concrete Scenario: Agent Needs Database Credentials

**INSECURE (don't do this):**
```python
# ❌ WRONG: Hardcoded in agent code
AGENT_PROMPT = """
You are a data agent.
Database: postgres://user:password@db.example.com/mydb
"""
```

**SECURE:**
```python
# ✅ RIGHT: Load from Vault at runtime
import hvac

client = hvac.Client(url='https://vault.example.com', token=VAULT_TOKEN)
secret = client.secrets.kv.read_secret_version(path='agent/db_credentials')
db_password = secret['data']['data']['password']

# Use password
agent = Agent(db_url=f"postgres://user:{db_password}@db.example.com/mydb")

# Later: forget password (don't store it in agent state)
del db_password
```

**Why this is secure:**
1. Password never in code (auditable)
2. Password never in agent state (can't be logged accidentally)
3. Vault has audit trail (who requested password, when)
4. Password can be rotated without redeploying agent
5. If compromised, only this service is affected (least privilege)

### Transfer Exercise: From DB to Agent

**Scenario:** You manage a PostgreSQL instance where analysts need read-only access.

**PostgreSQL approach:**
1. Create a `read_only_analyst` role
2. Grant SELECT on all tables
3. Revoke INSERT, UPDATE, DELETE
4. Store password in 1Password
5. Rotate password monthly
6. Log all queries to audit.log

**Agent approach (same thinking):**
1. Create an agent with "read_database" permission only
2. Agent cannot invoke update/delete tools
3. Store DB credentials in Vault (not 1Password)
4. Rotate credentials monthly
5. Log all tool calls to OTel traces

---

## 5. Long-Running Patterns (0% Not Started) — 72-Hour Stability

**Difficulty:** Very High | **Bloom Level:** Apply/Analyze | **Transfer Gap:** Far

### Mnemonic: "MEMO-LEAK"
- **M**emory management (prevent unbounded growth)
- **E**rror recovery (survive transient failures)
- **M**onitoring (detect degradation)
- **O**rchestration (coordinate restarts)
- **L**eaks (find and fix context accumulation)
- **E**volution (handle version updates mid-run)
- **A**ggregation (batch small operations)
- **K**eep-alives (detect broken connections)

### Analogy: Long-Running Database Migration

You're familiar with long-running PostgreSQL tasks: backups, bulk updates, migrations. These must survive hours or days:

```sql
-- Migration task that might take 12 hours
BEGIN;
  ALTER TABLE large_table ADD COLUMN new_col INT DEFAULT 0;
  UPDATE large_table SET new_col = expensive_calculation(old_col);
COMMIT;
```

**Challenges:**
- Network hiccup mid-update → transaction rolls back, must retry
- Disk fills up → OOM error, must handle gracefully
- New version of function lands → can new version run alongside?
- Memory usage grows → cache not being cleaned

**Solutions:**
- **Checkpointing:** Save progress every N rows so restart doesn't redo work
- **Monitoring:** Alert if memory > threshold
- **Error recovery:** Catch connection timeouts, retry from checkpoint
- **Batching:** Process 1000 rows at a time, not all at once
- **Cleanup:** Truncate logs/caches periodically

**Agents have the same challenges over 72 hours:**

| Long-Running Database Task | Long-Running Agent Task |
|---|---|
| ALTER TABLE adds column | Agent state grows unbounded |
| UPDATE processes 1M rows | Agent makes 1M tool calls |
| OOM error on disk fill | Memory error from context window |
| Transaction rollback on crash | Session reset mid-workflow |
| Log files grow to 100GB | Trace/log storage grows unboundedly |
| Backup interruption, then resume | Agent pause, then resume (is state fresh?) |
| Monitor: `SHOW max_connections` | Monitor: memory_usage, context_size, error_rate |

### Visual: Memory Growth Over Time

```
Memory (MB)
    │
3000├─────────────────────────────────── Memory limit
    │                              ╱╲
2500│                          ╱╲╱  ╲
    │                      ╱╲╱        ╲
2000│                  ╱╲╱            ╲
    │              ╱╲╱                ╲
1500│          ╱╱╱                      ╲ (Checkpoint + reset)
    │      ╱╱╱                          ╲
1000│  ╱╱╱                                ╲
    │╱╱╱                                  ╲
 500│────────────────────────────────────┘
    │
    └──────────────────────────────────────────
      0h    6h   12h   18h   24h   30h   36h
```

**Without checkpoints:** Memory grows unbounded → crash at ~24h
**With checkpoints:** Memory resets every 6h → stable for 72h

### Concrete Pattern: Checkpoint Every 6 Hours

```python
class LongRunningAgent:
    def __init__(self):
        self.checkpoint_interval = 6 * 60 * 60  # seconds
        self.last_checkpoint = time.time()
        self.state = {}

    def run_forever(self):
        while True:
            # Do work
            self.process_user_request()
            
            # Check if checkpoint needed
            if time.time() - self.last_checkpoint > self.checkpoint_interval:
                self.checkpoint()
                
    def checkpoint(self):
        """Save state, reset context, log progress"""
        # Save to persistent storage
        save_to_database(self.state)
        
        # Reset context (forget old conversation)
        old_summary = summarize_work_done(self.state)
        self.state = {"summary": old_summary, "turns": []}
        
        # Log metrics
        log_metrics(memory_usage=get_memory(), context_size=len(self.state))
        
        self.last_checkpoint = time.time()
```

### Transfer Exercise: From Database Monitoring to Agent Monitoring

**You know how to monitor PostgreSQL:**
```sql
-- Check if a long migration is still alive
SELECT datname, usename, state, query FROM pg_stat_activity 
WHERE query LIKE '%ALTER TABLE%';

-- Check memory
SELECT pg_database.datname, 
       pg_size_pretty(pg_database_size(pg_database.datname)) 
FROM pg_database;

-- Check for missing indexes
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE pg_indexes.tablename = pg_tables.tablename);
```

**Apply same thinking to agents:**

```python
# Check if agent is alive (like pg_stat_activity)
if agent.last_heartbeat > 10 * 60:  # 10 minutes old
    alert("Agent may be stuck")

# Check memory growth
if agent.memory_mb > 2500:
    checkpoint()

# Check context window
if agent.context_tokens > 100_000:
    compact_context()
```

---

## 6. Secure Deployment (Expanded) — The Deployment Checklist

**Checkpoint pattern for agents:**

```
Agent deployment security checklist:
☐ Secrets manager configured (Vault/AWS/GCP)
☐ No secrets in code (.env files, prompts)
☐ Permissions policy defined (which tools, read/write)
☐ Audit logging enabled (OTel + structured logs)
☐ Rate limiting configured (max calls/min, max cost/day)
☐ Error handling for auth failures
☐ TLS for all external API calls
☐ Credential rotation policy (weekly?)
☐ Data retention policy (how long keep logs?)
☐ Incident response plan (if agent is hacked?)
☐ Testing with fake credentials (never real ones)
```

This mirrors your PostgreSQL deployment checklist:
```
PostgreSQL deployment security checklist:
☐ Password manager configured
☐ No hardcoded passwords in code
☐ User permissions defined (role-based access)
☐ Audit logging enabled (log_statement)
☐ Connection limits configured
☐ Error handling for auth failures
☐ SSL for all client connections
☐ Password rotation policy
☐ Backup retention policy
☐ Incident response plan
☐ Testing with test credentials
```

---

## 7. Evolution Tracking (10% Attempted) — Version Control for Agents

**Difficulty:** High | **Bloom Level:** Apply | **Transfer Gap:** Moderate

### Mnemonic: "VCS-DIFF"
- **V**ersion every output (agent_version: "3.0")
- **C**ompare versions (A/B testing v2 vs v3)
- **S**chema versioning (if output format changes, version it)
- **D**iff tools (what changed between versions?)
- **I**mpact analysis (which users affected?)
- **F**allback (can we roll back if v3 breaks?)

### Analogy: Database Schema Versioning

You're familiar with database migrations:

```sql
-- v1: Original schema
CREATE TABLE users (id INT, name VARCHAR);

-- v2: Add email (backward compatible)
ALTER TABLE users ADD COLUMN email VARCHAR;

-- v3: Add preferences JSON (forward compatible)
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
```

**Migration strategy:**
1. Deploy v2 code that works with v1 or v2 schema
2. Run ALTER TABLE (schema migration)
3. Validate: queries still work
4. Remove v1 backward-compat code

**Agents have the same versioning pattern:**

```python
# v1: Agent uses only Tool A
def agent_v1(query):
    result_a = tool_a(query)
    return {"answer": result_a, "version": "1.0"}

# v2: Agent uses Tool B (better accuracy)
def agent_v2(query):
    result_b = tool_b(query)
    return {"answer": result_b, "version": "2.0"}

# v3: Agent uses both Tool A and Tool B (ensemble)
def agent_v3(query):
    result_a = tool_a(query)
    result_b = tool_b(query)
    consensus = ensemble(result_a, result_b)
    return {"answer": consensus, "version": "3.0", "tools": ["a", "b"]}
```

### Version Comparison Strategy

**With PostgreSQL, you might compare:**
```sql
-- Compare v1 schema vs v3 schema
SHOW COLUMNS FROM users_v1;
SHOW COLUMNS FROM users_v3;

-- Test query on both
SELECT COUNT(*) FROM users_v1 WHERE email LIKE '%@example.com';
SELECT COUNT(*) FROM users_v3 WHERE email LIKE '%@example.com';
```

**With agents, you compare:**
```python
# A/B test v2 vs v3 on historical data
v2_results = []
v3_results = []

for query in historical_queries:
    v2_results.append(agent_v2(query))
    v3_results.append(agent_v3(query))

# Compare accuracy
v2_accuracy = sum(1 for r in v2_results if r["correct"]) / len(v2_results)
v3_accuracy = sum(1 for r in v3_results if r["correct"]) / len(v3_results)

print(f"v2: {v2_accuracy:.1%}, v3: {v3_accuracy:.1%}")
print(f"Improvement: {(v3_accuracy - v2_accuracy)*100:.1f}%")
```

### Visual: Versioning Timeline

```
Timeline:
  t=0h      v1 deployed (baseline)
             └─ 100 users

  t=6h      v2 deployed (canary: 5% of users)
             ├─ v1: 95 users
             └─ v2: 5 users
                  Monitor: error rate, latency, accuracy

  t=12h     v2 fully rolled out (metrics look good)
             └─ v2: 100 users

  t=24h     v3 deployed (canary: 5% of users)
             ├─ v2: 95 users
             └─ v3: 5 users
                  A/B test: compare accuracy

  t=36h     v3 fully rolled out (v3 accuracy +3%)
             └─ v3: 100 users
```

**Key insight:** Just like PostgreSQL migrations, agent versions need:
1. Backward compatibility (v2 code works with v1 output)
2. Forward compatibility (v3 code works with v2 output)
3. Testing before rollout (A/B on canary)
4. Rollback capability (if v3 breaks, go back to v2)

---

## Summary Table: Which Gaps to Close First

| Vertex | Current | Target | Why Hard | Transfer Path |
|---|---|---|---|---|
| OTel Tracing | 10% | 60% | Abstract concepts | PostgreSQL EXPLAIN ANALYZE |
| Observability Platforms | 10% | 60% | Many tools, overwhelming | PostgreSQL monitoring stack |
| Testing Strategies | 10% | 70% | Requires code changes | Database testing pyramid |
| Secure Deployment | 0% | 70% | Security is unfamiliar | PostgreSQL RBAC + Vault |
| Long-Running Patterns | 0% | 60% | Requires distributed thinking | Database migrations + monitoring |
| Evolution Tracking | 10% | 60% | Version management | Database schema migrations |

---

## Recommended Learning Sequence

1. **Start with OTel Tracing** (bridge from EXPLAIN ANALYZE)
   - Prerequisite: understand PostgreSQL query plans
   - Time: 1-2 hours hands-on
   
2. **Then Observability Platforms** (use OTel traces)
   - Prerequisite: OTel basics
   - Time: 2-3 hours setup + dashboard building
   
3. **Parallel: Testing Strategies** (no prerequisites)
   - Prerequisite: Python testing (you have this)
   - Time: 2-3 hours writing tests
   
4. **Then Secure Deployment** (uses testing + monitoring)
   - Prerequisite: Testing, OTel basics
   - Time: 3-4 hours planning + implementation
   
5. **Then Long-Running Patterns** (uses monitoring + testing)
   - Prerequisite: Monitoring, error handling
   - Time: 2-3 hours design + stress testing
   
6. **Finally Evolution Tracking** (uses monitoring + testing)
   - Prerequisite: Version control, A/B testing
   - Time: 1-2 hours implementation

---

## Practice Exercises

### Exercise 1: Instrument a Tool Call
Take a simple tool call in your agent and add OTel instrumentation:
```python
from opentelemetry import trace
tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("query_database") as span:
    span.set_attribute("input.size_bytes", len(query))
    result = tool_call(query)
    span.set_attribute("output.size_bytes", len(result))
    return result
```

**Checkpoint:** See the span appear in your observability platform with correct duration.

### Exercise 2: Build a Dashboard
Create a dashboard showing agent health:
- Error rate (should be < 0.5%)
- Latency p50/p95/p99 (should be < 5s / 10s / 20s)
- Cost per request (should be < $0.10)
- Version distribution (what % using v2 vs v3?)

**Checkpoint:** Dashboard updates in real-time as your agent runs.

### Exercise 3: Write Integration Tests
Write 3 tests for a multi-tool workflow:
1. Happy path (all tools succeed)
2. Tool failure (one tool times out, agent handles gracefully)
3. Permission denial (agent cannot invoke restricted tool)

**Checkpoint:** All tests pass; coverage > 80%.

### Exercise 4: Simulate 72-Hour Run
Run your agent continuously for 72 hours (or simulate with loops):
- Monitor memory usage
- Checkpoint every 6 hours
- Verify memory stays < 2GB
- Check error rates (should trend down, not up)

**Checkpoint:** Agent is still healthy at hour 72.

### Exercise 5: Version an Agent
Deploy v1.0 of your agent. Then:
1. Create v2.0 (improved tool, same output schema)
2. Deploy v2.0 to 10% of users
3. A/B test: v1 vs v2 accuracy on 100 historical queries
4. Roll out v2.0 to 100% if accuracy improved

**Checkpoint:** v2.0 accuracy is measurably better; deployment was controlled.

