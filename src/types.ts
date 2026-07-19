/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Channel {
  id: number;
  name: string;
  logo: string;
  category: string[];
  type: 'youtube' | 'm3u8';
  url: string;
  now_playing?: string;
  views?: string;
  youtube_search?: string;
  note?: string;
  is_live?: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Program {
  id: string;
  channelId: number;
  title: string;
  time: string; // "14:00 - 15:30"
  startHour: number; // For rendering EPG layout
  durationHours: number;
  description: string;
}

export interface UserState {
  trialStart: number; // Timestamp (ms)
  isPremium: boolean;
  favorites: number[]; // Channel IDs
  continueWatching: { channelId: number; progressSeconds: number; lastWatched: number }[];
  parentalPin: string | null;
  videoQuality: 'auto' | '1080p' | '720p' | '480p';
  reminders: { programId: string; title: string; time: string; channelName: string }[];
}

export interface AdminStats {
  totalUsers: number;
  revenue: number;
  activeNow: number;
  pushSent: { id: string; title: string; body: string; timestamp: number }[];
  paymentReports: { id: string; user: string; amount: number; status: 'Completed' | 'Pending'; date: string }[];
}
