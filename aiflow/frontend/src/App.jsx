
import { useState } from "react";
import {
  LayoutDashboard, Users, BookOpen, ShieldCheck,
  Activity, FileText, CheckCircle, Clock, Laptop
} from "lucide-react";
import "./style.css";

const employees = [
  { id: "EMP001", name: "Aarav Sharma", dept: "Engineering", progress: 75 },
  { id: "EMP002", name: "Mira Patel", dept: "Design", progress: 45 },
  { id: "EMP003", name: "Kabir Rao", dept: "Analytics", progress: 100 }
];

const initialTasks = [
  { id: 1, title: "Company Introduction", status: "Completed" },
  { id: 2, title: "HR Policies", status: "In progress" },
  { id: 3, title: "Cybersecurity Awareness", status: "Pending" },
  { id: 4, title: "Department Orientation", status: "Pending" },
  { id: 5, title: "Tools and Systems Training", status: "Pending" }
];

const initialApprovals = [
  { id: 101, employee: "Aarav Sharma", type: "IT Access", status: "Pending" },
  { id: 102, employee: "Mira Patel", type: "Team Allocation", status: "Pending" },
  { id: 103, employee: "Kabir Rao", type: "Document Review", status: "Pending" }
];

const initialAgents = [
  ["Orchestrator Agent", "Active"],
  ["Document Verification Agent", "Completed"],
  ["Employee Registration Agent", "Completed"],
  ["IT Provisioning Agent", "Awaiting approval"],
  ["Team Allocation Agent", "In progress"],
  ["Training & Orientation Agent", "In progress"],
  ["Monitoring Agent", "Active"]
];

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [tasks, setTasks] = useState(initialTasks);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [logs, setLogs] = useState([
    "Employee profile created",
    "Training checklist assigned",
    "IT access approval requested"
  ]);

  const pending = approvals.filter(a => a.status === "Pending").length;
  const completed = tasks.filter(t => t.status === "Completed").length;

  function addLog(message) {
    setLogs(old => [message, ...old]);
  }

  function updateTask(id, status) {
    setTasks(old => old.map(t => t.id === id ? { ...t, status } : t));
    addLog(`Training task ${id} updated to ${status}`);
  }

  function decide(id, status) {
    setApprovals(old => old.map(a => a.id === id ? { ...a, status } : a));
    addLog(`Approval ${id}: ${status}`);
  }

  const nav = [
    ["Dashboard", LayoutDashboard],
    ["Employees", Users],
    ["Training", BookOpen],
    ["Approvals", ShieldCheck],
    ["AI Agents", Activity],
    ["Audit Logs", FileText]
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">EF <span>EnterpriseFlow AI</span></div>
        <p className="nav-label">WORKSPACE</p>

        {nav.map(([label, Icon]) => (
          <button
            key={label}
            className={`nav-item ${page === label ? "active" : ""}`}
            onClick={() => setPage(label)}
          >
            <Icon size={18} />
            {label}
            {label === "Approvals" && pending > 0 && (
              <span className="count">{pending}</span>
            )}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="online-dot" />
          Demo Workspace
          <small>Member 4 · Frontend & Training</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <small>EMPLOYEE OPERATIONS</small>
            <h1>{page}</h1>
          </div>
          <span className="demo-badge">● Demo Mode</span>
        </header>

        {page === "Dashboard" && (
          <>
            <section className="welcome">
              <h2>Employee onboarding overview 👋</h2>
              <p>Manage employee onboarding, training, and approvals.</p>
            </section>

            <section className="stats">
              <Stat icon={<Users />} label="Total Employees" value={employees.length} />
              <Stat icon={<CheckCircle />} label="Completed Onboarding"
                value={employees.filter(e => e.progress === 100).length} />
              <Stat icon={<Clock />} label="Pending Approvals" value={pending} />
              <Stat icon={<BookOpen />} label="Training Completed"
                value={`${completed}/${tasks.length}`} />
            </section>

            <section className="panel">
              <h3>Employee Onboarding</h3>
              <p className="muted">Progress of new employees</p>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Employee</th><th>Department</th><th>Progress</th></tr>
                  </thead>
                  <tbody>
                    {employees.map(e => (
                      <tr key={e.id}>
                        <td><b>{e.name}</b><small>{e.id}</small></td>
                        <td>{e.dept}</td>
                        <td><Progress value={e.progress} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <h3>AI Agent Activity</h3>
              <div className="agent-grid">
                {initialAgents.slice(0, 4).map(([name, status]) => (
                  <div className="agent-card" key={name}>
                    <Activity size={19} />
                    <b>{name}</b>
                    <Status value={status} />
                  </div>
                ))}
              </div>
              <button className="secondary" onClick={() => setPage("AI Agents")}>
                View all agents
              </button>
            </section>
          </>
        )}

        {page === "Employees" && (
          <section className="panel">
            <h3>Employee Directory</h3>
            {employees.map(e => (
              <div className="employee-row" key={e.id}>
                <div><b>{e.name}</b><small>{e.id} · {e.dept}</small></div>
                <Progress value={e.progress} />
              </div>
            ))}
          </section>
        )}

        {page === "Training" && (
          <section className="panel">
            <h3>Training & Orientation</h3>
            <p className="muted">Day 1 employee learning checklist</p>
            {tasks.map(t => (
              <div className="task-row" key={t.id}>
                <BookOpen size={20} />
                <b>{t.title}</b>
                <select value={t.status}
                  onChange={e => updateTask(t.id, e.target.value)}>
                  <option>Pending</option>
                  <option>In progress</option>
                  <option>Completed</option>
                </select>
              </div>
            ))}
            <p className="muted">
              {completed} of {tasks.length} tasks completed.
            </p>
          </section>
        )}

        {page === "Approvals" && (
          <section className="panel">
            <h3>Human Approval Queue</h3>
            <p className="muted">Review requests before onboarding continues.</p>
            {approvals.map(a => (
              <div className="approval-row" key={a.id}>
                <div>
                  <b>{a.type}</b>
                  <small>{a.employee} · Request #{a.id}</small>
                  <Status value={a.status} />
                </div>
                {a.status === "Pending" && (
                  <div className="actions">
                    <button onClick={() => decide(a.id, "Approved")}>Approve</button>
                    <button className="reject"
                      onClick={() => decide(a.id, "Rejected")}>Reject</button>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {page === "AI Agents" && (
          <section className="panel">
            <h3>AI Agent Monitoring</h3>
            {initialAgents.map(([name, status]) => (
              <div className="agent-row" key={name}>
                <Activity size={18} />
                <b>{name}</b>
                <Status value={status} />
              </div>
            ))}
          </section>
        )}

        {page === "Audit Logs" && (
          <section className="panel">
            <h3>Workflow Audit Logs</h3>
            <p className="muted">Recent events recorded by this demo UI.</p>
            {logs.map((log, i) => (
              <div className="log-row" key={`${log}-${i}`}>
                <FileText size={17} />
                <span>{log}</span>
                <small>Demo</small>
              </div>
            ))}
          </section>
        )}

        <footer>EnterpriseFlow AI · Employee Onboarding Automation</footer>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-heading">{label}<span>{icon}</span></div>
      <strong>{value}</strong>
      <small>Onboarding workspace</small>
    </div>
  );
}

function Progress({ value }) {
  return (
    <div className="progress">
      <div className="progress-track"><div style={{ width: `${value}%` }} /></div>
      <small>{value}%</small>
    </div>
  );
}

function Status({ value }) {
  return <span className={`status ${value.toLowerCase().replaceAll(" ", "-")}`}>
    {value}
  </span>;
}
