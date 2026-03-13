# IndexedDB: The Visual Guide

*For learners who already understand Cache API and service workers — positioning IDB in the storage landscape you know.*

---

## Where IDB Sits: The Storage Map

You already know the three-layer cache model (Cache API → HTTP Cache → CDN). IDB is a **different axis entirely** — it's not a cache layer, it's a **structured database** living in the browser.

```mermaid
flowchart LR
    subgraph "Request Path (you know this)"
        SW["Service Worker<br/>fetch intercept"]
        CA["Cache API<br/>req/res pairs"]
        HC["HTTP Cache<br/>Cache-Control"]
        CDN["CDN Edge"]
        OR["Origin"]
        SW --> CA --> HC --> CDN --> OR
    end

    subgraph "Storage Path (new territory)"
        MT["Main Thread<br/>(your React code)"]
        IDB["IndexedDB<br/>structured data"]
        LS["localStorage<br/>key-value strings"]
        MT --> IDB
        MT -.->|"avoid for<br/>complex data"| LS
    end

    SW -.->|"can access"| IDB
    SW -->|"native to"| CA
    MT -->|"can access"| CA
    MT -.->|"NOT in SW"| LS

    style IDB fill:#3b82f6,color:white,stroke:#1d4ed8,stroke-width:3px
    style CA fill:#22c55e,color:white
    style LS fill:#ef4444,color:white
```

**The key insight:** Cache API stores **HTTP request/response pairs** (opaque blobs keyed by URL). IDB stores **structured JavaScript objects** you can query, filter, index, and update individually. They solve fundamentally different problems.

---

## Cache API vs IndexedDB: When to Use Which

```mermaid
flowchart TD
    Q1{"What are you storing?"}
    Q1 -->|"HTTP responses<br/>(HTML, JS, CSS, images)"| CA_BOX["Use Cache API"]
    Q1 -->|"App data<br/>(JSON objects, user state)"| Q2{"Need to query/filter<br/>individual records?"}
    Q2 -->|"Yes — search, sort,<br/>filter by field"| IDB_BOX["Use IndexedDB"]
    Q2 -->|"No — just cache<br/>the whole response"| CA_BOX2["Cache API works too<br/>(cache the JSON response by URL)"]

    CA_BOX2 -->|"But if you later need<br/>to query inside it..."| IDB_BOX

    style IDB_BOX fill:#3b82f6,color:white,stroke:#1d4ed8,stroke-width:3px
    style CA_BOX fill:#22c55e,color:white
    style CA_BOX2 fill:#22c55e,color:white
```

### Your StudyElf plan: why IDB, not Cache API?

Your plan caches **flashcards** and **questions**. You need to:
- Get 10 random questions filtered by `difficulty=hard` and `module=pharmacology`
- Find all flashcards where `nextReviewDate <= today`
- Update one flashcard's SM-2 state without touching the others

Cache API can't do any of that — it would give you the **entire API response blob** keyed by the URL you fetched. You'd have to deserialize everything, filter in memory, and hope you fetched with the right query params. IDB lets you store each flashcard as its own indexed record and query directly.

---

## The IDB Mental Model

Think of IDB as **a NoSQL database in the browser** — closer to MongoDB than to localStorage.

```mermaid
flowchart TD
    subgraph BROWSER["Browser (per-origin)"]
        subgraph DB["Database: studyelf-offline (v1)"]
            subgraph OS1["Object Store: questions"]
                R1["{ id: 'q-42', module: 'pharm',<br/>difficulty: 'hard', ... }"]
                R2["{ id: 'q-43', module: 'calc',<br/>difficulty: 'medium', ... }"]
                R3["{ id: 'q-44', module: 'pharm',<br/>difficulty: 'easy', ... }"]
                IDX1["Index: module"]
                IDX2["Index: difficulty"]
            end
            subgraph OS2["Object Store: sm2-state"]
                S1["{ flashcardId: 'fc-1',<br/>direction: 'brand_to_generic',<br/>easeFactor: 2.3,<br/>nextReviewDate: '2026-03-13' }"]
                S2["{ flashcardId: 'fc-2',<br/>direction: 'generic_to_brand',<br/>easeFactor: 1.8,<br/>nextReviewDate: '2026-03-11' }"]
                IDX3["Index: nextReviewDate"]
            end
            subgraph OS3["Object Store: quiz-attempts"]
                A1["{ _key: 1, questionId: 'q-42',<br/>idempotency_key: 'uuid-abc',<br/>timestamp: 1710... }"]
                A2["{ _key: 2, questionId: 'q-43',<br/>idempotency_key: 'uuid-def',<br/>timestamp: 1710... }"]
            end
        end
    end

    style DB fill:#1e293b,color:#e2e8f0
    style OS1 fill:#1e3a5f,color:#e2e8f0
    style OS2 fill:#1e3a5f,color:#e2e8f0
    style OS3 fill:#1e3a5f,color:#e2e8f0
    style IDX1 fill:#3b82f6,color:white
    style IDX2 fill:#3b82f6,color:white
    style IDX3 fill:#3b82f6,color:white
```

