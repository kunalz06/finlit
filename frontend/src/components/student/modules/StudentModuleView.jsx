import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import AttemptQuiz from '../quizzes/AttemptQuiz';
import SubmitAssignment from '../assignments/SubmitAssignment';

const StudentModuleView = ({ module }) => {
    const { user } = useAuth();
    const [details, setDetails] = useState({ materials: [], quizzes: [], assignments: [] });
    const [progress, setProgress] = useState({ quiz_attempts: [], assignment_scores: [] });
    const [view, setView] = useState('list');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchModuleData = api.get(`/modules/${module.id}`);
        const fetchProgressData = api.get(`/progress-report-data/${user.id}`);
        Promise.all([fetchModuleData, fetchProgressData]).then(([moduleRes, progressRes]) => {
            setDetails(moduleRes.data);
            setProgress(progressRes.data);
        });
    }, [module.id, user.id]);

    if (view === 'attempt_quiz') return <AttemptQuiz quizId={selectedItem.id} onBack={() => setView('list')} />;
    if (view === 'submit_assignment') return <SubmitAssignment assignment={selectedItem} onBack={() => { setView('list'); /* Consider a more targeted refresh */ }} />;

    const isQuizCompleted = (quizId) => progress.quiz_attempts.some(att => att.quiz_id === quizId);
    const isAssignmentSubmitted = (assignmentId) => progress.assignment_scores.some(att => att.assignment_id === assignmentId);

    return (
        <div className="card module-card">
            <h5>{module.title}</h5>

            <h6>Materials</h6>
            <div className="module-item-list">
                {details.materials.map(m => (
                    <div key={m.id} className="module-item module-item-pdf">
                        <span className="module-item-icon">📄</span>
                        <div className="module-item-content"><span>{m.title}</span></div>
                        <div className="module-item-actions"><a href={`http://localhost:5000/${m.file_path.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="button">View</a></div>
                    </div>
                ))}
            </div>

            <h6 style={{ marginTop: '2rem' }}>Quizzes</h6>
            <div className="module-item-list">
                {details.quizzes.map(q => (
                    <div key={q.id} className="module-item module-item-quiz">
                        <span className="module-item-icon">❓</span>
                        <div className="module-item-content"><span>{q.title}</span></div>
                        <div className="module-item-actions">
                            {isQuizCompleted(q.id) ? (<span className="status-badge">Completed</span>) : (<button onClick={() => { setSelectedItem(q); setView('attempt_quiz'); }}>Attempt</button>)}
                        </div>
                    </div>
                ))}
            </div>

            <h6 style={{ marginTop: '2rem' }}>Assignments</h6>
            <div className="module-item-list">
                {details.assignments.map(a => (
                    <div key={a.id} className="module-item module-item-assignment">
                        <span className="module-item-icon">✍️</span>
                        <div className="module-item-content">
                            <span>{a.title}</span>
                            <p>{a.total_marks} Marks</p>
                        </div>
                        <div className="module-item-actions">
                            {isAssignmentSubmitted(a.id) ? (<span className="status-badge">Completed</span>) : (<button onClick={() => { setSelectedItem(a); setView('submit_assignment'); }}>Submit</button>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentModuleView;
