import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
    Users, UserCheck, Activity, Search, Filter, ChevronLeft, ChevronRight,
    Briefcase, Building2, Phone, Mail, Fingerprint, TrendingUp, 
    ShieldCheck, AlertTriangle, UserX, Loader2
} from 'lucide-react';

// ============================================================================
// 🎨 1. MASTER THEME & STYLES CONFIGURATION (Enterprise Palette)
// ============================================================================
const theme = {
    primary: '#2563EB',      
    primaryLight: '#EFF6FF',
    secondary: '#3B82F6',    
    accent: '#8B5CF6',       
    accentLight: '#F3E8FF',
    success: '#10B981',      
    successLight: '#DCFCE7',
    warning: '#F59E0B',      
    warningLight: '#FEF3C7',
    danger: '#EF4444',       
    dangerLight: '#FEE2E2',
    background: '#F8FAFC',   
    card: '#FFFFFF',
    textDark: '#0F172A',     
    textMuted: '#64748B',    
    border: '#E2E8F0',       
    chartPalette: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E', '#06B6D4']
};

export default function AdminDashboard() {
    // ============================================================================
    // 💾 2. STATE MANAGEMENT (Core Data & UI States)
    // ============================================================================
    const [employees, setEmployees] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dynamic Filter & Pagination States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; 

    // ============================================================================
    // 🌐 3. ROBUST DATA FETCHING (Promise.allSettled avoids crash on 400 errors)
    // ============================================================================
    useEffect(() => {
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        setLoading(true);
        try {
            // Using allSettled so if one API fails (like projects), the others still load!
            const results = await Promise.allSettled([
                api.get('/api/admin/employees'),
                api.get('/api/leaves/all'),
                api.get('/api/attendance/all'),
                api.get('/api/performance/projects')
            ]);

            // Safe Data Extraction
            if (results[0].status === 'fulfilled') setEmployees(Array.isArray(results[0].value.data) ? results[0].value.data : []);
            if (results[1].status === 'fulfilled') setLeaves(Array.isArray(results[1].value.data) ? results[1].value.data : []);
            if (results[2].status === 'fulfilled') setAttendance(Array.isArray(results[2].value.data) ? results[2].value.data : []);
            if (results[3].status === 'fulfilled') setProjects(Array.isArray(results[3].value.data) ? results[3].value.data : []);

        } catch (error) {
            console.error("Aggregation Error:", error);
            toast.error("Partial data load. Some modules might be offline.");
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // 🧠 4. DYNAMIC ANALYTICS & MEMOIZATION (No Static Data)
    // ============================================================================
    
    // A. Top-Level KPIs
    const kpis = useMemo(() => {
        const totalEmp = employees.length;
        const activeEmp = employees.filter(e => String(e.status || e.designationStatus).toLowerCase() === 'active').length;
        
        const today = new Date().toISOString().split('T')[0];
        const presentToday = attendance.filter(a => a.date === today && String(a.status).includes('PRESENT')).length;
        const pendingLeaves = leaves.filter(l => String(l.status).toUpperCase() === 'PENDING').length;
        
        return {
            total: totalEmp,
            active: activeEmp,
            presentToday: presentToday,
            pendingLeaves: pendingLeaves,
            attendanceRate: totalEmp > 0 ? Math.round((presentToday / totalEmp) * 100) : 0
        };
    }, [employees, attendance, leaves]);

    // B. Department Distribution Chart Logic (Fixed Variable Name Error)
    const departmentChartData = useMemo(() => {
        const deptCounts = {};
        employees.forEach(emp => {
            const dept = emp.department || 'Unassigned';
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
        return Object.entries(deptCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort highest first
    }, [employees]);

    // C. 7-Day Attendance Trend Chart Logic
    const attendanceTrendData = useMemo(() => {
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' });
            
            const presents = attendance.filter(a => a.date === dateStr && String(a.status).includes('PRESENT')).length;
            trend.push({ name: shortDay, Present: presents, Date: dateStr });
        }
        return trend;
    }, [attendance]);

    // D. Dropdown Extractors
    const uniqueDepartments = useMemo(() => {
        const depts = new Set(employees.map(e => e.department).filter(Boolean));
        return ['ALL', ...Array.from(depts)];
    }, [employees]);

    // ============================================================================
    // 🔍 5. ADVANCED FILTERING & PAGINATION ENGINE
    // ============================================================================
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            // Text Match
            const q = searchTerm.toLowerCase().trim();
            const matchSearch = 
                (emp.fullName || '').toLowerCase().includes(q) ||
                (emp.biometricId || '').toLowerCase().includes(q) ||
                (emp.email || '').toLowerCase().includes(q) ||
                (emp.position || '').toLowerCase().includes(q);
            
            // Dropdown Matches
            const matchDept = filterDept === 'ALL' || emp.department === filterDept;
            const empStatus = String(emp.status || emp.designationStatus || 'ACTIVE').toUpperCase();
            const matchStatus = filterStatus === 'ALL' || empStatus === filterStatus;

            return matchSearch && matchDept && matchStatus;
        });
    }, [employees, searchTerm, filterDept, filterStatus]);

    // Pagination Calcs
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const paginatedData = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterDept, filterStatus]); // Reset page on filter

    // ============================================================================
    // 🧱 6. REUSABLE UI COMPONENTS
    // ============================================================================
    const KpiCard = ({ title, value, subtext, icon, color, bgColor }) => (
        <div style={{...styles.kpiCard, borderBottom: `4px solid ${color}`}}>
            <div style={styles.kpiHeader}>
                <div style={{ flex: 1 }}>
                    <p style={styles.kpiTitle}>{title}</p>
                    <h2 style={styles.kpiValue}>{value}</h2>
                    <p style={styles.kpiSubtext}>{subtext}</p>
                </div>
                <div style={{...styles.kpiIconBox, backgroundColor: bgColor, color: color}}>
                    {icon}
                </div>
            </div>
        </div>
    );

    const getAvatarColor = (name) => {
        if (!name) return theme.chartPalette[0];
        return theme.chartPalette[name.charCodeAt(0) % theme.chartPalette.length];
    };

    // ============================================================================
    // 🖥️ 7. MAIN RENDER PIPELINE
    // ============================================================================
    if (loading) {
        return (
            <DashboardLayout role="ADMIN" title="Executive Overview">
                <div style={styles.loadingContainer}>
                    <Loader2 size={50} color={theme.primary} className="animate-spin" />
                    <h3 style={styles.loadingText}>Synchronizing Command Center...</h3>
                    <p style={styles.loadingSubText}>Fetching real-time global workforce data</p>
                </div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="ADMIN" title="Executive Overview">
            <div style={styles.pageContainer}>
                
                {/* --- HEADER --- */}
                <div style={styles.pageHeader}>
                    <div>
                        <h1 style={styles.pageTitle}>Master Command Center</h1>
                        <p style={styles.pageSubtitle}>Real-time analytics & read-only directory tracking.</p>
                    </div>
                    <div style={styles.liveIndicator}>
                        <span style={styles.pulsingDot}></span> Live System Active
                    </div>
                </div>

                {/* --- 4x KPI GRID --- */}
                <div style={styles.kpiGrid}>
                    <KpiCard title="Total Workforce" value={kpis.total} subtext="Registered system identities" icon={<Users size={28}/>} color={theme.primary} bgColor={theme.primaryLight} />
                    <KpiCard title="Active Employees" value={kpis.active} subtext="Currently deployed" icon={<UserCheck size={28}/>} color={theme.success} bgColor={theme.successLight} />
                    <KpiCard title="Today's Attendance" value={`${kpis.attendanceRate}%`} subtext={`${kpis.presentToday} employees present`} icon={<Activity size={28}/>} color={theme.accent} bgColor={theme.accentLight} />
                    <KpiCard title="Pending Approvals" value={kpis.pendingLeaves} subtext="Leaves awaiting action" icon={<AlertTriangle size={28}/>} color={theme.warning} bgColor={theme.warningLight} />
                </div>

                {/* --- DYNAMIC CHARTS --- */}
                <div style={styles.chartsGrid}>
                    {/* Attendance Trend (Area Chart) */}
                    <div style={styles.chartCard}>
                        <div style={styles.chartHeader}>
                            <h3 style={styles.chartTitle}><TrendingUp size={18} color={theme.primary}/> 7-Day Attendance Flow</h3>
                        </div>
                        <div style={{ height: '280px', width: '100%' }}>
                            <ResponsiveContainer>
                                <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={theme.primary} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={theme.primary} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.border} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: theme.textMuted}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: theme.textMuted}} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} cursor={{ stroke: theme.border, strokeWidth: 2, strokeDasharray: '5 5' }} />
                                    <Area type="monotone" dataKey="Present" stroke={theme.primary} strokeWidth={4} fillOpacity={1} fill="url(#colorPresent)" activeDot={{ r: 6, strokeWidth: 0 }}/>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Department Distribution (Donut Chart) */}
                    <div style={styles.chartCard}>
                        <div style={styles.chartHeader}>
                            <h3 style={styles.chartTitle}><Building2 size={18} color={theme.accent}/> Department Distribution</h3>
                        </div>
                        <div style={{ height: '280px', width: '100%', position: 'relative' }}>
                            {departmentChartData.length > 0 ? (
                                <>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={departmentChartData} cx="50%" cy="50%" innerRadius={75} outerRadius={105} paddingAngle={4} dataKey="value">
                                                {departmentChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={theme.chartPalette[index % theme.chartPalette.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: theme.textMuted, fontWeight: '600' }}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={styles.donutCenter}>
                                        <span style={styles.donutNumber}>{employees.length}</span>
                                        <span style={styles.donutText}>TOTAL</span>
                                    </div>
                                </>
                            ) : (
                                <div style={styles.emptyChart}>No department data available.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- MASTER EMPLOYEE DIRECTORY (Read-Only) --- */}
                <div style={styles.tableSection}>
                    
                    {/* Filters Toolbar */}
                    <div style={styles.tableToolbar}>
                        <h2 style={styles.tableMainTitle}>Global Workforce Directory</h2>
                        
                        <div style={styles.filterGroup}>
                            {/* Global Search */}
                            <div style={styles.searchContainer}>
                                <Search size={16} style={styles.searchIcon} />
                                <input 
                                    type="text" placeholder="Search ID, Name, Role..." 
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    style={styles.searchInput}
                                />
                            </div>

                            {/* Department Filter */}
                            <div style={styles.selectWrapper}>
                                <Filter size={14} style={styles.selectIcon} />
                                <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={styles.filterSelect}>
                                    {uniqueDepartments.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All Depts' : d}</option>)}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div style={styles.selectWrapper}>
                                <ShieldCheck size={14} style={styles.selectIcon} />
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="PROBATION">Probation</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Elite Grid Table */}
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>Employee Identity</th>
                                    <th style={styles.th}>Designation & Dept</th>
                                    <th style={styles.th}>Contact Meta</th>
                                    <th style={{...styles.th, textAlign: 'center'}}>System Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((emp) => {
                                        const empStatus = String(emp.status || emp.designationStatus || 'ACTIVE').toUpperCase();
                                        const isActive = empStatus === 'ACTIVE';
                                        
                                        return (
                                            <tr key={emp.id} style={styles.tr}>
                                                {/* Cell 1: Identity Profile */}
                                                <td style={styles.td}>
                                                    <div style={styles.identityCell}>
                                                        <div style={{...styles.avatar, backgroundColor: getAvatarColor(emp.fullName)}}>
                                                            {emp.fullName ? emp.fullName.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                        <div>
                                                            <p style={styles.empName}>{emp.fullName || 'Unmapped User'}</p>
                                                            <p style={styles.empId}><Fingerprint size={12}/> {emp.biometricId || `UID-${emp.id}`}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Cell 2: Role & Department */}
                                                <td style={styles.td}>
                                                    <div style={styles.roleCell}>
                                                        <p style={styles.roleText}>{emp.position || 'Unassigned Role'}</p>
                                                        <p style={styles.deptText}><Briefcase size={12}/> {emp.department || 'General Allocation'}</p>
                                                    </div>
                                                </td>

                                                {/* Cell 3: Contact Info */}
                                                <td style={styles.td}>
                                                    <div style={styles.contactCell}>
                                                        <p style={styles.contactText}><Mail size={12}/> {emp.email?.length > 25 ? emp.email.substring(0,25)+'...' : (emp.email || 'No email log')}</p>
                                                        <p style={styles.contactText}><Phone size={12}/> {emp.phone || 'No phone log'}</p>
                                                    </div>
                                                </td>

                                                {/* Cell 4: Status Label (Read Only, Center Aligned) */}
                                                <td style={{...styles.td, textAlign: 'center'}}>
                                                    <span style={{
                                                        ...styles.statusBadge,
                                                        backgroundColor: isActive ? theme.successLight : (empStatus === 'PROBATION' ? theme.warningLight : theme.dangerLight),
                                                        color: isActive ? theme.success : (empStatus === 'PROBATION' ? theme.warning : theme.danger),
                                                    }}>
                                                        ● {empStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={styles.emptyTable}>
                                            <UserX size={48} color={theme.border} style={{ marginBottom: '16px' }}/>
                                            <h3 style={{ margin: '0 0 4px 0', color: theme.textDark, fontSize: '18px' }}>No Match Found</h3>
                                            <p style={{ margin: 0, fontSize: '14px' }}>Adjust search queries or reset dropdown filters.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Elite Pagination Controller */}
                    {filteredEmployees.length > 0 && (
                        <div style={styles.paginationArea}>
                            <p style={styles.pageInfo}>
                                Showing <span style={styles.pageHighlight}>{(currentPage - 1) * itemsPerPage + 1}</span> to <span style={styles.pageHighlight}>{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of <span style={styles.pageHighlight}>{filteredEmployees.length}</span> datasets
                            </p>
                            <div style={styles.pageControls}>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}}
                                >
                                    <ChevronLeft size={16}/> Prev
                                </button>
                                <span style={styles.pageIndicator}>Page {currentPage} of {totalPages || 1}</span>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}}
                                >
                                    Next <ChevronRight size={16}/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Custom CSS Injections for Hover effects & Scrollbars */}
            <style>{`
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); } 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); } }
                .table-row-hover:hover { background-color: #F8FAFC !important; }
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
            `}</style>
        </DashboardLayout>
    );
}

// ============================================================================
// 💅 8. MASSIVE JSS STYLES (Keeps JSX Clean, Perfect Alignment)
// ============================================================================
const styles = {
    loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' },
    loadingText: { marginTop: '20px', color: theme.textDark, fontSize: '22px', fontWeight: '800' },
    loadingSubText: { marginTop: '8px', color: theme.textMuted, fontSize: '15px' },
    pageContainer: { padding: '30px', backgroundColor: theme.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    
    // Header
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
    pageTitle: { fontSize: '28px', fontWeight: '800', color: theme.textDark, margin: '0 0 6px 0', letterSpacing: '-0.5px' },
    pageSubtitle: { fontSize: '15px', color: theme.textMuted, margin: 0, fontWeight: '500' },
    liveIndicator: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}`, fontSize: '13px', fontWeight: '700', color: theme.primary, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    pulsingDot: { width: '8px', height: '8px', backgroundColor: theme.primary, borderRadius: '50%', animation: 'pulse 2s infinite' },

    // KPIs
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' },
    kpiCard: { backgroundColor: theme.card, borderRadius: '16px', padding: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', position: 'relative' },
    kpiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' },
    kpiTitle: { fontSize: '12px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px 0' },
    kpiValue: { fontSize: '32px', fontWeight: '800', color: theme.textDark, margin: '0 0 6px 0', lineHeight: '1' },
    kpiSubtext: { fontSize: '13px', color: theme.textMuted, margin: 0, fontWeight: '600' },
    kpiIconBox: { width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    // Charts
    chartsGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' },
    chartCard: { backgroundColor: theme.card, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', border: `1px solid ${theme.border}` },
    chartHeader: { marginBottom: '24px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '16px' },
    chartTitle: { fontSize: '16px', fontWeight: '800', color: theme.textDark, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
    donutCenter: { position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' },
    donutNumber: { display: 'block', fontSize: '32px', fontWeight: '800', color: theme.textDark, lineHeight: '1' },
    donutText: { fontSize: '10px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px' },
    emptyChart: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted, fontSize: '14px', fontWeight: '500' },

    // Table Container
    tableSection: { backgroundColor: theme.card, borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: `1px solid ${theme.border}`, overflow: 'hidden' },
    tableToolbar: { padding: '24px 30px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', backgroundColor: theme.card },
    tableMainTitle: { fontSize: '18px', fontWeight: '800', color: theme.textDark, margin: 0 },
    
    // Filter Area
    filterGroup: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    searchContainer: { position: 'relative', width: '280px' },
    searchIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted },
    searchInput: { width: '100%', padding: '12px 14px 12px 40px', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.background, fontSize: '13px', outline: 'none', fontWeight: '500', color: theme.textDark, transition: '0.2s' },
    selectWrapper: { position: 'relative' },
    selectIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, pointerEvents: 'none' },
    filterSelect: { padding: '12px 36px 12px 38px', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.background, fontSize: '13px', fontWeight: '600', color: theme.textDark, outline: 'none', cursor: 'pointer', appearance: 'none' },

    // Table Anatomy
    tableWrapper: { overflowX: 'auto', minHeight: '350px' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' },
    thRow: { backgroundColor: '#F8FAFC', borderBottom: `2px solid ${theme.border}` },
    th: { padding: '16px 30px', fontSize: '11px', fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' },
    tr: { borderBottom: `1px solid ${theme.border}` }, 
    td: { padding: '18px 30px', verticalAlign: 'middle' },
    emptyTable: { textAlign: 'center', padding: '80px 20px', color: theme.textMuted },

    // Table Cells Setup
    identityCell: { display: 'flex', alignItems: 'center', gap: '16px' },
    avatar: { width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: '#fff', boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.05)' },
    empName: { margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: theme.textDark, textTransform: 'capitalize' },
    empId: { margin: 0, fontSize: '12px', color: theme.textMuted, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
    
    roleCell: { display: 'flex', flexDirection: 'column', gap: '6px' },
    roleText: { margin: 0, fontSize: '14px', fontWeight: '700', color: theme.textDark },
    deptText: { margin: 0, fontSize: '12px', color: theme.textMuted, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' },

    contactCell: { display: 'flex', flexDirection: 'column', gap: '6px' },
    contactText: { margin: 0, fontSize: '13px', color: theme.textMuted, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' },

    statusBadge: { padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', display: 'inline-block', letterSpacing: '0.5px' },

    // Pagination Area
    paginationArea: { padding: '20px 30px', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
    pageInfo: { margin: 0, fontSize: '13px', color: theme.textMuted, fontWeight: '500' },
    pageHighlight: { color: theme.textDark, fontWeight: '700' },
    pageControls: { display: 'flex', alignItems: 'center', gap: '16px' },
    pageBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: theme.background, border: `1px solid ${theme.border}`, borderRadius: '10px', fontSize: '13px', fontWeight: '700', color: theme.textDark, transition: '0.2s' },
    pageIndicator: { fontSize: '13px', fontWeight: '700', color: theme.textMuted }
};