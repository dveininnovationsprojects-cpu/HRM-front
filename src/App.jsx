import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Core Pages
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import TLDashboard from './pages/TLDashboard';
import HRDashboard from './pages/HRDashboard';

// Admin Functional Sub-Pages [cite: 8]
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminPayroll from './pages/admin/AdminPayroll';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminProjects from './pages/admin/AdminProjects';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';

// MANAGER MASTER MODULES - Professional Workflow [cite: 32, 37, 43, 51]
import ManagerProjects from './pages/manager/ManagerProjects';
import ManagerWorkforce from './pages/manager/ManagerWorkforce';
import ManagerPayroll from './pages/manager/ManagerPayroll';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. ENTRY & AUTH FLOW [cite: 1] */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 2. ADMIN MASTER CONTROL [cite: 8, 14] */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<AdminEmployees />} /> 
        <Route path="/admin/leaves" element={<AdminLeaves />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/payroll" element={<AdminPayroll />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />

        {/* 3. MANAGER STRATEGY HUB  */}
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        {/* Project Excel Import Power [cite: 37, 38] */}
        <Route path="/manager/projects" element={<ManagerProjects />} /> 
        {/* Workforce & Batch Creation  */}
        <Route path="/manager/training" element={<ManagerWorkforce />} />
        {/* Financial Access [cite: 50, 51] */}
        <Route path="/manager/payroll" element={<ManagerPayroll />} />

        {/* 4. TEAM LEAD (TL) MODULES */}
        <Route path="/tl/dashboard" element={<TLDashboard />} />
        <Route path="/tl/tasks" element={<TLDashboard />} />
        <Route path="/tl/team" element={<TLDashboard />} />

        {/* 5. EMPLOYEE SELF-SERVICE [cite: 6] */}
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/leaves" element={<EmployeeDashboard />} />
        <Route path="/employee/payroll" element={<EmployeeDashboard />} />

        {/* WILDCARD SAFETY - Security fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;