import useSWR, { SWRConfiguration } from 'swr';
import { apiClient } from './api';

// Generic fetcher function that uses the apiClient
export const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

// SWR configuration for the entire application
export const swrConfig: SWRConfiguration = {
  fetcher,
  // Revalidate on focus
  revalidateOnFocus: false,
  // Revalidate on reconnect
  revalidateOnReconnect: true,
  // Error retry count
  errorRetryCount: 3,
  // Error retry interval
  errorRetryInterval: 5000,
  // Dedupe requests with the same key
  dedupingInterval: 2000,
  // Focus throttle interval
  focusThrottleInterval: 5000,
  // Loading timeout
  loadingTimeout: 10000,
  // Refresh interval (disabled by default)
  refreshInterval: 0,
};

// Hook for GET requests
export const useSWRData = <T = any>(url: string | null, config?: SWRConfiguration) => {
  return useSWR<T>(url, fetcher, { ...swrConfig, ...config });
};