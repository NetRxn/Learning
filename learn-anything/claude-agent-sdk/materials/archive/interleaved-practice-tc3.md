# Observability & Testing Practice: Interleaved Problem Set

**Target Audience:** Advanced Python developer
**Difficulty:** 75-85% accuracy
**Interleaving Mix:** 25% OTel tracing/observability/testing strategies (current topic) + 75% hooks/subagents/custom-tools/agent-loop (TC1-TC2 review)
**Notes:** Problems emphasize observability design choices and testing patterns. Discrimination pair included: two problems with similar surface structure but requiring different approaches.

---

## Problem 1: Instrumenting Agent Calls with OpenTelemetry [TC3 Current - OTel Tracing]

**Scenario:**
Your agent makes multiple tool calls in a complex workflow. You want to trace the execution across all tools and measure latency. An external observability platform (Datadog, New Relic, etc.) needs to correlate tool calls and identify which tools are slow.

**Task:**
Implement an OTel tracer that:
1. Creates a span for each tool invocation
2. Records tool name, arguments, and result
3. Measures execution time
4. Propagates trace context across async boundaries
5. Exports spans to an observability backend

How does trace context propagation differ from simple logging?

---

### Solution

```python
from opentelemetry import trace, metrics
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from typing import Any, Callable, Dict
from functools import wraps
from time import time
import asyncio

# Setup OTEL exporters
trace_exporter = OTLPSpanExporter(
    endpoint="localhost:4317"  # OTEL Collector endpoint
)

metric_exporter = OTLPMetricExporter(
    endpoint="localhost:4317"
)

# Configure tracer provider
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(trace_exporter)
)

# Configure meter provider
metric_reader = PeriodicExportingMetricReader(metric_exporter)
metrics.set_meter_provider(MeterProvider(metric_readers=[metric_reader]))

# Get tracer and meter
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Meter for tool latency
tool_latency_histogram = meter.create_histogram(
    name="agent.tool.latency",
    description="Tool execution latency in milliseconds",
    unit="ms"
)

tool_call_counter = meter.create_counter(
    name="agent.tool.calls",
    description="Number of tool calls",
    unit="1"
)

class InstrumentedToolWrapper:
    """Wraps a tool to emit OTel traces and metrics."""

    def __init__(self, tool: Callable, tool_name: str):
        self.tool = tool
        self.tool_name = tool_name

    async def __call__(self, **kwargs) -> Any:
        """Execute tool with OTel instrumentation."""

        # Create a span for this tool call
        with tracer.start_as_current_span(f"tool.{self.tool_name}") as span:
            # Add attributes (will be exported to observability platform)
            span.set_attribute("tool.name", self.tool_name)
            span.set_attribute("tool.arguments", str(kwargs))

            # Record metric: increment call counter
            tool_call_counter.add(1, attributes={"tool": self.tool_name})

            start = time()
            try:
                # Execute tool
                result = await self.tool(**kwargs)

                # Record result
                span.set_attribute("tool.result_type", type(result).__name__)

                return result

            except Exception as e:
                # Record error in span
                span.record_exception(e)
                span.set_attribute("tool.error", str(e))
                raise

            finally:
                # Record latency metric
                duration_ms = (time() - start) * 1000
                tool_latency_histogram.record(
                    duration_ms,
                    attributes={"tool": self.tool_name}
                )

class TracedAgent:
    """Agent that emits OTel traces for all operations."""

    def __init__(self, name: str):
        self.name = name
        self.tracer = tracer

    async def process(self, input_data: Dict[str, Any]) -> Any:
        """Process input with root span."""

        # Create root span for the entire agent execution
        with self.tracer.start_as_current_span(f"agent.{self.name}.process") as root_span:
            root_span.set_attribute("agent.name", self.name)
            root_span.set_attribute("input.keys", str(list(input_data.keys())))

            # Child spans are automatically nested and linked via trace context
            result = await self._execute_tools(input_data)

            root_span.set_attribute("agent.status", "completed")
            return result

    async def _execute_tools(self, input_data: Dict) -> Any:
        """Execute tools; child spans are auto-nested under parent."""

        # This span is automatically a child of the root span
        # because it's created within the root span's context
        with self.tracer.start_as_current_span("agent.tool_execution") as span:
            results = {}

            for tool_name in ["fetch_data", "validate", "save"]:
                # Each tool call creates a nested span
                with self.tracer.start_as_current_span(f"tool.{tool_name}"):
                    # Simulate tool call
                    await asyncio.sleep(0.1)
                    results[tool_name] = f"{tool_name}_result"

            return results

# Usage
async def main():
    agent = TracedAgent("main_agent")

    # Process some data
    result = await agent.process({"query": "test", "params": {"x": 1}})

    # Trace context is automatically propagated:
    # Root span: "agent.main_agent.process"
    #   └─ Child span: "agent.tool_execution"
    #      ├─ Child span: "tool.fetch_data"
    #      ├─ Child span: "tool.validate"
    #      └─ Child span: "tool.save"

    # All spans are sent to the OTEL Collector (localhost:4317)
    # which forwards to Datadog, Jaeger, etc.

    print(f"Result: {result}")

# Difference from logging:
# Logging: Sequential events in a log file, hard to correlate across services
# OTEL Tracing: Structured spans with parent-child relationships, exportable to
#               observability platforms for visualization, querying, and alerting
```

**Why this strategy?**

- **Trace context propagation:** OTel automatically links parent and child spans across async boundaries. When a span is created inside another span's context (via `with tracer.start_as_current_span()`), OTel knows the parent-child relationship without explicit propagation.
- **Structured attributes:** Spans carry key-value attributes (tool name, arguments, errors) that observability platforms can index and query.
- **Metrics:** Histograms (latency) and counters (call count) are automatically exported, enabling alerting and SLO tracking.
- **Backend agnostic:** The same instrumentation works with Jaeger, Datadog, New Relic, etc. Just change the exporter endpoint.

Logging would require parsing timestamps and IDs to correlate calls; OTel does this automatically via trace context.

---

## Problem 2: Designing Test Cases for a Hook [TC2 Review - Hooks]

