import React from 'react';
import Sidebar from '../components/Sidebar';

function Home() {
    return (
        <div className="flex min-h-screen bg-white font-sans overflow-hidden">
            
            {/* Render the Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto px-10 py-8 bg-white">
                
                {/* Top Banner (Welcome Section) */}
                <div className="w-full max-w-[1014px] h-[333px] bg-gradient-to-r from-[#510443] to-[#870873] rounded-[40px] p-12 flex justify-between items-center shadow-xl mx-auto mt-4">
                    <div className="flex flex-col text-white">
                        <h1 className="text-5xl font-semibold mb-6 tracking-wide">
                            Welcome back Diamond !
                        </h1>
                        <div className="space-y-1 text-white/90 text-lg">
                            <p>Matric No: 2022/490</p>
                            <p>Level 400</p>
                            <p>Programme : Software Engineering</p>
                            <p>Admission Type : UTME</p>
                        </div>
                        <button className="mt-8 bg-white/20 backdrop-blur-sm border border-white/40 hover:bg-white/30 text-white w-fit px-8 py-3 rounded-full font-medium transition-colors shadow-sm">
                            View profile
                        </button>
                    </div>
                    {/* Profile Picture */}
                    <div className="w-[220px] h-[220px] rounded-full border-4 border-white/20 overflow-hidden shadow-2xl flex-shrink-0">
                        {/* Replace src with actual profile image asset */}
                        <img 
                            src="https://via.placeholder.com/220" 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Dashboard Cards Grid */}
                <div className="max-w-[1014px] mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                    
                    {/* Card 1: Complaints */}
                    <div className="bg-[#680659]/10 rounded-[20px] pt-[16px] pr-[30px] pb-[35px] pl-[16px] shadow-sm flex flex-col h-[323px]">
                        <span className="bg-[#d1b3ca] text-[#4a1542] text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">Complaints</span>
                        <h3 className="font-semibold text-lg text-gray-800">Complaint log</h3>
                        <p className="text-6xl font-bold text-[#510443] my-4">3</p>
                        <p className="text-sm text-gray-600 mb-4 border-b border-gray-300 pb-2">Total submitted</p>
                        <div className="space-y-2 mt-auto">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Pending</span>
                                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded">2</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Resolved</span>
                                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded">1</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Course Registration */}
                    <div className="bg-[#680659]/10 rounded-[20px] pt-[16px] pr-[30px] pb-[35px] pl-[16px] shadow-sm flex flex-col h-[323px]">
                        <span className="bg-green-200 text-green-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">Registration</span>
                        <h3 className="font-semibold text-lg text-gray-800">Course registration</h3>
                        <p className="text-5xl font-bold text-green-600 my-4">2025/26</p>
                        <p className="text-sm text-gray-600 mb-4 border-b border-gray-300 pb-2">Current Session</p>
                        <div className="space-y-2 mt-auto text-sm font-medium text-gray-700">
                            <div className="flex justify-between items-center">
                                <span>Status</span>
                                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">Approved</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Units registered</span>
                                <span>21</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Max units</span>
                                <span>24</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Clearance Status */}
                    <div className="bg-[#680659]/10 rounded-[20px] pt-[16px] pr-[30px] pb-[35px] pl-[16px] shadow-sm flex flex-col h-[323px]">
                        <span className="bg-orange-200 text-orange-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">Clearance</span>
                        <h3 className="font-semibold text-lg text-gray-800">Clearance status</h3>
                        <p className="text-5xl font-bold text-orange-400 my-4">4/6</p>
                        <p className="text-sm text-gray-600 mb-4 border-b border-gray-300 pb-2">Departments cleared</p>
                        <div className="space-y-2 mt-auto text-sm font-medium text-gray-700">
                            <div className="flex justify-between items-center">
                                <span>Library</span>
                                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">Done</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Bursary</span>
                                <span className="bg-red-100 text-red-500 px-2 py-0.5 rounded text-xs">Pending</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>HOD</span>
                                <span className="bg-red-100 text-red-500 px-2 py-0.5 rounded text-xs">Pending</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Semester Overview */}
                    <div className="bg-[#680659]/10 rounded-[20px] pt-[16px] pr-[30px] pb-[35px] pl-[16px] shadow-sm flex flex-col h-[323px]">
                        <span className="bg-green-200 text-green-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">Academic</span>
                        <h3 className="font-semibold text-lg text-gray-800">Semester overview</h3>
                        <p className="text-5xl font-bold text-green-600 my-4">2nd</p>
                        <p className="text-sm text-gray-600 mb-4 border-b border-gray-300 pb-2">Semester - 400L</p>
                        <div className="mt-auto">
                            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                <span>Week</span>
                                <span>4 of 12</span>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-300 h-1.5 rounded-full mb-4">
                                <div className="bg-green-600 h-1.5 rounded-full w-1/3"></div>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-gray-700">
                                <span>Exams starts</span>
                                <span>May 12</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 5: Document Requests */}
                    <div className="bg-[#680659]/10 rounded-[20px] pt-[16px] pr-[30px] pb-[35px] pl-[16px] shadow-sm flex flex-col h-[323px]">
                        <span className="bg-blue-200 text-blue-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">Documents</span>
                        <h3 className="font-semibold text-lg text-gray-800">Document requests</h3>
                        <p className="text-5xl font-bold text-teal-600 my-4">2</p>
                        <p className="text-sm text-gray-600 mb-4 border-b border-gray-300 pb-2">Active requests</p>
                        <div className="space-y-3 mt-auto text-sm font-medium text-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Transcript</span>
                                <span className="bg-red-100 text-red-500 px-2 py-0.5 rounded text-xs">Processing</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Intro letter</span>
                                <span className="bg-teal-100 text-teal-600 px-2 py-0.5 rounded text-xs">Ready</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 6: Disciplinary Record */}
                    <div className="bg-[#680659]/10 rounded-[20px] pt-[16px] pr-[30px] pb-[35px] pl-[16px] shadow-sm flex flex-col h-[323px]">
                        <span className="bg-pink-200 text-pink-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">Disciplinary</span>
                        <h3 className="font-semibold text-lg text-gray-800">Disciplinary record</h3>
                        <p className="text-5xl font-bold text-teal-600 my-4">Clean</p>
                        <p className="text-sm text-gray-600 mb-4 border-b border-gray-300 pb-2">No active sanctions</p>
                        <div className="space-y-2 mt-auto text-sm font-medium text-gray-700">
                            <div className="flex justify-between items-center">
                                <span>Warnings</span>
                                <span>0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Suspension history</span>
                                <span>None</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Standing</span>
                                <span className="text-green-600">Good standing</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    
    );
}

export default Home;