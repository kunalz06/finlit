import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const AttemptQuiz = ({ quizId, onBack }) => {
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    useEffect(() => {
        api.get(`/quizzes/${quizId}`).then(res => setQuiz(res.data));
    }, [quizId]);

    const handleAnswerChange = (qId, oId) => {
        const current = answers[qId] || [];
        const newAnswers = current.includes(oId) ? current.filter(id => id !== oId) : [...current, oId];
        setAnswers({ ...answers, [qId]: newAnswers });
    };

    const handleSubmit = async () => {
        const res = await api.post(`/quizzes/${quizId}/submit`, { answers });
        setResult(res.data);
    };

    if (result) {
        return (
            <div className="card">
                <h3>Quiz Result</h3>
                <p>You scored: {result.score} / {result.totalQuestions}</p>
                <h4>Review Your Answers</h4>
                {result.review.map(q => (
                    <div key={q.question_id} className="question-block" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <p><strong>{q.question_text}</strong></p>
                        <ul style={{ listStyle: 'none', paddingLeft: '1rem' }}>
                            {q.options.map((opt, i) => (
                                <li key={i} style={{ color: opt.is_correct ? 'green' : 'inherit' }}>
                                    {opt.text}
                                    {opt.is_correct && opt.remark &&
                                        <p style={{ color: '#555', fontStyle: 'italic', fontSize: '0.9em', margin: '5px 0 0 10px' }}>
                                            <strong>Explanation:</strong> {opt.remark}
                                        </p>
                                    }
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
                <button onClick={onBack}>Back to Module</button>
            </div>
        );
    }

    if (!quiz) return <div className="card"><p>Loading quiz...</p></div>;

    return (
        <div className="card">
            <button onClick={onBack} className="button-link">&larr; Back</button>
            <h3>{quiz.title}</h3>
            {quiz.questions.map(q => (
                <div key={q.id} className="question-block">
                    <p><strong>{q.text}</strong></p>
                    {q.options.map(opt => (
                        <div key={opt.id} className="option-block">
                            <input type="checkbox" id={`q${q.id}-o${opt.id}`} onChange={() => handleAnswerChange(q.id, opt.id)} />
                            <label htmlFor={`q${q.id}-o${opt.id}`}>{opt.text}</label>
                        </div>
                    ))}
                </div>
            ))}
            <button onClick={handleSubmit}>Submit Quiz</button>
        </div>
    );
};

export default AttemptQuiz;
