import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout'; 
import { 
    ClipboardList, Clock, Bell, Send, CheckCircle, 
    CheckSquare, User, Briefcase, MapPin, Phone, 
    Mail, Fingerprint, Activity, BarChart2, PieChart as PieChartIcon
} from 'lucide-react';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const EmployeeDashboard = () => {
    // =========================================================================
    // 1. STATE MANAGEMENT
    // =========================================================================
    const [profile, setProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [logData, setLogData] = useState({ taskId: '', hours: '', remarks: '' });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [metrics, setMetrics] = useState({ 
        activeTasks: 0, 
        completedTasks: 0,
        attendanceStatus: 'Loading...', 
        unreadNotifications: 0,
        totalLoggedHours: 0,
        efficiency: 0
    });

    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);

    // =========================================================================
    // 2. ELITE COLOR PALETTE
    // =========================================================================
    const colors = {
        primaryBlue: '#2563EB',
        lightBlue: '#EFF6FF',
        background: '#F8FAFC',
        cardWhite: '#FFFFFF',
        mainText: '#0F172A',
        secondaryText: '#64748B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: '#E2E8F0',
        chartColors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    };

    // =========================================================================
    // 3. API DATA FETCHING
    // =========================================================================
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [profileRes, taskRes, attendanceRes, alertRes] = await Promise.all([
                api.get('/api/employees/me').catch(() => ({ data: null })),
                api.get('/api/employee/tasks').catch(() => ({ data: [] })),
                api.get('/api/attendance/my').catch(() => ({ data: [] })),
                api.get('/api/notifications/unread').catch(() => ({ data: [] }))
            ]);

            // Set Profile
            if (profileRes.data) setProfile(profileRes.data);

            // Safe Task Extraction
            let fetchedTasks = [];
            if (taskRes && taskRes.data) {
                fetchedTasks = Array.isArray(taskRes.data) ? taskRes.data : [taskRes.data];
            }
            
            // Sort tasks: Active first, Completed last
            fetchedTasks.sort((a, b) => {
                if (a.status === 'COMPLETED') return 1;
                if (b.status === 'COMPLETED') return -1;
                return 0;
            });
            setTasks(fetchedTasks);

            // Calculate Metrics
            let active = 0, completed = 0, hours = 0, estHours = 0;
            let todoCount = 0, inProgCount = 0;

            fetchedTasks.forEach(t => {
                const stat = t.status ? t.status.toUpperCase() : 'ASSIGNED';
                if (stat === 'COMPLETED') completed++;
                else active++;

                if (stat === 'ASSIGNED' || stat === 'PENDING') todoCount++;
                if (stat === 'IN_PROGRESS') inProgCount++;

                const act = t.actualHoursTaken || 0;
                const est = t.module?.estimatedHours || 0;
                hours += act;
                estHours += est;
            });

            // Set Pie Chart Data
            setPieData([
                { name: 'To Do', value: todoCount },
                { name: 'In Progress', value: inProgCount },
                { name: 'Completed', value: completed }
            ]);

            // Set Bar Chart Data (Top 5 Active Tasks)
            const activeChartTasks = fetchedTasks.filter(t => t.status !== 'COMPLETED').slice(0, 5);
            const barData = activeChartTasks.map(t => ({
                name: (t.module?.moduleName || `Task ${t.id}`).substring(0, 15) + '...',
                Estimated: t.module?.estimatedHours || 0,
                Actual: t.actualHoursTaken || 0
            }));
            setChartData(barData);
            
            const todayAttendance = Array.isArray(attendanceRes.data) && attendanceRes.data.length > 0 
                ? attendanceRes.data[0].status 
                : 'Not Checked In';

            let eff = 100;
            if (hours > 0 && estHours > 0) {
                eff = Math.min(100, Math.round((estHours / hours) * 100));
            }

            setMetrics({
                activeTasks: active,
                completedTasks: completed,
                attendanceStatus: todayAttendance,
                unreadNotifications: Array.isArray(alertRes.data) ? alertRes.data.length : 0,
                totalLoggedHours: hours,
                efficiency: eff
            });

        } catch (err) {
            console.error("Dashboard Load Error:", err);
            toast.error("Failed to sync workplace data.");
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 4. ACTION HANDLERS
    // =========================================================================
    const handleWorkLog = async (e) => {
        e.preventDefault();
        if (!logData.taskId || !logData.hours || !logData.remarks) {
            toast.error("Please fill all details.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.put(`/api/employee/tasks/${logData.taskId}/log`, null, {
                params: {
                    hours: parseFloat(logData.hours),
                    remarks: logData.remarks
                }
            });
            
            if (res.status === 200) {
                toast.success("Progress logged successfully!");
                setLogData({ taskId: '', hours: '', remarks: '' }); 
                fetchDashboardData(); 
            }
        } catch (err) {
            toast.error("Failed to log work.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTaskComplete = async (taskId) => {
        if(!window.confirm("Are you sure you want to mark this task as Complete?")) return;
        
        try {
            await api.post('/api/employee/tasks/complete', { id: taskId });
            toast.success("Task completed! Excellent job.");
            fetchDashboardData(); 
        } catch (err) {
            toast.error("Failed to update status.");
        }
    };

    // =========================================================================
    // 5. HELPER COMPONENTS & STYLES
    // =========================================================================
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const activeTaskList = safeTasks.filter(t => t.status !== 'COMPLETED');

    const cardStyle = {
        background: colors.cardWhite,
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${colors.border}`,
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden'
    };

    // =========================================================================
    // 6. MAIN RENDER
    // =========================================================================
    return (
        <DashboardLayout role="EMPLOYEE" title="Employee Dashboard">
            <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '30px', fontFamily: "'Inter', sans-serif" }}>
                
                {/* --------------------------------------------------------- */}
                {/* SECTION 1: HEADER & PROFILE WIDGET                        */}
                {/* --------------------------------------------------------- */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '30px' }}>
                    
                    {/* Welcome Banner */}
                    <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
                            <Activity size={200} />
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
                            {getGreeting()}, {profile?.fullName?.split(' ')[0] || 'User'}! 👋
                        </h1>
                        <p style={{ margin: 0, fontSize: '15px', color: '#93C5FD', lineHeight: '1.6', maxWidth: '80%' }}>
                            Here is what's happening in your workspace today. Track your modules, log hours, and maintain your elite efficiency score.
                        </p>
                    </div>

                    {/* Employee Profile ID Card */}
                    <div style={{ ...cardStyle, padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: colors.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 2px #BFDBFE' }}>
                            {profile ? <span style={{ fontSize: '32px', fontWeight: '800', color: colors.primaryBlue }}>{profile.fullName.charAt(0)}</span> : <User size={32} color={colors.primaryBlue}/>}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: colors.mainText, textTransform: 'capitalize' }}>
                                {profile?.fullName || 'Loading Profile...'}
                            </h3>
                            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: colors.primaryBlue, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {profile?.position || 'Employee'} • {profile?.department || 'IT'}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.secondaryText }}>
                                    <Fingerprint size={14}/> ID: {profile?.biometricId || 'N/A'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.secondaryText }}>
                                    <Phone size={14}/> {profile?.phone || 'N/A'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.secondaryText }}>
                                    <Mail size={14}/> {profile?.user?.email || 'N/A'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.secondaryText }}>
                                    <MapPin size={14}/> {profile?.address || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --------------------------------------------------------- */}
                {/* SECTION 2: QUICK METRICS                                  */}
                {/* --------------------------------------------------------- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '30px' }}>
                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '14px', color: colors.primaryBlue }}><ClipboardList size={26} /></div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase' }}>Active Tasks</p>
                            <h3 style={{ fontSize: '26px', fontWeight: '800', color: colors.mainText, margin: 0 }}>{loading ? '-' : metrics.activeTasks}</h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ECFDF5', padding: '16px', borderRadius: '14px', color: colors.success }}><CheckCircle size={26} /></div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase' }}>Completed</p>
                            <h3 style={{ fontSize: '26px', fontWeight: '800', color: colors.mainText, margin: 0 }}>{loading ? '-' : metrics.completedTasks}</h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#FFFBEB', padding: '16px', borderRadius: '14px', color: colors.warning }}><Bell size={26} /></div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase' }}>Unread Alerts</p>
                            <h3 style={{ fontSize: '26px', fontWeight: '800', color: colors.mainText, margin: 0 }}>{loading ? '-' : metrics.unreadNotifications}</h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#F5F3FF', padding: '16px', borderRadius: '14px', color: '#8B5CF6' }}><Activity size={26} /></div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase' }}>Efficiency</p>
                            <h3 style={{ fontSize: '26px', fontWeight: '800', color: colors.mainText, margin: 0 }}>{loading ? '-' : `${metrics.efficiency}%`}</h3>
                        </div>
                    </div>
                </div>

                {/* --------------------------------------------------------- */}
                {/* SECTION 3: REAL-TIME CHARTS                               */}
                {/* --------------------------------------------------------- */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '30px' }}>
                    
                    {/* Bar Chart: Estimated vs Actual Hours */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.mainText, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BarChart2 size={18} color={colors.primaryBlue}/> Time Utilization (Active Tasks)
                            </h3>
                        </div>
                        {chartData.length > 0 ? (
                            <div style={{ height: '280px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: colors.secondaryText }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: colors.secondaryText }} />
                                        <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                        <Bar dataKey="Estimated" fill="#93C5FD" radius={[4, 4, 0, 0]} barSize={24} />
                                        <Bar dataKey="Actual" fill={colors.primaryBlue} radius={[4, 4, 0, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.secondaryText, fontSize: '14px', border: `1px dashed ${colors.border}`, borderRadius: '12px' }}>
                                No active task data to display chart.
                            </div>
                        )}
                    </div>

                    {/* Pie Chart: Task Status Distribution */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.mainText, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PieChartIcon size={18} color={colors.primaryBlue}/> Workload Status
                            </h3>
                        </div>
                        {tasks.length > 0 ? (
                            <div style={{ height: '260px', width: '100%', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={pieData.filter(d => d.value > 0)} 
                                            cx="50%" cy="50%" 
                                            innerRadius={65} outerRadius={85} 
                                            paddingAngle={5} dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={colors.chartColors[index % colors.chartColors.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text in Donut */}
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '24px', fontWeight: '800', color: colors.mainText }}>{tasks.length}</span>
                                    <span style={{ fontSize: '10px', color: colors.secondaryText, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.secondaryText, fontSize: '14px', border: `1px dashed ${colors.border}`, borderRadius: '12px' }}>
                                No workload data.
                            </div>
                        )}
                        {/* Custom Legend */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
                            {pieData.filter(d => d.value > 0).map((d, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: colors.secondaryText, fontWeight: '600' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.chartColors[i] }}></div>
                                    {d.name} ({d.value})
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --------------------------------------------------------- */}
                {/* SECTION 4: TASK LIST & WORK LOG FORM                      */}
                {/* --------------------------------------------------------- */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    
                    {/* Active Tasks List */}
                    <div style={{ ...cardStyle, padding: 0 }}>
                        <div style={{ padding: '24px 24px 16px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.mainText, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Briefcase size={20} color={colors.primaryBlue} /> Pending Assignments
                            </h3>
                            <span style={{ fontSize: '12px', background: colors.lightBlue, color: colors.primaryBlue, padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
                                {activeTaskList.length} Active
                            </span>
                        </div>
                        
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
                            {activeTaskList.length > 0 ? activeTaskList.map(task => {
                                const prog = task.module?.estimatedHours > 0 ? Math.min(100, (task.actualHoursTaken / task.module.estimatedHours) * 100) : 0;
                                return (
                                    <div key={task.id} className="task-card" style={{ border: `1px solid ${colors.border}`, padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', transition: '0.2s', cursor: 'default' }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: '0 0 6px 0', fontWeight: '700', color: colors.mainText, fontSize: '15px' }}>
                                                {task.module?.moduleName || "Untitled Module"}
                                            </p>
                                            <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                                                <span style={{ fontSize: '12px', color: colors.secondaryText, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                                    <ClipboardList size={14} color={colors.primaryBlue}/> Proj: {task.module?.project?.projectName || "N/A"}
                                                </span>
                                                <span style={{ fontSize: '12px', color: colors.danger, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                                    <Clock size={14} /> Due: {task.deadline || "TBD"}
                                                </span>
                                            </div>
                                            {/* Mini Progress Bar */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ flex: 1, height: '6px', background: colors.lightBlue, borderRadius: '3px', overflow: 'hidden', maxWidth: '200px' }}>
                                                    <div style={{ width: `${prog}%`, height: '100%', background: prog === 100 ? colors.success : colors.primaryBlue }}></div>
                                                </div>
                                                <span style={{ fontSize: '11px', color: colors.secondaryText, fontWeight: '600' }}>{task.actualHoursTaken}h / {task.module?.estimatedHours}h</span>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', marginLeft: '20px' }}>
                                            <span style={{ padding: '4px 10px', background: task.status === 'IN_PROGRESS' ? '#FFFBEB' : colors.lightBlue, color: task.status === 'IN_PROGRESS' ? colors.warning : colors.primaryBlue, borderRadius: '6px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px' }}>
                                                {task.status || "ASSIGNED"}
                                            </span>
                                            <button 
                                                onClick={() => handleTaskComplete(task.id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#F0FDF4', color: colors.success, border: `1px solid #BBF7D0`, borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', transition: '0.2s' }}
                                                onMouseOver={(e) => { e.currentTarget.style.background = colors.success; e.currentTarget.style.color = '#fff'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.color = colors.success; }}
                                            >
                                                <CheckSquare size={16} /> Complete
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{ padding: '40px', textAlign: 'center' }}>
                                    <div style={{ background: colors.lightBlue, width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                        <CheckCircle size={30} color={colors.primaryBlue} />
                                    </div>
                                    <h4 style={{ margin: '0 0 5px', color: colors.mainText }}>All Caught Up!</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: colors.secondaryText }}>You have no pending assignments right now.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Daily Work Log Form */}
                    <div style={{ ...cardStyle, position: 'sticky', top: '24px', height: 'fit-content' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.mainText, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={18} color={colors.primaryBlue} /> Log Daily Work
                        </h3>
                        
                        <form onSubmit={handleWorkLog}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', color: colors.mainText, fontWeight: '600', display: 'block', marginBottom: '8px' }}>Select Active Task</label>
                                <select 
                                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', fontSize: '14px', color: colors.mainText, fontWeight: '500', cursor: 'pointer', appearance: 'none' }}
                                    value={logData.taskId} onChange={(e) => setLogData({ ...logData, taskId: e.target.value })} required
                                    className="focus-ring"
                                >
                                    <option value="" disabled>-- Choose a task --</option>
                                    {activeTaskList.map(t => (
                                        <option key={t.id} value={t.id}>{t.module?.moduleName || `Task ${t.id}`}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', color: colors.mainText, fontWeight: '600', display: 'block', marginBottom: '8px' }}>Hours Spent Today</label>
                                <input 
                                    type="number" step="0.5" min="0.5" max="12"
                                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                                    placeholder="e.g., 4.5" value={logData.hours} onChange={(e) => setLogData({ ...logData, hours: e.target.value })} required
                                    className="focus-ring"
                                />
                            </div>
                            
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '13px', color: colors.mainText, fontWeight: '600', display: 'block', marginBottom: '8px' }}>Progress Remarks</label>
                                <textarea 
                                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, height: '120px', resize: 'none', outline: 'none', fontSize: '14px', boxSizing: 'border-box', lineHeight: '1.5' }}
                                    placeholder="What specific components did you work on?" value={logData.remarks} onChange={(e) => setLogData({ ...logData, remarks: e.target.value })} required
                                    className="focus-ring"
                                ></textarea>
                            </div>
                            
                            <button 
                                type="submit" disabled={isSubmitting}
                                style={{ width: '100%', padding: '16px', background: colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '10px', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', fontSize: '15px', transition: '0.2s', opacity: isSubmitting ? 0.7 : 1, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
                            >
                                {isSubmitting ? 'Syncing...' : 'Submit Progress Log'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* CSS FOR HOVER EFFECTS AND CUSTOM SCROLLBARS */}
            <style>
                {`
                    .task-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.06); }
                    .focus-ring:focus { border-color: ${colors.primaryBlue} !important; background-color: #fff !important; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                    
                    /* Custom Scrollbar */
                    ::-webkit-scrollbar { width: 6px; }
                    ::-webkit-scrollbar-track { background: transparent; }
                    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
                    ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
                `}
            </style>
        </DashboardLayout>
    );
};

export default EmployeeDashboard;