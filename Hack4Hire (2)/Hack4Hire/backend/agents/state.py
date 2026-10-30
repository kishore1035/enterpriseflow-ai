from typing import TypedDict


class AgentState(TypedDict):
    """Shared LangGraph state for the employee onboarding workflow."""

    employee_id: str
    employee_name: str
    documents_verified: bool
    it_provisioned: bool
    training_assigned: bool
    team_allocated: bool
    audit_log: list
    pending_approvals: list


def create_initial_state(
    employee_id: str = "",
    employee_name: str = "",
) -> AgentState:
    """Return a complete AgentState with safe defaults."""

    return {
        "employee_id": employee_id,
        "employee_name": employee_name,
        "documents_verified": False,
        "it_provisioned": False,
        "training_assigned": False,
        "team_allocated": False,
        "audit_log": [],
        "pending_approvals": [],
    }
