import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Resizable } from 're-resizable';
import RSMLEditor from './RSMLEditor';


import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const AudioCellRenderer = (params) => {
    if (!params.value) return null;
    return (
        <audio controls src={params.value} style={{ height: '30px', marginTop: '5px' }}>
            Your browser does not support the audio element.
        </audio>
    );
};

const DataGrid = ({ projectId }) => {
    const [gridApi, setGridApi] = useState(null);
    const [columnDefs, setColumnDefs] = useState([]);
    const [projectInfo, setProjectInfo] = useState(null);
    const [rsmlEditorState, setRsmlEditorState] = useState({
        isOpen: false,
        value: '',
        rowIndex: -1,
        colId: null
    });


    // Fetch Project Info (Headers) & Detect Audio Column
    useEffect(() => {
        if (!projectId) return;

        const fetchProjectInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                // Fetch first page to inspect data for audio detection
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/viewer/projects/${projectId}?page=1&limit=1`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const { project, data } = response.data;
                setProjectInfo(project);

                // Setup Columns
                if (project.headers && project.headers.length > 0) {
                    const excludedColumns = [
                        'verbatim', 'normalized', 'unsanitized_verbatim', 'unsanitized_normalized',
                        'rsml_verbatim', 'rsml_normalized', 'sarvam_hypothesis', 'rsml_sarvam',
                        'hypothesis_ccc-wav2vec', 'rsml_ccc-wav2vec', 'hypothesis_google', 'rsml_google',
                        'hypothesis_indic_conformer', 'rsml_indic_conformer'
                    ];

                    let audioColumnField = null;

                    // Heuristic: Check first row data for possible audio content
                    if (data && data.length > 0) {
                        const firstRow = data[0];
                        for (const header of project.headers) {
                            if (excludedColumns.includes(header)) continue;

                            const cellValue = firstRow[header];
                            // Check if distinctively long and looks like base64 (no spaces, common chars)
                            // or explicitly named 'audio'
                            if (header.toLowerCase().includes('audio')) {
                                audioColumnField = header;
                                break;
                            }

                            if (typeof cellValue === 'string' && cellValue.length > 500 && !cellValue.includes(' ')) {
                                // Likely base64 audio
                                audioColumnField = header;
                                break;
                            }
                        }
                    }

                    const cols = [];

                    // 1. Add Synthetic Audio Column if detected
                    if (audioColumnField) {
                        cols.push({
                            headerName: "Audio",
                            field: audioColumnField, // Use audio field data
                            cellRenderer: (params) => {
                                let src = params.value;
                                if (!src) return null;
                                // If it doesn't start with data:, assume it's raw base64 wav/mp3
                                if (!src.startsWith('data:')) {
                                    src = `data:audio/wav;base64,${src}`;
                                }
                                return (
                                    <audio controls src={src} style={{ height: '30px', marginTop: '5px' }}>
                                        Your browser does not support the audio element.
                                    </audio>
                                );
                            },
                            width: 300,
                            editable: false,
                            filter: false,
                            pinned: 'left'
                        });
                    }

                    // 2. Add remaining columns
                    project.headers.forEach(header => {
                        const colDef = {
                            field: header,
                            headerName: header.charAt(0).toUpperCase() + header.slice(1),
                            editable: true,
                            filter: true,
                            resizable: true
                        };

                        // Hide the source audio column and specific requests
                        const lowerHeader = header.toLowerCase();
                        if (
                            header === audioColumnField ||
                            lowerHeader === 'audio base64' ||
                            lowerHeader === 'audiopath' ||
                            lowerHeader === 'audio_base64' ||
                            lowerHeader === 'audio_path'
                        ) {
                            colDef.hide = true;
                        }

                        cols.push(colDef);
                    });

                    setColumnDefs(cols);
                }
            } catch (error) {
                console.error('Error fetching project info:', error);
            }
        };

        fetchProjectInfo();

    }, [projectId]);

    const handleCellDoubleClicked = useCallback((params) => {
        const field = params.colDef.field;
        const excludedColumns = [
            'verbatim', 'normalized', 'unsanitized_verbatim', 'unsanitized_normalized',
            'rsml_verbatim', 'rsml_normalized', 'sarvam_hypothesis', 'rsml_sarvam',
            'hypothesis_ccc-wav2vec', 'rsml_ccc-wav2vec', 'hypothesis_google', 'rsml_google',
            'hypothesis_indic_conformer', 'rsml_indic_conformer'
        ];

        if (excludedColumns.includes(field)) {
            setRsmlEditorState({
                isOpen: true,
                value: params.value,
                rowIndex: params.node.rowIndex,
                colId: field,
                node: params.node // Store node to update data later
            });
        }
    }, []);

    const handleRsmlSave = (newValue) => {
        if (rsmlEditorState.node) {
            rsmlEditorState.node.setDataValue(rsmlEditorState.colId, newValue);
            // Optionally trigger a backend save here if the grid doesn't handle it automatically
            // via onCellValueChanged
        }
        setRsmlEditorState(prev => ({ ...prev, isOpen: false }));
    };

    const handleRsmlClose = () => {
        setRsmlEditorState(prev => ({ ...prev, isOpen: false }));
    };


    const onGridReady = useCallback((params) => {
        setGridApi(params.api);
    }, []);

    // Set Datasource when API and Project Info are ready
    useEffect(() => {
        if (!gridApi || !projectId || !projectInfo) return;

        const dataSource = {
            rowCount: undefined, // let grid calculate
            getRows: async (params) => {
                const { startRow, endRow } = params;
                const pageSize = endRow - startRow;
                const page = Math.floor(startRow / pageSize) + 1;

                console.log(`Fetching page ${page} (rows ${startRow} to ${endRow})`);

                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/viewer/projects/${projectId}?page=${page}&limit=${pageSize}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const rows = response.data.data;
                    const totalRows = response.data.project.totalRows;

                    params.successCallback(rows, totalRows);
                } catch (error) {
                    console.error('Error fetching rows:', error);
                    params.failCallback();
                }
            }
        };

        gridApi.setGridOption('datasource', dataSource);
    }, [gridApi, projectId, projectInfo]);

    const containerStyle = useMemo(() => ({ width: '100%', height: 'calc(100vh - 200px)' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

    return (
        <div style={{ position: 'relative', height: '100%' }}>
            <div className="card" style={{ maxWidth: '100%', padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>
                        {projectInfo ? projectInfo.name : 'Loading...'}
                        {projectInfo && <span style={{ fontSize: '0.8em', color: '#666' }}> ({projectInfo.totalRows} rows)</span>}
                    </h3>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Resizable
                        defaultSize={{
                            width: '100%',
                            height: '100%',
                        }}
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
                                defaultColDef={{
                                    sortable: false, // Server-side sort not implemented
                                    filter: false,   // Server-side filter not implemented yet
                                }}
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
        </div>
    );
};

export default DataGrid;
