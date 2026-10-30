from .state import AgentState

# Shared onboarding graph state (defined in state.py).
OnboardingState = AgentState

TASKS: tuple[tuple[str, str], ...] = (
    ("document_verification", "documents_verified"),
    ("it_provisioning", "it_provisioned"),
    ("training", "training_assigned"),
    ("team_allocation", "team_allocated"),
)

TASK_IDS: tuple[str, ...] = tuple(task_id for task_id, _ in TASKS)


def check_completed_tasks(state: AgentState) -> list:
    """Return task ids whose completion flags are True."""
    return [task_id for task_id, flag in TASKS if bool(state.get(flag))]


def identify_pending_tasks(state: AgentState) -> list:
    """Return task ids that are not yet complete."""
    completed = set(check_completed_tasks(state))
    return [task_id for task_id in TASK_IDS if task_id not in completed]


def identify_pending_approvals(state: AgentState) -> list:
    """Return pending approvals already recorded on shared state."""
    return list(state.get("pending_approvals") or [])


def generate_alerts(state: AgentState) -> list:
    """Build alert messages for incomplete onboarding activities."""
    employee = state.get("employee_name") or state.get("employee_id") or "unknown"
    alerts = [
        f"ALERT: {task_id} is incomplete for {employee}"
        for task_id in identify_pending_tasks(state)
    ]
    for item in identify_pending_approvals(state):
        alerts.append(f"ALERT: pending approval '{item}' for {employee}")
    return alerts


def generate_progress_report(state: AgentState) -> dict:
    """Return a simple onboarding progress report."""
    completed = check_completed_tasks(state)
    pending = identify_pending_tasks(state)
    return {
        "employee_id": state.get("employee_id"),
        "employee_name": state.get("employee_name"),
        "completed_tasks": completed,
        "pending_tasks": pending,
        "pending_approvals": identify_pending_approvals(state),
        "alerts": generate_alerts(state),
        "progress": f"{len(completed)}/{len(TASK_IDS)}",
    }


def monitoring_agent(state: AgentState) -> AgentState:
    """LangGraph node: monitor progress and append alerts to the audit log."""
    report = generate_progress_report(state)
    audit_log = list(state.get("audit_log") or [])
    audit_log.append(f"Monitoring report: {report['progress']} complete")
    audit_log.append(
        f"Completed={report['completed_tasks']} Pending={report['pending_tasks']}"
    )
    audit_log.extend(report["alerts"])
    if not report["alerts"]:
        audit_log.append("Monitoring: onboarding is complete")
    return {**state, "audit_log": audit_log}
