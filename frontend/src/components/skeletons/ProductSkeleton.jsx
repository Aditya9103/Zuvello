import React from 'react';

const ProductSkeleton = () => {
    return (
        <div className="flex flex-col rounded-[24px] overflow-hidden border border-gray-100 bg-white transition-all shadow-sm animate-pulse h-full">
            {/* Image Skeleton */}
            <div className="relative aspect-[4/5] bg-gray-200">
                {/* Wishlist Button Skeleton */}
                <div className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>

            {/* Details Skeleton */}
            <div className="p-5 flex flex-col gap-2 flex-1 bg-white">
                {/* Title Skeleton */}
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>

                {/* Rating Skeleton */}
                <div className="flex items-center gap-1 mt-0.5 mb-1">
                    <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col mt-auto pt-2 gap-4">
                    {/* Price Skeleton */}
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-5 bg-gray-200 rounded"></div>
                        <div className="w-10 h-3 bg-gray-200 rounded"></div>
                        <div className="w-12 h-3 bg-gray-300 rounded ml-auto"></div>
                    </div>

                    {/* Add to Cart Button Skeleton */}
                    <div className="w-full h-11 bg-gray-200 rounded-[12px]"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductSkeleton;
