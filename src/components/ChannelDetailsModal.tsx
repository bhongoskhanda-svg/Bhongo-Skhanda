/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  Heart,
  MessageSquare,
  Star,
  Play,
  MapPin,
  Globe,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  Zap
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

interface ChannelDetailsModalProps {
  channel: Channel | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (channel: Channel) => void;
  onAddToWatchlist: (channel: Channel) => void;
  isFavorite: boolean;
  watchlistCount: number;
}

export default function ChannelDetailsModal({
  channel,
  isOpen,
  onClose,
  onPlay,
  onAddToWatchlist,
  isFavorite,
  watchlistCount
}: ChannelDetailsModalProps) {
  const [showReviews, setShowReviews] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: 'John Doe',
      rating: 5,
      text: 'Excellent channel with great content!',
      likes: 24,
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      author: 'Sarah Smith',
      rating: 4,
      text: 'Good quality streams, occasionally buffering.',
      likes: 12,
      timestamp: '5 hours ago'
    }
  ]);

  const handleSubmitReview = () => {
    if (reviewText.trim()) {
      setReviews([
        {
          id: reviews.length + 1,
          author: 'You',
          rating,
          text: reviewText,
          likes: 0,
          timestamp: 'Just now'
        },
        ...reviews
      ]);
      setReviewText('');
      setRating(5);
    }
  };

  if (!channel || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-zinc-950 to-black rounded-3xl border border-zinc-900 shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur z-10">
              <h2 className="text-2xl font-bold text-white">{channel.name}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-900 rounded-lg transition"
              >
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Channel Logo & Primary Info */}
              <div className="flex gap-6 items-start">
                <div className="w-32 h-32 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 border border-zinc-800">
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-28 h-28 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-3 py-1 bg-[#E50914]/20 text-[#E50914] rounded-full font-bold">
                      {channel.is_live ? '🔴 LIVE' : 'Offline'}
                    </span>
                    {channel.rating && (
                      <div className="flex items-center gap-1 text-sm font-bold">
                        <Star className="w-4 h-4 fill-[#E50914] text-[#E50914]" />
                        <span className="text-[#E50914]">{channel.rating}</span>
                        <span className="text-zinc-500">/ 5</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-zinc-300">{channel.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {channel.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-zinc-900 text-zinc-400 rounded font-mono border border-zinc-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 rounded-xl p-3 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-[#E50914]" />
                    <span className="text-xs text-zinc-500">Views</span>
                  </div>
                  <p className="text-lg font-bold text-white">{channel.views || 'N/A'}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-3 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#E50914]" />
                    <span className="text-xs text-zinc-500">Viewers</span>
                  </div>
                  <p className="text-lg font-bold text-white">1.2M</p>
                </div>

                <div className="bg-white/5 rounded-xl p-3 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-[#E50914]" />
                    <span className="text-xs text-zinc-500">Reviews</span>
                  </div>
                  <p className="text-lg font-bold text-white">{reviews.length}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-3 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-[#E50914]" />
                    <span className="text-xs text-zinc-500">Trending</span>
                  </div>
                  <p className="text-lg font-bold text-white">#12</p>
                </div>
              </div>

              {/* Channel Info Grid */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-950/50 rounded-xl p-4 border border-zinc-800">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Region</p>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E50914]" />
                    {channel.country || channel.region}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    {channel.category[0]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Languages</p>
                  <p className="text-sm font-bold text-white">
                    {channel.language.map((l) => l.toUpperCase()).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Stream Type</p>
                  <p className="text-sm font-bold text-white uppercase">{channel.type}</p>
                </div>
              </div>

              {/* Now Playing */}
              <div className="bg-[#E50914]/10 rounded-xl p-4 border border-[#E50914]/30">
                <p className="text-xs text-[#E50914] uppercase tracking-wider font-bold mb-2">Now Playing</p>
                <p className="text-lg font-bold text-white">{channel.now_playing}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => onPlay(channel)}
                  className="flex-1 px-4 py-3 bg-[#E50914] hover:bg-red-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Play Now
                </button>
                <button
                  onClick={() => onAddToWatchlist(channel)}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                    isFavorite
                      ? 'bg-[#E50914]/20 text-[#E50914] border border-[#E50914]'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#E50914]' : ''}`} />
                  {isFavorite ? 'Saved' : 'Save'}
                </button>
                <button className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold transition border border-zinc-800 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Reviews Section */}
              <div className="border-t border-zinc-800 pt-6 space-y-4">
                <button
                  onClick={() => setShowReviews(!showReviews)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#E50914]" />
                    Reviews & Comments
                  </h3>
                  <span className="text-sm font-bold text-zinc-500">{reviews.length}</span>
                </button>

                <AnimatePresence>
                  {showReviews && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {/* Add Review Form */}
                      <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800 space-y-3">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="transition"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= rating
                                    ? 'fill-[#E50914] text-[#E50914]'
                                    : 'text-zinc-700'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your thoughts about this channel..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#E50914] resize-none"
                          rows={3}
                        />
                        <button
                          onClick={handleSubmitReview}
                          className="w-full px-4 py-2 bg-[#E50914] hover:bg-red-600 text-white rounded-lg font-bold transition"
                        >
                          Post Review
                        </button>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="bg-zinc-950/30 rounded-lg p-3 border border-zinc-800/50"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-bold text-white text-sm">{review.author}</p>
                                <p className="text-xs text-zinc-500">{review.timestamp}</p>
                              </div>
                              <div className="flex gap-0.5">
                                {Array(review.rating)
                                  .fill(0)
                                  .map((_, i) => (
                                    <Star
                                      key={i}
                                      className="w-3 h-3 fill-[#E50914] text-[#E50914]"
                                    />
                                  ))}
                              </div>
                            </div>
                            <p className="text-sm text-zinc-300 mb-2">{review.text}</p>
                            <button className="text-xs text-[#E50914] font-bold hover:text-red-400 transition">
                              👍 {review.likes}
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
