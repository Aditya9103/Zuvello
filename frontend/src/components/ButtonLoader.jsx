import React from 'react';

const ButtonLoader = ({ text = 'Loading' }) => {
    return (
        <div className="flex items-center justify-center gap-2">
            <span className="text-[15px] font-bold">{text}</span>
            <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-[bounce_0.8s_infinite]" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-[bounce_0.8s_infinite]" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    );
};

export default ButtonLoader;
