# Production Architecture & Evolution Practice: Interleaved Problem Set

**Target Audience:** Advanced Python developer
**Difficulty:** 75-85% accuracy
**Interleaving Mix:** 25% secure deployment/long-running patterns/architecture evolution (current topic) + 75% OTel tracing/testing/hooks/orchestration (TC1-TC3 review)
**Notes:** Problems focus on architectural decisions and production resilience. Advanced learners should think in terms of failure modes, cost, and operational complexity.

---

## Problem 1: Secure Agent Deployment with Secrets Management [TC4 Current - Secure Deployment]

**Scenario:**
Your agent has access to a database, API keys, and a third-party service credentials. You're deploying to production (AWS ECS). You need to:
1. Prevent secrets from appearing in logs, code, or environment variables
2. Rotate API keys without redeploying the agent
3. Audit which agent accessed which secret and when
4. Ensure only the agent can access its secrets (not other services)

**Task:**
Design a secrets architecture that:
1. Uses AWS Secrets Manager (or similar vault)
2. Implements secret rotation without redeployment
3. Logs secret access for audit trails
4. Ensures agent-specific access controls

What's the difference between storing secrets in environment variables vs. a vault?

---

### Solution

```python
import json
import logging
from typing import Dict, Any, Optional
import boto3
from functools import lru_cache
from datetime import datetime, timedelta
from dataclasses import dataclass
import hashlib

logger = logging.getLogger(__name__)

# Do NOT log actual secrets
logging.getLogger("boto3").setLevel(logging.WARNING)

@dataclass
class SecretAccessAudit:
    """Record of secret access for compliance."""
    secret_name: str
    agent_id: str
    timestamp: datetime
    action: str  # "read", "rotate"
    success: bool
    error_msg: Optional[str] = None

class SecureSecretsManager:
    """
    Manages agent secrets with vault, rotation, and audit.
    Uses AWS Secrets Manager (production-grade vault).
    """

    def __init__(self, agent_id: str, region: str = "us-east-1"):
        self.agent_id = agent_id
        self.client = boto3.client("secretsmanager", region_name=region)
        self.audit_log: list[SecretAccessAudit] = []
        self._secret_cache: Dict[str, tuple[Any, datetime]] = {}
        self._cache_ttl = timedelta(minutes=5)  # Refresh cache every 5 min

    def get_secret(self, secret_name: str) -> str:
        """
        Retrieve secret from vault with caching and audit.
        Cache prevents excessive vault queries (cost + latency).
        """

        # Check cache
        if secret_name in self._secret_cache:
            cached_value, cached_time = self._secret_cache[secret_name]
            if datetime.now() - cached_time < self._cache_ttl:
                self._audit_access(secret_name, "read", success=True, cached=True)
                return cached_value

        # Cache miss or expired; fetch from vault
        try:
            response = self.client.get_secret_value(SecretId=secret_name)

            # Extract secret (could be JSON or plain text)
            if "SecretString" in response:
                secret = response["SecretString"]
            else:
                secret = response["SecretBinary"]

            # Cache it
            self._secret_cache[secret_name] = (secret, datetime.now())

            self._audit_access(secret_name, "read", success=True, cached=False)

            # Never log the actual secret
            logger.info(f"Secret retrieved: {secret_name} (no plaintext logged)")

            return secret

        except Exception as e:
            self._audit_access(
                secret_name,
                "read",
                success=False,
                error_msg=str(e)
            )
            logger.error(f"Failed to retrieve secret {secret_name}: {e}")
            raise

    def rotate_secret(self, secret_name: str, new_value: str) -> bool:
        """
        Rotate a secret in the vault without redeploying agent.
        Agents using the rotated secret will pick up the change
        on their next cache refresh (within 5 minutes).
        """

        try:
            # Update secret in vault
            self.client.update_secret(
                SecretId=secret_name,
                SecretString=new_value
            )

            # Invalidate cache; next read will fetch new secret
            if secret_name in self._secret_cache:
                del self._secret_cache[secret_name]

            self._audit_access(secret_name, "rotate", success=True)

            logger.info(f"Secret rotated: {secret_name}")

            return True

        except Exception as e:
            self._audit_access(
                secret_name,
                "rotate",
                success=False,
                error_msg=str(e)
            )
            logger.error(f"Failed to rotate secret {secret_name}: {e}")
            return False

    def _audit_access(
        self,
        secret_name: str,
        action: str,
        success: bool,
        error_msg: Optional[str] = None,
        cached: bool = False
    ):
        """Log secret access for compliance."""

        audit = SecretAccessAudit(
            secret_name=secret_name,
            agent_id=self.agent_id,
            timestamp=datetime.now(),
            action=action,
            success=success,
            error_msg=error_msg
        )

        self.audit_log.append(audit)

        # In production, send audit log to CloudWatch or external audit system
        # Example:
        # cloudwatch = boto3.client("logs")
        # cloudwatch.put_log_events(logGroupName="/agent-audits", ...)

    def get_audit_log(self) -> list[SecretAccessAudit]:
        """Retrieve audit trail for compliance checks."""
        return self.audit_log

# Agent integration
class SecureAgent:
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.secrets = SecureSecretsManager(agent_id)

    async def process_with_secrets(self, request: Dict) -> Any:
        """Execute agent using securely managed secrets."""

        # Retrieve secrets (cached, never logged in plaintext)
        db_password = self.secrets.get_secret("db-password")
        api_key = self.secrets.get_secret("third-party-api-key")

        # Use secrets (never log them)
        # connection = await connect_db(password=db_password)
        # response = await call_api(key=api_key)

        return {"status": "success"}

# Tests
import pytest

@pytest.fixture
def mock_secrets_client(monkeypatch):
    """Mock AWS Secrets Manager for testing."""

    vault = {
        "db-password": "secret_db_pass",
        "api-key": "secret_api_key"
    }

    class MockSecretsManager:
        def get_secret_value(self, SecretId: str):
            if SecretId not in vault:
                raise Exception(f"Secret not found: {SecretId}")
            return {"SecretString": vault[SecretId]}

        def update_secret(self, SecretId: str, SecretString: str):
            vault[SecretId] = SecretString

    mock_client = MockSecretsManager()
    monkeypatch.setattr(
        "boto3.client",
        lambda service, **kwargs: mock_client if service == "secretsmanager" else None
    )

    return mock_client

def test_secret_retrieval_and_caching(mock_secrets_client):
    """Test secret retrieval with caching."""

    manager = SecureSecretsManager("agent_1")

    # First call: cache miss
    secret1 = manager.get_secret("db-password")
    assert secret1 == "secret_db_pass"

    # Verify audit log
    assert len(manager.audit_log) == 1
    assert manager.audit_log[0].action == "read"
    assert manager.audit_log[0].success

    # Second call: cache hit (no vault query)
    secret2 = manager.get_secret("db-password")
    assert secret1 == secret2

    # Still only one audit entry (second call was cached, still logged)
    # Note: current implementation logs cached reads too; could optimize

def test_secret_rotation(mock_secrets_client):
    """Test secret rotation without redeployment."""

    manager = SecureSecretsManager("agent_1")

    # Get original secret
    original = manager.get_secret("db-password")
    assert original == "secret_db_pass"

    # Rotate secret
    new_secret = "new_secret_pass_123"
    rotated = manager.rotate_secret("db-password", new_secret)
    assert rotated

    # Next read should get new secret
    updated = manager.get_secret("db-password")
    assert updated == new_secret
    assert updated != original

def test_audit_logging(mock_secrets_client):
    """Test that all secret access is audited."""

    manager = SecureSecretsManager("agent_1")

    # Read secret
    manager.get_secret("db-password")

    # Rotate secret
    manager.rotate_secret("db-password", "new_value")

    # Verify audit trail
    audit = manager.get_audit_log()
    assert len(audit) >= 2

    actions = [entry.action for entry in audit]
    assert "read" in actions
    assert "rotate" in actions

    # Verify agent_id is recorded
    for entry in audit:
        assert entry.agent_id == "agent_1"
```

**Why this strategy?**

**Environment variables vs. vault:**

| Approach | Security | Rotation | Audit | Cost |
|----------|----------|----------|-------|------|
| **Env vars** | Low (exposed in process env, logs) | Hard (redeploy) | None | Free |
| **Vault** | High (encrypted, access-controlled) | Easy (cache expiry) | Full | Low (~$1/month) |

