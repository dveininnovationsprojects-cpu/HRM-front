import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";
import { TrendingUp, Clock, CheckCircle } from "lucide-react";
import api from "../../api/apiConfig";

const TLPerformance = () => {
  const [projects, setProjects] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");

  useEffect(() => {
    api.get("/api/tl/dashboard/projects").then((r) => setProjects(r.data || [])).catch(console.error);
  }, []);

  const handleProjectSelect = async (e) => {
    const id = e.target.value;
    setSelectedProject(id);
    setPerformance(null);
    if (!id) return;
    try {
      const res = await api.get(`/api/performance/projects/${id}`);
      setPerformance(res.data);
    } catch (err) { console.error(err); }
  };

  const modules = performance?.modules || [];

  return (
    <DashboardLayout role="TL" title="Performance Analytics">
      <div style={S.row}>
        <StatCard title="Estimated Hours" value={performance?.totalEstimatedHours ?? "—"} icon={<Clock />} color="#2563EB" subtext="Planned" />
        <StatCard title="Actual Hours" value={performance?.totalActualHours ?? "—"} icon={<TrendingUp />} color="#F59E0B" subtext="Logged" />
        <StatCard title="Efficiency" value={performance ? `${performance.efficiency ?? "—"}%` : "—"} icon={<CheckCircle />} color="#16A34A" subtext="Team Avg" />
      </div>

      <div style={S.card}>
        <div style={S.header}>
          <h3 style={S.title}>Module Performance</h3>
          <select value={selectedProject} onChange={handleProjectSelect} style={S.select}>
            <option value="">Select Project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.projectName || p.name}</option>)}
          </select>
        </div>

        <table style={S.table}>
          <thead>
            <tr>{["Module", "Employee", "Estimated Hrs", "Actual Hrs", "Status"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {modules.length > 0 ? modules.map((m, i) => (
              <tr key={i}>
                <td style={S.td}>{m.moduleName || "—"}</td>
                <td style={S.td}>{m.employeeName || "—"}</td>
                <td style={S.td}>{m.estimatedHours ?? "—"}</td>
                <td style={S.td}>{m.actualHours ?? "—"}</td>
                <td style={S.td}>
                  <span style={m.status === "Satisfied" ? S.satisfied : S.lagging}>
                    {m.status || "—"}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={S.empty}>{selectedProject ? "No data available." : "Select a project to view performance."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

const S = {
  row: { display: "flex", gap: "20px", marginBottom: "30px" },
  card: { background: "#FFFFFF", padding: "25px", borderRadius: "18px", boxShadow: "0 10px 25px rgba(37,99,235,0.08)", border: "1px solid #DCE6F2" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  title: { color: "#0F172A", fontSize: "22px", fontWeight: "700", margin: 0 },
  select: { padding: "10px 14px", borderRadius: "10px", border: "1px solid #DCE6F2", fontSize: "14px", outline: "none", background: "#FFFFFF", color: "#0F172A" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 8px", color: "#64748B", fontSize: "14px", borderBottom: "1px solid #DCE6F2" },
  td: { padding: "15px 8px", color: "#0F172A", fontSize: "14px", borderBottom: "1px solid #F5F9FF" },
  satisfied: { background: "#DCFCE7", color: "#16A34A", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  lagging: { background: "#FEF2F2", color: "#DC2626", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  empty: { textAlign: "center", padding: "40px", color: "#94A3B8" },
};

export default TLPerformance;
