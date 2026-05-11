import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    LayoutDashboard, Users, FileText, Clock, 
    Briefcase, DollarSign, Settings, Bell, LogOut,
    ShieldCheck, Activity, BarChart2, CalendarDays
} from 'lucide-react';

const Sidebar = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // =========================================================================
    // 1. ELITE COLOR PALETTE (Matched with your Dashboard layout)
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
    // 2. LOGOUT LOGIC
    // =========================================================================
    const handleLogout = async () => {
        try {
            // Optional: Hit backend logout API if you have one
            await api.post('/api/auth/logout').catch(() => console.log('Backend logout skipped'));
            
            // Clear all local storage auth data
            localStorage.clear();
            toast.success("Logged out successfully! See you soon.", { icon: '👋' });
            
            // Redirect to login page
            navigate('/login', { replace: true });
        } catch (error) {
            console.error("Logout failed", error);
            localStorage.clear();
            navigate('/login');
        }
    };

    // =========================================================================
    // 3. ROLE-BASED NAVIGATION MODULES
    // =========================================================================
    const menuItems = {
        ADMIN: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/admin/dashboard' },
            { name: 'Employees', icon: <Users size={20}/>, path: '/admin/employees' },
            { name: 'Leaves', icon: <FileText size={20}/>, path: '/admin/leaves' },
            { name: 'Attendance', icon: <Clock size={20}/>, path: '/admin/attendance' },
            { name: 'Projects', icon: <Briefcase size={20}/>, path: '/admin/projects' },
            { name: 'Payroll', icon: <DollarSign size={20}/>, path: '/admin/payroll' },
            { name: 'Settings', icon: <Settings size={20}/>, path: '/admin/settings' },
            { name: 'Notifications', icon: <Bell size={20}/>, path: '/admin/notifications' },
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
            { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/manager/dashboard' },
            { name: 'Projects', icon: <Briefcase size={20}/>, path: '/manager/projects' },
            { name: 'Workforce', icon: <Users size={20}/>, path: '/manager/training' },
            { name: 'Payroll Review', icon: <FileText size={20}/>, path: '/manager/payroll' },
        ],
        TL: [
            { name: 'Dashboard',    icon: <LayoutDashboard size={20}/>, path: '/tl/dashboard' },
            { name: 'My Projects',  icon: <Briefcase size={20}/>,       path: '/tl/projects' },
            { name: 'My Team',      icon: <Users size={20}/>,           path: '/tl/team' },
            { name: 'Assign Tasks', icon: <Activity size={20}/>,        path: '/tl/tasks' },
            { name: 'Performance',  icon: <BarChart2 size={20}/>,       path: '/tl/performance' },
        ],
        TEAM_LEAD: [
            { name: 'Dashboard',    icon: <LayoutDashboard size={20}/>, path: '/tl/dashboard' },
            { name: 'My Projects',  icon: <Briefcase size={20}/>,       path: '/tl/projects' },
            { name: 'My Team',      icon: <Users size={20}/>,           path: '/tl/team' },
            { name: 'Assign Tasks', icon: <Activity size={20}/>,        path: '/tl/tasks' },
            { name: 'Performance',  icon: <BarChart2 size={20}/>,       path: '/tl/performance' },
        ],
        EMPLOYEE: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/employee/dashboard' },
            { name: 'My Tasks', icon: <Briefcase size={20}/>, path: '/employee/tasks' }, 
            { name: 'Apply Leave', icon: <FileText size={20}/>, path: '/employee/leaves' },
            { name: 'My Attendance', icon: <Clock size={20}/>, path: '/employee/attendance' },
            { name: 'Payslips', icon: <DollarSign size={20}/>, path: '/employee/payroll' },
        ]
    };

    // Ensure we handle cases where role might not be exactly matched
    const navItems = menuItems[role] || [];

    // =========================================================================
    // 4. RENDER UI
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
            {/* Branding Header */}
            <div style={{ 
                height: '76px',
                minHeight: '76px',
                padding: '0 24px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                borderBottom: `1px solid ${colors.border}`,
            }}>
                <div style={{ 
                    background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', 
                    color: '#fff', 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' 
                }}>
                    <ShieldCheck size={22} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: colors.mainText, letterSpacing: '-0.5px' }}>HRM Soft</span>
                    <span style={{ fontSize: '10px', color: colors.secondaryText, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Enterprise</span>
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