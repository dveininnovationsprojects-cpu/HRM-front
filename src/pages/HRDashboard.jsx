import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Users, Briefcase, CheckCircle, Clock, Megaphone, UploadCloud, FileText, Activity } from 'lucide-react';
import api from '../api/apiConfig';
import toast from 'react-hot-toast';

const HRDashboard = () => {
    // State Management
    const [summary, setSummary] = useState({ total: 0, active: 0, trainingCompleted: 0, trainingPending: 0 });
    const [employees, setEmployees] = useState([]);
    const [recruitment, setRecruitment] = useState({ applied: 0, selected: 0 });
    const [announcementMsg, setAnnouncementMsg] = useState("");
    const [loading, setLoading] = useState(true);

    // Color Palette mapping
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
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            // Fetching all dashboard data concurrently
            const [summaryRes, empRes, recRes] = await Promise.all([
                api.get('/api/admin/training-summary'),
                api.get('/api/employees'),
                api.get('/api/recruitment/view-dashboard')
            ]);

            setSummary(summaryRes.data || { total: 0, active: 0, trainingCompleted: 0, trainingPending: 0 });
            setEmployees(empRes.data ? empRes.data.slice(0, 5) : []); 
            setRecruitment(recRes.data || { applied: 0, selected: 0 });
            
        } catch (error) {
            console.error("Dashboard data fetch failed", error);
            toast.error("Failed to load dashboard data. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleBroadcast = async () => {
        if (!announcementMsg.trim()) {
            toast.error("Please enter an announcement message.");
            return;
        }

        try {
            await api.post('/api/notifications/announce', { message: announcementMsg });
            toast.success("Announcement broadcasted successfully to all employees!");
            setAnnouncementMsg("");
        } catch (error) {
            toast.error("Failed to broadcast announcement.");
            console.error(error);
        }
    };

    // Shared styles for Cards
    const cardStyle = {
        background: colors.cardWhite,
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        border: `1px solid ${colors.border}`,
        fontFamily: "'Inter', sans-serif" // Professional standard font
    };

    return (
        <DashboardLayout role="HR" title="HR Dashboard">
            <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
                
                {/* Header Section */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600', color: colors.mainText, margin: '0 0 8px 0' }}>
                        Good Morning, HR Team! 👋
                    </h1>
                    <p style={{ color: colors.secondaryText, fontSize: '15px', margin: 0 }}>
                        Here is the overview of the organization's workforce and recruitment status.
                    </p>
                </div>

                {/* 1. Summary Cards (Top Row) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '50%', color: colors.primaryBlue }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Total Staff</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>
                                {loading ? '...' : summary.total}
                            </h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '50%', color: colors.success }}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Active Employees</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>
                                {loading ? '...' : summary.active}
                            </h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#f5f3ff', padding: '16px', borderRadius: '50%', color: '#8b5cf6' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Training Completed</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>
                                {loading ? '...' : summary.trainingCompleted}
                            </h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '50%', color: colors.warning }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Training Pending</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>
                                {loading ? '...' : summary.trainingPending}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    
                    {/* 2. Employee Overview Table (Left Column) */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.mainText, margin: 0 }}>Employee Overview</h2>
                            <button style={{ color: colors.primaryBlue, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '500' }}>View All</button>
                        </div>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                                        <th style={{ padding: '12px 16px', color: colors.secondaryText, fontWeight: '500', fontSize: '14px' }}>Name</th>
                                        <th style={{ padding: '12px 16px', color: colors.secondaryText, fontWeight: '500', fontSize: '14px' }}>Dept</th>
                                        <th style={{ padding: '12px 16px', color: colors.secondaryText, fontWeight: '500', fontSize: '14px' }}>Designation</th>
                                        <th style={{ padding: '12px 16px', color: colors.secondaryText, fontWeight: '500', fontSize: '14px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.length > 0 ? employees.map((emp, index) => (
                                        <tr key={index} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                            <td style={{ padding: '16px', color: colors.mainText, fontWeight: '500', fontSize: '14px' }}>{emp.name}</td>
                                            <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px' }}>{emp.dept}</td>
                                            <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px' }}>{emp.designation}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ 
                                                    background: emp.status === 'Active' ? '#ecfdf5' : '#fef2f2', 
                                                    color: emp.status === 'Active' ? colors.success : colors.danger, 
                                                    padding: '4px 12px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '12px', 
                                                    fontWeight: '600' 
                                                }}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: colors.secondaryText }}>No employees found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Column: Recruitment & Announcements */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* 3. Recruitment Hub */}
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.mainText, margin: '0 0 8px 0' }}>Recruitment Hub</h2>
                            <p style={{ fontSize: '13px', color: colors.secondaryText, marginBottom: '20px' }}>Manage jobs and candidate pipeline.</p>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: colors.lightBlue, padding: '16px', borderRadius: '8px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '13px', color: colors.secondaryText }}>Applied</p>
                                    <h4 style={{ margin: '4px 0 0 0', fontSize: '20px', color: colors.primaryBlue }}>{recruitment.applied}</h4>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '13px', color: colors.secondaryText }}>Selected</p>
                                    <h4 style={{ margin: '4px 0 0 0', fontSize: '20px', color: colors.success }}>{recruitment.selected}</h4>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: colors.primaryBlue, color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', transition: '0.2s' }}>
                                    <Briefcase size={18} /> Post New Job
                                </button>
                                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: colors.cardWhite, color: colors.primaryBlue, padding: '12px', border: `1px solid ${colors.primaryBlue}`, borderRadius: '8px', fontWeight: '500', cursor: 'pointer', transition: '0.2s' }}>
                                    <UploadCloud size={18} /> Bulk Upload Candidates
                                </button>
                                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: colors.cardWhite, color: colors.mainText, padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontWeight: '500', cursor: 'pointer', transition: '0.2s' }}>
                                    <FileText size={18} /> Publish Results
                                </button>
                            </div>
                        </div>

                        {/* 4. Company Announcements */}
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.mainText, margin: '0 0 8px 0' }}>Announcements</h2>
                            <p style={{ fontSize: '13px', color: colors.secondaryText, marginBottom: '16px' }}>Broadcast official updates to all staff.</p>
                            
                            <textarea 
                                value={announcementMsg}
                                onChange={(e) => setAnnouncementMsg(e.target.value)}
                                placeholder="Type official company alert here..." 
                                style={{ 
                                    width: '100%', 
                                    height: '100px', 
                                    padding: '12px', 
                                    marginBottom: '16px', 
                                    border: `1px solid ${colors.border}`, 
                                    borderRadius: '8px', 
                                    resize: 'none',
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                            ></textarea>
                            
                            <button 
                                onClick={handleBroadcast}
                                style={{ width: '100%', background: colors.danger, color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '500', cursor: 'pointer' }}
                            >
                                <Megaphone size={18} /> Broadcast to All
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRDashboard;