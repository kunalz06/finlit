import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import EvaluateSubmission from './EvaluateSubmission';

const AssignmentSubmissionsList = ({ assignment, onBack }) => {
    const [submissions, setSubmissions] = useState([]);
    const [evaluating, setEvaluating] = useState(null);

    useEffect(() => {
        api.get(`/assignments/${assignment.id}/submissions`).then(res => setSubmissions(res.data));
    }, [assignment.id]);

    if (evaluating) {
        return <EvaluateSubmission submission={evaluating} onBack={() => { setEvaluating(null); api.get(`/assignments/${assignment.id}/submissions`).then(res => setSubmissions(res.data)); }} />;
    }

    return (
        <div className="card">
            <button onClick={onBack} className="button-link">&larr; Back to Module</button>
            <h3>Submissions for {assignment.title}</h3>
            <table>
                <thead>
                    <tr><th>Student</th><th>Submitted At</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {submissions.map(s => (
                        <tr key={s.id}>
                            <td>{s.student_name}</td>
                            <td>{new Date(s.submitted_at).toLocaleString()}</td>
                            <td>{s.is_evaluated ? 'Evaluated' : 'Pending'}</td>
                            <td><button onClick={() => setEvaluating(s)}>View & Evaluate</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssignmentSubmissionsList;
