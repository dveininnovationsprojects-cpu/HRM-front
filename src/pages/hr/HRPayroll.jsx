import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    Banknote, Search, Download, UploadCloud, Edit3, 
    Calendar, CheckCircle, XCircle, AlertCircle, ChevronLeft, 
    ChevronRight, X, FileSpreadsheet, Loader2, PieChart as PieChartIcon, 
    BarChart2, IndianRupee, FileText, Send, Activity /* <-- MASS FIX: Activity added here */
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const HRPayroll = () => {
    // =========================================================================
    // 1. STATE MANAGEMENT
    // =========================================================================
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    
    const [payrolls, setPayrolls] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Filtering & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modals State
    const [generateModal, setGenerateModal] = useState({ isOpen: false, loading: false });
    const [uploadModal, setUploadModal] = useState({ isOpen: false, file: null, uploading: false });
    const [editModal, setEditModal] = useState({ 
        isOpen: false, 
        data: null, 
        deduction: 0, 
        bonus: 0, 
        remarks: '', 
        saving: false 
    });

    // Downloading State
    const [downloadingId, setDownloadingId] = useState(null);

    // =========================================================================
    // 2. ELITE THEME COLORS
    // =========================================================================
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        cardWhite: '#FFFFFF', mainText: '#0F172A', secondaryText: '#64748B',
        success: '#10B981', successLight: '#ECFDF5',
        warning: '#F59E0B', warningLight: '#FFFBEB',
        danger: '#EF4444', dangerLight: '#FEF2F2',
        border: '#E2E8F0', inputBg: '#F1F5F9',
        chartColors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    };

    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
        { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
        { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];

    const years = Array.from(new Array(5), (val, index) => currentDate.getFullYear() - 2 + index);

    // =========================================================================
    // 3. API FETCH LOGIC
    // =========================================================================
    useEffect(() => {
        fetchPayrollData();
    }, [selectedMonth, selectedYear]);

    const fetchPayrollData = async () => {
        setLoading(true);
        try {
            // Fetch Analytics & Payroll Data concurrently
            const [analyticsRes, payrollRes] = await Promise.all([
                api.get('/api/payroll/analytics', { params: { month: selectedMonth, year: selectedYear } }).catch(() => ({ data: null })),
                api.get('/api/payroll/view', { params: { month: selectedMonth, year: selectedYear } }).catch(() => ({ data: [] }))
            ]);

            setAnalytics(analyticsRes.data);
            setPayrolls(Array.isArray(payrollRes.data) ? payrollRes.data : []);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load payroll data.");
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 4. ACTION HANDLERS (Generate, Upload, Edit, Download)
    // =========================================================================

    // --- GENERATE PAYROLL ---
    const handleGeneratePayroll = async () => {
        setGenerateModal(prev => ({ ...prev, loading: true }));
        try {
            await api.post('/api/payroll/generate', null, { 
                params: { month: selectedMonth, year: selectedYear } 
            });
            toast.success(`Payroll generated successfully for ${months[selectedMonth-1].label} ${selectedYear}!`);
            setGenerateModal({ isOpen: false, loading: false });
            fetchPayrollData();
        } catch (err) {
            toast.error(err.response?.data || "Failed to generate payroll.");
            setGenerateModal(prev => ({ ...prev, loading: false }));
        }
    };


    // --- EDIT PAYROLL ---
    const openEditModal = (record) => {
        setEditModal({ 
            isOpen: true, 
            data: record, 
            deduction: record.deductions || 0, 
            bonus: record.bonus || 0, 
            remarks: record.remarks || '', 
            saving: false 
        });
    };


    // --- DOWNLOAD PDF ---
    const handleDownloadPDF = async (id, empName) => {
        setDownloadingId(id);
        try {
            const response = await api.get(`/api/payroll/download/${id}`, {
                responseType: 'blob', // IMPORTANT FOR FILES
            });
            
            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payslip_${empName}_${selectedMonth}_${selectedYear}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            toast.success("Payslip downloaded successfully!");
        } catch (err) {
            toast.error("Failed to download PDF.");
        } finally {
            setDownloadingId(null);
        }
    };

    // =========================================================================
    // 5. DATA PROCESSING (Filtering, Charts, Pagination)
    // =========================================================================
    const processedData = useMemo(() => {
        let filtered = payrolls;
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                (p.employee?.fullName && p.employee.fullName.toLowerCase().includes(lowerSearch)) ||
                (p.employee?.biometricId && p.employee.biometricId.toLowerCase().includes(lowerSearch))
            );
        }
        if (filterStatus !== 'ALL') {
            filtered = filtered.filter(p => p.status?.toUpperCase() === filterStatus);
        }
        return filtered;
    }, [payrolls, searchTerm, filterStatus]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const currentData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, selectedMonth, selectedYear]);

    // Format Currency Helper
    const formatCurrency = (amount) => {
        if (!amount) return '₹ 0.00';
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const getStatusBadge = (status) => {
        const s = status ? status.toUpperCase() : 'PENDING';
        if (s === 'PAID') return <span style={{ padding: '6px 12px', background: colors.successLight, color: colors.success, borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}><CheckCircle size={12} style={{display:'inline', marginBottom:'-2px'}}/> PAID</span>;
        if (s === 'GENERATED') return <span style={{ padding: '6px 12px', background: colors.lightBlue, color: colors.primaryBlue, borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}><FileText size={12} style={{display:'inline', marginBottom:'-2px'}}/> GENERATED</span>;
        return <span style={{ padding: '6px 12px', background: colors.warningLight, color: colors.warning, borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}><AlertCircle size={12} style={{display:'inline', marginBottom:'-2px'}}/> PENDING</span>;
    };

    // Chart Data Preparation from existing list
    const pieData = [
        { name: 'Paid', value: payrolls.filter(p => p.status === 'PAID').length },
        { name: 'Pending/Generated', value: payrolls.filter(p => p.status !== 'PAID').length }
    ];

    const barData = payrolls.slice(0, 5).map(p => ({
        name: p.employee?.fullName?.split(' ')[0] || `Emp ${p.id}`,
        NetPay: p.netSalary || 0,
        Deductions: p.deductions || 0
    }));

    // =========================================================================
    // 6. RENDER UI
    // =========================================================================
    return (
        <DashboardLayout role="HR" title="Payroll & Compensation">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
                
                {/* --------------------------------------------------------- */}
                {/* TOP HEADER & CONTROLS                                     */}
                {/* --------------------------------------------------------- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '26px', fontWeight: '800', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.5px' }}>
                            <Banknote color={colors.primaryBlue} size={28} /> Payroll Management
                        </h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '15px' }}>
                            Generate payslips, process bonuses, and sync bank statements.
                        </p>
                    </div>

                    {/* Controls (Month/Year & Action Buttons) */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#fff', padding: '12px 20px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: `1px solid ${colors.border}`, paddingRight: '16px' }}>
                            <Calendar size={18} color={colors.secondaryText}/>
                            <select 
                                value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                style={{ border: 'none', outline: 'none', fontSize: '14px', fontWeight: '600', color: colors.mainText, background: 'transparent', cursor: 'pointer' }}
                            >
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <select 
                                value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                                style={{ border: 'none', outline: 'none', fontSize: '14px', fontWeight: '600', color: colors.mainText, background: 'transparent', cursor: 'pointer' }}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        
                        <button 
                            onClick={() => setGenerateModal({ isOpen: true, loading: false })}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}
                        >
                            <FileText size={16} /> Generate Run
                        </button>
                        
                       
                    </div>
                </div>

                {/* --------------------------------------------------------- */}
                {/* ANALYTICS CARDS                                           */}
                {/* --------------------------------------------------------- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div className="metric-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: colors.secondaryText, fontWeight: '600', textTransform: 'uppercase' }}>Total Payroll Cost</p>
                            <div style={{ background: colors.lightBlue, padding: '8px', borderRadius: '8px', color: colors.primaryBlue }}><IndianRupee size={18}/></div>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: colors.mainText }}>
                            {loading ? '...' : formatCurrency(analytics?.totalNetPay || payrolls.reduce((sum, p) => sum + p.netSalary, 0))}
                        </h3>
                    </div>
                    
                    <div className="metric-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: colors.secondaryText, fontWeight: '600', textTransform: 'uppercase' }}>Total Bonuses</p>
                            <div style={{ background: colors.successLight, padding: '8px', borderRadius: '8px', color: colors.success }}><Activity size={18}/></div>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: colors.mainText }}>
                            {loading ? '...' : formatCurrency(payrolls.reduce((sum, p) => sum + (p.bonus || 0), 0))}
                        </h3>
                    </div>

                    <div className="metric-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: colors.secondaryText, fontWeight: '600', textTransform: 'uppercase' }}>Total Deductions</p>
                            <div style={{ background: colors.dangerLight, padding: '8px', borderRadius: '8px', color: colors.danger }}><XCircle size={18}/></div>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: colors.mainText }}>
                            {loading ? '...' : formatCurrency(payrolls.reduce((sum, p) => sum + (p.deductions || 0), 0))}
                        </h3>
                    </div>

                    <div className="metric-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: colors.secondaryText, fontWeight: '600', textTransform: 'uppercase' }}>Processed / Total</p>
                            <div style={{ background: colors.warningLight, padding: '8px', borderRadius: '8px', color: colors.warning }}><CheckCircle size={18}/></div>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: colors.mainText }}>
                            {loading ? '...' : `${payrolls.filter(p => p.status === 'PAID').length} / ${payrolls.length}`}
                        </h3>
                    </div>
                </div>

               
                {/* --------------------------------------------------------- */}
                {/* DATA TABLE SECTION                                        */}
                {/* --------------------------------------------------------- */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px 16px 0 0', border: `1px solid ${colors.border}`, borderBottom: 'none', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1', maxWidth: '350px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.secondaryText }} />
                        <input 
                            type="text" placeholder="Search employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '14px', boxSizing: 'border-box', background: colors.inputBg }}
                        />
                    </div>
                    <select 
                        value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '12px 14px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '14px', background: colors.inputBg, color: colors.mainText, cursor: 'pointer' }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PAID">Paid</option>
                        <option value="GENERATED">Generated</option>
                    </select>
                </div>

                <div style={{ background: colors.cardWhite, borderRadius: '0 0 16px 16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                            <thead>
                                <tr style={{ background: colors.background, borderBottom: `2px solid ${colors.border}` }}>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Employee</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Basic Salary</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Bonus/Allowances</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Deductions</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: colors.mainText, textTransform: 'uppercase' }}>Net Pay</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center' }}><Loader2 className="spin" size={30} color={colors.primaryBlue} style={{margin:'0 auto'}}/></td></tr>
                                ) : currentData.length > 0 ? (
                                    currentData.map((p) => (
                                        <tr key={p.id} className="table-row" style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.lightBlue, color: colors.primaryBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                                                        {p.employee?.fullName ? p.employee.fullName.charAt(0) : 'U'}
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: '700', color: colors.mainText, fontSize: '14px' }}>{p.employee?.fullName || 'Unknown'}</p>
                                                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: colors.secondaryText }}>ID: {p.employee?.biometricId || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: colors.mainText, fontSize: '14px', fontWeight: '500' }}>{formatCurrency(p.basicSalary)}</td>
                                            <td style={{ padding: '16px 24px', color: colors.success, fontSize: '14px', fontWeight: '600' }}>+ {formatCurrency(p.bonus)}</td>
                                            <td style={{ padding: '16px 24px', color: colors.danger, fontSize: '14px', fontWeight: '600' }}>- {formatCurrency(p.deductions)}</td>
                                            <td style={{ padding: '16px 24px', color: colors.primaryBlue, fontSize: '15px', fontWeight: '800' }}>{formatCurrency(p.netSalary)}</td>
                                            <td style={{ padding: '16px 24px' }}>{getStatusBadge(p.status)}</td>
                                            <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                    <button onClick={() => handleDownloadPDF(p.id, p.employee?.fullName || 'Emp')} disabled={downloadingId === p.id} style={{ background: colors.inputBg, border: 'none', color: colors.mainText, padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }} title="Download Payslip">
                                                        {downloadingId === p.id ? <Loader2 size={16} className="spin"/> : <Download size={16} />}
                                                    </button>
                                                    
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: colors.secondaryText }}>No payroll records found. Generate payroll first.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {!loading && processedData.length > 0 && (
                        <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: colors.secondaryText }}>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length} entries</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '6px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}><ChevronLeft size={16}/></button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '6px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}><ChevronRight size={16}/></button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ========================================================= */}
                {/* CUSTOM MODALS (Zero Native Popups)                        */}
                {/* ========================================================= */}

                {/* 1. Generate Confirm Modal */}
                {generateModal.isOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                            <div style={{ background: colors.lightBlue, width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: colors.primaryBlue }}><Banknote size={30}/></div>
                            <h3 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: '800', color: colors.mainText }}>Generate Payroll?</h3>
                            <p style={{ margin: '0 0 24px', fontSize: '14px', color: colors.secondaryText, lineHeight: '1.5' }}>
                                You are about to generate/re-calculate payroll for <b>{months[selectedMonth-1].label} {selectedYear}</b>. This will fetch attendance, leaves, and calculate salaries.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setGenerateModal({isOpen: false, loading: false})} style={{ flex: 1, padding: '12px', background: colors.inputBg, border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleGeneratePayroll} disabled={generateModal.loading} style={{ flex: 1, padding: '12px', background: colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                    {generateModal.loading ? <Loader2 size={18} className="spin"/> : 'Yes, Generate'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Edit Payroll Modal */}
                {editModal.isOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '450px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.mainText }}>Adjust Payroll</h3>
                                <button onClick={() => setEditModal(prev => ({...prev, isOpen: false}))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.secondaryText }}><X size={20}/></button>
                            </div>
                            
                            <div style={{ background: colors.inputBg, padding: '16px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: colors.mainText }}>{editModal.data?.employee?.fullName}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: colors.secondaryText }}>Basic: {formatCurrency(editModal.data?.basicSalary)}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '11px', color: colors.secondaryText, textTransform: 'uppercase', fontWeight: '600' }}>Expected Net Pay</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '800', color: colors.primaryBlue }}>
                                        {formatCurrency((editModal.data?.basicSalary || 0) + parseFloat(editModal.bonus || 0) - parseFloat(editModal.deduction || 0))}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Add Bonus (₹)</label>
                                    <input type="number" value={editModal.bonus} onChange={(e) => setEditModal({...editModal, bonus: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Deductions (₹)</label>
                                    <input type="number" value={editModal.deduction} onChange={(e) => setEditModal({...editModal, deduction: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring" />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Remarks / Reason</label>
                                <textarea value={editModal.remarks} onChange={(e) => setEditModal({...editModal, remarks: e.target.value})} placeholder="E.g., Diwali Bonus, LOP..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box', height: '80px', resize: 'none' }} className="focus-ring" ></textarea>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setEditModal(prev => ({...prev, isOpen: false}))} disabled={editModal.saving} style={{ flex: 1, padding: '12px', background: colors.inputBg, border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleEditSave} disabled={editModal.saving} style={{ flex: 1, padding: '12px', background: colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                    {editModal.saving ? <Loader2 size={18} className="spin"/> : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Bulk Upload Excel Modal */}
                {uploadModal.isOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '450px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.mainText }}>Sync Bank Status</h3>
                                <button onClick={() => setUploadModal({isOpen: false, file: null, uploading: false})} disabled={uploadModal.uploading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.secondaryText }}><X size={20}/></button>
                            </div>
                            <p style={{ fontSize: '14px', color: colors.secondaryText, lineHeight: '1.5', marginBottom: '20px' }}>
                                Upload the bank transfer Excel file. System will automatically update the status of these employees to <b style={{color: colors.success}}>PAID</b>.
                            </p>
                            <div style={{ border: `2px dashed ${uploadModal.file ? colors.success : colors.primaryBlue}`, background: uploadModal.file ? colors.successLight : colors.lightBlue, borderRadius: '12px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', position: 'relative', transition: '0.3s', marginBottom: '24px' }}>
                                <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => setUploadModal({...uploadModal, file: e.target.files[0]})} disabled={uploadModal.uploading} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                                {uploadModal.file ? (
                                    <><FileSpreadsheet size={40} color={colors.success} style={{ margin: '0 auto 10px' }} /><p style={{ margin: 0, fontWeight: '700', color: colors.success }}>{uploadModal.file.name}</p></>
                                ) : (
                                    <><UploadCloud size={40} color={colors.primaryBlue} style={{ margin: '0 auto 10px' }} /><p style={{ margin: 0, fontWeight: '700', color: colors.primaryBlue }}>Click to upload bank file</p></>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setUploadModal({isOpen: false, file: null, uploading: false})} disabled={uploadModal.uploading} style={{ flex: 1, padding: '12px', background: colors.inputBg, border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleBulkUpload} disabled={!uploadModal.file || uploadModal.uploading} style={{ flex: 1, padding: '12px', background: uploadModal.file ? colors.primaryBlue : '#94A3B8', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: uploadModal.file ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                    {uploadModal.uploading ? <Loader2 size={18} className="spin"/> : 'Sync Records'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* ========================================================================= */}
            {/* CSS STYLES                                                                */}
            {/* ========================================================================= */}
            <style>
                {`
                    .metric-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.04); transition: all 0.3s ease; }
                    .btn-primary:hover { background: #1D4ED8 !important; }
                    .btn-secondary:hover { background: #DCFCE7 !important; }
                    .table-row:hover { background-color: #F8FAFC; }
                    .focus-ring:focus { border-color: ${colors.primaryBlue} !important; background-color: #fff !important; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    
                    /* Custom Modals CSS */
                    .modal-overlay {
                        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
                        display: flex; align-items: center; justify-content: center;
                        z-index: 9999; animation: fadeIn 0.2s ease-out;
                    }
                    .modal-content {
                        background: #fff; width: 100%; border-radius: 20px; padding: 32px;
                        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                        animation: slideUp 0.3s ease-out;
                    }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                `}
            </style>
        </DashboardLayout>
    );
};

export default HRPayroll;