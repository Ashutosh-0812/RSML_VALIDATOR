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
                border: '1px solid #e1e8ed',
                width: '300px',
                textAlign: 'left',
                position: 'relative' // For absolute positioning of delete button
            }}
            className="project-card"
        >
            <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{project.name}</h3>
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
                        e.stopPropagation(); // Prevent card click
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
