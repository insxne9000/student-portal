import React, { useState } from 'react';

function Sidebar() {
    const [activeItem, setActiveItem] = useState('Attendance');

    const menuItems = [
        { name: 'Dashboard', icon: '⊞' },
        { name: 'Payment', hasDropdown: true, icon: '💳' },
        { name: 'Course', hasDropdown: true, icon: '📚' },
        { name: 'Summer', hasDropdown: true, icon: '📔' },
        { name: 'Attendance', icon: '📋' },
        { name: 'Clearance', icon: '📋' },
        { name: 'Result', icon: '📜' },
        { name: 'Profile', icon: '👤' },
        { name: 'Notification', icon: '🔔' }
    ];

    return (
        // Crucial fix: Added overflow-hidden to cleanly clip the right-edge curve intersections
        <aside className="w-[326px] min-h-screen bg-gradient-to-b from-[#21021C] via-[#540547] to-[#870873] rounded-r-[50px] py-10 flex flex-col items-center shadow-2xl flex-shrink-0 z-10 relative overflow-hidden">
            
            {/* Logo Container */}
            <div className="w-[100px] h-[100px] mb-12 flex items-center justify-center bg-white rounded-2xl p-2 shadow-inner">
                <img 
                    src="./assets/icon.png" 
                    alt="University Logo" 
                    className="max-w-full max-h-full object-contain"
                />
            </div>

            {/* Navigation Menu */}
            {/* Pl-6 pushes content right, pr-0 allows active items to hit the absolute edge */}
            <nav className="w-full pl-6 pr-0 flex flex-col gap-1 relative">
                {menuItems.map((item) => {
                    const isActive = activeItem === item.name;

                    return (
                        <div
                            key={item.name}
                            onClick={() => setActiveItem(item.name)}
                            className={`relative flex items-center justify-between font-semibold cursor-pointer transition-all duration-150 py-4 pl-6
                                ${isActive 
                                    // Active: Flushed to the right wall (pr-6 matches standard padding inside)
                                    ? 'bg-white text-black rounded-l-[35px] z-10 pr-6' 
                                    // Inactive: Kept away from the edge with mr-6 so it doesn't look awkward
                                    : 'text-white/80 hover:text-white hover:bg-white/5 rounded-l-full mr-6 pr-6'
                                }`}
                        >
                            {/* --- Corrected Pure CSS Flush Inverse Corners --- */}
                            {isActive && (
                                <>
                                    {/* Top Scooped Corner */}
                                    <div className="absolute right-0 -top-[24px] w-[24px] h-[24px] bg-transparent pointer-events-none rounded-br-[24px] shadow-[8px_8px_0_0_#fff]" />
                                    
                                    {/* Bottom Scooped Corner */}
                                    <div className="absolute right-0 -bottom-[24px] w-[24px] h-[24px] bg-transparent pointer-events-none rounded-tr-[24px] shadow-[8px_-8px_0_0_#fff]" />
                                </>
                            )}

                            {/* Content */}
                            <div className="flex items-center gap-4">
                                <span className={`text-xl ${isActive ? 'text-black' : 'opacity-70'}`}>
                                    {item.icon}
                                </span>
                                <span className="text-lg">{item.name}</span>
                            </div>
                            
                            {item.hasDropdown && (
                                <span className={`text-sm transition-transform ${isActive ? 'text-black' : 'opacity-70'}`}>
                                    {isActive ? '⌃' : '⌄'}
                                </span>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="mt-auto w-full px-6">
                <div className="flex items-center gap-4 text-white/80 hover:text-white hover:bg-white/10 px-6 py-4 rounded-full font-medium cursor-pointer transition-colors">
                    <span className="text-xl opacity-70">↪</span>
                    <span className="text-lg">Logout</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;