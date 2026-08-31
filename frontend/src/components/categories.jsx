import React from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, Grid2X2, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import OptimizedImage from "./OptimizedImage";
import { API_BASE_URL } from "../api";

const Categories = () => {
  const scrollContainerRef = React.useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const collections = [...categories].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB - dateA;
  });

  const getCategoryLink = (item) => {
    if (item.name === "More") return item.link;
    // Override if link is missing or looks like an invalid /shop/category route
    if (!item.link || item.link.startsWith('/shop/')) {
      return `/shop?category=${encodeURIComponent(item.name)}`;
    }
    return item.link;
  };

  return (
    <section className="py-6 md:py-12 bg-white font-sans border-b border-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="text-xl md:text-[28px] font-bold text-[#1c1c1c] tracking-tight">
              Shop by Collection
            </h2>
            <Heart size={16} className="text-[#c69b6a] fill-current md:w-5 md:h-5" />
          </div>

          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-1.5 text-[13px] font-bold text-[#b58145] hover:text-[#9d6d36] transition-colors"
          >
            View All Collections <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Collections Wrapper */}
        <div className="relative group w-full max-w-6xl mx-auto">
          {/* Left Arrow */}
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 bg-white/95 shadow-md border border-gray-100 p-2 rounded-full hidden sm:group-hover:flex items-center justify-center text-gray-700 hover:text-[#b58145] hover:scale-110 transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right Arrow */}
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 bg-white/95 shadow-md border border-gray-100 p-2 rounded-full hidden sm:group-hover:flex items-center justify-center text-gray-700 hover:text-[#b58145] hover:scale-110 transition-all"
          >
            <ChevronRight size={20} />
          </button>

          {/* Collections Row - Single line with horizontal scroll */}
          <div ref={scrollContainerRef} className="flex overflow-x-auto gap-4 sm:gap-6 md:gap-8 lg:gap-8 w-full hide-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth pr-[10px] md:pr-2">
            {isLoading ? (
              [...Array(7)].map((_, idx) => (
                <div key={idx} className="shrink-0 w-[90px] sm:w-[110px] md:w-[130px] lg:w-[calc((100%-192px)/7)] flex flex-col items-center">
                  <div className="w-full aspect-square rounded-full bg-gray-200 animate-pulse border border-gray-100"></div>
                  <div className="w-16 h-3 sm:w-20 sm:h-4 bg-gray-200 animate-pulse rounded mt-2.5 md:mt-4"></div>
                </div>
              ))
            ) : collections.map((item, index) => (
              <Link
                key={index}
                to={getCategoryLink(item)}
                className="group flex flex-col items-center justify-start transition-transform duration-300 transform hover:-translate-y-1 shrink-0 w-[90px] sm:w-[110px] md:w-[130px] lg:w-[calc((100%-192px)/7)]"
              >
                {/* 3D Pod / Circular Container */}
                <div
                  className="w-full aspect-square rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:shadow-lg shadow-sm"
                  style={{
                    background: "radial-gradient(circle at center, #ffffff 0%, #fcf9f5 100%)",
                    border: "1px solid #f5ebe1"
                  }}
                >
                  <OptimizedImage
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* Category Name */}
                <h3 className="text-[11px] sm:text-[13px] md:text-[15px] font-bold text-[#2a2a2a] text-center mt-2.5 md:mt-4 tracking-tight group-hover:text-[#b58145] transition-colors leading-tight whitespace-nowrap">
                  {item.name}
                </h3>
              </Link>
            ))}

            {/* "More" Item - Inline with Categories */}
            <Link
              to="/shop"
              className="group flex flex-col items-center justify-start transition-transform duration-300 transform hover:-translate-y-1 shrink-0 w-[90px] sm:w-[110px] md:w-[130px] lg:w-[calc((100%-192px)/7)] cursor-pointer"
            >
              <div
                className="w-full aspect-square rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:shadow-lg shadow-sm"
                style={{
                  background: "radial-gradient(circle at center, #ffffff 0%, #fcf9f5 100%)",
                  border: "1px solid #f5ebe1"
                }}
              >
                <Grid2X2 size={24} className="text-[#b58145] group-hover:scale-110 transition-transform sm:w-8 sm:h-8" strokeWidth={2} />
              </div>
              <h3 className="text-[11px] sm:text-[13px] md:text-[15px] font-bold text-[#2a2a2a] text-center mt-2.5 md:mt-4 tracking-tight group-hover:text-[#b58145] transition-colors leading-tight whitespace-nowrap">
                More
              </h3>
            </Link>

          </div>
        </div>

        {/* Mobile View All Button */}
        <div className="mt-4 flex justify-center sm:hidden">
          <Link
            to="/shop"
            className="flex items-center gap-1.5 text-[13px] font-bold text-[#b58145]"
          >
            View All Collections <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Categories;
