import Blog from '../models/Blog.js';
import { uploadFileToS3, getPresignedUrl, deleteFromS3 } from '../utils/s3Storage.js';
import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

/**
 * Get cached presigned URL or generate new one if expired
 * @param {Object} blog - Blog document
 * @returns {Promise<Object>} - { url: string, updated: boolean }
 */
async function getCachedOrGenerateUrl(blog) {
    const now = new Date();

    // Check if we have a valid cached URL
    if (blog.cachedPresignedUrl && blog.urlExpiresAt && blog.urlExpiresAt > now) {
        return { url: blog.cachedPresignedUrl, updated: false };
    }

    try {
        // Generate new presigned URL
        const presignedUrl = await getPresignedUrl(blog.thumbnailUrl);

        // Cache expires in 7 days (same as presigned URL validity)
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Update cache
        blog.cachedPresignedUrl = presignedUrl;
        blog.urlExpiresAt = expiresAt;

        return { url: presignedUrl, updated: true };
    } catch (error) {
        console.error(`❌ Failed to generate presigned URL for ${blog.slug}:`, error.message);
        // Fallback to original key so the app doesn't crash
        return { url: blog.thumbnailUrl, updated: false };
    }
}


// @desc    Get all blogs (with filters)
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
    try {
        const { category, status, search } = req.query;
        const filter = {};

        // Handle status filter
        if (status && status !== 'all') {
            filter.status = status;
        } else if (!status) {
            // If no status specified, only show published to public
            filter.status = 'published';
        }
        // If status === 'all', don't add status filter (show all)

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } }
            ];
        }

        const blogs = await Blog.find(filter)
            .sort({ publishedDate: -1 });

        // Generate presigned URLs for thumbnails (with caching)
        const blogsToUpdate = [];
        const blogsWithUrls = await Promise.all(
            blogs.map(async (blog) => {
                const blogObj = blog.toObject();
                if (blogObj.thumbnailUrl && (blogObj.thumbnailUrl.startsWith('career-commando/') || blogObj.thumbnailUrl.startsWith('ecommerce/'))) {
                    // Use cached URL or generate new one
                    const { url, updated } = await getCachedOrGenerateUrl(blog);
                    blogObj.thumbnailUrl = url;

                    // Track blogs that need cache update
                    if (updated) {
                        blogsToUpdate.push(blog);
                    }
                }
                return blogObj;
            })
        );

        // Batch save all blogs with updated cache
        if (blogsToUpdate.length > 0) {
            await Promise.all(blogsToUpdate.map(blog => blog.save()));
        }

        res.json(blogsWithUrls);
    } catch (error) {
        console.error('Get Blogs Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug?lang=hi
// @access  Public
export const getBlogBySlug = async (req, res) => {
    try {
        const { lang = 'en' } = req.query; // Default to English
        const blog = await Blog.findOne({ slug: req.params.slug });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Increment views
        blog.views += 1;

        // Generate presigned URL for thumbnail if it's an S3 key (with caching)
        const blogObj = blog.toObject();
        let cacheUpdated = false;

        if (blogObj.thumbnailUrl && (blogObj.thumbnailUrl.startsWith('career-commando/') || blogObj.thumbnailUrl.startsWith('ecommerce/'))) {
            try {
                const { url, updated } = await getCachedOrGenerateUrl(blog);
                blogObj.thumbnailUrl = url;
                cacheUpdated = updated;
            } catch (error) {
                console.error(`❌ Failed to generate presigned URL for ${blog.slug}:`, error.message);
                // blogObj.thumbnailUrl already has the original key
            }
        }

        // Save blog (for view count and potentially cache update)
        await blog.save();

        // If requested language is same as original language, return original
        if (lang === blog.language) {
            return res.json(blogObj);
        }

        // Check if translation exists in cache
        if (blog.translations && blog.translations.has(lang)) {
            const cachedTranslation = blog.translations.get(lang);

            // Return blog with translated content
            return res.json({
                ...blogObj,
                title: cachedTranslation.title,
                excerpt: cachedTranslation.excerpt,
                content: cachedTranslation.content,
                isTranslated: true,
                translatedAt: cachedTranslation.translatedAt
            });
        }

        // Translation not cached, call Google Translate API
        const { translateBlog } = await import('../services/translateService.js');

        const translatedContent = await translateBlog(blog, lang);

        // Save translation to cache
        if (!blog.translations) {
            blog.translations = new Map();
        }
        blog.translations.set(lang, translatedContent);
        await blog.save();

        // Return translated blog
        res.json({
            ...blogObj,
            title: translatedContent.title,
            excerpt: translatedContent.excerpt,
            content: translatedContent.content,
            isTranslated: true,
            translatedAt: translatedContent.translatedAt
        });
    } catch (error) {
        console.error('Get Blog Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private (Admin only)
export const createBlog = async (req, res) => {
    try {
        const { title, excerpt, content, category, tags, status, thumbnailUrl } = req.body;

        // Validate required fields
        if (!title || !excerpt || !content) {
            return res.status(400).json({ message: 'Title, excerpt, and content are required' });
        }

        // Create slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if slug already exists
        const existingBlog = await Blog.findOne({ slug });
        if (existingBlog) {
            return res.status(400).json({ message: 'A blog with this title already exists' });
        }

        const blog = new Blog({
            title,
            slug,
            excerpt,
            content,
            thumbnailUrl: thumbnailUrl || '',
            category: category || 'General',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            status: status || 'draft'
        });

        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        console.error('Create Blog Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin only)
export const updateBlog = async (req, res) => {
    try {
        const { title, excerpt, content, category, tags, status, thumbnailUrl } = req.body;

        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Update fields
        if (title) {
            blog.title = title;
            blog.slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }
        if (excerpt) blog.excerpt = excerpt;
        if (content) blog.content = content;
        if (category) blog.category = category;
        if (tags) blog.tags = tags.split(',').map(tag => tag.trim());
        if (status) blog.status = status;
        if (thumbnailUrl !== undefined) blog.thumbnailUrl = thumbnailUrl;


        await blog.save();
        res.json(blog);
    } catch (error) {
        console.error('Update Blog Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin only)
export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Delete thumbnail from S3 if exists
        if (blog.thumbnailUrl && (blog.thumbnailUrl.startsWith('career-commando/') || blog.thumbnailUrl.startsWith('ecommerce/'))) {
            try {
                await deleteFromS3(blog.thumbnailUrl);
            } catch (error) {
                console.error('Error deleting thumbnail:', error);
            }
        }

        await blog.deleteOne();
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Delete Blog Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Upload blog thumbnail
// @route   POST /api/blogs/upload-image
// @access  Private (Admin only)
export const uploadBlogImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Upload to ecommerce/ folder (unified behavior)
        const keyOrUrl = await uploadFileToS3(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        // If uploadFileToS3 returns a URL, we might need the key for caching
        // Let's assume we want to store the key in the DB.
        // For now, I'll return the URL as 'url' and if it's a URL, the key is the path.

        res.json({
            url: keyOrUrl
        });
    } catch (error) {
        console.error('Upload Image Error:', error);
        res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
};
