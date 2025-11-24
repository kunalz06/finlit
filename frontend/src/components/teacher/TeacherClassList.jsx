import React from 'react';

const TeacherClassList = ({ classes, onViewClass }) => (
    <div className="card">
        <h3>My Classes</h3>
        {classes.length > 0 ? (
            <div className="grid-container">
                {classes.map(c => (
                    <div key={c.id} className="grid-item">
                        <h4>{c.name}</h4>
                        <p>Class Code: <strong>{c.class_code}</strong></p>
                        <button onClick={() => onViewClass(c)} className="button">View Details</button>
                    </div>
                ))}
            </div>
        ) : (
            <p>You haven't created any classes yet. Click "Create New Class" to get started.</p>
        )}
    </div>
);

export default TeacherClassList;
