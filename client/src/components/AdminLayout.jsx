import React from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Users } from 'lucide-react';
import logo from '../assets/logo.png';

const AdminAuthWrapper = ({ children }) => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

function AdminLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    return (
        <div className="flex h-screen bg-[#f4f7f6] font-sans overflow-hidden">
            {/* Admin Sidebar */}
            <aside className="w-[300px] h-screen bg-gradient-to-b from-gray-900 to-gray-800 rounded-r-[30px] py-10 flex flex-col items-center shadow-2xl flex-shrink-0 z-10 relative overflow-hidden">
                <div className="w-[80px] h-[80px] mb-6 flex items-center justify-center bg-white rounded-2xl shadow-inner overflow-hidden border-2 border-white shrink-0">
                    <img src={logo} alt="University Logo" className="w-full h-full object-cover bg-white" />
                </div>
                <h2 className="text-white font-bold tracking-widest mb-10 text-sm opacity-80 uppercase">Administration</h2>
                
                <nav className="w-full flex-1 flex flex-col gap-2 px-4">
                    <NavLink to="/admin" end className={({isActive}) => `flex items-center gap-4 px-6 py-4 rounded-xl font-medium transition-colors ${isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </NavLink>
                </nav>

                <div className="mt-auto w-full px-4">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 text-gray-400 hover:text-white hover:bg-white/10 px-6 py-4 rounded-xl font-medium cursor-pointer transition-colors">
                        <LogOut size={20} />
                        Logout Admin
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 h-screen overflow-y-auto flex flex-col bg-slate-50">
                <div className="flex-grow p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export { AdminAuthWrapper, AdminLayout };
