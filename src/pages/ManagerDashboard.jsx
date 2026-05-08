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
            // 🟢 MAGIC 1: Employees API
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

            // 🟢 MAGIC 2: Payroll API
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
            {/* 🟢 ALIGNMENT FIX: Using consistent padding to match Performance page */}
            <div style={{ padding: '24px 32px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                
                {/* 🟢 HEADER: Consistent with Performance Intelligence look */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.mainText, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                            Executive Dashboard
                        </h1>
                        <p style={{ color: colors.secondaryText, fontSize: '15px', margin: 0 }}>
                            High-level overview of workforce performance and financial analytics.
                        </p>
                    </div>

                    {/* Filter Area: Matched with Performance Workspace Select Style */}
                    <div style={{ display: 'flex', gap: '12px', background: colors.cardWhite, padding: '10px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                        <Calendar size={18} color={colors.primaryBlue} />
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ border: 'none', background: 'transparent', fontWeight: '700', color: colors.mainText, outline: 'none', cursor: 'pointer', fontSize: '14px' }}>
                            {monthNames.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                        </select>
                        <div style={{ width: '1px', background: colors.border, height: '20px' }}></div>
                        <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ border: 'none', background: 'transparent', fontWeight: '700', color: colors.mainText, outline: 'none', cursor: 'pointer', fontSize: '14px' }}>
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '35px' }}>
                    <StatCard title="Total Employees" value={trainingStats.totalEmployees} icon={<Users />} color="#3b82f6" />
                    <StatCard title="Training Certified" value={trainingStats.completedTraining} icon={<GraduationCap />} color="#10b981" />
                    <StatCard title="Training Pending" value={trainingStats.pendingTraining} icon={<Clock />} color="#f59e0b" />
                    <StatCard title={`${monthNames[month-1]} Payout`} value={formatCurrency(payrollStats.totalPayout)} icon={<DollarSign />} color="#8b5cf6" />
                </div>

                <h3 style={{ fontSize: '18px', color: colors.mainText, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                    <TrendingUp size={22} color={colors.primaryBlue} /> Monthly Financial Intelligence
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
                    
                    {/* BAR CHART */}
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ margin: '0 0 20px 0', color: colors.secondaryText, fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gross Payout vs Deductions</h4>
                        <div style={{ height: 300, width: '100%' }}>
                            <ResponsiveContainer width="99%" height={300}>
                                <BarChart data={financialData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: colors.secondaryText, fontSize: 12, fontWeight: 500 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.secondaryText, fontSize: 12 }} tickFormatter={(value) => `₹${value/1000}k`} />
                                    <Tooltip cursor={{ fill: '#F8FAFC' }} formatter={(value) => [formatCurrency(value), 'Amount']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* PIE CHART */}
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ margin: '0 0 20px 0', color: colors.secondaryText, fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payroll Disbursement Status</h4>
                        {(payrollStats.paidCount > 0 || payrollStats.pendingCount > 0) ? (
                            <div style={{ height: 300, width: '100%' }}>
                                <ResponsiveContainer width="99%" height={300}>
                                    <PieChart>
                                        <Pie data={distributionData} cx="50%" cy="50%" innerRadius={75} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                                            {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value) => [value, 'Employees']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: '700', color: colors.secondaryText, paddingTop: '20px' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={{ height: 300, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94A3B8' }}>
                                <Calendar size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <p style={{ margin: 0, fontWeight: '600' }}>No active payroll data found for this period.</p>
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