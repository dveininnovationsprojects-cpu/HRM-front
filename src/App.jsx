import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Toasts theliva varadhukku

// Core Pages
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import TLDashboard from './pages/TLDashboard';
import HRDashboard from './pages/HRDashboard';

// Admin Functional Sub-Pages
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminPayroll from './pages/admin/AdminPayroll';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminProjects from './pages/admin/AdminProjects';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';

// MANAGER MASTER MODULES - Professional Workflow
import ManagerProjects from './pages/manager/ManagerProjects';
import ManagerWorkforce from './pages/manager/ManagerWorkforce';
import ManagerPayroll from './pages/manager/ManagerPayroll';

// --- MASS FIX: Employee Sub-Pages Imports (Screenshot padi thelivaana path) ---
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import EmployeeLeaves from './pages/Employee/EmployeeLeaves';
import EmployeePayroll from './pages/Employee/EmployeePayroll';
import EmployeeAttendance from './pages/Employee/EmployeeAttendance';
import EmployeeTasks from './pages/Employee/EmployeeTasks';

// --- MASS FIX: Authentication & Session Checkers ---

// Tab close panni thirumba vandha Login-ku pogama Dashboard-ku anuppum logic
const RootRedirect = () => {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  const role = localStorage.getItem('role');

  if (isAuth) {
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" />;
    if (role === 'MANAGER') return <Navigate to="/manager/dashboard" />;
    if (role === 'TL' || role === 'TEAM_LEAD') return <Navigate to="/tl/dashboard" />;
    if (role === 'HR') return <Navigate to="/hr/dashboard" />;
    return <Navigate to="/employee/dashboard" />;
  }
  return <Navigate to="/login" />;
};

// Already login-la irundha thirumba /login page-ah paaka mudiyaadhu
const PublicRoute = ({ children }) => {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  return isAuth ? <RootRedirect /> : children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} /> 
      
      <Routes>
        {/* 1. ENTRY & AUTH FLOW */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        {/* 2. ADMIN MASTER CONTROL */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<AdminEmployees />} /> 
        <Route path="/admin/leaves" element={<AdminLeaves />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/payroll" element={<AdminPayroll />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />

        {/* 3. MANAGER STRATEGY HUB */}
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/projects" element={<ManagerProjects />} /> 
        <Route path="/manager/training" element={<ManagerWorkforce />} />
        <Route path="/manager/payroll" element={<ManagerPayroll />} />

        {/* 4. HR Routes */}
        <Route path="/hr/dashboard" element={<HRDashboard />} />

        {/* 5. TL Routes */}
        <Route path="/tl/dashboard" element={<TLDashboard />} />
        <Route path="/tl/tasks" element={<TLDashboard />} />
        <Route path="/tl/team" element={<TLDashboard />} />

        {/* 6. EMPLOYEE SELF-SERVICE (Fully Connected) */}
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/leaves" element={<EmployeeLeaves />} />
        <Route path="/employee/payroll" element={<EmployeePayroll />} />
        <Route path="/employee/attendance" element={<EmployeeAttendance />} />
        <Route path="/employee/tasks" element={<EmployeeTasks />} />

        {/* WILDCARD SAFETY - Security fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;