**Scenario:**
You have a rate-limiting hook that enforces a max of 10 requests per minute per user. The hook should:
1. Track request counts per user
2. Reset counts every minute
3. Reject requests that exceed the limit
4. Return an error with the time until the user can retry

**Task:**
Write comprehensive tests that:
1. Test the happy path (requests within limit)
2. Test the boundary (exactly 10 requests)
3. Test the failure path (11th request is rejected)
4. Test the reset behavior (count resets after time passes)

How would you test time-dependent behavior without waiting for real time to pass?

---

### Solution

```python
import pytest
from unittest.mock import patch, MagicMock
from time import time
from typing import Dict, Tuple

class RateLimitingHook:
    """Enforces rate limiting per user."""

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.request_counts: Dict[str, list] = {}  # user_id -> [timestamp, ...]

    def _get_current_time(self) -> float:
        """Allows mocking time in tests."""
        return time()

    def before_agent_process(self, request: Dict) -> Tuple[bool, str]:
        """
        Check rate limit.
        Returns (allowed, reason_if_denied)
        """
        user_id = request.get("user_id", "unknown")
        current_time = self._get_current_time()

        # Initialize tracking for this user if needed
        if user_id not in self.request_counts:
            self.request_counts[user_id] = []

        # Remove old requests outside the window
        cutoff_time = current_time - self.window_seconds
        self.request_counts[user_id] = [
            ts for ts in self.request_counts[user_id]
            if ts > cutoff_time
        ]

        # Check limit
        if len(self.request_counts[user_id]) >= self.max_requests:
            # Find when the oldest request exits the window
            oldest = self.request_counts[user_id][0]
            retry_after = oldest + self.window_seconds - current_time
            return False, f"Rate limited. Retry in {retry_after:.1f}s"

        # Request allowed
        self.request_counts[user_id].append(current_time)
        return True, ""

# Tests
class TestRateLimitingHook:

    def test_request_within_limit(self):
        """Test that requests within limit are allowed."""
        hook = RateLimitingHook(max_requests=10, window_seconds=60)

        for i in range(10):
            allowed, reason = hook.before_agent_process({"user_id": "user1"})
            assert allowed, f"Request {i+1} should be allowed"
            assert reason == ""

    def test_request_at_boundary(self):
        """Test the boundary: exactly max_requests are allowed."""
        hook = RateLimitingHook(max_requests=3, window_seconds=60)

        # First 3 should succeed
        for i in range(3):
            allowed, reason = hook.before_agent_process({"user_id": "user1"})
            assert allowed
            assert len(hook.request_counts["user1"]) == i + 1

    def test_request_exceeds_limit(self):
        """Test that request 11 is rejected."""
        hook = RateLimitingHook(max_requests=10, window_seconds=60)

        # Make 10 requests (all allowed)
        for i in range(10):
            allowed, reason = hook.before_agent_process({"user_id": "user1"})
            assert allowed

        # 11th request should be denied
        allowed, reason = hook.before_agent_process({"user_id": "user1"})
        assert not allowed
        assert "Rate limited" in reason
        assert "Retry in" in reason

    @patch.object(RateLimitingHook, '_get_current_time')
    def test_rate_limit_reset_after_window(self, mock_time):
        """Test that counts reset after time window expires.

        Uses mocking to avoid waiting for real time.
        """
        hook = RateLimitingHook(max_requests=3, window_seconds=60)

        # Simulate time at t=0
        mock_time.return_value = 0.0

        # Make 3 requests at t=0
        for i in range(3):
            allowed, reason = hook.before_agent_process({"user_id": "user1"})
            assert allowed

        # 4th request at t=0 is rejected
        allowed, reason = hook.before_agent_process({"user_id": "user1"})
        assert not allowed

        # Advance time to t=61 (beyond the 60-second window)
        mock_time.return_value = 61.0

        # Now the counter should be reset; request should be allowed
        allowed, reason = hook.before_agent_process({"user_id": "user1"})
        assert allowed, "Request should be allowed after window reset"

        # Verify old requests were removed
        assert len(hook.request_counts["user1"]) == 1

    @patch.object(RateLimitingHook, '_get_current_time')
    def test_retry_after_calculation(self, mock_time):
        """Test that retry_after time is calculated correctly."""
        hook = RateLimitingHook(max_requests=2, window_seconds=60)

        # Simulate requests at t=10
        mock_time.return_value = 10.0

        # Make 2 requests
        hook.before_agent_process({"user_id": "user1"})
        hook.before_agent_process({"user_id": "user1"})

        # At t=10, 3rd request is rejected
        allowed, reason = hook.before_agent_process({"user_id": "user1"})
        assert not allowed

        # Extract retry_after from reason
        import re
        match = re.search(r"Retry in ([\d.]+)s", reason)
        assert match
        retry_after = float(match.group(1))

        # Should be ~60 seconds (from t=10 to t=70)
        assert 59 < retry_after < 61

        # Simulate moving time to t=70
        mock_time.return_value = 70.0

        # Now request should be allowed
        allowed, reason = hook.before_agent_process({"user_id": "user1"})
        assert allowed

    def test_isolation_between_users(self):
        """Test that rate limits are per-user, not global."""
        hook = RateLimitingHook(max_requests=2, window_seconds=60)

        # user1 makes 2 requests (at limit)
        hook.before_agent_process({"user_id": "user1"})
        hook.before_agent_process({"user_id": "user1"})

        # user2 should still be able to make requests (fresh count)
        allowed1, _ = hook.before_agent_process({"user_id": "user2"})
        allowed2, _ = hook.before_agent_process({"user_id": "user2"})

        assert allowed1 and allowed2, "user2 should have independent rate limit"

        # user1 is rate-limited, but user2 is not
        user1_allowed, _ = hook.before_agent_process({"user_id": "user1"})
        user2_allowed, _ = hook.before_agent_process({"user_id": "user2"})

        assert not user1_allowed
        assert not user2_allowed  # user2 is now also at limit
```

**Why this strategy?**

- **Time mocking:** Instead of `asyncio.sleep(61)`, we mock `_get_current_time()` to return different timestamps. This makes tests instant and deterministic.
- **Boundary testing:** Exactly at the limit (10), exactly over (11), and reset scenarios ensure the logic handles edge cases.
- **Per-user isolation:** Tests verify that rate limits don't interfere between users, a common bug.
- **Error message validation:** Tests check that the rejection reason includes actionable retry timing.

