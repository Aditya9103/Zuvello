import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';
import { sendOrderPlacedEmail, sendOrderShippedEmail, sendOrderDeliveredEmail } from '../utils/emailService.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice,
        discountAmount = 0,
        couponCode = null,
    } = req.body;

    try {
        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        } else {
            let userId;
            let token = null;
            let userInfo = null;

            if (req.user && req.user._id) {
                userId = req.user._id;
            } else {
                return res.status(401).json({ message: 'User must be logged in to place an order' });
            }

            const order = new Order({
                orderItems,
                user: userId,
                shippingAddress,
                paymentMethod,
                totalPrice,
                discountAmount,
                couponCode,
                trackingUpdates: [
                    {
                        status: 'Order Placed',
                        location: 'Online',
                        description: 'Your order has been successfully placed.',
                        date: new Date()
                    }
                ]
            });

            console.log("📝 Creating order for user:", userId);
            const createdOrder = await order.save();
            
            // Decrease product stock
            for (const item of orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock = Math.max(0, product.stock - item.qty);
                    await product.save();
                }
            }

            // Trigger order placed email (fire and forget)
            const userForEmail = await User.findById(userId);
            if (userForEmail) {
                sendOrderPlacedEmail(userForEmail, createdOrder).catch(console.error);
            }
            
            // Return order and optionally new user info
            res.status(201).json({
                ...createdOrder.toObject(),
                newUserToken: token,
                newUserInfo: userInfo
            });
        }
    } catch (error) {
        console.error("❌ Create Order Error:", error);
        res.status(500).json({ message: 'Failed to place order', error: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        const oldStatus = order.status;
        order.status = req.body.status || order.status;
        if (req.body.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }
        const updatedOrder = await order.save();
        
        // Trigger emails if status changed to Shipped or Delivered
        if (oldStatus !== order.status) {
            const userForEmail = await User.findById(order.user);
            if (userForEmail) {
                if (order.status === 'Shipped') sendOrderShippedEmail(userForEmail, updatedOrder).catch(console.error);
                if (order.status === 'Delivered') sendOrderDeliveredEmail(userForEmail, updatedOrder).catch(console.error);
            }
        }
        
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Add tracking update to order (Admin)
// @route   POST /api/orders/:id/tracking
// @access  Private/Admin
export const addOrderTrackingUpdate = async (req, res) => {
    const { status, location, description } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.trackingUpdates.push({
            status,
            location,
            description,
            date: new Date()
        });
        
        // Optional: Update general status if it makes sense, or leave as is.
        let statusChanged = false;
        const oldStatus = order.status;

        if (status === 'Delivered') {
            order.status = 'Delivered';
            order.isDelivered = true;
            order.deliveredAt = Date.now();
            statusChanged = (oldStatus !== 'Delivered');
        } else if (['Processing', 'Shipped', 'Cancelled'].includes(status)) {
            order.status = status;
            statusChanged = (oldStatus !== status);
        }

        const updatedOrder = await order.save();

        if (status === 'Shipped' || status === 'Delivered' || statusChanged) {
            const userForEmail = await User.findById(order.user);
            if (userForEmail) {
                if (status === 'Shipped') sendOrderShippedEmail(userForEmail, updatedOrder).catch(console.error);
                if (status === 'Delivered') sendOrderDeliveredEmail(userForEmail, updatedOrder).catch(console.error);
            }
        }

        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Make sure the order belongs to the user
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to cancel this order' });
        }

        // Check if already shipped/delivered
        if (order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Cancelled') {
            return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
        }

        order.status = 'Cancelled';
        order.trackingUpdates.push({
            status: 'Cancelled',
            location: 'Online',
            description: 'Order cancelled by user',
            date: new Date()
        });

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Update order shipping info (Admin)
// @route   PUT /api/orders/:id/edit
// @access  Private/Admin
export const updateOrderDetails = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.shippingAddress = {
            name: req.body.name || order.shippingAddress.name,
            phone: req.body.phone || order.shippingAddress.phone,
            address: req.body.address || order.shippingAddress.address,
            city: req.body.city || order.shippingAddress.city,
            postalCode: req.body.postalCode || order.shippingAddress.postalCode,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};
// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
    try {
        const User = (await import('../models/User.js')).default;
        
        const totalUsers = await User.countDocuments({ role: 'user' });
        const orders = await Order.find({});
        
        const totalOrders = orders.length;
        const totalRevenue = orders
            .filter(o => o.isPaid || o.status === 'Delivered')
            .reduce((acc, o) => acc + o.totalPrice, 0);
            
        const pendingOrders = orders.filter(o => o.status === 'Pending').length;

        res.json({
            totalUsers,
            totalOrders,
            totalRevenue,
            pendingOrders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
