import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/apiConfig";

const TLAttendance = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get("/api/attendance/all")
      .then((r) => setRecords(r.data || []))
      .catch(console.error);
  }, []);

  return (
    <DashboardLayout role="TL" title="Team Attendance">
      <div style={S.card}>
        <h3 style={S.title}>Attendance Records</h3>
        <table style={S.table}>
          <thead>
            <tr>{["Employee", "Date", "Check In", "Check Out", "Status"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {records.length > 0 ? records.map((r, i) => (
              <tr key={i}>
                <td style={S.td}>{r.employeeName || r.employee?.name || "—"}</td>
                <td style={S.td}>{r.date || "—"}</td>
                <td style={S.td}>{r.checkIn || "—"}</td>
                <td style={S.td}>{r.checkOut || "—"}</td>
                <td style={S.td}>
                  <span style={r.status === "PRESENT" ? S.present : S.absent}>
                    {r.status || "—"}
                  </span>
                </td>
              </tr>
            )) : <tr><td colSpan="5" style={S.empty}>No attendance records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

const S = {
  card: { background: "#FFFFFF", padding: "25px", borderRadius: "18px", boxShadow: "0 10px 25px rgba(37,99,235,0.08)", border: "1px solid #DCE6F2" },
  title: { marginBottom: "8px", color: "#0F172A", fontSize: "22px", fontWeight: "700" },
  desc: { fontSize: "14px", color: "#64748B", marginBottom: "20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 8px", color: "#64748B", fontSize: "14px", borderBottom: "1px solid #DCE6F2" },
  td: { padding: "15px 8px", color: "#0F172A", fontSize: "14px", borderBottom: "1px solid #F5F9FF" },
  present: { background: "#DCFCE7", color: "#16A34A", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  absent: { background: "#FEF2F2", color: "#DC2626", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  empty: { textAlign: "center", padding: "40px", color: "#94A3B8" },
};

export default TLAttendance;
