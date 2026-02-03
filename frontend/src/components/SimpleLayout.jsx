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

    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-2xl"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (darkMode ? '✕' : '✕') : (darkMode ? '☰' : '☰')}
                    </button>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
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
                                    className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl hover:bg-blue-200 transition border border-blue-200"
                                    title="Go to Dashboard"
                                >
                                    {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                                </Link>
                                <button onClick={handleLogout} className={`px-5 py-2 rounded-xl text-lg font-bold transition ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-red-900 hover:text-red-300' : 'bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-700'}`}>
                                    Log Out
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className={`md:hidden absolute top-full left-0 w-full p-6 shadow-xl border-t ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-100 text-gray-900'} animate-fade-in z-40`}>
                        <div className="flex flex-col space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-gray-500">Theme</span>
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`p-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                                </button>
                            </div>

                            {!isLoggedIn ? (
                                <>
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full py-3 text-center text-lg font-bold border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                        Log In
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block w-full py-3 text-center bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 shadow-lg transition">
                                        Get Started
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center space-x-3 mb-4 px-4 py-2 bg-gray-50 rounded-xl dark:bg-gray-700">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                            {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                        </div>
                                    </div>
                                    <Link
                                        to={user.role === 'creator' ? '/creator-dashboard' : '/business-dashboard'}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block w-full py-3 text-center bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition"
                                    >
                                        Go to Dashboard
                                    </Link>
                                    <button
                                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                        className="block w-full py-3 text-center text-red-500 font-bold border border-red-100 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                    >
                                        Log Out
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto p-6 md:p-12">
                {children}
            </main>
        </div>
    );
};

export default SimpleLayout;
