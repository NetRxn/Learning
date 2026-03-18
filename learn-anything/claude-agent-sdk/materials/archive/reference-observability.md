# Observability & Testing Quick Reference (TC3)

## OTel Tracing Setup Checklist

1. **SDK Tracer Configuration**
   ```python
   from anthropic.sdk.observability import OtelTracer

   tracer = OtelTracer(
       service_name="my_agent",
       version="1.0.0",
       exporter="otlp"  # or "jaeger", "zipkin"
   )
   agent = Agent(tracer=tracer)
   ```
   - Required fields: service_name (identifies agent in dashboards)
   - Optional: version, environment tags
   - Exporter: OTLP (Jaeger, Grafana) > Zipkin > Jaeger direct

2. **Span Creation & Attributes**
   ```python
   with tracer.start_span("tool_execution") as span:
       span.set_attribute("tool_name", "search_docs")
       span.set_attribute("input_length", len(query))
       # actual work
       span.set_attribute("result_count", len(results))
   ```
   - Spans nest (hierarchy = tool inside query inside agent loop)
   - Attributes: any JSON-serializable key-value pairs
   - Events: mark milestones without timing

3. **Trace Propagation**
   - Distributed tracing: pass trace context in headers
   - Parent trace ID → child requests → root cause visible
   - SDK auto-propagates to tool calls (if HTTP-based)
   - Manual propagation for async/non-HTTP tools

---

## Platform Comparison

4. **Langfuse** (Recommended for LLM Ops)
   - **Strengths**: LLM-native dashboard, cost tracking, prompt versioning, user sessions
   - **Best for**: production LLM apps, cost analysis, prompt A/B testing
   - **Setup**: `exporter="langfuse"`, API key in env
   - **Pricing**: freemium (5k events/month free)

5. **Arize** (ML Monitoring)
   - **Strengths**: drift detection, model performance, feature monitoring
   - **Best for**: ML pipeline health, data quality alerts
   - **Setup**: proprietary ingestion, requires Arize SDK
   - **Pricing**: enterprise

6. **MLflow** (Open-source, Dev-focused)
   - **Strengths**: local runs, experiment tracking, model registry
   - **Best for**: local development, lab experiments, model comparison
   - **Setup**: `mlflow.start_run()`, file-based storage
   - **Pricing**: free (self-hosted)

7. **Decision Matrix**
   | Scenario | Recommended | Reason |
   |----------|-------------|--------|
   | Production LLM app | Langfuse | Cost tracking, user sessions, compliance |
   | ML model perf | Arize | Drift detection, feature monitoring |
   | Local dev/testing | MLflow | Quick setup, no external deps |
   | Multi-tenant | Langfuse + Arize | Layer: ops + ML health |

---

## Testing Layers

8. **Unit Testing (Function Level)**
   - Test individual tools in isolation
   - Mock external dependencies (APIs, DBs)
   - Example:
     ```python
     def test_search_tool():
         result = search_docs("test query")
         assert isinstance(result, str)
         assert len(result) > 0
     ```
   - Framework: pytest + pytest-mock

9. **Integration Testing (Agent + Tools)**
   - Test agent loop with real tools (or realistic mocks)
   - Verify tool selection, result handling, loop termination
   - Example:
     ```python
     def test_agent_searches_and_summarizes():
         result = agent.query("What is the capital of France?")
         assert "Paris" in result
     ```
   - Use fixtures to reset state between tests

10. **Evaluation Testing (Quality Metrics)**
    - Judge response quality, not just correctness
    - Use rubrics: clarity, accuracy, conciseness
    - Example:
      ```python
      evals = [
          Eval("response_has_sources", check_citations),
          Eval("accuracy_score", llm_judge_accuracy)
      ]
      ```
    - Tools: promptfoo, RAGAS, LangSmith evals

11. **End-to-End Testing (User Workflows)**
    - Simulate real user interactions, full flow
    - Cost monitoring: ensure queries stay within budget
    - Example: "Book a flight, verify confirmation email sent"
    - Run on staging environment

---

## promptfoo Configuration Basics

12. **Config File Structure**
    ```yaml
    # promptfoo.yaml
    providers:
      - id: anthropic
        model: claude-3-5-sonnet
        config:
          max_tokens: 1000

    tests:
      - vars:
          query: "What is 2+2?"
        expected: "4"
      - vars:
          query: "Explain recursion"
        assert:
          - type: llm-rubric
            value: "Includes base case explanation"
    ```

13. **Running Evaluations**
    ```bash
    promptfoo eval  # runs tests against config
    promptfoo view  # opens HTML dashboard with results
    ```
    - Compares multiple providers side-by-side
    - Tracks cost, latency, assertion pass rate

14. **Assertion Types**
    - `contains`: response includes substring
    - `llm-rubric`: LLM judges if response meets criteria
    - `regex`: pattern match
    - Custom: user-defined Python function

---

## Production Monitoring Essentials

15. **Metrics to Track**
    - **Latency**: P50, P95, P99 per query
    - **Cost**: $ per query, total monthly spend
    - **Quality**: eval score distribution, user satisfaction
    - **Errors**: crash rate, tool failures, rate limit hits

16. **Alerting Rules**
    - Alert if P95 latency > baseline * 1.5
    - Alert if cost/query > threshold (cost creep)
    - Alert if error rate > 5%
    - Alert if eval score < historical mean - 2 std dev

17. **Logging Best Practices**
    - Log every query: input, model, tools used, cost, latency
    - Log tool calls: name, args, result, duration, any errors
    - Log eval results: test name, score, any failures
    - Format: JSON for easy ingestion into monitoring platforms

18. **Dashboard Setup**
    - Real-time: current latency, error rate, cost/min
    - Historical: trends over days/weeks
    - Breakdown: by model, by tool, by user/tenant
    - Drill-down: click latency → see slow queries → inspect traces

---

## Common Mistakes

19. **Tracing Overhead**
    - Tracing adds latency (~5-10% typically)
    - Don't trace every detail (e.g., every character in output)
    - Sample high-volume operations (e.g., trace 1% of searches)

20. **Missing Trace Context in Async**
    - Async functions lose trace context by default
    - Use contextvars to propagate trace ID
    - Without it: async tool calls appear disconnected

21. **Eval Tests Too Strict**
    - Brittle tests (exact match on output) fail on minor rephrasing
    - Use LLM-rubric or semantic similarity, not string equality
    - Test intent, not exact wording

22. **Silent Failures in Evals**
    - Eval failure doesn't stop production
    - Set up alerts: if evals regress, notify team
    - Don't assume eval passing = quality

23. **No Cost Baseline**
    - Can't detect cost creep without historical reference
    - Establish baseline on day 1 (e.g., avg cost/query)
    - Track weekly/monthly trend, alert on anomalies
