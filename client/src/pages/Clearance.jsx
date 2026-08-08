import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import logoUrl from '../assets/logo.png';

function Clearance() {
    const [clearanceItems, setClearanceItems] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);
    const [session, setSession] = useState('2025/2026');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClearance = async () => {
            try {
                const response = await axios.get('/api/student/clearance');
                setClearanceItems(response.data.clearance?.items || []);
                setStudentInfo(response.data.student || null);
                setSession(response.data.session || '2025/2026');
            } catch (err) {
                setError('Unable to load clearance records.');
            } finally {
                setLoading(false);
            }
        };

        fetchClearance();
    }, []);

    const generateClearancePdf = (item) => {
        const doc = new jsPDF();
        const img = new Image();
        img.src = logoUrl;

        doc.addImage(img, 'PNG', 14, 10, 26, 26);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Precious Cornerstone University', 46, 22);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.label} Certificate`, 46, 30);

        doc.setFontSize(11);
        doc.text(`Student Name: ${studentInfo?.name || 'N/A'}`, 14, 52);
        doc.text(`Matric No: ${studentInfo?.matricNo || 'N/A'}`, 14, 59);
        doc.text(`Programme: ${studentInfo?.programme || 'N/A'}`, 14, 66);
        doc.text(`Session: ${session}`, 14, 73);
        doc.text(`Status: ${item.status}`, 14, 80);

        autoTable(doc, {
            head: [['Field', 'Details']],
            body: [
                ['Clearance Type', item.label],
                ['Approval Status', item.status],
                ['Remark', item.status === 'Approved' ? 'Student has satisfied the required condition.' : 'Approval is still pending.'],
            ],
            startY: 92,
            theme: 'striped',
            headStyles: { fillColor: [81, 4, 67] },
        });

        const finalY = doc.lastAutoTable.finalY || 120;
        doc.setFontSize(11);
        doc.text('This document is system-generated and valid for demonstration purposes.', 14, finalY + 18);
        doc.save(`${item.label.replace(/\s+/g, '_')}.pdf`);
    };

    if (loading) {
        return <div className="p-20 text-center text-gray-500">Loading clearance records...</div>;
    }

    return (
        <main className="min-h-[calc(100vh-80px)] bg-[#f4f7f6] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div className="mx-auto w-full max-w-[1100px]">
                <div className="mb-8 rounded-[28px] bg-gradient-to-r from-[#510443] to-[#870873] p-6 text-white shadow-lg sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-black">Clearance Centre</h1>
                            <p className="mt-2 text-white/85">
                                View your available clearance documents and download approved copies instantly.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur-sm">
                            <ShieldCheck size={18} />
                            Approved clearances can be downloaded.
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {clearanceItems.map((item, index) => {
                            const approved = item.status === 'Approved';
                            return (
                                <div key={`${item.label}-${index}`} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">{item.label}</h2>
                                            <p className="mt-2 text-sm text-gray-500">
                                                {approved
                                                    ? 'This clearance has been approved and is ready for download.'
                                                    : 'This clearance is still awaiting approval.'}
                                            </p>
                                        </div>
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                                                approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                        >
                                            {approved ? <CheckCircle size={14} /> : <Clock size={14} />}
                                            {item.status}
                                        </span>
                                    </div>

                                    <div className="rounded-xl bg-[#680659]/5 p-4 text-sm text-gray-700">
                                        <p><span className="font-semibold">Student:</span> {studentInfo?.name || 'N/A'}</p>
                                        <p><span className="font-semibold">Matric No:</span> {studentInfo?.matricNo || 'N/A'}</p>
                                        <p><span className="font-semibold">Session:</span> {session}</p>
                                    </div>

                                    <div className="mt-5">
                                        <button
                                            onClick={() => generateClearancePdf(item)}
                                            disabled={!approved}
                                            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                                                approved
                                                    ? 'bg-[#510443] text-white hover:bg-[#6d0a5c]'
                                                    : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                            }`}
                                        >
                                            <Download size={16} />
                                            {approved ? 'Download Clearance' : 'Awaiting Approval'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

export default Clearance;
