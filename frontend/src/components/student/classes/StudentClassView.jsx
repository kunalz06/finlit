import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import StudentModuleView from '../modules/StudentModuleView';

const StudentClassView = ({ classId, onBack }) => {
    const [classData, setClassData] = useState(null);

    useEffect(() => {
        api.get(`/classes/${classId}`).then(res => setClassData(res.data));
    }, [classId]);

    if (!classData) return <div className="card"><p>Loading...</p></div>;

    return (
        <div className="card student-module-view">
            <button onClick={onBack} className="button-link">&larr; Back to Classes</button>
            <h3>{classData.name}</h3>
            {classData.modules.map(module => <StudentModuleView key={module.id} module={module} />)}
        </div>
    );
};

export default StudentClassView;
