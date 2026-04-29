import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiConfig';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '', roleName: 'EMPLOYEE' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Backend Validation Rules 
        const usernameRegex = /^[a-zA-Z0-9_-]{3,15}$/;
        if (!usernameRegex.test(formData.username)) {
            alert("Username: 3-15 chars, letters, numbers, _ and - only! ");
            return;
        }
        if (!formData.email.endsWith('@gmail.com')) {
            alert("Only @gmail.com is allowed! ");
            return;
        }

        try {
            const response = await api.post('/api/auth/register', formData);
            if (response.status === 200) {
                alert("Registered Successfully! ");
                navigate('/login'); 
            }
        } catch (error) {
            alert("Registration failed. Backend port or CORS check pannu mamey!");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', color: '#3b82f6', marginBottom: '25px' }}>HRM Soft Register</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <input type="text" placeholder="Username (3-15 chars)" onChange={(e) => setFormData({...formData, username: e.target.value})} required />
                    <input type="email" placeholder="Gmail Address" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    <input type="password" placeholder="Strong Password (min 8 chars)" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                    
                    <label style={{ fontSize: '14px', color: '#64748b' }}>Select Role:</label>
                    <select 
                        value={formData.roleName}
                        onChange={(e) => setFormData({...formData, roleName: e.target.value})}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    >
                        {/* ADMIN role is added back in selection as you requested */}
                        <option value="EMPLOYEE">EMPLOYEE</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="TL">TEAM LEAD (TL)</option>
                        <option value="HR">HR</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>

                    <button type="submit" style={{ background: '#3b82f6', color: '#fff', padding: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Create Professional Account
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '14px' }}>
                        Already have an account? <a href="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Login here</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;