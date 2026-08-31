import React, { useState } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

const BlogForm = ({ onClose, onSuccess, editBlog = null }) => {
    const [formData, setFormData] = useState({
        title: editBlog?.title || '',
        excerpt: editBlog?.excerpt || '',
        content: editBlog?.content || '',
        category: editBlog?.category || 'General',
        tags: editBlog?.tags?.join(', ') || '',
        status: editBlog?.status || 'draft',
        thumbnailUrl: editBlog?.thumbnailUrl || ''
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(editBlog?.thumbnailUrl || '');
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const uploadThumbnail = async () => {
        if (!thumbnailFile) return formData.thumbnailUrl;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', thumbnailFile);

        try {
            const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
            const response = await axios.post(`${API_BASE_URL}/upload`, formDataUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.url;
        } catch (err) {
            console.error('Upload error:', err);
            throw new Error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Upload thumbnail if new file selected
            let thumbnailKey = formData.thumbnailUrl;
            if (thumbnailFile) {
                try {
                    thumbnailKey = await uploadThumbnail();
                } catch (uploadError) {
                    // If image upload fails, continue without image
                    console.error('Image upload failed, continuing without image:', uploadError);
                    thumbnailKey = '';
                }
            }

            const blogData = {
                ...formData,
                thumbnailUrl: thumbnailKey
            };

            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('userToken') || localStorage.getItem('adminToken')}` }
            };

            if (editBlog) {
                await axios.put(`${API_BASE_URL}/blogs/${editBlog._id}`, blogData, config);
            } else {
                await axios.post(`${API_BASE_URL}/blogs`, blogData, config);
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save blog');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-dark border border-white/10 rounded-2xl w-full max-w-4xl my-8">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-2xl font-black text-white">
                        {editBlog ? 'Edit Blog' : 'Create New Blog'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-white hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                            placeholder="Enter blog title"
                            required
                        />
                    </div>

                    {/* Category & Status */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">
                                Category *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="Style Guides">Style Guides</option>
                                <option value="Behind the Scenes">Behind the Scenes</option>
                                <option value="New Arrivals">New Arrivals</option>
                                <option value="Styling Tips">Styling Tips</option>
                                <option value="General">General</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">
                                Status *
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>

                    {/* Thumbnail Upload */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Thumbnail Image
                        </label>
                        <div className="flex items-center gap-4">
                            {thumbnailPreview && (
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className="w-32 h-32 object-cover rounded-lg border border-white/20"
                                 loading="lazy" decoding="async" />
                            )}
                            <label className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
                                    <Upload className="w-5 h-5" />
                                    <span>{thumbnailFile ? thumbnailFile.name : 'Choose Image'}</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Excerpt * (Short Description)
                        </label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 resize-none"
                            placeholder="Brief description (max 300 characters)"
                            rows="3"
                            maxLength="300"
                            required
                        />
                        <p className="text-xs text-white mt-1">{formData.excerpt.length}/300</p>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Content * (Supports basic HTML)
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
                            placeholder="Write your blog content here. You can use basic HTML tags like <p>, <h2>, <strong>, <em>, <ul>, <li>, etc."
                            rows="15"
                            required
                        />
                        <p className="text-xs text-white mt-1">
                            Tip: Use HTML tags for formatting. Example: &lt;h2&gt;Heading&lt;/h2&gt; &lt;p&gt;Paragraph&lt;/p&gt;
                        </p>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                            placeholder="e.g. gifting, kids, plushies, cute-toys"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4 sticky bottom-0 bg-dark pb-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-outline py-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {(loading || uploading) && <Loader className="w-5 h-5 animate-spin" />}
                            {uploading ? 'Uploading...' : loading ? 'Saving...' : editBlog ? 'Update Blog' : 'Create Blog'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogForm;
