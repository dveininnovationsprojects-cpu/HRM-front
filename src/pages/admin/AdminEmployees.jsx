import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/apiConfig';
import { Search, Plus, RefreshCw } from 'lucide-react';

const AdminEmployees = () => {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                // API: GET /api/admin/employees 
                const res = await api.get('/api/admin/employees');
                setEmployees(res.data);
            } catch (err) { alert("Unable to load employees [cite: 6]"); }
        };
        fetchEmployees();
    }, []);

    return (
        <DashboardLayout role="ADMIN" title="Employee Management">
            <div className="dashboard-card">
                {/* 1. Page Header & Actions  */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Manage employee profiles, roles, salary & shifts </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                            <Plus size={18}/> Create Employee 
                        </button>
                    </div>
                </div>

                {/* 2. Search Bar  */}
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={18} />
                    <input type="text" placeholder="Search by Name / Phone / Biometric ID " style={{ paddingLeft: '40px' }} />
                </div>

                {/* 3. Employee List Table  */}
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
                            {employees.map(emp => (
                                <tr key={emp.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '15px' }}>{emp.id}</td>
                                    <td style={{ fontWeight: '600' }}>{emp.fullName}</td>
                                    <td>{emp.department}</td>
                                    <td>{emp.position}</td>
                                    <td>{emp.biometricId}</td>
                                    <td>
                                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', background: emp.designationStatus === 'Active' ? '#f0fdf4' : '#fef2f2', color: emp.designationStatus === 'Active' ? '#16a34a' : '#dc2626' }}>
                                            {emp.designationStatus} 
                                        </span>
                                    </td>
                                    <td>
                                        <button style={{ color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>View </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminEmployees;