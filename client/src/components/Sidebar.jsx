import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    CreditCard, 
    BookOpen, 
    Sun, 
    ClipboardCheck, 
    FileCheck, 
    GraduationCap, 
    User, 
    Bell, 
    LogOut,
    ChevronDown,
    ChevronUp,
    MessageSquare
} from 'lucide-react';

import logo from '../assets/logo.png';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={22} /> },
        { name: 'Payment', path: '/payment', hasDropdown: true, icon: <CreditCard size={22} /> },
        { name: 'Course', path: '/course', hasDropdown: true, icon: <BookOpen size={22} /> },
        { name: 'Summer', path: '/summer', hasDropdown: true, icon: <Sun size={22} /> },
        { name: 'Attendance', path: '/attendance', icon: <ClipboardCheck size={22} /> },
        { name: 'Clearance', path: '/clearance', icon: <FileCheck size={22} /> },
        { name: 'Result', path: '/result', icon: <GraduationCap size={22} /> },
        { name: 'Profile', path: '/profile', icon: <User size={22} /> },
        { name: 'Notification', path: '/notification', icon: <Bell size={22} /> },
        { name: 'Complaints', path: '/complaints', icon: <MessageSquare size={22} /> }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        // Crucial fix: Added overflow-hidden to cleanly clip the right-edge curve intersections
        <aside className="w-[326px] h-screen bg-gradient-to-b from-[#21021C] via-[#540547] to-[#870873] py-10 flex flex-col items-center shadow-none flex-shrink-0 z-10 relative overflow-hidden">
            
            {/* Logo Container */}
            <div className="w-[100px] h-[100px] mb-8 flex items-center justify-center bg-white rounded-2xl shadow-inner overflow-hidden border-2 border-white shrink-0">
                <img 
                    src={logo} 
                    alt="University Logo" 
                    className="w-full h-full object-cover bg-white"
                />
            </div>

            {/* Navigation Menu */}
            <nav className="w-full flex-1 overflow-y-auto flex flex-col gap-1 relative scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2">
                {menuItems.map((item) => {
                    // Check if current path matches item path
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={`flex items-center justify-between font-semibold cursor-pointer transition-all duration-150 py-3 px-6 mx-4 rounded-xl
                                ${isActive 
                                    ? 'bg-white/20 text-white' 
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {/* Content */}
                            <div className="flex items-center gap-4">
                                <span className={`text-xl ${isActive ? 'text-white' : 'opacity-70'}`}>
                                    {item.icon}
                                </span>
                                <span className="text-lg">{item.name}</span>
                            </div>
                            
                            {item.hasDropdown && (
                                <span className={`text-sm transition-transform ${isActive ? 'text-white' : 'opacity-70'}`}>
                                    {isActive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="mt-auto w-full px-6">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 text-white/80 hover:text-white hover:bg-white/10 px-6 py-4 rounded-full font-medium cursor-pointer transition-colors"
                >
                    <span className="opacity-70"><LogOut size={22} /></span>
                    <span className="text-lg">Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;