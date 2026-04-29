import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import { Briefcase, TrendingUp, Award, Target, ExternalLink } from 'lucide-react';
import api from '../../api/apiConfig';

const AdminProjects = () => {
    const [summary, setSummary] = useState({});
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                // 1. TOP SECTION – OVERVIEW CARDS [cite: 15, 18]
                const sumRes = await api.get('/api/admin/training-summary');
                setSummary(sumRes.data);

                // 2. PROJECT LIST SECTION [cite: 15, 18]
                const projRes = await api.get('/api/admin/projects-list');
                setProjects(projRes.data);
            } catch (err) {
                console.error("Performance data load failed");
            }
        };
        fetchPerformanceData();
    }, []);

    return (
        <DashboardLayout role="ADMIN" title="Project & Performance Analytics">
            {/* 1. KPI Overview Cards  */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <StatCard title="Total Projects" value={projects.length} icon={<Briefcase />} color="#3b82f6" />
                <StatCard title="Avg Efficiency" value={`${summary.avgScore || '85'}%`} icon={<TrendingUp />} color="#10b981" />
                <StatCard title="Completed Training" value={summary.completedTrainings || 0} icon={<Award />} color="#8b5cf6" />
                <StatCard title="Pending Tasks" value={summary.pendingTrainings || 0} icon={<Target />} color="#f59e0b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                {/* 2. Project List Table [cite: 16] */}
                <div className="dashboard-card" style={{ padding: '25px', borderRadius: '16px', background: '#fff' }}>
                    <h3 style={{ marginBottom: '20px' }}>Live Projects Overview</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                                <th style={{ padding: '15px' }}>PROJECT NAME</th>
                                <th>STATUS</th>
                                <th>PROGRESS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((proj) => (
                                <tr key={proj.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{proj.projectName}</td>
                                    <td>
                                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', background: '#eff6ff', color: '#3b82f6' }}>
                                            ACTIVE
                                        </span>
                                    </td>
                                    <td style={{ width: '150px' }}>
                                        <div style={{ width: '100%', background: '#e2e8f0', height: '8px', borderRadius: '10px' }}>
                                            <div style={{ width: '75%', background: '#3b82f6', height: '100%', borderRadius: '10px' }}></div>
                                        </div>
                                    </td>
                                    <td>
                                        <button style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            View <ExternalLink size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 3. Employee Ranking Section  */}
                <div className="dashboard-card" style={{ padding: '25px', borderRadius: '16px', background: '#fff' }}>
                    <h3 style={{ marginBottom: '20px' }}>Top Performers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Leaderboard Style Ranking  */}
                        {[1, 2, 3].map((rank) => (
                            <div key={rank} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: rank === 1 ? '#f59e0b' : '#64748b' }}>#{rank}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Employee {rank}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Biometric: BIO10{rank}</div>
                                </div>
                                <div style={{ color: '#10b981', fontWeight: 'bold' }}>9{5-rank}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminProjects;