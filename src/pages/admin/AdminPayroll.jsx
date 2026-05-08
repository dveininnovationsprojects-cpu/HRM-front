import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import { DollarSign, FileCheck, AlertCircle, TrendingUp, Download, UploadCloud, RefreshCw, Edit2, X, Save } from 'lucide-react';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';

const AdminPayroll = () => {
    // Dynamic Date setup
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); 
    const currentYear = String(currentDate.getFullYear());

    const [analytics, setAnalytics] = useState({});
    const [payrolls, setPayrolls] = useState([]);
    const [month, setMonth] = useState(currentMonth); 
    const [year, setYear] = useState(currentYear);
    
    // Loading States
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // EDIT MODAL STATES (MASS FEATURE)
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [editData, setEditData] = useState({ deduction: 0, bonus: 0, remarks: '' });
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const fileInputRef = useRef(null);

    // 12 Months List
    const monthsList = [
        { value: "01", label: "January" }, { value: "02", label: "February" },
        { value: "03", label: "March" }, { value: "04", label: "April" },
        { value: "05", label: "May" }, { value: "06", label: "June" },
        { value: "07", label: "July" }, { value: "08", label: "August" },
        { value: "09", label: "September" }, { value: "10", label: "October" },
        { value: "11", label: "November" }, { value: "12", label: "December" }
    ];

    // Dynamic Years List
    const yearsList = Array.from({ length: 5 }, (_, i) => String(currentDate.getFullYear() - 2 + i));

    // 1. Fetch Analytics & List (GET /analytics, GET /view)
    const fetchPayrollData = async () => {
        try {
            const anaRes = await api.get(`/api/payroll/analytics?month=${month}&year=${year}`);
            setAnalytics(anaRes.data || {});
            
            const viewRes = await api.get(`/api/payroll/view?month=${month}&year=${year}`);
            setPayrolls(viewRes.data || []);
        } catch (err) { 
            console.error("Payroll load failed", err);
            toast.error("Failed to load payroll data.");
        }
    };

    useEffect(() => {
        fetchPayrollData();
    }, [month, year]);

    // 2. Generate Payroll (POST /generate)
    const handleGenerate = async () => {
        setIsGenerating(true);
        const toastId = toast.loading(`Generating Payroll for ${monthsList.find(m => m.value === month).label} ${year}...`);
        try {
            await api.post(`/api/payroll/generate?month=${month}&year=${year}`);
            toast.success("Payroll generated successfully mamey! 🎉", { id: toastId });
            fetchPayrollData(); 
        } catch (err) { 
            toast.error("Generation failed! Check backend logs.", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    // 3. Download PDF (GET /download/{id})
    const handleDownloadPayslip = async (id, empName) => {
        const toastId = toast.loading(`Downloading ${empName}'s Payslip...`);
        try {
            const response = await api.get(`/api/payroll/download/${id}`, {
                responseType: 'blob' 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const monthName = monthsList.find(m => m.value === month)?.label || month;
            link.setAttribute('download', `Payslip_${empName}_${monthName}_${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            toast.success("Download Complete! ✅", { id: toastId });
        } catch (error) {
            toast.error("Failed to download PDF.", { id: toastId });
        }
    };

    // 4. Upload Bank File (POST /upload-bank)
    const handleBankFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        // Ensure month and year parameters are exactly what the backend expects
        formData.append('month', parseInt(month, 10));
        formData.append('year', parseInt(year, 10));

        setIsUploading(true);
        const toastId = toast.loading('Uploading Bank Transfer Status...');
        try {
            await api.post(`/api/payroll/upload-bank`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Bank File Uploaded! Salaries marked as PAID 💸", { id: toastId });
            fetchPayrollData(); 
        } catch (err) {
            console.error("Bank upload error", err);
            toast.error("Bank upload failed. Check format.", { id: toastId });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // 5. Open Edit Modal
    const openEditModal = (payroll) => {
        setSelectedPayroll(payroll);
        setEditData({
            deduction: payroll.totalDeduction || 0,
            bonus: payroll.performanceBonus || 0,
            remarks: '' // Reset remarks for new edits
        });
        setEditModalOpen(true);
    };

    // 6. Save Edit (PUT /edit/{id})
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editData.remarks) {
            toast.error("Please provide a reason (remarks) for this manual override.");
            return;
        }

        setIsSavingEdit(true);
        const toastId = toast.loading("Saving manual adjustments...");
        try {
            await api.put(`/api/payroll/edit/${selectedPayroll.id}?deduction=${editData.deduction}&bonus=${editData.bonus}&remarks=${encodeURIComponent(editData.remarks)}`);
            toast.success("Payroll updated successfully!", { id: toastId });
            setEditModalOpen(false);
            fetchPayrollData(); // Refresh table to show new net salary
        } catch (err) {
            toast.error("Failed to update payroll.", { id: toastId });
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Mappings for Analytics Cards
    const totalPayout = analytics.totalPayout || 0; 
    const totalDeductions = analytics.totalDeductions || 0;
    const paidCount = analytics.statusBreakdown?.PAID || 0;
    
    let generatedCount = 0;
    if(analytics.statusBreakdown) {
       Object.keys(analytics.statusBreakdown).forEach(key => {
           if(key !== "PAID") generatedCount += analytics.statusBreakdown[key];
       });
    }

    return (
        <DashboardLayout role="ADMIN" title="Payroll Master Control">
            {/* Summary Cards */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <StatCard title="Total Payout" value={`₹${totalPayout}`} icon={<DollarSign />} color="#3b82f6" />
                <StatCard title="Paid Count" value={paidCount} icon={<FileCheck />} color="#10b981" />
                <StatCard title="Pending" value={generatedCount} icon={<AlertCircle />} color="#f59e0b" />
                <StatCard title="Deductions" value={`₹${totalDeductions}`} icon={<TrendingUp />} color="#ef4444" />
            </div>

            <div className="dashboard-card" style={{ background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
                
                {/* Control Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', cursor: 'pointer' }}>
                            {monthsList.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                        
                        <select value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', cursor: 'pointer' }}>
                            {yearsList.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        
                        <button onClick={fetchPayrollData} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center' }} title="Refresh">
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handleGenerate} 
                            disabled={isGenerating}
                            style={{ background: isGenerating ? '#94a3b8' : '#10b981', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isGenerating ? 'not-allowed' : 'pointer' }}>
                            {isGenerating ? 'Generating...' : 'Generate Payroll'}
                        </button>

                        <input type="file" accept=".xlsx, .csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleBankFileUpload} />
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            disabled={isUploading}
                            style={{ background: isUploading ? '#94a3b8' : '#3b82f6', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 'bold' }}>
                            <UploadCloud size={18} /> {isUploading ? 'Uploading...' : 'Upload Bank File'}
                        </button>
                    </div>
                </div>

                {/* Payroll Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                                <th style={{ padding: '15px' }}>EMPLOYEE</th>
                                <th>BIO ID</th>
                                <th>NET SALARY</th>
                                <th>BONUS / DEDUCTION</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrolls.length > 0 ? payrolls.map(p => {
                                const empName = p.employee?.fullName || 'Unknown';
                                const bioId = p.employee?.biometricId || '-';
                                
                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                                        <td style={{ padding: '15px', fontWeight: '600', color: '#1e293b' }}>
                                            {empName}
                                            {p.isManuallyEdited && <span style={{display: 'block', fontSize: '10px', color: '#ef4444'}}>*Manually Edited</span>}
                                        </td>
                                        <td style={{ color: '#64748b' }}>{bioId}</td>
                                        <td style={{ fontWeight: 'bold', color: '#0f172a' }}>₹{p.netSalary}</td>
                                        <td>
                                            <span style={{ color: '#10b981', marginRight: '10px', fontWeight: '500' }}>+₹{p.performanceBonus || 0}</span>
                                            <span style={{ color: '#ef4444', fontWeight: '500' }}>-₹{p.totalDeduction || 0}</span>
                                        </td>
                                        <td>
                                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', background: p.status === 'PAID' ? '#dcfce7' : '#fef3c7', color: p.status === 'PAID' ? '#16a34a' : '#d97706' }}>
                                                {p.status} 
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {/* NEW: Edit Button (Only visible if not paid yet, or allow always based on logic) */}
                                                {p.status !== 'PAID' && (
                                                    <button 
                                                        onClick={() => openEditModal(p)}
                                                        style={{ background: '#fef3c7', border: 'none', color: '#d97706', cursor: 'pointer', padding: '8px', borderRadius: '6px', transition: '0.2s' }}
                                                        title="Manual Override (Edit)">
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                
                                                <button 
                                                    onClick={() => handleDownloadPayslip(p.id, empName)}
                                                    style={{ background: '#eff6ff', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '8px', borderRadius: '6px', transition: '0.2s' }}
                                                    title="Download Payslip PDF">
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                        <p style={{ margin: 0 }}>No payroll records found for {monthsList.find(m => m.value === month)?.label} {year}.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* OVERLAY MODAL FOR EDITING */}
                {editModalOpen && selectedPayroll && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', width: '400px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                            <button onClick={() => setEditModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                            
                            <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Edit2 size={20} color="#3b82f6" /> Edit Payroll
                            </h3>
                            <p style={{ color: '#475569', fontSize: '13px', marginBottom: '20px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                Employee: <b>{selectedPayroll.employee?.fullName}</b><br/>
                                Base Salary: ₹{selectedPayroll.baseSalary}
                            </p>

                            <form onSubmit={handleSaveEdit}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#ef4444', marginBottom: '5px' }}>Manual Deduction (₹)</label>
                                    <input 
                                        type="number" 
                                        value={editData.deduction} 
                                        onChange={(e) => setEditData({...editData, deduction: parseFloat(e.target.value) || 0})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#10b981', marginBottom: '5px' }}>Manual Bonus (₹)</label>
                                    <input 
                                        type="number" 
                                        value={editData.bonus} 
                                        onChange={(e) => setEditData({...editData, bonus: parseFloat(e.target.value) || 0})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Reason / Remarks *</label>
                                    <textarea 
                                        required
                                        placeholder="E.g., Added extra performance bonus..."
                                        value={editData.remarks} 
                                        onChange={(e) => setEditData({...editData, remarks: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', height: '60px', resize: 'none' }}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSavingEdit}
                                    style={{ width: '100%', background: isSavingEdit ? '#94a3b8' : '#3b82f6', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: isSavingEdit ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                    <Save size={18} /> {isSavingEdit ? 'Saving...' : 'Update & Recalculate'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminPayroll;