import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiConfig';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react'; // --- MASS FIX: Import Eye Icons ---

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false); // --- State for Password Visibility ---

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/auth/login', credentials);
            
            if (response.status === 200) {
                const { role, username, id } = response.data; 
                
                // Auth details storage
                localStorage.setItem('role', role);
                localStorage.setItem('username', username);
                localStorage.setItem('userId', id);
                localStorage.setItem('isAuthenticated', 'true');

                toast.success(`Login Successful! Role: ${role} `);

                // Role based redirect logic 
                setTimeout(() => {
                    if (role === 'MANAGER') navigate('/manager/dashboard');
                    else if (role === 'TL' || role === 'TEAM_LEAD') navigate('/tl/dashboard');
                    else if (role === 'EMPLOYEE') navigate('/employee/dashboard');
                    else if (role === 'ADMIN') navigate('/admin/dashboard');
                    else if (role === 'HR') navigate('/hr/dashboard');
                }, 1000); // 1 sec delay so user can see the toast
            }
        } catch (error) {
            const backendError = error.response?.data?.message || "Invalid credentials!";
            toast.error("Login Failed: " + backendError);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
            <form onSubmit={handleLogin} style={{ width: '300px', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
                <h2 style={{ textAlign: 'center' }}>HRM Login</h2>
                <div style={{ marginBottom: '15px' }}>
                    <label>Username:</label>
                    <input type="text" name="username" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password:</label>
                    {/* --- MASS FIX: Eye Icon Logic UI --- */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            style={{ width: '100%', padding: '8px', paddingRight: '35px', boxSizing: 'border-box' }} 
                            onChange={handleChange} 
                            required 
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '5px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: '#64748b' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                    Login
                </button>
                <p style={{ marginTop: '15px', textAlign: 'center' }}>
                    New user? <a href="/register" style={{ color: '#007bff' }}>Register here</a>
                </p>
            </form>
        </div>
    );
};

export default Login;