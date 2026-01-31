import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'http://127.0.0.1:5000';

const BusinessProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch { }
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch business profile
                const bizRes = await fetch(`${API_BASE}/api/businesses/${id}`);
                if (!bizRes.ok) throw new Error('Business not found');
                const bizData = await bizRes.json();
                setBusiness(bizData);

                // Fetch campaigns for this business
                const campRes = await fetch(`${API_BASE}/api/campaigns?business_id=${id}`);
                const campData = await campRes.json();
                setCampaigns(Array.isArray(campData) ? campData : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const applyToCampaign = async (campaignId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creator_id: user.user_id,
                    creator_name: user.name
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Application submitted successfully!');
            } else {
                alert(data.error || 'Failed to apply');
            }
        } catch (err) {
            alert('Failed to apply. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20">
                <p className="text-2xl text-gray-400 animate-pulse">Loading...</p>
            </div>
        );
    }

    if (error || !business) {
        return (
            <div className="text-center py-20">
                <p className="text-2xl text-gray-400 mb-4">Business not found</p>
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

            {/* Business Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden mb-8">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-green-500 to-teal-500"></div>

                {/* Profile Info */}
                <div className="p-8 -mt-16">
                    <div className="flex items-end space-x-6 mb-6">
                        {business.logo_url ? (
                            <img src={business.logo_url} alt="" className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg" />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-4xl text-white font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                                {business.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">{business.name}</h1>
                            <p className="text-gray-500 capitalize">{business.business_type || 'Business'}</p>
                        </div>
                    </div>

                    {/* Description */}
                    {business.description && (
                        <div className="mb-6">
                            <h2 className="font-bold text-gray-700 mb-2">About</h2>
                            <p className="text-gray-600">{business.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Campaigns Section */}
            <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">Active Campaigns</h2>

                {campaigns.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl">
                        <p className="text-gray-400 text-xl">No active campaigns</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {campaigns.map(camp => (
                            <div key={camp._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex flex-col md:flex-row justify-between">
                                    <div className="mb-4 md:mb-0 flex-1">
                                        <h3 className="text-xl font-bold text-gray-900">{camp.title}</h3>
                                        <p className="text-gray-600 mt-1">{camp.description}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                                ${typeof camp.budget === 'object' ? camp.budget.total_amount : camp.budget}
                                            </span>
                                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                                                {camp.applicants?.length || 0} Applicants
                                            </span>
                                        </div>
                                    </div>
                                    {user?.role === 'creator' && (
                                        <button
                                            onClick={() => applyToCampaign(camp._id)}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                                        >
                                            Apply Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessProfile;
