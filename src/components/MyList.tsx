/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Play, Trash2, Library, Tv } from 'lucide-react';
import { Channel } from '../types';

interface MyListProps {
  favorites: number[];
  continueWatching: { channelId: number; progressSeconds: number; lastWatched: number }[];
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite: (id: number) => void;
  onClearContinueWatching: (id: number) => void;
}

export default function MyList({
  favorites,
  continueWatching,
  channels,
  onSelectChannel,
  onToggleFavorite,
  onClearContinueWatching,
}: MyListProps) {
  
  // Resolve channels
  const favoriteChannels = channels.filter(c => favorites.includes(c.id));
  const continueChannelsResolved = continueWatching
    .map(item => {
      const channel = channels.find(c => c.id === item.channelId);
      return channel ? { ...channel, progress: item.progressSeconds } : null;
    })
    .filter(Boolean) as (Channel & { progress: number })[];

  return (
    <div id="mylist-screen" className="flex flex-col gap-8">
      
      {/* Continue Watching Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-2">
          <Play className="w-4 h-4 text-[#E50914] fill-[#E50914]" />
          <span>Continue Watching</span>
        </h3>

        {continueChannelsResolved.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {continueChannelsResolved.map((channel) => (
              <div
                key={channel.id}
                id={`continue-watching-card-${channel.id}`}
                className="glass-card p-4 rounded-2xl flex flex-col justify-between gap-3 relative group overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
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
                      <h4 className="font-extrabold text-xs text-white truncate max-w-[150px]">
                        {channel.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                        {channel.now_playing || 'Live Feed'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`play-continue-watching-${channel.id}`}
                      onClick={() => onSelectChannel(channel)}
                      className="p-2 bg-[#E50914] hover:bg-red-600 rounded-xl text-white transition cursor-pointer"
                      title="Resume Stream"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </button>
                    <button
                      id={`clear-continue-watching-${channel.id}`}
                      onClick={() => onClearContinueWatching(channel.id)}
                      className="p-2 bg-zinc-950 hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-red-500 transition border border-zinc-900 cursor-pointer"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar simulation for video playback progress */}
                <div className="mt-2">
                  <div className="flex justify-between items-center text-[8px] text-zinc-500 mb-1 font-mono">
                    <span>Progress: {Math.floor(channel.progress / 60)}m logged</span>
                    <span>Live Session</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#E50914] to-red-400"
                      style={{ width: `${Math.min(100, (channel.progress / 1200) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div id="continue-watching-empty" className="py-6 px-4 bg-zinc-950/25 rounded-2xl border border-dashed border-zinc-900 text-center flex flex-col items-center justify-center">
            <span className="text-zinc-600 text-xs">No playback history. Stream channels from the Home screen to resume them later.</span>
          </div>
        )}
      </div>

      {/* Favorites / Saved Channels Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-2">
          <Heart className="w-4 h-4 text-[#E50914] fill-[#E50914]" />
          <span>My Favorite Channels</span>
        </h3>

        {favoriteChannels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {favoriteChannels.map((channel) => (
              <div
                key={channel.id}
                id={`favorite-channel-card-${channel.id}`}
                className="glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden group"
                onClick={() => onSelectChannel(channel)}
              >
                {/* Visual Accent */}
                <div className="absolute right-0 top-0 w-20 h-20 bg-[#E50914]/5 rounded-full blur-2xl group-hover:bg-[#E50914]/15 transition duration-500"></div>

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-9 h-9 rounded-full object-contain bg-zinc-900 border border-zinc-800 p-1"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = 'https://i.ibb.co/M5Yn41H/skhandalogo.png';
                      }}
                    />
                    <div>
                      <h4 className="font-extrabold text-xs text-white group-hover:text-[#E50914] transition truncate max-w-[120px]">
                        {channel.name}
                      </h4>
                      <span className="text-[8px] uppercase tracking-wider font-bold text-[#E50914]">
                        Favorites
                      </span>
                    </div>
                  </div>

                  <button
                    id={`remove-favorite-btn-${channel.id}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid triggering player
                      onToggleFavorite(channel.id);
                    }}
                    className="p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-red-500/30 rounded-xl text-red-500 transition cursor-pointer"
                    title="Remove from favorites"
                  >
                    <Heart className="w-3.5 h-3.5 fill-red-500" />
                  </button>
                </div>

                <div className="relative z-10 border-t border-zinc-900/60 pt-2 flex flex-col">
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono">Stream Status</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] text-zinc-300 font-medium truncate">{channel.now_playing || 'Live Stream Active'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div id="favorites-empty-state" className="flex flex-col items-center justify-center p-10 bg-zinc-950/20 rounded-2xl border border-zinc-900/40 text-center">
            <Library className="w-8 h-8 text-zinc-700 mb-2.5" />
            <h4 className="font-extrabold text-xs text-zinc-400">Your List is Empty</h4>
            <p className="text-zinc-600 text-[11px] mt-1 max-w-xs">
              Bookmark channels you watch regularly by clicking the Heart button on the channel cells. They will appear here for fast-click streaming.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
