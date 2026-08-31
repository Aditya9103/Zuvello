import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendWhatsAppOTP } from '../utils/smsService.js';
import { sendOTPEmail } from '../utils/emailService.js';
import bcrypt from 'bcryptjs';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
    const { email, password } = req.body; // email could be email or phone from frontend

    try {
        const user = await User.findOne({ 
            $or: [{ email: email }, { phone: email }]
        }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Passwordless Auth user & get token
// @route   POST /api/auth/passwordless-login
// @access  Public
export const passwordlessLogin = async (req, res) => {
    const { identifier } = req.body; // can be email or phone

    if (!identifier) {
        return res.status(400).json({ message: 'Please provide email or phone number' });
    }

    try {
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(404).json({ message: 'User not found. Please register or check out to create an account.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Admin login with password only
// @route   POST /api/admin/login
// @access  Public (Legacy)
export const adminLogin = async (req, res) => {
    const { password } = req.body;

    try {
        if (password === 'admin@2026') {
            res.json({
                success: true,
                token: jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' })
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid admin password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Verify admin token
// @route   POST /api/admin/verify
// @access  Public
export const verifyAdmin = async (req, res) => {
    const { token } = req.body;

    try {
        if (!token) {
            return res.status(400).json({ valid: false, message: 'Token is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if role is admin or if user exists and is admin
        if (decoded.role === 'admin') {
            return res.json({ valid: true });
        }

        const user = await User.findById(decoded.id);
        if (user && user.role === 'admin') {
            return res.json({ valid: true });
        }

        res.json({ valid: false });
    } catch (error) {
        res.json({ valid: false });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    orderCount: { $size: '$orders' }
                }
            },
            {
                $project: {
                    password: 0,
                    orders: 0
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send OTP for Registration
export const sendRegisterOTP = async (req, res) => {
    const { phone, email, name } = req.body;
    try {
        const userExists = await User.exists({ $or: [{ email }, { phone }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Fire and forget the database writes and WhatsApp API call
        (async () => {
            try {
                await OTP.deleteMany({ phone }); // remove old
                await OTP.create({ phone, otp: otpCode });
                await sendWhatsAppOTP(phone, otpCode, name);
                if (email) {
                    await sendOTPEmail(email, otpCode, name);
                }
            } catch (err) {
                console.error(`[OTP Error] Background task failed for ${phone}:`, err);
            }
        })();
        
        // Respond instantly to frontend
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and Register
export const verifyRegisterOTP = async (req, res) => {
    const { name, email, phone, password, otp } = req.body;
    try {
        const otpRecord = await OTP.findOne({ phone, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.create({ name, email, phone, password });
        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send Forgot Password OTP
export const sendForgotPasswordOTP = async (req, res) => {
    const { phone } = req.body;
    try {
        // Use User.findOne() to get the email address if available
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this phone number' });
        }
        
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Fire and forget the database writes and WhatsApp API call
        (async () => {
            try {
                await OTP.deleteMany({ phone }); // remove old
                await OTP.create({ phone, otp: otpCode });
                await sendWhatsAppOTP(phone, otpCode, user.name || "User");
                if (user.email) {
                    await sendOTPEmail(user.email, otpCode, user.name || "User");
                }
            } catch (err) {
                console.error(`[OTP Error] Background task failed for ${phone}:`, err);
            }
        })();
        
        // Respond instantly to frontend
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password with OTP
export const resetPasswordWithOTP = async (req, res) => {
    const { phone, otp, newPassword } = req.body;
    try {
        const otpRecord = await OTP.findOne({ phone, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ phone }).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();
        
        await OTP.deleteOne({ _id: otpRecord._id });

        res.json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
