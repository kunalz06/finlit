import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import CreateQuizForm from './CreateQuizForm';
import CreateAssignmentForm from './CreateAssignmentForm';
import AssignmentSubmissionsList from '../assignments/AssignmentSubmissionsList';

import Modal from '../../shared/Modal';

const ModuleDetail = ({ module, onUpdate }) => {
    const [details, setDetails] = useState({ materials: [], quizzes: [], assignments: [] });
    const [showUploadPdf, setShowUploadPdf] = useState(false);
    const [showCreateQuiz, setShowCreateQuiz] = useState(false);
    const [showCreateAssignment, setShowCreateAssignment] = useState(false);
    const [pdfTitle, setPdfTitle] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState(null);

    useEffect(() => {
        api.get(`/modules/${module.id}`).then(res => setDetails(res.data));
    }, [module.id, onUpdate]);

    const handlePdfUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', pdfTitle);
        formData.append('pdf', pdfFile);
        await api.post(`/modules/${module.id}/materials`, formData);
        setPdfTitle('');
        setPdfFile(null);
        setShowUploadPdf(false);
        onUpdate();
    };

    const handleDeleteMaterial = async (id) => {
        if (window.confirm('Are you sure you want to delete this PDF?')) {
            await api.delete(`/materials/${id}`);
            onUpdate();
        }
    };

    const handleDeleteQuiz = async (id) => {
        if (window.confirm('Are you sure? This will delete all student attempts too.')) {
            await api.delete(`/quizzes/${id}`);
            onUpdate();
        }
    };

    if (viewingSubmissionsFor) {
        return <AssignmentSubmissionsList assignment={viewingSubmissionsFor} onBack={() => setViewingSubmissionsFor(null)} />;
    }

    return (
        <div className="card module-card">
            <h5>{module.title}</h5>
            <div className="module-content" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div>
                    <h6>PDFs</h6>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {details.materials.map(m => (
                            <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                {m.title}
                                <button onClick={() => handleDeleteMaterial(m.id)} className="button-logout" style={{ padding: '0.2rem 0.5rem' }}>Delete</button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setShowUploadPdf(true)}>Upload PDF</button>

                    <Modal isOpen={showUploadPdf} onClose={() => setShowUploadPdf(false)} title="Upload PDF Material">
                        <form onSubmit={handlePdfUpload}>
                            <div className="form-group">
                                <label>PDF Title</label>
                                <input type="text" value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>File</label>
                                <input type="file" onChange={e => setPdfFile(e.target.files[0])} accept=".pdf" required />
                            </div>
                            <button type="submit">Upload</button>
                        </form>
                    </Modal>
                </div>
                <div>
                    <h6>Quizzes</h6>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {details.quizzes.map(q => (
                            <li key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                {q.title}
                                <button onClick={() => handleDeleteQuiz(q.id)} className="button-logout" style={{ padding: '0.2rem 0.5rem' }}>Delete</button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setShowCreateQuiz(true)}>Create Quiz</button>

                    <Modal isOpen={showCreateQuiz} onClose={() => setShowCreateQuiz(false)} title="Create New Quiz">
                        <CreateQuizForm moduleId={module.id} onQuizCreated={() => { setShowCreateQuiz(false); onUpdate(); }} />
                    </Modal>
                </div>
                <div>
                    <h6>Assignments</h6>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {details.assignments.map(a => (
                            <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                {a.title}
                                <button onClick={() => setViewingSubmissionsFor(a)} style={{ padding: '0.2rem 0.5rem' }}>Submissions</button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setShowCreateAssignment(true)}>Create Assignment</button>

                    <Modal isOpen={showCreateAssignment} onClose={() => setShowCreateAssignment(false)} title="Create New Assignment">
                        <CreateAssignmentForm moduleId={module.id} onCreated={() => { setShowCreateAssignment(false); onUpdate(); }} />
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default ModuleDetail;
