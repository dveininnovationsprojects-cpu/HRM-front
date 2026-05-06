import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Calendar, FileText, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';

const EmployeeLeaves = () => {
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        leaveType: 'CASUAL',
        startDate: '',
        endDate: '',
        session: 'FULL_DAY',
        reason: ''
    });

    // Summary Metrics
    const [summary, setSummary] = useState({
        totalApplied: 0,
        approved: 0,
        pending: 0,
        rejected: 0
    });

    const colors = {
        primaryBlue: '#2563EB',
        lightBlue: '#EAF2FF',
        background: '#F5F9FF',
        cardWhite: '#FFFFFF',
        mainText: '#0F172A',
        secondaryText: '#64748B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: '#DCE6F2'
    };

    useEffect(() => {
        fetchLeaveHistory();
    }, []);

    const fetchLeaveHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/leaves/employee/my');
            const data = res.data || [];
            
            // Sort to show latest first (assuming higher ID means latest)
            const sortedData = data.sort((a, b) => b.id - a.id);
            setLeaveHistory(sortedData);
            calculateSummary(sortedData);
        } catch (error) {
            console.error("Failed to load leave history", error);
            toast.error("Unable to load leave history.");
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (data) => {
        let approved = 0;
        let pending = 0;
        let rejected = 0;

        data.forEach(leave => {
            const status = leave.status ? leave.status.toUpperCase() : '';
            if (status === 'APPROVED') approved++;
            else if (status === 'PENDING') pending++;
            else if (status === 'REJECTED') rejected++;
        });

        setSummary({
            totalApplied: data.length,
            approved,
            pending,
            rejected
        });
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        
        if (!formData.startDate || !formData.endDate || !formData.reason) {
            toast.error("Please fill all mandatory fields.");
            return;
        }

        // Basic frontend validation for dates
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            toast.error("End Date cannot be earlier than Start Date.");
            return;
        }

        try {
            setIsSubmitting(true);
            // Payload format for LeaveDTO
            const payload = {
                leaveType: formData.leaveType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                session: formData.session,
                reason: formData.reason,
                status: 'PENDING'
            };

            await api.post('/api/leaves/apply', payload);
            
            toast.success("Leave application submitted successfully!");
            
            // Reset form
            setFormData({
                leaveType: 'CASUAL',
                startDate: '',
                endDate: '',
                session: 'FULL_DAY',
                reason: ''
            });

            // Refresh history
            fetchLeaveHistory();
            
        } catch (error) {
            console.error(error);
            // Handling duplicate date error from backend
            if (error.response && error.response.status === 400) {
                toast.error(error.response.data || "Invalid leave application. Might be overlapping dates.");
            } else {
                toast.error("Failed to apply for leave. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusStyle = (status) => {
        const s = status ? status.toUpperCase() : '';
        if (s === 'APPROVED') return { bg: '#ecfdf5', color: colors.success };
        if (s === 'REJECTED') return { bg: '#fef2f2', color: colors.danger };
        return { bg: '#fffbeb', color: colors.warning }; // Default for PENDING
    };

    const cardStyle = {
        background: colors.cardWhite,
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${colors.border}`,
        fontFamily: "'Inter', sans-serif"
    };

    const inputStyle = {
        width: '100%', 
        padding: '12px', 
        borderRadius: '8px', 
        border: `1px solid ${colors.border}`, 
        fontFamily: "'Inter', sans-serif", 
        fontSize: '14px', 
        outline: 'none', 
        boxSizing: 'border-box',
        background: '#fff'
    };

    const labelStyle = {
        fontSize: '13px', 
        color: colors.secondaryText, 
        fontWeight: '500', 
        display: 'block', 
        marginBottom: '8px'
    };

    return (
        <DashboardLayout role="EMPLOYEE" title="Leave Management">
            <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
                
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600', color: colors.mainText, margin: '0 0 8px 0' }}>
                        Leave Application & History
                    </h1>
                    <p style={{ color: colors.secondaryText, fontSize: '15px', margin: 0 }}>
                        Apply for time off and track the status of your requests.
                    </p>
                </div>

                {/* 1. Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '50%', color: colors.primaryBlue }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Total Applied</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>{loading ? '-' : summary.totalApplied}</h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '50%', color: colors.success }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Approved</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>{loading ? '-' : summary.approved}</h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '50%', color: colors.warning }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Pending Approval</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>{loading ? '-' : summary.pending}</h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '50%', color: colors.danger }}>
                            <XCircle size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Rejected</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>{loading ? '-' : summary.rejected}</h3>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
                    
                    {/* 2. Leave Application Form */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.mainText, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={20} color={colors.primaryBlue} /> Apply Leave
                        </h2>
                        
                        <form onSubmit={handleApplyLeave}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Leave Type</label>
                                <select 
                                    style={inputStyle}
                                    value={formData.leaveType}
                                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                >
                                    <option value="CASUAL">Casual Leave (CL)</option>
                                    <option value="SICK">Sick Leave (SL)</option>
                                    <option value="EARNED">Earned Leave (EL)</option>
                                    <option value="UNPAID">Leave Without Pay (LWP)</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Start Date</label>
                                    <input 
                                        type="date" 
                                        style={inputStyle}
                                        value={formData.startDate}
                                        min={new Date().toISOString().split('T')[0]} // Cannot apply for past dates easily
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>End Date</label>
                                    <input 
                                        type="date" 
                                        style={inputStyle}
                                        value={formData.endDate}
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Session</label>
                                <select 
                                    style={inputStyle}
                                    value={formData.session}
                                    onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                                >
                                    <option value="FULL_DAY">Full Day</option>
                                    <option value="FIRST_HALF">First Half</option>
                                    <option value="SECOND_HALF">Second Half</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Reason</label>
                                <textarea 
                                    style={{ ...inputStyle, height: '100px', resize: 'none' }}
                                    placeholder="Please provide a valid reason..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                style={{ width: '100%', padding: '14px', background: isSubmitting ? '#93c5fd' : colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '500', fontSize: '14px', transition: '0.2s' }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>

                    {/* 3. Leave History Table */}
                    <div style={{ ...cardStyle, height: 'max-content' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.mainText, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={20} color={colors.primaryBlue} /> My Leave History
                        </h2>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: `2px solid ${colors.border}`, backgroundColor: '#fafafa' }}>
                                        <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Type</th>
                                        <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Duration</th>
                                        <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Session</th>
                                        <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Reason</th>
                                        <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: colors.secondaryText }}>Loading history...</td>
                                        </tr>
                                    ) : leaveHistory.length > 0 ? (
                                        leaveHistory.map((leave, index) => {
                                            const statusStyle = getStatusStyle(leave.status);
                                            return (
                                                <tr key={index} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                                    <td style={{ padding: '16px', color: colors.mainText, fontWeight: '600', fontSize: '13px' }}>
                                                        {leave.leaveType || "-"}
                                                    </td>
                                                    <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '13px' }}>
                                                        {leave.startDate} to {leave.endDate}
                                                    </td>
                                                    <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '13px' }}>
                                                        {leave.session ? leave.session.replace('_', ' ') : "-"}
                                                    </td>
                                                    <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '13px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {leave.reason || "-"}
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{ 
                                                            background: statusStyle.bg, 
                                                            color: statusStyle.color, 
                                                            padding: '6px 12px', 
                                                            borderRadius: '20px', 
                                                            fontSize: '11px', 
                                                            fontWeight: '600',
                                                            display: 'inline-block',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            {leave.status || "PENDING"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: colors.secondaryText }}>
                                                <FileText size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                                <p style={{ margin: 0 }}>No leave history found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default EmployeeLeaves;