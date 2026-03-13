# TC1: SDK Primitives Sprint — Worked Examples with Backward Fading

## Topic Overview
Building a complete SDK agent with custom database tools, streaming output, and cost limits. This sprint focuses on the foundational SDK primitives: tools, async iteration, streaming, and token budgeting.

---

## Full Worked Example: Analytics Agent with Postgres Tools

**Problem Statement:** Build an agent that connects to a PostgreSQL analytics database, executes queries through tool calls, streams results, and enforces a $0.50 token budget limit.

### Step 1: Define Database Tool with Parameterization
**Self-explanation prompt:** Why does using a parameterized tool function make the agent safer and more reusable?

```python
import asyncpg
from anthropic.types.tool import Tool
from anthropic.types import ToolParam

async def query_postgres(sql: str, params: list = None) -> str:
    """Execute a SQL query and return results as formatted text."""
    conn = await asyncpg.connect(
        user="analytics_user",
        password="secure_password",
        database="analytics_db",
        host="localhost"
    )
    try:
        # Use parameterized queries to prevent SQL injection
        if params:
            result = await conn.fetch(sql, *params)
        else:
            result = await conn.fetch(sql)

        # Format results as readable text
        if not result:
            return "No results found."

        headers = list(result[0].keys())
        rows = [tuple(row.values()) for row in result]

        formatted = " | ".join(headers) + "\n"
        formatted += "-" * len(formatted) + "\n"
        for row in rows:
            formatted += " | ".join(str(v) for v in row) + "\n"

        return formatted
    finally:
        await conn.close()

# Define the tool schema for the agent
postgres_tool = Tool(
    name="query_analytics",
    description="Execute SQL queries against the analytics database",
    input_schema={
        "type": "object",
        "properties": {
            "sql": {
                "type": "string",
                "description": "The SQL query to execute"
            },
            "params": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Optional query parameters for safe parameterization"
            }
        },
        "required": ["sql"]
    }
)
```

**Why this works:** Parameterized queries prevent SQL injection. The tool schema explicitly defines inputs, allowing the agent to understand what parameters it can pass and making the contract clear.

---

### Step 2: Create Tool Dispatcher with Error Handling
**Self-explanation prompt:** Why is wrapping tool execution in a try-except block essential for agent reliability?

```python
async def handle_tool_call(tool_name: str, tool_input: dict) -> str:
    """Dispatch tool calls and handle errors gracefully."""
    if tool_name == "query_analytics":
        try:
            sql = tool_input.get("sql")
            params = tool_input.get("params", [])

            if not sql:
                return "Error: SQL query is required"

            result = await query_postgres(sql, params)
            return result
        except asyncpg.PostgresError as e:
            return f"Database error: {str(e)}"
        except Exception as e:
            return f"Unexpected error: {str(e)}"
    else:
        return f"Unknown tool: {tool_name}"
```

**Why this works:** Tool execution can fail for many reasons (network, malformed SQL, permissions). Catching errors prevents the entire agent from crashing and allows graceful degradation with informative error messages.

---

### Step 3: Initialize Anthropic Client with Cost Limits
**Self-explanation prompt:** Why do we track token usage separately rather than relying solely on API rate limits?

```python
from anthropic import Anthropic

# Initialize client
client = Anthropic(api_key="sk-ant-...")

# Cost tracking variables
TOKEN_LIMIT = 1000  # ~$0.50 at current pricing
tokens_used = 0
MAX_TOKENS_PER_CALL = 500

def calculate_cost(input_tokens: int, output_tokens: int) -> float:
    """Calculate cost based on Claude 3.5 Sonnet pricing."""
    # Input: $3/million tokens, Output: $15/million tokens
    input_cost = (input_tokens / 1_000_000) * 3
    output_cost = (output_tokens / 1_000_000) * 15
    return input_cost + output_cost
```

**Why this works:** API providers charge by token usage. Tracking it ourselves allows us to implement custom budgets and prevent runaway costs from failed experiments or infinite loops.

---

### Step 4: Build Main Agent Loop with Streaming
**Self-explanation prompt:** Why does using an async iterator with streaming allow us to process partial results in real-time?

```python
async def run_analytics_agent(user_query: str) -> str:
    """Run the agent with streaming and cost limits."""
    global tokens_used

    messages = [{"role": "user", "content": user_query}]
    full_response = ""

    while True:
        # Check budget before making request
        if tokens_used >= TOKEN_LIMIT:
            return "Token budget exhausted. Please try again later."

        # Use streaming to process tokens as they arrive
        with client.messages.stream(
            model="claude-3-5-sonnet-20241022",
            max_tokens=MAX_TOKENS_PER_CALL,
            tools=[postgres_tool],
            messages=messages
        ) as stream:
            # Collect the full response while streaming
            for text in stream.text_stream:
                full_response += text
                print(text, end="", flush=True)  # Real-time output

            # Get final message for tool use detection
            final_message = stream.get_final_message()
            tokens_used += (
                final_message.usage.input_tokens +
                final_message.usage.output_tokens
            )

        # Check if agent wants to use a tool
        tool_calls = [
            block for block in final_message.content
            if block.type == "tool_use"
        ]

        if not tool_calls:
            # No more tool calls, agent is done
            break

        # Process each tool call
        messages.append({"role": "assistant", "content": final_message.content})
        tool_results = []

        for tool_call in tool_calls:
            print(f"\n[Calling tool: {tool_call.name}]")
            result = await handle_tool_call(tool_call.name, tool_call.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_call.id,
                "content": result
            })

        messages.append({"role": "user", "content": tool_results})

    return full_response
```

**Why this works:** Streaming with `messages.stream()` returns an async iterator that yields text tokens as they're generated. This enables real-time feedback to users and allows early interruption if needed. The cost-tracking check prevents budget overruns.

---

### Step 5: Add Request Validation and Preprocessing
**Self-explanation prompt:** Why should we validate user input before sending it to Claude?

```python
def validate_query(query: str) -> tuple[bool, str]:
    """Validate user query for safety and relevance."""
    if not query or len(query.strip()) == 0:
        return False, "Query cannot be empty"

    if len(query) > 2000:
        return False, "Query exceeds maximum length (2000 chars)"

    # Reject queries that don't seem database-related
    dangerous_keywords = ["drop", "delete from", "truncate", "alter table"]
    query_lower = query.lower()

    for keyword in dangerous_keywords:
        if keyword in query_lower:
            return False, f"Query contains dangerous keyword: {keyword}"

    return True, ""

async def run_analytics_agent_safe(user_query: str) -> str:
    """Wrapper with input validation."""
    is_valid, error_msg = validate_query(user_query)
    if not is_valid:
        return f"Invalid query: {error_msg}"

    return await run_analytics_agent(user_query)
```

**Why this works:** Validating input early prevents malformed requests from consuming tokens. It also catches obvious safety issues before they reach Claude.

---

### Step 6: Implement Session Management with Cost Reports
**Self-explanation prompt:** Why do we separate session initialization from query execution?

```python
class AnalyticsSession:
    """Manages an agent session with cost tracking and history."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.messages = []
        self.tokens_used = 0
        self.cost_so_far = 0.0
        self.tool_calls_made = []

    async def query(self, user_query: str) -> str:
        """Execute a query and track session metrics."""
        is_valid, error = validate_query(user_query)
        if not is_valid:
            return f"Validation failed: {error}"

        # Add user message to session history
        self.messages.append({"role": "user", "content": user_query})

        # Execute agent logic (simplified version)
        result = await run_analytics_agent(user_query)
        self.messages.append({"role": "assistant", "content": result})

        return result

    def get_session_report(self) -> str:
        """Generate a session cost and usage report."""
        report = f"""
        Session Report: {self.session_id}
        ================================
        Messages exchanged: {len(self.messages)}
        Tokens used: {self.tokens_used}
        Estimated cost: ${self.cost_so_far:.4f}
        Tool calls made: {len(self.tool_calls_made)}
        Tool calls: {', '.join(self.tool_calls_made) if self.tool_calls_made else 'None'}
        """
        return report.strip()

# Usage
session = AnalyticsSession("session_abc123")
result = await session.query("What are the top 5 products by revenue?")
print(session.get_session_report())
```

