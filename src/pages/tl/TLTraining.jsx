import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Send, Trophy, BookOpen } from "lucide-react";
import api from "../../api/apiConfig";

const TLTraining = () => {
  const [trainees, setTrainees] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [form, setForm] = useState({ traineeId: "", taskTitle: "", description: "", startDate: "", deadline: "" });

  const loadTasks = () =>
    api.get("/api/trainer/assigned-tasks").then((r) => setAssignedTasks(r.data || [])).catch(console.error);

  useEffect(() => {
    api.get("/api/tl/my-team").then((r) => setTrainees(r.data || [])).catch(console.error);
    api.get("/api/trainer/ranking").then((r) => setRanking(r.data || [])).catch(console.error);
    loadTasks();
  }, []);

  const handleAssign = async () => {
    const { traineeId, taskTitle, deadline } = form;
    if (!traineeId || !taskTitle || !deadline) return alert("Fill all required fields");
    try {
      await api.post("/api/trainer/assign-task", {
        traineeId: Number(traineeId),
        taskTitle: form.taskTitle,
        description: form.description,
        startDate: form.startDate,
        deadline,
      });
      alert("Trainee task assigned successfully");
      setForm({ traineeId: "", taskTitle: "", description: "", startDate: "", deadline: "" });
      loadTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to assign task");
    }
  };

  const statusStyle = (status) => {
    if (status === "COMPLETED") return S.done;
    if (status === "IN_PROGRESS" || status === "STARTED") return S.progress;
    return S.pending;
  };

  return (
    <DashboardLayout role="TL" title="Trainee Tasks">
      <div style={S.topGrid}>

        {/* Assign Form */}
        <div style={S.card}>
          <h3 style={S.title}>Assign Task to Trainee</h3>
          <p style={S.desc}>Select trainee and fill task details.</p>
          <div style={S.form}>
            <select value={form.traineeId} onChange={(e) => setForm({ ...form, traineeId: e.target.value })} style={S.input}>
              <option value="">Select Trainee</option>
              {trainees.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName || t.name || t.user?.username || "Trainee"}
                </option>
              ))}
            </select>
            <input
              placeholder="Task Title *"
              value={form.taskTitle}
              onChange={(e) => setForm({ ...form, taskTitle: e.target.value })}
              style={S.input}
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ ...S.input, height: "70px", resize: "vertical" }}
            />
            <label style={S.label}>Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              style={S.input}
            />
            <label style={S.label}>Deadline *</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              style={S.input}
            />
            <button onClick={handleAssign} style={S.button}>
              <Send size={18} /> Assign Task
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div style={S.card}>
          <h3 style={S.title}>Trainee Leaderboard</h3>
          <div style={S.rankList}>
            {ranking.length > 0 ? ranking.map((r, i) => (
              <div key={r.id || i} style={S.rankRow}>
                <div style={{ ...S.rank, color: i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : i === 2 ? "#B45309" : "#64748B" }}>
                  <Trophy size={16} /> #{i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={S.rankName}>{r.fullName || r.name || r.employeeName || "Trainee"}</div>
                  <div style={S.rankSub}>{r.designation || r.designationStatus || "Trainee"}</div>
                </div>
                <div style={S.score}>{r.score || r.efficiency || "—"}</div>
              </div>
            )) : <p style={S.empty}>No ranking data available.</p>}
          </div>
        </div>
      </div>

      {/* Assigned Tasks Table */}
      <div style={{ ...S.card, marginTop: "30px" }}>
        <h3 style={S.title}><BookOpen size={20} style={{ marginRight: "8px" }} />Assigned Trainee Tasks</h3>
        <table style={S.table}>
          <thead>
            <tr>
              {["Trainee", "Task Title", "Description", "Start Date", "Deadline", "Status"].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assignedTasks.length > 0 ? assignedTasks.map((t, i) => (
              <tr key={t.id || i}>
                <td style={S.td}>{t.traineeName || t.trainee?.fullName || t.trainee?.name || "—"}</td>
                <td style={S.td}>{t.taskTitle || t.title || "—"}</td>
                <td style={S.td}>{t.description || "—"}</td>
                <td style={S.td}>{t.startDate || "—"}</td>
                <td style={S.td}>{t.deadline || "—"}</td>
                <td style={S.td}>
                  <span style={statusStyle(t.status)}>{t.status || "ASSIGNED"}</span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={S.empty}>No tasks assigned yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

const S = {
  topGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" },
  card: { background: "#FFFFFF", padding: "25px", borderRadius: "18px", boxShadow: "0 10px 25px rgba(37,99,235,0.08)", border: "1px solid #DCE6F2" },
  title: { marginBottom: "20px", color: "#0F172A", fontSize: "22px", fontWeight: "700", display: "flex", alignItems: "center" },
  desc: { fontSize: "14px", color: "#64748B", marginBottom: "20px" },
  label: { fontSize: "13px", color: "#64748B", fontWeight: "600", marginBottom: "-8px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { width: "100%", padding: "13px", borderRadius: "10px", border: "1px solid #DCE6F2", fontSize: "14px", outline: "none", background: "#FFFFFF", boxSizing: "border-box" },
  button: { width: "100%", padding: "14px", background: "linear-gradient(135deg,#2563EB,#3B82F6)", color: "#FFFFFF", border: "none", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
  rankList: { display: "flex", flexDirection: "column", gap: "12px" },
  rankRow: { display: "flex", alignItems: "center", gap: "15px", padding: "15px", background: "#F5F9FF", borderRadius: "12px" },
  rank: { display: "flex", alignItems: "center", gap: "5px", fontWeight: "700", fontSize: "14px", minWidth: "50px" },
  rankName: { fontWeight: "700", fontSize: "14px", color: "#0F172A" },
  rankSub: { fontSize: "12px", color: "#94A3B8" },
  score: { fontWeight: "700", color: "#2563EB", fontSize: "15px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 8px", color: "#64748B", fontSize: "14px", borderBottom: "1px solid #DCE6F2" },
  td: { padding: "15px 8px", color: "#0F172A", fontSize: "14px", borderBottom: "1px solid #F5F9FF" },
  pending: { background: "#FEF9C3", color: "#CA8A04", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  progress: { background: "#EAF2FF", color: "#2563EB", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  done: { background: "#DCFCE7", color: "#16A34A", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  empty: { textAlign: "center", padding: "40px", color: "#94A3B8" },
};

export default TLTraining;
