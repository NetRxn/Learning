# Control & Multi-Agent Practice: Interleaved Problem Set

**Target Audience:** Advanced Python developer
**Difficulty:** 75-85% accuracy
**Interleaving Mix:** 25% hooks/permissions/subagents/orchestration (current topic) + 75% agent-loop/custom-tools/streaming (TC1 review)
**Notes:** Problems require design choices and code reasoning, not just recall. Practice varying your problem-solving strategies.

---

## Problem 1: Hook-Based Request Filtering [TC2 Current - Hook]

**Scenario:**
Your Claude Agent SDK application processes requests from multiple client types: web browsers, mobile apps, and internal tools. Mobile clients frequently send incomplete payloads due to network conditions, while internal tools always send complete data. You need to reject incomplete requests early, but only for mobile clients, without repeating validation logic across multiple tool handlers.

**Task:**
Design and implement a hook that filters incomplete requests before they reach your tool handlers. Your hook should:
1. Distinguish between client types
2. Apply different validation rules per client type
3. Allow complete requests through regardless of client
4. Log why a request was rejected

What hook lifecycle event should you use, and why is it better than checking inside each tool handler?

---

### Solution

```python
from typing import Any, Dict
from functools import wraps

class RequestValidationHook:
    """Hook for early request filtering based on client type and payload completeness."""

    def __init__(self):
        self.required_fields_by_client = {
            "mobile": {"user_id", "action"},
            "web": {"user_id", "action", "session_token"},
            "internal": set(),  # No strict requirements
        }
        self.rejected_count = 0

    def before_agent_process(self, request: Dict[str, Any]) -> bool:
        """
        Fired before agent processes any request.
        Return True to allow, False to reject.
        This is the optimal hook point—executes once, filters entire request pipeline.
        """
        client_type = request.headers.get("X-Client-Type", "web")
        required = self.required_fields_by_client.get(client_type, {"user_id", "action"})

        payload = request.body
        missing = required - set(payload.keys())

        if missing:
            request.context["rejection_reason"] = f"Missing fields for {client_type}: {missing}"
            self.rejected_count += 1
            return False

        return True

# Usage in agent initialization
hook = RequestValidationHook()

# Assuming SDK provides hook registration (pseudocode)
agent.register_hook("before_process", hook.before_agent_process)

# Tool handlers now only receive validated requests
@agent.tool
def process_user_action(user_id: str, action: str):
    """No validation needed here—hook guarantees required fields exist."""
    return f"Processed {action} for user {user_id}"
```

**Why this strategy?**

Hooks execute at the request entry point, not inside individual handlers. This means:
- **Single responsibility:** Validation logic lives in one place, not scattered across tool handlers
- **Early exit:** Invalid requests fail fast before any tool processing
- **Composability:** Mobile, web, and internal routes can reuse the same tools without modification
- **Observable:** The hook logs rejections centrally, making debugging and monitoring easier

Checking inside each handler would be redundant (DRY violation) and would waste computation on invalid requests. A hook lets you enforce a cross-cutting concern globally.

---

## Problem 2: Custom Tool with Streaming State [TC1 Review - Custom Tool]

**Scenario:**
You're building a long-running report generation tool that must stream partial results to the client as each section completes. The tool performs three sequential operations: data fetching, analysis, and formatting. The client should see each section's output as it finishes, not wait for the entire report.

**Task:**
Implement a custom tool that:
1. Performs three sequential operations
2. Streams intermediate results after each operation
3. Allows the agent to continue processing while streaming happens
4. Captures the final merged result

How would you structure the tool to enable streaming without blocking the agent?

---

### Solution

```python
from typing import Generator, Dict, Any
from dataclasses import dataclass
import asyncio

@dataclass
class ReportSection:
    name: str
    content: str
    timestamp: float

class StreamingReportTool:
    def __init__(self, output_stream):
        self.output_stream = output_stream  # Client stream
        self.sections: Dict[str, str] = {}

    async def generate_report(self, topic: str) -> str:
        """
        Custom tool that streams sections as they complete.
        Uses async to prevent blocking the agent loop.
        """

        # Phase 1: Data fetching (stream immediately after)
        data = await self._fetch_data(topic)
        self.output_stream.write({"phase": "data", "status": "complete", "rows": len(data)})
        self.sections["data"] = data

        # Phase 2: Analysis (stream immediately after)
        analysis = await self._analyze(data)
        self.output_stream.write({"phase": "analysis", "status": "complete", "insights": 3})
        self.sections["analysis"] = analysis

        # Phase 3: Formatting (final output)
        formatted = await self._format(analysis)
        self.output_stream.write({"phase": "formatting", "status": "complete"})
        self.sections["formatted"] = formatted

        # Return final result for agent to process further
        return formatted

    async def _fetch_data(self, topic: str):
        """Simulate data fetch."""
        await asyncio.sleep(1)  # Simulate I/O
        return [{"id": i, "value": i*2} for i in range(100)]

    async def _analyze(self, data):
        """Simulate analysis."""
        await asyncio.sleep(0.5)
        return {"mean": sum(d["value"] for d in data) / len(data)}

    async def _format(self, analysis):
        """Simulate formatting."""
        await asyncio.sleep(0.3)
        return f"Report: {analysis}"

# Integration with agent
async def agent_loop_with_streaming(agent, task):
    """Agent processes while tool streams to client."""
    tool = StreamingReportTool(output_stream=client_stream)

    # Tool call happens async; streaming doesn't block agent processing
    result = await tool.generate_report("sales_data")

    # Agent can immediately process the result without waiting for streaming completion
    agent_response = await agent.process(f"Summarize this: {result}")

    return agent_response
```

**Why this strategy?**

- **Async execution:** The tool uses `async/await` to stream results without blocking the agent loop. Each `output_stream.write()` is non-blocking.
- **Immediate feedback:** The client sees partial results (data fetched, analysis complete, etc.) before the report is fully formatted.
- **Agent continues:** The agent doesn't wait for streaming; it processes the final result as soon as the tool returns.
- **Separation of concerns:** Streaming logic (output_stream) is decoupled from agent logic, making the tool reusable across different stream types (WebSocket, file, memory buffer).

If you blocked on streaming, you'd freeze the agent loop—an antipattern in interactive systems.

---

## Problem 3: Permission Scoping for Subagent Access [TC2 Current - Permissions]

**Scenario:**
Your main agent delegates financial reporting tasks to a subagent, but the subagent should only access budget-related data, not payroll or proprietary revenue forecasts. The subagent doesn't know which databases are "safe" to query. You need to enforce a boundary without hardcoding database names in the subagent's code.

