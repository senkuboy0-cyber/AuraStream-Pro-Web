'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Menu, Bell, User, Home as HomeIcon, Library, Puzzle, Settings } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'extensions', label: 'Extensions', icon: Puzzle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-4 z-40 hidden lg:block">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <span className="text-xl">A</span>
          </div>
          <h1 className="text-xl font-bold">
            <span className="gradient-text">AuraStream</span>
          </h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button className="lg:hidden p-2 glass rounded-xl">
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-2xl mx-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 glass rounded-xl text-white/70 hover:text-white transition-all">
              <Search className="w-5 h-5" />
              <span>Search movies, series...</span>
              <kbd className="ml-auto text-xs bg-white/10 px-2 py-1 rounded">Ctrl+K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 glass rounded-xl">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 glass rounded-xl">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-[#050505] to-[#050505]" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574375424888-27f9b480bf6c?w=1920&h=600&fit=crop')] bg-cover bg-center opacity-20" />

          <div className="relative p-8 lg:p-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="px-3 py-1 bg-purple-600/30 rounded-full text-sm text-purple-300">
                Welcome to AuraStream
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl lg:text-6xl font-bold mb-4"
            >
              <span className="gradient-text">Stream Anything,</span>
              <br />
              <span className="text-white">Anywhere</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 text-lg mb-8 max-w-xl"
            >
              Next-generation streaming with dynamic providers, ultra-low latency, and stunning 4K quality.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors glow">
                <span>Start Watching</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 glass hover:bg-white/10 rounded-xl font-medium transition-colors">
                <span>Browse Trending</span>
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* Continue Watching */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Continue Watching</h2>
            <button className="text-sm text-purple-400 hover:text-purple-300">View All</button>
          </div>
          <p className="text-white/50">Start watching to see your progress here.</p>
        </motion.section>

        {/* Trending Movies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Trending Movies</h2>
            <button className="text-sm text-purple-400 hover:text-purple-300">See All</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3">
                  <img
                    src={`https://picsum.photos/seed/movie${i}/300/450`}
                    alt={`Movie ${i}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-blue-600/80 rounded-lg text-xs">Movie</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs">
                      <span>8.{i}</span>
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-3 rounded-full bg-purple-600/90">
                      <span className="text-xl">▶</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-white truncate">Sample Movie {i}</h3>
                <p className="text-xs text-white/50">202{i}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Popular Series */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Popular Series</h2>
            <button className="text-sm text-purple-400 hover:text-purple-300">Browse All</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3">
                  <img
                    src={`https://picsum.photos/seed/series${i}/300/450`}
                    alt={`Series ${i}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-purple-600/80 rounded-lg text-xs">Series</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-3 rounded-full bg-purple-600/90">
                      <span className="text-xl">▶</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-white truncate">Sample Series {i}</h3>
                <p className="text-xs text-white/50">202{i}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
