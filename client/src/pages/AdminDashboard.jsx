import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Users, 
    CreditCard, 
    MessageSquare, 
    ShieldCheck, 
    BookOpen, 
    Search, 
    Filter, 
    CheckCircle, 
    Clock, 
    Plus, 
    Send, 
    Check, 
    Sparkles, 
    RefreshCw, 
    GraduationCap, 
    DollarSign, 
    AlertCircle, 
    ArrowRight, 
    X,
    UserCheck,
    FileText
} from 'lucide-react';

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'financials' | 'complaints' | 'clearances' | 'courses'
    
    // Core Data States
    const [groupedStudents, setGroupedStudents] = useState({});
    const [allStudents, setAllStudents] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [clearances, setClearances] = useState([]);
    const [courses, setCourses] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState('');

    // Directory Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [batchFilter, setBatchFilter] = useState('all');

    // Complaint Answer Modal / State
    const [answeringComplaint, setAnsweringComplaint] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replySubmitting, setReplySubmitting] = useState(false);

    // Course Recommendation State
    const [recommendBatch, setRecommendBatch] = useState('2022');
    const [recommendSemester, setRecommendSemester] = useState('1');
    const [recommending, setRecommending] = useState(false);

    // Add Course Modal State
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({
        courseCode: '',
        title: '',
        credits: 3,
        level: 100,
        semester: 1,
        remarks: 'Core',
        degree: 'Computer Science',
        fee: 10000
    });

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [studRes, invRes, compRes, clearRes, crsRes] = await Promise.all([
                axios.get('/api/admin/students'),
                axios.get('/api/admin/invoices').catch(() => ({ data: { invoices: [] } })),
                axios.get('/api/admin/complaints').catch(() => ({ data: { complaints: [] } })),
                axios.get('/api/admin/clearances').catch(() => ({ data: { clearances: [] } })),
                axios.get('/api/courses').catch(() => ({ data: { courses: [] } }))
            ]);

            const grouped = studRes.data.grouped || {};
            setGroupedStudents(grouped);
            
            // Flatten students list for easy search/kpi
            const flat = Object.values(grouped).flat();
            setAllStudents(flat);

            setInvoices(invRes.data.invoices || []);
            setComplaints(compRes.data.complaints || []);
            setClearances(clearRes.data.clearances || []);
            setCourses(crsRes.data.courses || []);

            setError('');
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError('Failed to load administration data. Please check your backend connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const showNotification = (msg) => {
        setActionMessage(msg);
        setTimeout(() => setActionMessage(''), 4000);
    };

    // Calculate High-level KPI Stats
    const totalStudentsCount = allStudents.length;
    const pendingInvoicesCount = invoices.filter(i => i.status !== 'paid').length;
    const pendingComplaintsCount = complaints.filter(c => c.status === 'pending').length;
    const pendingClearancesCount = clearances.reduce((acc, c) => {
        const pendingItems = (c.clearance?.items || []).filter(i => i.status !== 'Approved').length;
        return acc + pendingItems;
    }, 0);

    // Handlers
    const handleApprovePayment = async (invoiceId, studentId) => {
        try {
            await axios.put(`/api/admin/students/${studentId}/payment/${invoiceId}`);
            showNotification("Payment approved successfully! Grade placeholders initialized for student.");
            fetchAllData();
        } catch (err) {
            alert("Failed to approve payment.");
        }
    };

    const handleAnswerTicket = async (e) => {
        e.preventDefault();
        if (!answeringComplaint) return;
        setReplySubmitting(true);
        try {
            await axios.put(`/api/admin/complaints/${answeringComplaint._id}/answer`, {
                responseText: replyText,
                markResolved: false
            });
            showNotification(`Response sent to ticket ${answeringComplaint.ticketId}.`);
            setAnsweringComplaint(null);
            setReplyText('');
            fetchAllData();
        } catch (err) {
            alert("Failed to send response.");
        } finally {
            setReplySubmitting(false);
        }
    };

    const handleResolveTicket = async (complaintId) => {
        try {
            await axios.put(`/api/admin/complaints/${complaintId}/answer`, { markResolved: true });
            showNotification("Ticket marked as resolved.");
            fetchAllData();
        } catch (err) {
            alert("Failed to resolve ticket.");
        }
    };

    const handleToggleClearance = async (studentId, label, currentStatus) => {
        const newStatus = currentStatus === 'Approved' ? 'Pending' : 'Approved';
        try {
            await axios.put(`/api/admin/students/${studentId}/clearance`, {
                label,
                status: newStatus
            });
            showNotification(`Updated ${label} to ${newStatus}.`);
            fetchAllData();
        } catch (err) {
            alert("Failed to update clearance status.");
        }
    };

    const handleRecommendCourses = async () => {
        setRecommending(true);
        try {
            const res = await axios.post('/api/admin/recommend-courses', {
                batch: recommendBatch,
                semester: Number(recommendSemester)
            });
            showNotification(res.data.message || `Recommended courses generated for Batch ${recommendBatch}.`);
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to recommend courses.");
        } finally {
            setRecommending(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/courses', newCourse);
            showNotification(`Course ${newCourse.courseCode} added to curriculum.`);
            setIsCourseModalOpen(false);
            setNewCourse({
                courseCode: '',
                title: '',
                credits: 3,
                level: 100,
                semester: 1,
                remarks: 'Core',
                degree: 'Computer Science',
                fee: 10000
            });
            fetchAllData();
        } catch (err) {
            alert("Failed to add course.");
        }
    };

    // Filtered Student List
    const filterStudents = () => {
        return allStudents.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  student.matricNo.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesBatch = batchFilter === 'all' || student.batch === batchFilter;
            return matchesSearch && matchesBatch;
        });
    };

    const filteredStudents = filterStudents();
    const availableBatches = Array.from(new Set(allStudents.map(s => s.batch))).sort();

    return (
        <div className="max-w-7xl mx-auto pb-20 font-sans">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-[#510443] rounded-3xl p-8 text-white shadow-xl mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-pink-300 mb-3 backdrop-blur-md">
                        <Sparkles size={14} /> Administration Command Portal
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">CS Department Academic & Operations Hub</h1>
                    <p className="text-white/70 mt-1 max-w-xl text-sm leading-relaxed">
                        Manage student dossiers, approve tuition payments, answer support complaints, issue departmental clearances, and configure course recommendations.
                    </p>
                </div>
                <div className="z-10 flex gap-3">
                    <button 
                        onClick={fetchAllData}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Portal Data
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {actionMessage && (
                <div className="mb-6 bg-green-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-bounce">
                    <CheckCircle size={20} />
                    <span>{actionMessage}</span>
                </div>
            )}

            {/* Key Analytics KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Stat 1: Total Students */}
                <div 
                    onClick={() => setActiveTab('directory')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                >
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Enrolled</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{totalStudentsCount}</h3>
                        <p className="text-xs text-green-600 font-semibold mt-1">Active Students</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#510443] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users size={26} />
                    </div>
                </div>

                {/* Stat 2: Pending Invoices */}
                <div 
                    onClick={() => setActiveTab('financials')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                >
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Payment Approvals</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{pendingInvoicesCount}</h3>
                        <p className="text-xs text-amber-600 font-semibold mt-1">Pending Action</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CreditCard size={26} />
                    </div>
                </div>

                {/* Stat 3: Open Complaints */}
                <div 
                    onClick={() => setActiveTab('complaints')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                >
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Support Tickets</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{pendingComplaintsCount}</h3>
                        <p className="text-xs text-rose-600 font-semibold mt-1">Open Tickets</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare size={26} />
                    </div>
                </div>

                {/* Stat 4: Pending Clearances */}
                <div 
                    onClick={() => setActiveTab('clearances')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                >
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Clearances Pending</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{pendingClearancesCount}</h3>
                        <p className="text-xs text-blue-600 font-semibold mt-1">Checkpoints</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldCheck size={26} />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-gray-200/60 p-1.5 rounded-2xl border border-gray-200">
                {[
                    { id: 'directory', label: 'Student Directory', icon: <Users size={18} />, count: totalStudentsCount },
                    { id: 'financials', label: 'Financial Approvals', icon: <CreditCard size={18} />, count: pendingInvoicesCount },
                    { id: 'complaints', label: 'Support & Tickets', icon: <MessageSquare size={18} />, count: pendingComplaintsCount },
                    { id: 'clearances', label: 'Clearance Management', icon: <ShieldCheck size={18} />, count: pendingClearancesCount },
                    { id: 'courses', label: 'Course Catalog & Recommendations', icon: <BookOpen size={18} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                            activeTab === tab.id 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                                activeTab === tab.id ? 'bg-[#510443] text-white' : 'bg-gray-300 text-gray-700'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab 1: Student Directory */}
            {activeTab === 'directory' && (
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    {/* Controls Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                        <div className="relative w-full sm:w-80">
                            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search student name or matric..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#510443]"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <Filter size={18} className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-600">Batch Filter:</span>
                            <select 
                                value={batchFilter}
                                onChange={(e) => setBatchFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:border-[#510443]"
                            >
                                <option value="all">All Batches ({allStudents.length})</option>
                                {availableBatches.map(b => (
                                    <option key={b} value={b}>Batch {b}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase">Matric No.</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase">Full Name</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-center">Batch</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-center">Semester</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-center">Credits Completed</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-400 font-medium">
                                            No students found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => {
                                        const isGraduated = student.creditsCompleted >= student.creditsRequired;
                                        return (
                                            <tr key={student._id} className="border-b border-gray-100 hover:bg-purple-50/20 transition-colors">
                                                <td className="py-4 px-6 font-bold text-gray-900">{student.matricNo}</td>
                                                <td className="py-4 px-6 font-medium text-gray-800">
                                                    <div>{student.name}</div>
                                                    <div className="text-xs text-gray-400 font-normal">{student.degree}</div>
                                                </td>
                                                <td className="py-4 px-6 text-center font-bold text-gray-600">{student.batch}</td>
                                                <td className="py-4 px-6 text-center font-bold text-gray-700">Sem {student.currentSemester}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                        isGraduated ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-[#510443]'
                                                    }`}>
                                                        {student.creditsCompleted} / {student.creditsRequired}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button 
                                                        onClick={() => navigate(`/admin/student/${student._id}`)}
                                                        className="inline-flex items-center gap-1.5 text-white bg-[#510443] hover:bg-[#781763] font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                                                    >
                                                        View Dossier <ArrowRight size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Financial Approvals */}
            {activeTab === 'financials' && (
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Student Tuition & Fee Ledger</h2>
                            <p className="text-sm text-gray-500">Review student invoices and approve payment records to unlock results.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase">Student Name</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase">Matric No.</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-center">Semester</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-right">Total Due</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-center">Status</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 ? (
                                    <tr><td colSpan="6" className="py-12 text-center text-gray-400">No invoice records found in database.</td></tr>
                                ) : (
                                    invoices.map(inv => {
                                        const sName = inv.studentId?.name || 'N/A';
                                        const sMatric = inv.studentId?.matricNo || 'N/A';
                                        const isPaid = inv.status === 'paid';

                                        return (
                                            <tr key={inv._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-6 font-bold text-gray-900">{sName}</td>
                                                <td className="py-4 px-6 text-gray-600 font-medium">{sMatric}</td>
                                                <td className="py-4 px-6 text-center font-bold text-gray-700">Sem {inv.semester}</td>
                                                <td className="py-4 px-6 text-right font-black text-gray-900">₦{inv.totalAmountDue.toLocaleString()}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        isPaid ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                                                    }`}>
                                                        {inv.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    {!isPaid ? (
                                                        <button 
                                                            onClick={() => handleApprovePayment(inv._id, inv.studentId?._id || inv.studentId)}
                                                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                                                        >
                                                            Approve Payment
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1 justify-end">
                                                            <CheckCircle size={14} className="text-green-600" /> Approved
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Support & Complaints */}
            {activeTab === 'complaints' && (
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Student Support Ticket Resolution Center</h2>
                        <p className="text-sm text-gray-500">Read tickets, send formal admin text replies, and resolve student issues.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {complaints.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                                No support tickets submitted by students yet.
                            </div>
                        ) : (
                            complaints.map(ticket => {
                                const studentName = ticket.studentId?.name || 'Student';
                                const matric = ticket.studentId?.matricNo || '';

                                return (
                                    <div key={ticket._id} className="bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-md">{ticket.ticketId}</span>
                                                    <h4 className="font-bold text-gray-900 text-base mt-2">{ticket.title}</h4>
                                                    <p className="text-xs font-medium text-gray-500">{studentName} ({matric})</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                                    ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                    ticket.status === 'answered' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {ticket.status}
                                                </span>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-gray-100 text-sm text-gray-700 mb-4">
                                                {ticket.description}
                                            </div>

                                            {ticket.adminResponse && (
                                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-xs text-purple-900 mb-4">
                                                    <span className="font-bold text-purple-700 block mb-1">Admin Reply:</span>
                                                    {ticket.adminResponse}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            {ticket.status !== 'resolved' && (
                                                <>
                                                    <button 
                                                        onClick={() => {
                                                            setAnsweringComplaint(ticket);
                                                            setReplyText(ticket.adminResponse || '');
                                                        }}
                                                        className="flex-1 bg-[#510443] hover:bg-[#781763] text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                                    >
                                                        Reply to Student
                                                    </button>
                                                    <button 
                                                        onClick={() => handleResolveTicket(ticket._id)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                                    >
                                                        Mark Resolved
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Tab 4: Clearance Management */}
            {activeTab === 'clearances' && (
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Departmental Clearance Control</h2>
                        <p className="text-sm text-gray-500">Toggle clearance checkpoint approvals per student to unlock PDF certificates on student portal.</p>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase">Student Name</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase">Matric No.</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-center">Progress</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase">Clearance Checkpoints</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clearances.length === 0 ? (
                                    <tr><td colSpan="4" className="py-12 text-center text-gray-400">No clearance records found.</td></tr>
                                ) : (
                                    clearances.map(c => {
                                        const sName = c.student?.name || 'N/A';
                                        const sMatric = c.student?.matricNo || 'N/A';
                                        const items = c.clearance?.items || [];
                                        const sId = c.studentId;

                                        return (
                                            <tr key={c.dashboardId} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-6 font-bold text-gray-900">{sName}</td>
                                                <td className="py-4 px-6 text-gray-600 font-medium">{sMatric}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
                                                        {c.clearance?.completed || 0} / {c.clearance?.total || 6}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {items.map((item, idx) => {
                                                            const isApproved = item.status === 'Approved';
                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => handleToggleClearance(sId, item.label, item.status)}
                                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                                        isApproved 
                                                                        ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' 
                                                                        : 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'
                                                                    }`}
                                                                >
                                                                    {isApproved ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                                    {item.label}: {item.status}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 5: Course Catalog & Recommendations */}
            {activeTab === 'courses' && (
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    {/* Course Recommendation Box */}
                    <div className="bg-gradient-to-br from-purple-900 to-[#510443] p-6 rounded-2xl text-white mb-8 shadow-md">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Sparkles size={20} /> Batch Course Recommendation Engine
                        </h3>
                        <p className="text-white/80 text-sm mb-4">
                            Auto-assign degree curriculum courses as recommended courses for an entire batch of students for the upcoming semester.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <div>
                                <label className="block text-xs font-bold text-white/70 mb-1">Batch Year</label>
                                <select 
                                    value={recommendBatch}
                                    onChange={(e) => setRecommendBatch(e.target.value)}
                                    className="bg-white text-gray-900 font-bold px-4 py-2 rounded-xl text-sm outline-none cursor-pointer"
                                >
                                    <option value="2022">Batch 2022 (Year 1)</option>
                                    <option value="2023">Batch 2023 (Year 2)</option>
                                    <option value="2021">Batch 2021 (Year 3)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/70 mb-1">Target Semester</label>
                                <select 
                                    value={recommendSemester}
                                    onChange={(e) => setRecommendSemester(e.target.value)}
                                    className="bg-white text-gray-900 font-bold px-4 py-2 rounded-xl text-sm outline-none cursor-pointer"
                                >
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                    <option value="3">Semester 3</option>
                                    <option value="4">Semester 4</option>
                                </select>
                            </div>

                            <div className="self-end">
                                <button 
                                    onClick={handleRecommendCourses}
                                    disabled={recommending}
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {recommending ? 'Generating...' : 'Generate Batch Recommendations'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Course Catalog */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Curriculum Course Catalog</h2>
                            <p className="text-sm text-gray-500">View registered department courses across levels.</p>
                        </div>
                        <button 
                            onClick={() => setIsCourseModalOpen(true)}
                            className="bg-[#510443] hover:bg-[#781763] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                            <Plus size={16} /> Add New Course
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                <tr>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase">Code</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase">Course Title</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-center">Level</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-center">Semester</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-center">Credits</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase text-center">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((crs) => (
                                    <tr key={crs._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-6 font-black text-gray-900">{crs.courseCode}</td>
                                        <td className="py-4 px-6 font-medium text-gray-800">{crs.title}</td>
                                        <td className="py-4 px-6 text-center font-bold text-gray-600">{crs.level}L</td>
                                        <td className="py-4 px-6 text-center font-bold text-gray-600">Sem {crs.semester}</td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="bg-purple-100 text-[#510443] font-bold px-3 py-1 rounded-full text-xs">
                                                {crs.credits} Units
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center font-medium text-gray-500">{crs.remarks || 'Core'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Answer Ticket Modal */}
            {answeringComplaint && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-[#510443] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Respond to Ticket {answeringComplaint.ticketId}</h3>
                            <button onClick={() => setAnsweringComplaint(null)} className="text-white/70 hover:text-white text-xl font-bold">×</button>
                        </div>
                        <form onSubmit={handleAnswerTicket} className="p-6">
                            <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Ticket Title</p>
                                <p className="text-sm font-bold text-gray-900">{answeringComplaint.title}</p>
                                <p className="text-xs text-gray-600 mt-2">{answeringComplaint.description}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-800 text-sm font-bold mb-2">Admin Official Response</label>
                                <textarea 
                                    required
                                    rows="4"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your response to the student..."
                                    className="w-full border border-gray-300 px-3 py-2 rounded-xl focus:outline-none focus:border-[#510443] text-sm"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setAnsweringComplaint(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl font-bold text-sm">Cancel</button>
                                <button type="submit" disabled={replySubmitting} className="px-5 py-2 text-white bg-[#510443] hover:bg-[#781763] rounded-xl font-bold text-sm">
                                    {replySubmitting ? 'Sending...' : 'Send Response'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Course Modal */}
            {isCourseModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-[#510443] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Add New Course</h3>
                            <button onClick={() => setIsCourseModalOpen(false)} className="text-white/70 hover:text-white text-xl font-bold">×</button>
                        </div>
                        <form onSubmit={handleCreateCourse} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Course Code</label>
                                <input required type="text" placeholder="e.g. CSC 407" value={newCourse.courseCode} onChange={e => setNewCourse({...newCourse, courseCode: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-xl text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                                <input required type="text" placeholder="Course title..." value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-xl text-sm" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Credits</label>
                                    <input required type="number" min="1" max="6" value={newCourse.credits} onChange={e => setNewCourse({...newCourse, credits: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-xl text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Level</label>
                                    <input required type="number" value={newCourse.level} onChange={e => setNewCourse({...newCourse, level: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-xl text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Semester</label>
                                    <input required type="number" min="1" max="2" value={newCourse.semester} onChange={e => setNewCourse({...newCourse, semester: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-xl text-sm" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl font-bold text-sm">Cancel</button>
                                <button type="submit" className="px-5 py-2 text-white bg-[#510443] hover:bg-[#781763] rounded-xl font-bold text-sm">Create Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminDashboard;
