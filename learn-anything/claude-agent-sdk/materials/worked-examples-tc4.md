# TC4: Production Architecture — Worked Examples with Backward Fading

## Topic Overview
Deploying an SDK agent in a hardened Docker container with credential proxy, sandbox isolation, and long-running support. This sprint focuses on production readiness, security, and operational stability.

---

## Full Worked Example: Hardened Data Processing Agent

**Problem Statement:** Deploy a long-running data processing agent in a hardened Docker container with: credential proxy for API keys, OS-level sandbox isolation, health checks, graceful shutdown, resource limits, and structured logging for production monitoring.

### Step 1: Design the Agent Architecture for Production
**Self-explanation prompt:** Why should we design the architecture before writing code?

```python
from dataclasses import dataclass
from enum import Enum
from typing import Optional
import os

class AgentState(Enum):
    INITIALIZING = "initializing"
    READY = "ready"
    PROCESSING = "processing"
    ERROR = "error"
    SHUTTING_DOWN = "shutting_down"
    STOPPED = "stopped"

@dataclass
class ProductionConfig:
    """Production configuration for the agent."""
    # API Configuration
    api_key_source: str  # "env", "file", "proxy"
    api_key_proxy_url: Optional[str] = None  # e.g., "http://localhost:9090"
    model: str = "claude-3-5-sonnet-20241022"

    # Resource Limits
    max_tokens_per_request: int = 2000
    max_concurrent_requests: int = 5
    memory_limit_mb: int = 512
    timeout_seconds: int = 300

    # Health & Monitoring
    health_check_interval_seconds: int = 30
    log_level: str = "INFO"
    structured_logging_enabled: bool = True

    # Graceful Shutdown
    shutdown_timeout_seconds: int = 30
    drain_queued_tasks_on_shutdown: bool = True

    @classmethod
    def from_env(cls) -> "ProductionConfig":
        """Load configuration from environment variables."""
        return cls(
            api_key_source=os.getenv("API_KEY_SOURCE", "proxy"),
            api_key_proxy_url=os.getenv("API_KEY_PROXY_URL"),
            model=os.getenv("MODEL", "claude-3-5-sonnet-20241022"),
            max_tokens_per_request=int(os.getenv("MAX_TOKENS", 2000)),
            max_concurrent_requests=int(os.getenv("MAX_CONCURRENT", 5)),
            memory_limit_mb=int(os.getenv("MEMORY_LIMIT_MB", 512)),
            timeout_seconds=int(os.getenv("TIMEOUT_SECONDS", 300)),
            health_check_interval_seconds=int(os.getenv("HEALTH_CHECK_INTERVAL", 30)),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
        )

class ProductionAgent:
    """Agent designed for production deployment."""

    def __init__(self, config: ProductionConfig):
        self.config = config
        self.state = AgentState.INITIALIZING
        self.request_count = 0
        self.error_count = 0
        self.startup_time = None

    async def initialize(self) -> bool:
        """Initialize the agent with production safety checks."""
        try:
            # Validate configuration
            if self.config.api_key_source == "proxy" and not self.config.api_key_proxy_url:
                raise ValueError("API key proxy URL required when using proxy source")

            # Initialize client based on key source
            self.client = await self._initialize_client()

            # Verify connectivity
            await self._verify_connectivity()

            self.state = AgentState.READY
            import time
            self.startup_time = time.time()
            return True

        except Exception as e:
            self.state = AgentState.ERROR
            raise

    async def _initialize_client(self) -> "anthropic.Anthropic":
        """Initialize Anthropic client with configured credential source."""
        import anthropic

        if self.config.api_key_source == "proxy":
            # Get API key from proxy service
            api_key = await self._get_key_from_proxy()
        elif self.config.api_key_source == "file":
            # Read from secure file
            api_key = self._get_key_from_file()
        else:  # "env"
            # Read from environment (least secure, use only in development)
            api_key = os.getenv("ANTHROPIC_API_KEY")

        return anthropic.Anthropic(api_key=api_key)

    async def _get_key_from_proxy(self) -> str:
        """Retrieve API key from credential proxy service."""
        import httpx

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{self.config.api_key_proxy_url}/credentials/anthropic",
                headers={"X-Service-ID": "data-processing-agent"}
            )
            response.raise_for_status()
            data = response.json()
            return data["api_key"]

    def _get_key_from_file(self) -> str:
        """Retrieve API key from secure file (read-only by agent)."""
        key_file = "/run/secrets/anthropic_api_key"
        with open(key_file, 'r') as f:
            return f.read().strip()

    async def _verify_connectivity(self):
        """Test basic connectivity to Claude API."""
        try:
            response = self.client.messages.create(
                model=self.config.model,
                max_tokens=10,
                messages=[{"role": "user", "content": "ping"}]
            )
            assert response is not None
        except Exception as e:
            raise RuntimeError(f"Failed to verify connectivity: {str(e)}")
```

