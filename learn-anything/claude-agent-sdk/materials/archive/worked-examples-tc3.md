# TC3: Observability & Testing — Worked Examples with Backward Fading

## Topic Overview
Instrumenting an existing agent with OpenTelemetry (OTel) tracing, configuring Langfuse for prompt monitoring, and writing a comprehensive test suite with promptfoo. This sprint focuses on observability, evaluation, and quality assurance for SDK agents.

---

## Full Worked Example: Instrumented Customer Support Agent

**Problem Statement:** Build a customer support agent with full OTel tracing, Langfuse integration for prompt analytics, and a test suite using promptfoo to evaluate response quality.

### Step 1: Set Up OpenTelemetry Instrumentation
**Self-explanation prompt:** Why should tracing be the first thing we add to an agent, before adding business logic?

```python
from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.anthropic import AnthropicInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
import anthropic

# Configure Jaeger exporter
jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)

# Set up trace provider
trace_provider = TracerProvider()
trace_provider.add_span_processor(BatchSpanProcessor(jaeger_exporter))
trace.set_tracer_provider(trace_provider)

# Set up metrics
prometheus_reader = PrometheusMetricReader()
meter_provider = MeterProvider(metric_readers=[prometheus_reader])
metrics.set_meter_provider(meter_provider)

# Instrument Anthropic SDK
AnthropicInstrumentor().instrument()
RequestsInstrumentor().instrument()

# Get tracer for application
tracer = trace.get_tracer(__name__)

class InstrumentedSupportAgent:
    """Customer support agent with OTel tracing."""

    def __init__(self):
        self.client = anthropic.Anthropic()
        self.tracer = tracer
        self.meter = metrics.get_meter(__name__)

        # Define metrics
        self.request_counter = self.meter.create_counter(
            name="support_requests_total",
            description="Total support requests processed",
            unit="1"
        )
        self.response_time_histogram = self.meter.create_histogram(
            name="support_response_time_ms",
            description="Response time in milliseconds",
            unit="ms"
        )
        self.error_counter = self.meter.create_counter(
            name="support_errors_total",
            description="Total errors",
            unit="1"
        )

    async def process_support_request(self, customer_query: str) -> str:
        """Process a customer support request with tracing."""
        with self.tracer.start_as_current_span("process_support_request") as span:
            import time
            start_time = time.time()

            # Add span attributes
            span.set_attribute("customer_query_length", len(customer_query))
            span.set_attribute("query_preview", customer_query[:100])

            try:
                # Nested span for preprocessing
                with self.tracer.start_as_current_span("preprocess_query"):
                    cleaned_query = self._preprocess_query(customer_query)
                    span.add_event("query_preprocessed")

                # Nested span for API call
                with self.tracer.start_as_current_span("call_claude_api") as api_span:
                    response = self.client.messages.create(
                        model="claude-3-5-sonnet-20241022",
                        max_tokens=500,
                        messages=[
                            {
                                "role": "user",
                                "content": f"Customer query: {cleaned_query}"
                            }
                        ]
                    )

                    api_span.set_attribute("model", "claude-3-5-sonnet-20241022")
                    api_span.set_attribute("input_tokens", response.usage.input_tokens)
                    api_span.set_attribute("output_tokens", response.usage.output_tokens)

                # Extract text response
                result = "\n".join(
                    block.text for block in response.content
                    if block.type == "text"
                )

                # Record metrics
                elapsed_ms = (time.time() - start_time) * 1000
                self.request_counter.add(1)
                self.response_time_histogram.record(elapsed_ms)

                span.set_attribute("response_length", len(result))
                span.set_attribute("status", "success")

                return result

            except Exception as e:
                self.error_counter.add(1)
                span.set_attribute("status", "error")
                span.set_attribute("error_message", str(e))
                span.record_exception(e)
                raise

    def _preprocess_query(self, query: str) -> str:
        """Clean and normalize customer query."""
        return query.strip().lower()
```

**Why this works:** Tracing must be added early because it's difficult to retrofit later. OTel provides hooks into the Anthropic SDK, and spans are nested to show call hierarchy. Metrics track both performance and reliability.

---

### Step 2: Integrate Langfuse for Prompt Analytics
**Self-explanation prompt:** Why is separate prompt monitoring (Langfuse) valuable even though we have OTel tracing?

