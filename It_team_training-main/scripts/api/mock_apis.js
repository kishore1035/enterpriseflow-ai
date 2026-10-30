// ========================================================
// MOCK API INTEGRATIONS — TrizenHR Onboarding Demo
// ========================================================
// Simulates real-world integrations:
//   • Email provisioning (Google Workspace / Microsoft 365)
//   • Laptop / hardware ticketing (ServiceNow / Freshservice)
//   • Software access (Slack, GitHub, Jira, Confluence, VPN)
//   • HRMS (BambooHR / Darwinbox)
//   • Slack API
//   • Google Calendar API

// ── Utility ─────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── Hardware Specs per Role ──────────────────────────────
const LAPTOP_SPECS = {
  engineering: {
    model:  'MacBook Pro 14" M3 Pro',
    ram:    '18 GB',
    storage:'512 GB SSD',
    os:     'macOS Sonoma',
    extras: ['Dell 27" 4K Monitor', 'Magic Keyboard', 'Magic Mouse', 'USB-C Hub'],
  },
  design: {
    model:  'MacBook Air 15" M2',
    ram:    '16 GB',
    storage:'512 GB SSD',
    os:     'macOS Sonoma',
    extras: ['LG 27" 5K Monitor', 'Wacom Intuos Tablet', 'USB-C Hub'],
  },
  finance: {
    model:  'Dell XPS 15',
    ram:    '16 GB',
    storage:'256 GB SSD',
    os:     'Windows 11 Pro',
    extras: ['Dell 24" FHD Monitor', 'Standard Keyboard', 'Mouse'],
  },
  'human resources': {
    model:  'HP EliteBook 840 G10',
    ram:    '16 GB',
    storage:'256 GB SSD',
    os:     'Windows 11 Pro',
    extras: ['HP 24" Monitor', 'Standard Keyboard', 'Mouse'],
  },
  sales: {
    model:  'Lenovo ThinkPad X1 Carbon',
    ram:    '16 GB',
    storage:'512 GB SSD',
    os:     'Windows 11 Pro',
    extras: ['Noise-cancelling Headset', 'USB-C Hub', 'Portable Charger'],
  },
  _default: {
    model:  'Lenovo IdeaPad Pro 5',
    ram:    '8 GB',
    storage:'256 GB SSD',
    os:     'Windows 11',
    extras: ['Standard Keyboard', 'Mouse'],
  },
};

