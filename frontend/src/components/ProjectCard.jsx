import React from 'react';

const ProjectCard = ({ project, onClick, onDelete }) => {
    return (
        <div
            onClick={() => onClick(project._id)}
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: project.validated ? '1px solid #28a745' : '1px solid #e1e8ed',
                borderLeft: project.validated ? '4px solid #28a745' : '1px solid #e1e8ed',
                width: '300px',
                textAlign: 'left',
                position: 'relative'
            }}
            className="project-card"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>{project.name}</h3>
                {project.validated && (
                    <span style={{
                        fontSize: '0.7em',
                        background: '#d4edda',
                        color: '#155724',
                        border: '1px solid #c3e6cb',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                    }}>✔ Validated</span>
                )}
            </div>
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                Rows: {project.totalRows || 'N/A'}
            </p>
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                Created: {new Date(project.createdAt).toLocaleDateString()}
            </p>

            {/* Delete Button */}
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(project._id);
                    }}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'transparent',
                        border: 'none',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '5px'
                    }}
                    title="Delete Project"
                >
                    &times;
                </button>
            )}
        </div>
    );
};

export default ProjectCard;
