import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Heart, Star, ChevronLeft, ChevronRight, CheckCircle, Shield, Truck, CreditCard } from 'lucide-react';
import { API_BASE_URL } from '../api';
import headerImage from '../assets/new_arrivals_banner.png';
import { useCart } from '../contexts/CartContext';
import SEO from '../components/SEO';

import { useQuery } from '@tanstack/react-query';
import ProductSkeleton from '../components/skeletons/ProductSkeleton';

const NewArrivalsProductCard = ({ product }) => {
    const { _id, slug, name, price, images, rating = 4.8 } = product;
    const { addToCart } = useCart();
    const originalPrice = price === 699 ? 1299 : price === 698 ? 1299 : price + Math.floor(price * 0.86);

    return (
        <div className="bg-white rounded-[16px] overflow-hidden border border-gray-100 flex flex-col group transition-shadow hover:shadow-md h-full relative">
            <div className="absolute top-3 left-3 bg-[#cf7e28] text-white text-[10px] font-bold px-3 py-1 rounded-md z-10 shadow-sm tracking-wide">New</div>
            <div className="relative aspect-square bg-gray-100 border-b border-gray-100 flex items-center justify-center overflow-hidden">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 z-10 p-1.5 bg-white/50 rounded-full backdrop-blur-sm">
                    <Heart size={16} />
                </button>
                <Link to={`/product/${slug || _id}`} className="w-full h-full relative block overflow-hidden rounded-t-[16px]">
                    <img
                        src={images && images[0] ? encodeURI(images[0]) : 'https://via.placeholder.com/300'}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy" decoding="async" />
                </Link>
            </div>

            <div className="p-4 flex flex-col gap-2 flex-1 bg-white">
                <Link to={`/product/${slug || _id}`}>
                    <h3 className="font-bold text-[#1c1c1c] text-sm md:text-[15px] leading-tight line-clamp-1">{name}</h3>
                </Link>

                <div className="flex items-center gap-1">
                    <Star size={12} className="text-[#cf7e28] fill-current" />
                    <Star size={12} className="text-[#cf7e28] fill-current" />
                    <Star size={12} className="text-[#cf7e28] fill-current" />
                    <Star size={12} className="text-[#cf7e28] fill-current" />
                    <Star size={12} className="text-[#cf7e28] fill-current" />
                    <span className="text-[11px] text-gray-400 ml-1">({rating})</span>
                </div>

                <div className="flex flex-col mt-auto pt-2 gap-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-[#1c1c1c]">₹{price}</span>
                        <span className="text-xs font-bold text-gray-400 line-through">₹{originalPrice}</span>
                    </div>
                    <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

const NewArrivalsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['new-arrivals'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE_URL}/products?isNewArrival=true`);
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": currentProducts.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://www.zuvello.in/product/${product.slug || product._id}`
        }))
    };

    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Zuvello New Arrivals",
        "description": "Check out our latest collection of new plushies.",
        "url": "https://www.zuvello.in/new-arrivals"
    };

    return (
        <div className="bg-[#fdfdfc] min-h-screen font-sans">
            <SEO
                title="New Arrivals"
                description="Check out our latest collection of new plushies."
                schema={[collectionSchema, itemListSchema]}
            />
            {/* Premium Full-Width Header */}
            <div className="bg-[#fcfaf6] w-full py-4 relative overflow-hidden border-b border-[#f5eadb]">
                <div className="max-w-[1200px] mx-auto px-12 md:px-16 flex flex-row items-center justify-between relative z-10">

                    {/* Left Arrow Button */}
                    <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 bg-white rounded-full items-center justify-center text-[#cf7e28] shadow-sm cursor-pointer z-20">
                        <ChevronLeft size={16} />
                    </div>

                    <div className="flex-1 relative z-10 flex flex-col justify-center">
                        <div className="text-[11px] text-gray-500 mb-2 flex items-center gap-1 font-medium">
                            <Link to="/" className="hover:text-[#cf7e28]">Home</Link>
                            <ChevronRight size={10} />
                            <span className="text-[#1c1c1c] font-bold">New Arrivals</span>
                        </div>

                        <div className="relative">
                            <div className="absolute -top-3 left-1/2 text-[#cf7e28] opacity-50 text-sm">✦</div>
                            <h1 className="text-3xl md:text-4xl font-bold text-[#1c1c1c] font-serif mb-1 leading-tight tracking-tight">New Arrivals</h1>
                            <p className="text-gray-600 text-[13px] leading-relaxed font-medium">Check out our latest collection of soft toys.</p>
                        </div>
                    </div>

                    <div className="w-[150px] md:w-[250px] h-[120px] md:h-[150px] relative flex justify-end items-center">
                        <img
                            src={headerImage}
                            alt="New Arrivals"
                            className="w-full h-full object-cover mix-blend-multiply"
                            style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)', maskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)' }}
                        />
                    </div>

                    {/* Right Arrow Button */}
                    <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 bg-white rounded-full items-center justify-center text-[#cf7e28] shadow-sm cursor-pointer z-20">
                        <ChevronRight size={16} />
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 mb-12">
                    {isLoading ? (
                        [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
                    ) : (
                        currentProducts.map(product => (
                            <NewArrivalsProductCard key={product._id} product={product} />
                        ))
                    )}
                </div>

                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mb-16">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center font-bold text-xs shadow-sm disabled:opacity-50"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${currentPage === i + 1 ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 rounded-full bg-white border border-gray-200 text-black hover:bg-[#fcfaf7] flex items-center justify-center shadow-sm disabled:opacity-50"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 py-10 px-12 mt-16 bg-[#fff9f2] rounded-[32px] mb-8">
                    <div className="flex items-center gap-4">
                        <Shield className="w-10 h-10 text-[#cf7e28]" strokeWidth={1.5} />
                        <div>
                            <h4 className="font-bold text-[15px] text-[#1c1c1c] mb-0.5">Premium Quality</h4>
                            <p className="text-[12px] text-gray-500 font-medium">Super Soft & Safe</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <CheckCircle className="w-10 h-10 text-[#cf7e28]" strokeWidth={1.5} />
                        <div>
                            <h4 className="font-bold text-[15px] text-[#1c1c1c] mb-0.5">Kid Friendly</h4>
                            <p className="text-[12px] text-gray-500 font-medium">Non-Toxic Materials</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Truck className="w-10 h-10 text-[#cf7e28]" strokeWidth={1.5} />
                        <div>
                            <h4 className="font-bold text-[15px] text-[#1c1c1c] mb-0.5">Easy Returns</h4>
                            <p className="text-[12px] text-gray-500 font-medium">7 Days Return Policy</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <CreditCard className="w-10 h-10 text-[#cf7e28]" strokeWidth={1.5} />
                        <div>
                            <h4 className="font-bold text-[15px] text-[#1c1c1c] mb-0.5">Secure Payment</h4>
                            <p className="text-[12px] text-gray-500 font-medium">100% Safe Checkout</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewArrivalsPage;
