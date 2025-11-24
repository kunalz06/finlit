import React, { useState } from 'react';
import api from '../../api/axios';

const CreateClassForm = ({ onClassCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/classes', { name, description });
            setMessage('Class created successfully!');
            setName('');
            setDescription('');
            onClassCreated();
        } catch (error) {
            setMessage('Failed to create class.');
        }
    };

    return (
        <div className="card">
            <h3>Create New Class</h3>
            <form onSubmit={handleSubmit}>
                {message && <p className="success">{message}</p>}
                <div className="form-group">
                    <label>Class Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3"></textarea>
                </div>
                <button type="submit" className="button">Create Class</button>
            </form>
        </div>
    );
};

export default CreateClassForm;