The key insight: Make time mockable by extracting it to a method, then patch that method in tests. This avoids flaky tests and enables testing time-dependent logic in milliseconds.

---

## Problem 3: Discrimination Pair - Testing Hook Behavior (Similar Surface, Different Deep Structure)

### Problem 3A: Unit Testing a Hook in Isolation [TC3 Current - Testing]

**Scenario:**
You have a caching hook that stores request-response pairs. You want to test the hook's caching logic without running a full agent.

**Task:**
Write a unit test that verifies:
1. First call to the hook returns None (cache miss)
2. Second call with same request returns cached result (cache hit)
3. Different requests don't share cache

Assume the hook has methods `before_agent_process(request)` that checks the cache and `after_agent_process(request, response)` that populates it.

---

### Solution 3A

```python
import pytest
from typing import Any, Dict, Optional

class CachingHook:
    def __init__(self):
        self.cache: Dict[str, Any] = {}

    def before_agent_process(self, request: Dict) -> Optional[Any]:
        """Check cache. Return cached response if found; None otherwise."""
        request_key = str(sorted(request.items()))
        return self.cache.get(request_key)

    def after_agent_process(self, request: Dict, response: Any):
        """Store response in cache."""
        request_key = str(sorted(request.items()))
        self.cache[request_key] = response

class TestCachingHookUnit:
    """Unit test: hook in isolation, no agent involved."""

    def test_cache_miss_on_first_call(self):
        """First call should return None (miss)."""
        hook = CachingHook()
        request = {"query": "test"}

        result = hook.before_agent_process(request)
        assert result is None

    def test_cache_hit_on_second_call(self):
        """Second call with same request should return cached response."""
        hook = CachingHook()
        request = {"query": "test"}
        response = {"answer": "yes"}

        # Simulate first call (miss)
        assert hook.before_agent_process(request) is None

        # Populate cache
        hook.after_agent_process(request, response)

        # Second call (hit)
        cached = hook.before_agent_process(request)
        assert cached == response

    def test_different_requests_dont_share_cache(self):
        """Different requests should have separate cache entries."""
        hook = CachingHook()

        request1 = {"query": "test1"}
        request2 = {"query": "test2"}
        response1 = {"answer": "A"}
        response2 = {"answer": "B"}

        # Cache request1
        hook.after_agent_process(request1, response1)

        # Cache request2
        hook.after_agent_process(request2, response2)

        # Verify they're separate
        assert hook.before_agent_process(request1) == response1
        assert hook.before_agent_process(request2) == response2

    def test_request_key_normalization(self):
        """Requests with same content in different order should match."""
        hook = CachingHook()

        request_a = {"query": "test", "user": "alice"}
        request_b = {"user": "alice", "query": "test"}  # Different order
        response = {"answer": "yes"}

        hook.after_agent_process(request_a, response)

        # request_b has same content; should hit cache
        cached = hook.before_agent_process(request_b)
        assert cached == response
```

**Unit test traits:**
- Isolated from agent
- Fast (no I/O, no async)
- Focused on hook logic only
- Mocks nothing (the hook itself is simple)

---

### Problem 3B: Integration Testing a Hook with the Agent [TC2 Review - Custom Tools & Agent Loop]

**Scenario:**
The same caching hook is now integrated into the agent. The agent calls tools, and you want to verify that:
1. When the agent receives a cached request, it returns the cached response without calling tools
2. When the agent receives a new request, it calls tools and caches the result
3. The agent's behavior is transparent—it doesn't know about the cache

**Task:**
Write an integration test that:
1. Mocks the tools
2. Runs the agent with caching
3. Verifies tools are called the right number of times
4. Verifies cached requests skip tool calls

Why is this different from 3A?

---

### Solution 3B

```python
import pytest
from unittest.mock import AsyncMock, patch
import asyncio

class CachingAgent:
    """Agent with caching hook integrated."""

    def __init__(self, tools):
        self.tools = tools
        self.cache_hook = CachingHook()

    async def process(self, request: Dict) -> Any:
        """
        Process request:
        1. Check cache (hook.before)
        2. If miss, call tool
        3. Cache result (hook.after)
        """

        # Check cache
        cached = self.cache_hook.before_agent_process(request)
        if cached is not None:
            return cached

        # Cache miss; call tool
        query = request.get("query", "")
        result = await self.tools["query_engine"](query)

        # Store in cache
        self.cache_hook.after_agent_process(request, result)

        return result

@pytest.mark.asyncio
class TestCachingAgentIntegration:
    """Integration test: hook + agent + tools."""

    async def test_cached_request_skips_tool_call(self):
        """Verify that cached request doesn't call tool."""

        # Mock tool
        mock_tool = AsyncMock(return_value={"answer": "yes"})
        agent = CachingAgent(tools={"query_engine": mock_tool})

        request = {"query": "Is 2+2=4?"}

        # First call (miss); tool is called
        result1 = await agent.process(request)
        assert result1 == {"answer": "yes"}
        assert mock_tool.call_count == 1

        # Second call (hit); tool should NOT be called
        result2 = await agent.process(request)
        assert result2 == {"answer": "yes"}
        assert mock_tool.call_count == 1  # Still 1, not 2

    async def test_different_requests_call_tool_separately(self):
        """Verify that different requests call tool independently."""

        mock_tool = AsyncMock(side_effect=lambda q: {"answer": f"response to {q}"})
        agent = CachingAgent(tools={"query_engine": mock_tool})

        request1 = {"query": "Q1"}
        request2 = {"query": "Q2"}

        # Both requests call tool (both miss)
        result1 = await agent.process(request1)
        result2 = await agent.process(request2)

        assert mock_tool.call_count == 2

        # Repeat requests; should hit cache
        result1_again = await agent.process(request1)
        result2_again = await agent.process(request2)

        assert mock_tool.call_count == 2  # No new tool calls

    async def test_agent_transparent_about_caching(self):
        """Verify that agent behavior is correct regardless of cache."""

        mock_tool = AsyncMock(return_value={"data": "test"})
        agent = CachingAgent(tools={"query_engine": mock_tool})

        request = {"query": "test"}

        # Call twice
        r1 = await agent.process(request)
        r2 = await agent.process(request)

        # Results are identical
        assert r1 == r2

        # Tool called only once (second call was cached)
        assert mock_tool.call_count == 1

        # Agent doesn't expose cache details
        assert not hasattr(agent, "cache")  # Cache is private
```

