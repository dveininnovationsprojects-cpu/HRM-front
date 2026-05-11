import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { DollarSign, FileCheck, AlertCircle, TrendingUp, Download, UploadCloud, RefreshCw, Edit2, X, Save, PlayCircle } from 'lucide-react';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';

const AdminPayroll = () => {
    // Dynamic Date setup
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); 
    const currentYear = String(currentDate.getFullYear());

    const [analytics, setAnalytics] = useState({});
    const [payrolls, setPayrolls] = useState([]);
    const [month, setMonth] = useState(currentMonth); 
    const [year, setYear] = useState(currentYear);
    
    // Loading States
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // MISSING STATE ADDED BACK TO PREVENT CRASH
    const [downloadingId, setDownloadingId] = useState(null);
    
    // EDIT MODAL STATES
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [editData, setEditData] = useState({ deduction: 0, bonus: 0, remarks: '' });
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const fileInputRef = useRef(null);

    // ==========================================
    // ELITE COLOR PALETTE
    // ==========================================
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        mainText: '#0F172A', secondaryText: '#64748B',
        successBg: '#DCFCE7', successText: '#16A34A',
        warningBg: '#FEF9C3', warningText: '#CA8A04',
        dangerBg: '#FEE2E2', dangerText: '#DC2626',
        border: '#E2E8F0', cardWhite: '#FFFFFF', inputBg: '#F1F5F9'
    };

    // 12 Months List
    const monthsList = [
        { value: "01", label: "January" }, { value: "02", label: "February" },
        { value: "03", label: "March" }, { value: "04", label: "April" },
        { value: "05", label: "May" }, { value: "06", label: "June" },
        { value: "07", label: "July" }, { value: "08", label: "August" },
        { value: "09", label: "September" }, { value: "10", label: "October" },
        { value: "11", label: "November" }, { value: "12", label: "December" }
    ];

    // Dynamic Years List
    const yearsList = Array.from({ length: 5 }, (_, i) => String(currentDate.getFullYear() - 2 + i));

    // 1. Fetch Analytics & List (GET /analytics, GET /view)
    const fetchPayrollData = async () => {
        try {
            const anaRes = await api.get(`/api/payroll/analytics?month=${month}&year=${year}`);
            setAnalytics(anaRes.data || {});
            
            const viewRes = await api.get(`/api/payroll/view?month=${month}&year=${year}`);
            setPayrolls(viewRes.data || []);
        } catch (err) { 
            console.error("Payroll load failed", err);
            toast.error("Failed to load payroll data.");
        }
    };

    useEffect(() => {
        fetchPayrollData();
    }, [month, year]);

    // ==========================================
    // 💎 CURRENCY FORMATTER (Indian Standard)
    // ==========================================
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { 
            style: 'currency', 
            currency: 'INR', 
            maximumFractionDigits: 0 
        }).format(amount || 0);
    };

    // 2. Generate Payroll (POST /generate)
    const handleGenerate = async () => {
        setIsGenerating(true);
        const toastId = toast.loading(`Generating Payroll for ${monthsList.find(m => m.value === month)?.label} ${year}...`);
        try {
            await api.post(`/api/payroll/generate?month=${month}&year=${year}`);
            toast.success("Payroll generated successfully! ", { id: toastId });
            fetchPayrollData(); 
        } catch (err) { 
            toast.error("Generation failed! Check backend logs.", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    // 3. Download PDF (GET /download/{id})
    const handleDownloadPayslip = async (id, empName) => {
        setDownloadingId(id);
        const toastId = toast.loading(`Downloading ${empName}'s Payslip...`);
        try {
            const response = await api.get(`/api/payroll/download/${id}`, {
                responseType: 'blob' 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const monthName = monthsList.find(m => m.value === month)?.label || month;
            link.setAttribute('download', `Payslip_${empName}_${monthName}_${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            toast.success("Download Complete! ✅", { id: toastId });
        } catch (error) {
            toast.error("Failed to download PDF.", { id: toastId });
        } finally {
            setDownloadingId(null);
        }
    };

    // 4. Upload Bank File (POST /upload-bank)
    const handleBankFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('month', parseInt(month, 10));
        formData.append('year', parseInt(year, 10));

        setIsUploading(true);
        const toastId = toast.loading('Uploading Bank Transfer Status...');
        try {
            await api.post(`/api/payroll/upload-bank`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Bank File Uploaded! Salaries marked as PAID 💸", { id: toastId });
            fetchPayrollData(); 
        } catch (err) {
            console.error("Bank upload error", err);
            toast.error("Bank upload failed. Check format.", { id: toastId });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // 5. Open Edit Modal
    const openEditModal = (payroll) => {
        setSelectedPayroll(payroll);
        setEditData({
            deduction: payroll.totalDeduction || 0,
            bonus: payroll.performanceBonus || 0,
            remarks: '' 
        });
        setEditModalOpen(true);
    };

    // 6. Save Edit (PUT /edit/{id})
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editData.remarks) {
            toast.error("Please provide a reason (remarks) for this manual override.");
            return;
        }

        setIsSavingEdit(true);
        const toastId = toast.loading("Saving manual adjustments...");
        try {
            await api.put(`/api/payroll/edit/${selectedPayroll.id}?deduction=${editData.deduction}&bonus=${editData.bonus}&remarks=${encodeURIComponent(editData.remarks)}`);
            toast.success("Payroll updated successfully!", { id: toastId });
            setEditModalOpen(false);
            fetchPayrollData(); 
        } catch (err) {
            toast.error("Failed to update payroll.", { id: toastId });
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Mappings for Analytics Cards
    const totalPayout = analytics.totalPayout || 0; 
    const totalDeductions = analytics.totalDeductions || 0;
    const paidCount = analytics.statusBreakdown?.PAID || 0;
    
    let generatedCount = 0;
    if(analytics.statusBreakdown) {
       Object.keys(analytics.statusBreakdown).forEach(key => {
           if(key !== "PAID") generatedCount += analytics.statusBreakdown[key];
       });
    }

    return (
        <DashboardLayout role="ADMIN" title="Payroll Master Control">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                
                {/* PAGE HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.mainText, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                            Payroll Master Control
                        </h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '15px' }}>
                            Generate monthly salaries, review organizational payouts, and export bank data.
                        </p>
                    </div>
                    
                    {/* Period Selector */}
                    <div style={{ display: 'flex', gap: '12px', background: colors.cardWhite, padding: '10px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                        <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ border: 'none', background: 'transparent', fontWeight: '700', color: colors.mainText, outline: 'none', cursor: 'pointer', fontSize: '14px' }}>
                            {monthsList.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <div style={{ width: '1px', background: colors.border, height: '20px' }}></div>
                        <select value={year} onChange={(e) => setYear(e.target.value)} style={{ border: 'none', background: 'transparent', fontWeight: '700', color: colors.mainText, outline: 'none', cursor: 'pointer', fontSize: '14px' }}>
                            {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <button onClick={fetchPayrollData} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.primaryBlue, display: 'flex', alignItems: 'center', marginLeft: '8px' }} title="Refresh">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>

                {/* 🔥 MASS FIX: ELITE COMPACT STAT CARDS (Strict Single Line) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    
                    {/* Total Payout */}
                    <div style={{ background: colors.cardWhite, padding: '20px 24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: colors.lightBlue, width: '48px', height: '48px', borderRadius: '14px', color: colors.primaryBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <DollarSign size={22} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>Total Net Payout</p>
                            <h2 style={{ color: colors.mainText, fontSize: '22px', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
                                {formatCurrency(totalPayout)}
                            </h2>
                        </div>
                    </div>

                    {/* Paid Count */}
                    <div style={{ background: colors.cardWhite, padding: '20px 24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#ECFDF5', width: '48px', height: '48px', borderRadius: '14px', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileCheck size={22} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>Paid Count</p>
                            <h2 style={{ color: colors.mainText, fontSize: '22px', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
                                {paidCount}
                            </h2>
                        </div>
                    </div>

                    {/* Pending */}
                    <div style={{ background: colors.cardWhite, padding: '20px 24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#FFFBEB', width: '48px', height: '48px', borderRadius: '14px', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <AlertCircle size={22} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>Pending</p>
                            <h2 style={{ color: colors.mainText, fontSize: '22px', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
                                {generatedCount}
                            </h2>
                        </div>
                    </div>

                    {/* Total Deductions */}
                    <div style={{ background: colors.cardWhite, padding: '20px 24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#FEF2F2', width: '48px', height: '48px', borderRadius: '14px', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <TrendingUp size={22} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>Total Deductions</p>
                            <h2 style={{ color: colors.mainText, fontSize: '22px', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
                                {formatCurrency(totalDeductions)}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* CONTROLS & TABLE */}
                <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                        <h3 style={{ margin: 0, color: colors.mainText, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
                            <FileCheck size={20} color={colors.primaryBlue} /> Master Payroll Register
                        </h3>
                        
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button 
                                onClick={handleGenerate} 
                                disabled={isGenerating}
                                style={{ background: isGenerating ? '#94A3B8' : colors.successText, color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', transition: '0.2s', boxShadow: isGenerating ? 'none' : '0 4px 14px rgba(22, 163, 74, 0.3)' }}
                            >
                                {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <PlayCircle size={18} />}
                                {isGenerating ? 'Generating...' : 'Generate Payroll'}
                            </button>

                            <input type="file" accept=".xlsx, .csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleBankFileUpload} />
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                disabled={isUploading}
                                style={{ background: isUploading ? '#94A3B8' : colors.primaryBlue, color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '12px', cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: '700', fontSize: '14px', transition: '0.2s', boxShadow: isUploading ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.3)' }}
                            >
                                {isUploading ? <RefreshCw size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                                {isUploading ? 'Uploading...' : 'Upload Bank File'}
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: '900px', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bio ID</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Salary</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bonus / Deduction</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrolls.length > 0 ? payrolls.map(p => {
                                    const empName = p.employee?.fullName || 'Unknown';
                                    const bioId = p.employee?.biometricId || '-';
                                    const actualBonus = p.performanceBonus || 0;
                                    const actualDeduction = p.totalDeduction || 0;
                                    
                                    return (
                                        <tr key={p.id} style={{ background: colors.inputBg, transition: '0.2s' }}>
                                            <td style={{ padding: '16px', fontWeight: '700', color: colors.mainText, fontSize: '14px', borderRadius: '12px 0 0 12px' }}>
                                                {empName}
                                                {p.isManuallyEdited && <span style={{display: 'block', fontSize: '10px', color: colors.dangerText, marginTop: '4px'}}>*Manually Edited</span>}
                                            </td>
                                            <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px', fontWeight: '600' }}>
                                                BIO-{bioId}
                                            </td>
                                            <td style={{ padding: '16px', color: colors.mainText, fontWeight: '800', fontSize: '15px' }}>
                                                {formatCurrency(p.netSalary)}
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '13px', fontWeight: '700' }}>
                                                <span style={{ color: colors.successText, marginRight: '10px' }}>+{formatCurrency(actualBonus)}</span>
                                                <span style={{ color: colors.dangerText }}>-{formatCurrency(actualDeduction)}</span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ 
                                                    padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px',
                                                    background: p.status === 'PAID' ? colors.successBg : colors.warningBg, 
                                                    color: p.status === 'PAID' ? colors.successText : colors.warningText 
                                                }}>
                                                    {p.status} 
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', borderRadius: '0 12px 12px 0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    {p.status !== 'PAID' && (
                                                        <button 
                                                            onClick={() => openEditModal(p)}
                                                            style={{ background: '#FFFFFF', border: `1px solid ${colors.border}`, color: colors.warningText, cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: '0.2s' }}
                                                            title="Manual Override (Edit)">
                                                            <Edit2 size={16} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDownloadPayslip(p.id, empName)}
                                                        disabled={downloadingId === p.id}
                                                        style={{ background: '#FFFFFF', border: `1px solid ${colors.border}`, color: colors.primaryBlue, cursor: downloadingId === p.id ? 'not-allowed' : 'pointer', padding: '8px', borderRadius: '8px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}
                                                        title="Download Payslip PDF">
                                                        {downloadingId === p.id ? <RefreshCw size={14} className="animate-spin"/> : <Download size={14} />} PDF
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                }) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: colors.secondaryText, background: colors.inputBg, borderRadius: '16px' }}>
                                            <AlertCircle size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                                            <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>No payroll records found for {monthsList.find(m => m.value === month)?.label} {year}.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* OVERLAY MODAL FOR EDITING */}
                {editModalOpen && selectedPayroll && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '24px', overflow: 'hidden', animation: 'slideUp 0.3s ease-out', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                            <div style={{ padding: '24px', background: colors.lightBlue, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ margin: 0, color: colors.mainText, fontSize: '20px', fontWeight: '800' }}>Modify Payout</h2>
                                    <p style={{ margin: '4px 0 0 0', color: colors.primaryBlue, fontSize: '14px', fontWeight: '600' }}>
                                        {selectedPayroll.employee?.fullName || `EMP-${selectedPayroll.employee?.id}`}
                                    </p>
                                </div>
                                <button onClick={() => setEditModalOpen(false)} style={{ background: 'rgba(255,255,255,0.5)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.mainText }}>
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSaveEdit} style={{ padding: '24px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.secondaryText, marginBottom: '8px', textTransform: 'uppercase' }}>Manual Deduction (₹)</label>
                                    <input 
                                        type="number" 
                                        value={editData.deduction} 
                                        onChange={(e) => setEditData({...editData, deduction: parseFloat(e.target.value) || 0})}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', fontSize: '15px', fontWeight: '600', color: colors.dangerText, boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.secondaryText, marginBottom: '8px', textTransform: 'uppercase' }}>Manual Bonus (₹)</label>
                                    <input 
                                        type="number" 
                                        value={editData.bonus} 
                                        onChange={(e) => setEditData({...editData, bonus: parseFloat(e.target.value) || 0})}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', fontSize: '15px', fontWeight: '600', color: colors.successText, boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.secondaryText, marginBottom: '8px', textTransform: 'uppercase' }}>Reason / Remarks *</label>
                                    <textarea 
                                        required
                                        placeholder="E.g., Added extra performance bonus..."
                                        value={editData.remarks} 
                                        onChange={(e) => setEditData({...editData, remarks: e.target.value})}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', height: '80px', resize: 'none', boxSizing: 'border-box', fontWeight: '500' }}
                                    />
                                </div>
                                
                                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: `1px dashed ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: colors.secondaryText }}>Calculated Base</span>
                                    <span style={{ fontSize: '16px', fontWeight: '800', color: colors.mainText }}>
                                        {formatCurrency(selectedPayroll.baseSalary || (selectedPayroll.netSalary - (selectedPayroll.performanceBonus || selectedPayroll.bonus || 0) + (selectedPayroll.totalDeduction || selectedPayroll.deduction || 0)))}
                                    </span>
                                </div>

                                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" onClick={() => setEditModalOpen(false)} style={{ background: 'transparent', color: colors.secondaryText, border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                    <button 
                                        type="submit" 
                                        disabled={isSavingEdit}
                                        style={{ background: colors.primaryBlue, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '700', cursor: isSavingEdit ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
                                    >
                                        {isSavingEdit ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                                        {isSavingEdit ? 'Updating...' : 'Save Payout'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                .animate-spin { animation: spin 1s linear infinite; } 
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}</style>
        </DashboardLayout>
    );
};

export default AdminPayroll;