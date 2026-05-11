import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";
import { TrendingUp, Clock, CheckCircle, Filter } from "lucide-react";
import api from "../../api/apiConfig";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const TLPerformance = () => {
  const [projects, setProjects] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [filterProject, setFilterProject] = useState("");

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      const projectRes = await api.get("/api/tl/dashboard/projects");
      const list = projectRes.data || [];
      setProjects(list);
      
      // Get assigned tasks with actual status
      const tasksRes = await api.get("/api/tl/assigned-tasks").catch(() => ({ data: [] }));
      const tasks = tasksRes.data || [];
      
      // Load all modules
      const modResults = await Promise.all(
        list.map(async (p) => {
          const modRes = await api.get(`/api/tl/dashboard/projects/${p.projectId}/modules`).catch(() => ({ data: [] }));
          const modules = modRes.data || [];
          
          return modules.map((m) => {
            const task = tasks.find(t => t.module?.id === m.moduleId || String(t.module?.id) === String(m.moduleId));
            return {
              ...m,
              projectName: p.projectName,
              projectId: p.projectId,
              actualHours: task?.actualHoursTaken || m.actualHours || 0,
              deadline: task?.deadline || m.deadline || "-",
              status: task?.status || m.status
            };
          });
        })
      );
      
      setAllModules(modResults.flat());
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filterProject
    ? allModules.filter((m) => String(m.projectId) === String(filterProject))
    : allModules;

  const assigned = filtered.filter((m) => m.assignedToId !== null);
  const completed = filtered.filter((m) => m.status === "COMPLETED").length;
  const inProgress = filtered.filter((m) => m.status === "IN_PROGRESS").length;
  const pending = filtered.filter((m) => m.status === "ASSIGNED" || m.status === "PENDING").length;
  const efficiency = assigned.length > 0 ? Math.min(100, Math.round((completed / assigned.length) * 100)) : 0;

  // Chart data
  const statusChartData = [
    { name: "Assigned", value: pending, color: "#8B5CF6" },
    { name: "In Progress", value: inProgress, color: "#3B82F6" },
    { name: "Completed", value: completed, color: "#10B981" }
  ].filter(d => d.value > 0);

  const hoursChartData = filtered.filter(m => m.assignedToId).map(m => ({
    name: m.moduleName?.substring(0, 15) + "...",
    estimated: m.estimatedHours || 0,
    actual: m.actualHours || 0
  })).slice(0, 5);

  const statusStyle = (status) => {
    if (status === "COMPLETED") return S.completed;
    if (status === "IN_PROGRESS") return S.inprogress;
    if (status === "ASSIGNED" || status === "STARTED" || status === "PENDING") return S.assigned;
    return S.pending;
  };

  const statusLabel = (status) => {
    if (status === "IN_PROGRESS") return "IN PROGRESS";
    if (status === "COMPLETED") return "COMPLETED";
    if (status === "ASSIGNED" || status === "STARTED" || status === "PENDING") return "ASSIGNED";
    return status || "ASSIGNED";
  };

  return (
    <DashboardLayout role="TL" title="Performance Analytics">
      <div style={S.row}>
        <StatCard title="Total Modules" value={filtered.length} icon={<Clock />} color="#3B82F6" subtext="All Projects" />
        <StatCard title="In Progress" value={inProgress} icon={<TrendingUp />} color="#3B82F6" subtext="Active" />
        <StatCard title="Completed" value={completed} icon={<CheckCircle />} color="#10B981" subtext="Done" />
        <StatCard title="Efficiency" value={`${efficiency}%`} icon={<TrendingUp />} color="#F59E0B" subtext="Completion Rate" />
      </div>

      <div style={S.chartsGrid}>
        <div style={S.chartCard}>
          <h3 style={S.chartTitle}>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie 
                data={statusChartData} 
                cx="50%" 
                cy="50%" 
                innerRadius={70} 
                outerRadius={100} 
                paddingAngle={5} 
                dataKey="value" 
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {statusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)", 
                  borderRadius: "12px", 
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                }} 
              />
              <Legend 
                verticalAlign="bottom" 
                height={40}
                iconType="circle"
                wrapperStyle={{ fontSize: "13px", fontWeight: "600" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={S.chartCard}>
          <h3 style={S.chartTitle}>Hours Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hoursChartData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }} barCategoryGap="20%">
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: "#64748B" }} 
                angle={-20} 
                textAnchor="end" 
                height={70}
                stroke="#CBD5E1"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "#64748B" }}
                stroke="#CBD5E1"
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px", 
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                }} 
                cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
              />
              <Legend 
                wrapperStyle={{ fontSize: "13px", fontWeight: "600" }}
                iconType="circle"
              />
              <Bar dataKey="estimated" fill="url(#orangeGradient)" name="Estimated" radius={[10, 10, 0, 0]} barSize={30} />
              <Bar dataKey="actual" fill="url(#greenGradient)" name="Actual" radius={[10, 10, 0, 0]} barSize={30} />
              <defs>
                <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FCD34D" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.header}>
          <h3 style={S.title}>Module Performance</h3>
          <div style={S.filterRow}>
            <Filter size={16} color="#64748B" />
            <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} style={S.select}>
              <option value="">All Projects</option>
              {projects.map((p) => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
            </select>
          </div>
        </div>

        <div style={S.tableContainer}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Module", "Assigned To", "Deadline", "Est.", "Actual", "Status"].map((h, idx) => (
                  <th key={h} style={{...S.th, ...(idx === 0 ? {borderTopLeftRadius: "12px"} : idx === 5 ? {borderTopRightRadius: "12px"} : {})}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((m, i) => (
                <tr key={i} style={S.tr}>
                  <td style={S.td}><span style={S.moduleName}>{m.moduleName || "—"}</span></td>
                  <td style={S.td}>{m.assignedToName || <span style={{ color: "#94A3B8" }}>Unassigned</span>}</td>
                  <td style={S.td}>{m.deadline || "—"}</td>
                  <td style={S.td}><span style={S.estHours}>{m.estimatedHours ?? "—"}h</span></td>
                  <td style={S.td}>
                    {m.actualHours > 0 ? (
                      <span style={S.actualHours}>{m.actualHours}h</span>
                    ) : "—"}
                  </td>
                  <td style={S.td}>
                    <span style={statusStyle(m.status)}>{statusLabel(m.status)}</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={S.empty}>No modules found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

const S = {
  row: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
    gap: "20px", 
    marginBottom: "30px" 
  },
  
  chartsGrid: { 
    display: "grid", 
    gridTemplateColumns: "1fr 1fr", 
    gap: "24px", 
    marginBottom: "24px" 
  },
  
  card: { 
    background: "#FFFFFF", 
    padding: "28px", 
    borderRadius: "20px", 
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", 
    border: "1px solid #E2E8F0" 
  },
  
  chartCard: { 
    background: "#FFFFFF", 
    padding: "24px", 
    borderRadius: "20px", 
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", 
    border: "1px solid #E2E8F0"
  },
  
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "24px" 
  },
  
  title: { 
    color: "#0F172A", 
    fontSize: "20px", 
    fontWeight: "700", 
    margin: 0 
  },
  
  chartTitle: { 
    color: "#0F172A", 
    fontSize: "17px", 
    fontWeight: "700", 
    margin: 0,
    marginBottom: "20px",
    textAlign: "center"
  },
  
  filterRow: { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px" 
  },
  
  select: { 
    padding: "10px 16px", 
    borderRadius: "12px", 
    border: "1px solid #E2E8F0", 
    fontSize: "14px", 
    outline: "none", 
    background: "#F8FAFC", 
    color: "#0F172A",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  
  tableContainer: {
    maxHeight: "400px",
    overflowY: "auto",
    overflowX: "auto"
  },
  
  table: { 
    width: "100%", 
    borderCollapse: "collapse" 
  },
  
  th: { 
    textAlign: "left", 
    padding: "14px 12px", 
    color: "#FFFFFF", 
    fontSize: "13px", 
    fontWeight: "700",
    background: "linear-gradient(135deg, #2563EB, #3B82F6)",
    borderBottom: "none",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    position: "sticky",
    top: 0,
    zIndex: 1
  },
  
  tr: {
    transition: "background 0.2s",
    cursor: "pointer"
  },
  
  td: { 
    padding: "15px 12px", 
    color: "#0F172A", 
    fontSize: "14px", 
    borderBottom: "1px solid #E2E8F0",
    background: "#FAFBFF"
  },
  
  moduleName: {
    fontWeight: "600",
    color: "#1E293B"
  },
  
  estHours: {
    color: "#F59E0B",
    fontWeight: "600"
  },
  
  actualHours: {
    color: "#10B981",
    fontWeight: "700"
  },
  
  assigned: { 
    background: "#F1F5F9", 
    color: "#64748B", 
    padding: "6px 12px", 
    borderRadius: "10px", 
    fontSize: "11px", 
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  
  completed: { 
    background: "#D1FAE5", 
    color: "#059669", 
    padding: "6px 12px", 
    borderRadius: "10px", 
    fontSize: "11px", 
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  
  inprogress: { 
    background: "#DBEAFE", 
    color: "#1D4ED8", 
    padding: "6px 12px", 
    borderRadius: "10px", 
    fontSize: "11px", 
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  
  pending: { 
    background: "#FEF3C7", 
    color: "#B45309", 
    padding: "6px 12px", 
    borderRadius: "10px", 
    fontSize: "11px", 
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  
  empty: { 
    textAlign: "center", 
    padding: "50px", 
    color: "#94A3B8",
    fontSize: "15px"
  },
};

export default TLPerformance;