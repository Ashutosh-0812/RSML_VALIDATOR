import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import RSMLAnnotator from 'rsml';

/**
 * Custom AG Grid cell editor that attaches RSMLAnnotator to a textarea,
 * enabling @, #, ! RSML tags during inline cell editing.
 *
 * AG Grid injects: value, stopEditing, data, column, node, api
 * cellEditorParams injects: saveCell(rowId, field, newValue, node, api)
 */
const RSMLCellEditor = forwardRef(({ value, stopEditing, data, column, node, api, saveCell }, ref) => {
    const textareaRef = useRef(null);
    const outputRef = useRef(null);
    const annotatorRef = useRef(null);
    // Must capture value BEFORE stopEditing() unmounts the component
    // so getValue() still returns the correct value after unmount
    const committedValueRef = useRef(value);

    // AG Grid reads this to get the committed value when editing stops
    useImperativeHandle(ref, () => ({
        getValue: () => committedValueRef.current,
    }));

    useEffect(() => {
        if (textareaRef.current && outputRef.current && !annotatorRef.current) {
            textareaRef.current.value = value ?? '';
            annotatorRef.current = new RSMLAnnotator({
                textarea: textareaRef.current,
                output: outputRef.current,
            });
        }
        // Focus and move cursor to end
        if (textareaRef.current) {
            textareaRef.current.focus();
            const len = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(len, len);
        }
    }, []);

    const commitEdit = () => {
        // Capture value NOW — textareaRef becomes null after stopEditing() unmounts
        const newValue = textareaRef.current?.value ?? value;
        committedValueRef.current = newValue; // getValue() will return this after unmount
        const field = column?.getColId?.();
        const rowId = data?._id;

        // Directly save — no reliance on onCellValueChanged
        if (saveCell && rowId && field) {
            saveCell(rowId, field, newValue);
        }
        stopEditing();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            commitEdit();
            return;
        }
        if (e.key === 'Escape') {
            e.stopPropagation();
            stopEditing(true); // cancel — revert
            return;
        }
        // Stop all other keypresses from bubbling to AG Grid while typing
        e.stopPropagation();
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            background: '#fff',
            border: '2px solid #0d6efd',
            borderRadius: '4px',
            boxShadow: '0 4px 16px rgba(13,110,253,0.15)',
            zIndex: 9999,
            minWidth: '320px',
        }}>
            {/* Textarea — RSMLAnnotator attaches here for @, #, ! support */}
            <textarea
                ref={textareaRef}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Type @ for tags, # for entities, ! for languages…"
                style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontFamily: 'monospace',
                    fontSize: '0.88em',
                    border: 'none',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    borderRadius: '4px 4px 0 0',
                    minHeight: '60px',
                }}
            />
            {/* Live RSML preview */}
            <div
                ref={outputRef}
                style={{
                    padding: '6px 10px',
                    fontSize: '0.82em',
                    background: '#f8faff',
                    borderTop: '1px solid #d0e3ff',
                    minHeight: '28px',
                    color: '#444',
                    borderRadius: '0 0 4px 4px',
                    lineHeight: 1.5,
                }}
            />
            <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: '6px',
                padding: '4px 8px 6px', borderTop: '1px solid #eee',
            }}>
                <span style={{ fontSize: '0.75em', color: '#888', alignSelf: 'center', marginRight: 'auto' }}>
                    Enter to save &nbsp;·&nbsp; Esc to cancel
                </span>
                <button
                    onMouseDown={(e) => { e.preventDefault(); commitEdit(); }}
                    style={{
                        padding: '3px 12px', fontSize: '0.8em', borderRadius: '4px',
                        background: '#0d6efd', color: '#fff', border: 'none', cursor: 'pointer',
                        fontWeight: 600,
                    }}
                >
                    Save
                </button>
            </div>
        </div>
    );
});

RSMLCellEditor.displayName = 'RSMLCellEditor';
export default RSMLCellEditor;
