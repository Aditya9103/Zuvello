import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: process.env.BREVO_SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
    },
});

const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'info@zuvello.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@zuvello.com'; // Default fallback for bcc

// Helper to format currency
const formatPrice = (price) => `₹${Number(price).toFixed(2)}`;

/**
 * Base email layout wrapper
 */
const getEmailLayout = (title, content, bannerUrl = null) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f5f2; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Premium Card Container -->
        <div style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(207, 126, 40, 0.08); border: 1px solid #f0e6d8;">
            
            <!-- Header Section -->
            <div style="text-align: center; padding: 35px 30px 25px;">
                <img src="https://www.zuvello.in/logo.png" alt="Zuvello" style="height: 60px; margin-bottom: 15px;" />
                <p style="margin: 0; color: #cf7e28; font-size: 13px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">Premium Plushies & Soft Toys</p>
            </div>
            
            ${bannerUrl ? `
            <!-- Hero Banner -->
            <div style="width: 100%; height: 200px; background-image: url('${bannerUrl}'); background-size: cover; background-position: center;"></div>
            ` : ''}

            <!-- Body Content -->
            <div style="padding: 40px 35px; color: #4a423d; font-size: 16px; line-height: 1.7;">
                ${content}
            </div>
            
            <!-- Minimal Premium Footer -->
            <div style="background-color: #faf7f2; padding: 35px 35px; text-align: center; border-top: 1px solid #f0e6d8;">
                <p style="margin: 0 0 15px 0; color: #cf7e28; font-size: 14px; font-weight: 700;">
                    Need help? We're always here.
                </p>
                <p style="margin: 0 0 20px 0; color: #4a423d; font-size: 14px; font-weight: bold;">
                    📞 +91 8873405595 &nbsp;|&nbsp; ✉️ info@zuvello.com
                </p>
                <div style="margin-bottom: 25px;">
                    <a href="${process.env.CLIENT_URL || 'https://www.zuvello.in'}" style="color: #4a423d; text-decoration: none; font-weight: bold; font-size: 13px; margin: 0 15px; text-transform: uppercase; letter-spacing: 1px;">Shop</a>
                    <a href="${process.env.CLIENT_URL || 'https://www.zuvello.in'}/my-orders" style="color: #4a423d; text-decoration: none; font-weight: bold; font-size: 13px; margin: 0 15px; text-transform: uppercase; letter-spacing: 1px;">My Orders</a>
                </div>
                <p style="margin: 0; color: #a09995; font-size: 12px; line-height: 1.6;">
                    &copy; ${new Date().getFullYear()} Zuvello. All rights reserved.<br/>
                    C-31, Nawada Housing Complex, New Delhi-110059
                </p>
            </div>
            
        </div>
    </div>
