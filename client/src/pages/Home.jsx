import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function Home() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const response = await axios.get(`${apiBaseUrl}/api/dashboard`);
                setDashboard(response.data);
            } catch (err) {
                setError('Unable to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white text-gray-700">
                Loading dashboard...
            </div>
        );
    }

    if (error || !dashboard) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white text-red-600">
                {error || 'No dashboard data available.'}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 h-screen overflow-y-auto px-10 py-8 bg-white">
                <div className="w-full max-w-[1014px] h-[333px] bg-gradient-to-r from-[#510443] to-[#870873] rounded-[40px] p-12 flex justify-between items-center shadow-xl mx-auto mt-4">
                    <div className="flex flex-col text-white">
                        <h1 className="text-5xl font-semibold mb-6 tracking-wide">
                            Welcome back {dashboard.welcome.name} !
                        </h1>
                        <div className="space-y-1 text-white/90 text-lg">
                            <p>Matric No: {dashboard.welcome.matricNo}</p>
                            <p>{dashboard.welcome.level}</p>
                            <p>Programme : {dashboard.welcome.programme}</p>
                            <p>Admission Type : {dashboard.welcome.admissionType}</p>
                        </div>
                        <button className="mt-8 bg-white/20 backdrop-blur-sm border border-white/40 hover:bg-white/30 text-white w-fit px-8 py-3 rounded-full font-medium transition-colors shadow-sm">
                            View profile
                        </button>
                    </div>

                    <div className="w-[220px] h-[220px] rounded-full border-4 border-white/20 overflow-hidden shadow-2xl flex-shrink-0">
                        <img
                            src={dashboard.welcome.profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="max-w-[1014px] mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                    <div className="bg-[#680659]/10 rounded-[20px] pt-[16px] pr-[30px] pb-[35px] pl-[16px] shadow-sm flex flex-col h-[323px]">
                        <span className="bg-[#d1b3ca] text-[#4a1542] text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">Complaints</span>
                        <h3 className="font-semibold text-lg text-gray-800">Complaint log</h3>
                        <p className="text-6xl font-bold text-[#510443] my-4">{dashboard.complaints.total}</p>
                        <p className="text-sm text-gray-600 mb-4 border-b border-gray-300 pb-2">Total submitted</p>
                        <div className="space-y-2 mt-auto">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Pending</span>
                                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded">{dashboard.complaints.pending}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Resolved</span>
                                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded">{dashboard.complaints.resolved}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#680659]/10 rounded-[20px] pt-[16px] pr-[30px] pb-[35px] pl-[16px] shadow-sm flex flex-col h-[323px]">
                        <span className="bg-green-200 text-green-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">Registration</span>
                        <h3 className="font-semibold text-lg text-gray-800">Course registration</h3>
                        <p className="text-5xl font-bold text-green-600 my-4">{dashboard.registration.session}</p>
                        <p className="text-sm text-gray-600 mb-4 border-b border-gray-300 pb-2">Current Session</p>
                        <div className="space-y-2 mt-auto text-sm font-medium text-gray-700">
                            <div className="flex justify-between items-center">
                                <span>Status</span>
                                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">{dashboard.registration.status}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Units registered</span>
                                <span>{dashboard.registration.unitsRegistered}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Max units</span>
                                <span>{dashboard.registration.maxUnits}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#680659]/10 rounded-[20px] pt-[16px] pr-[30px] pb-[35px] pl-[16px] shadow-sm flex flex-col h-[323px]">
                        <span className="bg-orange-200 text-orange-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">Clearance</span>
                        <h3 className="font-semibold text-lg text-gray-800">Clearance status</h3>
                        <p className="text-5xl font-bold text-orange-400 my-4">{dashboard.clearance.completed}/{dashboard.clearance.total}</p>
                        <p className="text-sm text-gray-600 mb-4 border-b border-gray-300 pb-2">Departments cleared</p>
                        <div className="space-y-2 mt-auto text-sm font-medium text-gray-700">
                            {dashboard.clearance.items.map((item) => (
                                <div key={item.label} className="flex justify-between items-center">
                                    <span>{item.label}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${item.status === 'Done' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#680659]/10 rounded-[20px] pt-[16px] pr-[30px] pb-[35px] pl-[16px] shadow-sm flex flex-col h-[323px]">
                        <span className="bg-green-200 text-green-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">Academic</span>
                        <h3 className="font-semibold text-lg text-gray-800">Semester overview</h3>
                        <p className="text-5xl font-bold text-green-600 my-4">{dashboard.semester.label}</p>
                        <p className="text-sm text-gray-600 mb-4 border-b border-gray-300 pb-2">Semester - {dashboard.semester.stage}</p>
                        <div className="mt-auto">
                            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                <span>Week</span>
                                <span>{dashboard.semester.week} of {dashboard.semester.totalWeeks}</span>
                            </div>
                            <div className="w-full bg-gray-300 h-1.5 rounded-full mb-4">
                                <div
                                    className="bg-green-600 h-1.5 rounded-full"
                                    style={{ width: `${(dashboard.semester.week / dashboard.semester.totalWeeks) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-gray-700">
                                <span>Exams starts</span>
                                <span>{dashboard.semester.examStarts}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#680659]/10 rounded-[20px] pt-[16px] pr-[30px] pb-[35px] pl-[16px] shadow-sm flex flex-col h-[323px]">
                        <span className="bg-blue-200 text-blue-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">Documents</span>
                        <h3 className="font-semibold text-lg text-gray-800">Document requests</h3>
                        <p className="text-5xl font-bold text-teal-600 my-4">{dashboard.documents.total}</p>
                        <p className="text-sm text-gray-600 mb-4 border-b border-gray-300 pb-2">Active requests</p>
                        <div className="space-y-3 mt-auto text-sm font-medium text-gray-700">
                            {dashboard.documents.items.map((item) => (
                                <div key={item.label} className="flex justify-between items-center">
                                    <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${item.status === 'Ready' ? 'bg-teal-500' : 'bg-yellow-500'}`}></span> {item.label}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${item.status === 'Ready' ? 'bg-teal-100 text-teal-600' : 'bg-red-100 text-red-500'}`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#680659]/10 rounded-[20px] pt-[16px] pr-[30px] pb-[35px] pl-[16px] shadow-sm flex flex-col h-[323px]">
                        <span className="bg-pink-200 text-pink-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">Disciplinary</span>
                        <h3 className="font-semibold text-lg text-gray-800">Disciplinary record</h3>
                        <p className="text-5xl font-bold text-teal-600 my-4">{dashboard.disciplinary.status}</p>
                        <p className="text-sm text-gray-600 mb-4 border-b border-gray-300 pb-2">No active sanctions</p>
                        <div className="space-y-2 mt-auto text-sm font-medium text-gray-700">
                            <div className="flex justify-between items-center">
                                <span>Warnings</span>
                                <span>{dashboard.disciplinary.warnings}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Suspension history</span>
                                <span>{dashboard.disciplinary.suspensionHistory}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Standing</span>
                                <span className="text-green-600">{dashboard.disciplinary.standing}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;