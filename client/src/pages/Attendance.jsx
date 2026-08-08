import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';

const demoAttendance = [
    {
        _id: 'demo-1',
        semesterLabel: 'Year 4 - 2nd Sem',
        courseId: { courseCode: 'CSC 422', title: 'Human-Computer Interaction', credits: 2 },
        classesAttended: 11,
        totalClasses: 12,
    },
    {
        _id: 'demo-2',
        semesterLabel: 'Year 4 - 2nd Sem',
        courseId: { courseCode: 'CSC 404', title: 'Data Management Systems', credits: 3 },
        classesAttended: 9,
        totalClasses: 12,
    },
    {
        _id: 'demo-3',
        semesterLabel: 'Year 4 - 2nd Sem',
        courseId: { courseCode: 'CSC 499', title: 'Final Year Project', credits: 6 },
        classesAttended: 8,
        totalClasses: 10,
    },
];

function Attendance() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSemester, setSelectedSemester] = useState('Year 4 - 2nd Sem');
    const [isDemoView, setIsDemoView] = useState(false);

    const allSemesters = [
        'Year 1 - 1st Sem',
        'Year 1 - 2nd Sem',
        'Year 2 - 1st Sem',
        'Year 2 - 2nd Sem',
        'Year 3 - 1st Sem',
        'Year 3 - 2nd Sem',
        'Year 4 - 1st Sem',
        'Year 4 - 2nd Sem',
    ];

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await axios.get('/api/student/attendance');
                const fetchedCourses = response.data.grades || [];

                if (response.data.demo || fetchedCourses.length === 0) {
                    setCourses(demoAttendance);
                    setSelectedSemester('Year 4 - 2nd Sem');
                    setIsDemoView(true);
                } else {
                    setCourses(fetchedCourses);
                    const labels = fetchedCourses.map((g) => g.semesterLabel);
                    const uniqueLabels = [...new Set(labels)];
                    if (uniqueLabels.length > 0) {
                        setSelectedSemester(uniqueLabels[uniqueLabels.length - 1]);
                    }
                    setIsDemoView(false);
                }
            } catch (err) {
                setCourses(demoAttendance);
                setSelectedSemester('Year 4 - 2nd Sem');
                setIsDemoView(true);
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

    if (loading) {
        return <div className="p-20 text-center text-gray-500 font-medium">Loading attendance records...</div>;
    }

    const filteredCourses = courses.filter((g) => g.semesterLabel === selectedSemester);

    return (
        <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6]">
            <div className="flex-grow px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-[1000px] mx-auto w-full">
                <div className="flex flex-col gap-5 md:flex-row md:justify-between md:items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-[#510443] mb-2">Class Attendance</h1>
                        <p className="text-gray-500 font-medium tracking-wide">
                            Monitor your class attendance without waiting for payment approval.
                        </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end">
                        <label className="text-sm font-bold text-gray-600 mb-1">Select Semester</label>
                        <select
                            className="bg-white border border-gray-300 text-gray-800 text-sm font-semibold rounded-lg focus:ring-[#781763] focus:border-[#781763] block p-2.5 outline-none shadow-sm min-w-[220px]"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                            {allSemesters.map((sem) => (
                                <option key={sem} value={sem}>{sem}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {isDemoView && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
                        <Info size={18} className="mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-bold">Demo attendance view enabled</p>
                            <p>
                                Live attendance records are not yet fully synced for this student account, so a sample attendance overview is displayed immediately after login.
                            </p>
                        </div>
                    </div>
                )}

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
                        {filteredCourses.map((g) => {
                            const percent = calculatePercentage(g.classesAttended, g.totalClasses);
                            const isPassing = percent >= 70;

                            return (
                                <div key={g._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
                                    <div className="flex justify-between items-start mb-4 gap-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">{g.courseId?.courseCode}</h3>
                                            <p className="text-gray-500 text-sm line-clamp-2">{g.courseId?.title}</p>
                                        </div>
                                        <span className="bg-gray-100 text-gray-600 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                                            {g.semesterLabel}
                                        </span>
                                    </div>

                                    <div className="flex-grow flex flex-col justify-end mt-4">
                                        <div className="flex justify-between items-end mb-2 gap-4">
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
