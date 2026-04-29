import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { BarChart3, Clock, Target, FileSpreadsheet } from 'lucide-react';

const ManagerProjects = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Fetch projects managed by this manager 
                const res = await api.get('/api/admin/projects-list', { withCredentials: true });
                setProjects(res.data);
            } catch (err) { console.error("Project synchronization failed."); }
        };
        fetchProjects();
    }, []);

    const viewAnalytics = async (projectId) => {
        try {
            // Drill-down analytics call [cite: 46, 47]
            const res = await api.get(`/api/performance/projects/${projectId}`, { withCredentials: true });
            setSelectedProject(res.data);
        } catch (err) { alert("Failed to load project metrics."); }
    };

    return (
        <DashboardLayout role="MANAGER" title="Strategic Project Monitoring">
            {/* Project Selection Table [cite: 23] */}
            <div className="dashboard-card" style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '20px' }}>Managed Project Portfolio</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                            <th style={{ padding: '15px' }}>Project Name</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '15px', fontWeight: '600' }}>{p.projectName}</td>
                                <td><span className="badge-active">In Progress</span></td>
                                <td>
                                    <button onClick={() => viewAnalytics(p.id)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                        View Performance
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Performance Drill-Down Section  */}
            {selectedProject && (
                <div className="analytics-view">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                        <div className="stat-card" style={{ background: '#eff6ff', padding: '15px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '13px', color: '#3b82f6' }}>Overall Efficiency</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedProject.overallEfficiency}%</div>
                        </div>
                        <div className="stat-card" style={{ background: '#f0fdf4', padding: '15px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '13px', color: '#10b981' }}>Estimated Hours</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedProject.totalEstimatedHours}h</div>
                        </div>
                        <div className="stat-card" style={{ background: '#fff7ed', padding: '15px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '13px', color: '#f59e0b' }}>Actual Hours</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedProject.totalActualHours}h</div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
export default ManagerProjects;