</body>
</html>
`;

/**
 * Sends OTP Email
 */
export const sendOTPEmail = async (email, otpCode, name = "there") => {
    if (!email) return;

    try {
        const content = `
            <div style="text-align: center; margin-bottom: 35px;">
                <h2 style="color: #1a1614; font-size: 28px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -0.5px;">Welcome to Zuvello!</h2>
                <p style="color: #7a706b; font-size: 16px; margin: 0;">We're so excited to have you join our plushie family.</p>
            </div>
            
            <p style="margin: 0 0 25px 0;">Hi <strong>${name}</strong>,</p>
            <p style="margin: 0 0 35px 0;">To complete your verification, please use the secure code below. This code is valid for the next 10 minutes.</p>
            
            <div style="background: linear-gradient(145deg, #ffffff, #fdfaf7); border: 1px solid #f0e6d8; border-radius: 16px; padding: 35px 20px; text-align: center; margin-bottom: 35px; box-shadow: 0 4px 20px rgba(207, 126, 40, 0.05);">
                <p style="margin: 0 0 15px 0; color: #cf7e28; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
                <div style="font-family: monospace; font-size: 42px; font-weight: 900; color: #1a1614; letter-spacing: 8px;">${otpCode}</div>
            </div>
            
            <p style="margin: 0; color: #7a706b; font-size: 14px; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
        `;

        await transporter.sendMail({
            from: `"Zuvello" <${FROM_EMAIL}>`,
            to: email,
            subject: `${otpCode} is your Zuvello verification code`,
            html: getEmailLayout(`Your Verification Code`, content),
        });

        console.log(`✅ OTP Email sent to ${email}`);
    } catch (error) {
        console.error(`❌ Failed to send OTP Email:`, error.message);
    }
};

/**
 * Sends the Order Placed Email
 */
export const sendOrderPlacedEmail = async (user, order) => {
    if (!user || !user.email) return;

    // If order is paid, send the official Tax Invoice email with PDF
    if (order.isPaid || order.paymentStatus === 'CAPTURED') {
        return sendOrderInvoiceEmail(user, order, order.payment);
    }

    try {
        const itemRows = order.orderItems.map(item => `
            <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #f0e6d8; width: 75px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 14px; border: 1px solid #f5eadb;" />
                </td>
                <td style="padding: 15px 15px; border-bottom: 1px solid #f0e6d8; vertical-align: middle;">
                    <div style="font-weight: 700; color: #1a1614; margin-bottom: 6px; font-size: 16px;">${item.name}</div>
                    <div style="color: #cf7e28; font-size: 14px; font-weight: 700;">Qty: ${item.qty}</div>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #f0e6d8; text-align: right; vertical-align: middle; font-weight: 800; color: #1a1614; font-size: 16px;">
                    ${formatPrice(item.price)}
                </td>
            </tr>
        `).join('');

    const content = `
            <div style="text-align: center; margin-bottom: 35px;">
                <h2 style="color: #1a1614; font-size: 28px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -0.5px;">Yay! We got your order 🧸</h2>
                <p style="color: #7a706b; font-size: 16px; margin: 0;">Your cuddly new friends are getting ready for their journey.</p>
            </div>
            
            <p style="margin: 0 0 20px 0;">Hi <strong>${user.name}</strong>,</p>
            <p style="margin: 0 0 35px 0;">Thank you for choosing Zuvello! We're preparing your order <strong>#${order._id}</strong> for shipping and will notify you as soon as it leaves our warehouse.</p>
            
            <div style="background-color: #faf7f2; border-radius: 16px; padding: 30px; border: 1px solid #f0e6d8; margin-bottom: 35px;">
                <h3 style="color: #cf7e28; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 20px 0;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tbody>
                        ${itemRows}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 25px 15px 0 0; text-align: right; font-weight: 600; color: #7a706b;">Subtotal:</td>
                            <td style="padding: 25px 0 0 0; text-align: right; font-weight: 700; color: #1a1614; font-size: 16px;">${formatPrice(order.totalPrice)}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding: 12px 15px 0 0; text-align: right; font-weight: 800; font-size: 18px; color: #1a1614;">Total:</td>
                            <td style="padding: 12px 0 0 0; text-align: right; font-weight: 800; font-size: 20px; color: #cf7e28;">${formatPrice(order.totalPrice)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div style="border-radius: 16px; padding: 25px; border: 1px solid #f0e6d8; margin-bottom: 10px;">
                <h3 style="color: #cf7e28; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Shipping To</h3>
                <p style="margin: 0; color: #4a423d; line-height: 1.6; font-size: 15px; font-weight: 500;">
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                    ${order.shippingAddress.country}
                </p>
            </div>
        `;

    await transporter.sendMail({
        from: `"Zuvello" <${FROM_EMAIL}>`,
        to: user.email,
        bcc: ADMIN_EMAIL,
        subject: `Order Confirmation - #${order._id} 🧸`,
        html: getEmailLayout(`Order Confirmation`, content),
    });

    console.log(`✅ Order Placed Email sent to ${user.email} (BCC: ${ADMIN_EMAIL})`);
} catch (error) {
    console.error(`❌ Failed to send Order Placed Email:`, error.message);
}
};

/**
 * Sends the Order Shipped Email
 */
