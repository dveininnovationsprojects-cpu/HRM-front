import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
    Briefcase, Clock, Send, CheckCircle, CheckSquare, 
    AlertCircle, TrendingUp, Activity, FileText, ListTodo, 
    PlayCircle, FolderDot, UserCheck, ChevronLeft, ChevronRight, BarChart2
} from 'lucide-react';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';

const EmployeeTasks = () => {
    // =========================================================================
    // 1. STATE MANAGEMENT
    // =========================================================================
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myProfile, setMyProfile] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    
    // Work Log State
    const [logData, setLogData] = useState({ hours: '', remarks: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, taskId: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Performance Metrics State
    const [metrics, setMetrics] = useState({
        total: 0, completed: 0, inProgress: 0, pending: 0, totalHoursLogged: 0, efficiency: 100
    });

    // Pagination States (Max 4 items per view to avoid long scroll)
    const ITEMS_PER_PAGE = 4;
    const [pageTodo, setPageTodo] = useState(1);
    const [pageProg, setPageProg] = useState(1);
    const [pageDone, setPageDone] = useState(1);
    const [pageTable, setPageTable] = useState(1);

    // Elite Color Palette
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        cardWhite: '#FFFFFF', mainText: '#0F172A', secondaryText: '#64748B',
        success: '#10B981', warning: '#F59E0B', danger: '#EF4444',
        border: '#E2E8F0', kanbanBg: '#F1F5F9', paginationBg: '#F8FAFC'
    };

    // =========================================================================
    // 2. DATA FETCHING & CLEANING (BACKEND SYNC)
    // =========================================================================
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            
            // Fetch Profile
            const profileRes = await api.get('/api/employees/me');
            setMyProfile(profileRes.data);

            // Fetch Tasks
            const taskRes = await api.get('/api/employee/tasks');
            let rawData = taskRes.data;
            let finalTasks = [];

            // Robust JSON Extraction (Bypasses Spring Boot Recursion/String issues)
            if (Array.isArray(rawData)) {
                finalTasks = rawData.map(item => {
                    if (typeof item === 'string') {
                        try { return JSON.parse(item.split('{"error":')[0]); } 
                        catch (e) { return null; }
                    }
                    return item;
                }).filter(t => t !== null && t.id);
            } else if (typeof rawData === 'object' && rawData !== null) {
                finalTasks = [rawData]; // Single task fallback
            }

            // Sort logic: newly assigned first
            finalTasks.sort((a, b) => b.id - a.id);
            setTasks(finalTasks);
            calculateMetrics(finalTasks);

        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const calculateMetrics = (taskList) => {
        let completed = 0, inProg = 0, pending = 0, hours = 0, totalEst = 0;

        taskList.forEach(task => {
            const status = task.status ? task.status.toUpperCase() : 'ASSIGNED';
            if (status === 'COMPLETED') completed++;
            else if (status === 'IN_PROGRESS') inProg++;
            else pending++;

            const actual = task.actualHoursTaken || 0;
            const est = task.module?.estimatedHours || 0; 
            hours += actual;
            totalEst += est;
        });

        let eff = 100;
        if (hours > 0 && totalEst > 0) {
            eff = Math.min(100, Math.round((totalEst / hours) * 100));
        }

        setMetrics({ total: taskList.length, completed, inProgress: inProg, pending, totalHoursLogged: hours, efficiency: eff });
    };

    // =========================================================================
    // 3. ACTION HANDLERS
    // =========================================================================
    const handleWorkLog = async (e) => {
        e.preventDefault();
        if (!selectedTask || !logData.hours || !logData.remarks) {
            toast.error("Please fill all log details.");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await api.put(`/api/employee/tasks/${selectedTask.id}/log`, null, {
                params: { 
                    hours: parseFloat(logData.hours), 
                    remarks: logData.remarks 
                }
            });
            
            if (res.status === 200) {
                toast.success(`Work logged successfully!`);
                setLogData({ hours: '', remarks: '' }); 
                setSelectedTask(null); 
                fetchInitialData(); 
            }
        } catch (err) {
            toast.error("Error logging work.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTaskComplete = (taskId) => {
        setConfirmModal({ isOpen: true, taskId: taskId });
    };


    const executeTaskComplete = async () => {
        const taskId = confirmModal.taskId;
        setConfirmModal({ isOpen: false, taskId: null });

        try {
            const task = tasks.find(t => t.id === taskId);
            await api.post('/api/employee/tasks/complete', task);
            toast.success("Task completed!");
            if (selectedTask?.id === taskId) setSelectedTask(null);
            fetchInitialData(); 
        } catch (err) {
            toast.error("Failed to complete task.");
        }
    };

    // =========================================================================
    // 4. PAGINATION & FILTER LOGIC
    // =========================================================================
    const tasksToDo = tasks.filter(t => !t.status || t.status.toUpperCase() === 'ASSIGNED' || t.status.toUpperCase() === 'PENDING');
    const tasksInProgress = tasks.filter(t => t.status && t.status.toUpperCase() === 'IN_PROGRESS');
    const tasksDone = tasks.filter(t => t.status && t.status.toUpperCase() === 'COMPLETED');

    const paginate = (array, page_number) => array.slice((page_number - 1) * ITEMS_PER_PAGE, page_number * ITEMS_PER_PAGE);

    const getStatusConfig = (status) => {
        const s = status ? status.toUpperCase() : 'ASSIGNED';
        if (s === 'COMPLETED') return { bg: '#ecfdf5', color: colors.success, label: 'COMPLETED', icon: <CheckCircle size={14}/> };
        if (s === 'IN_PROGRESS') return { bg: '#fffbeb', color: colors.warning, label: 'IN PROGRESS', icon: <PlayCircle size={14}/> };
        return { bg: colors.lightBlue, color: colors.primaryBlue, label: 'TO DO', icon: <ListTodo size={14}/> };
    };

    // =========================================================================
    // 5. RENDER
    // =========================================================================
return (
        <DashboardLayout role="EMPLOYEE" title="Tasks & Analytics">
            <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '24px', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
                
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '800', color: colors.mainText, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BarChart2 color={colors.primaryBlue} size={28} /> My Workspace
                        </h1>
                        <p style={{ color: colors.secondaryText, fontSize: '15px', margin: 0 }}>Manage assignments, track performance, and log daily hours.</p>
                    </div>
                    {myProfile && (
                        <div style={{ background: '#fff', padding: '10px 18px', borderRadius: '30px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                            <div style={{ background: colors.primaryBlue, borderRadius: '50%', padding: '6px', color: '#fff' }}><UserCheck size={16}/></div>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: colors.mainText }}>{myProfile.fullName} <span style={{ color: colors.secondaryText, fontWeight: '500' }}>(ID: {myProfile.id})</span></span>
                        </div>
                    )}
                </div>

                {/* Metrics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                    <MetricCard title="Total Modules" val={metrics.total} icon={<Briefcase/>} col={colors.primaryBlue} bg={colors.lightBlue} />
                    <MetricCard title="Completed" val={metrics.completed} icon={<CheckSquare/>} col={colors.success} bg="#ecfdf5" />
                    <MetricCard title="Logged Hours" val={`${metrics.totalHoursLogged}h`} icon={<Clock/>} col="#8B5CF6" bg="#f5f3ff" />
                    <MetricCard title="Efficiency Score" val={`${metrics.efficiency}%`} icon={<TrendingUp/>} col={colors.warning} bg="#fffbeb" />
                </div>

                {loading ? (
                    <div style={{ padding: '50px', textAlign: 'center', color: colors.secondaryText }}>Fetching your workspace data...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '24px', alignItems: 'start' }}>
                        
                        {/* LEFT COLUMN: Board & Table */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            
                            {/* Kanban Board with Pagination */}
                            <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.mainText, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Activity size={20} color={colors.primaryBlue} /> Task Board
                                </h2>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                    <BoardColumn 
                                        title="TO DO" list={tasksToDo} pagedList={paginate(tasksToDo, pageTodo)} 
                                        page={pageTodo} setPage={setPageTodo} total={tasksToDo.length} limit={ITEMS_PER_PAGE}
                                        colors={colors} onSel={setSelectedTask} selId={selectedTask?.id} config={getStatusConfig} 
                                    />
                                    <BoardColumn 
                                        title="IN PROGRESS" list={tasksInProgress} pagedList={paginate(tasksInProgress, pageProg)} 
                                        page={pageProg} setPage={setPageProg} total={tasksInProgress.length} limit={ITEMS_PER_PAGE}
                                        colors={colors} onSel={setSelectedTask} selId={selectedTask?.id} config={getStatusConfig} onFinish={handleTaskComplete}
                                    />
                                    <BoardColumn 
                                        title="DONE" list={tasksDone} pagedList={paginate(tasksDone, pageDone)} 
                                        page={pageDone} setPage={setPageDone} total={tasksDone.length} limit={ITEMS_PER_PAGE}
                                        colors={colors} config={getStatusConfig} isDone 
                                    />
                                </div>
                            </div>

                            {/* Performance Breakdown Table */}
                            <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.mainText, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={20} color={colors.primaryBlue} /> Detailed Performance Analytics
                                    </h2>
                                    <PaginationControl page={pageTable} setPage={setPageTable} total={tasks.length} limit={ITEMS_PER_PAGE} colors={colors} />
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: colors.background, color: colors.secondaryText, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                <th style={{ padding: '14px', borderRadius: '8px 0 0 8px' }}>Module & Project</th>
                                                <th style={{ padding: '14px' }}>Timeline</th>
                                                <th style={{ padding: '14px' }}>Hours (Act / Est)</th>
                                                <th style={{ padding: '14px', borderRadius: '0 8px 8px 0' }}>Score / Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.length > 0 ? paginate(tasks, pageTable).map(t => {
                                                const act = t.actualHoursTaken || 0;
                                                const est = t.module?.estimatedHours || 0;
                                                let prog = est > 0 ? Math.min(100, (act / est) * 100) : (act > 0 ? 100 : 0);
                                                let barCol = prog > 100 ? colors.danger : (prog === 100 ? colors.success : colors.primaryBlue);

                                                return (
                                                    <tr key={t.id} style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s hover' }}>
                                                        <td style={{ padding: '16px' }}>
                                                            <p style={{ margin: '0 0 4px 0', fontWeight: '700', fontSize: '14px', color: colors.mainText }}>{t.module?.moduleName || "Untitled"}</p>
                                                            <p style={{ margin: 0, fontSize: '12px', color: colors.secondaryText, display: 'flex', alignItems: 'center', gap: '4px' }}><FolderDot size={12}/> {t.module?.project?.projectName || "N/A"}</p>
                                                        </td>
                                                        <td style={{ padding: '16px', fontSize: '13px', color: colors.secondaryText }}>
                                                            Assigned: {t.assignedDate || '-'}<br/>Due: {t.deadline || '-'}
                                                        </td>
                                                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: colors.mainText }}>
                                                            {act}h <span style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '500' }}>/ {est}h</span>
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                                <span style={{ fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', background: getStatusConfig(t.status).bg, color: getStatusConfig(t.status).color }}>{getStatusConfig(t.status).label}</span>
                                                                <span style={{ fontSize: '12px', fontWeight: '700', color: barCol }}>{Math.round(prog)}%</span>
                                                            </div>
                                                            <div style={{ width: '120px', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                                                                <div style={{ width: `${prog}%`, height: '100%', background: barCol }}></div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            }) : <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: colors.secondaryText }}>No data available to generate analytics.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Sticky Log Form */}
                        <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', position: 'sticky', top: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.mainText, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Send size={18} color={colors.primaryBlue} /> Daily Work Log
                            </h3>
                            
                            {selectedTask ? (
                                <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '10px', marginBottom: '24px', border: `1px solid ${colors.primaryBlue}30` }}>
                                    <p style={{ margin: 0, fontSize: '11px', color: colors.secondaryText, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Selected Module</p>
                                    <p style={{ margin: '6px 0', fontSize: '15px', fontWeight: '700', color: colors.primaryBlue }}>{selectedTask.module?.moduleName || "Untitled Task"}</p>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '12px', color: colors.secondaryText, fontWeight: '500' }}>
                                        <span>Est: {selectedTask.module?.estimatedHours || 0}h</span>
                                        <span>Logged: {selectedTask.actualHoursTaken || 0}h</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ background: colors.kanbanBg, padding: '20px', borderRadius: '10px', marginBottom: '24px', textAlign: 'center', border: `1px dashed #CBD5E1` }}>
                                    <AlertCircle size={24} color={colors.secondaryText} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                                    <p style={{ margin: 0, fontSize: '13px', color: colors.secondaryText, fontWeight: '500' }}>Click any task card from "TO DO" or "IN PROGRESS" to log hours.</p>
                                </div>
                            )}

                            <form onSubmit={handleWorkLog}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '13px', color: colors.mainText, fontWeight: '600', display: 'block', marginBottom: '8px' }}>Hours Spent Today</label>
                                    <input 
                                        type="number" step="0.5" min="0.5" disabled={!selectedTask} 
                                        value={logData.hours} onChange={e => setLogData({...logData, hours: e.target.value})} 
                                        placeholder="E.g., 4.5"
                                        style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', background: selectedTask ? '#fff' : colors.background, fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }} 
                                        required 
                                    />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '13px', color: colors.mainText, fontWeight: '600', display: 'block', marginBottom: '8px' }}>Progress Remarks</label>
                                    <textarea 
                                        disabled={!selectedTask} value={logData.remarks} onChange={e => setLogData({...logData, remarks: e.target.value})} 
                                        placeholder="What was accomplished?"
                                        style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${colors.border}`, height: '120px', resize: 'none', outline: 'none', background: selectedTask ? '#fff' : colors.background, fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }} 
                                        required 
                                    />
                                </div>
                                <button type="submit" disabled={!selectedTask || isSubmitting} style={{ width: '100%', padding: '14px', background: !selectedTask ? '#CBD5E1' : colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: !selectedTask ? 'not-allowed' : 'pointer', transition: '0.2s', boxShadow: selectedTask ? '0 4px 10px rgba(37, 99, 235, 0.2)' : 'none' }}>
                                    {isSubmitting ? 'Syncing...' : 'Submit Log Entry'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ELITE UI CUSTOM MODAL POPUP */}
                {confirmModal.isOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                            <div style={{ background: '#FEF2F2', color: colors.danger, width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <AlertCircle size={30} />
                            </div>
                            <h2 style={{ margin: '0 0 10px', fontSize: '20px', color: colors.mainText, fontWeight: '700' }}>Complete this Task?</h2>
                            <p style={{ margin: '0 0 24px', fontSize: '14px', color: colors.secondaryText, lineHeight: '1.5' }}>
                                Are you sure you want to mark this module as completed? Performance metrics will be finalized and cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    onClick={() => setConfirmModal({ isOpen: false, taskId: null })} 
                                    style={{ flex: 1, padding: '12px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={executeTaskComplete} 
                                    style={{ flex: 1, padding: '12px', background: colors.success, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}
                                >
                                    Yes, Complete It
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

// =========================================================================
// INTERNAL COMPONENTS FOR CLEAN ARCHITECTURE
// =========================================================================

// 1. Top Metrics Card
const MetricCard = ({ title, val, icon, col, bg }) => (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '18px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ background: bg, padding: '14px', borderRadius: '12px', color: col }}>{icon}</div>
        <div>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{val}</h3>
        </div>
    </div>
);

// 2. Kanban Column with Built-in Pagination Control
const BoardColumn = ({ title, list, pagedList, page, setPage, total, limit, colors, onSel, selId, config, onFinish, isDone }) => {
    const totalPages = Math.ceil(total / limit);
    return (
        <div style={{ background: colors.kanbanBg, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: colors.secondaryText, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title} <span style={{ background: '#E2E8F0', padding: '2px 8px', borderRadius: '12px', color: '#0F172A', marginLeft: '6px' }}>{total}</span></h3>
                <PaginationControl page={page} setPage={setPage} total={total} limit={limit} colors={colors} mini />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {pagedList.length > 0 ? pagedList.map(t => {
                    const isSel = selId === t.id;
                    const mod = t.module || {};
                    return (
                        <div key={t.id} onClick={!isDone ? () => onSel(t) : undefined} style={{ background: '#fff', padding: '16px', borderRadius: '10px', border: `2px solid ${isSel ? colors.primaryBlue : 'transparent'}`, boxShadow: isSel ? '0 4px 10px rgba(37,99,235,0.1)' : '0 2px 4px rgba(0,0,0,0.03)', cursor: isDone ? 'default' : 'pointer', transition: 'all 0.2s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: config(t.status).bg, color: config(t.status).color }}>{config(t.status).label}</span>
                                <span style={{ fontSize: '11px', fontWeight: '600', color: colors.secondaryText }}>ID: {t.id}</span>
                            </div>
                            <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: colors.mainText, lineHeight: '1.4' }}>{mod.moduleName || "Untitled Task"}</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: colors.secondaryText, fontWeight: '500' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FolderDot size={13} color={colors.primaryBlue}/> Project: {mod.project?.projectName || "N/A"}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={13} color={colors.warning}/> Deadline: {t.deadline || "TBD"}</span>
                            </div>
                            {t.status === 'IN_PROGRESS' && !isDone && (
                                <button onClick={(e) => { e.stopPropagation(); onFinish(t.id); }} style={{ marginTop: '14px', width: '100%', padding: '8px', background: '#F0FDF4', color: '#10B981', border: '1px solid #BBF7D0', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: '0.2s hover' }}>Mark as Complete</button>
                            )}
                        </div>
                    );
                }) : (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: colors.secondaryText, fontSize: '12px', border: `1px dashed ${colors.border}`, borderRadius: '10px' }}>No tasks here.</div>
                )}
            </div>
        </div>
    );
};

// 3. Reusable Elite Pagination Control Component
const PaginationControl = ({ page, setPage, total, limit, colors, mini }) => {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return null; // Hide if only 1 page

    const btnStyle = { background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: mini ? '2px' : '4px', cursor: 'pointer', color: colors.mainText };
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...btnStyle, opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                <ChevronLeft size={mini ? 14 : 16} />
            </button>
            <span style={{ fontSize: mini ? '11px' : '13px', fontWeight: '600', color: colors.secondaryText }}>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...btnStyle, opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
                <ChevronRight size={mini ? 14 : 16} />
            </button>
        </div>
    );
};

export default EmployeeTasks;