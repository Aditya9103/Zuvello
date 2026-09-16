import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { numberToWordsINR } from './emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.join(__dirname, 'logo.png');

/**
 * Generates a clean, professional PDF buffer for the Tax Invoice using PDFKit
 */
export const generateInvoicePDFBuffer = (user, order, payment = null) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', (err) => reject(err));

            const invoiceNumber = `INV-${order._id.toString().slice(-8).toUpperCase()}`;
            const invoiceDate = order.paidAt
                ? new Date(order.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

            const customerName = order.shippingAddress?.name || user?.name || 'Customer';
            const customerPhone = order.shippingAddress?.phone || user?.phone || 'N/A';
            const customerEmail = user?.email || 'N/A';
            const deliveryAddress = `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''} - ${order.shippingAddress?.postalCode || ''}, India`;

            const paymentId = order.paymentResult?.razorpay_payment_id || payment?.razorpayPaymentId || 'N/A';
            const paymentOrderRzpId = order.razorpayOrderId || payment?.razorpayOrderId || 'N/A';
            const paymentMethodDisplay = order.paymentMethod === 'COD' ? 'Cash On Delivery (COD)' : `Razorpay Online (${order.paymentMethod || 'UPI / Cards'})`;
            const paymentStatusDisplay = order.isPaid || order.paymentStatus === 'CAPTURED' ? 'PAID / CAPTURED' : (order.paymentStatus || 'PENDING');

            const itemsSubtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
            const discount = order.discountAmount || 0;
            const finalAmount = order.totalPrice || (itemsSubtotal - discount);
            const amountInWords = numberToWordsINR(finalAmount);

            // --- HEADER ---
            if (fs.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, 40, 35, { height: 38 });
                } catch (imgErr) {
                    doc.fillColor('#cf7e28').fontSize(22).font('Helvetica-Bold').text('ZUVELLO', 40, 40);
                }
            } else {
                doc.fillColor('#cf7e28').fontSize(22).font('Helvetica-Bold').text('ZUVELLO', 40, 40);
            }
            doc.fillColor('#1a1614').fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', 350, 40, { align: 'right', width: 205 });
            doc.fillColor('#cf7e28').fontSize(8).font('Helvetica-Bold').text('ORIGINAL FOR RECIPIENT', 350, 60, { align: 'right', width: 205 });

            // Company Details
            doc.fillColor('#4a423d').fontSize(8).font('Helvetica').text(
                'Zuvello Retail Pvt. Ltd.\nC-31, Nawada Housing Complex, New Delhi - 110059\nGSTIN: 07AAACZ1234F1Z5 | info@zuvello.com | +91 8873405595',
                40, 78, { lineGap: 2 }
            );

            // Invoice Meta
            doc.fillColor('#4a423d').fontSize(8).font('Helvetica').text(
                `Invoice No: ${invoiceNumber}\nInvoice Date: ${invoiceDate}\nOrder ID: #${order._id.toString().toUpperCase()}\nOrder Date: ${orderDate}`,
                350, 75, { align: 'right', width: 205, lineGap: 2 }
            );

            // Divider
            doc.strokeColor('#cf7e28').lineWidth(1.5).moveTo(40, 134).lineTo(555, 134).stroke();

            // --- TWO COLUMN INFO CARDS ---
            const cardY = 142;
            const cardHeight = 78;

            // Card 1: Billed & Shipped To
            doc.rect(40, cardY, 250, cardHeight).fillAndStroke('#faf7f2', '#f0e6d8');
            doc.fillColor('#cf7e28').fontSize(8).font('Helvetica-Bold').text('CUSTOMER & DELIVERY DETAILS', 48, cardY + 8);
            doc.fillColor('#1a1614').fontSize(9).font('Helvetica-Bold').text(customerName, 48, cardY + 22);
            doc.fillColor('#4a423d').fontSize(8).font('Helvetica').text(
                `${deliveryAddress}\nPhone: ${customerPhone} | Email: ${customerEmail}`,
                48, cardY + 36, { width: 234, lineGap: 2 }
            );

            // Card 2: Payment & Gateway
            doc.rect(305, cardY, 250, cardHeight).fillAndStroke('#faf7f2', '#f0e6d8');
            doc.fillColor('#cf7e28').fontSize(8).font('Helvetica-Bold').text('PAYMENT & GATEWAY DETAILS', 313, cardY + 8);
            doc.fillColor('#4a423d').fontSize(8).font('Helvetica').text(
                `Mode: ${paymentMethodDisplay}\nStatus: ${paymentStatusDisplay}\nPayment ID: ${paymentId}\nRazorpay Order ID: ${paymentOrderRzpId}\nPlace of Supply: ${order.shippingAddress?.city || 'Delhi'}, India`,
                313, cardY + 22, { width: 234, lineGap: 2 }
            );

            // --- TABLE HEADER ---
            let tableY = cardY + cardHeight + 16;
            doc.rect(40, tableY, 515, 20).fillAndStroke('#faf7f2', '#f0e6d8');

            doc.fillColor('#7a706b').fontSize(8).font('Helvetica-Bold');
            doc.text('#', 45, tableY + 6, { width: 20, align: 'center' });
            doc.text('ITEM DESCRIPTION', 70, tableY + 6, { width: 190 });
            doc.text('QTY', 265, tableY + 6, { width: 30, align: 'center' });
            doc.text('UNIT (INR)', 300, tableY + 6, { width: 55, align: 'right' });
            doc.text('TAXABLE', 360, tableY + 6, { width: 60, align: 'right' });
            doc.text('GST (12%)', 425, tableY + 6, { width: 60, align: 'right' });
            doc.text('TOTAL (INR)', 490, tableY + 6, { width: 60, align: 'right' });

            tableY += 20;

            // --- TABLE ROWS ---
            doc.font('Helvetica').fontSize(8);
            order.orderItems.forEach((item, idx) => {
                const itemTotal = item.price * item.qty;
                const taxable = (itemTotal / 1.12).toFixed(2);
                const gst = (itemTotal - taxable).toFixed(2);
                const variant = [item.size ? `Size: ${item.size}` : null, item.color ? `Color: ${item.color}` : null].filter(Boolean).join(' | ');

                const rowHeight = variant ? 26 : 20;

                // Alternate shading
                if (idx % 2 === 1) {
                    doc.rect(40, tableY, 515, rowHeight).fill('#fdfaf7');
                }

                doc.fillColor('#4a423d');
                doc.text(String(idx + 1), 45, tableY + 5, { width: 20, align: 'center' });

                // Item description
                doc.fillColor('#1a1614').font('Helvetica-Bold').text(item.name, 70, tableY + 5, { width: 190 });
                if (variant) {
                    doc.fillColor('#cf7e28').font('Helvetica').fontSize(7).text(variant, 70, tableY + 15, { width: 190 });
                    doc.fontSize(8);
                }

                doc.fillColor('#4a423d').font('Helvetica');
                doc.text(String(item.qty), 265, tableY + 5, { width: 30, align: 'center' });
                doc.text(item.price.toFixed(2), 300, tableY + 5, { width: 55, align: 'right' });
                doc.text(taxable, 360, tableY + 5, { width: 60, align: 'right' });
                doc.text(gst, 425, tableY + 5, { width: 60, align: 'right' });

                doc.fillColor('#1a1614').font('Helvetica-Bold');
                doc.text(itemTotal.toFixed(2), 490, tableY + 5, { width: 60, align: 'right' });

                // Bottom line
                doc.strokeColor('#f0e6d8').lineWidth(0.5).moveTo(40, tableY + rowHeight).lineTo(555, tableY + rowHeight).stroke();

                tableY += rowHeight;
            });

            tableY += 10;

            // --- TOTALS CALCULATION BOX ---
            const totalsBoxY = tableY;
            doc.rect(345, totalsBoxY, 210, 68).fillAndStroke('#faf7f2', '#f0e6d8');

            doc.fillColor('#4a423d').fontSize(8).font('Helvetica');
            doc.text('Items Subtotal:', 355, totalsBoxY + 8);
            doc.text(`INR ${itemsSubtotal.toFixed(2)}`, 450, totalsBoxY + 8, { width: 95, align: 'right' });

            if (discount > 0) {
                doc.fillColor('#059669').font('Helvetica-Bold');
                doc.text(`Coupon (${order.couponCode || 'PROMO'}):`, 355, totalsBoxY + 22);
                doc.text(`-INR ${discount.toFixed(2)}`, 450, totalsBoxY + 22, { width: 95, align: 'right' });
            }

            doc.fillColor('#4a423d').font('Helvetica');
            doc.text('Shipping & Delivery:', 355, totalsBoxY + 36);
            doc.fillColor('#059669').font('Helvetica-Bold').text('FREE', 450, totalsBoxY + 36, { width: 95, align: 'right' });

            doc.strokeColor('#cf7e28').lineWidth(1).moveTo(355, totalsBoxY + 48).lineTo(545, totalsBoxY + 48).stroke();

            doc.fillColor('#1a1614').fontSize(10).font('Helvetica-Bold');
            doc.text('Grand Total:', 355, totalsBoxY + 52);
            doc.fillColor('#cf7e28').text(`INR ${finalAmount.toFixed(2)}`, 440, totalsBoxY + 52, { width: 105, align: 'right' });

            // Amount in words box
            doc.rect(40, totalsBoxY, 295, 40).fillAndStroke('#ffffff', '#cf7e28');
            doc.fillColor('#1a1614').fontSize(8).font('Helvetica-Bold').text('Amount in Words:', 48, totalsBoxY + 8);
            doc.fillColor('#4a423d').fontSize(8).font('Helvetica').text(amountInWords, 48, totalsBoxY + 20, { width: 279, lineGap: 1 });

            // --- FOOTER ---
            const footerY = totalsBoxY + 85;
            doc.strokeColor('#f0e6d8').lineWidth(0.8).moveTo(40, footerY).lineTo(555, footerY).stroke();

            doc.fillColor('#7a706b').fontSize(7.5).font('Helvetica-Bold').text(
                'This is a computer-generated tax invoice and does not require a physical signature.',
                40, footerY + 8, { align: 'center', width: 515 }
            );
            doc.fillColor('#8c827a').fontSize(7).font('Helvetica').text(
                '7-Day Return & Replacement Guarantee on eligible plushies in original condition. For queries: info@zuvello.com | +91 8873405595',
                40, footerY + 20, { align: 'center', width: 515 }
            );
            doc.fillColor('#cf7e28').fontSize(8).font('Helvetica-Bold').text(
                'Thank you for shopping with Zuvello! 🧸',
                40, footerY + 32, { align: 'center', width: 515 }
            );

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
