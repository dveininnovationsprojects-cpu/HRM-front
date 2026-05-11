import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { 
    Briefcase, UploadCloud, FileSpreadsheet, Trash2, 
    ShieldAlert, Loader2, Search, Filter, Eye, X, 
    CheckCircle, Clock, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerProjects = () => {
    // ==========================================
    // 1. STATE MANAGEMENT
    // ==========================================
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Upload States
    const [file, setFile] = useState(null);
    const [tlBiometricId, setTlBiometricId] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Filter & Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Modal State
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Theme Config
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        mainText: '#0F172A', secondaryText: '#64748B',
        successBg: '#DCFCE7', successText: '#16A34A',
        dangerBg: '#FEE2E2', dangerText: '#DC2626',
        warningBg: '#FEF9C3', warningText: '#CA8A04',
        border: '#E2E8F0', cardWhite: '#FFFFFF', inputBg: '#F1F5F9'
    };

    // ==========================================
    // 2. DATA INITIALIZATION
    // ==========================================
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const managerId = localStorage.getItem('userId');
        
        let projectsData = [];
        let employeesData = [];

        // Safe API Calls with Fallbacks
        try {
            const projRes = await api.get('/api/manager/projects', { params: { managerId } });
            projectsData = projRes.data || [];
        } catch (error) {
            console.warn("Projects API restricted. Showing empty state.");
        }

        try {
            const empRes = await api.get('/api/employees');
            employeesData = empRes.data || [];
        } catch (error) {
            console.warn("Employees API restricted. Showing empty state.");
        }

        setProjects(projectsData);
        setEmployees(employeesData);
        setLoading(false);
    };

    // ==========================================
    // 3. DRAG & DROP LOGIC
    // ==========================================
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv')) {
                setFile(droppedFile);
            } else {
                toast.error("Only .xlsx or .csv files are allowed!");
            }
        }
    };

    // ==========================================
    // 4. PROJECT UPLOAD LOGIC
    // ==========================================
    const handleProjectUpload = async (e) => {
        e.preventDefault();
        if (!file || !tlBiometricId) {
            toast.error("Please provide both Excel file and select a Team Lead.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tlBiometricId', tlBiometricId);

        const toastId = toast.loading('Parsing Excel & Initializing Project...');
        try {
            await api.post('/api/manager/projects/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Project Architecture Deployed Successfully!", { id: toastId });
            
            // Reset state
            setFile(null);
            setTlBiometricId('');
            if(document.getElementById('project-upload-input')) {
                document.getElementById('project-upload-input').value = "";
            }
            fetchData();
        } catch (error) {
            const errMsg = error.response?.data?.message || error.response?.data || "Deployment failed. Check Excel format.";
            toast.error(typeof errMsg === 'string' ? errMsg : "System Error", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    // ==========================================
    // 5. PROJECT DELETION LOGIC
    // ==========================================
    const handleDeleteProject = async (id, e) => {
        e.stopPropagation(); 
        if (!window.confirm("CRITICAL WARNING: This will permanently delete the project and all its modules. Proceed?")) return;
        
        try {
            await api.delete(`/api/manager/projects/${id}`);
            toast.success("Project architecture dismantled.");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete project. Check dependencies.");
        }
    };

    // ==========================================
    // 6. FILTERING & SEARCH LOGIC
    // ==========================================
    const teamLeads = useMemo(() => {
        if (!employees || employees.length === 0) return [];
        
        const filteredLeads = employees.filter(e => {
            const jobTitle = (e.position || '').toUpperCase();
            return jobTitle.includes('TL') || 
                   jobTitle.includes('LEAD') || 
                   jobTitle.includes('MANAGER') ||
                   e.designationStatus === 'TRAINER';
        });

        // Fallback: If no one has "TL" in their position, show ALL employees so dropdown isn't empty!
        return filteredLeads.length > 0 ? filteredLeads : employees;
    }, [employees]);

    const filteredProjects = useMemo(() => {
        return projects.filter(proj => {
            const matchesSearch = (proj.projectName || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || proj.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [projects, searchTerm, statusFilter]);

    // ==========================================
    // 7. RENDER COMPONENT
    // ==========================================
    return (
        <DashboardLayout role="MANAGER" title="Project Architecture">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                
                {/* PAGE HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.mainText, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                            Project Operations Center
                        </h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '15px' }}>
                            Deploy new architectures via Excel and monitor existing project health.
                        </p>
                    </div>
                </div>

                {/* ========================================== */}
                {/* ADVANCED DEPLOYMENT ZONE                   */}
                {/* ========================================== */}
                <div style={{ 
                    background: colors.cardWhite, padding: '32px', marginBottom: '32px', borderRadius: '24px', 
                    border: `1px solid ${colors.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.02)', display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', alignItems: 'center'
                }}>
                    {/* Left Side: Information */}
                    <div>
                        <div style={{ background: colors.lightBlue, padding: '14px', borderRadius: '14px', display: 'inline-flex', color: colors.primaryBlue, marginBottom: '16px' }}>
                            <UploadCloud size={28} />
                        </div>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '22px', color: colors.mainText, fontWeight: '800' }}>
                            Initialize Architecture
                        </h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: colors.secondaryText, lineHeight: '1.6', fontWeight: '500' }}>
                            Securely deploy new project requirements via Excel or CSV. Assign a Lead Architect to initiate module tracking immediately.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', background: colors.inputBg, padding: '8px 14px', borderRadius: '20px', fontWeight: '700', color: colors.secondaryText }}>Format: .xlsx, .csv</span>
                            <span style={{ fontSize: '12px', background: colors.successBg, padding: '8px 14px', borderRadius: '20px', fontWeight: '700', color: colors.successText }}>Auto-Parsing Engine</span>
                        </div>
                    </div>

                    {/* Right Side: Interactive Form */}
                    <form 
                        onSubmit={handleProjectUpload} 
                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                        style={{ 
                            background: dragActive ? colors.lightBlue : colors.inputBg, 
                            padding: '24px', borderRadius: '20px', 
                            border: `2px dashed ${dragActive ? colors.primaryBlue : colors.border}`, 
                            display: 'flex', flexDirection: 'column', gap: '16px', transition: '0.2s' 
                        }}
                    >
                        {/* TL Selection */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Assign Lead Architect (TL) *</label>
                            <select 
                                required 
                                value={tlBiometricId} 
                                onChange={(e) => setTlBiometricId(e.target.value)}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, outline: 'none', background: '#FFFFFF', fontSize: '14px', color: colors.mainText, cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}
                            >
                                <option value="" disabled>-- Select Authorized Team Lead --</option>
                                {teamLeads.map(tl => (
                                    <option key={tl.id} value={tl.biometricId}>{tl.fullName} - {tl.position || 'Employee'} (ID: {tl.biometricId})</option>
                                ))}
                            </select>
                            {teamLeads.length === employees.length && employees.length > 0 && (
                                <p style={{ margin: '6px 0 0', fontSize: '11px', color: colors.warningText, fontWeight: '600' }}>* Showing all employees as no specific TLs were found.</p>
                            )}
                        </div>

                        {/* File Selection Row */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Requirement File *</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FFFFFF', padding: '8px', borderRadius: '14px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                                <input 
                                    id="project-upload-input" type="file" accept=".xlsx, .csv"
                                    onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} 
                                />
                                
                                <label 
                                    htmlFor="project-upload-input" 
                                    style={{ background: colors.lightBlue, border: `1px solid ${colors.border}`, padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: colors.primaryBlue, display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s', whiteSpace: 'nowrap' }}
                                >
                                    <FileSpreadsheet size={16} /> 
                                    {file ? 'Change File' : 'Choose File'}
                                </label>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                                    <span style={{ fontSize: '13px', color: file ? colors.successText : colors.secondaryText, fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {file ? file.name : 'No file selected / Drop here'}
                                    </span>
                                    {file && (
                                        <button type="button" onClick={() => setFile(null)} style={{ background: colors.dangerBg, border: 'none', color: colors.dangerText, cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove file">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={isUploading || !file || !tlBiometricId}
                            style={{ 
                                width: '100%', background: (isUploading || !file || !tlBiometricId) ? '#94A3B8' : colors.primaryBlue, color: '#fff', 
                                padding: '14px 24px', border: 'none', borderRadius: '12px', fontWeight: '800', 
                                cursor: (isUploading || !file || !tlBiometricId) ? 'not-allowed' : 'pointer', transition: '0.3s', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px',
                                boxShadow: (isUploading || !file || !tlBiometricId) ? 'none' : '0 6px 20px rgba(37, 99, 235, 0.3)',
                                marginTop: '8px'
                            }}
                        >
                            {isUploading ? <Loader2 size={18} className="spin" /> : <UploadCloud size={18} />}
                            {isUploading ? 'Deploying Architecture...' : 'Deploy Project'}
                        </button>
                    </form>
                </div>

                {/* ========================================== */}
                {/* PROJECT INVENTORY LIST                     */}
                {/* ========================================== */}
                <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: colors.mainText, fontSize: '18px', fontWeight: '800' }}>
                            <Briefcase size={20} color={colors.primaryBlue} /> Active Projects Inventory
                        </h3>
                        
                        {/* Search & Filters */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} color={colors.secondaryText} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input 
                                    type="text" placeholder="Search projects..." 
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ padding: '10px 10px 10px 36px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', fontSize: '13px', width: '200px', fontWeight: '500' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', background: colors.inputBg, padding: '2px 10px', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                                <Filter size={14} color={colors.secondaryText} style={{ marginRight: '6px' }} />
                                <select 
                                    value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: '700', color: colors.mainText, cursor: 'pointer' }}
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left', minWidth: '900px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project ID & Name</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timeline</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Est. Workload</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Status</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '60px', textAlign: 'center' }}>
                                            <Loader2 size={36} className="spin" color={colors.primaryBlue} style={{ margin: '0 auto 16px' }} />
                                            <p style={{ color: colors.secondaryText, fontWeight: '600' }}>Syncing architecture from database...</p>
                                        </td>
                                    </tr>
                                ) : filteredProjects.length > 0 ? filteredProjects.map(proj => {
                                    // Status styling logic
                                    let statusBg = colors.lightBlue;
                                    let statusCol = colors.primaryBlue;
                                    if (proj.status === 'COMPLETED') { statusBg = colors.successBg; statusCol = colors.successText; }
                                    if (proj.status === 'PENDING') { statusBg = colors.warningBg; statusCol = colors.warningText; }

                                    return (
                                        <tr 
                                            key={proj.id} 
                                            onClick={() => { setSelectedProject(proj); setIsModalOpen(true); }}
                                            style={{ background: colors.inputBg, transition: '0.2s', cursor: 'pointer', outline: '1px solid transparent' }}
                                            onMouseOver={(e) => e.currentTarget.style.outline = `1px solid ${colors.border}`}
                                            onMouseOut={(e) => e.currentTarget.style.outline = '1px solid transparent'}
                                        >
                                            <td style={{ padding: '16px', borderRadius: '12px 0 0 12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: colors.mainText, fontSize: '12px' }}>
                                                        P-{proj.id}
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 4px 0', color: colors.mainText, fontSize: '15px', fontWeight: '800' }}>{proj.projectName}</h4>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.secondaryText, fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                                                    <Calendar size={14} /> Deadline: <strong style={{ color: colors.mainText, fontWeight: '700' }}>{proj.deadline || 'Not Set'}</strong>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.mainText, fontSize: '14px', fontWeight: '800' }}>
                                                    <Clock size={16} color={colors.secondaryText} /> {proj.totalEstimatedHours || 0} Hrs
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ background: statusBg, color: statusCol, padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                                                    {proj.status || 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', borderRadius: '0 12px 12px 0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setSelectedProject(proj); setIsModalOpen(true); }}
                                                        style={{ background: '#fff', color: colors.primaryBlue, border: `1px solid ${colors.border}`, padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }} title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleDeleteProject(proj.id, e)}
                                                        style={{ background: colors.dangerBg, color: colors.dangerText, border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }} title="Revoke Project"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: colors.secondaryText, background: colors.inputBg, borderRadius: '16px' }}>
                                            <ShieldAlert size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                                            <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>No projects match your criteria.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ========================================== */}
                {/* PROJECT DETAILS MODAL                      */}
                {/* ========================================== */}
                {isModalOpen && selectedProject && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                        <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden', animation: 'slideUp 0.3s ease-out' }}>
                            <div style={{ padding: '24px', background: colors.lightBlue, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ background: colors.primaryBlue, color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', marginBottom: '10px', display: 'inline-block' }}>PRJ-{selectedProject.id}</span>
                                    <h2 style={{ margin: 0, color: colors.mainText, fontSize: '22px', fontWeight: '800' }}>{selectedProject.projectName}</h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.5)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.mainText }}>
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                    <div style={{ background: colors.inputBg, padding: '16px', borderRadius: '12px' }}>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: colors.secondaryText, fontWeight: '700', textTransform: 'uppercase' }}>Current Status</p>
                                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: selectedProject.status === 'COMPLETED' ? colors.successText : colors.warningText }}>{selectedProject.status || 'ACTIVE'}</p>
                                    </div>
                                    <div style={{ background: colors.inputBg, padding: '16px', borderRadius: '12px' }}>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: colors.secondaryText, fontWeight: '700', textTransform: 'uppercase' }}>Total Workload</p>
                                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: colors.mainText }}>{selectedProject.totalEstimatedHours || 0} Hours</p>
                                    </div>
                                </div>

                                <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: colors.mainText }}>Project Meta Data</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px dashed ${colors.border}` }}>
                                        <span style={{ color: colors.secondaryText, fontSize: '14px', fontWeight: '500' }}>Deadline Limit</span>
                                        <strong style={{ color: colors.mainText, fontSize: '14px', fontWeight: '700' }}>{selectedProject.deadline || 'Not Configured'}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px dashed ${colors.border}` }}>
                                        <span style={{ color: colors.secondaryText, fontSize: '14px', fontWeight: '500' }}>Daily Required Rate</span>
                                        <strong style={{ color: colors.mainText, fontSize: '14px', fontWeight: '700' }}>{selectedProject.dailyRequiredHours || 0} Hrs/Day</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                        <span style={{ color: colors.secondaryText, fontSize: '14px', fontWeight: '500' }}>Duration Frame</span>
                                        <strong style={{ color: colors.mainText, fontSize: '14px', fontWeight: '700' }}>{selectedProject.durationDays || 30} Days</strong>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: colors.primaryBlue, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                                    Close Inspector
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                    .spin { animation: spin 1s linear infinite; } 
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                `}</style>
            </div>
        </DashboardLayout>
    );
};

export default ManagerProjects;