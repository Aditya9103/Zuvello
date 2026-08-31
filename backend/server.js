import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import blogRoutes from "./routes/blogRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import instagramRoutes from "./routes/instagramRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();
const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://zuvello.vercel.app',
        'https://www.zuvello.in',
        'https://zuvello.in',

        ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [])
    ],
    credentials: true,
}));
app.use(express.json());

// Request and Error logging middleware (PID: ${process.pid})
app.use((req, res, next) => {
    console.log(`📡 [${req.method}] ${req.url}`);
    const oldResJson = res.json;
    res.json = function (data) {
        if (res.statusCode >= 400) {
            console.error(`❌ API Error [${req.method}] ${req.url}:`, JSON.stringify(data, null, 2));
            if (req.method !== 'GET') {
                console.error(`📦 Request Body:`, JSON.stringify(req.body, null, 2));
            }
        }
        return oldResJson.apply(res, arguments);
    };
    next();
});

app.get("/api/health", (req, res) => res.json({ status: "ok", message: "Backend is reachable" }));
app.get("/api/wakeup", (req, res) => res.status(200).json({ success: true, message: 'Server is awake' }));
app.get("/", (req, res) => res.status(200).json({ success: true, message: "zuvello  server running..." }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.use("/api/blogs", blogRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/instagram", instagramRoutes);
app.use("/api/sitemap.xml", sitemapRoutes);
app.use("/api/reviews", reviewRoutes);

console.log('✅ Routes mounted: /api/auth, /api/products, /api/blogs, /api/orders, /api/upload, /api/admin, /api/enquiry, /api/coupons, /api/instagram, /api/reviews');


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));