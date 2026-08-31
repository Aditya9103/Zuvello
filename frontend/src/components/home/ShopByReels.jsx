import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../api';

const ShopByReels = () => {
    const navigate = useNavigate();

    const { data: reels = [], isLoading } = useQuery({
        queryKey: ['reels'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE_URL}/products`);
            const videoProducts = data.filter(p => p.video);
            return videoProducts.slice(0, 6);
        },
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    });

    if (isLoading || reels.length === 0) return null;

    return (
        <section className="py-12 bg-white relative overflow-hidden border-b border-gray-50">
            <div className="container max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 relative z-10">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-[#1c1c1c] uppercase tracking-tighter">
                            Shop By <span className="text-[#cf7e28]">Reels</span>
                        </h2>
                        <p className="text-gray-500 font-medium mt-2">See it in action before you buy</p>
                    </div>
                    <Link to={`/reels/${reels[0]?._id}`} className="hidden md:flex text-[#b58145] hover:text-[#9d6d36] font-bold items-center gap-2 transition-colors">
                        View All <Play size={16} className="fill-current" />
                    </Link>
                </div>

                <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory no-scrollbar">
                    {reels.map((product) => (
                        <button
                            key={product._id}
                            onClick={() => navigate(`/reels/${product._id}`)}
                            className="relative flex-none w-[calc(50%-8px)] sm:w-[200px] md:w-[280px] aspect-[9/16] rounded-[16px] md:rounded-[24px] overflow-hidden snap-center group border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <video
                                src={product.video}
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity bg-zinc-900"
                                muted
                                playsInline
                                loop
                                onMouseOver={(e) => e.target.play()}
                                onMouseOut={(e) => e.target.pause()}
                            />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-2.5 md:p-4">
                                <div className="bg-[#4d3220]/80 backdrop-blur-md border border-white/20 rounded-[12px] md:rounded-2xl p-1.5 md:p-2.5 flex items-center gap-2 md:gap-3">
                                    <img 
                                        src={product.images?.[0] || 'https://via.placeholder.com/150'} 
                                        alt={product.name}
                                        className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl object-cover bg-white/10 flex-shrink-0"
                                     loading="lazy" decoding="async" />
                                    <div className="flex-1 overflow-hidden text-left">
                                        <h3 className="text-white font-bold text-[10px] md:text-xs truncate mb-0.5 md:mb-1">{product.name}</h3>
                                        <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
                                            <span className="text-white font-black text-[11px] md:text-sm">₹{product.price}</span>
                                            <span className="text-white/60 text-[9px] md:text-[10px] line-through">
                                                ₹{product.price === 699 ? 1299 : product.price === 698 ? 1299 : product.price + Math.floor(product.price * 0.86)}
                                            </span>
                                            <span className="hidden md:inline bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded ml-auto">
                                                -{Math.round((((product.price === 699 ? 1299 : product.price === 698 ? 1299 : product.price + Math.floor(product.price * 0.86)) - product.price) / (product.price === 699 ? 1299 : product.price === 698 ? 1299 : product.price + Math.floor(product.price * 0.86))) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full py-1.5 md:py-2.5 bg-white text-black font-bold text-[11px] md:text-sm rounded-lg md:rounded-xl mt-2 md:mt-3 text-center transition-transform group-hover:scale-[1.02]">
                                    Shop now
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ShopByReels;
