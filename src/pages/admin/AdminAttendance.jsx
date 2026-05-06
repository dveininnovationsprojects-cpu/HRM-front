import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { RefreshCw, FileSpreadsheet, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast'; // MASS FIX: Toast import panniyachu

const AdminAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

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
            toast.error("Mamey, first Excel file-ah select pannu!"); // MASS FIX: Alert to Toast
            return;
        }

        const formData = new FormData();
        formData.append('file', file); // API expects 'file' parameter 

        setLoading(true);
        // Toast loading state
        const loadingToast = toast.loading('Uploading attendance...');

        try {
            // API: POST /api/attendance/upload 
            const res = await api.post('/api/attendance/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Dismiss loading toast and show success
            toast.dismiss(loadingToast);
            
            // Extract the backend message (e.g., "Upload Completed ✅ | Saved: X | Skipped: Y")
            const successMessage = res.data || "Attendance uploaded successfully!";
            toast.success(successMessage, { duration: 4000 }); // Show for 4 seconds
            
            setFile(null);
            // Reset input file field visually
            document.getElementById('attendance-upload-input').value = ""; 
            
            fetchAttendance(); // Auto refresh table 
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Upload failed. Check file format mamey!"); // MASS FIX: Alert to Toast
        } finally {
            setLoading(false);
        }
    };

    // 3. Optional: Admin Manual Update Logic
    const handleManualUpdate = async (id, currentStatus) => {
        const newStatus = prompt(`Update status for Record ID ${id}:`, currentStatus);
        if (!newStatus || newStatus === currentStatus) return;

        try {
            await api.put(`/api/attendance/admin-update/${id}?status=${newStatus}`);
            toast.success("Attendance updated successfully!");
            fetchAttendance();
        } catch (err) {
            toast.error("Failed to update attendance.");
        }
    };

    return (
        <DashboardLayout role="ADMIN" title="Attendance Management">
            {/* Header Section  */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <p style={{ color: '#64748b' }}>Sync biometric records and monitor daily work logs</p>
                <button onClick={fetchAttendance} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#3b82f6', fontWeight: 'bold' }}>
                    <RefreshCw size={18} /> Refresh
                </button>
            </div>

            {/* A. Upload Section (Top Card)  */}
            <div className="dashboard-card" style={{ padding: '30px', marginBottom: '30px', border: '2px dashed #cbd5e1', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>
                <FileSpreadsheet size={48} color="#3b82f6" style={{ marginBottom: '15px' }} />
                <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>Biometric / Excel Upload</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>Select .xlsx or .pdf file to bulk insert attendance</p>
                
                <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <input 
                        id="attendance-upload-input"
                        type="file" 
                        accept=".xlsx, .csv, .pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '300px' }}
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !file}
                        style={{ background: (loading || !file) ? '#94a3b8' : '#3b82f6', color: '#fff', padding: '12px 30px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (loading || !file) ? 'not-allowed' : 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {loading ? <RefreshCw size={18} className="animate-spin" /> : null}
                        {loading ? 'Processing...' : 'Upload Attendance'}
                    </button>
                </form>
            </div>

            {/* B. Attendance Table */}
            <div className="dashboard-card" style={{ padding: '25px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                                <th style={{ padding: '15px' }}>EMP ID</th>
                                <th>DATE</th>
                                <th>CHECK IN</th>
                                <th>CHECK OUT</th>
                                <th>WORK MINS</th>
                                <th>STATUS</th>
                                <th>REMARKS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.length > 0 ? attendance.map((row, index) => {
                                const statusStr = String(row.status || '').toUpperCase();
                                const isPresent = statusStr.includes('PRESENT');
                                const isAbsent = statusStr.includes('ABSENT');
                                const isLate = statusStr.includes('LATE');
                                
                                let badgeBg = '#fffbeb';
                                let badgeText = '#d97706';
                                
                                if (isPresent && !isLate) { badgeBg = '#dcfce7'; badgeText = '#16a34a'; }
                                else if (isAbsent) { badgeBg = '#fee2e2'; badgeText = '#dc2626'; }
                                else if (isPresent && isLate) { badgeBg = '#fef3c7'; badgeText = '#d97706'; }

                                return (
                                    <tr key={index} style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#1e293b' }}>{row.employeeId}</td>
                                        <td style={{ color: '#475569', fontWeight: '500' }}>{row.date}</td>
                                        <td style={{ color: '#16a34a', fontWeight: '500' }}>{row.checkIn || '--:--'}</td>
                                        <td style={{ color: '#ef4444', fontWeight: '500' }}>{row.checkOut || '--:--'}</td>
                                        <td style={{ color: '#475569' }}>{row.workMinutes ? `${Math.floor(row.workMinutes / 60)}h ${row.workMinutes % 60}m` : '-'}</td>
                                        <td>
                                            <span style={{ 
                                                padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                                background: badgeBg, color: badgeText, display: 'inline-block'
                                            }}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '12px', color: '#64748b', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {row.remarks || '-'}
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleManualUpdate(row.id, row.status)}
                                                style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                                                title="Edit Status"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        No attendance records synced yet. Upload a file above.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminAttendance;