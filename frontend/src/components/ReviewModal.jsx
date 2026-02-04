import React, { useState } from 'react';
import StarRating from './StarRating';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const ReviewModal = ({ isOpen, onClose, creatorId, creatorName, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE}/api/reviews/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creator_id: creatorId,
                    reviewer_id: user.user_id,
                    reviewer_name: user.name || user.email || 'Business User',
                    rating: rating,
                    comment: comment.trim()
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            // Success!
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
            onClose();

            // Reset form
            setRating(0);
            setComment('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-gray-900">Leave a Review</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Creator Info */}
                <p className="text-gray-600 mb-4">
                    How was your experience working with <span className="font-bold text-gray-900">{creatorName}</span>?
                </p>

                {/* Star Selection */}
                <div className="mb-6">
                    <label className="block font-bold text-gray-700 mb-2">Rating</label>
                    <div className="flex justify-center py-4 bg-gray-50 rounded-xl">
                        <div className="flex gap-2 text-3xl">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`transition-transform hover:scale-125 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Comment */}
                <div className="mb-6">
                    <label className="block font-bold text-gray-700 mb-2">Comment (Optional)</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || rating === 0}
                        className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
