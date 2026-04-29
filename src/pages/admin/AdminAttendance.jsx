import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { Upload, RefreshCw, FileSpreadsheet } from 'lucide-react';

const AdminAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. Load All Attendance Flow [cite: 14]
    const fetchAttendance = async () => {
        try {
            const res = await api.get('/api/attendance/all');
            setAttendance(res.data);
        } catch (err) {
            console.error("Attendance load failed");
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    // 2. Excel Upload Logic 
    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Mamey, first Excel file-ah select pannu!");
            return;
        }

        const formData = new FormData();
        formData.append('file', file); // API expects 'file' parameter 

        setLoading(true);
        try {
            // API: POST /api/attendance/upload 
            await api.post('/api/attendance/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Attendance uploaded successfully! ");
            setFile(null);
            fetchAttendance(); // Auto refresh table 
        } catch (err) {
            alert("Upload failed. Check file format mamey!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="ADMIN" title="Attendance Management">
            {/* Header Section  */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <p style={{ color: '#64748b' }}>Sync biometric records and monitor daily work logs</p>
                <button onClick={fetchAttendance} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <RefreshCw size={20} color="#3b82f6" />
                </button>
            </div>

            {/* A. Upload Section (Top Card)  */}
            <div className="dashboard-card" style={{ padding: '30px', marginBottom: '30px', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                <FileSpreadsheet size={40} color="#3b82f6" style={{ marginBottom: '15px' }} />
                <h4>Biometric / Excel Upload</h4>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>Select .xlsx or .csv file to bulk insert attendance </p>
                
                <form onSubmit={handleFileUpload} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <input 
                        type="file" 
                        accept=".xlsx, .csv"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ background: '#3b82f6', color: '#fff', padding: '12px 30px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {loading ? 'Uploading...' : 'Upload Attendance'}
                    </button>
                </form>
            </div>

            {/* B. Attendance Table [cite: 14] */}
            <div className="dashboard-card" style={{ padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                            <th style={{ padding: '15px' }}>EMPLOYEE ID</th>
                            <th>DATE</th>
                            <th>CHECK IN</th>
                            <th>CHECK OUT</th>
                            <th>WORK MINS</th>
                            <th>STATUS</th>
                            <th>REMARKS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.map((row, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{row.employeeId}</td>
                                <td>{row.date}</td>
                                <td style={{ color: '#16a34a' }}>{row.checkIn}</td>
                                <td style={{ color: '#ef4444' }}>{row.checkOut}</td>
                                <td>{row.workMinutes}</td>
                                <td>
                                    <span style={{ 
                                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
                                        background: row.status === 'PRESENT' ? '#dcfce7' : '#fee2e2',
                                        color: row.status === 'PRESENT' ? '#16a34a' : '#dc2626'
                                    }}>
                                        {row.status}
                                    </span>
                                </td>
                                <td style={{ fontSize: '12px', color: '#64748b' }}>{row.remarks || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};

export default AdminAttendance;