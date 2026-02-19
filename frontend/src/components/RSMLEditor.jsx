
import React, { useEffect, useRef, useState } from 'react';
import RSMLAnnotator from 'rsml'; // Ensure this matches how the package exports itself

const RSMLEditor = ({ initialValue = '', onSave, onClose }) => {
    const textareaRef = useRef(null);
    const outputRef = useRef(null);
    const [rsmlContent, setRsmlContent] = useState(initialValue);

    useEffect(() => {
        if (textareaRef.current && outputRef.current) {
            try {
                // Initialize RSML Annotator
                // Based on standard usage, it likely attaches to the textarea events
                new RSMLAnnotator({
                    textarea: textareaRef.current,
                    output: outputRef.current
                });
            } catch (e) {
                console.error("Failed to initialize RSML Annotator", e);
            }
        }
    }, []);

    const handleSave = () => {
        if (onSave) {
            onSave(textareaRef.current.value);
        }
    };

    return (
        <div className="rsml-editor-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="rsml-editor-modal" style={{
                width: '80%',
                height: '80%',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>RSML Editor</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleSave} style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>Save</button>
                        <button onClick={onClose} style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>Close</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>Input (edit here):</label>
                        <textarea
                            ref={textareaRef}
                            defaultValue={initialValue}
                            style={{
                                flex: 1,
                                fontFamily: 'monospace',
                                resize: 'none',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>Preview:</label>
                        <div
                            ref={outputRef}
                            className="rendered-transcript"
                            style={{
                                flex: 1,
                                background: '#f9f9f9',
                                overflowY: 'auto',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                padding: '10px'
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RSMLEditor;
