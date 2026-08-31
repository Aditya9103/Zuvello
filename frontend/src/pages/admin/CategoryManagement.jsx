import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, X, Upload, Loader2, Grid2X2, Edit } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../api';
import SEO from '../../components/SEO';
import TableSkeleton from '../../components/skeletons/TableSkeleton';

const CategoryManagement = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        link: '',
        order: 0
    });

    const { data: categories = [], isLoading: loading } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE_URL}/categories`);
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let fileToUpload = file;
        try {
            const options = {
                maxSizeMB: 0.15,
                maxWidthOrHeight: 1000,
                useWebWorker: true,
                initialQuality: 0.7
            };
            fileToUpload = await imageCompression(file, options);
        } catch (error) {
            console.warn('Image compression failed', error);
        }

        const uploadData = new FormData();
        uploadData.append('image', fileToUpload);

        try {
            setUploadLoading(true);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const { data } = await axios.post(`${API_BASE_URL}/upload/`, uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setFormData(prev => ({ ...prev, image: data.url }));
            setUploadLoading(false);
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadLoading(false);
            toast.error('Failed to upload image');
        }
    };

    const handleGenerateLink = () => {
        if (!formData.name) {
            toast.warning('Please enter a category name first.');
            return;
        }
        const generatedLink = `/shop?category=${formData.name.toLowerCase().trim().replace(/[\s_]+/g, '-')}`;
        setFormData({ ...formData, link: generatedLink });
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ name: '', image: '', link: '', order: 0 });
        setShowModal(true);
    };

    const openEditModal = (cat) => {
        setEditingId(cat._id);
        setFormData({
            name: cat.name || '',
            image: cat.image || '',
            link: cat.link || '',
            order: cat.order || 0
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            
            const submissionData = { ...formData };
            if (!submissionData.link && submissionData.name) {
                submissionData.link = `/shop?category=${submissionData.name.toLowerCase().trim().replace(/[\s_]+/g, '-')}`;
            }

            if (editingId) {
                // Update
                await axios.put(`${API_BASE_URL}/categories/${editingId}`, submissionData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Create
                await axios.post(`${API_BASE_URL}/categories`, submissionData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            setFormData({ name: '', image: '', link: '', order: 0 });
            setEditingId(null);
            queryClient.invalidateQueries(['adminCategories']);
            toast.success(editingId ? 'Category updated successfully' : 'Category created successfully');
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(error.response?.data?.message || 'Error saving category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
                await axios.delete(`${API_BASE_URL}/categories/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                queryClient.invalidateQueries(['adminCategories']);
                toast.success('Category deleted successfully');
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.error('Failed to delete category');
            }
        }
    };

    return (
    <div className="space-y-6">
      <SEO title="Category Management" />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white">Category Management</h1>
                <button
                    onClick={openAddModal}
                    className="bg-primary hover:bg-primary-dark text-dark font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all"
                >
                    <Plus className="w-5 h-5" /> Add Category
                </button>
            </div>

            {loading ? (
                <TableSkeleton columns={4} rows={6} />
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Link</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {categories.map((cat) => (
                                <tr key={cat._id} className="text-white hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-full object-cover border border-white/10"  loading="lazy" decoding="async" />
                                    </td>
                                    <td className="px-6 py-4 font-bold">{cat.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{cat.link}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(cat)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(cat._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-300">No categories found. Add some to display on the homepage.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-dark-light border border-white/10 rounded-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Category Name</label>
                                <input
                                    type="text" name="name" value={formData.name} onChange={handleInputChange} required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Custom Link (Optional)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text" name="link" value={formData.link} onChange={handleInputChange} 
                                        placeholder="/shop?category=name"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleGenerateLink}
                                        className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
                                    >
                                        Generate
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Leave blank to auto-generate based on name.</p>
                            </div>

                            <div>
                                <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Display Order (Optional)</label>
                                <input
                                    type="number" name="order" value={formData.order} onChange={handleInputChange} 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">Lower numbers appear first on the homepage.</p>
                            </div>

                            <div>
                                <label className="block text-white text-sm mb-1 uppercase font-bold tracking-wider">Category Image</label>
                                {formData.image ? (
                                    <div className="relative w-32 h-32 rounded-xl overflow-hidden group mb-2 border border-white/10">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: '' })}
                                            className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-32 h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center hover:border-primary/50 cursor-pointer transition-colors mb-2">
                                        {uploadLoading ? (
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 text-gray-400" />
                                                <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Upload</span>
                                            </>
                                        )}
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploadLoading} required={!editingId} />
                                    </label>
                                )}
                            </div>

                            <button type="submit" disabled={uploadLoading || !formData.image} className="w-full bg-primary hover:bg-primary-dark text-dark font-bold py-4 rounded-xl transition-all disabled:opacity-50 mt-4">
                                {editingId ? 'Save Changes' : 'Create Category'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
