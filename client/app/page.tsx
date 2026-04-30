/**
 * AuraStream Pro Web - Main Application Page
 * 
 * This is the main entry point for the AuraStream web application.
 * It features a responsive layout with glassmorphic design,
 * animated components, and real-time search functionality.
 */

'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import HomePage from '@/components/HomePage';
import SearchPage from '@/components/SearchPage';
import LibraryPage from '@/components/LibraryPage';
import ExtensionsPage from '@/components/ExtensionsPage';
import SettingsPage from '@/components/SettingsPage';
import VideoPlayer from '@/components/VideoPlayer';
import { useAppStore } from '@/store/useAppStore';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'home' | 'search' | 'library' | 'extensions' | 'settings'>('home');
  const { selectedMedia, setSelectedMedia, isPlayerOpen, closePlayer } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close player
      if (e.key === 'Escape' && isPlayerOpen) {
        closePlayer();
      }
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCurrentPage('search');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerOpen, closePlayer]);

  // Render current page content
  const renderPage = () => {
    switch (currentPage) {
      case 'search':
        return <SearchPage />;
      case 'library':
        return <LibraryPage />;
      case 'extensions':
        return <ExtensionsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage onMediaSelect={setSelectedMedia} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main layout */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar - Desktop */}
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          className="hidden lg:flex"
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header
            onSearchClick={() => setCurrentPage('search')}
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto pb-24">
            <AnimatePresence mode="wait">
              <div
                key={currentPage}
                className="animate-fade-in"
              >
                {renderPage()}
              </div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <Sidebar
              currentPage={currentPage}
              onPageChange={(page) => {
                setCurrentPage(page);
                setIsMobileMenuOpen(false);
              }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
              isMobile
            />
          </>
        )}
      </AnimatePresence>

      {/* Video Player Modal */}
      <AnimatePresence>
        {isPlayerOpen && selectedMedia && (
          <VideoPlayer
            media={selectedMedia}
            onClose={closePlayer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Import motion for animations
import { motion } from 'framer-motion';
