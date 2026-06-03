import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function DashboardLayout() {
    return (
        <div className="flex h-screen bg-white font-sans overflow-hidden">
            <Sidebar />
            <div className="flex-1 h-screen overflow-y-auto bg-white flex flex-col">
                <div className="flex-grow">
                    <Outlet />
                </div>
                <footer className="mt-auto bg-white py-4 px-10 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                    <div>2026 © PRECIOUS CORNERSTONE UNIVERSITY</div>
                    <div>Made with <span className="text-red-500">❤️</span> by AHMED & team</div>
                </footer>
            </div>
        </div>
    );
}

export default DashboardLayout;