**Why this works:** Separating configuration (which can vary per environment) from code makes the agent portable. Production configs enable credential proxying (more secure than embedding keys), resource limits, and graceful shutdown support.

---

### Step 2: Implement Credential Proxy Integration
**Self-explanation prompt:** Why is a credential proxy better than storing API keys in environment variables?

```python
import httpx
import asyncio
from datetime import datetime, timedelta

class CredentialProxy:
    """Client for credential proxy service."""

    def __init__(self, proxy_url: str, service_id: str, refresh_interval_minutes: int = 30):
        self.proxy_url = proxy_url
        self.service_id = service_id
        self.refresh_interval = timedelta(minutes=refresh_interval_minutes)
        self.cached_key = None
        self.cached_at = None

    async def get_api_key(self, force_refresh: bool = False) -> str:
        """Get API key from proxy, with caching."""
        # Check if cached key is still valid
        if (
            not force_refresh
            and self.cached_key
            and self.cached_at
            and datetime.now() - self.cached_at < self.refresh_interval
        ):
            return self.cached_key

        # Request fresh key from proxy
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{self.proxy_url}/credentials/anthropic",
                    headers={
                        "X-Service-ID": self.service_id,
                        "X-Request-Time": datetime.utcnow().isoformat()
                    }
                )
                response.raise_for_status()
                data = response.json()

                self.cached_key = data["api_key"]
                self.cached_at = datetime.now()
                return self.cached_key

            except httpx.HTTPError as e:
                raise RuntimeError(f"Failed to retrieve credentials: {str(e)}")

    async def refresh_in_background(self):
        """Continuously refresh credentials in background."""
        while True:
            try:
                await asyncio.sleep(self.refresh_interval.total_seconds() * 0.8)
                await self.get_api_key(force_refresh=True)
            except Exception as e:
                print(f"Background refresh failed: {e}")

class ProxyAwareAgent(ProductionAgent):
    """Agent that uses credential proxy."""

    def __init__(self, config: ProductionConfig):
        super().__init__(config)
        self.credential_proxy = None

    async def initialize(self) -> bool:
        """Initialize with credential proxy."""
        try:
            if self.config.api_key_source == "proxy":
                self.credential_proxy = CredentialProxy(
                    proxy_url=self.config.api_key_proxy_url,
                    service_id="data-processing-agent",
                    refresh_interval_minutes=30
                )
                # Start background refresh
                asyncio.create_task(self.credential_proxy.refresh_in_background())

            await super().initialize()
            return True

        except Exception as e:
            self.state = AgentState.ERROR
            raise

    async def _initialize_client(self) -> "anthropic.Anthropic":
        """Initialize client using proxy credentials."""
        import anthropic

        if self.credential_proxy:
            api_key = await self.credential_proxy.get_api_key()
        else:
            api_key = os.getenv("ANTHROPIC_API_KEY")

        return anthropic.Anthropic(api_key=api_key)
```

**Why this works:** A credential proxy service (like HashiCorp Vault or AWS Secrets Manager) never exposes keys in environment variables. Keys are retrieved over authenticated connections and can be rotated without restarting the agent. Background refresh ensures no service disruption.

---

### Step 3: Set Up OS-Level Sandbox Isolation
**Self-explanation prompt:** Why should we use OS-level sandboxing in addition to application-level controls?

