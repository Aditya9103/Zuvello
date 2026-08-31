import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    });

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = (product) => {
        setWishlistItems(prevItems => {
            const productId = product._id || product.id;
            const existItem = prevItems.find(x => (x._id || x.id) === productId);
            if (existItem) {
                toast.info(`${product.name} is already in wishlist`);
                return prevItems;
            } else {
                toast.success(`${product.name} added to wishlist!`);
                return [...prevItems, product];
            }
        });
    };

    const removeFromWishlist = (id) => {
        setWishlistItems(prevItems => prevItems.filter(x => (x._id || x.id) !== id));
        toast.info(`Item removed from wishlist`);
    };
    
    const toggleWishlist = (product) => {
        setWishlistItems(prevItems => {
            const productId = product._id || product.id;
            const existItem = prevItems.find(x => (x._id || x.id) === productId);
            if (existItem) {
                toast.info(`Removed from wishlist`);
                return prevItems.filter(x => (x._id || x.id) !== productId);
            } else {
                toast.success(`${product.name} added to wishlist!`);
                return [...prevItems, product];
            }
        });
    };

    const clearWishlist = () => {
        setWishlistItems([]);
    };

    const isInWishlist = (id) => {
        if (!id) return false;
        return wishlistItems.some(x => (x._id || x.id) === id);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            clearWishlist,
            isInWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
