import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiConfig';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react'; // --- MASS FIX: Import Eye Icons ---

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '', roleName: 'EMPLOYEE' });
    const [showPassword, setShowPassword] = useState(false); // --- State for Password Visibility ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Backend Validation Rules
        const usernameRegex = /^[a-zA-Z0-9_-]{3,15}$/;
        if (!usernameRegex.test(formData.username)) {
            toast.error("Username: 3-15 chars, letters, numbers, _ and - only!"); 
            return;
        }
        if (!formData.email.endsWith('@gmail.com')) {
            toast.error("Only @gmail.com is allowed!"); 
            return;
        }

        try {
            const response = await api.post('/api/auth/register', formData);
            if (response.status === 200 || response.status === 201) {
                toast.success("Registered Successfully! 🎉"); 
                
                setTimeout(() => {
                    navigate('/login');
                }, 2000); 
            }
        } catch (error) {
            const backendError = error.response?.data?.message || error.response?.data || error.message;
            const errorMessage = typeof backendError === 'object' ? JSON.stringify(backendError) : backendError;
            
            toast.error("Registration Failed: " + errorMessage); 
            console.error("Detailed Error:", error.response);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', color: '#3b82f6', marginBottom: '25px' }}>HRM Soft Register</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <input 
                        type="text" 
                        placeholder="Username (3-15 chars)" 
                        onChange={(e) => setFormData({...formData, username: e.target.value})} 
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                        required 
                    />
                    
                    <input 
                        type="email" 
                        placeholder="Gmail Address" 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                        required 
                    />
                    
                    {/* --- MASS FIX: Eye Icon Logic UI --- */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Strong Password (min 8 chars)" 
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                            required 
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: '#64748b' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '14px', color: '#64748b' }}>Select Role:</label>
                        <select 
                            value={formData.roleName}
                            onChange={(e) => setFormData({...formData, roleName: e.target.value})}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                        >
                            <option value="EMPLOYEE">EMPLOYEE</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="TL">TEAM LEAD (TL)</option>
                            <option value="HR">HR</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>

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