import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/apiConfig";

const TLLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const teamRes = await api.get("/api/tl/my-team");
      const team = teamRes.data || [];
      setTeamMembers(team);
      
      const teamIds = team.map(t => t.id);
      
      const leaveRes = await api.get("/api/leaves/all");
      const allLeaves = leaveRes.data || [];
      
      const filtered = allLeaves.filter(l => teamIds.includes(l.employeeId));
      
      setLeaves(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const statusStyle = (status) => {
    if (status === "APPROVED") return S.approved;
    if (status === "REJECTED") return S.rejected;
    return S.pending;
  };

  return (
    <DashboardLayout role="TL" title="Team Leaves">
      <div style={S.card}>
        <h3 style={S.title}>Leave Records</h3>
        <table style={S.table}>
          <thead>
            <tr>
              {["Employee", "Leave Type", "From", "To", "Reason", "Status"].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaves.length > 0 ? leaves.map((l, i) => (
              <tr key={i}>
                <td style={S.td}>{l.employeeName || l.employee?.fullName || l.employee?.name || "—"}</td>
                <td style={S.td}>{l.leaveType || l.type || "—"}</td>
                <td style={S.td}>{l.startDate || l.fromDate || l.from || "—"}</td>
                <td style={S.td}>{l.endDate || l.toDate || l.to || "—"}</td>
                <td style={S.td}>{l.reason || "—"}</td>
                <td style={S.td}>
                  <span style={statusStyle(l.status)}>{l.status || "PENDING"}</span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={S.empty}>No leave records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

const S = {
  card: { background: "#FFFFFF", padding: "25px", borderRadius: "18px", boxShadow: "0 10px 25px rgba(37,99,235,0.08)", border: "1px solid #DCE6F2" },
  title: { marginBottom: "20px", color: "#0F172A", fontSize: "22px", fontWeight: "700" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 8px", color: "#64748B", fontSize: "14px", borderBottom: "1px solid #DCE6F2" },
  td: { padding: "15px 8px", color: "#0F172A", fontSize: "14px", borderBottom: "1px solid #F5F9FF" },
  approved: { background: "#DCFCE7", color: "#16A34A", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  rejected: { background: "#FEF2F2", color: "#DC2626", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  pending: { background: "#FEF9C3", color: "#CA8A04", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  empty: { textAlign: "center", padding: "40px", color: "#94A3B8" },
};

export default TLLeaves;