### Hierarchy (top to bottom):

| Level | Analogy | Example |
|-------|---------|---------|
| **Origin** | Database server | `https://studyelf.com` |
| **Database** | A named database | `studyelf-offline` |
| **Object Store** | A collection/table | `questions`, `flashcards`, `sm2-state` |
| **Record** | A document/row | `{ id: 'q-42', module: 'pharm', ... }` |
| **Index** | A secondary index | `module` index on questions store |

**Critical constraint:** Object stores can only be created/modified during a **version upgrade**. You can't add a store at runtime — you have to bump `DB_VERSION` and handle it in `onupgradeneeded`. This is why your plan has `DB_VERSION = 1` and creates all 8 stores upfront.

---

## The Transaction Model: IDB's Most Important Concept

This is where IDB diverges sharply from fetch/Cache API. **Every IDB operation happens inside a transaction.** No transaction, no read, no write.

```mermaid
sequenceDiagram
    participant App as Your React Code
    participant TX as IDB Transaction
    participant Store as Object Store
    participant Result as Callback/Promise

    Note over App,Result: READING a record
    App->>TX: db.transaction("questions", "readonly")
    TX->>Store: store.get("q-42")
    Store-->>Result: onsuccess → { id: "q-42", ... }

    Note over App,Result: WRITING a record
    App->>TX: db.transaction("sm2-state", "readwrite")
    TX->>Store: store.put({ flashcardId: "fc-1", ... })
    Store-->>TX: write buffered
    TX-->>Result: oncomplete → committed

    Note over App,Result: TRANSACTION AUTO-COMMITS<br/>when all requests finish<br/>and control returns to event loop
```

### Transaction rules (the gotchas):

1. **Transactions auto-commit** when they go idle. If you `await` something that isn't an IDB request inside a transaction (like a `fetch()`), the transaction commits/dies before your next IDB call. This is the #1 IDB footgun.

2. **"readonly" vs "readwrite"** — readonly transactions can overlap (concurrent reads). Readwrite transactions on the same store are **serialized** (queued). This matters for your sync replay.

3. **Scope** — A transaction locks specific stores. `db.transaction(["questions", "sm2-state"], "readwrite")` locks both. Keep scope minimal.

4. **No nested transactions.** One transaction, one set of operations, done.

```mermaid
flowchart TD
    subgraph WRONG["WRONG: Transaction dies mid-await"]
        W1["tx = db.transaction('questions', 'readwrite')"] --> W2["store.put(record)"]
        W2 --> W3["await fetch('/api/validate')"]:::danger
        W3 --> W4["store.put(validated)"]:::dead
    end

    subgraph RIGHT["RIGHT: Separate transactions"]
        R1["await fetch('/api/validate')"] --> R2["tx = db.transaction('questions', 'readwrite')"]
        R2 --> R3["store.put(validated)"]
        R3 --> R4["tx.oncomplete"]
    end

    style W3 fill:#ef4444,color:white
    style W4 fill:#6b7280,color:white,stroke-dasharray: 5 5
    style R3 fill:#22c55e,color:white
```

---

## Key Patterns: How Your Plan's Operations Actually Work

### Pattern 1: Write-Through (online API call → save to IDB)

```mermaid
sequenceDiagram
    participant Page as Quiz Page
    participant API as apiClient
    participant Net as Network
    participant IDB as IndexedDB

    Page->>API: getRandomQuestions({ count: 10 })
    API->>Net: fetch('/api/v1/questions/random?count=10')
    Net-->>API: [q1, q2, ... q10]

    par Return to caller immediately
        API-->>Page: [q1, q2, ... q10]
    and Fire-and-forget cache write
        API->>IDB: saveQuestions([q1, q2, ... q10])
        Note over IDB: tx = "readwrite" on "questions"<br/>store.put(q1), store.put(q2), ...<br/>tx.oncomplete
    end
```

