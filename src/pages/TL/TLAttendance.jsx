import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/apiConfig";

const TLAttendance = () => {
  const [records, setRecords] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const teamRes = await api.get("/api/tl/my-team");
      const team = teamRes.data || [];
      setTeamMembers(team);
      
      const teamIds = team.map(t => t.biometricId).filter(Boolean);
      
      const attRes = await api.get("/api/attendance/all");
      const allRecords = attRes.data || [];
      
      const filtered = allRecords.filter(r => 
        teamIds.includes(r.biometricId) || 
        team.some(t => t.id === r.employeeId)
      );
      
      setRecords(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const statusStyle = (status) => {
    if (status === "PRESENT") return S.present;
    if (status === "ABSENT") return S.absent;
    return S.late;
  };

  return (
    <DashboardLayout role="TL" title="Team Attendance">
      <div style={S.card}>
        <h3 style={S.title}>Attendance Records</h3>
        <table style={S.table}>
          <thead>
            <tr>
              {["Employee", "Biometric ID", "Date", "Check In", "Check Out", "Status"].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? records.map((r, i) => (
              <tr key={i}>
                <td style={S.td}>{r.employeeName || r.employee?.fullName || r.employee?.name || "—"}</td>
                <td style={S.td}>{r.biometricId || r.employee?.biometricId || "—"}</td>
                <td style={S.td}>{r.date || "—"}</td>
                <td style={S.td}>{r.checkInTime || r.checkIn || "—"}</td>
                <td style={S.td}>{r.checkOutTime || r.checkOut || "—"}</td>
                <td style={S.td}>
                  <span style={statusStyle(r.status)}>{r.status || "—"}</span>
                </td>
              </tr>
            )) : <tr><td colSpan="6" style={S.empty}>No attendance records found.</td></tr>}
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
  present: { background: "#DCFCE7", color: "#16A34A", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  absent: { background: "#FEF2F2", color: "#DC2626", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  late: { background: "#FEF9C3", color: "#CA8A04", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  empty: { textAlign: "center", padding: "40px", color: "#94A3B8" },
};

export default TLAttendance;