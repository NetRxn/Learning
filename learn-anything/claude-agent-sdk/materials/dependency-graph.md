# Claude Agent SDK: Dependency Graph & Mastery Overlay

## Module 1: Core Competencies & Tools Foundation

```mermaid
flowchart TD
    classDef mastered fill:#22c55e,stroke:#16a34a,color:#fff,stroke-width:3px
    classDef proficient fill:#eab308,stroke:#ca8a04,color:#000,stroke-width:2px
    classDef familiar fill:#eab308,stroke:#ca8a04,color:#000,stroke-width:2px
    classDef notstarted fill:#d1d5db,stroke:#6b7280,color:#000,stroke-width:1px
    classDef attempted fill:#d1d5db,stroke:#6b7280,color:#000,stroke-width:1px

    %% Core Cluster
    subgraph cluster-core["Core (Foundation)"]
        AL["Agent Loop & Query<br/>55% - Familiar"]
        SP["System Prompts<br/>80% - Proficient"]
        CC["Context Compaction<br/>75% - Proficient"]
        STR["Streaming<br/>40% - Familiar"]
    end

    %% Tools Cluster
    subgraph cluster-tools["Tools (Capability)"]
        BT["Built-in Tools<br/>90% - Mastered"]
        CT["Custom Tools<br/>65% - Familiar"]
        MCP["External MCP<br/>55% - Familiar"]
        TD["Tool Design<br/>80% - Proficient"]
        TS["Tool Search<br/>0% - Not Started"]
        PTC["Programmatic Tool Calling<br/>0% - Not Started"]
    end

    %% Control Cluster
    subgraph cluster-control["Control (Safety & Economics)"]
        PERM["Permissions<br/>75% - Proficient"]
        HOOKS["Hooks<br/>75% - Proficient"]
        COST["Cost Management<br/>50% - Familiar"]
        EH["Error Handling<br/>70% - Proficient"]
    end

    %% Prerequisites and dependencies
    AL --> SP
    AL --> CC
    AL --> STR
    SP --> TD
    CC --> STR
    
    BT --> CT
    BT --> MCP
    BT --> TS
    CT --> TD
    CT --> PTC
    TD --> PTC
    
    SP --> PERM
    SP --> HOOKS
    EH --> COST
    HOOKS --> PERM
    
    class AL familiar
    class SP proficient
    class CC proficient
    class STR familiar
    class BT mastered
    class CT familiar
    class MCP familiar
    class TD proficient
    class TS notstarted
    class PTC notstarted
    class PERM proficient
    class HOOKS proficient
    class COST familiar
    class EH proficient
```

---

## Module 2: State Management & Multi-Agent Patterns

```mermaid
flowchart TD
    classDef mastered fill:#22c55e,stroke:#16a34a,color:#fff,stroke-width:3px
    classDef proficient fill:#eab308,stroke:#ca8a04,color:#000,stroke-width:2px
    classDef familiar fill:#eab308,stroke:#ca8a04,color:#000,stroke-width:2px
    classDef notstarted fill:#d1d5db,stroke:#6b7280,color:#000,stroke-width:1px
    classDef attempted fill:#d1d5db,stroke:#6b7280,color:#000,stroke-width:1px

    %% State Cluster
    subgraph cluster-state["State (Persistence)"]
        SESS["Sessions<br/>75% - Proficient"]
        SO["Structured Output<br/>90% - Mastered"]
        CS["Conversation State<br/>70% - Proficient"]
        MEM["Memory Tool<br/>0% - Not Started"]
    end

    %% Multi-Agent Cluster
    subgraph cluster-multi-agent["Multi-Agent (Coordination)"]
        SUB["Subagents<br/>60% - Familiar"]
        ORCH["Orchestration<br/>65% - Familiar"]
        AT["Agent Teams<br/>70% - Proficient"]
        HO["Handoff Patterns<br/>50% - Familiar"]
    end

    %% Integration Cluster
    subgraph cluster-integration["Integration (External Systems)"]
        DB["Database Integration<br/>60% - Familiar"]
        API["API Design<br/>70% - Proficient"]
    end

    %% Dependencies
    SESS --> CS
    CS --> SO
    SO --> MEM
    SESS --> DB
    
    SUB --> ORCH
    ORCH --> AT
    AT --> HO
    SO --> AT
    
    DB --> API
    API --> ORCH
    
    class SESS proficient
    class SO mastered
    class CS proficient
    class MEM notstarted
    class SUB familiar
    class ORCH familiar
    class AT proficient
    class HO familiar
    class DB familiar
    class API proficient
```

---

## Module 3: Production Readiness & Advanced Architecture

```mermaid
flowchart TD
    classDef mastered fill:#22c55e,stroke:#16a34a,color:#fff,stroke-width:3px
    classDef proficient fill:#eab308,stroke:#ca8a04,color:#000,stroke-width:2px
    classDef familiar fill:#eab308,stroke:#ca8a04,color:#000,stroke-width:2px
    classDef notstarted fill:#d1d5db,stroke:#6b7280,color:#000,stroke-width:1px
    classDef attempted fill:#d1d5db,stroke:#6b7280,color:#000,stroke-width:1px

    %% Observability Cluster
    subgraph cluster-obs["Observability (Monitoring)"]
        OTEL["OTel Tracing<br/>10% - Attempted"]
        OP["Observability Platforms<br/>10% - Attempted"]
        TEST["Testing Strategies<br/>10% - Attempted"]
        PO["Production Ops<br/>25% - Attempted"]
    end

    %% Architecture Cluster
    subgraph cluster-arch["Architecture (Patterns & Deployment)"]
        AP["Architecture Patterns<br/>65% - Familiar"]
        ET["Evolution Tracking<br/>10% - Attempted"]
        SD["Secure Deployment<br/>0% - Not Started"]
        LRP["Long-Running Patterns<br/>0% - Not Started"]
    end

    %% Prerequisites
    OTEL --> TEST
    TEST --> OP
    OP --> PO
    
    AP --> SD
    AP --> LRP
    AP --> ET
    PO --> SD
    TEST --> ET
    
    class OTEL attempted
    class OP attempted
    class TEST attempted
    class PO attempted
    class AP familiar
    class ET attempted
    class SD notstarted
    class LRP notstarted
```

---

## Mastery Levels Reference

| Level | Color | Threshold | Description |
|-------|-------|-----------|-------------|
| **Mastered** | Green (#22c55e) | ≥85% | Can teach others; applies in novel contexts; deep fluency |
| **Proficient** | Yellow (#eab308) | 30-84% | Solves standard problems independently; grasps underlying principles |
| **Familiar** | Yellow (#eab308) | 30-84% | Completes guided tasks; understands key concepts |
| **Attempted** | Gray (#d1d5db) | <30% | Exposure only; significant gaps remain |
| **Not Started** | Gray (#d1d5db) | 0% | No engagement yet |

---

## Key Prerequisites by Cluster

### Core → Tools
- **Agent Loop & Query** must precede Tool Design (understand how queries invoke tools)
- **System Prompts** enables Tool Design (tools are invoked via prompt engineering)

### Core → Control
- **System Prompts** must precede Permissions & Hooks (these modify prompt behavior)
- **Error Handling** required before Cost Management (failures drive cost overruns)

### State → Multi-Agent
- **Structured Output** prerequisite for Agent Teams (teams coordinate via structured messages)
- **Sessions** enables persistence in handoff patterns

### Multi-Agent → Integration
- **Orchestration** required before API Design (design APIs for agent consumption)
- **Database Integration** enables team coordination (shared state layer)

### All → Production Readiness
- Production Ops requires foundations in all three lower clusters
- Secure Deployment requires Architecture Patterns + Control cluster mastery
