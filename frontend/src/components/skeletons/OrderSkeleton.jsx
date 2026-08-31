import React from 'react';

const OrderSkeleton = () => {
    return (
        <div className="bg-white border border-[#f5eadb] rounded-2xl overflow-hidden shadow-sm animate-pulse mb-6">
            <div className="p-6 border-b border-[#f5eadb] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="w-16 h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                        <div className="w-16 h-3 bg-gray-200 rounded mb-2 ml-auto"></div>
                        <div className="w-20 h-5 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default OrderSkeleton;
