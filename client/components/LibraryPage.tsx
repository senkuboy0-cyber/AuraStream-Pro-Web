/**
 * LibraryPage Component
 * 
 * User's personal library featuring:
 * - Bookmarked content
 * - Watch history
 * - Continue watching
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, 
  Clock, 
  Play, 
  Trash2, 
  ChevronRight,
  Film,
  Tv,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { useAppStore, MediaItem } from '@/store/useAppStore';
import clsx from 'clsx';

type TabType = 'bookmarks' | 'history' | 'continue';

const tabs = [
  { id: 'bookmarks' as const, label: 'Bookmarks', icon: Bookmark },
  { id: 'history' as const, label: 'History', icon: Clock },
  { id: 'continue' as const, label: 'Continue Watching', icon: Play },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('bookmarks');
  const { bookmarks, removeBookmark, continueWatching, removeFromContinueWatching } = useAppStore();

  return (
    <div className="px-4 lg:px-8 py-6 min-h-screen">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          <span className="gradient-text">Your Library</span>
        </h1>
        <p className="text-text-secondary">
          Manage your bookmarks, watch history, and continue watching queue.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = 
            tab.id === 'bookmarks' ? bookmarks.length :
            tab.id === 'history' ? 0 : continueWatching.length;

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                'flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                isActive
                  ? 'bg-accent text-white'
                  : 'bg-surface-glass text-text-secondary hover:bg-white/10'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {count > 0 && (
                <span className={clsx(
                  'px-2 py-0.5 rounded-full text-xs',
                  isActive ? 'bg-white/20' : 'bg-accent/20'
                )}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'bookmarks' && (
          <motion.div
            key="bookmarks"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {bookmarks.map((media, index) => (
                  <LibraryItemCard
                    key={media.id}
                    media={media}
                    onRemove={() => removeBookmark(media.id)}
                    onClick={() => useAppStore.getState().openPlayer(media)}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bookmark}
                title="No bookmarks yet"
                description="Save your favorite movies, series, and anime to access them quickly."
              />
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <EmptyState
              icon={Clock}
              title="Watch history is empty"
              description="Your viewing history will appear here."
            />
          </motion.div>
        )}

        {activeTab === 'continue' && (
          <motion.div
            key="continue"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {continueWatching.length > 0 ? (
              <div className="space-y-4">
                {continueWatching.map((item, index) => (
                  <ContinueWatchingItem
                    key={item.mediaId}
                    item={item}
                    onRemove={() => removeFromContinueWatching(item.mediaId)}
                    onClick={() => {
                      const media: MediaItem = {
                        id: item.mediaId,
                        title: item.title,
                        type: 'series',
                        poster: item.poster,
                      };
                      useAppStore.getState().openPlayer(media);
                    }}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Play}
                title="Nothing to continue"
                description="Start watching something and pick up where you left off."
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Library Item Card Component
function LibraryItemCard({
  media,
  onRemove,
  onClick,
  index,
}: {
  media: MediaItem;
  onRemove: () => void;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative group"
    >
      <motion.button
        onClick={onClick}
        whileHover={{ y: -8 }}
        whileTap={{ scale: 0.98 }}
        className="w-full text-left"
      >
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3">
          <img
            src={media.poster || 'https://picsum.photos/seed/default/300/450'}
            alt={media.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <div className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-md',
              media.type === 'movie' && 'bg-blue-500/80',
              media.type === 'series' && 'bg-purple-500/80',
              media.type === 'anime' && 'bg-pink-500/80'
            )}>
              {media.type === 'movie' && <Film className="w-3 h-3" />}
              {media.type === 'series' && <Tv className="w-3 h-3" />}
              {media.type === 'anime' && <Sparkles className="w-3 h-3" />}
              <span className="capitalize">{media.type}</span>
            </div>
          </div>
        </div>
        
        <h3 className="text-sm font-medium text-text-primary truncate">{media.title}</h3>
        {media.year && (
          <p className="text-xs text-text-muted">{media.year}</p>
        )}
      </motion.button>

      {/* Remove button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
      >
        <Trash2 className="w-4 h-4 text-white" />
      </motion.button>
    </motion.div>
  );
}

// Continue Watching Item Component
function ContinueWatchingItem({
  item,
  onRemove,
  onClick,
  index,
}: {
  item: any;
  onRemove: () => void;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 glass rounded-2xl hover:bg-white/5 transition-colors group"
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-24 h-36 rounded-xl overflow-hidden flex-shrink-0"
      >
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Play className="w-8 h-8 text-white" fill="currentColor" />
        </div>
      </motion.button>

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-text-primary truncate mb-1">
          {item.title}
        </h3>
        <p className="text-sm text-text-secondary mb-2">
          {item.episodeNumber && `Episode ${item.episodeNumber}`}
          {item.seasonNumber && ` • Season ${item.seasonNumber}`}
          {item.providerName && ` • ${item.providerName}`}
        </p>
        
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              className="h-full bg-accent rounded-full"
            />
          </div>
          <span className="text-xs text-text-muted">{item.progress}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          onClick={onClick}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Play className="w-5 h-5 text-accent" />
        </motion.button>
        <motion.button
          onClick={onRemove}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5 text-text-muted hover:text-red-500" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Empty State Component
function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-glass flex items-center justify-center">
        <Icon className="w-10 h-10 text-text-muted" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-md mx-auto">{description}</p>
    </motion.div>
  );
}