**Integration test traits:**
- Tests hook + agent + tools together
- Verifies tool call counts (integration concern)
- Slower than unit test (mocked but still async)
- Ensures hook and agent interact correctly

**Discriminator insight:**

| Aspect | 3A (Unit) | 3B (Integration) |
|--------|-----------|-----------------|
| **Focus** | Hook logic in isolation | Hook + agent interaction |
| **Mocks** | Nothing (or minimal) | Tools (AsyncMock) |
| **Verifies** | Cache hit/miss | Tool call counts |
| **Speed** | Fast (sync) | Slower (async) |
| **Catches bugs** | Cache logic | Integration bugs (hook not registered, agent calls tool despite cache, etc.) |

A unit test catches logic bugs; an integration test catches wiring bugs. You need both.

---

## Problem 4: Observability for Long-Running Subagent Tasks [TC3 Current - OTel Tracing & TC2 Review - Subagents]

**Scenario:**
You have a subagent that processes a large file in chunks (each chunk takes 2-5 seconds). The task runs for 10 minutes total. You want to:
1. Track progress of chunk processing
2. Identify which chunks are slow
3. Get notifications if the task stalls (no progress for 30 seconds)

**Task:**
Design an observability system that:
1. Emits progress events every chunk
2. Creates OTel spans for each chunk
3. Implements a stall detector
4. Aggregates metrics (average chunk time, 95th percentile latency)

---

### Solution

```python
from opentelemetry import trace, metrics
from dataclasses import dataclass
from time import time
from typing import List, Callable
import asyncio
import logging

logger = logging.getLogger(__name__)

tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Metrics
chunk_latency = meter.create_histogram(
    name="chunk.latency",
    description="Chunk processing latency in seconds",
    unit="s"
)

chunk_counter = meter.create_counter(
    name="chunks.processed",
    description="Number of chunks processed"
)

stall_detector_counter = meter.create_counter(
    name="stalls.detected",
    description="Number of stalls detected"
)

@dataclass
class ProgressEvent:
    """Emitted when a chunk completes."""
    chunk_id: int
    duration_seconds: float
    total_chunks: int
    status: str

class StallDetector:
    """Detects when chunk processing stalls (no progress for N seconds)."""

    def __init__(self, stall_threshold_seconds: int = 30):
        self.last_event_time = time()
        self.stall_threshold = stall_threshold_seconds

    async def check(self):
        """Periodically check for stalls."""
        while True:
            await asyncio.sleep(10)  # Check every 10 seconds

            elapsed = time() - self.last_event_time

            if elapsed > self.stall_threshold:
                logger.error(f"Stall detected! No progress for {elapsed:.1f}s")
                stall_detector_counter.add(1)

    def record_event(self):
        """Called when progress event is emitted."""
        self.last_event_time = time()

class ObservableChunkProcessor:
    """Process chunks with observability."""

    def __init__(self, progress_callback: Callable = None):
        self.progress_callback = progress_callback
        self.stall_detector = StallDetector()
        self.chunk_times: List[float] = []

    async def process_chunks(self, total_chunks: int, chunk_processor: Callable):
        """
        Process chunks with observability.
        Emits spans, metrics, and progress events.
        """

        # Start stall detector in background
        asyncio.create_task(self.stall_detector.check())

        with tracer.start_as_current_span("chunk_processing") as root_span:
            root_span.set_attribute("total_chunks", total_chunks)

            for chunk_id in range(total_chunks):
                # Create span for this chunk
                with tracer.start_as_current_span(f"chunk_{chunk_id}") as chunk_span:
                    chunk_span.set_attribute("chunk_id", chunk_id)
                    chunk_span.set_attribute("sequence", chunk_id + 1)

                    start = time()
                    try:
                        # Process chunk
                        await chunk_processor(chunk_id)

                        # Record latency
                        duration = time() - start
                        self.chunk_times.append(duration)

                        chunk_latency.record(duration)
                        chunk_counter.add(1)

                        # Record in span
                        chunk_span.set_attribute("status", "success")
                        chunk_span.set_attribute("duration_ms", duration * 1000)

                        # Emit progress event
                        event = ProgressEvent(
                            chunk_id=chunk_id,
                            duration_seconds=duration,
                            total_chunks=total_chunks,
                            status="success"
                        )

                        if self.progress_callback:
                            await self.progress_callback(event)

                        # Notify stall detector of progress
                        self.stall_detector.record_event()

                        logger.info(
                            f"Chunk {chunk_id}/{total_chunks} completed in {duration:.2f}s"
                        )

                    except Exception as e:
                        chunk_span.record_exception(e)
                        chunk_span.set_attribute("status", "failed")
                        logger.error(f"Chunk {chunk_id} failed: {e}")
                        raise

            # Record aggregate metrics in root span
            root_span.set_attribute("chunks_processed", len(self.chunk_times))
            root_span.set_attribute("avg_chunk_time", sum(self.chunk_times) / len(self.chunk_times))

            # Calculate 95th percentile
            sorted_times = sorted(self.chunk_times)
            p95_idx = int(len(sorted_times) * 0.95)
            p95 = sorted_times[p95_idx] if p95_idx < len(sorted_times) else 0
            root_span.set_attribute("p95_chunk_time", p95)

# Usage
async def main():
    processor = ObservableChunkProcessor(
        progress_callback=async_progress_handler
    )

    async def simulate_chunk_processor(chunk_id: int):
        """Simulate processing a chunk."""
        await asyncio.sleep(2 + (chunk_id % 3) * 0.5)  # 2-3.5 seconds per chunk

    total_chunks = 100  # 10-minute job at ~6 seconds per chunk

    await processor.process_chunks(total_chunks, simulate_chunk_processor)

    # Results:
    # - Spans exported to OTEL Collector with parent-child relationships
    # - Metrics aggregated: avg chunk time, p95 latency, stall count
    # - Progress events sent to callback (for client updates)
    # - Stall detector running in background, alerts on no progress

async def async_progress_handler(event: ProgressEvent):
    """Callback to handle progress events."""
    print(f"Progress: {event.chunk_id}/{event.total_chunks} ({event.duration_seconds:.2f}s)")
```

