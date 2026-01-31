import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

// Friendly error messages
const getFriendlyError = (error) => {
    if (error.includes('already exists') || error.includes('duplicate')) {
        return "This email is already registered. Try logging in instead.";
    }
    if (error.includes('Failed to fetch') || error.includes('Network')) {
        return "Couldn't connect. Please check your internet.";
    }
    if (error.includes('password')) {
        return "Please choose a stronger password (at least 6 characters).";
    }
    return error || "Something went wrong. Please try again.";
};

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        industry: '',
        categories: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const nextStep = () => {
        setError('');
        setStep(step + 1);
    };
    const prevStep = () => {
        setError('');
        setStep(step - 1);
    };

    const handleRegister = async () => {
        setError('');
        setLoading(true);

        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: role
        };

        if (role === 'creator') {
            payload.categories = formData.categories.split(',').map(c => c.trim());
            payload.industry = 'influencer';
        } else {
            payload.industry = formData.industry;
        }

        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (!response.ok) {
                setError(getFriendlyError(data.error || 'Registration failed'));
                setLoading(false);
                return;
            }

            navigate('/login');
        } catch (err) {
            setError(getFriendlyError(err.message));
            setLoading(false);
        }
    };

    const stepLabels = ['Your Info', 'Choose Role', 'Final Details'];

    return (
        <div className="max-w-2xl mx-auto mt-8 px-4 animate-fade-in">
            {/* Progress Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    {stepLabels.map((label, idx) => (
                        <div key={idx} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                ${step > idx + 1 ? 'bg-green-500 text-white' :
                                    step === idx + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {step > idx + 1 ? '✓' : idx + 1}
                            </div>
                            <span className={`ml-2 font-medium hidden sm:inline
                                ${step === idx + 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                                {label}
                            </span>
                            {idx < 2 && <div className="w-8 sm:w-16 h-1 mx-2 bg-gray-200 rounded"></div>}
                        </div>
                    ))}
                </div>
                <p className="text-center text-lg text-gray-500">Step {step} of 3</p>
            </div>

            {/* Main Card */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100">

                {/* Error Message */}
                {error && (
                    <div className="error-box mb-6">
                        <span className="text-2xl">😕</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* STEP 1: CREDENTIALS */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-gray-900">Let's get started</h2>
                        <p className="text-lg text-gray-500">Enter your basic information</p>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-gray-700 font-bold mb-2 text-lg">
                                    👤 Your Name
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-large"
                                    placeholder="Alex Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-bold mb-2 text-lg">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-large"
                                    placeholder="alex@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-bold mb-2 text-lg">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-large pr-12"
                                        placeholder="At least 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl hover:opacity-70 transition"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (formData.name && formData.email && formData.password) {
                                    nextStep();
                                } else {
                                    setError("Please fill in all fields");
                                }
                            }}
                            className="btn-primary w-full text-xl py-4"
                        >
                            Next: Choose Role →
                        </button>
                    </div>
                )}

                {/* STEP 2: ROLE */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-gray-900">How will you use Linkfluence?</h2>
                        <p className="text-lg text-gray-500">Choose your account type</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                onClick={() => setRole('creator')}
                                className={`cursor-pointer p-8 rounded-2xl border-4 transition-all hover:scale-105 text-center
                                ${role === 'creator' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                            >
                                <div className="text-6xl mb-4">🎨</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm a Creator</h3>
                                <p className="text-gray-600">I want to find brand deals</p>
                            </div>

                            <div
                                onClick={() => setRole('business')}
                                className={`cursor-pointer p-8 rounded-2xl border-4 transition-all hover:scale-105 text-center
                                ${role === 'business' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
                            >
                                <div className="text-5xl mb-4 text-blue-600 font-black">B</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm a Business</h3>
                                <p className="text-gray-600">I want to hire creators</p>
                            </div>
                        </div>

                        <div className="flex space-x-4 pt-4">
                            <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-700 text-xl font-bold py-4 rounded-xl hover:bg-gray-200">
                                ← Back
                            </button>
                            <button
                                onClick={() => { if (role) nextStep(); else setError("Please select a role"); }}
                                disabled={!role}
                                className="btn-primary flex-1 text-xl py-4 disabled:opacity-50"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: DETAILS */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-gray-900">
                            {role === 'creator' ? 'Almost done!' : 'Almost done!'}
                        </h2>
                        <p className="text-lg text-gray-500">
                            {role === 'creator' ? 'Tell us about your content' : 'Tell us about your business'}
                        </p>

                        {role === 'creator' ? (
                            <div>
                                <label className="block text-gray-700 font-bold mb-2 text-lg">
                                    What type of creator are you?
                                </label>
                                <p className="text-gray-500 mb-3">Select your primary content category</p>
                                <select
                                    name="categories"
                                    value={formData.categories}
                                    onChange={handleChange}
                                    className="input-large"
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
                            </div>
                        ) : (
                            <div>
                                <label className="block text-gray-700 font-bold mb-2 text-lg">
                                    🏭 What industry are you in?
                                </label>
                                <p className="text-gray-500 mb-3">e.g., Fashion, Technology, Health</p>
                                <input
                                    name="industry"
                                    type="text"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    className="input-large"
                                    placeholder="Fashion, Technology, etc."
                                />
                            </div>
                        )}

                        <div className="flex space-x-4 pt-4">
                            <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-700 text-xl font-bold py-4 rounded-xl hover:bg-gray-200">
                                ← Back
                            </button>
                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className="flex-1 bg-green-600 text-white text-xl font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Login Link */}
            <p className="text-center mt-8 text-lg text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-bold hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    );
};

export default Register;
