import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import ModuleDetail from './ModuleDetail';

const ClassModules = ({ classId, onUpdate }) => {
    const [modules, setModules] = useState([]);
    const [showCreateModule, setShowCreateModule] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        api.get(`/classes/${classId}`).then(res => setModules(res.data.modules));
    }, [classId, onUpdate]);

    const handleCreateModule = async (e) => {
        e.preventDefault();
        await api.post(`/classes/${classId}/modules`, { title, description });
        setTitle('');
        setDescription('');
        setShowCreateModule(false);
        onUpdate();
    };

    return (
        <div>
            <h4>Modules</h4>
            <button onClick={() => setShowCreateModule(!showCreateModule)} className="button">
                {showCreateModule ? 'Cancel' : 'Add New Module'}
            </button>
            {showCreateModule && (
                <form onSubmit={handleCreateModule} className="card" style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                        <label>Module Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Module Description</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <button type="submit" className="button">Create Module</button>
                </form>
            )}
            <div>
                {modules.map(module => <ModuleDetail key={module.id} module={module} onUpdate={onUpdate} />)}
            </div>
        </div>
    );
};

export default ClassModules;
