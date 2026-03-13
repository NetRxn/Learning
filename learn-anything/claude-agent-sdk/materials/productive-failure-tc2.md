# Productive Failure Scenario 2: Multi-Agent Without Observability

**Target Learner**: Advanced Python developer, 1 year Claude Code experience
**Learning Objective**: Understand that multi-agent systems require observability hooks to debug failures
**Misconception to Surface**: "Multi-agent systems are just about spawning agents — I don't need hooks/observability until later"

---

## Problem Section

You're building a **collaborative document review system** with three agents:

1. **Validator Agent**: Checks document structure, formatting, and completeness
2. **Content Agent**: Reviews domain content for accuracy and depth
3. **Reviewer Agent**: Synthesizes outputs from Validator and Content agents, produces a final review

**The Setup**:
- Each agent is independent and runs on a subset of the document
- The Reviewer agent depends on outputs from the other two
- You have a test batch of 10 documents to validate the system

**Your Task**: Build and test this system end-to-end. When one document fails review unexpectedly, you must identify which agent produced incorrect output.

**Test Case**: Document `report_Q1_2026.md`
- Expected outcome: Should pass all reviews (it's a clean, well-structured document)
- Actual outcome: Reviewer rejects it with "Content validation failed"
- Your job: Figure out which agent is wrong and why

**Constraints**:
- You cannot add extensive logging or debugging code during development (you assume observability "can be added later")
- You have 20 minutes to diagnose the failure

---

## Expected Approaches

Most developers will attempt these debugging strategies without observability hooks:

### Approach 1: Manual Print Debugging
```python
# Pseudo-code
def run_review_pipeline(doc):
    print(f"Document: {doc}")  # Too verbose to track across agents

    validator_result = validator_agent.query(doc)
    print(f"Validator output: {validator_result}")  # Is this the right format?

    content_result = content_agent.query(doc)
    print(f"Content output: {content_result}")  # Did it actually run?

    final_review = reviewer_agent.query(
        doc,
        validator_input=validator_result,
        content_input=content_result
    )
    print(f"Final: {final_review}")

    if "failed" in final_review:
        # Which agent caused it? No clear signal
        print("FAILED but no idea where")
```
**What happens**: Prints are too granular or too sparse. You can't correlate which agent run produced which output. The Reviewer agent may have gotten malformed input from either Validator or Content, but you can't tell.

### Approach 2: Return Code Inspection
```python
# Pseudo-code
validator_result = validator_agent.query(doc)
if "PASS" not in validator_result:
    # Is this a real failure or just unusual formatting?
    print("Validator failed")
else:
    print("Validator passed")

content_result = content_agent.query(doc)
# How do you know the format? Did the agent change it?
if "approved" in content_result.lower():
    print("Content passed")
```
**What happens**: Fragile string matching. Agents might phrase results differently. You can't distinguish between a real failure and a formatting issue.

### Approach 3: Intermediate File Dumps
```python
# Pseudo-code
import json

validator_result = validator_agent.query(doc)
with open("validator_output.json", "w") as f:
    json.dump(validator_result, f)

content_result = content_agent.query(doc)
with open("content_output.json", "w") as f:
    json.dump(content_result, f)

final_review = reviewer_agent.query(doc, validator_input=validator_result, content_input=content_result)

# Manual inspection: which file shows the problem?
# But what if the Reviewer misinterpreted both inputs?
```
**What happens**: Time-consuming manual inspection. You save outputs but can't automatically correlate them with failures. If the Reviewer agent silently misinterprets data, you won't see it in the intermediate files.

### Approach 4: Re-running with Modified Agents
```python
# Pseudo-code
# Try running just the Validator
validator_result = validator_agent.query(doc)
print(f"Validator alone: {validator_result}")

# Try running just the Content agent
content_result = content_agent.query(doc)
print(f"Content alone: {content_result}")

# Now run the Reviewer with manually approved inputs
manual_review = reviewer_agent.query(
    doc,
    validator_input="MANUALLY_PASSED",
    content_input="MANUALLY_PASSED"
)

# Did the Reviewer pass now? If yes, one of the agents is wrong
# But which? You'd have to swap inputs one at a time
```
**What happens**: Tedious permutation testing. You might isolate the buggy agent, but it takes many iterations and doesn't scale to larger systems.

### Approach 5: Instrumented Agent Wrappers
```python
# Pseudo-code
class InstrumentedAgent:
    def __init__(self, agent, name):
        self.agent = agent
        self.name = name

    def query(self, *args, **kwargs):
        print(f"[{self.name}] Starting")
        result = self.agent.query(*args, **kwargs)
        print(f"[{self.name}] Result length: {len(str(result))}")
        return result

validator = InstrumentedAgent(validator_agent, "Validator")
content = InstrumentedAgent(content_agent, "Content")

# But you still can't see what Claude is thinking inside each agent
# or what data it's receiving
```
**What happens**: You add wrapper instrumentation, but it's shallow. You log entry/exit, not the actual reasoning or data flow inside the agent.

---

## Consolidation

**The misconception**: Multi-agent systems can be debugged after the fact with generic tools. This is true for single agents, but breaks when one agent's failure is masked by another.

**The real problem**: When Validator outputs malformed data, the Reviewer agent doesn't fail—it just produces wrong results. Without visibility into *what data the Reviewer received*, you can't pinpoint the root cause.

**The SDK's answer**: Use **observability hooks** on each agent to see:
- What input each agent received
- What Claude is reasoning about (thinking steps)
- What tools were called and with what parameters
- What the final output is
- Any errors or retries

### The Better Way

```python
from anthropic_sdk import Agent

def log_agent_call(agent_name, event_type, event_data):
    """Observability hook that logs all agent activity"""
    timestamp = datetime.now().isoformat()
    log_entry = {
        "agent": agent_name,
        "type": event_type,  # "start", "tool_call", "tool_result", "end"
        "timestamp": timestamp,
        "data": event_data
    }
    print(json.dumps(log_entry))
    # In production: send to observability backend (DataDog, New Relic, etc.)

# Create agents with observability hooks
validator_agent = Agent(
    model="claude-opus-4",
    tools=validator_tools,
    on_hook=lambda event: log_agent_call("Validator", event.type, event.data)
)

content_agent = Agent(
    model="claude-opus-4",
    tools=content_tools,
    on_hook=lambda event: log_agent_call("Content", event.type, event.data)
)

reviewer_agent = Agent(
    model="claude-opus-4",
    tools=reviewer_tools,
    on_hook=lambda event: log_agent_call("Reviewer", event.type, event.data)
)

# Run pipeline
def run_review_pipeline(doc):
    validator_result = validator_agent.query(
        f"Validate this document:\n{doc}",
        metadata={"doc_id": "report_Q1_2026"}
    )

    content_result = content_agent.query(
        f"Review content:\n{doc}",
        metadata={"doc_id": "report_Q1_2026"}
    )

    final_review = reviewer_agent.query(
        f"Synthesize reviews:\nValidator: {validator_result}\nContent: {content_result}",
        metadata={"doc_id": "report_Q1_2026"}
    )

    return final_review

result = run_review_pipeline("report_Q1_2026.md")
```

**What you see in logs**:
```json
{"agent": "Validator", "type": "start", "timestamp": "...", "data": {"input": "Validate this..."}}
{"agent": "Validator", "type": "tool_call", "timestamp": "...", "data": {"tool": "parse_structure", "args": {...}}}
{"agent": "Validator", "type": "tool_result", "timestamp": "...", "data": {"result": "Structure OK but missing sections"}}
{"agent": "Validator", "type": "end", "timestamp": "...", "data": {"output": "PASS with warnings: missing..."}}

{"agent": "Content", "type": "start", "timestamp": "...", "data": {"input": "Review content..."}}
{"agent": "Content", "type": "end", "timestamp": "...", "data": {"output": "FAIL: Domain accuracy issue at line 42"}}

{"agent": "Reviewer", "type": "start", "timestamp": "...", "data": {"input": "Synthesize reviews..."}}
{"agent": "Reviewer", "type": "tool_call", "timestamp": "...", "data": {"tool": "merge_reviews", "args": {"validator": "PASS with warnings...", "content": "FAIL: Domain accuracy..."}}}
{"agent": "Reviewer", "type": "end", "timestamp": "...", "data": {"output": "REJECT: Content agent flagged accuracy issue"}}
```

**Now debugging is clear**:
- Validator said "PASS with warnings"
- Content agent said "FAIL"
- Reviewer correctly propagated the failure

You immediately know Content agent is the critical voice. Check its logs: it found a real domain accuracy issue.

### Why Hooks Matter for Multi-Agent

- **Isolation**: Each agent's logs are separate, so you can see where failures originate
- **Traceability**: Metadata (doc_id) ties all agent runs together, making it easy to correlate across agents
- **No side effects**: Hooks don't modify behavior; they only observe
- **Scalability**: As you add more agents, hooks scale automatically

---

## Transfer Problem

**Scenario**: You're building a **customer support system** with three agents:

1. **Intake Agent**: Classifies the customer's issue
2. **Solution Agent**: Generates solutions based on the classification
3. **Quality Agent**: Reviews the solution for completeness and tone

The system routes to different teams based on the Intake Agent's classification. One day, 15% of support tickets are being routed to the wrong team, causing delays.

**Your Task**:
- Build the system with observability hooks from day one
- Run the system on a test batch of 50 tickets
- Use the hook logs to identify: Are Intake miscategorizations causing wrong routing, or is Solution/Quality recommending wrong teams?

**Validation**:
- Can you produce a single JSON report showing, for each misrouted ticket, which agent's decision caused the error?
- Without reading code or running manual tests, can you see the failure pattern (e.g., "Intake confuses Bug reports with Feature requests")?

**Stretch**: Set up a hook that automatically fires an alert if any agent's success rate drops below 95%. Did you catch a potential issue before it reached customers?
