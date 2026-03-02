import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const navigate = useNavigate();

    // Login fields
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register fields
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regRole, setRegRole] = useState('reviewer');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const inputStyle = {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1.5px solid #d0e3ff',
        fontSize: '0.93em',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
                email: loginEmail,
                password: loginPassword,
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.user.role);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
                name: regName,
                email: regEmail,
                password: regPassword,
                role: regRole,
            });
            setSuccess('Account created! You can now log in.');
            setRegName(''); setRegEmail(''); setRegPassword(''); setRegRole('reviewer');
            setTimeout(() => setMode('login'), 1800);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f8ff',
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #cde0ff',
                borderRadius: '16px',
                padding: '40px 36px',
                boxShadow: '0 4px 24px rgba(13,110,253,0.10)',
                width: '400px',
                boxSizing: 'border-box',
            }}>
                {/* Header */}
                <h2 style={{ margin: '0 0 6px', color: '#007bff', textAlign: 'center', fontSize: '1.3em' }}>
                    RSML Validator
                </h2>
                <p style={{ margin: '0 0 24px', textAlign: 'center', color: '#6c757d', fontSize: '0.85em' }}>
                    {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
                </p>

                {/* Tab toggle */}
                <div style={{
                    display: 'flex', borderRadius: '10px', overflow: 'hidden',
                    border: '1.5px solid #d0e3ff', marginBottom: '24px',
                }}>
                    {['login', 'register'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setMode(tab); setError(''); setSuccess(''); }}
                            style={{
                                flex: 1, padding: '9px', border: 'none', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.88em',
                                background: mode === tab ? 'linear-gradient(135deg, #0d6efd, #0a58ca)' : '#f8fbff',
                                color: mode === tab ? '#fff' : '#6c757d',
                                transition: 'all 0.2s',
                            }}
                        >
                            {tab === 'login' ? 'Login' : 'Register'}
                        </button>
                    ))}
                </div>

                {/* Error / Success */}
                {error && (
                    <div style={{
                        background: '#fff5f5', border: '1px solid #f5c6cb',
                        color: '#721c24', borderRadius: '8px', padding: '9px 14px',
                        fontSize: '0.85em', marginBottom: '16px',
                    }}>{error}</div>
                )}
                {success && (
                    <div style={{
                        background: '#f0fff4', border: '1px solid #c3e6cb',
                        color: '#155724', borderRadius: '8px', padding: '9px 14px',
                        fontSize: '0.85em', marginBottom: '16px',
                    }}>{success}</div>
                )}

                {/* ── Login Form ── */}
                {mode === 'login' && (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#0d6efd'}
                            onBlur={e => e.target.style.borderColor = '#d0e3ff'}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#0d6efd'}
                            onBlur={e => e.target.style.borderColor = '#d0e3ff'}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '4px',
                                background: loading ? '#adb5bd' : 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                                color: '#fff', border: 'none',
                                padding: '11px', borderRadius: '24px',
                                fontWeight: 700, fontSize: '0.95em',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: loading ? 'none' : '0 4px 14px rgba(13,110,253,0.25)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? 'Signing in…' : 'Login'}
                        </button>
                    </form>
                )}

                {/* ── Register Form ── */}
                {mode === 'register' && (
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={regName}
                            onChange={e => setRegName(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#0d6efd'}
                            onBlur={e => e.target.style.borderColor = '#d0e3ff'}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={regEmail}
                            onChange={e => setRegEmail(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#0d6efd'}
                            onBlur={e => e.target.style.borderColor = '#d0e3ff'}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={regPassword}
                            onChange={e => setRegPassword(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#0d6efd'}
                            onBlur={e => e.target.style.borderColor = '#d0e3ff'}
                        />
                        <select
                            value={regRole}
                            onChange={e => setRegRole(e.target.value)}
                            style={{ ...inputStyle, color: '#212529', cursor: 'pointer' }}
                            onFocus={e => e.target.style.borderColor = '#0d6efd'}
                            onBlur={e => e.target.style.borderColor = '#d0e3ff'}
                        >
                            <option value="reviewer">Reviewer</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '4px',
                                background: loading ? '#adb5bd' : 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                                color: '#fff', border: 'none',
                                padding: '11px', borderRadius: '24px',
                                fontWeight: 700, fontSize: '0.95em',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: loading ? 'none' : '0 4px 14px rgba(13,110,253,0.25)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
