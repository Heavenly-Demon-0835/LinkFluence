import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SimpleLayout = ({ children }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isLoggedIn = !!user.user_id;

    // Dark mode state with localStorage persistence
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Top Navigation Bar */}
            <nav className={`shadow-md py-4 px-6 md:px-12 sticky top-0 z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="text-3xl font-black text-blue-600 hover:text-blue-700 transition">
                        Linkfluence
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        {!isLoggedIn ? (
                            <>
                                <Link to="/login" className={`text-lg font-bold transition ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}>
                                    Log In
                                </Link>
                                <Link to="/register" className="bg-blue-600 text-white px-6 py-2 rounded-full text-lg font-bold hover:bg-blue-700 shadow-lg transition">
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to={user.role === 'creator' ? '/creator-dashboard' : '/business-dashboard'}
                                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
                                >
                                    <span className="text-xl">👤</span>
                                    <span className="hidden md:block">Dashboard</span>
                                </Link>
                                <button onClick={handleLogout} className={`px-5 py-2 rounded-xl text-lg font-bold transition ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-red-900 hover:text-red-300' : 'bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-700'}`}>
                                    Log Out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto p-6 md:p-12">
                {children}
            </main>
        </div>
    );
};

export default SimpleLayout;
