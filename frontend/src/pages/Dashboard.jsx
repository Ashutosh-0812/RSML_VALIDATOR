import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminUpload from '../components/AdminUpload';
import DataGrid from '../components/DataGrid';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';

const Dashboard = () => {
    const [role, setRole] = useState('');
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');

        if (!token) {
            navigate('/login');
            return;
        }

        setRole(userRole);
        fetchProjects();
    }, [navigate]);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/viewer/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleProjectClick = (id) => {
        setSelectedProjectId(id);
    };

    const handleBack = () => {
        setSelectedProjectId(null);
        fetchProjects(); // Refresh list on back
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProjects(); // Refresh list after delete
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project. Please try again.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f8ff', display: 'flex', flexDirection: 'column' }}>
            {!selectedProjectId && <Navbar role={role} />}

            <div style={selectedProjectId ? { flex: 1, display: 'flex', flexDirection: 'column' } : { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', width: '100%' }}>
                {selectedProjectId ? (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                        <div style={{ padding: '10px 20px', backgroundColor: '#fff', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            <button
                                onClick={handleBack}
                                style={{ marginRight: '1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                &larr; Back to Projects
                            </button>
                            <h3 style={{ margin: 0 }}>Project View</h3>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <DataGrid projectId={selectedProjectId} isFullScreen={true} role={role} />
                        </div>
                    </div>
                ) : (
                    <>
                        {role === 'admin' && (
                            <div style={{ marginBottom: '2rem', marginTop: '2rem' }}>
                                <AdminUpload onUploadSuccess={fetchProjects} />
                            </div>
                        )}

                        <h2 style={{ textAlign: 'left', marginBottom: '1rem', marginTop: !role ? '2rem' : 0 }}>Projects</h2>
                        {projects.length === 0 ? (
                            <p>No projects found.</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {projects.map(p => (
                                    <ProjectCard
                                        key={p._id}
                                        project={p}
                                        onClick={handleProjectClick}
                                        onDelete={role === 'admin' ? handleDeleteProject : null}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
