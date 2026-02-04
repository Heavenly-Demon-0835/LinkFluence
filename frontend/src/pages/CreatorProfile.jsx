import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const CreatorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [creator, setCreator] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCreator = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/creators/${id}`);
                if (!res.ok) throw new Error('Creator not found');
                const data = await res.json();
                setCreator(data.profile || data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCreator();
    }, [id]);

    if (loading) {
        return (
            <div className="text-center py-20">
                <p className="text-2xl text-gray-400 animate-pulse">Loading...</p>
            </div>
        );
    }

    if (error || !creator) {
        return (
            <div className="text-center py-20">
                <p className="text-2xl text-gray-400 mb-4">Creator not found</p>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold"
                >
                    ← Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <button
                onClick={() => navigate(-1)}
                className="mb-6 text-gray-500 hover:text-gray-700 font-bold"
            >
                ← Back to Discovery
            </button>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-purple-500 to-blue-500"></div>

                {/* Profile Info */}
                <div className="p-8 -mt-16">
                    <div className="flex items-end space-x-6 mb-6">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-4xl text-white font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                            {creator.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">{creator.name}</h1>
                            <p className="text-gray-500 capitalize">{creator.category || 'Creator'}</p>
                        </div>
                    </div>

                    {/* Bio */}
                    {creator.bio && (
                        <div className="mb-6">
                            <h2 className="font-bold text-gray-700 mb-2">About</h2>
                            <p className="text-gray-600">{creator.bio}</p>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <p className="text-2xl font-black text-gray-900">
                                {creator.followers ? `${(creator.followers / 1000).toFixed(1)}K` : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500">Followers</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <p className="text-2xl font-black text-gray-900">
                                {creator.engagement_rate ? `${creator.engagement_rate}%` : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500">Engagement</p>
                        </div>
                    </div>

                    {/* Social Links */}
                    {creator.social_links && Object.keys(creator.social_links).length > 0 && (
                        <div className="mb-6">
                            <h2 className="font-bold text-gray-700 mb-2">Social Links</h2>
                            <div className="flex flex-wrap gap-3">
                                {creator.social_links.youtube && (
                                    <a href={creator.social_links.youtube} target="_blank" rel="noopener noreferrer"
                                        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-200">
                                        📺 YouTube
                                    </a>
                                )}
                                {creator.social_links.instagram && (
                                    <a href={creator.social_links.instagram} target="_blank" rel="noopener noreferrer"
                                        className="bg-pink-100 text-pink-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-pink-200">
                                        📷 Instagram
                                    </a>
                                )}
                                {creator.social_links.tiktok && (
                                    <a href={creator.social_links.tiktok} target="_blank" rel="noopener noreferrer"
                                        className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200">
                                        🎵 TikTok
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Portfolio Gallery */}
                    {creator.portfolio && creator.portfolio.length > 0 && (
                        <div className="mb-6">
                            <h2 className="font-bold text-gray-700 mb-3">📸 Portfolio</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {creator.portfolio.map((item, i) => (
                                    <a
                                        key={i}
                                        href={item.link || item.image_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
                                    >
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x300?text=Image';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                                            <p className="absolute bottom-2 left-2 right-2 text-white font-bold text-sm truncate">
                                                {item.title}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Service Packages */}
                    {creator.service_packages && creator.service_packages.length > 0 && (
                        <div className="mb-6">
                            <h2 className="font-bold text-gray-700 mb-3">💼 Services Offered</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {creator.service_packages.map((pkg, i) => (
                                    <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-200 hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-gray-900 text-lg">{pkg.name}</p>
                                            <p className="text-green-600 font-black text-xl bg-white px-3 py-1 rounded-lg shadow-sm">${pkg.price}</p>
                                        </div>
                                        {pkg.description && (
                                            <p className="text-gray-600 text-sm">{pkg.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Button */}
                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition">
                        Contact Creator
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatorProfile;
