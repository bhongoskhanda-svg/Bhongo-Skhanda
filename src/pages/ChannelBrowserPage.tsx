/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import ChannelBrowser from '../components/ChannelBrowser';

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

interface Region {
  id: string;
  name: string;
  flag: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface ChannelData {
  channels: Channel[];
  regions: Region[];
  categories: Category[];
}

export default function ChannelBrowserPage({
  onSelectChannel
}: {
  onSelectChannel: (channel: Channel) => void;
}) {
  const [data, setData] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/channels-500.json');
        if (!response.ok) throw new Error('Failed to load channels');
        const channelData = await response.json();
        setData({
          channels: channelData.channels,
          regions: channelData.regions,
          categories: channelData.categories
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load channels');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading 500+ channels...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Failed to load channels'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#E50914] hover:bg-red-600 text-white rounded-lg font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChannelBrowser
      channels={data.channels}
      regions={data.regions}
      categories={data.categories}
      onSelectChannel={onSelectChannel}
    />
  );
}
