import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { verifyAdminToken } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
    const [isVerifying, setIsVerifying] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const valid = await verifyAdminToken();
            setIsAuthenticated(valid);
            setIsVerifying(false);
        };

        checkAuth();
    }, []);

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Verifying...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
