import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FileText, CheckCircle, Clock, XCircle, Check, X, Calendar, Filter } from 'lucide-react';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';

const ManagerLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');

    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        mainText: '#0F172A', secondaryText: '#64748B',
        successBg: '#DCFCE7', successText: '#16A34A',
        warningBg: '#FEF9C3', warningText: '#CA8A04',
        dangerBg: '#FEE2E2', dangerText: '#DC2626',
        border: '#E2E8F0', cardWhite: '#FFFFFF', inputBg: '#F1F5F9'
    };

    useEffect(() => {
        fetchAllLeaves();
    }, []);

    const fetchAllLeaves = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/leaves/all'); 
            const sortedData = (response.data || []).sort((a, b) => b.id - a.id);
            setLeaves(sortedData);
        } catch (error) {
            // 🟢 Catch silently without throwing Toast Error
            console.warn("Leaves API restricted or unavailable for Manager role.", error);
            setLeaves([]); 
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, actionType) => {
        try {
            setProcessingId(id);
            await api.post(`/api/leaves/${actionType}/${id}`);
            toast.success(`Leave request ${actionType}d successfully!`);
            fetchAllLeaves();
        } catch (error) {
            toast.error(`Failed to ${actionType} leave.`);
        } finally {
            setProcessingId(null);
        }
    };

    const totalRequests = leaves.length;
    const pendingRequests = leaves.filter(l => l.status === 'PENDING').length;
    const approvedRequests = leaves.filter(l => l.status === 'APPROVED').length;

    const filteredLeaves = statusFilter === 'ALL' ? leaves : leaves.filter(l => l.status === statusFilter);

    const getStatusBadge = (status) => {
        const s = status ? status.toUpperCase() : 'PENDING';
        if (s === 'APPROVED') return { bg: colors.successBg, color: colors.successText };
        if (s === 'REJECTED') return { bg: colors.dangerBg, color: colors.dangerText };
        return { bg: colors.warningBg, color: colors.warningText };
    };

    return (
        <DashboardLayout role="MANAGER" title="Leave Approvals">
            {/* 🟢 ALIGNMENT FIX: Matched Performance Analytics Padding & Background */}
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                
                {/* PAGE HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.mainText, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                            Team Leave Operations
                        </h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '15px' }}>
                            Monitor, approve, and manage workforce leave applications.
                        </p>
                    </div>
                </div>

                {/* KPI CARDS: Updated Border Radius & Shadow for Elite Look */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '50%', color: colors.primaryBlue }}><FileText size={24} /></div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Total Requests</p>
                            <h2 style={{ color: colors.mainText, fontSize: '28px', fontWeight: '800', margin: 0 }}>{totalRequests}</h2>
                        </div>
                    </div>
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#FFF7ED', padding: '16px', borderRadius: '50%', color: '#EA580C' }}><Clock size={24} /></div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Action Pending</p>
                            <h2 style={{ color: colors.mainText, fontSize: '28px', fontWeight: '800', margin: 0 }}>{pendingRequests}</h2>
                        </div>
                    </div>
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: colors.successBg, padding: '16px', borderRadius: '50%', color: colors.successText }}><CheckCircle size={24} /></div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Approved</p>
                            <h2 style={{ color: colors.mainText, fontSize: '28px', fontWeight: '800', margin: 0 }}>{approvedRequests}</h2>
                        </div>
                    </div>
                </div>

                {/* LEAVE QUEUE TABLE: Updated Border Radius (24px) & Styling */}
                <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                        <h3 style={{ margin: 0, color: colors.mainText, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar size={20} color={colors.primaryBlue} /> Leave Application Queue
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', background: colors.inputBg, padding: '8px 16px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <Filter size={16} color={colors.secondaryText} style={{ marginRight: '8px' }} />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', fontWeight: '700', color: colors.mainText, cursor: 'pointer' }}>
                                <option value="ALL">All Requests</option>
                                <option value="PENDING">Pending Only</option>
                                <option value="APPROVED">Approved Only</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left', minWidth: '900px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>EMPLOYEE</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TYPE & DURATION</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>REASON</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATUS</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: colors.secondaryText, fontWeight: '600' }}>Loading applications...</td></tr>
                                ) : filteredLeaves.length > 0 ? (
                                    filteredLeaves.map((leave) => {
                                        const badge = getStatusBadge(leave.status);
                                        const isPending = leave.status === 'PENDING';
                                        return (
                                            <tr key={leave.id} style={{ background: colors.inputBg, transition: '0.2s' }}>
                                                <td style={{ padding: '16px', fontWeight: '700', borderRadius: '12px 0 0 12px', color: colors.mainText }}>{leave.employeeName || `EMP-${leave.employeeId}`}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ fontWeight: '800', color: colors.primaryBlue, fontSize: '14px' }}>{leave.leaveType || 'Casual'}</span>
                                                        <span style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500' }}>{leave.startDate} to {leave.endDate} ({leave.session || 'Full Day'})</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '13px', fontWeight: '500', maxWidth: '250px' }}>{leave.reason}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{ background: badge.bg, color: badge.color, padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>{leave.status}</span>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'center', borderRadius: '0 12px 12px 0' }}>
                                                    {isPending ? (
                                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                            <button onClick={() => handleAction(leave.id, 'approve')} disabled={processingId === leave.id} style={{ background: colors.successBg, color: colors.successText, border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }} title="Approve"><Check size={18} /></button>
                                                            <button onClick={() => handleAction(leave.id, 'reject')} disabled={processingId === leave.id} style={{ background: colors.dangerBg, color: colors.dangerText, border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }} title="Reject"><X size={18} /></button>
                                                        </div>
                                                    ) : <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '700' }}>Processed</span>}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: colors.secondaryText, background: colors.inputBg, borderRadius: '16px', fontWeight: '600' }}>No leave requests found for selected filter.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManagerLeaves;