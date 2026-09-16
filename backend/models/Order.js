import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String },
            price: { type: Number, required: true },
            size: { type: String },
            color: { type: String },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            }
        }
    ],
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'UPI', 'Razorpay', 'Online']
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
        razorpay_payment_id: String,
        razorpay_order_id: String,
        razorpay_signature: String
    },
    razorpayOrderId: {
        type: String,
        index: true
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    paymentStatus: {
        type: String,
        enum: ['CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'],
        default: 'PENDING'
    },
    orderStatus: {
        type: String,
        enum: ['PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
        default: 'PENDING_PAYMENT'
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    discountAmount: {
        type: Number,
        default: 0.0
    },
    couponCode: {
        type: String
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    },
    trackingUpdates: [
        {
            status: { type: String, required: true },
            location: { type: String, required: true },
            date: { type: Date, default: Date.now },
            description: { type: String }
        }
    ]
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