- **Vault is mandatory for production:** Even hardened environment variables leak in container registries, logs, and crashed processes. AWS Secrets Manager encrypts secrets, tracks access, and enables rotation without redeployment.
- **Caching balances cost and latency:** Querying the vault for every request adds 100-200ms latency. 5-minute cache reduces vault queries by 99%, saving cost and latency.
- **Audit trail is compliance:** Many regulated industries (finance, healthcare) require proof that only authorized agents accessed specific secrets. Vault audit logs provide this.

---

## Problem 2: Long-Running Agent Tasks with Graceful Shutdown [TC4 Current - Long-Running Patterns]

**Scenario:**
Your agent processes a 10-minute batch job. In production, you deploy new versions multiple times daily. When a new version is deployed, the old agent instances should finish their current task gracefully (not mid-batch) before shutting down, even if the new version took 30 seconds to replace them.

**Task:**
Implement a graceful shutdown mechanism that:
1. Catches termination signal (SIGTERM)
2. Allows the current task to finish (with timeout)
3. Prevents new tasks from starting after signal is received
4. Reports shutdown status to orchestrator (Kubernetes, ECS, etc.)

How is this different from just killing the process?

---

### Solution

```python
import asyncio
import signal
from typing import Callable, Optional
from datetime import datetime
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class AgentState(Enum):
    RUNNING = "running"
    SHUTTING_DOWN = "shutting_down"
    SHUTDOWN = "shutdown"

class GracefulShutdownManager:
    """Manages graceful shutdown of long-running agent tasks."""

    def __init__(self, shutdown_timeout_seconds: int = 120):
        self.state = AgentState.RUNNING
        self.shutdown_timeout = shutdown_timeout_seconds
        self.current_task: Optional[asyncio.Task] = None
        self.shutdown_event = asyncio.Event()

    def register_signal_handlers(self):
        """Register SIGTERM and SIGINT handlers."""

        loop = asyncio.get_event_loop()

        # Handle SIGTERM (graceful shutdown request from orchestrator)
        loop.add_signal_handler(
            signal.SIGTERM,
            self._on_shutdown_signal,
            "SIGTERM"
        )

        # Handle SIGINT (Ctrl+C for local testing)
        loop.add_signal_handler(
            signal.SIGINT,
            self._on_shutdown_signal,
            "SIGINT"
        )

    def _on_shutdown_signal(self, signal_name: str):
        """Called when shutdown signal is received."""

        if self.state == AgentState.RUNNING:
            logger.warning(
                f"Received {signal_name}. Initiating graceful shutdown. "
                f"Current task will finish (timeout: {self.shutdown_timeout}s)"
            )
            self.state = AgentState.SHUTTING_DOWN
            self.shutdown_event.set()
        elif self.state == AgentState.SHUTTING_DOWN:
            logger.error(
                f"Received {signal_name} again during shutdown. "
                f"Force terminating after {self.shutdown_timeout}s timeout."
            )
            # After timeout, the task will be cancelled

    async def execute_task(
        self,
        task_func: Callable,
        task_args: tuple = (),
        task_kwargs: dict = None
    ) -> bool:
        """
        Execute a task with graceful shutdown support.

        Returns:
            True if task completed normally
            False if task was interrupted/cancelled
        """

        if task_kwargs is None:
            task_kwargs = {}

        if self.state == AgentState.SHUTTING_DOWN:
            logger.warning("Cannot start task; shutdown in progress")
            return False

        self.state = AgentState.RUNNING

        try:
            # Create task
            self.current_task = asyncio.create_task(
                task_func(*task_args, **task_kwargs)
            )

            # Wait for task OR shutdown signal
            shutdown_task = asyncio.create_task(self.shutdown_event.wait())

            done, pending = await asyncio.wait(
                [self.current_task, shutdown_task],
                return_when=asyncio.FIRST_COMPLETED
            )

            # Check which completed first
            if self.current_task in done:
                # Task completed normally
                logger.info("Task completed successfully")
                return True

            else:
                # Shutdown signal received while task was running
                logger.info("Shutdown signal received; allowing task to finish...")

                # Cancel shutdown task (we'll wait for the work task)
                shutdown_task.cancel()

                # Wait for current task with timeout
                try:
                    await asyncio.wait_for(
                        self.current_task,
                        timeout=self.shutdown_timeout
                    )
                    logger.info("Task finished gracefully during shutdown")
                    return True

                except asyncio.TimeoutError:
                    logger.error(
                        f"Task did not finish within {self.shutdown_timeout}s. "
                        f"Force cancelling."
                    )
                    self.current_task.cancel()
                    return False

        except asyncio.CancelledError:
            logger.error("Task was cancelled")
            return False

        finally:
            self.state = AgentState.SHUTDOWN

    async def shutdown(self):
        """Trigger shutdown."""
        self.shutdown_event.set()

# Health check endpoint (for orchestrator)
class HealthChecker:
    """Exposes agent health status to orchestrator."""

    def __init__(self, shutdown_manager: GracefulShutdownManager):
        self.shutdown_manager = shutdown_manager

    async def health(self) -> dict:
        """
        Health check endpoint.
        Orchestrator polls this; if agent is shutting down,
        orchestrator stops sending new tasks.
        """

        if self.shutdown_manager.state == AgentState.SHUTTING_DOWN:
            return {
                "status": "shutting_down",
                "current_task_active": self.shutdown_manager.current_task is not None
            }

        return {
            "status": "healthy",
            "current_task_active": self.shutdown_manager.current_task is not None
        }

# Usage
async def main():
    shutdown_manager = GracefulShutdownManager(shutdown_timeout_seconds=120)
    shutdown_manager.register_signal_handlers()

    health_checker = HealthChecker(shutdown_manager)

    # Long-running task (10 minute batch job)
    async def batch_process():
        logger.info("Starting batch processing...")

        for i in range(600):  # 600 seconds = 10 minutes
            logger.info(f"Processing batch {i}...")
            await asyncio.sleep(1)

        logger.info("Batch processing complete")

    # Execute with graceful shutdown support
    success = await shutdown_manager.execute_task(batch_process)

    if success:
        logger.info("Agent shutdown successfully")
        exit(0)
    else:
        logger.error("Agent shutdown with error")
        exit(1)

# Tests
@pytest.mark.asyncio
async def test_graceful_shutdown():
    """Test that task finishes gracefully when shutdown signal received."""

    manager = GracefulShutdownManager(shutdown_timeout_seconds=5)

    task_completed = False

    async def slow_task():
        nonlocal task_completed
        await asyncio.sleep(2)
        task_completed = True

    # Start task
    async def run_with_signal():
        # Schedule shutdown signal after 1 second
        async def send_signal():
            await asyncio.sleep(1)
            await manager.shutdown()

        await asyncio.gather(
            manager.execute_task(slow_task),
            send_signal()
        )

    await run_with_signal()

    # Task should have completed despite signal
    assert task_completed

@pytest.mark.asyncio
async def test_shutdown_timeout():
    """Test that task is cancelled if it exceeds timeout."""

    manager = GracefulShutdownManager(shutdown_timeout_seconds=1)

    async def hanging_task():
        await asyncio.sleep(10)  # Will exceed timeout

    async def run_with_signal():
        async def send_signal():
            await asyncio.sleep(0.1)
            await manager.shutdown()

        return await asyncio.gather(
            manager.execute_task(hanging_task),
            send_signal()
        )

    results = await run_with_signal()

    # Task should have been cancelled due to timeout
    assert not results[0]  # execute_task returned False
```

**Why this strategy?**

**Graceful shutdown vs. force kill:**

| Approach | Clean Data | Latency Impact | Complexity |
|----------|-----------|-----------------|-----------|
| **Force kill (SIGKILL)** | No (mid-batch corruption) | 0s (but bad) | Simple |
| **Graceful shutdown** | Yes (finish batch) | Task duration + 120s timeout | More complex |

- **Force kill is dangerous:** Killing mid-batch leaves data in inconsistent state, causing data loss or corruption.
- **Graceful shutdown is operational best practice:** Allows the batch to finish, preventing data loss. The 120s timeout ensures we don't hang forever if the task misbehaves.
- **Health checks enable orchestration:** Kubernetes/ECS can query the health endpoint. If shutting down, the orchestrator stops sending new tasks, ensuring a clean shutdown.

---

## Problem 3: Agent Versioning and Backwards Compatibility [TC4 Current - Evolution Tracking]

**Scenario:**
You deploy new versions of your agent frequently. Version 2.0 changes the tool API:
- **Old (v1.0):** `tool("query", "SELECT * FROM table")`
- **New (v2.0):** `tool(sql="SELECT * FROM table", database="main")`

Old agents (v1.0) are still running in production and may call v2.0 tools. You need to support both calling conventions without breaking anything.

