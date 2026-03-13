# Productive Failure Scenario 3: Deploy Without Monitoring

**Target Learner**: Advanced Python developer, 1 year Claude Code experience
**Learning Objective**: Understand that production issues differ from test failures; monitoring must catch runtime degradation
**Misconception to Surface**: "If my tests pass, production will work fine — I don't need runtime monitoring"

---

## Problem Section

You've built a **meeting summarization agent** that:
- Takes raw meeting transcripts (tens of thousands of tokens)
- Extracts key decisions, action items, and attendees
- Generates a structured summary (JSON format)
- Returns results to a SaaS dashboard

**Development & Testing**:
- Tested on 50 sample transcripts (avg 5K tokens each)
- All tests pass; summaries are accurate
- Latency averages 2-3 seconds
- Cost per call: ~$0.02

**What Happened in Production**:
After deploying, you notice:
- User complaints: "Summaries are generic, missing key points"
- Dashboard slowness: Summarization endpoint now takes 10-15 seconds
- Finance alert: Cost per call spiked to $0.15 (7.5x increase)

You have **2 hours to diagnose** why production differs from staging. You cannot add monitoring infrastructure—you must figure this out from available data (logs, API traces, user feedback).

**Your Investigation Tools**:
- Access to raw request logs (timestamps, transcript size, model used)
- Access to API response times
- Access to billing data (tokens consumed per call)
- User feedback comments on the dashboard
- Sample of actual production transcripts

**Your Constraints**:
- You have no real-time metrics dashboard
- No structured observability pipeline is set up
- No automatic alerts fired
- You must manually correlate logs, billing, and feedback

---

## Expected Approaches

Most developers will attempt these diagnostic strategies:

### Approach 1: Spot-Check Recent Logs
```python
# Pseudo-code
import json

# Read last 50 requests from log file
with open("logs/recent_requests.log") as f:
    recent = [json.loads(line) for line in f.readlines()[-50:]]

# Look for patterns
for req in recent:
    print(f"Transcript size: {req['transcript_tokens']}, "
          f"Response time: {req['latency_ms']}, "
          f"Model: {req['model']}")

# Average them
avg_latency = sum(r['latency_ms'] for r in recent) / len(recent)
print(f"Avg latency: {avg_latency}ms")

# But: Are recent requests representative?
# Did something change hours ago that's only affecting now?
# What about requests from this morning vs. now?
```
**What happens**: You see the latency is high, but you can't pinpoint when it changed or what triggered it. Spot-checking recent logs is reactive, not diagnostic.

### Approach 2: Transcript Size Hypothesis
```python
# Pseudo-code
# Maybe production transcripts are longer than test transcripts?

avg_test_size = 5000  # From your testing
print(f"Avg test transcript: {avg_test_size} tokens")

# Check production
prod_sizes = [req['transcript_tokens'] for req in recent if req['status'] == 'success']
avg_prod_size = sum(prod_sizes) / len(prod_sizes)
print(f"Avg prod transcript: {avg_prod_size} tokens")

if avg_prod_size > avg_test_size:
    print("AHA! Transcripts are bigger in production")
else:
    print("Transcripts are similar size, so that's not it")
```
**What happens**: You find that yes, production transcripts average 15K tokens (vs. 5K in testing). But this doesn't explain quality degradation—longer transcripts need more context, but Claude should handle that. And if it's just size, why did it work yesterday? You're chasing a symptom, not the cause.

### Approach 3: Model Confusion
```python
# Pseudo-code
# Check which model version is running

for req in recent:
    model = req.get('model', 'unknown')
    print(f"Model: {model}")

# Are we using different models in prod vs. staging?
# Did the model version change?

model_versions = set(r['model'] for r in recent)
print(f"Models in use: {model_versions}")

if len(model_versions) > 1:
    print("WARNING: Multiple models in use, might explain inconsistency")
```
**What happens**: You see that yes, a model was upgraded yesterday (claude-opus-3 → claude-opus-4), but that should improve quality, not degrade it. And it doesn't explain the cost spike. You're stuck.

### Approach 4: Request-Response Correlation (Manual)
```python
# Pseudo-code
# Pick a failed case and manually trace it

failed_request_id = "req_12345"

# Find the request
request_log = [r for r in recent if r['id'] == failed_request_id][0]
print(f"Request: {request_log}")
print(f"Transcript preview: {request_log['transcript'][:500]}")

# Find the response
response_log = [r for r in responses if r['req_id'] == failed_request_id][0]
print(f"Summary: {response_log['summary']}")

# Manually inspect: Is the summary bad?
# Is it because the transcript is weird?
# But you only have one example and limited time
```
**What happens**: Single-case analysis is anecdotal. One bad transcript doesn't reveal systemic issues. You need statistical correlation, which is hard to do manually.

