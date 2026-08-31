import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

const BottomNav = () => {
    const { cartItems } = useCart();
    const { wishlistItems } = useWishlist();
    const location = useLocation();
    
    // Hide bottom nav on admin routes
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    const navItems = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'Shop', icon: Search, path: '/shop' },
        { name: 'Wishlist', icon: Heart, path: '/wishlist', badge: wishlistItems?.length },
        { name: 'Cart', icon: ShoppingCart, path: '/cart', badge: cartItems?.length },
        { name: 'Account', icon: User, path: '/profile' }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-[#e8dfd8] z-50 px-2 pb-safe pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-14">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full relative transition-all duration-300 ${isActive ? 'text-[#b58145]' : 'text-[#a0938a] hover:text-[#b58145]'}`}
                        >
                            <div className="relative mb-1">
                                <item.icon 
                                    size={22} 
                                    strokeWidth={isActive ? 2.5 : 2} 
                                    className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                                />
                                {item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-[#b58145] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                                {item.name}
                            </span>
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
