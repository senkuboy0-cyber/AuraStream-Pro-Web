/**
 * Sidebar Component
 * 
 * Navigation sidebar with glassmorphic design.
 * Uses SVG icons only (no emojis) for all navigation items.
 */

'use client';

import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  Library, 
  Puzzle, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

interface SidebarProps {
  currentPage: 'home' | 'search' | 'library' | 'extensions' | 'settings';
  onPageChange: (page: 'home' | 'search' | 'library' | 'extensions' | 'settings') => void;
  className?: string;
  isMobile?: boolean;
}

const navItems = [
  { id: 'home' as const, label: 'Home', icon: Home },
  { id: 'search' as const, label: 'Search', icon: Search },
  { id: 'library' as const, label: 'Library', icon: Library },
  { id: 'extensions' as const, label: 'Extensions', icon: Puzzle },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export default function Sidebar({ 
  currentPage, 
  onPageChange, 
  className = '',
  isMobile = false 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isCollapsed && !isMobile ? 80 : 240 
      }}
      className={clsx(
        'flex flex-col h-full glass border-r border-border-subtle',
        className
      )}
    >
      {/* Logo section */}
      <div className="p-4 flex items-center justify-between border-b border-border-subtle">
        {!isCollapsed && !isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
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
            <div>
              <h1 className="font-bold text-text-primary">
                <span className="gradient-text">AuraStream</span>
              </h1>
              <p className="text-xs text-text-muted">Pro Web</p>
            </div>
          </motion.div>
        )}
        
        {/* Collapse button */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-text-muted" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-text-muted" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative',
                isActive
                  ? 'bg-accent/20 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              <Icon className={clsx(
                'w-5 h-5 flex-shrink-0',
                isActive && 'text-accent'
              )} />
              
              {(!isCollapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && !isMobile && (
        <div className="p-4 border-t border-border-subtle">
          <div className="glass-dark rounded-xl p-3">
            <p className="text-xs text-text-muted mb-1">Version</p>
            <p className="text-sm text-text-primary font-mono">1.0.0</p>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
