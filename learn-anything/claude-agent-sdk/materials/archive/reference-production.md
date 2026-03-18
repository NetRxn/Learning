# Production Deployment Quick Reference (TC4)

## Docker Hardening Checklist

1. **Base Image Security**
   - Use minimal base: `python:3.11-slim` (not `latest`)
   - Pin specific version: `python:3.11.9-slim`
   - Scan for CVEs: `docker scout cves [image]`
   - Never use `alpine` if you need glibc (cryptography libs fail)

2. **User & Permissions**
   ```dockerfile
   # Create non-root user
   RUN useradd -m -u 1000 appuser
   USER appuser
   ```
   - Prevents container escape to root
   - Pin UID (1000) for reproducibility
   - Don't run as root in prod

3. **Layer Optimization & Supply Chain**
   ```dockerfile
   # Good: dependencies in separate layer
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY . .

   # Bad: rebuilds pip on every code change
   ```
   - Leverage layer caching
   - Install deps before code (cache busting)
   - Use `--no-cache-dir` to reduce layer size

4. **Multi-Stage Builds**
   ```dockerfile
   FROM python:3.11-slim as builder
   RUN pip install -r requirements.txt
   FROM python:3.11-slim
   COPY --from=builder /usr/local/lib/python3.11 /usr/local/lib/python3.11
   ```
   - Discard build artifacts (dev tools, compile outputs)
   - Final image is smaller, fewer CVE surface

5. **Secrets Management**
   - Never COPY secrets into image (persists in layers)
   - Use build arg + multi-stage for ephemeral secret
   - Better: inject via environment at runtime
   - Check: `.dockerignore` includes `.env`, credentials

---

## Credential Management Pattern

6. **Hierarchy (Least Privilege)**
   - **Service account**: narrow API key for that service only
   - **Env-scoped keys**: separate keys for dev/staging/prod
   - **Rotation policy**: expire API keys every 90 days
   - **Audit trail**: log every credential use

7. **Storage & Injection**
   - **Local dev**: `.env` file (gitignored)
   - **CI/CD secrets**: GitHub Secrets, GitLab Vault, etc.
   - **Runtime injection**: env variables at container start
   - **Vault**: HashiCorp Vault, AWS Secrets Manager for prod

8. **Pattern: Init Container + Shared Mount**
   ```yaml
   # Kubernetes: init container fetches secrets
   containers:
     - name: init-secrets
       image: vault-helper
       volumeMounts:
         - name: secrets
           mountPath: /secrets
     - name: app
       volumeMounts:
         - name: secrets
           mountPath: /app/secrets
           readOnly: true
   ```
   - Init pulls secrets on pod startup
   - App mounts read-only
   - Secrets never in image or logs

9. **What NOT to Do**
   - Don't commit `.env` files
   - Don't log credentials (even "redacted" copies)
   - Don't pass secrets in query params (appear in logs, proxies)
   - Don't hardcode in code (even in comments)

---

## Sandbox Isolation (gVisor/sandbox-runtime)

10. **gVisor Overview**
    - Lightweight sandbox: runs container with restricted syscalls
    - Trade-off: ~3-5% latency overhead, strong isolation
    - Use case: untrusted code, malicious tool returns
    - Deployment: `runtime: gvisor` in container config