export const sendOrderShippedEmail = async (user, order) => {
    if (!user || !user.email) return;

    try {
        const trackingUpdate = order.trackingUpdates.slice().reverse().find(u => u.status === 'Shipped');
        const trackingDetails = trackingUpdate?.description ? `<div style="background-color: #faf7f2; border: 1px solid #f0e6d8; border-radius: 16px; padding: 25px; margin: 30px 0;"><strong style="color: #cf7e28; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Tracking Info:</strong><br/> <span style="color: #4a423d; font-weight: 500; display: inline-block; margin-top: 10px; font-size: 16px;">${trackingUpdate.description}</span></div>` : '';

        const content = `
            <div style="text-align: center; margin-bottom: 35px;">
                <div style="background: linear-gradient(135deg, #cf7e28, #e8953c); color: #fff; width: 80px; height: 80px; line-height: 80px; border-radius: 40px; font-size: 34px; margin: 0 auto 25px; box-shadow: 0 8px 20px rgba(207, 126, 40, 0.25);">📦</div>
                <h2 style="color: #1a1614; font-size: 28px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -0.5px;">On the way!</h2>
                <p style="color: #7a706b; font-size: 16px; margin: 0;">Your plushies have left our warehouse.</p>
            </div>
            
            <p style="margin: 0 0 20px 0;">Hi <strong>${user.name}</strong>,</p>
            <p style="margin: 0 0 30px 0;">Great news! Your order <strong>#${order._id}</strong> has been shipped and is currently traveling to you for some warm hugs.</p>
            
            ${trackingDetails}

            <div style="text-align: center; margin-top: 45px; margin-bottom: 25px;">
                <a href="${process.env.CLIENT_URL || 'https://www.zuvello.in'}/my-orders" style="display: inline-block; background-color: #cf7e28; color: #fff; text-decoration: none; padding: 18px 40px; border-radius: 30px; font-weight: 800; font-size: 15px; letter-spacing: 1.5px; text-transform: uppercase; box-shadow: 0 6px 20px rgba(207, 126, 40, 0.3);">Track Your Order</a>
            </div>
        `;

        await transporter.sendMail({
            from: `"Zuvello" <${FROM_EMAIL}>`,
            to: user.email,
            subject: `Your Zuvello order #${order._id} has shipped! 📦`,
            html: getEmailLayout(`Order Shipped`, content),
        });

        console.log(`✅ Order Shipped Email sent to ${user.email}`);
    } catch (error) {
        console.error(`❌ Failed to send Order Shipped Email:`, error.message);
    }
};

/**
 * Sends the Order Delivered Email
 */
export const sendOrderDeliveredEmail = async (user, order) => {
    if (!user || !user.email) return;

    try {
        const content = `
            <div style="text-align: center; margin-bottom: 35px;">
                <div style="background: linear-gradient(135deg, #cf7e28, #e8953c); color: #fff; width: 80px; height: 80px; line-height: 80px; border-radius: 40px; font-size: 34px; margin: 0 auto 25px; box-shadow: 0 8px 20px rgba(207, 126, 40, 0.25);">🎉</div>
                <h2 style="color: #1a1614; font-size: 28px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -0.5px;">They've arrived!</h2>
                <p style="color: #7a706b; font-size: 16px; margin: 0;">Time for some cuddles.</p>
            </div>
            
            <p style="margin: 0 0 20px 0;">Hi <strong>${user.name}</strong>,</p>
            <p style="margin: 0 0 35px 0;">Hooray! Your order <strong>#${order._id}</strong> has been successfully delivered to your doorstep.</p>
            
            <div style="background-color: #faf7f2; border-left: 4px solid #cf7e28; padding: 25px; margin: 0 0 40px 0; border-radius: 0 12px 12px 0;">
                <p style="margin: 0; font-size: 18px; color: #cf7e28; font-style: italic; font-weight: 700; line-height: 1.5;">
                    "We hope you love your new Zuvello plushies and they bring lots of smiles and comfort."
                </p>
            </div>
            
            <div style="border: 1px solid #f0e6d8; border-radius: 20px; padding: 35px 25px; text-align: center; margin: 0 0 35px 0; background-color: #ffffff;">
                <h3 style="color: #1a1614; font-weight: 800; margin: 0 0 15px 0; font-size: 22px;">Spread the happiness!</h3>
                <p style="color: #7a706b; font-size: 15px; margin: 0 0 30px 0; line-height: 1.6;">Your feedback helps us improve and helps others make great choices. We'd love to hear what you think.</p>
                <a href="${process.env.CLIENT_URL || 'https://www.zuvello.in'}/my-orders" style="display: inline-block; background-color: #1a1614; color: #fff; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-weight: 800; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">Leave a Review</a>
            </div>

            <p style="color: #a09995; font-size: 13px; text-align: center; margin: 0;">If you haven't received your package, please reply to this email to contact support immediately.</p>
        `;

        await transporter.sendMail({
            from: `"Zuvello" <${FROM_EMAIL}>`,
            to: user.email,
            subject: `Your Zuvello order #${order._id} has been delivered! 🎉`,
            html: getEmailLayout(`Order Delivered`, content),
        });

        console.log(`✅ Order Delivered Email sent to ${user.email}`);
    } catch (error) {
        console.error(`❌ Failed to send Order Delivered Email:`, error.message);
    }
};

