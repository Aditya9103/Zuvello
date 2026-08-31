import React from 'react';
import { Heart, ArrowRight, Play, Instagram, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../api';

const InstagramFeed = () => {

  const { data: reels = [], isLoading } = useQuery({
    queryKey: ['instagramReels'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/instagram`);
      if (Array.isArray(data) && data.length > 0) {
        return data.map(reel => ({
          id: reel._id,
          image: reel.image,
          title: reel.title,
          link: reel.link
        }));
      }
      return [];
    },
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });

  if (isLoading) return <div className="py-12 text-center text-gray-500">Loading Instagram Feed...</div>;
  if (!isLoading && reels.length === 0) return null; // Don't show section if no reels exist

  return (
    <section className="py-6 md:py-12 bg-white font-sans border-b border-gray-50 relative">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 relative">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-[24px] font-extrabold text-[#1c1c1c] tracking-tight">
              Instagram Reels
            </h2>
            <Heart size={20} className="text-[#ef4c7f] fill-current" />
          </div>
          
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[13px] font-bold text-[#b58145] hover:text-[#9d6d36] transition-colors"
          >
            View All <ArrowRight size={14} strokeWidth={2.5} />
          </a>
        </div>

        {/* Instagram Scroll Area */}
        <div 
            className="flex overflow-x-auto gap-2 md:gap-4 pb-4 -mx-2 px-2 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reels.map((post) => (
            <InstaCard key={post.id} post={post} />
          ))}
        </div>

      </div>
    </section>
  );
};

// Separated into a sub-component to handle individual playback state on hover
const InstaCard = ({ post }) => {
  return (
    <a 
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="w-[23%] text-left md:w-[calc(100%/5-16px)] lg:w-[calc(100%/6-16px)] flex-none snap-start flex flex-col gap-2 group transform hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative w-full aspect-[9/16] rounded-[16px] md:rounded-[20px] overflow-hidden shadow-sm border border-gray-100">
        {/* Background Image (Thumbnail) */}
        <img
          src={post.image}
          alt="Instagram Post"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
         loading="lazy" decoding="async" />

        {/* Top Left Icon (Insta Reels icon) */}
        <div className="absolute top-2 left-2 z-20 w-4 h-4 md:w-5 md:h-5 rounded-full border border-white/50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
          <Instagram size={10} className="text-white md:w-3 md:h-3" />
        </div>

        {/* Top Right Icon (Heart) */}
        <div className="absolute top-2 right-2 z-20 w-4 h-4 md:w-5 md:h-5 rounded-full border border-white/50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
          <Heart size={10} className="text-white md:w-3 md:h-3" />
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-white/95 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <Play size={14} className="text-[#1c1c1c] ml-0.5 md:w-5 md:h-5 md:ml-1" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="px-0.5">
        <h4 className="text-[9px] sm:text-[11px] md:text-[13px] font-bold text-[#1c1c1c] leading-snug whitespace-pre-line">
          {post.title}
        </h4>
      </div>
    </a>
  );
};

export default InstagramFeed;
