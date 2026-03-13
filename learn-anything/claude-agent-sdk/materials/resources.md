# Claude Agent SDK Learning Resources

## Official Documentation

### Anthropic Resources
- **Claude Agent SDK Docs**: https://github.com/anthropic-ai/anthropic-sdk-python (source, examples, SDK reference)
- **Claude API Reference**: https://docs.anthropic.com/en/api/getting-started (model names, token limits, pricing)
- **Agents Guide**: https://docs.anthropic.com/en/docs/agents/overview (conceptual overview, best practices)
- **Tool Use Guide**: https://docs.anthropic.com/en/docs/build-a-system-prompt-for-claude-and-claude-agent (tool definition patterns)
- **Prompt Caching**: https://docs.anthropic.com/en/docs/build-a-system-prompt-for-claude-and-claude-agent#workbench (cost optimization)

### SDK Setup
- **Installation**: `pip install anthropic` (stable) or `pip install -e git+https://github.com/anthropic-ai/anthropic-sdk-python@main#egg=anthropic` (dev)
- **Environment Setup**: https://docs.anthropic.com/en/docs/getting-started-with-the-api (API key, rate limits)
- **Examples Repository**: https://github.com/anthropic-ai/anthropic-sdk-python/tree/main/examples (runnable demos)

---

## Community Resources

### GitHub & Issues
- **SDK Issues/Discussions**: https://github.com/anthropic-ai/anthropic-sdk-python/issues (ask questions, report bugs)
- **Anthropic Demos**: https://github.com/anthropic-ai/anthropic-sdk-python/tree/main/docs/demos (reference implementations)
- **Community Projects**: Search GitHub for `anthropic agent` (see how others build)

### Discord
- **Anthropic Discord**: https://discord.gg/claude (join #agents channel for live discussion)
- **Topics**: prompt engineering, tool design, multi-agent patterns, production issues

---

## Supplementary Learning

### Observability & Tracing
- **OpenTelemetry Docs**: https://opentelemetry.io/docs (OTel concepts, instrumentation patterns)
- **OpenTelemetry Python**: https://opentelemetry.io/docs/instrumentation/python/ (Python-specific examples)
- **Langfuse Integration**: https://docs.langfuse.com/integrations/anthropic-sdk (setup, cost tracking examples)
- **Langfuse Dashboard**: https://langfuse.com (view traces, cost analysis, session replay)
- **Arize Documentation**: https://docs.arize.com (model monitoring, drift detection)
- **MLflow Tracking**: https://mlflow.org/docs/latest/tracking.html (experiment management, local setup)

### Testing & Evaluation
- **pytest Documentation**: https://docs.pytest.org (test organization, fixtures, plugins)
- **pytest-mock**: https://pytest-mock.readthedocs.io (mock external dependencies)
- **promptfoo Docs**: https://www.promptfoo.dev/docs/ (config, running evals, custom assertions)
- **RAGAS**: https://docs.ragas.io (LLM evaluation metrics for RAG)
- **LangSmith Evals**: https://docs.smith.langchain.com/evaluation (LLM-as-judge patterns)

### Production Deployment
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/ (security, optimization)
- **Kubernetes Docs**: https://kubernetes.io/docs (container orchestration, health checks, deployments)
- **gVisor**: https://gvisor.dev/docs (sandbox security, syscall filtering)
- **HashiCorp Vault**: https://www.vaultproject.io/docs (secrets management)
- **AWS Secrets Manager**: https://docs.aws.amazon.com/secretsmanager/ (cloud-native secrets)

---

## Blog Posts & Engineering Articles

### Anthropic Blog
- "Building Effective Agents" (how to design prompts for multi-turn tool use)
- "Token Counting for Cost Optimization" (reduce token waste)
- Case studies: production deployments using Claude

