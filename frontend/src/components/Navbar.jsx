import React, { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingCart, Menu, X, ChevronRight, PlayCircle, Package } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const Navbar = () => {
    const { cartItems } = useCart();
    const { wishlistItems } = useWishlist();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            if (location.pathname === '/' && window.scrollY > 40) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        handleScroll(); // Check on mount/route change
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
            setIsMobileMenuOpen(false);
            setIsSearchExpanded(false);
        }
    };

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Shop', href: '/shop' },
        { name: 'New Arrivals', href: '/new-arrivals' },
        { name: 'Best Sellers', href: '/best-sellers' },
        { name: 'Offers', href: '/offers' },
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
    ];

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isHomePage = location.pathname === '/';
    const isTransparent = isHomePage && !isScrolled && isDesktop;
    const wrapperPosition = (isHomePage && isDesktop) ? 'fixed' : 'sticky';

    return (
        <div className={`${wrapperPosition} top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'pointer-events-none' : ''}`}>

            {/* Announcement Bar (Top) */}
            <div className={`w-full bg-[#1c1c1c] text-white text-[10px] sm:text-xs font-semibold flex items-center justify-center transition-all duration-300 overflow-hidden pointer-events-auto ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100 py-1.5 sm:py-2'}`}>
                <span className="flex items-center gap-1 sm:gap-2 px-2 text-center leading-tight">
                    <span className="hidden sm:inline">🎉 SPECIAL OFFER: Get 10% off your first order!</span>
                    <span className="sm:hidden">🎉 10% OFF first order!</span>
                    Use code <span className="text-[#c1865a] font-bold">VIBES10</span>
                </span>
            </div>

            <header className={`font-sans mx-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto ${isScrolled
                ? 'w-full md:w-[98%] max-w-[1800px] mt-0 md:mt-2 bg-white/95 md:bg-white/90 backdrop-blur-md md:backdrop-blur-xl shadow-sm md:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-none md:rounded-full border-b border-gray-200 md:border md:border-gray-200/50'
                : isTransparent
                    ? 'w-full bg-transparent border-transparent'
                    : 'w-full bg-white border-b border-gray-100'
                }`}>
                {/* Top Row: Logo, Search, Icons */}
                <div className={`max-w-[1400px] mx-auto transition-all duration-300 ${isScrolled ? 'px-3 min-[375px]:px-4 sm:px-6 py-2.5 sm:py-2.5' : 'px-3 min-[375px]:px-4 md:px-8 py-3 md:py-4'}`}>
                    <div className="flex items-center justify-between gap-1 min-[375px]:gap-3 md:gap-12">

                        {/* Mobile Menu Toggle (Left) */}
                        <button
                            className="lg:hidden text-[#1c1c1c] hover:text-[#c1865a] transition-colors p-1 -ml-1 flex-shrink-0"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={20} className="min-[375px]:w-6 min-[375px]:h-6" /> : <Menu size={20} className="min-[375px]:w-6 min-[375px]:h-6" />}
                        </button>

                        {/* Logo (Center on mobile, Left on desktop) */}
                        <Link to="/" className="flex items-center flex-shrink-0 min-w-[100px] md:min-w-[140px] mr-auto lg:mr-0 relative h-10 min-[375px]:h-12 z-20">
                            <img src="/logo.png" alt="Zuvello Logo" className={`absolute top-1/2 -translate-y-1/2 left-0 w-auto object-cover rounded-full shadow-md transition-all duration-300 ${isScrolled ? 'h-10 min-[375px]:h-10' : 'h-12 min-[375px]:h-14 md:h-16 lg:h-16 xl:h-20'}`} loading="lazy" decoding="async" />
                        </Link>

                        {/* Desktop Navigation Links (Centered) */}
                        <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-8 flex-1">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href));
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className={`text-[13px] font-extrabold transition-colors duration-200 
                                        ${isActive
                                                ? 'text-[#b58145]'
                                                : 'text-black hover:text-[#b58145]'}`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Icons (Right) */}
                        <div className="flex items-center gap-2 min-[375px]:gap-4 md:gap-8 text-black flex-shrink-0">
                            {/* Expanding Search (Desktop) & Icon */}
                            <div className="flex items-center relative">
                                {/* Expanding Input */}
                                <div className={`hidden md:flex overflow-hidden transition-all duration-300 items-center bg-[#faf8f5] rounded-full border border-gray-200 absolute right-8 ${isSearchExpanded ? 'w-48 lg:w-64 px-4 py-2 opacity-100' : 'w-0 opacity-0 border-transparent pointer-events-none'
                                    }`}>
                                    <form onSubmit={handleSearch} className="flex w-full">
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            className="w-full bg-transparent outline-none text-[13px] text-[#483d36] font-medium"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus={isSearchExpanded}
                                        />
                                    </form>
                                </div>

                                {/* Search Toggle Button */}
                                <button
                                    className="text-black hover:text-[#c1865a] transition-colors p-1"
                                    onClick={() => {
                                        if (window.innerWidth < 768) {
                                            setIsMobileMenuOpen(true);
                                        } else {
                                            setIsSearchExpanded(!isSearchExpanded);
                                        }
                                    }}
                                >
                                    {isSearchExpanded ? <X size={22} strokeWidth={1.5} className="hidden md:block" /> : <Search size={22} strokeWidth={1.5} />}
                                    {isSearchExpanded && <Search size={22} strokeWidth={1.5} className="md:hidden" />}
                                </button>
                            </div>

                            {/* Wishlist */}
                            <Link to="/wishlist" className="relative hover:text-[#c1865a] transition-colors flex flex-col items-center gap-1">
                                <div className="relative">
                                    <Heart size={22} md:size={24} strokeWidth={1.5} />
                                    {wishlistItems.length > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-[#ef4c7f] text-white text-[8px] md:text-[9px] font-bold w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center shadow-sm">
                                            {wishlistItems.length}
                                        </span>
                                    )}
                                </div>
                                <span className="hidden sm:block text-[10px] font-extrabold">Wishlist</span>
                            </Link>

                            {/* Orders (Desktop only) */}
                            <Link to={userInfo ? "/my-orders" : "/login"} className="hover:text-[#c1865a] transition-colors hidden sm:flex flex-col items-center gap-1">
                                <Package size={24} strokeWidth={1.5} />
                                <span className="text-[10px] font-extrabold">My Orders</span>
                            </Link>

                            {/* Profile (Desktop only) */}
                            <Link to={userInfo ? "/profile" : "/login"} className="hover:text-[#c1865a] transition-colors hidden sm:flex flex-col items-center gap-1">
                                <User size={24} strokeWidth={1.5} />
                                <span className="text-[10px] font-extrabold">My Profile</span>
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="relative hover:text-[#c1865a] transition-colors flex flex-col items-center gap-1">
                                <div className="relative">
                                    <ShoppingCart size={22} md:size={24} strokeWidth={1.5} />
                                    <span className="absolute -top-1.5 -right-1.5 bg-[#b58145] text-white text-[8px] md:text-[9px] font-bold w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center shadow-sm">
                                        {cartItems.length}
                                    </span>
                                </div>
                                <span className="hidden sm:block text-[10px] font-extrabold">Cart</span>
                            </Link>
                        </div>
                    </div>
                </div>



                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-white z-40 border-b border-gray-100 shadow-xl animate-in slide-in-from-top-2">
                        <div className="p-4 flex flex-col gap-4">
                            <form onSubmit={handleSearch} className="flex w-full rounded-md bg-[#faf8f5] border border-gray-200 px-4 py-3 items-center">
                                <input
                                    type="text"
                                    placeholder="Search for plushies..."
                                    className="flex-1 bg-transparent text-sm text-[#1c1c1c] font-medium outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="text-[#c1865a]">
                                    <Search size={18} strokeWidth={2.5} />
                                </button>
                            </form>

                            <button className="w-full bg-[#b58145] text-white px-4 py-3 flex items-center justify-between font-semibold text-sm rounded-md">
                                <div className="flex items-center gap-2">
                                    <Menu size={18} />
                                    Shop by Categories
                                </div>
                                <ChevronRight size={16} />
                            </button>

                            <nav className="flex flex-col gap-1 mt-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-4 py-3 text-sm font-bold text-[#1c1c1c] hover:bg-[#faf8f5] hover:text-[#b58145] rounded-md flex items-center justify-between"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
};

export default Navbar;
