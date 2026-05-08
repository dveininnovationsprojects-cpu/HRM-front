import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    Settings, Building2, Calculator, Clock, UploadCloud, 
    Save, Image as ImageIcon, Briefcase, PlusCircle, Trash2, UserCheck,
    ShieldCheck, AlertTriangle, Eye, EyeOff, Loader2 // 👈 FIXED: Icons added here
} from 'lucide-react';

const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box', fontSize: '14px' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' };
const btnStyle = { background: '#2563EB', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', width: '100%' };
const eyeIconStyle = { position: 'absolute', right: '12px', top: '38px', cursor: 'pointer', color: '#64748B' };
const imgBoxStyle = { width: '80px', height: '80px', borderRadius: '12px', border: '1px dashed #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#F8FAFC' };
const uploadBtnStyle = { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: '#2563EB', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' };

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('BRANDING');
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);

    // ==========================================
    // 1. STATE FOR SETTINGS & CONFIGS
    // ==========================================
    const [config, setConfig] = useState({
        companyName: '',
        companyAddress: '',
        companyLogo: null,
        authorizedSignature: null,
        allowedPaidLeaves: 0,
        absentDeductionMultiplier: 0,
        halfDayLeaveDeductionMultiplier: 0,
        lateDeductionMultiplier: 0,
        referralBonusAmount: 0,
        performanceBonusThreshold: 0
    });

    // ==========================================
    // 2. STATE FOR SHIFT MANAGEMENT
    // ==========================================
    const [shifts, setShifts] = useState([]);
    const [shiftForm, setShiftForm] = useState({ name: '', startTime: '', endTime: '', lateThreshold: '' });
    const [assignForm, setAssignForm] = useState({ employeeId: '', shiftId: '' });
    const [securityForm, setSecurityForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [showOldPass, setShowOldPass] = useState(false);
const [showNewPass, setShowNewPass] = useState(false);
const [isChangingPassword, setIsChangingPassword] = useState(false);

    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF',
        mainText: '#0F172A', secondaryText: '#64748B',
        successBg: '#DCFCE7', successText: '#16A34A',
        dangerBg: '#FEE2E2', dangerText: '#DC2626',
        border: '#E2E8F0', cardWhite: '#FFFFFF', inputBg: '#F8FAFC'
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            // Fetch Settings Config
            const configRes = await api.get('/api/settings');
            if (configRes.data) setConfig(configRes.data);

            // Fetch Employees for Shift Assignment
            const empRes = await api.get('/api/employees').catch(() => ({ data: [] }));
            setEmployees(empRes.data || []);
            
        } catch (error) {
            console.error("Failed to load settings data", error);
            toast.error("Error connecting to settings database.");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // 3. BRANDING & GENERAL SETTINGS LOGIC
    // ==========================================
    const handleConfigChange = (e) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const saveGeneralSettings = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Saving General Settings...');
        try {
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

        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading(`Uploading ${type}...`);
        try {
            await api.post(`/api/settings/${type}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`${type} uploaded successfully!`, { id: toastId });
            loadAllData(); // Refresh to show new images
        } catch (error) {
            toast.error(`Upload failed for ${type}`, { id: toastId });
        }
    };
const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
    }

    setIsChangingPassword(true);
    const toastId = toast.loading("Updating secure credentials...");
    try {
        await api.put('/api/settings/change-password', {
            oldPassword: securityForm.oldPassword,
            newPassword: securityForm.newPassword
        });
        toast.success("Admin password updated successfully!", { id: toastId });
        setSecurityForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
        toast.error(error.response?.data || "Failed to update password.", { id: toastId });
    } finally {
        setIsChangingPassword(false);
    }
};
    // ==========================================
    // 4. PAYROLL POLICIES LOGIC
    // ==========================================
    const savePayrollRules = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Updating Payroll Rules...');
        try {
            await api.put('/api/settings', {
                allowedPaidLeaves: Number(config.allowedPaidLeaves),
                absentDeductionMultiplier: Number(config.absentDeductionMultiplier),
                halfDayLeaveDeductionMultiplier: Number(config.halfDayLeaveDeductionMultiplier),
                lateDeductionMultiplier: Number(config.lateDeductionMultiplier),
                referralBonusAmount: Number(config.referralBonusAmount),
                performanceBonusThreshold: Number(config.performanceBonusThreshold)
            });
            toast.success("Payroll Rules updated successfully!", { id: toastId });
        } catch (error) {
            toast.error("Failed to save rules.", { id: toastId });
        }
    };

    // ==========================================
    // 5. SHIFT MANAGEMENT LOGIC
    // ==========================================
    const handleShiftCreate = async (e) => {
        e.preventDefault();
        if(!shiftForm.name || !shiftForm.startTime || !shiftForm.endTime) {
            toast.error("Please fill required shift details.");
            return;
        }

        const toastId = toast.loading('Creating Shift...');
        try {
            await api.post('/api/shifts', shiftForm);
            toast.success("New Shift Created!", { id: toastId });
            setShiftForm({ name: '', startTime: '', endTime: '', lateThreshold: '' });
            // Ideally re-fetch shifts list here if you have a GET endpoint
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
            await api.put(`/api/shifts/assign?employeeId=${assignForm.employeeId}&shiftId=${assignForm.shiftId}`);
            toast.success("Shift Assigned to Employee!", { id: toastId });
            setAssignForm({ employeeId: '', shiftId: '' });
        } catch (error) {
            toast.error("Failed to assign shift.", { id: toastId });
        }
    };

    return (
        <DashboardLayout role="ADMIN" title="System Settings">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <div style={{ background: colors.primaryBlue, color: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(37,99,235,0.2)' }}>
                        <Settings size={28} />
                    </div>
                    <div>
                        <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', fontWeight: '800', color: colors.mainText, letterSpacing: '-0.5px' }}>Master Configuration</h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '14px' }}>Control branding, strict payroll algorithms, and workforce shift timings.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '16px' }}>
                    {[
    { id: 'BRANDING', label: 'Company Identity', icon: <Building2 size={16}/> },
    { id: 'PAYROLL', label: 'Payroll & Leave Rules', icon: <Calculator size={16}/> },
    { id: 'SHIFTS', label: 'Shift Management', icon: <Clock size={16}/> },
    // 👇 IDHA ADD PANNUNGA 👇
    { id: 'SECURITY', label: 'Admin Security', icon: <ShieldCheck size={16}/> } 
].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px',
                                fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: '0.2s',
                                background: activeTab === tab.id ? colors.lightBlue : 'transparent',
                                color: activeTab === tab.id ? colors.primaryBlue : colors.secondaryText,
                                border: 'none'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB 1: BRANDING */}
                {activeTab === 'BRANDING' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', animation: 'fadeIn 0.3s ease-in' }}>
                        
                        {/* Text Details */}
                        <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: '0 0 20px 0', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Building2 size={18} color={colors.primaryBlue}/> Legal Company Details
                            </h3>
                            <form onSubmit={saveGeneralSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.secondaryText, marginBottom: '6px' }}>Registered Company Name</label>
                                    <input type="text" name="companyName" value={config.companyName || ''} onChange={handleConfigChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.secondaryText, marginBottom: '6px' }}>Headquarters Address</label>
                                    <textarea name="companyAddress" value={config.companyAddress || ''} onChange={handleConfigChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, minHeight: '100px', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <button type="submit" style={{ background: colors.primaryBlue, color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Save size={18}/> Commit Changes
                                </button>
                            </form>
                        </div>

                        {/* Image Uploads */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Logo */}
                            <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                <h3 style={{ margin: '0 0 16px 0', color: colors.mainText, fontSize: '16px' }}>Corporate Logo</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', border: `1px dashed ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: colors.inputBg }}>
                                        {config.companyLogo ? <img src={config.companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }}/> : <ImageIcon size={30} color={colors.secondaryText}/>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input type="file" accept="image/png, image/jpeg" id="logoUpload" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'logo')} />
                                        <label htmlFor="logoUpload" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: colors.lightBlue, color: colors.primaryBlue, padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                                            <UploadCloud size={16}/> Upload New Logo
                                        </label>
                                        <p style={{ margin: '8px 0 0', fontSize: '11px', color: colors.secondaryText }}>Format: PNG, JPG. Max size: 2MB.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Signature */}
                            <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                <h3 style={{ margin: '0 0 16px 0', color: colors.mainText, fontSize: '16px' }}>Authorized Payslip Signature</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '140px', height: '60px', borderRadius: '8px', border: `1px dashed ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: colors.inputBg }}>
                                        {config.authorizedSignature ? <img src={config.authorizedSignature} alt="Sig" style={{ width: '100%', height: '100%', objectFit: 'contain' }}/> : <ImageIcon size={24} color={colors.secondaryText}/>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input type="file" accept="image/png" id="sigUpload" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'signature')} />
                                        <label htmlFor="sigUpload" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: colors.lightBlue, color: colors.primaryBlue, padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                                            <UploadCloud size={16}/> Upload Signature
                                        </label>
                                        <p style={{ margin: '8px 0 0', fontSize: '11px', color: colors.secondaryText }}>Format: Transparent PNG.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: PAYROLL POLICIES */}
                {activeTab === 'PAYROLL' && (
                    <div style={{ background: colors.cardWhite, padding: '32px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', animation: 'fadeIn 0.3s ease-in' }}>
                        <h3 style={{ margin: '0 0 24px 0', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calculator size={18} color={colors.primaryBlue}/> Global Financial Algorithms
                        </h3>
                        <form onSubmit={savePayrollRules}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                                {/* Multipliers Container */}
                                <div style={{ background: colors.inputBg, padding: '20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: colors.danger, display:'flex', alignItems:'center', gap:'6px' }}><Trash2 size={16}/> Deduction Rules</h4>
                                    
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Absent Multiplier (x Base Day Pay)</label>
                                        <input type="number" step="0.1" name="absentDeductionMultiplier" value={config.absentDeductionMultiplier} onChange={handleConfigChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Half Day Multiplier</label>
                                        <input type="number" step="0.1" name="halfDayLeaveDeductionMultiplier" value={config.halfDayLeaveDeductionMultiplier} onChange={handleConfigChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Late Penalty Multiplier</label>
                                        <input type="number" step="0.1" name="lateDeductionMultiplier" value={config.lateDeductionMultiplier} onChange={handleConfigChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} />
                                    </div>
                                </div>

                                {/* Bonus & Allowances */}
                                <div style={{ background: colors.inputBg, padding: '20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: colors.success, display:'flex', alignItems:'center', gap:'6px' }}><Briefcase size={16}/> Allowances & Thresholds</h4>
                                    
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Allowed Paid Leaves (Per Month)</label>
                                        <input type="number" name="allowedPaidLeaves" value={config.allowedPaidLeaves} onChange={handleConfigChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Referral Bonus Base (₹)</label>
                                        <input type="number" name="referralBonusAmount" value={config.referralBonusAmount} onChange={handleConfigChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Performance Threshold (%)</label>
                                        <input type="number" step="0.1" name="performanceBonusThreshold" value={config.performanceBonusThreshold} onChange={handleConfigChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" style={{ background: colors.primaryBlue, color: '#fff', padding: '12px 30px', borderRadius: '10px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: '0 0 20px 0', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PlusCircle size={18} color={colors.primaryBlue}/> Define New Shift
                            </h3>
                            <form onSubmit={handleShiftCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Shift Alias / Name</label>
                                    <input type="text" placeholder="e.g. Night Shift - Alpha" value={shiftForm.name} onChange={(e)=>setShiftForm({...shiftForm, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Start Time</label>
                                        <input type="time" value={shiftForm.startTime} onChange={(e)=>setShiftForm({...shiftForm, startTime: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>End Time</label>
                                        <input type="time" value={shiftForm.endTime} onChange={(e)=>setShiftForm({...shiftForm, endTime: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Late Mark Threshold (Grace Time)</label>
                                    <input type="time" value={shiftForm.lateThreshold} onChange={(e)=>setShiftForm({...shiftForm, lateThreshold: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <button type="submit" style={{ background: colors.primaryBlue, color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                                    <Save size={18}/> Generate Shift Code
                                </button>
                            </form>
                        </div>

                        {/* Assign Shift */}
                        <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: '0 0 20px 0', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <UserCheck size={18} color={colors.primaryBlue}/> Map Shift to Employee
                            </h3>
                            <form onSubmit={handleShiftAssign} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Select Core Asset (Employee)</label>
                                    <select value={assignForm.employeeId} onChange={(e)=>setAssignForm({...assignForm, employeeId: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                                        <option value="">-- Search & Select --</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>EMP-{emp.id} | {emp.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Select Shift Policy</label>
                                    <select value={assignForm.shiftId} onChange={(e)=>setAssignForm({...assignForm, shiftId: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                                        <option value="">-- Choose Target Shift --</option>
                                        {/* Ideally map through fetched shifts here, hardcoded example below */}
                                        <option value="1">Shift 1 (Standard ID)</option>
                                        <option value="2">Shift 2 (Night ID)</option>
                                    </select>
                                </div>
                                <button type="submit" style={{ background: colors.successBg, color: colors.successText, padding: '12px', borderRadius: '10px', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                                    <Save size={18}/> Execute Shift Mapping
                                </button>
                            </form>
                        </div>

                    </div>
                )}
{activeTab === 'SECURITY' && (
                    <div style={{ maxWidth: '500px', background: '#fff', padding: '32px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={20} color={colors.primaryBlue}/> Change Admin Password
                        </h3>
                        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <label style={labelStyle}>Current Password</label>
                                <input type={showOldPass ? "text" : "password"} required value={securityForm.oldPassword} onChange={(e) => setSecurityForm({...securityForm, oldPassword: e.target.value})} style={inputStyle} placeholder="••••••••" />
                                <div onClick={() => setShowOldPass(!showOldPass)} style={eyeIconStyle}>{showOldPass ? <EyeOff size={18}/> : <Eye size={18}/>}</div>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <label style={labelStyle}>New Password</label>
                                <input type={showNewPass ? "text" : "password"} required value={securityForm.newPassword} onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})} style={inputStyle} placeholder="Min 8 characters" />
                                <div onClick={() => setShowNewPass(!showNewPass)} style={eyeIconStyle}>{showNewPass ? <EyeOff size={18}/> : <Eye size={18}/>}</div>
                            </div>
                            <div>
                                <label style={labelStyle}>Confirm New Password</label>
                                <input type="password" required value={securityForm.confirmPassword} onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})} style={inputStyle} placeholder="••••••••" />
                            </div>
                            <button type="submit" disabled={isChangingPassword} style={btnStyle}>
                                {isChangingPassword ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                                {isChangingPassword ? 'Updating...' : 'Update Admin Password'}
                            </button>
                        </form>
                    </div>
                )}
                <style>
                    {`
                        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    `}
                </style>
            </div>
        </DashboardLayout>
    );
};

export default AdminSettings;