import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    Clock, Search, CheckCircle, XCircle, AlertCircle, 
    Calendar, UserCheck, Edit3, UploadCloud, Download,
    Filter, ChevronLeft, ChevronRight, X, FileSpreadsheet,
    Loader2, Users, Activity
} from 'lucide-react';

const HRAttendance = () => {
    // =========================================================================
    // 1. STATE MANAGEMENT
    // =========================================================================
    const [attendanceLog, setAttendanceLog] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtering & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDate, setFilterDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Custom UI Modals (Replacing Chrome Popups)
    const [editModal, setEditModal] = useState({ isOpen: false, data: null, newStatus: '' });
    const [uploadModal, setUploadModal] = useState({ isOpen: false, file: null, uploading: false });

    // =========================================================================
    // 2. ELITE THEME COLORS
    // =========================================================================
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        cardWhite: '#FFFFFF', mainText: '#0F172A', secondaryText: '#64748B',
        success: '#10B981', successLight: '#ECFDF5',
        warning: '#F59E0B', warningLight: '#FFFBEB',
        danger: '#EF4444', dangerLight: '#FEF2F2',
        border: '#E2E8F0', inputBg: '#F1F5F9'
    };

    // =========================================================================
    // 3. API FETCH LOGIC
    // =========================================================================
    useEffect(() => {
        fetchAllAttendance();
    }, []);

