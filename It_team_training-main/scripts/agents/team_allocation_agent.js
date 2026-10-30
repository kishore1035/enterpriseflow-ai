// ========================================================
// TEAM ALLOCATION AGENT — Department & Manager Assignment
// ========================================================
// Responsibilities:
//   1. Assign department & team
//   2. Assign reporting manager
//   3. Share team contact info & buddy
//   4. Create Day 1 task list
//   5. PAUSE → Manager must confirm assignment  ⚠️ Human-in-the-Loop

import { MockHRMS, MockSlackAPI, MockCalendarAPI } from '../api/mock_apis.js';

// ── Status constants ─────────────────────────────────────
export const TEAM_STATUS = {
  IDLE:             'idle',
  ALLOCATING:       'allocating',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED:         'approved',
  REJECTED:         'rejected',
  COMPLETE:         'complete',
  ERROR:            'error',
};

// ── Day 1 Task Templates per Department ─────────────────
const DAY1_TASK_TEMPLATES = {
  Engineering: [
    { id: 't1', task: 'Attend Dev Team Standup (9:00 AM)',           priority: 'high',   type: 'meeting'  },
    { id: 't2', task: 'Set up local dev environment',                priority: 'high',   type: 'setup'    },
    { id: 't3', task: 'Clone primary repositories from GitHub',      priority: 'high',   type: 'setup'    },
    { id: 't4', task: 'Read Architecture Decision Records (ADRs)',   priority: 'medium', type: 'learning' },
    { id: 't5', task: 'Meet your buddy for codebase walkthrough',   priority: 'high',   type: 'meeting'  },
    { id: 't6', task: 'Complete Security & Compliance training',     priority: 'high',   type: 'training' },
    { id: 't7', task: 'Join #engineering and #platform Slack channels', priority: 'medium', type: 'setup' },
    { id: 't8', task: '1-on-1 with Engineering Manager (3:00 PM)',  priority: 'high',   type: 'meeting'  },
  ],
  Design: [
    { id: 't1', task: 'Attend Design Sync (10:00 AM)',               priority: 'high',   type: 'meeting'  },
    { id: 't2', task: 'Access Figma and explore Design System',      priority: 'high',   type: 'setup'    },
    { id: 't3', task: 'Review Brand Guidelines document',            priority: 'medium', type: 'learning' },
    { id: 't4', task: 'Meet Design buddy for tool walkthrough',      priority: 'high',   type: 'meeting'  },
    { id: 't5', task: 'Complete Design Onboarding 101 course',       priority: 'high',   type: 'training' },
    { id: 't6', task: 'Join #design and #product Slack channels',    priority: 'medium', type: 'setup'    },
    { id: 't7', task: '1-on-1 with Design Lead (4:00 PM)',          priority: 'high',   type: 'meeting'  },
  ],
  Finance: [
    { id: 't1', task: 'Attend Finance Team Briefing (9:30 AM)',      priority: 'high',   type: 'meeting'  },
    { id: 't2', task: 'Set up ERP system access (SAP/Zoho)',         priority: 'high',   type: 'setup'    },
    { id: 't3', task: 'Review Q4 Financial Reports',                 priority: 'medium', type: 'learning' },
    { id: 't4', task: 'Complete Compliance & Audit Basics course',   priority: 'high',   type: 'training' },
    { id: 't5', task: 'Meet Finance buddy for process walkthrough',  priority: 'high',   type: 'meeting'  },
    { id: 't6', task: 'Join #finance and #accounting Slack channels',priority: 'medium', type: 'setup'    },
    { id: 't7', task: '1-on-1 with Finance Manager (3:30 PM)',       priority: 'high',   type: 'meeting'  },
  ],
  'Human Resources': [
    { id: 't1', task: 'Attend HR All-Hands (9:00 AM)',               priority: 'high',   type: 'meeting'  },
    { id: 't2', task: 'Access HRMS and explore employee portal',     priority: 'high',   type: 'setup'    },
    { id: 't3', task: 'Review HR Policies & Employee Handbook',      priority: 'high',   type: 'learning' },
    { id: 't4', task: 'Complete Labor Law Compliance course',        priority: 'high',   type: 'training' },
    { id: 't5', task: 'Meet HR buddy for systems walkthrough',       priority: 'high',   type: 'meeting'  },
    { id: 't6', task: 'Join #hr-team and #people-ops Slack channels',priority: 'medium', type: 'setup'    },
    { id: 't7', task: '1-on-1 with HR Lead (4:00 PM)',               priority: 'high',   type: 'meeting'  },
  ],
  Sales: [
    { id: 't1', task: 'Attend Sales Kick-off Call (8:30 AM)',        priority: 'high',   type: 'meeting'  },
    { id: 't2', task: 'Set up CRM access (Salesforce/HubSpot)',      priority: 'high',   type: 'setup'    },
    { id: 't3', task: 'Study Product Catalog & Pricing Guide',       priority: 'high',   type: 'learning' },
    { id: 't4', task: 'Complete Sales Playbook & CRM training',      priority: 'high',   type: 'training' },
    { id: 't5', task: 'Shadow a senior Sales call',                  priority: 'high',   type: 'meeting'  },
    { id: 't6', task: 'Join #sales and #enterprise-sales Slack',     priority: 'medium', type: 'setup'    },
    { id: 't7', task: '1-on-1 with Sales Manager (3:00 PM)',         priority: 'high',   type: 'meeting'  },
  ],
  _default: [
    { id: 't1', task: 'Attend company-wide Orientation (9:00 AM)',   priority: 'high',   type: 'meeting'  },
    { id: 't2', task: 'Complete account setup & tool access',        priority: 'high',   type: 'setup'    },
    { id: 't3', task: 'Review Company Values & Culture deck',        priority: 'medium', type: 'learning' },
    { id: 't4', task: 'Complete mandatory compliance training',      priority: 'high',   type: 'training' },
    { id: 't5', task: 'Meet team buddy for department tour',         priority: 'high',   type: 'meeting'  },
    { id: 't6', task: 'Join relevant Slack channels',               priority: 'medium', type: 'setup'    },
    { id: 't7', task: '1-on-1 with your Manager (4:00 PM)',          priority: 'high',   type: 'meeting'  },
  ],
};

