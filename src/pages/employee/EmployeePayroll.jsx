import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { DollarSign, Download, FileText, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';

const EmployeePayroll = () => {
    const [payrollHistory, setPayrollHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    const [summary, setSummary] = useState({ totalEarnings: 0, latestSalary: 0, pendingMonths: 0 });

    const colors = {
        primaryBlue: '#2563EB',
        lightBlue: '#EAF2FF',
        background: '#F5F9FF',
        cardWhite: '#FFFFFF',
        mainText: '#0F172A',
        secondaryText: '#64748B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: '#DCE6F2'
    };

    useEffect(() => {
        fetchMyPayrollHistory();
    }, []);

    const fetchMyPayrollHistory = async () => {
        try {
            setLoading(true);
            // Employee strictly accessing only their personal payroll records
            const res = await api.get('/api/payroll/my-history');
            const data = res.data || [];
            
            // Sort by year and month descending (latest first)
            const sortedData = data.sort((a, b) => {
                if (b.year !== a.year) return b.year - a.year;
                return b.month - a.month;
            });
            
            setPayrollHistory(sortedData);
            calculateSummary(sortedData);
        } catch (error) {
            console.error("Failed to load payroll history", error);
            toast.error("Unable to load salary records.");
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (data) => {
        let total = 0;
        let pending = 0;
        let latest = data.length > 0 ? (data[0].netSalary || 0) : 0;

        data.forEach(record => {
            const status = record.status ? record.status.toUpperCase() : 'PENDING';
            if (status === 'PAID') {
                total += (record.netSalary || 0);
            } else {
                pending++;
            }
        });

        setSummary({
            totalEarnings: total,
            latestSalary: latest,
            pendingMonths: pending
        });
    };

    // PDF Download Logic handling BLOB response
    const handleDownloadPayslip = async (id, month, year) => {
        try {
            setDownloadingId(id); // Show loader for this specific button
            
            const response = await api.get(`/api/payroll/download/${id}`, {
                responseType: 'blob' // CRITICAL: Tells Axios to expect a binary file, not JSON
            });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Format month name for file (e.g., Payslip_Jan_2026.pdf)
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthName = monthNames[month - 1] || month;
            link.setAttribute('download', `Payslip_${monthName}_${year}.pdf`);
            
            // Append, click, and remove
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            toast.success("Payslip downloaded successfully!");
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Failed to download PDF. Please try again.");
        } finally {
            setDownloadingId(null);
        }
    };

    const getMonthName = (monthValue, yearValue) => {
    if (!monthValue) return "Pay Period"; // Fallback if data is missing
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Using parseInt to safely handle string numbers from JSON
    const monthIndex = parseInt(monthValue, 10) - 1; 
    const monthStr = monthNames[monthIndex] || monthValue;
    
    return `${monthStr} ${yearValue || ''}`.trim();
};

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const getStatusStyle = (status) => {
        const s = status ? status.toUpperCase() : '';
        if (s === 'PAID') return { bg: '#ecfdf5', color: colors.success, icon: <CheckCircle size={14} /> };
        if (s === 'PENDING') return { bg: '#fffbeb', color: colors.warning, icon: <Clock size={14} /> };
        return { bg: '#fef2f2', color: colors.danger, icon: <AlertCircle size={14} /> };
    };

    const cardStyle = {
        background: colors.cardWhite,
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${colors.border}`,
        fontFamily: "'Inter', sans-serif"
    };

    return (
        <DashboardLayout role="EMPLOYEE" title="My Earnings & Payslips">
            <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
                
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600', color: colors.mainText, margin: '0 0 8px 0' }}>
                        Salary & Payslips
                    </h1>
                    <p style={{ color: colors.secondaryText, fontSize: '15px', margin: 0 }}>
                        View your salary history, deductions, and download official payslips.
                    </p>
                </div>

                {/* 1. Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '50%', color: colors.success }}>
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Latest Net Pay</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>
                                {loading ? '-' : formatCurrency(summary.latestSalary)}
                            </h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '50%', color: colors.primaryBlue }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Total Earnings (YTD)</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>
                                {loading ? '-' : formatCurrency(summary.totalEarnings)}
                            </h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '50%', color: colors.warning }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Pending Transactions</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>
                                {loading ? '-' : summary.pendingMonths} Month(s)
                            </h3>
                        </div>
                    </div>
                </div>

                {/* 2. Detailed Payslip Table */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.mainText, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={20} color={colors.primaryBlue} /> Payroll History
                    </h2>
                    
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${colors.border}`, backgroundColor: '#fafafa' }}>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Pay Period</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Basic Salary</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Bonus/Incentive</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Deductions</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Net Payable</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: colors.secondaryText }}>Loading salary records...</td>
                                    </tr>
                                ) : payrollHistory.length > 0 ? (
                                    payrollHistory.map((payroll, index) => {
                                        const statusStyle = getStatusStyle(payroll.status);
                                        return (
                                            <tr key={index} style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s', backgroundColor: '#fff', ':hover': { backgroundColor: '#f8fafc' } }}>
                                                <td style={{ padding: '16px', color: colors.mainText, fontWeight: '600', fontSize: '14px' }}>
                                                    {getMonthName(payroll.month)} {payroll.year}
                                                </td>
                                                <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px' }}>
                                                    {formatCurrency(payroll.basicSalary)}
                                                </td>
                                                <td style={{ padding: '16px', color: colors.success, fontSize: '14px', fontWeight: '500' }}>
                                                    + {formatCurrency(payroll.bonus)}
                                                </td>
                                                <td style={{ padding: '16px', color: colors.danger, fontSize: '14px', fontWeight: '500' }}>
                                                    - {formatCurrency(payroll.deduction)}
                                                </td>
                                                <td style={{ padding: '16px', color: colors.mainText, fontWeight: '700', fontSize: '15px' }}>
                                                    {formatCurrency(payroll.netSalary)}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{ 
                                                        background: statusStyle.bg, 
                                                        color: statusStyle.color, 
                                                        padding: '6px 12px', 
                                                        borderRadius: '20px', 
                                                        fontSize: '12px', 
                                                        fontWeight: '600',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        {statusStyle.icon} {payroll.status || "PENDING"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                                    <button 
                                                        onClick={() => handleDownloadPayslip(payroll.id, payroll.month, payroll.year)}
                                                        disabled={downloadingId === payroll.id}
                                                        style={{ 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            gap: '6px', 
                                                            padding: '8px 16px', 
                                                            background: colors.lightBlue, 
                                                            color: colors.primaryBlue, 
                                                            border: 'none', 
                                                            borderRadius: '6px', 
                                                            cursor: downloadingId === payroll.id ? 'not-allowed' : 'pointer', 
                                                            fontSize: '13px', 
                                                            fontWeight: '600',
                                                            opacity: downloadingId === payroll.id ? 0.7 : 1
                                                        }}
                                                    >
                                                        {downloadingId === payroll.id ? (
                                                            <span>Loading...</span>
                                                        ) : (
                                                            <>
                                                                <Download size={14} /> PDF
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: colors.secondaryText }}>
                                            <FileText size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                            <p style={{ margin: 0 }}>No payslips generated yet.</p>
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

export default EmployeePayroll;