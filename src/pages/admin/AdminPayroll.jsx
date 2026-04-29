import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import { DollarSign, FileCheck, AlertCircle, TrendingUp, Download } from 'lucide-react';
import api from '../../api/apiConfig';

const AdminPayroll = () => {
    const [analytics, setAnalytics] = useState({});
    const [payrolls, setPayrolls] = useState([]);
    const [month, setMonth] = useState("01");
    const [year, setYear] = useState("2026");

    // 1. Fetch Analytics & List [cite: 18, 19]
    const fetchPayrollData = async () => {
        try {
            const anaRes = await api.get(`/api/payroll/analytics?month=${month}&year=${year}`);
            setAnalytics(anaRes.data);
            const viewRes = await api.get(`/api/payroll/view?month=${month}&year=${year}`);
            setPayrolls(viewRes.data);
        } catch (err) { console.error("Payroll load failed"); }
    };

    useEffect(() => {
        fetchPayrollData();
    }, [month, year]);

    // 2. Generate Payroll Logic 
    const handleGenerate = async () => {
        try {
            await api.post(`/api/payroll/generate?month=${month}&year=${year}`);
            alert("Payroll generated successfully mamey! ");
            fetchPayrollData();
        } catch (err) { alert("Generation failed or already exists!"); }
    };

    return (
        <DashboardLayout role="ADMIN" title="Payroll Master Control">
            {/* Summary Cards [cite: 18] */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <StatCard title="Total Amount" value={`₹${analytics.totalPayrollAmount || 0}`} icon={<DollarSign />} color="#3b82f6" />
                <StatCard title="Paid Count" value={analytics.paidCount || 0} icon={<FileCheck />} color="#10b981" />
                <StatCard title="Pending" value={analytics.pendingCount || 0} icon={<AlertCircle />} color="#f59e0b" />
                <StatCard title="Deductions" value={`₹${analytics.totalDeductions || 0}`} icon={<TrendingUp />} color="#ef4444" />
            </div>

            <div className="dashboard-card">
                {/* Control Header  */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: '8px', borderRadius: '8px' }}>
                            <option value="01">January</option><option value="02">February</option>
                        </select>
                        <select value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: '8px', borderRadius: '8px' }}>
                            <option value="2026">2026</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleGenerate} style={{ background: '#10b981', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Generate Payroll</button>
                        <button style={{ background: '#3b82f6', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px' }}>Upload Bank File </button>
                    </div>
                </div>

                {/* Payroll Table  */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                            <th style={{ padding: '15px' }}>EMPLOYEE</th>
                            <th>BIO ID</th>
                            <th>NET SALARY</th>
                            <th>BONUS</th>
                            <th>STATUS</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payrolls.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '15px', fontWeight: '600' }}>{p.employeeName}</td>
                                <td>{p.biometricId}</td>
                                <td>₹{p.netSalary}</td>
                                <td style={{ color: '#10b981' }}>+₹{p.bonus}</td>
                                <td>
                                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', background: p.status === 'PAID' ? '#dcfce7' : '#fee2e2', color: p.status === 'PAID' ? '#16a34a' : '#dc2626' }}>
                                        {p.status} 
                                    </span>
                                </td>
                                <td>
                                    <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Download size={18} /> </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};

export default AdminPayroll;