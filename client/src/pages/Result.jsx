import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Lock, FileText, CheckCircle, XCircle, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoUrl from '../assets/logo.png';

function Result() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('Year 1 - 1st Sem');

    const allSemesters = [
        'Year 1 - 1st Sem',
        'Year 1 - 2nd Sem',
        'Year 2 - 1st Sem',
        'Year 2 - 2nd Sem',
        'Year 3 - 1st Sem',
        'Year 3 - 2nd Sem',
        'Year 4 - 1st Sem',
        'Year 4 - 2nd Sem',
    ];

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get('/api/student/results');
                setData(response.data);

                if (!response.data.locked && response.data.grades && response.data.grades.length > 0) {
                    const labels = response.data.grades.map((g) => g.semesterLabel);
                    const uniqueLabels = [...new Set(labels)];
                    if (uniqueLabels.length > 0) {
                        setSelectedSemester(uniqueLabels[uniqueLabels.length - 1]);
                    }
                }
            } catch (err) {
                setError('Failed to fetch results.');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const getGradePoint = (letterGrade) => {
        switch (letterGrade) {
            case 'A': return 5;
            case 'B': return 4;
            case 'C': return 3;
            case 'D': return 2;
            case 'E': return 1;
            case 'F': return 0;
            default: return 0;
        }
    };

    const generateResultPdf = (grades, cgpa) => {
        const doc = new jsPDF();
        const img = new Image();
        img.src = logoUrl;
        doc.addImage(img, 'PNG', 14, 10, 28, 28);

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Precious Cornerstone University', 48, 22);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Approved Academic Result Summary', 48, 30);

        doc.setFontSize(11);
        doc.text('Student Name: Ahmed Adewole', 14, 48);
        doc.text('Matric No: 2022/502', 14, 55);
        doc.text(`Selected Semester: ${selectedSemester}`, 14, 62);
        doc.text(`CGPA: ${cgpa}`, 150, 48);
        doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 150, 55);

        const rows = grades.map((g, index) => [
            index + 1,
            g.courseId?.courseCode || '-',
            g.courseId?.title || '-',
            g.courseId?.credits || '-',
            g.score ?? '-',
            g.grade ?? '-',
            g.passed ? 'Passed' : 'In Progress',
        ]);

        autoTable(doc, {
            head: [['S/N', 'Course Code', 'Course Title', 'Credits', 'Score', 'Grade', 'Status']],
            body: rows,
            startY: 76,
            theme: 'striped',
            headStyles: { fillColor: [81, 4, 67] },
            styles: { fontSize: 9 },
        });

        const finalY = doc.lastAutoTable.finalY || 76;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('This result is downloadable because it has been released/approved from the admin side.', 14, finalY + 16);
        doc.save(`PCU_Result_${selectedSemester.replace(/\s+/g, '_')}.pdf`);
    };

    if (loading) {
        return (
            <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6]">
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500 font-medium">Loading your academic records...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6]">
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-red-500 font-medium">{error}</p>
                </div>
            </main>
        );
    }

    if (data.locked) {
        return (
            <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6] p-10">
                <div className="max-w-3xl mx-auto w-full mt-20">
                    <div className="bg-white border-2 border-red-100 rounded-3xl p-10 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-red-600"></div>
                        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <Lock size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Results Withheld</h2>
                        <p className="text-gray-600 text-lg max-w-lg mb-8 leading-relaxed">
                            {data.message} Please ensure all outstanding tuition and fees have been cleared and approved by the administration.
                        </p>
                        <button
                            onClick={() => window.location.href = '/payment'}
                            className="bg-[#510443] hover:bg-[#781763] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-colors"
                        >
                            Go to Payments Page
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const { grades } = data;
    const filteredGrades = grades.filter((g) => g.semesterLabel === selectedSemester);
    const totalCreditsEarned = grades.filter((g) => g.passed).reduce((sum, g) => sum + (g.courseId?.credits || 0), 0);

    const cumulativeData = useMemo(() => {
        let totalCredits = 0;
        let totalGradePoints = 0;

        grades.forEach((g) => {
            if (g.score !== undefined) {
                const credits = g.courseId?.credits || 0;
                totalCredits += credits;
                totalGradePoints += getGradePoint(g.grade) * credits;
            }
        });

        const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
        return { cgpa, totalCredits };
    }, [grades]);

    const releasedResults = filteredGrades.filter((g) => g.released && g.score !== undefined);
    const downloadable = releasedResults.length > 0;
    const allGraded = filteredGrades.every((g) => g.score !== undefined);

    return (
        <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6]">
            <div className="flex-grow px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-[1200px] mx-auto w-full">
                <div className="flex flex-col gap-5 lg:flex-row lg:justify-between lg:items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#510443] mb-2">Academic Transcript</h1>
                        <p className="text-gray-500 font-medium tracking-wide">View and download your approved academic result.</p>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="flex flex-col items-start md:items-end">
                            <label className="text-sm font-bold text-gray-600 mb-1">Select Semester</label>
                            <select
                                className="bg-white border border-gray-300 text-gray-800 text-sm font-semibold rounded-lg focus:ring-[#781763] focus:border-[#781763] block p-2.5 outline-none shadow-sm min-w-[220px]"
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                            >
                                {allSemesters.map((sem) => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </select>
                        </div>
                        <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200 text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Earned Credits</p>
                            <p className="text-2xl font-black text-green-600">{totalCreditsEarned}</p>
                        </div>
                        <button
                            onClick={() => generateResultPdf(releasedResults, cumulativeData.cgpa)}
                            disabled={!downloadable}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                            <Download size={16} /> Download Result
                        </button>
                    </div>
                </div>

                {!downloadable && filteredGrades.length > 0 && (
                    <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm text-yellow-800">
                        Your result is visible in progress, but download will only be enabled after the admin releases/approves the graded result.
                    </div>
                )}

                <div className="flex flex-col gap-8">
                    {filteredGrades.length === 0 ? (
                        <div className="bg-white p-16 text-center shadow-sm border border-gray-200 rounded-xl">
                            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No Records Found</h3>
                            <p className="text-gray-500 font-medium max-w-md mx-auto">
                                There are no transcript records for the selected semester. You may not have registered or been promoted to this semester yet.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-[#510443] px-6 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center text-white">
                                <h2 className="font-bold">{selectedSemester}</h2>
                                {allGraded ? (
                                    <span className="font-bold text-sm bg-white/20 px-3 py-1 rounded-full w-fit">
                                        CGPA: {cumulativeData.cgpa}
                                    </span>
                                ) : (
                                    <span className="font-bold text-sm bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full w-fit">
                                        Semester Ongoing
                                    </span>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                        <tr>
                                            <th className="py-4 px-6 font-semibold text-sm">Course Code</th>
                                            <th className="py-4 px-6 font-semibold text-sm">Course Title</th>
                                            <th className="py-4 px-6 font-semibold text-sm text-center w-24">Credits</th>
                                            <th className="py-4 px-6 font-semibold text-sm text-center w-24">Attnd</th>
                                            <th className="py-4 px-6 font-semibold text-sm text-center w-24">Score</th>
                                            <th className="py-4 px-6 font-semibold text-sm text-center w-24">Grade</th>
                                            <th className="py-4 px-6 font-semibold text-sm text-center w-32">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredGrades.map((g) => {
                                            const isGraded = g.score !== undefined;
                                            const isFailed = isGraded && !g.passed;

                                            return (
                                                <tr key={g._id} className={`border-b border-gray-100 transition-colors ${isFailed ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                                                    <td className="py-4 px-6 font-bold text-gray-800">{g.courseId?.courseCode}</td>
                                                    <td className="py-4 px-6 text-gray-600">{g.courseId?.title}</td>
                                                    <td className="py-4 px-6 text-center font-semibold text-gray-700">{g.courseId?.credits}</td>
                                                    <td className="py-4 px-6 text-center font-bold text-blue-600">
                                                        {g.totalClasses > 0 ? `${Math.round((g.classesAttended / g.totalClasses) * 100)}%` : '-'}
                                                    </td>
                                                    <td className="py-4 px-6 text-center font-bold text-gray-800">
                                                        {isGraded ? g.score : '-'}
                                                    </td>
                                                    <td className={`py-4 px-6 text-center font-black text-lg ${isFailed ? 'text-red-600' : isGraded ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {isGraded ? g.grade : '-'}
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        {isGraded ? (
                                                            g.passed ? (
                                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                                                    <CheckCircle size={14} /> Passed
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                                                                    <XCircle size={14} /> Failed
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                                                                <FileText size={14} /> Ongoing
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default Result;
