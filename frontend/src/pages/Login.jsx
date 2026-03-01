import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { username, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.user.role);
            navigate('/dashboard');
        } catch (error) {
            alert('Login failed: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const handleRegister = async () => {
        try {
            // For simplicity, registering as reviewer mainly, but admin if specified
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { username, password, role: 'reviewer' });
            alert('Registration successful! Please login.');
        } catch (error) {
            alert('Registration failed: ' + (error.response?.data?.message || 'Unknown error'));
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
                width: '380px',
                boxSizing: 'border-box',
            }}>
                <h2 style={{ margin: '0 0 24px', color: '#007bff', textAlign: 'center', fontSize: '1.3em' }}>
                    RSML Validator
                </h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #d0e3ff', fontSize: '0.93em', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #d0e3ff', fontSize: '0.93em', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                    <button type="submit" style={{
                        marginTop: '4px',
                        background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                        color: '#fff', border: 'none',
                        padding: '10px', borderRadius: '24px',
                        fontWeight: 700, fontSize: '0.95em', cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(13,110,253,0.25)',
                    }}>
                        Login
                    </button>
                </form>
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 8px', color: '#6c757d', fontSize: '0.85em' }}>Don't have an account?</p>
                    <button onClick={handleRegister} style={{
                        background: 'none', border: '1.5px solid #0d6efd',
                        color: '#0d6efd', padding: '7px 24px', borderRadius: '20px',
                        fontWeight: 600, fontSize: '0.88em', cursor: 'pointer',
                    }}>
                        Register as Reviewer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
