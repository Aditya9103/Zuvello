import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, X, Upload, Loader2, Edit, Copy } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../api';
import SEO from '../../components/SEO';
import TableSkeleton from '../../components/skeletons/TableSkeleton';

const ProductManagement = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        images: [],
        stock: 0,
        isNewArrival: false,
        isBestSeller: false,
        ageGroup: '',
        sizes: '',
        bulletPoints: '',
        features: '',
        video: '',
        baseViews: 0
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE_URL}/categories`);
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: products = [], isLoading: loading } = useQuery({
        queryKey: ['adminProducts'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE_URL}/products`);
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            setUploadLoading(true);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');

            const uploadPromises = files.map(async (file) => {
                // Compress image before uploading
                const options = {
                    maxSizeMB: 0.15, // target 150KB
                    maxWidthOrHeight: 1000,
                    useWebWorker: true,
                    initialQuality: 0.7
                };
                
                let fileToUpload = file;
                try {
                    fileToUpload = await imageCompression(file, options);
                } catch (error) {
                    console.warn('Image compression failed, using original file', error);
                }

                const uploadData = new FormData();
                uploadData.append('image', fileToUpload);
                const { data } = await axios.post(`${API_BASE_URL}/upload/`, uploadData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                return data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }));
            
            // Clear the input value so the same files can be selected again if needed
            e.target.value = '';
            toast.success('Image(s) uploaded successfully');
        } catch (error) {
            console.error('Error uploading image(s):', error);
            toast.error('Failed to upload one or more images');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file); // We use the same 'image' field because multer expects it

        try {
            setUploadLoading(true);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const { data } = await axios.post(`${API_BASE_URL}/upload/`, uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setFormData(prev => ({
                ...prev,
                video: data.url
            }));
            setUploadLoading(false);
            toast.success('Video uploaded successfully');
        } catch (error) {
            console.error('Error uploading video:', error);
            setUploadLoading(false);
            toast.error('Failed to upload video');
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const submissionData = {
                ...formData,
                sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
                bulletPoints: formData.bulletPoints ? formData.bulletPoints.split('\n').map(b => b.trim()).filter(b => b) : [],
                features: formData.features ? formData.features.split('\n').map(line => {
                    const [title, description] = line.split('|').map(s => s.trim());
                    return title && description ? { title, description } : null;
                }).filter(Boolean) : []
            };

            if (editingProduct) {
                await axios.put(`${API_BASE_URL}/products/${editingProduct._id}`, submissionData, config);
            } else {
                await axios.post(`${API_BASE_URL}/products`, submissionData, config);
            }
            setShowModal(false);
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                category: categories.length > 0 ? categories[0].name.toLowerCase() : '',
                images: [],
                stock: 0,
                isNewArrival: false,
                isBestSeller: false,
                ageGroup: '',
                sizes: '',
                bulletPoints: '',
                features: '',
                video: '',
                baseViews: 0
            });
            queryClient.invalidateQueries(['adminProducts']);
            toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.message || 'Error saving product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            images: product.images || [],
            stock: product.stock,
            isNewArrival: product.isNewArrival || false,
            isBestSeller: product.isBestSeller || false,
            ageGroup: product.ageGroup || '',
            sizes: product.sizes ? product.sizes.join(', ') : '',
            bulletPoints: product.bulletPoints ? product.bulletPoints.join('\n') : '',
            features: product.features ? product.features.map(f => `${f.title} | ${f.description}`).join('\n') : '',
            video: product.video || '',
            baseViews: product.baseViews || 0
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
                await axios.delete(`${API_BASE_URL}/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                queryClient.invalidateQueries(['adminProducts']);
                toast.success('Product deleted successfully');
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Failed to delete product');
            }
        }
    };

    return (
    <div className="space-y-6">
      <SEO title="Product Management" />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white">Product Management</h1>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({
                            name: '',
                            description: '',
                            price: '',
                            category: categories.length > 0 ? categories[0].name.toLowerCase() : '',
                            images: [],
                            stock: 0,
                            isNewArrival: false,
                            isBestSeller: false,
                            ageGroup: '',
                            sizes: '',
                            bulletPoints: '',
                            features: '',
                            video: '',
                            baseViews: 0
                        });
                        setShowModal(true);
                    }}
                    className="bg-primary hover:bg-primary-dark text-dark font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all"
                >
                    <Plus className="w-5 h-5" /> Add Product
                </button>
            </div>

            {loading ? (
                <TableSkeleton columns={5} rows={8} />
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {products.map((product) => (
                                <tr key={product._id} className="text-white hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={product.images[0] || 'https://via.placeholder.com/50'}
                                                alt={product.name}
                                                className="w-10 h-10 rounded-lg object-cover"
                                             loading="lazy" decoding="async" />
                                            <span className="font-bold">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 capitalize">{product.category}</td>
                                    <td className="px-6 py-4">₹{product.price}</td>
                                    <td className="px-6 py-4">{product.stock}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(product)} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(product._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-dark-light border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Product Name</label>
                                    <input
                                        type="text" name="name" value={formData.name} onChange={handleInputChange} required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Price (₹)</label>
                                    <input
                                        type="number" name="price" value={formData.price} onChange={handleInputChange} required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Description</label>
                                <textarea
                                    name="description" value={formData.description} onChange={handleInputChange} required rows="3"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Bullet Points (One per line)</label>
                                <textarea
                                    name="bulletPoints" value={formData.bulletPoints} onChange={handleInputChange} rows="3"
                                    placeholder="Super soft and stylegable&#10;Premium quality fabric..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Product Features (Format: Title | Description per line)</label>
                                <textarea
                                    name="features" value={formData.features} onChange={handleInputChange} rows="3"
                                    placeholder="Premium Plush | Ultra soft and huggable&#10;Kid Safe | Non-toxic materials..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                ></textarea>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Category</label>
                                    <select
                                        name="category" value={formData.category} onChange={handleInputChange} required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat.name.toLowerCase()}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Stock</label>
                                    <input
                                        type="number" name="stock" value={formData.stock} onChange={handleInputChange} required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Age Group</label>
                                    <select
                                        name="ageGroup" value={formData.ageGroup} onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                    >
                                        <option value="">Select Age Group</option>
                                        <option value="0-2 Years">0-2 Years</option>
                                        <option value="3-5 Years">3-5 Years</option>
                                        <option value="6-10 Years">6-10 Years</option>
                                        <option value="10+ Years">10+ Years</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Sizes (Comma separated)</label>
                                    <input
                                        type="text" name="sizes" value={formData.sizes} onChange={handleInputChange}
                                        placeholder="Small (20 cm), Medium (35 cm)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Base Views (Mock views)</label>
                                    <input
                                        type="number" name="baseViews" value={formData.baseViews} onChange={handleInputChange} min="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Product Reel (Video)</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex-1 border-2 border-dashed border-white/10 rounded-xl py-2 px-4 flex items-center justify-center hover:border-primary/50 cursor-pointer transition-colors bg-white/5">
                                            {uploadLoading ? (
                                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Upload className="w-5 h-5 text-white" />
                                                    <span className="text-xs text-white uppercase font-bold">Upload Video</span>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" onChange={handleVideoUpload} accept="video/*" disabled={uploadLoading} />
                                        </label>
                                        {formData.video && (
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-primary">
                                                <video src={formData.video} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, video: '' }))}
                                                    className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Product Images</label>
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                                            <img src={url} alt="Product" className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-6 h-6 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center hover:border-primary/50 cursor-pointer transition-colors">
                                        {uploadLoading ? (
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 text-white" />
                                                <span className="text-[10px] text-white mt-1 uppercase font-bold">Upload</span>
                                            </>
                                        )}
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" multiple disabled={uploadLoading} />
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleInputChange}
                                        className="w-5 h-5 accent-primary"
                                    />
                                    <label className="text-white font-bold">New Arrival</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleInputChange}
                                        className="w-5 h-5 accent-primary"
                                    />
                                    <label className="text-white font-bold">Best Seller</label>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-dark font-bold py-4 rounded-xl transition-all">
                                {editingProduct ? 'Update Product' : 'Create Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
