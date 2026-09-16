import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import {
    createRazorpayOrder,
    verifyPaymentSignature,
    verifyWebhookSignature,
    fetchPaymentDetails,
    initiateRazorpayRefund
} from '../services/paymentService.js';
import { sendOrderPlacedEmail, sendOrderInvoiceEmail } from '../utils/emailService.js';

/**
 * Execute a callback within an ACID MongoDB session transaction.
 * If sessions/transactions are not supported (e.g. standalone test DB),
 * it executes the operations directly with standard atomicity.
 */
const runInTransaction = async (work) => {
    let session = null;
    try {
        session = await mongoose.startSession();
        let result;
        await session.withTransaction(async () => {
            result = await work(session);
        });
        return result;
    } catch (err) {
        // If transactions aren't supported on the active MongoDB topology, fallback
        if (err.message && (
            err.message.includes('Transaction numbers are only allowed') ||
            err.message.includes('replica set') ||
            err.message.includes('standalone')
        )) {
            console.warn('⚠️ MongoDB topology does not support multi-document transactions. Falling back to non-transactional execution.');
            return await work(null);
        }
        throw err;
    } finally {
        if (session) {
            await session.endSession().catch(() => {});
        }
    }
};

// @desc    Create Razorpay order with server-side pricing validation
// @route   POST /api/payment/create-order
// @access  Private
export const createPaymentOrder = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        couponCode
    } = req.body;

    try {
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
            return res.status(400).json({ message: 'Shipping address is incomplete' });
        }

        const userId = req.user._id;

        // Step 1: Validate each product from DB and calculate server-side subtotal
        let calculatedSubtotal = 0;
        const verifiedOrderItems = [];

        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.name || item.product}` });
            }

            if (product.stock < item.qty) {
                return res.status(400).json({
                    message: `Insufficient stock for "${product.name}". Only ${product.stock} left in stock.`
                });
            }

            const itemPrice = Number(product.price);
            calculatedSubtotal += itemPrice * Number(item.qty);

            verifiedOrderItems.push({
                name: product.name,
                qty: Number(item.qty),
                image: (product.images && product.images.length > 0) ? product.images[0] : item.image,
                price: itemPrice,
                size: item.size || '',
                color: item.color || '',
                product: product._id
            });
        }

        // Step 2: Validate coupon from DB if provided
        let discountAmount = 0;
        let validCouponCode = null;

        if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
            const cleanCode = couponCode.trim().toUpperCase();
            const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
            if (coupon) {
                discountAmount = (calculatedSubtotal * coupon.discountPercentage) / 100;
                validCouponCode = coupon.code;
            }
        }

        // Step 3: Compute final payable total (Rupees)
        const finalTotal = Math.max(0, Math.round(calculatedSubtotal - discountAmount));

        if (finalTotal <= 0) {
            return res.status(400).json({ message: 'Invalid final payable amount' });
        }

        // Step 4: Create internal Order in PENDING_PAYMENT state (Inventory is NOT deducted yet)
        const internalOrder = new Order({
            user: userId,
            orderItems: verifiedOrderItems,
            shippingAddress,
            paymentMethod: 'Razorpay',
            totalPrice: finalTotal,
            discountAmount,
            couponCode: validCouponCode,
            isPaid: false,
            paymentStatus: 'CREATED',
            orderStatus: 'PENDING_PAYMENT',
            status: 'Pending',
            trackingUpdates: [
                {
                    status: 'Order Initiated',
                    location: 'Online',
                    description: 'Awaiting payment confirmation via Razorpay.',
                    date: new Date()
                }
            ]
        });

        await internalOrder.save();

        // Step 5: Create Razorpay Order via SDK
        const rzpOrder = await createRazorpayOrder({
            amountInRupees: finalTotal,
            currency: 'INR',
            receipt: internalOrder._id.toString(),
            notes: {
                internalOrderId: internalOrder._id.toString(),
                userId: userId.toString(),
                customerEmail: req.user.email || '',
                customerPhone: shippingAddress.phone || ''
            }
        });

        // Step 6: Create Payment Record
        const paymentRecord = new Payment({
            order: internalOrder._id,
            user: userId,
            razorpayOrderId: rzpOrder.id,
            amount: finalTotal,
            currency: rzpOrder.currency || 'INR',
            status: 'CREATED'
        });

        await paymentRecord.save();

        // Link payment record to order
        internalOrder.razorpayOrderId = rzpOrder.id;
        internalOrder.payment = paymentRecord._id;
        await internalOrder.save();

        console.log(`💳 Razorpay Order Created: ${rzpOrder.id} for Internal Order: ${internalOrder._id} (₹${finalTotal})`);

        res.status(201).json({
            success: true,
            razorpayOrderId: rzpOrder.id,
            amount: rzpOrder.amount, // in paise
            currency: rzpOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            internalOrderId: internalOrder._id,
            amountInRupees: finalTotal,
            prefill: {
                name: shippingAddress.name || req.user.name || '',
                email: req.user.email || '',
                contact: shippingAddress.phone || req.user.phone || ''
            }
        });
    } catch (error) {
        console.error('❌ createPaymentOrder Error:', error);
        res.status(500).json({ message: 'Failed to create payment order', error: error.message });
    }
};

// @desc    Verify Razorpay payment signature & confirm order (ACID Transaction)
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    try {
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment verification credentials' });
        }

        // Step 1: Verify HMAC signature
        const isValidSignature = verifyPaymentSignature({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        if (!isValidSignature) {
            console.warn(`🚨 Invalid Razorpay signature for order: ${razorpay_order_id}`);
            await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    status: 'FAILED',
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    errorDescription: 'Invalid payment signature'
                }
            );
            return res.status(400).json({ message: 'Payment verification failed: Invalid signature' });
        }

        // Step 2: Fetch payment details from Razorpay (payment method, card/upi info)
        const paymentDetails = await fetchPaymentDetails(razorpay_payment_id);
        const paymentMethodUsed = paymentDetails?.method || 'online';

        // Step 3: Run ACID transaction to confirm payment, finalize order, and deduct inventory
        const finalOrder = await runInTransaction(async (session) => {
            const opts = session ? { session } : {};

            const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id }, null, opts);
            if (!payment) {
                throw new Error('Payment record not found for this Razorpay Order');
            }

            // IDEMPOTENCY CHECK: If already captured, return existing order without double-deduction
            if (payment.status === 'CAPTURED') {
                console.log(`ℹ️ Payment ${razorpay_order_id} was already captured. Skipping redundant capture.`);
                const existingOrder = await Order.findById(payment.order, null, opts);
                return existingOrder;
            }

            const order = await Order.findById(payment.order, null, opts);
            if (!order) {
                throw new Error('Associated order record not found');
            }

            // Update Payment Record
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = 'CAPTURED';
            payment.method = paymentMethodUsed;
            payment.verifiedAt = new Date();
            await payment.save(opts);

            // Update Order Status
            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentStatus = 'CAPTURED';
            order.orderStatus = 'PAID';
            order.status = 'Processing';
            order.paymentResult = {
                id: razorpay_payment_id,
                status: 'CAPTURED',
                update_time: new Date().toISOString(),
                email_address: req.user.email || '',
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature
            };

            order.trackingUpdates.push({
                status: 'Payment Received',
                location: 'Online',
                description: `Payment of ₹${order.totalPrice} confirmed via Razorpay (${paymentMethodUsed.toUpperCase()}).`,
                date: new Date()
            });

            await order.save(opts);

            // Deduct product inventory atomically
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: -item.qty } },
                    { ...opts, new: true }
                );
            }

            return order;
        });

        console.log(`✅ Order ${finalOrder._id} successfully confirmed & paid via Razorpay (${razorpay_payment_id})`);

        // Send confirmation and invoice email asynchronously (fire and forget)
        const userForEmail = await User.findById(finalOrder.user);
        if (userForEmail) {
            sendOrderPlacedEmail(userForEmail, finalOrder).catch(err => {
                console.error('Failed to send order email:', err);
            });
            sendOrderInvoiceEmail(userForEmail, finalOrder, finalOrder.payment).catch(err => {
                console.error('Failed to send invoice email:', err);
            });
        }

        res.json({
            success: true,
            message: 'Payment verified and order confirmed successfully',
            orderId: finalOrder._id
        });
    } catch (error) {
        console.error('❌ verifyPayment Error:', error);
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
};

// @desc    Handle Razorpay Webhook Events (Idempotent & Resilient)
// @route   POST /api/payment/webhook
// @access  Public (Signature Verified)
export const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const rawBody = req.rawBody;

        // Check if Webhook Secret is configured
        const isSecretConfigured = !!process.env.RAZORPAY_WEBHOOK_SECRET;

        // Per user requirement: works seamlessly even if webhook secret is not configured
        if (!isSecretConfigured) {
            console.log('ℹ️ Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not configured. Direct verification handles orders.');
            return res.status(200).json({ status: 'ignored', message: 'Webhook secret not configured' });
        }

        // Verify Webhook Signature
        const isValid = verifyWebhookSignature({ rawBody, signature });
        if (!isValid) {
            console.warn('🚨 Unauthorized webhook request - Invalid signature');
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload;
        const eventId = req.headers['x-razorpay-event-id'] || `${event}_${Date.now()}`;

        console.log(`🔔 Razorpay Webhook Event Received: ${event} [${eventId}]`);

        if (event === 'payment.captured' || event === 'order.paid') {
            const paymentEntity = payload.payment?.entity;
            const rzpOrderId = paymentEntity?.order_id;
            const rzpPaymentId = paymentEntity?.id;

            if (rzpOrderId && rzpPaymentId) {
                await runInTransaction(async (session) => {
                    const opts = session ? { session } : {};
                    const payment = await Payment.findOne({ razorpayOrderId: rzpOrderId }, null, opts);
                    if (!payment) return;

                    // Idempotency: Check if this event was already processed
                    if (payment.webhookEvents && payment.webhookEvents.includes(eventId)) {
                        console.log(`ℹ️ Webhook event ${eventId} already processed.`);
                        return;
                    }

                    if (payment.status === 'CAPTURED') {
                        payment.webhookEvents.push(eventId);
                        await payment.save(opts);
                        return;
                    }

                    const order = await Order.findById(payment.order, null, opts);
                    if (!order) return;

                    payment.razorpayPaymentId = rzpPaymentId;
                    payment.status = 'CAPTURED';
                    payment.method = paymentEntity.method || 'online';
                    payment.verifiedAt = new Date();
                    payment.webhookEvents.push(eventId);
                    await payment.save(opts);

                    order.isPaid = true;
                    order.paidAt = new Date();
                    order.paymentStatus = 'CAPTURED';
                    order.orderStatus = 'PAID';
                    order.status = 'Processing';
                    order.paymentResult = {
                        id: rzpPaymentId,
                        status: 'CAPTURED',
                        update_time: new Date().toISOString(),
                        razorpay_payment_id: rzpPaymentId,
                        razorpay_order_id: rzpOrderId
                    };

                    order.trackingUpdates.push({
                        status: 'Payment Captured via Webhook',
                        location: 'Razorpay Gateway',
                        description: `Payment confirmed by Razorpay Webhook event.`,
                        date: new Date()
                    });

                    await order.save(opts);

                    // Finalize inventory
                    for (const item of order.orderItems) {
                        await Product.findByIdAndUpdate(
                            item.product,
                            { $inc: { stock: -item.qty } },
                            { ...opts, new: true }
                        );
                    }

                    const userForEmail = await User.findById(order.user);
                    if (userForEmail) {
                        sendOrderPlacedEmail(userForEmail, order).catch(console.error);
                        sendOrderInvoiceEmail(userForEmail, order, payment).catch(console.error);
                    }
                });
            }
        } else if (event === 'payment.failed') {
            const paymentEntity = payload.payment?.entity;
            const rzpOrderId = paymentEntity?.order_id;
            if (rzpOrderId) {
                await Payment.findOneAndUpdate(
                    { razorpayOrderId: rzpOrderId },
                    {
                        status: 'FAILED',
                        errorCode: paymentEntity?.error_code,
                        errorDescription: paymentEntity?.error_description
                    }
                );
                await Order.findOneAndUpdate(
                    { razorpayOrderId: rzpOrderId },
                    { paymentStatus: 'FAILED' }
                );
            }
        } else if (event === 'refund.processed') {
            const refundEntity = payload.refund?.entity;
            const rzpPaymentId = refundEntity?.payment_id;
            if (rzpPaymentId) {
                const payment = await Payment.findOne({ razorpayPaymentId: rzpPaymentId });
                if (payment) {
                    payment.status = 'REFUNDED';
                    payment.refunds.push({
                        refundId: refundEntity.id,
                        amount: refundEntity.amount / 100,
                        status: refundEntity.status,
                        createdAt: new Date()
                    });
                    await payment.save();

                    await Order.findByIdAndUpdate(payment.order, {
                        orderStatus: 'REFUNDED',
                        paymentStatus: 'REFUNDED'
                    });
                }
            }
        }

        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('❌ handleWebhook Error:', error);
        res.status(500).json({ message: 'Webhook processing error', error: error.message });
    }
};

// @desc    Initiate refund for an order (Admin)
// @route   POST /api/payment/refund
// @access  Private/Admin
export const initiateRefund = async (req, res) => {
    const { orderId, amount, reason } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.isPaid) {
            return res.status(400).json({ message: 'Cannot refund an unpaid order' });
        }

        const payment = await Payment.findOne({ order: order._id });
        if (!payment || !payment.razorpayPaymentId) {
            return res.status(400).json({ message: 'No captured Razorpay payment found for this order' });
        }

        const refundAmount = amount ? Number(amount) : order.totalPrice;

        const rzpRefund = await initiateRazorpayRefund({
            paymentId: payment.razorpayPaymentId,
            amountInRupees: refundAmount,
            notes: {
                orderId: order._id.toString(),
                reason: reason || 'Admin requested refund'
            }
        });

        const isFullRefund = refundAmount >= order.totalPrice;

        payment.refunds.push({
            refundId: rzpRefund.id,
            amount: refundAmount,
            status: rzpRefund.status || 'processed',
            createdAt: new Date()
        });

        payment.status = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
        await payment.save();

        order.paymentStatus = payment.status;
        order.orderStatus = isFullRefund ? 'REFUNDED' : order.orderStatus;
        order.trackingUpdates.push({
            status: isFullRefund ? 'Order Refunded' : 'Partial Refund Issued',
            location: 'Online',
            description: `Refund of ₹${refundAmount} processed via Razorpay. Refund ID: ${rzpRefund.id}`,
            date: new Date()
        });
        await order.save();

        res.json({
            success: true,
            message: 'Refund initiated successfully',
            refundId: rzpRefund.id,
            amount: refundAmount,
            status: payment.status
        });
    } catch (error) {
        console.error('❌ initiateRefund Error:', error);
        res.status(500).json({ message: 'Refund failed', error: error.message });
    }
};
