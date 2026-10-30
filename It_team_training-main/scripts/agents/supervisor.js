// ========================================================
// SUPERVISOR AGENT — Orchestration Engine
// ========================================================

import { PIPELINE_STAGES } from '../data/synthetic-data.js';
import { ITPProvisioningAgent } from './it_provisioning_agent.js';
import { TeamAllocationAgent } from './team_allocation_agent.js';

export class SupervisorAgent extends EventTarget {
  constructor() {
    super();
    this.currentEmployee = null;
    this.currentStageIndex = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.stageResults = {};
  }

  log(message, type = 'info', agent = 'supervisor') {
    this.dispatchEvent(new CustomEvent('log', {
      detail: { message, type, agent, timestamp: new Date() }
    }));
  }

  updateStage(stageId, status, data = {}) {
    this.dispatchEvent(new CustomEvent('stageUpdate', {
      detail: { stageId, status, ...data }
    }));
  }

  updateAgent(agentId, status, task = '') {
    this.dispatchEvent(new CustomEvent('agentUpdate', {
      detail: { agentId, status, task }
    }));
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async startOnboarding(employee) {
    this.currentEmployee = employee;
    this.currentStageIndex = 0;
    this.isRunning = true;
    this.isPaused = false;
    this.stageResults = {};

    this.log(`🧠 Supervisor Agent activated for ${employee.name}`, 'system', 'supervisor');
    this.log(`📋 Analyzing role: ${employee.role} | Dept: ${employee.department}`, 'info', 'supervisor');
    await this.delay(800);
    this.log(`🔀 Decomposing onboarding pipeline into ${PIPELINE_STAGES.length} stages...`, 'info', 'supervisor');
    await this.delay(600);
    this.log(`✅ Task graph compiled. Delegating to worker agents...`, 'success', 'supervisor');
    await this.delay(400);

    this.dispatchEvent(new CustomEvent('pipelineStarted', { detail: { employee } }));

    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      if (!this.isRunning) break;
      this.currentStageIndex = i;
      const stage = PIPELINE_STAGES[i];

      if (stage.type === 'human_gate') {
        await this.handleHumanGate(stage);
      } else if (stage.type === 'complete') {
        await this.handleComplete();
      } else {
        await this.handleAutoStage(stage);
      }
    }
  }

  async handleAutoStage(stage) {
    this.updateStage(stage.id, 'active');
    this.updateAgent(stage.agent, 'working', stage.label);
    this.log(`📤 Supervisor → ${stage.agent.toUpperCase()} Agent: Start "${stage.label}"`, 'delegate', 'supervisor');
    await this.delay(400);

    if (stage.subTasks) {
      const taskDuration = stage.duration / stage.subTasks.length;
      for (const task of stage.subTasks) {
        this.log(`  ↳ ${task}`, 'task', stage.agent);
        await this.delay(taskDuration);
      }
    } else {
      await this.delay(stage.duration);
    }

    this.log(`✅ ${stage.agent.toUpperCase()} Agent: "${stage.label}" completed`, 'success', stage.agent);
    this.updateStage(stage.id, 'completed');
    this.updateAgent(stage.agent, 'idle');
    this.log(`📥 Supervisor ← ${stage.agent.toUpperCase()} Agent: Stage complete. Updating pipeline...`, 'delegate', 'supervisor');
    await this.delay(300);
  }

  async handleHumanGate(stage) {
    this.updateStage(stage.id, 'pending_approval');
    this.updateAgent(stage.agent, 'waiting');
    this.log(`⏸️  HUMAN GATE: "${stage.gateTitle}"`, 'gate', 'supervisor');
    this.log(`🔴 Pipeline paused — awaiting human approval to proceed`, 'warning', 'supervisor');

    await new Promise(resolve => {
      const handler = (e) => {
        const { stageId, approved, notes } = e.detail;
        if (stageId === stage.id) {
          this.removeEventListener('approvalResult', handler);
          resolve({ approved, notes });
        }
      };
      this.addEventListener('approvalResult', handler);
      this.dispatchEvent(new CustomEvent('gateReached', { detail: { stage } }));
    }).then(async ({ approved, notes }) => {
      if (approved) {
        this.log(`✅ APPROVED by HR/Manager${notes ? ': ' + notes : ''}`, 'success', 'supervisor');
        this.updateStage(stage.id, 'completed');
        this.updateAgent(stage.agent, 'idle');
        this.log(`▶️  Pipeline resumed. Proceeding to next stage...`, 'info', 'supervisor');
      } else {
        this.log(`❌ REJECTED${notes ? ': ' + notes : ''}`, 'error', 'supervisor');
        this.updateStage(stage.id, 'rejected');
        this.log(`🔄 Notifying relevant teams. Pipeline stage flagged for manual review.`, 'warning', 'supervisor');
        await this.delay(1000);
        this.log(`↩️  Rolling back to previous stage for correction...`, 'warning', 'supervisor');
        await this.delay(800);
        this.log(`📤 Re-delegating to ${stage.agent.toUpperCase()} Agent for correction...`, 'info', 'supervisor');
        await this.delay(600);
        this.updateStage(stage.id, 'completed');
        this.log(`✅ Correction applied. Resubmitting for approval...`, 'success', stage.agent);
        await this.delay(400);
        this.updateStage(stage.id, 'completed');
        this.updateAgent(stage.agent, 'idle');
      }
    });
  }

  async handleComplete() {
    this.updateStage('complete', 'completed');
    this.log(`🎉 ONBOARDING PIPELINE COMPLETE!`, 'complete', 'supervisor');
    this.log(`✨ ${this.currentEmployee.name} is fully onboarded and ready for Day 1.`, 'complete', 'supervisor');
    this.log(`📊 Summary: ${PIPELINE_STAGES.filter(s => s.type !== 'complete').length} stages completed, 4 human approvals obtained.`, 'info', 'supervisor');
    this.isRunning = false;
    await this.delay(500);
    this.dispatchEvent(new CustomEvent('onboardingComplete', { detail: { employee: this.currentEmployee } }));
  }

  submitApproval(stageId, approved, notes = '') {
    this.dispatchEvent(new CustomEvent('approvalResult', { detail: { stageId, approved, notes } }));
  }

  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentEmployee = null;
    this.currentStageIndex = 0;
    this.stageResults = {};
  }
}
