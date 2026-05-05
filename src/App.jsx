import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

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

// TL MODULES
import TLProjects from './pages/tl/TLProjects';
import TLTeam from './pages/tl/TLTeam';
import TLTasks from './pages/tl/TLTasks';
import TLTraining from './pages/tl/TLTraining';
import TLPerformance from './pages/tl/TLPerformance';
import TLAttendance from './pages/tl/TLAttendance';
import TLLeaves from './pages/tl/TLLeaves';
import TLNotifications from './pages/tl/TLNotifications';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
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
        <Route path="/tl/projects" element={<TLProjects />} />
        <Route path="/tl/team" element={<TLTeam />} />
        <Route path="/tl/tasks" element={<TLTasks />} />
        <Route path="/tl/training" element={<TLTraining />} />
        <Route path="/tl/performance" element={<TLPerformance />} />
        <Route path="/tl/attendance" element={<TLAttendance />} />
        <Route path="/tl/leaves" element={<TLLeaves />} />
        <Route path="/tl/notifications" element={<TLNotifications />} />

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