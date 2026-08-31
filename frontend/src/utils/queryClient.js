import { QueryClient } from '@tanstack/react-query';

// Create a client with aggressive caching for images and API calls
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data stays fresh for 5 minutes
            staleTime: 5 * 60 * 1000,

            // Cached data kept for 30 minutes
            cacheTime: 30 * 60 * 1000,

            // Don't refetch on window focus (better UX)
            refetchOnWindowFocus: false,

            // Refetch when reconnecting to internet
            refetchOnReconnect: true,

            // Retry failed requests 2 times
            retry: 2,

            // Exponential backoff for retries
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
    },
});
