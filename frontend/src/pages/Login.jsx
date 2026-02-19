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
        <div className="card">
            <h2>RSML Validator Login</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account?</p>
            <button onClick={handleRegister}>Register as Reviewer</button>
        </div>
    );
};

export default Login;
