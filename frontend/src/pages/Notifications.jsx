import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Notifications() {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();

    return (
        <div className="min-h-screen bg-brand-black pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                        <Bell className="text-brand-green" /> Notifications
                    </h1>
                    {notifications.length > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand-green transition-colors"
                        >
                            <CheckCheck size={16} /> Mark all as read
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-20 bg-brand-dark rounded-2xl border border-gray-800">
                            <Bell size={48} className="mx-auto text-gray-700 mb-4" />
                            <p className="text-gray-500">You're all caught up! No new notifications.</p>
                        </div>
                    ) : (
                        notifications.map((n, idx) => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => markAsRead(n.id)}
                                className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 ${n.is_read
                                        ? 'bg-brand-dark border-gray-800 opacity-75 hover:opacity-100'
                                        : 'bg-gray-900 border-brand-green/30 shadow-glow hover:border-brand-green'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`text-lg mb-1 ${!n.is_read ? 'font-bold text-white' : 'font-medium text-gray-300'}`}>
                                            {n.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{n.message}</p>

                                        {n.meta && Object.keys(n.meta).length > 0 && (
                                            <div className="mt-3 text-xs text-gray-500 bg-black/20 p-2 rounded inline-block">
                                                {Object.entries(n.meta).map(([key, val]) => (
                                                    <span key={key} className="mr-3">
                                                        <span className="font-bold text-gray-400">{key}:</span> {val}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {new Date(n.created_at).toLocaleString()}
                                        </span>
                                        {!n.is_read && (
                                            <span className="w-2 h-2 bg-brand-green rounded-full shadow-[0_0_10px_rgba(30,215,96,0.5)]"></span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
