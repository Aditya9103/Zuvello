// Use the environment variable if available, otherwise fallback to localhost (for local development)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
