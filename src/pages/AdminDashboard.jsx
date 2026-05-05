import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import { Users, Activity, CheckCircle, Clock } from 'lucide-react';
import api from '../api/apiConfig';

const AdminDashboard = () => {
    const [summary, setSummary] = useState({});
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // [cite: 2, 5] Summary Cards API
                const sumRes = await api.get('/api/admin/training-summary');
                setSummary(sumRes.data);

                // [cite: 3, 5] Employee Table API
                const empRes = await api.get('/api/vc');
                setEmployees(empRes.data.slice(0, 5));
            } catch (err) { console.error("Admin Dashboard load failed"); }
        };
        fetchDashboardData();
    }, []);

    return (
        <DashboardLayout role="ADMIN" title="Admin Dashboard">
            {/*  Summary Cards Section */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <StatCard title="Total Employees" value={summary.totalEmployees || 0} icon={<Users />} color="#3b82f6" />
                <StatCard title="Active Employees" value={summary.activeEmployees || 0} icon={<Activity />} color="#10b981" />
                <StatCard title="Training Completed" value={summary.trainingCompleted || 0} icon={<CheckCircle />} color="#8b5cf6" />
                <StatCard title="Training Pending" value={summary.trainingPending || 0} icon={<Clock />} color="#f59e0b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                {/* [cite: 3] Employee Overview Table */}
                <div className="dashboard-card">
                    <h3>Employee Overview</h3>
                    <table style={{ width: '100%', marginTop: '15px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                <th>Name</th><th>Dept</th><th>Status</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                    <td style={{ padding: '12px 0' }}>{emp.fullName}</td>
                                    <td>{emp.department}</td>
                                    <td><span style={{ color: emp.designationStatus === 'Active' ? 'green' : 'red' }}>{emp.designationStatus}</span></td>
                                    <td><button style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>View</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* [cite: 4] Project Quick View */}
                <div className="dashboard-card">
                    <h3>Project Status</h3>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Admin level tracking hub.</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;