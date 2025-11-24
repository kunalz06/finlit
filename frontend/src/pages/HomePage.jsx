import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const { isAuthenticated } = useAuth();
    return (
        <div className="page-center">
            <h1>Welcome to Finlit Academy</h1>
            <p>Your journey to financial literacy starts here.</p>
            {isAuthenticated ? (
                <Link to="/dashboard" className="button">Go to Dashboard</Link>
            ) : (
                <div>
                    <Link to="/login" className="button">Login</Link>
                    <Link to="/register" className="button">Register</Link>
                </div>
            )}
        </div>
    );
};

export default HomePage;
