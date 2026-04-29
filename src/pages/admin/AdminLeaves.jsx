import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';

const AdminLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

    const fetchLeaves = async () => {
        try {
            // MASTER LIST: Matches GET /api/leaves/all in LeaveController
            // withCredentials: true backend-la cookie anupa idhu mukkiyam
            const res = await api.get('/api/leaves/all', { withCredentials: true });
            setLeaves(res.data);
            
            // DTO LOGIC: Count calculation based on LeaveDTO status
            const p = res.data.filter(l => l.status === 'PENDING').length;
            const a = res.data.filter(l => l.status === 'APPROVED').length;
            const r = res.data.filter(l => l.status === 'REJECTED').length;
            setCounts({ pending: p, approved: a, rejected: r });
        } catch (err) {
            console.error("Fetch failed! Session expire aayiduchu mamey.");
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleDecision = async (id, status) => {
        try {
            // ACTION TRIGGER: Path matches POST /api/leaves/approve/{id}
            const action = status.toLowerCase(); // 'approve' or 'reject'
            
            // CONNECTIVITY FIX: Headers matrum withCredentials kachidhama anupuroam
            const response = await api.post(`/api/leaves/${action}/${id}`, {}, {
                withCredentials: true
            });
            
            if (response.status === 200 || response.data) {
                // MASS SUCCESS ALERT mamey!
                alert(`Mamey, Leave ${status} Successfully! ✅ Logic Backend-oda Packava Connect aayiduchi!`);
                fetchLeaves(); // UI-ah refresh panni automatic-ah record-ah history-ku thallum
            }
        } catch (err) {
            // Troubleshooting Analysis
            const msg = err.response?.status === 401 
                ? "Security Issue: Session Expired! Thirumba Login pannu mamey." 
                : (err.response?.data?.message || "Backend Connectivity Problem");
            
            alert(`Error: ${msg}`);
        }
    };

    return (
        <DashboardLayout role="ADMIN" title="Leaves Management Hub">
            {/* A. Summary Analytics Cards */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div className="stat-card" style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #f59e0b', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Pending Requests</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{counts.pending}</div>
                </div>
                <div className="stat-card" style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #10b981', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Approved Today</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{counts.approved}</div>
                </div>
                <div className="stat-card" style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #ef4444', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Rejected Total</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{counts.rejected}</div>
                </div>
            </div>

            {/* B. Leave Master Table - Real-time Visualization */}
            <div className="dashboard-card" style={{ background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                            <th style={{ padding: '15px' }}>EMP ID</th>
                            <th>TYPE</th>
                            <th>PERIOD</th>
                            <th>REASON</th>
                            <th>STATUS</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{item.employeeId}</td>
                                <td>{item.leaveType}</td>
                                <td style={{ fontSize: '13px' }}>{item.startDate} to {item.endDate}</td>
                                <td style={{ maxWidth: '200px', fontSize: '13px', color: '#64748b' }}>{item.reason}</td>
                                <td>
                                    {/* Status Badge Logic */}
                                    <span style={{ 
                                        padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                        background: item.status === 'PENDING' ? '#fef3c7' : item.status === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                                        color: item.status === 'PENDING' ? '#d97706' : item.status === 'APPROVED' ? '#16a34a' : '#dc2626'
                                    }}>
                                        {item.status}
                                    </span>
                                </td>
                                <td>
                                    {/* Action Buttons: Backend interface trigger for PENDING only */}
                                    {item.status === 'PENDING' ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleDecision(item.id, 'APPROVED')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: '0.3s' }}>Approve</button>
                                            <button onClick={() => handleDecision(item.id, 'REJECTED')} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: '0.3s' }}>Reject</button>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#cbd5e1', fontSize: '12px' }}>Processed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};

export default AdminLeaves;