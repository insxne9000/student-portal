import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
    const [groupedStudents, setGroupedStudents] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get('/api/admin/students');
                setGroupedStudents(response.data.grouped);
            } catch (err) {
                setError('Failed to load students.');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const renderStudentTable = (batchYear, students) => (
        <div key={batchYear} className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-red-600 pl-3">
                Batch: {batchYear}
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                        <tr>
                            <th className="py-4 px-6 font-semibold text-sm">Matric No.</th>
                            <th className="py-4 px-6 font-semibold text-sm">Full Name</th>
                            <th className="py-4 px-6 font-semibold text-sm text-center">Credits Completed</th>
                            <th className="py-4 px-6 font-semibold text-sm text-center">Credits Required</th>
                            <th className="py-4 px-6 font-semibold text-sm text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => {
                            const isGraduated = student.creditsCompleted >= student.creditsRequired;
                            return (
                                <tr key={student._id} className="border-b border-gray-100 hover:bg-red-50/30 transition-colors">
                                    <td className="py-4 px-6 font-bold text-gray-800">{student.matricNo}</td>
                                    <td className="py-4 px-6 text-gray-700 font-medium">{student.name}</td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isGraduated ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {student.creditsCompleted}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center text-gray-500 font-medium">{student.creditsRequired}</td>
                                    <td className="py-4 px-6 text-right">
                                        <button 
                                            onClick={() => navigate(`/admin/student/${student._id}`)}
                                            className="text-red-600 hover:text-red-800 font-bold text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CS Department Administration</h1>
            <p className="text-gray-500 mb-8">Manage student records, approve payments, and clear support tickets.</p>

            {loading ? (
                <div className="py-20 text-center text-gray-500">Loading student registry...</div>
            ) : error ? (
                <div className="py-20 text-center text-red-500">{error}</div>
            ) : Object.keys(groupedStudents).length === 0 ? (
                <div className="py-20 text-center text-gray-500">No students registered in the system yet.</div>
            ) : (
                Object.entries(groupedStudents)
                    .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA)) // Newest batches first
                    .map(([batchYear, students]) => renderStudentTable(batchYear, students))
            )}
        </div>
    );
}

export default AdminDashboard;
