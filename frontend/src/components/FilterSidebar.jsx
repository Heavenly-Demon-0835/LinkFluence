import React from 'react';

const FOLLOWER_TIERS = [
    { value: 'all', label: 'All Creators', range: '' },
    { value: 'nano', label: 'Nano', range: '< 10K followers' },
    { value: 'micro', label: 'Micro', range: '10K - 100K' },
    { value: 'macro', label: 'Macro', range: '100K+' },
];

const PLATFORMS = [
    { value: 'instagram', label: 'Instagram', emoji: '📷' },
    { value: 'tiktok', label: 'TikTok', emoji: '🎵' },
    { value: 'youtube', label: 'YouTube', emoji: '📺' },
    { value: 'twitter', label: 'Twitter', emoji: '🐦' },
];

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

const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
    const handleCategoryChange = (category) => {
        onFilterChange({ ...filters, category });
    };

    const handleFollowerTierChange = (followerTier) => {
        onFilterChange({ ...filters, followerTier });
    };

    const handlePlatformToggle = (platform) => {
        const currentPlatforms = filters.platforms || [];
        const newPlatforms = currentPlatforms.includes(platform)
            ? currentPlatforms.filter(p => p !== platform)
            : [...currentPlatforms, platform];
        onFilterChange({ ...filters, platforms: newPlatforms });
    };

    const handlePriceChange = (field, value) => {
        onFilterChange({ ...filters, [field]: value });
    };

    const activeFilterCount = () => {
        let count = 0;
        if (filters.category && filters.category !== 'all') count++;
        if (filters.followerTier && filters.followerTier !== 'all') count++;
        if (filters.platforms && filters.platforms.length > 0) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        return count;
    };

    const count = activeFilterCount();

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6 sticky top-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900">Filters</h2>
                {count > 0 && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 font-bold"
                    >
                        Clear All ({count})
                    </button>
                )}
            </div>

            {/* Category Filter */}
            <div>
                <h3 className="font-bold text-gray-700 mb-3">Category</h3>
                <div className="space-y-2">
                    {CATEGORIES.map(cat => (
                        <label
                            key={cat.value}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                        >
                            <input
                                type="radio"
                                name="category"
                                checked={filters.category === cat.value}
                                onChange={() => handleCategoryChange(cat.value)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">{cat.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Follower Tier Filter */}
            <div>
                <h3 className="font-bold text-gray-700 mb-3">Follower Count</h3>
                <div className="space-y-2">
                    {FOLLOWER_TIERS.map(tier => (
                        <label
                            key={tier.value}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                        >
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="followerTier"
                                    checked={filters.followerTier === tier.value}
                                    onChange={() => handleFollowerTierChange(tier.value)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm font-bold text-gray-700">{tier.label}</span>
                            </div>
                            {tier.range && (
                                <span className="text-xs text-gray-500">{tier.range}</span>
                            )}
                        </label>
                    ))}
                </div>
            </div>

            {/* Platform Filter */}
            <div>
                <h3 className="font-bold text-gray-700 mb-3">Platforms</h3>
                <div className="space-y-2">
                    {PLATFORMS.map(platform => (
                        <label
                            key={platform.value}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                        >
                            <input
                                type="checkbox"
                                checked={filters.platforms?.includes(platform.value) || false}
                                onChange={() => handlePlatformToggle(platform.value)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-lg">{platform.emoji}</span>
                            <span className="text-sm text-gray-700">{platform.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range Filter */}
            <div>
                <h3 className="font-bold text-gray-700 mb-3">Price Range</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-500">$</span>
                            <input
                                type="number"
                                placeholder="0"
                                value={filters.minPrice || ''}
                                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-500">$</span>
                            <input
                                type="number"
                                placeholder="1000"
                                value={filters.maxPrice || ''}
                                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;
