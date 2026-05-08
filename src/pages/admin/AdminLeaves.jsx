import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FileText, CheckCircle, Clock, XCircle, Check, X, Calendar } from 'lucide-react';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';

const AdminLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // ==========================================
    // 1. ELITE COLOR PALETTE (Employee Page Style)
    // ==========================================
    const colors = {
        primaryBlue: '#2563EB',
        lightBlue: '#EFF6FF',
        mainText: '#0F172A',
        secondaryText: '#64748B',
        successBg: '#DCFCE7',
        successText: '#16A34A',
        warningBg: '#FEF9C3',
        warningText: '#CA8A04',
        dangerBg: '#FEE2E2',
        dangerText: '#DC2626',
        border: '#E2E8F0',
        cardWhite: '#FFFFFF'
    };

    useEffect(() => {
        fetchAllLeaves();
    }, []);

    const fetchAllLeaves = async () => {
        try {
            setLoading(true);
            // Fetching ALL employee leaves for Admin
            const response = await api.get('/api/leaves/all'); 
            
            // Sort by latest request first
            const sortedData = (response.data || []).sort((a, b) => b.id - a.id);
            setLeaves(sortedData);
        } catch (error) {
            console.error("Error fetching leaves", error);
            toast.error("Failed to load employee leave requests.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            setProcessingId(id);
            // Backend endpoint to update status (Adjust if your backend uses a different path)
            await api.put(`/api/leaves/${id}/status`, null, { params: { status: newStatus } });
            
            toast.success(`Leave request ${newStatus.toLowerCase()} successfully!`);
            
            // Update local state to reflect UI instantly without reloading
            setLeaves(leaves.map(leave => leave.id === id ? { ...leave, status: newStatus } : leave));
        } catch (error) {
            console.error("Error updating leave status", error);
            toast.error("Failed to update status. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    // ==========================================
    // 2. DYNAMIC SUMMARY CALCULATIONS
    // ==========================================
    const totalRequests = leaves.length;
    const pendingRequests = leaves.filter(l => l.status === 'PENDING').length;
    const approvedRequests = leaves.filter(l => l.status === 'APPROVED').length;
    const rejectedRequests = leaves.filter(l => l.status === 'REJECTED').length;

    // Helper for table status badge
    const getStatusBadge = (status) => {
        const s = status ? status.toUpperCase() : 'PENDING';
        if (s === 'APPROVED') return { bg: colors.successBg, color: colors.successText };
        if (s === 'REJECTED') return { bg: colors.dangerBg, color: colors.dangerText };
        return { bg: colors.warningBg, color: colors.warningText };
    };

    return (
        <DashboardLayout role="ADMIN" title="Leave Management">
            
            {/* PAGE HEADER */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.mainText, margin: '0 0 8px 0' }}>
                    Leave Approval & History
                </h1>
                <p style={{ color: colors.secondaryText, fontSize: '14px', margin: 0 }}>
                    Review, approve, and track employee time-off requests across the organization.
                </p>
            </div>

            {/* 4 TOP STAT CARDS (Matches Employee UI perfectly) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                {/* Total Applied */}
                <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '50%', color: colors.primaryBlue }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>Total Requests</p>
                        <h2 style={{ color: colors.mainText, fontSize: '26px', fontWeight: '700', margin: 0 }}>{totalRequests}</h2>
                    </div>
                </div>

                {/* Approved */}
                <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: colors.successBg, padding: '16px', borderRadius: '50%', color: colors.successText }}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>Approved</p>
                        <h2 style={{ color: colors.mainText, fontSize: '26px', fontWeight: '700', margin: 0 }}>{approvedRequests}</h2>
                    </div>
                </div>

                {/* Pending */}
                <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#FFF7ED', padding: '16px', borderRadius: '50%', color: '#EA580C' }}>
                        <Clock size={24} />
                    </div>
                    <div>
                        <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>Pending Approval</p>
                        <h2 style={{ color: colors.mainText, fontSize: '26px', fontWeight: '700', margin: 0 }}>{pendingRequests}</h2>
                    </div>
                </div>

                {/* Rejected */}
                <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: colors.dangerBg, padding: '16px', borderRadius: '50%', color: colors.dangerText }}>
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>Rejected</p>
                        <h2 style={{ color: colors.mainText, fontSize: '26px', fontWeight: '700', margin: 0 }}>{rejectedRequests}</h2>
                    </div>
                </div>

            </div>

            {/* MAIN APPROVAL TABLE */}
            <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: colors.mainText, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} color={colors.primaryBlue} /> Employee Leave Requests
                </h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ borderBottom: `2px solid ${colors.border}`, backgroundColor: '#FAFAFA' }}>
                                <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Employee</th>
                                <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Leave Type</th>
                                <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Duration</th>
                                <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Reason</th>
                                <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: colors.secondaryText }}>Loading leave requests...</td>
                                </tr>
                            ) : leaves.length > 0 ? (
                                leaves.map((leave) => {
                                    const badge = getStatusBadge(leave.status);
                                    const isPending = leave.status === 'PENDING';

                                    return (
                                        <tr key={leave.id} style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s', ':hover': { backgroundColor: '#F8FAFC' } }}>
                                            
                                            {/* Employee Name & ID */}
                                            <td style={{ padding: '16px', color: colors.mainText, fontWeight: '600', fontSize: '14px' }}>
                                                {leave.employeeName || `EMP-${leave.employeeId || 'NA'}`}
                                            </td>
                                            
                                            <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px', fontWeight: '500' }}>
                                                {leave.leaveType || 'Casual Leave'}
                                            </td>
                                            
                                            <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '13px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span style={{ fontWeight: '600', color: colors.mainText }}>
                                                        {leave.startDate} to {leave.endDate}
                                                    </span>
                                                    <span>{leave.session || 'Full Day'}</span>
                                                </div>
                                            </td>
                                            
                                            <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {leave.reason || 'Personal reasons'}
                                            </td>
                                            
                                            {/* Status Badge */}
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ 
                                                    background: badge.bg, 
                                                    color: badge.color, 
                                                    padding: '6px 12px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '11px', 
                                                    fontWeight: '700',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {leave.status || 'PENDING'}
                                                </span>
                                            </td>
                                            
                                            {/* Approval Actions */}
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                {isPending ? (
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(leave.id, 'APPROVED')}
                                                            disabled={processingId === leave.id}
                                                            style={{ background: colors.successBg, color: colors.successText, border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s', opacity: processingId === leave.id ? 0.5 : 1 }}
                                                            title="Approve"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(leave.id, 'REJECTED')}
                                                            disabled={processingId === leave.id}
                                                            style={{ background: colors.dangerBg, color: colors.dangerText, border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s', opacity: processingId === leave.id ? 0.5 : 1 }}
                                                            title="Reject"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '500' }}>Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: colors.secondaryText }}>
                                        <CheckCircle size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                        <p style={{ margin: 0, fontSize: '15px' }}>All caught up! No leave requests found.</p>
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