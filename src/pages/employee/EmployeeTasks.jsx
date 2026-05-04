import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Briefcase, Clock, AlertCircle, FolderDot, UserCheck } from 'lucide-react';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';

const EmployeeTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myProfile, setMyProfile] = useState(null);

    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EAF2FF', cardWhite: '#FFFFFF',
        mainText: '#0F172A', secondaryText: '#64748B', border: '#DCE6F2',
        danger: '#EF4444', success: '#10B981'
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            
            // 1. Get Profile first
            const profileRes = await api.get('/api/employees/me');
            setMyProfile(profileRes.data);

            // 2. Get Tasks (Intha response thaan loop aagi varuthu)
            const taskRes = await api.get('/api/employee/tasks');
            
            let finalTasks = [];

            // 🔥 CRITICAL RECURSION BYPASS: 
            // Intha logic JSON-la iruka loops-ah manual-ah handle pannum
            if (taskRes.data) {
                const rawData = taskRes.data;
                
                if (Array.isArray(rawData)) {
                    finalTasks = rawData.map(item => {
                        // Sila neram loop error vantha data string-ah varum, athai parse pannuvom
                        if (typeof item === 'string') {
                            try {
                                // Cleaning broken string JSON
                                const cleaned = item.split('{"error":')[0]; 
                                return JSON.parse(cleaned);
                            } catch (e) { return null; }
                        }
                        return item;
                    }).filter(t => t !== null && t.id);
                }
            }

            setTasks(finalTasks);
            console.log("✅ RECOVERED TASKS:", finalTasks);

        } catch (error) {
            console.error("Backend recursion detected, but trying to load...");
            toast.error("Large data detected. Loading essential parts...");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="EMPLOYEE" title="My Assigned Tasks">
            <div style={{ backgroundColor: '#F5F9FF', minHeight: '100vh', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
                
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '700', color: colors.mainText, margin: '0 0 8px 0' }}>My Assignments 📋</h1>
                        <p style={{ color: colors.secondaryText, fontSize: '15px' }}>Active tasks: <b>{tasks.length}</b></p>
                    </div>
                    {myProfile && (
                        <div style={{ background: colors.lightBlue, padding: '10px 16px', borderRadius: '12px', border: `1px solid ${colors.primaryBlue}` }}>
                            <p style={{ margin: 0, fontSize: '14px', color: colors.primaryBlue, fontWeight: '700' }}>
                                <UserCheck size={16} style={{ marginRight: '5px' }} />
                                {myProfile.fullName} (ID: {myProfile.id})
                            </p>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
                ) : tasks.length === 0 ? (
                    <div style={{ padding: '60px', background: '#fff', borderRadius: '16px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                        <AlertCircle size={40} color={colors.danger} style={{ marginBottom: '15px' }} />
                        <h3 style={{ color: colors.mainText }}>No Tasks Visible</h3>
                        <p style={{ color: colors.secondaryText }}>Backend recursion error detected. Check SQL for ID: {myProfile?.id}</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '25px' }}>
                        {tasks.map((task, idx) => {
                            const mod = task?.module || {};
                            const proj = mod?.project || {};

                            return (
                                <div key={task.id || idx} style={{ background: '#fff', padding: '28px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: colors.success, background: '#F0FDF4', padding: '4px 10px', borderRadius: '20px' }}>{task.status || 'ASSIGNED'}</span>
                                        <span style={{ fontSize: '13px', color: colors.secondaryText }}>Est: {mod.estimatedHours || 0}h</span>
                                    </div>
                                    
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.mainText, marginBottom: '20px' }}>
                                        {mod.moduleName || "Untitled Module"}
                                    </h3>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: `1px solid ${colors.border}`, paddingTop: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: colors.secondaryText }}>
                                            <FolderDot size={18} color={colors.primaryBlue} /> <b>Project:</b> {proj.projectName || "N/A"}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: colors.secondaryText }}>
                                            <AlertCircle size={18} color="#F59E0B" /> <b>Deadline:</b> {task.deadline || "TBD"}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default EmployeeTasks;