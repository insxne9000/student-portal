import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Eye, Rocket, Clock, ArrowRight } from 'lucide-react';

function Complaints() {
    const [complaints, setComplaints] = useState([]);
    const [summary, setSummary] = useState({ total: 0, answered: 0, resolved: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({ title: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await axios.get(`${apiBaseUrl}/api/student/complaints`);
            setComplaints(response.data.complaints);
            setSummary(response.data.summary);
            setError('');
        } catch (err) {
            setError('Failed to fetch complaints');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            await axios.post(`${apiBaseUrl}/api/student/complaints`, newTicket);
            setIsModalOpen(false);
            setNewTicket({ title: '', description: '' });
            fetchComplaints(); // refresh data
        } catch (err) {
            alert('Failed to create ticket. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-orange-400 text-white';
            case 'resolved': return 'bg-green-500 text-white';
            case 'answered': return 'bg-blue-500 text-white';
            default: return 'bg-gray-400 text-white';
        }
    };

    return (
        <main className="px-10 py-8 max-w-[1200px] mx-auto min-h-screen bg-slate-50">
            <h1 className="text-xl font-bold text-gray-800 mb-6">Complaints</h1>

            {/* Dashboard Banner & Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                
                {/* Hero Banner */}
                <div className="lg:col-span-2 bg-gradient-to-br from-[#2a0e3b] to-[#510443] rounded-sm p-8 text-white flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden">
                    <div className="absolute top-4 right-4 opacity-10">
                        <MessageSquare size={64} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 z-10">Complaints Dashboard</h2>
                    <p className="text-sm text-white/80 mb-6 z-10">
                        Post your problems here. Our administration will resolve your issues as soon as possible.
                    </p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#781763] hover:bg-[#870873] transition-colors text-white px-6 py-2.5 rounded text-sm font-medium flex items-center gap-2 z-10 shadow-lg"
                    >
                        Create New Ticket <ArrowRight size={16} />
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Total */}
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="bg-blue-100 text-blue-500 w-10 h-10 rounded-sm flex items-center justify-center mb-4">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{summary.total}</div>
                            <div className="text-sm text-gray-500 font-medium">Total Complaints</div>
                        </div>
                    </div>
                    {/* Answered */}
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="bg-teal-100 text-teal-600 w-10 h-10 rounded-sm flex items-center justify-center mb-4">
                            <Eye size={20} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{summary.answered}</div>
                            <div className="text-sm text-gray-500 font-medium">Answered</div>
                        </div>
                    </div>
                    {/* Resolved */}
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="bg-sky-100 text-sky-500 w-10 h-10 rounded-sm flex items-center justify-center mb-4">
                            <Rocket size={20} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{summary.resolved}</div>
                            <div className="text-sm text-gray-500 font-medium">Resolved</div>
                        </div>
                    </div>
                    {/* Pending */}
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="bg-green-100 text-green-600 w-10 h-10 rounded-sm flex items-center justify-center mb-4">
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{summary.pending}</div>
                            <div className="text-sm text-gray-500 font-medium">Pending</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complaints Logged Table */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-200">
                <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="font-bold text-gray-800">Complaints Logged</h3>
                </div>
                
                {loading ? (
                    <div className="p-10 text-center text-gray-500">Loading complaints...</div>
                ) : error ? (
                    <div className="p-10 text-center text-red-500">{error}</div>
                ) : (
                    <div className="p-6">
                        {/* Table Controls */}
                        <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                Show 
                                <select className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#781763]">
                                    <option>10</option>
                                    <option>25</option>
                                    <option>50</option>
                                </select>
                                entries
                            </div>
                            <div className="flex items-center gap-2">
                                Search: 
                                <input type="text" className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#781763]" />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead className="bg-[#6b2a5c] text-white">
                                    <tr>
                                        <th className="py-3 px-4 font-semibold text-sm border-r border-[#854576] cursor-pointer"># <span className="text-[10px] text-white/50 ml-1">↑↓</span></th>
                                        <th className="py-3 px-4 font-semibold text-sm border-r border-[#854576] cursor-pointer">Title <span className="text-[10px] text-white/50 ml-1">↑↓</span></th>
                                        <th className="py-3 px-4 font-semibold text-sm border-r border-[#854576] cursor-pointer">ID <span className="text-[10px] text-white/50 ml-1">↑↓</span></th>
                                        <th className="py-3 px-4 font-semibold text-sm border-r border-[#854576] cursor-pointer">Status <span className="text-[10px] text-white/50 ml-1">↑↓</span></th>
                                        <th className="py-3 px-4 font-semibold text-sm cursor-pointer">Date <span className="text-[10px] text-white/50 ml-1">↑↓</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complaints.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-gray-500 border-b border-gray-100">
                                                No complaints found. Create a new ticket to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        complaints.map((complaint, index) => (
                                            <tr key={complaint._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 text-gray-600 text-sm">{index + 1}</td>
                                                <td className="py-3 px-4 text-blue-500 hover:underline cursor-pointer text-sm font-medium">{complaint.title}</td>
                                                <td className="py-3 px-4 text-blue-500 hover:underline cursor-pointer text-sm">{complaint.ticketId}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${getStatusStyle(complaint.status)}`}>
                                                        {complaint.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(complaint.createdAt)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Info */}
                        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                            <div>
                                Showing {complaints.length > 0 ? 1 : 0} to {complaints.length} of {complaints.length} entries
                            </div>
                            <div className="flex bg-gray-100 rounded-sm border border-gray-200 overflow-hidden">
                                <button className="px-3 py-1.5 text-gray-500 hover:bg-gray-200" disabled>Previous</button>
                                <button className="px-3 py-1.5 bg-blue-500 text-white">1</button>
                                <button className="px-3 py-1.5 text-gray-500 hover:bg-gray-200" disabled>Next</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-[#510443] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Create New Ticket</h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-white/70 hover:text-white transition-colors text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Issue Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newTicket.title}
                                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-[#781763] focus:ring-1 focus:ring-[#781763]"
                                    placeholder="e.g., Inability to check result"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                                <textarea 
                                    required
                                    rows="4"
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-[#781763] focus:ring-1 focus:ring-[#781763]"
                                    placeholder="Describe your problem in detail..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-white bg-[#510443] hover:bg-[#781763] rounded font-medium transition-colors disabled:opacity-70"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

export default Complaints;
