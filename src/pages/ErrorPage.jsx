import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const ErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F9FF', fontFamily: "'Inter', sans-serif" }}>
            <AlertTriangle size={80} color="#EF4444" style={{ marginBottom: '20px' }} />
            <h1 style={{ fontSize: '48px', color: '#0F172A', margin: '0' }}>404</h1>
            <p style={{ fontSize: '18px', color: '#64748B', marginBottom: '30px' }}>Opps! The page you're looking for doesn't exist.</p>
            <button 
                onClick={() => navigate(-1)} 
                style={{ padding: '12px 24px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}
            >
                <Home size={18} /> Go Back Home
            </button>
        </div>
    );
};

export default ErrorPage;