// ── Team Allocation Agent ────────────────────────────────
export class TeamAllocationAgent extends EventTarget {
  constructor() {
    super();
    this.status   = TEAM_STATUS.IDLE;
    this.employee = null;
    this.results  = {};
  }

  // ── Internal helpers ────────────────────────────────────
  log(message, type = 'info') {
    this.dispatchEvent(new CustomEvent('log', {
      detail: { message, type, agent: 'team', timestamp: new Date() }
    }));
  }

  emit(event, detail = {}) {
    this.dispatchEvent(new CustomEvent(event, { detail }));
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setStatus(status) {
    this.status = status;
    this.emit('statusChange', { status });
  }

  // ── Step 1 — Assign Department & Team ───────────────────
  async assignDepartmentAndTeam(employee) {
    this.log(`🏢 Assigning department & team for ${employee.name}...`, 'task');
    await this.delay(500);

    const assignment = await MockHRMS.assignTeam({
      employeeId:  employee.id,
      department:  employee.department,
      team:        employee.team,
      role:        employee.role,
      location:    employee.location,
      joiningDate: employee.joiningDate,
    });

    this.results.team = assignment;
    this.log(`  ↳ Department: ${employee.department}`, 'success');
    this.log(`  ↳ Team: ${employee.team}`, 'success');
    this.log(`  ↳ Seat / Desk allocation: ${assignment.desk}`, 'info');
    await this.delay(400);
    return assignment;
  }

  // ── Step 2 — Assign Manager ─────────────────────────────
  async assignManager(employee) {
    this.log(`👤 Assigning reporting manager...`, 'task');
    await this.delay(500);

    const managerInfo = await MockHRMS.getManagerInfo(employee.manager, employee.department);

    this.results.manager = managerInfo;
    this.log(`  ↳ Reporting Manager: ${managerInfo.name}`, 'success');
    this.log(`  ↳ Manager Email: ${managerInfo.email}`, 'info');
    this.log(`  ↳ Manager notified via email & Slack`, 'info');
    await this.delay(400);
    return managerInfo;
  }

  // ── Step 3 — Share Team Contacts & Buddy ────────────────
  async shareTeamContacts(employee) {
    this.log(`📋 Compiling team contact info & assigning buddy...`, 'task');
    await this.delay(400);

    const teamContacts = await MockHRMS.getTeamContacts(employee.department, employee.team);
    const buddyInfo    = await MockHRMS.getBuddyInfo(employee.buddy, employee.department);

    // Add to Slack workspace / channels
    const slackResult = await MockSlackAPI.addToChannels({
      email:      employee.email,
      name:       employee.name,
      department: employee.department,
      channels:   teamContacts.slackChannels,
    });

    this.results.contacts    = teamContacts;
    this.results.buddy       = buddyInfo;
    this.results.slackResult = slackResult;

    this.log(`  ↳ Buddy assigned: ${buddyInfo.name} (${buddyInfo.role})`, 'success');
    this.log(`  ↳ Buddy introduction email sent`, 'info');
    this.log(`  ↳ Added to ${slackResult.channelsJoined.length} Slack channels`, 'success');
    this.log(`  ↳ Team directory shared via email`, 'info');
    await this.delay(300);
    return { teamContacts, buddyInfo, slackResult };
  }

  // ── Step 4 — Create Day 1 Task List ─────────────────────
  async createDay1TaskList(employee) {
    this.log(`📝 Generating Day 1 task list...`, 'task');
    await this.delay(400);

    const taskTemplate = DAY1_TASK_TEMPLATES[employee.department] || DAY1_TASK_TEMPLATES['_default'];

    // Personalize tasks
    const tasks = taskTemplate.map((t, idx) => ({
      ...t,
      id:         `${employee.id}-d1-${idx + 1}`,
      assignee:   employee.name,
      date:       employee.joiningDate,
      completed:  false,
    }));

    // Schedule Day 1 calendar events
    const calendarResult = await MockCalendarAPI.scheduleDay1Events({
      employee,
      manager:  this.results.manager,
      buddy:    this.results.buddy,
      tasks:    tasks.filter(t => t.type === 'meeting'),
    });

    this.results.day1Tasks      = tasks;
    this.results.calendarEvents = calendarResult;

    this.log(`  ↳ ${tasks.length} Day 1 tasks created`, 'success');
    this.log(`  ↳ ${calendarResult.eventsCreated} calendar events scheduled`, 'info');
    this.log(`  ↳ Task list emailed to ${employee.name} & ${this.results.manager?.name}`, 'info');
    await this.delay(400);
    return { tasks, calendarResult };
  }

  // ── Step 5 — Pause for Manager Confirmation ─────────────
  async pauseForManagerApproval(employee) {
    this.log(`📨 Sending team assignment summary to manager for confirmation...`, 'task');
    await this.delay(500);

    this.setStatus(TEAM_STATUS.PENDING_APPROVAL);
    this.log(`⚠️  HUMAN GATE: Manager must confirm team assignment`, 'gate');
    this.log(`🔴 Agent paused — waiting for ${this.results.manager?.name || 'Manager'} approval...`, 'warning');

    this.emit('approvalRequired', {
      employee,
      manager:    this.results.manager,
      team:       this.results.team,
      buddy:      this.results.buddy,
      day1Tasks:  this.results.day1Tasks,
      checklist:  this.buildManagerChecklist(employee),
    });

    return new Promise(resolve => {
      const handler = (e) => {
        this.removeEventListener('approvalDecision', handler);
        resolve(e.detail);
      };
      this.addEventListener('approvalDecision', handler);
    });
  }

  // ── Handle Manager Approval ─────────────────────────────
  async handleManagerApproval({ approved, approver, notes }) {
    if (approved) {
      this.setStatus(TEAM_STATUS.APPROVED);
      this.log(`✅ Team Assignment APPROVED by ${approver}${notes ? ' — ' + notes : ''}`, 'success');
      this.log(`▶️  Finalizing team allocation...`, 'info');
      await this.delay(600);

      // Finalize in HRMS
      await MockHRMS.finalizeAllocation({
        employeeId: this.employee.id,
        teamId:     this.results.team?.teamId,
        managerId:  this.results.manager?.id,
        day1Tasks:  this.results.day1Tasks,
      });

      this.log(`  ↳ HRMS employee record updated with team & manager`, 'success');
      this.log(`  ↳ Org chart updated`, 'info');
      this.log(`  ↳ Welcome message sent to team Slack channel`, 'success');
      await this.delay(400);

      this.setStatus(TEAM_STATUS.COMPLETE);
      this.log(`🎉 Team Allocation COMPLETE for ${this.employee?.name}`, 'complete');
      this.emit('allocationComplete', { employee: this.employee, results: this.results });
    } else {
      this.setStatus(TEAM_STATUS.REJECTED);
      this.log(`❌ Team Assignment REJECTED by ${approver}${notes ? ' — ' + notes : ''}`, 'error');
      this.log(`🔄 Requesting re-allocation based on manager feedback...`, 'warning');
      await this.delay(700);
      this.log(`📤 Re-assigning team and regenerating task list...`, 'info');
      await this.delay(500);
      this.setStatus(TEAM_STATUS.COMPLETE);
      this.log(`✅ Re-allocation complete. Awaiting final confirmation.`, 'success');
      this.emit('allocationRejected', { employee: this.employee, notes });
    }
  }

  // ── Main Entry Point ────────────────────────────────────
  async run(employee) {
    this.employee = employee;
    this.results  = {};
    this.setStatus(TEAM_STATUS.ALLOCATING);

    this.log(`👥 Team Allocation Agent activated for ${employee.name}`, 'system');
    this.log(`🏢 Target Dept: ${employee.department} | Team: ${employee.team} | Manager: ${employee.manager}`, 'info');
    await this.delay(500);

    try {
      // Step 1
      await this.assignDepartmentAndTeam(employee);

      // Step 2
      await this.assignManager(employee);

      // Step 3
      await this.shareTeamContacts(employee);

      // Step 4
      await this.createDay1TaskList(employee);

      // Step 5 — pauses until manager approves
      const approvalResult = await this.pauseForManagerApproval(employee);

      // Handle result
      await this.handleManagerApproval(approvalResult);

      return this.getCompletionStatus();

    } catch (err) {
      this.setStatus(TEAM_STATUS.ERROR);
      this.log(`💥 Team Allocation Error: ${err.message}`, 'error');
      this.emit('allocationError', { error: err.message });
      throw err;
    }
  }

  // ── External: Submit manager decision ───────────────────
  submitApproval(approved, approver = 'Manager', notes = '') {
    this.dispatchEvent(new CustomEvent('approvalDecision', {
      detail: { approved, approver, notes }
    }));
  }

  // ── Helpers ─────────────────────────────────────────────
  buildManagerChecklist(employee) {
    return [
      `Employee role (${employee.role}) matches team requirements`,
      `Department (${employee.department}) confirmed as correct`,
      `Team (${employee.team}) has capacity for new member`,
      `Buddy (${employee.buddy}) is available and briefed`,
      `Day 1 task list reviewed and approved`,
      `Manager 1-on-1 slot blocked in calendar`,
    ];
  }

  getCompletionStatus() {
    return {
      agent:    'Team Allocation',
      status:   this.status,
      employee: this.employee?.name,
      results:  this.results,
    };
  }

  reset() {
    this.status   = TEAM_STATUS.IDLE;
    this.employee = null;
    this.results  = {};
  }
}
