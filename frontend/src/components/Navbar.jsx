import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ role }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 0',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
            borderRadius: '12px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
        }}>
            <h2 style={{ margin: 0, color: '#007bff' }}>RSML Validator</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#6c757d' }}>Role: <strong>{role}</strong></span>
                <button onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