**Task:**
Implement a tool adapter that:
1. Detects the calling convention (positional vs. keyword args)
2. Translates old calls to new signature
3. Logs version mismatches for debugging
4. Validates that the adapted call is correct before execution

What's the difference between adapter pattern and just changing the signature?

---

### Solution

```python
from typing import Any, Callable, Dict
from functools import wraps
import inspect
import logging

logger = logging.getLogger(__name__)

class VersionMismatchAdapter:
    """Adapts old tool calls to new API."""

    def __init__(self, tool_func: Callable, api_version: str = "2.0"):
        self.tool_func = tool_func
        self.api_version = api_version
        self._inspect_signature()

    def _inspect_signature(self):
        """Learn the new tool's signature."""
        sig = inspect.signature(self.tool_func)
        self.new_params = list(sig.parameters.keys())

    def __call__(self, *args, **kwargs) -> Any:
        """
        Call tool, automatically adapting old-style calls.
        """

        # Detect calling convention
        if args and not kwargs:
            # Positional call (old style: v1.0)
            return self._adapt_old_style(args)
        elif kwargs and not args:
            # Keyword call (new style: v2.0)
            return self.tool_func(**kwargs)
        else:
            # Mixed: forward as-is (caller knows what they're doing)
            return self.tool_func(*args, **kwargs)

    def _adapt_old_style(self, args: tuple) -> Any:
        """
        Adapt old-style positional call to new signature.

        Old (v1.0): tool("SELECT * FROM table")
        New (v2.0): tool(sql="SELECT * FROM table", database="main")
        """

        logger.warning(
            f"Old API call detected (v1.0). Adapting to {self.api_version}. "
            f"Please update calling code."
        )

        # Adaptation rules: map old positional args to new params
        # This is hardcoded per tool, but could be metadata-driven
        adapted_kwargs = {}

        if len(args) >= 1:
            # First arg is the SQL query (both old and new)
            adapted_kwargs["sql"] = args[0]

        # Old API didn't have database parameter; default to "main"
        if len(args) == 1:
            adapted_kwargs["database"] = "main"
        elif len(args) >= 2:
            # Old v1.0 might have second arg as database (hypothetically)
            adapted_kwargs["database"] = args[1]

        logger.info(f"Adapted call: old_args={args} -> new_kwargs={adapted_kwargs}")

        # Validate adaptation
        self._validate_adapted_call(adapted_kwargs)

        return self.tool_func(**adapted_kwargs)

    def _validate_adapted_call(self, kwargs: Dict) -> bool:
        """
        Verify adapted call has all required parameters.
        """

        # Get function signature
        sig = inspect.signature(self.tool_func)

        required_params = {
            name: param
            for name, param in sig.parameters.items()
            if param.default == inspect.Parameter.empty
        }

        missing = set(required_params.keys()) - set(kwargs.keys())

        if missing:
            raise ValueError(
                f"Adapted call missing required parameters: {missing}. "
                f"Cannot automatically adapt old v1.0 call to new v2.0 signature."
            )

        return True

# Tool implementation
def query_database(sql: str, database: str = "main") -> str:
    """
    New tool API (v2.0).
    Requires sql (required) and database (optional, defaults to "main").
    """
    return f"Results from {database}: {sql[:30]}..."

# Wrap with adapter
adapted_query = VersionMismatchAdapter(query_database, api_version="2.0")

# Usage
def test_backwards_compatibility():
    """Test that old and new calling conventions both work."""

    # New style (v2.0): call with keyword args
    result_new = adapted_query(sql="SELECT * FROM users", database="analytics")
    assert "SELECT * FROM users" in result_new

    # Old style (v1.0): call with positional args
    # Adapter detects this and translates to new signature
    result_old = adapted_query("SELECT * FROM orders")
    assert "SELECT * FROM orders" in result_old
    assert "main" in result_old  # Defaults to "main" database

    # Both should work without errors
    assert result_old is not None
    assert result_new is not None

# Version registry (for multi-version support)
class ToolRegistry:
    """Register tools with multiple API versions."""

    def __init__(self):
        self.tools: Dict[str, Dict[str, Callable]] = {}

    def register(self, tool_name: str, version: str, func: Callable):
        """Register tool version."""
        if tool_name not in self.tools:
            self.tools[tool_name] = {}

        self.tools[tool_name][version] = func

    def get_tool(self, tool_name: str, requested_version: str) -> Callable:
        """
        Retrieve tool, adapting if necessary.
        If exact version not available, adapt from latest.
        """

        if tool_name not in self.tools:
            raise ValueError(f"Unknown tool: {tool_name}")

        available_versions = list(self.tools[tool_name].keys())

        # Check exact match
        if requested_version in available_versions:
            return self.tools[tool_name][requested_version]

        # No exact match; adapt from latest
        latest_version = max(available_versions)  # Assumes semantic versioning
        latest_func = self.tools[tool_name][latest_version]

        logger.warning(
            f"Tool {tool_name} v{requested_version} not available. "
            f"Using v{latest_version} with adapter."
        )

        return VersionMismatchAdapter(latest_func, api_version=latest_version)

# Test multi-version registry
def test_version_registry():
    """Test tool registry with backward compatibility."""

    registry = ToolRegistry()

    # Register v1.0 (original)
    def query_v1(sql: str) -> str:
        return f"v1 result: {sql}"

    # Register v2.0 (with database parameter)
    def query_v2(sql: str, database: str = "main") -> str:
        return f"v2 result from {database}: {sql}"

    registry.register("query", "1.0", query_v1)
    registry.register("query", "2.0", query_v2)

    # Old agent requests v1.0
    tool_v1 = registry.get_tool("query", "1.0")
    result_v1 = tool_v1("SELECT * FROM table")
    assert "v1 result" in result_v1

    # New agent requests v2.0
    tool_v2 = registry.get_tool("query", "2.0")
    result_v2 = tool_v2(sql="SELECT * FROM users", database="analytics")
    assert "v2 result from analytics" in result_v2

    # Old agent requests v1.5 (doesn't exist; adapter uses v2.0)
    # In this case, the adapter would need custom mapping rules
    # For simplicity, we just return v2.0
    tool_v15 = registry.get_tool("query", "1.5")
    result_v15 = tool_v15(sql="SELECT * FROM orders")
    # With default adaptation, positional arg maps to sql, database defaults to "main"
    assert result_v15 is not None
```

**Why this strategy?**

**Adapter pattern vs. changing the signature:**

| Approach | Backwards Compat | Complexity | Migration |
|----------|------------------|-----------|-----------|
| **Change signature directly** | Breaks old agents | Lowest | Immediate (forced) |
| **Adapter pattern** | Maintains support | Medium | Gradual (optional) |

- **Adapter enables rolling upgrades:** Old agents (v1.0) keep working while new agents (v2.0) are deployed. No forced migration.
- **Versioning is crucial:** Production systems have long-running jobs and multiple deployment stages. Forcing immediate migration increases risk.
- **Logging + metrics:** Adapters log when old APIs are used, helping identify when all agents are upgraded.

---

## Problem 4: Cost Optimization for AI Agent Operations [TC4 Current - Architecture Patterns]

**Scenario:**
Your agent processes 1 million requests daily. Each tool call costs:
- LLM inference: $0.001 per call
- Tool execution: $0.0001 per call
- Observability: $0.00001 per span

Current monthly cost: ~$3500. Your manager asks to cut costs in half.

**Task:**
Identify and implement 3 cost-reduction strategies:
1. Reduce tool calls without hurting quality (caching, batching, etc.)
2. Optimize LLM usage (cheaper models, prompt compression, etc.)
3. Reduce observability overhead

Estimate the savings for each strategy and the implementation complexity.

---

### Solution

