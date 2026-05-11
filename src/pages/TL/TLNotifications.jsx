import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Bell } from "lucide-react";
import api from "../../api/apiConfig";

const TLNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get("/api/notifications/my")
      .then((r) => setNotifications(r.data || []))
      .catch(console.error);
  }, []);

  return (
    <DashboardLayout role="TL" title="Notifications">
      <div style={S.card}>
        <h3 style={S.title}>My Notifications</h3>
        {notifications.length > 0 ? (
          <div style={S.list}>
            {notifications.map((n, i) => (
              <div key={i} style={{ ...S.item, ...(n.read ? {} : S.unread) }}>
                <div style={S.icon}><Bell size={18} color="#2563EB" /></div>
                <div style={{ flex: 1 }}>
                  <div style={S.msg}>{n.message || n.title || "Notification"}</div>
                  <div style={S.time}>{n.createdAt || n.date || ""}</div>
                </div>
                {!n.read && <span style={S.dot} />}
              </div>
            ))}
          </div>
        ) : (
          <div style={S.empty}>
            <Bell size={40} color="#DCE6F2" />
            <p>No notifications yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const S = {
  card: { background: "#FFFFFF", padding: "25px", borderRadius: "18px", boxShadow: "0 10px 25px rgba(37,99,235,0.08)", border: "1px solid #DCE6F2" },
  title: { marginBottom: "20px", color: "#0F172A", fontSize: "22px", fontWeight: "700" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  item: { display: "flex", alignItems: "flex-start", gap: "15px", padding: "16px", borderRadius: "12px", background: "#F5F9FF", border: "1px solid #DCE6F2" },
  unread: { background: "#EAF2FF", borderColor: "#2563EB" },
  icon: { padding: "10px", background: "#EAF2FF", borderRadius: "10px", display: "flex", alignItems: "center" },
  msg: { fontSize: "14px", fontWeight: "600", color: "#0F172A" },
  time: { fontSize: "12px", color: "#94A3B8", marginTop: "4px" },
  dot: { width: "10px", height: "10px", borderRadius: "50%", background: "#2563EB", marginTop: "5px", flexShrink: 0 },
  empty: { textAlign: "center", padding: "60px", color: "#94A3B8", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
};

export default TLNotifications;