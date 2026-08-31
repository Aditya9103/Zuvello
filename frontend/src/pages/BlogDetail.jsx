import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogDetail } from '../hooks/useBlogs';
import { Calendar, ArrowLeft, Eye, Tag } from 'lucide-react';
import SEO from '../components/SEO';
import BlogSkeleton from '../components/skeletons/BlogSkeleton';

const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();


    // Use React Query hook - automatic caching!
    const { data: blog, isLoading: loading, error } = useBlogDetail(slug);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fdfaf7]">
                <SEO title="Loading Blog..." />
                <BlogSkeleton />
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-5xl md:text-6xl font-black text-[#1c1c1c] mb-6">Blog Not Found</h1>
                <p className="text-lg md:text-xl text-gray-500 font-medium mb-10">{error}</p>
                <button onClick={() => navigate('/blog')} className="btn-primary text-xl px-8 py-4">
                    Back to Blogs
                </button>
            </div>
        );
    }

    return (
        <div
            className="relative pt-32 pb-24 min-h-screen bg-[#fdfaf7]"
            style={{ zIndex: 1 }}
        >
            <SEO 
                title={blog.title}
                description={blog.excerpt}
                image={blog.thumbnailUrl}
                type="article"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": blog.title,
                    "image": blog.thumbnailUrl,
                    "author": {
                        "@type": "Person",
                        "name": blog.author
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Zuvello",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://www.zuvello.in/logo.png"
                        }
                    },
                    "datePublished": blog.publishedDate ? new Date(blog.publishedDate).toISOString() : new Date().toISOString(),
                    "description": blog.excerpt
                }}
            />
            {/* Luxurious Blurred Light background shapes */}
            <div className="absolute -top-10 -left-20 w-96 h-96 bg-[#cf7e28]/10 rounded-full blur-[110px] opacity-60 pointer-events-none z-0"></div>
            <div className="absolute bottom-0 -right-24 w-96 h-96 bg-[#e4a055]/10 rounded-full blur-[100px] opacity-50 z-0 pointer-events-none"></div>

            {/* Back Button */}
            <div className="max-w-4xl mx-auto px-4 mb-10 relative z-10">
                <button
                    onClick={() => navigate('/blog')}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#cf7e28] transition-colors font-bold text-lg md:text-xl"
                >
                    <ArrowLeft className="w-6 h-6" />
                    Back to all blogs
                </button>
            </div>

            {/* Blog Content */}
            <article className="max-w-4xl mx-auto px-4 relative z-10">
                {/* Category Badge */}
                <div className="mb-8">
                    <span className="px-5 py-3 bg-[#cf7e28]/10 text-[#cf7e28] text-lg md:text-xl font-black rounded-full tracking-wider shadow-lg">
                        {blog.category}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-black text-[#1c1c1c] mb-10 leading-tight">
                    {blog.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 md:gap-8 text-gray-500 font-bold text-lg md:text-xl mb-12 pb-10 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#cf7e28]" />
                        {new Date(blog.publishedDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 md:w-6 md:h-6 text-[#cf7e28]" />
                        {blog.views} views
                    </div>
                    <div className="text-[#cf7e28]">
                        By {blog.author}
                    </div>
                </div>

                {/* Thumbnail */}
                {blog.thumbnailUrl && (
                    <div className="mb-16 rounded-3xl overflow-hidden shadow-2xl shadow-[#cf7e28]/10 border border-gray-200">
                        <img
                            src={blog.thumbnailUrl}
                            alt={blog.title}
                            className="w-full h-auto object-cover bg-gray-100"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                )}

                {/* Excerpt */}
                <div className="mb-12 p-8 bg-white border-l-4 border-[#cf7e28] rounded-xl shadow-lg shadow-[#cf7e28]/5">
                    <p className="text-xl md:text-2xl text-gray-500 font-medium italic">{blog.excerpt}</p>
                </div>

                {/* Content */}
                <div
                    className="prose max-w-none mb-16 prose-xl md:prose-2xl prose-headings:font-black prose-headings:text-[#1c1c1c] prose-a:text-[#cf7e28] prose-strong:text-[#1c1c1c] text-gray-700 font-medium"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                    style={{
                        lineHeight: '1.9',
                    }}
                />

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="mb-16 pt-10 border-t border-gray-200">
                        <div className="flex items-center gap-4 flex-wrap">
                            <Tag className="w-6 h-6 text-[#cf7e28]" />
                            {blog.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-500 font-bold text-lg rounded-full hover:border-[#cf7e28] hover:text-[#cf7e28] transition-colors"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Back to Blogs Button */}
                <div className="text-center pt-10 border-t border-gray-200">
                    <button
                        onClick={() => navigate('/blog')}
                        className="btn-primary px-10 py-4 bg-[#cf7e28] text-white font-bold rounded-xl hover:bg-[#b56e22] transition-colors text-xl"
                    >
                        View More Stories
                    </button>
                </div>
            </article>
        </div>
    );
};

export default BlogDetail;