// ── Software Bundles per Department ─────────────────────
const SOFTWARE_BUNDLES = {
  engineering: [
    { name: 'Slack',        icon: '💬', licenseType: 'Pro',          category: 'Communication' },
    { name: 'GitHub',       icon: '🐙', licenseType: 'Enterprise',   category: 'DevOps'        },
    { name: 'Jira',         icon: '📋', licenseType: 'Standard',     category: 'Project Mgmt'  },
    { name: 'Confluence',   icon: '📚', licenseType: 'Standard',     category: 'Documentation' },
    { name: 'VS Code',      icon: '🧩', licenseType: 'Free',         category: 'IDE'           },
    { name: 'Datadog',      icon: '🐶', licenseType: 'Pro',          category: 'Monitoring'    },
    { name: 'VPN (Tailscale)', icon: '🔐', licenseType: 'Teams',     category: 'Security'      },
    { name: 'AWS Console',  icon: '☁️', licenseType: 'IAM Access',   category: 'Cloud'         },
  ],
  design: [
    { name: 'Slack',        icon: '💬', licenseType: 'Pro',          category: 'Communication' },
    { name: 'Figma',        icon: '🎨', licenseType: 'Professional', category: 'Design'        },
    { name: 'Notion',       icon: '📒', licenseType: 'Team',         category: 'Documentation' },
    { name: 'Jira',         icon: '📋', licenseType: 'Standard',     category: 'Project Mgmt'  },
    { name: 'Loom',         icon: '📹', licenseType: 'Business',     category: 'Video'         },
    { name: 'Zeplin',       icon: '🛠️', licenseType: 'Team',         category: 'Handoff'       },
    { name: 'VPN (Tailscale)', icon: '🔐', licenseType: 'Teams',     category: 'Security'      },
  ],
  finance: [
    { name: 'Slack',        icon: '💬', licenseType: 'Pro',          category: 'Communication' },
    { name: 'SAP ERP',      icon: '🏭', licenseType: 'Enterprise',   category: 'ERP'           },
    { name: 'Zoho Books',   icon: '📊', licenseType: 'Professional', category: 'Accounting'    },
    { name: 'Excel 365',    icon: '📈', licenseType: 'M365 Business',category: 'Productivity'  },
    { name: 'Power BI',     icon: '📉', licenseType: 'Pro',          category: 'Analytics'     },
    { name: 'DocuSign',     icon: '✍️', licenseType: 'Business Pro', category: 'e-Signature'   },
    { name: 'VPN (Tailscale)', icon: '🔐', licenseType: 'Teams',     category: 'Security'      },
  ],
  'human resources': [
    { name: 'Slack',        icon: '💬', licenseType: 'Pro',          category: 'Communication' },
    { name: 'Darwinbox',    icon: '👥', licenseType: 'Enterprise',   category: 'HRMS'          },
    { name: 'BambooHR',     icon: '🎋', licenseType: 'Advantage',    category: 'HR Tools'      },
    { name: 'Excel 365',    icon: '📈', licenseType: 'M365 Business',category: 'Productivity'  },
    { name: 'Zoom',         icon: '📹', licenseType: 'Business',     category: 'Video Conf'    },
    { name: 'DocuSign',     icon: '✍️', licenseType: 'Business Pro', category: 'e-Signature'   },
    { name: 'VPN (Tailscale)', icon: '🔐', licenseType: 'Teams',     category: 'Security'      },
  ],
  sales: [
    { name: 'Slack',        icon: '💬', licenseType: 'Pro',          category: 'Communication' },
    { name: 'Salesforce',   icon: '☁️', licenseType: 'Sales Cloud',  category: 'CRM'           },
    { name: 'HubSpot',      icon: '🟠', licenseType: 'Sales Pro',    category: 'Marketing'     },
    { name: 'Zoom',         icon: '📹', licenseType: 'Business',     category: 'Video Conf'    },
    { name: 'Loom',         icon: '🎥', licenseType: 'Business',     category: 'Video'         },
    { name: 'LinkedIn Sales Nav', icon: '🔷', licenseType: 'Enterprise', category: 'Prospecting' },
    { name: 'VPN (Tailscale)', icon: '🔐', licenseType: 'Teams',     category: 'Security'      },
  ],
  _default: [
    { name: 'Slack',        icon: '💬', licenseType: 'Pro',          category: 'Communication' },
    { name: 'Google Workspace', icon: '📁', licenseType: 'Business', category: 'Productivity'  },
    { name: 'Zoom',         icon: '📹', licenseType: 'Business',     category: 'Video Conf'    },
    { name: 'VPN (Tailscale)', icon: '🔐', licenseType: 'Teams',     category: 'Security'      },
  ],
};

// ── Slack Channel Map ────────────────────────────────────
const SLACK_CHANNELS = {
  Engineering:       ['#general', '#engineering', '#platform-team', '#dev-ops', '#code-reviews', '#tech-random'],
  Design:            ['#general', '#design', '#product', '#ux-research', '#design-feedback'],
  Finance:           ['#general', '#finance', '#accounting', '#budgets', '#compliance'],
  'Human Resources': ['#general', '#hr-team', '#people-ops', '#culture', '#hiring'],
  Sales:             ['#general', '#sales', '#enterprise-sales', '#customer-success', '#deals'],
  _default:          ['#general', '#announcements', '#watercooler'],
};

// ── Desk Assignment Map ──────────────────────────────────
const DESK_MAP = {
  Engineering:       { floor: '3rd Floor', zone: 'East Wing', deskNumber: `ENG-${uid()}` },
  Design:            { floor: '2nd Floor', zone: 'Creative Hub', deskNumber: `DSG-${uid()}` },
  Finance:           { floor: '4th Floor', zone: 'North Wing', deskNumber: `FIN-${uid()}` },
  'Human Resources': { floor: '1st Floor', zone: 'HR Suite', deskNumber: `HR-${uid()}`  },
  Sales:             { floor: '2nd Floor', zone: 'Sales Floor', deskNumber: `SLS-${uid()}` },
  _default:          { floor: '1st Floor', zone: 'Open Area',  deskNumber: `GEN-${uid()}` },
};

// ════════════════════════════════════════════════════════
//  📧  MockEmailAPI
// ════════════════════════════════════════════════════════
export const MockEmailAPI = {
  /** Generate a standard corporate email address */
  generateAddress(fullName, domain) {
    const [first, ...rest] = fullName.trim().toLowerCase().split(' ');
    const last = rest.join('.');
    return `${first}.${last}@${domain}`;
  },

  /** POST /api/email/create  →  simulate Google Workspace / M365 account creation */
  async createAccount({ name, email, department, role }) {
    await delay(400);
    return {
      requestId:   `EMAIL-REQ-${uid()}`,
      email,
      displayName: name,
      department,
      role,
      quota:       '30 GB',
      groups:      [`${department.toLowerCase().replace(/ /g, '-')}@trizen.ai`, 'all-staff@trizen.ai'],
      mfaRequired: true,
      status:      'created_pending_activation',
      createdAt:   new Date().toISOString(),
    };
  },

  /** PUT /api/email/activate  →  activate account after IT approval */
  async activate(email) {
    await delay(200);
    return { email, status: 'active', activatedAt: new Date().toISOString() };
  },
};