**Why this strategy?**

- **Nested spans:** Each chunk gets its own span, nested under a root span. OTEL automatically correlates them.
- **Metrics at scale:** Histograms (chunk_latency) aggregates across all chunks; the backend (Datadog, etc.) calculates percentiles.
- **Stall detection:** Background task watches `last_event_time`. If no progress event in 30s, an alert is raised. This catches hangs early.
- **Progress callbacks:** Progress events are emitted in real-time, allowing clients (UI, other agents) to react immediately, not just wait for final results.

---

## Problem 5: Metrics-Driven Testing [TC3 Current - Testing & OTel]

**Scenario:**
You want to assert on metrics within tests. For example: "After processing 100 chunks, the 95th percentile chunk latency should be under 5 seconds."

**Task:**
Design a test that:
1. Processes chunks with the observable processor
2. Collects metrics (latency histogram)
3. Verifies SLO: p95 latency < 5s
4. Fails the test if SLO is violated

How would you access metrics in a test without waiting for an external OTEL exporter?

---

### Solution

```python
import pytest
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import InMemoryMetricReader
import asyncio

class TestMetricsBasedSLO:
    """Test that validates SLOs using metrics."""

    @pytest.fixture
    def metric_reader(self):
        """Use in-memory metric reader for testing (no exporter needed)."""
        return InMemoryMetricReader()

    @pytest.fixture
    def meter_with_reader(self, metric_reader):
        """Create meter with in-memory reader."""
        provider = MeterProvider(metric_readers=[metric_reader])
        return provider.get_meter(__name__)

    @pytest.mark.asyncio
    async def test_p95_chunk_latency_slo(self, metric_reader):
        """Verify that p95 chunk latency meets SLO."""

        # Create processor
        processor = ObservableChunkProcessor()

        # Process chunks
        async def fast_chunk(chunk_id: int):
            """Simulate fast chunk: 0.5-2 seconds."""
            import random
            await asyncio.sleep(random.uniform(0.5, 2.0))

        total_chunks = 100
        await processor.process_chunks(total_chunks, fast_chunk)

        # Retrieve metrics from in-memory reader
        metrics_data = metric_reader.get_metrics_data()

        # Extract histogram data
        chunk_latencies = []
        for metric in metrics_data.resource_metrics[0].scope_metrics[0].metrics:
            if metric.name == "chunk.latency":
                # Parse histogram data
                for data_point in metric.data.data_points:
                    for bucket_value in data_point.bucket_counts:
                        # Reconstruct latency distribution
                        chunk_latencies.extend([data_point.value] * bucket_value)

        # Calculate p95
        sorted_latencies = sorted(chunk_latencies)
        p95_idx = int(len(sorted_latencies) * 0.95)
        p95_latency = sorted_latencies[p95_idx] if p95_idx < len(sorted_latencies) else float('inf')

        # Assert SLO
        assert p95_latency < 5.0, f"P95 latency {p95_latency}s exceeds SLO of 5s"

    @pytest.mark.asyncio
    async def test_stall_detector_metric(self, metric_reader):
        """Verify stall detector counts are accurate."""

        processor = ObservableChunkProcessor()

        async def slow_chunk_with_stall(chunk_id: int):
            """Simulate a stall in the middle."""
            if chunk_id == 5:
                # Intentional stall: 45 seconds (exceeds stall threshold of 30s)
                await asyncio.sleep(45)
            else:
                await asyncio.sleep(1)

        total_chunks = 10
        await processor.process_chunks(total_chunks, slow_chunk_with_stall)

        # Retrieve metrics
        metrics_data = metric_reader.get_metrics_data()

        # Find stall count
        stall_count = 0
        for metric in metrics_data.resource_metrics[0].scope_metrics[0].metrics:
            if metric.name == "stalls.detected":
                for data_point in metric.data.data_points:
                    stall_count += data_point.value

        # Should have detected at least one stall
        assert stall_count >= 1, f"Expected stalls, got {stall_count}"
```

**Why this strategy?**

- **In-memory reader:** `InMemoryMetricReader` collects metrics without needing an external OTEL exporter. Tests are fast and isolated.
- **Metrics-driven assertions:** Instead of mocking behavior, tests verify actual metrics (SLOs, latencies, error rates).
- **SLO validation:** Tests can catch performance regressions (e.g., p95 latency increased from 2s to 6s).

---

## Problem 6: Tracing Async Subagent Calls [TC2 Review - Subagents & TC3 Current - OTel]

**Scenario:**
Two subagents (search_subagent, summarize_subagent) run concurrently. The search finishes in 2s, the summarize finishes in 3s. You want OTel to show:
1. Root span: "parallel_task"
2. Child span: "search_subagent" (2s)
3. Child span: "summarize_subagent" (3s)
4. All correctly timed

**Task:**
Implement the subagent calls and OTel tracing such that concurrent spans are correctly attributed. How does span context propagate when tasks run in parallel (not nested)?

---

### Solution

