import React from 'react';

function Sidebar() {
    return (
        <aside className="w-[326px] min-h-screen bg-gradient-to-b from-[#21021C] via-[#540547] to-[#870873] rounded-r-[50px] py-10 flex flex-col items-center shadow-2xl flex-shrink-0 z-10 relative">
            
            {/* Logo Container */}
            <div className="w-[100px] h-[100px] mb-12 flex items-center justify-center bg-white rounded-full p-2 shadow-inner">
                <img 
                    src="./assets/icon.png" 
                    alt="University Logo" 
                    className="max-w-full max-h-full object-contain"
                />
            </div>

            {/* Navigation Menu */}
            <nav className="w-full px-6 flex flex-col gap-2">
                {/* Active Link */}
                <div className="flex items-center gap-4 bg-white text-black px-6 py-4 rounded-full font-semibold cursor-pointer shadow-md transition-transform hover:scale-[1.02]">
                    <span className="text-xl">⊞</span> {/* Replace with your icon */}
                    <span className="text-lg">Dashboard</span>
                </div>

                {/* Inactive Links */}
                {[
                    { name: 'Payment', hasDropdown: true },
                    { name: 'Course', hasDropdown: true },
                    { name: 'Summer', hasDropdown: true },
                    { name: 'Attendance' },
                    { name: 'Clearance' },
                    { name: 'Result' },
                    { name: 'Profile' },
                    { name: 'Notification' }
                ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-white/80 hover:text-white hover:bg-white/10 px-6 py-4 rounded-full font-medium cursor-pointer transition-colors">
                        <div className="flex items-center gap-4">
                            <span className="text-xl opacity-70">❖</span> {/* Replace with your icon */}
                            <span className="text-lg">{item.name}</span>
                        </div>
                        {item.hasDropdown && <span className="text-sm">▼</span>}
                    </div>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="mt-auto w-full px-6">
                <div className="flex items-center gap-4 text-white/80 hover:text-white hover:bg-white/10 px-6 py-4 rounded-full font-medium cursor-pointer transition-colors">
                    <span className="text-xl opacity-70">↪</span> {/* Replace with your icon */}
                    <span className="text-lg">Logout</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;