import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    Users, UserPlus, Search, Edit3, Trash2, ShieldCheck, 
    Briefcase, Building2, Phone, MapPin, BadgeIndianRupee, 
    Fingerprint, X, Loader2, ChevronLeft, ChevronRight, CheckCircle2,
    Clock, AlertTriangle, Mail
} from 'lucide-react';

const HREmployees = () => {
    // =========================================================================
    // 1. STATE MANAGEMENT
    // =========================================================================
    const [employees, setEmployees] = useState([]);
    const [unmappedUsers, setUnmappedUsers] = useState([]); // Real pending users from backend
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

            // Set Active Employees List
            const activeEmployees = Array.isArray(empRes.data) ? empRes.data : [];
            setEmployees(activeEmployees);

            const pendingUsersData = Array.isArray(pendingRes.data) ? pendingRes.data : [];

            // 👇 FIX: Cross-verify variable structures via safe optional chain loop tracking 👇
            const assignedUserIds = activeEmployees.map(emp => {
                if (emp.userId) return Number(emp.userId);
                if (emp.user && emp.user.id) return Number(emp.user.id);
                return null;
            }).filter(Boolean);

            // 👇 Filter query arrays mismatch correction bypass pipeline
            const realUnmappedUsers = pendingUsersData.filter(user => !assignedUserIds.includes(Number(user.id)));

            setUnmappedUsers(realUnmappedUsers);

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

    // --- CREATE ACTIONS ---
    const openCreateModal = () => {
        // Validation: If backend returns empty list, block the modal
        if (unmappedUsers.length === 0) {
            toast.error("No newly registered unmapped accounts found waiting for setup.");
            return;
        }
        
        setEmpForm({
            fullName: '', position: '', department: '', phone: '',
            address: '', salary: '', biometricId: '' 
          
        });
        
        // Open modal and auto-select the first user in the pending list
        setCreateModal({ isOpen: true, selectedUserId: unmappedUsers[0].id, submitting: false });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        
        if(!/^[6-9]\d{9}$/.test(empForm.phone)) {
            toast.error("Invalid phone configuration. Must be 10 digits starting with 6-9.");
            return;
        }

        if(!createModal.selectedUserId) {
            toast.error("Please select a registered user account.");
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
                // 👇 FIX: Passing a hardcoded default fallback string since form field is removed
                designationStatus: "PROBATION" 
            };

            await api.post(`/api/employees/create/${createModal.selectedUserId}`, dtoPayload);
            
            // This banner will now execute flawlessly!
            toast.success("Official profile mapped and allocated successfully! 👍");
            
            setCreateModal({ isOpen: false, selectedUserId: '', submitting: false });
            loadManagementData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.response?.data || "Failed to finalize workforce asset.");
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
        toast.error("Invalid phone configuration.");
        return;
    }

    setEditModal(prev => ({ ...prev, submitting: true }));
    try {
        // 👇 FIX: Designation thookittu matha details mattum anupunga
        const updatePayload = {
            fullName: empForm.fullName,
            position: empForm.position,
            department: empForm.department,
            phone: empForm.phone,
            address: empForm.address,
            salary: parseFloat(empForm.salary || 0),
            biometricId: empForm.biometricId,
            salary: parseFloat(empForm.salary || 0)
            
        };

        await api.put(`/api/employees/${editModal.data.id}`, updatePayload);
        toast.success("Workplace profile refreshed successfully!");
        setEditModal({ isOpen: false, data: null, submitting: false });
        loadManagementData();
    } catch (err) {
        toast.error("Failed to update asset.");
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
        
        // 👇 FIX: Toast message-ah execute aaga mela vaiyunga
        toast.success("Employee profile deprecated safely! ");
        
        setDeleteModal({ isOpen: false, id: null, name: '', submitting: false });
        loadManagementData();
    } catch (err) {
        console.error(err);
        toast.error("Profile deletion failed on server.");
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

    // =========================================================================
    // 5. RENDERING MASTER SYSTEM VIEW
    // =========================================================================
    return (
        <DashboardLayout role="HR" title="Employee Directory">
            <div style={{ padding: '24px 32px', backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
                
                {/* Header Context Action Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: '800', color: colors.mainText, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.5px' }}>
                            <Users color={colors.primaryBlue} size={28} /> Workforce Administration
                        </h1>
                        <p style={{ margin: 0, color: colors.secondaryText, fontSize: '15px' }}>
                            Map official corporate IDs to freshly registered workspace users.
                        </p>
                    </div>

                    <button 
                        onClick={openCreateModal}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)', transition: '0.2s' }}
                    >
                        <UserPlus size={18} /> Add Official Profile
                    </button>
                </div>

                {/* Search Utility Header */}
                <div style={{ display: 'flex', background: '#fff', padding: '18px 24px', borderRadius: '16px 16px 0 0', border: `1px solid ${colors.border}`, borderBottom: 'none', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.secondaryText }} />
                        <input 
                            type="text" placeholder="Search by name, department, or card ID..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '14px', boxSizing: 'border-box', background: colors.inputBg, color: colors.mainText }}
                        />
                    </div>
                    <span style={{ fontSize: '13px', color: colors.secondaryText, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} color={colors.success} /> Total Core Assets: {filteredEmployees.length} active
                    </span>
                </div>

                {/* Master Directory Grid Table */}
                <div style={{ background: colors.cardWhite, borderRadius: '0 0 16px 16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.01)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                            <thead>
                                <tr style={{ background: colors.background, borderBottom: `2px solid ${colors.border}` }}>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Asset Identity</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Position Assignment</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Department</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Contact Config</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase' }}>Compensation Baseline</th>
                                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '700', color: colors.secondaryText, textTransform: 'uppercase', textAlign: 'center' }}>HR Tools</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '60px', textAlign: 'center' }}>
                                            <Loader2 size={32} className="spin" color={colors.primaryBlue} style={{ margin: '0 auto 12px' }} />
                                            <p style={{ margin: 0, color: colors.secondaryText, fontWeight: '500' }}>Syncing data mapping architecture...</p>
                                        </td>
                                    </tr>
                                ) : currentTableData.length > 0 ? (
                                    currentTableData.map((emp) => (
                                        <tr key={emp.id} className="table-row" style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s' }}>
                                            
                                            {/* Name / Avatar / Biometric Card Link */}
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
                                        <td colSpan="7" style={{ padding: '50px', textAlign: 'center' }}>
                                            <div style={{ background: colors.inputBg, width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><AlertTriangle size={28} color={colors.secondaryText}/></div>
                                            <h4 style={{ margin: '0 0 4px', color: colors.mainText, fontSize: '16px' }}>No Employee Assets Found</h4>
                                            <p style={{ margin: 0, fontSize: '14px', color: colors.secondaryText }}>Refine query or allocate profile configuration to pending accounts.</p>
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
                {/* MODAL 1: ALLOCATE PROFILE (REAL BACKEND DATA)             */}
                {/* ========================================================= */}
                {createModal.isOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: colors.mainText, display:'flex', gap:'8px', alignItems:'center' }}><UserPlus size={22} color={colors.primaryBlue}/> Allocate Profile</h3>
                                <button onClick={() => setCreateModal({ isOpen: false, selectedUserId: '', submitting: false })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.secondaryText }}><X size={20}/></button>
                            </div>

                            <form onSubmit={handleCreateSubmit}>
                                {/* DYNAMIC REGISTERED ACCOUNTS SELECTOR FROM BACKEND API */}
                                <div style={{ marginBottom: '20px', background: colors.lightBlue, padding: '16px', borderRadius: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: colors.primaryBlue, marginBottom: '8px' }}>Select Registered Account (Pending)</label>
                                    <select 
                                        value={createModal.selectedUserId}
                                        onChange={(e) => setCreateModal({ ...createModal, selectedUserId: e.target.value })}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: `1px solid #BFDBFE`, background: '#fff', fontWeight: '600', color: colors.mainText, outline: 'none', cursor: 'pointer' }}
                                    >
                                        {unmappedUsers.map(user => (
                                            <option key={user.id} value={user.id}>{user.username} - ({user.email})</option>
                                        ))}
                                    </select>
                                    <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: colors.secondaryText, display:'flex', gap:'4px', alignItems:'center' }}><Mail size={12}/> Select the user account to map core details.</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Full Legal Name</label>
                                        <input type="text" name="fullName" value={empForm.fullName} onChange={handleFormChange} placeholder="e.g. John Doe" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Biometric ID / Emp ID</label>
                                        <input type="text" name="biometricId" value={empForm.biometricId} onChange={handleFormChange} placeholder="DVN-CORE-001" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
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
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Workplace / Residential Address</label>
                                    <textarea name="address" value={empForm.address} onChange={handleFormChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, height: '80px', resize: 'none', outline: 'none', boxSizing: 'border-box' }} className="focus-ring" placeholder="Enter full address configuration details..."></textarea>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setCreateModal({ isOpen: false, selectedUserId: '', submitting: false })} style={{ flex: 1, padding: '14px', background: colors.inputBg, color: colors.secondaryText, border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}>Cancel</button>
                                    <button type="submit" disabled={createModal.submitting} style={{ flex: 1, padding: '14px', background: colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition: '0.2s', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
                                        {createModal.submitting ? <Loader2 size={18} className="spin"/> : 'Finalize Profile Map'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* MODAL 2: UPDATE CREDENTIALS                               */}
                {/* ========================================================= */}
                {editModal.isOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: colors.mainText, display:'flex', gap:'8px', alignItems:'center' }}><Edit3 size={22} color={colors.primaryBlue}/> Update Metrics</h3>
                                <button onClick={() => setEditModal({ isOpen: false, data: null, submitting: false })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.secondaryText }}><X size={20}/></button>
                            </div>

                            <form onSubmit={handleEditSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Full Name</label>
                                        <input type="text" name="fullName" value={empForm.fullName} onChange={handleFormChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} className="focus-ring"/>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>Biometric ID Card (Read-Only)</label>
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
                                {/* Salary Input Field inside Edit Modal */}
<div>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.mainText, marginBottom: '6px' }}>
        Monthly Salary (₹)
    </label>
    <input 
        type="number" 
        name="salary" 
        value={empForm.salary} 
        onChange={handleFormChange} 
        required 
        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', boxSizing: 'border-box' }} 
        className="focus-ring"
        placeholder="e.g. 45000"
    />
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
                    .table-row:hover { background-color: #F8FAFC; }
                    .focus-ring:focus { border-color: ${colors.primaryBlue} !important; background-color: #fff !important; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                    .action-btn:hover { background-color: #DBEAFE !important; }
                    .action-btn-danger:hover { background-color: #FEE2E2 !important; }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    
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

export default HREmployees;