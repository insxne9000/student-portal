import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, AlertCircle } from 'lucide-react';

function Summer() {
    const [failedCourses, setFailedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFailedCourses = async () => {
            try {
                const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const token = localStorage.getItem('token');
                const response = await axios.get(`${apiBaseUrl}/api/student/results`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.locked) {
                    setError(response.data.message);
                } else {
                    const grades = response.data.grades || [];
                    // Find all grades with a score that didn't pass
                    const failed = grades.filter(g => g.score !== undefined && !g.passed);
                    setFailedCourses(failed);
                }
            } catch (err) {
                setError('Failed to load your academic records.');
            } finally {
                setLoading(false);
            }
        };
        fetchFailedCourses();
    }, []);

    return (
        <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6]">
            <div className="flex-grow px-10 py-10 max-w-[1000px] mx-auto w-full">
                
                <h1 className="text-3xl font-black text-[#510443] mb-2">Summer Semester</h1>
                <p className="text-gray-500 font-medium mb-8 tracking-wide">Manage your retake courses.</p>

                <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl mb-8 flex items-start gap-4 shadow-sm">
                    <Calendar className="text-blue-600 shrink-0 mt-1" size={28} />
                    <div>
                        <h3 className="text-blue-900 font-bold text-lg mb-1">Registration Timeline</h3>
                        <p className="text-blue-800 text-sm leading-relaxed">
                            Please note that the Summer Semester registration is open exclusively between <span className="font-bold">May and June</span> of every academic year. 
                            The 1st Semester runs from January to April, and the 2nd Semester runs from July to November.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-gray-500 font-medium">Loading summer records...</div>
                ) : error ? (
                    <div className="bg-red-50 text-red-500 p-6 rounded-2xl border border-red-200 text-center shadow-sm">
                        <AlertCircle size={40} className="mx-auto mb-3 opacity-50" />
                        {error}
                    </div>
                ) : failedCourses.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl text-center border border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🎉</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">You're All Clear!</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            You do not have any failed courses requiring a summer retake at this time.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">Required Summer Courses</h2>
                            <span className="bg-red-100 text-red-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                                {failedCourses.length} Pending
                            </span>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="py-4 px-6 font-bold text-sm uppercase tracking-wider w-32">Course Code</th>
                                    <th className="py-4 px-6 font-bold text-sm uppercase tracking-wider">Title</th>
                                    <th className="py-4 px-6 font-bold text-sm uppercase tracking-wider text-center w-24">Credits</th>
                                    <th className="py-4 px-6 font-bold text-sm uppercase tracking-wider text-center w-32">Previous Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {failedCourses.map((g) => (
                                    <tr key={g._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 font-black text-gray-800">{g.courseId?.courseCode}</td>
                                        <td className="py-4 px-6 font-medium text-gray-600">{g.courseId?.title}</td>
                                        <td className="py-4 px-6 text-center font-bold text-gray-700">{g.courseId?.credits}</td>
                                        <td className="py-4 px-6 text-center font-black text-red-600 text-lg">{g.grade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-6 bg-gray-50 text-right">
                            <button 
                                onClick={() => window.location.href = '/payment'}
                                className="bg-[#510443] hover:bg-[#781763] text-white px-8 py-3 rounded-xl font-bold shadow-md transition-colors"
                            >
                                Generate Invoice & Pay
                            </button>
                            <p className="text-xs text-gray-400 mt-2 font-medium">₦10,000 per retake course</p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default Summer;