const fetchAllAttendance = async () => {
        try {
            setLoading(true);
            
            // 1. Rendu API-um orey nerathula call panrom (Attendance + Employees)
            const [attendanceRes, employeeRes] = await Promise.all([
                api.get('/api/attendance/all').catch(() => ({ data: [] })),
                api.get('/api/employees').catch(() => ({ data: [] })) // Get all employees API
            ]);

            let attendanceData = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
            let employeeData = Array.isArray(employeeRes.data) ? employeeRes.data : [];

            // 2. Employee Map create panrom (ID -> Name) fast aaga theda
            const employeeMap = {};
            employeeData.forEach(emp => {
                // Biometric ID (eg: DVN-CORE-037) kkum peru set panrom
                if (emp.biometricId) {
                    employeeMap[emp.biometricId] = emp.fullName;
                }
                // Normal DB ID kkum peru set panrom (Just in case)
                if (emp.id) {
                    employeeMap[emp.id] = emp.fullName;
                }
            });

            // 3. Attendance Data kooda Employee Name-ah map panrom
            const mappedData = attendanceData.map(log => {
                // Backend 'employeeId' or 'employee_id' nu epdi anupunalum edukkum
                const empIdToCheck = log.employeeId || log.employee_id;
                
                return {
                    ...log,
                    // Map-la irunthu name edukkum, illana 'Unknown' nu podum
                    employeeName: employeeMap[empIdToCheck] || 'Unknown' 
                };
            });

            // 4. Date vachu Descending order la sort panrom
            mappedData.sort((a, b) => {
                const dateA = new Date(a.date || a.attendanceDate || a.attendance_date);
                const dateB = new Date(b.date || b.attendanceDate || b.attendance_date);
                return dateB - dateA;
            });

            setAttendanceLog(mappedData);
            
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load attendance records.");
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 4. HR ACTIONS (CUSTOM MODALS LOGIC)
    // =========================================================================
    
    // --- EDIT STATUS FLOW ---
    const openEditModal = (record) => {
        setEditModal({ isOpen: true, data: record, newStatus: record.status || 'PRESENT' });
    };

    const closeEditModal = () => {
        setEditModal({ isOpen: false, data: null, newStatus: '' });
    };

    const submitStatusUpdate = async () => {
        if (!editModal.data) return;
        try {
            const id = editModal.data.id;
            const status = editModal.newStatus;
            
            await api.put(`/api/attendance/admin-update/${id}`, null, {
                params: { status: status.toUpperCase() }
            });
            
            toast.success(`Status updated to ${status}!`);
            closeEditModal();
            fetchAllAttendance(); // Refresh table
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Failed to update status.");
        }
    };

    // --- BULK UPLOAD FLOW ---
    const openUploadModal = () => {
        setUploadModal({ isOpen: true, file: null, uploading: false });
    };

    const closeUploadModal = () => {
        setUploadModal({ isOpen: false, file: null, uploading: false });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploadModal({ ...uploadModal, file: e.target.files[0] });
        }
    };

    const submitBulkUpload = async () => {
        if (!uploadModal.file) {
            toast.error("Please select an Excel file first.");
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadModal.file);

        try {
            setUploadModal(prev => ({ ...prev, uploading: true }));
            // Calling the backend upload endpoint
            const res = await api.post('/api/attendance/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success("Bulk attendance uploaded successfully!");
            closeUploadModal();
            fetchAllAttendance();
        } catch (err) {
            console.error("Upload error:", err);
            toast.error(err.response?.data || "Failed to upload attendance file.");
            setUploadModal(prev => ({ ...prev, uploading: false }));
        }
    };

    // =========================================================================
    // 5. DATA PROCESSING (Filtering, Pagination, Metrics)
    // =========================================================================
    
    const processedData = useMemo(() => {
        let filtered = attendanceLog;

        // Apply Search
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(log => 
                (log.employeeName && log.employeeName.toLowerCase().includes(lowerSearch)) ||
                (log.employeeId && String(log.employeeId).includes(lowerSearch))
            );
        }

        // Apply Status Filter
        if (filterStatus !== 'ALL') {
            filtered = filtered.filter(log => log.status?.toUpperCase() === filterStatus);
        }

        // Apply Date Filter
        if (filterDate) {
            filtered = filtered.filter(log => log.date === filterDate);
        }

        return filtered;
    }, [attendanceLog, searchTerm, filterStatus, filterDate]);

    // Pagination Logic
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const currentData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        // Reset to page 1 if filters change
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterDate]);

    // Calculate Metrics for Today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = attendanceLog.filter(log => log.date === todayStr);
    
    const metrics = {
        total: todayLogs.length,
        present: todayLogs.filter(l => l.status === 'PRESENT').length,
        absent: todayLogs.filter(l => l.status === 'ABSENT').length,
        halfDay: todayLogs.filter(l => l.status === 'HALF_DAY').length,
    };

    // =========================================================================
    // 6. UI HELPER FUNCTIONS
    // =========================================================================
    const getStatusStyle = (status) => {
        const s = status ? status.toUpperCase() : 'UNKNOWN';
        if (s === 'PRESENT') return { bg: colors.successLight, color: colors.success, icon: <CheckCircle size={14}/>, label: 'Present' };
        if (s === 'ABSENT') return { bg: colors.dangerLight, color: colors.danger, icon: <XCircle size={14}/>, label: 'Absent' };
        if (s === 'HALF_DAY') return { bg: colors.warningLight, color: colors.warning, icon: <AlertCircle size={14}/>, label: 'Half Day' };
        return { bg: colors.inputBg, color: colors.secondaryText, icon: <Clock size={14}/>, label: s };
    };

    const formatTime = (timeData) => {
        if (!timeData) return '--:--';
        // Sila neram Spring Boot LocalTime-ah array-va anuppum: [9, 5] instead of "09:05:00"
        if (Array.isArray(timeData)) {
            const hours = String(timeData[0]).padStart(2, '0');
            const mins = String(timeData[1] || 0).padStart(2, '0');
            return `${hours}:${mins}`;
        }
        // String-ah vantha direct-a format panrathu
        return String(timeData).substring(0, 5); 
    };

    // =========================================================================
    // 7. RENDER COMPONENT
    // =========================================================================
    return (
        <DashboardLayout role="HR" title="Attendance Management">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
                
                {/* --------------------------------------------------------- */}
                {/* HEADER & ACTIONS                                          */}
                {/* --------------------------------------------------------- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '26px', fontWeight: '800', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.5px' }}>
                            <UserCheck color={colors.primaryBlue} size={28} /> Workforce Attendance
                        </h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '15px' }}>
                            Monitor daily logs, override statuses, and manage bulk uploads.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={openUploadModal}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                        >
                            <UploadCloud size={18} /> Bulk Upload
                        </button>
                        <button 
                            onClick={fetchAllAttendance}
                            className="btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#fff', color: colors.mainText, border: `1px solid ${colors.border}`, borderRadius: '10px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                        >
                            <Activity size={18} /> Refresh
                        </button>
                    </div>
                </div>

                {/* --------------------------------------------------------- */}
                {/* TODAY'S METRICS CARDS                                     */}
                {/* --------------------------------------------------------- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div className="metric-card" style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: colors.lightBlue, padding: '14px', borderRadius: '12px', color: colors.primaryBlue }}><Users size={24}/></div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: colors.secondaryText, fontWeight: '600', textTransform: 'uppercase' }}>Today's Logs</p>
                            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: colors.mainText }}>{metrics.total}</h3>
                        </div>
                    </div>
                    <div className="metric-card" style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: colors.successLight, padding: '14px', borderRadius: '12px', color: colors.success }}><CheckCircle size={24}/></div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: colors.secondaryText, fontWeight: '600', textTransform: 'uppercase' }}>Present</p>
                            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: colors.mainText }}>{metrics.present}</h3>
                        </div>
                    </div>
                    <div className="metric-card" style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: colors.dangerLight, padding: '14px', borderRadius: '12px', color: colors.danger }}><XCircle size={24}/></div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: colors.secondaryText, fontWeight: '600', textTransform: 'uppercase' }}>Absent</p>
                            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: colors.mainText }}>{metrics.absent}</h3>
                        </div>
                    </div>
                    <div className="metric-card" style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: colors.warningLight, padding: '14px', borderRadius: '12px', color: colors.warning }}><AlertCircle size={24}/></div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: colors.secondaryText, fontWeight: '600', textTransform: 'uppercase' }}>Half Day</p>
                            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: colors.mainText }}>{metrics.halfDay}</h3>
                        </div>
                    </div>
                </div>

                {/* --------------------------------------------------------- */}
                {/* FILTERS & SEARCH SECTION                                  */}
                {/* --------------------------------------------------------- */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px 16px 0 0', border: `1px solid ${colors.border}`, borderBottom: 'none', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    
                    {/* Search Bar */}
                    <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.secondaryText }} />
                        <input 
                            type="text" placeholder="Search employee name or ID..." 
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '14px', boxSizing: 'border-box', background: colors.inputBg }}
                        />
                    </div>

                    {/* Date Filter */}
                    <div style={{ position: 'relative', width: '180px' }}>
                        <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.secondaryText }} />
                        <input 
                            type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '14px', boxSizing: 'border-box', background: colors.inputBg, color: colors.mainText }}
                        />
                    </div>

                    {/* Status Filter Dropdown */}
                    <div style={{ position: 'relative', width: '160px' }}>
                        <Filter size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.secondaryText }} />
                        <select 
                            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '14px', boxSizing: 'border-box', background: colors.inputBg, color: colors.mainText, cursor: 'pointer', appearance: 'none' }}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="HALF_DAY">Half Day</option>
                        </select>
                    </div>

                    {/* Clear Filters Button */}
                    {(searchTerm || filterDate || filterStatus !== 'ALL') && (
                        <button 
                            onClick={() => { setSearchTerm(''); setFilterDate(''); setFilterStatus('ALL'); }}
                            style={{ padding: '12px 16px', background: colors.dangerLight, color: colors.danger, border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* --------------------------------------------------------- */}
                {/* DATA TABLE SECTION                                        */}
                {/* --------------------------------------------------------- */}
                <div style={{ background: colors.cardWhite, borderRadius: '0 0 16px 16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: colors.background, borderBottom: `2px solid ${colors.border}` }}>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check In</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check Out</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '60px', textAlign: 'center' }}>
                                            <Loader2 size={30} color={colors.primaryBlue} className="spin" style={{ margin: '0 auto 10px' }} />
                                            <p style={{ color: colors.secondaryText, fontWeight: '500' }}>Fetching records...</p>
                                        </td>
                                    </tr>
                                ) : currentData.length > 0 ? (
                                   currentData.map((log) => {
    const statusStyle = getStatusStyle(log.status);
    
    // Backend keys epdi vanthalum handle panra logic
    const empName = log.employeeName || log.employee?.fullName || 'Unknown';
    const empId = log.employeeId || log.employee_id || log.employee?.biometricId || 'N/A';
    const checkInStr = log.checkIn || log.check_in || log.checkInTime;
    const checkOutStr = log.checkOut || log.check_out || log.checkOutTime;
    const logDate = log.date || log.attendanceDate || log.attendance_date;

    return (
        <tr key={log.id} className="table-row" style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s' }}>
            <td style={{ padding: '16px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.lightBlue, color: colors.primaryBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>
                        {empName !== 'Unknown' ? empName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                        <p style={{ margin: 0, fontWeight: '700', color: colors.mainText, fontSize: '14px', textTransform: 'capitalize' }}>{empName}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: colors.secondaryText, fontWeight: '500' }}>ID: {empId}</p>
                    </div>
                </div>
            </td>
            <td style={{ padding: '16px 24px', color: colors.mainText, fontSize: '14px', fontWeight: '600' }}>
                {logDate}
            </td>
            <td style={{ padding: '16px 24px' }}>
                <span style={{ padding: '6px 10px', background: colors.background, border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: colors.secondaryText }}>
                    {formatTime(checkInStr)}
                </span>
            </td>
            <td style={{ padding: '16px 24px' }}>
                <span style={{ padding: '6px 10px', background: colors.background, border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: colors.secondaryText }}>
                    {formatTime(checkOutStr)}
                </span>
            </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{ 
                                                        display: 'inline-flex', alignItems: 'center', gap: '6px', 
                                                        padding: '6px 12px', borderRadius: '20px', 
                                                        background: statusStyle.bg, color: statusStyle.color, 
                                                        fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' 
                                                    }}>
                                                        {statusStyle.icon} {statusStyle.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                    <button 
                                                        onClick={() => openEditModal(log)}
                                                        className="action-btn"
                                                        style={{ 
                                                            background: 'transparent', border: `1px solid ${colors.border}`, 
                                                            color: colors.primaryBlue, padding: '8px 14px', 
                                                            borderRadius: '8px', cursor: 'pointer', fontSize: '12px', 
                                                            fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                            transition: '0.2s'
                                                        }}
                                                    >
                                                        <Edit3 size={14} /> Override
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '60px', textAlign: 'center' }}>
                                            <div style={{ background: colors.inputBg, width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                                <AlertCircle size={30} color={colors.secondaryText} />
                                            </div>
                                            <h4 style={{ margin: '0 0 5px', color: colors.mainText, fontSize: '16px' }}>No Records Found</h4>
                                            <p style={{ margin: 0, fontSize: '14px', color: colors.secondaryText }}>Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION CONTROLS */}
                    {!loading && processedData.length > 0 && (
                        <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                            <span style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500' }}>
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length} entries
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={{ padding: '8px 12px', border: `1px solid ${colors.border}`, background: currentPage === 1 ? colors.inputBg : '#fff', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', color: colors.mainText, transition: '0.2s' }}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '8px 12px', border: `1px solid ${colors.border}`, background: currentPage === totalPages ? colors.inputBg : '#fff', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', color: colors.mainText, transition: '0.2s' }}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ========================================================= */}
                {/* MODAL 1: EDIT STATUS (CHROME POPUP REPLACEMENT)           */}
                {/* ========================================================= */}
                {editModal.isOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '400px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.mainText }}>Override Attendance</h3>
                                <button onClick={closeEditModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.secondaryText }}><X size={20}/></button>
                            </div>
                            
                            <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                                <p style={{ margin: '0 0 5px', fontSize: '13px', color: colors.secondaryText, fontWeight: '600' }}>Employee</p>
                                <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: colors.primaryBlue }}>{editModal.data?.employeeName}</p>
                                <p style={{ margin: '8px 0 0', fontSize: '12px', color: colors.secondaryText, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Calendar size={12}/> Date: {editModal.data?.date}
                                </p>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' }}>Select New Status</label>
                                <select 
                                    value={editModal.newStatus} 
                                    onChange={(e) => setEditModal({...editModal, newStatus: e.target.value})}
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '14px', fontWeight: '600', color: colors.mainText, cursor: 'pointer', appearance: 'none', background: colors.inputBg }}
                                >
                                    <option value="PRESENT">Present</option>
                                    <option value="ABSENT">Absent</option>
                                    <option value="HALF_DAY">Half Day</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={closeEditModal} style={{ flex: 1, padding: '12px', background: colors.inputBg, color: colors.secondaryText, border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}>
                                    Cancel
                                </button>
                                <button onClick={submitStatusUpdate} style={{ flex: 1, padding: '12px', background: colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 10px rgba(37,99,235,0.2)' }}>
                                    Save Status
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* MODAL 2: BULK UPLOAD EXCEL                                */}
                {/* ========================================================= */}
                {uploadModal.isOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '450px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.mainText }}>Bulk Upload Attendance</h3>
                                <button onClick={closeUploadModal} disabled={uploadModal.uploading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.secondaryText }}><X size={20}/></button>
                            </div>

                            <p style={{ fontSize: '14px', color: colors.secondaryText, lineHeight: '1.5', marginBottom: '20px' }}>
                                Upload an Excel file (.xlsx) containing employee attendance data. Make sure the headers match the system requirements.
                            </p>

                            <div style={{ 
                                border: `2px dashed ${uploadModal.file ? colors.success : colors.primaryBlue}`, 
                                background: uploadModal.file ? colors.successLight : colors.lightBlue,
                                borderRadius: '12px', padding: '40px 20px', textAlign: 'center', 
                                cursor: 'pointer', position: 'relative', transition: '0.3s',
                                marginBottom: '24px'
                            }}>
                                <input 
                                    type="file" accept=".xlsx, .xls, .csv" 
                                    onChange={handleFileChange}
                                    disabled={uploadModal.uploading}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                                />
                                {uploadModal.file ? (
                                    <>
                                        <FileSpreadsheet size={40} color={colors.success} style={{ margin: '0 auto 10px' }} />
                                        <p style={{ margin: 0, fontWeight: '700', color: colors.success, fontSize: '14px' }}>{uploadModal.file.name}</p>
                                        <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#059669' }}>{(uploadModal.file.size / 1024).toFixed(2)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={40} color={colors.primaryBlue} style={{ margin: '0 auto 10px' }} />
                                        <p style={{ margin: 0, fontWeight: '700', color: colors.primaryBlue, fontSize: '14px' }}>Click or drag file here to upload</p>
                                        <p style={{ margin: '5px 0 0', fontSize: '12px', color: colors.secondaryText }}>Supports .xlsx, .csv</p>
                                    </>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={closeUploadModal} disabled={uploadModal.uploading} style={{ flex: 1, padding: '12px', background: colors.inputBg, color: colors.secondaryText, border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}>
                                    Cancel
                                </button>
                                <button 
                                    onClick={submitBulkUpload} 
                                    disabled={!uploadModal.file || uploadModal.uploading}
                                    style={{ flex: 1, padding: '12px', background: uploadModal.file ? colors.primaryBlue : '#94A3B8', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: uploadModal.file ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', boxShadow: uploadModal.file ? '0 4px 10px rgba(37,99,235,0.2)' : 'none' }}
                                >
                                    {uploadModal.uploading ? <Loader2 size={18} className="spin"/> : 'Start Upload'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* ========================================================================= */}
            {/* CSS STYLES (Animations & Layouts)                                       */}
            {/* ========================================================================= */}
            <style>
                {`
                    /* Hover Effects */
                    .metric-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.04); transition: all 0.3s ease; }
                    .btn-primary:hover { background: #1D4ED8 !important; }
                    .btn-secondary:hover { background: #F8FAFC !important; }
                    .table-row:hover { background-color: #F8FAFC; }
                    .action-btn:hover { background-color: #EFF6FF !important; }
                    
                    /* Animations */
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    
                    /* Custom Modals CSS (Replaces Chrome Popups) */
                    .modal-overlay {
                        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
                        display: flex; align-items: center; justify-content: center;
                        z-index: 9999; animation: fadeIn 0.2s ease-out;
                    }
                    .modal-content {
                        background: #fff; width: 100%; border-radius: 20px; padding: 32px;
                        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                        animation: slideUp 0.3s ease-out;
                    }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                `}
            </style>
        </DashboardLayout>
    );
};

export default HRAttendance;