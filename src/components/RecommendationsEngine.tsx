/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, Heart, Clock } from 'lucide-react';

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

interface ViewingHistory {
  channelId: number;
  timestamp: number;
  duration: number;
}

interface RecommendationsEngineProps {
  channels: Channel[];
  viewingHistory: ViewingHistory[];
  favorites: number[];
  onChannelSelect: (channel: Channel) => void;
}

export default function RecommendationsEngine({
  channels,
  viewingHistory,
  favorites,
  onChannelSelect
}: RecommendationsEngineProps) {
  // Calculate recommendations based on viewing history and preferences
  const recommendations = useMemo(() => {
    // Track category preferences
    const categoryScores: Record<string, number> = {};
    const regionScores: Record<string, number> = {};
    const languageScores: Record<string, number> = {};

    // Score based on viewing history
    viewingHistory.forEach((history) => {
      const channel = channels.find((c) => c.id === history.channelId);
      if (channel) {
        const weight = history.duration / 100; // Heavier weight for longer watches
        channel.category.forEach((cat) => {
          categoryScores[cat] = (categoryScores[cat] || 0) + weight;
        });
        regionScores[channel.region] = (regionScores[channel.region] || 0) + weight;
        channel.language.forEach((lang) => {
          languageScores[lang] = (languageScores[lang] || 0) + weight;
        });
      }
    });

    // Score favorites
    favorites.forEach((fav) => {
      const channel = channels.find((c) => c.id === fav);
      if (channel) {
        channel.category.forEach((cat) => {
          categoryScores[cat] = (categoryScores[cat] || 0) + 2;
        });
        regionScores[channel.region] = (regionScores[channel.region] || 0) + 1.5;
        channel.language.forEach((lang) => {
          languageScores[lang] = (languageScores[lang] || 0) + 1.5;
        });
      }
    });

    // Score channels based on preferences
    const scoredChannels = channels.map((channel) => {
      let score = 0;

      channel.category.forEach((cat) => {
        score += categoryScores[cat] || 0;
      });
      score += (regionScores[channel.region] || 0) * 0.5;
      channel.language.forEach((lang) => {
        score += (languageScores[lang] || 0) * 0.3;
      });

      // Boost by rating
      score += (channel.rating || 0) * 2;

      // Penalize already watched
      if (viewingHistory.some((h) => h.channelId === channel.id)) {
        score *= 0.5;
      }

      return { channel, score };
    });

    // Return top recommendations
    return scoredChannels
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.channel);
  }, [channels, viewingHistory, favorites]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-[#E50914]" />
          <span>Recommended For You</span>
        </h2>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((channel, idx) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onChannelSelect(channel)}
                className="glass-card glass-card-hover p-4 rounded-xl flex flex-col justify-between gap-3 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 w-16 h-16 bg-[#E50914]/5 rounded-full blur-2xl group-hover:bg-[#E50914]/15 transition duration-500"></div>

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

                <div className="relative z-10 flex flex-col gap-2">
                  <h3 className="font-bold text-sm text-white group-hover:text-[#E50914] transition line-clamp-2">
                    {channel.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 bg-[#E50914]/10 text-[#E50914] rounded font-bold uppercase">
                      {channel.category[0]}
                    </span>
                    {channel.rating && (
                      <span className="px-2 py-0.5 bg-zinc-900 text-[#E50914] rounded font-bold">⭐ {channel.rating}</span>
                    )}
                  </div>
                  <p className="text-[9px] text-zinc-400 line-clamp-1">{channel.now_playing}</p>
                </div>

                {channel.is_live && (
                  <div className="relative z-10 flex items-center gap-1.5 text-[10px] bg-red-950/50 px-2 py-1 rounded border border-red-900/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse"></span>
                    <span className="text-red-400 font-bold">LIVE NOW</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-950/30 rounded-2xl">
            <p className="text-zinc-400">Start watching channels to get personalized recommendations!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