```python
# Dockerfile with sandbox isolation
dockerfile_content = """
# Multi-stage build for minimal attack surface
FROM python:3.11-slim as builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Production stage: minimal base image
FROM python:3.11-slim

# Create non-root user for running the agent
RUN groupadd -r agent && useradd -r -g agent agent

# Install seccomp and AppArmor tools
RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /root/.local /home/agent/.local
COPY agent.py /app/agent.py
COPY config.yaml /app/config.yaml

# Set environment
ENV PATH=/home/agent/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Drop unnecessary capabilities
RUN setcap -r /usr/bin/python3 2>/dev/null || true

# Change ownership to non-root user
RUN chown -R agent:agent /app

# Switch to non-root user
USER agent

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Run agent
CMD ["python", "agent.py"]
"""

# SecComp profile for sandboxing
seccomp_profile = {
    "defaultAction": "SCMP_ACT_ERRNO",
    "defaultErrnoRet": 1,
    "archMap": [
        {
            "architecture": "SCMP_ARCH_X86_64",
            "subArchitectures": ["SCMP_ARCH_X86", "SCMP_ARCH_X32"]
        }
    ],
    "syscalls": [
        {
            "names": [
                "accept4", "arch_specific_syscall", "bind", "brk",
                "connect", "dup", "dup2", "dup3", "execve", "exit",
                "exit_group", "fcntl", "fork", "fstat", "fstatfs",
                "futex", "getcwd", "getpid", "getrandom", "getsockopt",
                "gettimeofday", "ioctl", "listen", "lseek", "madvise",
                "mmap", "mprotect", "mremap", "munmap", "nanosleep",
                "open", "openat", "pipe", "pipe2", "poll", "prctl",
                "pread64", "preadv", "preadv2", "prlimit64", "pselect6",
                "pwrite64", "pwritev", "pwritev2", "read", "readlink",
                "readlinkat", "readv", "recvfrom", "recvmsg", "recvmmsg",
                "rt_sigaction", "rt_sigpending", "rt_sigprocmask",
                "rt_sigreturn", "rt_sigsuspend", "rt_sigtimedwait",
                "sched_getaffinity", "sched_setaffinity", "select",
                "set_robust_list", "set_tid_address", "setitimer",
                "setsockopt", "sigaction", "sigaltstack", "sigpending",
                "sigprocmask", "sigsuspend", "socket", "socketpair",
                "stat", "statfs", "statx", "tgkill", "time", "timerfd_create",
                "timerfd_gettime", "timerfd_settime", "times", "tkill",
                "ugetrlimit", "uname", "wait4", "waitid", "waitpid",
                "write", "writev"
            ],
            "action": "SCMP_ACT_ALLOW"
        }
    ]
}

import json

def create_docker_config():
    """Create Docker and seccomp configuration."""
    # Write Dockerfile
    with open("Dockerfile", "w") as f:
        f.write(dockerfile_content)

    # Write seccomp profile
    with open("seccomp.json", "w") as f:
        json.dump(seccomp_profile, f, indent=2)

    print("Created Dockerfile with non-root user, minimal base, and health checks")
    print("Created seccomp.json for syscall filtering")
```

**Why this works:** Non-root user + minimal base image + seccomp filtering provides defense in depth. If the agent is compromised, an attacker has minimal capabilities (no shell, limited syscalls, no root). Multi-stage builds reduce image size and attack surface.

---

### Step 4: Implement Health Checks and Readiness Probes
**Self-explanation prompt:** Why do health checks require a separate port/endpoint rather than checking the main agent logic?

