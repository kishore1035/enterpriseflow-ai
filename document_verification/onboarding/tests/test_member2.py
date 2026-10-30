# tests/test_member2.py
# Run with: pytest tests/test_member2.py -v

import pytest
from shared.state import get_initial_state
from agents.doc_verification import document_verification_agent
from agents.emp_registration import employee_registration_agent, hr_approval_agent

BASE_STATE = get_initial_state(
    employee_name="John Doe",
    department="Engineering",
    designation="Software Engineer",
    joining_date="2024-11-01",
    upload_folder="./uploads/test_docs",
)

def test_doc_verification_no_docs():
    """No documents uploaded → docs_verified should be False"""
    state = document_verification_agent(BASE_STATE)
    assert state["docs_verified"] == False
    assert len(state["doc_issues"]) > 0
    assert state["needs_human_review"] == True

def test_registration_skips_if_docs_not_verified():
    """Registration should skip if docs_verified is False"""
    state = {**BASE_STATE, "docs_verified": False}
    result = employee_registration_agent(state)
    assert result["emp_id"] == ""
    assert result["registration_status"] == ""

def test_registration_creates_emp_id():
    """Registration creates EMP ID when docs are verified"""
    state = {**BASE_STATE, "docs_verified": True}
    result = employee_registration_agent(state)
    assert result["emp_id"].startswith("EMP-")
    assert "@company.com" in result["employee_email"]
    assert result["registration_status"] == "pending_approval"

def test_hr_approval_activates_employee():
    """HR approval sets status to active"""
    state = {**BASE_STATE, "docs_verified": True}
    state = employee_registration_agent(state)
    state = hr_approval_agent(state)
    assert state["registration_status"] == "active"
    assert state["employee_profile"]["status"] == "active"

def test_audit_log_grows():
    """Audit log should have one entry per agent"""
    state = {**BASE_STATE, "docs_verified": True}
    state = employee_registration_agent(state)
    state = hr_approval_agent(state)
    assert len(state["audit_log"]) == 2