// ════════════════════════════════════════════════════════
//  💻  MockLaptopAPI
// ════════════════════════════════════════════════════════
export const MockLaptopAPI = {
  /** Select laptop spec based on employee role/department */
  selectSpec(role, department) {
    const key = department.toLowerCase();
    return LAPTOP_SPECS[key] || LAPTOP_SPECS['_default'];
  },

  /** POST /api/hardware/ticket  →  raise ServiceNow procurement ticket */
  async raiseTicket({ employeeId, name, spec, location, joiningDate }) {
    await delay(450);
    const joining = new Date(joiningDate);
    const eta     = new Date(joining);
    eta.setDate(eta.getDate() - 2); // deliver 2 days before joining

    return {
      ticketId:    `HW-${uid()}`,
      employeeId,
      employeeName: name,
      spec,
      location,
      eta:          eta.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status:       'ticket_raised',
      vendor:       'TechMart India Pvt Ltd',
      trackingId:   `TRK-${uid()}`,
      raisedAt:     new Date().toISOString(),
    };
  },

  /** PUT /api/hardware/dispatch  →  confirm dispatch post-approval */
  async confirmDispatch(ticketId) {
    await delay(200);
    return { ticketId, status: 'dispatched', dispatchedAt: new Date().toISOString() };
  },
};

// ════════════════════════════════════════════════════════
//  🔧  MockSoftwareAPI
// ════════════════════════════════════════════════════════
export const MockSoftwareAPI = {
  /** Return software list for department/role */
  getSoftwareList(department, role) {
    const key = department.toLowerCase();
    return SOFTWARE_BUNDLES[key] || SOFTWARE_BUNDLES['_default'];
  },

  /** POST /api/software/access  →  request license/access */
  async requestAccess({ employeeId, email, software, role }) {
    await delay(180);
    return {
      requestId:   `SW-REQ-${uid()}`,
      employeeId,
      email,
      name:        software.name,
      icon:        software.icon,
      licenseType: software.licenseType,
      category:    software.category,
      status:      'pending_activation',
      requestedAt: new Date().toISOString(),
    };
  },

  /** PUT /api/software/activate  →  activate after IT approval */
  async activateLicense(requestId) {
    await delay(120);
    return { requestId, status: 'active', activatedAt: new Date().toISOString() };
  },
};

// ════════════════════════════════════════════════════════
//  🎫  MockITTicketAPI
// ════════════════════════════════════════════════════════
export const MockITTicketAPI = {
  /** POST /api/it/master-ticket  →  create consolidated IT provisioning ticket */
  async createMasterTicket({ employee, emailResult, laptopResult, softwareResult }) {
    await delay(350);
    return {
      ticketId:     `IT-MASTER-${uid()}`,
      employeeId:   employee.id,
      employeeName: employee.name,
      department:   employee.department,
      role:         employee.role,
      joiningDate:  employee.joiningDate,
      subTickets: {
        email:    emailResult?.requestId    || 'N/A',
        laptop:   laptopResult?.ticketId    || 'N/A',
        software: (softwareResult || []).map(s => s.requestId),
      },
      approvalChecklist: [
        'Access level verified (role-appropriate permissions)',
        'Hardware allocation confirmed & delivery scheduled',
        'Security awareness training acknowledgment received',
        'MFA enrollment completed',
        'VPN access granted with least-privilege principle',
      ],
      assignedTo:   'IT Manager',
      priority:     'High',
      status:       'pending_it_approval',
      createdAt:    new Date().toISOString(),
    };
  },
};

