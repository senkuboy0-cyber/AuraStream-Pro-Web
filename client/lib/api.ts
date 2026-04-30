/**
 * API Configuration and Client
 * 
 * This module provides typed API client for communicating
 * with the AuraStream backend server.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * API base configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor for adding auth tokens, etc.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Repository API endpoints
 */
export const repositoryApi = {
  /**
   * Get all installed repositories
   */
  getAll: () => apiClient.get('/repositories'),
  
  /**
   * Get a specific repository by ID
   */
  getById: (id: string) => apiClient.get(`/repositories/${id}`),
  
  /**
   * Add a new repository
   */
  add: (url: string) => apiClient.post('/repositories', { url }),
  
  /**
   * Update a repository
   */
  update: (id: string, data: { isActive?: boolean; name?: string }) => 
    apiClient.put(`/repositories/${id}`, data),
  
  /**
   * Remove a repository
   */
  remove: (id: string) => apiClient.delete(`/repositories/${id}`),
  
  /**
   * Refresh repository providers
   */
  refresh: (id: string) => apiClient.post(`/repositories/${id}/refresh`),
};

/**
 * Provider API endpoints
 */
export const providerApi = {
  /**
   * Get all loaded providers
   */
  getAll: () => apiClient.get('/providers'),
  
  /**
   * Get provider by ID
   */
  getById: (id: string) => apiClient.get(`/providers/${id}`),
  
  /**
   * Get provider capabilities
   */
  getCapabilities: (id: string) => apiClient.get(`/providers/${id}/capabilities`),
  
  /**
   * Search using specific provider
   */
  search: (id: string, query: string, type?: string) => 
    apiClient.post(`/providers/${id}/search`, { query, type }),
};

/**
 * Search API endpoints
 */
export const searchApi = {
  /**
   * Global search across all providers
   */
  search: (query: string, options?: { type?: string; limit?: number; providers?: string[] }) => 
    apiClient.get('/search', { params: { q: query, ...options } }),
  
  /**
   * Advanced search with filters
   */
  advancedSearch: (params: {
    query: string;
    type?: string;
    year?: number;
    genre?: string;
    limit?: number;
    providers?: string[];
  }) => apiClient.post('/search', params),
  
  /**
   * Get search suggestions
   */
  suggestions: (query: string) => apiClient.get('/search/suggestions', { params: { q: query } }),
};

/**
 * Stream API endpoints
 */
export const streamApi = {
  /**
   * Get HLS manifest
   */
  getManifest: (url: string) => apiClient.post('/stream/manifest', { url }),
  
  /**
   * Get specific quality stream
   */
  getQualityStream: (url: string, quality: number) => 
    apiClient.post('/stream/quality', { url, quality }),
  
  /**
   * Get streaming sources
   */
  getSources: (providerId: string, mediaId: object, episodeInfo?: object) =>
    apiClient.post('/stream/sources', { providerId, mediaId, episodeInfo }),
  
  /**
   * Get subtitle
   */
  getSubtitle: (url: string, format?: string) =>
    apiClient.post('/stream/subtitle', { url, format }),
};

/**
 * User API endpoints
 */
export const userApi = {
  /**
   * Get user profile
   */
  getProfile: (id: string) => apiClient.get(`/users/${id}`),
  
  /**
   * Update user profile
   */
  updateProfile: (id: string, data: { username?: string; preferences?: object }) =>
    apiClient.put(`/users/${id}`, data),
  
  /**
   * Get user preferences
   */
  getPreferences: (id: string) => apiClient.get(`/users/${id}/preferences`),
  
  /**
   * Update user preferences
   */
  updatePreferences: (id: string, preferences: object) =>
    apiClient.put(`/users/${id}/preferences`, preferences),
};

/**
 * History API endpoints
 */
export const historyApi = {
  /**
   * Get watch history
   */
  getHistory: (userId: string, options?: { limit?: number; completed?: boolean }) =>
    apiClient.get(`/history/${userId}`, { params: options }),
  
  /**
   * Get continue watching
   */
  getContinueWatching: (userId: string, limit?: number) =>
    apiClient.get(`/history/${userId}/continue`, { params: { limit } }),
  
  /**
   * Add/update watch progress
   */
  addProgress: (data: {
    userId: string;
    mediaId: string;
    mediaTitle: string;
    mediaType: string;
    timestamp: number;
    duration: number;
    providerId?: string;
    providerName?: string;
  }) => apiClient.post('/history', data),
  
  /**
   * Mark as completed
   */
  markCompleted: (historyId: string) => apiClient.post(`/history/${historyId}/complete`),
  
  /**
   * Delete history entry
   */
  deleteEntry: (historyId: string) => apiClient.delete(`/history/${historyId}`),
  
  /**
   * Clear all history
   */
  clearAll: (userId: string) => apiClient.delete(`/history/user/${userId}`),
};

export default apiClient;
