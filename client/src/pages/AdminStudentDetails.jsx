import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

function AdminStudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('academics');

    const [uploadingGrade, setUploadingGrade] = useState(null);
    const [formData, setFormData] = useState({});

    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/admin/students/${id}`);
            setData(response.data);
            
            // Initialize formData with existing attendance/scores
            const initialForm = {};
            if (response.data.grades) {
                response.data.grades.forEach(g => {
                    initialForm[g._id] = {
                        score: g.score !== undefined ? g.score : '',
                        classesAttended: g.classesAttended || 0,
                        totalClasses: g.totalClasses || 0
                    };
                });
            }
            setFormData(initialForm);

        } catch (err) {
            setError('Failed to fetch student details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleUploadGrade = async (gradeId) => {
        const dataForGrade = formData[gradeId] || {};
        const { score, classesAttended, totalClasses } = dataForGrade;

        setUploadingGrade(gradeId);
        try {
            await axios.post(`/api/admin/students/${id}/grades/${gradeId}`, { 
                score: score === '' ? undefined : score, 
                classesAttended, 
                totalClasses 
            });
            await fetchData(); // Refresh data to see updated credits and grade status
        } catch (err) {
            alert("Failed to update record.");
        } finally {
            setUploadingGrade(null);
        }
    };

    const handleApprovePayment = async (invoiceId) => {
        try {
            await axios.put(`/api/admin/students/${id}/payment/${invoiceId}`);
            await fetchData();
        } catch (err) {
            alert("Failed to approve payment.");
        }
    };

    const handleClearTicket = async (complaintId) => {
        try {
            await axios.put(`/api/admin/students/${id}/complaint/${complaintId}`);
            await fetchData();
        } catch (err) {
            alert("Failed to clear ticket.");
        }
    };

    if (loading) return <div className="p-20 text-center">Loading student dossier...</div>;
    if (error || !data) return <div className="p-20 text-center text-red-500">{error || "Data not found"}</div>;

    const { student, grades, invoices, complaints } = data;

    const handlePromote = async () => {
        try {
            await axios.post(`/api/admin/students/${id}/promote`);
            await fetchData();
            alert("Semester cleared and student promoted successfully!");
        } catch (err) {
            alert("Failed to promote student.");
        }
    };

    const renderAcademics = () => {
        // Group grades by semester
        const groupedGrades = grades.reduce((acc, grade) => {
            const sem = grade.semesterLabel || 'Unknown';
            if (!acc[sem]) acc[sem] = [];
            acc[sem].push(grade);
            return acc;
        }, {});

        // Identify current semester label (roughly based on student.currentSemester)
        const year = Math.ceil(student.currentSemester / 2);
        const term = student.currentSemester % 2 === 0 ? '2nd' : '1st';
        const currentSemLabel = `Year ${year} - ${term} Sem`;

        return (
            <div className="flex flex-col gap-8">
                {Object.keys(groupedGrades).map(semLabel => {
                    const semGrades = groupedGrades[semLabel];
                    const isCurrentSem = semLabel === currentSemLabel;
                    const allGraded = semGrades.every(g => g.score !== undefined);

                    return (
                        <div key={semLabel} className={`bg-white border ${isCurrentSem ? 'border-[#781763] shadow-md' : 'border-gray-200 shadow-sm'} rounded-xl overflow-hidden`}>
                            <div className={`${isCurrentSem ? 'bg-[#510443] text-white' : 'bg-gray-50 text-gray-800'} px-6 py-4 flex justify-between items-center`}>
                                <h3 className="font-bold">{semLabel} {isCurrentSem && '(Current Semester)'}</h3>
                                {isCurrentSem && (
                                    <button 
                                        onClick={handlePromote}
                                        disabled={!allGraded}
                                        className={`px-4 py-1.5 rounded text-sm font-bold shadow-sm transition-colors ${
                                            allGraded ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Clear Semester & Promote
                                    </button>
                                )}
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white border-b border-gray-200 text-gray-600">
                                    <tr>
                                        <th className="py-3 px-6 font-semibold text-sm">Course</th>
                                        <th className="py-3 px-6 font-semibold text-sm text-center">Status</th>
                                        <th className="py-3 px-6 font-semibold text-sm text-right">Upload Marks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {semGrades.map(g => (
                                        <tr key={g._id} className="border-b border-gray-100">
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-gray-800">{g.courseId?.courseCode}</p>
                                                <p className="text-xs text-gray-500">{g.courseId?.title}</p>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {g.score !== undefined ? (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${g.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {g.passed ? `Passed: ${g.grade}` : `Failed: ${g.grade}`}
                                                    </span>
                                                ) : (
                                                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Ongoing</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-400 font-bold w-12 text-right">Score:</span>
                                                        <input 
                                                            type="number" 
                                                            min="0" max="100" 
                                                            placeholder="0-100"
                                                            value={formData[g._id]?.score !== undefined ? formData[g._id].score : ''}
                                                            onChange={(e) => setFormData({ ...formData, [g._id]: { ...formData[g._id], score: e.target.value } })}
                                                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-red-500"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-400 font-bold w-12 text-right">Attnd:</span>
                                                        <input 
                                                            type="number" min="0" placeholder="Attended"
                                                            value={formData[g._id]?.classesAttended !== undefined ? formData[g._id].classesAttended : ''}
                                                            onChange={(e) => setFormData({ ...formData, [g._id]: { ...formData[g._id], classesAttended: e.target.value } })}
                                                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-red-500"
                                                        />
                                                        <span className="text-gray-400">/</span>
                                                        <input 
                                                            type="number" min="0" placeholder="Total"
                                                            value={formData[g._id]?.totalClasses !== undefined ? formData[g._id].totalClasses : ''}
                                                            onChange={(e) => setFormData({ ...formData, [g._id]: { ...formData[g._id], totalClasses: e.target.value } })}
                                                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-red-500"
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => handleUploadGrade(g._id)}
                                                        disabled={uploadingGrade === g._id}
                                                        className="bg-gray-800 hover:bg-black text-white px-4 py-1.5 rounded text-sm font-bold transition-colors disabled:opacity-50 mt-1"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
                {Object.keys(groupedGrades).length === 0 && (
                    <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                        No academic records found.
                    </div>
                )}
            </div>
        );
    };

    const renderPayments = () => (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <tr>
                        <th className="py-3 px-6 font-semibold text-sm">Semester / Level</th>
                        <th className="py-3 px-6 font-semibold text-sm">Amount</th>
                        <th className="py-3 px-6 font-semibold text-sm">Status</th>
                        <th className="py-3 px-6 font-semibold text-sm text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.length === 0 && (
                        <tr><td colSpan="4" className="py-6 text-center text-gray-500">No payment records found.</td></tr>
                    )}
                    {invoices.map(inv => (
                        <tr key={inv._id} className="border-b border-gray-100">
                            <td className="py-4 px-6 font-medium text-gray-800">Semester {inv.semester}</td>
                            <td className="py-4 px-6 text-gray-600 font-bold">₦{inv.totalAmountDue.toLocaleString()}</td>
                            <td className="py-4 px-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {inv.status.toUpperCase()}
                                </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                                {inv.status !== 'paid' && (
                                    <button 
                                        onClick={() => handleApprovePayment(inv._id)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-bold shadow-sm transition-colors"
                                    >
                                        Approve Payment
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderTickets = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                    No support tickets found.
                </div>
            )}
            {complaints.map(ticket => (
                <div key={ticket._id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{ticket.ticketId}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {ticket.status}
                        </span>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-1">{ticket.title}</h4>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">{ticket.description}</p>
                    {ticket.status !== 'resolved' && (
                        <button 
                            onClick={() => handleClearTicket(ticket._id)}
                            className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 rounded font-bold text-sm transition-colors"
                        >
                            Mark as Cleared
                        </button>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <button 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 font-medium text-sm"
            >
                <ArrowLeft size={16} /> Back to Directory
            </button>

            {/* Header */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">{student.name}</h1>
                    <p className="text-gray-500 font-medium tracking-wide">
                        {student.matricNo} • {student.degree} • Semester {student.currentSemester}
                    </p>
                </div>
                <div className="flex gap-6">
                    <div className="bg-gray-50 px-6 py-4 rounded-xl border border-gray-100 text-center min-w-[120px]">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Completed</p>
                        <p className="text-2xl font-black text-green-600">{student.creditsCompleted}</p>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 rounded-xl border border-gray-100 text-center min-w-[120px]">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Required</p>
                        <p className="text-2xl font-black text-gray-800">{student.creditsRequired}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {['academics', 'payments', 'tickets'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${
                            activeTab === tab 
                            ? 'border-red-600 text-red-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="animate-fade-in">
                {activeTab === 'academics' && renderAcademics()}
                {activeTab === 'payments' && renderPayments()}
                {activeTab === 'tickets' && renderTickets()}
            </div>
        </div>
    );
}

export default AdminStudentDetails;