```python
from typing import Any, Dict, List
from functools import lru_cache
import hashlib

# Strategy 1: Reduce tool calls via caching and batching

class ToolCallOptimizer:
    """Reduces redundant tool calls."""

    def __init__(self):
        self.tool_result_cache: Dict[str, Any] = {}
        self.request_batch: List[Dict] = []
        self.batch_size = 10

    def deduplicate_tool_calls(self, request: Dict) -> Any:
        """
        Check if we've already computed this result.
        Avoids redundant tool calls.

        Example:
        - User 1 asks "What is 2+2?"
        - Cache stores result
        - User 2 asks same question
        - Return cached result (save tool cost)

        Cost reduction: ~20-30% (many users ask similar questions)
        Complexity: Low
        """

        cache_key = hashlib.sha256(
            str(sorted(request.items())).encode()
        ).hexdigest()

        if cache_key in self.tool_result_cache:
            return self.tool_result_cache[cache_key]

        # Cache miss; execute tool
        result = self._execute_tool(request)
        self.tool_result_cache[cache_key] = result

        return result

    def batch_tool_calls(self, request: Dict) -> Any:
        """
        Batch multiple small requests into one tool call.
        Some tools accept batch operations at lower cost.

        Example:
        - Old: 10 separate database queries
        - New: 1 batch query operation

        Cost reduction: ~40-50% (if tool supports batching)
        Complexity: Medium
        """

        self.request_batch.append(request)

        if len(self.request_batch) < self.batch_size:
            # Not enough for batch yet; queue the request
            return None  # Caller waits for batch to fill

        # Batch is full; execute
        batch_result = self._execute_batch_tool(self.request_batch)
        self.request_batch = []

        return batch_result

    def _execute_tool(self, request: Dict) -> Any:
        """Placeholder for tool execution."""
        return {"result": "tool_result"}

    def _execute_batch_tool(self, batch: List[Dict]) -> Any:
        """Placeholder for batch tool execution."""
        return {"results": [{"result": "batch_item"} for _ in batch]}

# Strategy 2: Optimize LLM usage

class ModelSelector:
    """Choose cheaper models when appropriate."""

    MODELS = {
        "gpt-4": {"cost": 0.001, "latency": 2.0, "quality": 0.95},
        "gpt-3.5-turbo": {"cost": 0.0002, "latency": 0.5, "quality": 0.85},
        "claude-3-haiku": {"cost": 0.0001, "latency": 0.3, "quality": 0.80},
    }

    def select_model(self, request: Dict) -> str:
        """
        Select model based on task complexity and quality requirements.

        Low complexity (routing, classification): use cheap model
        High complexity (reasoning): use expensive model

        Cost reduction: ~25-35%
        Complexity: Medium (need to tune quality thresholds)
        """

        complexity = request.get("complexity", "medium")

        if complexity == "low":
            # Classification, routing: cheap model sufficient
            return "claude-3-haiku"
        elif complexity == "medium":
            # General tasks: balanced
            return "gpt-3.5-turbo"
        else:
            # Complex reasoning: full power
            return "gpt-4"

    def compress_prompt(self, prompt: str) -> str:
        """
        Compress prompt before sending to LLM.
        Fewer tokens = lower cost.

        Example:
        - Old prompt: 500 tokens
        - Compressed: 200 tokens (40% reduction)
        - Cost reduction: ~40% on LLM calls

        Complexity: Medium (need good compression without losing info)
        """

        # Remove redundant whitespace
        compressed = " ".join(prompt.split())

        # Remove low-value words (articles, conjunctions)
        # In practice, use more sophisticated compression (summarization, etc.)

        return compressed

# Strategy 3: Optimize observability costs

class ObservabilityCostOptimizer:
    """Reduce observability overhead."""

    def __init__(self):
        self.sampling_rate = 0.01  # Sample 1% of normal requests

    def sample_traces(self, request: Dict) -> bool:
        """
        Only export traces for a sample of requests.

        Rules:
        - Always sample errors (debugging value)
        - Always sample slow requests (performance insights)
        - Sample 1% of normal requests (cost control)

        Cost reduction: ~99% on observability
        Complexity: Low

        Tradeoff: Less visibility into normal request behavior
                  but errors and slow requests are fully observable
        """

        import random

        is_error = request.get("error", False)
        latency_ms = request.get("latency_ms", 0)

        if is_error:
            return True  # Always sample errors

        if latency_ms > 500:  # p95 threshold
            return True  # Always sample slow requests

        # Normal request; probabilistic sampling
        return random.random() < self.sampling_rate

    def batch_metrics(self):
        """
        Send metrics in batches instead of per-request.
        Reduces API calls to observability platform.

        Cost reduction: ~90% on metrics export
        Complexity: Low
        """
        # Batch metrics in memory, flush every 60 seconds
        pass

# Cost analysis

def analyze_cost_savings():
    """Estimate cost savings from strategies."""

    baseline_monthly_cost = 3500

    strategies = {
        "Caching & Deduplication": {
            "savings_percent": 0.25,
            "effort": "Low (1-2 days)",
            "risk": "Low (opt-in caching)",
        },
        "Model Selection": {
            "savings_percent": 0.30,
            "effort": "Medium (3-5 days, quality tuning)",
            "risk": "Medium (need to validate quality thresholds)",
        },
        "Observability Sampling": {
            "savings_percent": 0.15,
            "effort": "Low (1 day)",
            "risk": "Low (sample errors 100%, still fully observable)",
        },
    }

    print("Cost Optimization Analysis:")
    print("=" * 60)
    print(f"Baseline monthly cost: ${baseline_monthly_cost:.2f}")
    print()

    total_savings = 0

    for strategy_name, details in strategies.items():
        savings_percent = details["savings_percent"]
        monthly_savings = baseline_monthly_cost * savings_percent
        total_savings += monthly_savings

        print(f"{strategy_name}:")
        print(f"  Savings: {savings_percent*100:.0f}% (${monthly_savings:.2f}/month)")
        print(f"  Effort: {details['effort']}")
        print(f"  Risk: {details['risk']}")
        print()

    final_cost = baseline_monthly_cost - total_savings

    print(f"Combined savings: ${total_savings:.2f}/month ({total_savings/baseline_monthly_cost*100:.0f}%)")
    print(f"New monthly cost: ${final_cost:.2f}")
    print()
    print("Target: 50% reduction ($1750/month)")
    print(f"Achievable: {'YES' if total_savings >= baseline_monthly_cost * 0.5 else 'NO'}")

# Run analysis
# Output:
# Cost Optimization Analysis
# ============================================================
# Baseline monthly cost: $3500.00
#
# Caching & Deduplication:
#   Savings: 25% ($875.00/month)
#   Effort: Low (1-2 days)
#   Risk: Low (opt-in caching)
#
# Model Selection:
#   Savings: 30% ($1050.00/month)
#   Effort: Medium (3-5 days, quality tuning)
#   Risk: Medium (need to validate quality thresholds)
#
# Observability Sampling:
#   Savings: 15% ($525.00/month)
#   Effort: Low (1 day)
#   Risk: Low (sample errors 100%, still fully observable)
#
# Combined savings: $2450.00/month (70%)
# New monthly cost: $1050.00
#
# Target: 50% reduction ($1750/month)
# Achievable: YES
```

**Why this strategy?**

All three strategies are **complementary** and **low-risk:**

1. **Caching:** Immediate (no quality loss), high ROI.
2. **Model selection:** Medium effort, high ROI, but requires validation that cheaper models don't degrade quality.
3. **Observability sampling:** Minimal impact on visibility (errors and slow requests still 100% sampled), immediate savings.

Combined, they achieve 70% cost reduction, exceeding the 50% target.

---

## Problem 5: Monitoring Agent SLOs in Production [TC3 Review - OTel Tracing & TC4 Current - Architecture]

**Scenario:**
Your agent has these SLOs:
- P99 latency < 2 seconds
- Error rate < 0.1%
- Availability > 99.9%

You need to set up monitoring that:
1. Continuously measures these metrics
2. Alerts you when SLO is violated
3. Shows trends (is latency degrading over time?)
4. Helps debug SLO violations (which tools are slow?)

**Task:**
Design a monitoring dashboard that tracks SLOs. What metrics do you need to collect, and at what granularity?

---

### Solution

