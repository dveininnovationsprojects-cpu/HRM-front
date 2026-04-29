import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import { Users, ClipboardList, TrendingUp, Send } from 'lucide-react';
import api from '../api/apiConfig';

const TLDashboard = () => {
    const [teamProjects, setTeamProjects] = useState([]);
    const [teamCount, setTeamCount] = useState(0);

    useEffect(() => {
        const fetchTLData = async () => {
            try {
                // Backend API: GET /api/tl/dashboard/projects [cite: 2]
                const projRes = await api.get('/api/tl/dashboard/projects');
                setTeamProjects(projRes.data);
                
                // Backend API: Total team count [cite: 4]
                const teamRes = await api.get('/api/tl/my-team');
                setTeamCount(teamRes.data.length);
            } catch (err) { console.error("TL Data load failed"); }
        };
        fetchTLData();
    }, []);

    return (
        <DashboardLayout role="TL" title="Team Lead Dashboard">
            {/* 1. Overview Cards [cite: 1, 4] */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <StatCard title="My Team Members" value={teamCount} icon={<Users />} color="#3b82f6" subtext="Active Members" />
                <StatCard title="Assigned Projects" value={teamProjects.length} icon={<ClipboardList />} color="#10b981" subtext="In Progress" />
                <StatCard title="Efficiency" value="88%" icon={<TrendingUp />} color="#f59e0b" subtext="Team Avg" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                {/* 2. My Assigned Projects Table [cite: 3] */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Assigned Projects</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '13px', borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ paddingBottom: '15px' }}>PROJECT NAME</th>
                                <th>STATUS</th>
                                <th>MODULES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamProjects.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '15px 0' }}>{p.projectName}</td>
                                    <td><span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>{p.status}</span></td>
                                    <td>{p.totalModules}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 3. Quick Task Assignment [cite: 11] */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Assign New Task</h3>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>Select module and assign to team member.</p>
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                            <option>Select Module</option>
                        </select>
                        <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                            <option>Select Employee</option>
                        </select>
                        <button style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <Send size={18} /> Assign Module
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TLDashboard;