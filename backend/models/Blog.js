import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    excerpt: {
        type: String,
        required: true,
        maxlength: 300
    },
    content: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        default: ''
    },
    cachedPresignedUrl: {
        type: String,
        default: ''
    },
    urlExpiresAt: {
        type: Date,
        default: null
    },
    category: {
        type: String,
        enum: ['Style Guides', 'Behind the Scenes', 'New Arrivals', 'Styling Tips', 'General'],
        default: 'General'
    },
    author: {
        type: String,
        default: 'Own Vibes Team'
    },
    publishedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    tags: [{
        type: String,
        trim: true
    }],
    views: {
        type: Number,
        default: 0
    },
    language: {
        type: String,
        default: 'en'
    },
    translations: {
        type: Map,
        of: {
            title: String,
            excerpt: String,
            content: String,
            translatedAt: Date
        },
        default: new Map()
    }
}, {
    timestamps: true
});

// Auto-generate slug from title (no callback needed in mongoose 6+)
blogSchema.pre('save', function () {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
});


// Index for faster queries
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ publishedDate: -1 });

export default mongoose.model('Blog', blogSchema);
