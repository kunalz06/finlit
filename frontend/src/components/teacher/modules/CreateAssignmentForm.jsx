import React, { useState } from 'react';
import api from '../../../api/axios';

const CreateAssignmentForm = ({ moduleId, onCreated }) => {
    const [title, setTitle] = useState('');
    const [question_text, setQuestionText] = useState('');
    const [total_marks, setTotalMarks] = useState(10);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post(`/modules/${moduleId}/assignments`, { title, question_text, total_marks });
        onCreated();
    };

    return (
        <form onSubmit={handleSubmit} className="quiz-form">
            <div className="form-group">
                <label>Assignment Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Question/Description</label>
                <textarea value={question_text} onChange={e => setQuestionText(e.target.value)} required rows="3"></textarea>
            </div>
            <div className="form-group">
                <label>Total Marks</label>
                <input type="number" value={total_marks} onChange={e => setTotalMarks(e.target.value)} required />
            </div>
            <button type="submit">Create</button>
        </form>
    );
};

export default CreateAssignmentForm;