```python
from opentelemetry import trace, context
from opentelemetry.context import Context
import asyncio
from typing import Any

tracer = trace.get_tracer(__name__)

class SubagentWithTracing:
    def __init__(self, name: str):
        self.name = name

    async def run(self, input_data: Any) -> Any:
        """Execute subagent with its own span."""
        # Current context is passed in; create child span within it
        with tracer.start_as_current_span(f"subagent.{self.name}") as span:
            span.set_attribute("subagent.name", self.name)

            # Simulate work
            await asyncio.sleep(2 if self.name == "search" else 3)

            span.set_attribute("status", "completed")
            return f"{self.name}_result"

async def parallel_subagent_execution():
    """Run multiple subagents in parallel with correct OTel tracing."""

    # Root span for the entire task
    with tracer.start_as_current_span("parallel_task") as root_span:
        root_span.set_attribute("task.type", "parallel_subagents")

        # Get current context (root span context)
        root_context = context.get_current()

        # Create subagents
        search = SubagentWithTracing("search")
        summarize = SubagentWithTracing("summarize")

        # Key: Pass context explicitly to parallel tasks
        # This ensures child spans know the root span, even though they run in parallel
        async def search_with_context():
            # Attach root context to this task
            with context.attach(root_context):
                return await search.run({})

        async def summarize_with_context():
            # Attach root context to this task
            with context.attach(root_context):
                return await summarize.run({})

        # Run both concurrently
        results = await asyncio.gather(
            search_with_context(),
            summarize_with_context()
        )

        # Both child spans are now children of root span
        # Trace will show:
        # parallel_task (root, ~3s total)
        #   ├─ search_subagent (2s)
        #   └─ summarize_subagent (3s)

        root_span.set_attribute("parallel.completed", True)
        return results

# Alternative: Using context manager for cleaner code
async def parallel_subagent_execution_v2():
    """Cleaner approach using task context."""

    with tracer.start_as_current_span("parallel_task") as root_span:
        search = SubagentWithTracing("search")
        summarize = SubagentWithTracing("summarize")

        # Run tasks; context automatically inherited by async tasks
        # (if using asyncio.create_task or gather in recent Python)
        results = await asyncio.gather(
            search.run({}),
            summarize.run({})
        )

        return results
```

**Why this strategy?**

- **Context propagation:** `context.attach(root_context)` ensures child spans know their parent, even in parallel tasks.
- **Non-nested concurrency:** Unlike nested spans (parent waits for child), parallel spans start and end independently. OTel timestamps them separately, showing that both ran concurrently within the root span's duration.
- **Timing accuracy:** The root span's duration (~3s) equals the slowest child (summarize_subagent, 3s), correctly reflecting parallel execution.

---

## Problem 7: Testing a Tool That Emits Events [TC1 Review - Custom Tools & TC3 Current - Testing]

**Scenario:**
Your custom tool emits progress events as it works (e.g., "Downloaded 1/10 chunks"). You want to test that:
1. The tool returns the correct result
2. Progress events are emitted in the expected order
3. If the tool fails, the last event is marked as failed

**Task:**
Write a test that captures progress events and verifies both the result and the event sequence.

---

### Solution

```python
import pytest
from dataclasses import dataclass
from typing import Callable, List, Any
from enum import Enum

class EventType(Enum):
    PROGRESS = "progress"
    ERROR = "error"
    SUCCESS = "success"

@dataclass
class ProgressEvent:
    event_type: EventType
    message: str
    percent: int = 0

class DownloadTool:
    """Custom tool that emits progress events."""

    async def __call__(self, url: str, progress_callback: Callable = None) -> str:
        """
        Download from URL, emitting progress events.
        """
        total_chunks = 10

        for i in range(total_chunks):
            if progress_callback:
                percent = int((i / total_chunks) * 100)
                event = ProgressEvent(
                    event_type=EventType.PROGRESS,
                    message=f"Downloaded {i}/{total_chunks} chunks",
                    percent=percent
                )
                await progress_callback(event)

            # Simulate chunk download
            await asyncio.sleep(0.1)

            # Simulate failure on chunk 7
            if i == 7:
                if progress_callback:
                    error_event = ProgressEvent(
                        event_type=EventType.ERROR,
                        message="Network timeout on chunk 8"
                    )
                    await progress_callback(error_event)
                raise RuntimeError("Network timeout")

        if progress_callback:
            success_event = ProgressEvent(
                event_type=EventType.SUCCESS,
                message="Download complete",
                percent=100
            )
            await progress_callback(success_event)

        return f"Downloaded from {url}"

@pytest.mark.asyncio
class TestProgressEventEmission:
    """Test custom tool that emits progress events."""

    async def test_progress_events_in_order(self):
        """Verify events are emitted in the expected sequence."""

        events: List[ProgressEvent] = []

        async def capture_event(event: ProgressEvent):
            events.append(event)

        tool = DownloadTool()

        # This will fail, but we'll catch it to verify error event
        with pytest.raises(RuntimeError):
            await tool(url="http://example.com/file", progress_callback=capture_event)

        # Verify event sequence
        assert len(events) == 9  # 8 progress + 1 error

        # First event
        assert events[0].event_type == EventType.PROGRESS
        assert "0/10" in events[0].message

        # Last event (error)
        assert events[-1].event_type == EventType.ERROR
        assert "Network timeout" in events[-1].message

        # Verify percent increases
        for i, event in enumerate(events[:-1]):  # Exclude error event
            if event.event_type == EventType.PROGRESS:
                assert event.percent >= (i * 10), "Progress should increase"

    async def test_tool_result_on_success(self):
        """Verify tool returns correct result on success."""

        events = []

        async def capture_event(event: ProgressEvent):
            events.append(event)

        # Use a simpler tool that completes successfully
        async def success_download(url: str, progress_callback: Callable = None):
            for i in range(3):
                if progress_callback:
                    event = ProgressEvent(
                        event_type=EventType.PROGRESS,
                        message=f"Step {i}",
                        percent=(i + 1) * 33
                    )
                    await progress_callback(event)
                await asyncio.sleep(0.01)

            if progress_callback:
                event = ProgressEvent(
                    event_type=EventType.SUCCESS,
                    message="Complete",
                    percent=100
                )
                await progress_callback(event)

            return f"Downloaded {url}"

        result = await success_download(
            url="http://example.com",
            progress_callback=capture_event
        )

        # Verify result
        assert result == "Downloaded http://example.com"

        # Verify final event is success
        assert events[-1].event_type == EventType.SUCCESS
        assert events[-1].percent == 100
```

**Why this strategy?**

- **Event capture:** A callback collects events during tool execution, allowing tests to verify the event sequence.
- **Both-sides verification:** Tests check both the result (what the tool returns) and the side effects (events emitted).
- **Failure paths:** Tests verify that error events are emitted when the tool fails, ensuring error handling is observable.

---

## Problem 8: Sampling for Large-Scale Observability [TC3 Current - OTel & Testing]

