import { ShoppingCart, Eye, Zap, Check, Heart, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import OptimizedImage from './OptimizedImage';

const ProductCard = ({ product, isWishlistPage = false }) => {
    const { name, price, description, images, category } = product;
    const { addToCart } = useCart();
    const { toggleWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart({ ...product, selectedSize: product.sizes?.[0] || 'Medium (20-40 cm)' }, 1);
    };

    const handleOrderNow = (e) => {
        e.stopPropagation();
        addToCart({ ...product, selectedSize: product.sizes?.[0] || 'Medium (20-40 cm)' }, 1);
        if (!localStorage.getItem('userToken')) {
            navigate('/login?redirect=/checkout/address', { state: { from: '/checkout/address' } });
            return;
        }
        navigate('/checkout/address');
    };

    const handleCardClick = () => {
        navigate(`/product/${product.slug || product._id}`);
    };

    return (
        <div
            className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-100 border-b border-gray-100">
                <OptimizedImage
                    src={images && images[0] ? encodeURI(images[0]) : 'https://via.placeholder.com/300'}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {isWishlistPage ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            removeFromWishlist(product._id || product.id);
                        }}
                        className="absolute top-2 right-2 z-10 p-1.5 bg-red-500 hover:bg-red-600 rounded-full shadow-sm transition-colors text-white"
                        title="Remove from wishlist"
                    >
                        <Trash2 size={16} />
                    </button>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleWishlist(product);
                        }}
                        className="absolute top-2 right-2 z-10 p-1.5 bg-white/70 hover:bg-white rounded-full backdrop-blur-sm shadow-sm transition-colors"
                    >
                        <Heart size={16} className={`transition-colors ${isInWishlist(product._id || product.id) ? 'fill-[#ef4c7f] text-[#ef4c7f]' : 'text-gray-400 hover:text-[#ef4c7f]'}`} />
                    </button>
                )}

                {/* Overlay actions (visible on group hover) */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                    <button
                        className="bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-[#cf7e28] hover:text-white transition-colors pointer-events-auto"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/cart'); // Or product detail
                        }}
                        title="View Details"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    <button
                        className={`p-2 rounded-full shadow-lg transition-colors pointer-events-auto ${isAdded ? 'bg-green-500 text-white' : 'bg-white text-gray-800 hover:bg-[#cf7e28] hover:text-white'}`}
                        onClick={handleAddToCart}
                        title="Add to Cart"
                    >
                        {isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="mb-2">
                    <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-sm">
                        {category || 'Sweets'}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {name}
                </h3>

                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                    {description}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Price</span>
                        <span className="text-xl font-bold text-gray-900">₹{price}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleAddToCart}
                            className={`text-sm font-semibold py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 active:scale-95 ${isAdded
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                }`}
                        >
                            {isAdded ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Added
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-4 h-4" />
                                    Add
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleOrderNow}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-amber-200"
                        >
                            <Zap className="w-4 h-4 fill-current" />
                            Order Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
