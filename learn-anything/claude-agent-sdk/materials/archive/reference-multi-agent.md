# Multi-Agent & Orchestration Quick Reference (TC2)

## Hooks System (HookMatcher + HookCallback)

1. **Hook Pattern Overview**
   - **HookMatcher**: predicate that identifies events (message type, content pattern, sender)
   - **HookCallback**: function invoked when matcher fires
   - Hooks intercept agent events without modifying core logic
   - Use cases: audit trails, permission checks, routing decisions

2. **HookMatcher Examples**
   ```python
   # Match by message type
   HookMatcher(message_type="UserMessage")

   # Match by content pattern
   HookMatcher(pattern=r"delete|remove")  # case-insensitive regex

   # Match by sender/agent ID
   HookMatcher(agent_id="policy_checker")

   # Combine conditions (AND logic)
   HookMatcher(message_type="ToolUseBlock", pattern=r"database")
   ```

3. **HookCallback Signature**
   ```python
   def audit_log(hook_context: HookContext) -> None:
       # hook_context.message: the matched message
       # hook_context.agent_id: agent that generated it
       # hook_context.timestamp: when it occurred
       log_event(hook_context)  # side effects only, no return
   ```

---

## 4-Layer Permission System

4. **Permission Hierarchy: deny > ask > allow**
   - **DENY**: block action, raise PermissionDenied error
   - **ASK**: pause, collect user approval, then allow/deny
   - **ALLOW**: execute immediately
   - Earlier layer overrides later (deny wins all)

5. **Permission Layer Mapping**
   - **Layer 1 (System)**: SDK runtime (hardcoded, non-negotiable)
   - **Layer 2 (Policy)**: org/deployment rules (e.g., "no tool X in prod")
   - **Layer 3 (User)**: interactive approvals (e.g., "confirm deletion?")
   - **Layer 4 (Agent)**: agent's self-imposed limits (e.g., "refuse illegal")

6. **Implementation Pattern**
   ```python
   # Define policy hook
   def check_dangerous_tools(context: HookContext):
       if context.message.tool_name in DANGEROUS_TOOLS:
           if ENVIRONMENT == "production":
               raise PermissionDenied(f"Tool {context.message.tool_name} blocked in prod")
           else:
               approve = user_approval(f"Use {context.message.tool_name}?")
               if not approve:
                   raise PermissionDenied("User denied")

   agent.add_hook(
       HookMatcher(message_type="ToolUseBlock"),
       check_dangerous_tools
   )
   ```

---

## Subagents vs Teams

7. **Subagent Pattern**
   - Single agent spawns child agent for focused subtask
   - Parent pauses → child runs → returns result
   - Child has restricted tool set (isolation)
   - Example: main agent → specialized SQL query subagent

8. **Team Pattern**
   - Multiple agents work in parallel or sequence on same problem
   - No parent/child hierarchy, peer collaboration
   - Orchestrator (manager agent) coordinates
   - Example: sales + engineering + finance agents discuss pricing

9. **When to Use Each**
   - **Subagent**: divide-and-conquer, clear delegation, tool isolation
   - **Team**: diverse expertise, consensus needed, brainstorming

---

## Orchestration Patterns

10. **Sequential Handoff**
    ```
    Agent A (analysis) → Agent B (planning) → Agent C (execution)
    ```
    - A completes task, passes summary to B
    - B takes that summary as input
    - Lightweight coordination, easy debugging
    - Slower: no parallelism

11. **Parallel Fanout**
    ```
    Main → [Agent A, Agent B, Agent C] → aggregate results
    ```
    - Main sends same problem to multiple agents
    - Collect responses (best-of, voting, ensemble)
    - Faster, more resilient
    - Higher cost (3x tokens)

12. **Hierarchical Tree**
    ```
    Root agent → L1 managers → L2 specialists
    ```
    - Root makes high-level decisions
    - L1 managers own domains (sales, ops, tech)
    - L2 specialists solve narrow problems
    - Scales to many agents; complex coordination

---

## Structured Handoffs

13. **Handoff Data Format**
    - Use **Pydantic models** for typed data contracts
    ```python
    class QueryContext(BaseModel):
        user_id: str
        query: str
        context_window: int
        required_fields: List[str]
    ```
    - Receiver validates before processing (fail fast)
    - Reduces silent data corruption bugs

14. **Handoff Protocol**
    - Include: what was done, what to do next, any errors
    - Example: `{"completed": ["auth_check"], "next": "fetch_data", "errors": []}`
    - Receiver should not redo completed steps

---

## Session Operations

15. **session.create()**
    - New conversation thread, fresh context
    - Use when: unrelated problem, hard reset needed
    - Cost: no context carry-over (cheaper per-query, pricier overall)

16. **session.resume(session_id)**
    - Restore existing session, continue conversation
    - Full history available to agent
    - Use for: multi-turn interactions, context-dependent work

17. **session.continue()**
    - Resume current session implicitly
    - Default behavior in loops
    - Same as resume() but shorter syntax

18. **session.fork()**
    - Branch from current session
    - Parent unaffected; fork is independent copy
    - Use for: "what-if" scenarios, A/B testing branches

---

## Common Mistakes

19. **Missing Permission Checks on Subagent Tools**
    - Subagent inherits parent's tool set by default
    - Grant only necessary tools: `tools=[safe_tool_1, safe_tool_2]`
    - Assume subagent is untrusted (apply same rules as user input)

20. **Handoff Data Loss**
    - Passing plain strings loses structure; receiver guesses format
    - Always use Pydantic/schema for handoffs
    - Version schemas: old agents may send old format

21. **Session Proliferation**
    - Creating new session for every query = no context, high cost
    - Reuse sessions within same conversation
    - Use fork() for branching, not create()

22. **Circular Delegation**
    - Agent A calls subagent B; B calls back to A
    - Leads to infinite loops, cost overruns
    - Design: acyclic handoff graph, clear entry/exit points

23. **Timing Out on Parallel Teams**
    - Parallel agents may finish at different times
    - Don't assume all respond within deadline
    - Implement timeout + graceful fallback (use fastest N responses)
