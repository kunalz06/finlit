import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AccountSettings = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
            if (user.profile_image) {
                setPreview(`http://localhost:5000/${user.profile_image.replace(/\\/g, '/')}`);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setProfileImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        if (formData.password) data.append('password', formData.password);
        if (profileImage) data.append('profile_image', profileImage);

        try {
            const res = await api.put('/user/me', data);
            setMessage('Profile updated successfully!');
            updateUser(res.data);
        } catch (error) {
            setMessage('Failed to update profile.');
        }
    };

    return (
        <div className="card">
            <h2>Account Settings</h2>
            <form onSubmit={handleSubmit} className="account-form">
                <div className="profile-image-section">
                    <div className="image-preview" style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', background: '#eee', marginBottom: '1rem' }}>
                        {preview ? <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>No Image</span>}
                    </div>
                    <input type="file" onChange={handleImageChange} accept="image/*" />
                </div>

                {user && user.role === 'student' && (
                    <div className="form-group">
                        <label>Student Code (Share with Parent)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="text" value={user.student_code || ''} readOnly style={{ background: '#f3f4f6', cursor: 'default' }} />
                            <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(user.student_code)}
                                style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                title="Copy to clipboard"
                            >
                                📋
                            </button>
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>New Password (leave blank to keep current)</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                </div>
                {message && <p className={message.includes('Success') ? 'success' : 'error'}>{message}</p>}
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
};

export default AccountSettings;
