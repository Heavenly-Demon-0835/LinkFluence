import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);

                // Smart Redirect Logic
                if (userData.role === 'business') {
                    navigate('/discover-creators');
                } else if (userData.role === 'creator') {
                    navigate('/discover-businesses');
                }
            } catch { }
        }
    }, [navigate]);

    // If logged in, we are redirecting, so show nothing or a loading spinner
    if (user) {
        return null;
    }

    // Guest - Show Landing Page
    return (
        <div className="text-center py-20 px-4 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight">
                Connect. Create. <span className="text-blue-600">Grow.</span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                The easiest way for creators to find sponsorships and for businesses to reach new audiences.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-2xl font-bold hover:bg-blue-700 shadow-xl transform hover:-translate-y-1 transition text-center">
                    Join Now →
                </Link>
                <Link to="/login" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-2xl text-2xl font-bold hover:bg-blue-50 shadow-md transition text-center">
                    Sign In
                </Link>
            </div>
        </div>
    );
};

export default Home;
