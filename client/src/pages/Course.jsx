import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Course() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Semester Selection State
    const [selectedLevel, setSelectedLevel] = useState(100);
    const [selectedSemester, setSelectedSemester] = useState(1);
    
    // Registration Cart State
    const [registeredCourses, setRegisteredCourses] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [isLocked, setIsLocked] = useState(false);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const token = localStorage.getItem('token');
                
                const [coursesRes, invoicesRes] = await Promise.all([
                    axios.get(`${apiBaseUrl}/api/courses`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${apiBaseUrl}/api/student/invoices`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                setCourses(coursesRes.data.courses);
                setInvoices(invoicesRes.data.invoices || []);
                setError('');
            } catch (err) {
                setError('Failed to load courses.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Check if locked whenever semester changes
    useEffect(() => {
        const lockedInvoice = invoices.find(inv => inv.semester === selectedSemester && (inv.status === 'paid' || inv.status === 'pending'));
        setIsLocked(!!lockedInvoice);
    }, [selectedSemester, invoices]);

    // Visible Courses filtered by selected Level and Semester
    const visibleCourses = courses.filter(c => c.level === selectedLevel && c.semester === selectedSemester);

    // Derived states
    const totalCredits = registeredCourses.reduce((sum, course) => sum + course.credits, 0);

    const toggleCourse = (course) => {
        const isRegistered = registeredCourses.find(c => c._id === course._id);
        if (isRegistered) {
            setRegisteredCourses(registeredCourses.filter(c => c._id !== course._id));
        } else {
            setRegisteredCourses([...registeredCourses, course]);
        }
    };

    const handleConfirm = async () => {
        if (totalCredits < 15) {
            alert(`You must register for at least 15 credits. You currently have ${totalCredits}.`);
            return;
        }
        if (totalCredits > 24) {
            alert(`You cannot exceed 24 credits. You currently have ${totalCredits}.`);
            return;
        }

        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const token = localStorage.getItem('token');
            const selectedCourseIds = registeredCourses.map(c => c._id);
            
            // Calculate absolute semester index (e.g. 100-1 -> 1, 200-1 -> 3, 300-2 -> 6)
            const absoluteSemester = ((selectedLevel / 100) - 1) * 2 + selectedSemester;
            
            await axios.post(`${apiBaseUrl}/api/student/enrollment/${absoluteSemester}/checkout`, 
                { selectedCourseIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Navigate to payment after successful invoice generation
            navigate('/payment');
        } catch (err) {
            alert('Checkout failed. Please try again.');
        }
    };

    return (
        <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6]">
            <div className="flex-grow px-10 py-8 max-w-[1200px] mx-auto w-full relative pb-32">
                
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-[#1f2937]">Course Registration</h1>
                    
                    {/* Semester Dropdown selector */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-600">Active Session:</label>
                        <select 
                            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-[#781763] focus:border-[#781763] block p-2.5 outline-none shadow-sm"
                            value={`${selectedLevel}-${selectedSemester}`}
                            onChange={(e) => {
                                const [lvl, sem] = e.target.value.split('-');
                                setSelectedLevel(Number(lvl));
                                setSelectedSemester(Number(sem));
                            }}
                        >
                            <option value="100-1">Year 1 - 1st Sem</option>
                            <option value="100-2">Year 1 - 2nd Sem</option>
                            <option value="200-1">Year 2 - 1st Sem</option>
                            <option value="200-2">Year 2 - 2nd Sem</option>
                            <option value="300-1">Year 3 - 1st Sem</option>
                            <option value="300-2">Year 3 - 2nd Sem</option>
                            <option value="400-1">Year 4 - 1st Sem</option>
                            <option value="400-2">Year 4 - 2nd Sem</option>
                        </select>
                    </div>
                </div>

                <div className={`border-l-4 p-4 mb-6 rounded shadow-sm ${isLocked ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-400'}`}>
                    {isLocked ? (
                        <p className="text-red-800 text-sm font-bold flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Registration for this semester is Closed and Locked. You have already generated an invoice.
                        </p>
                    ) : (
                        <p className="text-yellow-800 text-sm font-bold flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                            Important Constraint: The maximum credits allowed is 24 and the minimum is 15 for a regular semester.
                        </p>
                    )}
                </div>

                <div className="bg-white shadow-sm border border-gray-200 rounded-sm">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-[#510443]">Available Courses</h2>
                        <span className="text-sm text-gray-500 font-medium">
                            {visibleCourses.length} Courses Found
                        </span>
                    </div>

                    <div className="p-0 overflow-x-auto min-h-[300px]">
                        {loading ? (
                            <div className="p-10 text-center text-gray-500">Loading courses...</div>
                        ) : error ? (
                            <div className="p-10 text-center text-red-500">{error}</div>
                        ) : visibleCourses.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">No courses scheduled for this semester.</div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead className="bg-[#6b2a5c] text-white">
                                    <tr>
                                        <th className="py-3 px-4 font-semibold text-sm border-r border-[#854576] w-16">S/N</th>
                                        <th className="py-3 px-4 font-semibold text-sm border-r border-[#854576] w-32">Course Code</th>
                                        <th className="py-3 px-4 font-semibold text-sm border-r border-[#854576]">Course Name</th>
                                        <th className="py-3 px-4 font-semibold text-sm border-r border-[#854576] w-20 text-center">Credits</th>
                                        <th className="py-3 px-4 font-semibold text-sm border-r border-[#854576] w-32">Remarks</th>
                                        <th className="py-3 px-4 font-semibold text-sm w-28 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleCourses.map((course, index) => {
                                        const isRegistered = registeredCourses.some(c => c._id === course._id);
                                        return (
                                            <tr key={course._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 text-gray-600 text-sm">{index + 1}</td>
                                                <td className="py-3 px-4 text-gray-800 text-sm font-bold">{course.courseCode}</td>
                                                <td className="py-3 px-4 text-gray-700 text-sm font-medium">{course.title}</td>
                                                <td className="py-3 px-4 text-gray-600 text-sm text-center font-bold">{course.credits}</td>
                                                <td className="py-3 px-4 text-sm">
                                                    <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                                                        course.remarks === 'Core' ? 'bg-blue-100 text-blue-700' :
                                                        course.remarks === 'Compulsory' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {course.remarks}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button 
                                                        onClick={() => toggleCourse(course)}
                                                        disabled={isLocked}
                                                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors w-full ${
                                                            isLocked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                                                            isRegistered 
                                                            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                                                            : 'bg-[#510443] text-white hover:bg-[#781763]'
                                                        }`}
                                                    >
                                                        {isRegistered ? 'DROP' : 'ADD'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Sticky Bottom Bar for Cart */}
                {!isLocked && registeredCourses.length > 0 && (
                    <div className="fixed bottom-0 left-0 lg:left-[326px] right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 px-10 flex justify-between items-center z-40 transition-all duration-300">
                        <div>
                            <p className="text-sm text-gray-500">Selected Courses</p>
                            <p className="text-xl font-bold text-[#510443]">{registeredCourses.length} Courses <span className="text-gray-400 font-normal text-base mx-2">|</span> {totalCredits} Credits</p>
                        </div>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded font-bold transition-colors shadow-lg"
                        >
                            Proceed to Register
                        </button>
                    </div>
                )}

            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-[#510443] px-6 py-4 flex justify-between items-center text-white shrink-0">
                            <h3 className="font-bold text-lg">Confirm Registration</h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-white/70 hover:text-white transition-colors text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded mb-6 text-sm">
                                Please confirm your selected courses before proceeding to payment.
                            </div>
                            
                            <table className="w-full text-left text-sm border-collapse mb-4">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="pb-2 font-bold text-gray-700">Course Code</th>
                                        <th className="pb-2 font-bold text-gray-700">Title</th>
                                        <th className="pb-2 font-bold text-gray-700 text-center">Credits</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registeredCourses.map(course => (
                                        <tr key={course._id} className="border-b border-gray-100">
                                            <td className="py-2 font-semibold text-gray-800">{course.courseCode}</td>
                                            <td className="py-2 text-gray-600">{course.title}</td>
                                            <td className="py-2 text-center font-bold text-gray-800">{course.credits}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="2" className="pt-4 text-right font-bold text-gray-700">Total Credit Units:</td>
                                        <td className="pt-4 text-center font-bold text-[#510443] text-lg">{totalCredits}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded font-medium transition-colors"
                            >
                                Go Back
                            </button>
                            <button 
                                onClick={handleConfirm}
                                className="px-5 py-2.5 text-white bg-[#510443] hover:bg-[#781763] rounded font-bold transition-colors shadow-md"
                            >
                                Confirm & Proceed to Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default Course;
