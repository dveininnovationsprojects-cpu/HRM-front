import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import { Users, ClipboardList, TrendingUp, Send } from "lucide-react";
import api from "../api/apiConfig";

const TLDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [modules, setModules] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const projectRes = await api.get("/api/tl/dashboard/projects");
      console.log("Projects response:", projectRes.data);
      setProjects(projectRes.data || []);

      const teamRes = await api.get("/api/tl/my-team");
      setTeamMembers(teamRes.data || []);
    } catch (err) {
      console.error("TL dashboard data load failed", err);
    }
  };

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    setSelectedModule("");
    setModules([]);
    if (!projectId) return;
    try {
      const res = await api.get(`/api/tl/dashboard/projects/${projectId}/modules`);
      setModules(res.data || []);
    } catch (err) {
      console.error("Module load failed", err);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedProject || !selectedModule || !selectedEmployee || !deadline) {
      alert("Please select project, module, employee and deadline");
      return;
    }

    try {
      await api.post("/api/tl/assign", {
        moduleId: Number(selectedModule),
        employeeId: Number(selectedEmployee),
        deadline: deadline,
      });

      alert("Task assigned successfully");

      setSelectedProject("");
      setSelectedModule("");
      setSelectedEmployee("");
      setDeadline("");
      setModules([]);

      loadDashboardData();
    } catch (err) {
      console.error("Task assign failed", err);
      alert("Task assign failed");
    }
  };

  return (
    <DashboardLayout role="TL" title="Team Lead Dashboard">
      <div style={styles.cardsRow}>
        <StatCard
          title="My Team Members"
          value={teamMembers.length}
          icon={<Users />}
          color="#2563EB"
          subtext="Active Members"
        />

        <StatCard
          title="Assigned Projects"
          value={projects.length}
          icon={<ClipboardList />}
          color="#14B8A6"
          subtext="In Progress"
        />

        <StatCard
          title="Efficiency"
          value="88%"
          icon={<TrendingUp />}
          color="#F59E0B"
          subtext="Team Avg"
        />
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Assigned Projects</h3>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Project Name</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Total Modules</th>
                <th style={styles.th}>Assigned Modules</th>
              </tr>
            </thead>

            <tbody>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project.id}>
                    <td style={styles.td}>
                      {project.projectName || project.name || "Unnamed Project"}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.statusBadge}>
                        {project.status || "In Progress"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {project.totalModules || 0}
                    </td>

                    <td style={styles.td}>
                      {project.assignedModules || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={styles.emptyText}>
                    No assigned projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Assign New Task</h3>

          <p style={styles.desc}>
            Select project, module and assign to team member.
          </p>

          <div style={styles.form}>
            <select
              value={selectedProject}
              onChange={handleProjectChange}
              style={styles.input}
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </option>
              ))}
            </select>

            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              style={styles.input}
              disabled={!selectedProject}
            >
              <option value="">Select Module</option>
              {modules.map((module) => (
                <option key={module.moduleId} value={module.moduleId}>
                  {module.moduleName}
                </option>
              ))}
            </select>

            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={styles.input}
            >
              <option value="">Select Employee</option>
              {teamMembers.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name || emp.employeeName || emp.user?.username || "Employee"}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={styles.input}
            />

            <button onClick={handleAssignTask} style={styles.button}>
              <Send size={18} />
              Assign Module
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const styles = {
  cardsRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "30px",
  },

  card: {
    background: "#FFFFFF",
    padding: "25px",
    borderRadius: "18px",
    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.08)",
    border: "1px solid #E2E8F0",
  },

  cardTitle: {
    marginBottom: "20px",
    color: "#0F172A",
    fontSize: "24px",
    fontWeight: "700",
  },

  desc: {
    fontSize: "14px",
    color: "#64748B",
    marginBottom: "20px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "12px 8px",
    color: "#64748B",
    fontSize: "14px",
    borderBottom: "1px solid #E2E8F0",
  },

  td: {
    padding: "15px 8px",
    color: "#0F172A",
    fontSize: "14px",
    borderBottom: "1px solid #F1F5F9",
  },

  statusBadge: {
    background: "#EAF2FF",
    color: "#2563EB",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
  },

  emptyText: {
    textAlign: "center",
    padding: "45px",
    color: "#94A3B8",
    fontSize: "15px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    width: "100%",
    padding: "13px",
    borderRadius: "10px",
    border: "1px solid #DCE6F2",
    fontSize: "14px",
    outline: "none",
    background: "#FFFFFF",
  },

  button: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg,#2563EB,#3B82F6)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default TLDashboard;