import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const LOCKED_FIELDS = ['audio'];

const AdminUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [allHeaders, setAllHeaders] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [query, setQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const parseHeaders = (csvFile) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const firstLine = e.target.result.split('\n')[0].trim();
                const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                resolve(headers);
            };
            reader.readAsText(csvFile.slice(0, 4096));
        });
    };

    const handleFileChange = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        const headers = await parseHeaders(f);
        setAllHeaders(headers);
        setSelectedFields([...LOCKED_FIELDS.filter(lf => headers.includes(lf))]);
    };

    const suggestions = allHeaders.filter(h =>
        !selectedFields.includes(h) &&
        !LOCKED_FIELDS.includes(h) &&
        h.toLowerCase().includes(query.toLowerCase())
    );

    const addField = (field) => {
        if (!selectedFields.includes(field)) setSelectedFields(prev => [...prev, field]);
        setQuery('');
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    const removeField = (field) => {
        if (LOCKED_FIELDS.includes(field)) return;
        setSelectedFields(prev => prev.filter(f => f !== field));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            e.preventDefault();
            if (suggestions[0]) addField(suggestions[0]);
        } else if (e.key === 'Backspace' && query === '') {
            const removable = selectedFields.filter(f => !LOCKED_FIELDS.includes(f));
            if (removable.length > 0) removeField(removable[removable.length - 1]);
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    useEffect(() => {
        const handler = (e) => {
            if (!dropdownRef.current?.contains(e.target) && !inputRef.current?.contains(e.target))
                setShowDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleUpload = async () => {
        if (!file || !projectName.trim()) {
            alert('Please enter a project name and select a CSV file.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectName', projectName);
        formData.append('selectedHeaders', JSON.stringify(
            selectedFields.length > 0 ? selectedFields : allHeaders
        ));

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL}/admin/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            alert('File uploaded successfully!');
            setFile(null); setProjectName(''); setSelectedFields([]); setAllHeaders([]); setQuery('');
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            alert('Upload failed: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const inputBoxStyle = {
        width: '100%',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        fontSize: '0.92em',
        boxSizing: 'border-box',
        outline: 'none',
    };

    return (
        <div style={{
            backgroundColor: '#fff',
            border: '1px solid #d0d0d0',
            borderRadius: '14px',
            padding: '28px 32px 24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            maxWidth: '700px',
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Project Name */}
                <input
                    type="text"
                    placeholder="Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    style={{ ...inputBoxStyle, fontWeight: 600 }}
                />

                {/* CSV File picker — styled as a full-width row */}
                <label style={{
                    ...inputBoxStyle,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: file ? '#212529' : '#6c757d',
                    fontWeight: 600,
                    gap: '10px',
                }}>
                    <span style={{ flex: 1 }}>{file ? `📄 ${file.name}` : 'Upload CSV'}</span>
                    <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>

                {/* Select Fields — only shows after CSV loaded */}
                <div style={{ position: 'relative' }}>
                    <div
                        onClick={() => { if (allHeaders.length > 0) { inputRef.current?.focus(); setShowDropdown(true); } }}
                        style={{
                            ...inputBoxStyle,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            alignItems: 'center',
                            minHeight: '42px',
                            cursor: allHeaders.length > 0 ? 'text' : 'not-allowed',
                            backgroundColor: allHeaders.length === 0 ? '#f8f9fa' : '#fff',
                        }}
                    >
                        {selectedFields.length === 0 && query === '' && (
                            <span style={{ color: '#6c757d', fontWeight: 600, pointerEvents: 'none' }}>
                                Select Fields
                            </span>
                        )}
                        {selectedFields.map(field => {
                            const locked = LOCKED_FIELDS.includes(field);
                            return (
                                <span key={field} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    backgroundColor: locked ? '#6c757d' : '#0d6efd',
                                    color: 'white', borderRadius: '14px',
                                    padding: '2px 10px', fontSize: '0.8em', fontWeight: 600,
                                }}>
                                    {field}
                                    {!locked && (
                                        <span
                                            onMouseDown={(e) => { e.preventDefault(); removeField(field); }}
                                            style={{ cursor: 'pointer', marginLeft: '2px', fontWeight: 'bold' }}
                                        >×</span>
                                    )}
                                </span>
                            );
                        })}
                        {allHeaders.length > 0 && (
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
                                onFocus={() => setShowDropdown(true)}
                                onKeyDown={handleKeyDown}
                                style={{
                                    border: 'none', outline: 'none',
                                    fontSize: '0.88em', minWidth: '100px', flex: 1,
                                }}
                                placeholder={selectedFields.length <= LOCKED_FIELDS.length ? 'Type to search fields…' : ''}
                            />
                        )}
                    </div>

                    {/* Dropdown */}
                    {showDropdown && suggestions.length > 0 && (
                        <div
                            ref={dropdownRef}
                            style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                marginTop: '3px', backgroundColor: '#fff',
                                border: '1px solid #ced4da', borderRadius: '8px',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.1)', zIndex: 999,
                                maxHeight: '220px', overflowY: 'auto',
                            }}
                        >
                            {suggestions.map((s, i) => (
                                <div
                                    key={s}
                                    onMouseDown={(e) => { e.preventDefault(); addField(s); }}
                                    style={{
                                        padding: '8px 14px', cursor: 'pointer', fontSize: '0.88em',
                                        fontFamily: 'monospace', borderBottom: i < suggestions.length - 1 ? '1px solid #f1f3f5' : 'none',
                                        backgroundColor: i === 0 ? '#e8f0fe' : 'transparent',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e8f0fe'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = i === 0 ? '#e8f0fe' : 'transparent'}
                                >
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upload button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        style={{
                            backgroundColor: '#fff',
                            color: '#212529',
                            border: '1.5px solid #aaa',
                            padding: '8px 40px',
                            borderRadius: '20px',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            fontWeight: 700,
                            fontSize: '0.95em',
                            opacity: uploading ? 0.6 : 1,
                        }}
                    >
                        {uploading ? 'Uploading…' : 'Upload'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AdminUpload;
