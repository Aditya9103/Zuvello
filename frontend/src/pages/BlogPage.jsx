import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogs } from '../hooks/useBlogs';
import { Calendar, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const BlogPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('all');


    // Use React Query hook - automatic caching!
    // Note: Blog list doesn't need translation, only detail page does
    const { data: blogs = [], isLoading: loading } = useBlogs(selectedCategory);

    const categories = [
        { id: 'all', label: 'All Articles' },
        { id: 'Style Guides', label: 'Style Guides' },
        { id: 'Behind the Scenes', label: 'Behind the Scenes' },
        { id: 'New Arrivals', label: 'New Arrivals' },
        { id: 'Styling Tips', label: 'Styling Tips' }
    ];

    if (loading) {
        return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const blogSchema = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Zuvello Blog - Fashion & Stories",
        "description": "Explore premium fashion guides, new arrivals, and styling tips.",
        "url": "https://www.zuvello.in/blog",
        "blogPost": blogs.map(blog => ({
            "@type": "BlogPosting",
            "headline": blog.title,
            "url": `https://www.zuvello.in/blog/${blog.slug}`
        }))
    };

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": blogs.map((blog, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://www.zuvello.in/blog/${blog.slug}`
        }))
    };

    return (
  <div className="relative pt-32 pb-24 min-h-screen overflow-hidden bg-[#fdfaf7]">
      <SEO 
          title="Blog - Fashion & Stories" 
          description="Explore premium fashion guides, new arrivals, and styling tips."
          schema={[blogSchema, itemListSchema]} 
      />

    {/* Soft Luxury Background Glows */}
    <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#cf7e28]/10 rounded-full blur-[150px]"></div>
    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#e4a055]/10 rounded-full blur-[120px]"></div>

    <div className="max-w-7xl mx-auto px-6 relative z-10">

      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-[#1c1c1c]">
          Zuvello <span className="text-[#cf7e28] italic font-serif">Stories</span>
        </h1>
        <p className="text-gray-500 font-medium mt-4 max-w-2xl mx-auto text-lg">
          Explore premium fashion guides, new arrivals, and styling tips.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-14">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300
              ${
                selectedCategory === cat.id
                  ? "bg-[#cf7e28] text-white shadow-lg"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-[#cf7e28] hover:text-[#cf7e28]"
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Blog Grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-medium text-lg">
          No blogs found in this category.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {blogs.map((blog) => (
            <div
              key={blog._id}
              onClick={() => navigate(`/blog/${blog.slug}`)}
              className="group cursor-pointer"
            >

              <div className="
                relative rounded-3xl overflow-hidden
                bg-white
                border border-gray-100
                shadow-xl shadow-[#cf7e28]/5
                hover:shadow-2xl hover:shadow-[#cf7e28]/10
                transition-all duration-500
                flex flex-col
              ">

                {/* Image */}
                {blog.thumbnailUrl && (
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={blog.thumbnailUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      onError={(e) => e.target.style.display = "none"}
                      loading="lazy" decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">

                  {/* Category + Date */}
                  <div className="flex items-center justify-between mb-3 text-xs text-[#cf7e28] font-bold">
                    <span className="bg-[#cf7e28]/10 px-3 py-1 rounded-full">
                      {blog.category}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(blog.publishedDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-bold text-[#1c1c1c] group-hover:text-[#cf7e28] transition line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-500 font-medium text-sm mt-3 line-clamp-3 flex-1">
                    {blog.excerpt}
                  </p>

                  {/* Tags */}
                  {blog.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {blog.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold bg-gray-50 border border-gray-100 text-gray-500 px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Button */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/blog/${blog.slug}`);
                    }}
                    className="mt-6 w-full py-3 rounded-xl font-bold text-sm
                      bg-[#cf7e28] text-white
                      hover:bg-[#b56e22]
                      transition-all flex items-center justify-center gap-2"
                  >
                    Read Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>

                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  </div>
);
};

export default BlogPage;