```python
from langfuse import Langfuse
from langfuse.decorators import observe, langfuse_context

# Initialize Langfuse client
langfuse = Langfuse(
    public_key="pk_...",
    secret_key="sk_...",
    host="https://cloud.langfuse.com"
)

class LangfuseInstrumentedAgent(InstrumentedSupportAgent):
    """Support agent with Langfuse prompt tracking."""

    def __init__(self):
        super().__init__()
        self.langfuse = langfuse

    @observe(as_type="agent")
    async def process_support_request_with_langfuse(
        self,
        customer_query: str
    ) -> str:
        """Process request with Langfuse observation."""
        # Langfuse context captures all nested calls
        trace_id = langfuse_context.trace_id

        try:
            # Preprocess span
            with self.langfuse.span(
                name="preprocess_query",
                input={"query": customer_query}
            ) as span:
                cleaned = self._preprocess_query(customer_query)
                span.end(output={"cleaned_query": cleaned})

            # API call span
            with self.langfuse.span(
                name="invoke_claude",
                input={"query": cleaned}
            ) as api_span:
                response = self.client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=500,
                    messages=[
                        {
                            "role": "user",
                            "content": f"Support query: {cleaned}"
                        }
                    ]
                )

                result = "\n".join(
                    block.text for block in response.content
                    if block.type == "text"
                )

                api_span.end(
                    output={
                        "response": result,
                        "tokens_used": response.usage.input_tokens + response.usage.output_tokens
                    }
                )

            # Log result to Langfuse
            langfuse_context.observation.end(
                output={"result": result},
                metadata={
                    "query_length": len(customer_query),
                    "response_length": len(result),
                    "trace_id": trace_id
                }
            )

            return result

        except Exception as e:
            langfuse_context.observation.end(
                output={"error": str(e)},
                status_code="error"
            )
            raise

    def log_prompt_template(self, template_name: str, template: str):
        """Register a prompt template with Langfuse."""
        self.langfuse.create_prompt(
            name=template_name,
            prompt=template,
            is_active=True
        )
```

**Why this works:** Langfuse provides a UI for analyzing prompts, comparing model outputs, and identifying quality trends over time. It's designed specifically for prompt engineering, whereas OTel is general-purpose.

---

### Step 3: Create Test Suite Structure with Promptfoo
**Self-explanation prompt:** Why should we test agents deterministically even though they use language models?

```python
# config.json for promptfoo
import json

promptfoo_config = {
    "providers": [
        {
            "id": "claude-opus",
            "config": {
                "model": "claude-3-opus-20250219",
                "max_tokens": 500
            }
        },
        {
            "id": "claude-sonnet",
            "config": {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 500
            }
        }
    ],
    "prompts": [
        {
            "id": "support_response_v1",
            "prompt": "You are a helpful customer support agent. Respond to the following query:\n\n{{query}}"
        },
        {
            "id": "support_response_v2",
            "prompt": "You are an expert customer support specialist. Your goal is to resolve issues quickly and courteously. User query:\n\n{{query}}\n\nProvide a clear, actionable response."
        }
    ],
    "tests": [
        {
            "description": "Simple greeting",
            "vars": {
                "query": "Hello, can you help me?"
            },
            "assert": [
                {
                    "type": "contains",
                    "value": "help"
                },
                {
                    "type": "not-contains",
                    "value": "error"
                }
            ]
        },
        {
            "description": "Billing question",
            "vars": {
                "query": "How do I update my billing address?"
            },
            "assert": [
                {
                    "type": "contains",
                    "value": "address"
                }
            ]
        },
        {
            "description": "Refund request",
            "vars": {
                "query": "I want a refund for order #12345"
            },
            "assert": [
                {
                    "type": "contains",
                    "value": "refund"
                },
                {
                    "type": "contains",
                    "value": "12345"
                }
            ]
        }
    ]
}

# Save config
with open("promptfoo.json", "w") as f:
    json.dump(promptfoo_config, f, indent=2)
```

**Why this works:** Even though LLM outputs vary, we can test for deterministic properties: response length, keyword presence, format correctness. This catches regressions like losing context or breaking safety boundaries.

---

### Step 4: Implement Custom Test Assertions
**Self-explanation prompt:** Why do custom assertions (beyond string matching) matter for agent quality?

