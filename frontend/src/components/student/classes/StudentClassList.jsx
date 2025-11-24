import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import StudentClassView from './StudentClassView';

const StudentClassList = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);

    useEffect(() => {
        api.get('/student/classes').then(res => setClasses(res.data));
    }, []);

    if (selectedClassId) {
        return <StudentClassView classId={selectedClassId} onBack={() => setSelectedClassId(null)} />;
    }

    return (
        <div className="grid-container">
            {classes.length > 0 ? (
                classes.map(c => (
                    <div key={c.id} className="student-class-card">
                        <h4>{c.name}</h4>
                        <p>Teacher: {c.teacher_name}</p>
                        <button onClick={() => setSelectedClassId(c.id)} className="button">Enter Class</button>
                    </div>
                ))
            ) : (
                <p>You are not enrolled in any classes yet. Go to "Enroll in New Class" to join one.</p>
            )}
        </div>
    );
};

export default StudentClassList;