```python
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import asyncio
import time

class HealthCheckServer:
    """Separate health check server for container orchestration."""

    def __init__(self, agent: ProxyAwareAgent, port: int = 8000):
        self.agent = agent
        self.port = port
        self.app = FastAPI()
        self._setup_routes()

    def _setup_routes(self):
        """Set up health check endpoints."""

        @self.app.get("/health")
        async def health():
            """Basic liveness probe."""
            if self.agent.state == AgentState.STOPPED:
                raise HTTPException(status_code=503, detail="Agent stopped")

            return {"status": "alive", "state": self.agent.state.value}

        @self.app.get("/ready")
        async def readiness():
            """Readiness probe - returns 200 only when ready to process."""
            if self.agent.state != AgentState.READY:
                raise HTTPException(
                    status_code=503,
                    detail=f"Agent not ready, state: {self.agent.state.value}"
                )

            return {
                "ready": True,
                "requests_processed": self.agent.request_count,
                "errors": self.agent.error_count,
                "uptime_seconds": time.time() - self.agent.startup_time
            }

        @self.app.get("/metrics")
        async def metrics():
            """Prometheus-compatible metrics endpoint."""
            uptime = time.time() - (self.agent.startup_time or time.time())
            error_rate = (
                self.agent.error_count / self.agent.request_count
                if self.agent.request_count > 0 else 0
            )

            return {
                "requests_total": self.agent.request_count,
                "errors_total": self.agent.error_count,
                "error_rate": error_rate,
                "uptime_seconds": uptime,
                "state": self.agent.state.value
            }

    async def run(self):
        """Run the health check server."""
        import uvicorn
        config = uvicorn.Config(
            self.app,
            host="0.0.0.0",
            port=self.port,
            log_level="error"
        )
        server = uvicorn.Server(config)
        await server.serve()

class AgentWithHealthChecks(ProxyAwareAgent):
    """Agent with integrated health check server."""

    def __init__(self, config: ProductionConfig):
        super().__init__(config)
        self.health_server = HealthCheckServer(self, port=8000)
        self.background_tasks = []

    async def initialize(self) -> bool:
        """Initialize agent and start health check server."""
        await super().initialize()

        # Start health check server in background
        task = asyncio.create_task(self.health_server.run())
        self.background_tasks.append(task)

        return True
```

**Why this works:** Separate health endpoints don't interfere with the agent's main work. Liveness checks tell the orchestrator "the process is running." Readiness checks tell it "accept traffic." Metrics enable monitoring and alerting.

---

### Step 5: Implement Graceful Shutdown with Request Draining
**Self-explanation prompt:** Why do we need graceful shutdown in production rather than immediate termination?

```python
import signal
from contextlib import asynccontextmanager

class ResilientAgent(AgentWithHealthChecks):
    """Agent with graceful shutdown support."""

    def __init__(self, config: ProductionConfig):
        super().__init__(config)
        self.pending_requests = []
        self.shutdown_event = asyncio.Event()
        self.shutdown_initiated_at = None

    async def process_request(self, task_data: dict) -> str:
        """Process a request, respecting graceful shutdown."""
        # Reject new requests if shutdown is in progress
        if self.shutdown_event.is_set():
            raise RuntimeError("Agent is shutting down, rejecting new requests")

        request_id = f"req_{self.request_count}"
        self.pending_requests.append(request_id)

        try:
            self.state = AgentState.PROCESSING

            # Add timeout protection
            async def call_claude():
                return self.client.messages.create(
                    model=self.config.model,
                    max_tokens=self.config.max_tokens_per_request,
                    messages=[{"role": "user", "content": str(task_data)}]
                )

            response = await asyncio.wait_for(
                call_claude(),
                timeout=self.config.timeout_seconds
            )

            self.request_count += 1
            return "\n".join(
                block.text for block in response.content
                if block.type == "text"
            )

        except asyncio.TimeoutError:
            self.error_count += 1
            raise RuntimeError(f"Request {request_id} timed out after {self.config.timeout_seconds}s")

        except Exception as e:
            self.error_count += 1
            raise

        finally:
            self.pending_requests.remove(request_id)
            self.state = AgentState.READY

    async def shutdown_gracefully(self):
        """Gracefully shut down the agent."""
        self.state = AgentState.SHUTTING_DOWN
        self.shutdown_event.set()
        self.shutdown_initiated_at = time.time()

        print("Graceful shutdown initiated")

        # Wait for pending requests to complete
        if self.config.drain_queued_tasks_on_shutdown:
            timeout = self.config.shutdown_timeout_seconds
            start = time.time()

            while self.pending_requests and (time.time() - start) < timeout:
                print(f"Waiting for {len(self.pending_requests)} requests to complete...")
                await asyncio.sleep(1)

            if self.pending_requests:
                print(f"Timeout: {len(self.pending_requests)} requests still pending")

        # Clean up background tasks
        for task in self.background_tasks:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        self.state = AgentState.STOPPED
        print("Graceful shutdown complete")

    def setup_signal_handlers(self):
        """Set up signal handlers for graceful shutdown."""
        loop = asyncio.get_event_loop()

        def signal_handler(signum, frame):
            print(f"Received signal {signum}, initiating graceful shutdown")
            asyncio.create_task(self.shutdown_gracefully())

        signal.signal(signal.SIGTERM, signal_handler)
        signal.signal(signal.SIGINT, signal_handler)
```

