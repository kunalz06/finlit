import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ParentScheduleMeeting = ({ children }) => {
    const [selectedChild, setSelectedChild] = useState('');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [date, setDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (selectedChild) {
            api.get(`/parent/child/${selectedChild}/classes`).then(res => setClasses(res.data));
        } else {
            setClasses([]);
        }
        setSelectedClass('');
        setTeacherId('');
    }, [selectedChild]);

    useEffect(() => {
        if (selectedClass) {
            const classInfo = classes.find(c => c.id === parseInt(selectedClass));
            if (classInfo) setTeacherId(classInfo.teacher_id);
        } else {
            setTeacherId('');
        }
    }, [selectedClass]);

    useEffect(() => {
        if (teacherId && date) {
            api.get(`/teacher/${teacherId}/availability?date=${date}`).then(res => setAvailableSlots(res.data));
        } else {
            setAvailableSlots([]);
        }
        setSelectedSlot('');
    }, [teacherId, date]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const startTime = new Date(`${date}T00:00:00.000Z`);
        startTime.setUTCHours(selectedSlot);
        const payload = { teacherId, studentId: selectedChild, classId: selectedClass, startTime: startTime.toISOString() };
        try {
            await api.post('/meetings/schedule-by-parent', payload);
            setMessage('Meeting scheduled successfully!');
        } catch (error) {
            setMessage('Failed to schedule meeting.');
        }
    };

    return (
        <div className="card">
            <h3>Schedule a Meeting</h3>
            <form onSubmit={handleSubmit}>
                {message && <p className="success">{message}</p>}
                <div className="form-group">
                    <label>Select Child</label>
                    <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)} required>
                        <option value="">--Select Child--</option>
                        {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                {selectedChild && (
                    <div className="form-group">
                        <label>Select Class</label>
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} required>
                            <option value="">--Select Class--</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name} (Teacher: {c.teacher_name})</option>)}
                        </select>
                    </div>
                )}
                {selectedClass && (
                    <div className="form-group">
                        <label>Select Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                )}
                {date && (
                    <div className="form-group">
                        <label>Select Available Slot (1hr)</label>
                        <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} required>
                            <option value="">--Select Slot--</option>
                            {availableSlots.map(h => <option key={h} value={h}>{`${h}:00 - ${h + 1}:00`}</option>)}
                        </select>
                    </div>
                )}
                <button type="submit" disabled={!selectedSlot}>Schedule Meeting</button>
            </form>
        </div>
    );
};

export default ParentScheduleMeeting;
