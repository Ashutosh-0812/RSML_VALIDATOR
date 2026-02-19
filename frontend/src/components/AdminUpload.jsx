import React, { useState } from 'react';
import axios from 'axios';

const AdminUpload = (props) => {
    const [file, setFile] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file || !projectName) {
            alert('Please select a file and enter a project name');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectName', projectName);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL}/admin/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            alert('File uploaded successfully');
            setFile(null);
            setProjectName('');
            if (props.onUploadSuccess) props.onUploadSuccess();
            // Trigger refresh logic here if needed, or rely on page reload/polling
        } catch (error) {
            alert('Upload failed: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card">
            <h3>Admin Upload</h3>
            <input
                type="text"
                placeholder="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
            />
            <input type="file" onChange={handleFileChange} accept=".csv" />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload CSV'}
            </button>
        </div>
    );
};

export default AdminUpload;
