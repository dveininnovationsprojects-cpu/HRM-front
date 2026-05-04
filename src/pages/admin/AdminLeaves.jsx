import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast'; 

const AdminLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true); 

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            // MASTER LIST: Fetching all leaves
            const res = await api.get('/api/leaves/all', { withCredentials: true });
            
            // Backend la data illana empty array aagakikanum
            const allLeaves = Array.isArray(res.data) ? res.data : [];
            
            // Sort to show latest first (puthu leave mela vara)
            const sortedLeaves = allLeaves.sort((a, b) => b.id - a.id);
            setLeaves(sortedLeaves);
            
            // DTO LOGIC: Smart Case-Insensitive Calculation
            let p = 0, a = 0, r = 0;
            allLeaves.forEach(l => {
                const status = String(l.status || '').toUpperCase();
                if (status === 'PENDING') p++;
                else if (status === 'APPROVED') a++;
                else if (status === 'REJECTED') r++;
            });
            
            setCounts({ pending: p, approved: a, rejected: r });
            
        } catch (err) {
            console.error("Fetch failed!", err);
            // Unauthorized aana theliva error sollanum
            if (err.response?.status === 401) {
                toast.error("Session expired! Please login again mamey.");
            } else {
                toast.error("Failed to load leaves data.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    // MASS FIX: Action Type handling changed for grammar and API accuracy
    const handleDecision = async (id, actionType) => {
        // actionType will be 'APPROVE' or 'REJECT'
        const actionVerb = actionType === 'APPROVE' ? 'approve' : 'reject'; // For API URL & Alert
        const finalStatus = actionType === 'APPROVE' ? 'Approved' : 'Rejected'; // For Toast Success Message

        // ACTION TRIGGER: Correct Grammar Check
        if (!window.confirm(`Are you sure you want to ${actionVerb} this leave request?`)) return;

        try {
            // CONNECTIVITY FIX: Exact API Path Matching
            const response = await api.post(`/api/leaves/${actionVerb}/${id}`, {}, {
                withCredentials: true
            });
            
            if (response.status === 200 || response.data) {
                // MASS SUCCESS TOAST
                toast.success(`Leave ${finalStatus} Successfully! ✅`);
                fetchLeaves(); // UI-ah refresh panni automatic-ah record-ah update pandrom
            }
        } catch (err) {
            const msg = err.response?.status === 401 
                ? "Session Expired! Thirumba Login pannu mamey." 
                : (err.response?.data?.message || "Backend Connectivity Problem");
            
            toast.error(msg);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="ADMIN" title="Leaves Management Hub">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <Loader2 className="animate-spin" size={40} color="#3b82f6" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="ADMIN" title="Leaves Management Hub">
            {/* A. Summary Analytics Cards */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div className="stat-card" style={{ flex: 1, minWidth: '200px', background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #f59e0b', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                        Pending Requests <Clock size={18} color="#f59e0b"/>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px' }}>{counts.pending}</div>
                </div>
                <div className="stat-card" style={{ flex: 1, minWidth: '200px', background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #10b981', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                        Approved Today <CheckCircle size={18} color="#10b981"/>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px' }}>{counts.approved}</div>
                </div>
                <div className="stat-card" style={{ flex: 1, minWidth: '200px', background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #ef4444', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                        Rejected Total <XCircle size={18} color="#ef4444"/>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px' }}>{counts.rejected}</div>
                </div>
            </div>

            {/* B. Leave Master Table - Real-time Visualization */}
            <div className="dashboard-card" style={{ background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
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
                            {leaves.length > 0 ? leaves.map((item, index) => {
                                const currentStatus = String(item.status || 'PENDING').toUpperCase();
                                
                                return (
                                    <tr key={item.id || index} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#1e293b' }}>{item.employeeId || 'N/A'}</td>
                                        <td style={{ color: '#475569' }}>{item.leaveType}</td>
                                        <td style={{ fontSize: '13px', color: '#475569' }}>{item.startDate} to {item.endDate}</td>
                                        <td style={{ maxWidth: '200px', fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.reason}
                                        </td>
                                        <td>
                                            {/* Status Badge Logic */}
                                            <span style={{ 
                                                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block',
                                                background: currentStatus === 'PENDING' ? '#fffbeb' : currentStatus === 'APPROVED' ? '#f0fdf4' : '#fef2f2',
                                                color: currentStatus === 'PENDING' ? '#d97706' : currentStatus === 'APPROVED' ? '#16a34a' : '#dc2626'
                                            }}>
                                                {currentStatus}
                                            </span>
                                        </td>
                                        <td>
                                            {/* Action Buttons: Backend interface trigger for PENDING only */}
                                            {currentStatus === 'PENDING' ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button 
                                                        onClick={() => handleDecision(item.id, 'APPROVE')} 
                                                        style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDecision(item.id, 'REJECT')} 
                                                        style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold', paddingLeft: '10px' }}>Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        No recent leave requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminLeaves;