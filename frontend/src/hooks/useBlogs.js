import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { API_BASE_URL } from '../api';

const API_URL = API_BASE_URL;

// Fetch all blogs or by category
export const useBlogs = (category = 'all') => {
    return useQuery({
        queryKey: ['blogs', category],
        queryFn: async () => {
            const categoryParam = category !== 'all' ? `?category=${category}` : '';
            const response = await axios.get(`${API_URL}/blogs${categoryParam}`);
            return response.data;
        },
    });
};

// Fetch single blog by slug with language support
export const useBlogDetail = (slug, language = 'en') => {
    return useQuery({
        queryKey: ['blog', slug, language],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/blogs/${slug}?lang=${language}`);
            return response.data;
        },
        enabled: !!slug, // Only run if slug exists
    });
};

// Fetch all blogs including drafts (admin)
export const useAdminBlogs = () => {
    return useQuery({
        queryKey: ['blogs', 'admin'],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/blogs?status=all`);
            return response.data;
        },
    });
};