```python
import re
from dataclasses import dataclass

@dataclass
class AssertionResult:
    passed: bool
    message: str
    score: float  # 0-1

class CustomAssertions:
    """Custom assertions for agent evaluation."""

    @staticmethod
    def assert_response_length(response: str, min_words: int = 10, max_words: int = 500) -> AssertionResult:
        """Verify response is within reasonable word count."""
        word_count = len(response.split())
        if min_words <= word_count <= max_words:
            return AssertionResult(
                passed=True,
                message=f"Word count {word_count} is within range [{min_words}, {max_words}]",
                score=1.0
            )
        else:
            return AssertionResult(
                passed=False,
                message=f"Word count {word_count} outside range [{min_words}, {max_words}]",
                score=0.0
            )

    @staticmethod
    def assert_tone(response: str, forbidden_words: list = None) -> AssertionResult:
        """Check response avoids forbidden words/phrases."""
        if forbidden_words is None:
            forbidden_words = ["error", "failed", "broken", "stupid"]

        found_words = [w for w in forbidden_words if w.lower() in response.lower()]

        if not found_words:
            return AssertionResult(
                passed=True,
                message="No forbidden words detected",
                score=1.0
            )
        else:
            return AssertionResult(
                passed=False,
                message=f"Found forbidden words: {found_words}",
                score=0.0
            )

    @staticmethod
    def assert_specificity(response: str) -> AssertionResult:
        """Check response contains specific details (not generic)."""
        generic_phrases = ["i'm sorry", "i understand", "thank you"]
        specificity_score = 0.0

        # Check for named entities or numbers
        if re.search(r'\b\d+\b', response):  # Numbers
            specificity_score += 0.3
        if re.search(r'[A-Z][a-z]+ [A-Z][a-z]+', response):  # Proper nouns
            specificity_score += 0.3

        # Deduct for generic phrases
        for phrase in generic_phrases:
            if phrase in response.lower():
                specificity_score -= 0.2

        specificity_score = max(0.0, min(1.0, specificity_score))

        return AssertionResult(
            passed=specificity_score > 0.5,
            message=f"Specificity score: {specificity_score:.2f}",
            score=specificity_score
        )

    @staticmethod
    def assert_relevance(response: str, query: str) -> AssertionResult:
        """Check response is relevant to the query."""
        # Extract key words from query (simple heuristic)
        query_words = set(w.lower() for w in query.split() if len(w) > 3)
        response_words = set(w.lower() for w in response.split())

        overlap = query_words & response_words
        relevance_score = len(overlap) / max(len(query_words), 1)

        return AssertionResult(
            passed=relevance_score > 0.2,
            message=f"Relevance score: {relevance_score:.2f} (word overlap: {len(overlap)}/{len(query_words)})",
            score=relevance_score
        )
```

**Why this works:** Custom assertions encode domain knowledge about quality. They let us measure progress toward standards like "responses should be specific, not generic" beyond simple keyword matching.

---

### Step 5: Build Test Harness with Batch Evaluation
**Self-explanation prompt:** Why do we batch tests and collect statistics instead of testing one example at a time?

```python
import asyncio
from typing import List
from dataclasses import dataclass, asdict
import json

@dataclass
class TestCase:
    id: str
    query: str
    expected_properties: dict  # e.g., {"contains_order_number": True}

@dataclass
class TestResult:
    test_id: str
    query: str
    response: str
    assertions: dict  # assertion_name -> AssertionResult
    passed: bool
    overall_score: float

class TestHarness:
    """Batch testing harness for agents."""

    def __init__(self, agent: LangfuseInstrumentedAgent):
        self.agent = agent
        self.custom = CustomAssertions()

    async def run_test_case(self, test: TestCase) -> TestResult:
        """Run a single test case."""
        # Get agent response
        response = await self.agent.process_support_request_with_langfuse(test.query)

        # Run assertions
        assertions_results = {
            "response_length": self.custom.assert_response_length(response),
            "tone": self.custom.assert_tone(response),
            "specificity": self.custom.assert_specificity(response),
            "relevance": self.custom.assert_relevance(response, test.query)
        }

        # Calculate overall score
        scores = [result.score for result in assertions_results.values()]
        overall_score = sum(scores) / len(scores) if scores else 0.0

        # Check if all critical assertions passed
        passed = all(result.passed for result in assertions_results.values())

        return TestResult(
            test_id=test.id,
            query=test.query,
            response=response,
            assertions=assertions_results,
            passed=passed,
            overall_score=overall_score
        )

    async def run_test_suite(self, tests: List[TestCase]) -> dict:
        """Run all tests and aggregate results."""
        results = []
        for test in tests:
            try:
                result = await self.run_test_case(test)
                results.append(result)
            except Exception as e:
                print(f"Test {test.id} failed with exception: {e}")

        # Aggregate statistics
        passed_count = sum(1 for r in results if r.passed)
        scores = [r.overall_score for r in results]

        summary = {
            "total_tests": len(results),
            "passed": passed_count,
            "failed": len(results) - passed_count,
            "pass_rate": passed_count / len(results) if results else 0.0,
            "average_score": sum(scores) / len(scores) if scores else 0.0,
            "min_score": min(scores) if scores else 0.0,
            "max_score": max(scores) if scores else 0.0,
            "results": [asdict(r) for r in results]
        }

        return summary

    def export_results(self, summary: dict, filepath: str = "test_results.json"):
        """Export test results to JSON."""
        with open(filepath, 'w') as f:
            json.dump(summary, f, indent=2, default=str)
```

