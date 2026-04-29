import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { PieChart, TrendingUp } from 'lucide-react';

const ManagerPayroll = () => {
    return (
        <DashboardLayout role="MANAGER" title="Payroll & Financial Analytics">
            <div className="dashboard-card" style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <TrendingUp size={24} color="#10b981" />
                    <h3 style={{ margin: 0 }}>Team Compensation Analysis</h3>
                </div>

                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>
                    Review comprehensive monthly payroll reports and expenditure distributions for your department. 
                    Validate bonus allocations and monitor fiscal trends to ensure payroll compliance. 
                </p>

                <div style={{ padding: '20px', border: '1px dashed #e2e8f0', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                    Financial reporting interface is synchronized with the core engine.
                </div>
            </div>
        </DashboardLayout>
    );
};
export default ManagerPayroll;