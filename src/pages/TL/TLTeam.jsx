import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";
import { Users, UserPlus } from "lucide-react";
import api from "../../api/apiConfig";

import toast from "react-hot-toast";

const TLTeam = () => {
  const [team, setTeam] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [adding, setAdding] = useState(false);

  const loadTeam = () =>
    api.get("/api/tl/my-team").then((res) => setTeam(res.data || [])).catch(console.error);

  useEffect(() => {
    loadTeam();
    api.get("/api/employees").then((res) => setAllEmployees(res.data || [])).catch(console.error);
  }, []);

  const handleAdd = async () => {
    if (!selectedEmp) return toast.error("Select an employee");
    setAdding(true);
    try {
      await api.post(`/api/tl/team/add/${selectedEmp}`);
      toast.success("Member added successfully");
      setSelectedEmp("");
      loadTeam();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  return (
    <DashboardLayout role="TL" title="My Team">
      <div style={S.row}>
        <StatCard title="Team Members" value={team.length} icon={<Users />} color="#2563EB" subtext="Active" />
      </div>

      <div style={S.grid}>
        <div style={S.card}>
          <h3 style={S.title}>Team Members</h3>
          <table style={S.table}>
            <thead>
              <tr>{["Name", "Role", "Email", "Status"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {team.length > 0 ? team.map((emp) => (
                <tr key={emp.id}>
                  <td style={S.td}>{emp.fullName || emp.name || emp.user?.username || "Employee"}</td>
                  <td style={S.td}>{emp.designationStatus || emp.position || "—"}</td>
                  <td style={S.td}>{emp.user?.email || "—"}</td>
                  <td style={S.td}><span style={S.badge}>Active</span></td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={S.empty}>No team members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={S.card}>
          <h3 style={S.title}>Add Member to Team</h3>
          <p style={S.desc}>Select an employee to add to your team.</p>
          <div style={S.form}>
            <select value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)} style={S.input}>
              <option value="">Select Employee</option>
              {allEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName || emp.name || emp.user?.username || "Employee"}
                </option>
              ))}
            </select>
            <button onClick={handleAdd} disabled={adding} style={S.button}>
              <UserPlus size={18} />
              {adding ? "Adding..." : "Add to Team"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const S = {
  row: { display: "flex", gap: "20px", marginBottom: "30px" },
  grid: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "30px" },
  card: { background: "#FFFFFF", padding: "25px", borderRadius: "18px", boxShadow: "0 10px 25px rgba(37,99,235,0.08)", border: "1px solid #DCE6F2" },
  title: { marginBottom: "20px", color: "#0F172A", fontSize: "22px", fontWeight: "700" },
  desc: { fontSize: "14px", color: "#64748B", marginBottom: "20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 8px", color: "#64748B", fontSize: "14px", borderBottom: "1px solid #DCE6F2" },
  td: { padding: "15px 8px", color: "#0F172A", fontSize: "14px", borderBottom: "1px solid #F5F9FF" },
  badge: { background: "#DCFCE7", color: "#16A34A", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  empty: { textAlign: "center", padding: "40px", color: "#94A3B8" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { width: "100%", padding: "13px", borderRadius: "10px", border: "1px solid #DCE6F2", fontSize: "14px", outline: "none", background: "#FFFFFF", boxSizing: "border-box" },
  button: { width: "100%", padding: "14px", background: "linear-gradient(135deg,#2563EB,#3B82F6)", color: "#FFFFFF", border: "none", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
};

export default TLTeam;