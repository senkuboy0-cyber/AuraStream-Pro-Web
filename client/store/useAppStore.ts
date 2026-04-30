/**
 * Global State Management with Zustand
 * 
 * This module manages the global application state including:
 * - Selected media for playback
 * - Player state
 * - User preferences
 * - Repository and provider data
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Media item interface representing a streaming content
 */
export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'anime';
  poster?: string;
  backdrop?: string;
  year?: number;
  rating?: number;
  genres?: string[];
  description?: string;
  duration?: number;
  provider?: {
    id: string;
    name: string;
  };
  episodes?: Episode[];
}

/**
 * Episode interface for series content
 */
export interface Episode {
  number: number;
  title?: string;
  season?: number;
  poster?: string;
  duration?: number;
}

/**
 * App store state interface
 */
interface AppState {
  // Player state
  selectedMedia: MediaItem | null;
  isPlayerOpen: boolean;
  currentEpisode: number;
  currentSeason: number;
  
  // User preferences
  preferences: {
    defaultQuality: string;
    autoplay: boolean;
    playbackSpeed: number;
    subtitlesEnabled: boolean;
    defaultSubtitleLanguage: string;
  };
  
  // Repositories
  installedRepositories: Repository[];
  
  // Search
  searchQuery: string;
  searchResults: MediaItem[];
  isSearching: boolean;
  
  // Actions
  setSelectedMedia: (media: MediaItem | null) => void;
  openPlayer: (media: MediaItem) => void;
  closePlayer: () => void;
  setCurrentEpisode: (episode: number, season?: number) => void;
  
  setPreferences: (preferences: Partial<AppState['preferences']>) => void;
  
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: MediaItem[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  
  addRepository: (repo: Repository) => void;
  removeRepository: (repoId: string) => void;
  
  // Continue watching
  continueWatching: ContinueWatchingItem[];
  addToContinueWatching: (item: ContinueWatchingItem) => void;
  removeFromContinueWatching: (mediaId: string) => void;
  
  // Bookmarks
  bookmarks: MediaItem[];
  addBookmark: (item: MediaItem) => void;
  removeBookmark: (mediaId: string) => void;
  isBookmarked: (mediaId: string) => boolean;
}

/**
 * Repository interface
 */
export interface Repository {
  id: string;
  name: string;
  url: string;
  version: string;
  providerCount: number;
  providers: Provider[];
  isActive: boolean;
  installedAt: string;
}

/**
 * Provider interface
 */
export interface Provider {
  id: string;
  name: string;
  version: string;
  capabilities: {
    search: boolean;
    getDetails: boolean;
    getSources: boolean;
  };
}

/**
 * Continue watching item interface
 */
export interface ContinueWatchingItem {
  mediaId: string;
  title: string;
  poster: string;
  progress: number;
  timestamp: number;
  duration: number;
  episodeNumber?: number;
  seasonNumber?: number;
  providerName?: string;
}

/**
 * Create the Zustand store with persistence
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial player state
      selectedMedia: null,
      isPlayerOpen: false,
      currentEpisode: 1,
      currentSeason: 1,
      
      // Initial preferences
      preferences: {
        defaultQuality: 'auto',
        autoplay: true,
        playbackSpeed: 1.0,
        subtitlesEnabled: true,
        defaultSubtitleLanguage: 'en',
      },
      
      // Initial repositories
      installedRepositories: [],
      
      // Initial search state
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      
      // Continue watching
      continueWatching: [],
      
      // Bookmarks
      bookmarks: [],
      
      // Player actions
      setSelectedMedia: (media) => set({ selectedMedia: media }),
      
      openPlayer: (media) => set({ 
        selectedMedia: media, 
        isPlayerOpen: true 
      }),
      
      closePlayer: () => set({ isPlayerOpen: false }),
      
      setCurrentEpisode: (episode, season) => set((state) => ({
        currentEpisode: episode,
        currentSeason: season ?? state.currentSeason,
      })),
      
      // Preferences actions
      setPreferences: (preferences) => set((state) => ({
        preferences: { ...state.preferences, ...preferences }
      })),
      
      // Search actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      setIsSearching: (isSearching) => set({ isSearching }),
      
      // Repository actions
      addRepository: (repo) => set((state) => ({
        installedRepositories: [...state.installedRepositories, repo]
      })),
      
      removeRepository: (repoId) => set((state) => ({
        installedRepositories: state.installedRepositories.filter(r => r.id !== repoId)
      })),
      
      // Continue watching actions
      addToContinueWatching: (item) => set((state) => {
        const filtered = state.continueWatching.filter(i => i.mediaId !== item.mediaId);
        return { continueWatching: [item, ...filtered].slice(0, 20) };
      }),
      
      removeFromContinueWatching: (mediaId) => set((state) => ({
        continueWatching: state.continueWatching.filter(i => i.mediaId !== mediaId)
      })),
      
      // Bookmark actions
      addBookmark: (item) => set((state) => {
        if (state.bookmarks.some(b => b.id === item.id)) return state;
        return { bookmarks: [item, ...state.bookmarks] };
      }),
      
      removeBookmark: (mediaId) => set((state) => ({
        bookmarks: state.bookmarks.filter(b => b.id !== mediaId)
      })),
      
      isBookmarked: (mediaId) => get().bookmarks.some(b => b.id === mediaId),
    }),
    {
      name: 'aurastream-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        continueWatching: state.continueWatching,
        bookmarks: state.bookmarks,
        installedRepositories: state.installedRepositories,
      }),
    }
  )
);

export default useAppStore;
