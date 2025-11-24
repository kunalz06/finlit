import React, { useState } from 'react';
import ProgressReport from '../shared/ProgressReport';

const ParentChildrenList = ({ children }) => {
    const [selectedChild, setSelectedChild] = useState(null);

    if (selectedChild) {
        return <ProgressReport studentId={selectedChild.id} onBack={() => setSelectedChild(null)} />;
    }

    return (
        <div className="card">
            <h3>Connected Children</h3>
            <table>
                <thead><tr><th>Name</th><th>Student ID</th><th>Actions</th></tr></thead>
                <tbody>
                    {children.map(c => (
                        <tr key={c.id}>
                            <td>{c.name}</td>
                            <td>{c.student_code}</td>
                            <td><button onClick={() => setSelectedChild(c)}>View Progress</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ParentChildrenList;
