// ========================================================
// SYNTHETIC DATA — TrizenHR Onboarding Demo
// ========================================================

export const EMPLOYEES = [
  {
    id: "EMP-2024-001",
    name: "Arjun Mehta",
    role: "Senior Software Engineer",
    department: "Engineering",
    email: "arjun.mehta@trizen.ai",
    phone: "+91 98765 43210",
    joiningDate: "2024-11-04",
    salary: "₹24,00,000 CTC",
    manager: "Priya Sharma",
    location: "Bangalore",
    avatar: "AM",
    avatarColor: "#6366f1",
    documents: ["Aadhaar Card", "PAN Card", "Degree Certificate", "Experience Letter", "Passport"],
    team: "Platform Engineering",
    buddy: "Rohan Verma",
    courses: ["Engineering Onboarding 101", "System Design Fundamentals", "Security & Compliance", "Git & CI/CD Practices"],
    itAssets: { laptop: "MacBook Pro 14\" M3", monitor: "Dell 27\" 4K", accessories: "Magic Keyboard + Mouse" },
  },
  {
    id: "EMP-2024-002",
    name: "Sneha Patel",
    role: "Product Designer",
    department: "Design",
    email: "sneha.patel@trizen.ai",
    phone: "+91 87654 32109",
    joiningDate: "2024-11-05",
    salary: "₹18,00,000 CTC",
    manager: "Kiran Rao",
    location: "Mumbai",
    avatar: "SP",
    avatarColor: "#ec4899",
    documents: ["Aadhaar Card", "PAN Card", "Design Portfolio", "Degree Certificate"],
    team: "Product Design",
    buddy: "Ananya Singh",
    courses: ["Design System Onboarding", "Figma Best Practices", "User Research Methods", "Company Culture & Values"],
    itAssets: { laptop: "MacBook Air 15\" M2", monitor: "LG 27\" 5K", accessories: "Wacom Tablet" },
  },
  {
    id: "EMP-2024-003",
    name: "Rahul Gupta",
    role: "Finance Analyst",
    department: "Finance",
    email: "rahul.gupta@trizen.ai",
    phone: "+91 76543 21098",
    joiningDate: "2024-11-06",
    salary: "₹14,00,000 CTC",
    manager: "Deepa Krishnan",
    location: "Hyderabad",
    avatar: "RG",
    avatarColor: "#10b981",
    documents: ["Aadhaar Card", "PAN Card", "CA Certificate", "Degree Certificate", "Bank Statement"],
    team: "Financial Planning & Analysis",
    buddy: "Meera Nair",
    courses: ["Finance Tools & ERP", "Compliance & Audit Basics", "Financial Reporting Standards", "Company Culture & Values"],
    itAssets: { laptop: "Dell XPS 15", monitor: "Dell 24\" FHD", accessories: "Standard Keyboard + Mouse" },
  },
  {
    id: "EMP-2024-004",
    name: "Divya Nair",
    role: "HR Business Partner",
    department: "Human Resources",
    email: "divya.nair@trizen.ai",
    phone: "+91 65432 10987",
    joiningDate: "2024-11-07",
    salary: "₹16,00,000 CTC",
    manager: "Suresh Iyer",
    location: "Chennai",
    avatar: "DN",
    avatarColor: "#f59e0b",
    documents: ["Aadhaar Card", "PAN Card", "MBA Certificate", "Degree Certificate"],
    team: "HR Operations",
    buddy: "Preethi Reddy",
    courses: ["HR Systems & Tools", "Labor Law Compliance", "Performance Management", "DEI & Culture Training"],
    itAssets: { laptop: "HP EliteBook 840", monitor: "HP 24\" FHD", accessories: "Standard Keyboard + Mouse" },
  },
  {
    id: "EMP-2024-005",
    name: "Vikram Singh",
    role: "Sales Executive",
    department: "Sales",
    email: "vikram.singh@trizen.ai",
    phone: "+91 54321 09876",
    joiningDate: "2024-11-08",
    salary: "₹12,00,000 CTC + Incentives",
    manager: "Amit Khanna",
    location: "Delhi",
    avatar: "VS",
    avatarColor: "#ef4444",
    documents: ["Aadhaar Card", "PAN Card", "Degree Certificate", "Previous Sales Records"],
    team: "Enterprise Sales",
    buddy: "Kabir Malhotra",
    courses: ["Sales Playbook & CRM", "Product Demo Training", "Customer Success Basics", "Company Culture & Values"],
    itAssets: { laptop: "Lenovo ThinkPad X1", monitor: "N/A (Remote)", accessories: "Noise-cancelling Headset" },
  },
];

export const AGENT_PROFILES = {
  supervisor: {
    name: "Supervisor Agent",
    role: "Orchestration & Planning",
    icon: "🧠",
    color: "#6366f1",
    description: "Decomposes onboarding tasks, delegates to workers, manages approval gates"
  },
  doc: {
    name: "Document Agent",
    role: "Document Collection & Verification",
    icon: "📄",
    color: "#8b5cf6",
    description: "Collects KYC docs, generates offer letter, sends NDA for e-signature"
  },
  it: {
    name: "IT Provisioning Agent",
    role: "Systems & Access Management",
    icon: "💻",
    color: "#3b82f6",
    description: "Creates accounts, assigns hardware, provisions software access"
  },
  payroll: {
    name: "Payroll Agent",
    role: "Compensation & Benefits Setup",
    icon: "💰",
    color: "#10b981",
    description: "Sets up bank details, configures salary structure, enrolls in PF/ESI"
  },
  training: {
    name: "Training Agent",
    role: "Learning & Development",
    icon: "🎓",
    color: "#f59e0b",
    description: "Assigns courses, schedules orientation, pairs with buddy/mentor"
  },
  notify: {
    name: "Notification Agent",
    role: "Communications & Alerts",
    icon: "🔔",
    color: "#ec4899",
    description: "Sends welcome emails, Slack messages, manager alerts, calendar invites"
  },
  team: {
    name: "Team Allocation Agent",
    role: "Department & Manager Assignment",
    icon: "👥",
    color: "#f97316",
    description: "Assigns department, manager, buddy, team contacts, and generates Day 1 task list"
  }
};

