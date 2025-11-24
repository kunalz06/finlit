import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import ProgressReport from '../../shared/ProgressReport';

const EnrolledStudents = ({ classId }) => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        api.get(`/classes/${classId}/students`).then(res => setStudents(res.data));
    }, [classId]);

    if (selectedStudent) {
        return <ProgressReport studentId={selectedStudent.id} onBack={() => setSelectedStudent(null)} />;
    }

    return (
        <div className="card">
            <h4>Enrolled Students</h4>
            <table>
                <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.id}>
                            <td>{s.name}</td>
                            <td>{s.email}</td>
                            <td><button onClick={() => setSelectedStudent(s)}>View Progress</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EnrolledStudents;
