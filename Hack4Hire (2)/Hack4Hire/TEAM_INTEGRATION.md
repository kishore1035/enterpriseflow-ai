# Team Integration Guide

This document explains how teammates connect their agents to the shared LangGraph backend **without changing each other's code**.

Work in your own agent file (or your own branch). Keep function names and the shared state fields unchanged.

---

## 1. Shared state

All agents use the same state:

`backend/agents/state.py`

```python
from backend.agents.state import AgentState, create_initial_state
```

Fields (do not rename or change types without team agreement):

| Field | Type |
|---|---|
| `employee_id` | `str` |
| `employee_name` | `str` |
| `documents_verified` | `bool` |
| `it_provisioned` | `bool` |
| `training_assigned` | `bool` |
| `team_allocated` | `bool` |
| `audit_log` | `list` |
| `pending_approvals` | `list` |

Your agent reads this dict, updates only the fields it owns, and returns the full state.

---

## 2. Agent interface

Every agent must accept the shared state and return updated state:

```python
from backend.agents.state import AgentState

def your_agent(state: AgentState) -> AgentState:
    # read state["employee_id"], update your flags, return state
    return state
```

Rules:

- Input: `AgentState`
- Output: `AgentState`
- Do not replace the whole state with a new shape
- Copy lists before appending (`audit_log`, `pending_approvals`) so other agents are not affected unexpectedly

Example:

```python
def document_verification_agent(state: AgentState) -> AgentState:
    audit_log = list(state.get("audit_log") or [])
    audit_log.append("Documents verified")
    return {
        **state,
        "documents_verified": True,
        "audit_log": audit_log,
    }
```

When your task is done, set the matching flag:

- Document Verification → `documents_verified = True`
- IT Provisioning → `it_provisioned = True`
- Training → `training_assigned = True`
- Team Allocation → `team_allocated = True`

---

## 3. Agent registration

The Orchestrator already imports these functions. **Keep the names and files.** Replace the placeholder body in your file only.

| Agent | File | Function to keep |
|---|---|---|
| Document Verification | `backend/agents/document_verification.py` | `document_verification_agent` |
| IT Provisioning | `backend/agents/it_provisioning.py` | `it_provisioning_agent` |
| Training | `backend/agents/training.py` | `training_agent` |
| Team Allocation | `backend/agents/team_allocation.py` | `team_allocation_agent` |

You do not register a class or plugin. A plain function with that name is enough. The graph in `backend/agents/orchestrator.py` already calls it.

If you need helper modules, put them next to your agent file, for example:

```text
backend/agents/document_verification.py      # required function stays here
backend/agents/document_helpers.py           # optional, your code only
```

Do not edit other people's agent files.

---

## 4. Database

Use the shared SQLAlchemy models and connection. Do not create a second engine or duplicate tables.

```python
from backend.db import Employee, OnboardingTask, AuditLog, SessionLocal, init_db
```

- Config: `backend/config.py` (reads `.env`)
- Models: `backend/db/models.py`
- Session: `backend/db/session.py`
- Example env: `.env.example` → copy to `.env` (never commit `.env`)

Create a session, use it, close it:

```python
session = SessionLocal()
try:
    employee = session.get(Employee, state["employee_id"])
    session.commit()
finally:
    session.close()
```

Shared tables:

- `employees` — `employee_id`, `employee_name`, `onboarding_status`
- `onboarding_tasks` — `task_id`, `employee_id`, `task_name`, `status`
- `audit_logs` — `log_id`, `employee_id`, `action`, `timestamp`

`employee_id` on tasks and logs must match an existing employee row. The API creates the employee when onboarding starts.

---

## 5. Audit logging

All agents should record work with:

```python
from backend.services.audit import log_activity

log_activity(state["employee_id"], "Task update: document_verification -> completed")
```

Use this for:

- onboarding activities
- task updates
- completed / pending notes

Timestamps are stored in PostgreSQL. You can also append a short message to `state["audit_log"]` for the in-graph trail, then still call `log_activity()` so it is saved in the database.

---

## 6. GitHub collaboration

To avoid merge conflicts:

- Each person works in **their own agent file** (and optional helper files they own)
- Use a **separate branch** per member, for example:
  - `member-docs`
  - `member-it`
  - `member-training`
  - `member-team`
- Do not rewrite `backend/agents/state.py`, `backend/agents/orchestrator.py`, `backend/db/`, or `backend/services/audit.py` unless the team agrees
- Pull `main` often and merge only your files

Suggested ownership:

| Area | Owner |
|---|---|
| FastAPI, LangGraph, Orchestrator, Monitoring, DB, audit | Member 1 |
| `document_verification.py` | Document teammate |
| `it_provisioning.py` | IT teammate |
| `training.py` | Training teammate |
| `team_allocation.py` | Team-allocation teammate |

---

## 7. How an agent connects to the Orchestrator

The workflow is already wired:

`POST /onboarding/start` → `run_onboarding()` → Orchestrator → your agent (if the task is pending) → Monitoring → PostgreSQL

You connect by implementing your function in the file listed above. No extra registration step.

Flow:

1. Orchestrator reads shared `AgentState` and queues incomplete tasks in `pending_approvals`
2. It imports and calls your function, for example `document_verification_agent(state)`
3. Your function updates flags / lists and returns `AgentState`
4. Monitoring reads the same state and writes alerts into `audit_log`
5. The API saves task status and logs to PostgreSQL

What you should do:

1. Open your placeholder file
2. Implement `your_agent(state) -> state`
3. Set your completion flag when the work succeeds
4. Call `log_activity(employee_id, action)`
5. Leave other flags and other agent files alone

What you should not do:

- Change shared state field names
- Rename the exported agent function
- Copy Orchestrator or Monitoring logic into your agent
- Point at a private database

Local check after your function exists:

```python
from backend.agents.orchestrator import run_onboarding

final_state = run_onboarding("E001", "Ada Lovelace")
print(final_state)
```

Or start the API and call `POST /onboarding/start`.
