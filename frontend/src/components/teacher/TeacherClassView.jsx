import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ClassModules from './modules/ClassModules';
import EnrolledStudents from './students/EnrolledStudents';
import ClassPerformance from './performance/ClassPerformance';
import TeacherMeetings from './meetings/TeacherMeetings';

const TeacherClassView = ({ classData }) => {
    const [fullClassData, setFullClassData] = useState(null);
    const [view, setView] = useState('modules');
    const [loading, setLoading] = useState(true);

    const fetchClassDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/classes/${classData.id}`);
            setFullClassData(res.data);
        } catch (error) {
            console.error("Failed to fetch class details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassDetails();
    }, [classData.id]);

    if (loading) return <p>Loading class details...</p>;
    if (!fullClassData) return <p>Could not load class details.</p>;

    return (
        <div className="card">
            <h3>{fullClassData.name}</h3>
            <p style={{ color: 'var(--text-muted)' }}><strong>Class Code:</strong> {fullClassData.class_code}</p>
            <nav className="dashboard-nav">
                <button onClick={() => setView('modules')} className={view === 'modules' ? 'active' : ''}>Content</button>
                <button onClick={() => setView('students')} className={view === 'students' ? 'active' : ''}>Students</button>
                <button onClick={() => setView('performance')} className={view === 'performance' ? 'active' : ''}>Class Performance</button>
                <button onClick={() => setView('meetings')} className={view === 'meetings' ? 'active' : ''}>Meetings</button>
            </nav>
            <div>
                {view === 'modules' && <ClassModules classId={fullClassData.id} onUpdate={fetchClassDetails} />}
                {view === 'students' && <EnrolledStudents classId={fullClassData.id} />}
                {view === 'performance' && <ClassPerformance classId={fullClassData.id} />}
                {view === 'meetings' && <TeacherMeetings classId={fullClassData.id} />}
            </div>
        </div>
    );
};

export default TeacherClassView;
