import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - Pokemon data is static
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Mobile app context
      refetchOnReconnect: true, // Network resilience
    },
  },
});
