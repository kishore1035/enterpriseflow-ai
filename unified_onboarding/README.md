# EnterpriseFlow AI — Unified Multi-Agent Employee Onboarding Platform

EnterpriseFlow AI unifies four disparate modules into a cohesive, production-ready, full-stack multi-agent system powered by **FastAPI**, **LangGraph**, **PyMuPDF**, and **React (Vite)**.

---

## 🏗️ Architectural Overview & Integration Mapping

This project consolidates all features from the 4 team folders:

| Original Folder | Contributor Focus | Integrated Unified Role |
| :--- | :--- | :--- |
| **`Hack4Hire (2)`** | Member 1: Orchestration & DB | **Supervisor Orchestrator & State Management** (`backend/agents/orchestrator.py`, `backend/agents/state.py`, `backend/db/models.py`) |
| **`document_verification`** | Member 2: KYC & OCR Agents | **Document Verification & Registration Agent** (`backend/agents/document_verification.py`, PyMuPDF OCR + Gemini LLM fallback) |
| **`It_team_training-main`** | Member 3: Systems, Teams & HITL | **IT Provisioning & Team Allocation Agents** (`backend/agents/it_provisioning.py`, `backend/agents/team_allocation.py`, Human-in-the-Loop gates) |
| **`aiflow`** | Member 4: Frontend & Training | **Unified Web Dashboard & Training Agent** (`backend/agents/training.py`, React 19 + Lucide UI in `frontend/`) |

---

## 🌟 Key Features

1. **Autonomous LangGraph Orchestrator**:
   - Manages shared `AgentState` across all worker agents.
   - Sequential pipeline routing: Initialized &rarr; Document Verification &rarr; IT Provisioning &rarr; Team Allocation &rarr; Training &rarr; Finalize & Monitoring.
   - Real-time audit trails written to database on every agent action.

2. **Multimodal Document Verification Agent**:
   - Automated text extraction on candidate documents (Aadhaar, Degree, Offer Letter, Bank Details) using PyMuPDF.
   - Intelligent name-matching, confidence scoring, and issue detection with Gemini LLM + resilient rule-based fallback.
   - Drag-and-drop document upload portal.

3. **IT Systems & Hardware Provisioning Agent**:
   - Automated corporate email provisioning (`firstname.lastname@enterpriseflow.ai`).
   - Hardware procurement ticket generation tailored to department (MacBook Pro M3, Dell XPS, HP EliteBook, monitors, accessories).
   - Department software bundle provisioning (Slack Pro, GitHub Enterprise, Jira, Confluence, Figma, Tailscale VPN, AWS, SAP).
   - Generates Master IT Tickets and ServiceNow tracking IDs.

4. **Team & Hierarchy Allocation Agent**:
   - Department, team, and seat/desk assignment (e.g. 3rd Floor East Wing).
   - Reporting manager & peer buddy pairing with automated introduction notifications.
   - Department Slack channel auto-joining (`#engineering`, `#design`, `#finance`, etc.).
   - Day 1 personalized schedule with calendar invites and 1-on-1 manager block.

5. **Training & Orientation Agent**:
   - Day 1 checklist with interactive status tracking (Pending &rarr; In progress &rarr; Completed).
   - Department-specific LMS course catalog.

6. **Human-in-the-Loop (HITL) Approval Queue**:
   - Dedicated supervisor queue for IT Access Sign-Off, Manager Team Confirmations, and HR Document Reviews.
   - Interactive review checklists with one-click **Approve** and **Reject** buttons and audit notes.

7. **Unified React Dashboard**:
   - **Dashboard**: High-level telemetry, active worker cards, progress table.
   - **Live Pipeline**: Interactive step-by-step visual runner with live agent console logs.
   - **Employees Directory**: Complete directory with profile inspection.
   - **Document Verification Hub**: Document inspection, OCR previews, and PDF upload dropzone.
   - **IT & Hardware Assets**: Equipment specs and software licenses.
   - **Training**: Interactive Day 1 checklist.
   - **Audit Logs**: Filterable timeline of all agent decisions.

---

## 🚀 How to Run

### Option 1: One-Click Launcher (Recommended)
Simply double-click:
```bat
start_unified_app.bat
```
This activates the pre-configured virtual environment and launches both the backend and web UI.

### Option 2: Command Line

#### 1. Start the Unified Server (serves API and Web UI on port 8000)
```powershell
cd unified_onboarding
.\.venv\Scripts\activate
python run_app.py
```
Open your browser at:
- **Web Application**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

#### 2. (Optional) Run Frontend in Vite Dev Mode
```powershell
cd unified_onboarding\frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). Requests to `/api` are automatically proxied to the backend on `8000`.

---

## 🧪 Testing

To test the multi-agent graph directly via python:
```powershell
.\.venv\Scripts\python.exe -c "from backend.agents.orchestrator import run_onboarding; res = run_onboarding('EMP-2024-001', 'Arjun Mehta'); print('Completed successfully!')"
```
