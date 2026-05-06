import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ==========================================
// 1. CORE PAGES & AUTH
// ==========================================
import Register from './pages/Register';
import Login from './pages/Login';
import ErrorPage from './pages/ErrorPage';

// ==========================================
// 2. ADMIN COMPONENTS
// ==========================================
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import TLDashboard from './pages/TLDashboard';
import HRDashboard from './pages/HRDashboard';

// Admin Sub-Pages
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminPayroll from './pages/admin/AdminPayroll';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminProjects from './pages/admin/AdminProjects';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';

// Manager Sub-Pages
import ManagerProjects from './pages/manager/ManagerProjects';
import ManagerWorkforce from './pages/manager/ManagerWorkforce';
import ManagerPayroll from './pages/manager/ManagerPayroll';

// Employee Sub-Pages (Corrected Path)
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeeLeaves from './pages/employee/EmployeeLeaves';
import EmployeePayroll from './pages/employee/EmployeePayroll';
import EmployeeTasks from './pages/employee/EmployeeTasks';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<AdminEmployees />} /> 
        <Route path="/admin/leaves" element={<AdminLeaves />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/payroll" element={<AdminPayroll />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />

        {/* Manager Routes */}
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/projects" element={<ManagerProjects />} /> 
        <Route path="/manager/training" element={<ManagerWorkforce />} />
        <Route path="/manager/payroll" element={<ManagerPayroll />} />

        {/* HR Routes */}
        <Route path="/hr/dashboard" element={<HRDashboard />} />

        {/* TL Routes */}
        <Route path="/tl/dashboard" element={<TLDashboard />} />
        <Route path="/tl/tasks" element={<TLDashboard />} />
        <Route path="/tl/team" element={<TLDashboard />} />

        {/* Employee Routes */}
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/attendance" element={<EmployeeAttendance />} />
        <Route path="/employee/leaves" element={<EmployeeLeaves />} />
        <Route path="/employee/payroll" element={<EmployeePayroll />} />
        <Route path="/employee/tasks" element={<EmployeeTasks />} />

        {/* Safety Fallback */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;