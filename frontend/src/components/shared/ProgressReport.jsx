import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../../api/axios';
import PDFReportLayout from './PDFReportLayout';

const ProgressReport = ({ studentId, onBack }) => {
    const [reportData, setReportData] = useState(null);
    const [selectedClass, setSelectedClass] = useState('all');
    const pdfRef = useRef();

    useEffect(() => {
        api.get(`/progress-report-data/${studentId}`).then(res => setReportData(res.data));
    }, [studentId]);

    if (!reportData) return <div className="card">Loading progress...</div>;

    const filteredQuizAttempts = selectedClass === 'all' ? reportData.quiz_attempts : reportData.quiz_attempts.filter(a => a.class_id === parseInt(selectedClass));
    const filteredAssignmentScores = selectedClass === 'all' ? reportData.assignment_scores : reportData.assignment_scores.filter(a => a.class_id === parseInt(selectedClass));

    const totalCorrect = filteredQuizAttempts.reduce((sum, att) => sum + att.score, 0);
    const totalQuizQuestions = filteredQuizAttempts.reduce((sum, att) => sum + att.total_questions, 0);
    const quizPieData = [{ name: 'Correct', value: totalCorrect }, { name: 'Incorrect', value: totalQuizQuestions - totalCorrect }];

    const totalMarksObtained = filteredAssignmentScores.reduce((sum, att) => sum + parseFloat(att.score), 0);
    const totalMaxMarks = filteredAssignmentScores.reduce((sum, att) => sum + att.total_marks, 0);
    const assignmentPieData = [{ name: 'Obtained', value: totalMarksObtained }, { name: 'Lost', value: totalMaxMarks - totalMarksObtained }];

    const PIE_COLORS = { quizzes: ['#28a745', '#dc3545'], assignments: ['#007bff', '#6c757d'] };

    const downloadPdf = () => {
        const input = pdfRef.current;
        if (!input) return;
        html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`progress-report-${reportData.student.name}.pdf`);
        });
    };

    return (
        <div className="card">
            {onBack && <button onClick={onBack} className="button-link"> &larr; Back</button>}
            <h4>Progress Report for {reportData.student.name}</h4>
            <div className="form-group">
                <label>Filter by Class</label>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                    <option value="all">View All Classes</option>
                    {reportData.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap' }}>
                {totalQuizQuestions > 0 && (
                    <div style={{ width: '45%', textAlign: 'center' }}>
                        <h5>Quiz Performance</h5>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart><Pie data={quizPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{quizPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS.quizzes[index % PIE_COLORS.quizzes.length]} />))}</Pie><Tooltip /><Legend /></PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
                {totalMaxMarks > 0 && (
                    <div style={{ width: '45%', textAlign: 'center' }}>
                        <h5>Assignment Performance</h5>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart><Pie data={assignmentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{assignmentPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS.assignments[index % PIE_COLORS.assignments.length]} />))}</Pie><Tooltip /><Legend /></PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <h5>Quiz Attempts</h5>
            <table><thead><tr><th>Class</th><th>Quiz</th><th>Score</th><th>Date</th></tr></thead><tbody>{filteredQuizAttempts.map((p, i) => (<tr key={`q${i}`}><td>{p.class_name}</td><td>{p.quiz_title}</td><td>{p.score} / {p.total_questions}</td><td>{new Date(p.attempted_at).toLocaleDateString()}</td></tr>))}</tbody></table>
            <h5>Assignment Scores</h5>
            <table><thead><tr><th>Class</th><th>Assignment</th><th>Score</th></tr></thead><tbody>{filteredAssignmentScores.map((p, i) => (<tr key={`a${i}`}><td>{p.class_name}</td><td>{p.assignment_title}</td><td>{p.score} / {p.total_marks}</td></tr>))}</tbody></table>
            <button onClick={downloadPdf} disabled={filteredQuizAttempts.length === 0 && filteredAssignmentScores.length === 0}>Download as PDF</button>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: -1000, opacity: 0, pointerEvents: 'none' }}>
                <div ref={pdfRef}>
                    <PDFReportLayout reportData={reportData} filteredQuizAttempts={filteredQuizAttempts} filteredAssignmentScores={filteredAssignmentScores} pieData={{ quiz: quizPieData, assignment: assignmentPieData }} />
                </div>
            </div>
        </div>
    );
};

export default ProgressReport;
