from datetime import datetime

from pydantic import BaseModel, Field


class OnboardingStartRequest(BaseModel):
    employee_id: str = Field(min_length=1)
    employee_name: str = Field(min_length=1)


class MonitoringReport(BaseModel):
    employee_id: str | None
    employee_name: str | None
    completed_tasks: list
    pending_tasks: list
    pending_approvals: list
    alerts: list
    progress: str


class OnboardingStatusResponse(BaseModel):
    employee_id: str
    employee_name: str
    onboarding_status: str
    documents_verified: bool
    it_provisioned: bool
    training_assigned: bool
    team_allocated: bool
    pending_approvals: list
    monitoring: MonitoringReport


class AuditLogItem(BaseModel):
    log_id: int
    employee_id: str
    action: str
    timestamp: datetime


class AuditLogsResponse(BaseModel):
    employee_id: str
    logs: list[AuditLogItem]