**Task:**
Design a permission system that:
1. Limits the subagent's tool access to a specific scope (budget databases)
2. Filters tool results if the subagent accidentally requests out-of-scope data
3. Works transparently—the subagent's code doesn't change
4. Logs all access attempts (in-scope and denied)

What's the difference between filtering at tool invocation vs. at result return?

---

### Solution

```python
from typing import Any, Callable, List, Optional
from enum import Enum
from functools import wraps
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

class DataScope(Enum):
    BUDGET = "budget"
    PAYROLL = "payroll"
    REVENUE = "revenue"

@dataclass
class PermissionPolicy:
    subagent_id: str
    allowed_scopes: List[DataScope]
    audit_log: List[tuple] = None

    def __post_init__(self):
        if self.audit_log is None:
            self.audit_log = []

class ScopedToolWrapper:
    """Wraps a tool to enforce permission boundaries."""

    def __init__(self, original_tool: Callable, policy: PermissionPolicy):
        self.original_tool = original_tool
        self.policy = policy

    def __call__(self, database: str, query: str) -> Any:
        """
        Enforces permission at invocation time (preferred approach).
        Fails fast before any database query runs.
        """
        scope = self._infer_scope_from_database(database)

        # Check permission BEFORE invoking tool
        if scope not in self.policy.allowed_scopes:
            self.policy.audit_log.append(("DENIED", database, query))
            logger.warning(
                f"Subagent {self.policy.subagent_id} denied access to {database} "
                f"(scope: {scope}). Allowed: {self.policy.allowed_scopes}"
            )
            return {"error": f"Access denied: {database} is outside your scope"}

        # Log approved access
        self.policy.audit_log.append(("ALLOWED", database, query))

        # Safe to invoke—permission already verified
        return self.original_tool(database=database, query=query)

    @staticmethod
    def _infer_scope_from_database(database: str) -> DataScope:
        """Map database name to scope."""
        mapping = {
            "budget_db": DataScope.BUDGET,
            "budget_forecast": DataScope.BUDGET,
            "payroll_db": DataScope.PAYROLL,
            "revenue_forecast": DataScope.REVENUE,
        }
        return mapping.get(database, DataScope.REVENUE)

# Setup: Main agent creates scoped subagent
def setup_subagent_with_permissions(subagent_id: str):
    """Initialize subagent with budget-only permissions."""

    policy = PermissionPolicy(
        subagent_id=subagent_id,
        allowed_scopes=[DataScope.BUDGET]
    )

    # Original database tool
    def query_database(database: str, query: str) -> str:
        # Imagine this queries the actual DB
        return f"Results from {database}: {query[:20]}..."

    # Wrap with permission enforcement
    scoped_query_tool = ScopedToolWrapper(query_database, policy)

    # Register scoped version with subagent
    subagent.register_tool("query_database", scoped_query_tool)

    return policy

# Usage
policy = setup_subagent_with_permissions("financial_subagent")

# Subagent attempts budget query (allowed)
result = subagent.tool("query_database", database="budget_db", query="SELECT * FROM Q2")
# → ALLOWED, result returned

# Subagent attempts payroll query (denied)
result = subagent.tool("query_database", database="payroll_db", query="SELECT * FROM salaries")
# → DENIED, error returned, audit logged

# Audit trail
print(policy.audit_log)
# [("ALLOWED", "budget_db", "SELECT * FROM Q2"),
#  ("DENIED", "payroll_db", "SELECT * FROM salaries")]
```

**Why this strategy?**

**Invocation-time filtering (preferred):**
- Fails before any work happens—saves computation
- Prevents the tool from even executing an unauthorized query
- Clear audit trail: denied attempts are logged before execution
- Subagent code is unchanged; permission is transparent

**Result-time filtering (alternative, less efficient):**
- Tool executes the query, then filters results—wastes I/O and computation
- Harder to audit: you've already queried a database you shouldn't have
- Subagent might log that it "succeeded" when actually its result was gutted

The wrapper pattern lets the main agent enforce policy without modifying subagent code.

---

## Problem 4: Orchestration of Sequential Subagents [TC2 Current - Orchestration]

**Scenario:**
You're building a compliance review system with two specialized subagents: one reviews regulatory requirements, the other reviews architectural design. They must run in order (regulation first, then architecture review against those regulations). The second subagent needs the output of the first as context. If the first subagent fails, the second shouldn't run.

**Task:**
Design an orchestration strategy that:
1. Runs subagents in a strict sequence
2. Passes output from subagent 1 to subagent 2
3. Stops the pipeline on failure
4. Logs each step with timing and outcome

Sketch the orchestration logic (pseudocode is fine). What state do you need to track?

---

### Solution

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, Any, List
import time
import logging

logger = logging.getLogger(__name__)

class StepStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class StepResult:
    name: str
    status: StepStatus
    output: Any = None
    error: str = None
    duration_ms: float = 0
    timestamp: float = field(default_factory=time.time)

@dataclass
class OrchestrationState:
    """Tracks pipeline execution state."""
    steps: Dict[str, StepResult] = field(default_factory=dict)
    failed_step: str = None

    def get_previous_output(self, step_name: str) -> Any:
        """Retrieve output of the previous step for context chaining."""
        if step_name == "regulatory_review":
            return None  # No prior step

        if step_name == "architecture_review":
            prev = self.steps.get("regulatory_review")
            return prev.output if prev else None

    def should_continue(self, next_step: str) -> bool:
        """Determine if pipeline should continue to next step."""
        if self.failed_step:
            logger.warning(f"Pipeline halted: {self.failed_step} failed. Skipping {next_step}")
            return False
        return True

