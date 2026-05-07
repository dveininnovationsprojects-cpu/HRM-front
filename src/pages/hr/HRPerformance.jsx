import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    BarChart2, Search, Briefcase, Activity, CheckCircle, 
    AlertCircle, Clock, ShieldCheck, ChevronRight, Loader2, 
    Users, TrendingUp, Layers
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    Legend, ResponsiveContainer, RadialBarChart, RadialBar, Cell
} from 'recharts';

const HRPerformance = () => {
    // =========================================================================
    // 1. STATE MANAGEMENT
    // =========================================================================
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    
    // UI Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Elite Theme Palette
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        cardWhite: '#FFFFFF', mainText: '#0F172A', secondaryText: '#64748B',
        success: '#10B981', successLight: '#ECFDF5',
        warning: '#F59E0B', warningLight: '#FFFBEB',
        danger: '#EF4444', dangerLight: '#FEF2F2', border: '#E2E8F0', inputBg: '#F1F5F9'
    };

    // =========================================================================
    // 2. API FETCHING LOGIC
    // =========================================================================
    useEffect(() => {
        fetchProjectList();
    }, []);

    useEffect(() => {
        if (selectedProjectId) {
            fetchProjectReport(selectedProjectId);
        } else {
            setReportData(null);
        }
    }, [selectedProjectId]);

    const fetchProjectList = async () => {
        setLoadingProjects(true);
        try {
            const res = await api.get('/api/performance/projects');
            const data = Array.isArray(res.data) ? res.data : [];
            setProjects(data);
            
            // Auto-select first project if available
            if (data.length > 0) {
                setSelectedProjectId(data[0].id.toString());
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch enterprise project list.");
        } finally {
            setLoadingProjects(false);
        }
    };

    const fetchProjectReport = async (projectId) => {
        setLoadingReport(true);
        try {
            const res = await api.get(`/api/performance/projects/${projectId}`);
            setReportData(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load analytics for selected project.");
            setReportData(null);
        } finally {
            setLoadingReport(false);
        }
    };

    // =========================================================================
    // 3. DATA PROCESSING & HELPERS
    // =========================================================================
    
    // Filter Modules based on search and status dropdown
    const filteredModules = useMemo(() => {
        if (!reportData || !reportData.modules) return [];
        let filtered = reportData.modules;

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(m => 
                (m.moduleName && m.moduleName.toLowerCase().includes(q)) ||
                (m.assignedToName && m.assignedToName.toLowerCase().includes(q))
            );
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(m => {
                if (statusFilter === 'COMPLETED') return m.status === 'COMPLETED';
                if (statusFilter === 'LAGGING') return m.dailyStatus && m.dailyStatus.toUpperCase() === 'LAGGING';
                return m.status !== 'COMPLETED'; // ACTIVE
            });
        }
        return filtered;
    }, [reportData, searchTerm, statusFilter]);

    // Chart Data Configs
    const efficiencyChartData = reportData ? [
        { name: 'Efficiency', value: reportData.overallEfficiency || 0, fill: (reportData.overallEfficiency >= 80 ? colors.success : (reportData.overallEfficiency >= 50 ? colors.warning : colors.danger)) }
    ] : [];

    const moduleBarData = filteredModules.slice(0, 10).map(m => ({
        name: m.moduleName.substring(0, 12) + (m.moduleName.length > 12 ? '...' : ''),
        Estimated: m.estimatedHours || 0,
        Actual: m.actualHours || 0,
        assigned: m.assignedToName || 'Unassigned'
    }));

    // Status Styling Helpers
    const getStatusStyle = (status) => {
        const s = status ? status.toUpperCase() : 'UNKNOWN';
        if (s === 'COMPLETED') return { bg: colors.successLight, color: colors.success, icon: <CheckCircle size={14}/> };
        if (s === 'LAGGING' || s === 'DELAYED') return { bg: colors.dangerLight, color: colors.danger, icon: <AlertCircle size={14}/> };
        if (s === 'SATISFIED') return { bg: colors.successLight, color: colors.success, icon: <ShieldCheck size={14}/> };
        return { bg: colors.warningLight, color: colors.warning, icon: <Activity size={14}/> }; // In Progress
    };

    // =========================================================================
    // 4. RENDER UI
    // =========================================================================
    return (
        <DashboardLayout role="HR" title="Performance Analytics">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                
                {/* --------------------------------------------------------- */}
                {/* HEADER & PROJECT SELECTOR                                 */}
                {/* --------------------------------------------------------- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '26px', fontWeight: '800', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.5px' }}>
                            <BarChart2 color={colors.primaryBlue} size={28} /> Performance Tracking
                        </h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '15px' }}>
                            Monitor project progress, employee efficiency, and module delivery timelines.
                        </p>
                    </div>

                    <div style={{ background: '#fff', padding: '12px 20px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px' }}>
                        <Briefcase size={20} color={colors.primaryBlue} />
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase', marginBottom: '4px' }}>Target Project</label>
                            {loadingProjects ? (
                                <span style={{ fontSize: '14px', color: colors.mainText, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Loader2 size={16} className="spin"/> Loading portfolio...
                                </span>
                            ) : (
                                <select 
                                    value={selectedProjectId} 
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', fontWeight: '700', color: colors.mainText, cursor: 'pointer', background: 'transparent' }}
                                >
                                    <option value="" disabled>Select a project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.projectName}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                {/* --------------------------------------------------------- */}
                {/* PROJECT EXECUTIVE OVERVIEW (Cards)                        */}
                {/* --------------------------------------------------------- */}
                {loadingReport ? (
                    <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                        <Loader2 size={40} className="spin" color={colors.primaryBlue} style={{ marginBottom: '16px' }} />
                        <h3 style={{ margin: 0, color: colors.mainText }}>Analyzing Database Streams...</h3>
                        <p style={{ color: colors.secondaryText, fontSize: '14px' }}>Generating enterprise performance matrices.</p>
                    </div>
                ) : !reportData ? (
                    <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '16px', border: `1px dashed ${colors.border}` }}>
                        <AlertCircle size={40} color={colors.secondaryText} style={{ marginBottom: '16px' }} />
                        <h3 style={{ margin: 0, color: colors.mainText }}>No Project Selected</h3>
                        <p style={{ color: colors.secondaryText, fontSize: '14px' }}>Select a project from the dropdown to view its analytics.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                            {/* Project Header Info */}
                            <div className="metric-card" style={{ background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', padding: '24px', borderRadius: '16px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}><Briefcase size={120}/></div>
                                <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: '#93C5FD', marginBottom: '8px', letterSpacing: '1px' }}>Active Portfolio</span>
                                <h3 style={{ margin: '0 0 10px', fontSize: '22px', fontWeight: '800', lineHeight: '1.2' }}>{reportData.projectName}</h3>
                                
<div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#BFDBFE', fontWeight: '500' }}>
                                    <Users size={14}/> Manager: {reportData.managerName || 'Unassigned'}
                                </div>

                                {/* 👇 SECURE UNIFIED RUNTIME BRIDGE: Dynamically tracks properties directly from custom DTO parameters channels 👇 */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#BFDBFE', fontWeight: '500', marginTop: '6px' }}>
                                    <ShieldCheck size={14} color="#93C5FD"/> Team Lead: {
                                        reportData.teamLeadName || 
                                        reportData.tlName || 
                                        (reportData.modules && reportData.modules.find(m => m.teamLeadName)?.teamLeadName) || 
                                        'None Assigned'
                                    }
                                </div>
                            </div>

                            {/* Progress Percentage */}
                            <div className="metric-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: colors.secondaryText, fontWeight: '700', textTransform: 'uppercase' }}>Completion State</p>
                                    <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: colors.mainText }}>
                                        {reportData.progressPercentage ? reportData.progressPercentage.toFixed(1) : 0}%
                                    </h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: colors.success, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12}/> Modules Tracked</p>
                                </div>
                                <div style={{ height: '80px', width: '80px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={8} data={[{name: 'Progress', value: reportData.progressPercentage || 0, fill: colors.primaryBlue}]} startAngle={90} endAngle={-270}>
                                            <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Hours Tracking */}
                            <div className="metric-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <p style={{ margin: 0, fontSize: '13px', color: colors.secondaryText, fontWeight: '700', textTransform: 'uppercase' }}>Time Allocation</p>
                                    <div style={{ background: colors.lightBlue, padding: '8px', borderRadius: '8px', color: colors.primaryBlue }}><Clock size={16}/></div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: colors.mainText }}>{reportData.totalActualHours || 0}h</h3>
                                    <span style={{ fontSize: '14px', color: colors.secondaryText, fontWeight: '600', paddingBottom: '4px' }}>/ {reportData.totalEstimatedHours || 0}h Est</span>
                                </div>
                                {/* Mini progress bar for hours */}
                                <div style={{ width: '100%', height: '6px', background: colors.inputBg, borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${Math.min(100, ((reportData.totalActualHours || 0) / (reportData.totalEstimatedHours || 1)) * 100)}%`, background: (reportData.totalActualHours > reportData.totalEstimatedHours) ? colors.danger : colors.primaryBlue }}></div>
                                </div>
                            </div>

                            {/* Overall Efficiency */}
                            <div className="metric-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: colors.secondaryText, fontWeight: '700', textTransform: 'uppercase' }}>Overall Efficiency</p>
                                    <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: (reportData.overallEfficiency >= 80 ? colors.success : (reportData.overallEfficiency >= 50 ? colors.warning : colors.danger)) }}>
                                        {reportData.overallEfficiency ? reportData.overallEfficiency.toFixed(1) : 0}%
                                    </h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: colors.secondaryText, fontWeight: '600' }}>System Score</p>
                                </div>
                                <div style={{ height: '80px', width: '80px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={8} data={efficiencyChartData} startAngle={180} endAngle={0}>
                                            <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* --------------------------------------------------------- */}
                        {/* CHART VISUALIZATION                                       */}
                        {/* --------------------------------------------------------- */}
                        <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.mainText, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BarChart2 size={18} color={colors.primaryBlue}/> Module Burn-Down Analysis (Est vs Actual)
                            </h3>
                            {moduleBarData.length > 0 ? (
                                <div style={{ height: '300px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={moduleBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: colors.secondaryText }} angle={-25} textAnchor="end" />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: colors.secondaryText }} />
                                            <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                            <Bar dataKey="Estimated" name="Estimated Hours" fill="#93C5FD" radius={[4, 4, 0, 0]} barSize={24} />
                                            <Bar dataKey="Actual" name="Actual Hours" fill={colors.primaryBlue} radius={[4, 4, 0, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.secondaryText, border: `1px dashed ${colors.border}`, borderRadius: '12px' }}>No active modules data available to plot chart.</div>
                            )}
                        </div>

                        <div style={{ background: '#fff', padding: '20px', borderRadius: '16px 16px 0 0', border: `1px solid ${colors.border}`, borderBottom: 'none', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.secondaryText }} />
                                <input 
                                    type="text" placeholder="Search module or employee name..." 
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '14px', boxSizing: 'border-box', background: colors.inputBg }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <select 
                                    value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ padding: '12px 14px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '14px', background: colors.inputBg, color: colors.mainText, cursor: 'pointer', fontWeight: '600' }}
                                >
                                    <option value="ALL">All Modules</option>
                                    <option value="ACTIVE">Active / Pending</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="LAGGING">Lagging Internally</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ background: colors.cardWhite, borderRadius: '0 0 16px 16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                                    <thead>
                                        <tr style={{ background: colors.background, borderBottom: `2px solid ${colors.border}` }}>
                                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: colors.secondaryText, textTransform: 'uppercase' }}>Module Asset</th>
                                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: colors.secondaryText, textTransform: 'uppercase' }}>Assigned Employee</th>
                                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: colors.secondaryText, textTransform: 'uppercase', textAlign: 'center' }}>Time Config (Est / Act)</th>
                                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: colors.secondaryText, textTransform: 'uppercase', textAlign: 'center' }}>Efficiency</th>
                                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: colors.secondaryText, textTransform: 'uppercase' }}>Module State</th>
                                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: colors.secondaryText, textTransform: 'uppercase' }}>Pace Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredModules.length > 0 ? (
                                            filteredModules.map((m, i) => {
                                                const modState = getStatusStyle(m.status);
                                                const paceState = getStatusStyle(m.dailyStatus);
                                                const effColor = m.efficiency >= 80 ? colors.success : (m.efficiency >= 50 ? colors.warning : colors.danger);
                                                
                                                return (
                                                    <tr key={i} className="table-row" style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s' }}>
                                                        {/* Module Details */}
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{ padding: '8px', background: colors.lightBlue, borderRadius: '8px', color: colors.primaryBlue }}><Layers size={16}/></div>
                                                                <span style={{ fontWeight: '700', color: colors.mainText, fontSize: '14px' }}>{m.moduleName || 'Untitled Core'}</span>
                                                            </div>
                                                        </td>
                                                        
                                                        {/* Employee Assigned */}
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', color: colors.secondaryText }}>
                                                                    {m.assignedToName ? m.assignedToName.charAt(0).toUpperCase() : 'U'}
                                                                </div>
                                                                <div>
                                                                    <p style={{ margin: 0, fontWeight: '600', color: colors.mainText, fontSize: '14px' }}>{m.assignedToName || 'Unassigned'}</p>

                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Hours Metrics */}
                                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: colors.inputBg, padding: '4px 10px', borderRadius: '8px' }}>
                                                                <span style={{ fontSize: '13px', fontWeight: '700', color: colors.secondaryText }}>{m.estimatedHours || 0}h</span>
                                                                <ChevronRight size={12} color={colors.border} />
                                                                <span style={{ fontSize: '13px', fontWeight: '800', color: (m.actualHours > m.estimatedHours ? colors.danger : colors.primaryBlue) }}>{m.actualHours || 0}h</span>
                                                            </div>
                                                        </td>

                                                        {/* Efficiency Score */}
                                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                            <span style={{ fontSize: '15px', fontWeight: '800', color: effColor }}>
                                                                {m.efficiency ? m.efficiency.toFixed(1) : 0}%
                                                            </span>
                                                        </td>

                                                        {/* Module Core Status */}
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '20px', background: modState.bg, color: modState.color, fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                                                                {modState.icon} {m.status || 'ASSIGNED'}
                                                            </span>
                                                        </td>

                                                        {/* Daily Pace Analytica */}
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '20px', background: paceState.bg, color: paceState.color, fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                                                                {paceState.icon} {m.dailyStatus || 'TRACKING'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="6" style={{ padding: '60px', textAlign: 'center' }}>
                                                    <div style={{ background: colors.inputBg, width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                                        <AlertCircle size={30} color={colors.secondaryText} />
                                                    </div>
                                                    <h4 style={{ margin: '0 0 5px', color: colors.mainText, fontSize: '16px' }}>No Tracking Data Found</h4>
                                                    <p style={{ margin: 0, fontSize: '14px', color: colors.secondaryText }}>Adjust filters or select a different project workspace.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

            </div>

            {/* Custom Styles */}
            <style>
                {`
                    .metric-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.04); transition: all 0.3s ease; }
                    .table-row:hover { background-color: #F8FAFC; }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}
            </style>
        </DashboardLayout>
    );
};

export default HRPerformance;