```python
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Dict
import statistics

@dataclass
class RequestMetric:
    timestamp: datetime
    latency_ms: float
    status: str  # "success" or "error"
    tool_name: str
    error_msg: str = None

class SLOMonitor:
    """Monitors agent SLOs."""

    def __init__(self):
        self.metrics: List[RequestMetric] = []
        self.slos = {
            "p99_latency_ms": 2000,
            "error_rate_percent": 0.1,
            "availability_percent": 99.9,
        }

    def record_request(
        self,
        latency_ms: float,
        status: str,
        tool_name: str,
        error_msg: str = None
    ):
        """Record a request metric."""
        metric = RequestMetric(
            timestamp=datetime.now(),
            latency_ms=latency_ms,
            status=status,
            tool_name=tool_name,
            error_msg=error_msg
        )
        self.metrics.append(metric)

    def calculate_slos(self, time_window_minutes: int = 60) -> Dict:
        """
        Calculate current SLO metrics over the last N minutes.
        """

        cutoff = datetime.now() - timedelta(minutes=time_window_minutes)
        recent_metrics = [m for m in self.metrics if m.timestamp > cutoff]

        if not recent_metrics:
            return {"error": "No recent metrics"}

        # P99 latency
        latencies = [m.latency_ms for m in recent_metrics if m.status == "success"]
        p99_latency = self._percentile(latencies, 0.99) if latencies else float('inf')

        # Error rate
        errors = sum(1 for m in recent_metrics if m.status == "error")
        error_rate = (errors / len(recent_metrics)) * 100 if recent_metrics else 0

        # Availability (% of time not in error state)
        availability = 100 - error_rate

        return {
            "p99_latency_ms": p99_latency,
            "error_rate_percent": error_rate,
            "availability_percent": availability,
            "request_count": len(recent_metrics),
            "error_count": errors,
        }

    def check_slo_violations(self, time_window_minutes: int = 60) -> List[str]:
        """
        Check if any SLO is violated.
        Returns list of violated SLOs.
        """

        current_metrics = self.calculate_slos(time_window_minutes)

        violations = []

        if current_metrics.get("p99_latency_ms", float('inf')) > self.slos["p99_latency_ms"]:
            violations.append(
                f"P99 latency {current_metrics['p99_latency_ms']:.0f}ms "
                f"exceeds SLO {self.slos['p99_latency_ms']}ms"
            )

        if current_metrics.get("error_rate_percent", 0) > self.slos["error_rate_percent"]:
            violations.append(
                f"Error rate {current_metrics['error_rate_percent']:.2f}% "
                f"exceeds SLO {self.slos['error_rate_percent']}%"
            )

        if current_metrics.get("availability_percent", 100) < self.slos["availability_percent"]:
            violations.append(
                f"Availability {current_metrics['availability_percent']:.2f}% "
                f"below SLO {self.slos['availability_percent']}%"
            )

        return violations

    def get_tool_performance(self, time_window_minutes: int = 60) -> Dict[str, Dict]:
        """
        Breakdown latency by tool.
        Helps identify which tools are slow.
        """

        cutoff = datetime.now() - timedelta(minutes=time_window_minutes)
        recent_metrics = [m for m in self.metrics if m.timestamp > cutoff]

        tool_metrics = {}

        for tool_name in set(m.tool_name for m in recent_metrics):
            tool_calls = [m for m in recent_metrics if m.tool_name == tool_name]

            latencies = [m.latency_ms for m in tool_calls if m.status == "success"]

            tool_metrics[tool_name] = {
                "count": len(tool_calls),
                "p50_latency_ms": self._percentile(latencies, 0.50),
                "p99_latency_ms": self._percentile(latencies, 0.99),
                "error_count": sum(1 for m in tool_calls if m.status == "error"),
            }

        return tool_metrics

    @staticmethod
    def _percentile(data: List[float], percentile: float) -> float:
        """Calculate percentile of data."""
        if not data:
            return float('inf')
        sorted_data = sorted(data)
        idx = int(len(sorted_data) * percentile)
        return sorted_data[min(idx, len(sorted_data) - 1)]

# Dashboard data structure
class SLODashboard:
    """Exposes SLO data for dashboard visualization."""

    def __init__(self, monitor: SLOMonitor):
        self.monitor = monitor

    def get_dashboard_data(self) -> Dict:
        """Return data for frontend dashboard."""

        current_slos = self.monitor.calculate_slos(time_window_minutes=60)
        violations = self.monitor.check_slo_violations(time_window_minutes=60)
        tool_perf = self.monitor.get_tool_performance(time_window_minutes=60)

        return {
            "slos": current_slos,
            "violations": violations,
            "slo_targets": self.monitor.slos,
            "tool_performance": tool_perf,
            "timestamp": datetime.now().isoformat(),
        }

# Tests
import pytest

def test_slo_calculation():
    """Test SLO calculation."""

    monitor = SLOMonitor()

    # Simulate 100 successful requests
    for i in range(100):
        latency = 100 + (i % 100)  # 100-200ms
        monitor.record_request(
            latency_ms=latency,
            status="success",
            tool_name="query_tool"
        )

    # Simulate 1 error
    monitor.record_request(
        latency_ms=5000,
        status="error",
        tool_name="query_tool",
        error_msg="Timeout"
    )

    slos = monitor.calculate_slos()

    # Verify
    assert slos["p99_latency_ms"] > 100
    assert slos["error_rate_percent"] < 2  # 1/101 = ~1%
    assert slos["availability_percent"] > 98

def test_slo_violation_detection():
    """Test that SLO violations are detected."""

    monitor = SLOMonitor()
    monitor.slos["p99_latency_ms"] = 500  # Strict SLO

    # Simulate slow requests
    for _ in range(100):
        monitor.record_request(
            latency_ms=1000,  # Exceeds SLO
            status="success",
            tool_name="slow_tool"
        )

    violations = monitor.check_slo_violations()

    assert len(violations) > 0
    assert "P99 latency" in violations[0]

def test_tool_performance_breakdown():
    """Test tool-level performance metrics."""

    monitor = SLOMonitor()

    # Fast tool
    for _ in range(50):
        monitor.record_request(
            latency_ms=100,
            status="success",
            tool_name="fast_tool"
        )

    # Slow tool
    for _ in range(50):
        monitor.record_request(
            latency_ms=500,
            status="success",
            tool_name="slow_tool"
        )

    tool_perf = monitor.get_tool_performance()

    assert tool_perf["fast_tool"]["p99_latency_ms"] < tool_perf["slow_tool"]["p99_latency_ms"]
```

**Why this strategy?**

- **Granular metrics:** Tool-level breakdown helps identify which specific tools need optimization.
- **Multiple SLO dimensions:** P99 latency, error rate, and availability together paint a complete picture. A single metric (e.g., just P99) can be misleading.
- **Time-windowed:** Last 60 minutes gives rapid feedback; longer windows show trends.
- **Violation alerts:** Automatic detection enables proactive alerting before customers are impacted.

---

## Problem 6: Testing Deployment Scenarios [TC3 Review - Testing & TC4 Current - Production Patterns]

**Scenario:**
Before deploying a new agent version to production, you run a canary test:
1. Deploy v2.0 to 10% of traffic
2. Compare error rates: v1.0 vs. v2.0
3. If v2.0 error rate is higher, rollback
4. If v2.0 is better, gradually roll out to 100%

**Task:**
Write a test that simulates a canary deployment and verifies the rollout logic.

---

### Solution

```python
import pytest
from dataclasses import dataclass
from typing import List
from enum import Enum

class DeploymentPhase(Enum):
    CANARY_10 = 0.10
    CANARY_50 = 0.50
    FULL_ROLLOUT = 1.00

@dataclass
class DeploymentMetrics:
    version: str
    error_rate: float
    request_count: int

class CanaryDeploymentController:
    """Controls gradual rollout with error-rate-based decisions."""

    def __init__(self, v1_error_rate: float, v2_error_rate: float):
        self.v1_metrics = DeploymentMetrics(
            version="v1.0",
            error_rate=v1_error_rate,
            request_count=1000
        )

        self.v2_metrics = DeploymentMetrics(
            version="v2.0",
            error_rate=v2_error_rate,
            request_count=100
        )

        self.current_phase = DeploymentPhase.CANARY_10
        self.rollback_triggered = False

    def evaluate_canary_phase(self) -> bool:
        """
        Evaluate if v2.0 is performing better than v1.0 in canary.
        If v2.0 error rate is <= v1.0 + tolerance, proceed.
        If v2.0 error rate is >> v1.0, rollback.
        """

        tolerance = 0.5  # Allow v2.0 to be up to 0.5% higher (margin of error)

        if self.v2_metrics.error_rate > self.v1_metrics.error_rate + tolerance:
            # v2.0 is significantly worse; rollback
            self.rollback_triggered = True
            return False

        # v2.0 is acceptable or better; proceed
        return True

    async def run_canary_deployment(self):
        """
        Simulate canary deployment phases.
        """

        phases = [DeploymentPhase.CANARY_10, DeploymentPhase.CANARY_50, DeploymentPhase.FULL_ROLLOUT]

        for phase in phases:
            print(f"Deploying v2.0 to {phase.value*100:.0f}% traffic...")

            self.current_phase = phase

            # Evaluate metrics at this phase
            if self.evaluate_canary_phase():
                print(f"✓ Phase passed. v2.0 error rate: {self.v2_metrics.error_rate}%")
            else:
                print(f"✗ Phase failed. Rolling back. v2.0 error rate: {self.v2_metrics.error_rate}%")
                break

        return not self.rollback_triggered

@pytest.mark.asyncio
async def test_canary_successful_rollout():
    """Test that v2.0 with better performance rolls out fully."""

    controller = CanaryDeploymentController(
        v1_error_rate=0.5,   # v1 has 0.5% error rate
        v2_error_rate=0.2    # v2 has 0.2% error rate (better)
    )

    success = await controller.run_canary_deployment()

    assert success
    assert controller.current_phase == DeploymentPhase.FULL_ROLLOUT
    assert not controller.rollback_triggered

@pytest.mark.asyncio
async def test_canary_rollback_on_degradation():
    """Test that v2.0 with worse performance triggers rollback."""

    controller = CanaryDeploymentController(
        v1_error_rate=0.5,   # v1 has 0.5% error rate
        v2_error_rate=2.0    # v2 has 2.0% error rate (much worse)
    )

    success = await controller.run_canary_deployment()

    assert not success
    assert controller.rollback_triggered
    assert controller.current_phase == DeploymentPhase.CANARY_10

@pytest.mark.asyncio
async def test_canary_within_tolerance():
    """Test that v2.0 within error tolerance proceeds."""

    controller = CanaryDeploymentController(
        v1_error_rate=0.5,   # v1 has 0.5% error rate
        v2_error_rate=0.8    # v2 has 0.8% error rate (slightly worse, but within tolerance)
    )

    success = await controller.run_canary_deployment()

    # Should proceed (within tolerance of 0.5%)
    assert success
```

