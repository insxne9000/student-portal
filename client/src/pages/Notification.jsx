import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, CheckCircle2, CreditCard, FileCheck2, MessageSquareText, Info } from 'lucide-react';

function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('/api/student/notifications');
                setNotifications(response.data.notifications || []);
            } catch {
                setNotifications([
                    {
                        id: 'fallback-error',
                        category: 'general',
                        title: 'Notifications Unavailable',
                        message: 'Notifications could not be loaded right now. Please check again later.',
                        createdAt: new Date().toISOString(),
                        type: 'warning',
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const formatDate = (dateValue) => {
        const date = new Date(dateValue);
        return date.toLocaleString();
    };

    const getIcon = (category) => {
        switch (category) {
            case 'payment':
                return <CreditCard size={18} />;
            case 'complaint':
                return <MessageSquareText size={18} />;
            case 'result':
                return <FileCheck2 size={18} />;
            default:
                return <Info size={18} />;
        }
    };

    const getTone = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-700';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-700';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-700';
        }
    };

    return (
        <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6]">
            <div className="flex-grow px-4 py-6 sm:px-6 lg:px-10 lg:py-8 max-w-[1200px] mx-auto w-full">
                <div className="mb-8 rounded-[28px] bg-gradient-to-r from-[#510443] to-[#870873] p-6 text-white shadow-lg sm:p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Bell size={24} />
                        <h1 className="text-3xl font-black">Notifications</h1>
                    </div>
                    <p className="text-white/85">
                        Receive important updates when your payment is confirmed, your complaint is resolved, or your result is released.
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3">
                        <h2 className="text-2xl font-bold text-[#1f2937]">Notification List</h2>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#510443]/10 px-3 py-1 text-sm font-semibold text-[#510443]">
                            <CheckCircle2 size={16} /> {notifications.length} item(s)
                        </span>
                    </div>

                    <div className="p-6 min-h-[300px]">
                        {loading ? (
                            <div className="py-10 text-center text-gray-500">Loading notifications...</div>
                        ) : (
                            <div className="space-y-4">
                                {notifications.map((item, index) => (
                                    <div key={item.id} className="rounded-2xl border border-gray-200 p-5">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full border ${getTone(item.type)}`}>
                                                    {getIcon(item.category)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Notification {index + 1}</p>
                                                    <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                                                    <p className="mt-2 text-sm text-gray-600">{item.message}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 sm:text-right">{formatDate(item.createdAt)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Notification;
