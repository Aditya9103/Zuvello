import React from 'react';

const CategorySkeleton = () => {
    return (
        <li className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-white animate-pulse">
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </li>
    );
};

export default CategorySkeleton;
