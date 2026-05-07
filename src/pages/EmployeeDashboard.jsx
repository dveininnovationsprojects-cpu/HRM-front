import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout'; 
import { ClipboardList, Clock, Bell, Send, CheckCircle, CheckSquare } from 'lucide-react';
import api from '../api/apiConfig';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
    // State Management
    const [tasks, setTasks] = useState([]);
    const [metrics, setMetrics] = useState({ taskCount: 0, attendanceStatus: 'Loading...', unreadNotifications: 0 });
    const [logData, setLogData] = useState({ taskId: '', hours: '', remarks: '' });
    const [loading, setLoading] = useState(true);

    // Elite UI Color Palette
    const colors = {
        primaryBlue: '#2563EB',
        lightBlue: '#EAF2FF',
        background: '#F5F9FF',
        cardWhite: '#FFFFFF',
        mainText: '#0F172A',
        secondaryText: '#64748B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: '#DCE6F2'
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [taskRes, attendanceRes, alertRes] = await Promise.all([
                api.get('/api/employee/tasks').catch(() => ({ data: [] })),
                api.get('/api/attendance/my').catch(() => ({ data: [] })),
                api.get('/api/notifications/unread').catch(() => ({ data: [] }))
            ]);

            // ULTIMATE SAFE CHECK: Backend data array-va illana, empty array-va mathidum
            let fetchedTasks = [];
            if (taskRes && taskRes.data) {
                fetchedTasks = Array.isArray(taskRes.data) ? taskRes.data : [taskRes.data];
            }
            setTasks(fetchedTasks);
            
            const todayAttendance = Array.isArray(attendanceRes.data) && attendanceRes.data.length > 0 
                ? attendanceRes.data[0].status 
                : 'Not Checked In';

            setMetrics({
                taskCount: fetchedTasks.length,
                attendanceStatus: todayAttendance,
                unreadNotifications: Array.isArray(alertRes.data) ? alertRes.data.length : 0
            });

        } catch (err) {
            console.error("Failed to load employee data", err);
            toast.error("Failed to load dashboard data. Check connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleWorkLog = async (e) => {
        e.preventDefault();
        if (!logData.taskId || !logData.hours || !logData.remarks) {
            toast.error("Please fill all fields to log work.");
            return;
        }

        try {
            const res = await api.put(`/api/employee/tasks/${logData.taskId}/log`, null, {
                params: {
                    hours: parseFloat(logData.hours),
                    remarks: logData.remarks
                }
            });
            
            if (res.status === 200) {
                toast.success("Work log updated! Status: IN_PROGRESS.");
                setLogData({ taskId: '', hours: '', remarks: '' }); 
                fetchDashboardData(); 
            }
        } catch (err) {
            console.error(err);
            toast.error("Error logging work. Please try again.");
        }
    };

    const handleTaskComplete = async (taskId) => {
        try {
            await api.post('/api/employee/tasks/complete', { id: taskId });
            toast.success("Task marked as completed!");
            fetchDashboardData(); 
        } catch (err) {
            console.error(err);
            toast.error("Failed to complete task.");
        }
    };

    const cardStyle = {
        background: colors.cardWhite,
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${colors.border}`,
        fontFamily: "'Inter', sans-serif"
    };

    // Make absolutely sure 'tasks' is an array before rendering
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    return (
        <DashboardLayout role="EMPLOYEE" title="My Workspace">
            <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
                
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600', color: colors.mainText, margin: '0 0 8px 0' }}>
                        Welcome to your Workspace 
                    </h1>
                    <p style={{ color: colors.secondaryText, fontSize: '15px', margin: 0 }}>
                        Track your daily tasks, log your work hours, and monitor performance.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '50%', color: colors.primaryBlue }}>
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Active Tasks</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>
                                {loading ? '...' : metrics.taskCount}
                            </h3>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', margin: '4px 0 0 0' }}>Assigned to you</p>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '50%', color: colors.success }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Attendance</p>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.mainText, margin: 0 }}>
                                {loading ? '...' : metrics.attendanceStatus}
                            </h3>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', margin: '4px 0 0 0' }}>Today's Status</p>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '50%', color: colors.warning }}>
                            <Bell size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Alerts</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>
                                {loading ? '...' : metrics.unreadNotifications}
                            </h3>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', margin: '4px 0 0 0' }}>Unread notifications</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.mainText, margin: 0 }}>My Active Tasks</h3>
                            <span style={{ fontSize: '12px', background: colors.lightBlue, color: colors.primaryBlue, padding: '4px 12px', borderRadius: '20px', fontWeight: '500' }}>Jira View</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {safeTasks.length > 0 ? safeTasks.map(task => (
                                <div key={task.id || Math.random()} style={{ border: `1px solid ${colors.border}`, padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600', color: colors.mainText, fontSize: '15px' }}>{task.moduleName || "Unnamed Task"}</p>
                                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                            <span style={{ fontSize: '12px', color: colors.secondaryText, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <ClipboardList size={14} /> ID: {task.projectId || "N/A"}
                                            </span>
                                            <span style={{ fontSize: '12px', color: colors.secondaryText, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={14} /> Deadline: {task.deadline || "TBD"}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <span style={{ padding: '6px 12px', background: task.status === 'IN_PROGRESS' ? '#fffbeb' : colors.lightBlue, color: task.status === 'IN_PROGRESS' ? colors.warning : colors.primaryBlue, borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                                            {task.status || "ASSIGNED"}
                                        </span>
                                        <button 
                                            onClick={() => handleTaskComplete(task.id)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: colors.success, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                                        >
                                            <CheckSquare size={14} /> Complete
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: '32px', textAlign: 'center', color: colors.secondaryText, border: `1px dashed ${colors.border}`, borderRadius: '12px' }}>
                                    <ClipboardList size={40} style={{ opacity: 0.5, marginBottom: '10px' }} />
                                    <p style={{ margin: 0, fontSize: '14px' }}>No tasks assigned currently. Great job!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.mainText, margin: '0 0 24px 0' }}>Log Daily Work</h3>
                        
                        <form onSubmit={handleWorkLog}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500', display: 'block', marginBottom: '8px' }}>Select Task</label>
                                <select 
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontFamily: "'Inter', sans-serif", fontSize: '14px', outline: 'none', background: '#fff' }}
                                    value={logData.taskId}
                                    onChange={(e) => setLogData({ ...logData, taskId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>-- Choose Active Task --</option>
                                    {safeTasks.map(t => <option key={t.id || Math.random()} value={t.id}>{t.moduleName || `Task ${t.id}`}</option>)}
                                </select>
                            </div>
                            
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500', display: 'block', marginBottom: '8px' }}>Hours Spent</label>
                                <input 
                                    type="number" 
                                    step="0.5" 
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontFamily: "'Inter', sans-serif", fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                                    placeholder="Ex: 4.5"
                                    value={logData.hours}
                                    onChange={(e) => setLogData({ ...logData, hours: e.target.value })}
                                    required
                                />
                            </div>
                            
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500', display: 'block', marginBottom: '8px' }}>Remarks</label>
                                <textarea 
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, height: '100px', resize: 'none', fontFamily: "'Inter', sans-serif", fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                                    placeholder="Briefly describe what you did today..."
                                    value={logData.remarks}
                                    onChange={(e) => setLogData({ ...logData, remarks: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            
                            <button 
                                type="submit" 
                                style={{ width: '100%', padding: '14px', background: colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '500', fontSize: '14px', transition: '0.2s' }}
                            >
                                <Send size={18} /> Submit Work Log
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EmployeeDashboard;