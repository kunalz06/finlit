import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const TeacherMeetings = ({ classId }) => {
    const [meetings, setMeetings] = useState([]);
    const [filteredMeetings, setFilteredMeetings] = useState([]);
    const [showSchedule, setShowSchedule] = useState(false);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [filters, setFilters] = useState({ classId: '', status: '' });

    useEffect(() => {
        const fetchData = async () => {
            const meetingsRes = await api.get('/meetings');
            let allMeetings = meetingsRes.data;
            if (classId) {
                allMeetings = allMeetings.filter(m => m.class_id === classId);
                const studentsRes = await api.get(`/classes/${classId}/students`);
                setStudents(studentsRes.data);
            } else {
                const classesRes = await api.get('/teacher/classes');
                setClasses(classesRes.data);
            }
            setMeetings(allMeetings);
            setFilteredMeetings(allMeetings);
        };
        fetchData();
    }, [classId]);

    useEffect(() => {
        let result = meetings;
        if (filters.classId) result = result.filter(m => m.class_id === parseInt(filters.classId));
        if (filters.status) result = result.filter(m => m.status === filters.status);
        setFilteredMeetings(result);
    }, [filters, meetings]);

    const handleSchedule = async (e) => {
        e.preventDefault();
        const payload = { studentId: selectedStudent, classId, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString() };
        await api.post('/meetings/schedule-by-teacher', payload);
        setShowSchedule(false);
        const res = await api.get('/meetings');
        setMeetings(classId ? res.data.filter(m => m.class_id === classId) : res.data);
    };

    const handleStatusUpdate = async (meetingId, status) => {
        try {
            await api.put(`/meetings/${meetingId}/status`, { status });
            const res = await api.get('/meetings');
            setMeetings(classId ? res.data.filter(m => m.class_id === classId) : res.data);
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    return (
        <div className="card">
            <h4>{classId ? 'Class Meetings' : 'All Scheduled Meetings'}</h4>

            {!classId && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <select onChange={e => setFilters({ ...filters, classId: e.target.value })}>
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select onChange={e => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            )}

            {classId && (
                <button onClick={() => setShowSchedule(!showSchedule)} className="button">
                    {showSchedule ? 'Cancel' : 'Schedule New Meeting'}
                </button>
            )}

            {showSchedule && classId && (
                <form onSubmit={handleSchedule} style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                        <label>Student</label>
                        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required>
                            <option value="">Select a student</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Start Time</label>
                        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>End Time</label>
                        <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                    </div>
                    <button type="submit">Schedule</button>
                </form>
            )}

            <h5>Scheduled Meetings</h5>
            <table>
                <thead>
                    <tr>
                        {!classId && <th>Class</th>}
                        <th>Student</th>
                        <th>Parent</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMeetings.map(m => (
                        <tr key={m.id}>
                            {!classId && <td>{m.class_name}</td>}
                            <td>{m.student_name}</td>
                            <td>{m.parent_name}</td>
                            <td>{new Date(m.start_time).toLocaleString()} - {new Date(m.end_time).toLocaleTimeString()}</td>
                            <td>
                                <span className={`status-badge ${m.status === 'accepted' ? 'status-completed' : m.status === 'rejected' ? 'status-overdue' : 'status-pending'}`}>
                                    {m.status || 'pending'}
                                </span>
                            </td>
                            <td>
                                {(!m.status || m.status === 'pending') && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleStatusUpdate(m.id, 'accepted')}
                                            style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(m.id, 'rejected')}
                                            style={{ background: '#EF4444', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TeacherMeetings;
