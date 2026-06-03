import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

function Attendance() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSemester, setSelectedSemester] = useState("Year 1 - 1st Sem");

    const allSemesters = [
        "Year 1 - 1st Sem",
        "Year 1 - 2nd Sem",
        "Year 2 - 1st Sem",
        "Year 2 - 2nd Sem",
        "Year 3 - 1st Sem",
        "Year 3 - 2nd Sem",
        "Year 4 - 1st Sem",
        "Year 4 - 2nd Sem"
    ];

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const token = localStorage.getItem('token');
                
                // Fetch results (which includes Grades with attendance data)
                const response = await axios.get(`${apiBaseUrl}/api/student/results`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.locked) {
                    setError("Your records are withheld pending payment approval from the administration.");
                } else {
                    const fetchedCourses = response.data.grades || [];
                    setCourses(fetchedCourses);
                    
                    // Auto-select the latest semester if available
                    if (fetchedCourses.length > 0) {
                        const labels = fetchedCourses.map(g => g.semesterLabel);
                        const uniqueLabels = [...new Set(labels)];
                        if (uniqueLabels.length > 0) {
                            setSelectedSemester(uniqueLabels[uniqueLabels.length - 1]);
                        }
                    }
                }
            } catch (err) {
                setError('Failed to fetch attendance records.');
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const calculatePercentage = (attended, total) => {
        if (!total || total === 0) return 0;
        return Math.round((attended / total) * 100);
    };

    if (loading) return <div className="p-20 text-center text-gray-500 font-medium">Loading attendance records...</div>;
    
    if (error) return (
        <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6] p-10">
            <div className="bg-red-50 text-red-500 p-8 rounded-2xl border border-red-200 text-center shadow-sm max-w-2xl mx-auto mt-10">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Access Denied</h3>
                <p>{error}</p>
            </div>
        </main>
    );

    const filteredCourses = courses.filter(g => g.semesterLabel === selectedSemester);

    return (
        <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6]">
            <div className="flex-grow px-10 py-10 max-w-[1000px] mx-auto w-full">
                
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-[#510443] mb-2">Class Attendance</h1>
                        <p className="text-gray-500 font-medium tracking-wide">Monitor your course attendance and meet the required thresholds.</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <label className="text-sm font-bold text-gray-600 mb-1">Select Semester</label>
                        <select 
                            className="bg-white border border-gray-300 text-gray-800 text-sm font-semibold rounded-lg focus:ring-[#781763] focus:border-[#781763] block p-2.5 outline-none shadow-sm min-w-[200px]"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                            {allSemesters.map(sem => (
                                <option key={sem} value={sem}>{sem}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredCourses.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl text-center border border-gray-200 shadow-sm">
                        <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Records Found</h3>
                        <p className="text-gray-500 font-medium max-w-md mx-auto">
                            There are no attendance records for the selected semester. You may not have registered or been promoted to this semester yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredCourses.map(g => {
                            const percent = calculatePercentage(g.classesAttended, g.totalClasses);
                            const isPassing = percent >= 70; // 70% requirement
                            
                            return (
                                <div key={g._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">{g.courseId?.courseCode}</h3>
                                            <p className="text-gray-500 text-sm line-clamp-1">{g.courseId?.title}</p>
                                        </div>
                                        <span className="bg-gray-100 text-gray-600 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                                            {g.semesterLabel}
                                        </span>
                                    </div>
                                    
                                    <div className="flex-grow flex flex-col justify-end mt-4">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Classes Attended</p>
                                                <p className="font-black text-2xl text-gray-800">
                                                    {g.classesAttended} <span className="text-lg text-gray-400 font-medium">/ {g.totalClasses}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black text-3xl ${isPassing ? 'text-green-500' : (percent > 0 ? 'text-red-500' : 'text-gray-400')}`}>
                                                    {percent}%
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className={`h-2.5 rounded-full transition-all duration-1000 ${isPassing ? 'bg-green-500' : 'bg-red-500'}`} 
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                        
                                        {g.totalClasses > 0 && percent < 70 && (
                                            <p className="text-xs text-red-500 font-bold mt-3 flex items-center gap-1">
                                                <AlertCircle size={12} /> Warning: Attendance below 70% threshold
                                            </p>
                                        )}
                                        {g.totalClasses > 0 && percent >= 70 && (
                                            <p className="text-xs text-green-600 font-bold mt-3 flex items-center gap-1">
                                                <CheckCircle size={12} /> Attendance threshold met
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

export default Attendance;
