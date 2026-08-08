import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CreditCard, FileText, CheckCircle, Clock, Wallet, BadgeAlert } from 'lucide-react';
import logoUrl from '../assets/logo.png';

function Payment() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentInputs, setPaymentInputs] = useState({});
    const [message, setMessage] = useState('');

    const fetchInvoices = async () => {
        try {
            const response = await axios.get('/api/student/invoices');
            setInvoices(response.data.invoices || []);
        } catch (err) {
            setError('Failed to fetch invoices.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const getPaidAmount = (invoice) => invoice.amountPaid || 0;
    const getRemainingAmount = (invoice) => Math.max(invoice.totalAmountDue - getPaidAmount(invoice), 0);

    const handleRecordPayment = async (invoice) => {
        const rawValue = paymentInputs[invoice._id];
        const amount = Number(rawValue);

        if (!amount || amount <= 0) {
            setMessage('Please enter a valid payment amount.');
            return;
        }

        try {
            const response = await axios.post(`/api/student/invoices/${invoice._id}/pay`, { amount });
            setMessage(response.data.message || 'Payment recorded successfully.');
            setPaymentInputs((prev) => ({ ...prev, [invoice._id]: '' }));
            await fetchInvoices();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Unable to record payment right now.');
        }
    };

    const generatePDF = (invoice) => {
        const paidAmount = getPaidAmount(invoice);
        const balance = getRemainingAmount(invoice);
        const doc = new jsPDF();

        const img = new Image();
        img.src = logoUrl;
        doc.addImage(img, 'PNG', 14, 10, 30, 30);

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Precious Cornerstone University', 50, 22);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Payment Receipt / Invoice Summary', 50, 30);

        doc.setFontSize(11);
        doc.text(`Invoice ID: INV-${invoice._id.substring(0, 8).toUpperCase()}`, 14, 55);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 62);
        doc.text('Student Name: Ahmed Adewole', 140, 55);
        doc.text('Matric No: 2022/502', 140, 62);
        doc.text(`Semester: ${invoice.semester}`, 140, 69);

        const tableColumn = ['S/N', 'Description', 'Amount (NGN)'];
        const tableRows = invoice.lineItems.map((item, index) => [
            index + 1,
            item.courseCode,
            `₦ ${item.amount.toLocaleString()}`,
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 85,
            theme: 'striped',
            headStyles: { fillColor: [81, 4, 67] },
        });

        const finalY = doc.lastAutoTable.finalY || 85;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Expected: ₦ ${invoice.totalAmountDue.toLocaleString()}`, 14, finalY + 15);
        doc.text(`Total Paid: ₦ ${paidAmount.toLocaleString()}`, 14, finalY + 24);
        doc.text(`Outstanding Balance: ₦ ${balance.toLocaleString()}`, 14, finalY + 33);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('This is an automatically generated payment record.', 14, finalY + 46);
        doc.save(`PCU_Payment_Record_INV_${invoice._id.substring(0, 8)}.pdf`);
    };

    const totals = useMemo(() => {
        const totalExpected = invoices.reduce((sum, inv) => sum + inv.totalAmountDue, 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
        return {
            totalExpected,
            totalPaid,
            totalOutstanding: Math.max(totalExpected - totalPaid, 0),
        };
    }, [invoices]);

    if (loading) return <div className="p-20 text-center text-gray-500">Loading your invoices...</div>;

    return (
        <main className="flex flex-col min-h-[calc(100vh-80px)] bg-[#f4f7f6]">
            <div className="flex-grow px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-[1100px] mx-auto w-full">
                <h1 className="text-3xl font-black text-[#510443] mb-2">Payment Invoices</h1>
                <p className="text-gray-500 font-medium mb-8">
                    Manage your fees, decide how much to pay from your outstanding balance, and download payment records.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Total Expected</p>
                        <p className="text-3xl font-black text-[#510443]">₦{totals.totalExpected.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Total Paid</p>
                        <p className="text-3xl font-black text-green-600">₦{totals.totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Outstanding Balance</p>
                        <p className="text-3xl font-black text-orange-500">₦{totals.totalOutstanding.toLocaleString()}</p>
                    </div>
                </div>

                {message && (
                    <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
                        {message}
                    </div>
                )}

                {error ? (
                    <div className="bg-red-50 text-red-500 p-5 rounded-xl border border-red-200">{error}</div>
                ) : invoices.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl text-center text-gray-500 border border-gray-200">
                        <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                        No generated invoices found. Register for courses to generate a payment invoice.
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {invoices.map((inv) => {
                            const paidAmount = getPaidAmount(inv);
                            const balance = getRemainingAmount(inv);
                            const status = inv.status;
                            const history = inv.paymentHistory || [];

                            return (
                                <div key={inv._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {status === 'paid' ? <CheckCircle size={32} /> : <Clock size={32} />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">Semester {inv.semester} Registration</h3>
                                                <p className="text-gray-500 text-sm">Invoice ID: INV-{inv._id.substring(0, 8).toUpperCase()}</p>
                                                <p className="text-gray-500 text-sm">{inv.lineItems.length} Registered Courses</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto md:min-w-[420px]">
                                            <div className="rounded-xl bg-[#680659]/5 p-4">
                                                <p className="text-xs font-bold text-gray-400 uppercase">Expected</p>
                                                <p className="mt-2 text-xl font-black text-[#510443]">₦{inv.totalAmountDue.toLocaleString()}</p>
                                            </div>
                                            <div className="rounded-xl bg-green-50 p-4">
                                                <p className="text-xs font-bold text-gray-400 uppercase">Paid</p>
                                                <p className="mt-2 text-xl font-black text-green-600">₦{paidAmount.toLocaleString()}</p>
                                            </div>
                                            <div className="rounded-xl bg-orange-50 p-4">
                                                <p className="text-xs font-bold text-gray-400 uppercase">Balance</p>
                                                <p className="mt-2 text-xl font-black text-orange-500">₦{balance.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        <div className="rounded-2xl border border-gray-200 p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Wallet size={18} className="text-[#510443]" />
                                                <h4 className="font-bold text-gray-800">Flexible Payment</h4>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Choose how much you want to pay from the total expected amount.
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={balance}
                                                    value={paymentInputs[inv._id] || ''}
                                                    onChange={(e) => setPaymentInputs((prev) => ({ ...prev, [inv._id]: e.target.value }))}
                                                    placeholder="Enter amount"
                                                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#510443] focus:ring-2 focus:ring-[#510443]/10"
                                                    disabled={status === 'paid'}
                                                />
                                                <button
                                                    onClick={() => handleRecordPayment(inv)}
                                                    disabled={status === 'paid'}
                                                    className={`rounded-xl px-5 py-3 text-sm font-bold transition-colors ${
                                                        status === 'paid'
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-[#510443] text-white hover:bg-[#6d0a5c]'
                                                    }`}
                                                >
                                                    {status === 'paid' ? 'Fully Paid' : 'Record Payment'}
                                                </button>
                                            </div>
                                            {balance > 0 && (
                                                <p className="mt-3 text-xs text-gray-500">
                                                    You can pay any amount up to ₦{balance.toLocaleString()} for this invoice.
                                                </p>
                                            )}
                                        </div>

                                        <div className="rounded-2xl border border-gray-200 p-5">
                                            <div className="mb-4 flex items-center justify-between gap-3">
                                                <div>
                                                    <h4 className="font-bold text-gray-800">Payment Record</h4>
                                                    <p className="text-sm text-gray-500">Download payment summary once you are satisfied.</p>
                                                </div>
                                                {status === 'paid' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                                        <CheckCircle size={14} /> Paid in Full
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                                                        <BadgeAlert size={14} /> Part Payment Allowed
                                                    </span>
                                                )}
                                            </div>

                                            {history.length > 0 ? (
                                                <div className="mb-4 space-y-2">
                                                    {history.map((entry, index) => (
                                                        <div key={`${inv._id}-${index}`} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
                                                            <span>Payment {index + 1}</span>
                                                            <span className="font-bold text-[#510443]">₦{entry.amount.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                                                    No payment has been recorded yet for this invoice.
                                                </div>
                                            )}

                                            <button
                                                onClick={() => generatePDF(inv)}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700"
                                            >
                                                <FileText size={18} /> Download Payment Record
                                            </button>
                                        </div>
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

export default Payment;
