import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Briefcase, RefreshCw, AlertTriangle, Zap, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerAnalytics = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF',
        mainText: '#0F172A', secondaryText: '#64748B',
        border: '#E2E8F0', cardWhite: '#FFFFFF',
        success: '#10B981', danger: '#EF4444', warning: '#F59E0B',
        successBg: '#DCFCE7', dangerBg: '#FEE2E2'
    };

    // 🟢 Step 1: Fetch Project List for Dropdown [cite: 5]
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/api/performance/projects');
                const data = Array.isArray(res.data) ? res.data : [];
                setProjects(data);
                if (data.length > 0) {
                    setSelectedProjectId(data[0].id);
                }
            } catch (error) {
                console.error("Project list fetch failed");
            }
        };
        fetchProjects();
    }, []);

    // 🟢 Step 2: Fetch Project Performance Report 
    useEffect(() => {
        if (!selectedProjectId) return;
        const fetchReport = async () => {
            setLoading(true);
            try {
                // Mapping to ProjectAnalyticsReportDTO as per documentation 
                const res = await api.get(`/api/performance/projects/${selectedProjectId}`);
                setReport(res.data);
            } catch (error) {
                toast.error("Failed to compile analytics report.");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [selectedProjectId]);

    return (
        <DashboardLayout role="MANAGER" title="Performance Analytics">
            <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '40px' }}>
                
                {/* Header & Filter [cite: 15] */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.mainText, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Performance Intelligence</h1>
                        <p style={{ margin: 0, color: colors.secondaryText }}>Detailed efficiency tracking and workforce velocity[cite: 15].</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: colors.cardWhite, padding: '12px 20px', borderRadius: '14px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                        <Briefcase size={20} color={colors.primaryBlue} />
                        <select 
                            value={selectedProjectId} 
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '15px', fontWeight: '700', color: colors.mainText, cursor: 'pointer', minWidth: '220px' }}
                        >
                            <option value="" disabled>Select Target Project</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                        <RefreshCw size={40} className="animate-spin" color={colors.primaryBlue} style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: colors.secondaryText, fontWeight: '500' }}>Analyzing project telemetry...</h3>
                    </div>
                ) : report ? (
                    <>
                        {/* Summary Metrics  */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '35px' }}>
                            <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ background: colors.lightBlue, padding: '15px', borderRadius: '15px', color: colors.primaryBlue }}><Zap size={24} /></div>
                                <div>
                                    <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Efficiency Score</p>
                                    <h2 style={{ fontSize: '32px', margin: 0, color: colors.mainText, fontWeight: '800' }}>{report.overallEfficiencyScore}% </h2>
                                </div>
                            </div>
                            <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ background: colors.successBg, padding: '15px', borderRadius: '15px', color: colors.success }}><Clock size={24} /></div>
                                <div>
                                    <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Hours Logged</p>
                                    <h2 style={{ fontSize: '32px', margin: 0, color: colors.mainText, fontWeight: '800' }}>
                                        {report.totalActualHours}<span style={{ fontSize: '16px', color: colors.secondaryText }}> / {report.totalEstimatedHours}h </span>
                                    </h2>
                                </div>
                            </div>
                            <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '15px', color: colors.mainText }}><CheckCircle2 size={24} /></div>
                                <div>
                                    <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Resource Focus</p>
                                    <h2 style={{ fontSize: '32px', margin: 0, color: colors.mainText, fontWeight: '800' }}>{report.totalModules} <span style={{ fontSize: '16px', color: colors.secondaryText }}>Modules</span></h2>
                                </div>
                            </div>
                        </div>

                        {/* Chart Area - Fixes the width/height console warning */}
                        <div style={{ background: colors.cardWhite, padding: '30px', borderRadius: '20px', border: `1px solid ${colors.border}`, marginBottom: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: '0 0 25px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '700' }}><Activity size={22} color={colors.primaryBlue}/> Delivery Velocity</h3>
                            <div style={{ height: '380px', width: '100%' }}>
                                <ResponsiveContainer width="99%" height={380}>
                                    <BarChart data={report.moduleReports || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="moduleName" axisLine={false} tickLine={false} tick={{ fill: colors.secondaryText, fontSize: 12, fontWeight: 500 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.secondaryText, fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '13px', fontWeight: '600' }} />
                                        <Bar dataKey="estimatedHours" name="Estimated Time" fill="#E2E8F0" radius={[6, 6, 0, 0]} barSize={40} />
                                        <Bar dataKey="actualHours" name="Actual Progress" fill={colors.primaryBlue} radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Detailed Table  */}
                        <div style={{ background: colors.cardWhite, borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: 0, padding: '25px', borderBottom: `1px solid ${colors.border}`, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                Module Health Matrix 
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#F8FAFC' }}>
                                        <tr>
                                            <th style={{ padding: '18px 25px', fontSize: '13px', color: colors.secondaryText, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Module Identifier</th>
                                            <th style={{ padding: '18px 25px', fontSize: '13px', color: colors.secondaryText, textTransform: 'uppercase' }}>Contributor</th>
                                            <th style={{ padding: '18px 25px', fontSize: '13px', color: colors.secondaryText, textTransform: 'uppercase' }}>Efficiency</th>
                                            <th style={{ padding: '18px 25px', fontSize: '13px', color: colors.secondaryText, textTransform: 'uppercase' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(report.moduleReports || []).map((mod, idx) => {
                                            const isLagging = mod.efficiencyScore < 70; // Logic for lagging status 
                                            return (
                                                <tr key={idx} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                                    <td style={{ padding: '20px 25px', fontWeight: '700', color: colors.mainText }}>{mod.moduleName}</td>
                                                    <td style={{ padding: '20px 25px', color: colors.secondaryText, fontWeight: '500' }}>{mod.employeeName}</td>
                                                    <td style={{ padding: '20px 25px', fontWeight: '800', color: isLagging ? colors.danger : colors.success }}>
                                                        {mod.efficiencyScore}%
                                                    </td>
                                                    <td style={{ padding: '20px 25px' }}>
                                                        <span style={{ 
                                                            padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '800',
                                                            background: isLagging ? colors.dangerBg : colors.successBg,
                                                            color: isLagging ? colors.danger : colors.success 
                                                        }}>
                                                            {isLagging ? 'LAGGING' : 'OPTIMAL'} 
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 20px', background: '#F8FAFC', borderRadius: '30px', border: `2px dashed ${colors.border}` }}>
                        <AlertTriangle size={56} color={colors.secondaryText} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <h3 style={{ color: colors.mainText, fontSize: '20px', margin: '0 0 10px 0' }}>Data Core Offline</h3>
                        <p style={{ color: colors.secondaryText, maxWidth: '400px', margin: '0 auto' }}>Please select a high-priority project to initialize deep drill-down analytics mapping.</p>
                    </div>
                )}
                
                <style>{`
                    .animate-spin { animation: spin 1.5s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        </DashboardLayout>
    );
};

export default ManagerAnalytics;