import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    Users, UserPlus, Search, Edit3, Trash2, ShieldCheck, 
    Briefcase, Building2, Phone, MapPin, BadgeIndianRupee, 
    Fingerprint, X, Loader2, ChevronLeft, ChevronRight, CheckCircle2,
    Clock, AlertTriangle, Mail, UserCheck, Bell
} from 'lucide-react';

const AdminEmployees = () => {
    // =========================================================================
    // 1. STATE MANAGEMENT
    // =========================================================================
    const [employees, setEmployees] = useState([]);
    const [unmappedUsers, setUnmappedUsers] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // Search & Pagination States
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Form Modals State
    const [createModal, setCreateModal] = useState({ isOpen: false, selectedUserId: '', submitting: false });
    const [editModal, setEditModal] = useState({ isOpen: false, data: null, submitting: false });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '', submitting: false });

    // Reusable Form State
    const [empForm, setEmpForm] = useState({
        fullName: '', position: '', department: '', phone: '',
        address: '', salary: '', biometricId: '', designationStatus: 'PROBATION'
    });

    // Theme Config (HRM Soft Enterprise Palette)
    const colors = {
        primaryBlue: '#2563EB', lightBlue: '#EFF6FF', background: '#F8FAFC',
        cardWhite: '#FFFFFF', mainText: '#0F172A', secondaryText: '#64748B',
        success: '#10B981', successLight: '#ECFDF5',
        warning: '#F59E0B', warningLight: '#FFFBEB',
        danger: '#EF4444', dangerLight: '#FEF2F2', border: '#E2E8F0', inputBg: '#F1F5F9'
    };

    // =========================================================================
    // 2. DATA INITIALIZATION & REAL-TIME BACKEND SYNC
    // =========================================================================
    useEffect(() => {
        loadManagementData();
    }, []);

    const loadManagementData = async () => {
        setLoading(true);
        try {
            // Concurrent API calls to fetch both active employees AND pending raw users
            const [empRes, pendingRes] = await Promise.all([
                api.get('/api/employees').catch(() => ({ data: [] })),
                api.get('/api/employees/pending-registrations').catch(() => ({ data: [] }))
            ]);

            const activeEmployees = Array.isArray(empRes.data) ? empRes.data : [];
            setEmployees(activeEmployees);

            const pendingUsersData = Array.isArray(pendingRes.data) ? pendingRes.data : [];
            setUnmappedUsers(pendingUsersData);

        } catch (err) {
            console.error("Sync Error:", err);
            toast.error("Failed to sync workforce dataset from server.");
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 3. EVENT HANDLERS & API CONTEXT BRIDGE
    // =========================================================================
    const handleFormChange = (e) => {
        setEmpForm({ ...empForm, [e.target.name]: e.target.value });
    };

    // --- CREATE/ACCEPT REQUEST ACTIONS ---
    const openCreateModal = () => {
        if (unmappedUsers.length === 0) {
            toast.success("All caught up! No pending registration requests.", { icon: '👏' });
            return;
        }
        
        setEmpForm({
            fullName: '', position: '', department: '', phone: '',
            address: '', salary: '', biometricId: '', designationStatus: 'PROBATION'
        });
        
        setCreateModal({ isOpen: true, selectedUserId: unmappedUsers[0].id, submitting: false });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        
        if(!/^[6-9]\d{9}$/.test(empForm.phone)) {
            toast.error("Invalid phone configuration. Must be 10 digits starting with 6-9.");
            return;
        }

        if(!createModal.selectedUserId) {
            toast.error("Please select a pending application.");
            return;
        }

        setCreateModal(prev => ({ ...prev, submitting: true }));
        try {
            const dtoPayload = {
                fullName: empForm.fullName,
                position: empForm.position,
                department: empForm.department,
                phone: empForm.phone,
                address: empForm.address,
                salary: parseFloat(empForm.salary || 0),
                biometricId: empForm.biometricId,
                designationStatus: empForm.designationStatus
            };

            await api.post(`/api/employees/create/${createModal.selectedUserId}`, dtoPayload);
            toast.success("Registration Approved! Profile Officialized. ✅");
            setCreateModal({ isOpen: false, selectedUserId: '', submitting: false });
            
            loadManagementData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.response?.data || "Failed to approve registration.");
            setCreateModal(prev => ({ ...prev, submitting: false }));
        }
    };

    // --- EDIT ACTIONS ---
    const openEditModal = (employee) => {
        setEmpForm({
            fullName: employee.fullName || '',
            position: employee.position || '',
            department: employee.department || '',
            phone: employee.phone || '',
            address: employee.address || '',
            salary: employee.salary || '',
            biometricId: employee.biometricId || '',
        });
        setEditModal({ isOpen: true, data: employee, submitting: false });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        
        if(!/^[6-9]\d{9}$/.test(empForm.phone)) {
            toast.error("Invalid phone configuration. Must be 10 digits starting with 6-9.");
            return;
        }

        setEditModal(prev => ({ ...prev, submitting: true }));
        try {
            await api.put(`/api/employees/${editModal.data.id}`, empForm);
            
            if (empForm.salary && String(empForm.salary) !== String(editModal.data.salary)) {
                await api.put(`/api/employees/${editModal.data.id}/salary`, { salary: parseFloat(empForm.salary) });
            }

            toast.success("Workplace profile credentials refreshed.");
            setEditModal({ isOpen: false, data: null, submitting: false });
            loadManagementData();
        } catch (err) {
            toast.error("Failed to push asset modification update.");
            setEditModal(prev => ({ ...prev, submitting: false }));
        }
    };

    // --- DELETE ACTIONS ---
    const openDeleteModal = (employee) => {
        setDeleteModal({ isOpen: true, id: employee.id, name: employee.fullName, submitting: false });
    };

    const handleDeleteExecute = async () => {
        setDeleteModal(prev => ({ ...prev, submitting: true }));
        try {
            await api.delete(`/api/employees/${deleteModal.id}`);
            toast.success("Employee dataset deprecated safely.");
            setDeleteModal({ isOpen: false, id: null, name: '', submitting: false });
            loadManagementData();
        } catch (err) {
            toast.error("Profile deletion process aborted on server.");
            setDeleteModal(prev => ({ ...prev, submitting: false }));
        }
    };

    // =========================================================================
    // 4. PIPELINE FILTER DATA PROCESSING
    // =========================================================================
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchQuery = searchTerm.toLowerCase();
            return (
                (emp.fullName && emp.fullName.toLowerCase().includes(matchQuery)) ||
                (emp.biometricId && emp.biometricId.toLowerCase().includes(matchQuery)) ||
                (emp.department && emp.department.toLowerCase().includes(matchQuery))
            );
        });
    }, [employees, searchTerm]);

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const currentTableData = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    // Derived selected user for the approval modal
    const selectedPendingUser = unmappedUsers.find(u => String(u.id) === String(createModal.selectedUserId));

    // =========================================================================
    // 5. RENDERING MASTER SYSTEM VIEW
    // =========================================================================
    return (
        <DashboardLayout role="ADMIN" title="Employee Directory">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
                
                {/* Header Context Action Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: '800', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.5px' }}>
                            <ShieldCheck color={colors.primaryBlue} size={28} /> Admin Workforce Control
                        </h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '15px' }}>
                            Manage organization structure and approve new registrations.
                        </p>
                    </div>

                    <button 
                        onClick={openCreateModal}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)', transition: '0.2s' }}
                    >
                        <UserPlus size={18} /> Manual Onboard
                    </button>
                </div>

                {/* 🚨 PENDING REGISTRATIONS ALERT BANNER 🚨 */}
                {!loading && unmappedUsers.length > 0 && (
                    <div style={{ background: '#FFFBEB', border: `1px solid #FDE68A`, padding: '16px 24px', borderRadius: '16px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.05)', animation: 'slideDown 0.3s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: colors.warning, color: '#fff', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', boxShadow: '0 0 0 4px #FEF3C7' }}>
                                {unmappedUsers.length}
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', color: '#92400E', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Bell size={16} /> Pending Registration Requests
                                </h3>
                                <p style={{ margin: 0, color: '#B45309', fontSize: '14px', fontWeight: '500' }}>
                                    New users have registered to the portal and are waiting for identity verification and mapping.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={openCreateModal}
                            style={{ background: colors.warning, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)' }}
                        >
                            <UserCheck size={18} /> Review & Approve Now
                        </button>
                    </div>
                )}

                {/* Search Utility Header */}
                <div style={{ display: 'flex', background: '#fff', padding: '18px 24px', borderRadius: '16px 16px 0 0', border: `1px solid ${colors.border}`, borderBottom: 'none', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.secondaryText }} />
                        <input 
                            type="text" placeholder="Search by name, department, or card ID..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '14px', boxSizing: 'border-box', background: colors.inputBg, color: colors.mainText }}
                        />
                    </div>
                    <span style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} color={colors.success} /> Total Official Profiles: {filteredEmployees.length}
                    </span>
                </div>

                {/* Master Directory Grid Table */}
                <div style={{ background: colors.cardWhite, borderRadius: '0 0 16px 16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.01)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                            <thead>
                                <tr style={{ background: colors.background, borderBottom: `2px solid ${colors.border}` }}>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Employee Profile</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Position Assignment</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Department</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Contact Config</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Base Salary</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase', textAlign: 'center' }}>Admin Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '60px', textAlign: 'center' }}>
                                            <Loader2 size={32} className="spin" color={colors.primaryBlue} style={{ margin: '0 auto 12px' }} />
                                            <p style={{ margin: 0, color: colors.secondaryText, fontWeight: '500' }}>Loading employee directory...</p>
                                        </td>
                                    </tr>
                                ) : currentTableData.length > 0 ? (
                                    currentTableData.map((emp) => (
                                        <tr key={emp.id} className="table-row" style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: colors.lightBlue, color: colors.primaryBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', textTransform: 'uppercase' }}>
                                                        {emp.fullName ? emp.fullName.charAt(0) : '?'}
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: '700', color: colors.mainText, fontSize: '14px', textTransform: 'capitalize' }}>{emp.fullName}</p>
                                                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: colors.primaryBlue, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <Fingerprint size={12}/> {emp.biometricId || 'Card Missing'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.mainText, fontWeight: '500' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Briefcase size={14} color={colors.secondaryText} /> {emp.position || 'Not Assigned'}
                                                </div>
                                            </td>

                                            <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.mainText, fontWeight: '600' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Building2 size={14} color={colors.secondaryText} /> {emp.department || 'General'}
                                                </div>
                                            </td>

                                            <td style={{ padding: '16px 24px' }}>
                                                <p style={{ margin: 0, fontSize: '13px', color: colors.mainText, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12}/> {emp.phone}</p>
                                                <p style={{ margin: '3px 0 0', fontSize: '12px', color: colors.secondaryText, display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12}/> {emp.address ? (emp.address.substring(0, 18) + '...') : 'No Address'}</p>
                                            </td>

                                            <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '800', color: colors.mainText }}>
                                                {emp.salary ? `₹ ${emp.salary.toLocaleString('en-IN')}` : '₹ 0.00'}
                                            </td>

                                            <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                    <button onClick={() => openEditModal(emp)} style={{ background: colors.inputBg, border: 'none', color: colors.primaryBlue, padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }} title="Modify Metadata" className="action-btn"><Edit3 size={16}/></button>
                                                    <button onClick={() => openDeleteModal(emp)} style={{ background: colors.dangerLight, border: 'none', color: colors.danger, padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }} title="Revoke Profile" className="action-btn-danger"><Trash2 size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '50px', textAlign: 'center' }}>
                                            <div style={{ background: colors.inputBg, width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><AlertTriangle size={28} color={colors.secondaryText}/></div>
                                            <h4 style={{ margin: '0 0 4px', color: colors.mainText, fontSize: '16px' }}>No Employee Assets Found</h4>
                                            <p style={{ margin: 0, fontSize: '14px', color: colors.secondaryText }}>Search again or check pending requests.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Context Bar Container */}
                    {!loading && filteredEmployees.length > 0 && (
                        <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                            <span style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '500' }}>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} profiles</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '8px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', background: currentPage === 1 ? colors.inputBg : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: colors.mainText, transition: '0.2s' }}><ChevronLeft size={16}/></button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '8px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', background: currentPage === totalPages ? colors.inputBg : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: colors.mainText, transition: '0.2s' }}><ChevronRight size={16}/></button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ========================================================= */}
                {/* MODAL 1: APPROVE REQUEST & CREATE PROFILE (SCROLL FIX)    */}
                {/* ========================================================= */}
                {createModal.isOpen && (
                    <div className="modal-overlay" style={{ padding: '20px' }}>
                        <div className="modal-content" style={{ maxWidth: '540px', width: '100%', maxHeight: '90vh', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            
                            {/* Wizard Header - Fixed at Top */}
                            <div style={{ background: colors.primaryBlue, padding: '24px', color: '#fff', position: 'relative', flexShrink: 0 }}>
                                <button onClick={() => setCreateModal({ isOpen: false, selectedUserId: '', submitting: false })} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16}/></button>
                                <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '800', display:'flex', gap:'8px', alignItems:'center' }}><UserCheck size={24}/> Approve Registration</h3>
                                <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Verify application and map official credentials.</p>
                            </div>

                            {/* Form Body - Scrollable */}
                            <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
                                <form onSubmit={handleCreateSubmit}>
                                    <div style={{ marginBottom: '24px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: `1px solid #E2E8F0` }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: colors.secondaryText, textTransform: 'uppercase', marginBottom: '8px' }}>Select Application Request</label>
                                        <select 
                                            value={createModal.selectedUserId}
                                            onChange={(e) => setCreateModal({ ...createModal, selectedUserId: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid #CBD5E1`, background: '#fff', fontWeight: '700', color: colors.mainText, outline: 'none', cursor: 'pointer', marginBottom: '12px' }}
                                        >
                                            {unmappedUsers.map(user => (
                                                <option key={user.id} value={user.id}>Req #{user.id} - {user.username}</option>
                                            ))}
                                        </select>
                                        
                                        {selectedPendingUser && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                                <div style={{ background: colors.successLight, color: colors.success, padding: '8px', borderRadius: '8px' }}><Mail size={16}/></div>
                                                <div>
                                                    <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: colors.secondaryText, fontWeight: '700' }}>REGISTERED EMAIL</p>
                                                    <p style={{ margin: 0, fontSize: '14px', color: colors.mainText, fontWeight: '600' }}>{selectedPendingUser.email}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: colors.mainText, fontWeight: '700', borderBottom: `1px solid ${colors.border}`, paddingBottom: '8px' }}>Official Designation Details</h4>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Full Legal Name</label>
                                            <input type="text" name="fullName" value={empForm.fullName} onChange={handleFormChange} placeholder="John Doe" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Biometric ID / Emp ID</label>
                                            <input type="text" name="biometricId" value={empForm.biometricId} onChange={handleFormChange} placeholder="BIO-001" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Job Position</label>
                                            <input type="text" name="position" value={empForm.position} onChange={handleFormChange} placeholder="e.g. Developer" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Department</label>
                                            <input type="text" name="department" value={empForm.department} onChange={handleFormChange} placeholder="e.g. IT" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Mobile Number</label>
                                            <input type="text" name="phone" value={empForm.phone} onChange={handleFormChange} placeholder="10 Digits" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Base Salary (₹)</label>
                                            <input type="number" name="salary" value={empForm.salary} onChange={handleFormChange} placeholder="e.g. 50000" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Residential Address</label>
                                        <textarea name="address" value={empForm.address} onChange={handleFormChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, height: '60px', resize: 'none', outline: 'none', boxSizing: 'border-box' }} className="focus-ring" placeholder="Enter full address..."></textarea>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                        <button type="button" onClick={() => setCreateModal({ isOpen: false, selectedUserId: '', submitting: false })} style={{ flex: 1, padding: '14px', background: colors.inputBg, color: colors.secondaryText, border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}>Cancel</button>
                                        <button type="submit" disabled={createModal.submitting} style={{ flex: 1, padding: '14px', background: colors.success, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition: '0.2s', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}>
                                            {createModal.submitting ? <Loader2 size={18} className="spin"/> : <><CheckCircle2 size={18}/> Authorize Profile</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* MODAL 2: UPDATE CREDENTIALS (SCROLL FIX)                  */}
                {/* ========================================================= */}
                {editModal.isOpen && (
                    <div className="modal-overlay" style={{ padding: '20px' }}>
                        <div className="modal-content" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: colors.mainText, display:'flex', gap:'8px', alignItems:'center' }}><Edit3 size={22} color={colors.primaryBlue}/> Update Metrics</h3>
                                <button onClick={() => setEditModal({ isOpen: false, data: null, submitting: false })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.secondaryText }}><X size={20}/></button>
                            </div>

                            <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
                                <form onSubmit={handleEditSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Full Name</label>
                                            <input type="text" name="fullName" value={empForm.fullName} onChange={handleFormChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Biometric ID (Read-Only)</label>
                                            <input type="text" name="biometricId" value={empForm.biometricId} disabled style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.secondaryText, outline: 'none', boxSizing: 'border-box' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Position Title</label>
                                            <input type="text" name="position" value={empForm.position} onChange={handleFormChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Department</label>
                                            <input type="text" name="department" value={empForm.department} onChange={handleFormChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Mobile Number</label>
                                            <input type="text" name="phone" value={empForm.phone} onChange={handleFormChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Base Salary (₹)</label>
                                            <input type="number" name="salary" value={empForm.salary} onChange={handleFormChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Workplace Address</label>
                                        <textarea name="address" value={empForm.address} onChange={handleFormChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, height: '80px', resize: 'none', outline: 'none', boxSizing: 'border-box' }} className="focus-ring"></textarea>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button type="button" onClick={() => setEditModal({ isOpen: false, data: null, submitting: false })} style={{ flex: 1, padding: '14px', background: colors.inputBg, color: colors.secondaryText, border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}>Cancel</button>
                                        <button type="submit" disabled={editModal.submitting} style={{ flex: 1, padding: '14px', background: colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
                                            {editModal.submitting ? <Loader2 size={18} className="spin"/> : 'Commit Updates'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* MODAL 3: PROFILE DEPRECATION CONFIRMation                 */}
                {/* ========================================================= */}
                {deleteModal.isOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                            <div style={{ background: colors.dangerLight, width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: colors.danger }}><AlertTriangle size={30}/></div>
                            <h3 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: '800', color: colors.mainText }}>Revoke Profile?</h3>
                            <p style={{ margin: '0 0 24px', fontSize: '14px', color: colors.secondaryText, lineHeight: '1.5' }}>
                                You are processing profile deprecation for <b>{deleteModal.name}</b>. This will sever identity record maps from core workspace.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setDeleteModal({ isOpen: false, id: null, name: '', submitting: false })} style={{ flex: 1, padding: '14px', background: colors.inputBg, border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}>Cancel</button>
                                <button type="button" onClick={handleDeleteExecute} disabled={deleteModal.submitting} style={{ flex: 1, padding: '14px', background: colors.danger, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                                    {deleteModal.submitting ? <Loader2 size={18} className="spin"/> : 'Yes, Delete Asset'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Component Layout Injection Custom CSS */}
            <style>
                {`
                    .table-row:hover { background-color: #F8FAFC !important; }
                    .focus-ring:focus { border-color: ${colors.primaryBlue} !important; background-color: #fff !important; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                    .action-btn:hover { background-color: #DBEAFE !important; }
                    .action-btn-danger:hover { background-color: #FEE2E2 !important; }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    
                    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                    
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

export default AdminEmployees;