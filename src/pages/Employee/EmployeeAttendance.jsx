import React, { useState, useEffect } from 'react';
// Changed from '../layouts' to '../../layouts'
import DashboardLayout from '../../layouts/DashboardLayout'; 
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
// Changed from '../api' to '../../api'
import api from '../../api/apiConfig'; 
import toast from 'react-hot-toast';

const EmployeeAttendance = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, totalHours: 0 });

    const colors = {
        primaryBlue: '#2563EB',
        lightBlue: '#EAF2FF',
        background: '#F5F9FF',
        cardWhite: '#FFFFFF',
        mainText: '#0F172A',
        secondaryText: '#64748B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: '#DCE6F2'
    };

    useEffect(() => {
        fetchMyAttendance();
    }, []);

    const fetchMyAttendance = async () => {
        try {
            setLoading(true);
            // Employee strictly accessing only their personal records
            const res = await api.get('/api/attendance/my');
            const data = res.data || [];
            
            setAttendanceRecords(data);
            calculateSummary(data);
        } catch (error) {
            console.error("Failed to load attendance records", error);
            toast.error("Unable to load attendance data.");
        } finally {
            setLoading(false);
        }
    };
    
    const calculateSummary = (data) => {
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        let totalMins = 0;

        data.forEach(record => {
            const status = record.status ? record.status.toUpperCase() : '';
            if (status.includes('PRESENT')) presentCount++;
            else if (status.includes('ABSENT')) absentCount++;
            else if (status.includes('LATE') || status.includes('HALF_DAY')) lateCount++;

            if (record.workMinutes) totalMins += record.workMinutes;
        });

        setSummary({
            present: presentCount,
            absent: absentCount,
            late: lateCount,
            totalHours: Math.floor(totalMins / 60)
        });
    };

    const formatMinutesToHours = (minutes) => {
        if (!minutes) return "-";
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const getStatusStyle = (status) => {
        const s = status ? status.toUpperCase() : '';
        if (s.includes('PRESENT')) return { bg: '#ecfdf5', color: colors.success };
        if (s.includes('ABSENT')) return { bg: '#fef2f2', color: colors.danger };
        if (s.includes('LATE') || s.includes('HALF')) return { bg: '#fffbeb', color: colors.warning };
        return { bg: colors.lightBlue, color: colors.primaryBlue };
    };

    const cardStyle = {
        background: colors.cardWhite,
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${colors.border}`,
        fontFamily: "'Inter', sans-serif"
    };

    return (
        <DashboardLayout role="EMPLOYEE" title="My Attendance Records">
            <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
                
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '600', color: colors.mainText, margin: '0 0 8px 0' }}>
                        Attendance History
                    </h1>
                    <p style={{ color: colors.secondaryText, fontSize: '15px', margin: 0 }}>
                        Review your daily check-in, check-out times, and total logged hours.
                    </p>
                </div>

                {/* 1. Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '50%', color: colors.success }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Days Present</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>{loading ? '-' : summary.present}</h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '50%', color: colors.danger }}>
                            <XCircle size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Days Absent</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>{loading ? '-' : summary.absent}</h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '50%', color: colors.warning }}>
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Late / Half-Day</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>{loading ? '-' : summary.late}</h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '50%', color: colors.primaryBlue }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>Total Hours Logged</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.mainText, margin: 0 }}>{loading ? '-' : `${summary.totalHours} Hrs`}</h3>
                        </div>
                    </div>
                </div>

                {/* 2. Detailed Attendance Table */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.mainText, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={20} color={colors.primaryBlue} /> Daily Records
                    </h2>
                    
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${colors.border}`, backgroundColor: '#fafafa' }}>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Check In</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Check Out</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Work Hours</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '14px 16px', color: colors.secondaryText, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: colors.secondaryText }}>Loading records...</td>
                                    </tr>
                                ) : attendanceRecords.length > 0 ? (
                                    attendanceRecords.map((record, index) => {
                                        const statusStyle = getStatusStyle(record.status);
                                        return (
                                            <tr key={index} style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s' }}>
                                                <td style={{ padding: '16px', color: colors.mainText, fontWeight: '500', fontSize: '14px' }}>
                                                    {record.date || "-"}
                                                </td>
                                                <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px' }}>
                                                    {record.checkIn || "--:--"}
                                                </td>
                                                <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '14px' }}>
                                                    {record.checkOut || "--:--"}
                                                </td>
                                                <td style={{ padding: '16px', color: colors.mainText, fontWeight: '500', fontSize: '14px' }}>
                                                    {formatMinutesToHours(record.workMinutes)}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{ 
                                                        background: statusStyle.bg, 
                                                        color: statusStyle.color, 
                                                        padding: '6px 12px', 
                                                        borderRadius: '20px', 
                                                        fontSize: '12px', 
                                                        fontWeight: '600',
                                                        display: 'inline-block'
                                                    }}>
                                                        {record.status || "UNKNOWN"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', color: colors.secondaryText, fontSize: '13px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {record.remarks || "-"}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: colors.secondaryText }}>
                                            <Calendar size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                            <p style={{ margin: 0 }}>No attendance records found.</p>
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

export default EmployeeAttendance;