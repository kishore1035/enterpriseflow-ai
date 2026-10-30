# shared/state.py
from typing import TypedDict

class OnboardingState(TypedDict):
    # Input
    employee_name:    str
    department:       str
    designation:      str
    joining_date:     str
    upload_folder:    str

    # Member 2 - Document Verification
    docs_verified:        bool
    doc_issues:           list
    doc_results:          list

    # Member 2 - Employee Registration
    emp_id:               str
    employee_email:       str
    employee_profile:     dict
    registration_status:  str

    # Member 3 - IT Provisioning
    it_done:              bool
    it_items:             list

    # Member 3 - Team Allocation
    team_assigned:        bool
    manager_name:         str
    team_name:            str

    # Member 4 - Training
    training_done:        bool
    training_resources:   list
    orientation_checklist: list

    # Shared - everyone appends, never overwrites
    audit_log:            list
    pending_approvals:    list
    needs_human_review:   bool


def get_initial_state(employee_name, department, designation,
                      joining_date, upload_folder) -> OnboardingState:
    return OnboardingState(
        employee_name=employee_name,
        department=department,
        designation=designation,
        joining_date=joining_date,
        upload_folder=upload_folder,
        docs_verified=False,
        doc_issues=[],
        doc_results=[],
        emp_id="",
        employee_email="",
        employee_profile={},
        registration_status="",
        it_done=False,
        it_items=[],
        team_assigned=False,
        manager_name="",
        team_name="",
        training_done=False,
        training_resources=[],
        orientation_checklist=[],
        audit_log=[],
        pending_approvals=[],
        needs_human_review=False,
    )
