import sys
import os

# Ensure Python finds shared/, agents/, utils/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env for GEMINI_API_KEY
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from shared.state import get_initial_state
from agents.doc_verification import document_verification_agent
from agents.emp_registration  import employee_registration_agent, hr_approval_agent


def run_member2_flow():
    print("=" * 60)
    print("  MEMBER 2 - Document & Registration Agent Test")
    print("=" * 60)

    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key and api_key != "your_gemini_api_key_here":
        print("  [LLM] Gemini API key found - using AI extraction")
    else:
        print("  [LLM] No API key - using rule-based fallback")
    print()

    # ── Initial state ──────────────────────────────────────────
    state = get_initial_state(
        employee_name="John Doe",
        department="Engineering",
        designation="Software Engineer",
        joining_date="2024-11-01",
        upload_folder=os.path.join(os.path.dirname(__file__), "uploads", "test_docs"),
    )

    # ── Agent 1: Document Verification ────────────────────────
    state = document_verification_agent(state)

    print(f"\n  docs_verified     : {state['docs_verified']}")
    print(f"  doc_issues        : {state['doc_issues']}")
    print(f"  needs_human_review: {state['needs_human_review']}")

    # ── Agent 2: Employee Registration ────────────────────────
    state = employee_registration_agent(state)

    print(f"\n  emp_id            : {state['emp_id']}")
    print(f"  employee_email    : {state['employee_email']}")
    print(f"  registration      : {state['registration_status']}")

    # ── HR Approval (simulated) ────────────────────────────────
    if state["emp_id"]:
        print("\n  [Simulating HR clicks Approve...]")
        state = hr_approval_agent(state)
        print(f"\n  registration      : {state['registration_status']}")

    # ── Document results ───────────────────────────────────────
    print("\n" + "=" * 60)
    print("  DOCUMENT RESULTS")
    print("=" * 60)
    for doc in state["doc_results"]:
        tag = "(Gemini)" if doc.get("llm_used") else "(rules)"
        print(f"\n  {doc['document']}")
        print(f"    Type       : {doc.get('document_type','Unknown')} {tag}")
        print(f"    Name Found : {doc.get('extracted_name','None')}")
        print(f"    Name Match : {doc['name_match']}")
        print(f"    Confidence : {doc.get('confidence','N/A')}")
        if doc["issues"]:
            print(f"    Issues     : {doc['issues']}")

    # ── Audit log ──────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  AUDIT LOG")
    print("=" * 60)
    for i, entry in enumerate(state["audit_log"], 1):
        print(f"  {i}. [{entry['status'].upper()}] {entry['agent']}")
        print(f"      -> {entry['action']}")

   
    print("=" * 60)


if __name__ == "__main__":
    run_member2_flow()