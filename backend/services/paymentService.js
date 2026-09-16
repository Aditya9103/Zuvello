import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance = null;

export const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            throw new Error('Razorpay Key ID or Key Secret is missing from environment variables');
        }

        razorpayInstance = new Razorpay({
            key_id,
            key_secret
        });
    }
    return razorpayInstance;
};

/**
 * Creates a Razorpay Order
 * @param {Object} params
 * @param {number} params.amountInRupees - Amount in INR
 * @param {string} [params.currency='INR']
 * @param {string} params.receipt - Internal order/receipt identifier
 * @param {Object} [params.notes={}]
 * @returns {Promise<Object>} Razorpay order object
 */
export const createRazorpayOrder = async ({ amountInRupees, currency = 'INR', receipt, notes = {} }) => {
    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(amountInRupees * 100);

    const options = {
        amount: amountInPaise,
        currency,
        receipt: receipt.toString().slice(0, 40), // Razorpay limits receipt to 40 chars
        notes
    };

    const order = await razorpay.orders.create(options);
    return order;
};

/**
 * Verifies Razorpay Checkout signature using HMAC-SHA256
 * @param {Object} params
 * @param {string} params.razorpayOrderId
 * @param {string} params.razorpayPaymentId
 * @param {string} params.razorpaySignature
 * @returns {boolean} true if valid
 */
export const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        throw new Error('RAZORPAY_KEY_SECRET is not configured');
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return false;
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const providedBuffer = Buffer.from(razorpaySignature, 'utf-8');

    if (expectedBuffer.length !== providedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
};

/**
 * Verifies Razorpay Webhook signature
 * Returns true if valid, false if invalid, null if webhook secret is not configured
 * @param {Object} params
 * @param {Buffer|string} params.rawBody
 * @param {string} params.signature
 * @returns {boolean|null}
 */
export const verifyWebhookSignature = ({ rawBody, signature }) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return null; // Webhook secret not configured
    }

    if (!rawBody || !signature) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const providedBuffer = Buffer.from(signature, 'utf-8');

    if (expectedBuffer.length !== providedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
};

/**
 * Fetches payment details directly from Razorpay
 * @param {string} paymentId
 * @returns {Promise<Object>}
 */
export const fetchPaymentDetails = async (paymentId) => {
    try {
        const razorpay = getRazorpayInstance();
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Error fetching Razorpay payment details:', error);
        return null;
    }
};

/**
 * Initiates full or partial refund
 * @param {Object} params
 * @param {string} params.paymentId
 * @param {number} [params.amountInRupees] - Omit for full refund
 * @param {Object} [params.notes={}]
 * @returns {Promise<Object>}
 */
export const initiateRazorpayRefund = async ({ paymentId, amountInRupees, notes = {} }) => {
    const razorpay = getRazorpayInstance();
    const options = { notes };
    if (amountInRupees && amountInRupees > 0) {
        options.amount = Math.round(amountInRupees * 100);
    }
    const refund = await razorpay.payments.refund(paymentId, options);
    return refund;
};