// ════════════════════════════════════════════════════════
//  🏢  MockHRMS  (BambooHR / Darwinbox)
// ════════════════════════════════════════════════════════
export const MockHRMS = {
  /** POST /api/hrms/team-assign */
  async assignTeam({ employeeId, department, team, role, location, joiningDate }) {
    await delay(400);
    const deskKey  = department || '_default';
    const deskInfo = DESK_MAP[deskKey] || DESK_MAP['_default'];

    return {
      teamId:      `TEAM-${uid()}`,
      employeeId,
      department,
      team,
      role,
      location,
      desk:        `${deskInfo.floor}, ${deskInfo.zone} — Desk #${deskInfo.deskNumber}`,
      headCount:   Math.floor(Math.random() * 8) + 5, // 5-12 existing members
      assignedAt:  new Date().toISOString(),
    };
  },

  /** GET /api/hrms/manager/:name */
  async getManagerInfo(managerName, department) {
    await delay(300);
    const deptDomain = department.toLowerCase().replace(/ /g, '');
    const firstName  = managerName.split(' ')[0].toLowerCase();
    const lastName   = managerName.split(' ').slice(1).join('.').toLowerCase();

    return {
      id:         `MGR-${uid()}`,
      name:       managerName,
      email:      `${firstName}.${lastName}@trizen.ai`,
      phone:      '+91 99XXX XXXXX',
      department,
      slackHandle: `@${firstName}`,
      calendlyLink: `https://calendly.com/${firstName}-${lastName}`,
    };
  },

  /** GET /api/hrms/team-contacts */
  async getTeamContacts(department, team) {
    await delay(300);
    const chanKey      = department || '_default';
    const slackChannels = SLACK_CHANNELS[chanKey] || SLACK_CHANNELS['_default'];

    return {
      teamName:      team,
      department,
      slackChannels,
      teamDirectory: `https://directory.trizen.ai/${department.toLowerCase().replace(/ /g, '-')}`,
      wikiLink:      `https://wiki.trizen.ai/teams/${team.toLowerCase().replace(/ /g, '-')}`,
    };
  },

  /** GET /api/hrms/buddy/:name */
  async getBuddyInfo(buddyName, department) {
    await delay(250);
    if (!buddyName) return null;
    const first = buddyName.split(' ')[0].toLowerCase();
    const last  = buddyName.split(' ').slice(1).join('.').toLowerCase();
    return {
      id:          `BUDDY-${uid()}`,
      name:        buddyName,
      email:       `${first}.${last}@trizen.ai`,
      department,
      role:        'Senior Team Member',
      slackHandle: `@${first}`,
      meetingLink: `https://meet.google.com/trizen-${first}-buddy`,
    };
  },

  /** PUT /api/hrms/finalize-allocation */
  async finalizeAllocation({ employeeId, teamId, managerId, day1Tasks }) {
    await delay(400);
    return {
      employeeId,
      teamId,
      managerId,
      tasksRegistered: day1Tasks?.length || 0,
      orgChartUpdated: true,
      status:          'allocation_finalized',
      finalizedAt:     new Date().toISOString(),
    };
  },
};

// ════════════════════════════════════════════════════════
//  💬  MockSlackAPI
// ════════════════════════════════════════════════════════
export const MockSlackAPI = {
  /** POST /api/slack/invite-to-channels */
  async addToChannels({ email, name, department, channels }) {
    await delay(350);
    return {
      requestId:       `SLACK-${uid()}`,
      user:            name,
      email,
      channelsJoined:  channels,
      welcomePosted:   true,
      directMessageSent: true,
      status:          'joined',
      joinedAt:        new Date().toISOString(),
    };
  },

  /** POST /api/slack/message  →  send DM or channel message */
  async sendMessage({ channel, text, blocks }) {
    await delay(150);
    return { ok: true, channel, ts: Date.now().toString(), messageId: `MSG-${uid()}` };
  },
};

// ════════════════════════════════════════════════════════
//  📅  MockCalendarAPI  (Google Calendar / Outlook)
// ════════════════════════════════════════════════════════
export const MockCalendarAPI = {
  /** POST /api/calendar/day1-events  →  bulk schedule Day 1 calendar events */
  async scheduleDay1Events({ employee, manager, buddy, tasks }) {
    await delay(400);

    const events = [
      {
        id:        `CAL-${uid()}`,
        title:     `Day 1 Orientation — Welcome ${employee.name}!`,
        time:      '09:00 AM',
        duration:  '60 mins',
        attendees: [employee.email, manager?.email, 'hr@trizen.ai'].filter(Boolean),
        location:  'Zoom / Conference Room A',
        type:      'orientation',
      },
      {
        id:        `CAL-${uid()}`,
        title:     `Meet Your Buddy — ${buddy?.name || 'Team Buddy'}`,
        time:      '11:00 AM',
        duration:  '30 mins',
        attendees: [employee.email, buddy?.email].filter(Boolean),
        location:  buddy?.meetingLink || 'Google Meet',
        type:      'buddy_intro',
      },
      {
        id:        `CAL-${uid()}`,
        title:     `1-on-1 with ${manager?.name || 'Your Manager'}`,
        time:      '03:00 PM',
        duration:  '45 mins',
        attendees: [employee.email, manager?.email].filter(Boolean),
        location:  manager?.calendlyLink || 'Google Meet',
        type:      'manager_1on1',
      },
    ];

    return {
      requestId:     `CAL-BATCH-${uid()}`,
      employee:      employee.name,
      eventsCreated: events.length,
      events,
      invitesSent:   true,
      calendarDate:  employee.joiningDate,
      createdAt:     new Date().toISOString(),
    };
  },
};