**Why this works:** Kubernetes sends SIGTERM before SIGKILL. Graceful shutdown gives in-flight requests time to complete, preventing data loss. Draining the queue ensures no work is dropped when scaling down.

---

### Step 6: Add Resource Limits and Circuit Breaker Pattern
**Self-explanation prompt:** Why do we need circuit breakers when we already have timeouts?

```python
from enum import Enum as StateEnum
import time

class CircuitBreakerState(StateEnum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Reject all requests
    HALF_OPEN = "half_open"  # Allow test request

class CircuitBreaker:
    """Circuit breaker for API resilience."""

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout_seconds: int = 60,
        success_threshold: int = 2
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout_seconds
        self.success_threshold = success_threshold

        self.state = CircuitBreakerState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None

    async def call(self, func, *args, **kwargs):
        """Execute function with circuit breaker protection."""
        if self.state == CircuitBreakerState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitBreakerState.HALF_OPEN
                self.success_count = 0
            else:
                raise RuntimeError("Circuit breaker is OPEN")

        try:
            result = await func(*args, **kwargs)

            if self.state == CircuitBreakerState.HALF_OPEN:
                self.success_count += 1
                if self.success_count >= self.success_threshold:
                    self.state = CircuitBreakerState.CLOSED
                    self.failure_count = 0

            return result

        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()

            if self.failure_count >= self.failure_threshold:
                self.state = CircuitBreakerState.OPEN

            raise

    def _should_attempt_reset(self) -> bool:
        """Check if recovery timeout has passed."""
        if not self.last_failure_time:
            return True

        return (time.time() - self.last_failure_time) > self.recovery_timeout

class RobustAgent(ResilientAgent):
    """Agent with circuit breaker for API resilience."""

    def __init__(self, config: ProductionConfig):
        super().__init__(config)
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=5,
            recovery_timeout_seconds=60
        )
        self.active_requests = 0

    async def process_request_with_circuit_breaker(self, task_data: dict) -> str:
        """Process request with resource limits and circuit breaker."""
        # Enforce max concurrent requests
        if self.active_requests >= self.config.max_concurrent_requests:
            raise RuntimeError(
                f"Max concurrent requests ({self.config.max_concurrent_requests}) exceeded"
            )

        self.active_requests += 1
        try:
            return await self.circuit_breaker.call(
                self.process_request,
                task_data
            )
        finally:
            self.active_requests -= 1
```

**Why this works:** Circuit breakers prevent cascading failures. When an API is degraded, opening the circuit immediately fails requests instead of timing them out (faster user feedback). HALF_OPEN state allows recovery detection without flooding a recovering service.

---

### Step 7: Implement Structured Logging and Instrumentation
**Self-explanation prompt:** Why is structured logging critical for production debugging?

