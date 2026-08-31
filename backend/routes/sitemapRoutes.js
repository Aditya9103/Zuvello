import express from 'express';
import Product from '../models/Product.js';
import Blog from '../models/Blog.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const products = await Product.find({}).select('slug');
        const blogs = await Blog.find({ status: 'published' }).select('slug');

        const staticPages = [
            { url: '/', changefreq: 'daily', priority: '1.0' },
            { url: '/shop', changefreq: 'daily', priority: '0.9' },
            { url: '/new-arrivals', changefreq: 'daily', priority: '0.9' },
            { url: '/best-sellers', changefreq: 'daily', priority: '0.9' },
            { url: '/offers', changefreq: 'weekly', priority: '0.8' },
            { url: '/about', changefreq: 'monthly', priority: '0.8' },
            { url: '/contact', changefreq: 'monthly', priority: '0.8' },
            { url: '/faqs', changefreq: 'monthly', priority: '0.7' },
            { url: '/help', changefreq: 'monthly', priority: '0.6' },
            { url: '/blog', changefreq: 'weekly', priority: '0.8' },
            { url: '/shipping-policy', changefreq: 'yearly', priority: '0.5' },
            { url: '/return-policy', changefreq: 'yearly', priority: '0.5' },
            { url: '/terms', changefreq: 'yearly', priority: '0.5' },
            { url: '/privacy', changefreq: 'yearly', priority: '0.5' },
            { url: '/login', changefreq: 'yearly', priority: '0.5' },
            { url: '/register', changefreq: 'yearly', priority: '0.5' },
            { url: '/reels', changefreq: 'daily', priority: '0.8' }
        ];

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add static pages
        staticPages.forEach(page => {
            sitemap += `
  <url>
    <loc>https://www.zuvello.in${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
        });

        // Add dynamic product pages
        products.forEach(product => {
            if (product.slug) {
                sitemap += `
  <url>
    <loc>https://www.zuvello.in/product/${product.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
            }
        });

        // Add dynamic blog pages
        blogs.forEach(blog => {
            if (blog.slug) {
                sitemap += `
  <url>
    <loc>https://www.zuvello.in/blog/${blog.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
            }
        });

        sitemap += `\n</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.status(200).send(sitemap);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

export default router;
