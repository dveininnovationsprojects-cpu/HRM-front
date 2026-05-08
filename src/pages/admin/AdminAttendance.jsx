import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { RefreshCw, FileSpreadsheet, Edit3, UploadCloud, Calendar, Clock, UserCheck, X } from 'lucide-react';
import toast from 'react-hot-toast'; 

const AdminAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // ==========================================
    // ELITE COLOR PALETTE (Matched Theme)
    // ==========================================
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        mainText: '#0F172A', secondaryText: '#64748B',
        successBg: '#DCFCE7', successText: '#16A34A',
        warningBg: '#FEF9C3', warningText: '#CA8A04',
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
    const handleManualUpdate = async (id, currentStatus) => {
        const newStatus = prompt(`Update status for Record ID ${id} (e.g., PRESENT, ABSENT, LATE):`, currentStatus);
        if (!newStatus || newStatus.toUpperCase() === currentStatus.toUpperCase()) return;

        try {
            await api.put(`/api/attendance/admin-update/${id}?status=${newStatus.toUpperCase()}`);
            toast.success("Attendance updated successfully!");
            fetchAttendance();
        } catch (err) {
            toast.error("Failed to update attendance.");
        }
    };

    return (
        <DashboardLayout role="ADMIN" title="Attendance Management">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                
                {/* PAGE HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.mainText, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                            Attendance Management
                        </h1>
                        <p style={{ color: colors.secondaryText, fontSize: '15px', margin: 0 }}>
                            Sync biometric records and monitor daily employee work logs.
                        </p>
                    </div>
                    <button 
                        onClick={fetchAttendance} 
                        style={{ 
                            background: colors.lightBlue, color: colors.primaryBlue, border: `1px solid ${colors.border}`, 
                            padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                            gap: '8px', fontWeight: '700', transition: '0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
                        onMouseOut={(e) => e.currentTarget.style.background = colors.lightBlue}
                    >
                        <RefreshCw size={18} /> Refresh Data
                    </button>
                </div>

                {/* A. COMPACT ELITE UPLOAD BAR */}
                <div style={{ 
                    background: colors.cardWhite, padding: '24px 32px', marginBottom: '32px', borderRadius: '24px', 
                    border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
                }}>
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

                    <form onSubmit={handleFileUpload} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: colors.inputBg, padding: '8px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                        <input 
                            id="attendance-upload-input" type="file" accept=".xlsx, .csv, .pdf"
                            onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} 
                        />
                        
                        <label 
                            htmlFor="attendance-upload-input" 
                            style={{ background: '#FFFFFF', border: `1px solid ${colors.border}`, padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
                        >
                            <FileSpreadsheet size={16} color={colors.primaryBlue} /> 
                            {file ? 'Change File' : 'Choose File'}
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
                            <span style={{ fontSize: '13px', color: file ? colors.successText : colors.secondaryText, fontWeight: '600', maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {file ? file.name : 'No file selected'}
                            </span>
                            {file && (
                                <button type="button" onClick={() => setFile(null)} style={{ background: 'transparent', border: 'none', color: colors.dangerText, cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }} title="Remove file">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div style={{ width: '1px', height: '30px', background: colors.border, margin: '0 4px' }}></div>

                        <button 
                            type="submit" disabled={loading || !file}
                            style={{ 
                                background: (loading || !file) ? '#94A3B8' : colors.primaryBlue, color: '#fff', 
                                padding: '10px 24px', border: 'none', borderRadius: '10px', fontWeight: '700', 
                                cursor: (loading || !file) ? 'not-allowed' : 'pointer', transition: '0.3s', 
                                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
                                boxShadow: (loading || !file) ? 'none' : '0 4px 10px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            {loading ? <RefreshCw size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                            {loading ? 'Syncing...' : 'Execute Sync'}
                        </button>
                    </form>
                </div>

                {/* B. ATTENDANCE TABLE */}
                <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: '0 0 24px 0', color: colors.mainText, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <UserCheck size={20} color={colors.primaryBlue} /> Daily Log Records
                    </h3>

                    <div style={{ overflowX: 'auto' }}>
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
                                                    onClick={() => handleManualUpdate(row.id, row.status)}
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

            </div>
            <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </DashboardLayout>
    );
};

export default AdminAttendance;