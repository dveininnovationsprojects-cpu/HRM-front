import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { FileText, DollarSign, TrendingDown, Clock, CheckCircle, RefreshCw, Download, PlayCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerPayroll = () => {
    // State for Month/Year Selection
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    
    // Data States
    const [payrolls, setPayrolls] = useState([]);
    const [stats, setStats] = useState({ totalPayout: 0, totalDeductions: 0, paidCount: 0, pendingCount: 0 });
    
    // Loading States
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    // Filter State
    const [statusFilter, setStatusFilter] = useState('ALL');

    // ==========================================
    // ELITE COLOR PALETTE
    // ==========================================
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF',
        mainText: '#0F172A', secondaryText: '#64748B',
        successBg: '#DCFCE7', successText: '#16A34A',
        warningBg: '#FFF7ED', warningText: '#EA580C',
        dangerBg: '#FEE2E2', dangerText: '#DC2626',
        border: '#E2E8F0', cardWhite: '#FFFFFF'
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Initial Load & when Month/Year changes
    useEffect(() => {
        fetchPayrollData();
    }, [month, year, statusFilter]);

    // ==========================================
    // 1. FETCH PAYROLL & ANALYTICS
    // ==========================================
    const fetchPayrollData = async () => {
        setLoading(true);
        try {
            // Fetch Analytics
            const statRes = await api.get(`/api/payroll/analytics?month=${month}&year=${year}`);
            if (statRes.data) {
                setStats({
                    totalPayout: statRes.data.totalPayout || 0,
                    totalDeductions: statRes.data.totalDeductions || 0,
                    paidCount: statRes.data.paidCount || 0,
                    pendingCount: statRes.data.pendingCount || 0
                });
            }

            // Fetch Table Data (With or Without Filter)
            let endpoint = statusFilter === 'ALL' 
                ? `/api/payroll/view?month=${month}&year=${year}`
                : `/api/payroll/filter?month=${month}&year=${year}&status=${statusFilter}`;
                
            const listRes = await api.get(endpoint);
            setPayrolls(listRes.data || []);
            
        } catch (error) {
            console.error("Failed to fetch payroll data");
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
            fetchPayrollData(); // Refresh table and stats
        } catch (error) {
            toast.error(error.response?.data || "Failed to generate payroll.", { id: toastId });
        } finally {
            setGenerating(false);
        }
    };

    // ==========================================
    // 3. DOWNLOAD PAYSLIP LOGIC
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
            <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '30px' }}>
                
                {/* HEADER & CONTROLS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: '0 0 8px 0' }}>
                            Payroll Operations Review
                        </h1>
                        <p style={{ color: colors.secondaryText, fontSize: '15px', margin: 0 }}>
                            Generate monthly salaries and review company payout analytics.
                        </p>
                    </div>
                    
                    {/* Period Selector */}
                    <div style={{ display: 'flex', gap: '12px', background: colors.cardWhite, padding: '8px', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ padding: '8px 12px', border: 'none', background: '#F8FAFC', borderRadius: '6px', fontWeight: '600', color: colors.mainText, outline: 'none', cursor: 'pointer' }}>
                            {monthNames.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                        </select>
                        <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ padding: '8px 12px', border: 'none', background: '#F8FAFC', borderRadius: '6px', fontWeight: '600', color: colors.mainText, outline: 'none', cursor: 'pointer' }}>
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* TOP STAT CARDS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '50%', color: colors.primaryBlue }}>
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>Total Net Payout</p>
                            <h2 style={{ color: colors.mainText, fontSize: '24px', fontWeight: '700', margin: 0 }}>{formatCurrency(stats.totalPayout)}</h2>
                        </div>
                    </div>

                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: colors.dangerBg, padding: '16px', borderRadius: '50%', color: colors.dangerText }}>
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>Total Deductions</p>
                            <h2 style={{ color: colors.mainText, fontSize: '24px', fontWeight: '700', margin: 0 }}>{formatCurrency(stats.totalDeductions)}</h2>
                        </div>
                    </div>

                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: colors.successBg, padding: '16px', borderRadius: '50%', color: colors.successText }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>Paid Employees</p>
                            <h2 style={{ color: colors.mainText, fontSize: '24px', fontWeight: '700', margin: 0 }}>{stats.paidCount}</h2>
                        </div>
                    </div>

                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: colors.warningBg, padding: '16px', borderRadius: '50%', color: colors.warningText }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>Pending Transfers</p>
                            <h2 style={{ color: colors.mainText, fontSize: '24px', fontWeight: '700', margin: 0 }}>{stats.pendingCount}</h2>
                        </div>
                    </div>
                </div>

                {/* PAYROLL LIST & GENERATE ACTION */}
                <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                        <h3 style={{ margin: 0, color: colors.mainText, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={20} color={colors.primaryBlue} /> Master Payroll Register
                        </h3>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {/* Filter Dropdown */}
                            <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', padding: '6px 12px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                                <Filter size={16} color={colors.secondaryText} style={{ marginRight: '8px' }} />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: '600', color: colors.mainText, cursor: 'pointer' }}>
                                    <option value="ALL">All Status</option>
                                    <option value="GENERATED">Generated</option>
                                    <option value="PAID">Paid</option>
                                </select>
                            </div>
                            
                            {/* Generate Button */}
                            <button 
                                onClick={handleGeneratePayroll}
                                disabled={generating}
                                style={{ background: generating ? '#94A3B8' : colors.primaryBlue, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: '0.2s', boxShadow: generating ? 'none' : '0 4px 6px rgba(37,99,235,0.2)' }}
                            >
                                {generating ? <RefreshCw size={18} className="animate-spin" /> : <PlayCircle size={18} />}
                                {generating ? 'Processing...' : `Generate ${monthNames[month-1]} Payroll`}
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${colors.border}`, backgroundColor: '#FAFAFA' }}>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Employee</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Basic Salary</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Bonus</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Deductions</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Net Pay</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Download</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: colors.secondaryText }}>
                                            <RefreshCw size={24} className="animate-spin" style={{ marginBottom: '10px', color: colors.primaryBlue }} />
                                            <p style={{ margin: 0 }}>Loading payroll data...</p>
                                        </td>
                                    </tr>
                                ) : payrolls.length > 0 ? (
                                    payrolls.map((payroll) => {
                                        const empName = payroll.employee?.fullName || `EMP-${payroll.employee?.id}`;
                                        const actualBonus = payroll.performanceBonus || payroll.bonus || 0;
                                        const actualDeduction = payroll.totalDeduction || payroll.deduction || 0;
                                        const actualBaseSalary = payroll.baseSalary || (payroll.netSalary - actualBonus + actualDeduction);
                                        const isPaid = payroll.status === 'PAID';

                                        return (
                                            <tr key={payroll.id} style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s', ':hover': { backgroundColor: '#F8FAFC' } }}>
                                                <td style={{ padding: '16px', color: colors.mainText, fontWeight: '600', fontSize: '14px' }}>
                                                    {empName}
                                                </td>
                                                <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px', fontWeight: '500' }}>
                                                    {formatCurrency(actualBaseSalary)}
                                                </td>
                                                <td style={{ padding: '16px', color: colors.successText, fontSize: '14px', fontWeight: '600' }}>
                                                    + {formatCurrency(actualBonus)}
                                                </td>
                                                <td style={{ padding: '16px', color: colors.dangerText, fontSize: '14px', fontWeight: '600' }}>
                                                    - {formatCurrency(actualDeduction)}
                                                </td>
                                                <td style={{ padding: '16px', color: colors.mainText, fontWeight: '800', fontSize: '15px' }}>
                                                    {formatCurrency(payroll.netSalary)}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{ 
                                                        background: isPaid ? colors.successBg : colors.lightBlue, 
                                                        color: isPaid ? colors.successText : colors.primaryBlue, 
                                                        padding: '6px 12px', 
                                                        borderRadius: '20px', 
                                                        fontSize: '11px', 
                                                        fontWeight: '700',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {payroll.status || 'GENERATED'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                                    <button 
                                                        onClick={() => handleDownloadPayslip(payroll.id, empName)}
                                                        disabled={downloadingId === payroll.id}
                                                        style={{ background: '#F1F5F9', color: colors.mainText, border: `1px solid ${colors.border}`, padding: '8px 12px', borderRadius: '8px', cursor: downloadingId === payroll.id ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', transition: '0.2s' }}
                                                        onMouseOver={(e) => { if(downloadingId !== payroll.id) e.currentTarget.style.background = '#E2E8F0' }}
                                                        onMouseOut={(e) => { if(downloadingId !== payroll.id) e.currentTarget.style.background = '#F1F5F9' }}
                                                    >
                                                        {downloadingId === payroll.id ? 'Wait...' : <><Download size={14} /> PDF</>}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: colors.secondaryText }}>
                                            <DollarSign size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                            <p style={{ margin: 0, fontSize: '15px' }}>No payroll data found for {monthNames[month-1]} {year}. Click "Generate" to process salaries.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default ManagerPayroll;