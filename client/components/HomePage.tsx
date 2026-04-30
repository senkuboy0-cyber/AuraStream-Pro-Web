/**
 * HomePage Component
 * 
 * Main landing page featuring:
 * - Continue watching section
 * - Trending movies
 * - Popular series
 * - Recently added anime
 * 
 * Uses staggered grid animations and skeleton loaders.
 */

'use client';

import { motion } from 'framer-motion';
import { Play, Clock, Star, TrendingUp, Film, Tv, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore, MediaItem, ContinueWatchingItem } from '@/store/useAppStore';
import MediaCard from './MediaCard';
import SkeletonCard from './SkeletonCard';

interface HomePageProps {
  onMediaSelect: (media: MediaItem) => void;
}

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

// Mock data for demonstration
const mockTrending = [
  { id: '1', title: 'Inception', type: 'movie' as const, poster: 'https://picsum.photos/seed/movie1/300/450', year: 2010, rating: 8.8 },
  { id: '2', title: 'Breaking Bad', type: 'series' as const, poster: 'https://picsum.photos/seed/series1/300/450', year: 2008, rating: 9.5 },
  { id: '3', title: 'Attack on Titan', type: 'anime' as const, poster: 'https://picsum.photos/seed/anime1/300/450', year: 2013, rating: 9.1 },
  { id: '4', title: 'The Dark Knight', type: 'movie' as const, poster: 'https://picsum.photos/seed/movie2/300/450', year: 2008, rating: 9.0 },
  { id: '5', title: 'Stranger Things', type: 'series' as const, poster: 'https://picsum.photos/seed/series2/300/450', year: 2016, rating: 8.7 },
  { id: '6', title: 'Demon Slayer', type: 'anime' as const, poster: 'https://picsum.photos/seed/anime2/300/450', year: 2019, rating: 8.9 },
  { id: '7', title: 'Interstellar', type: 'movie' as const, poster: 'https://picsum.photos/seed/movie3/300/450', year: 2014, rating: 8.6 },
  { id: '8', title: 'The Mandalorian', type: 'series' as const, poster: 'https://picsum.photos/seed/series3/300/450', year: 2019, rating: 8.7 },
];

export default function HomePage({ onMediaSelect }: HomePageProps) {
  const { continueWatching } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [trending, setTrending] = useState<MediaItem[]>([]);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTrending(mockTrending);
      setIsLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="px-4 lg:px-8 py-6 space-y-10">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-purple-900/20 to-background" />
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/hero/1920/600')] bg-cover bg-center opacity-20" />
        
        <div className="relative px-8 py-16 lg:py-24">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-4"
            >
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-accent font-medium text-sm">Welcome to AuraStream</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl lg:text-6xl font-bold mb-4"
            >
              <span className="gradient-text">Stream Anything,</span>
              <br />
              <span className="text-text-primary">Anywhere</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-text-secondary text-lg mb-8"
            >
              Experience the next generation of streaming with dynamic providers,
              ultra-low latency, and stunning 4K quality.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <button className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover rounded-xl font-medium transition-colors glow">
                <Play className="w-5 h-5" fill="currentColor" />
                Start Watching
              </button>
              <button className="flex items-center gap-2 px-6 py-3 glass hover:bg-white/10 rounded-xl font-medium transition-colors">
                <TrendingUp className="w-5 h-5" />
                Browse Trending
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <SectionHeader 
            title="Continue Watching" 
            icon={Clock}
            actionLabel="View All"
          />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {continueWatching.slice(0, 6).map((item, index) => (
              <motion.div key={item.mediaId} variants={itemVariants}>
                <ContinueWatchingCard item={item} onClick={() => onMediaSelect(item as unknown as MediaItem)} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Trending Movies */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <SectionHeader 
          title="Trending Movies" 
          icon={Film}
          actionLabel="See All"
        />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : (
            trending.filter(m => m.type === 'movie').map((media, index) => (
              <motion.div key={media.id} variants={itemVariants}>
                <MediaCard media={media} onClick={() => onMediaSelect(media)} index={index} />
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      {/* Popular Series */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <SectionHeader 
          title="Popular Series" 
          icon={Tv}
          actionLabel="Browse All"
        />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : (
            trending.filter(m => m.type === 'series').map((media, index) => (
              <motion.div key={media.id} variants={itemVariants}>
                <MediaCard media={media} onClick={() => onMediaSelect(media)} index={index} />
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      {/* Anime Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <SectionHeader 
          title="Top Anime" 
          icon={Sparkles}
          actionLabel="Explore"
        />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : (
            trending.filter(m => m.type === 'anime').map((media, index) => (
              <motion.div key={media.id} variants={itemVariants}>
                <MediaCard media={media} onClick={() => onMediaSelect(media)} index={index} />
              </motion.div>
            ))
          )}
        </div>
      </motion.section>
    </div>
  );
}

// Section Header Component
function SectionHeader({ 
  title, 
  icon: Icon, 
  actionLabel 
}: { 
  title: string; 
  icon: React.ElementType;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-accent/20">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      </div>
      {actionLabel && (
        <button className="text-sm text-accent hover:text-accent-hover transition-colors">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Continue Watching Card Component
function ContinueWatchingCard({ 
  item, 
  onClick 
}: { 
  item: ContinueWatchingItem; 
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative group w-full text-left"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2">
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-accent transition-all"
            style={{ width: `${item.progress}%` }}
          />
        </div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-3 rounded-full bg-accent/90">
            <Play className="w-6 h-6 text-white" fill="currentColor" />
          </div>
        </div>
      </div>
      
      <h3 className="text-sm font-medium text-text-primary truncate">{item.title}</h3>
      <p className="text-xs text-text-muted">
        {item.progress}% complete
        {item.episodeNumber && ` • Episode ${item.episodeNumber}`}
      </p>
    </motion.button>
  );
}
