import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
    Calendar, CheckCircle, XCircle, Clock, Search, 
    Filter, FileText, Check, X, AlertCircle, User
} from 'lucide-react';
import api from '../../api/apiConfig';
import toast, { Toaster } from 'react-hot-toast';

const HRLeaveManagement = () => {
    // =========================================================================
    // 1. STATE MANAGEMENT
    // =========================================================================
    const [leaves, setLeaves] = useState([]);
    const [filteredLeaves, setFilteredLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
   
const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    leaveId: null,
    actionType: null,
    text: ''
});

const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(5);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    // =========================================================================
    // 2. ELITE COLOR PALETTE (Matched with your previous UI)
    // =========================================================================
    const colors = {
        primaryBlue: '#2563EB',
        lightBlue: '#EFF6FF',
        background: '#F8FAFC',
        cardWhite: '#FFFFFF',
        mainText: '#0F172A',
        secondaryText: '#64748B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: '#E2E8F0',
    };

    // =========================================================================
    // 3. API DATA FETCHING
    // =========================================================================
    useEffect(() => {
        fetchAllLeaves();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [leaves, activeFilter, searchQuery]);

    const fetchAllLeaves = async () => {
        setLoading(true);
        try {
            // HR/Admin specific endpoint
            const res = await api.get('/api/leaves/all');
            const data = res.data || [];
            
            // Sort by latest first (assuming ID or startDate)
            const sortedData = data.sort((a, b) => b.id - a.id);
            
            setLeaves(sortedData);
            calculateStats(sortedData);
        } catch (error) {
            console.error("Failed to fetch leaves:", error);
            toast.error("Unable to load leave requests.");
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const newStats = { total: data.length, pending: 0, approved: 0, rejected: 0 };
        data.forEach(leave => {
            const status = leave.status?.toUpperCase();
            if (status === 'PENDING') newStats.pending++;
            else if (status === 'APPROVED') newStats.approved++;
            else if (status === 'REJECTED') newStats.rejected++;
        });
        setStats(newStats);
    };

    const applyFilters = () => {
    let result = [...leaves];

    // 1. Status Filter
    if (activeFilter !== 'ALL') {
        result = result.filter(leave => leave.status?.toUpperCase() === activeFilter);
    }

    // 2. Search Filter
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        result = result.filter(leave => 
            leave.employeeId?.toString().includes(query) ||
            leave.leaveType?.toLowerCase().includes(query) ||
            leave.reason?.toLowerCase().includes(query)
        );
    }

    // 🟢 PAGINATION INTERACTION: Current index range-ah slice panrom
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginatedResult = result.slice(indexOfFirst, indexOfLast);

    setFilteredLeaves(paginatedResult);
};

// 🟢 FILTER RESET SWITCH: Filter tabs mauthumpothu page-ah page 1-ku reset panrom
useEffect(() => {
    setCurrentPage(1);
}, [activeFilter, searchQuery]);

    // =========================================================================
    // 4. ACTION HANDLERS (Approve & Reject)
    // =========================================================================
    // 1. Intha function-ah simple-ah trigger open panna use pannunga
const handleAction = (leaveId, action) => {
    const actionText = action === 'approve' ? 'Approve' : 'Reject';
    setConfirmModal({
        isOpen: true,
        leaveId,
        actionType: action,
        text: `Are you sure you want to ${actionText.toLowerCase()} this leave request?`
    });
};

// 2. [NEW] Custom Modal Click panna execute aagura dynamic logic method
const executeConfirmedAction = async () => {
    const { leaveId, actionType } = confirmModal;
    setProcessingId(leaveId);
    setConfirmModal(prev => ({ ...prev, isOpen: false })); // Modal-ah close pannidrom
    
    try {
        await api.post(`/api/leaves/${actionType}/${leaveId}`);
        toast.success(`Leave request ${actionType}d successfully!`);
        
        const newStatus = actionType === 'approve' ? 'APPROVED' : 'REJECTED';
        const updatedLeaves = leaves.map(l => 
            l.id === leaveId ? { ...l, status: newStatus } : l
        );
        
        setLeaves(updatedLeaves);
        calculateStats(updatedLeaves);
    } catch (error) {
        console.error("Action failed:", error);
        toast.error(error.response?.data?.message || "Failed to process request.");
    } finally {
        setProcessingId(null);
    }
};

    // =========================================================================
    // 5. HELPER COMPONENTS & STYLES
    // =========================================================================
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    const getStatusConfig = (status) => {
        const s = status ? status.toUpperCase() : 'PENDING';
        if (s === 'APPROVED') return { bg: '#ECFDF5', color: colors.success, icon: <CheckCircle size={14} />, text: 'Approved' };
        if (s === 'REJECTED') return { bg: '#FEF2F2', color: colors.danger, icon: <XCircle size={14} />, text: 'Rejected' };
        return { bg: '#FFFBEB', color: colors.warning, icon: <Clock size={14} />, text: 'Pending' };
    };

    const cardStyle = {
        background: colors.cardWhite,
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${colors.border}`,
        fontFamily: "'Inter', sans-serif"
    };

    // =========================================================================
    // 6. MAIN RENDER
    // =========================================================================
    return (
        <DashboardLayout role="HR" title="Leave Management">
            <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '30px', fontFamily: "'Inter', sans-serif" }}>
                <Toaster 
  position="top-center" 
  toastOptions={{
    // 3 seconds la automatic-ah poga intha line kandaipa irukanum
    duration: 3000, 
    style: {
      background: '#333',
      color: '#fff',
      borderRadius: '10px',
    },
  }} 
/>
                
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.mainText, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                            Leave Requests
                        </h1>
                        <p style={{ margin: 0, fontSize: '15px', color: colors.secondaryText }}>
                            Review, approve, and manage employee leave applications.
                        </p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '30px' }}>
                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: colors.lightBlue, padding: '16px', borderRadius: '14px', color: colors.primaryBlue }}>
                            <FileText size={26} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase' }}>Total Requests</p>
                            <h3 style={{ fontSize: '26px', fontWeight: '800', color: colors.mainText, margin: 0 }}>{loading ? '-' : stats.total}</h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#FFFBEB', padding: '16px', borderRadius: '14px', color: colors.warning }}>
                            <Clock size={26} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase' }}>Pending Action</p>
                            <h3 style={{ fontSize: '26px', fontWeight: '800', color: colors.mainText, margin: 0 }}>{loading ? '-' : stats.pending}</h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ECFDF5', padding: '16px', borderRadius: '14px', color: colors.success }}>
                            <CheckCircle size={26} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase' }}>Approved</p>
                            <h3 style={{ fontSize: '26px', fontWeight: '800', color: colors.mainText, margin: 0 }}>{loading ? '-' : stats.approved}</h3>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#FEF2F2', padding: '16px', borderRadius: '14px', color: colors.danger }}>
                            <XCircle size={26} />
                        </div>
                        <div>
                            <p style={{ color: colors.secondaryText, fontSize: '13px', margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase' }}>Rejected</p>
                            <h3 style={{ fontSize: '26px', fontWeight: '800', color: colors.mainText, margin: 0 }}>{loading ? '-' : stats.rejected}</h3>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div style={{ ...cardStyle, padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: activeFilter === filter ? colors.primaryBlue : colors.lightBlue,
                                    color: activeFilter === filter ? '#fff' : colors.primaryBlue,
                                }}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                        <Search size={18} color={colors.secondaryText} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="text" 
                            placeholder="Search by ID, Type or Reason..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ 
                                width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: `1px solid ${colors.border}`, 
                                outline: 'none', fontSize: '14px', boxSizing: 'border-box' 
                            }}
                            className="focus-ring"
                        />
                    </div>
                </div>

                {/* Table Data */}
                <div style={{ ...cardStyle, padding: 0 }}>
                    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={20} color={colors.primaryBlue} />
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.mainText, margin: 0 }}>Application Records</h3>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: `2px solid ${colors.border}` }}>
                                    <th style={{ padding: '16px 24px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Employee ID</th>
                                    <th style={{ padding: '16px 24px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Leave Type</th>
                                    <th style={{ padding: '16px 24px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Duration / Dates</th>
                                    <th style={{ padding: '16px 24px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Reason</th>
                                    <th style={{ padding: '16px 24px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '16px 24px', color: colors.secondaryText, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: colors.secondaryText }}>
                                            <div className="fa-3x mb-3"><i className="fa-solid fa-circle-notch fa-spin text-blue-500"></i></div>
                                            Loading application records...
                                        </td>
                                    </tr>
                                ) : filteredLeaves.length > 0 ? (
                                    filteredLeaves.map((leave) => {
                                        const statConfig = getStatusConfig(leave.status);
                                        const isPending = leave.status?.toUpperCase() === 'PENDING';
                                        const isProcessing = processingId === leave.id;

                                        return (
                                            <tr key={leave.id} style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s', backgroundColor: '#fff', ':hover': { backgroundColor: '#f8fafc' } }}>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primaryBlue, fontWeight: 'bold' }}>
                                                            <User size={18} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '700', color: colors.mainText, fontSize: '14px' }}>EMP-{leave.employeeId}</div>
                                                            <div style={{ color: colors.secondaryText, fontSize: '12px' }}>Ref: #{leave.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{ fontWeight: '600', color: colors.primaryBlue, background: colors.lightBlue, padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
                                                        {leave.leaveType || 'General'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ color: colors.mainText, fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                                                        {formatDate(leave.startDate)} <span style={{color: colors.secondaryText}}>to</span> {formatDate(leave.endDate)}
                                                    </div>
                                                    <div style={{ color: colors.secondaryText, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Clock size={12} /> {leave.session || 'Full Day'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px', maxWidth: '250px' }}>
                                                    <div style={{ color: colors.mainText, fontSize: '13px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={leave.reason}>
                                                        {leave.reason || 'No reason provided'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{ 
                                                        background: statConfig.bg, color: statConfig.color, padding: '6px 12px', 
                                                        borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                                                    }}>
                                                        {statConfig.icon} {statConfig.text}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                    {isPending ? (
                                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                            <button 
                                                                onClick={() => handleAction(leave.id, 'approve')}
                                                                disabled={isProcessing}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px',
                                                                    background: '#ECFDF5', color: colors.success, border: `1px solid #A7F3D0`, borderRadius: '8px', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: '0.2s', opacity: isProcessing ? 0.5 : 1
                                                                }}
                                                                title="Approve Leave"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAction(leave.id, 'reject')}
                                                                disabled={isProcessing}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px',
                                                                    background: '#FEF2F2', color: colors.danger, border: `1px solid #FECACA`, borderRadius: '8px', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: '0.2s', opacity: isProcessing ? 0.5 : 1
                                                                }}
                                                                title="Reject Leave"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: colors.secondaryText, fontSize: '13px', fontWeight: '500' }}>Processed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: colors.secondaryText }}>
                                            <AlertCircle size={40} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                                            <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: colors.mainText }}>No Leave Records Found</p>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>Adjust your filters or search query to find records.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>


