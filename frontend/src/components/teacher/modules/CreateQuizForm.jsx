import React, { useState } from 'react';
import api from '../../../api/axios';

const CreateQuizForm = ({ moduleId, onQuizCreated }) => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([{ text: '', options: [{ text: '', is_correct: false, remark: '' }] }]);

    const handleQuestionChange = (qIndex, value) => {
        const newQ = [...questions];
        newQ[qIndex].text = value;
        setQuestions(newQ);
    };

    const handleOptionChange = (qIndex, oIndex, field, value) => {
        const newQ = [...questions];
        newQ[qIndex].options[oIndex][field] = value;
        setQuestions(newQ);
    };

    const addQuestion = () => setQuestions([...questions, { text: '', options: [{ text: '', is_correct: false, remark: '' }] }]);

    const addOption = (qIndex) => {
        const newQ = [...questions];
        newQ[qIndex].options.push({ text: '', is_correct: false, remark: '' });
        setQuestions(newQ);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post(`/modules/${moduleId}/quizzes`, { title, questions });
        onQuizCreated();
    };

    return (
        <form onSubmit={handleSubmit} className="quiz-form">
            <div className="form-group">
                <label>Quiz Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            {questions.map((q, qIndex) => (
                <div key={qIndex} className="question-block">
                    <label>Question {qIndex + 1}</label>
                    <input type="text" value={q.text} onChange={e => handleQuestionChange(qIndex, e.target.value)} required />
                    {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="option-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderTop: '1px dashed #ccc', paddingTop: '10px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <input type="text" placeholder={`Option ${oIndex + 1}`} value={opt.text} onChange={e => handleOptionChange(qIndex, oIndex, 'text', e.target.value)} required />
                                <input type="checkbox" checked={opt.is_correct} onChange={e => handleOptionChange(qIndex, oIndex, 'is_correct', e.target.checked)} />
                                <label>Correct</label>
                            </div>
                            <input type="text" placeholder="Remark for correct answer (optional)" value={opt.remark} onChange={e => handleOptionChange(qIndex, oIndex, 'remark', e.target.value)} style={{ marginTop: '5px', width: '95%' }} />
                        </div>
                    ))}
                    <button type="button" onClick={() => addOption(qIndex)}>Add Option</button>
                </div>
            ))}
            <button type="button" onClick={addQuestion}>Add Question</button>
            <button type="submit">Create Quiz</button>
        </form>
    );
};

export default CreateQuizForm;