class ComplianceOrchestrator:
    """Orchestrates sequential execution of compliance subagents."""

    def __init__(self, regulatory_agent, architecture_agent):
        self.regulatory_agent = regulatory_agent
        self.architecture_agent = architecture_agent
        self.state = OrchestrationState()

    async def run_pipeline(self, document: str) -> OrchestrationState:
        """Execute the compliance pipeline."""

        # Step 1: Regulatory Review
        await self._execute_step(
            name="regulatory_review",
            agent=self.regulatory_agent,
            input_data={"document": document}
        )

        # Step 2: Architecture Review (conditional on Step 1 success)
        if self.state.should_continue("architecture_review"):
            # Get output from regulatory review as context
            regulatory_context = self.state.get_previous_output("architecture_review")

            await self._execute_step(
                name="architecture_review",
                agent=self.architecture_agent,
                input_data={
                    "document": document,
                    "regulatory_requirements": regulatory_context
                }
            )
        else:
            # Mark step as skipped if pipeline failed
            self.state.steps["architecture_review"] = StepResult(
                name="architecture_review",
                status=StepStatus.SKIPPED
            )

        return self.state

    async def _execute_step(self, name: str, agent, input_data: Dict) -> StepResult:
        """Execute a single step and track state."""
        step = StepResult(name=name, status=StepStatus.RUNNING)
        self.state.steps[name] = step

        start = time.time()
        try:
            logger.info(f"Starting {name}...")

            # Execute the subagent
            output = await agent.process(input_data)

            # Record success
            step.status = StepStatus.SUCCESS
            step.output = output
            step.duration_ms = (time.time() - start) * 1000

            logger.info(f"✓ {name} completed in {step.duration_ms:.0f}ms")

        except Exception as e:
            # Record failure and halt pipeline
            step.status = StepStatus.FAILED
            step.error = str(e)
            step.duration_ms = (time.time() - start) * 1000
            self.state.failed_step = name

            logger.error(f"✗ {name} failed: {e}")

        return step

# Usage
async def main():
    regulatory = Subagent("regulatory")
    architecture = Subagent("architecture")

    orchestrator = ComplianceOrchestrator(regulatory, architecture)

    result = await orchestrator.run_pipeline(document="design_spec.md")

    # Inspect final state
    for step_name, step_result in result.steps.items():
        print(f"{step_name}: {step_result.status.value} ({step_result.duration_ms}ms)")

    if result.failed_step:
        print(f"Pipeline halted at: {result.failed_step}")
```

**Why this strategy?**

- **State machine approach:** `OrchestrationState` tracks each step's status, output, and timing. This makes the pipeline's state explicit and inspectable.
- **Fail-fast:** Once a step fails, the pipeline halts; subsequent steps are skipped. This prevents cascading errors and wasted computation.
- **Context chaining:** `get_previous_output()` retrieves the prior step's result, allowing the second subagent to act on regulatory findings.
- **Observability:** Each step is logged with timing and outcome, enabling debugging and monitoring.

An alternative (naive) approach would be to call agents sequentially in a linear script without tracking state—you'd lose visibility into timing, status, and failure points. The orchestrator pattern makes the pipeline's behavior explicit and resilient.

---

## Problem 5: Discrimination Pair – Hook vs. Agent Loop (Similar Surface, Different Deep Structure)

### Problem 5A: Caching with a Hook [TC2 Current - Hook]

**Scenario:**
Your agent frequently processes requests with identical or near-identical parameters. Each request triggers expensive LLM calls. You want to avoid re-processing identical requests within a 5-minute window.

**Task:**
Implement a hook that caches request-response pairs. Should the hook operate at the `before_agent_process` or `after_agent_process` stage? Why?

---

### Solution 5A

```python
from functools import lru_cache
from time import time
from typing import Optional, Tuple, Dict, Any
import hashlib

class CachingHook:
    """Cache identical requests for 5 minutes."""

    def __init__(self, ttl_seconds: int = 300):
        self.cache: Dict[str, Tuple[Any, float]] = {}  # hash -> (response, timestamp)
        self.ttl = ttl_seconds
        self.hits = 0
        self.misses = 0

    def _hash_request(self, request: Dict[str, Any]) -> str:
        """Create a deterministic hash of the request."""
        content = str(sorted(request.items()))
        return hashlib.sha256(content.encode()).hexdigest()[:8]

    def after_agent_process(self, request: Dict, response: Any) -> Optional[Any]:
        """
        Fired AFTER agent completes processing.
        This is the right stage for caching because:
        1. We have the final response from the agent
        2. We can store it for future identical requests
        """
        request_hash = self._hash_request(request)
        self.cache[request_hash] = (response, time())
        return response

    def before_agent_process(self, request: Dict) -> Optional[Any]:
        """
        Fired BEFORE agent processing.
        Check if this request is already cached.
        Return cached response if found; return None to proceed normally.
        """
        request_hash = self._hash_request(request)

        if request_hash in self.cache:
            cached_response, cached_time = self.cache[request_hash]

            # Check if cache is still fresh
            if time() - cached_time < self.ttl:
                self.hits += 1
                return cached_response  # Skip agent processing entirely
            else:
                # Cache expired; remove it
                del self.cache[request_hash]

        self.misses += 1
        return None  # Proceed to agent processing

# Usage
hook = CachingHook(ttl_seconds=300)
agent.register_hook("before_process", hook.before_agent_process)
agent.register_hook("after_process", hook.after_agent_process)

# First identical request → cache miss, hits agent, result cached
result1 = agent.process({"query": "What is 2+2?"})  # misses=1, hits=0

# Second identical request within 5 min → cache hit, returns immediately
result2 = agent.process({"query": "What is 2+2?"})  # misses=1, hits=1 (no agent call)

# Different request → cache miss
result3 = agent.process({"query": "What is 3+3?"})  # misses=2, hits=1
```

**Why this strategy?**

- **Two-stage approach:** `before_process` checks the cache; `after_process` populates it.
- **Early return:** A cache hit in `before_process` skips the entire agent loop, saving computation.
- **No double work:** By storing in `after_process`, we cache only after the agent has actually completed (not speculative results).

---

### Problem 5B: Caching Inside the Agent Loop [TC1 Review - Agent Loop]

**Scenario:**
Your agent processes a batch of similar questions about different products. Each question follows the pattern "What features does [product] have?" The agent's tool for fetching product specs is expensive. Caching at the hook level doesn't help because each request is technically different (different product name).

**Task:**
Implement caching inside the agent's tool execution loop, where you intercept and cache tool results. The agent doesn't know about the cache; it just makes tool calls as usual.

Show how this is different from Problem 5A, and why it's necessary in this case.

---

### Solution 5B

```python
from typing import Any, Dict, Callable
from functools import wraps
from time import time

class ToolResultCache:
    """Cache tool results, not request-response pairs."""

    def __init__(self, ttl_seconds: int = 300):
        self.cache: Dict[str, tuple] = {}  # (tool_name, args) -> (result, timestamp)
        self.ttl = ttl_seconds

    def cached_tool_wrapper(self, tool_func: Callable) -> Callable:
        """Wraps a tool to cache its results."""

        @wraps(tool_func)
        def wrapper(*args, **kwargs):
            # Create a cache key from tool name and arguments
            tool_name = tool_func.__name__
            cache_key = (tool_name, str(args), str(kwargs))

            # Check cache
            if cache_key in self.cache:
                result, cached_time = self.cache[cache_key]
                if time() - cached_time < self.ttl:
                    return result  # Return cached result

            # Cache miss: execute tool
            result = tool_func(*args, **kwargs)

            # Store in cache
            self.cache[cache_key] = (result, time())
            return result

        return wrapper