export const PIPELINE_STAGES = [
  {
    id: "init",
    label: "Pipeline Initialized",
    agent: "supervisor",
    type: "auto",
    duration: 1500,
  },
  {
    id: "doc_collection",
    label: "Document Collection",
    agent: "doc",
    type: "auto",
    duration: 4000,
    subTasks: [
      "Sending document request email to candidate...",
      "Generating personalized offer letter...",
      "Dispatching NDA for e-signature (DocuSign)...",
      "Creating secure document upload portal link...",
      "Documents received & uploaded to HR portal...",
    ]
  },
  {
    id: "doc_verification",
    label: "Document Verification",
    agent: "doc",
    type: "human_gate",
    gateTitle: "🔍 Document Verification Required",
    gateDescription: "HR must review and verify all submitted documents before IT provisioning can begin.",
    gateChecklist: [
      "Identity documents (Aadhaar + PAN) verified",
      "Educational certificates authenticated",
      "Previous employment verified",
      "NDA signed and received",
      "Offer letter countersigned"
    ]
  },
  {
    id: "it_provisioning",
    label: "IT Provisioning",
    agent: "it",
    type: "auto",
    duration: 5000,
    subTasks: [
      "Creating corporate email account...",
      "Provisioning Slack workspace access...",
      "Setting up VPN credentials...",
      "Adding to GitHub organization...",
      "Configuring Jira/Confluence access...",
      "Raising hardware procurement request...",
    ]
  },
  {
    id: "it_approval",
    label: "IT Access Approval",
    agent: "it",
    type: "human_gate",
    gateTitle: "🔐 IT Access Approval Required",
    gateDescription: "IT Manager must approve system access levels and hardware allocation before payroll setup.",
    gateChecklist: [
      "Access level verified (role-appropriate permissions)",
      "Hardware allocation confirmed",
      "Security training acknowledgment received",
      "MFA enrollment completed",
    ]
  },
  {
    id: "team_allocation",
    label: "Team Allocation",
    agent: "team",
    type: "auto",
    duration: 4500,
    subTasks: [
      "Assigning department and team...",
      "Assigning reporting manager...",
      "Compiling team contact info & buddy...",
      "Adding to Slack channels...",
      "Generating Day 1 task list...",
      "Scheduling Day 1 calendar events...",
    ]
  },
  {
    id: "team_approval",
    label: "Manager Confirmation",
    agent: "team",
    type: "human_gate",
    gateTitle: "👥 Manager Must Confirm Team Assignment",
    gateDescription: "The reporting manager must review and confirm the team allocation, buddy assignment, and Day 1 task list before payroll is activated.",
    gateChecklist: [
      "Employee role matches team requirements",
      "Department confirmed as correct",
      "Team has capacity for the new member",
      "Buddy is available and briefed",
      "Day 1 task list reviewed & approved",
      "Manager 1-on-1 slot blocked in calendar",
    ]
  },
  {
    id: "payroll_setup",
    label: "Payroll Configuration",
    agent: "payroll",
    type: "auto",
    duration: 4000,
    subTasks: [
      "Collecting bank account details...",
      "Configuring CTC salary structure...",
      "Setting up PF enrollment (EPFO)...",
      "Configuring ESI deduction...",
      "Assigning pay grade & cost center...",
      "Scheduling first payroll cycle...",
    ]
  },
  {
    id: "payroll_activation",
    label: "Payroll Activation",
    agent: "payroll",
    type: "human_gate",
    gateTitle: "💳 Payroll Activation Approval",
    gateDescription: "Finance team must review and activate the salary configuration before training begins.",
    gateChecklist: [
      "Salary structure matches offer letter",
      "Tax declarations received (Form 12BB)",
      "PF nominee form submitted",
      "Bank account verified (penny drop test passed)",
    ]
  },
  {
    id: "training_setup",
    label: "Training & Onboarding",
    agent: "training",
    type: "auto",
    duration: 3500,
    subTasks: [
      "Assigning role-specific LMS courses...",
      "Scheduling Day 1 orientation session...",
      "Pairing with buddy/mentor...",
      "Setting 30/60/90-day check-in reminders...",
      "Adding to team standup calendar...",
    ]
  },
  {
    id: "notifications",
    label: "Sending Notifications",
    agent: "notify",
    type: "auto",
    duration: 2500,
    subTasks: [
      "Sending welcome email to new hire...",
      "Notifying manager & team via Slack...",
      "Alerting IT team for hardware delivery...",
      "Sending calendar invites for Day 1...",
      "Updating HRMS employee record...",
    ]
  },
  {
    id: "complete",
    label: "Onboarding Complete! 🎉",
    agent: "supervisor",
    type: "complete",
    duration: 1000,
  }
];
