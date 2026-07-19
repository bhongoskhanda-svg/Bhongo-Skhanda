/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Plus, X, Heart, Share2 } from 'lucide-react';

interface Channel {
  id: number;
  name: string;
  logo: string;
  category: string[];
  now_playing?: string;
  views?: string;
  rating?: number;
}

interface WatchlistProps {
  watchlist: Channel[];
  onRemove: (channelId: number) => void;
  onPlay: (channel: Channel) => void;
}

export default function Watchlist({ watchlist, onRemove, onPlay }: WatchlistProps) {
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collections, setCollections] = useState([
    { id: 'all', name: 'All Channels', count: watchlist.length },
    { id: 'favorites', name: 'Favorites', count: Math.floor(watchlist.length * 0.3) },
    { id: 'news', name: 'News Channels', count: Math.floor(watchlist.length * 0.2) },
    { id: 'sports', name: 'Sports', count: Math.floor(watchlist.length * 0.15) }
  ]);

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      setCollections([
        ...collections,
        {
          id: newCollectionName.toLowerCase(),
          name: newCollectionName,
          count: 0
        }
      ]);
      setNewCollectionName('');
      setShowCreateCollection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Collections Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {collections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => setSelectedCollection(collection.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
              selectedCollection === collection.id
                ? 'bg-[#E50914] text-white'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {collection.name}
            <span className="ml-2 text-xs opacity-75">({collection.count})</span>
          </button>
        ))}
        <button
          onClick={() => setShowCreateCollection(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/30 hover:bg-[#E50914]/20 transition"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Create Collection Modal */}
      <AnimatePresence>
        {showCreateCollection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateCollection(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-white mb-4">Create New Collection</h3>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white mb-4 focus:outline-none focus:border-[#E50914]"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateCollection(false)}
                  className="flex-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCollection}
                  className="flex-1 px-4 py-2 bg-[#E50914] hover:bg-red-600 text-white rounded-lg font-bold transition"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watchlist Grid */}
      {watchlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((channel, idx) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-4 rounded-xl flex flex-col justify-between gap-3 group relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 w-16 h-16 bg-[#E50914]/5 rounded-full blur-2xl group-hover:bg-[#E50914]/15 transition duration-500"></div>

              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-10 h-10 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white line-clamp-2">{channel.name}</h4>
                    <span className="text-[8px] px-2 py-0.5 bg-[#E50914]/10 text-[#E50914] rounded uppercase font-bold mt-1 inline-block">
                      {channel.category[0]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(channel.id)}
                  className="p-1.5 bg-red-950/30 hover:bg-red-600 text-red-400 hover:text-white rounded transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative z-10 flex gap-2">
                <button
                  onClick={() => onPlay(channel)}
                  className="flex-1 px-3 py-2 bg-[#E50914] hover:bg-red-600 text-white rounded-lg text-xs font-bold transition"
                >
                  Play
                </button>
                <button className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-zinc-950/30 rounded-2xl border border-zinc-900">
          <Bookmark className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-400">Your Watchlist is Empty</h3>
          <p className="text-sm text-zinc-500 mt-1">Save channels to watch later</p>
        </div>
      )}
    </div>
  );
}
