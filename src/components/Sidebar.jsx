import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    LayoutDashboard, Users, FileText, Clock, 
    Briefcase, DollarSign, Settings, Bell, LogOut,
    ShieldCheck, Activity, BarChart2, CalendarDays,
    TrendingUp, BookOpen, CheckSquare
} from 'lucide-react';

const Sidebar = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 🔥 NEW: State for Dynamic Branding
    const [brandConfig, setBrandConfig] = useState({
        companyName: 'HRM Soft',
        companyLogo: null
    });

    // =========================================================================
    // 1. ELITE COLOR PALETTE
    // =========================================================================
    const colors = {
        primaryBlue: '#2563EB',
        lightBlue: '#EFF6FF',
        mainText: '#0F172A',
        secondaryText: '#64748B',
        hoverBg: '#F8FAFC',
        danger: '#EF4444',
        dangerLight: '#FEF2F2',
        border: '#E2E8F0'
    };

    // =========================================================================
    // 🔥 2. FETCH DYNAMIC BRANDING LOGIC
    // =========================================================================
    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await api.get('/api/settings');
                if (res.data) {
                    setBrandConfig({
                        companyName: res.data.companyName || 'HRM Soft',
                        companyLogo: res.data.companyLogo || null
                    });
                }
            } catch (error) {
                console.error("Failed to load dynamic branding", error);
            }
        };
        fetchBranding();
    }, []);

    // =========================================================================
    // 3. LOGOUT LOGIC
    // =========================================================================
    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout').catch(() => console.log('Backend logout skipped'));
            localStorage.clear();
            toast.success("Logged out successfully! See you soon.",);
            navigate('/login', { replace: true });
        } catch (error) {
            console.error("Logout failed", error);
            localStorage.clear();
            navigate('/login');
        }
    };

    // =========================================================================
    // 4. ROLE-BASED NAVIGATION MODULES
    // =========================================================================
    const menuItems = {
        ADMIN: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/admin/dashboard' },
            { name: 'Employees', icon: <Users size={20}/>, path: '/admin/employees' },
            { name: 'Leaves', icon: <FileText size={20}/>, path: '/admin/leaves' },
            { name: 'Attendance', icon: <Clock size={20}/>, path: '/admin/attendance' },
            { name: 'Projects', icon: <Briefcase size={20}/>, path: '/admin/projects' },
            { name: 'Payroll', icon: <DollarSign size={20}/>, path: '/admin/payroll' },
            { name: 'Settings', icon: <Settings size={20}/>, path: '/admin/settings' }
        ],
        HR: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/hr/dashboard' },
            { name: 'Employee Mgmt', icon: <Users size={20}/>, path: '/hr/employees' },
            { name: 'Leave Approvals', icon: <CalendarDays size={20}/>, path: '/hr/leaves' },
            { name: 'Attendance', icon: <Clock size={20}/>, path: '/hr/attendance' },
            { name: 'Recruitment', icon: <Briefcase size={20}/>, path: '/hr/recruitment' },
            { name: 'Payroll Run', icon: <DollarSign size={20}/>, path: '/hr/payroll' },
            { name: 'Performance', icon: <BarChart2 size={20}/>, path: '/hr/performance' },
        ],
        MANAGER: [
            { name: 'Executive Dashboard', icon: <LayoutDashboard size={20}/>, path: '/manager/dashboard' },
            { name: 'Project Architecture', icon: <Briefcase size={20}/>, path: '/manager/projects' },
            { name: 'Performance Analytics', icon: <BarChart2 size={20}/>, path: '/manager/analytics' },
            { name: 'Leave Approvals', icon: <CalendarDays size={20}/>, path: '/manager/leaves' },
            { name: 'Payroll Operations', icon: <FileText size={20}/>, path: '/manager/payroll' },
        ],
        TL: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/tl/dashboard' },
            { name: 'Attendance', icon: <Clock size={20}/>, path: '/tl/attendance' },
            { name: 'Leaves', icon: <CalendarDays size={20}/>, path: '/tl/leaves' },
            { name: 'Projects', icon: <Briefcase size={20}/>, path: '/tl/projects' },
            { name: 'Tasks', icon: <CheckSquare size={20}/>, path: '/tl/tasks' },
            { name: 'My Team', icon: <Users size={20}/>, path: '/tl/team' },
            { name: 'Performance', icon: <TrendingUp size={20}/>, path: '/tl/performance' },
            { name: 'Training', icon: <BookOpen size={20}/>, path: '/tl/training' },
            // { name: 'Notifications', icon: <Bell size={20}/>, path: '/tl/notifications' }
        ],
        TEAM_LEAD: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/tl/dashboard' },
            { name: 'Attendance', icon: <Clock size={20}/>, path: '/tl/attendance' },
            { name: 'Leaves', icon: <CalendarDays size={20}/>, path: '/tl/leaves' },
            { name: 'Projects', icon: <Briefcase size={20}/>, path: '/tl/projects' },
            { name: 'Tasks', icon: <CheckSquare size={20}/>, path: '/tl/tasks' },
            { name: 'My Team', icon: <Users size={20}/>, path: '/tl/team' },
            { name: 'Performance', icon: <TrendingUp size={20}/>, path: '/tl/performance' },
            { name: 'Training', icon: <BookOpen size={20}/>, path: '/tl/training' },
            { name: 'Notifications', icon: <Bell size={20}/>, path: '/tl/notifications' }
        ],
        EMPLOYEE: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/employee/dashboard' },
            { name: 'My Tasks', icon: <Briefcase size={20}/>, path: '/employee/tasks' }, 
            { name: 'Apply Leave', icon: <FileText size={20}/>, path: '/employee/leaves' },
            { name: 'My Attendance', icon: <Clock size={20}/>, path: '/employee/attendance' },
            { name: 'Payslips', icon: <DollarSign size={20}/>, path: '/employee/payroll' },
        ]
    };

    const navItems = menuItems[role] || [];

    // =========================================================================
    // 5. RENDER UI
    // =========================================================================
    return (
        <div style={{ 
            width: '100%', 
            height: '100vh', 
            background: colors.cardWhite, 
            display: 'flex', 
            flexDirection: 'column', 
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* 🔥 DYNAMIC BRANDING HEADER */}
            <div style={{ 
                padding: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                borderBottom: `1px solid ${colors.border}`,
                marginBottom: '10px'
            }}>
                {brandConfig.companyLogo ? (
                    <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', 
                        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)', border: `1px solid ${colors.border}`
                    }}>
                        <img src={brandConfig.companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                ) : (
                    <div style={{ 
                        background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', color: '#fff', 
                        width: '36px', height: '36px', borderRadius: '10px', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' 
                    }}>
                        <ShieldCheck size={22} />
                    </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: '17px', fontWeight: '800', color: colors.mainText, letterSpacing: '-0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                        {brandConfig.companyName}
                    </span>
                    <span style={{ fontSize: '10px', color: colors.secondaryText, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Enterprise
                    </span>
                </div>
            </div>

            {/* Navigation Menu (Scrollable Area) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }} className="custom-scrollbar">
                
                <p style={{ margin: '10px 0 6px 12px', fontSize: '11px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Main Menu
                </p>

                {navItems.length > 0 ? navItems.map((item) => {
                    const isActive = location.pathname.includes(item.path);
                    return (
                        <Link 
                            key={item.name} 
                            to={item.path} 
                            className="sidebar-link"
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '14px', 
                                padding: '12px 16px', 
                                textDecoration: 'none', 
                                borderRadius: '12px',
                                color: isActive ? colors.primaryBlue : colors.secondaryText,
                                background: isActive ? colors.lightBlue : 'transparent',
                                transition: 'all 0.2s ease',
                                fontWeight: isActive ? '700' : '500',
                                position: 'relative'
                            }}
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <div style={{ position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '24px', background: colors.primaryBlue, borderRadius: '0 4px 4px 0' }}></div>
                            )}
                            
                            <div style={{ color: isActive ? colors.primaryBlue : '#94A3B8', display: 'flex', transition: '0.2s' }}>
                                {item.icon}
                            </div>
                            <span style={{ fontSize: '14px' }}>{item.name}</span>
                        </Link>
                    )
                }) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: colors.secondaryText, fontSize: '13px' }}>
                        No modules mapped to this role.
                    </div>
                )}
            </div>

            {/* Logout Section (Fixed at bottom) */}
            <div style={{ padding: '20px', borderTop: `1px solid ${colors.border}`, marginTop: 'auto' }}>
                <button 
                    onClick={handleLogout}
                    className="logout-btn"
                    style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '12px 16px', 
                        background: 'transparent',
                        color: colors.danger,
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <LogOut size={20} />
                    <span>Secure Logout</span>
                </button>
            </div>

            {/* Injected CSS for specific hover effects */}
            <style>
                {`
                    .sidebar-link:hover {
                        background-color: ${colors.hoverBg} !important;
                        color: ${colors.mainText} !important;
                    }
                    .sidebar-link:hover div {
                        color: ${colors.primaryBlue} !important;
                    }
                    .logout-btn:hover {
                        background-color: ${colors.dangerLight} !important;
                    }
                    /* Clean Scrollbar */
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #CBD5E1;
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #94A3B8;
                    }
                `}
            </style>
        </div>
    );
};

export default Sidebar;