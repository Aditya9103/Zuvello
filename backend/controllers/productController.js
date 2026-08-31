import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const query = {};
        if (req.query.isNewArrival === 'true') query.isNewArrival = true;
        if (req.query.isBestSeller === 'true') query.isBestSeller = true;
        
        let productsQuery = Product.find(query).sort({ createdAt: -1 });
        if (req.query.limit) {
            productsQuery = productsQuery.limit(parseInt(req.query.limit));
        }
        
        const products = await productsQuery;
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const idOrSlug = req.params.id;
        let product;
        if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(idOrSlug) || await Product.findOne({ slug: idOrSlug });
        } else {
            product = await Product.findOne({ slug: idOrSlug });
        }

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, images, stock, isNewArrival, isBestSeller, ageGroup, sizes, bulletPoints, video, baseViews } = req.body;
        const product = new Product({
            name,
            description,
            price,
            category,
            images,
            stock,
            isNewArrival,
            isBestSeller,
            ageGroup,
            sizes,
            bulletPoints,
            video,
            baseViews: baseViews || 0,
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, images, stock, isNewArrival, isBestSeller, ageGroup, sizes, bulletPoints, video, baseViews } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.category = category || product.category;
            product.images = images || product.images;
            product.stock = stock !== undefined ? stock : product.stock;
            product.isNewArrival = isNewArrival !== undefined ? isNewArrival : product.isNewArrival;
            product.ageGroup = ageGroup !== undefined ? ageGroup : product.ageGroup;
            product.sizes = sizes !== undefined ? sizes : product.sizes;
            product.bulletPoints = bulletPoints !== undefined ? bulletPoints : product.bulletPoints;
            product.isBestSeller = isBestSeller !== undefined ? isBestSeller : product.isBestSeller;
            product.video = video !== undefined ? video : product.video;
            product.baseViews = baseViews !== undefined ? baseViews : product.baseViews;
            
            if (name && name !== product.name) {
                 product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Increment product view
// @route   POST /api/products/:id/view
// @access  Public
export const incrementProductView = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.views += 1;
            await product.save();
            res.json({ message: 'View incremented', views: product.views });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle product like
// @route   POST /api/products/:id/like
// @access  Public
export const toggleProductLike = async (req, res) => {
    try {
        const { liked } = req.body;
        const product = await Product.findById(req.params.id);
        if (product) {
            if (liked) {
                product.likes += 1;
            } else {
                product.likes = Math.max(0, product.likes - 1);
            }
            await product.save();
            res.json({ message: 'Like updated', likes: product.likes });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