**Why this strategy?**

- **Staged rollout:** Deploying to 10% first catches problems early, limiting blast radius.
- **Error-rate comparison:** Compares v2 against v1 baseline, not absolute thresholds. More robust to variations.
- **Rollback is fast:** If v2 is worse, we stop immediately and rollback. Production impact is limited to 10%.
- **Safety margin (tolerance):** Allows v2 to be slightly worse (0.5%) to account for noise/variance.

---

## Problem 7: Agent Failure Recovery with Circuit Breaker [TC2 Review - Hooks & TC4 Current - Long-Running Patterns]

**Scenario:**
Your agent calls an external API to fetch data. The API is unreliable (occasional outages, rate limiting). You want to:
1. Retry failed requests (transient failures often resolve quickly)
2. Circuit break after N failures (prevent cascading failures)
3. Degrade gracefully (use cached data or simpler logic if API is down)

**Task:**
Implement a circuit breaker pattern that:
1. Tracks failures
2. Opens circuit after 5 consecutive failures
3. Tries to recover every 30 seconds
4. Falls back to degraded mode if circuit is open

---

### Solution

```python
from enum import Enum
from time import time
from typing import Callable, Any, Optional
import logging

logger = logging.getLogger(__name__)

class CircuitState(Enum):
    CLOSED = "closed"        # Normal operation
    OPEN = "open"            # API down; reject calls
    HALF_OPEN = "half_open"  # Trying to recover

class CircuitBreaker:
    """
    Protects agent from cascading failures via circuit breaker pattern.
    """

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout_seconds: int = 30
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout_seconds

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time: Optional[float] = None

    def call(
        self,
        func: Callable,
        *args,
        fallback: Optional[Callable] = None,
        **kwargs
    ) -> Any:
        """
        Call function with circuit breaker protection.
        If circuit is open, use fallback (degraded mode).
        """

        if self.state == CircuitState.OPEN:
            # Circuit is open; check if we should try recovery
            if self._should_attempt_recovery():
                logger.info("Attempting circuit recovery (half-open state)...")
                self.state = CircuitState.HALF_OPEN
            else:
                # Still in timeout; use fallback
                logger.warning("Circuit is open. Using fallback (degraded mode).")
                if fallback:
                    return fallback(*args, **kwargs)
                else:
                    raise RuntimeError("Circuit open and no fallback provided")

        # State is CLOSED or HALF_OPEN; try the call
        try:
            result = func(*args, **kwargs)

            # Success
            self._on_success()

            return result

        except Exception as e:
            # Failure
            self._on_failure()

            if self.state == CircuitState.OPEN:
                # Too many failures; circuit now open
                logger.error(f"Circuit opened after {self.failure_count} failures. {e}")

                # Try fallback
                if fallback:
                    logger.info("Using fallback due to circuit open.")
                    return fallback(*args, **kwargs)

            # Rethrow if fallback not available
            raise

    def _should_attempt_recovery(self) -> bool:
        """Check if it's time to try recovery (half-open state)."""

        if self.last_failure_time is None:
            return False

        elapsed = time() - self.last_failure_time
        return elapsed > self.recovery_timeout

    def _on_success(self):
        """Called when call succeeds."""

        if self.state == CircuitState.HALF_OPEN:
            logger.info("Recovery successful! Closing circuit.")

        self.state = CircuitState.CLOSED
        self.failure_count = 0

    def _on_failure(self):
        """Called when call fails."""

        self.failure_count += 1
        self.last_failure_time = time()

        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

# Integration with agent
class ResilientAgent:
    def __init__(self):
        self.api_circuit_breaker = CircuitBreaker(
            failure_threshold=5,
            recovery_timeout_seconds=30
        )

    async def fetch_data_with_protection(self, url: str):
        """Fetch data with circuit breaker protection."""

        # Fallback: return cached/default data
        def fallback_data(*args, **kwargs):
            logger.warning("Using cached/default data (circuit fallback)")
            return {"cached": True, "data": []}

        # Try to fetch; use fallback if circuit is open
        try:
            result = self.api_circuit_breaker.call(
                func=self._fetch_from_api,
                url=url,
                fallback=fallback_data
            )
            return result
        except Exception as e:
            logger.error(f"Failed to fetch data: {e}")
            raise

    async def _fetch_from_api(self, url: str):
        """Actual API call (may fail)."""
        # Simulate API call
        import random
        if random.random() < 0.2:  # 20% failure rate
            raise RuntimeError(f"API error fetching {url}")
        return {"data": "fresh_data"}

# Tests
import pytest

def test_circuit_breaker_opens_after_failures():
    """Test that circuit opens after threshold failures."""

    def failing_func():
        raise RuntimeError("API error")

    breaker = CircuitBreaker(failure_threshold=3)

    # Try 3 times (failures)
    for i in range(3):
        try:
            breaker.call(failing_func)
        except RuntimeError:
            pass

    # After 3 failures, circuit should be open
    assert breaker.state == CircuitState.OPEN

def test_circuit_breaker_uses_fallback():
    """Test that fallback is used when circuit is open."""

    def failing_func():
        raise RuntimeError("API error")

    def fallback_func():
        return "fallback_result"

    breaker = CircuitBreaker(failure_threshold=2)

    # Trigger failures to open circuit
    for _ in range(2):
        try:
            breaker.call(failing_func)
        except RuntimeError:
            pass

    # Circuit is open; next call should use fallback
    result = breaker.call(failing_func, fallback=fallback_func)
    assert result == "fallback_result"

def test_circuit_breaker_recovery():
    """Test that circuit recovers after timeout."""

    def sometimes_fails():
        if time() % 1 < 0.5:
            raise RuntimeError("Transient error")
        return "success"

    breaker = CircuitBreaker(failure_threshold=2, recovery_timeout_seconds=0.1)

    # Open circuit
    for _ in range(2):
        try:
            breaker.call(sometimes_fails)
        except RuntimeError:
            pass

    assert breaker.state == CircuitState.OPEN

    # Wait for recovery timeout
    import asyncio
    asyncio.get_event_loop().run_until_complete(asyncio.sleep(0.15))

    # Next call should attempt recovery (half-open)
    try:
        breaker.call(sometimes_fails)
    except:
        pass

    # If recovery succeeds, circuit closes
    # (actual behavior depends on whether sometimes_fails succeeds)
```

**Why this strategy?**

- **Prevents cascading failures:** Once the API is down, stop hammering it. Circuit breaker reduces load, allowing the API to recover.
- **Fast failover:** When circuit is open, immediately use fallback instead of waiting for timeouts.
- **Automatic recovery:** Half-open state allows the agent to probe recovery without full traffic.

---

## Problem 8: Multi-Region Deployment Strategy [TC4 Current - Architecture Patterns]

**Scenario:**
Your agent serves customers in US, EU, and APAC. You need to:
1. Deploy to each region independently (faster deployments, lower latency)
2. Sync agent versions across regions (avoid inconsistent behavior)
3. Handle region-specific secrets and configs
4. Route requests to the nearest region

**Task:**
Design a multi-region deployment architecture. Should you use a single database, region-specific databases, or a hybrid?

---

### Solution

