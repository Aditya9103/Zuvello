import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

const WishlistPage = () => {
    const { wishlistItems, clearWishlist } = useWishlist();

    return (
    <div className="bg-white min-h-screen font-sans pb-20">
      <SEO title="Wishlist" noindex={true} />
            <div className="w-full h-1 bg-[#f5eadb]"></div>
            
            <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-8 md:py-12">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <Heart size={28} className="text-[#cf7e28] fill-current" />
                        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1c1c1c] tracking-tight">
                            My Wishlist
                            <span className="text-gray-400 text-lg ml-3 font-medium">
                                ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
                            </span>
                        </h1>
                    </div>
                    {wishlistItems.length > 0 && (
                        <button 
                            onClick={clearWishlist}
                            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                            Clear All
                        </button>
                    )}
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-[#fbf9f6] rounded-[24px] border border-gray-100 mt-8">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <Heart size={40} className="text-gray-300" />
                        </div>
                        <h2 className="text-xl font-bold text-[#1c1c1c] mb-3">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md text-center text-sm">
                            Save items you love in your wishlist. Review them anytime and easily move them to your cart.
                        </p>
                        <Link 
                            to="/shop"
                            className="bg-[#cf7e28] hover:bg-[#b56e22] text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-colors shadow-sm hover:shadow-md"
                        >
                            <ShoppingBag size={18} />
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {wishlistItems.map((product) => (
                            <ProductCard key={product._id} product={product} isWishlistPage={true} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
