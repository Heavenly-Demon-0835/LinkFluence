import React from 'react';

const StarRating = ({ rating, reviewCount, size = 'md', interactive = false, onRatingChange }) => {
    const sizes = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-2xl'
    };

    const handleClick = (starIndex) => {
        if (interactive && onRatingChange) {
            onRatingChange(starIndex + 1);
        }
    };

    const renderStar = (index) => {
        const filled = index < Math.floor(rating);
        const partial = index === Math.floor(rating) && rating % 1 !== 0;
        const partialWidth = partial ? `${(rating % 1) * 100}%` : '0%';

        return (
            <span
                key={index}
                onClick={() => handleClick(index)}
                className={`relative ${interactive ? 'cursor-pointer hover:scale-110 transition' : ''}`}
            >
                {/* Empty star background */}
                <span className="text-gray-300">★</span>

                {/* Filled star overlay */}
                <span
                    className="absolute left-0 top-0 overflow-hidden text-yellow-400"
                    style={{ width: filled ? '100%' : partialWidth }}
                >
                    ★
                </span>
            </span>
        );
    };

    return (
        <div className={`flex items-center gap-1 ${sizes[size]}`}>
            <div className="flex">
                {[0, 1, 2, 3, 4].map(renderStar)}
            </div>
            {rating > 0 && (
                <span className={`font-bold text-gray-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
                    {rating.toFixed(1)}
                </span>
            )}
            {reviewCount !== undefined && reviewCount > 0 && (
                <span className={`text-gray-500 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
                    ({reviewCount})
                </span>
            )}
        </div>
    );
};

export default StarRating;
