// ========================================================
// IT PROVISIONING AGENT — Systems & Access Management
// ========================================================
// Responsibilities:
//   1. Create corporate email account
//   2. Raise laptop/hardware allocation ticket
//   3. Request software access (Slack, Jira, GitHub, Confluence, VPN)
//   4. PAUSE → Wait for IT Staff approval  ⚠️ Human-in-the-Loop
//   5. Track & report completion status

import { MockEmailAPI, MockLaptopAPI, MockSoftwareAPI, MockITTicketAPI } from '../api/mock_apis.js';

// ── Status constants ─────────────────────────────────────
export const IT_STATUS = {
  IDLE:             'idle',
  PROVISIONING:     'provisioning',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED:         'approved',
  REJECTED:         'rejected',
  COMPLETE:         'complete',
  ERROR:            'error',
};

// ── IT Provisioning Agent ────────────────────────────────
export class ITPProvisioningAgent extends EventTarget {
  constructor() {
    super();
    this.status   = IT_STATUS.IDLE;
    this.employee = null;
    this.results  = {};          // aggregated results per sub-task
    this.ticketId = null;        // master IT ticket
  }

  // ── Internal helpers ────────────────────────────────────
  log(message, type = 'info') {
    this.dispatchEvent(new CustomEvent('log', {
      detail: { message, type, agent: 'it', timestamp: new Date() }
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

  // ── Step 1 — Create Corporate Email ─────────────────────
  async requestEmailCreation(employee) {
    this.log(`📧 Requesting email creation for ${employee.name}...`, 'task');
    await this.delay(600);

    const emailAddr = MockEmailAPI.generateAddress(employee.name, 'trizen.ai');
    const result    = await MockEmailAPI.createAccount({
      name:       employee.name,
      email:      emailAddr,
      department: employee.department,
      role:       employee.role,
    });

    this.results.email = result;
    this.log(`  ↳ Email created: ${result.email}  [Quota: ${result.quota}]`, 'success');
    this.log(`  ↳ Temporary password dispatched via secure SMS`, 'info');
    await this.delay(400);
    return result;
  }

  // ── Step 2 — Laptop Allocation Ticket ───────────────────
  async raiseLaptopTicket(employee) {
    this.log(`💻 Raising laptop allocation ticket...`, 'task');
    await this.delay(500);

    const spec   = MockLaptopAPI.selectSpec(employee.role, employee.department);
    const ticket = await MockLaptopAPI.raiseTicket({
      employeeId:  employee.id,
      name:        employee.name,
      spec,
      location:    employee.location,
      joiningDate: employee.joiningDate,
    });

    this.results.laptop = ticket;
    this.log(`  ↳ Ticket #${ticket.ticketId} raised — ${spec.model}`, 'success');
    this.log(`  ↳ ETA: ${ticket.eta} | Delivery to: ${employee.location}`, 'info');
    await this.delay(400);
    return ticket;
  }

  // ── Step 3 — Software Access Requests ───────────────────
  async requestSoftwareAccess(employee) {
    this.log(`🔧 Requesting software access bundle...`, 'task');
    await this.delay(400);

    const softwareList = MockSoftwareAPI.getSoftwareList(employee.department, employee.role);
    const results      = [];

    for (const software of softwareList) {
      await this.delay(300);
      const res = await MockSoftwareAPI.requestAccess({
        employeeId: employee.id,
        email:      this.results.email?.email || employee.email,
        software,
        role:       employee.role,
      });
      results.push(res);
      this.log(`  ↳ ${software.icon} ${software.name}: ${res.status} (License: ${res.licenseType})`, 'task');
    }

    this.results.software = results;
    this.log(`  ↳ ${results.length} software access requests submitted`, 'success');
    await this.delay(300);
    return results;
  }

  // ── Step 4 — Create Master IT Ticket & PAUSE ───────────
  async createMasterTicketAndPause(employee) {
    this.log(`🎫 Creating master IT provisioning ticket...`, 'task');
    await this.delay(500);

    const masterTicket = await MockITTicketAPI.createMasterTicket({
      employee,
      emailResult:    this.results.email,
      laptopResult:   this.results.laptop,
      softwareResult: this.results.software,
    });

    this.ticketId          = masterTicket.ticketId;
    this.results.masterTicket = masterTicket;
    this.log(`  ↳ Master ticket #${masterTicket.ticketId} created`, 'success');
    this.log(`  ↳ IT Staff notified via email & Slack`, 'info');
    await this.delay(300);

    // ⚠️ Human-in-the-Loop Gate
    this.setStatus(IT_STATUS.PENDING_APPROVAL);
    this.log(`⚠️  HUMAN GATE: IT Staff approval required before access is activated`, 'gate');
    this.log(`🔴 Agent paused — waiting for IT Manager sign-off...`, 'warning');
    this.emit('approvalRequired', {
      ticketId:  masterTicket.ticketId,
      employee,
      checklist: masterTicket.approvalChecklist,
      summary:   this.buildApprovalSummary(employee),
    });

    // Return a promise that resolves when approval arrives
    return new Promise(resolve => {
      const handler = (e) => {
        this.removeEventListener('approvalDecision', handler);
        resolve(e.detail);
      };
      this.addEventListener('approvalDecision', handler);
    });
  }

  // ── Step 5 — Handle Approval Result ────────────────────
  async handleApprovalResult({ approved, approver, notes }) {
    if (approved) {
      this.setStatus(IT_STATUS.APPROVED);
      this.log(`✅ IT Access APPROVED by ${approver}${notes ? ' — ' + notes : ''}`, 'success');
      this.log(`▶️  Activating all provisioned access...`, 'info');
      await this.delay(700);

      // Activate email
      await MockEmailAPI.activate(this.results.email?.email);
      this.log(`  ↳ 📧 Email account activated`, 'success');
      await this.delay(300);

      // Confirm laptop dispatch
      await MockLaptopAPI.confirmDispatch(this.results.laptop?.ticketId);
      this.log(`  ↳ 💻 Laptop dispatch confirmed`, 'success');
      await this.delay(300);

      // Activate software licenses
      for (const sw of (this.results.software || [])) {
        await MockSoftwareAPI.activateLicense(sw.requestId);
        await this.delay(150);
      }
      this.log(`  ↳ 🔧 All software licenses activated`, 'success');
      await this.delay(300);

      this.setStatus(IT_STATUS.COMPLETE);
      this.log(`🎉 IT Provisioning COMPLETE for ${this.employee?.name}`, 'complete');
      this.emit('provisioningComplete', { employee: this.employee, results: this.results });
    } else {
      this.setStatus(IT_STATUS.REJECTED);
      this.log(`❌ IT Access REJECTED by ${approver}${notes ? ' — ' + notes : ''}`, 'error');
      this.log(`🔄 Flagging for manual review and correction...`, 'warning');
      await this.delay(800);
      this.log(`📤 Re-submitting corrected provisioning request...`, 'info');
      await this.delay(600);
      this.setStatus(IT_STATUS.COMPLETE);
      this.log(`✅ Correction applied. Access request resubmitted.`, 'success');
      this.emit('provisioningRejected', { employee: this.employee, notes });
    }
  }

  // ── Main Entry Point ────────────────────────────────────
  async run(employee) {
    this.employee = employee;
    this.results  = {};
    this.setStatus(IT_STATUS.PROVISIONING);

    this.log(`💻 IT Provisioning Agent activated for ${employee.name}`, 'system');
    this.log(`🆔 Employee ID: ${employee.id} | Role: ${employee.role} | Dept: ${employee.department}`, 'info');
    await this.delay(500);

    try {
      // Step 1
      await this.requestEmailCreation(employee);

      // Step 2
      await this.raiseLaptopTicket(employee);

      // Step 3
      await this.requestSoftwareAccess(employee);

      // Step 4 — pauses until approval received
      const approvalResult = await this.createMasterTicketAndPause(employee);

      // Step 5
      await this.handleApprovalResult(approvalResult);

      return this.getCompletionStatus();

    } catch (err) {
      this.setStatus(IT_STATUS.ERROR);
      this.log(`💥 IT Provisioning Error: ${err.message}`, 'error');
      this.emit('provisioningError', { error: err.message });
      throw err;
    }
  }

  // ── External: Submit approval from IT Staff ─────────────
  submitApproval(approved, approver = 'IT Manager', notes = '') {
    this.dispatchEvent(new CustomEvent('approvalDecision', {
      detail: { approved, approver, notes }
    }));
  }

  // ── Helpers ─────────────────────────────────────────────
  buildApprovalSummary(employee) {
    return {
      email:    this.results.email,
      laptop:   this.results.laptop,
      software: this.results.software?.map(s => ({ name: s.name, licenseType: s.licenseType })),
      employee: {
        id:         employee.id,
        name:       employee.name,
        role:       employee.role,
        department: employee.department,
        location:   employee.location,
      }
    };
  }

  getCompletionStatus() {
    return {
      agent:    'IT Provisioning',
      status:   this.status,
      employee: this.employee?.name,
      results:  this.results,
      ticketId: this.ticketId,
    };
  }

  reset() {
    this.status   = IT_STATUS.IDLE;
    this.employee = null;
    this.results  = {};
    this.ticketId = null;
  }
}
