import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Unga Sidebar component
import { 
    Bell, CheckCircle2, CheckSquare, 
    LogOut, Menu, Inbox, Mail, UserCheck
} from 'lucide-react';
import api from '../api/apiConfig';
import toast from 'react-hot-toast';

// -----------------------------------------------------------------------------
// MAIN DASHBOARD LAYOUT (ELITE UI + NOTIFICATIONS)
// -----------------------------------------------------------------------------
const DashboardLayout = ({ children, role, title }) => {
    const navigate = useNavigate();
    
    // --- STATE MANAGEMENT ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userProfile, setUserProfile] = useState({ name: 'Loading...', role: role || 'USER', id: '' });
    
    // Notification States
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef(null);

    // --- ELITE COLOR PALETTE ---
    const colors = {
        primary: '#2563EB', 
        darkBg: '#0F172A', 
        lightBg: '#F8FAFC',
        white: '#FFFFFF', 
        textMain: '#1E293B', 
        textMuted: '#64748B',
        danger: '#EF4444', 
        success: '#10B981', 
        border: '#E2E8F0',
        hoverBg: '#F1F5F9'
    };

    // -------------------------------------------------------------------------
    // API CALLS & EFFECTS
    // -------------------------------------------------------------------------
    useEffect(() => {
        fetchUserDetails();
        fetchNotifications();

        // Auto-refresh notifications every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        // Click outside to close notification dropdown
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // 1. Get Logged In User Profile
    const fetchUserDetails = () => {
        api.get('/api/employees/me')
           .then(res => {
               if(res.data) {
                   setUserProfile({ 
                       name: res.data.fullName || res.data.username || 'User', 
                       role: res.data.role?.name || role || 'EMPLOYEE',
                       id: res.data.id || ''
                   });
               }
           })
           .catch(() => {
               // Fallback to local storage if API fails
               const storedUser = localStorage.getItem('user');
               if (storedUser) {
                   try {
                       const parsedUser = JSON.parse(storedUser);
                       setUserProfile({
                           name: parsedUser.fullName || parsedUser.username || 'Active User',
                           role: parsedUser.role || role || 'EMPLOYEE',
                           id: parsedUser.id || ''
                       });
                   } catch (e) { console.error("Parse error"); }
               }
           });
    };

    // 2. Fetch UNREAD Notifications from Backend
    const fetchNotifications = async () => {
        try {
            const res = await api.get('/api/notifications/unread');
            const data = Array.isArray(res.data) ? res.data : [];
            // Show latest first
            data.sort((a, b) => b.id - a.id);
            setNotifications(data);
            setUnreadCount(data.length);
        } catch (error) {
            console.error("Notification fetch failed", error);
        }
    };

    // 3. Mark Single Notification as Read
    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation(); 
        try {
            await api.put(`/api/notifications/${id}/read`);
            // Remove from UI instantly
            const updatedNotifs = notifications.filter(n => n.id !== id);
            setNotifications(updatedNotifs);
            setUnreadCount(updatedNotifs.length);
        } catch (error) {
            toast.error("Could not mark as read.");
        }
    };

    // 4. Mark ALL as Read
    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        if (notifications.length === 0) return;
        
        try {
            await api.put('/api/notifications/read-all');
            setNotifications([]);
            setUnreadCount(0);
            setIsNotifOpen(false);
            toast.success("All notifications cleared!");
        } catch (error) {
            toast.error("Failed to clear notifications.");
        }
    };

    // 5. Logout
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // -------------------------------------------------------------------------
    // RENDER UI
    // -------------------------------------------------------------------------
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: colors.lightBg, fontFamily: "'Inter', sans-serif" }}>
            
            {/* ========================================== */}
            {/* 1. SIDEBAR (Collapsible)                   */}
            {/* ========================================== */}
            <div style={{ 
                width: isSidebarOpen ? '260px' : '0px', 
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                backgroundColor: colors.white, 
                borderRight: `1px solid ${colors.border}`,
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Dynamically loads your Sidebar component */}
                <div style={{ flex: 1, minWidth: '260px' }}>
                    <Sidebar role={userProfile.role} />
                </div>
            </div>

            {/* ========================================== */}
            {/* 2. MAIN CONTENT AREA                       */}
            {/* ========================================== */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                
                {/* ---------- TOP HEADER ---------- */}
                <header style={{ 
                    height: '76px', minHeight: '76px', background: colors.white, borderBottom: `1px solid ${colors.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)', zIndex: 10
                }}>
                    
                    {/* Left Side: Toggle Sidebar & Page Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                       
                        <h1 style={{ fontSize: '22px', fontWeight: '800', color: colors.textMain, margin: 0, letterSpacing: '-0.5px' }}>
                            {title || "Dashboard"}
                        </h1>
                    </div>

                    {/* Right Side: Notifications & User Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        
                        {/* NOTIFICATION BELL WITH DROPDOWN */}
                        <div ref={notifRef} style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                style={{ 
                                    background: isNotifOpen ? colors.hoverBg : 'transparent', 
                                    border: 'none', padding: '12px', borderRadius: '50%', cursor: 'pointer', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: colors.textMuted, transition: '0.2s hover'
                                }}
                            >
                                <Bell size={24} color={isNotifOpen ? colors.primary : colors.textMuted} />
                            
{unreadCount > 0 && (
    <span style={{ 
        position: 'absolute', 
        top: '-2px',        // Munnadi '2px' nu irunthatha '-2px' ku mathunga
        right: '-2px',      // Munnadi '4px' nu irunthatha '-2px' ku mathunga
        background: colors.danger, 
        color: '#fff', 
        fontSize: '10px', 
        fontWeight: '800', 
        width: '18px', 
        height: '18px', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '2px solid #fff', 
        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
    }}>
        {unreadCount > 99 ? '99+' : unreadCount}
    </span>
)}
                            </button>

                            {/* DROPDOWN MENU */}
                            {isNotifOpen && (
                                <div style={{ 
                                    position: 'absolute', top: '60px', right: '0px', 
                                    width: '380px', background: colors.white, 
                                    borderRadius: '16px', border: `1px solid ${colors.border}`, 
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)', zIndex: 9999, overflow: 'hidden',
                                    transformOrigin: 'top right', animation: 'scaleIn 0.2s ease-out'
                                }}>
                                    {/* Dropdown Header */}
                                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: colors.lightBg }}>
                                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.textMain, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <Inbox size={18} color={colors.primary}/> Notifications
                                        </h3>
                                        {unreadCount > 0 && (
                                            <button onClick={handleMarkAllRead} style={{ background: 'transparent', border: 'none', color: colors.primary, fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    {/* Dropdown Body */}
                                    <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '50px 20px', textAlign: 'center' }}>
                                                <div style={{ background: '#F0FDF4', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                                    <CheckCircle2 size={30} color={colors.success} />
                                                </div>
                                                <p style={{ margin: '0 0 5px', fontWeight: '700', color: colors.textMain }}>You're all caught up!</p>
                                                <p style={{ margin: 0, fontSize: '13px', color: colors.textMuted }}>No new notifications.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                {notifications.map((notif) => (
                                                    <div key={notif.id} style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', gap: '15px', transition: '0.2s background', cursor: 'default' }}>
                                                        
                                                        {/* Icon based on Type */}
                                                        <div style={{ flexShrink: 0, marginTop: '2px' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: notif.type === 'ANNOUNCEMENT' ? '#FEF2F2' : '#EFF6FF', color: notif.type === 'ANNOUNCEMENT' ? colors.danger : colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {notif.type === 'ANNOUNCEMENT' ? <Mail size={20}/> : <Bell size={20}/>}
                                                            </div>
                                                        </div>

                                                        {/* Content */}
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: colors.textMain }}>{notif.title || "New Alert"}</h4>
                                                            </div>
                                                            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: colors.textMuted, lineHeight: '1.5' }}>
                                                                {notif.message}
                                                            </p>
                                                            
                                                            {/* Action Button */}
                                                            <button 
                                                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                                style={{ background: colors.lightBg, border: `1px solid ${colors.border}`, padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: colors.textMain, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' }}
                                                            >
                                                                <CheckSquare size={14} color={colors.success}/> Mark as read
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                   
                                </div>
                            )}
                        </div>

                        {/* USER PROFILE INFO & LOGOUT */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '24px', borderLeft: `2px solid ${colors.border}` }}>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: colors.textMain, textTransform: 'capitalize' }}>
                                    {userProfile.name}
                                </p>
                                <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: colors.primary, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    {userProfile.role.replace('_', ' ')}
                                </p>
                            </div>
                            <div style={{ 
                                width: '45px', height: '45px', borderRadius: '12px', 
                                background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', 
                                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px', fontWeight: '800', boxShadow: '0 4px 10px rgba(37,99,235,0.3)'
                            }}>
                                {userProfile.name.charAt(0).toUpperCase()}
                            </div>
                            
                            {/* Quick Logout Button */}
                            <button onClick={handleLogout} title="Logout" style={{ background: 'transparent', border: 'none', marginLeft: '8px', cursor: 'pointer', color: colors.textMuted, transition: '0.2s' }}>
                                <LogOut size={20} style={{ '&:hover': { color: colors.danger } }} />
                            </button>
                        </div>

                    </div>
                </header>

                {/* ---------- MAIN PAGE CONTENT ---------- */}
                <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', backgroundColor: colors.lightBg, padding: '30px', boxSizing: 'border-box' }}>
                    {children}
                </main>
            </div>
            
            {/* CSS ANIMATIONS */}
            <style>
                {`
                    @keyframes scaleIn {
                        from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    /* Scrollbar styling for a cleaner look */
                    ::-webkit-scrollbar { width: 6px; height: 6px; }
                    ::-webkit-scrollbar-track { background: transparent; }
                    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
                    ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
                `}
            </style>
        </div>
    );
};

export default DashboardLayout;