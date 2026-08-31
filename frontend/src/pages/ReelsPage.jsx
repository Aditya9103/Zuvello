import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Heart, Share2, Volume2, VolumeX, Minus, Plus, Eye, Play, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';
import { useCart } from '../contexts/CartContext';

function ReelPlayerSlide({ product, isMuted, toggleMute, isActive, offset }) {
    const videoRef = useRef(null);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
    const [quantity, setQuantity] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(product.likes || 0);

    useEffect(() => {
        if (isActive && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Auto-play prevented", e));
        } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive, product._id]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(e => console.error(e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleLike = async (e) => {
        e.stopPropagation();
        try {
            const newLikedState = !liked;
            setLiked(newLikedState);
            setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
            await axios.post(`${API_BASE_URL}/products/${product._id}/like`, { liked: newLikedState });
        } catch (error) {
            console.error('Error liking product:', error);
        }
    };

    const handleShare = async (e) => {
        e.stopPropagation();
        try {
            await navigator.share({
                title: `Check out ${product.name}`,
                url: `${window.location.origin}/product/${product.slug}`,
            });
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleAddToCart = () => {
        if (!selectedSize && product.sizes?.length > 0) {
            alert('Please select a size');
            setIsOptionsOpen(true);
            return;
        }
        addToCart({ ...product, selectedSize, quantity });
        setIsOptionsOpen(false);
    };

    const totalViews = (product.views || 0) + (product.baseViews || 0);
    const originalPrice = product.price === 699 ? 1299 : product.price === 698 ? 1299 : product.price + Math.floor(product.price * 0.86);
    const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

    return (
        <div 
            className="absolute top-0 left-0 w-full h-full rounded-[24px] overflow-hidden transition-all duration-500 ease-in-out shadow-2xl"
            style={{
                transform: `translateX(${offset * 115}%) scale(${isActive ? 1 : 0.85})`,
                opacity: isActive ? 1 : Math.abs(offset) === 1 ? 0.4 : 0,
                zIndex: isActive ? 10 : 0,
                pointerEvents: isActive ? 'auto' : 'none',
                filter: isActive ? 'none' : 'blur(4px)'
            }}
        >
            <video
                ref={videoRef}
                src={product.video}
                className="w-full h-full object-cover bg-zinc-900 cursor-pointer"
                loop
                playsInline
                onClick={togglePlay}
            />

            {/* Play Overlay */}
            {!isPlaying && isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                        <Play size={32} className="text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            {isActive && (
                <>
                    {/* Top Left: Views */}
                    <div className="absolute top-6 left-6 flex items-center gap-1.5 text-white bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full z-10">
                        <Eye size={14} />
                        <span className="text-xs font-bold">{totalViews >= 1000 ? (totalViews/1000).toFixed(1) + 'k' : totalViews} views</span>
                    </div>

                    {/* Right Side Actions */}
                    <div className="absolute right-4 bottom-48 flex flex-col items-center gap-5 z-10">
                        <div className="flex flex-col items-center gap-1">
                            <button onClick={handleLike} className="w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white transition-transform hover:scale-110">
                                <Heart size={22} className={liked ? "fill-red-500 text-red-500" : ""} />
                            </button>
                            <span className="text-white text-xs font-bold drop-shadow-md">{likesCount}</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white transition-transform hover:scale-110">
                                {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                            </button>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <button onClick={handleShare} className="w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white transition-transform hover:scale-110">
                                <Share2 size={22} />
                            </button>
                            <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                        </div>
                    </div>

                    {/* Bottom Floating Product Card */}
                    <div className="absolute bottom-6 left-4 right-4 z-20">
                        <div className="bg-[#4d3220]/90 backdrop-blur-xl border border-white/10 rounded-[20px] p-4 flex flex-col gap-4 shadow-xl">
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                                    <img 
                                        src={product.images?.[0] || 'https://via.placeholder.com/150'} 
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                     loading="lazy" decoding="async" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="text-white font-bold text-sm md:text-base leading-tight mb-1 truncate">{product.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-black text-sm md:text-base">₹{product.price}</span>
                                        <span className="text-white/60 text-xs line-through">₹{originalPrice}</span>
                                        <span className="bg-[#cf7e28]/20 text-[#ffb05c] text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">-{discount}%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsOptionsOpen(true); }}
                                className="w-full py-3 bg-white text-[#1c1c1c] font-black text-sm tracking-wide rounded-xl hover:bg-gray-100 transition-colors flex justify-center items-center gap-2"
                            >
                                <ShoppingBag size={16} /> Select options
                            </button>
                        </div>
                    </div>

                    {/* Options Modal (Size & Quantity) */}
                    {isOptionsOpen && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end rounded-[24px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-zinc-900 w-full rounded-t-3xl p-6 transform transition-transform border-t border-white/10 h-[70%] flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Select Options</h3>
                                    <button onClick={() => setIsOptionsOpen(false)} className="text-white p-2 bg-white/10 rounded-full hover:bg-white/20">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto no-scrollbar">
                                    {product.sizes?.length > 0 && (
                                        <div className="mb-6">
                                            <p className="text-white/70 text-xs font-bold mb-3 uppercase tracking-wider">Select Size</p>
                                            <div className="flex flex-wrap gap-3">
                                                {product.sizes.map((size) => (
                                                    <button
                                                        key={size}
                                                        onClick={() => setSelectedSize(size)}
                                                        className={`px-5 py-2.5 rounded-xl border-2 transition-all ${selectedSize === size ? 'bg-[#cf7e28] border-[#cf7e28] text-white font-bold shadow-[0_0_15px_rgba(207,126,40,0.4)]' : 'bg-zinc-800 border-zinc-700 text-white hover:border-zinc-500'}`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <p className="text-white/70 text-xs font-bold mb-3 uppercase tracking-wider">Quantity</p>
                                        <div className="flex items-center gap-4 bg-zinc-800 w-fit rounded-xl p-1 border border-zinc-700">
                                            <button 
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center text-white hover:bg-zinc-600 transition-colors"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="text-white font-bold text-lg w-8 text-center">{quantity}</span>
                                            <button 
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center text-white hover:bg-zinc-600 transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleAddToCart}
                                    className="w-full py-4 bg-[#cf7e28] text-white font-black tracking-wider uppercase rounded-xl hover:bg-[#b58145] transition-colors mt-auto shadow-lg"
                                >
                                    Add to Cart - ₹{product.price * quantity}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

const ReelsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    
    // Swipe handling
    const touchStartY = useRef(0);
    const touchStartX = useRef(0);

    useEffect(() => {
        const fetchReels = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/products`);
                // Filter products that have video
                const videoProducts = data.filter(p => p.video);
                
                // Sort so the requested ID is first
                if (id) {
                    const targetIndex = videoProducts.findIndex(p => p._id === id || p.slug === id);
                    if (targetIndex > -1) {
                        const target = videoProducts.splice(targetIndex, 1)[0];
                        videoProducts.unshift(target);
                    }
                }
                
                setProducts(videoProducts);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching reels:', error);
                setLoading(false);
            }
        };
        fetchReels();
    }, [id]);

    useEffect(() => {
        if (products.length > 0 && products[activeIndex]) {
            // Increment view count when video becomes active
            axios.post(`${API_BASE_URL}/products/${products[activeIndex]._id}/view`).catch(e => console.error(e));
        }
    }, [activeIndex, products]);

    const handleNext = () => {
        setActiveIndex(prev => (prev + 1) % products.length);
    };

    const handlePrev = () => {
        setActiveIndex(prev => (prev - 1 + products.length) % products.length);
    };

    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        
        const deltaY = touchStartY.current - touchEndY;
        const deltaX = touchStartX.current - touchEndX;

        // Check if swipe is more horizontal or vertical
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal Swipe
            if (deltaX > 50) handleNext();
            else if (deltaX < -50) handlePrev();
        } else {
            // Vertical Swipe (Fallback for mobile users used to swiping up/down)
            if (deltaY > 50) handleNext();
            else if (deltaY < -50) handlePrev();
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev();
            if (e.key === 'Escape') navigate(-1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex, products.length]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-zinc-950 z-[100] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#cf7e28]"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold mb-4">No Reels Found</h2>
                <button onClick={() => navigate(-1)} className="text-[#cf7e28] hover:underline">Go back</button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] z-[100] h-[100dvh] w-full overflow-hidden flex flex-col">
            <SEO title="Shop By Reels | Zuvello" />
            
            {/* Top Close Button */}
            <div className="absolute top-6 right-6 z-[110]">
                <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors border border-white/10">
                    <X size={24} />
                </button>
            </div>

            {/* Desktop Navigation Arrows */}
            <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] z-[90] pointer-events-none">
                <div className="flex justify-between w-full px-4">
                    <button 
                        onClick={handlePrev} 
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto hover:bg-white/20 transition-all opacity-100"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={handleNext} 
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto hover:bg-white/20 transition-all opacity-100"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Main Carousel Area */}
            <div 
                className="flex-1 w-full flex items-center justify-center relative touch-none py-6 md:py-10 overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* 
                   We want the card to respect both max width (for desktop) and max height (so it doesn't overflow the screen).
                   Using h-full with a max-height and aspect ratio ensures it scales down on smaller screens. 
                */}
                <div className="relative w-auto h-[85vh] md:h-[80vh] aspect-[9/16] max-w-[100vw] mx-auto">
                    {products.map((product, index) => {
                        let offset = index - activeIndex;
                        
                        // Adjust offset for infinite wrapping
                        const halfLength = Math.floor(products.length / 2);
                        if (offset > halfLength) {
                            offset -= products.length;
                        } else if (offset < -halfLength) {
                            offset += products.length;
                        }

                        // Only render items close to active index for performance
                        if (Math.abs(offset) > 2) return null;
                        
                        return (
                            <ReelPlayerSlide
                                key={product._id}
                                product={product}
                                isActive={index === activeIndex}
                                offset={offset}
                                isMuted={isMuted}
                                toggleMute={() => setIsMuted(!isMuted)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ReelsPage;
