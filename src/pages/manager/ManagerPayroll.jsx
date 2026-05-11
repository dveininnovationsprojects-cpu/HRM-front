import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { 
    FileText, DollarSign, TrendingDown, Clock, CheckCircle, 
    RefreshCw, Download, PlayCircle, Filter, Edit2, X, Save, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerPayroll = () => {
    // State for Month/Year Selection
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    
    // Data States
    const [payrolls, setPayrolls] = useState([]);
    const [stats, setStats] = useState({ totalPayout: 0, totalDeductions: 0, paidCount: 0, pendingCount: 0 });
    
    // Loading & Action States
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    // Filter State
    const [statusFilter, setStatusFilter] = useState('ALL');

    // 🟢 EDIT MODAL STATES
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPayroll, setEditingPayroll] = useState(null);
    const [editForm, setEditForm] = useState({ manualBonus: 0, manualDeduction: 0, remarks: '' });
    const [isSaving, setIsSaving] = useState(false);

    // ELITE COLOR PALETTE
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        mainText: '#0F172A', secondaryText: '#64748B',
        successBg: '#DCFCE7', successText: '#16A34A',
        warningBg: '#FFF7ED', warningText: '#EA580C',
        dangerBg: '#FEE2E2', dangerText: '#DC2626',
        border: '#E2E8F0', cardWhite: '#FFFFFF', inputBg: '#F1F5F9'
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        fetchPayrollData();
    }, [month, year, statusFilter]);

    // ==========================================
    // 1. FETCH PAYROLL & ANALYTICS
    // ==========================================
    const fetchPayrollData = async () => {
        setLoading(true);
        try {
            const statRes = await api.get(`/api/payroll/analytics?month=${month}&year=${year}`);
            if (statRes.data) {
                setStats({
                    totalPayout: statRes.data.totalPayout || 0,
                    totalDeductions: statRes.data.totalDeductions || 0,
                    paidCount: statRes.data.paidCount || 0,
                    pendingCount: statRes.data.pendingCount || 0
                });
            }

            let endpoint = statusFilter === 'ALL' 
                ? `/api/payroll/view?month=${month}&year=${year}`
                : `/api/payroll/filter?month=${month}&year=${year}&status=${statusFilter}`;
                
            const listRes = await api.get(endpoint);
            setPayrolls(listRes.data || []);
            
        } catch (error) {
            console.error("Fetch Payroll Error:", error);
            toast.error("Failed to load payroll records for this month.");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // 2. GENERATE PAYROLL LOGIC
    // ==========================================
    const handleGeneratePayroll = async () => {
        if (!window.confirm(`Are you sure you want to generate payroll for ${monthNames[month - 1]} ${year}?`)) return;

        setGenerating(true);
        const toastId = toast.loading(`Generating Payroll for ${monthNames[month - 1]}...`);
        try {
            await api.post(`/api/payroll/generate?month=${month}&year=${year}`);
            toast.success("Payroll Generated Successfully!", { id: toastId });
            fetchPayrollData(); 
        } catch (error) {
            toast.error(error.response?.data || "Failed to generate payroll.", { id: toastId });
        } finally {
            setGenerating(false);
        }
    };

    // ==========================================
    // 3. EDIT PAYROLL LOGIC 
    // ==========================================
    const openEditModal = (payroll) => {
        setEditingPayroll(payroll);
        setEditForm({
            manualBonus: payroll.manualBonus || payroll.performanceBonus || payroll.bonus || 0,
            manualDeduction: payroll.manualDeduction || payroll.totalDeduction || payroll.deduction || 0,
            remarks: payroll.remarks || ''
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editForm.remarks || editForm.remarks.trim() === '') {
            toast.error("Please enter a reason/remark for this modification.");
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading("Updating payroll record...");
        try {
            console.log("Sending Data to Backend:", editForm); // Debug log
            await api.put(`/api/payroll/update/${editingPayroll.id}`, editForm);
            toast.success("Payroll updated successfully!", { id: toastId });
            setIsEditModalOpen(false);
            fetchPayrollData(); 
        } catch (error) {
            console.error("Update Error Details:", error.response || error); // Debug log
            if(error.response && error.response.status === 401) {
                toast.error("401 Unauthorized! Backend role 'MANAGER' is blocked. Tell Backend team to allow this.", { id: toastId, duration: 6000 });
            } else {
                toast.error("Failed to update payroll. Check console.", { id: toastId });
            }
        } finally {
            setIsSaving(false);
        }
    };

    // ==========================================
    // 4. DOWNLOAD PAYSLIP LOGIC
    // ==========================================
    const handleDownloadPayslip = async (id, empName) => {
        setDownloadingId(id);
        try {
            const response = await api.get(`/api/payroll/download/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payslip_${empName}_${monthNames[month-1]}_${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Payslip Downloaded!");
        } catch (error) {
            toast.error("Failed to download PDF.");
        } finally {
            setDownloadingId(null);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
    };

    return (
        <DashboardLayout role="MANAGER" title="Payroll Operations">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                
                {/* HEADER & CONTROLS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.mainText, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                            Payroll Operations Review
                        </h1>
                        <p style={{ color: colors.secondaryText, fontSize: '15px', margin: 0 }}>
                            Generate monthly salaries, review, and edit payouts.
                        </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', background: colors.cardWhite, padding: '10px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ border: 'none', background: 'transparent', fontWeight: '700', color: colors.mainText, outline: 'none', cursor: 'pointer', fontSize: '14px' }}>
                            {monthNames.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                        </select>
                        <div style={{ width: '1px', background: colors.border, height: '20px' }}></div>
                        <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ border: 'none', background: 'transparent', fontWeight: '700', color: colors.mainText, outline: 'none', cursor: 'pointer', fontSize: '14px' }}>
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* STAT CARDS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    {/* Total Payout */}
                    <div style={{ background: colors.cardWhite, padding: '20px 24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: colors.lightBlue, width: '48px', height: '48px', borderRadius: '14px', color: colors.primaryBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <DollarSign size={22} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>Total Net Payout</p>
                            <h2 style={{ color: colors.mainText, fontSize: '22px', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
                                {formatCurrency(stats.totalPayout)}
                            </h2>
                        </div>
                    </div>

                    {/* Paid Count */}
                    <div style={{ background: colors.cardWhite, padding: '20px 24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#ECFDF5', width: '48px', height: '48px', borderRadius: '14px', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CheckCircle size={22} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>Paid Employees</p>
                            <h2 style={{ color: colors.mainText, fontSize: '22px', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
                                {stats.paidCount}
                            </h2>
                        </div>
                    </div>

                    {/* Pending Transfers */}
                    <div style={{ background: colors.cardWhite, padding: '20px 24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#FFFBEB', width: '48px', height: '48px', borderRadius: '14px', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Clock size={22} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>Pending Transfers</p>
                            <h2 style={{ color: colors.mainText, fontSize: '22px', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
                                {stats.pendingCount}
                            </h2>
                        </div>
                    </div>

                    {/* Total Deductions */}
                    <div style={{ background: colors.cardWhite, padding: '20px 24px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#FEF2F2', width: '48px', height: '48px', borderRadius: '14px', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <TrendingDown size={22} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ color: colors.secondaryText, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>Total Deductions</p>
                            <h2 style={{ color: colors.mainText, fontSize: '22px', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
                                {formatCurrency(stats.totalDeductions)}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* PAYROLL LIST & ACTIONS */}
                <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                        <h3 style={{ margin: 0, color: colors.mainText, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={20} color={colors.primaryBlue} /> Master Payroll Register
                        </h3>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: colors.inputBg, padding: '8px 16px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                                <Filter size={16} color={colors.secondaryText} style={{ marginRight: '8px' }} />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', fontWeight: '700', color: colors.mainText, cursor: 'pointer' }}>
                                    <option value="ALL">All Status</option>
                                    <option value="GENERATED">Generated</option>
                                    <option value="PAID">Paid</option>
                                </select>
                            </div>
                            <button 
                                onClick={handleGeneratePayroll}
                                disabled={generating}
                                style={{ background: generating ? '#94A3B8' : colors.primaryBlue, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '12px', cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '14px', transition: '0.2s', boxShadow: generating ? 'none' : '0 4px 14px rgba(37,99,235,0.3)' }}
                            >
                                {generating ? <RefreshCw size={18} className="animate-spin" /> : <PlayCircle size={18} />}
                                {generating ? 'Processing...' : `Generate ${monthNames[month-1]} Payroll`}
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: '900px', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Basic Salary</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bonus</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deductions</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Pay</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: colors.secondaryText }}>
                                            <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: colors.primaryBlue }} />
                                            <p style={{ margin: 0, fontWeight: '600' }}>Loading payroll data...</p>
                                        </td>
                                    </tr>
                                ) : payrolls.length > 0 ? (
                                    payrolls.map((payroll) => {
                                        const empName = payroll.employee?.fullName || `EMP-${payroll.employee?.id}`;
                                        const actualBonus = payroll.manualBonus || payroll.performanceBonus || payroll.bonus || 0;
                                        const actualDeduction = payroll.manualDeduction || payroll.totalDeduction || payroll.deduction || 0;
                                        const actualBaseSalary = payroll.baseSalary || (payroll.netSalary - actualBonus + actualDeduction);
                                        const isPaid = payroll.status === 'PAID';

                                        return (
                                            <tr key={payroll.id} style={{ background: colors.inputBg, transition: '0.2s' }}>
                                                <td style={{ padding: '16px', color: colors.mainText, fontWeight: '700', fontSize: '14px', borderRadius: '12px 0 0 12px' }}>{empName}</td>
                                                <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px', fontWeight: '600' }}>{formatCurrency(actualBaseSalary)}</td>
                                                <td style={{ padding: '16px', color: colors.successText, fontSize: '14px', fontWeight: '700' }}>+ {formatCurrency(actualBonus)}</td>
                                                <td style={{ padding: '16px', color: colors.dangerText, fontSize: '14px', fontWeight: '700' }}>- {formatCurrency(actualDeduction)}</td>
                                                <td style={{ padding: '16px', color: colors.mainText, fontWeight: '800', fontSize: '15px' }}>{formatCurrency(payroll.netSalary)}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{ 
                                                        background: isPaid ? colors.successBg : colors.lightBlue, 
                                                        color: isPaid ? colors.successText : colors.primaryBlue, 
                                                        padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px'
                                                    }}>
                                                        {payroll.status || 'GENERATED'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'right', borderRadius: '0 12px 12px 0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button 
                                                            onClick={() => openEditModal(payroll)}
                                                            disabled={isPaid}
                                                            style={{ background: isPaid ? '#E2E8F0' : '#FFFFFF', color: isPaid ? '#94A3B8' : colors.warningText, border: `1px solid ${colors.border}`, padding: '8px', borderRadius: '8px', cursor: isPaid ? 'not-allowed' : 'pointer', transition: '0.2s' }}
                                                            title={isPaid ? "Cannot edit paid salary" : "Edit Payout"}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => handleDownloadPayslip(payroll.id, empName)}
                                                            disabled={downloadingId === payroll.id}
                                                            style={{ background: '#FFFFFF', color: colors.mainText, border: `1px solid ${colors.border}`, padding: '8px 12px', borderRadius: '8px', cursor: downloadingId === payroll.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', transition: '0.2s' }}
                                                        >
                                                            {downloadingId === payroll.id ? <Loader2 size={14} className="animate-spin"/> : <Download size={14} color={colors.primaryBlue} />} PDF
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: colors.secondaryText, background: colors.inputBg, borderRadius: '16px' }}>
                                            <DollarSign size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                                            <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>No payroll data found for {monthNames[month-1]} {year}.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* EDIT PAYROLL MODAL */}
                {isEditModalOpen && editingPayroll && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                        <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '24px', overflow: 'hidden', animation: 'slideUp 0.3s ease-out', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                            <div style={{ padding: '24px', background: colors.lightBlue, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ margin: 0, color: colors.mainText, fontSize: '20px', fontWeight: '800' }}>Modify Payout</h2>
                                    <p style={{ margin: '4px 0 0 0', color: colors.primaryBlue, fontSize: '14px', fontWeight: '600' }}>
                                        {editingPayroll.employee?.fullName || `EMP-${editingPayroll.employee?.id}`}
                                    </p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'rgba(255,255,255,0.5)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.mainText }}>
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <div style={{ padding: '24px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: colors.secondaryText, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Manual Deduction (₹)
                                    </label>
                                    <input 
                                        type="number" 
                                        value={editForm.manualDeduction} 
                                        onChange={(e) => setEditForm({...editForm, manualDeduction: Number(e.target.value)})}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', fontSize: '15px', fontWeight: '700', color: colors.dangerText, boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: colors.secondaryText, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Manual Bonus (₹)
                                    </label>
                                    <input 
                                        type="number" 
                                        value={editForm.manualBonus} 
                                        onChange={(e) => setEditForm({...editForm, manualBonus: Number(e.target.value)})}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', fontSize: '15px', fontWeight: '700', color: colors.successText, boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: colors.secondaryText, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Reason / Remarks *
                                    </label>
                                    <textarea 
                                        value={editForm.remarks} 
                                        onChange={(e) => setEditForm({...editForm, remarks: e.target.value})}
                                        placeholder="E.g., Added extra performance bonus..."
                                        rows="3"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', fontSize: '14px', fontWeight: '500', color: colors.mainText, boxSizing: 'border-box', resize: 'none' }}
                                    />
                                </div>

                                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: `1px dashed ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: colors.secondaryText }}>Calculated Base</span>
                                    <span style={{ fontSize: '16px', fontWeight: '800', color: colors.mainText }}>
                                        {formatCurrency(editingPayroll.baseSalary || (editingPayroll.netSalary - (editingPayroll.manualBonus || editingPayroll.performanceBonus || editingPayroll.bonus || 0) + (editingPayroll.manualDeduction || editingPayroll.totalDeduction || editingPayroll.deduction || 0)))}
                                    </span>
                                </div>
                            </div>

                            <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'transparent', color: colors.secondaryText, border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                <button 
                                    onClick={handleSaveEdit} 
                                    disabled={isSaving}
                                    style={{ background: colors.primaryBlue, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '700', cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {isSaving ? 'Updating...' : 'Save Payout'}
                                </button>
                            </div>
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

export default ManagerPayroll;