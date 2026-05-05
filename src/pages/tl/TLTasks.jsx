import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Send, Filter } from "lucide-react";
import api from "../../api/apiConfig";

const TLTasks = () => {
  const [projects, setProjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [team, setTeam] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [filterProject, setFilterProject] = useState("");

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [deadline, setDeadline] = useState("");

  const loadAllTasks = async (projectList) => {
    try {
      const results = await Promise.all(
        projectList.map((p) =>
          api.get(`/api/tl/dashboard/projects/${p.projectId}/modules`)
            .then((r) => (r.data || [])
              .filter((m) => m.assignedToId !== null)
              .map((m) => ({ ...m, projectName: p.projectName, projectId: p.projectId }))
            )
            .catch(() => [])
        )
      );
      setAllTasks(results.flat());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    api.get("/api/tl/dashboard/projects").then((r) => {
      const list = r.data || [];
      setProjects(list);
      loadAllTasks(list);
    }).catch(console.error);
    api.get("/api/tl/my-team").then((r) => setTeam(r.data || [])).catch(console.error);
  }, []);

  const handleProjectChange = async (e) => {
    const id = e.target.value;
    setSelectedProject(id);
    setSelectedModule("");
    setModules([]);
    if (!id) return;
    try {
      const res = await api.get(`/api/tl/dashboard/projects/${id}/modules`);
      setModules(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleAssign = async () => {
    if (!selectedProject || !selectedModule || !selectedEmployee || !deadline)
      return alert("Please fill all fields");
    try {
      await api.post("/api/tl/assign", {
        moduleId: Number(selectedModule),
        employeeId: Number(selectedEmployee),
        deadline,
      });
      alert("Task assigned successfully");
      setSelectedModule(""); setSelectedEmployee(""); setDeadline("");
      const res = await api.get(`/api/tl/dashboard/projects/${selectedProject}/modules`);
      setModules(res.data || []);
      // Reload all tasks
      const projRes = await api.get("/api/tl/dashboard/projects");
      const list = projRes.data || [];
      setProjects(list);
      loadAllTasks(list);
    } catch (err) { console.error(err); alert("Assign failed"); }
  };

  const filteredTasks = filterProject
    ? allTasks.filter((t) => String(t.projectId) === String(filterProject))
    : allTasks;

  return (
    <DashboardLayout role="TL" title="Assign Tasks">
      <div style={S.grid}>
        {/* Assign Form */}
        <div style={S.card}>
          <h3 style={S.title}>Assign New Task</h3>
          <div style={S.form}>
            <select value={selectedProject} onChange={handleProjectChange} style={S.input}>
              <option value="">Select Project</option>
              {projects.map((p) => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
            </select>
            <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} style={S.input} disabled={!selectedProject}>
              <option value="">Select Module</option>
              {modules.map((m) => <option key={m.moduleId} value={m.moduleId}>{m.moduleName}</option>)}
            </select>
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} style={S.input}>
              <option value="">Select Employee</option>
              {team.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName || emp.name || emp.user?.username || "Employee"}
                </option>
              ))}
            </select>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={S.input} />
            <button onClick={handleAssign} style={S.button}><Send size={18} /> Assign Module</button>
          </div>
        </div>

        {/* Assigned Tasks */}
        <div style={S.card}>
          <div style={S.tableHeader}>
            <h3 style={S.title}>Assigned Tasks</h3>
            <div style={S.filterRow}>
              <Filter size={16} color="#64748B" />
              <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} style={S.filterSelect}>
                <option value="">All Projects</option>
                {projects.map((p) => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
              </select>
            </div>
          </div>
          <table style={S.table}>
            <thead>
              <tr>{["Project", "Module", "Assigned To", "Deadline", "Status"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? filteredTasks.map((t, i) => (
                <tr key={i}>
                  <td style={S.td}>{t.projectName || "—"}</td>
                  <td style={S.td}>{t.moduleName || "—"}</td>
                  <td style={S.td}>{t.assignedToName || "—"}</td>
                  <td style={S.td}>{t.deadline || "—"}</td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, ...(t.status === "COMPLETED" ? S.done : t.status === "STARTED" ? S.started : {}) }}>
                      {t.status || "PENDING"}
                    </span>
                  </td>
                </tr>
              )) : <tr><td colSpan="5" style={S.empty}>No tasks assigned yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

const S = {
  grid: { display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "30px" },
  card: { background: "#FFFFFF", padding: "25px", borderRadius: "18px", boxShadow: "0 10px 25px rgba(37,99,235,0.08)", border: "1px solid #DCE6F2" },
  title: { color: "#0F172A", fontSize: "20px", fontWeight: "700", margin: 0 },
  desc: { fontSize: "14px", color: "#64748B", marginBottom: "20px", marginTop: "8px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { width: "100%", padding: "13px", borderRadius: "10px", border: "1px solid #DCE6F2", fontSize: "14px", outline: "none", background: "#FFFFFF", boxSizing: "border-box" },
  button: { width: "100%", padding: "14px", background: "linear-gradient(135deg,#2563EB,#3B82F6)", color: "#FFFFFF", border: "none", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  filterRow: { display: "flex", alignItems: "center", gap: "8px" },
  filterSelect: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #DCE6F2", fontSize: "13px", outline: "none", background: "#F5F9FF", color: "#0F172A" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 8px", color: "#64748B", fontSize: "13px", borderBottom: "1px solid #DCE6F2" },
  td: { padding: "13px 8px", color: "#0F172A", fontSize: "13px", borderBottom: "1px solid #F5F9FF" },
  badge: { background: "#FEF9C3", color: "#CA8A04", padding: "5px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  started: { background: "#EAF2FF", color: "#2563EB" },
  done: { background: "#DCFCE7", color: "#16A34A" },
  empty: { textAlign: "center", padding: "40px", color: "#94A3B8" },
};

export default TLTasks;
