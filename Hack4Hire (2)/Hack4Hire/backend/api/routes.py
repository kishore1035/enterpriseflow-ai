from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from ..agents.monitoring import TASKS, generate_progress_report
from ..agents.orchestrator import TASK_IDS, run_onboarding
from ..agents.state import AgentState
from ..db.models import AuditLog, Employee, OnboardingTask
from ..db.session import SessionLocal
from ..schemas import (
    AuditLogItem,
    AuditLogsResponse,
    MonitoringReport,
    OnboardingStartRequest,
    OnboardingStatusResponse,
)
from ..services.audit import log_activity

router = APIRouter()

TASK_FLAGS = dict(TASKS)


def _ensure_employee(employee_id: str, employee_name: str) -> None:
    session = SessionLocal()
    try:
        employee = session.get(Employee, employee_id)
        if employee is None:
            session.add(
                Employee(
                    employee_id=employee_id,
                    employee_name=employee_name,
                    onboarding_status="in_progress",
                )
            )
            session.flush()
            for task_name in TASK_IDS:
                session.add(
                    OnboardingTask(
                        employee_id=employee_id,
                        task_name=task_name,
                        status="pending",
                    )
                )
        else:
            employee.employee_name = employee_name
            employee.onboarding_status = "in_progress"
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def _save_graph_result(state: AgentState) -> None:
    session = SessionLocal()
    try:
        employee = session.get(Employee, state["employee_id"])
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")

        completed = all(bool(state.get(flag)) for _, flag in TASKS)
        employee.onboarding_status = "completed" if completed else "in_progress"

        tasks = session.scalars(
            select(OnboardingTask).where(OnboardingTask.employee_id == state["employee_id"])
        ).all()
        for task in tasks:
            flag = TASK_FLAGS.get(task.task_name)
            if flag:
                task.status = "completed" if state.get(flag) else "pending"
        session.commit()
    except HTTPException:
        session.rollback()
        raise
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

    for action in state.get("audit_log") or []:
        log_activity(state["employee_id"], str(action))


def _state_from_db(employee: Employee, tasks: list[OnboardingTask]) -> AgentState:
    flags = {task.task_name: task.status == "completed" for task in tasks}
    pending = [task.task_name for task in tasks if task.status != "completed"]
    return {
        "employee_id": employee.employee_id,
        "employee_name": employee.employee_name,
        "documents_verified": flags.get("document_verification", False),
        "it_provisioned": flags.get("it_provisioning", False),
        "training_assigned": flags.get("training", False),
        "team_allocated": flags.get("team_allocation", False),
        "audit_log": [],
        "pending_approvals": pending,
    }


def _status_response(employee: Employee, tasks: list[OnboardingTask]) -> OnboardingStatusResponse:
    state = _state_from_db(employee, tasks)
    report = generate_progress_report(state)
    return OnboardingStatusResponse(
        employee_id=employee.employee_id,
        employee_name=employee.employee_name,
        onboarding_status=employee.onboarding_status,
        documents_verified=state["documents_verified"],
        it_provisioned=state["it_provisioned"],
        training_assigned=state["training_assigned"],
        team_allocated=state["team_allocated"],
        pending_approvals=state["pending_approvals"],
        monitoring=MonitoringReport.model_validate(report),
    )


@router.post("/onboarding/start", response_model=OnboardingStatusResponse)
def start_onboarding(payload: OnboardingStartRequest) -> OnboardingStatusResponse:
    _ensure_employee(payload.employee_id, payload.employee_name)
    log_activity(payload.employee_id, "Onboarding started")

    final_state = run_onboarding(payload.employee_id, payload.employee_name)
    _save_graph_result(final_state)

    session = SessionLocal()
    try:
        employee = session.get(Employee, payload.employee_id)
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")
        tasks = session.scalars(
            select(OnboardingTask).where(OnboardingTask.employee_id == payload.employee_id)
        ).all()
        return _status_response(employee, list(tasks))
    finally:
        session.close()


@router.get("/onboarding/{employee_id}/status", response_model=OnboardingStatusResponse)
def get_onboarding_status(employee_id: str) -> OnboardingStatusResponse:
    session = SessionLocal()
    try:
        employee = session.get(Employee, employee_id)
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")
        tasks = session.scalars(
            select(OnboardingTask).where(OnboardingTask.employee_id == employee_id)
        ).all()
        return _status_response(employee, list(tasks))
    finally:
        session.close()


@router.get("/onboarding/{employee_id}/logs", response_model=AuditLogsResponse)
def get_onboarding_logs(employee_id: str) -> AuditLogsResponse:
    session = SessionLocal()
    try:
        employee = session.get(Employee, employee_id)
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")
        logs = session.scalars(
            select(AuditLog)
            .where(AuditLog.employee_id == employee_id)
            .order_by(AuditLog.timestamp.asc())
        ).all()
        return AuditLogsResponse(
            employee_id=employee_id,
            logs=[
                AuditLogItem(
                    log_id=entry.log_id,
                    employee_id=entry.employee_id,
                    action=entry.action,
                    timestamp=entry.timestamp,
                )
                for entry in logs
            ],
        )
    finally:
        session.close()
