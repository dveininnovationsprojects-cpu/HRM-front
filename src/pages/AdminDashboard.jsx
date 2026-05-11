import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Users, Activity, Clock, Loader2, TrendingUp, Layers, Shield, KeyRound, X, Save, Eye, EyeOff } from 'lucide-react';
import api from '../api/apiConfig';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    // 1. DASHBOARD STATES
    const [summary, setSummary] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        performance: 0,
        activeBatch: "N/A"
    });
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. PASSWORD MODAL STATES
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    // 🔥 NEW: Toggle visibility states
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // ==========================================
    // ELITE COLOR PALETTE
    // ==========================================
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        mainText: '#0F172A', secondaryText: '#64748B',
        successBg: '#DCFCE7', successText: '#16A34A',
        dangerBg: '#FEE2E2', dangerText: '#DC2626',
        warningBg: '#FEF9C3', warningText: '#CA8A04',
        border: '#E2E8F0', cardWhite: '#FFFFFF', inputBg: '#F1F5F9'
    };

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
                
                // Null handling & Case insensitive check
                const activeCount = allEmployees.filter(emp => {
                    const empStatus = emp.designationStatus || emp.status || 'Active';
                    return String(empStatus).trim().toLowerCase() === 'active';
                }).length;

                setSummary({
                    totalEmployees: totalCount,
                    activeEmployees: activeCount,
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

    // 3. CHANGE PASSWORD LOGIC
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if(passwordForm.newPassword.length < 6) {
            return toast.error("New password must be at least 6 characters.");
        }

        setIsChangingPassword(true);
        const toastId = toast.loading("Updating admin credentials...");
        try {
            await api.put('/api/settings/change-password', passwordForm);
            toast.success("Security Credentials Updated Successfully!", { id: toastId });
            
            // Reset states
            setPasswordForm({ oldPassword: '', newPassword: '' });
            setShowOldPassword(false);
            setShowNewPassword(false);
            setIsPasswordModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data || "Failed to update password. Check old password.", { id: toastId });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="ADMIN" title="Admin Dashboard">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <Loader2 className="animate-spin" size={40} color={colors.primaryBlue} />
                </div>
                <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="ADMIN" title="Admin Dashboard">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                
                {/* PAGE HEADER & QUICK ACTIONS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.mainText, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                            Executive Dashboard
                        </h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '15px' }}>
                            High-level overview of workforce performance and system metrics.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setIsPasswordModalOpen(true)}
                        style={{ 
                            background: colors.mainText, color: '#fff', border: 'none', padding: '10px 20px', 
                            borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                            gap: '8px', fontWeight: '700', transition: '0.2s', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)'
                        }}
                    >
                        <Shield size={18} color={colors.successText} /> Security Settings
                    </button>
                </div>

                {/* 1. ELITE STAT CARDS SECTION (Replaced external StatCard for precision layout) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    
                    {/* Total Employees */}
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: colors.lightBlue, padding: '12px', borderRadius: '50%', color: colors.primaryBlue, flexShrink: 0 }}>
                            <Users size={20} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0', whiteSpace: 'nowrap' }}>Total Employees</p>
                            <h2 style={{ color: colors.mainText, fontSize: '22px', fontWeight: '800', margin: 0, wordWrap: 'break-word', lineHeight: '1.2' }}>
                                {summary.totalEmployees}
                            </h2>
                        </div>
                    </div>

                    {/* Active Employees */}
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#ECFDF5', padding: '12px', borderRadius: '50%', color: '#10B981', flexShrink: 0 }}>
                            <Activity size={20} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0', whiteSpace: 'nowrap' }}>Active Employees</p>
                            <h2 style={{ color: colors.mainText, fontSize: '22px', fontWeight: '800', margin: 0, wordWrap: 'break-word', lineHeight: '1.2' }}>
                                {summary.activeEmployees}
                            </h2>
                        </div>
                    </div>

                    {/* System Performance */}
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#F5F3FF', padding: '12px', borderRadius: '50%', color: '#8B5CF6', flexShrink: 0 }}>
                            <TrendingUp size={20} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0', whiteSpace: 'nowrap' }}>Sys Performance</p>
                            <h2 style={{ color: colors.mainText, fontSize: '22px', fontWeight: '800', margin: 0, wordWrap: 'break-word', lineHeight: '1.2' }}>
                                {summary.performance}%
                            </h2>
                        </div>
                    </div>

                    {/* Active Batch */}
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#FFFBEB', padding: '12px', borderRadius: '50%', color: '#F59E0B', flexShrink: 0 }}>
                            <Layers size={20} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0', whiteSpace: 'nowrap' }}>Active Batch</p>
                            <h2 style={{ color: colors.mainText, fontSize: '18px', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.4' }}>
                                {summary.activeBatch}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* 2. Main Grid Setup */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                    
                    {/* Employee Overview Table */}
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.mainText }}>Employee Overview</h3>
                            <button 
                                onClick={() => window.location.href='/admin/employees'}
                                style={{ background: colors.lightBlue, color: colors.primaryBlue, border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: '6px 14px', borderRadius: '8px', transition: '0.2s' }}
                            >
                                View All
                            </button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Name</th>
                                        <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Department</th>
                                        <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.length > 0 ? employees.map(emp => {
                                        const rawStatus = emp.designationStatus || emp.status || 'Active';
                                        const isActive = String(rawStatus).trim().toLowerCase() === 'active';
                                        const displayText = isActive ? 'Active' : String(rawStatus);

                                        return (
                                            <tr key={emp.id} style={{ background: colors.inputBg, transition: '0.2s' }}>
                                                <td style={{ padding: '16px', fontWeight: '700', color: colors.mainText, fontSize: '14px', borderRadius: '12px 0 0 12px' }}>{emp.fullName}</td>
                                                <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px', fontWeight: '600' }}>{emp.department}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{ 
                                                        padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                                                        background: isActive ? colors.successBg : colors.dangerBg,
                                                        color: isActive ? colors.successText : colors.dangerText,
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {displayText}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'center', borderRadius: '0 12px 12px 0' }}>
                                                    <button 
                                                        onClick={() => window.location.href=`/admin/employees/${emp.id}`}
                                                        style={{ background: '#FFFFFF', color: colors.primaryBlue, border: `1px solid ${colors.border}`, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: '0.2s' }}
                                                    >
                                                        Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: colors.secondaryText }}>No recent employees found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Project Status Section */}
                    <div style={{ background: colors.cardWhite, padding: '32px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: colors.mainText }}>Project Status</h3>
                        <p style={{ fontSize: '14px', color: colors.secondaryText, margin: '0 0 24px 0' }}>Admin level tracking hub.</p>
                        
                        <div style={{ flex: 1, padding: '40px 20px', textAlign: 'center', border: `2px dashed ${colors.border}`, borderRadius: '16px', background: colors.inputBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                             <Activity size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                             <h4 style={{ margin: '0 0 8px 0', color: colors.mainText, fontSize: '16px', fontWeight: '700' }}>No Active Project Stream</h4>
                             <p style={{ color: colors.secondaryText, fontSize: '14px', margin: 0, maxWidth: '250px' }}>Project & Training insights will appear here as you assign tasks.</p>
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* CHANGE PASSWORD MODAL                      */}
                {/* ========================================== */}
                {isPasswordModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '24px', overflow: 'hidden', animation: 'slideUp 0.3s ease-out', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                            <div style={{ padding: '24px', background: colors.mainText, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <KeyRound size={20} color={colors.successText} /> Admin Security
                                    </h2>
                                    <p style={{ margin: '4px 0 0 0', color: '#94A3B8', fontSize: '13px', fontWeight: '500' }}>
                                        Update your master access credentials.
                                    </p>
                                </div>
                                <button onClick={() => setIsPasswordModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <form onSubmit={handlePasswordChange} style={{ padding: '24px' }}>
                                
                                {/* Current Password Field */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px', textTransform: 'uppercase' }}>Current Password</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input 
                                            type={showOldPassword ? "text" : "password"} 
                                            required 
                                            value={passwordForm.oldPassword} 
                                            onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                                            style={{ width: '100%', padding: '14px', paddingRight: '45px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', fontSize: '15px', fontWeight: '600', boxSizing: 'border-box' }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: colors.secondaryText, display: 'flex' }}
                                        >
                                            {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password Field */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px', textTransform: 'uppercase' }}>New Secured Password</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input 
                                            type={showNewPassword ? "text" : "password"} 
                                            required minLength="6"
                                            value={passwordForm.newPassword} 
                                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                            style={{ width: '100%', padding: '14px', paddingRight: '45px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', fontSize: '15px', fontWeight: '600', boxSizing: 'border-box' }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: colors.secondaryText, display: 'flex' }}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    type="submit" disabled={isChangingPassword}
                                    style={{ width: '100%', background: isChangingPassword ? colors.secondaryText : colors.primaryBlue, color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: isChangingPassword ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
                                >
                                    {isChangingPassword ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {isChangingPassword ? 'Securing Account...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
            <style>{`
                .animate-spin { animation: spin 1s linear infinite; } 
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}</style>
        </DashboardLayout>
    );
};

export default AdminDashboard;