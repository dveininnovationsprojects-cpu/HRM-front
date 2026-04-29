import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { Settings, Image as ImageIcon, CreditCard, Award } from 'lucide-react';

const AdminSettings = () => {
    const [config, setConfig] = useState({
        companyName: '', companyAddress: '',
        allowedPaidLeaves: 0, absentDeductionMultiplier: 0,
        referralBonusAmount: 0, performanceBonusThreshold: 0
    });

    useEffect(() => {
        // Load Initial Data [cite: 22]
        const fetchSettings = async () => {
            try {
                const res = await api.get('/api/settings');
                setConfig(res.data);
            } catch (err) { console.error("Settings load failed"); }
        };
        fetchSettings();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Save Branding & Rules [cite: 23]
            await api.put('/api/settings', config);
            alert("Settings Updated Successfully mamey!");
        } catch (err) { alert("Update failed!"); }
    };

    return (
        <DashboardLayout role="ADMIN" title="System Settings">
            <form onSubmit={handleUpdate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    
                    {/* A. Company Branding [cite: 22] */}
                    <div className="dashboard-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ImageIcon size={20}/> Branding</h3>
                        <input type="text" placeholder="Company Name" value={config.companyName} 
                            onChange={(e) => setConfig({...config, companyName: e.target.value})} style={{ marginBottom: '15px' }} />
                        <textarea placeholder="Company Address" value={config.companyAddress}
                            onChange={(e) => setConfig({...config, companyAddress: e.target.value})} style={{ height: '80px' }} />
                    </div>

                    {/* B. Payroll Rules [cite: 23] */}
                    <div className="dashboard-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CreditCard size={20}/> Payroll Rules</h3>
                        <label>Paid Leaves (Yearly):</label>
                        <input type="number" value={config.allowedPaidLeaves} 
                            onChange={(e) => setConfig({...config, allowedPaidLeaves: e.target.value})} style={{ marginBottom: '10px' }} />
                        <label>Absent Deduction (x):</label>
                        <input type="number" step="0.1" value={config.absentDeductionMultiplier}
                            onChange={(e) => setConfig({...config, absentDeductionMultiplier: e.target.value})} />
                    </div>

                    {/* C. Performance Rules [cite: 23] */}
                    <div className="dashboard-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Award size={20}/> Bonus Rules</h3>
                        <label>Referral Bonus (₹):</label>
                        <input type="number" value={config.referralBonusAmount}
                            onChange={(e) => setConfig({...config, referralBonusAmount: e.target.value})} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" style={{ width: '100%', background: '#3b82f6', color: '#fff', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                            Save Master Configuration
                        </button>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
};

export default AdminSettings;