# Setup
cache = ToolResultCache(ttl_seconds=300)

# Tool definition
@agent.tool
def get_product_specs(product_name: str) -> Dict[str, Any]:
    """Fetch product specs (expensive operation)."""
    # Simulate expensive API call
    return {
        "name": product_name,
        "features": ["feature1", "feature2"],
        "price": 99.99
    }

# Wrap the tool with caching
cached_get_specs = cache.cached_tool_wrapper(get_product_specs)

# Register cached version
agent.register_tool("get_product_specs", cached_get_specs)

# Agent processes batch of requests
for product in ["laptop", "phone", "laptop"]:  # "laptop" appears twice
    response = agent.process(f"What features does {product} have?")
    # First laptop call: cache miss, tool executes
    # Phone call: cache miss, tool executes
    # Second laptop call: cache HIT, returns cached result without tool execution
```

**Why this strategy is different from 5A:**

| Aspect | 5A (Hook Cache) | 5B (Tool Result Cache) |
|--------|-----------------|----------------------|
| **What's cached?** | Entire request-response | Individual tool results |
| **Triggers cache hit?** | Identical requests | Identical tool invocations |
| **Use case** | Same user query repeated | Different queries reuse same tool calls |
| **Agent awareness** | Agent doesn't know | Agent doesn't know |

In 5B, each request is unique ("What features does laptop have?" vs. "What features does phone have?"), so request-level caching (5A) is useless. But both requests call the same tool with the same arguments (`get_product_specs("laptop")`), so tool-level caching catches the second laptop request.

**Discriminator insight:** 5A optimizes for request repetition; 5B optimizes for tool-call repetition within different requests. Choosing between them depends on your cache hit patterns.

---

## Problem 6: Streaming Callbacks in a Multi-Tool Scenario [TC1 Review - Streaming]

**Scenario:**
Your agent makes three parallel tool calls (fetch_data, compute_stats, generate_visualization). All three are long-running. You want to stream each tool's partial progress to the client as it progresses, without waiting for all three to finish.

**Task:**
Outline the agent loop modifications needed to support streaming callbacks from parallel tools. How does the agent know which progress event belongs to which tool?

---

### Solution

```python
from typing import Callable, Any, Dict
from asyncio import gather, create_task
from dataclasses import dataclass
import uuid

@dataclass
class StreamEvent:
    tool_id: str  # Unique ID for this tool invocation
    tool_name: str
    event_type: str  # "progress", "error", "complete"
    data: Any

class StreamingCallback:
    """Callback for tools to emit streaming progress."""

    def __init__(self, tool_id: str, send_to_client: Callable):
        self.tool_id = tool_id
        self.send_to_client = send_to_client

    def progress(self, message: str, percent: int = None):
        """Tool calls this to stream progress."""
        event = StreamEvent(
            tool_id=self.tool_id,
            tool_name=self._infer_tool_name(),
            event_type="progress",
            data={"message": message, "percent": percent}
        )
        self.send_to_client(event)

    def error(self, error_msg: str):
        """Tool calls this on error."""
        event = StreamEvent(
            tool_id=self.tool_id,
            tool_name=self._infer_tool_name(),
            event_type="error",
            data={"error": error_msg}
        )
        self.send_to_client(event)

    def _infer_tool_name(self) -> str:
        # In practice, pass tool_name to constructor
        return "unknown_tool"

class StreamingAgentLoop:
    """Agent loop with streaming support for parallel tools."""

    def __init__(self, agent, client_stream):
        self.agent = agent
        self.client_stream = client_stream
        self.tool_results = {}

    async def execute_parallel_tools(self, tasks: Dict[str, Dict]) -> Dict:
        """
        Execute multiple tools in parallel, streaming progress from each.

        Args:
            tasks: {"fetch_data": {...}, "compute_stats": {...}, ...}

        Returns:
            Merged results from all tools
        """

        # Create a unique ID for each tool invocation
        tool_calls = {}
        for tool_name, tool_input in tasks.items():
            tool_id = str(uuid.uuid4())[:8]

            # Create a streaming callback bound to this tool
            callback = StreamingCallback(
                tool_id=tool_id,
                send_to_client=self.client_stream.write
            )

            # Create task that passes callback to tool
            task = create_task(
                self._invoke_tool_with_callback(
                    tool_name=tool_name,
                    tool_input=tool_input,
                    callback=callback,
                    tool_id=tool_id
                )
            )
            tool_calls[tool_name] = task

        # Gather all results in parallel
        # As each tool runs, it calls callback.progress(), which streams to client
        results = await gather(*tool_calls.values(), return_exceptions=True)

        # Merge results
        merged = {}
        for (tool_name, _), result in zip(tool_calls.items(), results):
            if isinstance(result, Exception):
                merged[tool_name] = {"error": str(result)}
            else:
                merged[tool_name] = result

        return merged

    async def _invoke_tool_with_callback(
        self,
        tool_name: str,
        tool_input: Dict,
        callback: StreamingCallback,
        tool_id: str
    ) -> Any:
        """Invoke a tool, passing the streaming callback."""

        tool_func = self.agent.get_tool(tool_name)

        # Pass callback as a parameter so tool can emit events
        try:
            result = await tool_func(**tool_input, stream_callback=callback)

            # Emit completion event
            callback.progress(message=f"{tool_name} complete", percent=100)

            return result
        except Exception as e:
            callback.error(str(e))
            raise

# Tool implementation that uses streaming callback
async def fetch_data_with_streaming(source: str, stream_callback: StreamingCallback = None):
    """Tool that streams progress as it fetches data."""

    if stream_callback:
        stream_callback.progress("Connecting to database...", percent=10)

    # Simulate fetch
    data = await _query_database(source)

    if stream_callback:
        stream_callback.progress(f"Fetched {len(data)} records...", percent=60)

    # Simulate processing
    processed = await _process_data(data)

    if stream_callback:
        stream_callback.progress("Processing complete", percent=100)

    return processed

