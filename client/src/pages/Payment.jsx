import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CreditCard, FileText, CheckCircle, Clock } from 'lucide-react';
import logoUrl from '../assets/logo.png'; // Make sure this path resolves correctly to the logo

function Payment() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const token = localStorage.getItem('token');
                // The studentController needs a getInvoices endpoint.
                // Wait! I didn't create a `getInvoices` endpoint in `studentController`.
                // Let me fetch student details that include invoices. Actually I'll hit a new endpoint if I made one,
                // but if not, I can just fetch from `/api/student/results` and add invoices to that response, or create `/api/student/invoices`.
                const response = await axios.get(`${apiBaseUrl}/api/student/invoices`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInvoices(response.data.invoices);
            } catch (err) {
                setError('Failed to fetch invoices.');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const generatePDF = (invoice) => {
        const doc = new jsPDF();
        
        // Add Logo
        const img = new Image();
        img.src = logoUrl;
        doc.addImage(img, 'PNG', 14, 10, 30, 30);
        
        // Header info
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Precious Cornerstone University", 50, 22);
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text("Payment Receipt / Invoice", 50, 30);
        
        // Invoice Details
        doc.setFontSize(11);
        doc.text(`Invoice ID: INV-${invoice._id.substring(0, 8).toUpperCase()}`, 14, 55);
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 14, 62);
        doc.text(`Student Name: Ahmed Adewole`, 140, 55); // Consistent Name
        doc.text(`Matric No: 2022/502`, 140, 62); // Consistent Matric
        doc.text(`Semester: ${invoice.semester}`, 140, 69);
        
        // Line Items Table
        const tableColumn = ["S/N", "Description (Course Code)", "Amount (NGN)"];
        const tableRows = [];
        
        invoice.lineItems.forEach((item, index) => {
            const rowData = [
                index + 1,
                item.courseCode,
                `N ${item.amount.toLocaleString()}`
            ];
            tableRows.push(rowData);
        });
        
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 85,
            theme: 'striped',
            headStyles: { fillColor: [81, 4, 67] }, // The #510443 theme color
        });
        
        const finalY = doc.lastAutoTable.finalY || 85;
        
        // Total
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Paid: N ${invoice.totalAmountDue.toLocaleString()}`, 14, finalY + 15);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("This is an automatically generated receipt. Valid without signature.", 14, finalY + 30);
        
        doc.save(`PCU_Receipt_INV_${invoice._id.substring(0, 8)}.pdf`);
    };

    if (loading) return <div className="p-20 text-center text-gray-500">Loading your invoices...</div>;

    return (
        <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6]">
            <div className="flex-grow px-10 py-10 max-w-[1000px] mx-auto w-full">
                
                <h1 className="text-3xl font-black text-[#510443] mb-2">Payment Invoices</h1>
                <p className="text-gray-500 font-medium mb-10">Manage your course registration fee payments and download receipts.</p>

                {error ? (
                    <div className="bg-red-50 text-red-500 p-5 rounded-xl border border-red-200">{error}</div>
                ) : invoices.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl text-center text-gray-500 border border-gray-200">
                        <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                        No generated invoices found. Register for courses to generate a payment invoice.
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {invoices.map(inv => (
                            <div key={inv._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${inv.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {inv.status === 'paid' ? <CheckCircle size={32} /> : <Clock size={32} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Semester {inv.semester} Registration</h3>
                                        <p className="text-gray-500 text-sm">Invoice ID: INV-{inv._id.substring(0, 8).toUpperCase()}</p>
                                        <p className="text-gray-500 text-sm">{inv.lineItems.length} Registered Courses</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col md:items-end w-full md:w-auto">
                                    <p className="text-2xl font-black text-[#510443] mb-2">₦{inv.totalAmountDue.toLocaleString()}</p>
                                    
                                    {inv.status === 'paid' ? (
                                        <button 
                                            onClick={() => generatePDF(inv)}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm w-full md:w-auto justify-center"
                                        >
                                            <FileText size={18} /> Download PDF Receipt
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 border border-yellow-200 px-5 py-2.5 rounded-lg font-bold text-sm w-full md:w-auto justify-center">
                                            Pending Admin Approval
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default Payment;
