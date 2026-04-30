/**
 * SettingsPage Component
 * 
 * User settings and preferences page.
 * Features:
 * - Player settings
 * - Subtitle preferences
 * - App appearance
 * - Data management
 */

'use client';

import { motion } from 'framer-motion';
import { 
  Settings, 
  Play, 
  Subtitles, 
  Palette, 
  Database,
  Shield,
  Info,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import clsx from 'clsx';

const settingsSections = [
  { id: 'player', label: 'Player', icon: Play },
  { id: 'subtitles', label: 'Subtitles', icon: Subtitles },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'data', label: 'Data & Storage', icon: Database },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'about', label: 'About', icon: Info },
];

const qualityOptions = ['auto', '240p', '360p', '480p', '720p', '1080p', '1440p', '4K'];
const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
const languageOptions = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'pt', 'it', 'ru'];

export default function SettingsPage() {
  const { preferences, setPreferences } = useAppStore();
  const [activeSection, setActiveSection] = useState('player');

  return (
    <div className="px-4 lg:px-8 py-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-text-secondary">
            Customize your AuraStream experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass rounded-2xl p-2 sticky top-24">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    whileTap={{ scale: 0.98 }}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-accent/20 text-accent'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {section.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.nav>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="glass rounded-2xl p-6">
              {activeSection === 'player' && (
                <SettingsSection title="Player Settings">
                  {/* Default Quality */}
                  <SettingItem label="Default Video Quality">
                    <select
                      value={preferences.defaultQuality}
                      onChange={(e) => setPreferences({ defaultQuality: e.target.value })}
                      className="px-4 py-2 bg-background-secondary border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent"
                    >
                      {qualityOptions.map((q) => (
                        <option key={q} value={q}>{q === 'auto' ? 'Auto' : q}</option>
                      ))}
                    </select>
                  </SettingItem>

                  {/* Autoplay */}
                  <SettingItem label="Autoplay Next Episode">
                    <ToggleSwitch
                      checked={preferences.autoplay}
                      onChange={(checked) => setPreferences({ autoplay: checked })}
                    />
                  </SettingItem>

                  {/* Playback Speed */}
                  <SettingItem label="Default Playback Speed">
                    <select
                      value={preferences.playbackSpeed}
                      onChange={(e) => setPreferences({ playbackSpeed: parseFloat(e.target.value) })}
                      className="px-4 py-2 bg-background-secondary border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent"
                    >
                      {speedOptions.map((s) => (
                        <option key={s} value={s}>{s}x</option>
                      ))}
                    </select>
                  </SettingItem>
                </SettingsSection>
              )}

              {activeSection === 'subtitles' && (
                <SettingsSection title="Subtitle Settings">
                  {/* Enable Subtitles */}
                  <SettingItem label="Enable Subtitles">
                    <ToggleSwitch
                      checked={preferences.subtitlesEnabled}
                      onChange={(checked) => setPreferences({ subtitlesEnabled: checked })}
                    />
                  </SettingItem>

                  {/* Default Language */}
                  <SettingItem label="Default Subtitle Language">
                    <select
                      value={preferences.defaultSubtitleLanguage}
                      onChange={(e) => setPreferences({ defaultSubtitleLanguage: e.target.value })}
                      className="px-4 py-2 bg-background-secondary border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent"
                    >
                      {languageOptions.map((lang) => (
                        <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                      ))}
                    </select>
                  </SettingItem>
                </SettingsSection>
              )}

              {activeSection === 'appearance' && (
                <SettingsSection title="Appearance Settings">
                  <SettingItem label="Theme">
                    <div className="flex gap-2">
                      {['dark', 'light', 'auto'].map((theme) => (
                        <motion.button
                          key={theme}
                          onClick={() => setPreferences({ theme: theme as any })}
                          whileTap={{ scale: 0.95 }}
                          className={clsx(
                            'px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize',
                            preferences.theme === theme
                              ? 'bg-accent text-white'
                              : 'bg-background-secondary text-text-secondary hover:bg-white/10'
                          )}
                        >
                          {theme}
                        </motion.button>
                      ))}
                    </div>
                  </SettingItem>
                </SettingsSection>
              )}

              {activeSection === 'data' && (
                <SettingsSection title="Data & Storage">
                  <SettingItem label="Clear Watch History">
                    <ActionButton variant="danger">Clear Now</ActionButton>
                  </SettingItem>
                  <SettingItem label="Clear All Bookmarks">
                    <ActionButton variant="danger">Clear Now</ActionButton>
                  </SettingItem>
                  <SettingItem label="Clear Continue Watching">
                    <ActionButton variant="danger">Clear Now</ActionButton>
                  </SettingItem>
                  <SettingItem label="Export Data">
                    <ActionButton variant="secondary">Export</ActionButton>
                  </SettingItem>
                </SettingsSection>
              )}

              {activeSection === 'security' && (
                <SettingsSection title="Security Settings">
                  <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                    <p className="text-green-400 text-sm">
                      All plugins are executed in secure sandboxed environments with no access to your system.
                    </p>
                  </div>
                </SettingsSection>
              )}

              {activeSection === 'about' && (
                <SettingsSection title="About AuraStream">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border-subtle">
                      <span className="text-text-secondary">Version</span>
                      <span className="text-text-primary font-mono">1.0.0</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border-subtle">
                      <span className="text-text-secondary">Build</span>
                      <span className="text-text-primary font-mono">2024.04.30</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-text-secondary">License</span>
                      <span className="text-text-primary">MIT</span>
                    </div>
                    <div className="pt-4">
                      <p className="text-text-muted text-sm">
                        AuraStream Pro Web is a high-end streaming platform with plugin-based architecture.
                        Built with Next.js, Tailwind CSS, and Framer Motion.
                      </p>
                    </div>
                  </div>
                </SettingsSection>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Settings Section Component
function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// Setting Item Component
function SettingItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-text-secondary">{label}</span>
      {children}
    </div>
  );
}

// Toggle Switch Component
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <motion.button
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        'relative w-12 h-7 rounded-full transition-colors',
        checked ? 'bg-accent' : 'bg-white/20'
      )}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
      />
    </motion.button>
  );
}

// Action Button Component
function ActionButton({ variant = 'primary', children, onClick }: { 
  variant?: 'primary' | 'secondary' | 'danger'; 
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
        variant === 'primary' && 'bg-accent text-white hover:bg-accent-hover',
        variant === 'secondary' && 'bg-background-secondary text-text-primary hover:bg-white/10',
        variant === 'danger' && 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
      )}
    >
      {children}
    </motion.button>
  );
}
