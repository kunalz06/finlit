import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ParentViewMeetings = () => {
    const [meetings, setMeetings] = useState([]);
    useEffect(() => {
        api.get('/meetings').then(res => setMeetings(res.data));
    }, []);
    return (
        <div className="card">
            <h3>My Scheduled Meetings</h3>
            <table>
                <thead><tr><th>Teacher</th><th>For Child</th><th>Class</th><th>Date & Time</th><th>Status</th></tr></thead>
                <tbody>
                    {meetings.map(m => (
                        <tr key={m.id}>
                            <td>{m.teacher_name}</td>
                            <td>{m.student_name}</td>
                            <td>{m.class_name}</td>
                            <td>{new Date(m.start_time).toLocaleString()} - {new Date(m.end_time).toLocaleTimeString()}</td>
                            <td>
                                <span className={`status-badge ${m.status === 'accepted' ? 'status-completed' : m.status === 'rejected' ? 'status-overdue' : 'status-pending'}`}>
                                    {m.status === 'rejected' ? 'Declined by Teacher' : (m.status || 'Pending')}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ParentViewMeetings;