**Why `.catch()` on the write?** The write is fire-and-forget. If IDB is full (`QuotaExceededError`) or unavailable (private browsing), the user still gets their questions from the network. The cache write is an optimization, not a requirement.

### Pattern 2: Offline Fallback (network fails → read from IDB)

```mermaid
sequenceDiagram
    participant Page as Quiz Page
    participant API as apiClient
    participant Net as Network
    participant IDB as IndexedDB

    Page->>API: getRandomQuestions({ count: 10, difficulty: 'hard' })
    API->>Net: fetch('/api/v1/questions/random?...')
    Net--xAPI: NetworkError (offline)

    Note over API: Not an ApiError (4xx/5xx)<br/>→ fall through to IDB

    API->>IDB: getRandomQuestions({ count: 10, difficulty: 'hard' })
    Note over IDB: tx = "readonly" on "questions"<br/>index("difficulty").getAll("hard")<br/>Fisher-Yates shuffle<br/>slice(0, 10)
    IDB-->>API: [q5, q12, q3, ... q8]
    API-->>Page: [q5, q12, q3, ... q8]
```

### Pattern 3: Queue + Replay (offline submit → IDB queue → sync later)

```mermaid
sequenceDiagram
    participant Page as Quiz Page
    participant Grade as gradeQuestion()
    participant Queue as IDB: quiz-attempts
    participant Sync as PendingSyncManager
    participant API as apiClient
    participant Net as Network

    Note over Page,Net: OFFLINE: Student submits answer
    Page->>Grade: gradeQuestion(question, answer, time)
    Grade-->>Page: { is_correct: true, points: 15 }
    Page->>Page: applyResult() — update score UI
    Page->>Queue: enqueueQuizAttempt({ idempotency_key: uuid })
    Note over Queue: autoIncrement key = 1<br/>stored with timestamp

    Note over Page,Net: LATER: Student comes back online
    Sync->>Sync: online event fires
    Sync->>Queue: dequeueAll("quiz-attempts")
    Queue-->>Sync: [attempt1, attempt2, attempt3]

    loop For each queued attempt (FIFO)
        Sync->>API: submitQuestionAttempt(id, data)
        API->>Net: POST /api/v1/questions/{id}/attempt
        alt Success (200) or Duplicate (idempotency hit)
            Net-->>Sync: result
            Sync->>Queue: removeFromQueue(key)
        else 401 Unauthorized
            Sync->>Sync: STOP — toast "Session expired"
        else 5xx / Other
            Sync->>Sync: Skip entry, continue
        end
    end
    Sync->>Page: toast "Synced 3 study answers"
```

---

## Indexes: How Queries Work Without SQL

IDB has no query language. Instead, you create **indexes** on fields and walk them with **cursors** or **key ranges**.

```mermaid
flowchart LR
    subgraph STORE["Object Store: questions (keyPath: id)"]
        direction TB
        R1["q-01: { module: 'pharm', difficulty: 'hard' }"]
        R2["q-02: { module: 'calc', difficulty: 'easy' }"]
        R3["q-03: { module: 'pharm', difficulty: 'medium' }"]
        R4["q-04: { module: 'calc', difficulty: 'hard' }"]
        R5["q-05: { module: 'pharm', difficulty: 'hard' }"]
    end

    subgraph IDX_MOD["Index: module"]
        direction TB
        IM1["'calc' → [q-02, q-04]"]
        IM2["'pharm' → [q-01, q-03, q-05]"]
    end

    subgraph IDX_DIFF["Index: difficulty"]
        direction TB
        ID1["'easy' → [q-02]"]
        ID2["'hard' → [q-01, q-04, q-05]"]
        ID3["'medium' → [q-03]"]
    end

    STORE --- IDX_MOD
    STORE --- IDX_DIFF

    style IDX_MOD fill:#3b82f6,color:white
    style IDX_DIFF fill:#3b82f6,color:white
```

### Query: "10 random hard pharmacology questions"

```
1. store.index("difficulty")         // pick one index to walk
2. .getAll("hard")                   // → [q-01, q-04, q-05]
3. filter: r.module === "pharm"      // in-memory filter → [q-01, q-05]
4. Fisher-Yates shuffle              // randomize
5. .slice(0, 10)                     // take up to 10
```

