import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import api from '../api/apiConfig';
import { Users, Clock, CheckCircle, BarChart3, Target, User } from 'lucide-react';

const ManagerDashboard = () => {
    const [summary, setSummary] = useState({ totalEmployees: 0, trainingPending: 0, trainingCompleted: 0 });
    
    // Dynamic Session Data from LocalStorage 
    const loggedUser = localStorage.getItem('username') || 'Manager';

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                // Fetching overall training snapshot from the unified admin endpoint [cite: 33]
                const res = await api.get('/api/admin/training-summary', { withCredentials: true });
                setSummary(res.data);
            } catch (err) { 
                console.error("Critical: Summary data synchronization failed."); 
            }
        };
        fetchSummary();
    }, []);

    return (
        <DashboardLayout role="MANAGER" title="Manager Enterprise Command Center">
            
            {/* Professional Active Session Header - Clean UI */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>{loggedUser}</div>
                    <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>Active Session</div>
                </div>
                <div style={{ position: 'relative' }}>
                    <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #10b981' 
                    }}>
                        <User size={20} color="#64748b" />
                    </div>
                    {/* Active Status Indicator Dot */}
                    <div style={{ 
                        position: 'absolute', bottom: '2px', right: '2px', width: '10px', height: '10px', 
                        background: '#10b981', borderRadius: '50%', border: '2px solid #fff' 
                    }}></div>
                </div>
            </div>

            {/* A. Strategic KPI Analytics [cite: 33] */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <StatCard 
                    title="Total Department Staff" 
                    value={summary.totalEmployees} 
                    icon={<Users />} 
                    color="#3b82f6" 
                />
                <StatCard 
                    title="Training Compliance Pending" 
                    value={summary.trainingPending} 
                    icon={<Clock />} 
                    color="#f59e0b" 
                />
                <StatCard 
                    title="Certification Completed" 
                    value={summary.trainingCompleted} 
                    icon={<CheckCircle />} 
                    color="#10b981" 
                />
            </div>

            {/* B. Operational Overview Hub  */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Project and Efficiency Tracking [cite: 36, 46] */}
                <div className="dashboard-card" style={{ background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <BarChart3 size={20} color="#3b82f6" />
                        <h3 style={{ margin: 0 }}>Project Performance Analytics</h3>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                        Monitor real-time delivery progress of assigned modules and evaluate team efficiency metrics. 
                        Drill down into detailed analytics to identify project bottlenecks and resource utilization levels.
                    </p>
                </div>

                {/* Resource Allocation [cite: 42] */}
                <div className="dashboard-card" style={{ background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <Target size={20} color="#8b5cf6" />
                        <h3 style={{ margin: 0 }}>Strategic Resource Hub</h3>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                        Optimize workforce deployment for upcoming sprints and manage professional development through batch-wise training programs.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManagerDashboard;