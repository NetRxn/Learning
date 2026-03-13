# TC2: Control & Multi-Agent — Worked Examples with Backward Fading

## Topic Overview
Building a multi-agent orchestrator with an Opus lead agent delegating tasks to Sonnet worker agents, implementing logging hooks, permission boundaries, and structured handoffs. This sprint focuses on agent composition, control flow, and inter-agent communication.

---

## Full Worked Example: Research Orchestrator with Lead + Workers

**Problem Statement:** Build a research agent system where an Opus lead agent coordinates 3 specialized Sonnet worker agents (web researcher, document analyzer, synthesis writer) with permission boundaries, structured handoffs, audit logging, and graceful error recovery.

### Step 1: Define Agent Interfaces and Tool Contracts
**Self-explanation prompt:** Why is defining explicit interfaces before implementation crucial for multi-agent systems?

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncGenerator
from enum import Enum

class AgentRole(Enum):
    LEAD = "lead"
    RESEARCHER = "researcher"
    ANALYZER = "analyzer"
    WRITER = "writer"

@dataclass
class HandoffPayload:
    """Structured message for agent-to-agent handoffs."""
    source_agent: str
    target_agent: str
    task_description: str
    context: dict
    constraints: list[str]  # e.g., ["max_tokens:1000", "no_external_calls"]
    timestamp: str

class WorkerAgent(ABC):
    """Base class for all worker agents."""

    def __init__(self, agent_id: str, role: AgentRole):
        self.agent_id = agent_id
        self.role = role
        self.execution_log = []

    @abstractmethod
    async def process(self, payload: HandoffPayload) -> str:
        """Process a handoff and return results."""
        pass

    def log_execution(self, event: str, details: dict = None):
        """Log all agent actions for audit trail."""
        self.execution_log.append({
            "agent_id": self.agent_id,
            "event": event,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        })
```

**Why this works:** Interfaces define contracts that allow loose coupling. Each worker can be implemented independently, tested in isolation, and swapped without changing the orchestrator. The `HandoffPayload` makes inter-agent communication explicit and auditable.

---

### Step 2: Implement Worker Agents with Permission Boundaries
**Self-explanation prompt:** Why should each worker have explicit permission boundaries rather than full API access?

```python
import anthropic
from datetime import datetime
from typing import Optional

class ResearchWorker(WorkerAgent):
    """Worker agent for web research with bounded permissions."""

    def __init__(self, agent_id: str):
        super().__init__(agent_id, AgentRole.RESEARCHER)
        self.client = anthropic.Anthropic()
        self.allowed_tools = ["search_web", "fetch_url"]  # No database access
        self.max_requests = 5  # Bound the number of research calls

    async def process(self, payload: HandoffPayload) -> str:
        """Execute research task with constraints."""
        self.log_execution("handoff_received", {
            "task": payload.task_description,
            "constraints": payload.constraints
        })

        # Enforce constraints
        if "max_tokens:500" in payload.constraints:
            max_tokens = 500
        else:
            max_tokens = 1000

        tools = [
            {
                "name": "search_web",
                "description": "Search the web for information",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query"},
                        "num_results": {"type": "integer", "minimum": 1, "maximum": 5}
                    },
                    "required": ["query"]
                }
            }
        ]

        messages = [
            {
                "role": "user",
                "content": f"""Research task: {payload.task_description}\n\nContext: {payload.context}\n\nConstraints: {', '.join(payload.constraints)}"""
            }
        ]

        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=max_tokens,
                tools=tools,
                messages=messages
            )

            self.log_execution("task_completed", {
                "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
                "tool_calls": len([b for b in response.content if b.type == "tool_use"])
            })

            # Extract final text response
            result = "\n".join(
                block.text for block in response.content if block.type == "text"
            )
            return result or "No results found"

        except Exception as e:
            self.log_execution("task_failed", {"error": str(e)})
            raise

class DocumentAnalyzer(WorkerAgent):
    """Worker agent for document analysis."""

    def __init__(self, agent_id: str):
        super().__init__(agent_id, AgentRole.ANALYZER)
        self.client = anthropic.Anthropic()
        self.allowed_tools = ["extract_text", "summarize"]  # No external calls

    async def process(self, payload: HandoffPayload) -> str:
        """Analyze documents with strict scope."""
        self.log_execution("analysis_started", {
            "task": payload.task_description
        })

        # Enforce token constraint
        max_tokens = 2000

        messages = [
            {
                "role": "user",
                "content": f"""Analyze the following: {payload.task_description}\n\nProvided context:\n{payload.context}"""
            }
        ]

        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=max_tokens,
                messages=messages
            )

            self.log_execution("analysis_complete", {
                "tokens_used": response.usage.input_tokens + response.usage.output_tokens
            })

            result = "\n".join(
                block.text for block in response.content if block.type == "text"
            )
            return result

        except Exception as e:
            self.log_execution("analysis_failed", {"error": str(e)})
            raise

class SynthesisWriter(WorkerAgent):
    """Worker agent for synthesis and writing."""

    def __init__(self, agent_id: str):
        super().__init__(agent_id, AgentRole.WRITER)
        self.client = anthropic.Anthropic()

    async def process(self, payload: HandoffPayload) -> str:
        """Synthesize results into coherent output."""
        self.log_execution("synthesis_started", {})

        messages = [
            {
                "role": "user",
                "content": f"""Synthesize the following research results into a coherent summary:\n\n{payload.context}"""
            }
        ]

        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1500,
                messages=messages
            )

            self.log_execution("synthesis_complete", {})
            result = "\n".join(
                block.text for block in response.content if block.type == "text"
            )
            return result

        except Exception as e:
            self.log_execution("synthesis_failed", {"error": str(e)})
            raise
```

**Why this works:** Limiting tools per agent reduces the blast radius of any single worker's mistakes. Each worker gets exactly what it needs—no more, no less. Logging every action creates an audit trail for debugging and compliance.

---

### Step 3: Build the Lead Agent Orchestrator
**Self-explanation prompt:** Why does the lead agent use a state machine pattern rather than linear logic?

```python
from enum import Enum as StateEnum
from typing import List

class OrchestrationState(StateEnum):
    INIT = "init"
    PLANNING = "planning"
    DELEGATING = "delegating"
    MONITORING = "monitoring"
    SYNTHESIS = "synthesis"
    COMPLETE = "complete"
    ERROR = "error"