/**
 * Helper to convert Indian Rupees into words
 */
export const numberToWordsINR = (num) => {
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

/**
 * Generates an official, comprehensive Tax Invoice in HTML format covering every detail
 */
export const generateInvoiceHtml = (user, order, payment = null) => {
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
    const paymentMethodDisplay = order.paymentMethod === 'COD' ? 'Cash On Delivery (COD)' : `Razorpay Online (${order.paymentMethod || 'UPI/Card/NetBanking'})`;
    const paymentStatusDisplay = order.isPaid || order.paymentStatus === 'CAPTURED' ? 'PAID / CAPTURED' : (order.paymentStatus || 'PENDING');

    const itemsSubtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const discount = order.discountAmount || 0;
    const finalAmount = order.totalPrice || (itemsSubtotal - discount);
    const amountInWords = numberToWordsINR(finalAmount);

    const itemRows = order.orderItems.map((item, idx) => {
        const itemTotal = item.price * item.qty;
        const taxable = (itemTotal / 1.12).toFixed(2);
        const gst = (itemTotal - taxable).toFixed(2);
        const variant = [item.size ? `Size: ${item.size}` : null, item.color ? `Color: ${item.color}` : null].filter(Boolean).join(' | ');

        return `
            <tr style="border-bottom: 1px solid #f0e6d8;">
                <td style="padding: 12px 10px; font-size: 13px; color: #4a423d; text-align: center;">${idx + 1}</td>
                <td style="padding: 12px 10px; font-size: 13px; color: #1a1614;">
                    <div style="font-weight: 700;">${item.name}</div>
                    ${variant ? `<div style="font-size: 11px; color: #cf7e28; font-weight: 600; margin-top: 2px;">${variant}</div>` : ''}
                    <div style="font-size: 10px; color: #8c827a; margin-top: 2px;">HSN: 950300 (Plush Toys)</div>
                </td>
                <td style="padding: 12px 10px; font-size: 13px; color: #4a423d; text-align: center; font-weight: 700;">${item.qty}</td>
                <td style="padding: 12px 10px; font-size: 13px; color: #4a423d; text-align: right;">₹${item.price.toFixed(2)}</td>
                <td style="padding: 12px 10px; font-size: 13px; color: #4a423d; text-align: right;">₹${taxable}</td>
                <td style="padding: 12px 10px; font-size: 13px; color: #4a423d; text-align: right;">₹${gst} <span style="font-size: 10px; color: #8c827a;">(12%)</span></td>
                <td style="padding: 12px 10px; font-size: 13px; font-weight: 800; color: #1a1614; text-align: right;">₹${itemTotal.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Invoice - ${invoiceNumber}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f5f2; color: #1a1614; -webkit-font-smoothing: antialiased; }
        .invoice-card { max-width: 800px; margin: auto; padding: 35px; border: 1px solid #f0e6d8; border-radius: 20px; background: #ffffff; box-shadow: 0 10px 30px rgba(207, 126, 40, 0.05); }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #cf7e28; padding-bottom: 20px; margin-bottom: 24px; }
        .brand-logo { font-size: 28px; font-weight: 900; color: #cf7e28; letter-spacing: -0.5px; }
        .brand-sub { font-size: 11px; color: #8c827a; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
        .invoice-badge { display: inline-block; background: #fdf3e7; color: #cf7e28; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #f5eadb; margin-top: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
        .info-box { background: #faf7f2; border: 1px solid #f0e6d8; border-radius: 14px; padding: 18px; font-size: 13px; line-height: 1.6; }
        .box-heading { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #cf7e28; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #faf7f2; color: #7a706b; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 12px 10px; border-bottom: 2px solid #f0e6d8; }
        .totals-container { display: flex; justify-content: flex-end; margin-bottom: 20px; }
        .totals-card { width: 320px; background: #faf7f2; border: 1px solid #f0e6d8; border-radius: 14px; padding: 18px; font-size: 13px; }
        .totals-item { display: flex; justify-content: space-between; padding: 6px 0; color: #4a423d; }
        .totals-item.grand { border-top: 2px solid #cf7e28; padding-top: 12px; margin-top: 8px; font-weight: 900; font-size: 17px; color: #1a1614; }
        .words-container { background: #ffffff; border: 1px dashed #cf7e28; border-radius: 10px; padding: 12px 16px; font-size: 12px; color: #4a423d; margin-bottom: 25px; }
        .invoice-footer { border-top: 1px solid #f0e6d8; padding-top: 20px; font-size: 11px; color: #8c827a; text-align: center; line-height: 1.6; }
        @media print {
            body { background: white !important; padding: 0 !important; }
            .invoice-card { border: none !important; box-shadow: none !important; padding: 0 !important; max-width: 100% !important; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="invoice-card">
        <!-- Header -->
        <div class="header-row">
            <div>
                <div style="margin-bottom: 8px;">
                    <img src="https://www.zuvello.in/logo.png" alt="Zuvello" style="height: 48px; width: auto; object-fit: contain; border-radius: 8px;" />
                </div>
                <div style="font-size: 12px; color: #4a423d; margin-top: 8px; line-height: 1.5;">
                    <strong>Zuvello Retail Pvt. Ltd.</strong><br>
                    C-31, Nawada Housing Complex, New Delhi - 110059, India<br>
                    GSTIN: 07AAACZ1234F1Z5 &nbsp;|&nbsp; ✉️ info@zuvello.com &nbsp;|&nbsp; 📞 +91 8873405595
                </div>
            </div>
            <div style="text-align: right;">
                <h1 style="margin: 0; font-size: 22px; color: #1a1614; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Tax Invoice</h1>
                <div class="invoice-badge">Original For Recipient</div>
                <div style="font-size: 13px; color: #4a423d; margin-top: 10px; line-height: 1.6;">
                    <strong>Invoice No:</strong> ${invoiceNumber}<br>
                    <strong>Invoice Date:</strong> ${invoiceDate}<br>
                    <strong>Order ID:</strong> #${order._id.toString().toUpperCase()}<br>
                    <strong>Order Date:</strong> ${orderDate}
                </div>
            </div>
        </div>

        <!-- Info Grid -->
        <div class="info-grid">
            <!-- Billed & Shipped To -->
            <div class="info-box">
                <div class="box-heading">Customer / Delivery Details</div>
                <div style="font-size: 14px; font-weight: 800; color: #1a1614; margin-bottom: 4px;">${customerName}</div>
                <div style="color: #4a423d;">
                    ${deliveryAddress}<br>
                    <strong>Contact Phone:</strong> ${customerPhone}<br>
                    <strong>Email:</strong> ${customerEmail}
                </div>
            </div>

            <!-- Payment Details -->
            <div class="info-box">
                <div class="box-heading">Payment Information</div>
                <div style="color: #4a423d;">
                    <strong>Payment Method:</strong> ${paymentMethodDisplay}<br>
                    <strong>Payment Status:</strong> <span style="color: #059669; font-weight: 800;">${paymentStatusDisplay}</span><br>
                    <strong>Payment ID:</strong> <span style="font-family: monospace; font-size: 11px;">${paymentId}</span><br>
                    <strong>Razorpay Order ID:</strong> <span style="font-family: monospace; font-size: 11px;">${paymentOrderRzpId}</span><br>
                    <strong>Place of Supply:</strong> ${order.shippingAddress?.city || 'Delhi'}, India
                </div>
            </div>
        </div>

        <!-- Line Items Table -->
        <table>
            <thead>
                <tr>
                    <th style="width: 35px; text-align: center;">#</th>
                    <th style="text-align: left;">Item Description</th>
                    <th style="width: 45px; text-align: center;">Qty</th>
                    <th style="width: 80px; text-align: right;">Unit (₹)</th>
                    <th style="width: 85px; text-align: right;">Taxable (₹)</th>
                    <th style="width: 85px; text-align: right;">GST (₹)</th>
                    <th style="width: 90px; text-align: right;">Total (₹)</th>
                </tr>
            </thead>
            <tbody>
                ${itemRows}
            </tbody>
        </table>

        <!-- Totals Breakdown -->
        <div class="totals-container">
            <div class="totals-card">
                <div class="totals-item">
                    <span>Items Subtotal:</span>
                    <span>₹${itemsSubtotal.toFixed(2)}</span>
                </div>
                ${discount > 0 ? `
                <div class="totals-item" style="color: #059669; font-weight: 700;">
                    <span>Coupon Discount (${order.couponCode || 'PROMO'}):</span>
                    <span>-₹${discount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="totals-item">
                    <span>Shipping & Delivery:</span>
                    <span style="color: #059669; font-weight: 800;">FREE</span>
                </div>
                <div class="totals-item grand">
                    <span>Grand Total:</span>
                    <span style="color: #cf7e28;">₹${finalAmount.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <!-- Amount In Words -->
        <div class="words-container">
            <strong>Amount in Words:</strong> ${amountInWords}
        </div>

        <!-- Footer -->
        <div class="invoice-footer">
            <p style="margin: 0 0 6px 0; font-weight: 700; color: #4a423d;">
                This is a computer-generated tax invoice. No physical or digital signature is required.
            </p>
            <p style="margin: 0; color: #7a706b;">
                Hassle-free 7-day return/replacement policy on eligible products in original condition. For any questions, write to info@zuvello.com or call +91 8873405595.
            </p>
            <p style="margin: 10px 0 0 0; color: #cf7e28; font-weight: 800; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">
                Thank you for shopping with Zuvello! 🧸
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Sends official Tax Invoice Email with full detail and downloadable HTML attachment
 */
export const sendOrderInvoiceEmail = async (user, order, payment = null) => {
    if (!user || !user.email) return;

    try {
        const invoiceHtml = generateInvoiceHtml(user, order, payment);
        const invoiceNumber = `INV-${order._id.toString().slice(-8).toUpperCase()}`;

        const emailContent = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; width: 70px; height: 70px; line-height: 70px; border-radius: 35px; font-size: 30px; margin: 0 auto 20px; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);">✓</div>
                <h2 style="color: #1a1614; font-size: 26px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px;">Payment Confirmed!</h2>
                <p style="color: #7a706b; font-size: 15px; margin: 0;">Thank you for your payment. Here is your official Tax Invoice for Order <strong>#${order._id.toString().toUpperCase()}</strong>.</p>
            </div>

            <div style="text-align: center; margin-bottom: 25px;">
                <a href="${process.env.CLIENT_URL || 'https://www.zuvello.in'}/my-orders?viewInvoice=${order._id}" style="display: inline-block; background-color: #cf7e28; color: #ffffff; text-decoration: none; padding: 15px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(207, 126, 40, 0.25); margin: 0 6px 10px 6px;">
                    📥 Download Invoice (PDF)
                </a>
                <a href="${process.env.CLIENT_URL || 'https://www.zuvello.in'}/my-orders" style="display: inline-block; background-color: #faf7f2; color: #4a423d; text-decoration: none; padding: 15px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #f0e6d8; margin: 0 6px 10px 6px;">
                    View My Orders
                </a>
                <div style="margin-top: 10px; color: #059669; font-size: 12px; font-weight: 700;">
                    ✓ The official Tax Invoice PDF (${invoiceNumber}.pdf) is also attached to this email.
                </div>
            </div>

            <div style="margin-top: 20px; border: 1px solid #f0e6d8; border-radius: 16px; overflow: hidden; background: #ffffff;">
                ${invoiceHtml}
            </div>
        `;

        let pdfBuffer = null;
        try {
            const { generateInvoicePDFBuffer } = await import('./pdfInvoiceGenerator.js');
            pdfBuffer = await generateInvoicePDFBuffer(user, order, payment);
        } catch (pdfErr) {
            console.error('Failed to generate invoice PDF buffer:', pdfErr.message);
        }

        const attachments = [];
        if (pdfBuffer) {
            attachments.push({
                filename: `Zuvello_Tax_Invoice_${invoiceNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            });
        } else {
            attachments.push({
                filename: `Zuvello_Tax_Invoice_${invoiceNumber}.html`,
                content: invoiceHtml,
                contentType: 'text/html'
            });
        }

        await transporter.sendMail({
            from: `"Zuvello Invoices" <${FROM_EMAIL}>`,
            to: user.email,
            bcc: ADMIN_EMAIL,
            subject: `🧾 Tax Invoice #${invoiceNumber} for Order #${order._id.toString().slice(-8).toUpperCase()} | Zuvello`,
            html: getEmailLayout(`Tax Invoice #${invoiceNumber}`, emailContent),
            attachments
        });

        console.log(`✅ Tax Invoice Email sent to ${user.email} with PDF attachment [${invoiceNumber}]`);
    } catch (error) {
        console.error(`❌ Failed to send Tax Invoice Email:`, error.message);
    }
};

