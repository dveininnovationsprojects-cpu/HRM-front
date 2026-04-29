import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import { Users, Briefcase, DollarSign, Megaphone, CheckCircle } from 'lucide-react';
import api from '../api/apiConfig';

const HRDashboard = () => {
    const [summary, setSummary] = useState({ total: 0, active: 0, trainingCompleted: 0 });

    useEffect(() => {
        const fetchHRData = async () => {
            try {
                // Backend API: GET /api/admin/training-summary [cite: 21]
                const res = await api.get('/api/admin/training-summary');
                setSummary(res.data);
            } catch (err) { console.error("HR Summary failed"); }
        };
        fetchHRData();
    }, []);

    return (
        <DashboardLayout role="HR" title="HR Management & Recruitment">
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <StatCard title="Total Staff" value={summary.total} icon={<Users />} color="#3b82f6" />
                <StatCard title="Active Training" value={summary.active} icon={<Briefcase />} color="#f59e0b" />
                <StatCard title="Recruitment" value="5 Active" icon={<Users />} color="#10b981" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                {/* Recruitment Management [cite: 29] */}
                <div className="dashboard-card">
                    <h3>Recruitment Hub</h3>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Post new vacancies and manage candidates.</p>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                        <button style={{ background: '#3b82f6', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px' }}>Post Job</button>
                        <button style={{ background: '#eff6ff', color: '#3b82f6', padding: '10px 20px', border: 'none', borderRadius: '8px' }}>Bulk Upload Candidates</button>
                    </div>
                </div>

                {/* Company Announcements [cite: 39] */}
                <div className="dashboard-card">
                    <h3>Announcements</h3>
                    <textarea placeholder="Type official company alert..." style={{ height: '100px', marginBottom: '15px' }}></textarea>
                    <button style={{ width: '100%', background: '#ef4444', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Megaphone size={18} /> Broadcast to All
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRDashboard;