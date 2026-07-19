/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search as SearchIcon, 
  Filter, 
  Globe, 
  LayoutGrid, 
  LayoutList,
  Star,
  TrendingUp,
  X,
  ChevronDown
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
}

interface ChannelBrowserProps {
  channels: Channel[];
  regions: Array<{ id: string; name: string; flag: string }>;
  categories: Array<{ id: string; name: string; icon: string }>;
  onSelectChannel: (channel: Channel) => void;
}

export default function ChannelBrowser({
  channels,
  regions,
  categories,
  onSelectChannel
}: ChannelBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'views' | 'rating'>('views');
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique languages
  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    channels.forEach(ch => {
      ch.language.forEach(l => langs.add(l));
    });
    return Array.from(langs);
  }, [channels]);

  // Filter channels
  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      const matchesSearch = 
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.now_playing?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRegion = selectedRegion === 'all' || channel.region === selectedRegion;
      const matchesCategory = selectedCategory === 'all' || channel.category.includes(selectedCategory);
      const matchesLanguage = selectedLanguage === 'all' || channel.language.includes(selectedLanguage);

      return matchesSearch && matchesRegion && matchesCategory && matchesLanguage;
    });
  }, [channels, searchQuery, selectedRegion, selectedCategory, selectedLanguage]);

  // Sort channels
  const sortedChannels = useMemo(() => {
    const sorted = [...filteredChannels];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'views') {
      sorted.sort((a, b) => {
        const viewsA = parseInt(a.views || '0') || 0;
        const viewsB = parseInt(b.views || '0') || 0;
        return viewsB - viewsA;
      });
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted;
  }, [filteredChannels, sortBy]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedRegion('all');
    setSelectedCategory('all');
    setSelectedLanguage('all');
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
          <Globe className="w-8 h-8 text-[#E50914]" />
          <span>Channel Browser</span>
          <span className="text-sm bg-[#E50914] text-white px-3 py-1 rounded-full ml-auto">
            {sortedChannels.length} / {channels.length}
          </span>
        </h2>
      </motion.div>

      {/* Search & Controls */}
      <div className="flex flex-col gap-3">
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search channels, shows, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/60 text-white rounded-2xl border border-zinc-900 py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition"
          />
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-zinc-950/40 border border-zinc-900 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition ${
                  viewMode === 'grid'
                    ? 'bg-[#E50914] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition ${
                  viewMode === 'list'
                    ? 'bg-[#E50914] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-zinc-950/60 border border-zinc-900 rounded-lg text-sm text-white focus:outline-none focus:border-[#E50914] cursor-pointer"
            >
              <option value="views">Most Viewed</option>
              <option value="rating">Top Rated</option>
              <option value="name">A-Z</option>
            </select>
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-[#E50914]/10 border border-[#E50914]/30 rounded-lg text-sm text-[#E50914] hover:bg-[#E50914]/20 transition"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Region Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Region</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedRegion('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedRegion === 'all'
                        ? 'bg-[#E50914] text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    All Regions
                  </button>
                  {regions.filter(r => r.id !== 'all').map(region => (
                    <button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${region.flag} ${
                        selectedRegion === region.id
                          ? 'bg-[#E50914] text-white'
                          : 'bg-zinc-900 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedCategory === 'all'
                        ? 'bg-[#E50914] text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.filter(c => c.id !== 'all').slice(0, 5).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedCategory === cat.id
                          ? 'bg-[#E50914] text-white'
                          : 'bg-zinc-900 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Language</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedLanguage('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedLanguage === 'all'
                        ? 'bg-[#E50914] text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    All Languages
                  </button>
                  {allLanguages.slice(0, 5).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedLanguage === lang
                          ? 'bg-[#E50914] text-white'
                          : 'bg-zinc-900 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedRegion !== 'all' || selectedCategory !== 'all' || selectedLanguage !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-4 w-full px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-sm font-bold transition border border-zinc-800"
              >
                <X className="w-4 h-4 inline mr-2" />
                Clear All Filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Channels Display */}
      {sortedChannels.length > 0 ? (
        viewMode === 'grid' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {sortedChannels.map((channel, idx) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectChannel(channel)}
                className="glass-card glass-card-hover p-4 rounded-xl flex flex-col justify-between gap-3 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 w-16 h-16 bg-[#E50914]/5 rounded-full blur-2xl group-hover:bg-[#E50914]/15 transition duration-500"></div>

                {/* Logo */}
                <div className="w-full h-24 bg-white/5 rounded-lg flex items-center justify-center relative z-10 group-hover:scale-105 transition">
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-20 h-20 object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://i.ibb.co/M5Yn41H/skhandalogo.png';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-white group-hover:text-[#E50914] transition line-clamp-2">
                      {channel.name}
                    </h3>
                    {channel.rating && (
                      <div className="flex items-center gap-0.5 bg-[#E50914]/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-[#E50914] whitespace-nowrap">
                        <Star className="w-3 h-3 fill-current" />
                        {channel.rating}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 bg-[#E50914]/10 text-[#E50914] rounded font-bold uppercase">
                      {channel.category[0]}
                    </span>
                    {channel.views && (
                      <span className="px-2 py-0.5 bg-zinc-900 text-zinc-400 rounded font-mono text-[9px]">
                        👁️ {channel.views}
                      </span>
                    )}
                  </div>

                  <p className="text-[9px] text-zinc-400 line-clamp-1">{channel.now_playing}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* List View */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {sortedChannels.map((channel, idx) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => onSelectChannel(channel)}
                className="glass-card glass-card-hover p-4 rounded-lg flex items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-12 h-12 object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = 'https://i.ibb.co/M5Yn41H/skhandalogo.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white group-hover:text-[#E50914] transition">
                      {channel.name}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-1">{channel.now_playing}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[8px] px-2 py-0.5 bg-[#E50914]/10 text-[#E50914] rounded font-bold uppercase">
                        {channel.category[0]}
                      </span>
                      {channel.language.map(lang => (
                        <span key={lang} className="text-[8px] px-2 py-0.5 bg-zinc-900 text-zinc-400 rounded font-mono">
                          {lang.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {channel.rating && (
                    <div className="flex items-center gap-1 bg-[#E50914]/20 px-2 py-1 rounded">
                      <Star className="w-4 h-4 fill-[#E50914] text-[#E50914]" />
                      <span className="text-sm font-bold text-[#E50914]">{channel.rating}</span>
                    </div>
                  )}
                  {channel.views && (
                    <span className="text-[10px] text-zinc-500 font-mono">{channel.views}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )
      ) : (
        <div className="text-center py-12 px-4 bg-zinc-950/20 rounded-2xl border border-zinc-900/40">
          <Globe className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-400">No Channels Found</h3>
          <p className="text-sm text-zinc-500 mt-1">Try adjusting your search or filters to find channels</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-[#E50914] hover:bg-red-600 text-white rounded-lg font-bold transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
