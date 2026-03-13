# Productive Failure Scenario 1: Agent Loop Misconception

**Target Learner**: Advanced Python developer, 1 year Claude Code experience
**Learning Objective**: Understand that the SDK's `query()` method abstracts the agent loop, not that you must implement it yourself
**Misconception to Surface**: "I need to manage the agent loop manually (like in LangChain/LangGraph) — writing the think→act→observe cycle myself"

---

## Problem Section

You need to build a **multi-step research agent** that:
- Takes a research question about a Python library
- Retrieves documentation from multiple sources
- Synthesizes findings into a structured report
- Returns the final report

Your agent must handle at least 3 sequential steps (e.g., search → validate → synthesize).

**Setup**: You have access to:
- A `search_docs(query: str)` tool that returns document snippets
- A `fetch_url(url: str)` tool that retrieves full page content
- A `parse_code_example(code: str)` tool that validates Python syntax

**Your task**: Build this agent so that it reliably executes all steps and completes the research task end-to-end. The agent should recover from tool failures and retry intelligently.

**Constraints**:
- You have 30 minutes to design and test the agent
- Your test: Does it successfully complete a research task for "asyncio context managers"?

---

## Expected Approaches

Most developers (with LangChain/LangGraph experience) will try one of these patterns:

### Approach 1: Manual Loop with State Management
```python
# Pseudo-code of what they might attempt
def run_agent_loop(question):
    state = {"step": 0, "findings": [], "current_query": question}

    while state["step"] < 3:
        # Manual think phase
        thought = model.generate_thought(state)

        # Manual act phase
        action = parse_action(thought)
        tool_result = execute_tool(action)

        # Manual observe phase
        state["findings"].append(tool_result)
        state["step"] += 1

    return synthesize(state["findings"])
```
**What happens**: Works for linear flows, but breaks when:
- Tools fail and need intelligent retry
- The agent needs to branch (conditional logic based on intermediate results)
- Context grows and you need to manage token limits
- You want to add observability/logging later

### Approach 2: Recursive Loop with Memoization
```python
# Pseudo-code
def research_recursive(question, depth=0, memo=None):
    if depth > 3:
        return synthesize_findings()

    findings = search_docs(question)
    memo[question] = findings

    # Decide next step manually
    if needs_validation(findings):
        next_question = formulate_next(findings)
        return research_recursive(next_question, depth+1, memo)

    return memo
```
**What happens**: Fragile state threading, hard to debug when recursion depth limits are hit, difficult to add error handling across recursive calls.

### Approach 3: Task Queue with Manual Dispatcher
```python
# Pseudo-code
task_queue = [(question, "search")]
results = []

while task_queue:
    query, task_type = task_queue.pop(0)

    if task_type == "search":
        result = search_docs(query)
        task_queue.append((result, "validate"))
    elif task_type == "validate":
        result = validate_findings(query)
        task_queue.append((result, "synthesize"))
    # ... more cases

    results.append(result)
```
**What happens**: Works for simple DAGs, but becomes complex with branching, parallel tasks, or backtracking. Hard to handle tool failures gracefully.

### Approach 4: Decorator-Based Step Registration
```python
# Pseudo-code
steps = []

@register_step(order=1)
def step_search(question):
    return search_docs(question)

@register_step(order=2)
def step_validate(findings):
    return validate(findings)

# Manual orchestration
for step in sorted(steps, key=lambda x: x.order):
    result = step.fn(result)
```
**What happens**: Rigid ordering, hard to add conditional logic, difficult to retry individual steps on failure.

### Approach 5: Event-Driven State Machine
```python
# Pseudo-code
class AgentState(Enum):
    SEARCHING = 1
    VALIDATING = 2
    SYNTHESIZING = 3

state = AgentState.SEARCHING
while state != AgentState.DONE:
    if state == AgentState.SEARCHING:
        findings = search_docs(question)
        state = AgentState.VALIDATING
    elif state == AgentState.VALIDATING:
        validated = validate(findings)
        state = AgentState.SYNTHESIZING
    # ... more transitions
```
**What happens**: Verbose and brittle; adding new steps requires modifying the state machine. Error handling is scattered.

---

## Consolidation

**The misconception**: These approaches assume the agent loop is something *you* must explicitly manage. This comes from frameworks like LangChain where you manually code the step progression.

**The SDK's answer**: The `query()` method **encapsulates the entire agent loop**. You don't write think→act→observe; you write *what the agent should think about*, and the SDK handles the loop.

### The Better Way

```python
from anthropic_sdk import Agent

# Define your tools
tools = [
    Agent.Tool(
        name="search_docs",
        description="Search library documentation",
        fn=search_docs
    ),
    Agent.Tool(
        name="fetch_url",
        description="Fetch full page content",
        fn=fetch_url
    ),
    Agent.Tool(
        name="parse_code_example",
        description="Validate Python code syntax",
        fn=parse_code_example
    ),
]

# Create the agent once
agent = Agent(
    model="claude-opus-4",
    tools=tools,
)

# The query() method runs the entire loop internally
response = agent.query(
    "Research asyncio context managers: explain how they work, "
    "find 3 real-world examples from the docs, and validate the syntax in each example. "
    "Return a structured report."
)
```

**What happens inside `query()`**:
1. **Think**: Claude considers the task and decides which tools to use
2. **Act**: Tools are executed (with automatic retry on transient failures)
3. **Observe**: Results are fed back to Claude
4. **Loop**: Steps 1-3 repeat until the task is complete
5. **Return**: Final response is returned

**Key benefits**:
- The agent automatically handles multi-step reasoning
- Tool failures are retried intelligently
- Context is managed (tokens, relevance filtering)
- You don't write loop management code
- Observability hooks are optional but available if needed

### Why This Matters

By delegating the loop to `query()`, you gain:
- **Robustness**: Built-in retry logic and error handling
- **Clarity**: Your code reads like a task description, not a state machine
- **Flexibility**: The SDK can evolve its loop strategy without breaking your code
- **Simplicity**: You focus on tool design and task definition, not choreography

---

## Transfer Problem

**Scenario**: You're building a **document classifier agent** that must:
1. Receive a document and a set of category definitions
2. Retrieve examples of each category from a vector DB
3. Compare the input document against each example
4. Vote on the most likely category

The agent may need to fetch more examples if initial matches are weak.

**Implement this without manually coding a loop.** Instead:
- Define tools for vector DB retrieval, document comparison, and vote aggregation
- Write a single `query()` call that describes the classification task
- Let the SDK manage the multi-step loop

**Validation**:
- Does the agent complete the full classification without you managing step transitions?
- If the first vector DB query returns weak matches, does the agent automatically decide to fetch more examples?
- If you add a new comparison metric (tool), does the agent use it without code changes to the loop?

**Stretch**: Add a hook to `query()` that logs each tool call. Did you see that you can observe the loop without controlling it?
