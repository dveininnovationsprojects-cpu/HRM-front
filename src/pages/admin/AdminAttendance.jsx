import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { RefreshCw, FileSpreadsheet, Edit3, UploadCloud, Calendar, Clock, UserCheck, X, Zap, Loader2, Save, Edit2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 

const AdminAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // 🔥 Custom Edit Modal States
    const [editModal, setEditModal] = useState({ isOpen: false, id: null, empId: '', date: '', status: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    // ==========================================
    // ELITE COLOR PALETTE
    // ==========================================
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        mainText: '#0F172A', secondaryText: '#64748B',
        successBg: '#DCFCE7', successText: '#16A34A',
        warningBg: '#FEF9C3', warningText: '#CA8A04', warning: '#F59E0B',
        dangerBg: '#FEE2E2', dangerText: '#DC2626',
        border: '#E2E8F0', cardWhite: '#FFFFFF', inputBg: '#F1F5F9'
    };

    // 1. Load All Attendance Flow
    const fetchAttendance = async () => {
        try {
            const res = await api.get('/api/attendance/all');
            const sortedData = (res.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
            setAttendance(sortedData);
        } catch (err) {
            console.error("Attendance load failed");
            toast.error("Failed to load attendance records.");
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    // 2. Excel Upload Logic
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.pdf')) {
                setFile(droppedFile);
            } else {
                toast.error("Only .xlsx, .csv, or .pdf files are allowed!");
            }
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select an Excel or PDF file first!", { icon: '📂' }); 
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        const loadingToast = toast.loading('Uploading biometric data...');

        try {
            const res = await api.post('/api/attendance/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.dismiss(loadingToast);
            const successMessage = res.data || "Attendance synced successfully!";
            toast.success(successMessage, { duration: 4000 }); 
            
            setFile(null);
            document.getElementById('attendance-upload-input').value = ""; 
            
            fetchAttendance(); 
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Upload failed. Please check the file format."); 
        } finally {
            setLoading(false);
        }
    };

    // 3. Admin Manual Update Logic
    const openEditModal = (row) => {
        setEditModal({ 
            isOpen: true, 
            id: row.id, 
            empId: row.employeeId, 
            date: row.date, 
            status: String(row.status || 'PRESENT').toUpperCase() // Default to PRESENT if empty
        });
    };

    const handleSaveUpdate = async (e) => {
        e.preventDefault();
        const { id, status } = editModal;
        
        setIsUpdating(true);
        const toastId = toast.loading("Updating attendance record...");

        try {
            // API Connected to backend logic
            await api.put(`/api/attendance/admin-update/${id}?status=${status}`);
            toast.success("Attendance updated successfully!", { id: toastId });
            setEditModal({ isOpen: false, id: null, empId: '', date: '', status: '' });
            fetchAttendance();
        } catch (err) {
            toast.error("Failed to update attendance.", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    const formatCurrentDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    return (
        <DashboardLayout role="ADMIN" title="Attendance Management">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 3000 }} />
                
                {/* 1. TOP HEADER SECTION */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                    <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ background: colors.primaryBlue, color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>LIVE PORTAL</span>
                            <span style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14}/> {formatCurrentDate()}</span>
                        </div>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', color: colors.mainText, letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            Attendance Operations 
                        </h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '15px', fontWeight: '500' }}>
                            Sync biometric records and monitor daily employee work logs.
                        </p>
                    </div>
                    <button 
                        onClick={fetchAttendance} 
                        className="action-btn outline fade-in-up"
                        style={{ animationDelay: '0.2s', padding: '10px 20px', borderRadius: '12px' }}
                    >
                        <RefreshCw size={16} /> Refresh Log
                    </button>
                </div>

                {/* 2. COMPACT ELITE UPLOAD BAR */}
                <div 
                    className="glass-panel fade-in-up" 
                    style={{ animationDelay: '0.3s', background: colors.cardWhite, padding: '24px 32px', marginBottom: '32px', borderRadius: '20px', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: colors.lightBlue, padding: '12px', borderRadius: '12px', color: colors.primaryBlue }}>
                            <UploadCloud size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: colors.mainText, fontWeight: '800' }}>
                                Biometric Data Sync
                            </h3>
                            <p style={{ margin: 0, fontSize: '13px', color: colors.secondaryText, fontWeight: '500' }}>
                                Upload .xlsx, .csv, or .pdf to sync daily records.
                            </p>
                        </div>
                    </div>

                    <form 
                        onSubmit={handleFileUpload} 
                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '12px', background: dragActive ? colors.lightBlue : colors.inputBg, 
                            padding: '8px', borderRadius: '16px', border: `1px dashed ${dragActive ? colors.primaryBlue : colors.border}`,
                            transition: 'all 0.2s ease' 
                        }}
                    >
                        <input 
                            id="attendance-upload-input" type="file" accept=".xlsx, .csv, .pdf"
                            onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} 
                        />
                        
                        <label 
                            htmlFor="attendance-upload-input" 
                            style={{ background: '#FFFFFF', border: `1px solid ${colors.border}`, padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                        >
                            <FileSpreadsheet size={16} color={colors.primaryBlue} /> 
                            {file ? 'Change File' : 'Choose File'}
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
                            <span style={{ fontSize: '13px', color: file ? colors.successText : colors.secondaryText, fontWeight: '600', maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {file ? file.name : 'Drop file here...'}
                            </span>
                            {file && (
                                <button type="button" onClick={() => setFile(null)} style={{ background: colors.dangerBg, border: 'none', color: colors.dangerText, cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center' }} title="Remove file">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div style={{ width: '1px', height: '30px', background: colors.border, margin: '0 4px' }}></div>

                        <button 
                            type="submit" disabled={loading || !file}
                            className="action-btn submit-btn"
                            style={{ 
                                background: (loading || !file) ? '#94A3B8' : colors.primaryBlue,
                                padding: '10px 24px', borderRadius: '10px', boxShadow: (loading || !file) ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.3)'
                            }}
                        >
                            {loading ? <Loader2 size={16} className="spin" /> : <UploadCloud size={16} />}
                            {loading ? 'Syncing...' : 'Execute Sync'}
                        </button>
                    </form>
                </div>

                {/* 3. ATTENDANCE TABLE */}
                <div className="glass-panel fade-in-up" style={{ animationDelay: '0.4s', background: colors.cardWhite, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}` }}>
                    <h3 style={{ margin: '0 0 24px 0', color: colors.mainText, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <UserCheck size={20} color={colors.primaryBlue} /> Daily Log Records
                    </h3>

                    <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: '900px', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emp ID</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check In</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check Out</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Work Mins</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remarks</th>
                                    <th style={{ padding: '0 16px 12px', color: colors.secondaryText, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.length > 0 ? attendance.map((row, index) => {
                                    const statusStr = String(row.status || '').toUpperCase();
                                    const isPresent = statusStr.includes('PRESENT');
                                    const isAbsent = statusStr.includes('ABSENT');
                                    const isLate = statusStr.includes('LATE');
                                    
                                    let badgeBg = colors.warningBg;
                                    let badgeText = colors.warningText;
                                    
                                    if (isPresent && !isLate) { badgeBg = colors.successBg; badgeText = colors.successText; }
                                    else if (isAbsent) { badgeBg = colors.dangerBg; badgeText = colors.dangerText; }
                                    else if (isPresent && isLate) { badgeBg = colors.warningBg; badgeText = colors.warningText; }

                                    return (
                                        <tr key={index} style={{ background: colors.inputBg, transition: '0.2s' }}>
                                            <td style={{ padding: '16px', fontWeight: '800', color: colors.mainText, fontSize: '14px', borderRadius: '12px 0 0 12px' }}>
                                                {row.employeeId}
                                            </td>
                                            <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px', fontWeight: '600' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Calendar size={14} color={colors.primaryBlue} opacity={0.8}/> {row.date}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', color: colors.successText, fontWeight: '700', fontSize: '14px' }}>
                                                {row.checkIn || '--:--'}
                                            </td>
                                            <td style={{ padding: '16px', color: colors.dangerText, fontWeight: '700', fontSize: '14px' }}>
                                                {row.checkOut || '--:--'}
                                            </td>
                                            <td style={{ padding: '16px', color: colors.mainText, fontSize: '14px', fontWeight: '700' }}>
                                                {row.workMinutes ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Clock size={14} color={colors.secondaryText}/> {Math.floor(row.workMinutes / 60)}h {row.workMinutes % 60}m
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ 
                                                    padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                                                    background: badgeBg, color: badgeText, display: 'inline-block', letterSpacing: '0.5px'
                                                }}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '13px', color: colors.secondaryText, fontWeight: '500', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {row.remarks || '-'}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center', borderRadius: '0 12px 12px 0' }}>
                                                <button 
                                                    onClick={() => openEditModal(row)}
                                                    style={{ 
                                                        background: '#FFFFFF', color: colors.primaryBlue, border: `1px solid ${colors.border}`, 
                                                        padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s',
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                    title="Manual Edit"
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '60px', color: colors.secondaryText, background: colors.inputBg, borderRadius: '16px' }}>
                                            <FileSpreadsheet size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                                            <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>No attendance records synced yet. Upload a biometric file above.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* 🔥 CUSTOM HR-STYLE OVERRIDE MODAL                                         */}
                {/* ========================================================================= */}
                {editModal.isOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '24px', overflow: 'hidden', animation: 'slideUp 0.3s ease-out', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                            
                            {/* Modal Header (Clean White) */}
                            <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ margin: 0, color: colors.mainText, fontSize: '18px', fontWeight: '800' }}>Override Attendance</h2>
                                <button onClick={() => setEditModal({ isOpen: false, id: null, empId: '', date: '', status: '' })} style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', color: colors.secondaryText, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSaveUpdate} style={{ padding: '0 24px 24px 24px' }}>
                                
                                {/* Employee Info Box (Light Blue) */}
                                <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: colors.secondaryText, fontWeight: '600' }}>Employee ID</p>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: colors.primaryBlue, fontWeight: '800' }}>{editModal.empId}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: colors.secondaryText, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                                        <Calendar size={14} /> Date: {editModal.date}
                                    </p>
                                </div>

                                {/* Select New Status Dropdown */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: colors.mainText, marginBottom: '8px' }}>
                                        Select New Status
                                    </label>
                                    <select 
                                        required
                                        value={editModal.status} 
                                        onChange={(e) => setEditModal({...editModal, status: e.target.value})}
                                        style={{ 
                                            width: '100%', padding: '14px 16px', borderRadius: '12px', 
                                            border: `1px solid ${colors.border}`, background: colors.cardWhite, 
                                            outline: 'none', fontSize: '14px', fontWeight: '600', color: colors.mainText, 
                                            cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' 
                                        }}
                                    >
                                        <option value="PRESENT">Present</option>
                                        <option value="ABSENT">Absent</option>
                                        <option value="LATE">Late</option>
                                        <option value="HALF DAY">Half Day</option>
                                        <option value="PRESENT (AD)">Present (AD)</option>
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                    <button type="submit" disabled={isUpdating} style={{ flex: 1, background: colors.primaryBlue, color: '#fff', border: 'none', padding: '14px 20px', borderRadius: '12px', fontWeight: '700', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
                                        {isUpdating ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                        {isUpdating ? 'Saving...' : 'Update Status'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* ELITE CUSTOM CSS STYLES (Injected directly)                               */}
                {/* ========================================================================= */}
                <style>
                    {`
                        .fade-in-up { opacity: 0; animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                        @keyframes fadeInUp { 
                            0% { opacity: 0; transform: translateY(30px) scale(0.98); } 
                            100% { opacity: 1; transform: translateY(0) scale(1); } 
                        }
                        
                        .action-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none; }
                        .action-btn.outline { background: white; color: ${colors.mainText}; border: 1px solid ${colors.border}; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                        .action-btn.outline:hover { background: ${colors.inputBg}; border-color: #CBD5E1; transform: translateY(-2px); }
                        .submit-btn { color: white; justify-content: center; font-size: 14px; }
                        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37,99,235,0.4) !important; }
                        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
                        
                        .glass-panel { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                        .glass-panel:hover { box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08) !important; transform: translateY(-2px); }

                        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
                        
                        .spin { animation: spin 1s linear infinite; }
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                    `}
                </style>
            </div>
        </DashboardLayout>
    );
};

export default AdminAttendance;