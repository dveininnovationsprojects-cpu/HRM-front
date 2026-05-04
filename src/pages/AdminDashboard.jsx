import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import { Users, Activity, CheckCircle, Clock, Loader2, TrendingUp, Layers } from 'lucide-react';
import api from '../api/apiConfig';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [summary, setSummary] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        performance: 0,
        activeBatch: "N/A"
    });
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // A) Fetch Summary Data
                const sumRes = await api.get('/api/admin/training-summary');
                const backendPerformance = sumRes.data?.performance || 0;
                const backendBatch = sumRes.data?.activeBatch || "No Active Batch";

                // B) Fetch Employee Table Data
                const empRes = await api.get('/api/admin/employees');
                const allEmployees = Array.isArray(empRes.data) ? empRes.data : [];

                const totalCount = allEmployees.length;
                
                // MASS FIX: Null handling & Case insensitive strict check!
                const activeCount = allEmployees.filter(emp => {
                    // DB-la irundhu vara status (illana default ah 'Active' nu vachikurom)
                    const empStatus = emp.designationStatus || emp.status || 'Active';
                    return String(empStatus).trim().toLowerCase() === 'active';
                }).length;

                setSummary({
                    totalEmployees: totalCount,
                    activeEmployees: activeCount, // Ippo theliva "2" nu count ukkarum
                    performance: backendPerformance,
                    activeBatch: backendBatch
                });

                setEmployees(allEmployees.slice(0, 5));

            } catch (err) { 
                console.error("Dashboard Sync Failed:", err);
                toast.error("Unable to load dashboard data"); 
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout role="ADMIN" title="Admin Dashboard">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <Loader2 className="animate-spin" size={40} color="#3b82f6" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="ADMIN" title="Admin Dashboard">
            
            {/* 1. Summary Cards Section */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <StatCard 
                    title="Total Employees" 
                    value={summary.totalEmployees} 
                    icon={<Users />} 
                    color="#3b82f6" 
                />
                <StatCard 
                    title="Active Employees" 
                    value={summary.activeEmployees} 
                    icon={<Activity />} 
                    color="#10b981" 
                />
                <StatCard 
                    title="System Performance" 
                    value={`${summary.performance}%`} 
                    icon={<TrendingUp />} 
                    color="#8b5cf6" 
                />
                <StatCard 
                    title="Active Batch" 
                    value={summary.activeBatch} 
                    icon={<Layers />} 
                    color="#f59e0b" 
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                
                {/* 2. Employee Overview Table */}
                <div className="dashboard-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>Employee Overview</h3>
                        <button 
                            onClick={() => window.location.href='/admin/employees'}
                            style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                        >
                            View All
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                                    <th style={{ padding: '12px 8px' }}>Name</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length > 0 ? employees.map(emp => {
                                    
                                    // MASS FIX FOR TABLE: 
                                    // DB null ah anupunaalum namma 'Active' nu default pandrom for new joins
                                    const rawStatus = emp.designationStatus || emp.status || 'Active';
                                    const isActive = String(rawStatus).trim().toLowerCase() === 'active';
                                    
                                    // UI la kaata capital 'Active'
                                    const displayText = isActive ? 'Active' : String(rawStatus);

                                    return (
                                        <tr key={emp.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: '600', color: '#1e293b' }}>{emp.fullName}</td>
                                            <td style={{ color: '#64748b' }}>{emp.department}</td>
                                            <td>
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    background: isActive ? '#f0fdf4' : '#fef2f2',
                                                    color: isActive ? '#16a34a' : '#dc2626' 
                                                }}>
                                                    {displayText}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    onClick={() => window.location.href=`/admin/employees/${emp.id}`}
                                                    style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                            No recent employees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Project Status Section */}
                <div className="dashboard-card">
                    <h3 style={{ marginBottom: '10px' }}>Project Status</h3>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Admin level tracking hub.</p>
                    
                    <div style={{ padding: '40px 20px', textAlign: 'center', border: '2px dashed #f1f5f9', borderRadius: '12px', background: '#fcfcfd' }}>
                         <Activity size={32} color="#cbd5e1" style={{ marginBottom: '10px' }} />
                         <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Project & Training insights will appear here as you assign tasks.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;