**Limitation:** IDB can only walk ONE index at a time. Compound queries (hard AND pharm) require walking one index and filtering the rest in memory. For your ~2000-record dataset, this is fine. For millions, you'd need a compound index `[module, difficulty]`.

### Compound keyPath: SM-2 State

Your plan uses `keyPath: [flashcardId, direction]` — a **compound key**. This means each record is uniquely identified by the pair:

```
Key: ["fc-1", "brand_to_generic"]  → { easeFactor: 2.3, ... }
Key: ["fc-1", "generic_to_brand"]  → { easeFactor: 1.8, ... }
Key: ["fc-2", "brand_to_generic"]  → { easeFactor: 2.5, ... }
```

To look up: `store.get(["fc-1", "brand_to_generic"])` — returns the exact record. This is how "per-(flashcard, direction)" works. **But notice: no userId in this key** — which is Issue #1 from the review.

---

## The Version Upgrade: Schema Migration

IDB schema changes only happen inside `onupgradeneeded`. This fires when you open a database with a higher version number than what exists.

```mermaid
sequenceDiagram
    participant App as Your Code
    participant IDB as IndexedDB Engine

    Note over App,IDB: FIRST VISIT: No database exists
    App->>IDB: indexedDB.open("studyelf-offline", 1)
    IDB-->>App: onupgradeneeded(oldVersion=0, newVersion=1)
    Note over App: Create all 8 stores + indexes
    IDB-->>App: onsuccess → db handle

    Note over App,IDB: RETURN VISIT: v1 exists, opening v1
    App->>IDB: indexedDB.open("studyelf-offline", 1)
    Note over IDB: versions match → skip upgrade
    IDB-->>App: onsuccess → db handle

    Note over App,IDB: FUTURE: Need new store, bump to v2
    App->>IDB: indexedDB.open("studyelf-offline", 2)
    IDB-->>App: onupgradeneeded(oldVersion=1, newVersion=2)
    Note over App: if (oldVersion < 2) {<br/>  db.createObjectStore("new-store")<br/>}
    IDB-->>App: onsuccess → db handle
```

**Your plan's approach** (create all 8 stores in v1) is the right call for a first release. The version upgrade path becomes important when you ship updates — you'd write migration logic that checks `oldVersion` and incrementally adds stores/indexes.

**What happens to existing data during upgrade?** Existing stores and their data survive. Only newly created stores start empty. If you add an index to an existing store, IDB backfills it from existing records.

---

## Storage Quotas and Eviction

```mermaid
flowchart TD
    subgraph QUOTA["Browser Storage Budget (per origin)"]
        direction LR
        CA_Q["Cache API<br/>~shared pool"]
        IDB_Q["IndexedDB<br/>~shared pool"]
        LS_Q["localStorage<br/>5-10 MB hard limit"]
    end

    TOTAL["Total: ~50% of free disk<br/>(Chrome) or ~1GB+ (varies)"]
    TOTAL --> QUOTA

    subgraph EVICTION["Under storage pressure"]
        E1["LRU eviction of<br/>ENTIRE origin's data"]
        E2["Not per-store —<br/>everything or nothing"]
        E3["Persistent storage API<br/>can prevent eviction<br/>(navigator.storage.persist())"]
    end

    QUOTA --> EVICTION

    style LS_Q fill:#ef4444,color:white
    style E3 fill:#22c55e,color:white
```

**For your plan:** ~10MB for content download is well within budget. The `QuotaExceededError` catch is defensive programming for edge cases (user's disk is nearly full, or they're on a device with aggressive storage limits).

**`navigator.storage.persist()`** — worth adding to the download flow. When granted, the browser won't evict your IDB data under storage pressure. Chrome auto-grants for installed PWAs and frequently visited sites.

---

## The User-Scoping Problem (Issue #1 Visualized)

This is the bug in your plan. Here's what happens without user scoping:

```mermaid
sequenceDiagram
    participant A as Student A
    participant IDB as IDB: studyelf-offline
    participant B as Student B

    Note over A,B: Student A studies and goes offline
    A->>IDB: saveSM2State({ flashcardId: "fc-1",<br/>direction: "brand_to_generic",<br/>easeFactor: 2.3 })
    A->>IDB: enqueueQuizAttempt({ idempotency_key: "uuid-A1" })

    Note over A,B: Student A logs out, Student B logs in
    A->>A: logout()

    Note over IDB: SM-2 state and queue<br/>are STILL THERE

    B->>IDB: getSM2State("fc-1", "brand_to_generic")
    IDB-->>B: { easeFactor: 2.3 } ← STUDENT A'S STATE

    Note over B: B sees A's spaced repetition schedule

    Note over A,B: Student B goes online
    B->>IDB: dequeueAll("quiz-attempts")
    IDB-->>B: [{ idempotency_key: "uuid-A1" }] ← A'S ANSWER
    Note over B: Replays A's answer under B's session!
```

### Fix: Database-per-user

```mermaid
flowchart TD
    subgraph FIX["Database-per-user approach"]
        LOGIN["User logs in<br/>userId = 'user-42'"]
        OPEN["indexedDB.open(<br/>'studyelf-offline-user-42', 1)"]
        USE["All operations scoped<br/>to this user's DB"]
        LOGOUT["User logs out"]
        CLOSE["db.close()<br/>(optional: deleteDatabase<br/>for shared devices)"]

        LOGIN --> OPEN --> USE --> LOGOUT --> CLOSE
    end

    subgraph RESULT["Result"]
        DB_A["studyelf-offline-user-42<br/>← Student A's data"]
        DB_B["studyelf-offline-user-99<br/>← Student B's data"]
    end

    style FIX fill:#1e293b,color:#e2e8f0
    style DB_A fill:#3b82f6,color:white
    style DB_B fill:#22c55e,color:white
```

This also simplifies Edge Case #9 (logout with queued items) — you can check the user-specific DB for pending entries without worrying about cross-contamination.

---

## IDB vs Your Existing Knowledge: Transfer Map

| You already know... | IDB equivalent |
|---------------------|---------------|
| Cache API `caches.open(name)` | `indexedDB.open(name, version)` |
| Cache API `cache.put(request, response)` | `store.put(record)` (upsert by keyPath) |
| Cache API `cache.match(request)` | `store.get(key)` or `index.get(value)` |
| Cache API `caches.delete(name)` | `indexedDB.deleteDatabase(name)` |
| SW `oninstall` → precache | IDB `onupgradeneeded` → create schema |
| Serwist `ExpirationPlugin` | Manual: walk cursor, delete old records |
| HTTP `Cache-Control` headers | No equivalent — IDB has no automatic expiry |
| SQL `SELECT * WHERE x = 1` | `store.index("x").getAll(1)` |
| SQL compound `WHERE x = 1 AND y = 2` | `index("x").getAll(1)` then filter `y` in memory |
| MongoDB document `{ _id, ...fields }` | IDB record `{ keyPath, ...fields }` |

---

## Quick Reference: The IDB API Surface You'll Actually Use

```
OPEN
  indexedDB.open(name, version) → request
  request.onupgradeneeded → create stores, indexes
  request.onsuccess → db handle

SCHEMA (only in onupgradeneeded)
  db.createObjectStore(name, { keyPath, autoIncrement })
  store.createIndex(name, keyPath, { unique })

READ
  db.transaction(stores, "readonly")
  store.get(key)                    → one record
  store.getAll()                    → all records
  index.get(value)                  → first match
  index.getAll(value)               → all matches
  index.openCursor(range, direction) → iterate

WRITE
  db.transaction(stores, "readwrite")
  store.put(record)                 → upsert (by keyPath)
  store.add(record)                 → insert (throws if exists)
  store.delete(key)                 → remove one
  store.clear()                     → remove all

KEY RANGES (for cursor queries)
  IDBKeyRange.only(value)
  IDBKeyRange.lowerBound(value, open?)
  IDBKeyRange.upperBound(value, open?)
  IDBKeyRange.bound(lower, upper, lowerOpen?, upperOpen?)

LIFECYCLE
  db.close()
  indexedDB.deleteDatabase(name)
```

---

## Summary: Five Things to Internalize

1. **IDB is a structured database, Cache API is a request/response cache.** Different tools for different jobs. Your plan uses both correctly — SW/Serwist for static assets via Cache API, IDB for queryable content data.

2. **Transactions auto-commit when idle.** Never `await` a non-IDB operation inside a transaction. Do your network/computation first, then open a transaction for the IDB write.

3. **One index at a time for queries.** Compound queries = walk one index + filter in memory. Fine for thousands of records, not for millions.

4. **Schema changes only in `onupgradeneeded`.** Plan your stores upfront. Future changes require version bumps with migration logic.

5. **IDB is per-origin, not per-user.** If your app has multiple users on one device, you must scope the database (by name or by keyPath). Your plan currently doesn't — that's the bug.
