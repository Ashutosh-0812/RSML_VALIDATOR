import React, { useEffect, useRef, useState } from "react";
import RSMLAnnotator from "rsml";
import axios from "axios";

const RSMLEditor = ({ rowData = null, columnDefs = [], onSave, onClose, projectId }) => {
  const [editableData, setEditableData] = useState({});
  const [savingField, setSavingField] = useState(null);

  // Per-field refs: { [fieldName]: { textarea: el, output: el, annotator: instance } }
  const fieldRefs = useRef({});

  useEffect(() => {
    if (rowData) {
      setEditableData({ ...rowData });
    }
  }, [rowData]);

  // ── Attach RSMLAnnotator to each RSML textarea after it mounts ──────────
  // We use a callback ref pattern per field so the annotator is created once
  // the DOM element actually exists.
  const getTextareaRef = (fieldName) => (el) => {
    if (!el) return;
    if (!fieldRefs.current[fieldName]) {
      fieldRefs.current[fieldName] = {};
    }
    fieldRefs.current[fieldName].textarea = el;
    // Set initial value
    el.value = editableData[fieldName] ?? rowData?.[fieldName] ?? "";
    // Attach annotator once both textarea and output are present
    maybeInitAnnotator(fieldName);
  };

  const getOutputRef = (fieldName) => (el) => {
    if (!el) return;
    if (!fieldRefs.current[fieldName]) {
      fieldRefs.current[fieldName] = {};
    }
    fieldRefs.current[fieldName].output = el;
    maybeInitAnnotator(fieldName);
  };

  const maybeInitAnnotator = (fieldName) => {
    const refs = fieldRefs.current[fieldName];
    if (!refs || !refs.textarea || !refs.output || refs.annotator) return;
    try {
      refs.annotator = new RSMLAnnotator({
        textarea: refs.textarea,
        output: refs.output,
      });
    } catch (e) {
      console.error("Failed to init RSMLAnnotator for", fieldName, e);
    }
  };

  // Keep editableData in sync when user types in any textarea
  const handleTextareaInput = (fieldName, e) => {
    const value = e.target.value;
    setEditableData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // ── Save: update grid + persist to backend ───────────────────────────────
  const handleSave = async (fieldName) => {
    const value = editableData[fieldName] ?? "";
    setSavingField(fieldName);
    try {
      // 1. Update the grid row visually
      if (onSave) {
        onSave({ [fieldName]: value });
      }
      // 2. Persist to the backend
      const rowId = rowData?._id;
      const pid = projectId ?? rowData?.projectId;
      if (rowId && pid) {
        const token = localStorage.getItem("token");
        await axios.put(
          `${import.meta.env.VITE_API_URL}/viewer/projects/${pid}/rows/${rowId}/cell`,
          { field: fieldName, value },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
    } catch (err) {
      console.error("Error saving field:", fieldName, err);
      alert("Failed to save. Please try again.");
    } finally {
      setSavingField(null);
    }
  };

  // ── Which fields to show ─────────────────────────────────────────────────
  const rsmlFields = columnDefs.filter((colDef) => {
    const f = colDef.field?.toLowerCase() ?? "";
    return (
      !f.includes("audio") &&
      !f.includes("segment") &&
      !f.includes("batch") &&
      !f.includes("file") &&
      !f.includes("path") &&
      (f.includes("verbatim") ||
        f.includes("normalized") ||
        f.includes("rsml_") ||
        f.includes("hypothesis") ||
        f.includes("sarvam"))
    );
  });

  const metaGroups = [
    { label: "File", match: (f) => f.includes("file") || f.includes("path") },
    { label: "Segment", match: (f) => f.includes("segment") },
    { label: "Batch", match: (f) => f.includes("batch") },
    { label: "Audio", match: (f) => f.includes("audio") },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "80%",
          height: "80%",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>RSML Editor</h3>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        {/* Metadata row */}
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
            {metaGroups.map(({ label, match }) => {
              const col = columnDefs.find((c) => match(c.field?.toLowerCase() ?? ""));
              const val = col ? (editableData[col.field] ?? "") : "";
              return (
                <div key={label} style={{ flex: 1, maxWidth: "200px" }}>
                  <h4 style={{ margin: "0 0 3px 0", fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                    {label}
                  </h4>
                  <span style={{ fontSize: "11px", color: "#333", wordBreak: "break-all" }}>
                    {val ? (val.length > 15 ? val.substring(0, 15) + "…" : val) : "N/A"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RSML Fields — one RSMLAnnotator per field */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {rsmlFields.map((colDef) => {
            const fieldName = colDef.field;
            const isSaving = savingField === fieldName;

            return (
              <div
                key={fieldName}
                style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}
              >
                {/* Field header + save button */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                    {colDef.headerName || fieldName}
                  </h4>
                  <button
                    onClick={() => handleSave(fieldName)}
                    disabled={isSaving}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: isSaving ? "#6c757d" : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: isSaving ? "not-allowed" : "pointer",
                      fontSize: "12px",
                    }}
                  >
                    {isSaving ? "Saving…" : `Save ${colDef.headerName || fieldName}`}
                  </button>
                </div>

                {/* Two-panel: textarea | preview */}
                <div style={{ display: "flex", gap: "20px", height: "200px" }}>
                  {/* Input */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: "5px", fontSize: "12px", fontWeight: "bold" }}>
                      Input (edit here):
                    </label>
                    <textarea
                      ref={getTextareaRef(fieldName)}
                      defaultValue={rowData?.[fieldName] ?? ""}
                      onInput={(e) => handleTextareaInput(fieldName, e)}
                      style={{
                        flex: 1,
                        fontFamily: "monospace",
                        resize: "none",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  {/* Preview (RSMLAnnotator output target) */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: "5px", fontSize: "12px", fontWeight: "bold" }}>
                      Preview:
                    </label>
                    <div
                      ref={getOutputRef(fieldName)}
                      className="rendered-transcript"
                      style={{
                        flex: 1,
                        background: "#f9f9f9",
                        overflowY: "auto",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "10px",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RSMLEditor;
