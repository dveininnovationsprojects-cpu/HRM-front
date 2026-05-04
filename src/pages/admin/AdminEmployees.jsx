import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { Search, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminEmployees = () => {
    const [employees, setEmployees] = useState([]);
    
    // State for Modal and Form Data
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        department: '',
        position: '',
        biometricId: '',
        designationStatus: 'Active',
        userId: '' // User ID for linking
    });

    const fetchEmployees = async () => {
        try {
            // Un AdminController la irukkura GET mapping ah call pandrom
            const res = await api.get('/api/admin/employees');
            setEmployees(res.data);
        } catch (err) { 
            console.error("Unable to load employees"); 
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        
        if (!formData.userId) {
            toast.error("Please provide a valid User ID!");
            return;
        }

        const loadToast = toast.loading("Creating Employee Profile...");

        try {
            // EXACT Match with backend EmployeeController
            const response = await api.post(`/api/employees/create/${formData.userId}`, formData);
            
            if (response.status === 200 || response.status === 201) {
                toast.dismiss(loadToast);
                toast.success("Employee Created & Linked Successfully! 🎉");
                
                // Reset form and close modal
                setFormData({ fullName: '', department: '', position: '', biometricId: '', designationStatus: 'Active', userId: '' });
                setShowModal(false);
                
                // Refresh the table
                fetchEmployees(); 
            }
        } catch (error) {
            toast.dismiss(loadToast);
            // Handling text response from backend (Spring returns simple String)
            const backendError = typeof error.response?.data === 'string' 
                                 ? error.response?.data 
                                 : "Failed to create employee!";
            toast.error("Error: " + backendError);
        }
    };

    return (
        <DashboardLayout role="ADMIN" title="Employee Management">
            <div className="dashboard-card" style={{ position: 'relative' }}>
                {/* Page Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Manage employee profiles, roles, salary & shifts</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => setShowModal(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            <Plus size={18}/> Create Employee 
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={18} />
                    <input type="text" placeholder="Search by Name / Phone / Biometric ID" style={{ paddingLeft: '40px', width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                                <th style={{ padding: '15px' }}>ID </th>
                                <th>FULL NAME </th>
                                <th>DEPARTMENT </th>
                                <th>POSITION </th>
                                <th>BIOMETRIC ID </th>
                                <th>STATUS </th>
                                <th>ACTIONS </th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length > 0 ? employees.map(emp => (
                                <tr key={emp.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '15px' }}>{emp.id}</td>
                                    <td style={{ fontWeight: '600' }}>{emp.fullName}</td>
                                    <td>{emp.department}</td>
                                    <td>{emp.position}</td>
                                    <td>{emp.biometricId}</td>
                                    <td>
                                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', background: emp.designationStatus === 'Active' ? '#f0fdf4' : '#fef2f2', color: emp.designationStatus === 'Active' ? '#16a34a' : '#dc2626' }}>
                                            {emp.designationStatus || 'Active'} 
                                        </span>
                                    </td>
                                    <td>
                                        <button style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>View </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                        No employees found. Click "Create Employee" to add one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Add New Employee</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px dashed #3b82f6' }}>
                                <label style={{ fontSize: '14px', color: '#1e3a8a', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Link to User ID *</label>
                                <input type="number" name="userId" placeholder="E.g., 1, 2, 3 (From DB)" value={formData.userId} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #93c5fd', boxSizing: 'border-box' }} />
                                <small style={{ color: '#60a5fa', fontSize: '11px' }}>Enter the Database ID of the registered user</small>
                            </div>

                            <div>
                                <label style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '5px' }}>Full Name *</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '5px' }}>Department *</label>
                                    <input type="text" name="department" value={formData.department} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '5px' }}>Position *</label>
                                    <input type="text" name="position" value={formData.position} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '5px' }}>Biometric ID (e.g., BIO101) *</label>
                                <input type="text" name="biometricId" value={formData.biometricId} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>

                            <div>
                                <label style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '5px' }}>Status</label>
                                <select name="designationStatus" value={formData.designationStatus} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <button type="submit" style={{ width: '100%', background: '#10b981', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}>
                                Save Employee Profile
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminEmployees;