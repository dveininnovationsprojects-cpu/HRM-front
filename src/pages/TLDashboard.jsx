import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import { Users, ClipboardList, TrendingUp, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";
import api from "../api/apiConfig";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const TLDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [efficiency, setEfficiency] = useState("—");
  const [taskStats, setTaskStats] = useState({ assigned: 0, inProgress: 0, completed: 0 });
  const [tlInfo, setTlInfo] = useState({ name: "", email: "" });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const name = localStorage.getItem("fullName") || "Team Lead";
      const email = localStorage.getItem("email") || "";
      setTlInfo({ name, email });

      const projectRes = await api.get("/api/tl/dashboard/projects");
      const projectList = projectRes.data || [];
      setProjects(projectList);

      const tasksRes = await api.get("/api/tl/assigned-tasks").catch(() => ({ data: [] }));
      const tasks = tasksRes.data || [];
      setAllTasks(tasks);

      const assigned = tasks.filter(t => t.status === "ASSIGNED" || t.status === "PENDING").length;
      const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
      const completed = tasks.filter(t => t.status === "COMPLETED").length;
      
      setTaskStats({ assigned, inProgress, completed });
      
      const total = tasks.length;
      const eff = total > 0 ? Math.round((completed / total) * 100) : 0;
      setEfficiency(`${eff}%`);

      const teamRes = await api.get("/api/tl/my-team");
      setTeamMembers(teamRes.data || []);
    } catch (err) {
      console.error("TL dashboard data load failed", err);
    }
  };

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;
    if (!projectId) return;
    try {
      await api.get(`/api/tl/dashboard/projects/${projectId}/modules`);
    } catch (err) {
      console.error("Module load failed", err);
    }
  };

  return (
    <DashboardLayout role="TL" title="Team Lead Dashboard">
      <div style={styles.welcomeCard}>
        <div style={styles.welcomeContent}>
          <div>
            <h2 style={styles.welcomeTitle}>Welcome back, {tlInfo.name}! </h2>
            <p style={styles.welcomeText}>Here's what's happening with your team today.</p>
          </div>
         
        </div>
      </div>
      <div style={styles.cardsRow}>
        <StatCard
          title="My Team Members"
          value={teamMembers.length}
          icon={<Users />}
          color="#2563EB"
          subtext="Active Members"
        />

        <StatCard
          title="Total Tasks"
          value={allTasks.length}
          icon={<ClipboardList />}
          color="#8B5CF6"
          subtext="All Assigned"
        />

        <StatCard
          title="In Progress"
          value={taskStats.inProgress}
          icon={<Clock />}
          color="#3B82F6"
          subtext="Active Tasks"
        />

        <StatCard
          title="Completed"
          value={taskStats.completed}
          icon={<CheckCircle />}
          color="#10B981"
          subtext="Done"
        />

        <StatCard
          title="Efficiency"
          value={efficiency}
          icon={<TrendingUp />}
          color="#F59E0B"
          subtext="Completion Rate"
        />
      </div>

      <div style={styles.middleRow}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Team Members</h3>
          <div style={{ maxHeight: "350px", overflowY: "auto" }}>
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <div key={member.id} style={styles.memberCard}>
                  <div style={styles.memberAvatar}>
                    {(member.fullName || member.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.memberInfo}>
                    <div style={styles.memberName}>{member.fullName || member.name || "Employee"}</div>
                    <div style={styles.memberEmail}>{member.email || member.user?.username || "—"}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyText}>No team members found.</div>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>My Projects</h3>
          <div style={{ maxHeight: "350px", overflowY: "auto" }}>
            {projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.projectId} style={styles.projectCard}>
                  <div>
                    <div style={styles.projectName}>{project.projectName}</div>
                    <div style={styles.projectMeta}>
                      <span>{project.totalModules || 0} modules</span>
                      <span style={{ margin: "0 8px", color: "#CBD5E1" }}>•</span>
                      <span>{project.assignedModules || 0} assigned</span>
                    </div>
                  </div>
                  <span style={styles.statusBadge}>{project.status || "Active"}</span>
                </div>
              ))
            ) : (
              <div style={styles.emptyText}>No projects assigned.</div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.cardTitle}>Project Modules Overview</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={projects.map(p => ({
            name: p.projectName?.substring(0, 12) || "Project",
            total: p.totalModules || 0,
            assigned: p.assignedModules || 0
          }))} margin={{ top: 10, right: 20, left: 10, bottom: 60 }} barCategoryGap="20%">
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: "#64748B", fontWeight: "500" }} 
              angle={-25} 
              textAnchor="end" 
              height={80}
              stroke="#CBD5E1"
            />
            <YAxis 
              tick={{ fontSize: 11, fill: "#64748B", fontWeight: "500" }}
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
            <Bar dataKey="total" fill="url(#blueGradient)" name="Total Modules" radius={[10, 10, 0, 0]} barSize={35} />
            <Bar dataKey="assigned" fill="url(#greenGradient)" name="Assigned" radius={[10, 10, 0, 0]} barSize={35} />
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
};

const getStatusStyle = (status) => {
  if (status === "COMPLETED") return styles.completedBadge;
  if (status === "IN_PROGRESS") return styles.inProgressBadge;
  return styles.assignedBadge;
};

const styles = {
  welcomeCard: {
    background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
    padding: "30px",
    borderRadius: "18px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(37, 99, 235, 0.3)",
  },

  welcomeContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: "28px",
    fontWeight: "700",
    margin: 0,
    marginBottom: "8px",
  },

  welcomeText: {
    color: "#E0E7FF",
    fontSize: "16px",
    margin: 0,
  },

  welcomeIcon: {
    fontSize: "60px",
  },

  cardsRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "nowrap",
  },

  middleRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "30px",
  },

  card: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    padding: "25px",
    borderRadius: "20px",
    boxShadow: "0 8px 32px rgba(37, 99, 235, 0.1)",
    border: "1px solid rgba(226, 232, 240, 0.6)",
  },

  chartCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    padding: "28px",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(59, 130, 246, 0.15)",
    border: "1px solid rgba(226, 232, 240, 0.7)",
  },

  cardTitle: {
    marginBottom: "20px",
    color: "#0F172A",
    fontSize: "20px",
    fontWeight: "700",
  },

  statusBadge: {
    background: "#EAF2FF",
    color: "#2563EB",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
  },

  assignedBadge: {
    background: "#F1F5F9",
    color: "#64748B",
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
  },

  inProgressBadge: {
    background: "#EAF2FF",
    color: "#3B82F6",
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
  },

  completedBadge: {
    background: "#DCFCE7",
    color: "#10B981",
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
  },

  projectCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "#F8FAFC",
    borderRadius: "12px",
    marginBottom: "12px",
    border: "1px solid #E2E8F0",
  },

  projectName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: "6px",
  },

  projectMeta: {
    fontSize: "13px",
    color: "#64748B",
  },

  memberCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    background: "#F8FAFC",
    borderRadius: "12px",
    marginBottom: "10px",
    border: "1px solid #E2E8F0",
  },

  memberAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3B82F6, #2563EB)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "700",
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: "4px",
  },

  memberEmail: {
    fontSize: "13px",
    color: "#64748B",
  },

  emptyText: {
    textAlign: "center",
    padding: "45px",
    color: "#94A3B8",
    fontSize: "15px",
  },
};

export default TLDashboard;