import React from 'react';

const BlogSkeleton = () => {
    return (
        <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 min-h-screen animate-pulse">
            <div className="w-32 h-10 bg-gray-200 rounded-full mb-8"></div>
            <div className="w-3/4 h-16 bg-gray-200 rounded-lg mb-10"></div>
            <div className="flex gap-8 mb-12 pb-10 border-b border-gray-200">
                <div className="w-32 h-6 bg-gray-200 rounded"></div>
                <div className="w-24 h-6 bg-gray-200 rounded"></div>
                <div className="w-40 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="w-full h-[400px] bg-gray-200 rounded-3xl mb-16"></div>
            <div className="w-full h-24 bg-gray-200 rounded-xl mb-12"></div>
            <div className="space-y-6">
                <div className="w-full h-6 bg-gray-200 rounded"></div>
                <div className="w-full h-6 bg-gray-200 rounded"></div>
                <div className="w-5/6 h-6 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
                <div className="w-4/5 h-6 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
};

export default BlogSkeleton;