# Usage in agent
async def agent_loop():
    loop = StreamingAgentLoop(agent, client_stream=websocket)

    # Execute three tools in parallel
    results = await loop.execute_parallel_tools({
        "fetch_data": {"source": "db1"},
        "compute_stats": {"data_source": "cache"},
        "generate_visualization": {"format": "svg"}
    })

    # Client receives streaming events in real-time:
    # {tool_id: "a1b2", tool_name: "fetch_data", event_type: "progress", data: {...}}
    # {tool_id: "c3d4", tool_name: "compute_stats", event_type: "progress", data: {...}}
    # {tool_id: "a1b2", tool_name: "fetch_data", event_type: "complete", ...}
    # etc.
```

**Why this strategy?**

- **Unique tool_id:** Each tool invocation gets a unique ID, so the client knows which progress event belongs to which tool, even in parallel execution.
- **Callback passing:** Tools accept a `stream_callback` parameter, allowing them to emit events without being tightly coupled to the streaming infrastructure.
- **Non-blocking:** `gather()` runs all tools concurrently; the agent loop doesn't block waiting for one tool to finish before the next starts.
- **Client visibility:** The client sees real-time progress from all tools, improving perceived responsiveness.

---

## Problem 7: Subagent Failure Recovery [TC2 Current - Orchestration]

**Scenario:**
You have a pipeline with a critical subagent (financial calculations) and a fallback subagent (simplified estimation). If the critical one fails, you want to fall back to the simpler one with degraded results, not abort the entire pipeline.

**Task:**
Implement a retry-and-fallback pattern for subagents. Define:
1. When to retry vs. when to fall back
2. How many retries before giving up
3. What context to pass to the fallback subagent so it understands why it's running

---

### Solution

```python
from enum import Enum
from dataclasses import dataclass
from typing import Optional, Any
import logging

logger = logging.getLogger(__name__)

class ErrorSeverity(Enum):
    TRANSIENT = "transient"  # Retry-worthy (timeout, rate limit)
    PERMANENT = "permanent"  # Fall back (invalid input, auth failure)

@dataclass
class ExecutionContext:
    """Context passed to subagents, including failure info."""
    input_data: Any
    previous_error: Optional[str] = None
    attempt_number: int = 1
    is_fallback: bool = False
    degradation_reason: str = None

class SubagentExecutor:
    """Executes subagents with retry-and-fallback."""

    def __init__(self, primary_agent, fallback_agent):
        self.primary = primary_agent
        self.fallback = fallback_agent
        self.max_retries = 3

    async def execute_with_fallback(self, input_data: Any) -> tuple[Any, bool]:
        """
        Execute primary agent; fall back if needed.

        Returns:
            (result, is_degraded)
        """

        # Try primary agent with retries
        for attempt in range(1, self.max_retries + 1):
            context = ExecutionContext(
                input_data=input_data,
                attempt_number=attempt
            )

            try:
                logger.info(f"Executing primary agent (attempt {attempt}/{self.max_retries})")
                result = await self.primary.process(context)
                return result, False  # Success, not degraded

            except Exception as e:
                severity = self._classify_error(e)
                logger.warning(f"Primary agent failed (attempt {attempt}): {e}")

                if severity == ErrorSeverity.PERMANENT:
                    logger.info("Permanent error; skipping remaining retries, moving to fallback")
                    break  # Don't retry permanent errors
                elif severity == ErrorSeverity.TRANSIENT and attempt < self.max_retries:
                    logger.info(f"Transient error; retrying...")
                    continue  # Retry transient errors
                else:
                    break  # Exhausted retries

        # Primary agent failed; use fallback
        logger.info("Primary agent exhausted; falling back to secondary agent")

        fallback_context = ExecutionContext(
            input_data=input_data,
            previous_error=str(e),
            is_fallback=True,
            degradation_reason=f"Primary agent failed after {self.max_retries} attempts"
        )

        try:
            result = await self.fallback.process(fallback_context)
            return result, True  # Success, but degraded
        except Exception as fallback_error:
            logger.error(f"Fallback agent also failed: {fallback_error}")
            raise RuntimeError(f"Both agents failed. Primary: {e}, Fallback: {fallback_error}")

    @staticmethod
    def _classify_error(error: Exception) -> ErrorSeverity:
        """Determine if error is transient or permanent."""
        error_str = str(error).lower()

        # Transient errors (retry-worthy)
        if any(x in error_str for x in ["timeout", "rate limit", "temporarily unavailable"]):
            return ErrorSeverity.TRANSIENT

        # Permanent errors (fall back)
        if any(x in error_str for x in ["invalid", "unauthorized", "not found"]):
            return ErrorSeverity.PERMANENT

        # Default: assume transient
        return ErrorSeverity.TRANSIENT

# Subagent implementations
class FinancialCalculator:
    """Primary: precise calculations."""
    async def process(self, context: ExecutionContext) -> Dict:
        if context.is_fallback:
            raise RuntimeError("This agent shouldn't run in fallback mode")

        # Complex, precise calculation
        return {"result": "precise_calculation", "confidence": 0.95}

class SimplifiedEstimator:
    """Fallback: fast approximation."""
    async def process(self, context: ExecutionContext) -> Dict:
        if context.previous_error:
            logger.info(f"Fallback running due to: {context.degradation_reason}")

        # Fast but approximate
        return {
            "result": "rough_estimate",
            "confidence": 0.60,
            "degraded": context.is_fallback,
            "reason": context.degradation_reason
        }

# Usage
executor = SubagentExecutor(
    primary_agent=FinancialCalculator(),
    fallback_agent=SimplifiedEstimator()
)

result, is_degraded = await executor.execute_with_fallback(input_data={"amount": 1000})

if is_degraded:
    print("⚠️ Degraded: Using approximate result")
    print(f"Confidence: {result['confidence']}")
```

**Why this strategy?**

- **Error classification:** Transient errors (timeout, rate limit) trigger retries; permanent errors (invalid input, auth failure) skip straight to fallback. This avoids wasting retries on errors that won't resolve.
- **Retry budget:** `max_retries` prevents infinite loops.
- **Context chaining:** The fallback agent receives the primary's error message and knows it's running as a fallback, allowing it to adjust its behavior (e.g., return lower confidence, use approximation).
- **Transparency:** The result includes `is_degraded` flag, signaling that the client received a lower-quality answer but still got something.

---

## Problem 8: Multi-Agent Coordination with Shared State [TC2 Current - Subagents]

**Scenario:**
Two subagents (research agent, writing agent) must coordinate to produce a report. The research agent gathers sources and findings. The writing agent drafts the report using those findings. Both agents can run in parallel for the first 80% of their work, but the writing agent needs the final research output before it finalizes the report.

**Task:**
Design a shared state mechanism that allows:
1. Parallel execution of most work
2. Synchronization at a critical point (finalization)
3. Each agent to see the other's progress without blocking
4. Graceful degradation if one agent finishes late

---

### Solution

```python
from asyncio import Event, Lock, gather, sleep
from dataclasses import dataclass, field
from typing import Any, Dict, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class AgentPhase(Enum):
    GATHERING = "gathering"
    PROCESSING = "processing"
    FINALIZING = "finalizing"
    COMPLETE = "complete"

