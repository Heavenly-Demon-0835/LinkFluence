import React, { useEffect, useState } from 'react';

/**
 * Beautiful Toast Notification Component
 * Usage: <Toast message="Success!" type="success" onClose={() => {}} />
 */
const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const configs = {
        success: {
            bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
            icon: '✓',
            iconBg: 'bg-white/20'
        },
        error: {
            bg: 'bg-gradient-to-r from-red-500 to-rose-600',
            icon: '✕',
            iconBg: 'bg-white/20'
        },
        warning: {
            bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
            icon: '⚠',
            iconBg: 'bg-white/20'
        },
        info: {
            bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
            icon: 'ℹ',
            iconBg: 'bg-white/20'
        }
    };

    const config = configs[type] || configs.info;

    return (
        <div
            className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-6 z-[9999] flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl text-white font-medium sm:max-w-sm
                ${config.bg}
                ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}
            `}
            style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
        >
            {/* Icon */}
            <div className={`w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center text-lg font-bold`}>
                {config.icon}
            </div>

            {/* Message */}
            <div className="flex-1 text-sm leading-snug pr-2">
                {message}
            </div>

            {/* Close Button */}
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => {
                        setIsVisible(false);
                        onClose?.();
                    }, 300);
                }}
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xs transition-colors"
            >
                ✕
            </button>
        </div>
    );
};

export default Toast;