**Why this works:** Batch testing lets us calculate aggregate metrics (pass rate, average score) and identify patterns. Exporting to JSON enables CI/CD integration and trend analysis over time.

---

### Step 6: Create Regression Test Suite with Versioning
**Self-explanation prompt:** Why do we track test results by model/prompt version to detect regressions?

```python
from datetime import datetime

class RegressionTestSuite:
    """Track test results across versions to detect regressions."""

    def __init__(self, suite_name: str):
        self.suite_name = suite_name
        self.versions = {}  # version_id -> test results

    def add_version_results(
        self,
        version_id: str,
        model: str,
        prompt_version: str,
        results: dict
    ):
        """Record test results for a specific version."""
        self.versions[version_id] = {
            "timestamp": datetime.now().isoformat(),
            "model": model,
            "prompt_version": prompt_version,
            "results": results
        }

    def detect_regression(self, current_version: str, baseline_version: str) -> dict:
        """Compare current version against baseline to detect regressions."""
        if baseline_version not in self.versions or current_version not in self.versions:
            return {"error": "Version not found"}

        baseline = self.versions[baseline_version]["results"]
        current = self.versions[current_version]["results"]

        regression_detected = False
        regressions = []

        # Compare key metrics
        baseline_pass_rate = baseline.get("pass_rate", 0)
        current_pass_rate = current.get("pass_rate", 0)

        if current_pass_rate < baseline_pass_rate * 0.95:  # 5% drop is regression
            regression_detected = True
            regressions.append({
                "metric": "pass_rate",
                "baseline": baseline_pass_rate,
                "current": current_pass_rate,
                "delta": current_pass_rate - baseline_pass_rate
            })

        baseline_avg_score = baseline.get("average_score", 0)
        current_avg_score = current.get("average_score", 0)

        if current_avg_score < baseline_avg_score * 0.95:
            regression_detected = True
            regressions.append({
                "metric": "average_score",
                "baseline": baseline_avg_score,
                "current": current_avg_score,
                "delta": current_avg_score - baseline_avg_score
            })

        return {
            "regression_detected": regression_detected,
            "regressions": regressions,
            "baseline_version": baseline_version,
            "current_version": current_version
        }

    def export_comparison(self, filepath: str = "regression_report.json"):
        """Export all version comparisons."""
        report = {
            "suite_name": self.suite_name,
            "versions": self.versions
        }
        with open(filepath, 'w') as f:
            json.dump(report, f, indent=2, default=str)

# Usage
async def main():
    agent = LangfuseInstrumentedAgent()
    harness = TestHarness(agent)
    regression_suite = RegressionTestSuite("customer_support_agent")

    # Test cases
    test_cases = [
        TestCase("test_001", "Hello, can you help me?", {}),
        TestCase("test_002", "How do I update my billing address?", {}),
        TestCase("test_003", "I want a refund for order #12345", {})
    ]

    # Run test suite
    results_v1 = await harness.run_test_suite(test_cases)
    regression_suite.add_version_results(
        "v1.0",
        "claude-3-5-sonnet-20241022",
        "prompt_v1",
        results_v1
    )

    # After a prompt update, run again
    results_v2 = await harness.run_test_suite(test_cases)
    regression_suite.add_version_results(
        "v2.0",
        "claude-3-5-sonnet-20241022",
        "prompt_v2",
        results_v2
    )

    # Detect regressions
    comparison = regression_suite.detect_regression("v2.0", "v1.0")
    print(json.dumps(comparison, indent=2))

    regression_suite.export_comparison()
```

**Why this works:** Regression testing prevents improvements from breaking existing functionality. By tracking results across versions, we can identify when a model upgrade or prompt change introduces quality drops.

