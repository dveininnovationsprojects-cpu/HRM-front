import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    Eye, EyeOff, Lock, User, ShieldCheck, 
    AlertCircle, ArrowRight, Mail, KeyRound, 
    Loader2, ShieldAlert
} from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    
    // =========================================================================
    // 1. HRM DASHBOARD MATCHING COLORS
    // =========================================================================
    const colors = {
        primaryBlue: '#2563EB',    // Main Button / Brand Color
        lightBlue: '#EFF6FF',      // Backgrounds
        background: '#F8FAFC',     // Page Background
        cardWhite: '#FFFFFF',      // Card Background
        mainText: '#0F172A',       // Primary Text
        secondaryText: '#64748B',  // Muted Text
        success: '#10B981',        // Green
        warning: '#F59E0B',        // Orange
        danger: '#EF4444',         // Red
        border: '#E2E8F0',         // Lines
        inputBg: '#F1F5F9'         // Input fields
    };

    const styles = {
        container: {
            minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: colors.background, fontFamily: "'Inter', sans-serif", position: 'relative'
        },
        card: {
            backgroundColor: colors.cardWhite, border: `1px solid ${colors.border}`, borderRadius: '24px', 
            padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            position: 'relative', zIndex: 10
        },
        inputGroup: { position: 'relative', marginBottom: '20px' },
        icon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: colors.secondaryText },
        input: {
            width: '100%', padding: '14px 14px 14px 48px', backgroundColor: colors.cardWhite,
            border: `1px solid ${colors.border}`, borderRadius: '12px', color: colors.mainText,
            fontSize: '15px', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box'
        },
        btn: {
            width: '100%', padding: '14px', backgroundColor: colors.primaryBlue, color: '#fff', 
            border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)', transition: '0.2s', marginTop: '10px'
        },
        modalOverlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }
    };

    // =========================================================================
    // 2. STATE MANAGEMENT
    // =========================================================================
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passStrength, setPassStrength] = useState({ score: 0, label: '', color: 'transparent' });

    // Forgot Password States
    const [isForgotOpen, setIsForgotOpen] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); 
    const [forgotData, setForgotData] = useState({ email: '', otp: '', newPassword: '' });
    const [isForgotLoading, setIsForgotLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // =========================================================================
    // 3. HELPER FUNCTIONS
    // =========================================================================
    const evaluatePassword = (password) => {
        if (!password) return { score: 0, label: '', color: 'transparent' };
        
        let score = 0;
        if (password.length > 5) score += 2;
        if (password.length > 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9!@#$%^&*]/.test(password)) score += 1;

        if (score >= 4) return { score: 5, label: 'Strong', color: colors.success };
        if (score >= 2) return { score: 3, label: 'Medium', color: colors.warning };
        return { score: 1, label: 'Weak', color: colors.danger };
    };

    const handlePasswordChange = (e, isReset = false) => {
        const val = e.target.value;
        if (isReset) {
            setForgotData({ ...forgotData, newPassword: val });
        } else {
            setCredentials({ ...credentials, password: val });
        }
        setPassStrength(evaluatePassword(val));
    };

    const handleUserChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    // =========================================================================
    // 4. MAIN LOGIN & ADMIN GATE LOGIC
    // =========================================================================
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await api.post('/api/auth/login', credentials);
            
            if (response.status === 200) {
                // 🟢 MASS FIX: Added token extraction here! (token, jwt, accessToken)
                const { role, username, id, token, jwt, accessToken } = response.data; 
                
                // THE ADMIN GATE: Prevent access if profile isn't verified
                if (role !== 'ADMIN' && role !== 'HR') {
                    try {
                        const empCheck = await api.get('/api/employees/me');
                        if (!empCheck.data || !empCheck.data.id) throw new Error("Not Mapped");
                    } catch (checkError) {
                        await api.post('/api/auth/logout'); 
                        localStorage.clear();
                        toast.error('⏳ Waiting for Admin Approval! Your profile is not setup yet.', { 
                            style: { border: `1px solid ${colors.warning}`, padding: '16px', color: '#B45309', background: '#FEF3C7' },
                            duration: 5000 
                        });
                        setIsLoading(false);
                        return; 
                    }
                }

                if (role === 'USER') {
                    await api.post('/api/auth/logout');
                    localStorage.clear();
                    toast.error('🔒 Access Denied! Role is pending Admin approval.', { duration: 4000 });
                    setIsLoading(false);
                    return;
                }

                // 🟢 MASS FIX: Save the token in localStorage so interceptor can use it!
                const activeToken = token || jwt || accessToken;
                if (activeToken) {
                    localStorage.setItem('token', activeToken);
                }

                // Store other details
                localStorage.setItem('role', role);
                localStorage.setItem('username', username);
                localStorage.setItem('userId', id);
                localStorage.setItem('isAuthenticated', 'true');

                toast.success(`Welcome back, ${username}!`);

                setTimeout(() => {
                    if (role === 'MANAGER') navigate('/manager/dashboard');
                    else if (role === 'TL' || role === 'TEAM_LEAD') navigate('/tl/dashboard');
                    else if (role === 'EMPLOYEE') navigate('/employee/dashboard');
                    else if (role === 'ADMIN') navigate('/admin/dashboard');
                    else if (role === 'HR') navigate('/hr/dashboard');
                }, 1000);
            }
        } catch (error) {
            const backendError = error.response?.data?.message || error.response?.data || "Invalid credentials!";
            toast.error(typeof backendError === 'string' ? backendError : "Login Failed");
            setIsLoading(false);
        }
    };

    // =========================================================================
    // 5. FORGOT PASSWORD FLOW
    // =========================================================================
    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setIsForgotLoading(true);

        try {
            if (forgotStep === 1) {
                const res = await api.post('/api/auth/forgot-password', { email: forgotData.email });
                toast.success(res.data || "OTP sent to your email!");
                setForgotStep(2);
            } 
            else if (forgotStep === 2) {
                const res = await api.post('/api/auth/verify-otp', { email: forgotData.email, otp: forgotData.otp });
                toast.success(res.data || "OTP Verified!");
                setForgotStep(3);
                setPassStrength({ score: 0, label: '', color: 'transparent' });
            } 
            else if (forgotStep === 3) {
                if (passStrength.score < 3) {
                    toast.error("Please use a stronger password!");
                    setIsForgotLoading(false);
                    return;
                }
                const res = await api.post('/api/auth/reset-password', { 
                    email: forgotData.email, otp: forgotData.otp, newPassword: forgotData.newPassword 
                });
                toast.success(res.data || "Password reset successful! You can now login.");
                setIsForgotOpen(false);
                setForgotStep(1);
                setForgotData({ email: '', otp: '', newPassword: '' });
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || "Operation failed!";
            toast.error(typeof msg === 'string' ? msg : "Error occurred");
        } finally {
            setIsForgotLoading(false);
        }
    };

    // =========================================================================
    // 6. RENDER COMPONENT
    // =========================================================================
    return (
        <div style={styles.container}>
            
            {/* Soft Background Accents */}
            <div style={{ position: 'absolute', width: '60vw', height: '60vw', backgroundColor: colors.lightBlue, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5, top: '-20%', left: '-10%', zIndex: 1 }}></div>

            <div style={styles.card}>
                
                {/* Header Logo */}
                <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                    <div style={{ width: '64px', height: '64px', backgroundColor: colors.primaryBlue, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }}>
                        <span style={{ color: '#fff', fontSize: '24px', fontWeight: '800' }}>HR</span>
                    </div>
                    <h2 style={{ margin: 0, color: colors.mainText, fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>HRM Soft Portal</h2>
                    <p style={{ margin: '6px 0 0', color: colors.secondaryText, fontSize: '14px' }}>Welcome back! Please enter your details.</p>
                </div>

                <form onSubmit={handleLogin}>
                    {/* Username Input */}
                    <div style={styles.inputGroup}>
                        <User size={20} style={styles.icon} />
                        <input 
                            type="text" name="username" placeholder="Username"
                            style={styles.input} onChange={handleUserChange} required 
                            className="focus-ring" autoComplete="off"
                        />
                    </div>

                    {/* Password Input */}
                    <div style={{ ...styles.inputGroup, marginBottom: '12px' }}>
                        <Lock size={20} style={styles.icon} />
                        <input 
                            type={showPassword ? "text" : "password"} name="password" placeholder="Password"
                            style={{ ...styles.input, paddingRight: '45px' }} onChange={(e) => handlePasswordChange(e, false)} required 
                            className="focus-ring"
                        />
                        <button 
                            type="button" onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: colors.secondaryText, cursor: 'pointer' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Forgot Password Link */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                        <button type="button" onClick={() => setIsForgotOpen(true)} style={{ background: 'none', border: 'none', color: colors.primaryBlue, fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} className="hover-text">
                            Forgot password?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={isLoading} style={{ ...styles.btn, opacity: isLoading ? 0.7 : 1 }}>
                        {isLoading ? <Loader2 className="spin" size={20} /> : 'Sign In'} 
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                {/* Register Link */}
                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: colors.secondaryText }}>
                    Don't have an account? <Link to="/register" style={{ color: colors.primaryBlue, textDecoration: 'none', fontWeight: '600' }} className="hover-text">Register here</Link>
                </p>
            </div>

            {/* ================================================================= */}
            {/* FORGOT PASSWORD MODAL (MATCHING UI)                               */}
            {/* ================================================================= */}
            {isForgotOpen && (
                <div style={styles.modalOverlay}>
                    <div style={{ ...styles.card, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', animation: 'slideUp 0.3s ease-out' }}>
                        
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ backgroundColor: colors.lightBlue, width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                {forgotStep === 1 && <Mail size={26} color={colors.primaryBlue} />}
                                {forgotStep === 2 && <ShieldAlert size={26} color={colors.primaryBlue} />}
                                {forgotStep === 3 && <KeyRound size={26} color={colors.primaryBlue} />}
                            </div>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: colors.mainText }}>
                                {forgotStep === 1 ? 'Reset Password' : forgotStep === 2 ? 'Verify OTP' : 'Create New Password'}
                            </h3>
                            <p style={{ margin: '6px 0 0', fontSize: '13px', color: colors.secondaryText, lineHeight: '1.5' }}>
                                {forgotStep === 1 && "Enter your registered email address to receive a secure OTP."}
                                {forgotStep === 2 && `Enter the 6-digit OTP sent to ${forgotData.email}`}
                                {forgotStep === 3 && "Your new password must be strong and secure."}
                            </p>
                        </div>

                        <form onSubmit={handleForgotSubmit}>
                            
                            {/* STEP 1: EMAIL */}
                            {forgotStep === 1 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.mainText, marginBottom: '8px' }}>Email Address</label>
                                    <input 
                                        type="email" value={forgotData.email} onChange={e => setForgotData({...forgotData, email: e.target.value})}
                                        style={{ width: '100%', padding: '12px 14px', border: `1px solid ${colors.border}`, borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                                        placeholder="employee@domain.com" required className="focus-ring"
                                    />
                                </div>
                            )}

                            {/* STEP 2: OTP */}
                            {forgotStep === 2 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.mainText, marginBottom: '8px' }}>Security OTP</label>
                                    <input 
                                        type="text" value={forgotData.otp} onChange={e => setForgotData({...forgotData, otp: e.target.value})}
                                        style={{ width: '100%', padding: '12px 14px', border: `1px solid ${colors.border}`, borderRadius: '10px', fontSize: '18px', letterSpacing: '4px', textAlign: 'center', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }}
                                        placeholder="• • • • • •" maxLength={6} required className="focus-ring"
                                    />
                                </div>
                            )}

                            {/* STEP 3: NEW PASSWORD */}
                            {forgotStep === 3 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.mainText, marginBottom: '8px' }}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type={showNewPassword ? "text" : "password"} value={forgotData.newPassword} 
                                            onChange={(e) => handlePasswordChange(e, true)}
                                            style={{ width: '100%', padding: '12px 45px 12px 14px', border: `1px solid ${colors.border}`, borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                                            placeholder="Enter strong password" required className="focus-ring"
                                        />
                                        <button 
                                            type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: colors.secondaryText, cursor: 'pointer' }}
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    {/* Password Strength Warning for Reset */}
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '8px' }}>
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div key={level} style={{ flex: 1, backgroundColor: level <= passStrength.score ? passStrength.color : colors.border, borderRadius: '2px', transition: '0.3s' }}></div>
                                            ))}
                                        </div>
                                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: passStrength.color }}>
                                            {passStrength.score > 0 ? passStrength.label : 'Waiting for input...'}
                                        </p>
                                        {passStrength.score > 0 && passStrength.score < 3 && (
                                            <p style={{ margin: '6px 0 0', fontSize: '11px', color: colors.danger, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                                <AlertCircle size={12}/> Must include numbers, symbols & uppercase.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button 
                                    type="button" onClick={() => { setIsForgotOpen(false); setForgotStep(1); }} 
                                    style={{ flex: 1, padding: '12px', backgroundColor: colors.inputBg, color: colors.secondaryText, border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: '0.2s' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" disabled={isForgotLoading} 
                                    style={{ flex: 1, padding: '12px', backgroundColor: colors.primaryBlue, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.2s' }}
                                >
                                    {isForgotLoading ? <Loader2 size={16} className="spin" /> : forgotStep === 1 ? 'Send OTP' : forgotStep === 2 ? 'Verify OTP' : 'Save Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CSS ANIMATIONS INJECTION */}
            <style>
                {`
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(10px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    .focus-ring:focus { border-color: ${colors.primaryBlue} !important; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    .hover-text:hover { text-decoration: underline; }
                `}
            </style>
        </div>
    );
};

export default Login;