import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout'; 
import StatCard from '../components/StatCard'; 
import api from '../api/apiConfig';                       
import { Users, GraduationCap, Clock, DollarSign, Activity, Calendar, Loader2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const ManagerDashboard = () => {
    // 🟢 Real Analytics States
    const [trainingStats, setTrainingStats] = useState({ 
        totalEmployees: 0, 
        completedTraining: 0, 
        pendingTraining: 0 
    });
    
    const [payrollStats, setPayrollStats] = useState({ 
        totalPayout: 0, 
        totalDeductions: 0,
        paidCount: 0, 
        pendingCount: 0,
    });

    const [loading, setLoading] = useState(true);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF',
        mainText: '#0F172A', secondaryText: '#64748B',
        successBg: '#DCFCE7', successText: '#16A34A',
        warningBg: '#FEF9C3', warningText: '#CA8A04',
        dangerBg: '#FEE2E2', dangerText: '#DC2626',
        border: '#E2E8F0', cardWhite: '#FFFFFF'
    };

    const PIE_COLORS = ['#10B981', '#F59E0B'];

    useEffect(() => {
        fetchDashboardData();
    }, [month, year]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 🟢 DYNAMIC MAGIC 1: Employees API
            try {
                const empRes = await api.get('/api/employees');
                const employees = Array.isArray(empRes.data) ? empRes.data : [];
                
                const total = employees.length; 
                const completed = employees.filter(e => e.designationStatus === 'PERMANENT' || e.designationStatus === 'TRAINER').length;
                const pending = employees.filter(e => e.designationStatus === 'TRAINEE').length;
                
                setTrainingStats({ 
                    totalEmployees: total, 
                    completedTraining: completed, 
                    pendingTraining: pending 
                });
            } catch (err) {
                console.error("Employees API Failed:", err);
            }

            // 🟢 DYNAMIC MAGIC 2: Payroll API
            try {
                const statRes = await api.get(`/api/payroll/analytics?month=${month}&year=${year}`);
                const analytics = statRes.data || {};
                
                const totalPay = analytics.totalPayout || 0;
                const totalDed = analytics.totalDeductions || 0;
                
                const breakdown = analytics.statusBreakdown || {};
                const paidC = breakdown['PAID'] || 0;
                const pendC = (breakdown['GENERATED'] || 0) + (breakdown['PENDING'] || 0);

                setPayrollStats({ 
                    totalPayout: totalPay, 
                    totalDeductions: totalDed,
                    paidCount: paidC, 
                    pendingCount: pendC,
                });
            } catch (err) {
                console.error("Payroll Analytics API Failed:", err);
            }

        } catch (error) {
            console.error("Dashboard Load Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
    };

    const financialData = [
        { name: 'Total Payout', amount: payrollStats.totalPayout, fill: colors.primaryBlue },
        { name: 'Total Deductions', amount: payrollStats.totalDeductions, fill: '#EF4444' }
    ];

    const distributionData = [
        { name: 'Paid', value: payrollStats.paidCount },
        { name: 'Pending', value: payrollStats.pendingCount }
    ];

    if (loading) {
        return (
            <DashboardLayout role="MANAGER" title="Executive Dashboard">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <Loader2 className="animate-spin" size={40} color="#3b82f6" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="MANAGER" title="Executive Dashboard">
            <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '30px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '800', color: colors.mainText, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                            Executive Dashboard
                        </h1>
                        <p style={{ color: colors.secondaryText, fontSize: '15px', margin: 0 }}>
                            High-level overview of workforce performance and financial analytics.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', background: colors.cardWhite, padding: '6px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ padding: '6px 10px', border: 'none', background: '#F8FAFC', borderRadius: '6px', fontWeight: '600', color: colors.mainText, outline: 'none', cursor: 'pointer', fontSize: '13px' }}>
                            {monthNames.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                        </select>
                        <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ padding: '6px 10px', border: 'none', background: '#F8FAFC', borderRadius: '6px', fontWeight: '600', color: colors.mainText, outline: 'none', cursor: 'pointer', fontSize: '13px' }}>
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <StatCard title="Total Employees" value={trainingStats.totalEmployees} icon={<Users />} color="#3b82f6" />
                    <StatCard title="Training Certified" value={trainingStats.completedTraining} icon={<GraduationCap />} color="#10b981" />
                    <StatCard title="Training Pending" value={trainingStats.pendingTraining} icon={<Clock />} color="#f59e0b" />
                    <StatCard title={`${monthNames[month-1]} Payout`} value={formatCurrency(payrollStats.totalPayout)} icon={<DollarSign />} color="#8b5cf6" />
                </div>

                <h3 style={{ fontSize: '18px', color: colors.mainText, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                    <TrendingUp size={20} color={colors.successText} /> Monthly Financial Analytics
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                    
                    {/* BAR CHART: Fixed ResponsiveContainer warning */}
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ margin: '0 0 20px 0', color: colors.secondaryText, fontSize: '14px', fontWeight: '600' }}>Gross Payout vs Deductions Overview</h4>
                        <div style={{ height: 300, width: '100%', minWidth: 0 }}>
                            <ResponsiveContainer width="99%" height={300}>
                                <BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13 }} tickFormatter={(value) => `₹${value/1000}k`} />
                                    <Tooltip cursor={{ fill: '#F8FAFC' }} formatter={(value) => [formatCurrency(value), 'Amount']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* PIE CHART: Fixed ResponsiveContainer warning */}
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ margin: '0 0 20px 0', color: colors.secondaryText, fontSize: '14px', fontWeight: '600' }}>Payroll Status Distribution</h4>
                        {(payrollStats.paidCount > 0 || payrollStats.pendingCount > 0) ? (
                            <div style={{ height: 300, width: '100%', minWidth: 0 }}>
                                <ResponsiveContainer width="99%" height={300}>
                                    <PieChart>
                                        <Pie data={distributionData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                                            {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value) => [value, 'Employees']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={{ height: 300, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94A3B8' }}>
                                <Calendar size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                                <p style={{ margin: 0, fontWeight: '500' }}>No payroll data generated yet for this month.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
            <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </DashboardLayout>
    );
};

export default ManagerDashboard;