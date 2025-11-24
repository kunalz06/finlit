import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import TeacherClassList from './TeacherClassList';
import CreateClassForm from './CreateClassForm';
import TeacherClassView from './TeacherClassView';

const TeacherDashboard = () => {
    const [classes, setClasses] = useState([]);
    const [view, setView] = useState('classes');
    const [selectedClass, setSelectedClass] = useState(null);

    const fetchClasses = async () => {
        const res = await api.get('/teacher/classes');
        setClasses(res.data);
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleClassCreated = () => {
        fetchClasses();
        setView('classes');
    };

    const handleViewClass = (classData) => {
        setSelectedClass(classData);
        setView('view_class');
    };

    return (
        <div>
            <h2>Teacher Dashboard</h2>
            <nav className="dashboard-nav">
                <button onClick={() => { setView('classes'); setSelectedClass(null); }} className={view === 'classes' ? 'active' : ''}>
                    My Classes
                </button>
                <button onClick={() => setView('create_class')} className={view === 'create_class' ? 'active' : ''}>
                    Create New Class
                </button>
            </nav>
            <div className="dashboard-view">
                {view === 'classes' && <TeacherClassList classes={classes} onViewClass={handleViewClass} />}
                {view === 'create_class' && <CreateClassForm onClassCreated={handleClassCreated} />}
                {view === 'view_class' && selectedClass && <TeacherClassView classData={selectedClass} />}
            </div>
        </div>
    );
};

export default TeacherDashboard;
