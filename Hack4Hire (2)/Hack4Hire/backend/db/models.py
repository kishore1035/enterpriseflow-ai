from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Employee(Base):
    __tablename__ = "employees"

    employee_id: Mapped[str] = mapped_column(String, primary_key=True)
    employee_name: Mapped[str] = mapped_column(String, nullable=False)
    onboarding_status: Mapped[str] = mapped_column(String, nullable=False, default="pending")

    tasks: Mapped[list["OnboardingTask"]] = relationship(back_populates="employee")
    audit_logs: Mapped[list["AuditLog"]] = relationship(back_populates="employee")


class OnboardingTask(Base):
    __tablename__ = "onboarding_tasks"

    task_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    employee_id: Mapped[str] = mapped_column(ForeignKey("employees.employee_id"), nullable=False)
    task_name: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="pending")

    employee: Mapped[Employee] = relationship(back_populates="tasks")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    employee_id: Mapped[str] = mapped_column(ForeignKey("employees.employee_id"), nullable=False)
    action: Mapped[str] = mapped_column(String, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    employee: Mapped[Employee] = relationship(back_populates="audit_logs")
