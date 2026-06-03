import React from 'react';

function Notification() {
    return (
        <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6]">
            <div className="flex-grow px-10 py-8 max-w-[1200px] mx-auto w-full">
                <h1 className="text-xl font-bold text-[#1f2937] mb-6">Notifications</h1>
                
                <div className="bg-white shadow-sm border border-gray-200">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-[#1f2937]">Notification List</h2>
                    </div>
                    
                    <div className="p-6 min-h-[300px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#6b2a5c] text-white">
                                <tr>
                                    <th className="py-3 px-4 font-medium text-sm w-[60px] border-r border-[#854576]">#</th>
                                    <th className="py-3 px-4 font-medium text-sm">Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Empty for now, but table structure is there */}
                                <tr>
                                    <td colSpan="2" className="py-8 text-center text-gray-500 border-b border-gray-100">
                                        No new notifications at this time.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Notification;
