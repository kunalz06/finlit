import React, { useState } from 'react';
import api from '../../api/axios';

const ConnectChildForm = ({ onConnect }) => {
    const [studentCode, setStudentCode] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.post('/parent/connect', { studentCode });
            setMessage('Successfully connected!');
            setStudentCode('');
            onConnect();
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to connect.");
        }
    };

    return (
        <div className="card">
            <h3>Connect to your Child</h3>
            <p>Enter the unique Student ID provided to your child.</p>
            <form onSubmit={handleSubmit}>
                {message && <p className={message.includes('Success') ? 'success' : 'error'}>{message}</p>}
                <div className="form-group">
                    <label>Student ID</label>
                    <input type="text" value={studentCode} onChange={e => setStudentCode(e.target.value)} />
                </div>
                <button type="submit">Connect</button>
            </form>
        </div>
    );
};

export default ConnectChildForm;
