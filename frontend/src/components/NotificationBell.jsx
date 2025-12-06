import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleNotificationClick = (id) => {
        markAsRead(id);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-black">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-brand-dark border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-800 flex justify-between items-center">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        <Link to="/notifications" onClick={() => setIsOpen(false)} className="text-xs text-brand-green hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.slice(0, 5).map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n.id)}
                                    className={`p-3 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${!n.is_read ? 'bg-brand-green/5' : ''}`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <p className={`text-sm ${!n.is_read ? 'font-bold text-white' : 'text-gray-300'}`}>
                                            {n.title}
                                        </p>
                                        {!n.is_read && <div className="w-2 h-2 bg-brand-green rounded-full mt-1 shrink-0" />}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-gray-600 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
