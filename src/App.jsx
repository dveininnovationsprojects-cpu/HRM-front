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
// import AdminNotifications from './pages/admin/AdminNotifications';

// ==========================================
// 3. HR COMPONENTS (Navin's additions)
// ==========================================
import HRDashboard from './pages/hr/HRDashboard';
import HREmployees from './pages/hr/HREmployees';
import HRLeaves from './pages/hr/HRLeaves';
import HRAttendance from './pages/hr/HRAttendance';
import HRPayroll from './pages/hr/HRPayroll';
import HRRecruitment from './pages/hr/HRRecruitment';
import HRPerformance from './pages/hr/HRPerformance';

// ==========================================
// 4. MANAGER COMPONENTS (Mass Updates)
// ==========================================
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerProjects from './pages/manager/ManagerProjects';
import ManagerWorkforce from './pages/manager/ManagerWorkforce';
import ManagerPayroll from './pages/manager/ManagerPayroll';
import ManagerLeaves from './pages/manager/ManagerLeaves';       // <--- NEW: Added Leave Approval
import ManagerAnalytics from './pages/manager/ManagerAnalytics'; // <--- NEW: Added Deep Analytics

// ==========================================
// 5. TL COMPONENTS
// ==========================================
import TLDashboard from './pages/TLDashboard';

// ==========================================
// 6. EMPLOYEE COMPONENTS (Selva's format)
// ==========================================
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import EmployeeAttendance from './pages/Employee/EmployeeAttendance';
import EmployeeLeaves from './pages/Employee/EmployeeLeaves';
import EmployeePayroll from './pages/Employee/EmployeePayroll';
import EmployeeTasks from './pages/Employee/EmployeeTasks';

// ==========================================
// 🛡️ AUTHENTICATION & ROUTING LOGIC
// ==========================================

// Selva's Logic: Redirect logged-in users to their respective dashboards
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

// Selva's Logic: Prevent logged-in users from accessing Login/Register
const PublicRoute = ({ children }) => {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  return isAuth ? <RootRedirect /> : children;
};

// Navin's Logic: Enterprise Protected Route (Role Checks)
const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const currentRole = localStorage.getItem('role');

    if (!isAuthenticated || !currentRole) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(currentRole)) {
        console.warn(`SECURITY ALERT: User with role ${currentRole} attempted to access restricted route: ${location.pathname}`);
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

// Navin's Logic: Unauthorized Fallback Component
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
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 4000 }} />
      
      <Routes>
        {/* 1. ENTRY & AUTH FLOW (Merged Logic) */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* 2. ADMIN ROUTES */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminEmployees /></ProtectedRoute>} /> 
        <Route path="/admin/leaves" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLeaves /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAttendance /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProjects /></ProtectedRoute>} />
        <Route path="/admin/payroll" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPayroll /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSettings /></ProtectedRoute>} />
        {/* <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminNotifications /></ProtectedRoute>} /> */}

        {/* 3. HR ROUTES */}
        <Route path="/hr/dashboard" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRDashboard /></ProtectedRoute>} />
        <Route path="/hr/employees" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HREmployees /></ProtectedRoute>} />
        <Route path="/hr/leaves" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRLeaves /></ProtectedRoute>} />
        <Route path="/hr/attendance" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRAttendance /></ProtectedRoute>} />
        <Route path="/hr/payroll" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRPayroll /></ProtectedRoute>} />
        <Route path="/hr/recruitment" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRRecruitment /></ProtectedRoute>} />
        <Route path="/hr/performance" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRPerformance /></ProtectedRoute>} />

        {/* 4. MANAGER ROUTES (Mass Updates Included) */}
        <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/manager/projects" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerProjects /></ProtectedRoute>} /> 
        <Route path="/manager/training" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerWorkforce /></ProtectedRoute>} />
        <Route path="/manager/payroll" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerPayroll /></ProtectedRoute>} />
        <Route path="/manager/leaves" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerLeaves /></ProtectedRoute>} /> {/* <--- NEW */}
        <Route path="/manager/analytics" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerAnalytics /></ProtectedRoute>} /> {/* <--- NEW */}

        {/* 5. TL ROUTES */}
        <Route path="/tl/dashboard" element={<ProtectedRoute allowedRoles={['TL', 'TEAM_LEAD', 'MANAGER', 'ADMIN']}><TLDashboard /></ProtectedRoute>} />
        <Route path="/tl/tasks" element={<ProtectedRoute allowedRoles={['TL', 'TEAM_LEAD', 'MANAGER', 'ADMIN']}><TLDashboard /></ProtectedRoute>} />
        <Route path="/tl/team" element={<ProtectedRoute allowedRoles={['TL', 'TEAM_LEAD', 'MANAGER', 'ADMIN']}><TLDashboard /></ProtectedRoute>} />

        {/* 6. EMPLOYEE ROUTES */}
        <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeAttendance /></ProtectedRoute>} />
        <Route path="/employee/leaves" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeLeaves /></ProtectedRoute>} />
        <Route path="/employee/payroll" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeePayroll /></ProtectedRoute>} />
        <Route path="/employee/tasks" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeTasks /></ProtectedRoute>} />

        {/* 7. 404 / WILDCARD */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;