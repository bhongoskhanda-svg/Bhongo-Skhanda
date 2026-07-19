/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Account from './components/Account';
import AdminPanel from './components/AdminPanel';
import ChannelBrowser from './components/ChannelBrowser';
import LivePlayer from './components/LivePlayer';
import MyList from './components/MyList';
import Search from './components/Search';
import TvGuide from './components/TvGuide';
import SubscriptionPaywall from './components/SubscriptionPaywall';
import AdminPaymentDashboard from './components/AdminPaymentDashboard';
import RecommendationsEngine from './components/RecommendationsEngine';
import ChannelDetailsModal from './components/ChannelDetailsModal';
import ViewingAnalytics from './components/ViewingAnalytics';
import Watchlist from './components/Watchlist';
import EmailNotification from './components/EmailNotification';
import {
  Home,
  Search as SearchIcon,
  Bookmark,
  BarChart3,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface Channel {
  id: number;
  name: string;
  logo: string;
  category: string[];
  region: string;
  language: string[];
  type: 'youtube' | 'm3u8';
  url: string;
  is_live: boolean;
  now_playing?: string;
  views?: string;
  rating?: number;
  description?: string;
  tags?: string[];
  country?: string;
}

interface UserState {
  trialStart: number;
  isPremium: boolean;
  favorites: number[];
  continueWatching: { channelId: number; progressSeconds: number; lastWatched: number }[];
  parentalPin: string | null;
  videoQuality: 'auto' | '1080p' | '720p' | '480p';
  reminders: { programId: string; title: string; time: string; channelName: string }[];
  watchlist: number[];
  viewingHistory: { channelId: number; channelName: string; timestamp: number; duration: number }[];
}

interface AdminStats {
  totalUsers: number;
  revenue: number;
  activeNow: number;
  pushSent: { id: string; title: string; body: string; timestamp: number }[];
  paymentReports: { id: string; user: string; amount: number; status: 'Completed' | 'Pending'; date: string; paymentMethod: string; transactionId: string }[];
}

export default function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [userState, setUserState] = useState<UserState>({
    trialStart: Date.now(),
    isPremium: false,
    favorites: [],
    continueWatching: [],
    parentalPin: null,
    videoQuality: 'auto',
    reminders: [],
    watchlist: [],
    viewingHistory: []
  });

  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 1,
    revenue: 0,
    activeNow: 1,
    pushSent: [],
    paymentReports: []
  });

  const [activeTab, setActiveTab] = useState<'home' | 'browse' | 'search' | 'mylist' | 'account' | 'admin' | 'guide' | 'analytics'>('home');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [email, setEmail] = useState('user@example.com');
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: 'success', title: '', message: '' });

  // Load data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('skhandatv_user_state');
    const savedChannels = localStorage.getItem('skhandatv_channels_state');
    const savedAdmin = localStorage.getItem('skhandatv_admin_state');

    if (savedUser) setUserState(JSON.parse(savedUser));
    if (savedChannels) setChannels(JSON.parse(savedChannels));
    if (savedAdmin) setAdminStats(JSON.parse(savedAdmin));

    // Load channels from JSON
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/channels-full-500.json');
      const data = await response.json();
      setChannels(data.channels);
    } catch (err) {
      console.error('Failed to load channels:', err);
    }
  };

  const updateLocalStorageUser = (updates: Partial<UserState>) => {
    const newState = { ...userState, ...updates };
    setUserState(newState);
    localStorage.setItem('skhandatv_user_state', JSON.stringify(newState));
  };

  const updateLocalStorageAdmin = (updates: Partial<AdminStats>) => {
    const newState = { ...adminStats, ...updates };
    setAdminStats(newState);
    localStorage.setItem('skhandatv_admin_state', JSON.stringify(newState));
  };

  // Calculate trial days left
  const trialDaysLeft = Math.max(0, 7 - Math.floor((Date.now() - userState.trialStart) / (1000 * 60 * 60 * 24)));
  const trialExpired = trialDaysLeft === 0 && !userState.isPremium;

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    // Track viewing
    const history = [...userState.viewingHistory, {
      channelId: channel.id,
      channelName: channel.name,
      timestamp: Date.now(),
      duration: 0
    }];
    updateLocalStorageUser({ viewingHistory: history });
  };

  const handlePlayChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleAddToWatchlist = (channel: Channel) => {
    if (userState.watchlist.includes(channel.id)) {
      updateLocalStorageUser({
        watchlist: userState.watchlist.filter(id => id !== channel.id)
      });
    } else {
      updateLocalStorageUser({
        watchlist: [...userState.watchlist, channel.id]
      });
    }
  };

  const handleRemoveFromWatchlist = (channelId: number) => {
    updateLocalStorageUser({
      watchlist: userState.watchlist.filter(id => id !== channelId)
    });
  };

  const handlePaymentSuccess = () => {
    updateLocalStorageUser({ isPremium: true });
    setAdminStats({
      ...adminStats,
      revenue: adminStats.revenue + 150,
      paymentReports: [
        ...adminStats.paymentReports,
        {
          id: 'PAY' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          user: email,
          amount: 150,
          status: 'Completed',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'Card',
          transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
        }
      ]
    });
    updateLocalStorageAdmin({ revenue: adminStats.revenue + 150 });
    
    // Show notification
    setNotification({
      type: 'success',
      title: 'Welcome to Premium!',
      message: 'Your subscription is now active. Enjoy unlimited access to all channels!'
    });
    setShowNotification(true);
  };

  const handleResetApp = () => {
    if (confirm('Are you sure you want to reset the app? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const watchlistChannels = channels.filter(ch => userState.watchlist.includes(ch.id));

  // Show paywall if trial expired
  if (trialExpired) {
    return (
      <>
        <SubscriptionPaywall
          trialDaysLeft={trialDaysLeft}
          onPaymentSuccess={handlePaymentSuccess}
          isPremium={userState.isPremium}
        />
        <EmailNotification
          show={showNotification}
          notification={notification}
          onClose={() => setShowNotification(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#E50914] rounded-lg flex items-center justify-center">
                <span className="font-black text-white">S</span>
              </div>
              <span className="font-black text-xl hidden sm:inline">Skhanda TV</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-1">
              {[
                { id: 'home', icon: Home, label: 'Home' },
                { id: 'browse', icon: ChannelBrowser, label: 'Browse' },
                { id: 'search', icon: SearchIcon, label: 'Search' },
                { id: 'mylist', icon: Bookmark, label: 'My List' },
                { id: 'guide', icon: BarChart3, label: 'Guide' },
                { id: 'analytics', icon: BarChart3, label: 'Analytics' }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`px-3 py-2 rounded-lg font-bold text-sm transition ${
                      activeTab === item.id
                        ? 'bg-[#E50914] text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 inline mr-1" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {userState.isPremium && (
                <span className="hidden sm:inline px-3 py-1 bg-[#E50914]/20 text-[#E50914] rounded-full text-xs font-bold border border-[#E50914]/30">
                  ⭐ Premium
                </span>
              )}
              {!userState.isPremium && (
                <span className="hidden sm:inline px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs font-bold border border-yellow-900/50">
                  📅 {trialDaysLeft} days trial
                </span>
              )}

              <button
                onClick={() => setActiveTab('account')}
                className="p-2 hover:bg-zinc-900 rounded-lg transition"
              >
                <User className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-zinc-900 rounded-lg transition"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden pb-4 border-t border-zinc-900"
              >
                <div className="flex flex-col gap-2 mt-4">
                  {[
                    { id: 'home', icon: Home, label: 'Home' },
                    { id: 'browse', icon: ChannelBrowser, label: 'Browse' },
                    { id: 'search', icon: SearchIcon, label: 'Search' },
                    { id: 'mylist', icon: Bookmark, label: 'My List' },
                    { id: 'guide', icon: BarChart3, label: 'Guide' },
                    { id: 'analytics', icon: BarChart3, label: 'Analytics' }
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          setShowMobileMenu(false);
                        }}
                        className={`px-3 py-2 rounded-lg font-bold text-sm transition text-left ${
                          activeTab === item.id
                            ? 'bg-[#E50914] text-white'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 inline mr-2" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RecommendationsEngine
                channels={channels}
                viewingHistory={userState.viewingHistory}
                favorites={userState.favorites}
                onChannelSelect={handleSelectChannel}
              />
            </motion.div>
          )}

          {activeTab === 'browse' && (
            <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChannelBrowser
                channels={channels}
                regions={[
                  { id: 'all', name: 'All Regions', flag: '🌍' },
                  { id: 'southern_africa', name: 'Southern Africa', flag: '🇿🇦' },
                  { id: 'west_africa', name: 'West Africa', flag: '🇳🇬' }
                ]}
                categories={[
                  { id: 'all', name: 'All Channels', icon: '📺' },
                  { id: 'news', name: 'News', icon: '📰' },
                  { id: 'sports', name: 'Sports', icon: '⚽' }
                ]}
                onSelectChannel={handleSelectChannel}
              />
            </motion.div>
          )}

          {activeTab === 'mylist' && (
            <motion.div key="mylist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Watchlist
                watchlist={watchlistChannels}
                onRemove={handleRemoveFromWatchlist}
                onPlay={handlePlayChannel}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && userState.isPremium && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ViewingAnalytics viewingHistory={userState.viewingHistory} />
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Account
                userState={userState}
                onUpdateState={updateLocalStorageUser}
                onResetApp={handleResetApp}
                email={email}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {userState.isPremium ? (
                <AdminPaymentDashboard
                  totalRevenue={adminStats.revenue}
                  totalSubscribers={adminStats.totalUsers}
                  activeSubscriptions={adminStats.activeNow}
                  paymentReports={adminStats.paymentReports}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-zinc-400">Admin panel available for premium users only</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Channel Details Modal */}
      <ChannelDetailsModal
        channel={selectedChannel}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onPlay={handlePlayChannel}
        onAddToWatchlist={handleAddToWatchlist}
        isFavorite={selectedChannel ? userState.watchlist.includes(selectedChannel.id) : false}
        watchlistCount={userState.watchlist.length}
      />

      {/* Email Notifications */}
      <EmailNotification
        show={showNotification}
        notification={notification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