{/* 🟢 FIX: Cleaned and Optimized Pagination Bar */}
{leaves.length > itemsPerPage && (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '20px 24px', borderTop: `1px solid ${colors.border}`, background: '#FFF', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
        <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ padding: '8px 14px', border: `1px solid ${colors.border}`, background: '#fff', color: currentPage === 1 ? '#CBD5E1' : colors.mainText, borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', transition: '0.2s' }}
        >
            &laquo; Prev
        </button>
        
        {/* 🟢 Fix: Using total list states length to calculate exact array pages */}
        {[...Array(Math.ceil((activeFilter === 'ALL' ? leaves.length : leaves.filter(l => l.status?.toUpperCase() === activeFilter).length) / itemsPerPage))].map((_, index) => (
            <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: `1px solid ${currentPage === index + 1 ? colors.primaryBlue : colors.border}`,
                    backgroundColor: currentPage === index + 1 ? colors.primaryBlue : '#fff',
                    color: currentPage === index + 1 ? '#fff' : colors.mainText,
                }}
            >
                {index + 1}
            </button>
        ))}

        <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil((activeFilter === 'ALL' ? leaves.length : leaves.filter(l => l.status?.toUpperCase() === activeFilter).length) / itemsPerPage)))}
            disabled={currentPage === Math.ceil((activeFilter === 'ALL' ? leaves.length : leaves.filter(l => l.status?.toUpperCase() === activeFilter).length) / itemsPerPage)}
            style={{ padding: '8px 14px', border: `1px solid ${colors.border}`, background: '#fff', color: currentPage === Math.ceil((activeFilter === 'ALL' ? leaves.length : leaves.filter(l => l.status?.toUpperCase() === activeFilter).length) / itemsPerPage) ? '#CBD5E1' : colors.mainText, borderRadius: '8px', cursor: 'not-allowed', fontSize: '13px', fontWeight: '600', transition: '0.2s' }}
        >
            Next &raquo;
        </button>
    </div>
)}
  
              </div>
              </div>
            

            {/* Custom Focus Ring CSS */}
            <style>
                {`
                    .focus-ring:focus { 
                        border-color: ${colors.primaryBlue} !important; 
                        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); 
                    }
                    /* Scrollbar Styling */
                    ::-webkit-scrollbar { width: 6px; height: 6px; }
                    ::-webkit-scrollbar-track { background: transparent; }
                    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
                    ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
                `}
            </style>
            {/* CUSTOM RENDER LEAVE CONFIRMATION MODAL */}
{confirmModal.isOpen && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: `1px solid ${colors.border}`, textAlign: 'center', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: confirmModal.actionType === 'approve' ? '#ECFDF5' : '#FEF2F2', color: confirmModal.actionType === 'approve' ? colors.success : colors.danger, width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.mainText, margin: '0 0 10px 0', textTransform: 'capitalize' }}>
                {confirmModal.actionType} Request?
            </h3>
            <p style={{ fontSize: '14px', color: colors.secondaryText, margin: '0 0 24px 0', lineHeight: '1.5' }}>
                {confirmModal.text}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
                    style={{ flex: 1, padding: '12px', background: '#F1F5F9', color: colors.secondaryText, border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                >
                    Cancel
                </button>
                <button 
                    onClick={executeConfirmedAction} 
                    style={{ 
                        flex: 1, padding: '12px', 
                        background: confirmModal.actionType === 'approve' ? colors.success : colors.danger, 
                        color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                        boxShadow: confirmModal.actionType === 'approve' ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(239, 68, 68, 0.2)'
                    }}
                >
                    Confirm
                </button>
            </div>
        </div>
    </div>
)}
        </DashboardLayout>
    );
};

export default HRLeaveManagement;