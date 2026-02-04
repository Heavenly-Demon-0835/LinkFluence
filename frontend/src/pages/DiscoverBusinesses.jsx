import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const CATEGORIES = [
    { value: 'all', label: '🌟 All Categories' },
    { value: 'tech', label: '🖥️ Tech & Electronics' },
    { value: 'fashion', label: '👗 Fashion & Apparel' },
    { value: 'food', label: '🍔 Food & Beverage' },
    { value: 'beauty', label: '💄 Beauty & Cosmetics' },
    { value: 'fitness', label: '💪 Health & Fitness' },
    { value: 'travel', label: '✈️ Travel & Hospitality' },
    { value: 'entertainment', label: '🎬 Entertainment & Media' },
    { value: 'finance', label: '💰 Finance & Banking' },
    { value: 'other', label: '🏢 Other' },
];

const DiscoverBusinesses = () => {
    const navigate = useNavigate();
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        // Check auth
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.user_id || user.role !== 'creator') {
            navigate('/login');
            return;
        }
        loadBusinesses();
    }, [category, debouncedSearch]);

    const loadBusinesses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category && category !== 'all') {
                params.append('category', category);
            }
            if (debouncedSearch.trim()) {
                params.append('q', debouncedSearch.trim());
            }
            const res = await fetch(`${API_BASE}/api/businesses/search?${params.toString()}`);
            const data = await res.json();
            setBusinesses(data);
        } catch (err) {
            console.error('Failed to load businesses:', err);
        }
        setLoading(false);
    };

    const getTypeEmoji = (type) => {
        const emojis = {
            'tech': '🖥️', 'fashion': '👗', 'food': '🍔', 'beauty': '💄',
            'fitness': '💪', 'travel': '✈️', 'entertainment': '🎬',
            'finance': '💰', 'other': '🏢'
        };
        return emojis[type] || '🏢';
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-8 rounded-3xl text-white">
                <button
                    onClick={() => navigate('/creator-dashboard')}
                    className="text-white/80 hover:text-white mb-4 flex items-center"
                >
                    ← Back to Dashboard
                </button>
                <h1 className="text-4xl font-black mb-2">🏢 Discover Businesses</h1>
                <p className="text-xl text-white/80 mb-4">Find brands looking for creators like you</p>

                {/* Search Bar */}
                <div className="relative max-w-xl">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, industry, description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/20 backdrop-blur text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🏷️ Filter by Industry</h3>
                <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`px-4 py-2 rounded-xl font-bold transition ${category === cat.value
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Businesses Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4 animate-pulse">⏳</div>
                    <p className="text-xl text-gray-500">Loading businesses...</p>
                </div>
            ) : businesses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl">
                    <div className="text-6xl mb-4">👀</div>
                    <p className="text-xl text-gray-600 mb-2">No businesses found</p>
                    <p className="text-gray-400">Try selecting a different category</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.map(business => (
                        <div key={business._id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100">
                            {/* Banner */}
                            {business.banner_url ? (
                                <div className="h-24 rounded-xl mb-4 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${business.banner_url})` }} />
                            ) : (
                                <div className="h-24 rounded-xl mb-4 bg-gradient-to-r from-green-400 to-teal-500" />
                            )}

                            <div className="flex items-center space-x-4 mb-4 -mt-10 px-2">
                                {business.logo_url ? (
                                    <img src={business.logo_url} alt="" className="w-16 h-16 rounded-xl border-4 border-white shadow-md object-cover" />
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl">
                                        {getTypeEmoji(business.business_type)}
                                    </div>
                                )}
                                <div className="flex-1 pt-8">
                                    <h3 className="text-xl font-bold text-gray-900">{business.name}</h3>
                                    <p className="text-sm text-gray-500 capitalize">{business.business_type || 'Business'}</p>
                                </div>
                            </div>

                            {business.description && (
                                <p className="text-gray-600 mb-4 line-clamp-2">{business.description}</p>
                            )}

                            <button
                                onClick={() => navigate(`/business/${business._id}`)}
                                className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition"
                            >
                                View Campaigns
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DiscoverBusinesses;
