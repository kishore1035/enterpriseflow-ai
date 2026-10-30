from langgraph.graph import END, START, StateGraph

from .document_verification import document_verification_agent
from .it_provisioning import it_provisioning_agent
from .monitoring import monitoring_agent
from .state import AgentState, create_initial_state
from .team_allocation import team_allocation_agent
from .training import training_agent

DOCUMENT_VERIFICATION = "document_verification"
IT_PROVISIONING = "it_provisioning"
TRAINING = "training"
TEAM_ALLOCATION = "team_allocation"
FINALIZE = "finalize"

TASKS: tuple[tuple[str, str], ...] = (
    (DOCUMENT_VERIFICATION, "documents_verified"),
    (IT_PROVISIONING, "it_provisioned"),
    (TRAINING, "training_assigned"),
    (TEAM_ALLOCATION, "team_allocated"),
)

TASK_IDS: tuple[str, ...] = tuple(task_id for task_id, _ in TASKS)


def receive_onboarding(state: AgentState) -> AgentState:
    """Accept employee onboarding information into the shared state."""
    audit_log = list(state.get("audit_log") or [])
    audit_log.append(
        f"Received onboarding for {state.get('employee_name')} "
        f"({state.get('employee_id')})"
    )
    return {**state, "audit_log": audit_log}


def check_onboarding_progress(state: AgentState) -> dict[str, bool]:
    """Return completion flags for each onboarding task."""
    return {task_id: bool(state.get(flag)) for task_id, flag in TASKS}


def identify_incomplete_tasks(state: AgentState) -> list:
    """Return task ids that are not yet complete."""
    progress = check_onboarding_progress(state)
    return [task_id for task_id in TASK_IDS if not progress[task_id]]


def assign_tasks(state: AgentState) -> AgentState:
    """Queue incomplete tasks so they can be routed to agents."""
    incomplete = identify_incomplete_tasks(state)
    audit_log = list(state.get("audit_log") or [])
    if incomplete:
        audit_log.append(f"Assigned tasks: {incomplete}")
    else:
        audit_log.append("No incomplete tasks to assign")
    return {**state, "pending_approvals": incomplete, "audit_log": audit_log}


def track_tasks(state: AgentState) -> AgentState:
    """Record completed vs pending tasks after agents have run."""
    incomplete = identify_incomplete_tasks(state)
    completed = [task_id for task_id in TASK_IDS if task_id not in incomplete]
    audit_log = list(state.get("audit_log") or [])
    audit_log.append(f"Completed tasks: {completed}")
    audit_log.append(f"Pending tasks: {incomplete}")
    return {**state, "pending_approvals": incomplete, "audit_log": audit_log}


def _append_audit(state: AgentState, message: str) -> AgentState:
    audit_log = list(state.get("audit_log") or [])
    audit_log.append(message)
    return {**state, "audit_log": audit_log}


def start_orchestrator(state: AgentState) -> AgentState:
    state = receive_onboarding(state)
    return assign_tasks(state)


def dispatch_next_task(state: AgentState) -> AgentState:
    pending = list(state.get("pending_approvals") or [])
    if not pending:
        return _append_audit(state, "No remaining assigned tasks")
    return _append_audit(state, f"Dispatching {pending[0]}")


def route_assigned_task(state: AgentState) -> str:
    pending = list(state.get("pending_approvals") or [])
    if not pending:
        return FINALIZE
    next_task = pending[0]
    if next_task in TASK_IDS:
        return next_task
    return FINALIZE


def _run_assigned_agent(task_id: str, agent_fn):
    """Run a teammate agent, then consume that assignment so the graph can continue."""

    def node(state: AgentState) -> AgentState:
        updated = agent_fn(state)
        pending = [
            item
            for item in list(updated.get("pending_approvals") or [])
            if item != task_id
        ]
        audit_log = list(updated.get("audit_log") or [])
        audit_log.append(f"Ran {task_id}")
        return {**updated, "pending_approvals": pending, "audit_log": audit_log}

    return node


def build_orchestrator_graph():
    """Compile the onboarding LangGraph. Teammate agents are swappable nodes."""
    workflow = StateGraph(AgentState)

    workflow.add_node("start_orchestrator", start_orchestrator)
    workflow.add_node("dispatch", dispatch_next_task)
    workflow.add_node(
        DOCUMENT_VERIFICATION,
        _run_assigned_agent(DOCUMENT_VERIFICATION, document_verification_agent),
    )
    workflow.add_node(
        IT_PROVISIONING,
        _run_assigned_agent(IT_PROVISIONING, it_provisioning_agent),
    )
    workflow.add_node(TRAINING, _run_assigned_agent(TRAINING, training_agent))
    workflow.add_node(
        TEAM_ALLOCATION,
        _run_assigned_agent(TEAM_ALLOCATION, team_allocation_agent),
    )
    workflow.add_node(FINALIZE, track_tasks)
    workflow.add_node("monitoring", monitoring_agent)

    workflow.add_edge(START, "start_orchestrator")
    workflow.add_edge("start_orchestrator", "dispatch")
    workflow.add_conditional_edges(
        "dispatch",
        route_assigned_task,
        {
            DOCUMENT_VERIFICATION: DOCUMENT_VERIFICATION,
            IT_PROVISIONING: IT_PROVISIONING,
            TRAINING: TRAINING,
            TEAM_ALLOCATION: TEAM_ALLOCATION,
            FINALIZE: FINALIZE,
        },
    )
    workflow.add_edge(DOCUMENT_VERIFICATION, "dispatch")
    workflow.add_edge(IT_PROVISIONING, "dispatch")
    workflow.add_edge(TRAINING, "dispatch")
    workflow.add_edge(TEAM_ALLOCATION, "dispatch")
    workflow.add_edge(FINALIZE, "monitoring")
    workflow.add_edge("monitoring", END)

    return workflow.compile()


def run_onboarding(employee_id: str, employee_name: str) -> AgentState:
    """Entry point: receive employee info and run the orchestrator graph."""
    graph = build_orchestrator_graph()
    initial_state = create_initial_state(employee_id, employee_name)
    return graph.invoke(initial_state)