class LeadAgent:
    """Lead agent that orchestrates worker agents."""

    def __init__(self):
        self.client = anthropic.Anthropic()
        self.workers = {
            "researcher": ResearchWorker("worker_research_1"),
            "analyzer": DocumentAnalyzer("worker_analyzer_1"),
            "writer": SynthesisWriter("worker_synthesis_1")
        }
        self.state = OrchestrationState.INIT
        self.orchestration_log = []
        self.worker_results = {}

    async def run(self, user_goal: str) -> str:
        """Main orchestration loop."""
        self.log_event("orchestration_started", {"goal": user_goal})

        try:
            # State 1: Planning
            self.state = OrchestrationState.PLANNING
            plan = await self._create_plan(user_goal)

            # State 2: Delegating
            self.state = OrchestrationState.DELEGATING
            delegation_results = await self._delegate_tasks(plan)

            # State 3: Synthesis
            self.state = OrchestrationState.SYNTHESIS
            final_result = await self._synthesize_results(delegation_results)

            self.state = OrchestrationState.COMPLETE
            self.log_event("orchestration_complete", {"result_summary": final_result[:100]})

            return final_result

        except Exception as e:
            self.state = OrchestrationState.ERROR
            self.log_event("orchestration_failed", {"error": str(e)})
            raise

    async def _create_plan(self, user_goal: str) -> dict:
        """Use Opus to create a multi-agent plan."""
        self.log_event("planning_started", {})

        planning_prompt = f"""You are coordinating a team of specialized agents to accomplish this goal:
{user_goal}

You have:
- A RESEARCHER agent (web search, information gathering)
- An ANALYZER agent (document analysis, information extraction)
- A WRITER agent (synthesis, report generation)

Create a detailed plan that assigns tasks to each agent. Return a JSON object with this structure:
{{
  "research_tasks": ["task1", "task2"],
  "analysis_tasks": ["task1"],
  "synthesis_task": "final synthesis task"
}}"""

        response = self.client.messages.create(
            model="claude-3-opus-20250219",
            max_tokens=2000,
            messages=[{"role": "user", "content": planning_prompt}]
        )

        plan_text = "\n".join(
            block.text for block in response.content if block.type == "text"
        )
        self.log_event("plan_created", {"plan": plan_text})

        return {"plan": plan_text}

    async def _delegate_tasks(self, plan: dict) -> dict:
        """Delegate tasks to workers sequentially."""
        self.log_event("delegation_started", {})

        results = {}

        # Research phase
        research_payload = HandoffPayload(
            source_agent="lead",
            target_agent="researcher",
            task_description=plan["plan"][:500],  # Truncate for brevity
            context={"user_goal": "research phase"},
            constraints=["max_tokens:1000", "max_requests:5"]
        )

        try:
            research_result = await self.workers["researcher"].process(research_payload)
            results["research"] = research_result
            self.log_event("research_complete", {})
        except Exception as e:
            self.log_event("research_failed", {"error": str(e)})
            results["research"] = f"Research failed: {str(e)}"

        # Analysis phase (using research results as context)
        analysis_payload = HandoffPayload(
            source_agent="lead",
            target_agent="analyzer",
            task_description="Analyze the research results",
            context={"research_results": results["research"]},
            constraints=["max_tokens:2000"]
        )

        try:
            analysis_result = await self.workers["analyzer"].process(analysis_payload)
            results["analysis"] = analysis_result
            self.log_event("analysis_complete", {})
        except Exception as e:
            self.log_event("analysis_failed", {"error": str(e)})
            results["analysis"] = f"Analysis failed: {str(e)}"

        return results

    async def _synthesize_results(self, results: dict) -> str:
        """Use synthesis worker to create final output."""
        self.log_event("synthesis_started", {})

        synthesis_payload = HandoffPayload(
            source_agent="lead",
            target_agent="writer",
            task_description="Create a final report",
            context=results,
            constraints=["max_tokens:1500"]
        )

        final = await self.workers["writer"].process(synthesis_payload)
        return final

    def log_event(self, event: str, details: dict = None):
        """Log orchestration events."""
        self.orchestration_log.append({
            "event": event,
            "state": self.state.value,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        })

    def get_full_audit_log(self) -> dict:
        """Return complete audit trail from all agents."""
        all_logs = {
            "orchestration": self.orchestration_log,
            "workers": {
                agent_id: worker.execution_log
                for agent_id, worker in self.workers.items()
            }
        }
        return all_logs
```

**Why this works:** A state machine ensures transitions are explicit and failures can be caught at each stage. Logging at the orchestrator level plus worker level creates a complete audit trail. Sequential delegation (research → analysis → synthesis) ensures dependencies are respected.

---

### Step 4: Implement Error Recovery with Retry Logic
**Self-explanation prompt:** Why do we retry failed tasks with exponential backoff instead of failing immediately?

```python
import asyncio
from functools import wraps

class RetryConfig:
    """Configuration for retry behavior."""
    def __init__(
        self,
        max_attempts: int = 3,
        initial_delay: float = 1.0,
        max_delay: float = 30.0,
        backoff_factor: float = 2.0
    ):
        self.max_attempts = max_attempts
        self.initial_delay = initial_delay
        self.max_delay = max_delay
        self.backoff_factor = backoff_factor

