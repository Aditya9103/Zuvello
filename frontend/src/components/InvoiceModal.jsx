import React, { useState } from 'react';
import axios from 'axios';
import { X, Printer, Download, FileText, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../api';

// Helper to convert Indian Rupees into words
const numberToWordsINR = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
        let str = '';
        if (n > 99) {
            str += a[Math.floor(n / 100)] + 'Hundred ';
            n %= 100;
        }
        if (n > 19) {
            str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
        } else {
            str += a[n];
        }
        return str;
    };

    let n = Math.floor(num);
    if (n === 0) return 'Zero Rupees Only';

    let crore = Math.floor(n / 10000000);
    n %= 10000000;
    let lakh = Math.floor(n / 100000);
    n %= 100000;
    let thousand = Math.floor(n / 1000);
    n %= 1000;

    let res = '';
    if (crore) res += inWords(crore) + 'Crore ';
    if (lakh) res += inWords(lakh) + 'Lakh ';
    if (thousand) res += inWords(thousand) + 'Thousand ';
    if (n) res += inWords(n);

    return (res.trim() + ' Rupees Only').replace(/\s+/g, ' ');
};

const InvoiceModal = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null;

    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const invoiceNumber = `INV-${order._id.slice(-8).toUpperCase()}`;
    const invoiceDate = order.paidAt
        ? new Date(order.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const customerName = order.shippingAddress?.name || 'Customer';
    const customerPhone = order.shippingAddress?.phone || 'N/A';
    const deliveryAddress = `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''} - ${order.shippingAddress?.postalCode || ''}, India`;

    const paymentId = order.paymentResult?.razorpay_payment_id || order.payment?.razorpayPaymentId || 'N/A';
    const paymentOrderRzpId = order.razorpayOrderId || order.payment?.razorpayOrderId || 'N/A';
    const paymentMethodDisplay = order.paymentMethod === 'COD' ? 'Cash On Delivery (COD)' : `Razorpay Online (${order.paymentMethod || 'UPI / Cards'})`;
    const paymentStatusDisplay = order.isPaid || order.paymentStatus === 'CAPTURED' ? 'PAID / CAPTURED' : (order.paymentStatus || 'PENDING');

    const itemsSubtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const discount = order.discountAmount || 0;
    const finalAmount = order.totalPrice || (itemsSubtotal - discount);
    const amountInWords = numberToWordsINR(finalAmount);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        setDownloadingPdf(true);
        try {
            const invoiceElement = document.getElementById('printable-invoice');
            if (invoiceElement) {
                const html2pdfModule = await import('html2pdf.js');
                const html2pdf = html2pdfModule.default || html2pdfModule;

                const opt = {
                    margin: [8, 8, 8, 8],
                    filename: `Zuvello_Tax_Invoice_${invoiceNumber}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, logging: false },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                await html2pdf().set(opt).from(invoiceElement).save();
            }
        } catch (err) {
            console.error('PDF generation failed, falling back to print:', err);
            window.print();
        } finally {
            setDownloadingPdf(false);
        }
    };

    return (
        <div
            id="invoice-modal-root"
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static"
        >
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    html, body {
                        background: #ffffff !important;
                        height: auto !important;
                        overflow: visible !important;
                    }
                    /* Hide everything in the document by default */
                    body * {
                        visibility: hidden !important;
                    }
                    /* Isolate only the invoice modal and its descendants */
                    #invoice-modal-root,
                    #invoice-modal-root * {
                        visibility: visible !important;
                    }
                    #invoice-modal-root {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        min-height: 100% !important;
                        background: #ffffff !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        display: block !important;
                        z-index: 999999 !important;
                    }
                    #invoice-modal-card {
                        border: none !important;
                        box-shadow: none !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        height: auto !important;
                        max-height: none !important;
                        overflow: visible !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    #printable-invoice {
                        overflow: visible !important;
                        padding: 24px !important;
                        height: auto !important;
                        width: 100% !important;
                    }
                    .print-hidden-bar {
                        display: none !important;
                    }
                }
            `}} />

            {/* Modal Box - Pinned inside viewport, never cut off */}
            <div
                id="invoice-modal-card"
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full h-[92vh] max-h-[95vh] flex flex-col shadow-2xl border border-[#f5eadb] overflow-hidden print:shadow-none print:border-none print:m-0 print:max-w-full print:h-auto print:max-h-none"
            >

                {/* Header Action Bar (Hidden in Print) - ALWAYS visible at top */}
                <div className="shrink-0 bg-[#faf7f2] border-b border-[#f0e6d8] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 print:hidden print-hidden-bar">
                    <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-5 h-5 text-[#cf7e28] shrink-0" />
                        <span className="font-extrabold text-[#1c1c1c] text-xs sm:text-sm truncate">
                            Tax Invoice: <span className="font-mono text-[#cf7e28]">{invoiceNumber}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button
                            disabled={downloadingPdf}
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-[#cf7e28] hover:bg-[#b56e22] text-white text-xs font-bold rounded-lg transition-all shadow-sm disabled:opacity-50 active:scale-95"
                            title="Download PDF"
                        >
                            {downloadingPdf ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span className="hidden sm:inline">Generating...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download PDF</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                            title="Print or Save as PDF"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Body - Scrollable inside modal */}
                <div id="printable-invoice" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-[#1a1614] print:overflow-visible print:p-0">

                    {/* Invoice Top Header */}
                    <div className="flex justify-between items-start border-b-2 border-[#cf7e28] pb-6">
                        <div>
                            <div className="mb-2">
                                <img
                                    src="/logo.png"
                                    alt="Zuvello Logo"
                                    className="h-12 sm:h-14 w-auto object-contain rounded-xl"
                                    crossOrigin="anonymous"
                                />
                            </div>
                            <div className="text-xs text-gray-600 mt-2 space-y-0.5 leading-relaxed font-medium">
                                <div className="font-bold text-gray-800">Zuvello Retail Pvt. Ltd.</div>
                                <div>C-31, Nawada Housing Complex, New Delhi - 110059, India</div>
                                <div>GSTIN: 07AAACZ1234F1Z5 &nbsp;|&nbsp; info@zuvello.com &nbsp;|&nbsp; +91 8873405595</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-black uppercase text-gray-900 tracking-wider">Tax Invoice</div>
                            <div className="text-[10px] font-extrabold uppercase text-[#cf7e28] tracking-wider mt-1">
                                Original For Recipient
                            </div>
                            <div className="text-xs text-gray-600 mt-3 space-y-1 font-medium text-right">
                                <div><span className="font-bold text-gray-800">Invoice No:</span> {invoiceNumber}</div>
                                <div><span className="font-bold text-gray-800">Invoice Date:</span> {invoiceDate}</div>
                                <div><span className="font-bold text-gray-800">Order ID:</span> #{order._id.toUpperCase()}</div>
                                <div><span className="font-bold text-gray-800">Order Date:</span> {orderDate}</div>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Payment Meta Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Customer & Shipping */}
                        <div className="bg-[#faf7f2] border border-[#f0e6d8] rounded-xl p-4 leading-relaxed">
                            <div className="text-[10px] font-extrabold text-[#cf7e28] uppercase tracking-wider mb-2">Customer & Shipping Address</div>
                            <div className="font-bold text-gray-900 text-sm mb-1">{customerName}</div>
                            <div className="text-gray-600 font-medium">{deliveryAddress}</div>
                            <div className="text-gray-700 mt-2 font-semibold">Contact: {customerPhone}</div>
                        </div>

                        {/* Payment & Gateway */}
                        <div className="bg-[#faf7f2] border border-[#f0e6d8] rounded-xl p-4 leading-relaxed">
                            <div className="text-[10px] font-extrabold text-[#cf7e28] uppercase tracking-wider mb-2">Payment & Gateway Details</div>
                            <div className="space-y-1 text-gray-600 font-medium">
                                <div><span className="font-bold text-gray-800">Payment Mode:</span> {paymentMethodDisplay}</div>
                                <div><span className="font-bold text-gray-800">Status:</span> <span className="text-green-600 font-bold">{paymentStatusDisplay}</span></div>
                                <div><span className="font-bold text-gray-800">Razorpay Payment ID:</span> <span className="font-mono text-[11px]">{paymentId}</span></div>
                                <div><span className="font-bold text-gray-800">Razorpay Order ID:</span> <span className="font-mono text-[11px]">{paymentOrderRzpId}</span></div>
                                <div><span className="font-bold text-gray-800">Place of Supply:</span> {order.shippingAddress?.city || 'Delhi'}, India</div>
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-[#faf7f2] border-y-2 border-[#f0e6d8] text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
                                    <th className="py-2.5 px-3 text-center w-8">#</th>
                                    <th className="py-2.5 px-3">Item Description</th>
                                    <th className="py-2.5 px-3 text-center w-12">Qty</th>
                                    <th className="py-2.5 px-3 text-right w-20">Unit (₹)</th>
                                    <th className="py-2.5 px-3 text-right w-24">Taxable (₹)</th>
                                    <th className="py-2.5 px-3 text-right w-24">GST (12%)</th>
                                    <th className="py-2.5 px-3 text-right w-24">Total (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.orderItems.map((item, idx) => {
                                    const itemTotal = item.price * item.qty;
                                    const taxable = (itemTotal / 1.12).toFixed(2);
                                    const gst = (itemTotal - taxable).toFixed(2);
                                    const variant = [item.size ? `Size: ${item.size}` : null, item.color ? `Color: ${item.color}` : null].filter(Boolean).join(' | ');

                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50">
                                            <td className="py-3 px-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                                            <td className="py-3 px-3">
                                                <div className="font-bold text-gray-900">{item.name}</div>
                                                {variant && <div className="text-[11px] text-[#cf7e28] font-semibold mt-0.5">{variant}</div>}
                                                <div className="text-[10px] text-gray-400 font-medium mt-0.5">HSN: 950300 (Plush Toys)</div>
                                            </td>
                                            <td className="py-3 px-3 text-center font-bold text-gray-800">{item.qty}</td>
                                            <td className="py-3 px-3 text-right text-gray-600">₹{item.price.toFixed(2)}</td>
                                            <td className="py-3 px-3 text-right text-gray-600">₹{taxable}</td>
                                            <td className="py-3 px-3 text-right text-gray-600">₹{gst}</td>
                                            <td className="py-3 px-3 text-right font-extrabold text-gray-900">₹{itemTotal.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Summary Calculation */}
                    <div className="flex justify-end pt-2">
                        <div className="w-full sm:w-72 bg-[#faf7f2] border border-[#f0e6d8] rounded-xl p-4 text-xs space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Items Subtotal:</span>
                                <span className="font-semibold text-gray-800">₹{itemsSubtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-700 font-bold">
                                    <span>Coupon Discount ({order.couponCode || 'PROMO'}):</span>
                                    <span>-₹{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping & Delivery:</span>
                                <span className="font-bold text-green-700">FREE</span>
                            </div>
                            <div className="flex justify-between border-t-2 border-[#cf7e28] pt-2 mt-1 text-sm font-black text-gray-900">
                                <span>Grand Total:</span>
                                <span className="text-[#cf7e28]">₹{finalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount In Words Box */}
                    <div className="bg-white border border-dashed border-[#cf7e28] rounded-xl p-3 text-xs text-gray-700">
                        <span className="font-extrabold text-gray-900">Amount in Words: </span>
                        <span>{amountInWords}</span>
                    </div>

                    {/* Invoice Footer / Legal */}
                    <div className="border-t border-gray-200 pt-4 text-center text-[10px] text-gray-500 space-y-1 leading-relaxed">
                        <div className="flex items-center justify-center gap-1.5 font-bold text-gray-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                            This is a computer-generated tax invoice. No physical signature is required.
                        </div>
                        <div>
                            Hassle-free 7-day return and replacement policy on all items in original condition.
                        </div>
                        <div className="text-[#cf7e28] font-extrabold uppercase tracking-wider pt-1">
                            Thank you for shopping with Zuvello! 🧸
                        </div>
                    </div>

                </div>

                {/* Bottom Action Footer (Hidden in Print) */}
                <div className="bg-[#faf7f2] border-t border-[#f0e6d8] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden print-hidden-bar">
                    <div className="text-xs text-gray-500 font-semibold text-center sm:text-left">
                        Official Tax Invoice • Saves as <strong className="text-gray-700 font-mono">{`Zuvello_Tax_Invoice_${invoiceNumber}.pdf`}</strong>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            disabled={downloadingPdf}
                            onClick={handleDownloadPDF}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-[#cf7e28] hover:bg-[#b56e22] text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-[#cf7e28]/20 disabled:opacity-50 active:scale-95"
                        >
                            {downloadingPdf ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Generating PDF...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    <span>Download Invoice (PDF)</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors shadow-sm"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InvoiceModal;
