import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    return (
        <header className="app-header">
            <h1>Finlit Academy</h1>
            {user && (
                <div className="header-user-info">
                    <span>Welcome, {user.name} ({user.role})</span>
                    <button onClick={logout} className="button-logout">Logout</button>
                </div>
            )}
        </header>
    );
};

export default Header;
