/**
 * MediaCard Component
 * 
 * Reusable card component for displaying media items.
 * Features hover animations, rating badges, and type indicators.
 */

'use client';

import { motion } from 'framer-motion';
import { Play, Star, Film, Tv, Sparkles } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';
import { MediaItem } from '@/store/useAppStore';

interface MediaCardProps {
  media: MediaItem;
  onClick: () => void;
  index?: number;
  showProgress?: boolean;
  progress?: number;
}

// Type icons mapping
const typeIcons = {
  movie: Film,
  series: Tv,
  anime: Sparkles,
};

export default function MediaCard({ 
  media, 
  onClick, 
  index = 0,
  showProgress = false,
  progress = 0
}: MediaCardProps) {
  const TypeIcon = typeIcons[media.type] || Film;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group w-full text-left"
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3">
        {/* Poster Image */}
        <img
          src={media.poster || 'https://picsum.photos/seed/default/300/450'}
          alt={media.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <div className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-md',
            media.type === 'movie' && 'bg-blue-500/80 text-white',
            media.type === 'series' && 'bg-purple-500/80 text-white',
            media.type === 'anime' && 'bg-pink-500/80 text-white'
          )}>
            <TypeIcon className="w-3.5 h-3.5" />
            <span className="capitalize">{media.type}</span>
          </div>
        </div>

        {/* Rating Badge */}
        {media.rating && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-xs font-medium">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-white">{media.rating.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {showProgress && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-accent"
            />
          </div>
        )}

        {/* Play Button Overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1 }}
            className="p-4 rounded-full bg-accent/90 backdrop-blur-md shadow-lg shadow-accent/50"
          >
            <Play className="w-8 h-8 text-white" fill="currentColor" />
          </motion.div>
        </motion.div>

        {/* Quick Info on Hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {media.year && (
            <p className="text-xs text-text-muted mb-1">{media.year}</p>
          )}
          <h3 className="text-sm font-semibold text-white line-clamp-2">{media.title}</h3>
          {media.genres && media.genres.length > 0 && (
            <p className="text-xs text-text-muted mt-1 line-clamp-1">
              {media.genres.slice(0, 2).join(' • ')}
            </p>
          )}
        </div>
      </div>

      {/* Title (shown when not hovering) */}
      <div className="group-hover:opacity-0 transition-opacity">
        <h3 className="text-sm font-medium text-text-primary line-clamp-1">
          {media.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {media.year && (
            <span className="text-xs text-text-muted">{media.year}</span>
          )}
          {media.rating && (
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {media.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
