import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = 'http://127.0.0.1:5000';

// Friendly error messages
const getFriendlyError = (error) => {
    if (error.includes('Failed to fetch') || error.includes('Network')) {
        return "Couldn't connect. Please check your internet.";
    }
    if (error.includes('Already applied') || error.includes('409')) {
        return "You've already applied to this campaign!";
    }
    return error || "Something went wrong. Please try again.";
};

const CreatorDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [appliedCampaigns, setAppliedCampaigns] = useState([]);
    const [notification, setNotification] = useState(null);

    // Edit Profile modal
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        category: '',
        youtube: '',
        instagram: '',
        tiktok: '',
        twitter: '',
        service_packages: []
    });

    // Messages state
    const [activeTab, setActiveTab] = useState('campaigns');
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [businessNames, setBusinessNames] = useState({});

    // Load messages for a chat
    const loadMessages = async (campaignId, businessId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await fetch(`${API_BASE}/api/messages/conversation?campaign_id=${campaignId}&creator_id=${user.user_id}&business_id=${businessId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data.map(m => ({ ...m, created_at: m.timestamp || m.created_at })));
            }
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    };

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;
        const user = JSON.parse(localStorage.getItem('user'));
        const messageContent = newMessage.trim();
        setNewMessage('');

        // Optimistic update
        const tempMessage = {
            sender_id: user.user_id,
            receiver_id: selectedChat.business_id,
            content: messageContent,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            await fetch(`${API_BASE}/api/messages/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign_id: selectedChat.campaign_id,
                    sender_id: user.user_id,
                    receiver_id: selectedChat.business_id,
                    content: messageContent
                })
            });
        } catch (err) {
            showNotification('error', 'Message failed to send.');
        }
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');

        if (!userStr) {
            navigate('/login');
            return;
        }

        let user;
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            navigate('/login');
            return;
        }

        if (!user.user_id) {
            navigate('/login');
            return;
        }

        if (user.role !== 'creator') {
            navigate(user.role === 'business' ? '/business-dashboard' : '/login');
            return;
        }

        // Set default profile immediately
        setProfile({
            name: user.name || 'Creator',
            industry: 'Creator',
            categories: []
        });
        setLoading(false);

        // Fetch data in background
        fetch(`${API_BASE}/api/creators/${user.user_id}`)
            .then(r => r.json())
            .then(data => {
                if (data.profile) setProfile(data.profile);
            })
            .catch(() => { });

        fetch(`${API_BASE}/api/campaigns/`)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setCampaigns(data);
            })
            .catch(() => { });

        fetch(`${API_BASE}/api/creators/${user.user_id}/growth-prediction`)
            .then(r => r.json())
            .then(data => setPrediction(data))
            .catch(() => { });

    }, [navigate]);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleApply = async (campaignId) => {
        const user = JSON.parse(localStorage.getItem('user'));
        setApplying(campaignId);

        try {
            const response = await fetch(`${API_BASE}/api/campaigns/${campaignId}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creator_id: user.user_id,
                    creator_name: user.name || 'A Creator'
                })
            });

            const data = await response.json();

            if (response.ok) {
                setAppliedCampaigns([...appliedCampaigns, campaignId]);
                showNotification('success', '🎉 Application sent! The business will contact you soon.');
            } else {
                showNotification('error', getFriendlyError(data.error));
            }
        } catch (err) {
            showNotification('error', getFriendlyError(err.message));
        }

        setApplying(null);
    };

    if (loading) {
        return (
            <div className="text-center mt-20">
                <div className="text-3xl mb-4 animate-pulse text-gray-400">•••</div>
                <p className="text-xl text-gray-500">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg max-w-md animate-fade-in
                    ${notification.type === 'success' ? 'success-box' : 'error-box'}`}>
                    {notification.message}
                </div>
            )}

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black mb-2">
                            Welcome back, {profile?.name}
                        </h1>
                        <p className="text-blue-100 text-lg">
                            Find brand deals and grow your audience
                        </p>
                    </div>
                    <div className="mt-6 md:mt-0">
                        <button
                            onClick={() => {
                                setEditForm({
                                    name: profile?.name || '',
                                    bio: profile?.bio || '',
                                    category: profile?.category || '',
                                    youtube: profile?.social_links?.youtube || '',
                                    instagram: profile?.social_links?.instagram || '',
                                    tiktok: profile?.social_links?.tiktok || '',
                                    twitter: profile?.social_links?.twitter || '',
                                    service_packages: profile?.service_packages || []
                                });
                                setShowEditProfile(true);
                            }}
                            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition text-lg"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`text-xl font-bold pb-2 px-4 transition ${activeTab === 'campaigns' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Campaigns
                </button>
                <button
                    onClick={() => setActiveTab('messages')}
                    className={`text-xl font-bold pb-2 px-4 transition ${activeTab === 'messages' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Messages
                </button>
            </div>

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-500">
                            <p className="text-2xl mb-1 text-blue-600 font-bold">#</p>
                            <p className="text-gray-500 text-sm font-bold">Followers</p>
                            <p className="text-2xl font-black text-gray-900">{profile?.followers || 0}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-purple-500">
                            <p className="text-2xl mb-1 text-purple-600 font-bold">#</p>
                            <p className="text-gray-500 text-sm font-bold">Views</p>
                            <p className="text-2xl font-black text-gray-900">{profile?.views || 0}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-green-500">
                            <p className="text-2xl mb-1 text-green-600 font-bold">↑</p>
                            <p className="text-gray-500 text-sm font-bold">Growth</p>
                            <p className="text-2xl font-black text-green-600">0%</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-amber-500">
                            <p className="text-2xl mb-1 text-amber-600 font-bold">%</p>
                            <p className="text-gray-500 text-sm font-bold">Engagement</p>
                            <p className="text-2xl font-black text-amber-600">{profile?.engagement || 0}%</p>
                        </div>
                    </div>

                    {/* Growth Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <span className="text-lg mr-2 text-blue-600 font-bold">↑</span>
                            Follower Growth
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={
                                profile?.growth_data?.length > 0
                                    ? profile.growth_data
                                    : [
                                        { month: 'Jan', followers: profile?.followers || 0 },
                                        { month: 'Feb', followers: profile?.followers || 0 },
                                        { month: 'Mar', followers: profile?.followers || 0 },
                                    ]
                            }>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                                <YAxis tick={{ fill: '#6b7280' }} tickFormatter={(val) => val === 0 ? '0' : `${(val / 1000).toFixed(0)}K`} />
                                <Tooltip
                                    formatter={(val) => [val === 0 ? '0' : `${(val / 1000).toFixed(1)}K`, 'Followers']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="followers"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                                    activeDot={{ r: 8, fill: '#2563eb' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Campaigns Section */}
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
                            <span className="text-xl mr-3 text-blue-600 font-bold">C</span>
                            Available Campaigns
                            <span className="ml-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                                {campaigns.length} available
                            </span>
                        </h2>

                        {campaigns.length === 0 ? (
                            <div className="text-center p-12 bg-white rounded-3xl shadow-sm">
                                <p className="text-3xl mb-4 text-gray-400">—</p>
                                <p className="text-xl text-gray-600 mb-2">No campaigns available right now</p>
                                <p className="text-gray-400">Check back soon! New opportunities are added daily.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {campaigns.map((camp) => (
                                    <div key={camp._id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100 flex flex-col">

                                        {/* Status Badge */}
                                        <div className="mb-4">
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                                                Open for Applications
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{camp.title}</h3>
                                        <p className="text-gray-600 mb-4 flex-grow line-clamp-3">{camp.description}</p>

                                        {/* Business Info */}
                                        <div className="bg-blue-50 p-3 rounded-xl mb-4 flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                                {camp.business_name?.charAt(0)?.toUpperCase() || '🏢'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{camp.business_name || 'Business'}</p>
                                                <p className="text-xs text-gray-500 capitalize">{camp.business_type || 'Company'}</p>
                                            </div>
                                        </div>

                                        {/* Budget */}
                                        <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                            <p className="text-sm text-gray-500 font-bold mb-1">Budget</p>
                                            <p className="text-2xl font-black text-green-600">
                                                ${typeof camp.budget === 'object' ? camp.budget.total_amount : camp.budget}
                                            </p>
                                        </div>

                                        {/* Apply Button */}
                                        <button
                                            onClick={() => handleApply(camp._id)}
                                            disabled={applying === camp._id || appliedCampaigns.includes(camp._id)}
                                            className={`w-full py-3 rounded-xl font-bold text-lg transition
                                        ${appliedCampaigns.includes(camp._id)
                                                    ? 'bg-green-500 text-white cursor-default'
                                                    : applying === camp._id
                                                        ? 'bg-gray-300 text-gray-600 cursor-wait'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                        >
                                            {appliedCampaigns.includes(camp._id)
                                                ? 'Applied'
                                                : applying === camp._id
                                                    ? 'Sending...'
                                                    : 'Apply Now'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Edit Profile Modal */}
                    {showEditProfile && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto relative">
                                {/* Close button */}
                                <button
                                    onClick={() => setShowEditProfile(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                                >
                                    ×
                                </button>
                                <h2 className="text-2xl font-black mb-6">Edit Profile</h2>

                                <label className="block text-gray-700 font-bold mb-2">Name</label>
                                <input
                                    type="text"
                                    className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-4"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="Your name"
                                />

                                <label className="block text-gray-700 font-bold mb-2">Bio</label>
                                <textarea
                                    className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-4 resize-none"
                                    rows={3}
                                    value={editForm.bio}
                                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                    placeholder="Tell businesses about yourself..."
                                />

                                <label className="block text-gray-700 font-bold mb-2">Category</label>
                                <select
                                    className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-4"
                                    value={editForm.category}
                                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                >
                                    <option value="">Select a category...</option>
                                    <option value="tech">Tech</option>
                                    <option value="lifestyle">Lifestyle</option>
                                    <option value="fashion">Fashion</option>
                                    <option value="fitness">Fitness</option>
                                    <option value="food">Food</option>
                                    <option value="travel">Travel</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="gaming">Gaming</option>
                                    <option value="beauty">Beauty</option>
                                    <option value="education">Education</option>
                                    <option value="music">Music</option>
                                    <option value="other">Other</option>
                                </select>

                                <h3 className="font-bold text-gray-800 mb-3 mt-4">Social Links</h3>

                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">📺</span>
                                        <input
                                            type="text"
                                            className="flex-1 p-3 border-2 border-gray-300 rounded-xl"
                                            value={editForm.youtube}
                                            onChange={e => setEditForm({ ...editForm, youtube: e.target.value })}
                                            placeholder="YouTube channel URL"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">📷</span>
                                        <input
                                            type="text"
                                            className="flex-1 p-3 border-2 border-gray-300 rounded-xl"
                                            value={editForm.instagram}
                                            onChange={e => setEditForm({ ...editForm, instagram: e.target.value })}
                                            placeholder="Instagram handle (@username)"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">🎵</span>
                                        <input
                                            type="text"
                                            className="flex-1 p-3 border-2 border-gray-300 rounded-xl"
                                            value={editForm.tiktok}
                                            onChange={e => setEditForm({ ...editForm, tiktok: e.target.value })}
                                            placeholder="TikTok handle (@username)"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">🐦</span>
                                        <input
                                            type="text"
                                            className="flex-1 p-3 border-2 border-gray-300 rounded-xl"
                                            value={editForm.twitter}
                                            onChange={e => setEditForm({ ...editForm, twitter: e.target.value })}
                                            placeholder="Twitter/X handle (@username)"
                                        />
                                    </div>
                                </div>

                                {/* Service Packages Section */}
                                <h3 className="font-bold text-gray-800 mb-3 mt-6">Service Packages</h3>
                                <p className="text-sm text-gray-500 mb-3">Add your services with prices so businesses know what you offer</p>

                                <div className="space-y-3 mb-4">
                                    {editForm.service_packages.map((pkg, idx) => (
                                        <div key={idx} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl">
                                            <input
                                                type="text"
                                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                                value={pkg.name}
                                                onChange={e => {
                                                    const updated = [...editForm.service_packages];
                                                    updated[idx].name = e.target.value;
                                                    setEditForm({ ...editForm, service_packages: updated });
                                                }}
                                                placeholder="Service name (e.g., UGC Video)"
                                            />
                                            <span className="text-gray-500">$</span>
                                            <input
                                                type="number"
                                                className="w-24 p-2 border border-gray-300 rounded-lg text-sm"
                                                value={pkg.price}
                                                onChange={e => {
                                                    const updated = [...editForm.service_packages];
                                                    updated[idx].price = e.target.value;
                                                    setEditForm({ ...editForm, service_packages: updated });
                                                }}
                                                placeholder="Price"
                                            />
                                            <button
                                                onClick={() => {
                                                    const updated = editForm.service_packages.filter((_, i) => i !== idx);
                                                    setEditForm({ ...editForm, service_packages: updated });
                                                }}
                                                className="text-red-500 hover:text-red-700 font-bold px-2"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setEditForm({
                                        ...editForm,
                                        service_packages: [...editForm.service_packages, { name: '', price: '' }]
                                    })}
                                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
                                >
                                    + Add Service Package
                                </button>

                                <div className="flex space-x-4 mt-6">
                                    <button
                                        onClick={() => setShowEditProfile(false)}
                                        className="flex-1 bg-gray-200 py-3 rounded-xl font-bold hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const user = JSON.parse(localStorage.getItem('user'));
                                            try {
                                                const res = await fetch(`${API_BASE}/api/creators/${user.user_id}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        name: editForm.name,
                                                        bio: editForm.bio,
                                                        category: editForm.category,
                                                        service_packages: editForm.service_packages.filter(p => p.name && p.price),
                                                        social_links: {
                                                            youtube: editForm.youtube,
                                                            instagram: editForm.instagram,
                                                            tiktok: editForm.tiktok,
                                                            twitter: editForm.twitter
                                                        }
                                                    })
                                                });
                                                if (res.ok) {
                                                    setProfile({ ...profile, name: editForm.name, bio: editForm.bio, category: editForm.category, service_packages: editForm.service_packages.filter(p => p.name && p.price), social_links: { youtube: editForm.youtube, instagram: editForm.instagram, tiktok: editForm.tiktok, twitter: editForm.twitter } });
                                                    showNotification('success', 'Profile updated!');
                                                    setShowEditProfile(false);
                                                } else {
                                                    showNotification('error', 'Could not save profile.');
                                                }
                                            } catch {
                                                showNotification('error', 'Connection error. Try again.');
                                            }
                                        }}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
                    {/* Conversation List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-gray-800">Conversations</h3>
                        </div>
                        <div className="divide-y">
                            {(() => {
                                const user = JSON.parse(localStorage.getItem('user') || '{}');
                                // Get campaigns where this creator has applied (from API data) OR session-applied
                                const myConversations = campaigns.filter(c =>
                                    c.applicants?.includes(user.user_id) || appliedCampaigns.includes(c._id)
                                );

                                if (myConversations.length === 0) {
                                    return (
                                        <div className="p-6 text-center text-gray-500">
                                            <p className="text-2xl mb-2 text-gray-400">—</p>
                                            <p>No conversations yet</p>
                                            <p className="text-sm">Apply to campaigns to start chatting!</p>
                                        </div>
                                    );
                                }

                                return myConversations.map((camp) => (
                                    <div
                                        key={camp._id}
                                        onClick={() => {
                                            setSelectedChat({
                                                campaign_id: camp._id,
                                                business_id: camp.business_id,
                                                campaign_title: camp.title,
                                                business_name: camp.business_name || 'Business'
                                            });
                                            loadMessages(camp._id, camp.business_id);
                                        }}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition ${selectedChat?.campaign_id === camp._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                    >
                                        <p className="font-bold text-gray-900">{camp.business_name || 'Business'}</p>
                                        <p className="text-sm text-gray-500">{camp.title}</p>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* Chat Panel */}
                    <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b bg-gray-50">
                                    <h3 className="font-bold text-gray-800">{selectedChat.business_name || 'Business'}</h3>
                                    <p className="text-sm text-gray-500">{selectedChat.campaign_title}</p>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[350px]">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-gray-400 py-8">
                                            <p className="text-2xl mb-2 text-gray-400">—</p>
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const user = JSON.parse(localStorage.getItem('user') || '{}');
                                            const isMine = msg.sender_id === user.user_id;
                                            return (
                                                <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] p-3 rounded-2xl ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                                        <p>{msg.content}</p>
                                                        <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t flex space-x-3">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                        className="flex-1 p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                                    >
                                        Send ➤
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <p className="text-6xl mb-4">👈</p>
                                    <p className="text-xl">Select a conversation to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatorDashboard;

