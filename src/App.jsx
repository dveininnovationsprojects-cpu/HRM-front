import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminPayroll from './pages/admin/AdminPayroll';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminProjects from './pages/admin/AdminProjects';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';

// ==========================================
// 3. HR COMPONENTS
// ==========================================
import HRDashboard from './pages/hr/HRDashboard';
import HREmployees from './pages/hr/HREmployees';
import HRLeaves from './pages/hr/HRLeaves';
import HRAttendance from './pages/hr/HRAttendance';
import HRPayroll from './pages/hr/HRPayroll';
import HRRecruitment from './pages/hr/HRRecruitment';
import HRPerformance from './pages/hr/HRPerformance';

// ==========================================
// 4. MANAGER COMPONENTS
// ==========================================
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerProjects from './pages/manager/ManagerProjects';
import ManagerWorkforce from './pages/manager/ManagerWorkforce';
import ManagerPayroll from './pages/manager/ManagerPayroll';

// ==========================================
// 5. TL COMPONENTS
// ==========================================
import TLDashboard from './pages/TLDashboard';
import TLProjects from './pages/tl/TLProjects';
import TLTeam from './pages/tl/TLTeam';
import TLTasks from './pages/tl/TLTasks';
import TLPerformance from './pages/tl/TLPerformance';
import TLAttendance from './pages/tl/TLAttendance';
import TLLeaves from './pages/tl/TLLeaves';

// ==========================================
// 6. EMPLOYEE COMPONENTS
// ==========================================
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeeLeaves from './pages/employee/EmployeeLeaves';
import EmployeePayroll from './pages/employee/EmployeePayroll';
import EmployeeTasks from './pages/employee/EmployeeTasks';

// ==========================================
// 🛡️ ENTERPRISE PROTECTED ROUTE LOGIC
// ==========================================
const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    
    // Get auth status from LocalStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const currentRole = localStorage.getItem('role');

    // SCENARIO 1: Not Logged In at all
    if (!isAuthenticated || !currentRole) {
        // Redirect them to login, but save the location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // SCENARIO 2: Logged in, but trying to access a page they don't have permission for
    if (allowedRoles && !allowedRoles.includes(currentRole)) {
        console.warn(`SECURITY ALERT: User with role ${currentRole} attempted to access restricted route: ${location.pathname}`);
        return <Navigate to="/unauthorized" replace />;
    }

    // SCENARIO 3: Fully Authenticated and Authorized
    return children;
};

// ==========================================
// 🚨 UNAUTHORIZED FALLBACK COMPONENT
// ==========================================
// You can move this to a separate file later (e.g., src/pages/Unauthorized.jsx)
const UnauthorizedPage = () => {
    const role = localStorage.getItem('role') || 'USER';
    const fallbackPath = role ? `/${role.toLowerCase()}/dashboard` : '/login';
    
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ background: '#FEF2F2', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
                <span style={{ fontSize: '40px' }}>🛑</span>
            </div>
            <h1 style={{ fontSize: '32px', color: '#0F172A', fontWeight: '800', marginBottom: '10px' }}>Access Denied</h1>
            <p style={{ color: '#64748B', fontSize: '16px', marginBottom: '30px' }}>You do not have the required permissions to view this page.</p>
            <a href={fallbackPath} style={{ padding: '12px 24px', background: '#2563EB', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}>
                Return to My Dashboard
            </a>
        </div>
    );
};

// ==========================================
// MAIN APP COMPONENT & ROUTE MAPPING
// ==========================================
function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 4000 }} />
      
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* ==================================================================== */}
        {/* 👑 ADMIN ROUTES (Strictly ADMIN only)                                */}
        {/* ==================================================================== */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminEmployees /></ProtectedRoute>} /> 
        <Route path="/admin/leaves" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLeaves /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAttendance /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProjects /></ProtectedRoute>} />
        <Route path="/admin/payroll" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPayroll /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminNotifications /></ProtectedRoute>} />

        {/* ==================================================================== */}
        {/* 👔 HR ROUTES (Accessible by HR and ADMIN)                            */}
        {/* ==================================================================== */}
        <Route path="/hr/dashboard" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRDashboard /></ProtectedRoute>} />
        <Route path="/hr/employees" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HREmployees /></ProtectedRoute>} />
        <Route path="/hr/leaves" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRLeaves /></ProtectedRoute>} />
        <Route path="/hr/attendance" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRAttendance /></ProtectedRoute>} />
        <Route path="/hr/payroll" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRPayroll /></ProtectedRoute>} />
        <Route path="/hr/recruitment" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRRecruitment /></ProtectedRoute>} />
        <Route path="/hr/performance" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRPerformance /></ProtectedRoute>} />

        {/* ==================================================================== */}
        {/* 📊 MANAGER ROUTES (Accessible by MANAGER and ADMIN)                  */}
        {/* ==================================================================== */}
        <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/manager/projects" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerProjects /></ProtectedRoute>} /> 
        <Route path="/manager/training" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerWorkforce /></ProtectedRoute>} />
        <Route path="/manager/payroll" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerPayroll /></ProtectedRoute>} />

        {/* ==================================================================== */}
        {/* 🎯 TL ROUTES (Accessible by TL/TEAM_LEAD, MANAGER, and ADMIN)        */}
        {/* ==================================================================== */}
        <Route path="/tl/dashboard"   element={<ProtectedRoute allowedRoles={['TL','TEAM_LEAD','MANAGER','ADMIN']}><TLDashboard /></ProtectedRoute>} />
        <Route path="/tl/projects"    element={<ProtectedRoute allowedRoles={['TL','TEAM_LEAD','MANAGER','ADMIN']}><TLProjects /></ProtectedRoute>} />
        <Route path="/tl/team"        element={<ProtectedRoute allowedRoles={['TL','TEAM_LEAD','MANAGER','ADMIN']}><TLTeam /></ProtectedRoute>} />
        <Route path="/tl/tasks"       element={<ProtectedRoute allowedRoles={['TL','TEAM_LEAD','MANAGER','ADMIN']}><TLTasks /></ProtectedRoute>} />
        <Route path="/tl/performance" element={<ProtectedRoute allowedRoles={['TL','TEAM_LEAD','MANAGER','ADMIN']}><TLPerformance /></ProtectedRoute>} />
        <Route path="/tl/attendance"  element={<ProtectedRoute allowedRoles={['TL','TEAM_LEAD','MANAGER','ADMIN']}><TLAttendance /></ProtectedRoute>} />
        <Route path="/tl/leaves"      element={<ProtectedRoute allowedRoles={['TL','TEAM_LEAD','MANAGER','ADMIN']}><TLLeaves /></ProtectedRoute>} />

        {/* ==================================================================== */}
        {/* 💼 EMPLOYEE ROUTES (Base level - Usually restricted to their own ID) */}
        {/* ==================================================================== */}
        <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeAttendance /></ProtectedRoute>} />
        <Route path="/employee/leaves" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeLeaves /></ProtectedRoute>} />
        <Route path="/employee/payroll" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeePayroll /></ProtectedRoute>} />
        <Route path="/employee/tasks" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeTasks /></ProtectedRoute>} />

        {/* ==================================================================== */}
        {/* ⚠️ 404 FALLBACK ROUTE                                                */}
        {/* ==================================================================== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;