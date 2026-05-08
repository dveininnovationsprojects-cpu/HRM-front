import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import { Briefcase, TrendingUp, Award, Target, ExternalLink, X, Activity, Clock } from 'lucide-react';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null); // For Analytics Modal
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProjectsList();
    }, []);

    const fetchProjectsList = async () => {
        try {
            // CONNECTIVITY FIX: Using the correct backend endpoint
            const res = await api.get('/api/performance/projects');
            setProjects(res.data || []);
        } catch (err) {
            console.error("Projects load failed", err);
            toast.error("Failed to load live projects.");
        }
    };

    // Triggered when "View" is clicked
    const handleViewAnalytics = async (projectId) => {
        const toastId = toast.loading('Fetching Project Analytics...');
        try {
            // CONNECTIVITY FIX: Hitting the detailed report endpoint
            const res = await api.get(`/api/performance/projects/${projectId}`);
            toast.dismiss(toastId);
            setSelectedReport(res.data);
        } catch (err) {
            toast.dismiss(toastId);
            toast.error("Analytics data not found or server error.");
        }
    };

    return (
        <DashboardLayout role="ADMIN" title="Project & Performance Analytics">
            {/* 1. KPI Overview Cards  */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <StatCard title="Total Projects" value={projects.length} icon={<Briefcase />} color="#3b82f6" />
                <StatCard title="Avg Efficiency" value="85%" icon={<TrendingUp />} color="#10b981" />
                <StatCard title="Completed Training" value="0" icon={<Award />} color="#8b5cf6" />
                <StatCard title="Pending Tasks" value="0" icon={<Target />} color="#f59e0b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                {/* 2. Project List Table */}
                <div className="dashboard-card" style={{ padding: '25px', borderRadius: '16px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '20px', color: '#0f172a' }}>Live Projects Overview</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                                <th style={{ padding: '15px' }}>PROJECT NAME</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.length > 0 ? projects.map((proj) => (
                                <tr key={proj.id} style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#1e293b' }}>{proj.projectName}</td>
                                    <td>
                                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', background: '#eff6ff', color: '#3b82f6', fontWeight: 'bold' }}>
                                            ACTIVE
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleViewAnalytics(proj.id)}
                                            style={{ color: '#fff', border: 'none', background: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                                            Analytics <ExternalLink size={14} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No projects available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 3. Employee Ranking Section (Static Placeholder until backend API is ready) */}
                <div className="dashboard-card" style={{ padding: '25px', borderRadius: '16px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '20px', color: '#0f172a' }}>Top Performers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[1, 2, 3].map((rank) => (
                            <div key={rank} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: rank === 1 ? '#f59e0b' : '#64748b' }}>#{rank}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>Employee {rank}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Biometric: BIO10{rank}</div>
                                </div>
                                <div style={{ color: '#10b981', fontWeight: 'bold' }}>9{5-rank}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MASS FEATURE: Analytics Report Modal */}
            {selectedReport && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                        <button onClick={() => setSelectedReport(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={24} />
                        </button>

                        <h2 style={{ color: '#0f172a', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity color="#3b82f6" /> {selectedReport.projectName} - Analytics
                        </h2>
                        <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>Manager: <b>{selectedReport.managerName}</b> | Status: <b>{selectedReport.status}</b></p>

                        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ flex: 1, background: '#eff6ff', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>PROGRESS</p>
                                <h3 style={{ margin: 0, color: '#1e293b' }}>{selectedReport.progressPercentage}%</h3>
                            </div>
                            <div style={{ flex: 1, background: '#f0fdf4', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>EFFICIENCY</p>
                                <h3 style={{ margin: 0, color: '#1e293b' }}>{selectedReport.overallEfficiency}%</h3>
                            </div>
                            <div style={{ flex: 1, background: '#fef3c7', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#d97706', fontWeight: 'bold' }}>TOTAL HOURS</p>
                                <h3 style={{ margin: 0, color: '#1e293b' }}>{selectedReport.totalActualHours} / {selectedReport.totalEstimatedHours}</h3>
                            </div>
                        </div>

                        <h3 style={{ color: '#0f172a', marginBottom: '15px', fontSize: '16px' }}>Module Breakdown</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px' }}>
                                <tr>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>MODULE</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>ASSIGNEE</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>HOURS (Act/Est)</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>EFFICIENCY</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>DAILY STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedReport.modules && selectedReport.modules.length > 0 ? selectedReport.modules.map((mod, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#334155' }}>{mod.moduleName}</td>
                                        <td style={{ padding: '12px', color: '#475569' }}>{mod.assignedToName}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', color: '#475569' }}>{mod.actualHours} / {mod.estimatedHours}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', color: mod.efficiency >= 100 ? '#16a34a' : '#ef4444', fontWeight: 'bold' }}>
                                            {mod.efficiency}%
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{ background: mod.dailyStatus === 'Satisfied' ? '#dcfce7' : '#fee2e2', color: mod.dailyStatus === 'Satisfied' ? '#16a34a' : '#dc2626', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>
                                                {mod.dailyStatus}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No modules found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminProjects;