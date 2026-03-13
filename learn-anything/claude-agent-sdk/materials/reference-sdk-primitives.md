# SDK Primitives Quick Reference (TC1)

## Agent Loop & query() Mechanics

1. **Message Types in Agent Loop**
   - `UserMessage`: Input from user/external system
   - `AssistantMessage`: Agent response (can trigger tool calls)
   - `ToolUseBlock`: Request to execute a tool with args
   - `ToolResultBlock`: Result returned from tool execution
   - Loop continues until agent returns text without tool use blocks

2. **query() Lifecycle**
   - Agent receives message → searches for matching tools
   - Generates response (text + optional tool use blocks)
   - If tool blocks present: execute tools → add results to conversation
   - Resume query with updated context → repeat until no tool blocks
   - Return final AssistantMessage to caller

3. **Stop Conditions**
   - Agent generates response without tool use blocks
   - max_tokens exhausted
   - max_iterations reached (safety limit)
   - Explicit agent decision to stop

---

## Custom Tools (@tool decorator)

4. **Tool Definition Pattern**
   ```python
   @tool
   def search_docs(query: str, max_results: int = 5) -> str:
       """Search documentation. Returns markdown of top results."""
       # Implementation
       return results_markdown
   ```
   - Docstring required (becomes tool description)
   - Type hints required (arg types, return type)
   - Return type hint determines result format (str/list/dict/etc)

5. **Tool Registration**
   - Decorated functions auto-register in agent's tool namespace
   - Tool name = function name (underscores visible in tool UI)
   - Namespace collision: last decorator wins (use unique names)
   - Tools available immediately on next query()

6. **create_sdk_mcp_server Pattern**
   - For complex tool suites: wrap in MCP server
   - `create_sdk_mcp_server(tools=[...])` → Server object
   - Server exposes tools via JSON-RPC interface
   - Integration: more portable, reusable across agents

---

## Streaming Configuration

7. **Stream vs Buffered**
   - Default: buffered (query() blocks until complete response)
   - Stream: `stream=True` returns iterator of chunks
   - Each chunk is `ToolUseBlock`, text delta, or metadata
   - Useful for long-running operations, UI responsiveness

8. **Stream Handling Loop**
   ```python
   for chunk in agent.query(msg, stream=True):
       if isinstance(chunk, TextDelta):
           print(chunk.text, end='', flush=True)
       elif isinstance(chunk, ToolUseBlock):
           # Tool execution logic
   ```

---

## Cost Management

9. **max_budget_usd Enforcement**
   - Parameter on query(): `max_budget_usd=1.00`
   - Tracks token costs during agent loop
   - Stops execution if budget exceeded (raises error)
   - Useful for production quotas, cost isolation per tenant

10. **Model Mixing Strategy**
    - Route complex queries → expensive model (Claude 3.5 Sonnet)
    - Batch/routine queries → cheaper model (Haiku)
    - Set via `model=` parameter
    - Trade-off: latency vs cost vs quality

11. **Cost Monitoring**
    - Log model, tokens used, estimated cost per query
    - Track within agent loop via metadata
    - Set alerts: if monthly_cost > threshold

---

## Tool Search & Programmatic Calling

12. **Tool Matching Mechanism**
    - Agent uses NLP on docstring to match user intent to tools
    - Broader docstrings = more match opportunities
    - Tool naming matters (descriptive > generic)
    - Explicit prompting improves matching

13. **Explicit Tool Invocation**
    - Don't rely on NLP matching for critical paths
    - Pre-select tools: `tools=[search_tool, db_tool]`
    - Pass smaller tool set if tool explosion likely
    - Verify tool called via response inspection

---

## Common Mistakes

14. **Missing Type Hints**
    - Tool doesn't register if args lack type hints
    - Return type required for SDK introspection
    - String hints (`"str"`) won't work — use actual types

15. **Unbounded Tool Loops**
    - Tool returns result → agent calls same tool again → infinite loop
    - Add `max_iterations` to query() as safety net
    - Inspect tool results: ensure they change state/progress

16. **Cost Surprises**
    - Model changes (e.g., Claude 3.5 Sonnet) silently increase costs
    - Long context windows amplify token spend
    - No budget enforcement by default — set max_budget_usd

17. **Tool Result Format Mismatch**
    - Tool returns dict, agent expects string
    - JSON serialization failures on complex objects
    - Keep results simple: strings, dicts, or lists of primitives
