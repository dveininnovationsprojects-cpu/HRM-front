import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { Megaphone, Bell } from 'lucide-react';

const AdminNotifications = () => {
    const [msg, setMsg] = useState({ title: '', message: '' });

    const handleAnnounce = async (e) => {
        e.preventDefault();
        try {
            // Admin Announcement Panel 
            await api.post('/api/notifications/announce', msg);
            alert("Announcement sent to all users successfully! ");
            setMsg({ title: '', message: '' });
        } catch (err) { alert("Broadcast failed!"); }
    };

    return (
        <DashboardLayout role="ADMIN" title="Notifications Hub">
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="dashboard-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Megaphone color="#ef4444" /> Send Global Announcement</h3>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>This message will be sent to ALL employees and managers. </p>
                    
                    <form onSubmit={handleAnnounce} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input type="text" placeholder="Announcement Title" value={msg.title}
                            onChange={(e) => setMsg({...msg, title: e.target.value})} required />
                        <textarea placeholder="Write your official message here..." value={msg.message}
                            onChange={(e) => setMsg({...msg, message: e.target.value})} style={{ height: '150px' }} required />
                        
                        <button type="submit" style={{ background: '#ef4444', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                            Broadcast to All
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminNotifications;