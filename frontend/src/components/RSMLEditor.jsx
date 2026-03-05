import React, { useEffect, useRef, useState } from "react";
import RSMLAnnotator from "rsml"; // Ensure this matches how the package exports itself

const RSMLEditor = ({ rowData = null, columnDefs = [], onSave, onClose }) => {
  const [editableData, setEditableData] = useState({});
  const textareaRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    if (rowData) {
      setEditableData({ ...rowData });
    }
  }, [rowData]);

  useEffect(() => {
    if (textareaRef.current && outputRef.current && editableData) {
      try {
        // Initialize RSML Annotator for the first RSML field found
        new RSMLAnnotator({
          textarea: textareaRef.current,
          output: outputRef.current,
        });
      } catch (e) {
        console.error("Failed to initialize RSML Annotator", e);
      }
    }
  }, [editableData]);

  const handleFieldChange = (fieldName, value) => {
    setEditableData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSave = (fieldName) => {
    if (onSave) {
      onSave({ [fieldName]: editableData[fieldName] });
    }
  };

  return (
    <div
      className="rsml-editor-overlay"
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
        className="rsml-editor-modal"
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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

        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
            }}
          >
            <div style={{ flex: 1, maxWidth: "200px" }}>
              <h4
                style={{
                  margin: "0 0 3px 0",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                File
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  fontSize: "11px",
                }}
              >
                {columnDefs
                  .filter((colDef) => {
                    const fieldName = colDef.field.toLowerCase();
                    return (
                      fieldName.includes("file") || fieldName.includes("path")
                    );
                  })
                  .slice(0, 1) // Limit to 1 item
                  .map((colDef) => {
                    const fieldName = colDef.field;
                    const fieldValue = editableData[fieldName] || "";
                    return (
                      <div
                        key={fieldName}
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#666",
                            marginBottom: "1px",
                          }}
                        >
                          {colDef.headerName || fieldName}:
                        </span>
                        <span style={{ color: "#333", wordBreak: "break-all" }}>
                          {fieldValue.length > 15
                            ? fieldValue.substring(0, 15) + "..."
                            : fieldValue || "N/A"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div style={{ flex: 1, maxWidth: "200px" }}>
              <h4
                style={{
                  margin: "0 0 3px 0",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Segment
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  fontSize: "11px",
                }}
              >
                {columnDefs
                  .filter((colDef) => {
                    const fieldName = colDef.field.toLowerCase();
                    return fieldName.includes("segment");
                  })
                  .slice(0, 1) // Limit to 1 item
                  .map((colDef) => {
                    const fieldName = colDef.field;
                    const fieldValue = editableData[fieldName] || "";
                    return (
                      <div
                        key={fieldName}
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#666",
                            marginBottom: "1px",
                          }}
                        >
                          {colDef.headerName || fieldName}:
                        </span>
                        <span style={{ color: "#333", wordBreak: "break-all" }}>
                          {fieldValue.length > 15
                            ? fieldValue.substring(0, 15) + "..."
                            : fieldValue || "N/A"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div style={{ flex: 1, maxWidth: "200px" }}>
              <h4
                style={{
                  margin: "0 0 3px 0",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Batch
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  fontSize: "11px",
                }}
              >
                {columnDefs
                  .filter((colDef) => {
                    const fieldName = colDef.field.toLowerCase();
                    return fieldName.includes("batch");
                  })
                  .slice(0, 1) // Limit to 1 item
                  .map((colDef) => {
                    const fieldName = colDef.field;
                    const fieldValue = editableData[fieldName] || "";
                    return (
                      <div
                        key={fieldName}
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#666",
                            marginBottom: "1px",
                          }}
                        >
                          {colDef.headerName || fieldName}:
                        </span>
                        <span style={{ color: "#333", wordBreak: "break-all" }}>
                          {fieldValue.length > 15
                            ? fieldValue.substring(0, 15) + "..."
                            : fieldValue || "N/A"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div style={{ flex: 1, maxWidth: "200px" }}>
              <h4
                style={{
                  margin: "0 0 3px 0",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Audio
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  fontSize: "11px",
                }}
              >
                {columnDefs
                  .filter((colDef) => {
                    const fieldName = colDef.field.toLowerCase();
                    return fieldName.includes("audio");
                  })
                  .slice(0, 1) // Limit to 1 item
                  .map((colDef) => {
                    const fieldName = colDef.field;
                    const fieldValue = editableData[fieldName] || "";
                    return (
                      <div
                        key={fieldName}
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#666",
                            marginBottom: "1px",
                          }}
                        >
                          {colDef.headerName || fieldName}:
                        </span>
                        <span style={{ color: "#333", wordBreak: "break-all" }}>
                          {fieldValue.length > 15
                            ? fieldValue.substring(0, 15) + "..."
                            : fieldValue || "N/A"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {columnDefs
            .filter((colDef) => {
              const fieldName = colDef.field.toLowerCase();
              // Exclude audio/segment/batch/file/path columns and start from verbatim
              return (
                !fieldName.includes("audio") &&
                !fieldName.includes("segment") &&
                !fieldName.includes("batch") &&
                !fieldName.includes("file") &&
                !fieldName.includes("path") &&
                (fieldName.includes("verbatim") ||
                  fieldName.includes("normalized") ||
                  fieldName.includes("rsml_") ||
                  fieldName.includes("hypothesis") ||
                  fieldName.includes("sarvam"))
              );
            })
            .map((colDef) => {
              const fieldName = colDef.field;
              const fieldValue = editableData[fieldName] || "";
              const isRsmlField =
                fieldName.includes("rsml_") ||
                fieldName.includes("verbatim") ||
                fieldName.includes("normalized");

              return (
                <div
                  key={fieldName}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {colDef.headerName || fieldName}
                    </h4>
                    <button
                      onClick={() => handleSave(fieldName)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Save {colDef.headerName || fieldName}
                    </button>
                  </div>

                  {isRsmlField ? (
                    <div
                      style={{ display: "flex", gap: "20px", height: "200px" }}
                    >
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <label
                          style={{
                            marginBottom: "5px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          Input (edit here):
                        </label>
                        <textarea
                          ref={
                            fieldName === columnDefs[0]?.field
                              ? textareaRef
                              : null
                          }
                          value={fieldValue}
                          onChange={(e) =>
                            handleFieldChange(fieldName, e.target.value)
                          }
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
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <label
                          style={{
                            marginBottom: "5px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          Preview:
                        </label>
                        <div
                          ref={
                            fieldName === columnDefs[0]?.field
                              ? outputRef
                              : null
                          }
                          className="rendered-transcript"
                          style={{
                            flex: 1,
                            background: "#f9f9f9",
                            overflowY: "auto",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            padding: "10px",
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={fieldValue}
                      onChange={(e) =>
                        handleFieldChange(fieldName, e.target.value)
                      }
                      style={{
                        width: "100%",
                        height: "100px",
                        fontFamily: "monospace",
                        resize: "none",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                    />
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default RSMLEditor;
