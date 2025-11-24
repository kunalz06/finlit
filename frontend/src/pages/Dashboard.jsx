import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TeacherDashboard from '../components/teacher/TeacherDashboard';
import StudentDashboard from '../components/student/StudentDashboard';
import ParentDashboard from '../components/parent/ParentDashboard';
import AccountSettings from './AccountSettings';
import Sidebar from '../components/Sidebar';
import TeacherMeetings from '../components/teacher/meetings/TeacherMeetings';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-content">
                <Routes>
                    <Route path="/" element={
                        user.role === 'teacher' ? <TeacherDashboard /> :
                            user.role === 'student' ? <StudentDashboard /> :
                                user.role === 'parent' ? <ParentDashboard /> :
                                    <div>Unknown Role</div>
                    } />
                    <Route path="/meetings" element={user.role === 'teacher' ? <TeacherMeetings /> : <div>Access Denied</div>} />
                    <Route path="/account" element={<AccountSettings />} />
                </Routes>
            </div>
        </div>
    );
};

export default Dashboard;