**Why this works:** Sessions encapsulate agent state and metrics, making it easy to track cost and performance per user or per conversation. This is essential for multi-user systems.

---

### Step 7: Complete Working Example with Context Manager
**Self-explanation prompt:** Why do we use async context managers to ensure database connections are properly cleaned up?

```python
from contextlib import asynccontextmanager
from typing import AsyncGenerator

@asynccontextmanager
async def managed_analytics_agent(
    session_id: str,
    token_budget: int = 1000
) -> AsyncGenerator[AnalyticsSession, None]:
    """Context manager for safe agent execution with resource cleanup."""
    session = AnalyticsSession(session_id)
    session.tokens_used = 0  # Reset on creation

    try:
        yield session
    finally:
        # Cleanup: close any open connections, log metrics
        print(f"Session {session_id} ended. Report:\n{session.get_session_report()}")

# Usage pattern
async def main():
    async with managed_analytics_agent("user_001") as session:
        result = await session.query("SELECT COUNT(*) FROM events WHERE date > NOW() - INTERVAL '7 days'")
        print(result)

        result2 = await session.query("What was the average order value last month?")
        print(result2)

# Run it
if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

**Why this works:** Context managers guarantee cleanup code runs even if exceptions occur. This prevents resource leaks and ensures metrics are always logged, making debugging easier in production.

---

---

## Fading Version 1: Remove Steps 6-7 (Session Management & Context Manager)

**Problem Statement:** Build an agent that connects to a PostgreSQL analytics database, executes queries through tool calls, streams results, and enforces a $0.50 token budget limit.

### Step 1: Define Database Tool with Parameterization
[Full code as above]

### Step 2: Create Tool Dispatcher with Error Handling
[Full code as above]

### Step 3: Initialize Anthropic Client with Cost Limits
[Full code as above]

### Step 4: Build Main Agent Loop with Streaming
[Full code as above]

### Step 5: Add Request Validation and Preprocessing
[Full code as above]

**Your Task:** Implement session management and a cost report feature to track tokens used and estimated cost per conversation.

---

## Fading Version 2: Remove Steps 5-7 (Validation, Session Mgmt, Context Manager)

**Problem Statement:** Build an agent that connects to a MySQL analytics database, executes queries through tool calls, streams results, and enforces a $0.50 token budget limit.

*(Note: Surface feature change — MySQL instead of PostgreSQL)*

### Step 1: Define Database Tool with Parameterization
```python
import aiomysql
from anthropic.types.tool import Tool

async def query_mysql(sql: str, params: list = None) -> str:
    """Execute a SQL query against MySQL analytics database."""
    # Similar structure to postgres version, but using aiomysql
    # Include parameterization for safety
    pass

