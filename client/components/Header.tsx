/**
 * Header Component
 * 
 * Main navigation header with search bar and user controls.
 * Features glassmorphic design with blur effects.
 */

'use client';

import { motion } from 'framer-motion';
import { Search, Menu, Bell, User } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface HeaderProps {
  onSearchClick: () => void;
  onMenuToggle: () => void;
}

export default function Header({ onSearchClick, onMenuToggle }: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-30 px-4 lg:px-6 py-4">
      <div className="glass rounded-2xl px-4 py-3 flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-text-primary" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 text-white"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-text-primary">
              <span className="gradient-text">AuraStream</span>
              <span className="text-text-muted text-sm ml-1">Pro</span>
            </h1>
          </div>
        </div>

        {/* Search bar */}
        <motion.div
          className={clsx(
            'flex-1 max-w-2xl mx-auto relative',
            isSearchFocused && 'scale-[1.02]'
          )}
          animate={{
            scale: isSearchFocused ? 1.02 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <button
            onClick={onSearchClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-background-secondary/50 rounded-xl border border-border-subtle hover:border-border-active transition-all cursor-text"
          >
            <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
            <span className="text-text-muted flex-1 text-left">
              Search movies, series, anime...
            </span>
            <div className="hidden sm:flex items-center gap-1 text-xs text-text-muted bg-background-tertiary px-2 py-1 rounded-lg">
              <kbd className="font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="font-mono">K</kbd>
            </div>
          </button>
        </motion.div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors hidden sm:flex"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>
          <button
            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
            aria-label="User profile"
          >
            <User className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>
    </header>
  );
}
