import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Resizable } from 're-resizable';
import RSMLEditor from './RSMLEditor';

import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// ─── Audio Cell ───────────────────────────────────────────────────────────────
const AudioCellRenderer = (params) => {
    if (!params.value) return null;
    return (
        <audio controls src={params.value} style={{ height: '30px', marginTop: '5px' }}>
            Your browser does not support the audio element.
        </audio>
    );
};

// ─── Validate Cell ────────────────────────────────────────────────────────────
const ValidateCellRenderer = ({ data, projectId, role, onValidated }) => {
    const [status, setStatus] = useState(null);
    const isValidated = data?._validated || status === 'done';

    if (!role || (role !== 'admin' && role !== 'reviewer')) return null;

    const handleClick = async (e) => {
        e.stopPropagation();
        if (isValidated) return;
        setStatus('loading');
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/viewer/projects/${projectId}/rows/${data._id}/validate`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus('done');
            if (onValidated) onValidated(data._id);
        } catch (err) {
            console.error('Row validate error:', err);
            setStatus(null);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={status === 'loading' || isValidated}
            style={{
                backgroundColor: isValidated ? '#28a745' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 10px',
                fontSize: '0.8em',
                cursor: isValidated || status === 'loading' ? 'default' : 'pointer',
                fontWeight: 600,
                opacity: status === 'loading' ? 0.7 : 1,
                whiteSpace: 'nowrap'
            }}
        >
            {status === 'loading' ? '⏳...' : isValidated ? '✔ Validated' : '✓ Validate'}
        </button>
    );
};

// ─── Add Column Dialog ────────────────────────────────────────────────────────
const AddColumnDialog = ({ onAdd, onClose, saving }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        // auto-focus handled by autoFocus attr
    }, []);

    const handleAdd = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        onAdd(trimmed);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAdd();
        if (e.key === 'Escape') onClose();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{
                background: '#fff', borderRadius: '10px', padding: '28px 32px',
                minWidth: '340px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
            }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1.1em', color: '#1a1a2e' }}>Add Custom Column</h3>
                <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Column name…"
                    style={{
                        width: '100%', padding: '8px 12px', fontSize: '0.97em',
                        border: '1.5px solid #c0ccdc', borderRadius: '6px',
                        outline: 'none', boxSizing: 'border-box', marginBottom: '18px'
                    }}
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} disabled={saving} style={{
                        padding: '7px 18px', borderRadius: '6px', border: 'none',
                        background: '#dc2626', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600
                    }}>Cancel</button>
                    <button onClick={handleAdd} disabled={saving} style={{
                        padding: '7px 18px', borderRadius: '6px', border: 'none',
                        background: '#1d4ed8', color: '#fff',
                        cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600,
                        opacity: saving ? 0.7 : 1
                    }}>
                        {saving ? 'Saving…' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main DataGrid ────────────────────────────────────────────────────────────
const DataGrid = ({ projectId, role }) => {
    const [gridApi, setGridApi] = useState(null);
    const [columnDefs, setColumnDefs] = useState([]);
    const [projectInfo, setProjectInfo] = useState(null);
    const [validateStatus, setValidateStatus] = useState(null);
    const [rsmlEditorState, setRsmlEditorState] = useState({
        isOpen: false, value: '', rowIndex: -1, colId: null
    });

    // Custom-column state
    const [customCols, setCustomCols] = useState([]);
    const [showAddColDialog, setShowAddColDialog] = useState(false);
    const [addingCol, setAddingCol] = useState(false);

    const apiBase = `${import.meta.env.VITE_API_URL}/viewer/projects/${projectId}`;
    const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

    // Build a custom column def (reads/writes __custom__<colName> via API)
    const buildCustomColDef = useCallback((colName) => ({
        headerName: colName,
        field: `__custom__${colName}`,
        editable: true,
        resizable: true,
        filter: true,
        sortable: true,
        width: 180,
        valueSetter: (params) => {
            const rowId = params.data?._id;
            if (!rowId) return false;
            // Optimistically update the local data
            params.data[`__custom__${colName}`] = params.newValue;
            // Persist to DB asynchronously
            axios.put(
                `${apiBase}/rows/${rowId}/custom-cell`,
                { colName, value: params.newValue },
                { headers: authHeader() }
            ).catch(err => console.error('Failed to save custom cell:', err));
            return true;
        }
    }), [projectId]);

    // Fetch Project Info (Headers) & Detect Audio Column
    useEffect(() => {
        if (!projectId) return;

        const fetchProjectInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${apiBase}?page=1&limit=1`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const { project, data } = response.data;
                setProjectInfo(project);

                if (project.headers && project.headers.length > 0) {
                    const excludedColumns = [
                        'verbatim', 'normalized', 'unsanitized_verbatim', 'unsanitized_normalized',
                        'rsml_verbatim', 'rsml_normalized', 'sarvam_hypothesis', 'rsml_sarvam',
                        'hypothesis_ccc-wav2vec', 'rsml_ccc-wav2vec', 'hypothesis_google', 'rsml_google',
                        'hypothesis_indic_conformer', 'rsml_indic_conformer'
                    ];

                    let audioColumnField = null;
                    if (data && data.length > 0) {
                        const firstRow = data[0];
                        for (const header of project.headers) {
                            if (excludedColumns.includes(header)) continue;
                            const cellValue = firstRow[header];
                            if (header.toLowerCase().includes('audio')) { audioColumnField = header; break; }
                            if (typeof cellValue === 'string' && cellValue.length > 500 && !cellValue.includes(' ')) {
                                audioColumnField = header; break;
                            }
                        }
                    }

                    const cols = [];

                    if (audioColumnField) {
                        cols.push({
                            headerName: 'Audio',
                            field: audioColumnField,
                            cellRenderer: (params) => {
                                let src = params.value;
                                if (!src) return null;
                                if (!src.startsWith('data:')) src = `data:audio/wav;base64,${src}`;
                                return (
                                    <audio controls src={src} style={{ height: '30px', marginTop: '5px' }}>
                                        Your browser does not support the audio element.
                                    </audio>
                                );
                            },
                            width: 300, editable: false, filter: false, pinned: 'left'
                        });
                    }

                    const headersToShow = (project.selectedHeaders && project.selectedHeaders.length > 0)
                        ? project.selectedHeaders
                        : project.headers;

                    headersToShow.forEach(header => {
                        const colDef = {
                            field: header,
                            headerName: header.charAt(0).toUpperCase() + header.slice(1),
                            editable: true, filter: true, resizable: true
                        };
                        const lowerHeader = header.toLowerCase();
                        if (
                            header === audioColumnField ||
                            lowerHeader === 'audio base64' || lowerHeader === 'audiopath' ||
                            lowerHeader === 'audio_base64' || lowerHeader === 'audio_path'
                        ) {
                            colDef.hide = true;
                        }
                        cols.push(colDef);
                    });

                    // Load custom columns from DB response
                    const dbCustomCols = project.customColumns || [];
                    setCustomCols(dbCustomCols);
                    dbCustomCols.forEach(colName => cols.push(buildCustomColDef(colName)));

                    const currentRole = localStorage.getItem('role');
                    if (currentRole === 'admin' || currentRole === 'reviewer') {
                        cols.unshift({
                            headerName: 'Validate',
                            field: '_validated',
                            width: 120, pinned: 'right', editable: false, filter: false, sortable: false,
                            cellRenderer: (params) => (
                                <ValidateCellRenderer
                                    data={params.data}
                                    projectId={projectId}
                                    role={currentRole}
                                    onValidated={(rowId) => {
                                        if (params.node) params.node.setDataValue('_validated', true);
                                    }}
                                />
                            )
                        });
                    }

                    setColumnDefs([...cols]);
                }
            } catch (error) {
                console.error('Error fetching project info:', error);
            }
        };

        fetchProjectInfo();
    }, [projectId, buildCustomColDef]);

    // Handle adding a new custom column → persist to DB
    const handleAddColumn = useCallback(async (colName) => {
        if (customCols.includes(colName)) { setShowAddColDialog(false); return; }
        setAddingCol(true);
        try {
            const res = await axios.post(
                `${apiBase}/custom-columns`,
                { colName },
                { headers: authHeader() }
            );
            const newCols = res.data.customColumns;
            setCustomCols(newCols);
            setColumnDefs(prev => [...prev, buildCustomColDef(colName)]);
        } catch (err) {
            console.error('Failed to add custom column:', err);
        } finally {
            setAddingCol(false);
            setShowAddColDialog(false);
        }
    }, [customCols, projectId, buildCustomColDef]);

    // Handle removing a custom column → persist to DB
    const handleRemoveColumn = useCallback(async (colName) => {
        try {
            const res = await axios.delete(
                `${apiBase}/custom-columns/${encodeURIComponent(colName)}`,
                { headers: authHeader() }
            );
            setCustomCols(res.data.customColumns);
            setColumnDefs(prev => prev.filter(c => c.field !== `__custom__${colName}`));
        } catch (err) {
            console.error('Failed to remove custom column:', err);
        }
    }, [projectId]);

    const handleCellDoubleClicked = useCallback((params) => {
        const field = params.colDef.field;
        const excludedColumns = [
            'verbatim', 'normalized', 'unsanitized_verbatim', 'unsanitized_normalized',
            'rsml_verbatim', 'rsml_normalized', 'sarvam_hypothesis', 'rsml_sarvam',
            'hypothesis_ccc-wav2vec', 'rsml_ccc-wav2vec', 'hypothesis_google', 'rsml_google',
            'hypothesis_indic_conformer', 'rsml_indic_conformer'
        ];
        const isCustom = field?.startsWith('__custom__');
        if (excludedColumns.includes(field) || isCustom) {
            setRsmlEditorState({ isOpen: true, value: params.value ?? '', rowIndex: params.node.rowIndex, colId: field, node: params.node, isCustom });
        }
    }, []);

    const handleRsmlSave = async (newValue) => {
        if (rsmlEditorState.node) {
            rsmlEditorState.node.setDataValue(rsmlEditorState.colId, newValue);
            const rowId = rsmlEditorState.node.data?._id;
            if (rowId) {
                if (rsmlEditorState.isCustom) {
                    // Custom column → existing endpoint
                    const colName = rsmlEditorState.colId.replace('__custom__', '');
                    axios.put(
                        `${apiBase}/rows/${rowId}/custom-cell`,
                        { colName, value: newValue },
                        { headers: authHeader() }
                    ).catch(err => console.error('Failed to save custom cell via RSML:', err));
                } else {
                    // Regular column (rsml_verbatim, rsml_normalized, etc.) → new endpoint
                    axios.put(
                        `${apiBase}/rows/${rowId}/cell`,
                        { field: rsmlEditorState.colId, value: newValue },
                        { headers: authHeader() }
                    ).catch(err => console.error('Failed to save row cell via RSML:', err));
                }
            }
        }
        setRsmlEditorState(prev => ({ ...prev, isOpen: false }));
    };
    const handleRsmlClose = () => setRsmlEditorState(prev => ({ ...prev, isOpen: false }));

    const onGridReady = useCallback((params) => { setGridApi(params.api); }, []);

    const handleValidateAll = async () => {
        if (!projectId) return;
        setValidateStatus('loading');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${apiBase}/validate`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setProjectInfo(prev => prev ? { ...prev, validated: true } : prev);
            setValidateStatus('success');
            setTimeout(() => setValidateStatus(null), 3000);
        } catch (error) {
            console.error('Error validating project:', error);
            setValidateStatus('error');
            setTimeout(() => setValidateStatus(null), 3000);
        }
    };

    useEffect(() => {
        if (!gridApi || !projectId || !projectInfo) return;

        const dataSource = {
            rowCount: undefined,
            getRows: async (params) => {
                const { startRow, endRow } = params;
                const pageSize = endRow - startRow;
                const page = Math.floor(startRow / pageSize) + 1;
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${apiBase}?page=${page}&limit=${pageSize}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    params.successCallback(response.data.data, response.data.project.totalRows);
                } catch (error) {
                    console.error('Error fetching rows:', error);
                    params.failCallback();
                }
            }
        };

        gridApi.setGridOption('datasource', dataSource);
    }, [gridApi, projectId, projectInfo]);

    return (
        <div style={{ position: 'relative', height: '100%' }}>
            <style>{`
                .custom-col-header .ag-header-cell-label { color: #1d4ed8; font-weight: 700; }
                .custom-col-header { background: #eff6ff !important; border-left: 2px solid #93c5fd !important; }
                .custom-col-cell { background: #f8faff; }
            `}</style>

            <div className="card" style={{ maxWidth: '100%', padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* ── Toolbar ── */}
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0 }}>
                        {projectInfo ? projectInfo.name : 'Loading...'}
                        {projectInfo && <span style={{ fontSize: '0.8em', color: '#666' }}> ({projectInfo.totalRows} rows)</span>}
                        {projectInfo && projectInfo.validated && (
                            <span style={{
                                marginLeft: '10px', fontSize: '0.75em', background: '#d4edda',
                                color: '#155724', border: '1px solid #c3e6cb', borderRadius: '12px',
                                padding: '2px 10px', fontWeight: 600, verticalAlign: 'middle'
                            }}>✔ Validated</span>
                        )}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {validateStatus === 'success' && (
                            <span style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '6px', padding: '4px 14px', fontSize: '0.9em' }}>
                                ✔ Project validated successfully!
                            </span>
                        )}
                        {validateStatus === 'error' && (
                            <span style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '6px', padding: '4px 14px', fontSize: '0.9em' }}>
                                ✖ Validation failed. Try again.
                            </span>
                        )}

                        {/* Custom-column chips */}
                        {customCols.map(colName => (
                            <span key={colName} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                background: '#dbeafe', border: '1px solid #93c5fd',
                                borderRadius: '14px', padding: '3px 10px',
                                fontSize: '0.82em', color: '#1e40af', fontWeight: 600
                            }}>
                                {colName}
                                <button
                                    title={`Remove column "${colName}"`}
                                    onClick={() => handleRemoveColumn(colName)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#1d4ed8', fontWeight: 700, fontSize: '1em',
                                        lineHeight: 1, padding: 0, marginTop: '-1px'
                                    }}
                                >×</button>
                            </span>
                        ))}

                        {/* Add Column button */}
                        <button
                            onClick={() => setShowAddColDialog(true)}
                            title="Add a custom column"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                padding: '6px 14px', borderRadius: '6px',
                                border: '1.5px dashed #3b82f6', background: '#eff6ff',
                                color: '#1d4ed8', cursor: 'pointer', fontWeight: 600,
                                fontSize: '0.88em', whiteSpace: 'nowrap'
                            }}
                        >
                            ＋ Add Column
                        </button>

                        {(role === 'admin' || role === 'reviewer') && (
                            <button
                                onClick={handleValidateAll}
                                disabled={validateStatus === 'loading'}
                                style={{
                                    backgroundColor: projectInfo && projectInfo.validated ? '#28a745' : '#007bff',
                                    color: 'white', border: 'none', padding: '6px 16px',
                                    borderRadius: '5px',
                                    cursor: validateStatus === 'loading' ? 'not-allowed' : 'pointer',
                                    fontWeight: 600, fontSize: '0.9em',
                                    opacity: validateStatus === 'loading' ? 0.7 : 1,
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                {validateStatus === 'loading' ? '⏳ Validating...' : (projectInfo && projectInfo.validated ? '✔ Validated' : '✓ Validate All')}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Grid ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Resizable
                        defaultSize={{ width: '100%', height: '100%' }}
                        minHeight="200px"
                        enable={{ top: false, right: false, bottom: true, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
                        style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', display: 'flex', flexDirection: 'column' }}
                    >
                        <div className="ag-theme-quartz" style={{ height: '100%', width: '100%', flex: 1 }}>
                            <AgGridReact
                                columnDefs={columnDefs}
                                rowModelType="infinite"
                                pagination={true}
                                paginationPageSize={1}
                                cacheBlockSize={1}
                                onGridReady={onGridReady}
                                onCellDoubleClicked={handleCellDoubleClicked}
                                defaultColDef={{ sortable: false, filter: false }}
                            />
                        </div>
                    </Resizable>
                </div>
            </div>

            {rsmlEditorState.isOpen && (
                <RSMLEditor
                    initialValue={rsmlEditorState.value}
                    onSave={handleRsmlSave}
                    onClose={handleRsmlClose}
                />
            )}

            {showAddColDialog && (
                <AddColumnDialog
                    onAdd={handleAddColumn}
                    onClose={() => setShowAddColDialog(false)}
                    saving={addingCol}
                />
            )}
        </div>
    );
};

export default DataGrid;