mysql_tool = Tool(
    name="query_analytics",
    description="Execute SQL queries against the analytics database",
    input_schema={
        "type": "object",
        "properties": {
            "sql": {"type": "string", "description": "The SQL query to execute"},
            "params": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["sql"]
    }
)
```

### Step 2: Create Tool Dispatcher with Error Handling
```python
async def handle_tool_call(tool_name: str, tool_input: dict) -> str:
    """Dispatch tool calls and handle errors gracefully."""
    if tool_name == "query_analytics":
        try:
            sql = tool_input.get("sql")
            params = tool_input.get("params", [])
            result = await query_mysql(sql, params)
            return result
        except Exception as e:
            return f"Database error: {str(e)}"
    return f"Unknown tool: {tool_name}"
```

### Step 3: Initialize Anthropic Client with Cost Limits
[Full code as Step 3 above]

### Step 4: Build Main Agent Loop with Streaming
[Full code as Step 4 above]

**Your Task:** Add input validation to reject queries with dangerous SQL keywords, then implement session management with cost reporting.

---

## Fading Version 3: Remove Steps 4-7 (Agent Loop, Validation, Session Mgmt, Context Manager)

**Problem Statement:** Build an agent that connects to a Snowflake data warehouse, executes queries through tool calls, streams results, and enforces a $0.50 token budget limit.

*(Note: Surface feature change — Snowflake instead of PostgreSQL/MySQL)*

### Step 1: Define Database Tool with Parameterization
```python
import snowflake.connector
from anthropic.types.tool import Tool

async def query_snowflake(sql: str, params: list = None) -> str:
    """Execute a SQL query against Snowflake data warehouse."""
    # Connect to Snowflake
    conn = snowflake.connector.connect(
        user="analytics_user",
        password="password",
        account="xy12345.us-east-1",
        warehouse="compute_wh",
        database="analytics"
    )
    try:
        cursor = conn.cursor()
        if params:
            cursor.execute(sql, params)
        else:
            cursor.execute(sql)

        results = cursor.fetchall()
        # Format and return results
        if not results:
            return "No results found."

        # Build formatted output
        formatted = " | ".join(str(d[0]) for d in cursor.description) + "\n"
        formatted += "-" * 50 + "\n"
        for row in results:
            formatted += " | ".join(str(v) for v in row) + "\n"

        return formatted
    finally:
        conn.close()

snowflake_tool = Tool(
    name="query_warehouse",
    description="Query the Snowflake data warehouse",
    input_schema={
        "type": "object",
        "properties": {
            "sql": {"type": "string", "description": "SQL query"},
            "params": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["sql"]
    }
)
```

### Step 2: Create Tool Dispatcher with Error Handling
```python
async def handle_tool_call(tool_name: str, tool_input: dict) -> str:
    """Dispatch tool calls with error handling."""
    if tool_name == "query_warehouse":
        try:
            sql = tool_input.get("sql")
            params = tool_input.get("params", [])
            result = await query_snowflake(sql, params)
            return result
        except Exception as e:
            return f"Error: {str(e)}"
    return f"Unknown tool: {tool_name}"
```

### Step 3: Initialize Anthropic Client with Cost Limits
[Full code as Step 3 above]

**Your Task:** Implement the main agent loop with streaming output and token budget enforcement. Then add input validation and session management.

---

## Fading Version 4: Remove Steps 3-7 (Cost Limits, Agent Loop, Validation, Session Mgmt, Context Manager)

**Problem Statement:** Build an agent with custom tools that can query a data warehouse, stream results, and execute tool calls properly.

*(Note: Surface feature change — Generic "data warehouse" tool instead of specific database)*

### Step 1: Define Database Tool with Parameterization
```python
from anthropic.types.tool import Tool

# Define a generic query tool
query_tool = Tool(
    name="execute_query",
    description="Execute analytics queries",
    input_schema={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "The query to execute"},
            "database": {"type": "string", "description": "Target database"}
        },
        "required": ["query"]
    }
)

async def execute_query(query: str, database: str = "default") -> str:
    """Execute a query against the specified database."""
    # Implementation placeholder
    return "Query executed successfully"
```

### Step 2: Create Tool Dispatcher with Error Handling
```python
async def handle_tool_call(tool_name: str, tool_input: dict) -> str:
    """Dispatch and execute tool calls."""
    if tool_name == "execute_query":
        try:
            query = tool_input.get("query")
            db = tool_input.get("database", "default")
            return await execute_query(query, db)
        except Exception as e:
            return f"Error: {str(e)}"
    return "Tool not found"
```

**Your Task:** Initialize the Anthropic client with token tracking and cost limits, then implement the main agent loop with streaming. Add validation and session management as final steps.

---

## Key Takeaways for TC1

- **SDK Primitives:** Tools are defined as structured schema objects; tool execution happens through dispatcher functions
- **Async/Streaming:** Use `client.messages.stream()` to process tokens in real-time and enable early cancellation
- **Cost Management:** Track tokens yourself; don't rely solely on API limits
- **Error Handling:** Always wrap tool calls in try-except; graceful degradation is better than crashes
- **Session State:** Encapsulate state (messages, metrics) in session objects for multi-turn conversations
- **Context Managers:** Use async context managers to guarantee cleanup and resource management

