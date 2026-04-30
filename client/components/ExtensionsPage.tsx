/**
 * ExtensionsPage Component
 * 
 * Extension Manager page for managing provider repositories.
 * Features:
 * - Add new repositories via URL
 * - Browse installed repositories
 * - Enable/disable repositories
 * - Refresh repository providers
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Puzzle,
  Server
} from 'lucide-react';
import { useState } from 'react';
import { useAppStore, Repository } from '@/store/useAppStore';
import clsx from 'clsx';

// Sample repositories for demonstration
const sampleRepositories: Repository[] = [
  {
    id: '1',
    name: 'CloudStream Providers',
    url: 'https://raw.githubusercontent.com/repo1/repo.json',
    version: '2.0.0',
    providerCount: 15,
    providers: [
      { id: 'p1', name: 'MovieProvider', version: '1.0.0', capabilities: { search: true, getDetails: true, getSources: true } },
      { id: 'p2', name: 'SeriesProvider', version: '1.0.0', capabilities: { search: true, getDetails: true, getSources: true } },
    ],
    isActive: true,
    installedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'AnimeStream Sources',
    url: 'https://raw.githubusercontent.com/repo2/repo.json',
    version: '1.5.0',
    providerCount: 8,
    providers: [
      { id: 'p3', name: 'AnimeProvider', version: '1.0.0', capabilities: { search: true, getDetails: true, getSources: true } },
    ],
    isActive: true,
    installedAt: new Date().toISOString(),
  },
];

export default function ExtensionsPage() {
  const [repositories, setRepositories] = useState<Repository[]>(sampleRepositories);
  const [isAddingRepo, setIsAddingRepo] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);

  // Add new repository
  const handleAddRepository = async () => {
    if (!newRepoUrl.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newRepo: Repository = {
      id: Date.now().toString(),
      name: 'New Repository',
      url: newRepoUrl,
      version: '1.0.0',
      providerCount: 5,
      providers: [],
      isActive: true,
      installedAt: new Date().toISOString(),
    };
    
    setRepositories([newRepo, ...repositories]);
    setNewRepoUrl('');
    setIsAddingRepo(false);
    setIsLoading(false);
  };

  // Toggle repository active state
  const toggleRepository = (repoId: string) => {
    setRepositories(repos =>
      repos.map(repo =>
        repo.id === repoId ? { ...repo, isActive: !repo.isActive } : repo
      )
    );
  };

  // Remove repository
  const removeRepository = (repoId: string) => {
    setRepositories(repos => repos.filter(repo => repo.id !== repoId));
  };

  // Refresh repository
  const refreshRepository = async (repoId: string) => {
    setIsLoading(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="px-4 lg:px-8 py-6 min-h-screen">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            <span className="gradient-text">Extensions</span>
          </h1>
          <p className="text-text-secondary">
            Manage streaming provider repositories.
          </p>
        </div>
        <motion.button
          onClick={() => setIsAddingRepo(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-3 bg-accent hover:bg-accent-hover rounded-xl font-medium transition-colors glow"
        >
          <Plus className="w-5 h-5" />
          Add Repository
        </motion.button>
      </motion.div>

      {/* Add Repository Modal */}
      <AnimatePresence>
        {isAddingRepo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddingRepo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-lg"
            >
              <h2 className="text-xl font-bold text-text-primary mb-4">Add Repository</h2>
              
              <div className="mb-6">
                <label className="block text-sm text-text-secondary mb-2">
                  Repository URL
                </label>
                <input
                  type="url"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/user/repo/main/repo.json"
                  className="w-full px-4 py-3 bg-background-secondary border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                />
                <p className="text-xs text-text-muted mt-2">
                  Enter the raw GitHub URL to a repository's repo.json file.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <motion.button
                  onClick={() => setIsAddingRepo(false)}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 glass hover:bg-white/10 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleAddRepository}
                  disabled={!newRepoUrl.trim() || isLoading}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Repository
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Repository List */}
      <div className="space-y-4">
        {repositories.map((repo, index) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={clsx(
              'glass rounded-2xl overflow-hidden transition-opacity',
              !repo.isActive && 'opacity-60'
            )}
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Repository icon */}
                  <div className="p-3 rounded-xl bg-accent/20">
                    <Server className="w-6 h-6 text-accent" />
                  </div>
                  
                  {/* Repository info */}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {repo.name}
                      </h3>
                      {repo.isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-text-muted" />
                      )}
                    </div>
                    <p className="text-sm text-text-muted mb-2 truncate max-w-md">
                      {repo.url}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Puzzle className="w-4 h-4" />
                        {repo.providerCount} providers
                      </span>
                      <span>v{repo.version}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => toggleRepository(repo.id)}
                    whileTap={{ scale: 0.95 }}
                    className={clsx(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                      repo.isActive
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-surface-glass text-text-secondary hover:bg-white/10'
                    )}
                  >
                    {repo.isActive ? 'Enabled' : 'Disabled'}
                  </motion.button>
                  <motion.button
                    onClick={() => refreshRepository(repo.id)}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <RefreshCw className={clsx(
                      'w-5 h-5 text-text-secondary',
                      isLoading && 'animate-spin'
                    )} />
                  </motion.button>
                  <motion.button
                    onClick={() => removeRepository(repo.id)}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-red-500/20 rounded-xl transition-colors group"
                  >
                    <Trash2 className="w-5 h-5 text-text-muted group-hover:text-red-500" />
                  </motion.button>
                </div>
              </div>

              {/* Expand to show providers */}
              <motion.button
                onClick={() => setExpandedRepo(expandedRepo === repo.id ? null : repo.id)}
                className="flex items-center gap-1 mt-4 text-sm text-text-muted hover:text-text-secondary transition-colors"
              >
                {expandedRepo === repo.id ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {repo.providers.length} providers
              </motion.button>
            </div>

            {/* Expanded providers list */}
            <AnimatePresence>
              {expandedRepo === repo.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border-subtle"
                >
                  <div className="p-5 space-y-2">
                    {repo.providers.map((provider) => (
                      <div
                        key={provider.id}
                        className="flex items-center justify-between p-3 bg-background-secondary/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-accent/10">
                            <Puzzle className="w-4 h-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {provider.name}
                            </p>
                            <p className="text-xs text-text-muted">v{provider.version}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {provider.capabilities.search && (
                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-lg">Search</span>
                          )}
                          {provider.capabilities.getSources && (
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg">Sources</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {repositories.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-glass flex items-center justify-center">
            <Puzzle className="w-10 h-10 text-text-muted" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No repositories installed
          </h3>
          <p className="text-text-secondary max-w-md mx-auto mb-6">
            Add streaming provider repositories to enable content discovery and playback.
          </p>
          <motion.button
            onClick={() => setIsAddingRepo(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-5 py-3 bg-accent hover:bg-accent-hover rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Repository
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
