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
