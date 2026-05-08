import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { RefreshCw, FileSpreadsheet, Edit3, UploadCloud, Calendar, Clock, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast'; 

const AdminAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // ==========================================
    // ELITE COLOR PALETTE
    // ==========================================
    const colors = {
        primaryBlue: '#2563EB',
        lightBlue: '#EFF6FF',
        mainText: '#0F172A',
        secondaryText: '#64748B',
        successBg: '#DCFCE7',
        successText: '#16A34A',
        warningBg: '#FEF9C3',
        warningText: '#CA8A04',
        dangerBg: '#FEE2E2',
        dangerText: '#DC2626',
        border: '#E2E8F0',
        cardWhite: '#FFFFFF'
    };

    // 1. Load All Attendance Flow
    const fetchAttendance = async () => {
        try {
            const res = await api.get('/api/attendance/all');
            // Sort by Date (Latest First)
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
            <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '30px' }}>
                
                {/* PAGE HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: '0 0 8px 0' }}>
                            Attendance Management
                        </h1>
                        <p style={{ color: colors.secondaryText, fontSize: '15px', margin: 0 }}>
                            Sync biometric records and monitor daily employee work logs.
                        </p>
                    </div>
                    <button 
                        onClick={fetchAttendance} 
                        style={{ 
                            background: colors.lightBlue, 
                            color: colors.primaryBlue, 
                            border: `1px solid ${colors.border}`, 
                            padding: '10px 16px', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            fontWeight: '600',
                            transition: '0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
                        onMouseOut={(e) => e.currentTarget.style.background = colors.lightBlue}
                    >
                        <RefreshCw size={18} /> Refresh Data
                    </button>
                </div>

                {/* A. UPLOAD SECTION (Enterprise Style) */}
                <div style={{ 
                    background: colors.cardWhite, 
                    padding: '32px', 
                    marginBottom: '30px', 
                    borderRadius: '16px', 
                    border: `1px solid ${colors.border}`,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative Background Element */}
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.03, transform: 'rotate(15deg)' }}>
                        <FileSpreadsheet size={150} />
                    </div>

                    <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '50%', color: colors.primaryBlue, marginBottom: '16px' }}>
                        <UploadCloud size={36} />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: colors.mainText, fontWeight: '700' }}>
                        Biometric / Excel Bulk Upload
                    </h3>
                    <p style={{ fontSize: '14px', color: colors.secondaryText, margin: '0 0 24px 0', textAlign: 'center', maxWidth: '400px' }}>
                        Select your device exported .xlsx, .csv, or .pdf file to bulk insert or sync today's attendance records.
                    </p>
                    
                    <form onSubmit={handleFileUpload} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px', zIndex: 1 }}>
                        <div style={{ position: 'relative' }}>
                            <input 
                                id="attendance-upload-input"
                                type="file" 
                                accept=".xlsx, .csv, .pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{ 
                                    padding: '12px 16px', 
                                    background: '#F8FAFC', 
                                    borderRadius: '8px', 
                                    border: `1px dashed #CBD5E1`, 
                                    width: '100%', 
                                    maxWidth: '350px',
                                    color: colors.secondaryText,
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || !file}
                            style={{ 
                                background: (loading || !file) ? '#94A3B8' : colors.primaryBlue, 
                                color: '#fff', 
                                padding: '12px 24px', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontWeight: '600', 
                                cursor: (loading || !file) ? 'not-allowed' : 'pointer', 
                                transition: '0.3s', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                boxShadow: (loading || !file) ? 'none' : '0 4px 6px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            {loading ? <RefreshCw size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
                            {loading ? 'Processing...' : 'Sync Attendance'}
                        </button>
                    </form>
                </div>

                {/* B. ATTENDANCE TABLE (Matches Admin Leaves Style) */}
                <div style={{ background: colors.cardWhite, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: colors.mainText, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCheck size={20} color={colors.primaryBlue} /> Daily Log Records
                    </h3>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${colors.border}`, backgroundColor: '#FAFAFA' }}>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Emp ID</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Check In</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Check Out</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Work Mins</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Remarks</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
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
                                        <tr key={index} style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s', ':hover': { backgroundColor: '#F8FAFC' } }}>
                                            <td style={{ padding: '16px', fontWeight: '700', color: colors.mainText, fontSize: '14px' }}>
                                                {row.employeeId}
                                            </td>
                                            <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} opacity={0.6}/> {row.date}
                                            </td>
                                            <td style={{ padding: '16px', color: colors.successText, fontWeight: '600', fontSize: '14px' }}>
                                                {row.checkIn || '--:--'}
                                            </td>
                                            <td style={{ padding: '16px', color: colors.dangerText, fontWeight: '600', fontSize: '14px' }}>
                                                {row.checkOut || '--:--'}
                                            </td>
                                            <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px', fontWeight: '500' }}>
                                                {row.workMinutes ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Clock size={14} opacity={0.6}/> {Math.floor(row.workMinutes / 60)}h {row.workMinutes % 60}m
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '11px', 
                                                    fontWeight: '700',
                                                    background: badgeBg, 
                                                    color: badgeText, 
                                                    display: 'inline-block',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '13px', color: colors.secondaryText, maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {row.remarks || '-'}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <button 
                                                    onClick={() => handleManualUpdate(row.id, row.status)}
                                                    style={{ 
                                                        background: colors.lightBlue, 
                                                        color: colors.primaryBlue, 
                                                        border: 'none', 
                                                        padding: '8px', 
                                                        borderRadius: '8px', 
                                                        cursor: 'pointer',
                                                        transition: '0.2s'
                                                    }}
                                                    title="Manual Edit"
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = colors.lightBlue}
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '60px', color: colors.secondaryText }}>
                                            <FileSpreadsheet size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                            <p style={{ margin: 0, fontSize: '15px' }}>No attendance records synced yet. Upload a biometric file above.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default AdminAttendance;