import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'tech', label: 'Tech & Gaming' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'fashion', label: 'Fashion & Beauty' },
    { value: 'fitness', label: 'Health & Fitness' },
    { value: 'food', label: 'Food & Cooking' },
    { value: 'travel', label: 'Travel' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'education', label: 'Education' },
];

const DiscoverCreators = () => {
    const navigate = useNavigate();
    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');

    useEffect(() => {
        // Check auth
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.user_id || user.role !== 'business') {
            navigate('/login');
            return;
        }
        loadCreators();
    }, [category]);

    const loadCreators = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/creators/search?category=${category}`);
            const data = await res.json();
            setCreators(data);
        } catch (err) {
            console.error('Failed to load creators:', err);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-3xl text-white">
                <button
                    onClick={() => navigate('/business-dashboard')}
                    className="text-white/80 hover:text-white mb-4 flex items-center"
                >
                    ← Back to Dashboard
                </button>
                <h1 className="text-4xl font-black mb-2">Discover Creators</h1>
                <p className="text-xl text-white/80">Find the perfect creators for your campaigns</p>
            </div>

            {/* Category Filter */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Filter by Category</h3>
                <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`px-4 py-2 rounded-xl font-bold transition ${category === cat.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Creators Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="text-3xl mb-4 animate-pulse text-gray-400">•••</div>
                    <p className="text-xl text-gray-500">Loading creators...</p>
                </div>
            ) : creators.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl">
                    <div className="text-2xl mb-4 text-gray-400">—</div>
                    <p className="text-xl text-gray-600 mb-2">No creators found</p>
                    <p className="text-gray-400">Try selecting a different category</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creators.map(creator => (
                        <div key={creator._id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-2xl text-white font-bold">
                                    {creator.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900">{creator.name}</h3>
                                    <p className="text-sm text-gray-500">{creator.category || 'Creator'}</p>
                                </div>
                            </div>

                            {creator.bio && (
                                <p className="text-gray-600 mb-4 line-clamp-2">{creator.bio}</p>
                            )}

                            <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-500">Followers</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {creator.followers ? `${(creator.followers / 1000).toFixed(1)}K` : 'N/A'}
                                    </p>
                                </div>
                                {creator.social_links && Object.keys(creator.social_links).length > 0 && (
                                    <div className="flex space-x-2">
                                        {creator.social_links.youtube && <span className="text-2xl">📺</span>}
                                        {creator.social_links.instagram && <span className="text-2xl">📷</span>}
                                        {creator.social_links.tiktok && <span className="text-xs text-gray-500">TikTok</span>}
                                        {creator.social_links.twitter && <span className="text-2xl">🐦</span>}
                                    </div>
                                )}
                            </div>

                            <button className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition">
                                View Profile
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DiscoverCreators;
