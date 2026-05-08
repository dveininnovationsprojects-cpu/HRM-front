import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    BarChart2, Search, Briefcase, Activity, CheckCircle, 
    AlertCircle, Clock, ShieldCheck, ChevronRight, Loader2, 
    TrendingUp, Layers, RefreshCw
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';

const ManagerAnalytics = () => {
    // 1. STATE MANAGEMENT
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        cardWhite: '#FFFFFF', mainText: '#0F172A', secondaryText: '#64748B',
        success: '#10B981', successLight: '#ECFDF5',
        warning: '#F59E0B', warningLight: '#FFFBEB',
        danger: '#EF4444', dangerLight: '#FEF2F2', border: '#E2E8F0', inputBg: '#F1F5F9'
    };

    // 2. API CALLS
    useEffect(() => {
        fetchProjectList();
    }, []);

    useEffect(() => {
        if (selectedProjectId) fetchProjectReport(selectedProjectId);
    }, [selectedProjectId]);

    const fetchProjectList = async () => {
        setLoadingProjects(true);
        try {
            const res = await api.get('/api/performance/projects');
            const data = Array.isArray(res.data) ? res.data : [];
            setProjects(data);
            if (data.length > 0) setSelectedProjectId(data[0].id.toString());
        } catch (err) {
            toast.error("Failed to load project portfolio.");
        } finally {
            setLoadingProjects(false);
        }
    };

    const fetchProjectReport = async (projectId) => {
        setLoadingReport(true);
        try {
            // FIXED: Fetching deep report using Manager's Endpoint
            const res = await api.get(`/api/performance/projects/${projectId}`);
            setReportData(res.data);
        } catch (err) {
            setReportData(null);
            toast.error("Analytics not found for this project asset.");
        } finally {
            setLoadingReport(false);
        }
    };

    // 3. DATA FILTERING
    const filteredModules = useMemo(() => {
        // FIXED: Using 'moduleReports' to match your ProjectAnalyticsReportDTO
        const modules = reportData?.moduleReports || [];
        if (!searchTerm) return modules;
        return modules.filter(m => 
            m.moduleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reportData, searchTerm]);

    const moduleBarData = filteredModules.slice(0, 10).map(m => ({
        name: m.moduleName?.substring(0, 12) || 'Core',
        Estimated: m.estimatedHours || 0,
        Actual: m.actualHours || 0
    }));

    return (
        <DashboardLayout role="MANAGER" title="Performance Analytics">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Activity color={colors.primaryBlue} size={32} /> Performance Intelligence
                        </h1>
                        <p style={{ margin: '4px 0 0', color: colors.secondaryText }}>Real-time telemetry and resource efficiency mapping.</p>
                    </div>

                    <div style={{ background: '#fff', padding: '12px 20px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px' }}>
                        <Briefcase size={20} color={colors.primaryBlue} />
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: colors.secondaryText, textTransform: 'uppercase' }}>Selected Workspace</label>
                            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', fontWeight: '700', color: colors.mainText, cursor: 'pointer', background: 'transparent' }}>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {loadingReport ? (
                    <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <RefreshCw size={40} className="spin" color={colors.primaryBlue} />
                        <h3 style={{ marginTop: '16px', color: colors.mainText }}>Syncing Performance Data...</h3>
                    </div>
                ) : reportData ? (
                    <>
                        {/* KPI Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', padding: '24px', borderRadius: '20px', color: '#fff' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8 }}>Project Stream</span>
                                <h3 style={{ margin: '8px 0', fontSize: '22px', fontWeight: '800' }}>{reportData.projectName}</h3>
                                <p style={{ margin: 0, fontSize: '13px' }}>Asset Load: {reportData.totalModules || 0} Modules</p>
                            </div>

                            <div style={{ background: '#fff', padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '12px', color: colors.secondaryText, fontWeight: '700' }}>EFFICIENCY</p>
                                    <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: colors.success }}>{reportData.overallEfficiencyScore || 0}%</h3>
                                </div>
                                <div style={{ height: '60px', width: '60px' }}>
                                    <ResponsiveContainer>
                                        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={[{value: reportData.overallEfficiencyScore || 0, fill: colors.success}]} startAngle={90} endAngle={-270}>
                                            <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div style={{ background: '#fff', padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}` }}>
                                <p style={{ margin: 0, fontSize: '12px', color: colors.secondaryText, fontWeight: '700' }}>HOURS LOGGED</p>
                                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: colors.mainText }}>{reportData.totalActualHours || 0}h</h3>
                                <p style={{ margin: 0, fontSize: '12px', color: colors.secondaryText }}>Allocated: {reportData.totalEstimatedHours || 0}h</p>
                            </div>

                            <div style={{ background: '#fff', padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CheckCircle color={colors.success} size={32}/>
                                <div>
                                    <p style={{ margin: 0, fontSize: '12px', color: colors.secondaryText, fontWeight: '700' }}>STATE</p>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{(reportData.overallEfficiencyScore || 0) > 70 ? 'HEALTHY' : 'LAGGING'}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: `1px solid ${colors.border}`, marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Burn-Down Velocity (Est vs Actual)</h3>
                            <div style={{ height: '350px' }}>
                                <ResponsiveContainer width="99%" height={350}>
                                    <BarChart data={moduleBarData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <RechartsTooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Legend verticalAlign="top" align="right" />
                                        <Bar dataKey="Estimated" name="Est. Hours" fill="#CBD5E1" radius={[6, 6, 0, 0]} barSize={40} />
                                        <Bar dataKey="Actual" name="Act. Progress" fill={colors.primaryBlue} radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Table Area */}
                        <div style={{ background: '#fff', borderRadius: '24px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                            <div style={{ padding: '24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Module Health Matrix</h3>
                                <div style={{ position: 'relative', width: '300px' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.secondaryText }} />
                                    <input type="text" placeholder="Search contributor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 40px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: '#F8FAFC' }}>
                                        <tr>
                                            <th style={{ padding: '18px 24px', fontSize: '12px', color: colors.secondaryText }}>MODULE</th>
                                            <th style={{ padding: '18px 24px', fontSize: '12px', color: colors.secondaryText }}>CONTRIBUTOR</th>
                                            <th style={{ padding: '18px 24px', fontSize: '12px', color: colors.secondaryText }}>EFFICIENCY</th>
                                            <th style={{ padding: '18px 24px', fontSize: '12px', color: colors.secondaryText }}>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredModules.map((m, i) => (
                                            <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                                <td style={{ padding: '20px 24px', fontWeight: '700' }}>{m.moduleName}</td>
                                                <td style={{ padding: '20px 24px' }}>{m.employeeName || 'System'}</td>
                                                <td style={{ padding: '20px 24px', fontWeight: '800', color: m.efficiencyScore >= 80 ? colors.success : colors.danger }}>{m.efficiencyScore || 0}%</td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <span style={{ padding: '6px 14px', borderRadius: '12px', background: m.efficiencyScore >= 80 ? colors.successLight : colors.dangerLight, color: m.efficiencyScore >= 80 ? colors.success : colors.danger, fontSize: '11px', fontWeight: '800' }}>
                                                        {m.efficiencyScore >= 80 ? 'OPTIMAL' : 'LAGGING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '24px', border: '2px dashed #E2E8F0' }}>
                        <AlertCircle size={48} color={colors.secondaryText} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <h3 style={{ color: colors.secondaryText }}>Workspace Empty: Select a Project with active modules.</h3>
                    </div>
                )}
            </div>
            <style>{`.spin { animation: rotate 2s linear infinite; } @keyframes rotate { 100% { transform: rotate(360deg); } }`}</style>
        </DashboardLayout>
    );
};

export default ManagerAnalytics;