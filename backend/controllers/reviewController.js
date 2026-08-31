import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
    try {
        const { rating, title, comment, productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user has purchased this product and it is delivered
        const orders = await Order.find({ user: req.user._id, status: 'Delivered' });
        let hasPurchased = false;
        
        for (const order of orders) {
            if (order.orderItems.find(item => item.product.toString() === productId)) {
                hasPurchased = true;
                break;
            }
        }

        if (!hasPurchased) {
            return res.status(400).json({ message: 'You can only review products after they are delivered' });
        }

        // Check if already reviewed
        const alreadyReviewed = await Review.findOne({
            product: productId,
            user: req.user._id,
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Product already reviewed' });
        }

        const review = new Review({
            rating: Number(rating),
            title,
            comment,
            product: productId,
            user: req.user._id,
            status: 'pending' // Admin must approve
        });

        await review.save();
        res.status(201).json({ message: 'Review submitted for approval' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check if user is eligible to review
// @route   GET /api/reviews/eligibility/:productId
// @access  Private
export const checkReviewEligibility = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check if already reviewed
        const alreadyReviewed = await Review.findOne({
            product: productId,
            user: req.user._id,
        });

        if (alreadyReviewed) {
            return res.json({ eligible: false, message: 'You have already reviewed this product.' });
        }

        // Check if purchased and delivered
        const orders = await Order.find({ user: req.user._id, status: 'Delivered' });
        let hasPurchased = false;
        
        for (const order of orders) {
            if (order.orderItems.find(item => item.product.toString() === productId)) {
                hasPurchased = true;
                break;
            }
        }

        if (!hasPurchased) {
            return res.json({ eligible: false, message: 'You can only review products you have purchased and received.' });
        }

        res.json({ eligible: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get approved reviews for a product
// @route   GET /api/reviews/product/:id
// @access  Public
export const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ 
            product: req.params.id,
            status: 'approved'
        }).populate('user', 'name').sort('-createdAt');
        
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin
// @access  Private/Admin
export const getAdminReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name email')
            .populate('product', 'name images')
            .sort('-createdAt');
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update review status
// @route   PUT /api/reviews/:id/status
// @access  Private/Admin
export const updateReviewStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.status = status;
        await review.save();

        // If status changed to approved or from approved to something else, update product rating
        const product = await Product.findById(review.product);
        if (product) {
            const approvedReviews = await Review.find({ product: product._id, status: 'approved' });
            
            product.numReviews = approvedReviews.length;
            if (product.numReviews === 0) {
                product.rating = 0;
            } else {
                product.rating = approvedReviews.reduce((acc, item) => item.rating + acc, 0) / product.numReviews;
            }
            
            await product.save();
        }

        res.json({ message: 'Review status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const productId = review.product;
        await review.deleteOne();

        // Update product rating
        const product = await Product.findById(productId);
        if (product) {
            const approvedReviews = await Review.find({ product: product._id, status: 'approved' });
            
            product.numReviews = approvedReviews.length;
            if (product.numReviews === 0) {
                product.rating = 0;
            } else {
                product.rating = approvedReviews.reduce((acc, item) => item.rating + acc, 0) / product.numReviews;
            }
            
            await product.save();
        }

        res.json({ message: 'Review removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