@dataclass
class SharedState:
    """Shared state between coordinating agents."""

    # Phase tracking
    research_phase: AgentPhase = AgentPhase.GATHERING
    writing_phase: AgentPhase = AgentPhase.GATHERING

    # Results accumulated so far
    research_findings: Dict[str, Any] = field(default_factory=dict)
    draft_sections: Dict[str, Any] = field(default_factory=dict)

    # Synchronization primitives
    research_ready_for_finalization: Event = field(default_factory=Event)
    writing_ready_for_finalization: Event = field(default_factory=Event)

    # Locks for thread-safe updates
    findings_lock: Lock = field(default_factory=Lock)
    sections_lock: Lock = field(default_factory=Lock)

    # Timeout tracking
    research_timeout_seconds: int = 60
    writing_timeout_seconds: int = 90

class CoordinatedAgent:
    """Base for agents that coordinate with shared state."""

    def __init__(self, name: str, shared_state: SharedState):
        self.name = name
        self.shared_state = shared_state

class ResearchAgent(CoordinatedAgent):
    """Gathers findings; signals when ready for writing finalization."""

    async def run(self, topic: str):
        logger.info(f"{self.name}: Starting research phase")
        self.shared_state.research_phase = AgentPhase.GATHERING

        # Phase 1: Initial research (can run in parallel with writing)
        findings = await self._gather_sources(topic)

        async with self.shared_state.findings_lock:
            self.shared_state.research_findings.update(findings)

        logger.info(f"{self.name}: Found {len(findings)} sources")

        # Phase 2: Processing (can run in parallel with writing draft)
        self.shared_state.research_phase = AgentPhase.PROCESSING
        processed = await self._process_findings(findings)

        async with self.shared_state.findings_lock:
            self.shared_state.research_findings.update(processed)

        logger.info(f"{self.name}: Processing complete")

        # Phase 3: Ready for finalization; signal the writing agent
        logger.info(f"{self.name}: Research ready for finalization")
        self.shared_state.research_phase = AgentPhase.FINALIZING
        self.shared_state.research_ready_for_finalization.set()

        # Wait for writing agent to finalize (with timeout for graceful degradation)
        try:
            await asyncio.wait_for(
                self.shared_state.writing_ready_for_finalization.wait(),
                timeout=self.shared_state.research_timeout_seconds
            )
            logger.info(f"{self.name}: Writing agent finalized; research complete")
        except asyncio.TimeoutError:
            logger.warning(f"{self.name}: Writing agent slow; finalizing without sync")

        self.shared_state.research_phase = AgentPhase.COMPLETE

    async def _gather_sources(self, topic: str) -> Dict:
        await sleep(1)  # Simulate research
        return {"source1": "data1", "source2": "data2"}

    async def _process_findings(self, findings: Dict) -> Dict:
        await sleep(1)  # Simulate processing
        return {"processed": True}

class WritingAgent(CoordinatedAgent):
    """Drafts report; waits for research findings before finalizing."""

    async def run(self, topic: str):
        logger.info(f"{self.name}: Starting writing phase")
        self.shared_state.writing_phase = AgentPhase.GATHERING

        # Phase 1: Start drafting outline (doesn't need research yet)
        outline = await self._draft_outline(topic)

        async with self.shared_state.sections_lock:
            self.shared_state.draft_sections["outline"] = outline

        logger.info(f"{self.name}: Outline complete")

        # Phase 2: Draft sections in parallel with research
        self.shared_state.writing_phase = AgentPhase.PROCESSING
        sections = await self._draft_sections(topic)

        async with self.shared_state.sections_lock:
            self.shared_state.draft_sections.update(sections)

        logger.info(f"{self.name}: Sections drafted")

        # Phase 3: Wait for research to be ready before finalizing
        logger.info(f"{self.name}: Waiting for research to finalize...")
        self.shared_state.writing_phase = AgentPhase.FINALIZING

        try:
            await asyncio.wait_for(
                self.shared_state.research_ready_for_finalization.wait(),
                timeout=self.shared_state.writing_timeout_seconds
            )
            logger.info(f"{self.name}: Research ready; incorporating findings")
        except asyncio.TimeoutError:
            logger.warning(f"{self.name}: Research timeout; proceeding with incomplete findings")

        # Fetch latest research findings
        async with self.shared_state.findings_lock:
            latest_findings = self.shared_state.research_findings.copy()

        # Finalize with research findings
        final_report = await self._finalize_report(latest_findings)

        async with self.shared_state.sections_lock:
            self.shared_state.draft_sections["final_report"] = final_report

        logger.info(f"{self.name}: Report finalized")

        # Signal research agent that we're done
        self.shared_state.writing_ready_for_finalization.set()
        self.shared_state.writing_phase = AgentPhase.COMPLETE

    async def _draft_outline(self, topic: str) -> Dict:
        await sleep(0.5)
        return {"outline": "1. Intro\n2. Body\n3. Conclusion"}

    async def _draft_sections(self, topic: str) -> Dict:
        await sleep(1)
        return {"section1": "...", "section2": "..."}

    async def _finalize_report(self, findings: Dict) -> str:
        await sleep(0.5)
        return f"Final report incorporating {len(findings)} findings"

# Usage
async def main():
    state = SharedState()

    research = ResearchAgent("Research", state)
    writing = WritingAgent("Writing", state)

    # Run both agents concurrently
    await gather(
        research.run("machine learning"),
        writing.run("machine learning")
    )

    print(f"Final report: {state.draft_sections.get('final_report')}")
    print(f"Research phase: {state.research_phase.value}")
    print(f"Writing phase: {state.writing_phase.value}")
