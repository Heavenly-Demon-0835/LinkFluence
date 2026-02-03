import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

// Friendly error messages
const getFriendlyError = (error) => {
    if (error.includes('Invalid credentials') || error.includes('401')) {
        return "Wrong email or password. Please try again.";
    }
    if (error.includes('Failed to fetch') || error.includes('Network')) {
        return "Couldn't connect. Please check your internet.";
    }
    if (error.includes('500') || error.includes('Server')) {
        return "Something went wrong. Please try again later.";
    }
    return error || "Something went wrong. Please try again.";
};

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(getFriendlyError(data.error || 'Login failed'));
                setLoading(false);
                return;
            }

            localStorage.setItem('user', JSON.stringify(data));

            // Redirect to home (which will smart-redirect to discover)
            navigate('/');
        } catch (err) {
            setError(getFriendlyError(err.message));
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-gray-900 mb-3">Welcome Back</h1>
                <p className="text-xl text-gray-500">Sign in to your account</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-box mb-6">
                    <span className="text-2xl">😕</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">

                {/* Email Field */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2 text-lg">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-large"
                        required
                    />
                </div>

                {/* Password Field */}
                <div className="mb-8">
                    <label className="block text-gray-700 font-bold mb-2 text-lg">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password"
                            className="input-large pr-12"
                            required
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

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full text-xl py-4"
                >
                    {loading ? (
                        <>Signing in...</>
                    ) : (
                        <>Sign In →</>
                    )}
                </button>
            </form>

            {/* Register Link */}
            <p className="text-center mt-8 text-lg text-gray-600">
                New here?{' '}
                <Link to="/register" className="text-blue-600 font-bold hover:underline">
                    Create an account
                </Link>
            </p>
        </div>
    );
};

export default Login;
