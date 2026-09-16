import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema({
    refundId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'processed' },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    razorpayPaymentId: {
        type: String,
        sparse: true,
        index: true
    },
    razorpaySignature: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        required: true,
        enum: ['CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'],
        default: 'CREATED'
    },
    method: {
        type: String,
        default: ''
    },
    errorCode: {
        type: String
    },
    errorDescription: {
        type: String
    },
    refunds: [refundSchema],
    webhookEvents: [{
        type: String
    }],
    verifiedAt: {
        type: Date
    }
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
