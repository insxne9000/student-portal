import React from 'react';
import profilePic from '../assets/profile.jpg';

function Profile() {
    return (
        <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6]">
            <div className="flex-grow px-10 py-8 max-w-[1200px] mx-auto w-full">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1 bg-white shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header Background Image */}
                        <div className="h-32 bg-gray-300 w-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744626753-1fa44df31c7f?auto=format&fit=crop&q=80')" }}></div>
                        
                        {/* Avatar */}
                        <div className="flex justify-center -mt-16">
                            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-sm">
                                <img 
                                    src={profilePic} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="text-center px-6 pb-8 pt-4">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">2022/502</h2>
                            <p className="font-semibold text-gray-700 mb-2">Level: 400</p>
                            <p className="font-semibold text-gray-700 mb-2">Programme: Computer Science</p>
                            <p className="font-semibold text-gray-700 mb-1">Department: Computer Science</p>
                            <p className="text-sm italic text-gray-500 mb-4">Admission Type: UTME</p>
                            <p className="font-semibold text-gray-800 mb-1">adewaleahmed5600@gmail.com</p>
                            <p className="font-semibold text-gray-800 mb-1">9050519329</p>
                            <p className="font-semibold text-gray-800 mb-4">08138960405</p>
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider">active</span>
                        </div>
                    </div>

                    {/* Right Column: Detailed Info */}
                    <div className="lg:col-span-2 bg-white shadow-sm border border-gray-200">
                        {/* Biodata */}
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-[#1f2937] font-bold mb-4">Biodata Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                                <div><span className="text-gray-500">Gender:</span> <span className="text-gray-800">male</span></div>
                                <div><span className="text-gray-500">Date of Birth:</span> <span className="text-gray-800">04-03-2005</span></div>
                                <div><span className="text-gray-500">Place of Birth:</span> <span className="text-gray-800">Ibadan</span></div>
                                
                                <div><span className="text-gray-500">Marital:</span> <span className="text-gray-800">Single</span></div>
                                <div><span className="text-gray-500">Religion:</span> <span className="text-gray-800">Islam</span></div>
                                <div className="md:col-span-2 lg:col-span-1"><span className="text-gray-500">Address:</span> <span className="text-gray-800">No. 25, Papa Aiyetoro St. Iyana-Court, Olomi-Academy Rd. Ibadan.</span></div>

                                <div><span className="text-gray-500">LGA:</span> <span className="text-gray-800">Ibadan South East</span></div>
                                <div><span className="text-gray-500">State:</span> <span className="text-gray-800">Oyo</span></div>
                                <div><span className="text-gray-500">Nationality:</span> <span className="text-gray-800">Nigeria</span></div>

                                <div><span className="text-gray-500">Blood Group:</span> <span className="text-gray-800">O negative</span></div>
                                <div><span className="text-gray-500">Genotype:</span> <span className="text-gray-800">AA</span></div>
                            </div>
                        </div>

                        {/* Sponsor Info */}
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-[#1f2937] font-bold mb-4">Sponsor's Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                                <div><span className="text-gray-500">Name:</span> <span className="text-gray-800 block">Adewole Adewale Wasiu</span></div>
                                <div><span className="text-gray-500">Phone Number :</span> <span className="text-gray-800 block">08023605046</span></div>
                                <div><span className="text-gray-500">Email:</span> <span className="text-gray-800 block">adewaleahmed5600@gmail.com</span></div>

                                <div><span className="text-gray-500">Relationship:</span> <span className="text-gray-800 block">father</span></div>
                                <div className="md:col-span-2"><span className="text-gray-500">Address:</span> <span className="text-gray-800 block">No. 25, Papa Aiyetoro St. Iyana-Court, Olomi-Academy Rd. Ibadan.</span></div>
                            </div>
                        </div>

                        {/* Next of Kin Info */}
                        <div className="p-6">
                            <h3 className="text-[#1f2937] font-bold mb-4">Next of Kin's Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                                <div><span className="text-gray-500">Name:</span> <span className="text-gray-800 block">Adewole Adewale Wasiu</span></div>
                                <div><span className="text-gray-500">Phone Number :</span> <span className="text-gray-800 block">08035803659</span></div>
                                <div><span className="text-gray-500">Address:</span> <span className="text-gray-800 block">No. 25, Papa Aiyetoro St. Iyana-Court, Olomi-Academy Rd. Ibadan.</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Profile;