### Community Articles & Talks
- "Multi-Agent Orchestration Patterns" (Medium, dev.to)
- "Scaling LLM Apps to Production" (various DevOps blogs)
- "Tool Use Best Practices" (Anthropic forum discussions)
- Conference talks: LLMOps, agents panel discussions (YouTube)

---

## Tool Recommendations for Development

### Local Development
- **VS Code Extensions**:
  - Pylance (Python type checking)
  - Black Formatter (code formatting)
  - Error Lens (inline error display)
- **Python Tools**:
  - `pip-audit` (audit dependencies for CVEs)
  - `black` (code formatting)
  - `mypy` (static type checking)
  - `ruff` (fast linter)

### Testing & Debugging
- **pytest**: test runner (framework)
- **pytest-cov**: coverage reports
- **pytest-asyncio**: async test support
- **pytest-timeout**: prevent hanging tests
- **locust**: load testing for agents under stress
- **pdb** / `breakpoint()`: interactive debugging

### Docker & Deployment
- **Docker Desktop**: local container development
- **dive**: analyze Docker layers (optimize images)
- **docker scout**: scan for vulnerabilities
- **Kubernetes (minikube)**: local K8s testing
- **kind**: lightweight K8s in Docker

### Monitoring & Observability
- **Langfuse** (cloud, free tier: 5k events/month)
- **Jaeger** (open-source, self-hosted)
- **Grafana** (dashboards, alerting)
- **Prometheus** (metrics collection)
- **ELK Stack** (Elasticsearch, Logstash, Kibana for logs)

### Code Quality
- **GitHub Actions**: CI/CD (run tests, lint, type-check on every PR)
- **Pre-commit hooks** (run checks before committing)
  ```bash
  pip install pre-commit
  # Add to .pre-commit-config.yaml: black, mypy, ruff
  ```
- **SonarQube**: code analysis, security issues
- **Snyk**: dependency scanning + fix recommendations

---

## Learning Pathway

### Week 1: Foundations (TC1)
- Read: reference-sdk-primitives.md
- Code: build simple agent with 2-3 tools
- Test: unit test for each tool using pytest
- Resource: Anthropic "Building Effective Agents" blog

### Week 2: Multi-Agent (TC2)
- Read: reference-multi-agent.md
- Code: build subagent + parent orchestration
- Test: integration test for handoff, hook logic
- Resource: GitHub demos, Discord #agents channel

### Week 3: Observability (TC3)
- Read: reference-observability.md
- Code: add OTel tracing to Week 2 project
- Test: write evals for agent quality using promptfoo
- Resource: Langfuse docs, promptfoo tutorial

### Week 4: Production (TC4)
- Read: reference-production.md
- Code: Dockerize agent, deploy to K8s (minikube)
- Test: load test agent, verify health checks
- Resource: Docker docs, Kubernetes tutorial

### Capstone: Multi-Tenant Agent Platform
- Combine all 4 tracks
- Build: multi-tenant agent service
- Deploy: Docker + Kubernetes with monitoring
- Evaluate: full test suite (unit + integration + eval)

---

## Quick Reference Links

| Topic | Link |
|-------|------|
| API Status | https://status.anthropic.com |
| SDK Repo | https://github.com/anthropic-ai/anthropic-sdk-python |
| Pricing Calculator | https://www.anthropic.com/pricing |
| Model Card (Claude 3.5 Sonnet) | https://docs.anthropic.com/en/docs/about-claude/models/latest |
| Rate Limits | https://docs.anthropic.com/en/docs/resources/rate-limits |
| Batch API (cost savings) | https://docs.anthropic.com/en/docs/guides/batch |

---

## Staying Updated

- **Subscribe to**: Anthropic Blog (https://www.anthropic.com/news)
- **Follow**: @AnthropicAI on Twitter/X for announcements
- **Watch**: GitHub releases for SDK updates
- **Check**: GitHub Discussions for community Q&A
- **Join**: Anthropic Discord for real-time help