---

### Step 7: Integrate Testing into CI/CD Pipeline
**Self-explanation prompt:** Why should testing be automated in CI/CD rather than run manually?

```python
import asyncio
import sys
import subprocess

class CICDIntegration:
    """Automate testing in CI/CD pipelines."""

    def __init__(self, agent: LangfuseInstrumentedAgent):
        self.agent = agent
        self.harness = TestHarness(agent)
        self.regression_suite = RegressionTestSuite("agent_tests")

    async def run_pipeline(
        self,
        test_cases: List[TestCase],
        baseline_version: str = "main",
        fail_on_regression: bool = True,
        min_pass_rate: float = 0.95
    ) -> int:
        """Run full test pipeline and return exit code."""
        print("Starting test pipeline...")

        # Run tests
        results = await self.harness.run_test_suite(test_cases)

        # Export results
        self.harness.export_results(results, "test_results.json")

        # Check pass rate
        if results["pass_rate"] < min_pass_rate:
            print(f"FAIL: Pass rate {results['pass_rate']:.2%} below minimum {min_pass_rate:.2%}")
            return 1

        # Check for regressions
        if baseline_version:
            # Load baseline from previous run
            try:
                with open("baseline_results.json", "r") as f:
                    baseline_results = json.load(f)

                comparison = self.regression_suite.detect_regression(
                    "current",
                    baseline_version
                )

                if comparison.get("regression_detected") and fail_on_regression:
                    print("FAIL: Regression detected!")
                    print(json.dumps(comparison, indent=2))
                    return 1
            except FileNotFoundError:
                print("No baseline found; skipping regression detection")

        print(f"PASS: All tests passed (pass_rate: {results['pass_rate']:.2%})")

        # Save current results as baseline for next run
        with open("baseline_results.json", "w") as f:
            json.dump(results, f)

        return 0

# Usage in CI/CD (e.g., GitHub Actions)
async def main():
    agent = LangfuseInstrumentedAgent()
    ci = CICDIntegration(agent)

    test_cases = [
        TestCase("test_001", "Hello, can you help me?", {}),
        TestCase("test_002", "How do I update my billing address?", {}),
        TestCase("test_003", "I want a refund for order #12345", {})
    ]

    exit_code = await ci.run_pipeline(test_cases, min_pass_rate=0.90)
    sys.exit(exit_code)

if __name__ == "__main__":
    asyncio.run(main())
```

**Why this works:** Automating tests in CI/CD ensures every commit is tested. Failing builds on regressions prevents bad code from reaching production. Exit codes let the pipeline fail fast and provide feedback to developers.

---

---

## Fading Version 1: Remove Steps 6-7 (Regression Testing & CI/CD)

**Problem Statement:** Build a customer support agent with full OTel tracing, Langfuse integration for prompt monitoring, and a test suite using custom assertions to evaluate response quality.

### Step 1: Set Up OpenTelemetry Instrumentation
[Full code as above]

### Step 2: Integrate Langfuse for Prompt Analytics
[Full code as above]

### Step 3: Create Test Suite Structure with Promptfoo
[Full code as above]

### Step 4: Implement Custom Test Assertions
[Full code as above]

### Step 5: Build Test Harness with Batch Evaluation
[Full code as above]

**Your Task:** Implement a regression testing system that tracks test results across model/prompt versions and automatically detects quality drops. Then integrate the testing pipeline into CI/CD.

---

## Fading Version 2: Remove Steps 4-7 (Custom Assertions, Batch Testing, Regression, CI/CD)

**Problem Statement:** Build a document Q&A agent with OTel tracing, Langfuse prompt tracking, and a promptfoo test suite.

*(Note: Surface feature change — document Q&A instead of customer support)*

### Step 1: Set Up OpenTelemetry Instrumentation
```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

jaeger_exporter = JaegerExporter(agent_host_name="localhost", agent_port=6831)
trace_provider = TracerProvider()
trace_provider.add_span_processor(BatchSpanProcessor(jaeger_exporter))
trace.set_tracer_provider(trace_provider)

tracer = trace.get_tracer(__name__)

class DocumentQAAgent:
    def __init__(self):
        self.client = anthropic.Anthropic()
        self.tracer = tracer

    async def answer_question(self, document: str, question: str) -> str:
        with self.tracer.start_as_current_span("answer_question") as span:
            span.set_attribute("question", question[:100])
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=500,
                messages=[
                    {"role": "user", "content": f"Document: {document}\n\nQuestion: {question}"}
                ]
            )
            return "\n".join(block.text for block in response.content if block.type == "text")
```

