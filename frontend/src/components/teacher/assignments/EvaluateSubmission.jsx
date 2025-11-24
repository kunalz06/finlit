import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const EvaluateSubmission = ({ submission, onBack }) => {
    const [details, setDetails] = useState(null);
    const [evaluationData, setEvaluationData] = useState([]);
    const [message, setMessage] = useState('');

    const fetchDetails = () => {
        api.get(`/submissions/${submission.id}`).then(res => {
            setDetails(res.data);
            setEvaluationData(res.data.files);
        });
    };

    useEffect(() => {
        fetchDetails();
    }, [submission.id]);

    const handleInputChange = (fileId, field, value) => {
        setEvaluationData(prevData =>
            prevData.map(file =>
                file.id === fileId ? { ...file, [field]: value } : file
            )
        );
    };

    const handleSaveAll = async () => {
        setMessage('Updating...');
        try {
            for (const file of evaluationData) {
                await api.post(`/submission-files/${file.id}/evaluate`, {
                    marks_awarded: file.marks_awarded,
                    remarks: file.remarks,
                    submissionId: submission.id
                });
            }
            setMessage('Marks and remarks updated successfully!');
            setTimeout(() => setMessage(''), 3000);
            fetchDetails();
        } catch (error) {
            setMessage('Failed to update marks.');
        }
    };

    if (!details) return <p>Loading submission...</p>;

    return (
        <div className="card">
            <button onClick={onBack} className="button-link">&larr; Back to Submissions</button>
            <h3>Evaluating: {details.submission.student_name}</h3>
            <h4>Assignment: {details.submission.assignment_title}</h4>
            {evaluationData.map(file => (
                <div key={file.id} className="card">
                    <a href={`http://localhost:5000/${file.file_path.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                        View Submitted PDF
                    </a>
                    <div className="form-group">
                        <label>Marks Awarded (out of {details.submission.total_marks})</label>
                        <input type="number" value={file.marks_awarded || ''} onChange={e => handleInputChange(file.id, 'marks_awarded', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Remarks</label>
                        <textarea value={file.remarks || ''} onChange={e => handleInputChange(file.id, 'remarks', e.target.value)} rows="2"></textarea>
                    </div>
                </div>
            ))}
            <button onClick={handleSaveAll} className="button">Update Marks & Remarks</button>
            {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
        </div>
    );
};

export default EvaluateSubmission;