```python
import json
import logging
from datetime import datetime

class StructuredLogger:
    """Structured logging for production."""

    def __init__(self, service_name: str, log_level: str = "INFO"):
        self.service_name = service_name
        self.logger = logging.getLogger(service_name)
        self.logger.setLevel(log_level)

        # JSON formatter for stdout
        handler = logging.StreamHandler()
        handler.setFormatter(self._json_formatter())
        self.logger.addHandler(handler)

    def _json_formatter(self):
        """Create a JSON formatter for structured logs."""
        class JSONFormatter(logging.Formatter):
            def format(self, record):
                log_obj = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "service": self.service_name,
                    "level": record.levelname,
                    "message": record.getMessage(),
                    "logger": record.name
                }

                # Add custom fields
                if hasattr(record, 'request_id'):
                    log_obj["request_id"] = record.request_id
                if hasattr(record, 'duration_ms'):
                    log_obj["duration_ms"] = record.duration_ms
                if hasattr(record, 'error_code'):
                    log_obj["error_code"] = record.error_code

                if record.exc_info:
                    log_obj["exception"] = self.formatException(record.exc_info)

                return json.dumps(log_obj)

        return JSONFormatter()

    def log_request(self, request_id: str, task_type: str, duration_ms: float):
        """Log a completed request."""
        extra = {
            'request_id': request_id,
            'duration_ms': duration_ms,
            'task_type': task_type
        }
        record = logging.LogRecord(
            self.logger.name, logging.INFO,
            "", 0, f"Request processed", (), None
        )
        for key, value in extra.items():
            setattr(record, key, value)
        self.logger.handle(record)

    def log_error(self, error_code: str, message: str, request_id: str = None):
        """Log an error with structured fields."""
        extra = {
            'error_code': error_code,
            'request_id': request_id
        }
        record = logging.LogRecord(
            self.logger.name, logging.ERROR,
            "", 0, message, (), None
        )
        for key, value in extra.items():
            if value:
                setattr(record, key, value)
        self.logger.handle(record)

class InstrumentedAgent(RobustAgent):
    """Agent with full structured logging."""

    def __init__(self, config: ProductionConfig):
        super().__init__(config)
        self.logger = StructuredLogger(
            "data-processing-agent",
            log_level=config.log_level
        )

    async def process_request_logged(self, task_data: dict) -> str:
        """Process request with structured logging."""
        request_id = f"req_{self.request_count}_{int(time.time() * 1000)}"
        start_time = time.time()

        self.logger.logger.info(
            f"Request started",
            extra={'request_id': request_id}
        )

        try:
            result = await self.process_request_with_circuit_breaker(task_data)

            duration_ms = (time.time() - start_time) * 1000
            self.logger.log_request(request_id, "claude_api_call", duration_ms)

            return result

        except Exception as e:
            self.logger.log_error(
                error_code=type(e).__name__,
                message=str(e),
                request_id=request_id
            )
            raise

@asynccontextmanager
async def run_production_agent(config: ProductionConfig):
    """Context manager for production agent lifecycle."""
    agent = InstrumentedAgent(config)

    try:
        # Initialize
        await agent.initialize()
        agent.setup_signal_handlers()

        yield agent

    finally:
        # Graceful shutdown
        await agent.shutdown_gracefully()

# Main entry point
async def main():
    config = ProductionConfig.from_env()

    async with run_production_agent(config) as agent:
        # Simulate work
        try:
            result = await agent.process_request_logged({"task": "analyze data"})
            print(result)
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
```

**Why this works:** Structured JSON logs are parseable by logging aggregators (ELK, Splunk, CloudWatch). Including request IDs enables tracing across logs. Error codes enable alerting on specific failure types.

---

---

## Fading Version 1: Remove Steps 6-7 (Circuit Breaker & Structured Logging)

**Problem Statement:** Deploy a long-running data processing agent in a hardened Docker container with credential proxy, sandbox isolation, health checks, and graceful shutdown.

### Step 1: Design the Agent Architecture for Production
[Full code as above]

### Step 2: Implement Credential Proxy Integration
[Full code as above]

### Step 3: Set Up OS-Level Sandbox Isolation
[Full code as above]

### Step 4: Implement Health Checks and Readiness Probes
[Full code as above]

### Step 5: Implement Graceful Shutdown with Request Draining
[Full code as above]

**Your Task:** Implement a circuit breaker pattern to prevent cascading failures and add structured JSON logging with request tracing.

---

## Fading Version 2: Remove Steps 4-7 (Health Checks, Graceful Shutdown, Circuit Breaker, Structured Logging)

**Problem Statement:** Deploy a batch processing agent in a hardened Docker container with credential proxy integration and OS-level sandbox isolation.

*(Note: Surface feature change — batch processing instead of long-running)*

