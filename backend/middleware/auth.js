import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth Header:', authHeader);

        const token = authHeader?.split(" ")[1];
        console.log('Token extracted:', token ? 'Yes (length: ' + token.length + ')' : 'No');

        if (!token) {
            console.log('No token provided in header');
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        console.log('Verifying token with secret...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully. Role:', decoded.role);

        if (!decoded || decoded.role !== "admin") {
            console.log('Access denied: User is not an admin. Role:', decoded?.role);
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only."
            });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            error: error.message
        });
    }
};