```python
from dataclasses import dataclass
from typing import Dict, List
from enum import Enum

class Region(Enum):
    US_EAST = "us-east-1"
    EU_WEST = "eu-west-1"
    APAC = "ap-southeast-1"

@dataclass
class RegionDeployment:
    region: Region
    version: str
    deployed_at: str
    instance_count: int
    database: str  # Region-specific database

class MultiRegionController:
    """
    Manages agent deployments across regions.

    Architecture:
    - Version control: Single source of truth (Git repo)
    - Deployment: Regional pipeline (independent deployments)
    - Databases: Region-specific (low latency, data residency)
    - Secrets: Region-specific (compliance, key management per region)
    - Routing: Nearest region (geo-latency optimized)
    """

    def __init__(self):
        self.deployments: Dict[Region, RegionDeployment] = {}
        self.target_version = "2.0"  # Desired version across all regions

    def get_region_for_request(self, client_ip: str) -> Region:
        """
        Route request to nearest region based on client IP.
        """

        # Simplified: in practice, use MaxMind GeoIP database
        if client_ip.startswith("1.2.3"):  # Simulate US IP
            return Region.US_EAST
        elif client_ip.startswith("2.3.4"):  # Simulate EU IP
            return Region.EU_WEST
        else:
            return Region.APAC

    async def deploy_new_version_to_region(
        self,
        region: Region,
        new_version: str
    ) -> bool:
        """
        Deploy new version to a single region.
        Other regions unaffected; allows gradual rollout.
        """

        print(f"Deploying v{new_version} to {region.value}...")

        # Region-specific steps:
        # 1. Pull code from Git repo
        # 2. Load region-specific secrets from vault
        # 3. Spin up new instances
        # 4. Run smoke tests
        # 5. Update load balancer routing

        deployment = RegionDeployment(
            region=region,
            version=new_version,
            deployed_at="2024-01-15T10:00:00Z",
            instance_count=3,
            database=f"{region.value}-db"
        )

        self.deployments[region] = deployment

        print(f"✓ v{new_version} deployed to {region.value}")
        return True

    async def sync_versions_across_regions(self):
        """
        Synchronize versions across all regions.
        Useful for major updates or compliance requirements.
        """

        regions = [Region.US_EAST, Region.EU_WEST, Region.APAC]

        for region in regions:
            await self.deploy_new_version_to_region(region, self.target_version)

        print(f"✓ All regions now running v{self.target_version}")

    def get_deployment_status(self) -> Dict:
        """Get deployment status across regions."""

        status = {}

        for region in Region:
            deployment = self.deployments.get(region)
            status[region.value] = {
                "version": deployment.version if deployment else "unknown",
                "instances": deployment.instance_count if deployment else 0,
                "database": deployment.database if deployment else "none",
            }

        return status

# Architecture Decision: Database Strategy

class DatabaseStrategy(Enum):
    SINGLE_GLOBAL = "single_global"      # One database for all regions (not recommended)
    REGION_SPECIFIC = "region_specific"  # Separate database per region
    HYBRID = "hybrid"                     # Region-specific for hot data, global for reference data

# Recommendation
def evaluate_database_strategies():
    """
    Compare database strategies for multi-region deployment.
    """

    strategies = {
        "Single Global Database": {
            "pros": ["Data consistency (one source of truth)", "Simpler management"],
            "cons": ["High latency (cross-region queries)", "Compliance issues (data residency)"],
            "use_case": "Not recommended for production"
        },

        "Region-Specific Databases": {
            "pros": ["Low latency (local DB queries)", "Data residency compliance", "High availability"],
            "cons": ["Complex sync (handle eventual consistency)", "Data duplication"],
            "use_case": "Recommended for most deployments"
        },

        "Hybrid (Region-specific + Global Cache)": {
            "pros": ["Low latency (local DB)", "Reference data consistency (global cache)", "Compliance"],
            "cons": ["More complex (sync logic needed)"],
            "use_case": "Best for large-scale deployments with reference data"
        }
    }

    return strategies

# Recommended architecture
class HybridDatabaseArchitecture:
    """
    Hybrid strategy: region-specific databases + global reference cache.

    - User data (high-write, region-specific): stored in region DB
    - Reference data (read-mostly, global): cached locally but synced globally
    """

    def __init__(self):
        self.region_databases: Dict[Region, str] = {
            Region.US_EAST: "us-east-1-postgresql",
            Region.EU_WEST: "eu-west-1-postgresql",
            Region.APAC: "ap-southeast-1-postgresql",
        }

        self.global_cache = {}  # Reference data cached locally

    async def sync_reference_data(self):
        """
        Periodically sync reference data across regions.
        Example: product catalog, company settings.
        """

        # Fetch from authoritative source (e.g., S3, global DB)
        reference_data = await self._fetch_reference_data()

        # Distribute to all regions
        for region in Region:
            self.global_cache[region] = reference_data

        print("✓ Reference data synced across regions")

    async def _fetch_reference_data(self):
        """Fetch reference data from authoritative source."""
        return {"products": ["A", "B", "C"]}

    async def query_user_data(self, region: Region, user_id: str):
        """
        Query user data from region-specific database.
        Low latency, local consistency.
        """

        db = self.region_databases[region]
        # Execute query: SELECT * FROM users WHERE id = ?
        return f"User data from {db}"

    async def query_reference_data(self, data_key: str):
        """
        Query reference data from global cache.
        No cross-region latency.
        """

        return self.global_cache.get(data_key, "not found")
```

**Why this strategy?**

**Hybrid is recommended:**

| Strategy | Latency | Consistency | Compliance | Complexity |
|----------|---------|------------|-----------|-----------|
| Global DB | High (❌) | Strong (✓) | Poor (❌) | Low |
| Region DB | Low (✓) | Eventual (✓) | Good (✓) | Medium |
| Hybrid | Low (✓) | Mixed (✓) | Good (✓) | Medium |

- **Low latency:** Region-specific DBs ensure queries don't cross continents.
- **Compliance:** Data residency requirements (GDPR, etc.) are met (data stays in region).
- **Reference data sync:** Global cache is synced periodically, avoiding duplication complexity.

---

## Problem 9: Trace Correlation Across Regions [TC3 Review - OTel Tracing & TC4 Current - Architecture]

**Scenario:**
A customer in EU makes a request. The agent in eu-west-1 processes it and calls a service in us-east-1. You need to trace the entire request across both regions, showing how much time was spent in each.

**Task:**
Implement trace propagation across regions. How do you ensure the trace ID follows the request?

---

### Solution

```python
from opentelemetry import trace, context
from opentelemetry.propagate import inject, extract
import json

# Trace propagation across regions

def extract_trace_context_from_request(request_headers: dict) -> dict:
    """
    Extract trace context from HTTP headers.
    This preserves the trace ID across service boundaries and regions.
    """

    # Standard OTel header for trace context
    # (traceparent header in W3C Trace Context format)
    propagated_context = extract(request_headers)

    return propagated_context

def inject_trace_context_into_headers(headers: dict) -> dict:
    """
    Inject current trace context into headers before making cross-region call.
    """

    inject(headers)
    return headers

# Multi-region tracing example
async def process_request_with_cross_region_tracing(request):
    """
    1. Extract trace context from request
    2. Create span in EU region
    3. Call US region service (propagate trace)
    4. Trace spans automatically correlate in observability platform
    """

    tracer = trace.get_tracer(__name__)

    # Extract trace context from incoming request
    # This preserves trace ID across region boundary
    propagated_context = extract_trace_context_from_request(request.headers)

    with context.attach(propagated_context):
        with tracer.start_as_current_span("eu-west-process") as span:
            span.set_attribute("region", "eu-west-1")

            # Make cross-region call to US service
            headers = {}
            headers = inject_trace_context_into_headers(headers)

            # Call US service with propagated trace context
            us_result = await call_us_service(headers=headers)

            return us_result

async def call_us_service(headers: dict):
    """
    Process request in US region.
    Trace context is already in headers (propagated from EU).
    """

    tracer = trace.get_tracer(__name__)

    # Extract trace context from headers
    propagated_context = extract_trace_context_from_request(headers)

    with context.attach(propagated_context):
        with tracer.start_as_current_span("us-east-process") as span:
            span.set_attribute("region", "us-east-1")

            # Process in US
            result = {"data": "from US"}

            # Span is automatically added to the same trace as EU span
            return result

# Result in observability platform:
# Trace ID: abc123def456
#   ├─ Span: eu-west-process (region: eu-west-1, duration: 500ms)
#   │   └─ Span: us-east-process (region: us-east-1, duration: 300ms)
#   │       └─ Total latency: 800ms (500ms EU + 300ms US)
```

**Why this strategy?**