**Scenario:**
Your agent processes 1 million requests daily. Exporting a trace for every request would overwhelm your OTEL Collector. You need to sample traces:
- Sample 100% of errors
- Sample 10% of slow requests (p95+ latency)
- Sample 1% of normal requests

**Task:**
Implement a sampler that:
1. Inspects request latency
2. Checks if request succeeded or failed
3. Decides whether to sample this trace
4. Writes a test that verifies sampling rates

---

### Solution

```python
from opentelemetry.sdk.trace import Sampler, SamplingResult
from opentelemetry.sdk.trace.sampling import Decision
from typing import Sequence
import random

class AdaptiveSampler(Sampler):
    """
    Sample traces adaptively based on error status and latency.
    - 100% of errors
    - 10% of slow requests
    - 1% of normal requests
    """

    SLOW_THRESHOLD_MS = 500  # 95th percentile cutoff
    NORMAL_SAMPLE_RATE = 0.01  # 1%
    SLOW_SAMPLE_RATE = 0.10  # 10%

    def should_sample(
        self,
        parent_context,
        trace_id: int,
        name: str,
        kind,
        attributes: dict,
        links: Sequence
    ) -> SamplingResult:
        """
        Decide whether to sample this trace.
        Called before span creation.
        """

        # Check for error (set by span recorder later)
        # In practice, errors might be in attributes or added post-hoc
        has_error = attributes.get("error", False)
        if has_error:
            # Sample all errors
            return SamplingResult(decision=Decision.RECORD_AND_SAMPLE)

        # Check latency (measured by agent on request completion)
        latency_ms = attributes.get("latency_ms", 0)
        if latency_ms >= self.SLOW_THRESHOLD_MS:
            # Sample 10% of slow requests
            if random.random() < self.SLOW_SAMPLE_RATE:
                return SamplingResult(decision=Decision.RECORD_AND_SAMPLE)
            else:
                return SamplingResult(decision=Decision.DROP)

        # Normal request; sample 1%
        if random.random() < self.NORMAL_SAMPLE_RATE:
            return SamplingResult(decision=Decision.RECORD_AND_SAMPLE)
        else:
            return SamplingResult(decision=Decision.DROP)

# Test the sampler
@pytest.mark.parametrize("latency_ms,has_error,expected_sampled", [
    (50, False, False),     # Normal, ~1% chance
    (50, True, True),       # Error, always sample
    (600, False, False),    # Slow, ~10% chance
])
def test_adaptive_sampler(latency_ms, has_error, expected_sampled):
    """Test sampling decisions."""

    sampler = AdaptiveSampler()

    # For deterministic testing, mock random
    if expected_sampled:
        with patch("random.random", return_value=0.0):
            # Mocking random to return 0 (< any threshold)
            result = sampler.should_sample(
                parent_context=None,
                trace_id=123,
                name="test_span",
                kind=None,
                attributes={
                    "latency_ms": latency_ms,
                    "error": has_error
                },
                links=[]
            )
            assert result.decision == Decision.RECORD_AND_SAMPLE
    else:
        with patch("random.random", return_value=0.99):
            # Mocking random to return 0.99 (> most thresholds)
            result = sampler.should_sample(
                parent_context=None,
                trace_id=123,
                name="test_span",
                kind=None,
                attributes={
                    "latency_ms": latency_ms,
                    "error": has_error
                },
                links=[]
            )
            if has_error:
                assert result.decision == Decision.RECORD_AND_SAMPLE
            else:
                assert result.decision == Decision.DROP

def test_sampling_rates():
    """Verify sampling rates match expectations."""

    sampler = AdaptiveSampler()

    # Simulate 1000 normal requests
    normal_sampled = 0
    for _ in range(1000):
        result = sampler.should_sample(
            parent_context=None,
            trace_id=random.randint(1, 1000000),
            name="normal_request",
            kind=None,
            attributes={"latency_ms": 100, "error": False},
            links=[]
        )
        if result.decision == Decision.RECORD_AND_SAMPLE:
            normal_sampled += 1

    # Expect ~10 (1% of 1000), allow ±5% margin
    assert 5 < normal_sampled < 15, f"Normal sample rate off: {normal_sampled}/1000"

    # Simulate 1000 slow requests
    slow_sampled = 0
    for _ in range(1000):
        result = sampler.should_sample(
            parent_context=None,
            trace_id=random.randint(1, 1000000),
            name="slow_request",
            kind=None,
            attributes={"latency_ms": 600, "error": False},
            links=[]
        )
        if result.decision == Decision.RECORD_AND_SAMPLE:
            slow_sampled += 1

    # Expect ~100 (10% of 1000), allow ±5% margin
    assert 50 < slow_sampled < 150, f"Slow sample rate off: {slow_sampled}/1000"

    # Errors are always sampled
    error_sampled = 0
    for _ in range(100):
        result = sampler.should_sample(
            parent_context=None,
            trace_id=random.randint(1, 1000000),
            name="error_request",
            kind=None,
            attributes={"latency_ms": 50, "error": True},
            links=[]
        )
        if result.decision == Decision.RECORD_AND_SAMPLE:
            error_sampled += 1

    # Expect 100 (100% of 100)
    assert error_sampled == 100, f"Error sampling not 100%: {error_sampled}/100"
```

**Why this strategy?**

- **Adaptive sampling:** Errors are always sampled (high value for debugging), slow requests are sampled more (identify performance issues), normal requests sampled less (high volume, lower value).
- **Reduces cost:** Sampling 1% of normal requests vs. 100% saves 99x on telemetry storage.
- **Preserves observability:** Errors and slow requests are still well-represented, enabling SLO tracking and incident diagnosis.

---

## Problem 9: Trace Correlation in Multi-Tenant Systems [TC2 Review - Hooks & TC3 Current - OTel]

**Scenario:**
Your agent system serves multiple tenants. When tenant A makes a request, you want all traces for that tenant to be grouped together, separate from tenant B's traces. The trace system needs a tenant ID to be propagated through all spans.

**Task:**
Implement a hook that:
1. Extracts tenant ID from the request
2. Adds tenant ID to all spans created during request processing
3. Allows filtering traces by tenant in the observability platform

