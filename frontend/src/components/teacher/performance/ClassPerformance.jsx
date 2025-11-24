import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../../api/axios';

const ClassPerformance = ({ classId }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get(`/classes/${classId}/performance`).then(res => setData(res.data));
    }, [classId]);

    if (!data) return <p>Loading performance data...</p>;

    const { students, quizData, assignmentData } = data;

    const studentPerformance = students.map(student => {
        const quizzes = quizData.filter(d => d.student_id === student.id);
        const assignments = assignmentData.filter(d => d.student_id === student.id);
        const totalQuizScore = quizzes.reduce((acc, curr) => acc + curr.score, 0);
        const maxQuizScore = quizzes.reduce((acc, curr) => acc + curr.total_questions, 0);
        const totalAssignmentScore = assignments.reduce((acc, curr) => acc + (curr.marks_awarded || 0), 0);
        const maxAssignmentScore = assignments.reduce((acc, curr) => acc + curr.total_marks, 0);
        const totalScore = totalQuizScore + totalAssignmentScore;
        const maxScore = maxQuizScore + maxAssignmentScore;
        const avg = maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(2) : 0;
        return { name: student.name, average: parseFloat(avg) };
    });

    const dist = { '0-40%': 0, '41-60%': 0, '61-80%': 0, '81-100%': 0 };
    studentPerformance.forEach(s => {
        if (s.average <= 40) dist['0-40%']++;
        else if (s.average <= 60) dist['41-60%']++;
        else if (s.average <= 80) dist['61-80%']++;
        else dist['81-100%']++;
    });
    const chartData = Object.entries(dist).map(([name, value]) => ({ name, students: value }));

    return (
        <div className="card">
            <h4>Overall Class Performance</h4>
            <p>Distribution of student average scores across all quizzes and assignments.</p>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="students" fill="#28a745" />
                </BarChart>
            </ResponsiveContainer>
            <h5>Student Averages</h5>
            <table>
                <thead><tr><th>Student</th><th>Average Score (%)</th></tr></thead>
                <tbody>
                    {studentPerformance.sort((a, b) => b.average - a.average).map(s => <tr key={s.name}><td>{s.name}</td><td>{s.average}</td></tr>)}
                </tbody>
            </table>
        </div>
    );
};

export default ClassPerformance;
