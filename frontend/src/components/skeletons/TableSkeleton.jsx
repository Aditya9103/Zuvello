import React from 'react';

const TableSkeleton = ({ columns = 6, rows = 8 }) => {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            {[...Array(columns)].map((_, i) => (
                                <th key={i} className="px-6 py-4">
                                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {[...Array(rows)].map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {[...Array(columns)].map((_, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4">
                                        <div className="h-4 bg-white/10 rounded w-full"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination Skeleton */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
                <div className="w-32 h-4 bg-white/10 rounded"></div>
                <div className="flex gap-2">
                    <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                    <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                    <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default TableSkeleton;
