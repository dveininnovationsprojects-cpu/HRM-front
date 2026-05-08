import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { Users, GraduationCap, Trash2, CheckCircle, PlusCircle, ShieldAlert, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerWorkforce = () => {
    const [employees, setEmployees] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Batch Creation State
    const [batchName, setBatchName] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedTrainer, setSelectedTrainer] = useState('');
    const [selectedTrainees, setSelectedTrainees] = useState([]);

    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF',
        mainText: '#0F172A', secondaryText: '#64748B',
        successBg: '#DCFCE7', successText: '#16A34A',
        warningBg: '#FEF9C3', warningText: '#CA8A04',
        dangerBg: '#FEE2E2', dangerText: '#DC2626',
        border: '#E2E8F0', cardWhite: '#FFFFFF'
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        let empData = [];
        let batchData = [];

        // 🟢 MASS FIX: Separated API calls so one failure doesn't crash the UI with Toast errors.
        try {
            const empRes = await api.get('/api/employees');
            empData = empRes.data || [];
        } catch (error) {
            console.warn("Employees API restricted or unavailable.");
        }

        try {
            const batchRes = await api.get('/api/manager/view-batches');
            batchData = batchRes.data || [];
        } catch (error) {
            console.warn("View Batches API restricted or unavailable.");
        }

        setEmployees(empData);
        setBatches(batchData);
        setLoading(false);
    };

    // ==========================================
    // DESIGNATION UPDATE LOGIC (Trainer / Trainee)
    // ==========================================
    const handleDesignationUpdate = async (empId, newStatus) => {
        try {
            if (newStatus === 'REMOVE') {
                await api.delete(`/api/manager/remove-designation/${empId}`);
                toast.success("Designation removed successfully.");
            } else {
                await api.put(`/api/manager/update-designation?employeeId=${empId}&status=${newStatus}`);
                toast.success(`Employee designated as ${newStatus}`);
            }
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data || "Failed to update designation");
        }
    };

    // ==========================================
    // BATCH CREATION LOGIC
    // ==========================================
    const handleCreateBatch = async (e) => {
        e.preventDefault();
        if (!selectedTrainer || selectedTrainees.length === 0 || !batchName || !endDate) {
            toast.error("Please fill all batch details and select trainees.");
            return;
        }

        const formData = new FormData();
        formData.append('trainerId', selectedTrainer);
        formData.append('traineeIds', selectedTrainees.join(','));
        formData.append('batchName', batchName);
        formData.append('endDate', endDate);

        const toastId = toast.loading('Creating Training Batch...');
        try {
            await api.post('/api/manager/create-batch', formData);
            toast.success("Batch Created and Users Notified!", { id: toastId });
            
            // Reset Form
            setBatchName(''); setEndDate(''); setSelectedTrainer(''); setSelectedTrainees([]);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data || "Failed to create batch", { id: toastId });
        }
    };

    // ==========================================
    // BATCH DELETION LOGIC
    // ==========================================
    const handleDeleteBatch = async (batchId) => {
        if (!window.confirm("Are you sure you want to delete this batch? Trainees will be freed.")) return;
        
        try {
            await api.delete(`/api/manager/delete-batch/${batchId}`);
            toast.success("Batch Deleted Successfully.");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete batch.");
        }
    };

    // Filters for Dropdowns
    const trainers = employees.filter(e => e.designationStatus === 'TRAINER');
    const trainees = employees.filter(e => e.designationStatus === 'TRAINEE');

    return (
        <DashboardLayout role="MANAGER" title="Workforce & Training">
            <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>
                        Workforce & Training Management
                    </h1>
                    {loading && <Loader2 className="animate-spin" color={colors.primaryBlue} size={20} />}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '30px' }}>
                    
                    {/* 1. BATCH CREATION FORM */}
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: colors.primaryBlue }}>
                            <GraduationCap size={20} /> Create New Batch
                        </h3>
                        <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.secondaryText, marginBottom: '6px' }}>Batch Name</label>
                                <input required value={batchName} onChange={(e) => setBatchName(e.target.value)} type="text" placeholder="e.g. React Novices 2026" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.secondaryText, marginBottom: '6px' }}>End Date</label>
                                <input required value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.secondaryText, marginBottom: '6px' }}>Select Trainer</label>
                                <select required value={selectedTrainer} onChange={(e) => setSelectedTrainer(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, outline: 'none' }}>
                                    <option value="">-- Choose a Trainer --</option>
                                    {trainers.map(t => <option key={t.id} value={t.id}>{t.fullName} (EMP-{t.id})</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.secondaryText, marginBottom: '6px' }}>Select Trainees (Hold Ctrl to select multiple)</label>
                                <select required multiple value={selectedTrainees} onChange={(e) => setSelectedTrainees(Array.from(e.target.selectedOptions, option => option.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, minHeight: '100px', outline: 'none' }}>
                                    {trainees.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                                </select>
                            </div>
                            <button type="submit" style={{ background: colors.primaryBlue, color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 4px 10px rgba(37,99,235,0.2)' }}>
                                <PlusCircle size={18} /> Assign Batch
                            </button>
                        </form>
                    </div>

                    {/* 2. ACTIVE BATCHES LIST */}
                    <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflowY: 'auto', maxHeight: '550px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: colors.mainText }}>
                            <Users size={20} /> Active Training Batches
                        </h3>
                        {batches.length > 0 ? batches.map(batch => (
                            <div key={batch.id} style={{ border: `1px solid ${colors.border}`, padding: '16px', borderRadius: '12px', marginBottom: '16px', position: 'relative' }}>
                                <button onClick={() => handleDeleteBatch(batch.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: colors.dangerBg, color: colors.dangerText, border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                                    <Trash2 size={16} />
                                </button>
                                <h4 style={{ margin: '0 0 8px 0', color: colors.primaryBlue }}>{batch.batchName}</h4>
                                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: colors.secondaryText }}><strong>Trainer:</strong> {batch.trainer?.fullName}</p>
                                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: colors.secondaryText }}><strong>End Date:</strong> {batch.endDate}</p>
                                <div style={{ background: colors.lightBlue, padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: colors.mainText }}>
                                    <strong>Trainees:</strong> {batch.trainees?.map(t => t.fullName).join(', ') || 'None'}
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: colors.secondaryText }}>
                                <ShieldAlert size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                <p>No active batches found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. DESIGNATION MASTER TABLE */}
                <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: colors.mainText }}>Employee Designations</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${colors.border}`, background: '#FAFAFA' }}>
                                    <th style={{ padding: '12px 16px', color: colors.secondaryText, fontSize: '13px' }}>Employee</th>
                                    <th style={{ padding: '12px 16px', color: colors.secondaryText, fontSize: '13px' }}>Department</th>
                                    <th style={{ padding: '12px 16px', color: colors.secondaryText, fontSize: '13px' }}>Current Status</th>
                                    <th style={{ padding: '12px 16px', color: colors.secondaryText, fontSize: '13px' }}>Update Designation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: colors.secondaryText }}>Loading workforce...</td>
                                    </tr>
                                ) : employees.length > 0 ? employees.map(emp => (
                                    <tr key={emp.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                        <td style={{ padding: '16px', fontWeight: '600', color: colors.mainText }}>{emp.fullName}</td>
                                        <td style={{ padding: '16px', color: colors.secondaryText }}>{emp.department}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ 
                                                padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                                background: emp.designationStatus === 'TRAINER' ? colors.successBg : (emp.designationStatus === 'TRAINEE' ? colors.warningBg : '#F1F5F9'),
                                                color: emp.designationStatus === 'TRAINER' ? colors.successText : (emp.designationStatus === 'TRAINEE' ? colors.warningText : colors.secondaryText)
                                            }}>
                                                {emp.designationStatus || 'NORMAL'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <select 
                                                onChange={(e) => handleDesignationUpdate(emp.id, e.target.value)}
                                                value={emp.designationStatus || 'REMOVE'}
                                                style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontSize: '13px', cursor: 'pointer', outline: 'none' }}
                                            >
                                                <option value="REMOVE">Normal Employee</option>
                                                <option value="TRAINER">Set as TRAINER</option>
                                                <option value="TRAINEE">Set as TRAINEE</option>
                                            </select>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: colors.secondaryText }}>No employees found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </DashboardLayout>
    );
};

export default ManagerWorkforce;