### Step 1: Design the Agent Architecture for Production
```python
@dataclass
class BatchProcessingConfig:
    api_key_source: str
    api_key_proxy_url: Optional[str] = None
    model: str = "claude-3-5-sonnet-20241022"
    batch_size: int = 10
    max_concurrent_tasks: int = 5
    timeout_seconds: int = 300

class BatchProcessingAgent:
    def __init__(self, config: BatchProcessingConfig):
        self.config = config
        self.processed_items = 0
        self.failed_items = 0

    async def initialize(self) -> bool:
        # Validate and initialize with production safety
        self.client = await self._initialize_client()
        return True
```

### Step 2: Implement Credential Proxy Integration
[Full code structure as above, adapted to batch processing]

### Step 3: Set Up OS-Level Sandbox Isolation
```dockerfile
FROM python:3.11-slim as builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim
RUN groupadd -r batch && useradd -r -g batch batch
WORKDIR /app
COPY --from=builder /root/.local /home/batch/.local
COPY agent.py /app/agent.py
USER batch
CMD ["python", "agent.py"]
```

**Your Task:** Implement health checks and readiness probes, add graceful shutdown with request draining, implement circuit breaker pattern, and add structured logging.

---

## Fading Version 3: Remove Steps 2-7 (Proxy, Sandbox, Health Checks, Graceful Shutdown, Circuit Breaker, Structured Logging)

**Problem Statement:** Design a production-ready agent architecture with configuration management and resource limits.

*(Note: Surface feature change — configuration-focused)*

### Step 1: Design the Agent Architecture for Production
```python
from dataclasses import dataclass
from enum import Enum

class AgentState(Enum):
    INITIALIZING = "initializing"
    READY = "ready"
    PROCESSING = "processing"
    STOPPED = "stopped"

@dataclass
class ProductionConfig:
    api_key_source: str
    model: str
    max_tokens_per_request: int
    timeout_seconds: int
    log_level: str

    @classmethod
    def from_env(cls):
        import os
        return cls(
            api_key_source=os.getenv("API_KEY_SOURCE", "env"),
            model=os.getenv("MODEL", "claude-3-5-sonnet-20241022"),
            max_tokens_per_request=int(os.getenv("MAX_TOKENS", 2000)),
            timeout_seconds=int(os.getenv("TIMEOUT_SECONDS", 300)),
            log_level=os.getenv("LOG_LEVEL", "INFO")
        )

class ProductionAgent:
    def __init__(self, config: ProductionConfig):
        self.config = config
        self.state = AgentState.INITIALIZING
        self.request_count = 0
```

**Your Task:** Implement credential proxy integration, set up Docker sandbox isolation, add health checks and readiness probes, implement graceful shutdown, add circuit breaker pattern, and integrate structured logging.

---

## Fading Version 4: Remove Steps 1-7 (Everything except basic agent structure)

**Problem Statement:** Build an agent-based system ready for production deployment.

*(Note: Surface feature change — minimal scaffolding)*

```python
import anthropic
import asyncio

class BasicAgent:
    def __init__(self):
        self.client = anthropic.Anthropic()
        self.request_count = 0

    async def process(self, prompt: str) -> str:
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}]
        )
        self.request_count += 1
        return "\n".join(block.text for block in response.content if block.type == "text")

async def main():
    agent = BasicAgent()
    result = await agent.process("What is machine learning?")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
```

**Your Task:** Design a production configuration system, implement credential proxy integration, add Docker sandbox isolation, implement health checks with readiness probes, add graceful shutdown support, implement circuit breaker pattern for resilience, and integrate structured JSON logging.

---

## Key Takeaways for TC4

- **Configuration Management:** Separate config (environment-specific) from code; enable credential proxying
- **Credential Proxy:** Never embed API keys; use background refresh and caching
- **Docker Hardening:** Non-root user, minimal base image, multi-stage builds, seccomp filtering
- **Health Checks:** Separate liveness (SIGTERM) from readiness (accept traffic)
- **Graceful Shutdown:** SIGTERM handler, request draining, background task cleanup
- **Circuit Breaker:** Detect cascading failures; CLOSED → OPEN → HALF_OPEN transitions
- **Resource Limits:** Max concurrent requests, timeouts, memory limits
- **Structured Logging:** JSON format with request IDs for log aggregation and tracing
- **Signal Handling:** SIGTERM/SIGINT for graceful shutdown in containers
- **Context Managers:** Guarantee cleanup and resource management across the agent lifecycle

