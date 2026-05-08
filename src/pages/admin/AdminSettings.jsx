import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    Settings, Building2, Calculator, Clock, UploadCloud, 
    Save, Image as ImageIcon, Briefcase, PlusCircle, Trash2, 
    UserCheck, Shield, KeyRound, Loader2, XCircle
} from 'lucide-react';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('BRANDING');
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [uploadingType, setUploadingType] = useState(null);

    // ==========================================
    // 1. STATE CONFIGS
    // ==========================================
    const [config, setConfig] = useState({
        companyName: '', companyAddress: '', companyLogo: null, authorizedSignature: null,
        allowedPaidLeaves: 0, absentDeductionMultiplier: 0, halfDayLeaveDeductionMultiplier: 0,
        lateDeductionMultiplier: 0, referralBonusAmount: 0, performanceBonusThreshold: 0
    });

    const [shifts, setShifts] = useState([]);
    const [shiftForm, setShiftForm] = useState({ name: '', startTime: '', endTime: '', lateThreshold: '' });
    const [assignForm, setAssignForm] = useState({ employeeId: '', shiftId: '' });
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

    // Elite Theme Palette
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        mainText: '#0F172A', secondaryText: '#64748B', successBg: '#DCFCE7', successText: '#16A34A',
        dangerBg: '#FEE2E2', dangerText: '#DC2626', warningBg: '#FFF7ED', warningText: '#EA580C',
        border: '#E2E8F0', cardWhite: '#FFFFFF', inputBg: '#F1F5F9'
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            // Fetch Settings Config (Connected to GET /api/settings)
            const configRes = await api.get('/api/settings');
            if (configRes.data) setConfig(configRes.data);

            // Fetch Employees for Shift Assignment
            const empRes = await api.get('/api/employees').catch(() => ({ data: [] }));
            setEmployees(empRes.data || []);
        } catch (error) {
            toast.error("Error connecting to settings database.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfigChange = (e) => setConfig({ ...config, [e.target.name]: e.target.value });

    // ==========================================
    // 2. BRANDING & IMAGES API LOGIC
    // ==========================================
    const saveGeneralSettings = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Saving General Settings...');
        try {
            // Connected to PUT /api/settings
            await api.put('/api/settings', { 
                companyName: config.companyName, 
                companyAddress: config.companyAddress 
            });
            toast.success("Branding updated successfully!", { id: toastId });
        } catch (error) {
            toast.error("Failed to update settings.", { id: toastId });
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingType(type);
        const formData = new FormData();
        formData.append('file', file);
        const toastId = toast.loading(`Uploading ${type}...`);

        try {
            // Connected to POST /api/settings/logo OR /api/settings/signature
            await api.post(`/api/settings/${type}`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            toast.success(`${type} uploaded successfully!`, { id: toastId });
            loadAllData(); // Refresh to fetch the new Base64 image
        } catch (error) {
            toast.error(`Upload failed. Check DB column size for LONGTEXT.`, { id: toastId });
        } finally {
            setUploadingType(null);
            e.target.value = null; // Reset input
        }
    };

    const handleDeleteImage = async (type) => {
        if(!window.confirm(`Remove this ${type}?`)) return;
        const toastId = toast.loading(`Removing ${type}...`);
        try {
            // Connected to DELETE /api/settings/logo OR /api/settings/signature
            await api.delete(`/api/settings/${type}`);
            toast.success(`${type} removed!`, { id: toastId });
            setConfig(prev => ({ ...prev, [type === 'logo' ? 'companyLogo' : 'authorizedSignature']: null }));
        } catch (error) {
            toast.error(`Failed to remove ${type}`, { id: toastId });
        }
    };

    // ==========================================
    // 3. PAYROLL RULES API LOGIC
    // ==========================================
    const savePayrollRules = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Updating Payroll Algorithms...');
        try {
            // Connected to PUT /api/settings
            await api.put('/api/settings', {
                allowedPaidLeaves: Number(config.allowedPaidLeaves), 
                absentDeductionMultiplier: Number(config.absentDeductionMultiplier),
                halfDayLeaveDeductionMultiplier: Number(config.halfDayLeaveDeductionMultiplier), 
                lateDeductionMultiplier: Number(config.lateDeductionMultiplier),
                referralBonusAmount: Number(config.referralBonusAmount), 
                performanceBonusThreshold: Number(config.performanceBonusThreshold)
            });
            toast.success("Payroll Algorithms locked in!", { id: toastId });
        } catch (error) {
            toast.error("Failed to save rules.", { id: toastId });
        }
    };

    // ==========================================
    // 4. SHIFT & SECURITY API LOGIC
    // ==========================================
    const handleShiftCreate = async (e) => {
        e.preventDefault();
        if(!shiftForm.name || !shiftForm.startTime || !shiftForm.endTime) {
            toast.error("Please fill required shift details.");
            return;
        }

        const toastId = toast.loading('Creating Shift...');
        try {
            // Assuming endpoint exists based on your provided component
            await api.post('/api/shifts', shiftForm);
            toast.success("New Shift Created!", { id: toastId });
            setShiftForm({ name: '', startTime: '', endTime: '', lateThreshold: '' });
        } catch (error) {
            toast.error("Failed to create shift.", { id: toastId });
        }
    };

    const handleShiftAssign = async (e) => {
        e.preventDefault();
        if(!assignForm.employeeId || !assignForm.shiftId) {
            toast.error("Select both Employee and Shift.");
            return;
        }

        const toastId = toast.loading('Assigning Shift...');
        try {
            // Assuming endpoint exists based on your provided component
            await api.put(`/api/shifts/assign?employeeId=${assignForm.employeeId}&shiftId=${assignForm.shiftId}`);
            toast.success("Shift Assigned to Employee!", { id: toastId });
            setAssignForm({ employeeId: '', shiftId: '' });
        } catch (error) {
            toast.error("Failed to assign shift.", { id: toastId });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if(passwordForm.newPassword.length < 6) return toast.error("Password too weak.");
        
        const toastId = toast.loading("Updating credentials...");
        try {
            // Connected to PUT /api/settings/change-password
            await api.put('/api/settings/change-password', passwordForm);
            toast.success("Admin Password changed securely!", { id: toastId });
            setPasswordForm({ oldPassword: '', newPassword: '' });
        } catch (error) {
            toast.error(error.response?.data || "Failed to update password", { id: toastId });
        }
    };

    return (
        <DashboardLayout role="ADMIN" title="System Settings">
            {/* 🟢 ELITE ALIGNMENT FIX */}
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ background: colors.primaryBlue, color: '#fff', padding: '14px', borderRadius: '14px', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
                        <Settings size={28} />
                    </div>
                    <div>
                        <h1 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: '800', color: colors.mainText, letterSpacing: '-0.5px' }}>Master Configuration</h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '15px', fontWeight: '500' }}>Control branding, strict payroll algorithms, shifts, and security.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '16px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'BRANDING', label: 'Company Identity', icon: <Building2 size={16}/> },
                        { id: 'PAYROLL', label: 'Payroll & Leave Rules', icon: <Calculator size={16}/> },
                        { id: 'SHIFTS', label: 'Shift Management', icon: <Clock size={16}/> },
                        { id: 'SECURITY', label: 'Security & Access', icon: <Shield size={16}/> } // 🟢 ADDED SECURITY TAB
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px',
                                fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: '0.2s',
                                background: activeTab === tab.id ? colors.lightBlue : 'transparent',
                                color: activeTab === tab.id ? colors.primaryBlue : colors.secondaryText, border: 'none'
                            }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB 1: BRANDING */}
                {activeTab === 'BRANDING' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', animation: 'fadeIn 0.3s ease-in' }}>
                        {/* Text Details */}
                        <div style={{ background: colors.cardWhite, padding: '32px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: '0 0 24px 0', color: colors.mainText, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Building2 size={20} color={colors.primaryBlue}/> Legal Company Details
                            </h3>
                            <form onSubmit={saveGeneralSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Registered Company Name</label>
                                    <input type="text" name="companyName" value={config.companyName || ''} onChange={handleConfigChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', fontWeight: '600', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Headquarters Address</label>
                                    <textarea name="companyAddress" value={config.companyAddress || ''} onChange={handleConfigChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, minHeight: '120px', resize: 'none', outline: 'none', fontWeight: '500', boxSizing: 'border-box' }} />
                                </div>
                                <button type="submit" style={{ background: colors.primaryBlue, color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px', boxShadow: '0 4px 14px rgba(37,99,235,0.2)' }}>
                                    <Save size={18}/> Commit Text Changes
                                </button>
                            </form>
                        </div>

                        {/* Image Uploads */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Logo */}
                            <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, color: colors.mainText, fontSize: '16px', fontWeight: '800' }}>Corporate Logo</h3>
                                    {config.companyLogo && <button onClick={() => handleDeleteImage('logo')} style={{ background: 'transparent', border: 'none', color: colors.dangerText, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700' }}><Trash2 size={14}/> Remove</button>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '16px', border: `2px dashed ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: colors.inputBg, position: 'relative' }}>
                                        {uploadingType === 'logo' ? <Loader2 className="spin" color={colors.primaryBlue} /> : config.companyLogo ? <img src={config.companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <ImageIcon size={32} color={colors.secondaryText}/>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input type="file" accept="image/png, image/jpeg" id="logoUpload" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'logo')} />
                                        <label htmlFor="logoUpload" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: colors.lightBlue, color: colors.primaryBlue, padding: '12px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: '0.2s' }}>
                                            <UploadCloud size={18}/> Upload Logo File
                                        </label>
                                        <p style={{ margin: '8px 0 0', fontSize: '12px', color: colors.secondaryText, fontWeight: '500' }}>Format: PNG, JPG. Clear background preferred.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Signature */}
                            <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, color: colors.mainText, fontSize: '16px', fontWeight: '800' }}>Payslip Digital Signature</h3>
                                    {config.authorizedSignature && <button onClick={() => handleDeleteImage('signature')} style={{ background: 'transparent', border: 'none', color: colors.dangerText, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700' }}><Trash2 size={14}/> Remove</button>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '140px', height: '70px', borderRadius: '12px', border: `2px dashed ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: colors.inputBg }}>
                                        {uploadingType === 'signature' ? <Loader2 className="spin" color={colors.primaryBlue} /> : config.authorizedSignature ? <img src={config.authorizedSignature} alt="Sig" style={{ width: '100%', height: '100%', objectFit: 'contain' }}/> : <ImageIcon size={24} color={colors.secondaryText}/>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input type="file" accept="image/png" id="sigUpload" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'signature')} />
                                        <label htmlFor="sigUpload" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: colors.lightBlue, color: colors.primaryBlue, padding: '12px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: '0.2s' }}>
                                            <UploadCloud size={18}/> Upload Signature
                                        </label>
                                        <p style={{ margin: '8px 0 0', fontSize: '12px', color: colors.secondaryText, fontWeight: '500' }}>Format: Transparent PNG.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: PAYROLL POLICIES */}
                {activeTab === 'PAYROLL' && (
                    <div style={{ background: colors.cardWhite, padding: '32px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: 'fadeIn 0.3s ease-in' }}>
                        <h3 style={{ margin: '0 0 24px 0', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '800' }}>
                            <Calculator size={20} color={colors.primaryBlue}/> Global Financial Algorithms
                        </h3>
                        <form onSubmit={savePayrollRules}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                                <div style={{ background: colors.inputBg, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                                    <h4 style={{ margin: '0 0 20px 0', fontSize: '15px', color: colors.dangerText, display:'flex', alignItems:'center', gap:'8px', fontWeight: '700' }}><XCircle size={18}/> Deduction Rules</h4>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Absent Multiplier (x Base Day Pay)</label>
                                        <input type="number" step="0.1" name="absentDeductionMultiplier" value={config.absentDeductionMultiplier} onChange={handleConfigChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, boxSizing: 'border-box', fontWeight: '600' }} />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Half Day Multiplier</label>
                                        <input type="number" step="0.1" name="halfDayLeaveDeductionMultiplier" value={config.halfDayLeaveDeductionMultiplier} onChange={handleConfigChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, boxSizing: 'border-box', fontWeight: '600' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Late Penalty Multiplier</label>
                                        <input type="number" step="0.1" name="lateDeductionMultiplier" value={config.lateDeductionMultiplier} onChange={handleConfigChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, boxSizing: 'border-box', fontWeight: '600' }} />
                                    </div>
                                </div>
                                <div style={{ background: colors.inputBg, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                                    <h4 style={{ margin: '0 0 20px 0', fontSize: '15px', color: colors.successText, display:'flex', alignItems:'center', gap:'8px', fontWeight: '700' }}><Briefcase size={18}/> Allowances & Thresholds</h4>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Allowed Paid Leaves (Per Month)</label>
                                        <input type="number" name="allowedPaidLeaves" value={config.allowedPaidLeaves} onChange={handleConfigChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, boxSizing: 'border-box', fontWeight: '600' }} />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Referral Bonus Base (₹)</label>
                                        <input type="number" name="referralBonusAmount" value={config.referralBonusAmount} onChange={handleConfigChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, boxSizing: 'border-box', fontWeight: '600' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Performance Threshold (%)</label>
                                        <input type="number" step="0.1" name="performanceBonusThreshold" value={config.performanceBonusThreshold} onChange={handleConfigChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, boxSizing: 'border-box', fontWeight: '600' }} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" style={{ background: colors.primaryBlue, color: '#fff', padding: '14px 32px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', boxShadow: '0 4px 14px rgba(37,99,235,0.2)' }}>
                                    <Save size={18}/> Apply Algorithms
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB 3: SHIFTS */}
                {activeTab === 'SHIFTS' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', animation: 'fadeIn 0.3s ease-in' }}>
                        {/* Create Shift */}
                        <div style={{ background: colors.cardWhite, padding: '32px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: '0 0 24px 0', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '800' }}>
                                <PlusCircle size={20} color={colors.primaryBlue}/> Define New Shift
                            </h3>
                            <form onSubmit={handleShiftCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Shift Alias / Name</label>
                                    <input type="text" placeholder="e.g. Night Shift - Alpha" value={shiftForm.name} onChange={(e)=>setShiftForm({...shiftForm, name: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box', fontWeight: '500' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Start Time</label>
                                        <input type="time" value={shiftForm.startTime} onChange={(e)=>setShiftForm({...shiftForm, startTime: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box', fontWeight: '600' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>End Time</label>
                                        <input type="time" value={shiftForm.endTime} onChange={(e)=>setShiftForm({...shiftForm, endTime: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box', fontWeight: '600' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Late Mark Grace Threshold</label>
                                    <input type="time" value={shiftForm.lateThreshold} onChange={(e)=>setShiftForm({...shiftForm, lateThreshold: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box', fontWeight: '600' }} />
                                </div>
                                <button type="submit" style={{ background: colors.primaryBlue, color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px', fontSize: '15px' }}>
                                    <Save size={18}/> Generate Shift Code
                                </button>
                            </form>
                        </div>

                        {/* Assign Shift */}
                        <div style={{ background: colors.cardWhite, padding: '32px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: '0 0 24px 0', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '800' }}>
                                <UserCheck size={20} color={colors.primaryBlue}/> Map Shift to Employee
                            </h3>
                            <form onSubmit={handleShiftAssign} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Select Core Asset (Employee)</label>
                                    <select value={assignForm.employeeId} onChange={(e)=>setAssignForm({...assignForm, employeeId: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box', cursor: 'pointer', fontWeight: '600' }}>
                                        <option value="">-- Search & Select --</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>EMP-{emp.id} | {emp.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Select Shift Policy</label>
                                    <select value={assignForm.shiftId} onChange={(e)=>setAssignForm({...assignForm, shiftId: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box', cursor: 'pointer', fontWeight: '600' }}>
                                        <option value="">-- Choose Target Shift --</option>
                                        <option value="1">Shift 1 (Standard ID)</option>
                                    </select>
                                </div>
                                <button type="submit" style={{ background: colors.successBg, color: colors.successText, padding: '14px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', fontSize: '15px' }}>
                                    <Save size={18}/> Execute Shift Mapping
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* TAB 4: SECURITY */}
                {activeTab === 'SECURITY' && (
                    <div style={{ display: 'flex', justifyContent: 'center', animation: 'fadeIn 0.3s ease-in' }}>
                        <div style={{ background: colors.cardWhite, padding: '32px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', width: '100%', maxWidth: '500px' }}>
                            <h3 style={{ margin: '0 0 24px 0', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '800' }}>
                                <KeyRound size={20} color={colors.primaryBlue}/> Security Credentials
                            </h3>
                            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Current Password</label>
                                    <input type="password" required value={passwordForm.oldPassword} onChange={(e)=>setPasswordForm({...passwordForm, oldPassword: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box', fontWeight: '600' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>New Secured Password</label>
                                    <input type="password" required minLength="6" value={passwordForm.newPassword} onChange={(e)=>setPasswordForm({...passwordForm, newPassword: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box', fontWeight: '600' }} />
                                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: colors.secondaryText }}>Must be at least 6 characters.</p>
                                </div>
                                <button type="submit" style={{ background: colors.primaryBlue, color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', fontSize: '15px' }}>
                                    <Shield size={18}/> Update System Access
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        </DashboardLayout>
    );
};

export default AdminSettings;