11. **When to Use Sandbox Runtime**
    - User-submitted tools (code generation, script execution)
    - Third-party model outputs (don't trust model behavior)
    - Multi-tenant: sandbox per customer/org
    - Sensitive data: isolate high-value workloads

12. **Sandbox Configuration**
    ```yaml
    # Kubernetes securityContext
    securityContext:
      runAsNonRoot: true
      readOnlyRootFilesystem: true
      runAsUser: 1000
      allowPrivilegeEscalation: false
      seccompProfile:
        type: RuntimeDefault
    ```
    - readOnlyRootFilesystem: container can't modify files (except /tmp)
    - allowPrivilegeEscalation: false (prevent privilege escalation)
    - seccomp: restrict syscalls

13. **Audit Strategy**
    - Log all executed code (tool results, agent actions)
    - Separate audit logs from runtime logs
    - Example: `{"timestamp": "...", "tool": "exec_code", "code": "print(x)", "result": "...", "runtime_ms": 145}`

---

## Long-Running Agent Patterns

14. **Init + Worker Pattern**
    - **Init phase**: load config, connect to services, warm caches
    - **Worker loop**: service requests, update state periodically
    - Avoids re-initialization per request
    - Example:
      ```python
      # init
      config = load_config()
      agent = Agent(model="claude-3-5-sonnet", tools=ALL_TOOLS)
      db_pool = create_connection_pool()

      # worker loop
      while True:
          request = queue.get()
          result = agent.query(request.message)
          queue.put_result(result)
      ```

15. **Progress Tracking (progress.txt)**
    - Periodically write progress to file: `progress.txt`
    - Format: JSON or key=value
    - Include: current task, items processed, estimated time remaining
    - Orchestrator polls file to monitor health
    - Example:
      ```json
      {
        "task_id": "batch_123",
        "phase": "processing",
        "items_done": 45,
        "items_total": 100,
        "eta_seconds": 1200,
        "last_update": "2026-03-12T14:52:00Z"
      }
      ```

16. **Graceful Shutdown**
    - Catch `SIGTERM`, stop accepting new requests
    - Finish in-flight requests (timeout after 30s)
    - Flush logs, close connections
    - Exit cleanly (code 0)
    - Example:
      ```python
      def shutdown_handler(signum, frame):
          logger.info("Shutting down gracefully...")
          worker.stop_accepting_requests()
          worker.wait_for_inflight(timeout=30)
          sys.exit(0)

      signal.signal(signal.SIGTERM, shutdown_handler)
      ```

17. **Health Checks**
    - Liveness probe: is process running? (simple check)
    - Readiness probe: can process handle requests? (functional check)
    - Example:
      ```python
      @app.get("/health/live")
      def liveness():
          return {"status": "ok"}

      @app.get("/health/ready")
      def readiness():
          # Check DB connection, tool availability
          if db.connected and agent.loaded:
              return {"status": "ready"}
          return {"status": "not_ready"}, 503
      ```

---

## Architecture Decision Framework

18. **Sync vs Async Agent**
    - **Sync**: simpler, blocks until response; good for <5 sec queries
    - **Async**: non-blocking, handle many queries in parallel; required for >100 QPS
    - Hybrid: FastAPI + asyncio for scaling, background queues for long tasks

19. **Batch vs Real-Time**
    - **Real-time**: query() returns response in <1 sec; user sees result immediately
    - **Batch**: queue requests, process offline, deliver results asynchronously
    - Use batch if: many requests, slow queries, cost optimization needed

20. **Single Agent vs Multi-Agent**
    - **Single**: one agent handles all requests; simpler, fewer state issues
    - **Multi**: specialized agents for domains (sales, support, ops); better scaling
    - Tradeoff: simplicity vs specialization

21. **Cache Strategy**
    - Cache tool results (search, DB queries): LRU cache with TTL
    - Cache model embeddings (for semantic search)
    - Don't cache agentic decisions (they change with context)
    - Invalidate on-demand: user edits, config changes

22. **Rate Limiting & Quotas**
    - Per-user: max queries/min, max tokens/day
    - Per-model: track total cost, alert if trend exceeds budget
    - Per-tool: rate limit expensive tools (e.g., external API calls)
    - Graceful degradation: queue excess requests, don't reject

---

## SDK Version Management

23. **Pinning Strategy**
    - **Dev**: use `main` branch (latest features, unstable)
    - **Staging**: use semantic version range: `>=1.2.0,<2.0.0`
    - **Prod**: pin exact version: `1.2.5` (reproducible, auditable)
    - Update policy: test new versions in staging first

24. **Dependency Scanning**
    - Run `pip install --dry-run` to see what installs
    - Audit transitive deps: use `pip-audit` or Snyk
    - Check for GPL/copyleft licenses (may violate your license)

25. **Breaking Changes**
    - Monitor SDK changelog + release notes
    - Test major version bumps in isolated branch
    - Keep fallback: can roll back to prior version quickly
    - Example: 1.0 → 2.0 may change tool signature, requires code refactor

---

## Common Mistakes

26. **Deploying to Prod Without Staging Test**
    - Always test new versions in staging environment first
    - Staging should mirror prod (same secrets, same scale)
    - Run eval suite before promoting to prod

27. **No Rollback Plan**
    - Container registry should retain old images
    - Know how to revert Kubernetes deployment (one command)
    - Test rollback in staging

28. **Memory Leaks in Long-Running Agents**
    - Monitor memory usage over time
    - Periodically restart worker processes (e.g., every 8 hours)
    - Use `gc.collect()` after heavy operations
    - Profile with `memory_profiler` in staging

29. **Ignoring Progress Tracking**
    - Long batch jobs disappear, no visibility
    - Always log progress, checkpoint state
    - Allows recovery if job crashes mid-way

30. **Over-Caching**
    - Stale cache returns wrong answers (worse than slow queries)
    - Set aggressive TTL (e.g., 5 min for volatile data)
    - Add cache invalidation hooks (on data updates)
    - Monitor cache hit rate; if too low, reconsider caching
