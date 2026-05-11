import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/apiConfig';
import toast from 'react-hot-toast';
import { 
    Eye, EyeOff, User, ShieldCheck, 
    ArrowRight, Mail, KeyRound, 
    Loader2, UserPlus, Info, ChevronDown
} from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();

    // =========================================================================
    // 1. BRAND COLORS (Matching Login UI)
    // =========================================================================
    const colors = {
        primaryBlue: '#2563EB',    
        lightBlue: '#EFF6FF',      
        background: '#F8FAFC',     
        cardWhite: '#FFFFFF',      
        mainText: '#0F172A',       
        secondaryText: '#64748B',  
        success: '#10B981',        
        warning: '#F59E0B',        
        danger: '#EF4444',         
        border: '#E2E8F0',         
        inputBg: '#F1F5F9'
    };

    // =========================================================================
    // 2. STATE MANAGEMENT
    // =========================================================================
    const [formData, setFormData] = useState({ 
        username: '', 
        email: '', 
        password: '', 
        roleName: 'EMPLOYEE' // Default role
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passStrength, setPassStrength] = useState({ score: 0, label: '', color: 'transparent' });

    // =========================================================================
    // 3. PASSWORD STRENGTH CALCULATION
    // =========================================================================
    const evaluatePassword = (password) => {
        let score = 0;
        if (!password) return { score: 0, label: '', color: 'transparent' };
        if (password.length >= 6) score += 1;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (score <= 2) return { score, label: 'Weak Security', color: colors.danger }; 
        if (score === 3 || score === 4) return { score, label: 'Moderate Security', color: colors.warning }; 
        return { score, label: 'Elite Security (Strong)', color: colors.success }; 
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, password: val });
        setPassStrength(evaluatePassword(val));
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // =========================================================================
    // 4. SUBMIT REGISTRATION LOGIC
    // =========================================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const usernameRegex = /^[a-zA-Z0-9_-]{3,15}$/;
        if (!usernameRegex.test(formData.username)) {
            toast.error("Username: 3-15 chars only!"); 
            return;
        }
        if (!formData.email.endsWith('@gmail.com') && !formData.email.includes('@')) {
            toast.error("Please enter a valid email address!"); 
            return;
        }
        if (passStrength.score < 3) {
            toast.error("Set a stronger password for workplace access!");
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/api/auth/register', formData);
            if (response.status === 200 || response.status === 201) {
                toast.success("Account Requested Successfully! 🚀");
                toast("Admin verification is in progress.", { icon: '⏳', duration: 4000 });
                
                setTimeout(() => navigate('/login'), 3000); 
            }
        } catch (error) {
            const backendError = error.response?.data?.message || error.response?.data || "Registration failed!";
            toast.error(typeof backendError === 'string' ? backendError : "Conflict detected");
        } finally {
            setIsLoading(false);
        }
    };

    // =========================================================================
    // 5. STYLES (PIXEL PERFECT POSITIONING)
    // =========================================================================
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
        icon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: colors.secondaryText, pointerEvents: 'none' },
        input: {
            width: '100%', padding: '14px 14px 14px 48px', backgroundColor: colors.cardWhite,
            border: `1px solid ${colors.border}`, borderRadius: '12px', color: colors.mainText,
            fontSize: '15px', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box'
        },
        label: { display: 'block', fontSize: '13px', fontWeight: '700', color: colors.mainText, marginBottom: '8px' },
        btn: {
            width: '100%', padding: '14px', backgroundColor: colors.primaryBlue, color: '#fff', 
            border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)', transition: '0.2s', marginTop: '10px'
        }
    };

    // =========================================================================
    // 6. RENDER UI
    // =========================================================================
    return (
        <div style={styles.container}>
            {/* Soft Background Accent (Static, No Animation) */}
            <div style={{ position: 'absolute', width: '60vw', height: '60vw', backgroundColor: colors.lightBlue, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5, top: '-20%', left: '-10%', zIndex: 1 }}></div>

            <div style={styles.card}>
                
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                    <div style={{ width: '64px', height: '64px', backgroundColor: colors.primaryBlue, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }}>
                        <UserPlus size={30} color="#fff" strokeWidth={2.5} />
                    </div>
                    <h2 style={{ margin: 0, color: colors.mainText, fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>Register Workplace</h2>
                    <p style={{ margin: '6px 0 0', color: colors.secondaryText, fontSize: '14px' }}>Create your professional account below.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* Username Input */}
                    <div style={styles.inputGroup}>
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={styles.icon} />
                            <input 
                                type="text" name="username" placeholder="Corporate Username"
                                style={styles.input} onChange={handleInputChange} required 
                                className="focus-ring" autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div style={styles.inputGroup}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={20} style={styles.icon} />
                            <input 
                                type="email" name="email" placeholder="Email Address"
                                style={styles.input} onChange={handleInputChange} required 
                                className="focus-ring" autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div style={{ ...styles.inputGroup, marginBottom: '10px' }}>
                        <div style={{ position: 'relative' }}>
                            <KeyRound size={20} style={styles.icon} />
                            <input 
                                type={showPassword ? "text" : "password"} name="password" placeholder="Create Password"
                                style={{ ...styles.input, paddingRight: '45px' }} onChange={handlePasswordChange} required 
                                className="focus-ring"
                            />
                            <button 
                                type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: colors.secondaryText, cursor: 'pointer', padding: '0', display: 'flex' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Password Strength Meter Logic */}
                    {formData.password && (
                        <div style={{ marginBottom: '20px', padding: '0 4px' }}>
                            <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '8px' }}>
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div key={level} style={{ 
                                        flex: 1, borderRadius: '2px', transition: 'all 0.3s ease',
                                        backgroundColor: level <= passStrength.score ? passStrength.color : colors.border
                                    }}></div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: passStrength.color }}>
                                    {passStrength.label}
                                </p>
                                {passStrength.score < 3 && (
                                    <p style={{ margin: 0, fontSize: '10px', color: colors.danger, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                        <Info size={12}/> Too Weak
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Role Selection Logic (ADMIN removed, strictly Employee/TL/Manager/HR) */}
                    <div style={styles.inputGroup}>
                        <div style={{ position: 'relative' }}>
                            <ShieldCheck size={20} style={styles.icon} />
                            <select 
                                name="roleName"
                                value={formData.roleName}
                                onChange={handleInputChange}
                                style={{ ...styles.input, appearance: 'none', cursor: 'pointer', paddingRight: '40px', fontWeight: '600', color: colors.mainText }}
                                className="focus-ring"
                            >
                                <option value="EMPLOYEE">EMPLOYEE</option>
                                <option value="TL">TEAM LEAD (TL)</option>
                                <option value="MANAGER">MANAGER</option>
                                <option value="HR">HR PROFESSIONAL</option>
                            </select>
                            {/* Custom Dropdown Arrow Icon */}
                            <ChevronDown size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: colors.secondaryText, pointerEvents: 'none' }} />
                        </div>
                    </div>

                    {/* Submit Registration Button */}
                    <button type="submit" disabled={isLoading} style={{ ...styles.btn, opacity: isLoading ? 0.7 : 1 }}>
                        {isLoading ? <Loader2 className="spin" size={20} /> : 'Create Account'} 
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                {/* Footer Section */}
                <div style={{ textAlign: 'center', marginTop: '28px', borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: colors.secondaryText, fontWeight: '500' }}>
                        Already part of the team? <Link to="/login" style={{ color: colors.primaryBlue, textDecoration: 'none', fontWeight: '700' }} className="hover-text">Sign In Here</Link>
                    </p>
                </div>
            </div>

            {/* CSS ANIMATIONS & FOCUS EFFECTS */}
            <style>
                {`
                    /* Smooth Focus Outline */
                    .focus-ring:focus { 
                        border-color: ${colors.primaryBlue} !important; 
                        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important; 
                        background-color: #fff !important;
                    }
                    /* Custom Input Auto-fill style override */
                    input:-webkit-autofill {
                        -webkit-box-shadow: 0 0 0 1000px white inset !important;
                    }
                    /* Spinning Loader Animation */
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    /* Link Hover Effect */
                    .hover-text:hover { text-decoration: underline; }
                `}
            </style>
        </div>
    );
};

export default Register;