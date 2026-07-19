/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface ViewingHistory {
  channelId: number;
  channelName: string;
  timestamp: number;
  duration: number;
}

interface ViewingAnalyticsProps {
  viewingHistory: ViewingHistory[];
}

export default function ViewingAnalytics({ viewingHistory }: ViewingAnalyticsProps) {
  const analytics = useMemo(() => {
    const totalTime = viewingHistory.reduce((sum, item) => sum + item.duration, 0);
    const channelStats: Record<string, { duration: number; count: number }> = {};

    viewingHistory.forEach((item) => {
      if (!channelStats[item.channelName]) {
        channelStats[item.channelName] = { duration: 0, count: 0 };
      }
      channelStats[item.channelName].duration += item.duration;
      channelStats[item.channelName].count += 1;
    });

    const topChannels = Object.entries(channelStats)
      .map(([name, stats]) => ({
        name,
        ...stats,
        percentage: (stats.duration / totalTime) * 100
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    return {
      totalTime,
      totalSessions: viewingHistory.length,
      topChannels,
      averageSessionTime: totalTime / viewingHistory.length
    };
  }, [viewingHistory]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-[#E50914]" />
          <span>Your Viewing Analytics</span>
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0 }}
            className="glass-card p-4 rounded-xl border border-zinc-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Total Time</p>
                <p className="text-2xl font-bold text-white mt-2">{formatTime(analytics.totalTime)}</p>
              </div>
              <Clock className="w-8 h-8 text-[#E50914] opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 rounded-xl border border-zinc-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Sessions</p>
                <p className="text-2xl font-bold text-white mt-2">{analytics.totalSessions}</p>
              </div>
              <Eye className="w-8 h-8 text-[#E50914] opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 rounded-xl border border-zinc-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Avg Session</p>
                <p className="text-2xl font-bold text-white mt-2"{formatTime(Math.round(analytics.averageSessionTime))}"</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#E50914] opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4 rounded-xl border border-zinc-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Top Channel</p>
                <p className="text-2xl font-bold text-white mt-2">{analytics.topChannels.length}+ Channels</p>
              </div>
              <BarChart3 className="w-8 h-8 text-[#E50914] opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Top Channels Chart */}
        {analytics.topChannels.length > 0 && (
          <div className="glass-card p-6 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Top Channels</h3>
            <div className="space-y-3">
              {analytics.topChannels.map((channel, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white">{channel.name}</span>
                    <span className="text-xs text-zinc-500">{formatTime(channel.duration)}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${channel.percentage}%` }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-[#E50914] to-red-600 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-zinc-500">{channel.count} views</span>
                    <span className="text-[10px] text-[#E50914] font-bold">{channel.percentage.toFixed(1)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
