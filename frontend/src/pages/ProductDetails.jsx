import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronLeft, Star, Heart, Share2, Plus, Minus, RotateCcw, ShieldCheck, CreditCard, CheckCircle2, Play, Search, ZoomIn, Upload } from 'lucide-react';
import { API_BASE_URL } from '../api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import SEO from '../components/SEO';

const ProductDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('DESCRIPTION');
    const mobileSliderRef = React.useRef(null);

    // Reviews State
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
    const [reviewMessage, setReviewMessage] = useState('');

    // Zoom state
    const [zoomStyle, setZoomStyle] = useState({ transform: 'scale(1)', transformOrigin: 'center center' });

    // 1. Fetch Main Product
    const {
        data: product,
        isLoading: isLoadingProduct,
        isError: isProductError
    } = useQuery({
        queryKey: ['product', slug],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE_URL}/products/${slug}`);
            return data;
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // Automatically set default size when product loads
    useEffect(() => {
        if (product?.sizes?.length > 0 && !selectedSize) {
            setSelectedSize(product.sizes[0]);
        }
        window.scrollTo(0, 0);
    }, [product]);

    // 2. Fetch Related Products (dependent on product)
    const { data: relatedProducts = [] } = useQuery({
        queryKey: ['relatedProducts', product?.category],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE_URL}/products?limit=5`);
            const filtered = data.filter(p => p._id !== product._id && p.category === product.category).slice(0, 4);
            return filtered.length === 0 ? data.filter(p => p._id !== product._id).slice(0, 4) : filtered;
        },
        enabled: !!product, // Only run once product is loaded
        staleTime: 1000 * 60 * 10,
    });

    // 3. Fetch Reviews (dependent on product)
    const { data: reviews = [] } = useQuery({
        queryKey: ['reviews', product?._id],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE_URL}/reviews/product/${product._id}`);
            return data;
        },
        enabled: !!product,
        staleTime: 1000 * 60 * 2,
    });

    // 4. Fetch Eligibility (dependent on product and token)
    const token = localStorage.getItem('userToken');
    const { data: reviewEligibility = { eligible: false, message: '' } } = useQuery({
        queryKey: ['reviewEligibility', product?._id, token],
        queryFn: async () => {
            if (!token) return { eligible: false };
            try {
                const { data } = await axios.get(`${API_BASE_URL}/reviews/eligibility/${product._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return data;
            } catch (error) {
                return { eligible: false };
            }
        },
        enabled: !!product && !!token,
        staleTime: 1000 * 60 * 5,
    });

    // Auto-open REVIEWS tab if requested
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('tab') === 'REVIEWS') {
            setActiveTab('REVIEWS');
        }
    }, [location.search]);

    if (isLoadingProduct) {
        return (
            <div className="bg-[#fbf9f6] min-h-screen pt-[70px] md:pt-[80px] pb-20 animate-pulse">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-6">
                        {/* Image Skeleton */}
                        <div className="w-full lg:w-1/2 flex flex-col gap-4">
                            <div className="w-full aspect-[4/5] bg-gray-200 rounded-2xl md:rounded-[32px]"></div>
                            <div className="flex gap-4 overflow-hidden">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-20 h-24 md:w-24 md:h-32 bg-gray-200 rounded-xl shrink-0"></div>
                                ))}
                            </div>
                        </div>
                        {/* Details Skeleton */}
                        <div className="w-full lg:w-1/2 flex flex-col gap-6 lg:py-4">
                            <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
                            <div className="w-3/4 h-10 bg-gray-200 rounded-lg"></div>
                            <div className="w-1/4 h-6 bg-gray-200 rounded-lg"></div>
                            <div className="w-1/3 h-10 bg-gray-200 rounded-lg mt-4"></div>
                            <div className="w-full h-20 bg-gray-200 rounded-2xl mt-6"></div>
                            <div className="w-full h-14 bg-gray-200 rounded-xl mt-4"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isProductError || !product) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-red-500">Product not found!</div>;
    }

    const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/600'];
    const originalPrice = product.price === 699 ? 1299 : product.price === 698 ? 1299 : product.price + Math.floor(product.price * 0.86);
    const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart({ ...product, selectedSize }, quantity);
        // Removed navigate('/cart') so user stays on page and sees the toast
    };

    const handleBuyNow = () => {
        if (!localStorage.getItem('userToken')) {
            navigate('/login?redirect=/checkout/address');
            return;
        }
        addToCart({ ...product, selectedSize }, quantity);
        navigate('/checkout/address');
    };

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                navigate('/login');
                return;
            }
            await axios.post(`${API_BASE_URL}/reviews`, {
                productId: product._id,
                ...reviewForm
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviewMessage('Review submitted successfully and is waiting for approval!');
            setReviewForm({ rating: 5, title: '', comment: '' });
        } catch (error) {
            setReviewMessage(error.response?.data?.message || 'Error submitting review');
        }
    };

    const handleMouseMove = (e) => {
        if (window.innerWidth < 768) return; // Disable zoom on mobile
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomStyle({
            transformOrigin: `${x}% ${y}%`,
            transform: 'scale(2)'
        });
    };

    const handleScroll = (e) => {
        const scrollPosition = e.target.scrollLeft;
        const width = e.target.clientWidth;
        const currentIndex = Math.round(scrollPosition / width);
        if (currentIndex !== selectedImage) {
            setSelectedImage(currentIndex);
        }
    };

    const scrollToImage = (index) => {
        setSelectedImage(index);
        if (mobileSliderRef.current) {
            const width = mobileSliderRef.current.clientWidth;
            mobileSliderRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
        }
    };

    const handlePrevImage = (e) => {
        e.stopPropagation();
        if (selectedImage > 0) {
            scrollToImage(selectedImage - 1);
        }
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        if (selectedImage < images.length - 1) {
            scrollToImage(selectedImage + 1);
        }
    };

    const handleMouseLeave = () => {
        setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center center' });
    };

    return (
        <div className="bg-white min-h-screen font-sans pb-20">
            <SEO
                title={product.name}
                type="product"
                description={product.description || `Buy ${product.name} at Zuvello.`}
                image={images[0]}
            />

            {/* Preload the main product image for faster Largest Contentful Paint (LCP) */}
            <link rel="preload" as="image" href={images[0]} />
            <div className="w-full h-1 bg-[#f5eadb]"></div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
                {/* Breadcrumbs */}
                <div className="text-[12px] text-gray-500 mb-8 flex items-center gap-2 font-medium">
                    <Link to="/" className="hover:text-[#cf7e28]">Home</Link>
                    <ChevronRight size={12} />
                    <Link to="/shop" className="hover:text-[#cf7e28] capitalize">Shop</Link>
                    <ChevronRight size={12} />
                    <Link to="/shop" className="hover:text-[#cf7e28] capitalize">{product.category}</Link>
                    <ChevronRight size={12} />
                    <span className="text-[#1c1c1c] font-bold">{product.name}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16 items-start">

                    {/* LEFT COLUMN: Gallery */}
                    <div className="w-full lg:w-[45%] flex gap-4 md:gap-6 lg:sticky lg:top-[120px]">
                        {/* Thumbnails */}
                        <div className="w-[70px] md:w-[85px] hidden md:flex flex-col gap-3 overflow-y-auto no-scrollbar">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-full aspect-square flex-shrink-0 rounded-[12px] overflow-hidden border transition-all duration-300 ${selectedImage === idx
                                        ? 'border-[#cf7e28] bg-white ring-1 ring-[#cf7e28]'
                                        : 'border-gray-100 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" loading="lazy" decoding="async" />
                                </button>
                            ))}

                            {product.video && (
                                <button
                                    onClick={() => navigate(`/reels/${product._id}`)}
                                    className="w-full aspect-square rounded-[12px] overflow-hidden bg-[#2a2a2a] group relative flex flex-col items-center justify-center border border-transparent hover:border-gray-500 transition-colors mt-2"
                                >
                                    <video src={product.video} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity pointer-events-none" />
                                    <div className="relative z-10 flex flex-col items-center text-white">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/40 mb-1">
                                            <Play size={12} className="fill-white ml-0.5" />
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-wide">Watch Video</span>
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Main Image */}
                        <div
                            className="w-full md:flex-1 md:bg-white md:border md:border-gray-100 md:rounded-[24px] relative flex items-start md:items-center justify-center md:overflow-hidden md:cursor-zoom-in"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="absolute top-4 left-4 bg-[#cf7e28] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm z-10 pointer-events-none">
                                BESTSELLER
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                                className="absolute top-4 right-4 bg-white p-2.5 rounded-full shadow-sm hover:text-[#ef4c7f] z-10 text-gray-500 transition-colors border border-gray-100"
                            >
                                <Heart size={18} className={isInWishlist(product?._id || product?.id) ? 'fill-[#ef4c7f] text-[#ef4c7f]' : ''} />
                            </button>

                            {/* Mobile Slider View */}
                            <div ref={mobileSliderRef} className="md:hidden flex items-center overflow-x-auto snap-x snap-mandatory no-scrollbar w-full relative z-0 pb-4" onScroll={handleScroll}>
                                {images.map((img, idx) => (
                                    <div key={idx} className="w-full flex-shrink-0 snap-center pr-2 last:pr-0">
                                        <img
                                            src={img}
                                            alt={product.name}
                                            className="w-full h-auto object-contain bg-white border border-gray-100 rounded-[24px]"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Mobile Arrows */}
                            {selectedImage > 0 && (
                                <button
                                    onClick={handlePrevImage}
                                    className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 border border-gray-200 p-2 rounded-full shadow-sm text-gray-700 hover:text-black z-20 pointer-events-auto"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            {selectedImage < images.length - 1 && (
                                <button
                                    onClick={handleNextImage}
                                    className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 border border-gray-200 p-2 rounded-full shadow-sm text-gray-700 hover:text-black z-20 pointer-events-auto"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            )}

                            {/* Desktop Single Image View with Zoom */}
                            <img
                                src={images[selectedImage]}
                                alt={product.name}
                                style={zoomStyle}
                                className="hidden md:block w-full h-auto transition-transform duration-200 ease-out z-0 pointer-events-none"
                            />

                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-2">
                                    <button className="bg-white p-2.5 rounded-full shadow-sm text-gray-600 hover:text-black border border-gray-100">
                                        <ZoomIn size={16} />
                                    </button>
                                </div>
                                <button className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm text-gray-800 text-[12px] font-bold flex items-center gap-1.5 border border-gray-200">
                                    <Search size={14} /> View Full Size
                                </button>
                            </div>

                            {/* Mobile Thumbnails */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex md:hidden gap-2 z-20 pointer-events-auto">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); scrollToImage(idx); }}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedImage === idx ? 'bg-[#cf7e28] w-4' : 'bg-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Video/Reel Button */}
                    {product.video && (
                        <button
                            onClick={() => navigate(`/reels/${product._id}`)}
                            className="w-full flex md:hidden items-center justify-center gap-2 bg-black text-white py-3.5 rounded-[16px] font-bold uppercase tracking-wider text-[12px] mt-[-10px] mb-4 shadow-md active:scale-[0.98] transition-transform"
                        >
                            <Play size={16} className="fill-white" /> Watch Product Video
                        </button>
                    )}

                    {/* CENTER COLUMN: Product Info */}
                    <div className="w-full lg:w-[32%] flex flex-col pt-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Star size={12} className="text-[#cf7e28] fill-current" />
                            <span className="text-[10px] font-bold text-[#cf7e28] uppercase tracking-wider">Bestseller</span>
                        </div>
                        <h1 className="text-3xl md:text-[32px] font-bold text-[#1c1c1c] mb-3 leading-tight tracking-tight font-serif">{product.name}</h1>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className={i < (product.rating || 0) ? "text-[#cf7e28] fill-current" : "text-gray-300"} />
                                ))}
                            </div>
                            <span className="text-[13px] font-bold text-[#1c1c1c]">{product.rating ? product.rating.toFixed(1) : 'No Ratings'}</span>
                            <span className="text-[13px] text-gray-500">({product.numReviews || 0} Reviews)</span>
                            {reviewEligibility.eligible && (
                                <>
                                    <div className="w-[1px] h-3 bg-gray-300"></div>
                                    <button onClick={() => setActiveTab('REVIEWS')} className="text-[13px] font-bold text-gray-800 hover:text-[#cf7e28]">Add Your Review</button>
                                </>
                            )}
                        </div>

                        <div className="flex items-end gap-3 mb-1">
                            <span className="text-3xl md:text-[36px] font-black text-[#1c1c1c] leading-none">₹{product.price * quantity}</span>
                            <span className="text-lg font-bold text-gray-400 line-through mb-1">₹{originalPrice * quantity}</span>
                            <span className="text-[11px] font-bold bg-[#fbf5f2] text-[#cf7e28] px-2 py-1 rounded mb-1.5">{discount}% OFF</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mb-8">Inclusive of all taxes</p>

                        {/* Features List */}
                        {product.features && product.features.length > 0 ? (
                            <div className="flex flex-col gap-4 mb-8 pb-8 border-b border-gray-100">
                                {product.features.map((feature, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-[#fbf9f6] flex items-center justify-center shrink-0 border border-gray-100">
                                            {idx % 3 === 0 ? <ShieldCheck size={16} className="text-gray-700" /> :
                                                idx % 3 === 1 ? <CheckCircle2 size={16} className="text-gray-700" /> :
                                                    <Star size={16} className="text-gray-700" />}
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-[#1c1c1c]">{feature.title}</h4>
                                            <p className="text-[12px] text-gray-500">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 mb-8 pb-8 border-b border-gray-100">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#fbf9f6] flex items-center justify-center shrink-0 border border-gray-100">
                                        <ShieldCheck size={16} className="text-gray-700" />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-bold text-[#1c1c1c]">Premium Plush Fabric</h4>
                                        <p className="text-[12px] text-gray-500">Ultra soft, hypoallergenic & safe</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#fbf9f6] flex items-center justify-center shrink-0 border border-gray-100">
                                        <CheckCircle2 size={16} className="text-gray-700" />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-bold text-[#1c1c1c]">Perfectly Huggable</h4>
                                        <p className="text-[12px] text-gray-500">Designed for maximum comfort</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#fbf9f6] flex items-center justify-center shrink-0 border border-gray-100">
                                        <Star size={16} className="text-gray-700" />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-bold text-[#1c1c1c]">Premium Finish</h4>
                                        <p className="text-[12px] text-gray-500">Durable stitching & vibrant colors</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-[13px] font-bold text-[#1c1c1c]">Size</h3>
                                    <button className="text-[12px] text-gray-600 font-bold underline flex items-center gap-1">
                                        Size Guide
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-12 h-10 rounded border text-[13px] font-bold transition-colors ${selectedSize === size
                                                ? 'bg-[#1c1c1c] text-white border-[#1c1c1c]'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-[13px] font-bold text-[#1c1c1c] mb-3">Quantity</h3>
                            <div className="inline-flex items-center border border-gray-200 rounded-md h-10 w-28 bg-white">
                                <button
                                    className="w-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Minus size={14} />
                                </button>
                                <div className="flex-1 text-center font-bold text-[13px] text-gray-800 border-x border-gray-200 py-1.5">{quantity}</div>
                                <button
                                    className="w-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-[#1c1c1c] hover:bg-black text-white font-bold py-3.5 rounded-lg transition-all flex justify-center items-center gap-2 text-[14px]"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 bg-[#d5a266] hover:bg-[#c18641] text-white font-bold py-3.5 rounded-lg transition-all flex justify-center items-center gap-2 text-[14px]"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Buy Now
                            </button>
                        </div>

                        <div className="flex justify-center items-center gap-8 text-[13px] font-bold text-gray-500">
                            <button
                                onClick={() => toggleWishlist(product)}
                                className={`flex items-center gap-2 hover:text-[#1c1c1c] transition-colors ${isInWishlist(product?._id || product?.id) ? 'text-[#ef4c7f]' : ''}`}
                            >
                                <Heart size={16} className={isInWishlist(product?._id || product?.id) ? 'fill-current' : ''} />
                                Add to Wishlist
                            </button>
                            <button className="flex items-center gap-2 hover:text-[#1c1c1c] transition-colors">
                                <Share2 size={16} /> Share
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Trust Badges */}
                    <div className="w-full lg:w-[23%] flex flex-col gap-6">
                        <div className="bg-[#fcfaf6] rounded-[16px] p-6 border border-[#f5eadb]/80 flex flex-col gap-6 h-full">
                            <div className="flex items-start gap-4 text-gray-700">
                                <RotateCcw size={22} className="text-[#cf7e28] shrink-0" />
                                <div>
                                    <div className="font-bold text-[13px] text-[#1c1c1c]">7 Days Easy Returns</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">Hassle free returns</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 text-gray-700">
                                <CreditCard size={22} className="text-[#cf7e28] shrink-0" />
                                <div>
                                    <div className="font-bold text-[13px] text-[#1c1c1c]">Cash on Delivery</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">Pay when you receive</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 text-gray-700">
                                <ShieldCheck size={22} className="text-[#cf7e28] shrink-0" />
                                <div>
                                    <div className="font-bold text-[13px] text-[#1c1c1c]">Secure Payment</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">100% secure transactions</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 text-gray-700">
                                <CheckCircle2 size={22} className="text-[#cf7e28] shrink-0" />
                                <div>
                                    <div className="font-bold text-[13px] text-[#1c1c1c]">1 Year Quality Warranty</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">Quality you can trust</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* TABS SECTION */}
                <div className="bg-[#faf9f8] rounded-[24px] p-6 md:p-10 mb-16">
                    <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
                        {['DESCRIPTION', 'SHIPPING & RETURNS', 'REVIEWS'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-[13px] font-bold tracking-wider whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#1c1c1c]' : 'text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                {tab === 'REVIEWS' ? `REVIEWS (${product.numReviews || 0})` : tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#d5a266]"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'DESCRIPTION' && (
                        <div className="max-w-4xl">
                            <h3 className="text-[20px] font-bold text-[#1c1c1c] mb-6">Product Description</h3>
                            <p className="text-[15px] text-gray-800 leading-loose mb-8 whitespace-pre-wrap">
                                {product.description || `Elevate your everyday look with our ${product.name}. Crafted from 100% premium cotton, it offers unbeatable comfort and a stylish design that stays fresh wash after wash.`}
                            </p>

                            {product.bulletPoints && product.bulletPoints.length > 0 ? (
                                <ul className="flex flex-col gap-4">
                                    {product.bulletPoints.map((point, idx) => (
                                        <li key={idx} className="flex items-center gap-4 text-[15px] font-medium text-gray-800">
                                            <div className="w-5 h-5 rounded-full bg-[#fbf5f2] flex items-center justify-center text-[#cf7e28] shrink-0"><CheckCircle2 size={12} /></div>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <ul className="flex flex-col gap-4">
                                    <li className="flex items-center gap-4 text-[15px] font-medium text-gray-800">
                                        <div className="w-5 h-5 rounded-full bg-[#fbf5f2] flex items-center justify-center text-[#cf7e28] shrink-0"><CheckCircle2 size={12} /></div>
                                        Premium quality material for superior comfort
                                    </li>
                                    <li className="flex items-center gap-4 text-[15px] font-medium text-gray-800">
                                        <div className="w-5 h-5 rounded-full bg-[#fbf5f2] flex items-center justify-center text-[#cf7e28] shrink-0"><CheckCircle2 size={12} /></div>
                                        Engineered for all-day wear
                                    </li>
                                </ul>
                            )}
                        </div>
                    )}
                    {activeTab === 'SHIPPING & RETURNS' && (
                        <div className="max-w-4xl">
                            <h3 className="text-[20px] font-bold text-[#1c1c1c] mb-6">Shipping & Returns</h3>
                            <div className="space-y-8">
                                <div>
                                    <h4 className="font-bold text-[16px] text-[#1c1c1c] mb-3">Shipping Information</h4>
                                    <p className="text-[15px] font-medium text-gray-800 leading-relaxed">
                                        Orders are processed within 1-2 business days. Standard shipping usually takes 3-5 business days for delivery within India. You will receive a tracking number once your order ships.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-[16px] text-[#1c1c1c] mb-3">Return Policy</h4>
                                    <p className="text-[15px] font-medium text-gray-800 leading-relaxed">
                                        We offer a 7-day hassle-free return and exchange policy from the date of delivery. Items must be unworn, unwashed, and have original tags attached.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'REVIEWS' && (
                        <div className="flex flex-col md:flex-row gap-10">
                            {/* Reviews List */}
                            <div className="w-full md:w-1/2">
                                <h3 className="text-[18px] font-bold text-[#1c1c1c] mb-6">Customer Reviews</h3>
                                {reviews.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this product!</p>
                                ) : (
                                    <div className="space-y-6">
                                        {reviews.map(review => (
                                            <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-bold text-[#1c1c1c] text-sm">{review.user?.name || 'Anonymous'}</div>
                                                        <div className="text-[11px] text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                    <div className="flex items-center gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} className={i < review.rating ? "text-[#cf7e28] fill-current" : "text-gray-300"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-[#1c1c1c] text-sm mb-1">{review.title}</h4>
                                                <p className="text-gray-600 text-[13px] leading-relaxed">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Write Review Form */}
                            <div className="w-full md:w-1/2">
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="text-[18px] font-bold text-[#1c1c1c] mb-6">Write a Review</h3>

                                    {reviewMessage && (
                                        <div className={`p-4 rounded-xl text-sm mb-6 ${reviewMessage.includes('Error') || reviewMessage.includes('only review') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {reviewMessage}
                                        </div>
                                    )}

                                    {localStorage.getItem('userToken') ? (
                                        reviewEligibility.eligible ? (
                                            <form onSubmit={submitReview} className="space-y-5">
                                                <div>
                                                    <label className="block text-[13px] font-bold text-[#1c1c1c] mb-2">Rating</label>
                                                    <div className="flex items-center gap-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                                                                className="focus:outline-none"
                                                            >
                                                                <Star size={24} className={i < reviewForm.rating ? "text-[#cf7e28] fill-current" : "text-gray-300"} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-[#1c1c1c] mb-2">Review Title</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={reviewForm.title}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                                        className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3 px-4 text-[14px] font-bold text-black focus:bg-white focus:border-[#cf7e28] outline-none transition-all"
                                                        placeholder="Summarize your experience"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-[#1c1c1c] mb-2">Review Details</label>
                                                    <textarea
                                                        required
                                                        rows="4"
                                                        value={reviewForm.comment}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                        className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3 px-4 text-[14px] font-medium text-black focus:bg-white focus:border-[#cf7e28] outline-none transition-all resize-none"
                                                        placeholder="What did you like or dislike?"
                                                    ></textarea>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="w-full bg-[#1c1c1c] hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all"
                                                >
                                                    Submit Review
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-gray-500 text-sm">{reviewEligibility.message || 'You cannot review this product at this time.'}</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-gray-500 text-sm mb-4">Please log in to write a review.</p>
                                            <button
                                                onClick={() => navigate('/login')}
                                                className="bg-[#cf7e28] hover:bg-[#b58145] text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
                                            >
                                                Login
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}


                </div>

                {/* FREQUENTLY BOUGHT TOGETHER */}
                {relatedProducts.length > 0 && (
                    <div className="mb-20">
                        <h2 className="text-[18px] font-bold text-[#1c1c1c] mb-6">Frequently Bought Together</h2>

                        <div className="flex flex-col xl:flex-row gap-6">
                            {/* Product List */}
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {relatedProducts.map(relProduct => (
                                    <div key={relProduct._id} className="w-full bg-white rounded-[20px] p-3 border border-gray-100 flex flex-col group shadow-sm hover:shadow-md transition-shadow h-full">
                                        <Link to={`/product/${relProduct.slug || relProduct._id}`} className="bg-[#fbf9f6] rounded-[16px] aspect-[3/4] flex items-center justify-center overflow-hidden mb-4">
                                            <img
                                                src={relProduct.images && relProduct.images[0] ? encodeURI(relProduct.images[0]) : 'https://via.placeholder.com/300'}
                                                alt={relProduct.name}
                                                className="w-full h-full object-cover object-top mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy" decoding="async" />
                                        </Link>
                                        <div className="flex flex-col flex-1 px-1">
                                            <Link to={`/product/${relProduct.slug || relProduct._id}`}>
                                                <h3 className="text-[13px] font-bold text-[#1c1c1c] leading-tight mb-2 line-clamp-2">{relProduct.name}</h3>
                                            </Link>
                                            <div className="flex items-center gap-1 mt-auto flex-wrap">
                                                <span className="text-[14px] font-black text-[#1c1c1c]">₹{relProduct.price}</span>
                                                <span className="text-[10px] font-bold text-gray-400 line-through">₹{relProduct.price + 500}</span>
                                                <span className="text-[9px] font-bold text-[#cf7e28] ml-auto">40% OFF</span>
                                            </div>

                                            <div className="relative mt-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        addToCart({ ...relProduct, selectedSize: relProduct.sizes?.[0] || 'Medium (20-40 cm)' }, 1);
                                                    }}
                                                    className="w-full py-1.5 rounded-full bg-[#fbf5f2] hover:bg-[#cf7e28] hover:text-white text-[#c18641] flex items-center justify-center transition-colors border border-[#f5eadb] text-[11px] font-bold gap-1"
                                                >
                                                    <Plus size={12} /> Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Shop The Look Banner */}
                            <div className="w-full xl:w-[25%] bg-[#1c1c1c] rounded-[24px] p-6 lg:p-8 flex flex-col justify-center relative overflow-hidden text-white min-h-[200px]">
                                <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
                                <div className="relative z-10 w-full">
                                    <div className="text-[10px] text-[#cf7e28] font-bold mb-3 flex items-center gap-1 uppercase tracking-widest">
                                        View All <ChevronRight size={12} />
                                    </div>
                                    <h3 className="text-2xl lg:text-3xl font-serif font-bold leading-tight mb-3 lg:mb-4 text-white">
                                        Endless Cuddles.<br />Everyday Joy.
                                    </h3>
                                    <p className="text-[11px] lg:text-[12px] text-gray-400 mb-5 lg:mb-6">Designed for perfect hugs.</p>
                                    <Link to="/shop" className="inline-flex bg-[#cf7e28] text-white text-[11px] lg:text-[12px] font-bold px-5 lg:px-6 py-2.5 lg:py-3 rounded-lg hover:bg-[#b58145] transition-colors whitespace-nowrap">
                                        Shop The Look →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Video Reel Card */}
            {product.video && (
                <button
                    onClick={() => navigate(`/reels/${product._id}`)}
                    className="fixed bottom-24 sm:bottom-20 md:bottom-10 right-4 md:right-10 w-24 sm:w-28 md:w-32 aspect-[9/16] rounded-xl overflow-hidden border-2 border-[#cf7e28]/50 shadow-2xl group z-[90] hover:scale-105 transition-transform bg-black"
                >
                    <video
                        src={product.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors">
                        <div className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Play size={16} className="text-white fill-white ml-0.5 md:hidden" />
                            <Play size={16} className="text-white fill-white ml-0.5 hidden md:block" />
                        </div>
                    </div>
                </button>
            )}
        </div>
    );
};

export default ProductDetails;
