/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize2, 
  ShieldAlert, ArrowLeft, RefreshCw, Tv, Lock, Unlock, Settings, 
  Check, Sliders, SlidersHorizontal, X, Minimize2
} from 'lucide-react';
import { Channel } from '../types';

interface LivePlayerProps {
  channel: Channel;
  onBack: () => void;
  isPip?: boolean;
  onExpand?: () => void;
}

export default function LivePlayer({ channel, onBack, isPip = false, onExpand }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timeoutRef = useRef<any>(null);
  const controlTimeoutRef = useRef<any>(null);

  // Core Playback State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [aspectRatio, setAspectRatio] = useState<'fit' | 'fill' | 'stretch'>('fit');
  const [quality, setQuality] = useState('auto');
  const [isLocked, setIsLocked] = useState(false);
  
  // UI State
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [useBackupVisualizer, setUseBackupVisualizer] = useState(false);
  const [useProxy, setUseProxy] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('Connecting to live stream...');
  const [isLoading, setIsLoading] = useState(true);

  // Active statistics for better_player aesthetic
  const [activeBandwidth, setActiveBandwidth] = useState<string>('Calculating...');
  const [fps, setFps] = useState<number>(60);

  const initPlayer = () => {
    setErrorOccurred(false);
    setErrorMsg('Initiating secure proxy connection...');
    setIsLoading(true);
    setUseBackupVisualizer(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (channel.type === 'youtube') {
      setActiveBandwidth('Adaptive YouTube Stream');
      setIsLoading(false);
      return;
    }

    if (videoRef.current) {
      const video = videoRef.current;
      video.playbackRate = playbackSpeed;
      video.muted = isMuted;
      video.volume = volume;
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Start network timeout monitoring (20 seconds)
      timeoutRef.current = setTimeout(() => {
        console.warn('[BetterPlayer] Stream loading timed out.');
        setErrorMsg('The live stream connection timed out. Click retry below to reconnect.');
        setErrorOccurred(true);
        setIsLoading(false);
      }, 20000);

      const finalUrl = useProxy 
        ? `/api/proxy-m3u8?url=${encodeURIComponent(channel.url)}` 
        : channel.url;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari / iOS)
        video.src = finalUrl;
        video.play().catch((err) => {
          console.log('[BetterPlayer] Autoplay blocked or native play error:', err ? err.message : '');
          setIsPlaying(false);
          // Do not treat browser autoplay block as a stream failure.
          // Let the user click play to initiate the stream.
        });
      } else if (Hls.isSupported()) {
        // Hls.js library (Chrome, Firefox, Edge, etc.)
        const hls = new Hls({
          maxMaxBufferLength: 15,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30
        });
        hlsRef.current = hls;
        hls.loadSource(finalUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setIsLoading(false);
          if (isPlaying) {
            video.play().catch(() => setIsPlaying(false));
          }
        });

        hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
          const sizeKb = data.frag.stats.loaded;
          const durationMs = data.frag.stats.loading.end - data.frag.stats.loading.start;
          if (durationMs > 0) {
            const kbps = Math.round((sizeKb / 1024) / (durationMs / 1000) * 8);
            setActiveBandwidth(`${kbps} Kbps`);
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.response && (data.response as any).status === 404) {
            setErrorMsg("Stream returned 404 Not Found error. Source is currently offline.");
            setErrorOccurred(true);
            setIsLoading(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
          }

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (!useProxy) {
                  setUseProxy(true);
                } else {
                  hls.startLoad();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setErrorMsg("An unrecoverable media decoding error occurred.");
                setErrorOccurred(true);
                setIsLoading(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                break;
            }
          }
        });
      } else {
        setErrorMsg("Your web browser does not support HLS stream playback.");
        setErrorOccurred(true);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    initPlayer();
    // Simulate FPS counter fluctuation
    const interval = setInterval(() => {
      setFps(Math.floor(Math.random() * 4) + 57);
    }, 1500);

    resetControlTimeout();

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
      clearInterval(interval);
    };
  }, [channel, useProxy]);

  // Handle visibilitychange (for browser tabs PIP mode transition)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === 'hidden' && 
        videoRef.current && 
        isPlaying && 
        !useBackupVisualizer && 
        channel.type !== 'youtube'
      ) {
        try {
          if (document.pictureInPictureEnabled && videoRef.current.requestPictureInPicture) {
            await videoRef.current.requestPictureInPicture();
          }
        } catch (err) {
          console.warn('[BetterPlayer] Browser Picture-in-Picture error:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, useBackupVisualizer, channel]);

  // Handle Autohiding Controls
  const resetControlTimeout = () => {
    if (isLocked) return;
    setShowControls(true);
    if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
    controlTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
      setShowSettingsMenu(false);
    }, 4000);
  };

  const handleContainerMouseMove = () => {
    resetControlTimeout();
  };

  const handleContainerTouch = () => {
    if (showControls) {
      setShowControls(false);
      setShowSettingsMenu(false);
    } else {
      resetControlTimeout();
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isLocked) return;
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => setErrorOccurred(true));
      }
    }
    setIsPlaying(!isPlaying);
    resetControlTimeout();
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isLocked) return;

    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
    resetControlTimeout();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
    setIsMuted(v === 0);
    resetControlTimeout();
  };

  const handleSpeedChange = (speedVal: number) => {
    setPlaybackSpeed(speedVal);
    if (videoRef.current) {
      videoRef.current.playbackRate = speedVal;
    }
    setShowSettingsMenu(false);
    resetControlTimeout();
  };

  const skipSeconds = (seconds: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isLocked) return;
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
    resetControlTimeout();
  };

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLock = !isLocked;
    setIsLocked(nextLock);
    if (nextLock) {
      setShowControls(false);
      setShowSettingsMenu(false);
    } else {
      setShowControls(true);
      resetControlTimeout();
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    initPlayer();
  };

  const cycleAspectRatio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) return;
    const modes: ('fit' | 'fill' | 'stretch')[] = ['fit', 'fill', 'stretch'];
    const nextIndex = (modes.indexOf(aspectRatio) + 1) % modes.length;
    setAspectRatio(modes[nextIndex]);
    resetControlTimeout();
  };

  // Get CSS for aspect ratio video sizing
  const getVideoClass = () => {
    switch (aspectRatio) {
      case 'fill': return 'w-full h-full object-cover scale-105 transition-all';
      case 'stretch': return 'w-full h-full object-fill transition-all';
      default: return 'w-full h-full object-contain transition-all';
    }
  };

  return (
    <div 
      id={isPip ? "better-player-pip-root" : "better-player-root"} 
      className={isPip 
        ? "fixed bottom-24 right-4 w-72 sm:w-80 aspect-video z-50 bg-zinc-950 text-white rounded-2xl border-2 border-red-500/40 overflow-hidden shadow-2xl flex flex-col transition-all duration-300 hover:scale-105 group/pip animate-fade-in"
        : "w-full flex flex-col bg-zinc-950 text-white rounded-3xl border border-red-500/20 overflow-hidden relative group shadow-[0_0_35px_rgba(229,9,20,0.15)] transition-all duration-300"
      }
      onMouseMove={handleContainerMouseMove}
      onTouchStart={handleContainerTouch}
      onClick={() => resetControlTimeout()}
    >
      
      {/* Top Header - Glass Red styling */}
      {isPip ? (
        <div 
          id="pip-player-header"
          className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black via-black/40 to-transparent flex items-center justify-between z-30 opacity-0 group-hover/pip:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
        >
          <div className="flex items-center gap-1.5 truncate max-w-[140px] bg-zinc-950/85 px-2.5 py-1 rounded-full border border-red-500/10">
            <span className="font-extrabold text-[10px] truncate text-white">{channel.name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="pip-expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onExpand) onExpand();
              }}
              className="p-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white hover:text-red-500 hover:bg-zinc-800 transition cursor-pointer"
              title="Expand Player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              id="pip-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="p-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white hover:text-red-500 hover:bg-zinc-800 transition cursor-pointer"
              title="Close Stream"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          id="better-player-header"
          className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/95 via-black/40 to-transparent flex items-center justify-between z-30 transition-all duration-500 border-b border-red-500/5 backdrop-blur-md ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <button
            id="player-back-btn"
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950/70 backdrop-blur-md border border-red-500/10 text-white hover:bg-red-950/30 hover:border-red-500/30 transition-all text-xs font-semibold shadow-md shadow-black/50"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" />
            <span>Exit Player</span>
          </button>

        <div className="flex items-center gap-2.5 max-w-xs bg-zinc-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-red-500/15 shadow-md">
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-5 h-5 object-contain rounded-full bg-zinc-900 p-0.5 border border-white/5"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = 'https://i.ibb.co/M5Yn41H/skhandalogo.png';
            }}
          />
          <span className="font-extrabold text-xs truncate text-white">{channel.name}</span>
          <span className="flex items-center gap-1.5 text-[9px] bg-red-600 text-white px-2.5 py-0.5 rounded-full font-extrabold uppercase animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono font-bold px-2 py-1 bg-red-600/10 text-red-400 border border-red-500/20 rounded-md uppercase tracking-wider hidden sm:inline-block shadow-[0_0_8px_rgba(239,68,68,0.05)]">
            BetterPlayer V2.3
          </span>
          <button
            id="player-backup-feed-btn"
            onClick={(e) => {
              e.stopPropagation();
              setUseBackupVisualizer(!useBackupVisualizer);
            }}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${
              useBackupVisualizer 
                ? 'bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(220,38,38,0.2)]' 
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            Backup Feed
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div 
        id="better-player-viewport"
        className="relative w-full aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden"
        onClick={togglePlay}
      >
        
        {/* Loading Overlay */}
        {isLoading && !errorOccurred && !useBackupVisualizer && channel.type !== 'youtube' && (
          <div 
            id="player-loading-overlay" 
            className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-20 pointer-events-none"
          >
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-red-500/10 border-t-red-600 animate-spin"></div>
              <div className="absolute w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 animate-pulse flex items-center justify-center">
                <Tv className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <p className="text-xs font-bold text-zinc-300 animate-pulse tracking-wide font-sans">
              {errorMsg}
            </p>
          </div>
        )}

        {/* Stream Currently Unavailable Overlay */}
        {errorOccurred && !useBackupVisualizer ? (
          <div 
            id="player-error-overlay" 
            className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-xl p-6 text-center z-20 border border-red-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_15px_rgba(220,38,38,0.2)] animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Stream Currently Unavailable</h3>
            <p className="text-xs text-zinc-400 mt-2.5 max-w-sm leading-relaxed">
              {errorMsg}
            </p>
            
            <div className="flex gap-3 mt-6 flex-wrap justify-center">
              <button
                id="player-retry-btn"
                onClick={handleRetry}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all border border-red-400/20 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
              
              <button
                id="player-error-backup-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setUseBackupVisualizer(true);
                }}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-black rounded-xl transition-all active:scale-95"
              >
                Use Backup Feed
              </button>
            </div>
          </div>
        ) : useBackupVisualizer ? (
          /* Virtual High-Fidelity Backup stream */
          <div 
            id="player-backup-visualizer" 
            className="absolute inset-0 bg-gradient-to-br from-zinc-950 to-zinc-900 flex flex-col items-center justify-center z-10 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pulsing sound wave graphics */}
            <div className="flex items-end gap-1.5 mb-6 h-16 justify-center">
              {[0.4, 0.9, 0.6, 1.0, 0.7, 0.3, 0.8, 0.5, 0.9, 0.4].map((height, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                  style={{
                    height: `${height * 100}%`,
                    animationDuration: `${0.8 + i * 0.1}s`,
                    animationDelay: `${i * 0.05}s`
                  }}
                ></div>
              ))}
            </div>
            <div className="text-center relative z-10">
              <Tv className="w-12 h-12 text-red-500 mx-auto animate-bounce mb-3" />
              <h4 className="font-extrabold text-white text-sm">Virtual Live HD Feed</h4>
              <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest mt-1">
                Currently Playing: {channel.now_playing || 'Skhanda Originals TV Live'}
              </p>
              
              <div className="absolute bottom-4 left-4 right-4 bg-red-600 text-white py-1.5 px-3 rounded text-[10px] font-black uppercase tracking-wider overflow-hidden shadow-lg shadow-red-950/40">
                <div className="animate-marquee whitespace-nowrap inline-block">
                  🔥 BREAKING NEWS: SKHANDA TV V2.3 RUNNING IN STABLE RED-GLASS INTERACTION MODE -- TRIAL VALID -- NO YOUTUBE BUGS -- ENJOY THE LIVE BROADCASTS --
                </div>
              </div>
            </div>
          </div>
        ) : channel.type === 'youtube' ? (
          /* Standard YouTube iframe player */
          <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
            <iframe
              id="youtube-video-player"
              src={`${channel.url}${channel.url.includes('?') ? '&' : '?'}autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1`}
              title={channel.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          /* Standard HTML5 m3u8 player (BetterPlayer Engine) */
          <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              id="m3u8-video-player"
              className={getVideoClass()}
              playsInline
              onClick={togglePlay}
              onPlay={() => {
                setIsPlaying(true);
                setIsLoading(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
              }}
              onPlaying={() => {
                setIsPlaying(true);
                setIsLoading(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
              }}
              onPause={() => {
                setIsPlaying(false);
              }}
              onLoadedMetadata={() => {
                setIsLoading(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
              }}
              onError={() => {
                // If Hls.js is active, let Hls.js handle error recovery and state reporting.
                // The native video tag's onError event can fire false-positives (e.g. aborts)
                // during Hls.js initialization, teardown, or re-loads.
                if (hlsRef.current) {
                  console.log('[BetterPlayer] Native video error event ignored since Hls.js is active.');
                  return;
                }

                console.warn('[BetterPlayer] Native video error event fired.');
                const videoElement = videoRef.current;
                if (!videoElement) return;

                const error = videoElement.error;
                if (error) {
                  // Completely ignore aborted errors (code 1) as they are standard transient events
                  // when resetting, switching, or reloading stream sources.
                  if (error.code === 1) {
                    console.log('[BetterPlayer] Ignoring transient native abort error (code 1).');
                    return;
                  }

                  let errorDetails = "An error occurred during live stream loading.";
                  if (error.code === 2) errorDetails = "A network error prevented the stream download.";
                  else if (error.code === 3) errorDetails = "A media decoding/codec error occurred.";
                  else if (error.code === 4) errorDetails = "The requested live stream returned 404 or is temporarily offline.";

                  setErrorMsg(errorDetails);
                  setErrorOccurred(true);
                  setIsLoading(false);
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }
              }}
            />
          </div>
        )}

        {/* Ambient vignette overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/30 z-15"></div>

        {/* Big Center Play/Pause Indicator (HUD) */}
        {!isLocked && (showControls || isPip) && !errorOccurred && !useBackupVisualizer && (
          <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
            <button 
              className={`rounded-full bg-zinc-950/70 border border-red-500/20 text-white backdrop-blur-xl pointer-events-auto transition-all shadow-[0_0_20px_rgba(220,38,38,0.25)] ${
                isPip 
                  ? 'p-2.5 scale-90 opacity-0 group-hover/pip:opacity-100 duration-300' 
                  : 'p-5 scale-110 active:scale-95 duration-500'
              }`}
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className={isPip ? "w-4 h-4 text-red-500 fill-red-500" : "w-7 h-7 text-red-500 fill-red-500"} />
              ) : (
                <Play className={isPip ? "w-4 h-4 text-red-500 fill-red-500 translate-x-0.5" : "w-7 h-7 text-red-500 fill-red-500 translate-x-0.5"} />
              )}
            </button>
          </div>
        )}

        {/* Lock Screen HUD Notification */}
        {isLocked && !isPip && (
          <div className="absolute top-4 left-4 z-40 bg-red-600/20 backdrop-blur-md border border-red-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-widest shadow-lg">
            <Lock className="w-3.5 h-3.5" />
            <span>Screen Locked</span>
          </div>
        )}
      </div>

      {/* Screen Lock Toggle button (glowing red glass floating on right side) */}
      {!isPip && (
        <button
          id="player-screen-lock-btn"
          onClick={toggleLock}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full z-40 backdrop-blur-md transition-all shadow-md active:scale-90 ${
            isLocked 
              ? 'bg-red-600 border border-red-400 text-white shadow-red-500/40' 
              : `bg-zinc-950/75 border border-red-500/20 text-red-400 hover:bg-red-950/20 hover:border-red-500/40 ${
                  showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
                }`
          }`}
          title={isLocked ? 'Unlock player controls' : 'Lock player controls'}
        >
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>
      )}

      {/* Settings Panel - Floating Red Glass overlay */}
      {showSettingsMenu && !isLocked && (
        <div 
          id="player-settings-menu"
          className="absolute right-4 bottom-20 bg-zinc-950/95 backdrop-blur-xl border border-red-500/20 p-4 rounded-2xl z-40 w-52 shadow-[0_0_20px_rgba(220,38,38,0.3)] flex flex-col gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-red-500" />
              BetterPlayer Panel
            </span>
          </div>

          {/* Speed settings */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Speed</span>
            <div className="grid grid-cols-4 gap-1">
              {[0.5, 1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`py-1 text-[9px] font-mono font-bold rounded-lg transition-all ${
                    playbackSpeed === s 
                      ? 'bg-red-600 text-white font-extrabold shadow-[0_0_8px_rgba(220,38,38,0.4)]' 
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Player stats */}
          <div className="flex flex-col gap-1 border-t border-zinc-800 pt-2 text-[9px] font-mono text-zinc-500">
            <div className="flex justify-between">
              <span>Bandwidth:</span>
              <span className="text-zinc-300 font-bold">{activeBandwidth}</span>
            </div>
            <div className="flex justify-between">
              <span>Decoder:</span>
              <span className="text-zinc-300 font-bold">Hls.js Engine</span>
            </div>
            <div className="flex justify-between">
              <span>Target FPS:</span>
              <span className="text-green-500 font-bold">{fps} fps</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls Panel (only for m3u8 streams) */}
      {!isPip && (
        <div 
          id="player-controls-panel" 
          className={`p-4 bg-zinc-950/90 backdrop-blur-md border-t border-red-500/10 flex flex-col gap-3 relative z-25 transition-all duration-500 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Timeline bar / Live marker with neon red glowing indicator */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-red-500 font-black tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block"></span>
              LIVE BROADCAST
            </span>
            <div className="flex-1 bg-zinc-900 h-1 rounded-full relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-600 to-red-500 w-[95%] shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono tracking-widest">
              {playbackSpeed !== 1.0 ? `${playbackSpeed}x` : 'REAL-TIME'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            {/* Left: Play/Pause, Skip Back/Forward 10s, Volume controls */}
            <div className="flex items-center gap-3">
              <button
                id="player-play-toggle"
                onClick={togglePlay}
                className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-[0_0_10px_rgba(220,38,38,0.45)] transform hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              </button>

              <button
                id="player-skip-back"
                onClick={(e) => skipSeconds(-10, e)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 transition-all hover:border-zinc-750"
                title="Rewind 10s"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                id="player-skip-forward"
                onClick={(e) => skipSeconds(10, e)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 transition-all hover:border-zinc-750"
                title="Forward 10s"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {/* Volume slider control */}
              <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-850/50 px-2.5 py-1.5 rounded-xl ml-1">
                <button
                  id="player-volume-toggle"
                  onClick={toggleMute}
                  className="text-zinc-400 hover:text-white transition-all"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-zinc-300" />}
                </button>
                <input
                  id="player-volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 md:w-20 accent-red-600 h-1 bg-zinc-800 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </div>

            {/* Right: Aspect ratio cycle, Settings panel toggle, Fullscreen */}
            <div className="flex items-center gap-2">
              
              {/* Aspect Ratio Button */}
              <button
                id="player-aspect-ratio-btn"
                onClick={cycleAspectRatio}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 transition-all text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                title={`Aspect Ratio: ${aspectRatio}`}
              >
                <span>Aspect:</span>
                <span className="text-red-500 font-extrabold">{aspectRatio}</span>
              </button>

              {/* Quality selector */}
              <select
                id="player-quality-select"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 rounded-xl text-[10px] px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-600 font-bold uppercase tracking-wider cursor-pointer"
              >
                <option value="1080p">HD 1080p</option>
                <option value="720p">High 720p</option>
                <option value="480p">SD 480p</option>
                <option value="auto">Auto Quality</option>
              </select>

              {/* Custom Settings button */}
              <button
                id="player-settings-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettingsMenu(!showSettingsMenu);
                }}
                className={`p-2 rounded-xl border transition-all ${
                  showSettingsMenu 
                    ? 'bg-red-600/10 border-red-500 text-red-500' 
                    : 'bg-zinc-900 border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="Player Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              {/* Fullscreen Button */}
              <button
                id="player-fullscreen-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current?.requestFullscreen) {
                    videoRef.current.requestFullscreen();
                  }
                }}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                title="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marquee Keyframes for Breaking News in fallback view */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>

    </div>
  );
}
