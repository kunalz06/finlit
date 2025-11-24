import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StudentClassList from './classes/StudentClassList';
import EnrollForm from './classes/EnrollForm';
import ProgressReport from '../shared/ProgressReport';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [view, setView] = useState('classes');
    const [stats, setStats] = useState({ classes: 0, quizzes: 0, assignments: 0 });

    useEffect(() => {
        api.get(`/progress-report-data/${user.id}`).then(res => {
            setStats({
                classes: res.data.classes.length,
                quizzes: res.data.quiz_attempts.length,
                assignments: res.data.assignment_scores.length,
            });
        });
    }, [user.id]);

    return (
        <div className="student-dashboard-container">
            <div className="student-dashboard-header">
                <h2>Welcome, {user.name}!</h2>
                <p>Ready to build your financial future? Let's get started.</p>
            </div>
            <div className="student-stats-grid">
                <div className="stat-card stat-card-1">
                    <div className="stat-card-value">{stats.classes}</div>
                    <div className="stat-card-label">Classes Enrolled</div>
                </div>
                <div className="stat-card stat-card-2">
                    <div className="stat-card-value">{stats.quizzes}</div>
                    <div className="stat-card-label">Quizzes Taken</div>
                </div>
                <div className="stat-card stat-card-3">
                    <div className="stat-card-value">{stats.assignments}</div>
                    <div className="stat-card-label">Assignments Completed</div>
                </div>
            </div>
            <div className="card" style={{ backgroundColor: 'var(--student-card-bg)' }}>
                <div className="dashboard-view">
                    <nav className="dashboard-nav">
                        <button onClick={() => setView('classes')} className={view === 'classes' ? 'active' : ''}>My Classes</button>
                        <button onClick={() => setView('enroll')} className={view === 'enroll' ? 'active' : ''}>Enroll in New Class</button>
                        <button onClick={() => setView('progress')} className={view === 'progress' ? 'active' : ''}>My Progress</button>
                    </nav>
                    {view === 'classes' && <StudentClassList />}
                    {view === 'enroll' && <EnrollForm onEnroll={() => setView('classes')} />}
                    {view === 'progress' && <ProgressReport studentId={user.id} />}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
