import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    Users, Briefcase, FileSpreadsheet, UploadCloud, Plus, 
    Search, Filter, CheckCircle, XCircle, Clock, FileText, 
    Award, ChevronLeft, ChevronRight, X, Loader2, DownloadCloud,
    TrendingUp, Mail, Phone, ExternalLink, Send
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const HRRecruitment = () => {
    // =========================================================================
    // 1. STATE MANAGEMENT
    // =========================================================================
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI Toggles & Filters
    const [activeTab, setActiveTab] = useState('DASHBOARD'); // DASHBOARD, CANDIDATES
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modals State
    const [jobModal, setJobModal] = useState({ isOpen: false, submitting: false });
    const [applyModal, setApplyModal] = useState({ isOpen: false, submitting: false });
    const [excelModal, setExcelModal] = useState({ isOpen: false, type: 'BULK_UPLOAD', file: null, submitting: false });

    // Forms State
    const [jobForm, setJobForm] = useState({
        title: '', department: '', experience: '', openings: 1, 
        category: 'FULL_TIME', description: '', status: 'OPEN'
    });

    const [applyForm, setApplyForm] = useState({
        candidateName: '', email: '', phone: '', jobRole: '', 
        resumeUrl: '', category: 'DIRECT', referredByEmployeeId: ''
    });

    // Theme Config (Elite ATS Palette)
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        cardWhite: '#FFFFFF', mainText: '#0F172A', secondaryText: '#64748B',
        success: '#10B981', successLight: '#ECFDF5',
        warning: '#F59E0B', warningLight: '#FFFBEB',
        danger: '#EF4444', dangerLight: '#FEF2F2', 
        purple: '#8B5CF6', purpleLight: '#F5F3FF',
        border: '#E2E8F0', inputBg: '#F1F5F9'
    };

    // =========================================================================
    // 2. API FETCHING LOGIC
    // =========================================================================
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/recruitment/view-dashboard');
            setCandidates(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Failed to load candidate metrics from server.");
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 3. EVENT HANDLERS & API CONTEXT BRIDGE
    // =========================================================================

const handleJobSubmit = async (e) => {
    e.preventDefault();
    setJobModal(prev => ({ ...prev, submitting: true }));
    try {
        const res = await api.post('/api/recruitment/post-job', jobForm);
        
        // 👇 FIX: Check if res exists, show the string message from backend, or a fallback success toast!
        if (res) {
            toast.success(typeof res.data === 'string' ? res.data : "Job Requisition Broadcasted Successfully! ");
        }
        
        setJobModal({ isOpen: false, submitting: false });
        setJobForm({ title: '', department: '', experience: '', openings: 1, category: 'FULL_TIME', description: '', status: 'OPEN' });
    } catch (err) {
        console.error("Job Post Error: ", err);
        // 👇 FIX: Improved error fallback so you can see exactly what went wrong if the server fails
        const errorMsg = err.response?.data?.message || err.response?.data || "Failed to broadcast job.";
        toast.error(errorMsg);
        setJobModal(prev => ({ ...prev, submitting: false }));
    }
};
    // --- MANUAL CANDIDATE APPLY ---
    const handleApplySubmit = async (e) => {
        e.preventDefault();
        setApplyModal(prev => ({ ...prev, submitting: true }));
        try {
            await api.post('/api/recruitment/apply', applyForm);
            toast.success("Candidate Profile Injected to Pipeline!");
            setApplyModal({ isOpen: false, submitting: false });
            setApplyForm({ candidateName: '', email: '', phone: '', jobRole: '', resumeUrl: '', category: 'DIRECT', referredByEmployeeId: '' });
            fetchDashboardData();
        } catch (err) {
            toast.error(err.response?.data || "Failed to inject candidate.");
            setApplyModal(prev => ({ ...prev, submitting: false }));
        }
    };

    // --- EXCEL UPLOAD ACTIONS (Bulk Upload / Publish Results) ---
    const handleExcelUpload = async () => {
        if (!excelModal.file) {
            toast.error("Please attach an Excel/CSV datastream first.");
            return;
        }

        const formData = new FormData();
        formData.append('file', excelModal.file);

        setExcelModal(prev => ({ ...prev, submitting: true }));
        
        try {
            const endpoint = excelModal.type === 'BULK_UPLOAD' 
                ? '/api/recruitment/bulk-upload' 
                : '/api/recruitment/publish-results';

            await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success(excelModal.type === 'BULK_UPLOAD' ? "Bulk Candidates Syndicated!" : "Evaluation Results Published!");
            setExcelModal({ isOpen: false, type: 'BULK_UPLOAD', file: null, submitting: false });
            fetchDashboardData();
       } catch (err) {
        console.error("Upload Error: ", err);
        // 👇 FIX: Safely reads raw server string errors or JSON message parameters without failing
        const errorMsg = err.response?.data?.message || err.response?.data || "Datastream ingestion failed.";
        toast.error(errorMsg);
        setExcelModal(prev => ({ ...prev, submitting: false }));
    }
    };

    // =========================================================================
    // 4. DATA PROCESSING & ANALYTICS
    // =========================================================================
    const processedCandidates = useMemo(() => {
        let filtered = candidates;
        
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(c => 
                (c.candidateName && c.candidateName.toLowerCase().includes(q)) ||
                (c.email && c.email.toLowerCase().includes(q)) ||
                (c.jobRole && c.jobRole.toLowerCase().includes(q))
            );
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(c => c.status && c.status.toUpperCase() === statusFilter);
        }
        
        // Sort descending by ID (newest first)
        return filtered.sort((a, b) => b.id - a.id);
    }, [candidates, searchTerm, statusFilter]);

    const totalPages = Math.ceil(processedCandidates.length / itemsPerPage);
    const currentTableData = processedCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    // Metrics Calculations
    const metrics = {
        total: candidates.length,
        selected: candidates.filter(c => c.status === 'SELECTED' || c.status === 'HIRED').length,
        rejected: candidates.filter(c => c.status === 'REJECTED').length,
        pending: candidates.filter(c => c.status === 'APPLIED' || c.status === 'PENDING').length,
        interview: candidates.filter(c => c.status === 'INTERVIEW').length,
    };

    // Chart Data Generators
    const roleDistribution = useMemo(() => {
        const counts = {};
        candidates.forEach(c => {
            const role = c.jobRole || 'Other';
            counts[role] = (counts[role] || 0) + 1;
        });
        return Object.keys(counts).map(key => ({ name: key.substring(0,15), Applicants: counts[key] })).slice(0, 6);
    }, [candidates]);

    const pieData = [
        { name: 'Selected', value: metrics.selected, color: colors.success },
        { name: 'Interview', value: metrics.interview, color: colors.purple },
        { name: 'Applied', value: metrics.pending, color: colors.primaryBlue },
        { name: 'Rejected', value: metrics.rejected, color: colors.danger },
    ].filter(d => d.value > 0);

    const getStatusBadge = (status) => {
        const s = status ? status.toUpperCase() : 'APPLIED';
        if (s === 'SELECTED' || s === 'HIRED') return <span className="status-badge" style={{ background: colors.successLight, color: colors.success }}><CheckCircle size={12}/> {s}</span>;
        if (s === 'REJECTED') return <span className="status-badge" style={{ background: colors.dangerLight, color: colors.danger }}><XCircle size={12}/> {s}</span>;
        if (s === 'INTERVIEW') return <span className="status-badge" style={{ background: colors.purpleLight, color: colors.purple }}><Users size={12}/> {s}</span>;
        return <span className="status-badge" style={{ background: colors.lightBlue, color: colors.primaryBlue }}><Clock size={12}/> {s}</span>;
    };

    // =========================================================================
    // 5. RENDER UI
    // =========================================================================
    return (
        <DashboardLayout role="HR" title="Recruitment ATS">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
                
                {/* --------------------------------------------------------- */}
                {/* HEADER & ACTION CONTROLS                                  */}
                {/* --------------------------------------------------------- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '26px', fontWeight: '800', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.5px' }}>
                            <Briefcase color={colors.primaryBlue} size={28} /> Applicant Tracking System
                        </h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '15px' }}>
                            Manage job postings, applicant pipelines, and evaluate evaluation scores.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#fff', padding: '12px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <button onClick={() => setApplyModal({ isOpen: true, submitting: false })} className="action-button primary">
                            <Plus size={16} /> Manual Inject
                        </button>
                        <div style={{ width: '1px', height: '24px', background: colors.border }}></div>
                        <button onClick={() => setJobModal({ isOpen: true, submitting: false })} className="action-button outline">
                            <Briefcase size={16} /> Post Job
                        </button>
                        <button onClick={() => setExcelModal({ isOpen: true, type: 'BULK_UPLOAD', file: null, submitting: false })} className="action-button secondary">
                            <UploadCloud size={16} /> Bulk Init
                        </button>
                        <button onClick={() => setExcelModal({ isOpen: true, type: 'PUBLISH_RESULTS', file: null, submitting: false })} className="action-button purple">
                            <Award size={16} /> Publish Scores
                        </button>
                    </div>
                </div>

                {/* --------------------------------------------------------- */}
                {/* DYNAMIC TAB NAVIGATION                                    */}
                {/* --------------------------------------------------------- */}
                <div style={{ display: 'flex', gap: '24px', borderBottom: `2px solid ${colors.border}`, marginBottom: '24px' }}>
                    <button onClick={() => setActiveTab('DASHBOARD')} style={{ background: 'none', border: 'none', padding: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: activeTab === 'DASHBOARD' ? colors.primaryBlue : colors.secondaryText, borderBottom: activeTab === 'DASHBOARD' ? `3px solid ${colors.primaryBlue}` : '3px solid transparent', cursor: 'pointer', transition: '0.2s', display:'flex', gap:'8px', alignItems:'center' }}>
                        <TrendingUp size={18}/> Metrics Overview
                    </button>
                    <button onClick={() => setActiveTab('CANDIDATES')} style={{ background: 'none', border: 'none', padding: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: activeTab === 'CANDIDATES' ? colors.primaryBlue : colors.secondaryText, borderBottom: activeTab === 'CANDIDATES' ? `3px solid ${colors.primaryBlue}` : '3px solid transparent', cursor: 'pointer', transition: '0.2s', display:'flex', gap:'8px', alignItems:'center' }}>
                        <Users size={18}/> Pipeline Directory
                    </button>
                </div>

                {/* ========================================================= */}
                {/* VIEW 1: DASHBOARD ANALYTICS                               */}
                {/* ========================================================= */}
                {activeTab === 'DASHBOARD' && (
                    <div className="fade-in">
                        {/* Metrics Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                            <div className="metric-card">
                                <div className="metric-header">
                                    <p>Total Pipeline</p>
                                    <div className="icon-box" style={{ background: colors.lightBlue, color: colors.primaryBlue }}><Users size={18}/></div>
                                </div>
                                <h3>{metrics.total}</h3>
                                <p className="metric-trend" style={{ color: colors.secondaryText }}>Asset Profiles Logged</p>
                            </div>
                            <div className="metric-card">
                                <div className="metric-header">
                                    <p>Selected / Hired</p>
                                    <div className="icon-box" style={{ background: colors.successLight, color: colors.success }}><Award size={18}/></div>
                                </div>
                                <h3>{metrics.selected}</h3>
                                <p className="metric-trend" style={{ color: colors.success }}>Cleared Evaluations</p>
                            </div>
                            <div className="metric-card">
                                <div className="metric-header">
                                    <p>In Interview Phase</p>
                                    <div className="icon-box" style={{ background: colors.purpleLight, color: colors.purple }}><Clock size={18}/></div>
                                </div>
                                <h3>{metrics.interview}</h3>
                                <p className="metric-trend" style={{ color: colors.purple }}>Active Processing</p>
                            </div>
                            <div className="metric-card">
                                <div className="metric-header">
                                    <p>Rejected Pools</p>
                                    <div className="icon-box" style={{ background: colors.dangerLight, color: colors.danger }}><XCircle size={18}/></div>
                                </div>
                                <h3>{metrics.rejected}</h3>
                                <p className="metric-trend" style={{ color: colors.danger }}>Did Not Qualify</p>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* Bar Chart */}
                            <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.mainText, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             
<Briefcase size={18} color={colors.primaryBlue}/> Demands by Job Role
                                </h3>
                                {roleDistribution.length > 0 ? (
                                    <div style={{ height: '300px', width: '100%' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={roleDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: colors.secondaryText }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: colors.secondaryText }} />
                                                <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                <Bar dataKey="Applicants" fill={colors.primaryBlue} radius={[6, 6, 0, 0]} barSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="empty-chart">No pipeline data mapped.</div>
                                )}
                            </div>

                            {/* Pie Chart */}
                            <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.mainText, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Filter size={18} color={colors.primaryBlue}/> Conversion Funnel
                                </h3>
                                {pieData.length > 0 ? (
                                    <div style={{ height: '280px', width: '100%', position: 'relative' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                            <span style={{ display: 'block', fontSize: '26px', fontWeight: '800', color: colors.mainText }}>{metrics.total}</span>
                                            <span style={{ fontSize: '11px', color: colors.secondaryText, textTransform: 'uppercase', fontWeight: '700' }}>Candidates</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="empty-chart">No conversion data.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* VIEW 2: CANDIDATE PIPELINE DIRECTORY                      */}
                {/* ========================================================= */}
                {activeTab === 'CANDIDATES' && (
                    <div className="fade-in">
                        <div style={{ background: '#fff', padding: '20px', borderRadius: '16px 16px 0 0', border: `1px solid ${colors.border}`, borderBottom: 'none', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.secondaryText }} />
                                <input 
                                    type="text" placeholder="Query candidate name, email, or role..." 
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                                <option value="ALL">Global Statuses</option>
                                <option value="APPLIED">Applied (Fresh)</option>
                                <option value="INTERVIEW">Interview Phase</option>
                                <option value="SELECTED">Selected / Hired</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>

                        <div style={{ background: colors.cardWhite, borderRadius: '0 0 16px 16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="elite-table">
                                    <thead>
                                        <tr>
                                            <th>Applicant Context</th>
                                            <th>Applied Target Role</th>
                                            <th>Contact Link</th>
                                            <th style={{ textAlign: 'center' }}>Eval. Score</th>
                                            <th>Resume / Source</th>
                                            <th>Pipeline Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="6" className="empty-state"><Loader2 size={32} className="spin" color={colors.primaryBlue} /> Syncing Data...</td></tr>
                                        ) : currentTableData.length > 0 ? (
                                            currentTableData.map((c) => (
                                                <tr key={c.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div className="avatar" style={{ background: colors.lightBlue, color: colors.primaryBlue }}>
                                                                {c.candidateName ? c.candidateName.charAt(0).toUpperCase() : 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="primary-text">{c.candidateName}</p>
                                                                <p className="sub-text">ID: APP-0{c.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', color: colors.mainText }}>
                                                            <Briefcase size={14} color={colors.secondaryText} /> {c.jobRole || 'General Pool'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p className="contact-text"><Mail size={12}/> {c.email}</p>
                                                        <p className="contact-text" style={{ marginTop: '4px' }}><Phone size={12}/> {c.phone}</p>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{ fontSize: '15px', fontWeight: '800', color: c.marks >= 70 ? colors.success : (c.marks > 0 ? colors.warning : colors.secondaryText) }}>
                                                            {c.marks ? `${c.marks}%` : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {c.resumeUrl ? (
                                                            <a href={c.resumeUrl} target="_blank" rel="noopener noreferrer" className="link-badge">
                                                                <FileText size={12}/> View CV <ExternalLink size={10}/>
                                                            </a>
                                                        ) : (
                                                            <span className="link-badge-disabled">No CV Attached</span>
                                                        )}
                                                        {c.referredByEmployeeId && (
                                                            <p style={{ margin: '6px 0 0', fontSize: '11px', color: colors.purple, fontWeight: '700' }}>Ref: {c.referredByEmployeeId}</p>
                                                        )}
                                                    </td>
                                                    <td>{getStatusBadge(c.status)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="6" className="empty-state"><Users size={32} color={colors.secondaryText} style={{ marginBottom: '10px' }}/> No Candidate Records Mapped.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {!loading && processedCandidates.length > 0 && (
                                <div className="pagination-bar">
                                    <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedCandidates.length)} of {processedCandidates.length} profiles</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="page-btn"><ChevronLeft size={16}/></button>
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="page-btn"><ChevronRight size={16}/></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* ========================================================= */}
                {/* MODALS SECTION                                            */}
                {/* ========================================================= */}

                {/* 1. POST JOB MODAL */}
                {jobModal.isOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3><Briefcase size={20} color={colors.primaryBlue}/> Broadcast Requisition</h3>
                                <button onClick={() => setJobModal({ isOpen: false, submitting: false })} className="close-btn"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleJobSubmit}>
                                <div className="grid-2">
                                    <div className="input-group">
                                        <label>Job Title</label>
                                        <input type="text" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} required placeholder="e.g. Senior Java Dev" />
                                    </div>
                                    <div className="input-group">
                                        <label>Department</label>
                                        <input type="text" value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} required placeholder="e.g. Engineering" />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="input-group">
                                        <label>Experience Required</label>
                                        <input type="text" value={jobForm.experience} onChange={e => setJobForm({...jobForm, experience: e.target.value})} required placeholder="e.g. 3-5 Years" />
                                    </div>
                                    <div className="input-group">
                                        <label>No. of Openings</label>
                                        <input type="number" min="1" value={jobForm.openings} onChange={e => setJobForm({...jobForm, openings: parseInt(e.target.value)})} required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Job Description</label>
                                    <textarea value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} required placeholder="Enter key responsibilities..."></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setJobModal({ isOpen: false, submitting: false })}>Cancel</button>
                                    <button type="submit" className="btn-submit" disabled={jobModal.submitting}>
                                        {jobModal.submitting ? <Loader2 size={16} className="spin"/> : <><Send size={16}/> Publish Listing</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 2. MANUAL INJECT APPLY MODAL */}
                {applyModal.isOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3><Plus size={20} color={colors.primaryBlue}/> Manual Pipeline Inject</h3>
                                <button onClick={() => setApplyModal({ isOpen: false, submitting: false })} className="close-btn"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleApplySubmit}>
                                <div className="grid-2">
                                    <div className="input-group">
                                        <label>Candidate Legal Name</label>
                                        <input type="text" value={applyForm.candidateName} onChange={e => setApplyForm({...applyForm, candidateName: e.target.value})} required placeholder="John Doe" />
                                    </div>
                                    <div className="input-group">
                                        <label>Target Role</label>
                                        <input type="text" value={applyForm.jobRole} onChange={e => setApplyForm({...applyForm, jobRole: e.target.value})} required placeholder="e.g. Frontend Dev" />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="input-group">
                                        <label>Email ID</label>
                                        <input type="email" value={applyForm.email} onChange={e => setApplyForm({...applyForm, email: e.target.value})} required placeholder="john@example.com" />
                                    </div>
                                    <div className="input-group">
                                        <label>Mobile Contact</label>
                                        <input type="text" value={applyForm.phone} onChange={e => setApplyForm({...applyForm, phone: e.target.value})} required placeholder="9876543210" pattern="[0-9]{10}"/>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Resume Asset URL</label>
                                    <input type="url" value={applyForm.resumeUrl} onChange={e => setApplyForm({...applyForm, resumeUrl: e.target.value})} placeholder="https://drive.google.com/file/..." />
                                </div>
                                <div className="grid-2">
                                    <div className="input-group">
                                        <label>Sourcing Category</label>
                                        <select value={applyForm.category} onChange={e => setApplyForm({...applyForm, category: e.target.value})}>
                                            <option value="DIRECT">Direct Apply</option>
                                            <option value="REFERRAL">Internal Referral</option>
                                            <option value="AGENCY">Agency Sourced</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Referral ID (If applicable)</label>
                                        <input type="text" value={applyForm.referredByEmployeeId} onChange={e => setApplyForm({...applyForm, referredByEmployeeId: e.target.value})} disabled={applyForm.category !== 'REFERRAL'} placeholder="e.g. DVN-037" />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setApplyModal({ isOpen: false, submitting: false })}>Cancel</button>
                                    <button type="submit" className="btn-submit" disabled={applyModal.submitting}>
                                        {applyModal.submitting ? <Loader2 size={16} className="spin"/> : 'Inject Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 3. EXCEL UPLOAD MODAL (Bulk Upload & Publish Results share this) */}
                {excelModal.isOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '450px' }}>
                            <div className="modal-header">
                                <h3>
                                    {excelModal.type === 'BULK_UPLOAD' ? <><UploadCloud size={20} color={colors.primaryBlue}/> Bulk Init Datastream</> : <><Award size={20} color={colors.purple}/> Publish Evaluation Scores</>}
                                </h3>
                                <button onClick={() => setExcelModal({ isOpen: false, type: 'BULK_UPLOAD', file: null, submitting: false })} className="close-btn"><X size={20}/></button>
                            </div>
                            <p style={{ fontSize: '13px', color: colors.secondaryText, marginBottom: '20px', lineHeight: '1.5' }}>
                                {excelModal.type === 'BULK_UPLOAD' 
                                    ? "Attach Excel/CSV container to inject multiple candidate entities into the core pipeline simultaneously."
                                    : "Attach Excel/CSV containing Evaluation Marks. System will automatically map scores and update Status (Selected/Rejected)."}
                            </p>
                            
                            <div className="drag-drop-zone" style={{ border: `2px dashed ${excelModal.file ? colors.success : colors.primaryBlue}`, background: excelModal.file ? colors.successLight : colors.lightBlue }}>
                                <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => setExcelModal({...excelModal, file: e.target.files[0]})} disabled={excelModal.submitting} />
                                {excelModal.file ? (
                                    <><FileSpreadsheet size={40} color={colors.success} style={{ margin: '0 auto 10px' }} /><p style={{ margin: 0, fontWeight: '700', color: colors.success }}>{excelModal.file.name}</p></>
                                ) : (
                                    <><DownloadCloud size={40} color={colors.primaryBlue} style={{ margin: '0 auto 10px' }} /><p style={{ margin: 0, fontWeight: '700', color: colors.primaryBlue }}>Click or Drag File Here</p></>
                                )}
                            </div>

                            <div className="modal-actions" style={{ marginTop: '24px' }}>
                                <button type="button" className="btn-cancel" onClick={() => setExcelModal({ isOpen: false, type: 'BULK_UPLOAD', file: null, submitting: false })} disabled={excelModal.submitting}>Cancel</button>
                                <button onClick={handleExcelUpload} className="btn-submit" disabled={!excelModal.file || excelModal.submitting} style={{ background: excelModal.type === 'BULK_UPLOAD' ? colors.primaryBlue : colors.purple }}>
                                    {excelModal.submitting ? <Loader2 size={16} className="spin"/> : 'Execute Ingestion'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* ========================================================= */}
            {/* ELITE CUSTOM CSS INJECTION                                */}
            {/* ========================================================= */}
            <style>
                {`
                    /* Layout Utilities */
                    .fade-in { animation: fadeIn 0.3s ease-out; }
                    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }

                    /* Action Buttons */
                    .action-button { display: flex; alignItems: center; gap: 8px; padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; border: none; }
                    .action-button.primary { background: ${colors.primaryBlue}; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
                    .action-button.outline { background: white; color: ${colors.mainText}; border: 1px solid ${colors.border}; }
                    .action-button.secondary { background: ${colors.lightBlue}; color: ${colors.primaryBlue}; }
                    .action-button.purple { background: ${colors.purpleLight}; color: ${colors.purple}; }
                    .action-button:hover { transform: translateY(-2px); opacity: 0.9; }

                    /* Metric Cards */
                    .metric-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid ${colors.border}; transition: 0.3s; }
                    .metric-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.04); }
                    .metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                    .metric-header p { margin: 0; font-size: 13px; color: ${colors.secondaryText}; font-weight: 700; text-transform: uppercase; }
                    .icon-box { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                    .metric-card h3 { margin: 0; font-size: 32px; font-weight: 800; color: ${colors.mainText}; letter-spacing: -1px; }
                    .metric-trend { margin: 6px 0 0; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px; }

                    /* Inputs & Tables */
                    .search-input { width: 100%; padding: 12px 14px 12px 40px; border-radius: 10px; border: 1px solid ${colors.border}; outline: none; font-size: 14px; box-sizing: border-box; background: ${colors.inputBg}; color: ${colors.mainText}; transition: 0.2s; }
                    .search-input:focus { border-color: ${colors.primaryBlue}; background: white; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                    .filter-select { padding: 12px 14px; border-radius: 10px; border: 1px solid ${colors.border}; outline: none; font-size: 14px; background: ${colors.inputBg}; color: ${colors.mainText}; cursor: pointer; font-weight: 600; }
                    
                    .elite-table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }
                    .elite-table th { padding: 16px 24px; font-size: 12px; font-weight: 800; color: ${colors.secondaryText}; text-transform: uppercase; background: ${colors.background}; border-bottom: 2px solid ${colors.border}; }
                    .elite-table td { padding: 16px 24px; border-bottom: 1px solid ${colors.border}; }
                    .elite-table tr:hover { background-color: #F8FAFC; }
                    .avatar { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; }
                    .primary-text { margin: 0; font-weight: 700; color: ${colors.mainText}; font-size: 14px; text-transform: capitalize; }
                    .sub-text { margin: 2px 0 0; font-size: 11px; color: ${colors.secondaryText}; font-weight: 600; }
                    .contact-text { margin: 0; font-size: 12px; color: ${colors.mainText}; font-weight: 500; display: flex; align-items: center; gap: 6px; }
                    
                    /* Badges */
                    .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; }
                    .link-badge { display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; background: ${colors.lightBlue}; color: ${colors.primaryBlue}; text-decoration: none; transition: 0.2s; border: 1px solid #BFDBFE; }
                    .link-badge:hover { background: ${colors.primaryBlue}; color: white; }
                    .link-badge-disabled { font-size: 11px; color: ${colors.secondaryText}; font-style: italic; }

                    /* Modals */
                    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; animation: fadeIn 0.2s ease-out; }
                    .modal-content { background: white; width: 100%; max-width: 600px; border-radius: 20px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); animation: slideUp 0.3s ease-out; max-height: 90vh; overflow-y: auto; }
                    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                    .modal-header h3 { margin: 0; font-size: 20px; font-weight: 800; color: ${colors.mainText}; display: flex; align-items: center; gap: 8px; }
                    .close-btn { background: none; border: none; cursor: pointer; color: ${colors.secondaryText}; padding: 4px; border-radius: 50%; transition: 0.2s; }
                    .close-btn:hover { background: ${colors.dangerLight}; color: ${colors.danger}; }
                    
                    .input-group { margin-bottom: 16px; }
                    .input-group label { display: block; font-size: 12px; font-weight: 700; color: ${colors.mainText}; margin-bottom: 6px; }
                    .input-group input, .input-group select, .input-group textarea { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid ${colors.border}; outline: none; box-sizing: border-box; font-size: 14px; background: ${colors.inputBg}; transition: 0.2s; color: ${colors.mainText}; }
                    .input-group input:focus, .input-group select:focus, .input-group textarea:focus { border-color: ${colors.primaryBlue}; background: white; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                    .input-group textarea { height: 80px; resize: vertical; }
                    .input-group select:disabled, .input-group input:disabled { opacity: 0.6; cursor: not-allowed; }

                    .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
                    .btn-cancel { flex: 1; padding: 14px; background: ${colors.inputBg}; color: ${colors.secondaryText}; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                    .btn-cancel:hover { background: ${colors.border}; }
                    .btn-submit { flex: 1; padding: 14px; background: ${colors.primaryBlue}; color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
                    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

                    /* Drag Drop Zone */
                    .drag-drop-zone { border-radius: 16px; padding: 40px 20px; text-align: center; cursor: pointer; position: relative; transition: 0.3s; }
                    .drag-drop-zone input[type="file"] { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

                    /* Utilities */
                    .empty-chart { height: 280px; display: flex; align-items: center; justify-content: center; color: ${colors.secondaryText}; border: 1px dashed ${colors.border}; border-radius: 12px; font-size: 13px; font-weight: 600; }
                    .empty-state { padding: 60px !important; text-align: center; color: ${colors.secondaryText}; font-size: 15px; font-weight: 600; }
                    .pagination-bar { padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: ${colors.secondaryText}; font-weight: 500; }
                    .page-btn { padding: 8px 12px; border: 1px solid ${colors.border}; border-radius: 8px; background: white; cursor: pointer; color: ${colors.mainText}; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
                    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; background: ${colors.inputBg}; }
                    
                    @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                `}
            </style>
        </DashboardLayout>
    );
};

export default HRRecruitment;