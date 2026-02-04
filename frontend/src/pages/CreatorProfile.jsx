import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const CreatorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [creator, setCreator] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ average_rating: 0, review_count: 0 });
    const [showReviewModal, setShowReviewModal] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isBusinessUser = user.role === 'business';

    useEffect(() => {
        fetchCreator();
        fetchReviews();
    }, [id]);

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

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/reviews/creator/${id}`);
            const data = await res.json();
            setReviews(data.reviews || []);
            setReviewStats({
                average_rating: data.average_rating || 0,
                review_count: data.review_count || 0
            });
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

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
                className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
            >
                ← Back
            </button>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                {/* Cover Image / Gradient */}
                <div className="h-48 bg-gradient-to-r from-purple-500 to-blue-500"></div>

                {/* Profile Section */}
                <div className="px-8 pb-8">
                    {/* Avatar */}
                    <div className="-mt-16 mb-4">
                        <div className="w-32 h-32 rounded-full bg-white p-1 shadow-xl">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-5xl text-white font-bold">
                                {creator.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        </div>
                    </div>

                    {/* Name & Category */}
                    <h1 className="text-3xl font-black text-gray-900">{creator.name}</h1>
                    <p className="text-gray-500 mb-2">{creator.category || 'Creator'}</p>

                    {/* Rating */}
                    {reviewStats.review_count > 0 && (
                        <div className="mb-4">
                            <StarRating rating={reviewStats.average_rating} reviewCount={reviewStats.review_count} size="md" />
                        </div>
                    )}

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

                    {/* Reviews Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-gray-700">⭐ Reviews</h2>
                            {isBusinessUser && (
                                <button
                                    onClick={() => setShowReviewModal(true)}
                                    className="text-blue-600 hover:text-blue-700 font-bold text-sm"
                                >
                                    + Leave a Review
                                </button>
                            )}
                        </div>

                        {reviewStats.review_count > 0 ? (
                            <div className="space-y-4">
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                    <StarRating rating={reviewStats.average_rating} size="lg" />
                                    <p className="text-gray-600 text-sm mt-1">Based on {reviewStats.review_count} review{reviewStats.review_count !== 1 ? 's' : ''}</p>
                                </div>

                                {reviews.map((review, i) => (
                                    <div key={i} className="bg-gray-50 p-4 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <StarRating rating={review.rating} size="sm" />
                                            <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-700 mb-2">"{review.comment}"</p>
                                        )}
                                        <p className="text-sm text-gray-500">— {review.reviewer_name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-xl text-center">
                                <p className="text-gray-500">No reviews yet</p>
                                {isBusinessUser && (
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700"
                                    >
                                        Be the first to review
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Contact Button */}
                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition">
                        Contact Creator
                    </button>
                </div>
            </div>

            {/* Review Modal */}
            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                creatorId={id}
                creatorName={creator.name}
                onReviewSubmitted={() => {
                    fetchReviews();
                    fetchCreator();
                }}
            />
        </div>
    );
};

export default CreatorProfile;
