import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Send, Filter } from "lucide-react";
import api from "../../api/apiConfig";

import toast from "react-hot-toast";

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
      const modResults = await Promise.all(
        projectList.map((p) =>
          api.get(`/api/tl/dashboard/projects/${p.projectId}/modules`)
            .then((r) => (r.data || [])
              .filter((m) => m.assignedToId !== null)
              .map((m) => ({ ...m, projectName: p.projectName, projectId: p.projectId }))
            )
            .catch(() => [])
        )
      );
      const allMods = modResults.flat();

      // Get task details from employee tasks endpoint for each team member
      const teamRes = await api.get("/api/tl/my-team").catch(() => ({ data: [] }));
      const teamIds = (teamRes.data || []).map((e) => e.id);

      const taskResults = await Promise.all(
        teamIds.map((id) =>
          api.get(`/api/employee/tasks`, { headers: {} })
            .catch(() => ({ data: [] }))
        )
      );

      // Use TL's own task view - get all tasks via assigned-tasks
      const tasksRes = await api.get("/api/tl/assigned-tasks").catch(() => ({ data: [] }));
      const tasks = tasksRes.data || [];

      const merged = allMods.map((m) => {
        const task = tasks.find((t) =>
          t.module?.id === m.moduleId ||
          String(t.module?.id) === String(m.moduleId)
        );
        return {
          ...m,
          actualHours: task?.actualHoursTaken ?? 0,
          remarks: task?.workLogs?.map(w => w.remarks).filter(Boolean).join(", ") || "—",
          status: task ? task.status : m.status,
          deadline: task?.deadline || "—",
          assignedDate: task?.assignedDate || task?.createdAt || "—",
        };
      });
      setAllTasks(merged);
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
      return toast.error("Please fill all fields");
    try {
      await api.post("/api/tl/assign", {
        moduleId: Number(selectedModule),
        employeeId: Number(selectedEmployee),
        deadline,
      });
      toast.success("Task assigned successfully");
      setSelectedModule(""); setSelectedEmployee(""); setDeadline("");
      const res = await api.get(`/api/tl/dashboard/projects/${selectedProject}/modules`);
      setModules(res.data || []);
      const projRes = await api.get("/api/tl/dashboard/projects");
      const list = projRes.data || [];
      setProjects(list);
      loadAllTasks(list);
    } catch (err) { console.error(err); toast.error("Assign failed"); }
  };

  const filteredTasks = filterProject
    ? allTasks.filter((t) => String(t.projectId) === String(filterProject))
    : allTasks;

  return (
    <DashboardLayout role="TL" title="Assign Tasks">
      {/* Assign Form - Full width on top */}
      <div style={S.formCard}>
        <h3 style={S.title}>Assign New Task</h3>
        <div style={S.formGrid}>
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

      {/* Assigned Tasks Table */}
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
            <tr>{["Project", "Module", "Assigned To", "Assigned Date", "Deadline", "Est. Hrs", "Status"].map((h, idx) => <th key={h} style={{...S.th, ...(idx === 0 ? {borderTopLeftRadius: "12px"} : idx === 6 ? {borderTopRightRadius: "12px"} : {}), ...(idx === 5 ? {width: "90px", textAlign: "center"} : {})}}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? filteredTasks.map((t, i) => (
              <tr key={i}>
                <td style={S.td}>{t.projectName || "—"}</td>
                <td style={S.td}>{t.moduleName || "—"}</td>
                <td style={S.td}>{t.assignedToName || "—"}</td>
                <td style={S.td}><span style={S.dateText}>{t.assignedDate || "—"}</span></td>
                <td style={{...S.td, whiteSpace: "nowrap"}}><span style={S.deadlineText}>{t.deadline || "—"}</span></td>
                <td style={{...S.td, width: "90px", textAlign: "center", fontWeight: "600", color: "#F59E0B"}}>{t.estimatedHours || t.estimatedHoursTaken || "—"}</td>
                <td style={S.td}>
                  <span style={{
                    ...S.badge,
                    ...(t.status === "COMPLETED" ? S.done
                      : t.status === "IN_PROGRESS" ? S.started
                      : t.status === "ASSIGNED" ? S.assigned
                      : {})
                  }}>
                    {t.status === "IN_PROGRESS" ? "IN PROGRESS"
                      : t.status === "ASSIGNED" ? "ASSIGNED"
                      : t.status === "COMPLETED" ? "COMPLETED"
                      : t.status || "ASSIGNED"}
                  </span>
                </td>
              </tr>
            )) : <tr><td colSpan="7" style={S.empty}>No tasks assigned yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

const S = {
  formCard: { background: "#FFFFFF", padding: "25px", borderRadius: "18px", boxShadow: "0 10px 25px rgba(37,99,235,0.08)", border: "1px solid #DCE6F2", marginBottom: "24px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "end", marginTop: "16px" },
  card: { background: "#FFFFFF", padding: "25px", borderRadius: "18px", boxShadow: "0 10px 25px rgba(37,99,235,0.08)", border: "1px solid #DCE6F2" },
  title: { color: "#0F172A", fontSize: "20px", fontWeight: "700", margin: 0 },
  input: { width: "100%", padding: "13px", borderRadius: "10px", border: "1px solid #DCE6F2", fontSize: "14px", outline: "none", background: "#FFFFFF", boxSizing: "border-box" },
  button: { padding: "13px 20px", background: "linear-gradient(135deg,#2563EB,#3B82F6)", color: "#FFFFFF", border: "none", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  filterRow: { display: "flex", alignItems: "center", gap: "8px" },
  filterSelect: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #DCE6F2", fontSize: "13px", outline: "none", background: "#F5F9FF", color: "#0F172A" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "14px 12px", color: "#FFFFFF", fontSize: "13px", fontWeight: "700", background: "linear-gradient(135deg, #2563EB, #3B82F6)", borderBottom: "none", textTransform: "uppercase", letterSpacing: "0.5px" },
  td: { padding: "15px 12px", color: "#0F172A", fontSize: "14px", borderBottom: "1px solid #E2E8F0", background: "#FAFBFF" },
  dateText: { color: "#3B82F6", fontWeight: "600" },
  deadlineText: { color: "#F59E0B", fontWeight: "600" },
  badge: { background: "#FEF9C3", color: "#CA8A04", padding: "5px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  assigned: { background: "#F1F5F9", color: "#64748B" },
  started: { background: "#EAF2FF", color: "#2563EB" },
  done: { background: "#DCFCE7", color: "#16A34A" },
  empty: { textAlign: "center", padding: "40px", color: "#94A3B8" },
};

export default TLTasks;
