/**
 * SearchPage Component
 * 
 * Global search page with real-time search across all providers.
 * Features debounced search, filters, and animated results.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Film, Tv, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAppStore, MediaItem } from '@/store/useAppStore';
import MediaCard from './MediaCard';
import { SkeletonSearchResults } from './SkeletonCard';
import clsx from 'clsx';

export default function SearchPage() {
  const { searchQuery, setSearchQuery, searchResults, setSearchResults, isSearching, setIsSearching } = useAppStore();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Type filter options
  const typeFilters = [
    { id: 'all', label: 'All', icon: null },
    { id: 'movie', label: 'Movies', icon: Film },
    { id: 'series', label: 'Series', icon: Tv },
    { id: 'anime', label: 'Anime', icon: Sparkles },
  ];

  // Mock search results for demonstration
  const mockSearchResults: MediaItem[] = [
    { id: 's1', title: 'Spider-Man: No Way Home', type: 'movie', poster: 'https://picsum.photos/seed/spider/300/450', year: 2021, rating: 8.2 },
    { id: 's2', title: 'Arcane', type: 'series', poster: 'https://picsum.photos/seed/arcane/300/450', year: 2021, rating: 9.0 },
    { id: 's3', title: 'Jujutsu Kaisen', type: 'anime', poster: 'https://picsum.photos/seed/jjk/300/450', year: 2020, rating: 8.7 },
    { id: 's4', title: 'Dune', type: 'movie', poster: 'https://picsum.photos/seed/dune/300/450', year: 2021, rating: 8.0 },
    { id: 's5', title: 'The Last of Us', type: 'series', poster: 'https://picsum.photos/seed/lastofus/300/450', year: 2023, rating: 8.8 },
    { id: 's6', title: 'One Piece', type: 'anime', poster: 'https://picsum.photos/seed/onepiece/300/450', year: 1999, rating: 9.0 },
    { id: 's7', title: 'Oppenheimer', type: 'movie', poster: 'https://picsum.photos/seed/oppen/300/450', year: 2023, rating: 8.4 },
    { id: 's8', title: 'House of the Dragon', type: 'series', poster: 'https://picsum.photos/seed/hotd/300/450', year: 2022, rating: 8.4 },
  ];

  // Debounced search function
  const performSearch = useCallback((query: string) => {
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      if (query.trim().length >= 2) {
        // Filter mock results based on query
        const filtered = mockSearchResults.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 500);
  }, [setSearchResults, setIsSearching]);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchQuery(value);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new debounce timer
    const timer = setTimeout(() => {
      performSearch(value);
    }, 300);

    setDebounceTimer(timer);
  };

  // Clear search
  const clearSearch = () => {
    setInputValue('');
    setSearchQuery('');
    setSearchResults([]);
  };

  // Filter results by type
  const filteredResults = selectedType === 'all' 
    ? searchResults 
    : searchResults.filter(r => r.type === selectedType);

  return (
    <div className="px-4 lg:px-8 py-6 min-h-screen">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto mb-8"
      >
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted" />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search movies, series, anime..."
            className="w-full pl-14 pr-14 py-4 bg-surface-glass border border-border-subtle rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
            autoFocus
          />
          {inputValue && (
            <button
              onClick={clearSearch}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          )}
        </div>

        {/* Type Filters */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
          {typeFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedType === filter.id;
            
            return (
              <motion.button
                key={filter.id}
                onClick={() => setSelectedType(filter.id)}
                whileTap={{ scale: 0.95 }}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-accent text-white'
                    : 'bg-surface-glass text-text-secondary hover:bg-white/10'
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {filter.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Search Results */}
      <div className="max-w-7xl mx-auto">
        {/* Loading State */}
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <span className="ml-3 text-text-secondary">Searching...</span>
              </div>
            </motion.div>
          ) : inputValue.length >= 2 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary">
                  Results for "{inputValue}"
                </h2>
                <span className="text-sm text-text-muted">
                  {filteredResults.length} found
                </span>
              </div>

              {filteredResults.length > 0 ? (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    }
                  }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                >
                  {filteredResults.map((media, index) => (
                    <motion.div
                      key={media.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                    >
                      <MediaCard
                        media={media}
                        onClick={() => useAppStore.getState().openPlayer(media)}
                        index={index}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-glass flex items-center justify-center">
                    <Search className="w-10 h-10 text-text-muted" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    No results found
                  </h3>
                  <p className="text-text-secondary">
                    Try searching with different keywords or check your spelling
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
                <Search className="w-12 h-12 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                Search AuraStream
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Find movies, TV shows, anime, and more across all your installed providers.
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <kbd className="px-2 py-1 bg-surface-glass rounded">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-surface-glass rounded">K</kbd>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