---

### Solution

```python
from opentelemetry import trace, context
from typing import Dict, Any

tracer = trace.get_tracer(__name__)

class TenantContextHook:
    """Hook that sets tenant context for all spans."""

    TENANT_ID_TOKEN = context.create_key("tenant_id")

    def before_agent_process(self, request: Dict[str, Any]):
        """
        Extract tenant ID and set it in context.
        All spans created after this will include the tenant ID.
        """

        tenant_id = request.headers.get("X-Tenant-ID", "unknown")

        # Set tenant ID in context
        context.attach(context.set_value(self.TENANT_ID_TOKEN, tenant_id))

        # Also add to the current span (if there is one)
        span = trace.get_current_span()
        span.set_attribute("tenant_id", tenant_id)

    async def after_agent_process(self, request: Dict, response: Any):
        """Clean up context after processing."""
        # Context is automatically cleaned up with context manager
        pass

class TenantTracer:
    """Helper to create spans with tenant context."""

    @staticmethod
    def start_span(span_name: str) -> Any:
        """Create a span that automatically includes tenant context."""

        span = tracer.start_as_current_span(span_name)

        # Get current tenant ID from context
        tenant_id = context.get_value(
            TenantContextHook.TENANT_ID_TOKEN
        )

        if tenant_id:
            span.set_attribute("tenant_id", tenant_id)

        return span

# Usage
async def tenant_aware_agent():
    request = {
        "headers": {"X-Tenant-ID": "tenant_acme"},
        "query": "process_data"
    }

    hook = TenantContextHook()
    hook.before_agent_process(request)

    # All spans created here automatically include tenant_id="tenant_acme"
    with TenantTracer.start_span("agent.process"):
        with TenantTracer.start_span("tool.fetch_data"):
            await asyncio.sleep(0.1)

        with TenantTracer.start_span("tool.analyze"):
            await asyncio.sleep(0.1)

    # Traces in observability platform:
    # agent.process (tenant_id: "tenant_acme")
    #   ├─ tool.fetch_data (tenant_id: "tenant_acme")
    #   └─ tool.analyze (tenant_id: "tenant_acme")
    #
    # Can filter: traces where tenant_id="tenant_acme"
```

**Why this strategy?**

- **Context propagation:** `context.set_value()` stores tenant ID in context, which is inherited by all child spans.
- **Automatic attribution:** Every span automatically includes tenant_id in attributes, enabling filtering in the observability platform.
- **Multi-tenant safety:** Traces from different tenants don't interfere; each tenant's trace can be queried independently.

---

## Problem 10: End-to-End Test with Assertions on Observability Data [TC3 Current - Testing & OTel]

**Scenario:**
You want an end-to-end test that:
1. Runs the agent with observability enabled
2. Collects traces and metrics
3. Asserts that the agent ran correctly (functional test)
4. Asserts that observability data matches expectations (regression test for performance)

**Task:**
Write an end-to-end test that runs the agent, captures OTel data, and verifies:
1. The agent returned the correct result
2. Expected tool calls were made (captured in spans)
3. Latency is within SLO (< 2 seconds)

---

### Solution

```python
import pytest
from opentelemetry.sdk.trace.export import InMemorySpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor

@pytest.fixture
def span_exporter():
    """In-memory span exporter for testing."""
    return InMemorySpanExporter()

@pytest.fixture
def tracer_provider(span_exporter):
    """Create tracer provider with in-memory exporter."""
    provider = TracerProvider()
    provider.add_span_processor(SimpleSpanProcessor(span_exporter))
    trace.set_tracer_provider(provider)
    return provider

@pytest.mark.asyncio
async def test_agent_e2e_with_observability(span_exporter):
    """End-to-end test with observability assertions."""

    # Setup agent with instrumentation
    agent = TracedAgent("test_agent")

    # Execute agent
    result = await agent.process({
        "query": "test",
        "user_id": "test_user"
    })

    # Functional assertion
    assert result is not None
    assert "completed" in str(result).lower()

    # Get exported spans
    traces = span_exporter.get_finished_spans()

    # Observability assertions
    span_names = [span.name for span in traces]
    assert "agent.test_agent.process" in span_names
    assert "tool.fetch_data" in span_names

    # Latency assertion
    root_span = next(
        (span for span in traces if span.name == "agent.test_agent.process"),
        None
    )
    assert root_span is not None

    duration_ms = (root_span.end_time - root_span.start_time) * 1000
    assert duration_ms < 2000, f"Latency {duration_ms}ms exceeds SLO of 2000ms"

    # Tool execution order assertion
    tool_spans = [s for s in traces if s.name.startswith("tool.")]
    tool_names = [s.name for s in tool_spans]
    expected_order = ["tool.fetch_data", "tool.validate", "tool.save"]

    for expected in expected_order:
        assert any(expected in name for name in tool_names), f"{expected} not found in trace"
```

**Why this strategy?**

- **Functional + observability:** Tests both the result (agent returned correct data) and the process (correct tools called, within SLO).
- **In-memory exporter:** No external OTEL Collector needed; spans are captured in-process.
- **Regression detection:** Latency assertions catch performance regressions early (e.g., a code change makes the agent 5x slower).

---

## Reflection: Interleaving and Discrimination Pair

This problem set emphasizes observability design and testing:

- **25% current (TC3):** Problems 1, 4, 5, 8, 10 focus on OTel tracing, observability platforms, and metrics-driven testing.
- **75% review (TC1-TC2):** Problems 2, 3A/3B, 6, 7, 9 revisit hooks, custom tools, subagents, and testing patterns.

**Discrimination pair (3A vs. 3B):**
- **3A (unit test):** Hook logic in isolation; no agent, no tools. Verifies cache hit/miss logic.
- **3B (integration test):** Hook + agent + mocked tools. Verifies that hook integrates correctly with agent and prevents tool calls.

Both test caching, but at different levels. Unit tests catch logic bugs; integration tests catch wiring bugs. Advanced learners should recognize when to use each.

**Strategy variety:** Each problem uses a different strategy—OTel tracing, hook testing, event capture, sampling, context propagation, end-to-end testing. No two consecutive problems repeat the same pattern.