### Step 2: Integrate Langfuse for Prompt Analytics
[Full code structure as above, adapted to document Q&A]

### Step 3: Create Test Suite Structure with Promptfoo
```python
promptfoo_config = {
    "providers": [
        {"id": "claude-opus", "config": {"model": "claude-3-opus-20250219", "max_tokens": 500}},
        {"id": "claude-sonnet", "config": {"model": "claude-3-5-sonnet-20241022", "max_tokens": 500}}
    ],
    "tests": [
        {
            "description": "Basic fact extraction",
            "vars": {
                "document": "The Earth orbits the Sun. It takes 365 days.",
                "question": "How long does it take Earth to orbit the Sun?"
            },
            "assert": [{"type": "contains", "value": "365"}]
        }
    ]
}
```

**Your Task:** Implement custom test assertions (specificity, relevance, tone), build a batch test harness, add regression testing, and integrate with CI/CD.

---

## Fading Version 3: Remove Steps 3-7 (Promptfoo, Custom Assertions, Batch Testing, Regression, CI/CD)

**Problem Statement:** Build a classification agent with OTel tracing and Langfuse integration for monitoring model performance.

*(Note: Surface feature change — text classification instead of customer support)*

### Step 1: Set Up OpenTelemetry Instrumentation
```python
from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

jaeger_exporter = JaegerExporter(agent_host_name="localhost", agent_port=6831)
trace_provider = TracerProvider()
trace_provider.add_span_processor(BatchSpanProcessor(jaeger_exporter))
trace.set_tracer_provider(trace_provider)

class ClassificationAgent:
    def __init__(self):
        self.client = anthropic.Anthropic()
        self.tracer = trace.get_tracer(__name__)

    async def classify(self, text: str, categories: list) -> str:
        with self.tracer.start_as_current_span("classify_text"):
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=50,
                messages=[
                    {"role": "user", "content": f"Classify: {text}\nCategories: {', '.join(categories)}"}
                ]
            )
            return "\n".join(block.text for block in response.content if block.type == "text")
```

### Step 2: Integrate Langfuse for Prompt Analytics
[Full code as above, adapted to classification]

**Your Task:** Create a promptfoo test suite with multiple test cases, implement custom assertions, build a batch test harness, and add regression testing with CI/CD integration.

---

## Fading Version 4: Remove Steps 2-7 (Langfuse, Promptfoo, Custom Assertions, Batch Testing, Regression, CI/CD)

**Problem Statement:** Build an agent with OpenTelemetry instrumentation for full observability and tracing.

*(Note: Surface feature change — generic agent without specific domain)*

### Step 1: Set Up OpenTelemetry Instrumentation
```python
from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.anthropic import AnthropicInstrumentor

jaeger_exporter = JaegerExporter(agent_host_name="localhost", agent_port=6831)
trace_provider = TracerProvider()
trace_provider.add_span_processor(BatchSpanProcessor(jaeger_exporter))
trace.set_tracer_provider(trace_provider)
AnthropicInstrumentor().instrument()

class TracedAgent:
    def __init__(self):
        self.client = anthropic.Anthropic()
        self.tracer = trace.get_tracer(__name__)

    async def run(self, prompt: str) -> str:
        with self.tracer.start_as_current_span("agent_run") as span:
            span.set_attribute("prompt_length", len(prompt))
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )
            return "\n".join(block.text for block in response.content if block.type == "text")
```

**Your Task:** Add Langfuse integration for prompt analytics, create a promptfoo test suite with custom assertions, implement batch testing, add regression detection, and integrate the full testing pipeline into CI/CD.

---

## Key Takeaways for TC3

- **OTel Tracing:** Nested spans show call hierarchy; attributes add context; metrics track performance
- **Langfuse Integration:** Separate prompt monitoring tool designed specifically for LLM debugging
- **Deterministic Testing:** Test LLM outputs for properties (length, keywords, tone) not exact matches
- **Custom Assertions:** Encode domain knowledge (specificity, relevance) into test criteria
- **Batch Evaluation:** Aggregate metrics (pass rate, average score) reveal trends
- **Regression Testing:** Compare versions to detect quality drops; essential for iterative improvement
- **CI/CD Integration:** Automate tests on every commit; fail builds on regressions
- **Audit Trails:** Both OTel and Langfuse provide different views of agent behavior for debugging

