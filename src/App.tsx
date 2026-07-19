/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Search as SearchIcon, 
  Heart, 
  User as UserIcon, 
  Calendar, 
  Flame, 
  Compass, 
  Lock, 
  Activity, 
  HelpCircle, 
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react';

import { Channel, UserState, AdminStats } from './types';
import Splash from './components/Splash';
import Onboarding from './components/Onboarding';
import LivePlayer from './components/LivePlayer';
import TvGuide from './components/TvGuide';
import Search from './components/Search';
import MyList from './components/MyList';
import Paywall from './components/Paywall';
import Account from './components/Account';
import AdminPanel from './components/AdminPanel';

// Default initial channels if fetch is delayed
import initialChannelsData from '../public/channels.json';

export default function App() {
  // Navigation & Screen Control
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'onboarding' | 'home'>('splash');
  const [activeTab, setActiveTab] = useState<'home' | 'guide' | 'search' | 'mylist' | 'account' | 'admin'>('home');
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  // Core Persistent State
  const [channels, setChannels] = useState<Channel[]>(initialChannelsData.channels as Channel[]);
  const [categories, setCategories] = useState<any[]>(initialChannelsData.categories);
  const [userState, setUserState] = useState<UserState>({
    trialStart: Date.now(),
    isPremium: false,
    favorites: [1, 2, 4], // Some defaults
    continueWatching: [
      { channelId: 1, progressSeconds: 420, lastWatched: Date.now() },
      { channelId: 4, progressSeconds: 1100, lastWatched: Date.now() - 3600000 }
    ],
    parentalPin: null,
    videoQuality: 'auto',
    reminders: []
  });

  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 14250,
    revenue: 432150,
    activeNow: 2140,
    pushSent: [
      { id: '1', title: 'Uzalo Season Finale Live!', body: 'Tune into SABC 1 now to watch the final episode.', timestamp: Date.now() - 86400000 }
    ],
    paymentReports: [
      { id: 'TX-PF991', user: 'nkosi.b@gmail.com', amount: 150, status: 'Completed', date: '2026-07-16' },
      { id: 'TX-PF982', user: 'khumalo.sibusiso@webmail.co.za', amount: 150, status: 'Completed', date: '2026-07-15' },
      { id: 'TX-PF973', user: 'dube.l@skhandamail.com', amount: 150, status: 'Completed', date: '2026-07-14' }
    ]
  });

  // Category filter state for Home grid
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  
  // Parental Lock prompt state
  const [pinPromptChannel, setPinPromptChannel] = useState<Channel | null>(null);
  const [pinPromptInput, setPinPromptInput] = useState('');
  const [pinPromptError, setPinPromptError] = useState('');

  // Hero carousel index
  const [heroIndex, setHeroIndex] = useState(0);

  // Keyboard navigation states
  const [keyboardFocusArea, setKeyboardFocusArea] = useState<'tabs' | 'categories' | 'genres' | 'channels'>('channels');
  const [focusedChannelIdx, setFocusedChannelIdx] = useState<number>(0);
  const [focusedCategoryIdx, setFocusedCategoryIdx] = useState<number>(0);
  const [focusedGenreIdx, setFocusedGenreIdx] = useState<number>(0);
  const [focusedTabIdx, setFocusedTabIdx] = useState<number>(0);
  const [isKeyboardUser, setIsKeyboardUser] = useState<boolean>(false);

  // Load state from LocalStorage on mount and fetch dynamically
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('skhandatv_user_state');
      if (savedUser) {
        setUserState(JSON.parse(savedUser));
      } else {
        // Set first launch trial start
        const newState = { ...userState, trialStart: Date.now() };
        setUserState(newState);
        localStorage.setItem('skhandatv_user_state', JSON.stringify(newState));
      }

      const savedChannels = localStorage.getItem('skhandatv_channels_state');
      if (savedChannels) {
        try {
          const parsed = JSON.parse(savedChannels);
          const hasLegacyYoutube = Array.isArray(parsed) && parsed.some((c: any) => c.type === 'youtube');
          if (hasLegacyYoutube) {
            localStorage.removeItem('skhandatv_channels_state');
          } else {
            setChannels(parsed);
          }
        } catch (err) {
          localStorage.removeItem('skhandatv_channels_state');
        }
      }

      const savedAdmin = localStorage.getItem('skhandatv_admin_state');
      if (savedAdmin) {
        setAdminStats(JSON.parse(savedAdmin));
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }

    // Dynamic Fetch from m3u8 JSON source
    fetch('/channels.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        if (data) {
          if (Array.isArray(data.channels)) {
            setChannels(data.channels);
            localStorage.setItem('skhandatv_channels_state', JSON.stringify(data.channels));
          }
          if (Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch channels dynamically:', err);
      });
  }, []);

  // Sync state helpers
  const updateLocalStorageUser = (updates: Partial<UserState>) => {
    setUserState(prev => {
      const merged = { ...prev, ...updates };
      localStorage.setItem('skhandatv_user_state', JSON.stringify(merged));
      return merged;
    });
  };

  const updateLocalStorageChannels = (updatedList: Channel[]) => {
    setChannels(updatedList);
    localStorage.setItem('skhandatv_channels_state', JSON.stringify(updatedList));
  };

  const updateLocalStorageAdmin = (updates: Partial<AdminStats>) => {
    setAdminStats(prev => {
      const merged = { ...prev, ...updates };
      localStorage.setItem('skhandatv_admin_state', JSON.stringify(merged));
      return merged;
    });
  };

  // Check 7 Days Paywall Lockout
  const checkTrialExpiration = () => {
    if (userState.isPremium) return false;
    const msElapsed = Date.now() - userState.trialStart;
    const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);
    return daysElapsed >= 7; // Expired if 7+ days
  };

  const trialExpired = checkTrialExpiration();

  // Handle stream trigger
  const handleSelectChannel = (channel: Channel) => {
    // If channel requires Parental Lock (categories contain Skhanda or Church)
    const needsLock = (channel.category.includes('skhanda') || channel.category.includes('church')) && userState.parentalPin !== null;
    
    if (needsLock) {
      setPinPromptChannel(channel);
      setPinPromptInput('');
      setPinPromptError('');
    } else {
      startPlayback(channel);
    }
  };

  const startPlayback = (channel: Channel) => {
    setActiveChannel(channel);
    setActiveTab('home');
    
    // Add to continue watching list
    const exists = userState.continueWatching.some(item => item.channelId === channel.id);
    let updatedHistory = [...userState.continueWatching];
    
    if (exists) {
      updatedHistory = updatedHistory.map(item => {
        if (item.channelId === channel.id) {
          return { ...item, progressSeconds: item.progressSeconds + 120, lastWatched: Date.now() };
        }
        return item;
      });
    } else {
      updatedHistory.unshift({ channelId: channel.id, progressSeconds: 120, lastWatched: Date.now() });
    }
    
    updateLocalStorageUser({ continueWatching: updatedHistory });
    
    // Auto-scroll layout to player
    setTimeout(() => {
      document.getElementById('live-player-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  // Parental PIN Submission
  const handlePinPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinPromptInput === userState.parentalPin) {
      if (pinPromptChannel) {
        startPlayback(pinPromptChannel);
      }
      setPinPromptChannel(null);
      setPinPromptInput('');
      setPinPromptError('');
    } else {
      setPinPromptError('Incorrect Parental PIN. Access Denied.');
    }
  };

  // Toggle favorites
  const handleToggleFavorite = (id: number) => {
    const list = [...userState.favorites];
    const index = list.indexOf(id);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(id);
    }
    updateLocalStorageUser({ favorites: list });
  };

  // Clear Continue Watching
  const handleClearContinueWatching = (id: number) => {
    const list = userState.continueWatching.filter(item => item.channelId !== id);
    updateLocalStorageUser({ continueWatching: list });
  };

  // Set EPG Reminders
  const handleSetReminder = (program: { id: string; title: string; time: string; channelName: string }) => {
    const exists = userState.reminders.some(r => r.programId === program.id);
    let list = [...userState.reminders];
    if (exists) {
      list = list.filter(r => r.programId !== program.id);
    } else {
      list.push({
        programId: program.id,
        title: program.title,
        time: program.time,
        channelName: program.channelName
      });
    }
    updateLocalStorageUser({ reminders: list });
  };

  // Payment Success Upgrade
  const handlePaymentSuccess = () => {
    updateLocalStorageUser({ isPremium: true });
    
    // Log in admin payment reports
    const txId = `TX-PF${Math.floor(100 + Math.random() * 900)}`;
    const newReport = {
      id: txId,
      user: 'bhongoskhanda@gmail.com',
      amount: 150,
      status: 'Completed' as const,
      date: new Date().toISOString().split('T')[0]
    };
    
    updateLocalStorageAdmin({
      totalUsers: adminStats.totalUsers + 1,
      revenue: adminStats.revenue + 150,
      paymentReports: [newReport, ...adminStats.paymentReports]
    });
  };

  // Reset App to clean slate
  const handleResetApp = () => {
    if (confirm("Reset application state? This will return to Onboarding and reset trial periods.")) {
      localStorage.removeItem('skhandatv_user_state');
      localStorage.removeItem('skhandatv_channels_state');
      localStorage.removeItem('skhandatv_admin_state');
      
      setUserState({
        trialStart: Date.now(),
        isPremium: false,
        favorites: [1, 2, 4],
        continueWatching: [],
        parentalPin: null,
        videoQuality: 'auto',
        reminders: []
      });

      fetch('/channels.json')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then((data) => {
          if (data && Array.isArray(data.channels)) {
            setChannels(data.channels);
            localStorage.setItem('skhandatv_channels_state', JSON.stringify(data.channels));
          } else {
            setChannels(initialChannelsData.channels as Channel[]);
          }
          if (data && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
        })
        .catch(() => {
          setChannels(initialChannelsData.channels as Channel[]);
        });

      setCurrentScreen('onboarding');
      setActiveTab('home');
      setActiveChannel(null);
    }
  };

  // Mock Fast Expire Trial (Developer tool)
  const handleDeveloperTriggerExpire = () => {
    const expiredTimestamp = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
    updateLocalStorageUser({ trialStart: expiredTimestamp, isPremium: false });
  };

  // Genres metadata
  const genres = [
    { id: 'all', name: 'All Formats' },
    { id: 'live', name: 'Live Broadcasts' },
    { id: 'catchup', name: 'Catch-Up' },
    { id: 'ondemand', name: 'On-Demand' }
  ];

  // Filters
  const filteredGridChannels = channels.filter(ch => {
    const matchesCategory = selectedCategory === 'all' || ch.category.includes(selectedCategory);
    const genre = ch.id === 8 ? 'ondemand' : (ch.id === 3 || ch.id === 4 ? 'catchup' : 'live');
    const matchesGenre = selectedGenre === 'all' || genre === selectedGenre;
    return matchesCategory && matchesGenre;
  });

  // Dynamic carousel rotating live channels
  const liveCarouselChannels = channels.filter(c => [1, 2, 4].includes(c.id));

  // Auto rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % liveCarouselChannels.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [liveCarouselChannels.length]);

  // Disable keyboard focus outlines on mouse click
  useEffect(() => {
    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, []);

  // Keyboard navigation listener for channels, categories, genres, and tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if user is typing in forms/inputs
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
      if (!navigationKeys.includes(e.key)) return;

      // Enable keyboard focus indicators
      setIsKeyboardUser(true);
      e.preventDefault();

      if (currentScreen !== 'home' || trialExpired) return;

      const mainTabs = ['home', 'guide', 'search', 'mylist', 'account'] as const;

      if (e.key === 'ArrowUp') {
        if (keyboardFocusArea === 'tabs') {
          if (activeTab === 'home') {
            setKeyboardFocusArea('channels');
            setFocusedChannelIdx(Math.max(0, filteredGridChannels.length - 1));
          }
        } else if (keyboardFocusArea === 'channels') {
          // Calculate grid columns dynamically
          const cols = window.innerWidth >= 768 ? 3 : (window.innerWidth >= 640 ? 2 : 1);
          if (focusedChannelIdx - cols >= 0) {
            setFocusedChannelIdx(prev => prev - cols);
          } else {
            setKeyboardFocusArea('genres');
          }
        } else if (keyboardFocusArea === 'genres') {
          setKeyboardFocusArea('categories');
        }
      }

      else if (e.key === 'ArrowDown') {
        if (keyboardFocusArea === 'categories') {
          setKeyboardFocusArea('genres');
        } else if (keyboardFocusArea === 'genres') {
          if (filteredGridChannels.length > 0) {
            setKeyboardFocusArea('channels');
            setFocusedChannelIdx(0);
          } else {
            setKeyboardFocusArea('tabs');
          }
        } else if (keyboardFocusArea === 'channels') {
          const cols = window.innerWidth >= 768 ? 3 : (window.innerWidth >= 640 ? 2 : 1);
          if (focusedChannelIdx + cols < filteredGridChannels.length) {
            setFocusedChannelIdx(prev => prev + cols);
          } else {
            setKeyboardFocusArea('tabs');
          }
        }
      }

      else if (e.key === 'ArrowLeft') {
        if (keyboardFocusArea === 'tabs') {
          const newIdx = (focusedTabIdx - 1 + mainTabs.length) % mainTabs.length;
          setFocusedTabIdx(newIdx);
          setActiveTab(mainTabs[newIdx]);
        } else if (keyboardFocusArea === 'categories') {
          const newIdx = (focusedCategoryIdx - 1 + categories.length) % categories.length;
          setFocusedCategoryIdx(newIdx);
          setSelectedCategory(categories[newIdx].id);
          setFocusedChannelIdx(0);
        } else if (keyboardFocusArea === 'genres') {
          const newIdx = (focusedGenreIdx - 1 + genres.length) % genres.length;
          setFocusedGenreIdx(newIdx);
          setSelectedGenre(genres[newIdx].id);
          setFocusedChannelIdx(0);
        } else if (keyboardFocusArea === 'channels') {
          if (focusedChannelIdx > 0) {
            setFocusedChannelIdx(prev => prev - 1);
          }
        }
      }

      else if (e.key === 'ArrowRight') {
        if (keyboardFocusArea === 'tabs') {
          const newIdx = (focusedTabIdx + 1) % mainTabs.length;
          setFocusedTabIdx(newIdx);
          setActiveTab(mainTabs[newIdx]);
        } else if (keyboardFocusArea === 'categories') {
          const newIdx = (focusedCategoryIdx + 1) % categories.length;
          setFocusedCategoryIdx(newIdx);
          setSelectedCategory(categories[newIdx].id);
          setFocusedChannelIdx(0);
        } else if (keyboardFocusArea === 'genres') {
          const newIdx = (focusedGenreIdx + 1) % genres.length;
          setFocusedGenreIdx(newIdx);
          setSelectedGenre(genres[newIdx].id);
          setFocusedChannelIdx(0);
        } else if (keyboardFocusArea === 'channels') {
          if (focusedChannelIdx < filteredGridChannels.length - 1) {
            setFocusedChannelIdx(prev => prev + 1);
          }
        }
      }

      else if (e.key === 'Enter') {
        if (keyboardFocusArea === 'channels') {
          const target = filteredGridChannels[focusedChannelIdx];
          if (target) {
            handleSelectChannel(target);
          }
        } else if (keyboardFocusArea === 'categories') {
          const cat = categories[focusedCategoryIdx];
          if (cat) {
            setSelectedCategory(cat.id);
            setFocusedChannelIdx(0);
          }
        } else if (keyboardFocusArea === 'genres') {
          const gen = genres[focusedGenreIdx];
          if (gen) {
            setSelectedGenre(gen.id);
            setFocusedChannelIdx(0);
          }
        } else if (keyboardFocusArea === 'tabs') {
          const tab = mainTabs[focusedTabIdx];
          setActiveTab(tab);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    keyboardFocusArea,
    focusedChannelIdx,
    focusedCategoryIdx,
    focusedGenreIdx,
    focusedTabIdx,
    filteredGridChannels,
    categories,
    genres,
    currentScreen,
    trialExpired,
    activeTab,
    selectedGenre
  ]);

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans flex flex-col justify-between selection:bg-[#E50914] selection:text-white antialiased overflow-x-hidden relative">
      
      {/* Immersive UI Theme Ambient Background Glow Circles */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#E50914]/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-[300px] h-[300px] bg-[#E50914]/5 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* 1. Splash Screen Overlay */}
      {currentScreen === 'splash' && (
        <Splash onComplete={() => {
          // If already has local state, skip onboarding
          const hasState = localStorage.getItem('skhandatv_user_state');
          setCurrentScreen(hasState ? 'home' : 'onboarding');
        }} />
      )}

      {/* 2. Onboarding Screen Overlay */}
      {currentScreen === 'onboarding' && (
        <Onboarding onComplete={() => {
          updateLocalStorageUser({ trialStart: Date.now() });
          setCurrentScreen('home');
        }} />
      )}

      {/* 3. Paywall Blocker State (Locks app after 7 Days) */}
      {trialExpired && currentScreen === 'home' && (
        <Paywall 
          trialDaysLeft={0} 
          onPaymentSuccess={handlePaymentSuccess} 
        />
      )}

      {/* Primary Application Shell (Screen 3: Home & Subtabs) */}
      {currentScreen === 'home' && !trialExpired && (
        <div className="flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 relative z-10">
          
          {/* HEADER (Logo, Search Trigger, Profile Trigger) */}
          <header className="flex items-center justify-between pb-6 border-b border-white/10 mb-6 z-10">
            {/* Left Brand */}
            <div 
              onClick={() => { setActiveTab('home'); setActiveChannel(null); }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#E50914] rounded-lg flex items-center justify-center text-white font-extrabold shadow-[0_0_20px_rgba(229,9,20,0.4)] group-hover:scale-105 transition duration-300">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M21 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-9 12H5V10h7v8zm7-5h-5v-2h5v2zm0-4h-5V9h5v2z"/></svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tighter text-[#E50914]">SKHANDA <span className="text-white">TV</span></h1>
                <span className="text-[8px] text-zinc-500 font-bold tracking-wider uppercase">Free SA TV Hub</span>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-3">
              <button
                id="header-search-shortcut"
                onClick={() => setActiveTab('search')}
                className={`p-2.5 rounded-full border transition cursor-pointer ${
                  activeTab === 'search' 
                  ? 'bg-[#E50914] border-[#E50914] text-white' 
                  : 'bg-white/10 border-white/10 text-zinc-300 hover:text-white hover:bg-white/20'
                }`}
                title="Search channels"
              >
                <SearchIcon className="w-4 h-4" />
              </button>

              <button
                id="header-account-shortcut"
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-2.5 bg-white/5 border border-white/10 pl-2 pr-4 py-1.5 rounded-full transition hover:bg-white/10 cursor-pointer ${
                  activeTab === 'account' ? 'border-[#E50914]/50 bg-[#E50914]/10' : ''
                }`}
                title="My Account Settings"
              >
                <div className="w-7 h-7 bg-[#E50914] rounded-full flex items-center justify-center font-bold text-xs text-white">
                  BN
                </div>
                <span className="text-sm font-medium text-white hidden sm:inline">B. Nkosi</span>
              </button>

              {/* Dev-Quick Admin Switch */}
              <button
                id="header-admin-shortcut"
                onClick={() => setActiveTab('admin')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase rounded-xl border transition cursor-pointer ${
                  activeTab === 'admin' 
                  ? 'bg-[#E50914]/20 border-[#E50914] text-white' 
                  : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]"></span>
                <span>Portal</span>
              </button>
            </div>
          </header>

          {/* ACTIVE LIVE PLAYER GRID PORT (Screen 4: active container stays docked or floats above current view as PIP) */}
          {activeChannel && (
            <div id="live-player-container" className={activeTab === 'home' ? "mb-8" : ""}>
              <LivePlayer 
                channel={activeChannel} 
                isPip={activeTab !== 'home'}
                onBack={() => setActiveChannel(null)} 
                onExpand={() => setActiveTab('home')}
              />
            </div>
          )}

          {/* DYNAMIC TAB SWITCH RENDERER */}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {activeTab === 'home' && (
                  /* Screen 3: HOME VIEW */
                  <div className="flex flex-col gap-8">
                    
                    {/* LIVE NOW HERO CAROUSEL */}
                    <div id="home-live-carousel" className="relative w-full h-[320px] sm:h-[280px] rounded-2xl overflow-hidden border border-[#E50914]/30 group shadow-2xl flex flex-col justify-center px-6 sm:px-10 gap-2">
                      {/* Dark gradient overlay for extreme legibility */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10"></div>
                      
                      {/* Dynamic Background Image - beautifully blurred or fallback */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105 group-hover:scale-100"
                        style={{ 
                          backgroundImage: `url('${
                            liveCarouselChannels[heroIndex]?.id === 1 
                            ? "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1024"
                            : liveCarouselChannels[heroIndex]?.id === 2
                            ? "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1024"
                            : "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1024"
                          }')`
                        }}
                      ></div>

                      <div className="relative z-20 h-full flex flex-col justify-center gap-2 max-w-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse"></div>
                          <span className="text-[#E50914] text-xs font-black uppercase tracking-widest animate-pulse">LIVE NOW ON SKHANDA</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none text-white uppercase">
                          {liveCarouselChannels[heroIndex]?.name || 'Premium Amapiano sets'}
                        </h2>

                        <p className="text-white/70 max-w-md text-xs sm:text-sm line-clamp-2">
                          Experience the drama and live feeds broadcasting across South Africa. Catch the latest stream.
                        </p>

                        <div className="flex gap-3 sm:gap-4 mt-3 sm:mt-4 items-center">
                          <button
                            id={`carousel-watch-now-${heroIndex}`}
                            onClick={() => handleSelectChannel(liveCarouselChannels[heroIndex])}
                            className="bg-[#E50914] hover:bg-[#ff1520] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition-all shadow-[0_10px_20px_-5px_rgba(229,9,20,0.5)] cursor-pointer flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-white text-white" />
                            <span>WATCH NOW</span>
                          </button>
                          
                          <button
                            id={`carousel-mylist-add-${heroIndex}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(liveCarouselChannels[heroIndex].id);
                            }}
                            className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition cursor-pointer"
                          >
                            {userState.favorites.includes(liveCarouselChannels[heroIndex]?.id) ? "✓ MY LIST" : "+ MY LIST"}
                          </button>
                        </div>
                      </div>

                      {/* Sliding Dot Indicator */}
                      <div className="absolute bottom-4 right-6 z-20 flex gap-1.5">
                        {liveCarouselChannels.map((_, idx) => (
                          <button
                            key={idx}
                            id={`carousel-dot-${idx}`}
                            onClick={() => setHeroIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              heroIndex === idx ? 'w-6 bg-[#E50914]' : 'w-1.5 bg-zinc-700 hover:bg-zinc-400'
                            }`}
                          ></button>
                        ))}
                      </div>
                    </div>

                    {/* CATEGORY SELECTOR SLIDER */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Categories</span>
                      <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none">
                        {categories.map((cat, idx) => {
                          const isSelected = selectedCategory === cat.id;
                          const isFocused = isKeyboardUser && keyboardFocusArea === 'categories' && focusedCategoryIdx === idx;
                          return (
                            <button
                              key={cat.id}
                              id={`category-tab-${cat.id}`}
                              onClick={() => {
                                setSelectedCategory(cat.id);
                                if (isKeyboardUser) {
                                  setFocusedCategoryIdx(idx);
                                  setKeyboardFocusArea('categories');
                                }
                              }}
                              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all duration-300 cursor-pointer ${
                                isSelected
                                ? 'bg-[#E50914] border-[#E50914] text-white shadow-[0_4px_12px_rgba(229,9,20,0.4)]'
                                : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                              } ${
                                isFocused ? 'ring-2 ring-white scale-105 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''
                              }`}
                            >
                              {cat.name.toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* GENRE / FORMAT SELECTOR SLIDER */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Formats</span>
                      <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none">
                        {genres.map((gen, idx) => {
                          const isSelected = selectedGenre === gen.id;
                          const isFocused = isKeyboardUser && keyboardFocusArea === 'genres' && focusedGenreIdx === idx;
                          return (
                            <button
                              key={gen.id}
                              id={`genre-tab-${gen.id}`}
                              onClick={() => {
                                setSelectedGenre(gen.id);
                                setFocusedChannelIdx(0);
                                if (isKeyboardUser) {
                                  setFocusedGenreIdx(idx);
                                  setKeyboardFocusArea('genres');
                                }
                              }}
                              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all duration-300 cursor-pointer ${
                                isSelected
                                ? 'bg-red-600/20 border-[#E50914] text-[#E50914] shadow-[0_4px_12px_rgba(229,9,20,0.15)] font-black'
                                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                              } ${
                                isFocused ? 'ring-2 ring-white scale-105 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''
                              }`}
                            >
                              {gen.name.toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3-COLUMN CHANNELS GRID (Logo + Name + Pulsing dot) */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          {selectedCategory === 'all' ? 'All Channels' : `${selectedCategory}`} • {genres.find(g => g.id === selectedGenre)?.name || selectedGenre} ({filteredGridChannels.length})
                        </span>
                        {userState.isPremium && (
                          <span className="text-[8px] bg-emerald-950 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                            Ad-Free HD Streaming
                          </span>
                        )}
                      </div>

                      {filteredGridChannels.length === 0 ? (
                        <div className="py-16 text-center flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                          <Compass className="w-8 h-8 text-zinc-600 mb-3 animate-pulse" />
                          <h4 className="text-sm font-bold text-zinc-300">No Channels Found</h4>
                          <p className="text-[11px] text-zinc-500 mt-1 max-w-xs leading-normal">
                            Try switching your format filter or category selection to discover other available content.
                          </p>
                          <button
                            onClick={() => {
                              setSelectedCategory('all');
                              setSelectedGenre('all');
                              setFocusedCategoryIdx(0);
                              setFocusedGenreIdx(0);
                            }}
                            className="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-bold border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          {filteredGridChannels.map((channel, idx) => {
                            const isFav = userState.favorites.includes(channel.id);
                            const isFocused = isKeyboardUser && keyboardFocusArea === 'channels' && focusedChannelIdx === idx;
                            return (
                              <div
                                key={channel.id}
                                id={`channel-grid-item-${channel.id}`}
                                onClick={() => {
                                  if (isKeyboardUser) {
                                    setFocusedChannelIdx(idx);
                                    setKeyboardFocusArea('channels');
                                  }
                                  handleSelectChannel(channel);
                                }}
                                className={`bg-white/5 backdrop-blur-xl border rounded-xl p-4 flex flex-col justify-between gap-4 cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                                  isFocused
                                  ? 'border-[#E50914] scale-[1.02] ring-2 ring-[#E50914] shadow-[0_0_25px_rgba(229,9,20,0.4)] z-20'
                                  : 'border-[#E50914]/20 hover:border-[#E50914]/50 hover:shadow-[0_0_25px_rgba(229,9,20,0.15)]'
                                }`}
                              >
                                {/* Glowing glass overlay accent */}
                                <div className="absolute right-0 top-0 w-20 h-20 bg-[#E50914]/5 rounded-full blur-2xl group-hover:bg-[#E50914]/15 transition duration-500"></div>

                                <div className="flex items-start justify-between gap-3 relative z-10">
                                  <div className="flex items-center gap-3">
                                    {/* Channel Logo Frame from Design HTML */}
                                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center font-bold text-xs border border-white/5 group-hover:scale-105 transition duration-300 shrink-0">
                                      <img
                                        src={channel.logo}
                                        alt={channel.name}
                                        className="w-10 h-10 rounded-md object-contain p-0.5"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          // Fallback logo if broken
                                          e.currentTarget.src = 'https://i.ibb.co/M5Yn41H/skhandalogo.png';
                                        }}
                                      />
                                    </div>

                                    <div className="min-w-0">
                                      <h4 className="font-bold text-base text-white group-hover:text-[#E50914] transition truncate max-w-[130px] leading-tight">
                                        {channel.name}
                                      </h4>
                                      <span className="text-[8px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-850 uppercase font-bold tracking-wider mt-1 inline-block">
                                        {channel.category[0]}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {/* Bookmark Heart */}
                                    <button
                                      id={`favorite-toggle-btn-${channel.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation(); // Avoid triggering player
                                        handleToggleFavorite(channel.id);
                                      }}
                                      className="p-1.5 bg-black/40 border border-white/10 hover:border-[#E50914]/40 rounded-xl transition cursor-pointer"
                                      title={isFav ? "Remove from favorites" : "Save to favorites"}
                                    >
                                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : 'text-zinc-400 hover:text-white'}`} />
                                    </button>

                                    {/* Pulse live dot badge from Design HTML */}
                                    <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-[#E50914]/30">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse"></div>
                                      <span className="text-[10px] font-black text-[#E50914]">
                                        {channel.id === 8 ? "VOD" : (channel.id === 3 || channel.id === 4 ? "CATCHUP" : "LIVE")}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Now playing footer details */}
                                <div className="relative z-10 border-t border-zinc-900/60 pt-2 flex flex-col">
                                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono">
                                    {channel.id === 8 ? "On-Demand Program" : (channel.id === 3 || channel.id === 4 ? "Recent Broadcast" : "Now Streaming")}
                                  </span>
                                  <span className="text-xs text-white/50 truncate mt-0.5 group-hover:text-zinc-100 transition">
                                    {channel.now_playing || 'Live Feed Broadcasting'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {activeTab === 'guide' && (
                  /* Screen 5: TV GUIDE */
                  <TvGuide 
                    channels={channels} 
                    onSelectChannel={handleSelectChannel}
                    onSetReminder={handleSetReminder}
                    activeReminders={userState.reminders.map(r => r.programId)}
                  />
                )}

                {activeTab === 'search' && (
                  /* Screen 6: SEARCH */
                  <Search 
                    channels={channels} 
                    onSelectChannel={handleSelectChannel} 
                  />
                )}

                {activeTab === 'mylist' && (
                  /* Screen 7: MY LIST */
                  <MyList 
                    favorites={userState.favorites} 
                    continueWatching={userState.continueWatching} 
                    channels={channels} 
                    onSelectChannel={handleSelectChannel}
                    onToggleFavorite={handleToggleFavorite}
                    onClearContinueWatching={handleClearContinueWatching}
                  />
                )}

                {activeTab === 'account' && (
                  /* Screen 9: ACCOUNT */
                  <Account 
                    userState={userState} 
                    onUpdateState={updateLocalStorageUser}
                    onResetApp={handleResetApp}
                    email="bhongoskhanda@gmail.com"
                  />
                )}

                {activeTab === 'admin' && (
                  /* Screen 10: ADMIN PANEL */
                  <AdminPanel 
                    channels={channels}
                    onUpdateChannels={updateLocalStorageChannels}
                    adminStats={adminStats}
                    onUpdateStats={updateLocalStorageAdmin}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* FLOATING BOTTOM NAVIGATION BAR (Home | Guide | Search | My List | Account) */}
          <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 flex justify-between items-center z-30 shadow-2xl">
            <button
              id="bottom-nav-home"
              onClick={() => { setActiveTab('home'); setFocusedTabIdx(0); }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition cursor-pointer ${
                activeTab === 'home' ? 'text-[#E50914] bg-[#E50914]/5' : 'text-zinc-500 hover:text-zinc-300'
              } ${isKeyboardUser && keyboardFocusArea === 'tabs' && focusedTabIdx === 0 ? 'ring-2 ring-[#E50914] bg-white/5 scale-105 border border-[#E50914]/40 shadow-[0_0_15px_rgba(229,9,20,0.4)]' : ''}`}
            >
              <Compass className="w-4 h-4" />
              <span className="text-[8px] font-extrabold uppercase mt-1">Home</span>
            </button>

            <button
              id="bottom-nav-guide"
              onClick={() => { setActiveTab('guide'); setFocusedTabIdx(1); }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition cursor-pointer ${
                activeTab === 'guide' ? 'text-[#E50914] bg-[#E50914]/5' : 'text-zinc-500 hover:text-zinc-300'
              } ${isKeyboardUser && keyboardFocusArea === 'tabs' && focusedTabIdx === 1 ? 'ring-2 ring-[#E50914] bg-white/5 scale-105 border border-[#E50914]/40 shadow-[0_0_15px_rgba(229,9,20,0.4)]' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-[8px] font-extrabold uppercase mt-1">Guide</span>
            </button>

            <button
              id="bottom-nav-search"
              onClick={() => { setActiveTab('search'); setFocusedTabIdx(2); }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition cursor-pointer ${
                activeTab === 'search' ? 'text-[#E50914] bg-[#E50914]/5' : 'text-zinc-500 hover:text-zinc-300'
              } ${isKeyboardUser && keyboardFocusArea === 'tabs' && focusedTabIdx === 2 ? 'ring-2 ring-[#E50914] bg-white/5 scale-105 border border-[#E50914]/40 shadow-[0_0_15px_rgba(229,9,20,0.4)]' : ''}`}
            >
              <SearchIcon className="w-4 h-4" />
              <span className="text-[8px] font-extrabold uppercase mt-1">Search</span>
            </button>

            <button
              id="bottom-nav-mylist"
              onClick={() => { setActiveTab('mylist'); setFocusedTabIdx(3); }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition cursor-pointer ${
                activeTab === 'mylist' ? 'text-[#E50914] bg-[#E50914]/5' : 'text-zinc-500 hover:text-zinc-300'
              } ${isKeyboardUser && keyboardFocusArea === 'tabs' && focusedTabIdx === 3 ? 'ring-2 ring-[#E50914] bg-white/5 scale-105 border border-[#E50914]/40 shadow-[0_0_15px_rgba(229,9,20,0.4)]' : ''}`}
            >
              <Heart className="w-4 h-4" />
              <span className="text-[8px] font-extrabold uppercase mt-1">My List</span>
            </button>

            <button
              id="bottom-nav-account"
              onClick={() => { setActiveTab('account'); setFocusedTabIdx(4); }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition cursor-pointer ${
                activeTab === 'account' ? 'text-[#E50914] bg-[#E50914]/5' : 'text-zinc-500 hover:text-zinc-300'
              } ${isKeyboardUser && keyboardFocusArea === 'tabs' && focusedTabIdx === 4 ? 'ring-2 ring-[#E50914] bg-white/5 scale-105 border border-[#E50914]/40 shadow-[0_0_15px_rgba(229,9,20,0.4)]' : ''}`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="text-[8px] font-extrabold uppercase mt-1">Account</span>
            </button>
          </nav>

        </div>
      )}

      {/* 4. PARENTAL PIN PROMPT MODAL */}
      <AnimatePresence>
        {pinPromptChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="w-full max-w-sm bg-zinc-950 border border-[#E50914]/30 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 bg-[#E50914]/15 border border-[#E50914]/40 text-[#E50914] rounded-2xl flex items-center justify-center">
                  <Lock className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Parental Control Lock</h3>
                <p className="text-[10px] text-zinc-400 max-w-xs">
                  The channel <span className="font-extrabold text-white">"{pinPromptChannel.name}"</span> is restricted. Please enter your 4-digit PIN to continue.
                </p>

                <form onSubmit={handlePinPromptSubmit} className="flex flex-col gap-4 w-full mt-2">
                  <input
                    id="parental-pin-prompt-input"
                    type="password"
                    maxLength={4}
                    required
                    autoFocus
                    placeholder="Enter PIN"
                    value={pinPromptInput}
                    onChange={(e) => setPinPromptInput(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    className="bg-zinc-900 border border-zinc-850 text-white p-3 text-center rounded-xl text-lg font-mono tracking-[0.5em] w-full focus:outline-none focus:border-[#E50914]"
                  />

                  {pinPromptError && (
                    <span id="parental-pin-prompt-error" className="text-[9px] text-[#E50914] font-bold leading-normal">
                      {pinPromptError}
                    </span>
                  )}

                  <div className="flex gap-2.5 mt-2">
                    <button
                      id="cancel-pin-prompt"
                      type="button"
                      onClick={() => setPinPromptChannel(null)}
                      className="px-4 py-2.5 bg-zinc-900 border border-zinc-850 text-white rounded-lg text-xs font-semibold hover:bg-zinc-850 flex-1 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="submit-pin-prompt"
                      type="submit"
                      className="px-4 py-2.5 bg-[#E50914] hover:bg-red-600 text-white rounded-lg text-xs font-bold flex-1 transition cursor-pointer"
                    >
                      Unlock Channel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. DEVELOPER TESTING FOOTER / UTILITY RAIL (Small unobtrusive bar to expire trial for testing paywalls) */}
      {currentScreen === 'home' && !trialExpired && (
        <div className="bg-zinc-950/40 border-t border-zinc-900 py-1.5 px-4 text-center z-10 mt-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="text-[8px] font-mono text-zinc-500 tracking-wider">
            ⚙️ DEVELOPER UTILITY RAIL: Test premium locks instantly
          </span>
          <div className="flex gap-2">
            <button
              id="dev-expire-trial-btn"
              onClick={handleDeveloperTriggerExpire}
              className="px-2 py-0.5 bg-red-600/10 hover:bg-[#E50914]/20 border border-[#E50914]/30 rounded text-[7px] font-extrabold uppercase text-[#E50914] tracking-widest cursor-pointer transition"
              title="Forces trial timer past 7 days to evaluate PayFast blocker layout"
            >
              Force Trial Expired (Lock App)
            </button>
            <button
              id="dev-toggle-admin-btn"
              onClick={() => setActiveTab(activeTab === 'admin' ? 'home' : 'admin')}
              className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[7px] font-extrabold uppercase text-zinc-400 tracking-widest cursor-pointer transition"
            >
              Toggle Admin portal
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
