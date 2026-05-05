import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";
import { Briefcase, CheckCircle, Clock } from "lucide-react";
import api from "../../api/apiConfig";

const TLProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/api/tl/dashboard/projects")
      .then((res) => setProjects(res.data || []))
      .catch((err) => console.error("Failed to load projects", err));
  }, []);

  const total = projects.length;
  const completed = projects.filter((p) => p.status === "COMPLETED").length;
  const inProgress = total - completed;

  return (
    <DashboardLayout role="TL" title="My Projects">
      <div style={S.row}>
        <StatCard title="Total Projects" value={total} icon={<Briefcase />} color="#2563EB" subtext="Assigned to you" />
        <StatCard title="In Progress" value={inProgress} icon={<Clock />} color="#F59E0B" subtext="Active" />
        <StatCard title="Completed" value={completed} icon={<CheckCircle />} color="#16A34A" subtext="Done" />
      </div>

      <div style={S.card}>
        <h3 style={S.title}>Assigned Projects</h3>
        <table style={S.table}>
          <thead>
            <tr>
              {["Project Name", "Status", "Total Modules", "Assigned Modules"].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? projects.map((p) => (
              <tr key={p.projectId}>
                <td style={S.td}>{p.projectName}</td>
                <td style={S.td}><span style={S.badge}>{p.status || "In Progress"}</span></td>
                <td style={S.td}>{p.totalModules || 0}</td>
                <td style={S.td}>{p.assignedModules || 0}</td>
              </tr>
            )) : (
              <tr><td colSpan="4" style={S.empty}>No projects found.</td></tr>
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
  title: { marginBottom: "20px", color: "#0F172A", fontSize: "22px", fontWeight: "700" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 8px", color: "#64748B", fontSize: "14px", borderBottom: "1px solid #DCE6F2" },
  td: { padding: "15px 8px", color: "#0F172A", fontSize: "14px", borderBottom: "1px solid #F5F9FF" },
  badge: { background: "#EAF2FF", color: "#2563EB", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  empty: { textAlign: "center", padding: "40px", color: "#94A3B8" },
};

export default TLProjects;
