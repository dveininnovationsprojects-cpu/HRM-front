import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import { ClipboardList, Clock, Bell, Send, CheckCircle } from 'lucide-react';
import api from '../api/apiConfig';

const EmployeeDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [metrics, setMetrics] = useState({ taskCount: 0, unreadNotifications: 0 });
    const [logData, setLogData] = useState({ taskId: '', hours: '', remarks: '' });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Backend API: GET /api/employee/tasks
                const taskRes = await api.get('/api/employee/tasks');
                setTasks(taskRes.data);
                
                // Set metrics based on response
                setMetrics({
                    taskCount: taskRes.data.length,
                    unreadNotifications: 0 // Fetch from /api/notifications/unread if needed
                });
            } catch (err) {
                console.error("Failed to load employee data");
            }
        };
        fetchDashboardData();
    }, []);

    const handleWorkLog = async (e) => {
        e.preventDefault();
        try {
            // Backend API: PUT /api/employee/tasks/{taskId}/log
            const res = await api.put(`/api/employee/tasks/${logData.taskId}/log`, {
                hours: parseFloat(logData.hours),
                remarks: logData.remarks
            });
            if (res.status === 200) {
                alert("Work log updated successfully! Status changed to IN_PROGRESS.");
                // Refresh tasks list
            }
        } catch (err) {
            alert("Error logging work. Check if Task ID is correct.");
        }
    };

    return (
        <DashboardLayout role="EMPLOYEE" title="My Work Log">
            {/* 1. Quick Metrics Section */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <StatCard title="Active Tasks" value={metrics.taskCount} icon={<ClipboardList />} color="#3b82f6" subtext="Assigned to you" />
                <StatCard title="Attendance" value="Checked In" icon={<CheckCircle />} color="#10b981" subtext="Today 09:15 AM" />
                <StatCard title="Alerts" value={metrics.unreadNotifications} icon={<Bell />} color="#f59e0b" subtext="New notifications" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                
                {/* 2. My Active Tasks (Jira Style List) */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>My Active Tasks</h3>
                        <span style={{ fontSize: '12px', background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '20px' }}>Jira View</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {tasks.length > 0 ? tasks.map(task => (
                            <div key={task.id} style={{ border: '1px solid #f1f5f9', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>{task.moduleName || "Task Name"}</p>
                                    <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#64748b' }}>Project ID: {task.projectId} | Deadline: {task.deadline}</p>
                                </div>
                                <span style={{ padding: '4px 12px', background: '#fef3c7', color: '#92400e', borderRadius: '6px', fontSize: '12px' }}>{task.status || "ASSIGNED"}</span>
                            </div>
                        )) : <p style={{ textAlign: 'center', color: '#94a3b8' }}>No tasks assigned yet.</p>}
                    </div>
                </div>

                {/* 3. Daily Work Log Form */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Log Daily Work</h3>
                    <form onSubmit={handleWorkLog}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '13px', color: '#64748b' }}>Select Task</label>
                            <select 
                                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd' }}
                                onChange={(e) => setLogData({ ...logData, taskId: e.target.value })}
                                required
                            >
                                <option value="">-- Choose Task --</option>
                                {tasks.map(t => <option key={t.id} value={t.id}>{t.moduleName}</option>)}
                            </select>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '13px', color: '#64748b' }}>Hours Spent</label>
                            <input 
                                type="number" step="0.5" 
                                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd' }}
                                placeholder="Ex: 4.5"
                                onChange={(e) => setLogData({ ...logData, hours: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '13px', color: '#64748b' }}>Remarks</label>
                            <textarea 
                                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', height: '80px' }}
                                placeholder="What did you do today?"
                                onChange={(e) => setLogData({ ...logData, remarks: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <Send size={18} /> Log Work
                        </button>
                    </form>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default EmployeeDashboard;