def with_retry(config: RetryConfig):
    """Decorator for async functions with exponential backoff."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            delay = config.initial_delay
            last_exception = None

            for attempt in range(config.max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < config.max_attempts - 1:
                        print(f"Attempt {attempt + 1} failed, retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        delay = min(delay * config.backoff_factor, config.max_delay)
                    else:
                        print(f"All {config.max_attempts} attempts failed")

            raise last_exception

        return wrapper
    return decorator

class ResilientLeadAgent(LeadAgent):
    """Lead agent with enhanced error recovery."""

    def __init__(self):
        super().__init__()
        self.retry_config = RetryConfig(max_attempts=3)

    @with_retry(RetryConfig(max_attempts=3))
    async def _delegate_tasks_resilient(self, plan: dict) -> dict:
        """Delegate tasks with automatic retry on failure."""
        results = {}

        # Research with retry
        research_payload = HandoffPayload(
            source_agent="lead",
            target_agent="researcher",
            task_description=plan["plan"][:500],
            context={"user_goal": "research phase"},
            constraints=["max_tokens:1000"]
        )

        try:
            research_result = await self.workers["researcher"].process(research_payload)
            results["research"] = research_result
        except Exception as e:
            self.log_event("research_failed_will_retry", {"error": str(e)})
            raise  # Re-raise to trigger retry

        return results

    async def run_resilient(self, user_goal: str) -> str:
        """Run orchestration with enhanced error recovery."""
        try:
            plan = await self._create_plan(user_goal)
            results = await self._delegate_tasks_resilient(plan)
            final = await self._synthesize_results(results)
            return final
        except Exception as e:
            self.log_event("orchestration_failed", {"error": str(e), "final": True})
            raise
```

**Why this works:** Transient failures (network hiccups, temporary API slowdowns) often resolve themselves. Exponential backoff prevents hammering a struggling service. Logging each retry attempt provides visibility into system health.

---

### Step 5: Add Permission Boundary Enforcement
**Self-explanation prompt:** Why should permission checks happen both before and after agent execution?

```python
from enum import Enum as PermEnum

class Permission(PermEnum):
    SEARCH_WEB = "search_web"
    FETCH_EXTERNAL = "fetch_external"
    ANALYZE_DOCUMENTS = "analyze_documents"
    WRITE_OUTPUT = "write_output"
    ACCESS_DATABASE = "access_database"

class PermissionValidator:
    """Validates agent actions against permissions."""

    def __init__(self):
        self.worker_permissions = {
            "researcher": {Permission.SEARCH_WEB, Permission.FETCH_EXTERNAL},
            "analyzer": {Permission.ANALYZE_DOCUMENTS},
            "writer": {Permission.WRITE_OUTPUT}
        }

    def can_perform(self, agent_id: str, permission: Permission) -> bool:
        """Check if agent has required permission."""
        return permission in self.worker_permissions.get(agent_id, set())

    def validate_handoff(self, payload: HandoffPayload) -> bool:
        """Validate that handoff respects permission boundaries."""
        target = payload.target_agent

        # Extract required permissions from constraints
        required_perms = self._extract_required_perms(payload.constraints)

        for perm in required_perms:
            if not self.can_perform(target, perm):
                return False

        return True

    def _extract_required_perms(self, constraints: list[str]) -> set:
        """Parse constraints to determine required permissions."""
        perms = set()
        for constraint in constraints:
            if "search" in constraint:
                perms.add(Permission.SEARCH_WEB)
            if "external" in constraint:
                perms.add(Permission.FETCH_EXTERNAL)
        return perms

# Integrate into LeadAgent
class SecureLeadAgent(LeadAgent):
    """Lead agent with permission enforcement."""

    def __init__(self):
        super().__init__()
        self.permission_validator = PermissionValidator()

    async def _delegate_tasks_secure(self, plan: dict) -> dict:
        """Delegate with permission validation."""
        results = {}

        research_payload = HandoffPayload(
            source_agent="lead",
            target_agent="researcher",
            task_description=plan["plan"][:500],
            context={"user_goal": "research"},
            constraints=["max_tokens:1000", "search_web"]
        )

        # Validate before delegation
        if not self.permission_validator.validate_handoff(research_payload):
            raise PermissionError(
                f"Agent {research_payload.target_agent} does not have required permissions"
            )

        result = await self.workers["researcher"].process(research_payload)
        results["research"] = result

        return results
```

**Why this works:** Permission checks before execution prevent unauthorized requests from reaching agents. Logging permission denials creates a security audit trail. This defense-in-depth approach is essential for multi-agent systems that may be extended by untrusted code.

---

### Step 6: Implement Structured Logging and Tracing
**Self-explanation prompt:** Why is structured logging (JSON format) better than free-form text logs for multi-agent systems?

```python
import json
from typing import Any

class StructuredLogger:
    """Structured logging for multi-agent systems."""

    def __init__(self, system_id: str):
        self.system_id = system_id
        self.events = []

    def log(self, level: str, event_type: str, **kwargs):
        """Log a structured event."""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "system_id": self.system_id,
            "level": level,
            "event_type": event_type,
            "details": kwargs
        }
        self.events.append(log_entry)
        print(json.dumps(log_entry))

    def export_logs(self, filepath: str):
        """Export all logs to JSON file."""
        with open(filepath, 'w') as f:
            json.dump(self.events, f, indent=2)

class InstrumentedLeadAgent(LeadAgent):
    """Lead agent with structured logging."""

    def __init__(self):
        super().__init__()
        self.logger = StructuredLogger("orchestrator_v1")

    async def run_instrumented(self, user_goal: str) -> str:
        """Run with full structured instrumentation."""
        self.logger.log(
            "INFO",
            "orchestration_started",
            goal=user_goal,
            timestamp=datetime.now().isoformat()
        )

        try:
            plan = await self._create_plan(user_goal)
            self.logger.log(
                "INFO",
                "plan_created",
                plan_length=len(plan["plan"])
            )

            results = await self._delegate_tasks(plan)
            self.logger.log(
                "INFO",
                "delegation_complete",
                tasks_completed=len(results)
            )

            final = await self._synthesize_results(results)
            self.logger.log(
                "INFO",
                "orchestration_complete",
                result_length=len(final)
            )

            return final

        except Exception as e:
            self.logger.log(
                "ERROR",
                "orchestration_failed",
                error=str(e),
                error_type=type(e).__name__
            )
            raise

    def get_logs(self, filepath: str = "orchestration.json"):
        """Export logs to file."""
        self.logger.export_logs(filepath)
```

**Why this works:** Structured logging (JSON) is machine-parseable, enabling automated monitoring, alerting, and analysis. It's much better than text logs for tracing execution flows across multiple agents and detecting anomalies.

---

### Step 7: Complete Integration with Context Managers
**Self-explanation prompt:** Why do we wrap the entire orchestration in a context manager?

```python
from contextlib import asynccontextmanager
from typing import AsyncGenerator

@asynccontextmanager
async def orchestrated_research(
    user_goal: str,
    export_logs: bool = True
) -> AsyncGenerator[str, None]:
    """Context manager for complete orchestration with cleanup."""
    agent = InstrumentedLeadAgent()

    try:
        result = await agent.run_instrumented(user_goal)
        yield result
    finally:
        # Cleanup: always export logs
        if export_logs:
            agent.get_logs(f"orchestration_{datetime.now().timestamp()}.json")

        # Print summary
        print("\n=== Orchestration Summary ===")
        print(f"Total orchestration events: {len(agent.orchestration_log)}")
        print(f"Worker events logged:")
        for agent_id, worker in agent.workers.items():
            print(f"  - {agent_id}: {len(worker.execution_log)} events")

# Usage
async def main():
    async with orchestrated_research(
        "Find recent AI research papers and summarize trends"
    ) as result:
        print("\n=== Final Result ===")
        print(result)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

**Why this works:** Context managers guarantee cleanup code (log export, summary printing) runs even if an exception occurs. This ensures you always have audit trails and prevents resource leaks.

---

---

## Fading Version 1: Remove Steps 6-7 (Structured Logging & Context Manager)

**Problem Statement:** Build a research agent system where an Opus lead agent coordinates 3 specialized Sonnet worker agents (web researcher, document analyzer, synthesis writer) with permission boundaries, structured handoffs, audit logging, and error recovery.

### Step 1: Define Agent Interfaces and Tool Contracts
[Full code as above]

### Step 2: Implement Worker Agents with Permission Boundaries
[Full code as above]

### Step 3: Build the Lead Agent Orchestrator
[Full code as above]

### Step 4: Implement Error Recovery with Retry Logic
[Full code as above]

### Step 5: Add Permission Boundary Enforcement
[Full code as above]

**Your Task:** Implement structured logging using JSON format for all agent events, then wrap the entire orchestration in a context manager that exports logs and prints summaries on completion.

---

## Fading Version 2: Remove Steps 4-7 (Retry Logic, Permissions, Structured Logging, Context Manager)

**Problem Statement:** Build an agent system where an Opus lead agent coordinates Sonnet worker agents (document processor, code reviewer, report generator) with permission boundaries and structured handoffs.

*(Note: Surface feature change — different worker types)*

### Step 1: Define Agent Interfaces and Tool Contracts
[Full code structure as above, adapted to new worker types]

### Step 2: Implement Worker Agents with Permission Boundaries
```python
class DocumentProcessor(WorkerAgent):
    """Process and extract data from documents."""
    def __init__(self, agent_id: str):
        super().__init__(agent_id, AgentRole.ANALYZER)
        self.client = anthropic.Anthropic()
        self.allowed_tools = ["extract_text", "parse_json"]

class CodeReviewer(WorkerAgent):
    """Review code and suggest improvements."""
    def __init__(self, agent_id: str):
        super().__init__(agent_id, AgentRole.ANALYZER)
        self.client = anthropic.Anthropic()
        self.allowed_tools = ["analyze_code", "check_security"]

class ReportGenerator(WorkerAgent):
    """Generate final reports."""
    def __init__(self, agent_id: str):
        super().__init__(agent_id, AgentRole.WRITER)
        self.client = anthropic.Anthropic()
```

### Step 3: Build the Lead Agent Orchestrator
[Full code as above]

**Your Task:** Add error recovery with retry logic and exponential backoff, then implement permission boundary enforcement. Finally, add structured logging.

---

## Fading Version 3: Remove Steps 3-7 (Lead Orchestrator, Retry, Permissions, Structured Logging, Context Manager)

**Problem Statement:** Build a multi-agent system with worker agents that have explicit permission boundaries and can process tasks via structured handoffs.

*(Note: Surface feature change — focus on worker implementation)*

### Step 1: Define Agent Interfaces and Tool Contracts
```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime

@dataclass
class TaskPayload:
    source: str
    target: str
    instructions: str
    context: dict

class BaseWorker(ABC):
    def __init__(self, worker_id: str):
        self.worker_id = worker_id
        self.actions = []

    @abstractmethod
    async def execute(self, payload: TaskPayload) -> str:
        pass

    def record_action(self, action: str):
        self.actions.append({
            "timestamp": datetime.now().isoformat(),
            "action": action
        })
```

### Step 2: Implement Worker Agents with Permission Boundaries
```python
import anthropic

class SearchWorker(BaseWorker):
    def __init__(self, worker_id: str):
        super().__init__(worker_id)
        self.client = anthropic.Anthropic()
        self.allowed_tools = ["search_web"]

    async def execute(self, payload: TaskPayload) -> str:
        self.record_action("task_received")
        messages = [{"role": "user", "content": payload.instructions}]
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            messages=messages
        )
        self.record_action("task_completed")
        return "\n".join(block.text for block in response.content if block.type == "text")
```

**Your Task:** Implement a lead agent orchestrator that coordinates multiple workers, add error recovery with retries, and implement permission boundaries.

---

## Fading Version 4: Remove Steps 2-7 (Workers, Lead Agent, Retry, Permissions, Structured Logging, Context Manager)

**Problem Statement:** Build a multi-agent framework with defined interfaces and the ability for agents to hand off work to each other via structured payloads.

*(Note: Surface feature change — abstract framework only)*

### Step 1: Define Agent Interfaces and Tool Contracts
```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class WorkTask:
    id: str
    description: str
    parameters: dict
    created_at: str = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

class Agent(ABC):
    def __init__(self, name: str):
        self.name = name
        self.task_history = []

    @abstractmethod
    async def process_task(self, task: WorkTask) -> str:
        """Process a task and return results."""
        pass

    def log_task(self, task: WorkTask, result: str, status: str):
        self.task_history.append({
            "task_id": task.id,
            "description": task.description,
            "status": status,
            "result_preview": result[:100] if result else None,
            "processed_at": datetime.now().isoformat()
        })
```

**Your Task:** Implement concrete worker agents with permission boundaries, build a lead agent orchestrator, add error recovery and retry logic, then implement structured logging and context managers for the complete system.

---

## Key Takeaways for TC2

- **Agent Interfaces:** Define contracts (abstract base classes, dataclasses for payloads) before implementation
- **Separation of Concerns:** Lead agents orchestrate; workers execute in isolation
- **Permission Boundaries:** Each agent gets exactly the tools it needs; restrict by default
- **Structured Handoffs:** Use dataclasses/types to make inter-agent communication explicit and auditable
- **Error Recovery:** Exponential backoff retry decorators for transient failures
- **Audit Trails:** Log at both orchestrator and worker levels for complete visibility
- **State Machines:** Lead agents use explicit state transitions (PLANNING → DELEGATING → SYNTHESIS)
- **Context Managers:** Guarantee cleanup and resource management across async operations

