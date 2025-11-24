import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PDFReportLayout = ({ reportData, filteredQuizAttempts, filteredAssignmentScores, pieData }) => {
    if (!reportData) return null;
    const { student, parents, classes } = reportData;
    const currentClassId = filteredQuizAttempts[0]?.class_id || filteredAssignmentScores[0]?.class_id;
    const currentClass = classes.find(c => c.id === currentClassId) || { name: 'All Classes', teacher_name: 'N/A' };
    const BAR_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];
    const PIE_COLORS = { quizzes: ['#28a745', '#dc3545'], assignments: ['#007bff', '#6c757d'] };

    const dataForBarChart = [...filteredQuizAttempts, ...filteredAssignmentScores].map((att, index) => ({ name: `Task ${index + 1}`, Score: att.score, 'Max Score': att.total_questions || att.total_marks }));

    const parentNames = parents && parents.length > 0 ? parents.map(p => p.name).join(', ') : 'Not Connected';
    const profileImageUrl = student.profile_image ? `http://localhost:5000/${student.profile_image.replace(/\\/g, '/')}` : null;

    return (
        <div style={{ padding: '40px', background: 'white', color: 'black', fontFamily: 'sans-serif', width: '800px' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>FINLIT ACADEMY - STUDENT PROGRESS REPORT</h2>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', margin: '20px 0' }}>
                {profileImageUrl && (
                    <div style={{ flexShrink: 0 }}>
                        <img src={profileImageUrl} alt={student.name} crossOrigin="anonymous" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #007bff' }} />
                    </div>
                )}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                    <div><strong>Student:</strong> {student.name}</div>
                    <div><strong>Class:</strong> {currentClass.name}</div>
                    <div><strong>Teacher:</strong> {currentClass.teacher_name}</div>
                    <div><strong>Parent(s):</strong> {parentNames}</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', marginTop: '30px' }}>
                {pieData.quiz.some(d => d.value > 0) && (
                    <div style={{ width: '45%', textAlign: 'center' }}>
                        <h5>Quiz Performance</h5>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart><Pie data={pieData.quiz} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{pieData.quiz.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS.quizzes[index % PIE_COLORS.quizzes.length]} />))}</Pie><Tooltip /><Legend /></PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
                {pieData.assignment.some(d => d.value > 0) && (
                    <div style={{ width: '45%', textAlign: 'center' }}>
                        <h5>Assignment Performance</h5>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart><Pie data={pieData.assignment} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{pieData.assignment.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS.assignments[index % PIE_COLORS.assignments.length]} />))}</Pie><Tooltip /><Legend /></PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <h3 style={{ textAlign: 'center', marginTop: '40px' }}>Individual Task Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataForBarChart} margin={{ top: 20, right: 30, left: 0, bottom: 5, }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Score" fill="#8884d8">{dataForBarChart.map((entry, index) => (<Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />))}</Bar></BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PDFReportLayout;