- **W3C Trace Context:** Standard format allows trace propagation across vendors and regions.
- **Automatic span correlation:** OTEL automatically links spans with the same trace ID.
- **Observable latency breakdown:** You can see exactly how much time was spent in each region (e.g., 500ms EU, 300ms US).

---

## Problem 10: Production Runbook for Common Failure Scenarios [TC4 Current - Architecture]

**Scenario:**
Your agent is in production. Common failure scenarios:
1. Circuit breaker opens (API is down)
2. Agent is slow (P99 latency > 2s)
3. Error rate spikes (> 0.1%)
4. Memory leak (memory grows over time)

**Task:**
Write a runbook for each scenario: what metrics to check, what causes it, and how to remediate.

---

### Solution

```python
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class RunbookStep:
    step: str
    description: str
    metric_to_check: str = None

class ProductionRunbook:
    """
    Runbook for common production failures.
    Used by on-call engineer when alerts fire.
    """

    @staticmethod
    def circuit_breaker_open() -> List[RunbookStep]:
        """
        Scenario: Circuit breaker opened (API is unavailable).
        Alert: agent_api_circuit_open
        """

        return [
            RunbookStep(
                step="1. Confirm circuit is open",
                description="Check dashboard: Circuit Breaker Status. Should show 'OPEN'.",
                metric_to_check="circuit_breaker_state"
            ),

            RunbookStep(
                step="2. Check downstream API health",
                description="Is the API up? Check status page or ping endpoint.",
                metric_to_check="api_health_check"
            ),

            RunbookStep(
                step="3. Check agent logs",
                description="grep logs for 'API error', 'timeout', 'rate limit'. Identify root cause.",
                metric_to_check="error_logs"
            ),

            RunbookStep(
                step="4. Remediate based on cause",
                description="""
                - If API is down: wait for API team to fix, monitor API health
                - If rate limit: contact API provider or increase quota
                - If timeout: check network connectivity, increase timeout threshold
                """,
            ),

            RunbookStep(
                step="5. Verify recovery",
                description="Wait 30s for circuit to enter half-open state and attempt recovery.",
                metric_to_check="circuit_breaker_state"
            ),

            RunbookStep(
                step="6. If circuit remains open after 5min",
                description="Escalate to API team. Consider manual failover or disable this feature.",
            ),
        ]

    @staticmethod
    def high_latency() -> List[RunbookStep]:
        """
        Scenario: P99 latency exceeds SLO (> 2s).
        Alert: agent_p99_latency_exceeded
        """

        return [
            RunbookStep(
                step="1. Check which tools are slow",
                description="View dashboard 'Tool Performance' breakdown. Which tool has highest latency?",
                metric_to_check="tool_latency_p99"
            ),

            RunbookStep(
                step="2. Check tool-specific metrics",
                description="""
                For slow tool:
                - Database query latency (slow query log)
                - Network latency to external service
                - Resource utilization (CPU, memory)
                """,
                metric_to_check="tool_duration"
            ),

            RunbookStep(
                step="3. Check if traffic surge",
                description="Did request volume spike? High concurrency can cause latency.",
                metric_to_check="request_rate"
            ),

            RunbookStep(
                step="4. Remediate",
                description="""
                - Database slow query: add index or optimize query
                - Network latency: check service health, routing, DNS
                - Resource utilization: scale horizontally (more instances)
                - Query caching: enable caching for repeated requests
                """,
            ),

            RunbookStep(
                step="5. Monitor recovery",
                description="After fix, monitor P99 latency for 15min. Should return to < 2s.",
                metric_to_check="tool_latency_p99"
            ),
        ]

    @staticmethod
    def error_rate_spike() -> List[RunbookStep]:
        """
        Scenario: Error rate spikes above SLO (> 0.1%).
        Alert: agent_error_rate_exceeded
        """

        return [
            RunbookStep(
                step="1. Get error details",
                description="Check error log: what errors are occurring? Examples: timeout, auth failure, invalid input.",
                metric_to_check="error_log"
            ),

            RunbookStep(
                step="2. Check if errors are systematic or random",
                description="Are all requests failing, or just a percentage? Affects remediation.",
                metric_to_check="error_rate"
            ),

            RunbookStep(
                step="3. Check recent deployments",
                description="Was a new version deployed in the last 30min? If so, rollback.",
                metric_to_check="deployment_history"
            ),

            RunbookStep(
                step="4. Check resource saturation",
                description="Is the agent out of memory, CPU, or connections? Check pod metrics.",
                metric_to_check="resource_utilization"
            ),

            RunbookStep(
                step="5. Remediate",
                description="""
                - If new deployment caused it: rollback
                - If resource saturation: scale up or restart pods
                - If systematic error: check configuration, secrets, network connectivity
                """,
            ),

            RunbookStep(
                step="6. Post-mortem",
                description="After incident, review: Why did error rate spike? How to prevent?",
            ),
        ]

    @staticmethod
    def memory_leak() -> List[RunbookStep]:
        """
        Scenario: Memory usage grows over time (memory leak).
        Alert: agent_memory_usage_critical
        """

        return [
            RunbookStep(
                step="1. Confirm memory is growing",
                description="Check memory usage graph over last 1hr. Is it continuously increasing?",
                metric_to_check="memory_usage"
            ),

            RunbookStep(
                step="2. Check recent code changes",
                description="Review PRs merged in last week. Look for: unclosed connections, circular references, unbounded cache.",
                metric_to_check="git_log"
            ),

            RunbookStep(
                step="3. Identify memory culprit",
                description="Use profiler (py-spy, memory_profiler) to identify which objects are growing.",
                metric_to_check="profiler_output"
            ),

            RunbookStep(
                step="4. Short-term mitigation",
                description="Restart agent pod. This clears memory (temporary fix).",
            ),

            RunbookStep(
                step="5. Long-term fix",
                description="""
                Common causes:
                - Unbounded cache (add TTL or max size)
                - Unclosed database connections (ensure cleanup)
                - Circular references in data structures
                - Log buffer overflow (rotate logs)
                """,
            ),

            RunbookStep(
                step="6. Deploy fix",
                description="Fix code, test locally, deploy with monitoring. Verify memory usage stabilizes.",
                metric_to_check="memory_usage"
            ),
        ]

    @staticmethod
    def print_runbook(scenario: str):
        """Print runbook for a scenario."""

        runbooks = {
            "circuit_breaker": ProductionRunbook.circuit_breaker_open(),
            "latency": ProductionRunbook.high_latency(),
            "error_rate": ProductionRunbook.error_rate_spike(),
            "memory_leak": ProductionRunbook.memory_leak(),
        }

        steps = runbooks.get(scenario)

        if not steps:
            print(f"Unknown scenario: {scenario}")
            return

        print(f"\n{'='*60}")
        print(f"RUNBOOK: {scenario.upper()}")
        print(f"{'='*60}\n")

        for step_obj in steps:
            print(f"{step_obj.step}")
            print(f"  {step_obj.description}")
            if step_obj.metric_to_check:
                print(f"  [Metric: {step_obj.metric_to_check}]")
            print()

# Usage
if __name__ == "__main__":
    ProductionRunbook.print_runbook("latency")
    ProductionRunbook.print_runbook("error_rate")
```

**Why this strategy?**

- **Structured:** Each scenario has clear steps, avoiding ad-hoc debugging.
- **Metric-driven:** Runbook tells you which metrics to check first, enabling rapid diagnosis.
- **Escalation path:** Runbook includes when to escalate (e.g., "if circuit remains open after 5min, escalate to API team").
- **Knowledge transfer:** New on-call engineers can follow runbook without deep domain knowledge.

---

## Reflection: Production Architecture Focus

This problem set emphasizes production resilience and operational excellence:

- **25% current (TC4):** Problems 1, 2, 3, 4, 5, 8, 10 focus on secure deployment, graceful shutdown, versioning, cost optimization, SLO monitoring, multi-region, and runbooks.
- **75% review (TC1-TC3):** Problems 6, 7, 9 revisit testing strategies, hooks (circuit breaker), and OTel tracing, but in production contexts.

**Key architectural patterns:**
1. **Secrets management** (vault, not env vars)
2. **Graceful shutdown** (signal handlers, timeout)
3. **Backwards compatibility** (adapter pattern, versioning)
4. **Cost optimization** (caching, model selection, sampling)
5. **SLO monitoring** (granular metrics, tool-level breakdown)
6. **Multi-region** (hybrid DB strategy, trace propagation)
7. **Resilience** (circuit breaker, fallback)
8. **Runbooks** (structured remediation)

**Advanced learner focus:** These problems require thinking beyond code—about failure modes, cost, operational complexity, and trade-offs (latency vs. cost, consistency vs. availability, etc.).
