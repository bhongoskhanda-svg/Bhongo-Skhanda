/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search as SearchIcon, Flame, X, Tv } from 'lucide-react';
import { Channel } from '../types';

interface SearchProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
}

export default function Search({ channels, onSelectChannel }: SearchProps) {
  const [query, setQuery] = useState('');
  const trendingTags = ["Uzalo", "Amapiano", "SABC News", "eNCA", "Trace Africa", "Cartoon Network", "Sport"];

  const filteredChannels = channels.filter(channel => {
    const q = query.toLowerCase();
    
    // Match Channel name, category list, streaming type or currently playing show
    return (
      channel.name.toLowerCase().includes(q) ||
      channel.category.some(cat => cat.toLowerCase().includes(q)) ||
      (channel.now_playing && channel.now_playing.toLowerCase().includes(q))
    );
  });

  const handleTagClick = (tag: string) => {
    setQuery(tag);
  };

  return (
    <div id="search-screen" className="flex flex-col gap-6">
      
      {/* Search Input field */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-[#E50914]" />
          <span>Search Channels & Shows</span>
        </h2>

        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            id="search-input-field"
            type="text"
            placeholder="Search e.g. SABC, Amapiano, News, Uzalo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-950/60 text-white rounded-2xl border border-zinc-900 py-3.5 pl-12 pr-10 text-sm focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all font-sans"
          />
          {query && (
            <button
              id="clear-search-btn"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Trending Block */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          <span>Trending on Skhanda TV</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-1">
          {trendingTags.map((tag, idx) => (
            <button
              key={idx}
              id={`trending-tag-${idx}`}
              onClick={() => handleTagClick(tag)}
              className="px-3.5 py-1.5 bg-zinc-950/40 hover:bg-[#E50914]/15 hover:border-[#E50914]/60 border border-zinc-900 text-xs text-zinc-300 hover:text-white rounded-full transition-all duration-200 font-medium cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Area */}
      <div className="flex flex-col gap-3 mt-2">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
          {query ? `Search Results (${filteredChannels.length})` : "Browse All Channels"}
        </span>

        {filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredChannels.map((channel) => (
              <div
                key={channel.id}
                id={`search-result-channel-${channel.id}`}
                onClick={() => onSelectChannel(channel)}
                className="glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden group"
              >
                {/* Background overlay glow */}
                <div className="absolute right-0 top-0 w-24 h-24 bg-[#E50914]/5 rounded-full blur-2xl group-hover:bg-[#E50914]/15 transition duration-500"></div>

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-10 h-10 rounded-full object-contain bg-zinc-900 border border-zinc-800 p-1"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = 'https://i.ibb.co/M5Yn41H/skhandalogo.png';
                      }}
                    />
                    <div>
                      <h4 className="font-extrabold text-xs text-white group-hover:text-[#E50914] transition truncate max-w-[140px]">
                        {channel.name}
                      </h4>
                      <span className="text-[8px] bg-zinc-900 border border-zinc-850 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider mt-1 inline-block">
                        {channel.category[0]}
                      </span>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[8px] bg-[#E50914] text-white px-1.5 py-0.5 rounded font-black tracking-wider animate-pulse">
                    LIVE
                  </span>
                </div>

                <div className="relative z-10 border-t border-zinc-900/60 pt-2.5 flex flex-col gap-0.5">
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono">Now Playing</span>
                  <span className="text-[10px] text-zinc-300 font-medium truncate">
                    {channel.now_playing || 'Live General Broadcast Feed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div id="search-empty-state" className="flex flex-col items-center justify-center p-12 bg-zinc-950/20 rounded-2xl border border-zinc-900/40 text-center">
            <Tv className="w-10 h-10 text-zinc-700 mb-3" />
            <h4 className="font-extrabold text-sm text-zinc-400">No Channels Found</h4>
            <p className="text-zinc-600 text-xs mt-1 max-w-xs">
              We couldn't find any channels matching "{query}". Try typing general terms like "news", "sport", or specific shows like "Uzalo".
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
