import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, Clock, 
  Briefcase, DollarSign, Settings, Bell, LogOut 
} from 'lucide-react';
import toast from 'react-hot-toast'; // --- 1. Toast Import ---

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    
    // --- 2. Professional Toast Success (No Tanglish) ---
    toast.success("Logged out successfully.");
    
    navigate('/login');
  };

  const menuItems = {
    ADMIN: [
      { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/admin/dashboard' },
      { name: 'Employees', icon: <Users size={20}/>, path: '/admin/employees' },
      { name: 'Leaves', icon: <FileText size={20}/>, path: '/admin/leaves' },
      { name: 'Attendance', icon: <Clock size={20}/>, path: '/admin/attendance' },
      { name: 'Project & Performance', icon: <Briefcase size={20}/>, path: '/admin/projects' },
      { name: 'Payroll', icon: <DollarSign size={20}/>, path: '/admin/payroll' },
      { name: 'Settings', icon: <Settings size={20}/>, path: '/admin/settings' },
      { name: 'Notifications', icon: <Bell size={20}/>, path: '/admin/notifications' },
    ],
    MANAGER: [
      { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/manager/dashboard' },
      { name: 'Projects', icon: <Briefcase size={20}/>, path: '/manager/projects' },
      { name: 'Workforce', icon: <Users size={20}/>, path: '/manager/training' },
      { name: 'Payroll', icon: <FileText size={20}/>, path: '/manager/payroll' },
    ],
    EMPLOYEE: [
      { name: 'My Work Log', icon: <LayoutDashboard size={20}/>, path: '/employee/dashboard' },
      { name: 'Apply Leave', icon: <FileText size={20}/>, path: '/employee/leaves' },
      { name: 'Payslips', icon: <FileText size={20}/>, path: '/employee/payroll' },
    ]
  };

  const navItems = menuItems[role] || [];

  return (
    <div style={{ width: '260px', height: '100vh', background: '#fff', borderRight: '1px solid #f1f5f9', position: 'fixed', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
      <div style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#3b82f6', color: '#fff', width: '35px', height: '35px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>HR</div>
        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' }}>HRM Soft</span>
      </div>

      <nav style={{ flex: 1, padding: '0 20px', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            to={item.path} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 20px', 
              textDecoration: 'none', borderRadius: '12px', marginBottom: '8px',
              color: location.pathname === item.path ? '#3b82f6' : '#64748b',
              background: location.pathname === item.path ? '#eff6ff' : 'transparent',
              transition: '0.3s'
            }}
          >
            {item.icon} <span style={{ fontWeight: '600' }}>{item.name}</span>
          </Link>
        ))}
      </nav>

      <button 
        onClick={handleLogout} 
        style={{ margin: '20px', padding: '15px', border: 'none', background: '#fff1f2', color: '#e11d48', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '700' }}
      >
        <LogOut size={20}/> Logout
      </button>
    </div>
  );
};

export default Sidebar;