```

**Why this strategy?**

- **Parallel early work:** Both agents work independently during gathering/processing phases, maximizing parallelism.
- **Synchronization via Events:** `asyncio.Event` allows agents to signal readiness without blocking. The writing agent waits for research to signal, but doesn't continuously poll.
- **Locks for shared data:** `findings_lock` and `sections_lock` prevent race conditions when agents read/write shared state.
- **Graceful degradation:** If one agent times out (with `asyncio.wait_for`), the other continues with partial data rather than failing entirely.
- **Phase tracking:** `research_phase` and `writing_phase` fields let each agent see the other's progress without tight coupling.

---

## Problem 9: Testing a Subagent with Mocked Tools [TC1 Review - Custom Tools]

**Scenario:**
You have a data-processing subagent that calls three tools: `fetch_data`, `validate_schema`, and `save_results`. You want to test the subagent's logic without hitting real databases. The subagent doesn't know which tools are mocked; it just calls them as usual.

**Task:**
Write a test that:
1. Mocks all three tools to return predictable results
2. Verifies the subagent calls them in the expected order
3. Verifies the subagent handles validation failures gracefully

---

### Solution

```python
import pytest
from unittest.mock import AsyncMock, patch, call
from typing import Any, Dict

class DataProcessingSubagent:
    """Subagent that processes data via tool calls."""

    def __init__(self, tools: Dict[str, Any]):
        self.tools = tools

    async def process(self, dataset_id: str) -> Dict:
        """Process data through a pipeline."""

        # Step 1: Fetch data
        data = await self.tools["fetch_data"](dataset_id)

        # Step 2: Validate schema
        validation_result = await self.tools["validate_schema"](data)

        if not validation_result["valid"]:
            return {
                "status": "failed",
                "reason": validation_result["error"],
                "data": None
            }

        # Step 3: Save results
        save_result = await self.tools["save_results"](data)

        return {
            "status": "success",
            "data": data,
            "saved_location": save_result["location"]
        }

@pytest.mark.asyncio
async def test_subagent_successful_processing():
    """Test happy path: all tools succeed."""

    # Create mocks
    mock_fetch = AsyncMock(return_value={"rows": [1, 2, 3]})
    mock_validate = AsyncMock(return_value={"valid": True})
    mock_save = AsyncMock(return_value={"location": "/data/saved"})

    # Inject mocks
    tools = {
        "fetch_data": mock_fetch,
        "validate_schema": mock_validate,
        "save_results": mock_save,
    }

    subagent = DataProcessingSubagent(tools)

    # Execute
    result = await subagent.process("dataset_123")

    # Assertions
    assert result["status"] == "success"
    assert result["data"] == {"rows": [1, 2, 3]}
    assert result["saved_location"] == "/data/saved"

    # Verify call order (tools called in sequence)
    mock_fetch.assert_called_once_with("dataset_123")
    mock_validate.assert_called_once_with({"rows": [1, 2, 3]})
    mock_save.assert_called_once_with({"rows": [1, 2, 3]})

@pytest.mark.asyncio
async def test_subagent_validation_failure():
    """Test failure path: validation fails."""

    # Create mocks with validation failure
    mock_fetch = AsyncMock(return_value={"rows": []})  # Empty data
    mock_validate = AsyncMock(return_value={
        "valid": False,
        "error": "Schema validation failed: empty dataset"
    })
    mock_save = AsyncMock()  # Should not be called

    tools = {
        "fetch_data": mock_fetch,
        "validate_schema": mock_validate,
        "save_results": mock_save,
    }

    subagent = DataProcessingSubagent(tools)

    # Execute
    result = await subagent.process("dataset_456")

    # Assertions
    assert result["status"] == "failed"
    assert result["reason"] == "Schema validation failed: empty dataset"
    assert result["data"] is None

    # Verify save was never called (early exit on validation failure)
    mock_fetch.assert_called_once()
    mock_validate.assert_called_once()
    mock_save.assert_not_called()

@pytest.mark.asyncio
async def test_subagent_tool_call_order():
    """Test that tools are called in the expected order."""

    call_order = []

    async def mock_fetch(*args, **kwargs):
        call_order.append("fetch")
        return {"rows": [1, 2]}

    async def mock_validate(*args, **kwargs):
        call_order.append("validate")
        return {"valid": True}

    async def mock_save(*args, **kwargs):
        call_order.append("save")
        return {"location": "/saved"}

    tools = {
        "fetch_data": mock_fetch,
        "validate_schema": mock_validate,
        "save_results": mock_save,
    }

    subagent = DataProcessingSubagent(tools)
    await subagent.process("dataset_789")

    # Assert order
    assert call_order == ["fetch", "validate", "save"]
```

**Why this strategy?**

- **AsyncMock:** Allows mocking of async tool calls; `AsyncMock.return_value` sets the tool's result.
- **Injection:** Tools are passed as dependencies, making the subagent testable without real tool implementations.
- **Call tracking:** `mock.assert_called_once_with()` and `mock.assert_not_called()` verify the subagent called tools with correct arguments and skipped calls when appropriate.
- **Call order tracking:** The `call_order` list verifies the subagent executed tools in the expected sequence.

This approach isolates the subagent's logic from tool implementations, enabling fast, reliable unit tests.

---

## Problem 10: Designing a Tool That Requires User Confirmation [TC2 Current - Hooks & Permissions]

**Scenario:**
Your agent has a tool to delete database records. Before the tool executes, you want to:
1. Ask the user for confirmation
2. Log the deletion attempt (for audit trail)
3. Only proceed if the user approves within 30 seconds
4. Report the outcome back to the agent

**Task:**
Design a hook and confirmation mechanism that intercepts tool calls, requests user approval, and either allows or blocks execution. Should you hook at the tool level or the agent level?

---

### Solution

```python
from asyncio import wait_for, TimeoutError as AsyncTimeoutError
from dataclasses import dataclass
from typing import Callable, Any, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class ConfirmationRequest:
    """Request sent to user for approval."""
    tool_name: str
    arguments: dict
    timestamp: datetime
    confirmation_id: str  # Unique ID to match response
    timeout_seconds: int = 30

