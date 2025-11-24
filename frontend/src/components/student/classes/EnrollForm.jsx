import React, { useState } from 'react';
import api from '../../../api/axios';

const EnrollForm = ({ onEnroll }) => {
    const [classCode, setClassCode] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.post('/enroll', { classCode });
            setClassCode('');
            onEnroll();
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to enroll.");
        }
    };

    return (
        <div className="card">
            <h3>Enroll in a New Class</h3>
            <form onSubmit={handleSubmit}>
                {message && <p className={message.includes('Failed') ? 'error' : 'success'}>{message}</p>}
                <div className="form-group">
                    <label>Enter Class Code</label>
                    <input type="text" value={classCode} onChange={e => setClassCode(e.target.value)} required />
                </div>
                <button type="submit">Enroll</button>
            </form>
        </div>
    );
};

export default EnrollForm;
