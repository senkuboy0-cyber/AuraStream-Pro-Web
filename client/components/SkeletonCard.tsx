/**
 * SkeletonCard Component
 * 
 * Skeleton loader that matches the MediaCard layout.
 * Features shimmer animation effect.
 */

'use client';

import { motion } from 'framer-motion';

interface SkeletonCardProps {
  index?: number;
}

export default function SkeletonCard({ index = 0 }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="w-full"
    >
      {/* Image skeleton */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3">
        <div className="absolute inset-0 skeleton" />
        
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
      
      {/* Title skeleton */}
      <div className="h-4 w-3/4 rounded-lg skeleton mb-2" />
      
      {/* Meta skeleton */}
      <div className="h-3 w-1/2 rounded-lg skeleton" />
    </motion.div>
  );
}

// Skeleton for larger cards (hero, featured)
export function SkeletonHeroCard() {
  return (
    <div className="relative rounded-3xl overflow-hidden">
      <div className="aspect-[16/9] lg:aspect-[21/9] skeleton" />
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="h-8 w-48 rounded-lg skeleton mb-3" />
        <div className="h-4 w-96 max-w-full rounded-lg skeleton mb-2" />
        <div className="h-4 w-80 max-w-full rounded-lg skeleton mb-6" />
        <div className="flex gap-3">
          <div className="h-12 w-36 rounded-xl skeleton" />
          <div className="h-12 w-36 rounded-xl skeleton" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for list items
export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl">
      <div className="w-16 h-24 rounded-lg skeleton flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-3/4 rounded-lg skeleton mb-2" />
        <div className="h-3 w-1/2 rounded-lg skeleton mb-2" />
        <div className="h-3 w-1/4 rounded-lg skeleton" />
      </div>
    </div>
  );
}

// Skeleton for episode list
export function SkeletonEpisodeList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListItem key={i} />
      ))}
    </div>
  );
}

// Skeleton for search results
export function SkeletonSearchResults({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </div>
  );
}
