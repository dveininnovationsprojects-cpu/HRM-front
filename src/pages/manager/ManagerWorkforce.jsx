import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { UserCog, Award } from 'lucide-react';

const ManagerWorkforce = () => {
    return (
        <DashboardLayout role="MANAGER" title="Human Capital Development">
            <div className="dashboard-card" style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <UserCog size={24} color="#3b82f6" />
                    <h3 style={{ margin: 0 }}>Skill Classification & Training Batches</h3>
                </div>
                
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>
                    Monitor employee career progression by assigning Trainer and Trainee designations. 
                    Configure specialized learning batches to enhance organizational efficiency and track departmental growth. 
                </p>

                <div style={{ padding: '20px', border: '1px dashed #e2e8f0', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                    Employee Skill Management Console is operational. 
                </div>
            </div>
        </DashboardLayout>
    );
};
export default ManagerWorkforce;