import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div
            className={`sidebar ${isHovered ? 'expanded' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="sidebar-content">
                <div className="sidebar-header">
                    <span>FinLit</span>
                </div>
                <ul className="sidebar-nav">
                    <li>
                        <Link to="/dashboard">
                            <span className="icon">🏠</span>
                            <span className="label">Dashboard</span>
                        </Link>
                    </li>
                    {user.role === 'teacher' && (
                        <>
                            <li>
                                <Link to="/dashboard">
                                    <span className="icon">📚</span>
                                    <span className="label">Classes</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/meetings">
                                    <span className="icon">📅</span>
                                    <span className="label">Meetings</span>
                                </Link>
                            </li>
                        </>
                    )}
                    <li>
                        <Link to="/dashboard/account">
                            <span className="icon">👤</span>
                            <span className="label">Account</span>
                        </Link>
                    </li>
                </ul>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="button-logout-sidebar">
                        <span className="icon">🚪</span>
                        <span className="label">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
