import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import StarRating from '../components/StarRating';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const DiscoverCreators = () => {
    const navigate = useNavigate();
    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState({
        category: 'all',
        followerTier: 'all',
        platforms: [],
        minPrice: '',
        maxPrice: ''
    });

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
        if (!user.user_id || user.role !== 'business') {
            navigate('/login');
            return;
        }
        loadCreators();
    }, [filters, debouncedSearch]);

    const loadCreators = async () => {
        setLoading(true);
        try {
            // Build query string
            const params = new URLSearchParams();
            if (filters.category && filters.category !== 'all') {
                params.append('category', filters.category);
            }
            if (filters.followerTier && filters.followerTier !== 'all') {
                params.append('follower_tier', filters.followerTier);
            }
            if (filters.platforms && filters.platforms.length > 0) {
                params.append('platforms', filters.platforms.join(','));
            }
            if (filters.minPrice) {
                params.append('min_price', filters.minPrice);
            }
            if (filters.maxPrice) {
                params.append('max_price', filters.maxPrice);
            }
            if (debouncedSearch.trim()) {
                params.append('q', debouncedSearch.trim());
            }

            const res = await fetch(`${API_BASE}/api/creators/search?${params.toString()}`);
            const data = await res.json();
            setCreators(data);
        } catch (err) {
            console.error('Failed to load creators:', err);
        }
        setLoading(false);
    };

    const handleClearFilters = () => {
        setFilters({
            category: 'all',
            followerTier: 'all',
            platforms: [],
            minPrice: '',
            maxPrice: ''
        });
        setSearchQuery('');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-3xl text-white">
                <button
                    onClick={() => navigate('/business-dashboard')}
                    className="text-white/80 hover:text-white mb-4 flex items-center"
                >
                    ← Back to Dashboard
                </button>
                <h1 className="text-4xl font-black mb-2">Discover Creators</h1>
                <p className="text-xl text-white/80 mb-4">Find the perfect creators for your campaigns</p>

                {/* Search Bar */}
                <div className="relative max-w-xl">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, category, bio..."
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

            {/* Main Content: Sidebar + Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                {/* Sidebar */}
                <FilterSidebar
                    filters={filters}
                    onFilterChange={setFilters}
                    onClearFilters={handleClearFilters}
                />

                {/* Creators Grid */}
                <div>
                    {loading ? (
                        <div className="text-center py-12 bg-white rounded-3xl">
                            <div className="text-3xl mb-4 animate-pulse text-gray-400">•••</div>
                            <p className="text-xl text-gray-500">Loading creators...</p>
                        </div>
                    ) : creators.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl">
                            <div className="text-2xl mb-4 text-gray-400">—</div>
                            <p className="text-xl text-gray-600 mb-2">No creators found</p>
                            <p className="text-gray-400">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600">
                                Found <span className="font-bold text-gray-900">{creators.length}</span> creator{creators.length !== 1 ? 's' : ''}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {creators.map(creator => (
                                    <div key={creator._id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-2xl text-white font-bold">
                                                {creator.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900">{creator.name}</h3>
                                                <p className="text-sm text-gray-500">{creator.category || 'Creator'}</p>
                                                {creator.average_rating > 0 && (
                                                    <StarRating rating={creator.average_rating} reviewCount={creator.review_count} size="sm" />
                                                )}
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

                                        <button
                                            onClick={() => navigate(`/creator/${creator._id}`)}
                                            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiscoverCreators;