### Approach 5: Backwards Inference from Billing
```python
# Pseudo-code
# Work backwards from the cost spike

cost_per_call_yesterday = 0.02
cost_per_call_today = 0.15

# Tokens consumed:
tokens_per_call_test = 2000  # input + output, from test runs
cost_per_mtok = 0.003  # API pricing

# If cost went 7.5x, tokens must have gone up 7.5x
implied_tokens = tokens_per_call_test * 7.5
print(f"Implied tokens per call: {implied_tokens}")  # ~15,000

# Check actual:
actual_tokens = [req['input_tokens'] + req['output_tokens'] for req in recent]
avg_actual = sum(actual_tokens) / len(actual_tokens)
print(f"Actual avg tokens: {avg_actual}")

# But WAIT: Are we retrying failed calls?
retry_counts = [req['retry_count'] for req in recent]
print(f"Avg retries: {sum(retry_counts) / len(retry_counts)}")

# If we're retrying a lot, calls are failing → degraded quality
# But why are they failing?
```
**What happens**: You work backwards and hypothesize that retries are happening, which explains both cost and quality. But you don't have clear visibility into retry rates without proper instrumentation.

---

## Consolidation

**The misconception**: Tests measure correctness (does it work?), but production monitoring measures quality at scale (does it *keep* working? at what cost? with what latency?).

**The real problem**: Your production issue is **latent**. It doesn't cause crashes or hard errors—users see slow responses and worse summaries. Without automated monitoring, you discover these issues through complaints, not logs.

**What actually happened**:
1. A new customer sent a batch of 500-token meeting transcripts (technical deep-dives, highly detailed)
2. Your agent's system prompt tells it to capture "every detail discussed"
3. For long transcripts, this requires multiple clarifying questions to Claude via tool use
4. The agent now calls tools 5+ times per request (vs. 1-2 in testing)
5. Each tool call adds context to the conversation, growing the token count
6. By the 5th tool use, the conversation is 20K tokens, causing:
   - High latency (multiple round-trips to Claude)
   - High cost (each call uses many tokens)
   - Degraded quality (less attention to early meeting points due to context pressure)

This is **context bloat**—not visible in unit tests, but devastating at scale.

**The SDK's answer**: Use **runtime monitoring** to catch these issues automatically.

### The Better Way

