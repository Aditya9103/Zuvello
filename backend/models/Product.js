import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
    },
    category: {
        type: String,
        required: [true, 'Please provide product category'],
    },
    images: [
        {
            type: String,
            required: true,
        },
    ],
    stock: {
        type: Number,
        default: 0,
    },
    ageGroup: {
        type: String,
        default: '',
    },
    sizes: [{
        type: String,
    }],
    bulletPoints: [{
        type: String,
    }],
    features: [{
        title: String,
        description: String,
    }],
    isNewArrival: {
        type: Boolean,
        default: false,
    },
    isBestSeller: {
        type: Boolean,
        default: false,
    },
    video: {
        type: String,
        default: '',
    },
    views: {
        type: Number,
        default: 0,
    },
    baseViews: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    }
});

productSchema.pre('save', function () {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
});

export default mongoose.model('Product', productSchema);
