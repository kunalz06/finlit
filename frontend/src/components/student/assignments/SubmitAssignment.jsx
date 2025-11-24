import React, { useState } from 'react';
import api from '../../../api/axios';

const SubmitAssignment = ({ assignment, onBack }) => {
    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (files.length === 0) {
            setMessage('Please select at least one file.');
            return;
        }
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        try {
            await api.post(`/assignments/${assignment.id}/submit`, formData);
            setMessage('Submitted successfully!');
            setTimeout(onBack, 1500);
        } catch (error) {
            setMessage('Submission failed. You may have already submitted this assignment.');
        }
    };

    return (
        <div className="card">
            <button onClick={onBack} className="button-link">&larr; Back</button>
            <h3>{assignment.title}</h3>
            <p>{assignment.question_text}</p>
            <p><strong>Total Marks: {assignment.total_marks}</strong></p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Upload your answer (PDFs only)</label>
                    <input type="file" multiple onChange={e => setFiles(e.target.files)} accept=".pdf" />
                </div>
                {message && <p>{message}</p>}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default SubmitAssignment;