```python
from anthropic_sdk import Agent
import time
import json
from datetime import datetime

class ProductionMonitor:
    """Tracks runtime metrics that tests don't catch"""
    def __init__(self):
        self.metrics = []

    def record_call(self, agent_name, request_id, transcript_tokens,
                    start_time, end_time, input_tokens, output_tokens,
                    tool_calls_made, retry_count, success):
        """Record a single call with all relevant metrics"""
        call_time = (end_time - start_time).total_seconds()
        total_tokens = input_tokens + output_tokens
        cost_est = total_tokens * 0.000003  # Rough estimate

        metric = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent_name,
            "request_id": request_id,
            "transcript_tokens": transcript_tokens,
            "latency_sec": call_time,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
            "cost_usd": cost_est,
            "tool_calls": tool_calls_made,
            "retries": retry_count,
            "success": success,
        }
        self.metrics.append(metric)
        self._check_anomalies(metric)

    def _check_anomalies(self, metric):
        """Automatically detect anomalies"""
        # Alert if latency spikes
        if metric['latency_sec'] > 10:
            print(f"ALERT: High latency {metric['latency_sec']}s for "
                  f"request {metric['request_id']} "
                  f"({metric['transcript_tokens']} transcript tokens)")

        # Alert if cost is unusually high
        if metric['cost_usd'] > 0.05:
            print(f"ALERT: High cost ${metric['cost_usd']} for "
                  f"request {metric['request_id']} "
                  f"({metric['total_tokens']} tokens, {metric['tool_calls']} tool calls)")

        # Alert if tool use is excessive (sign of context bloat)
        if metric['tool_calls'] > 5:
            print(f"ALERT: Excessive tool use ({metric['tool_calls']}) for "
                  f"request {metric['request_id']} "
                  f"({metric['transcript_tokens']} transcript tokens) — "
                  f"context bloat detected")

    def get_stats(self, time_window_minutes=60):
        """Get aggregate statistics for analysis"""
        import time as time_module
        cutoff = datetime.now().timestamp() - (time_window_minutes * 60)

        recent = [m for m in self.metrics
                  if datetime.fromisoformat(m['timestamp']).timestamp() > cutoff]

        if not recent:
            return None

        return {
            "calls": len(recent),
            "avg_latency_sec": sum(m['latency_sec'] for m in recent) / len(recent),
            "avg_tokens": sum(m['total_tokens'] for m in recent) / len(recent),
            "avg_cost": sum(m['cost_usd'] for m in recent) / len(recent),
            "avg_tool_calls": sum(m['tool_calls'] for m in recent) / len(recent),
            "success_rate": sum(1 for m in recent if m['success']) / len(recent),
            "max_latency": max(m['latency_sec'] for m in recent),
            "max_cost": max(m['cost_usd'] for m in recent),
        }

# Use the monitor
monitor = ProductionMonitor()

agent = Agent(
    model="claude-opus-4",
    tools=summarization_tools,
)

def summarize_with_monitoring(transcript_text, request_id):
    """Wrapper that monitors production metrics"""
    start = datetime.now()

    try:
        response = agent.query(
            f"Summarize this meeting:\n{transcript_text}",
            metadata={"request_id": request_id}
        )
        end = datetime.now()

        # Extract metrics from response
        monitor.record_call(
            agent_name="summarizer",
            request_id=request_id,
            transcript_tokens=len(transcript_text.split()),  # Rough estimate
            start_time=start,
            end_time=end,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
            tool_calls_made=response.tool_calls_count,
            retry_count=response.retries,
            success=True
        )

        return response
    except Exception as e:
        end = datetime.now()
        monitor.record_call(
            agent_name="summarizer",
            request_id=request_id,
            transcript_tokens=len(transcript_text.split()),
            start_time=start,
            end_time=end,
            input_tokens=0,
            output_tokens=0,
            tool_calls_made=0,
            retry_count=0,
            success=False
        )
        raise

# In your API endpoint:
@app.post("/summarize")
def api_summarize(transcript, request_id):
    result = summarize_with_monitoring(transcript, request_id)

    # Log stats periodically (or send to DataDog, Prometheus, etc.)
    stats = monitor.get_stats(time_window_minutes=60)
    if stats:
        print(f"Last hour: {stats['calls']} calls, "
              f"avg latency {stats['avg_latency_sec']:.2f}s, "
              f"avg cost ${stats['avg_cost']:.4f}")

    return result
```

**What you'd see immediately**:
```
ALERT: Excessive tool use (6) for request req_4567 (12000 transcript tokens) — context bloat detected
ALERT: High cost $0.18 for request req_4567 (18500 tokens, 6 tool calls)
ALERT: High latency 14.2s for request req_4567 (12000 transcript tokens)
```

Then you know: **Long transcripts cause tool overuse, which causes cost spikes and latency.** The fix: change your system prompt to be more selective about asking clarifying questions, or implement context pruning.

### Why Monitoring Beats Testing

- **Tests see 5K-token transcripts**: Everything works fine
- **Production sees 15K-token transcripts**: Context bloat triggers
- **Without monitoring**: You learn this through customer complaints
- **With monitoring**: You catch it in hour 1 and page on-call

---

## Transfer Problem

**Scenario**: You've built a **code review agent** that:
- Analyzes pull request diffs
- Generates detailed code review comments
- Flags security/performance issues
- Suggests refactoring

**The system works great in testing** (avg latency 3s, cost $0.01 per PR, quality scores 95%).

**Day 30 in production**: Everything seems normal, but your credit card bill is 50x higher than expected. You don't know which PRs are expensive or why.

**Your Task**:
- Design a monitoring system that would catch this cost explosion within the first hour
- Without instrumentation yet, use whatever data you can gather to diagnose which type of PR (large refactors? monorepos? certain languages?) is expensive
- Propose a monitoring alert that would have prevented this surprise

**Validation**:
- Can you produce a report showing cost distribution by PR size, language, and complexity?
- Can you identify the top 5 most expensive PRs and explain what they have in common?
- Can you write a monitoring rule that fires if cost per PR exceeds a threshold based on PR size?

**Stretch**: Your monitoring showed that monorepo PRs are 10x more expensive because they touch many files. Design a feedback loop where the monitoring data triggers an automatic system prompt change that says "For monorepo PRs, focus on the most critical files only." Does this reduce cost without sacrificing quality?
