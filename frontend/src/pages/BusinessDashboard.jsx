import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const BusinessDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [myCampaigns, setMyCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tab state: 'campaigns', 'messages', or 'notifications'
    const [activeTab, setActiveTab] = useState('campaigns');

    // Create Campaign Modal
    const [showCreate, setShowCreate] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ title: '', description: '', budget: 1000 });

    // View Applicants Modal
    const [showApplicants, setShowApplicants] = useState(null); // campaign object
    const [applications, setApplications] = useState([]); // applications for selected campaign

    // Edit Campaign Modal
    const [editCampaign, setEditCampaign] = useState(null); // campaign being edited
    const [editCampaignForm, setEditCampaignForm] = useState({ title: '', description: '', budget: '' });

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Messages state
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');

    // Applicant names cache
    const [applicantNames, setApplicantNames] = useState({});

    // Toast notification
    const [toast, setToast] = useState(null);

    // Delete Confirmation Modal
    const [deleteConfirm, setDeleteConfirm] = useState(null); // campaign to delete

    // Edit Business Profile
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState({
        name: '',
        description: '',
        business_type: '',
        logo_url: '',
        banner_url: ''
    });

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        console.log('BusinessDashboard: localStorage user =', userStr);

        if (!userStr) {
            navigate('/login');
            return;
        }

        let user;
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            console.error('Failed to parse user:', e);
            navigate('/login');
            return;
        }

        console.log('Parsed user:', user);

        if (!user.user_id) {
            console.log('No user_id, redirecting to login');
            navigate('/login');
            return;
        }
        if (user.role !== 'business') {
            console.log('Not a business, redirecting');
            navigate('/creator-dashboard');
            return;
        }

        // Set default profile immediately
        setProfile({ name: user.name || 'Business' });
        setLoading(false);

        // Fetch profile and campaigns in background
        fetch(`${API_BASE}/api/businesses/${user.user_id}`)
            .then(r => r.json())
            .then(data => {
                console.log('Business profile:', data);
                if (data && !data.error) setProfile(data);
            })
            .catch(err => console.error('Failed to fetch profile:', err));

        loadCampaignsForUser(user.user_id);
        loadNotificationsForUser(user.user_id);
    }, [navigate]);

    // Fetch applications when modal opens
    useEffect(() => {
        if (showApplicants?._id) {
            loadApplications(showApplicants._id);
        }
    }, [showApplicants]);

    const loadApplications = async (campaignId) => {
        try {
            const res = await fetch(`${API_BASE}/api/applications/campaign/${campaignId}`);
            const data = await res.json();
            setApplications(data || []);
        } catch (err) {
            console.error('Failed to load applications:', err);
            setApplications([]);
        }
    };

    const handleApplicationStatus = async (appId, status) => {
        try {
            const res = await fetch(`${API_BASE}/api/applications/${appId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                showToast('success', `Application ${status}!`);
                // Reload applications
                if (showApplicants?._id) {
                    loadApplications(showApplicants._id);
                }
            } else {
                showToast('error', 'Failed to update status');
            }
        } catch (err) {
            showToast('error', 'Connection error');
        }
    };

    const loadNotificationsForUser = (userId) => {
        fetch(`${API_BASE}/api/notifications?user_id=${userId}`)
            .then(r => r.json())
            .then(data => {
                console.log('Notifications loaded:', data);
                if (data.notifications) {
                    setNotifications(data.notifications);
                    setUnreadCount(data.unread_count || 0);
                }
            })
            .catch(err => console.error('Failed to fetch notifications:', err));
    };

    // Fetch creator name by ID
    const fetchCreatorName = async (creatorId) => {
        if (applicantNames[creatorId]) return applicantNames[creatorId];
        try {
            const res = await fetch(`${API_BASE}/api/creators/${creatorId}`);
            const data = await res.json();
            const name = data.profile?.name || data.name || 'Creator';
            setApplicantNames(prev => ({ ...prev, [creatorId]: name }));
            return name;
        } catch {
            return 'Creator';
        }
    };

    // Mark notification as read
    const markNotificationRead = async (notifId) => {
        try {
            await fetch(`${API_BASE}/api/notifications/${notifId}/read`, { method: 'POST' });
            setNotifications(prev => prev.map(n =>
                n._id === notifId ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    // Load messages for a chat
    const loadMessages = async (campaignId, creatorId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await fetch(`${API_BASE}/api/messages/conversation?campaign_id=${campaignId}&creator_id=${creatorId}&business_id=${user.user_id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                // Map timestamp to created_at for consistency
                setMessages(data.map(m => ({ ...m, created_at: m.timestamp || m.created_at })));
            }
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    };

    const loadCampaignsForUser = (userId) => {
        console.log('Loading campaigns for business:', userId);
        fetch(`${API_BASE}/api/campaigns?business_id=${userId}`)
            .then(r => r.json())
            .then(data => {
                console.log('Campaigns loaded:', data);
                if (Array.isArray(data)) {
                    setMyCampaigns(data);
                    // Fetch names for all applicants
                    data.forEach(camp => {
                        camp.applicants?.forEach(id => fetchCreatorName(id));
                    });
                } else {
                    console.error('Campaigns response is not an array:', data);
                    setMyCampaigns([]);
                }
            })
            .catch(err => {
                console.error('Failed to fetch campaigns:', err);
                setMyCampaigns([]);
            });
    };

    const loadCampaigns = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        loadCampaignsForUser(user.user_id);
    };

    const deleteCampaign = async (campaignId) => {
        try {
            const response = await fetch(`${API_BASE}/api/campaigns/${campaignId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showToast('success', 'Campaign deleted successfully');
                loadCampaigns();
            } else {
                const data = await response.json();
                showToast('error', data.error || 'Could not delete campaign');
            }
        } catch (err) {
            showToast('error', 'Failed to delete campaign. Please try again.');
        } finally {
            setDeleteConfirm(null);
        }
    };

    const handleCreate = async () => {
        // Validate required fields
        if (!newCampaign.title || !newCampaign.description) {
            showToast('error', 'Please fill in all required fields (Title and Description)');
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));

        try {
            const response = await fetch(`${API_BASE}/api/campaigns/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    business_id: user.user_id,
                    title: newCampaign.title,
                    description: newCampaign.description,
                    budget: parseInt(newCampaign.budget)
                })
            });

            const data = await response.json();
            console.log('Create campaign response:', data);

            if (response.ok) {
                showToast('success', '🎉 Campaign created! Creators can now apply.');
                setNewCampaign({ title: '', description: '', budget: 1000 });
                setShowCreate(false);
                loadCampaigns();
            } else {
                showToast('error', data.error || 'Could not create campaign. Please try again.');
            }
        } catch (err) {
            showToast('error', 'No internet connection. Please check your network.');
        }
    };

    const getBudgetDisplay = (budget) => {
        if (typeof budget === 'object') {
            return budget.total_amount || budget.max || 'N/A';
        }
        return budget;
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;
        const user = JSON.parse(localStorage.getItem('user'));
        const messageContent = newMessage.trim();
        setNewMessage('');

        // Add message to UI immediately (optimistic update)
        const tempMessage = {
            sender_id: user.user_id,
            receiver_id: selectedChat.creator_id,
            content: messageContent,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const res = await fetch(`${API_BASE}/api/messages/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign_id: selectedChat.campaign_id,
                    sender_id: user.user_id,
                    receiver_id: selectedChat.creator_id,
                    content: messageContent
                })
            });

            if (!res.ok) {
                showToast('error', 'Message failed to send. Please try again.');
            }
        } catch (err) {
            showToast('error', 'Could not send message. Check your connection.');
        }
    };

    if (loading) return (
        <div className="text-center mt-20">
            <div className="text-3xl mb-4 animate-pulse text-gray-400">•••</div>
            <p className="text-xl text-gray-500">Loading your dashboard...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg max-w-md animate-fade-in
                    ${toast.type === 'success' ? 'success-box' : 'error-box'}`}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-1">{profile?.name || 'Business'} Dashboard</h1>
                    <p className="text-gray-500 text-lg">Manage your campaigns and connect with creators.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            setEditProfileForm({
                                name: profile?.name || '',
                                description: profile?.description || '',
                                business_type: profile?.business_type || '',
                                logo_url: profile?.logo_url || '',
                                banner_url: profile?.banner_url || ''
                            });
                            setShowEditProfile(true);
                        }}
                        className="mt-4 md:mt-0 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl text-lg font-bold hover:bg-gray-200 transition"
                    >
                        Edit Profile
                    </button>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="mt-4 md:mt-0 bg-green-600 text-white px-8 py-3 rounded-xl text-lg font-bold hover:bg-green-700 shadow-lg transition flex items-center"
                    >
                        <span className="text-2xl mr-2">+</span> Create Campaign
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`text-xl font-bold pb-2 px-4 transition ${activeTab === 'campaigns' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    📂 My Campaigns ({myCampaigns.length})
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`text-xl font-bold pb-2 px-4 transition relative ${activeTab === 'notifications' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Notifications
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('messages')}
                    className={`text-xl font-bold pb-2 px-4 transition ${activeTab === 'messages' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Messages
                </button>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl">
                        <h2 className="text-2xl font-black mb-6">Create New Campaign</h2>

                        <label className="block text-gray-700 font-bold mb-2">Campaign Title *</label>
                        <input className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-4 focus:border-blue-500 focus:outline-none"
                            placeholder="e.g. Summer Sale 2026"
                            value={newCampaign.title}
                            onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })}
                        />

                        <label className="block text-gray-700 font-bold mb-2">Description *</label>
                        <textarea className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-4 h-32 focus:border-blue-500 focus:outline-none"
                            placeholder="What do you need creators to do?"
                            value={newCampaign.description}
                            onChange={e => setNewCampaign({ ...newCampaign, description: e.target.value })}
                        />

                        <label className="block text-gray-700 font-bold mb-2">Budget ($)</label>
                        <input type="number" className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-6"
                            value={newCampaign.budget}
                            onChange={e => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                        />

                        <div className="flex space-x-4">
                            <button onClick={() => setShowCreate(false)} className="flex-1 bg-gray-200 py-3 rounded-xl font-bold hover:bg-gray-300">Cancel</button>
                            <button onClick={handleCreate} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg">Launch</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Applicants Modal */}
            {showApplicants && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-black mb-2">Applicants</h2>
                        <p className="text-gray-500 mb-6">Campaign: {showApplicants.title}</p>

                        {applications.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <p className="text-3xl mb-4 text-gray-400">—</p>
                                <p className="text-lg">No applications yet</p>
                                <p className="text-sm">Share your campaign to get creators to apply!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applications.map((app) => {
                                    const statusColors = {
                                        pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                                        accepted: 'bg-green-100 text-green-700 border-green-300',
                                        rejected: 'bg-red-100 text-red-700 border-red-300'
                                    };
                                    return (
                                        <div key={app._id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700 text-lg">
                                                        {app.creator_name?.charAt(0)?.toUpperCase() || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-lg">{app.creator_name}</p>
                                                        <p className="text-sm text-gray-500">{new Date(app.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[app.status]}`}>
                                                    {app.status.toUpperCase()}
                                                </span>
                                            </div>

                                            {app.cover_letter && (
                                                <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                                                    <p className="text-sm text-gray-500 font-bold mb-1">Cover Letter:</p>
                                                    <p className="text-gray-700 text-sm">{app.cover_letter}</p>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                {app.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApplicationStatus(app._id, 'accepted')}
                                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700"
                                                        >
                                                            ✓ Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleApplicationStatus(app._id, 'rejected')}
                                                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700"
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setSelectedChat({
                                                            campaign_id: showApplicants._id,
                                                            campaign_title: showApplicants.title,
                                                            creator_id: app.creator_id,
                                                            creator_name: app.creator_name
                                                        });
                                                        loadMessages(showApplicants._id, app.creator_id);
                                                        setActiveTab('messages');
                                                        setShowApplicants(null);
                                                    }}
                                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700"
                                                >
                                                    💬 Message
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <button onClick={() => setShowApplicants(null)} className="w-full mt-6 bg-gray-200 py-3 rounded-xl font-bold hover:bg-gray-300">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Delete Campaign?</h2>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to delete "<strong>{deleteConfirm.title}</strong>"?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteCampaign(deleteConfirm._id)}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
                <div className="space-y-6">
                    {myCampaigns.length === 0 ? (
                        <div className="text-center p-12 bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
                            <p className="text-3xl mb-4 text-gray-400">—</p>
                            <p className="text-xl text-gray-500 font-medium mb-4">You haven't posted any campaigns yet.</p>
                            <button onClick={() => setShowCreate(true)} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg">
                                + Create Your First Campaign
                            </button>
                        </div>
                    ) : (
                        myCampaigns.map((camp) => (
                            <div key={camp._id} className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-green-500">
                                <div className="flex flex-col md:flex-row justify-between">
                                    <div className="mb-4 md:mb-0 flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900">{camp.title}</h3>
                                        <p className="text-gray-600 max-w-xl mt-1">{camp.description}</p>
                                        <div className="mt-3 flex flex-wrap gap-3">
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                                Active
                                            </span>
                                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                                                ${getBudgetDisplay(camp.budget)}
                                            </span>
                                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                                                {camp.applicants?.length || 0} Applicants
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <button
                                            onClick={() => setShowApplicants(camp)}
                                            className="bg-purple-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-purple-700 shadow-md"
                                        >
                                            View Applicants
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditCampaignForm({
                                                    title: camp.title,
                                                    description: camp.description,
                                                    budget: typeof camp.budget === 'object' ? camp.budget.total_amount : camp.budget
                                                });
                                                setEditCampaign(camp);
                                            }}
                                            className="bg-gray-100 text-gray-700 px-5 py-2 rounded-xl font-bold hover:bg-gray-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(camp)}
                                            className="bg-red-50 text-red-600 px-5 py-2 rounded-xl font-bold hover:bg-red-100"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-3xl shadow-sm">
                            <p className="text-3xl mb-4 text-gray-400">—</p>
                            <p className="text-xl text-gray-500">No notifications yet</p>
                            <p className="text-gray-400">When creators apply to your campaigns, you'll see it here!</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div key={notif._id} className={`p-5 rounded-2xl shadow-sm border-l-4 ${notif.read ? 'bg-gray-50 border-gray-300' : 'bg-white border-blue-500'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900">
                                            {!notif.read && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>}
                                            {notif.title}
                                        </h4>
                                        <p className="text-gray-600 mt-1">{notif.message}</p>
                                        <p className="text-sm text-gray-400 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            // Mark notification as read
                                            if (!notif.read) {
                                                markNotificationRead(notif._id);
                                            }
                                            const camp = myCampaigns.find(c => c._id === notif.campaign_id);
                                            if (camp) setShowApplicants(camp);
                                        }}
                                        className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-200"
                                    >
                                        View Applicants
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[400px]">
                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-200">
                            <h3 className="font-bold text-gray-800">Conversations</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {myCampaigns.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">No conversations yet.</div>
                            ) : (
                                myCampaigns.filter(c => c.applicants?.length > 0).map((camp) => (
                                    camp.applicants?.map((creatorId) => {
                                        const name = applicantNames[creatorId] || 'Creator';
                                        return (
                                            <div
                                                key={`${camp._id}-${creatorId}`}
                                                onClick={() => {
                                                    setSelectedChat({
                                                        campaign_id: camp._id,
                                                        campaign_title: camp.title,
                                                        creator_id: creatorId,
                                                        creator_name: name
                                                    });
                                                    loadMessages(camp._id, creatorId);
                                                }}
                                                className={`p-4 cursor-pointer hover:bg-blue-50 transition ${selectedChat?.creator_id === creatorId && selectedChat?.campaign_id === camp._id ? 'bg-blue-100' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700">
                                                        {name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{name}</p>
                                                        <p className="text-sm text-gray-500 truncate">Re: {camp.title}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ))
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col">
                        {selectedChat ? (
                            <>
                                <div className="bg-gray-50 p-4 border-b border-gray-200">
                                    <h3 className="font-bold text-gray-800">Chat with {selectedChat.creator_name}</h3>
                                    <p className="text-sm text-gray-500">Campaign: {selectedChat.campaign_title}</p>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto min-h-[200px] bg-gray-50">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-gray-400 py-10">
                                            <p className="text-2xl mb-2 text-gray-400">—</p>
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {messages.map((msg, idx) => {
                                                const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                const isMe = msg.sender_id === user.user_id;
                                                return (
                                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-xs p-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
                                                            <p>{msg.content}</p>
                                                            <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                                                {new Date(msg.created_at).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-gray-200 flex space-x-3">
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
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

            {/* Edit Campaign Modal */}
            {editCampaign && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl">
                        <h2 className="text-2xl font-black mb-6">Edit Campaign</h2>

                        <label className="block text-gray-700 font-bold mb-2">Title</label>
                        <input
                            type="text"
                            className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-4"
                            value={editCampaignForm.title}
                            onChange={e => setEditCampaignForm({ ...editCampaignForm, title: e.target.value })}
                        />

                        <label className="block text-gray-700 font-bold mb-2">Description</label>
                        <textarea
                            className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-4 resize-none"
                            rows={3}
                            value={editCampaignForm.description}
                            onChange={e => setEditCampaignForm({ ...editCampaignForm, description: e.target.value })}
                        />

                        <label className="block text-gray-700 font-bold mb-2">Budget ($)</label>
                        <input
                            type="number"
                            className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-6"
                            value={editCampaignForm.budget}
                            onChange={e => setEditCampaignForm({ ...editCampaignForm, budget: e.target.value })}
                        />

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setEditCampaign(null)}
                                className="flex-1 bg-gray-200 py-3 rounded-xl font-bold hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch(`${API_BASE}/api/campaigns/${editCampaign._id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                title: editCampaignForm.title,
                                                description: editCampaignForm.description,
                                                budget: parseInt(editCampaignForm.budget)
                                            })
                                        });
                                        if (res.ok) {
                                            showToast('success', 'Campaign updated!');
                                            setEditCampaign(null);
                                            loadCampaigns();
                                        } else {
                                            showToast('error', 'Failed to update campaign.');
                                        }
                                    } catch {
                                        showToast('error', 'Connection error. Try again.');
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

            {/* Edit Business Profile Modal */}
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
                        <h2 className="text-2xl font-black mb-6">Edit Business Profile</h2>

                        <label className="block text-gray-700 font-bold mb-2">Business Name</label>
                        <input
                            type="text"
                            className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-4"
                            value={editProfileForm.name}
                            onChange={e => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                            placeholder="Your business name"
                        />

                        <label className="block text-gray-700 font-bold mb-2">Business Type</label>
                        <select
                            className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-4"
                            value={editProfileForm.business_type}
                            onChange={e => setEditProfileForm({ ...editProfileForm, business_type: e.target.value })}
                        >
                            <option value="">Select type...</option>
                            <option value="tech">Tech & Electronics</option>
                            <option value="fashion">Fashion & Apparel</option>
                            <option value="food">Food & Beverage</option>
                            <option value="beauty">Beauty & Cosmetics</option>
                            <option value="fitness">Health & Fitness</option>
                            <option value="travel">Travel & Hospitality</option>
                            <option value="entertainment">Entertainment & Media</option>
                            <option value="finance">Finance & Banking</option>
                            <option value="other">Other</option>
                        </select>

                        <label className="block text-gray-700 font-bold mb-2">Description</label>
                        <textarea
                            className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-4 resize-none"
                            rows={3}
                            value={editProfileForm.description}
                            onChange={e => setEditProfileForm({ ...editProfileForm, description: e.target.value })}
                            placeholder="Tell creators about your business..."
                        />

                        <label className="block text-gray-700 font-bold mb-2">Logo URL</label>
                        <input
                            type="text"
                            className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-4"
                            value={editProfileForm.logo_url}
                            onChange={e => setEditProfileForm({ ...editProfileForm, logo_url: e.target.value })}
                            placeholder="https://example.com/logo.png"
                        />

                        <label className="block text-gray-700 font-bold mb-2">Banner URL</label>
                        <input
                            type="text"
                            className="w-full text-lg p-3 border-2 border-gray-300 rounded-xl mb-4"
                            value={editProfileForm.banner_url}
                            onChange={e => setEditProfileForm({ ...editProfileForm, banner_url: e.target.value })}
                            placeholder="https://example.com/banner.png"
                        />

                        <div className="flex space-x-4 mt-4">
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
                                        const res = await fetch(`${API_BASE}/api/businesses/${user.user_id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(editProfileForm)
                                        });
                                        if (res.ok) {
                                            setProfile({ ...profile, ...editProfileForm });
                                            showToast('success', 'Profile updated!');
                                            setShowEditProfile(false);
                                        } else {
                                            showToast('error', 'Could not save profile.');
                                        }
                                    } catch {
                                        showToast('error', 'Connection error. Try again.');
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
        </div>
    );
};

export default BusinessDashboard;
