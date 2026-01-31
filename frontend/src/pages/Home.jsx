import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const CREATOR_CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'tech', label: 'Tech' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'food', label: 'Food' },
    { value: 'travel', label: 'Travel' },
    { value: 'entertainment', label: 'Entertainment' },
];

const BUSINESS_CATEGORIES = [
    { value: 'all', label: 'All Industries' },
    { value: 'tech', label: 'Tech' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'food', label: 'Food' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'travel', label: 'Travel' },
    { value: 'entertainment', label: 'Entertainment' },
];

const FOLLOWER_RANGES = [
    { value: 'all', label: 'All Sizes', min: 0, max: Infinity },
    { value: 'nano', label: 'Nano (1K-10K)', min: 1000, max: 10000 },
    { value: 'micro', label: 'Micro (10K-100K)', min: 10000, max: 100000 },
    { value: 'macro', label: 'Macro (100K-1M)', min: 100000, max: 1000000 },
    { value: 'mega', label: 'Mega (1M+)', min: 1000000, max: Infinity },
];

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [creators, setCreators] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatorCategory, setCreatorCategory] = useState('all');
    const [businessCategory, setBusinessCategory] = useState('all');
    const [followerRange, setFollowerRange] = useState('all');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch { }
        }
        loadData();
    }, []);

    useEffect(() => {
        loadCreators();
    }, [creatorCategory]);

    useEffect(() => {
        loadBusinesses();
    }, [businessCategory]);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([loadCreators(), loadBusinesses()]);
        setLoading(false);
    };

    const loadCreators = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/creators/search?category=${creatorCategory}`);
            const data = await res.json();
            setCreators(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load creators:', err);
        }
    };

    const loadBusinesses = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/businesses/search?category=${businessCategory}`);
            const data = await res.json();
            setBusinesses(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load businesses:', err);
        }
    };

    // If not logged in, show landing page
    if (!user) {
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
    }

    // Logged in - show discovery
    return (
        <div className="space-y-12 animate-fade-in">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-3xl text-white">
                <h1 className="text-3xl font-black mb-2">Welcome back, {user.name}</h1>
                <p className="text-xl text-white/80">Discover {user.role === 'creator' ? 'businesses to partner with' : 'creators for your campaigns'}</p>
            </div>

            {/* For Creators - Show Businesses */}
            {user.role === 'creator' && (
                <section>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center mb-4 md:mb-0">
                            Discover Businesses
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {BUSINESS_CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    onClick={() => setBusinessCategory(cat.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${businessCategory === cat.value
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-2xl text-gray-400 animate-pulse">•••</p>
                        </div>
                    ) : businesses.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl">
                            <p className="text-2xl mb-2 text-gray-400">—</p>
                            <p className="text-gray-500">No businesses found in this category</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {businesses.map(biz => (
                                <div key={biz._id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100">
                                    <div className="flex items-center space-x-4 mb-4">
                                        {biz.logo_url ? (
                                            <img src={biz.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-2xl text-white font-bold">
                                                {biz.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-gray-900">{biz.name}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{biz.business_type || 'Business'}</p>
                                        </div>
                                    </div>
                                    {biz.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{biz.description}</p>
                                    )}
                                    <button
                                        onClick={() => navigate(`/business/${biz._id}`)}
                                        className="w-full py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition"
                                    >
                                        View Campaigns
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* For Businesses - Show Creators */}
            {user.role === 'business' && (
                <section>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center mb-4 md:mb-0">
                            <span className="text-2xl mr-3 text-purple-600 font-bold">C</span>
                            Discover Creators
                        </h2>
                        <div className="flex flex-wrap gap-2 items-center">
                            {/* Category Filter */}
                            {CREATOR_CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    onClick={() => setCreatorCategory(cat.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${creatorCategory === cat.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                            {/* Follower Range Filter */}
                            <select
                                value={followerRange}
                                onChange={e => setFollowerRange(e.target.value)}
                                className="px-3 py-1.5 rounded-lg text-sm font-bold bg-purple-100 text-purple-700 border-0 cursor-pointer"
                            >
                                {FOLLOWER_RANGES.map(range => (
                                    <option key={range.value} value={range.value}>{range.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-2xl text-gray-400 animate-pulse">•••</p>
                        </div>
                    ) : (() => {
                        // Apply follower range filter
                        const rangeConfig = FOLLOWER_RANGES.find(r => r.value === followerRange);
                        const filteredCreators = creators.filter(c => {
                            const followers = c.followers || 0;
                            return followers >= rangeConfig.min && followers <= rangeConfig.max;
                        });

                        return filteredCreators.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl">
                                <p className="text-2xl mb-2 text-gray-400">—</p>
                                <p className="text-gray-500">No creators found matching your filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCreators.map(creator => (
                                    <div key={creator._id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-2xl text-white font-bold">
                                                {creator.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{creator.name}</h3>
                                                <p className="text-sm text-gray-500">{creator.category || 'Creator'}</p>
                                            </div>
                                        </div>
                                        {creator.bio && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{creator.bio}</p>
                                        )}
                                        <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-xl">
                                            <div>
                                                <p className="text-xs text-gray-500">Followers</p>
                                                <p className="font-bold text-gray-800">
                                                    {creator.followers ? `${(creator.followers / 1000).toFixed(1)} K` : 'N/A'}
                                                </p>
                                            </div>
                                            {creator.social_links && Object.keys(creator.social_links).length > 0 && (
                                                <div className="flex space-x-1">
                                                    {creator.social_links.youtube && <span>📺</span>}
                                                    {creator.social_links.instagram && <span>📷</span>}
                                                    {creator.social_links.tiktok && <span className="text-xs text-gray-500">TikTok</span>}
                                                </div>
                                            )}
                                        </div>
                                        {/* Service Packages */}
                                        {creator.service_packages && creator.service_packages.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-500 mb-2">Services offered:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {creator.service_packages.slice(0, 3).map((pkg, i) => (
                                                        <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                                                            {pkg.name} • ${pkg.price}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => navigate(`/creator/${creator._id}`)}
                                            className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    })()}
                </section>
            )}
        </div>
    );
};

export default Home;
