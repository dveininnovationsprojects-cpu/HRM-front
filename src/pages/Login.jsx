import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiConfig';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Backend-ku credentials anupurom 
            const response = await api.post('/api/auth/login', credentials);
            
            if (response.status === 200) {
                const { role, username, id } = response.data; 
                
                // Auth details-ah local storage-la store pannu [cite: 62]
                localStorage.setItem('role', role);
                localStorage.setItem('username', username);
                localStorage.setItem('userId', id);
                localStorage.setItem('isAuthenticated', 'true');

                alert("Login Successful! Role: " + role); 

                // Role based redirect logic 
                if (role === 'MANAGER') navigate('/manager/dashboard');
                else if (role === 'TL' || role === 'TEAM_LEAD') navigate('/tl/dashboard');
                else if (role === 'EMPLOYEE') navigate('/employee/dashboard');
                else if (role === 'ADMIN') navigate('/admin/dashboard');
                else if (role === 'HR') navigate('/hr/dashboard');
            }
        } catch (error) {
            alert("Login Failed: Invalid credentials");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
            <form onSubmit={handleLogin} style={{ width: '300px', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
                <h2 style={{ textAlign: 'center' }}>HRM Login</h2>
                <div style={{ marginBottom: '15px' }}>
                    <label>Username:</label>
                    <input type="text" name="username" style={{ width: '100%', padding: '8px' }} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password:</label>
                    <input type="password" name="password" style={{ width: '100%', padding: '8px' }} onChange={handleChange} required />
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