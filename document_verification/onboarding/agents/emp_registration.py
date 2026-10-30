# agents/emp_registration.py
# Member 2 - Employee Registration Agent

from shared.state import OnboardingState
from datetime import datetime
import uuid


def employee_registration_agent(state: OnboardingState) -> dict:
    """
    Member 2 - Employee Registration Agent
    Reads:  docs_verified, employee_name, department, designation, joining_date
    Writes: emp_id, employee_email, employee_profile,
            registration_status, audit_log, pending_approvals
    """
    print("\n[Employee Registration Agent] Starting...")

    audit_log = list(state.get("audit_log", []))
    pending   = list(state.get("pending_approvals", []))

    # Only run if documents are verified
    if not state.get("docs_verified"):
        print("  [SKIPPED] Documents not verified yet")
        audit_log.append({
            "agent":     "Employee Registration Agent",
            "action":    "Skipped - docs_verified is False",
            "status":    "skipped",
            "timestamp": datetime.now().isoformat(),
        })
        return {**state, "audit_log": audit_log}

    # Generate Employee ID
    year       = datetime.now().year
    unique_num = str(uuid.uuid4().int)[:4]
    emp_id     = f"EMP-{year}-{unique_num}"

    # Build email
    email_local = state["employee_name"].lower().replace(" ", ".")
    emp_email   = f"{email_local}@company.com"

    # Build profile
    profile = {
        "emp_id":       emp_id,
        "full_name":    state["employee_name"],
        "department":   state["department"],
        "designation":  state["designation"],
        "joining_date": state["joining_date"],
        "email":        emp_email,
        "status":       "pending_approval",
    }

    print(f"  [CREATED]  Employee ID : {emp_id}")
    print(f"  [EMAIL]    Email       : {emp_email}")
    print(f"  [WAITING]  HR approval required before activating")

    pending.append({
        "agent":    "Employee Registration Agent",
        "message":  (f"Approve new employee:\n"
                     f"  Name : {profile['full_name']}\n"
                     f"  ID   : {emp_id}\n"
                     f"  Dept : {profile['department']}\n"
                     f"  Role : {profile['designation']}"),
        "approved": False,
    })

    audit_log.append({
        "agent":     "Employee Registration Agent",
        "action":    f"Created draft profile {emp_id} - awaiting HR approval",
        "status":    "pending_hr_approval",
        "timestamp": datetime.now().isoformat(),
    })

    return {
        **state,
        "emp_id":              emp_id,
        "employee_email":      emp_email,
        "employee_profile":    profile,
        "registration_status": "pending_approval",
        "audit_log":           audit_log,
        "pending_approvals":   pending,
    }


def hr_approval_agent(state: OnboardingState) -> dict:
    """Called after HR clicks Approve in dashboard"""
    print("\n[HR Approval Agent] Activating employee...")

    audit_log = list(state.get("audit_log", []))
    profile   = dict(state.get("employee_profile", {}))
    profile["status"] = "active"

    audit_log.append({
        "agent":     "HR Approval Agent",
        "action":    f"{state['emp_id']} approved - status set to ACTIVE",
        "status":    "active",
        "timestamp": datetime.now().isoformat(),
    })

    print(f"  [ACTIVE] {state['emp_id']} is now ACTIVE - parallel agents can start!")

    return {
        **state,
        "employee_profile":    profile,
        "registration_status": "active",
        "audit_log":           audit_log,
    }