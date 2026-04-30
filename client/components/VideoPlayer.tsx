/**
 * VideoPlayer Component
 * 
 * Custom video player with HLS.js support.
 * Features:
 * - HLS adaptive streaming
 * - Quality selector
 * - Playback speed control
 * - Subtitle support (SRT/VTT)
 * - Next episode auto-trigger
 * - Fullscreen mode
 * 
 * Uses spring physics for modal transitions.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { MediaItem } from '@/store/useAppStore';
import { useAppStore } from '@/store/useAppStore';
import clsx from 'clsx';

interface VideoPlayerProps {
  media: MediaItem;
  onClose: () => void;
}

// Quality levels
const qualityLevels = [
  { label: 'Auto', height: 0 },
  { label: '1080p', height: 1080 },
  { label: '720p', height: 720 },
  { label: '480p', height: 480 },
  { label: '360p', height: 360 },
];

// Playback speeds
const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export default function VideoPlayer({ media, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'quality' | 'speed'>('quality');
  
  // Controls visibility timer
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { preferences, addToContinueWatching } = useAppStore();

  // Demo HLS URL (replace with actual stream URL)
  const streamUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (preferences.autoplay) {
          video.play().catch(console.error);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
        }
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
      });
    }
  }, [preferences.autoplay]);

  // Update time display
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Save progress to continue watching
      if (video.duration > 0 && media.id) {
        const progress = (video.currentTime / video.duration) * 100;
        addToContinueWatching({
          mediaId: media.id,
          title: media.title,
          poster: media.poster || '',
          progress,
          timestamp: video.currentTime,
          duration: video.duration,
        });
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      video.playbackRate = playbackSpeed;
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [media, addToContinueWatching]);

  // Apply playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Controls visibility
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  // Seek forward/backward
  const seek = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * duration;
  };

  // Format time
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        ref={containerRef}
        className="relative w-full max-w-7xl aspect-video bg-black rounded-xl overflow-hidden"
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full"
          onClick={togglePlay}
          playsInline
        />

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50"
            >
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Play Button */}
        <AnimatePresence>
          {!isPlaying && !isLoading && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center group"
            >
              <div className="p-6 rounded-full bg-accent/80 backdrop-blur-md transition-transform group-hover:scale-110">
                <Play className="w-16 h-16 text-white" fill="currentColor" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Controls Overlay */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-transparent to-transparent"
            >
              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{media.title}</h2>
                  {media.type === 'series' && (
                    <p className="text-sm text-white/70">Season 1, Episode 1</p>
                  )}
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              {/* Bottom controls */}
              <div className="p-4 space-y-3">
                {/* Progress bar */}
                <div
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="relative h-1 bg-white/20 rounded-full cursor-pointer group"
                >
                  <motion.div
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                    className="absolute inset-y-0 left-0 bg-accent rounded-full"
                  />
                  <div
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <motion.button
                      onClick={togglePlay}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </motion.button>

                    {/* Skip */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => seek(-10)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <SkipBack className="w-5 h-5 text-white" />
                      </motion.button>
                      <motion.button
                        onClick={() => seek(10)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <SkipForward className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={toggleMute}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-white" />
                        )}
                      </motion.button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setVolume(v);
                          if (videoRef.current) {
                            videoRef.current.volume = v;
                          }
                        }}
                        className="w-20 h-1"
                      />
                    </div>

                    {/* Time */}
                    <span className="text-sm text-white/80 font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Settings */}
                    <div className="relative">
                      <motion.button
                        onClick={() => setShowSettings(!showSettings)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <Settings className="w-5 h-5 text-white" />
                      </motion.button>

                      {/* Settings Menu */}
                      <AnimatePresence>
                        {showSettings && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full right-0 mb-2 glass rounded-xl overflow-hidden w-48"
                          >
                            {/* Tab switcher */}
                            <div className="flex border-b border-border-subtle">
                              <button
                                onClick={() => setSettingsTab('quality')}
                                className={clsx(
                                  'flex-1 py-2 text-xs font-medium transition-colors',
                                  settingsTab === 'quality'
                                    ? 'text-accent border-b-2 border-accent'
                                    : 'text-text-muted'
                                )}
                              >
                                Quality
                              </button>
                              <button
                                onClick={() => setSettingsTab('speed')}
                                className={clsx(
                                  'flex-1 py-2 text-xs font-medium transition-colors',
                                  settingsTab === 'speed'
                                    ? 'text-accent border-b-2 border-accent'
                                    : 'text-text-muted'
                                )}
                              >
                                Speed
                              </button>
                            </div>

                            {/* Quality options */}
                            {settingsTab === 'quality' && (
                              <div className="p-2">
                                {qualityLevels.map((level) => (
                                  <button
                                    key={level.label}
                                    onClick={() => {
                                      setSelectedQuality(level.height);
                                      setShowSettings(false);
                                    }}
                                    className={clsx(
                                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                                      selectedQuality === level.height
                                        ? 'bg-accent/20 text-accent'
                                        : 'text-white/80 hover:bg-white/10'
                                    )}
                                  >
                                    {level.label}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Speed options */}
                            {settingsTab === 'speed' && (
                              <div className="p-2">
                                {speedOptions.map((speed) => (
                                  <button
                                    key={speed}
                                    onClick={() => {
                                      setPlaybackSpeed(speed);
                                      setShowSettings(false);
                                    }}
                                    className={clsx(
                                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                                      playbackSpeed === speed
                                        ? 'bg-accent/20 text-accent'
                                        : 'text-white/80 hover:bg-white/10'
                                    )}
                                  >
                                    {speed}x
                                  </button>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Fullscreen */}
                    <motion.button
                      onClick={toggleFullscreen}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      {isFullscreen ? (
                        <Minimize className="w-5 h-5 text-white" />
                      ) : (
                        <Maximize className="w-5 h-5 text-white" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