class ConfirmationManager:
    """Manages tool execution confirmations."""

    def __init__(self, user_io):
        self.user_io = user_io  # Interface to send messages to user
        self.pending_confirmations = {}  # ID -> Future or Event

    async def request_confirmation(self, request: ConfirmationRequest) -> bool:
        """
        Send confirmation request to user; wait for response.
        Returns True if approved, False if denied or timeout.
        """

        logger.info(
            f"Requesting confirmation for {request.tool_name} "
            f"with args {request.arguments}"
        )

        # Create a future to hold the user's response
        from asyncio import Future
        response_future = Future()
        self.pending_confirmations[request.confirmation_id] = response_future

        try:
            # Send confirmation request to user
            await self.user_io.send_confirmation_request(request)

            # Wait for user response (with timeout)
            approved = await wait_for(
                response_future,
                timeout=request.timeout_seconds
            )

            return approved

        except AsyncTimeoutError:
            logger.warning(
                f"Confirmation timeout for {request.tool_name} "
                f"(ID: {request.confirmation_id}). Denying request."
            )
            return False

        finally:
            # Clean up
            self.pending_confirmations.pop(request.confirmation_id, None)

    def handle_user_response(self, confirmation_id: str, approved: bool):
        """Called when user responds to confirmation request."""
        future = self.pending_confirmations.get(confirmation_id)
        if future:
            future.set_result(approved)
            logger.info(f"User response: {confirmation_id} -> {approved}")

class ConfirmationHook:
    """Hook that intercepts dangerous tool calls and requests confirmation."""

    # Tools that require confirmation
    DANGEROUS_TOOLS = {"delete_records", "drop_table", "purge_cache"}

    def __init__(self, confirmation_manager: ConfirmationManager):
        self.confirmation_manager = confirmation_manager
        self.audit_log = []

    async def before_tool_execution(
        self,
        tool_name: str,
        arguments: dict
    ) -> tuple[bool, Optional[str]]:
        """
        Hook fired BEFORE tool execution.
        Returns (should_proceed, block_reason).

        This is the right place to intercept—before any tool runs.
        """

        if tool_name not in self.DANGEROUS_TOOLS:
            # Non-dangerous tool; proceed normally
            return True, None

        # Dangerous tool; request confirmation
        import uuid
        confirmation_id = str(uuid.uuid4())[:8]

        request = ConfirmationRequest(
            tool_name=tool_name,
            arguments=arguments,
            timestamp=datetime.now(),
            confirmation_id=confirmation_id
        )

        approved = await self.confirmation_manager.request_confirmation(request)

        # Log for audit trail
        self.audit_log.append({
            "tool": tool_name,
            "arguments": arguments,
            "approved": approved,
            "timestamp": datetime.now()
        })

        if approved:
            logger.info(f"User approved: {tool_name}")
            return True, None
        else:
            logger.warning(f"User denied: {tool_name}")
            return False, f"User denied execution of {tool_name}"

class ConfirmationBlockedError(Exception):
    """Raised when a tool is blocked by user denial."""
    pass

class ConfirmedToolWrapper:
    """Wraps tools to enforce confirmation before execution."""

    def __init__(self, tool: Callable, hook: ConfirmationHook):
        self.tool = tool
        self.hook = hook

    async def __call__(self, **kwargs) -> Any:
        """Execute tool, with confirmation check first."""

        tool_name = self.tool.__name__

        # Check confirmation hook
        should_proceed, block_reason = await self.hook.before_tool_execution(
            tool_name=tool_name,
            arguments=kwargs
        )

        if not should_proceed:
            raise ConfirmationBlockedError(block_reason)

        # Confirmation passed; execute tool
        return await self.tool(**kwargs)

# Usage and integration
async def setup_confirmed_tools(agent, confirmation_manager):
    """Wrap dangerous tools with confirmation."""

    hook = ConfirmationHook(confirmation_manager)

    # Define a dangerous tool
    async def delete_records(table: str, condition: str) -> dict:
        """Delete records from a table."""
        logger.info(f"Deleting from {table} where {condition}")
        return {"deleted": 100, "table": table}

    # Wrap with confirmation
    confirmed_delete = ConfirmedToolWrapper(delete_records, hook)

    # Register wrapped version
    agent.register_tool("delete_records", confirmed_delete)

    return hook

# Client interface for responding to confirmations
class UserIOInterface:
    """Interface for communicating with user."""

    async def send_confirmation_request(self, request: ConfirmationRequest):
        """Send confirmation request to user (via chat, UI, etc.)."""
        message = (
            f"Tool '{request.tool_name}' requires confirmation.\n"
            f"Arguments: {request.arguments}\n"
            f"Approve? (respond with yes/no)"
        )
        await self._send_to_user(message, request.confirmation_id)

    async def _send_to_user(self, message: str, confirmation_id: str):
        """Send message and track the confirmation_id for response matching."""
        pass

# Usage in agent
async def agent_with_confirmations():
    user_io = UserIOInterface()
    confirmation_mgr = ConfirmationManager(user_io)

    hook = await setup_confirmed_tools(agent, confirmation_mgr)

    # Agent attempts to delete records
    try:
        result = await agent.tool(
            "delete_records",
            table="users",
            condition="inactive = true"
        )
        print(f"Deletion approved and executed: {result}")
    except ConfirmationBlockedError as e:
        print(f"Deletion blocked: {e}")

    # Check audit log
    for entry in hook.audit_log:
        print(f"{entry['tool']}: {'approved' if entry['approved'] else 'denied'}")
```

**Why this strategy?**

- **Hook at agent level, not tool level:** The hook intercepts the tool call before execution. This is where you can request user input and decide whether to proceed.
- **Async confirmation:** `wait_for()` with timeout ensures the user has 30 seconds to respond; after that, the tool is blocked.
- **Audit trail:** Every dangerous tool call (approved or denied) is logged, enabling compliance and debugging.
- **Transparent to subagents:** The subagent code doesn't know about confirmations; they're enforced at the wrapper level, making the pattern reusable across different agents.
- **Error signaling:** `ConfirmationBlockedError` tells the agent that the tool was denied, allowing it to handle the failure gracefully (retry with different args, fall back, etc.).

---

## Reflection: Interleaving Strategy

As you work through these problems, notice the mix:
- **25% current (TC2):** Problems 1, 3, 4, 5A, 7, 8, 10 introduce hooks, permissions, subagents, and orchestration patterns.
- **75% review (TC1):** Problems 2, 5B, 6, 9 revisit agent-loop, custom-tools, and streaming from TC1, but in new contexts.

**Discrimination pair (5A vs. 5B):**
- **5A (request-level caching):** Caches entire request-response pairs; hits when identical requests repeat.
- **5B (tool-level caching):** Caches individual tool results; hits when different requests reuse the same tool call.

Both use caching, but the level of caching differs based on the access pattern. Advanced learners should recognize this distinction and choose the right strategy based on the problem's characteristics.

**Strategy variety:** Each problem uses a different strategy—hooks, wrappers, orchestration, shared state, testing, confirmations. No two consecutive problems use the same pattern, keeping the challenge fresh.
