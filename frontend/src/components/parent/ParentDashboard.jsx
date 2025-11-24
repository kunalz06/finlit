import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ParentChildrenList from './ParentChildrenList';
import ConnectChildForm from './ConnectChildForm';
import ParentScheduleMeeting from './ParentScheduleMeeting';
import ParentViewMeetings from './ParentViewMeetings';

const ParentDashboard = () => {
    const [children, setChildren] = useState([]);
    const [view, setView] = useState('children');

    const fetchChildren = () => {
        api.get('/parent/children').then(res => setChildren(res.data));
    };

    useEffect(fetchChildren, []);

    return (
        <div>
            <h2>Parent Dashboard</h2>
            <nav className="dashboard-nav">
                <button onClick={() => setView('children')} className={view === 'children' ? 'active' : ''}>My Children</button>
                <button onClick={() => setView('connect')} className={view === 'connect' ? 'active' : ''}>Connect to Child</button>
                <button onClick={() => setView('schedule')} className={view === 'schedule' ? 'active' : ''}>Schedule a Meeting</button>
                <button onClick={() => setView('meetings')} className={view === 'meetings' ? 'active' : ''}>View Meetings</button>
            </nav>
            <div className="dashboard-view">
                {view === 'children' && <ParentChildrenList children={children} />}
                {view === 'connect' && <ConnectChildForm onConnect={fetchChildren} />}
                {view === 'schedule' && <ParentScheduleMeeting children={children} />}
                {view === 'meetings' && <ParentViewMeetings />}
            </div>
        </div>
    );
};

export default ParentDashboard;
