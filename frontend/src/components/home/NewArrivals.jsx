import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, Star, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../api';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import ProductSkeleton from '../skeletons/ProductSkeleton';

// Fallback dummy products
const dummyProducts = [
  {
    _id: '1',
    name: 'Comfort Bunny Plushie',
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    price: 899,
    originalPrice: 999,
    isNew: true,
  },
  {
    _id: '2',
    name: 'Unicorn Dream Soft Toy',
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    price: 999,
    originalPrice: 1299,
    isNew: true,
  }
];

const NewArrivals = () => {
  const scrollRef = React.useRef(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const { data: products = [], isLoading } = useQuery({
      queryKey: ['newArrivals'],
      queryFn: async () => {
          const { data } = await axios.get(`${API_BASE_URL}/products?isNewArrival=true&limit=10`);
          if (data.length > 0) {
              return data.map(p => ({
                  ...p,
                  originalPrice: p.price === 699 ? 1299 : p.price === 698 ? 1299 : p.price + Math.floor(p.price * 0.86),
                  rating: 4.8,
                  image: p.images && p.images[0] ? encodeURI(p.images[0]) : dummyProducts[0].image,
                  isNew: true
              }));
          }
          return dummyProducts;
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      meta: {
          errorMessage: "Failed to fetch new arrivals"
      },
  });

  const displayProducts = products.length > 0 ? products : dummyProducts;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -scrollRef.current.offsetWidth : scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-6 md:py-12 bg-white font-sans border-b border-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 relative">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-[26px] font-extrabold text-[#1c1c1c] tracking-tight">
              New Arrivals
            </h2>
            <Heart size={20} className="text-[#c69b6a] fill-current" />
          </div>
          
          <Link 
            to="/new-arrivals" 
            className="flex items-center gap-1.5 text-[13px] font-bold text-[#b58145] hover:text-[#9d6d36] transition-colors"
          >
            Explore All <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          
          {/* Left Arrow (Desktop Only) */}
          <button 
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 hover:bg-white rounded-full items-center justify-center text-[#483d36] shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronLeft size={20} strokeWidth={2.5} className="w-5 h-5" />
          </button>

          {/* Products Container: 2-row sliding Grid on Mobile, Flex on Desktop */}
          <div 
            ref={scrollRef}
            className="grid grid-rows-2 grid-flow-col auto-cols-[calc(50%-8px)] overflow-x-auto gap-4 pb-8 pt-4 md:px-4 md:-mx-4 md:flex md:gap-5 md:scrollbar-hide md:snap-x md:snap-mandatory snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isLoading ? (
              [...Array(5)].map((_, idx) => (
                <div key={idx} className="w-full md:w-[calc(100%/4-16px)] lg:w-[calc(100%/5-16px)] md:flex-none snap-start h-full relative">
                  <ProductSkeleton />
                </div>
              ))
            ) : displayProducts.map((product, index) => {
              const originalPrice = product.originalPrice || product.price === 699 ? 1299 : product.price === 698 ? 1299 : product.price + Math.floor(product.price * 0.86);
              const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

              return (
                <div 
                  key={product._id} 
                  className="w-full md:w-[calc(100%/4-16px)] lg:w-[calc(100%/5-16px)] md:flex-none snap-start bg-white rounded-xl md:rounded-[16px] overflow-hidden border border-gray-100 flex flex-col group transition-shadow hover:shadow-md h-full relative"
                >
                <div className="relative aspect-square md:h-44 bg-[#fbf9f6] flex items-center justify-center overflow-hidden">
                  {/* New Badge */}
                  {product.isNew && (
                    <div className="absolute top-1 left-1 md:top-2 md:left-2 bg-[#cf7e28] text-white text-[7px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-md z-10">
                      New
                    </div>
                  )}
                  <button 
                      onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product);
                      }}
                      className="absolute top-1.5 right-1.5 md:top-3 md:right-3 text-gray-400 hover:text-red-500 z-10 p-1 md:p-1.5 bg-white/50 rounded-full backdrop-blur-sm"
                  >
                      <Heart size={12} className={`md:w-4 md:h-4 ${isInWishlist(product._id || product.id) ? 'fill-[#ef4c7f] text-[#ef4c7f]' : ''}`} />
                  </button>
                  <Link to={`/product/${product.slug || product._id}`} className="w-full h-full relative block overflow-hidden rounded-t-xl md:rounded-t-[16px]">
                      <img
                          src={(product.image && product.image !== 'undefined' && product.image !== 'null') ? product.image : ((product.images && product.images[0] && product.images[0] !== 'undefined' && product.images[0] !== 'null') ? encodeURI(product.images[0]) : 'https://via.placeholder.com/300')}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       loading="lazy" decoding="async" />
                  </Link>
                </div>
                
                <div className="p-2 md:p-4 flex flex-col gap-1 md:gap-2 flex-1 bg-white">
                    <Link to={`/product/${product.slug || product._id}`}>
                        <h3 className="font-bold text-[#1c1c1c] text-[10px] md:text-[15px] leading-tight line-clamp-1">{product.name}</h3>
                    </Link>
                      
                      <div className="flex items-center gap-0.5 md:gap-1">
                          <Star size={8} className="text-[#cf7e28] fill-current md:w-3 md:h-3" />
                          <Star size={8} className="text-[#cf7e28] fill-current md:w-3 md:h-3" />
                          <Star size={8} className="text-[#cf7e28] fill-current md:w-3 md:h-3" />
                          <Star size={8} className="text-[#cf7e28] fill-current md:w-3 md:h-3" />
                          <Star size={8} className="text-[#cf7e28] fill-current md:w-3 md:h-3" />
                          <span className="text-[9px] md:text-[11px] text-gray-400 ml-0.5 md:ml-1">({product.rating || '4.8'})</span>
                      </div>
                      
                      <div className="flex flex-col mt-auto pt-1 md:pt-2 gap-1.5 md:gap-3">
                          <div className="flex items-baseline flex-wrap gap-x-1 md:gap-2">
                              <span className="text-xs md:text-lg font-black text-[#1c1c1c]">₹{product.price}</span>
                              <span className="text-[9px] md:text-xs font-bold text-gray-400 line-through">₹{originalPrice}</span>
                              <span className="text-[9px] md:text-xs font-bold text-[#cf7e28] hidden sm:inline ml-auto">{discount}% OFF</span>
                          </div>
                          <button 
                              onClick={(e) => {
                                  e.preventDefault();
                                  addToCart({ ...product, selectedSize: product.sizes?.[0] || 'Medium (20-40 cm)' }, 1);
                              }}
                              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-1.5 md:py-2 rounded-md md:rounded-lg text-[9px] md:text-xs transition-colors"
                          >
                              Add to Cart
                          </button>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow (Desktop Only) */}
          <button 
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 hover:bg-white rounded-full items-center justify-center text-[#483d36] shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronRight size={20} strokeWidth={2.5} className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default NewArrivals;
