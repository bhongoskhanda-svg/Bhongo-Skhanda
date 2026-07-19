/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Bell, BellOff, Info, Check } from 'lucide-react';
import { Channel, Program } from '../types';

interface TvGuideProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onSetReminder: (program: { id: string; title: string; time: string; channelName: string }) => void;
  activeReminders: string[]; // List of program IDs with set reminders
}

// Helper to generate mock EPG data for SABC, e.tv, and Skhanda channels
const mockProgramsForChannel = (channelId: number, category: string[]): Program[] => {
  const isNews = category.includes('news');
  const isSport = category.includes('sport');
  const isMusic = category.includes('music');
  const isKids = category.includes('kids');
  const isChurch = category.includes('church');
  const isSkhanda = category.includes('skhanda');
  const isDocumentary = category.includes('documentary');

  if (isNews) {
    return [
      { id: `${channelId}-p1`, channelId, title: "Morning Breakfast News", time: "06:00 - 09:00", startHour: 6, durationHours: 3, description: "All the hot topics and updates from around South Africa and globally." },
      { id: `${channelId}-p2`, channelId, title: "SA Today - Midday Edition", time: "09:00 - 13:00", startHour: 9, durationHours: 4, description: "Detailed reporting, political discussions, and expert market analyses." },
      { id: `${channelId}-p3`, channelId, title: "The Globe Prime News", time: "13:00 - 17:00", startHour: 13, durationHours: 4, description: "International headlines, business stories, and continent focus." },
      { id: `${channelId}-p4`, channelId, title: "Uzalo Live Commentary", time: "17:00 - 19:30", startHour: 17, durationHours: 2.5, description: "Behind-the-scenes exclusives and community interviews on SA's biggest soap opera." },
      { id: `${channelId}-p5`, channelId, title: "Late Night African Brief", time: "19:30 - 24:00", startHour: 19.5, durationHours: 4.5, description: "Wrap-up of the day's local stories with specialized current affairs coverage." }
    ];
  } else if (isSport) {
    return [
      { id: `${channelId}-p1`, channelId, title: "SuperSport Blitz Highlights", time: "06:00 - 10:00", startHour: 6, durationHours: 4, description: "Fast-paced news, scores, and hot schedules from leagues world-wide." },
      { id: `${channelId}-p2`, channelId, title: "PSL Live: Soweto Derby Pre-Show", time: "10:00 - 14:00", startHour: 10, durationHours: 4, description: "Pre-match predictions, coach interviews, and player form review." },
      { id: `${channelId}-p3`, channelId, title: "Classic Match: Bafana vs Spain 2013", time: "14:00 - 18:00", startHour: 14, durationHours: 4, description: "Relive South Africa's historic victory over the reigning world champions." },
      { id: `${channelId}-p4`, channelId, title: "Live Soccer Special", time: "18:00 - 21:00", startHour: 18, durationHours: 3, description: "Action-packed football analysis with guests Benni McCarthy and Lucas Radebe." },
      { id: `${channelId}-p5`, channelId, title: "Extreme Boxing SA", time: "21:00 - 24:00", startHour: 21, durationHours: 3, description: "Local middleweight championships live from Johannesburg Arena." }
    ];
  } else if (isMusic) {
    return [
      { id: `${channelId}-p1`, channelId, title: "Rise & Grind Amapiano Set", time: "06:00 - 11:00", startHour: 6, durationHours: 5, description: "Get your energy high with the latest piano mixes straight from Pretoria." },
      { id: `${channelId}-p2`, channelId, title: "Gqom vs Kwaito Faceoff", time: "11:00 - 15:00", startHour: 11, durationHours: 4, description: "Durban Gqom beats compete head-to-head with classic 90s Kwaito grooves." },
      { id: `${channelId}-p3`, channelId, title: "Trace Africa Top 30 Countdown", time: "15:00 - 19:00", startHour: 15, durationHours: 4, description: "Voting-based ranking of the hottest music videos on the continent." },
      { id: `${channelId}-p4`, channelId, title: "Skhanda Amapiano Live Mix", time: "19:00 - 22:00", startHour: 19, durationHours: 3, description: "Exclusive 3D set with Kabza De Small, DJ Maphorisa, and Bongani Nkosi." },
      { id: `${channelId}-p5`, channelId, title: "Midnight Chill Chill Lounge", time: "22:00 - 24:00", startHour: 22, durationHours: 2, description: "Soothing afro-jazz and deep house to close your evening." }
    ];
  } else if (isKids) {
    return [
      { id: `${channelId}-p1`, channelId, title: "Adventure Time Mini-Marathon", time: "06:00 - 11:00", startHour: 6, durationHours: 5, description: "Jake the dog and Finn the human go on crazy quests in the land of Ooo." },
      { id: `${channelId}-p2`, channelId, title: "The Amazing World of Gumball", time: "11:00 - 15:00", startHour: 11, durationHours: 4, description: "Gumball and his adoptive gold-fish brother Darwin get in local mischief." },
      { id: `${channelId}-p3`, channelId, title: "Teen Titans Go! Live Action", time: "15:00 - 18:00", startHour: 15, durationHours: 3, description: "The superhero sidekicks show you what life is like when they are not fighting crime." },
      { id: `${channelId}-p4`, channelId, title: "SpongeBob SquarePants", time: "18:00 - 21:00", startHour: 18, durationHours: 3, description: "Who lives in a pineapple under the sea? Undersea antics with Patrick and Squidward." },
      { id: `${channelId}-p5`, channelId, title: "Anime Spotlight: Kids Edition", time: "21:00 - 24:00", startHour: 21, durationHours: 3, description: "Family-friendly Japanese anime series dubbed in local languages." }
    ];
  } else if (isChurch) {
    return [
      { id: `${channelId}-p1`, channelId, title: "Morning Devotion Live", time: "06:00 - 10:00", startHour: 6, durationHours: 4, description: "Praise and worship with international pastors and musical guests." },
      { id: `${channelId}-p2`, channelId, title: "Inspirational Teachings", time: "10:00 - 14:00", startHour: 10, durationHours: 4, description: "Spiritual guidance, bible study sessions, and self-improvement techniques." },
      { id: `${channelId}-p3`, channelId, title: "Joyous Celebration Gospel Live", time: "14:00 - 18:00", startHour: 14, durationHours: 4, description: "Exclusive concert records from the leading SA gospel group." },
      { id: `${channelId}-p4`, channelId, title: "Family Prayer Circle", time: "18:00 - 21:00", startHour: 18, durationHours: 3, description: "Uniting families in faith with prayer requests phoned in live." },
      { id: `${channelId}-p5`, channelId, title: "Late Night Sermons", time: "21:00 - 24:00", startHour: 21, durationHours: 3, description: "Reflective teachings and serene instrumental hymns." }
    ];
  } else if (isDocumentary) {
    return [
      { id: `${channelId}-p1`, channelId, title: "Wild Earth Sunrise Safari", time: "06:00 - 10:00", startHour: 6, durationHours: 4, description: "Get close to Africa's iconic wildlife with expert guides during the magic hour." },
      { id: `${channelId}-p2`, channelId, title: "Space Walk Diaries & NASA Space Stations", time: "10:00 - 14:00", startHour: 10, durationHours: 4, description: "Interviews with active astronauts on board the ISS and high-definition spacewalk archives." },
      { id: `${channelId}-p3`, channelId, title: "Cosmic Mysteries and Science Live", time: "14:00 - 18:00", startHour: 14, durationHours: 4, description: "Exploration of dark matter, supermassive black holes, and deep space telescope achievements." },
      { id: `${channelId}-p4`, channelId, title: "Predator & Prey: Bushveld Chronicles", time: "18:00 - 21:00", startHour: 18, durationHours: 3, description: "Tense tracking of lion prides and leopards in the heart of the Greater Kruger Park." },
      { id: `${channelId}-p5`, channelId, title: "Deep Space Night View", time: "21:00 - 24:00", startHour: 21, durationHours: 3, description: "Peaceful real-time views of Earth from orbit, accompanied by space telemetry updates." }
    ];
  } else {
    // Default Skhanda Originals or SABC 1-3
    return [
      { id: `${channelId}-p1`, channelId, title: "Generations: The Legacy", time: "06:00 - 10:00", startHour: 6, durationHours: 4, description: "High stakes, drama, and luxury advertising in SA's premier media conglomerate." },
      { id: `${channelId}-p2`, channelId, title: "Skeem Saam - College Days", time: "10:00 - 14:00", startHour: 10, durationHours: 4, description: "Youth-centric soap opera dealing with trials, love, and education." },
      { id: `${channelId}-p3`, channelId, title: "Uzalo: Primetime Premiere", time: "14:00 - 18:00", startHour: 14, durationHours: 4, description: "Rivalry, religion, and gangsters clash in KwaMashu township." },
      { id: `${channelId}-p4`, channelId, title: "Scandal! - Live Broadcast", time: "18:00 - 21:00", startHour: 18, durationHours: 3, description: "The staff of newspaper The Voice unearth corruption while battling their own issues." },
      { id: `${channelId}-p5`, channelId, title: "Skhanda Original Film: Amapiano Kings", time: "21:00 - 24:00", startHour: 21, durationHours: 3, description: "Exclusive documentary about the explosion of South African piano sounds across the world." }
    ];
  }
};

export default function TvGuide({ channels, onSelectChannel, onSetReminder, activeReminders }: TvGuideProps) {
  // Generate 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      name: d.toLocaleDateString('en-ZA', { weekday: 'short' }),
      dateStr: d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
      isToday: i === 0,
    };
  });

  const [selectedDay, setSelectedDay] = useState(0);
  const [activeChannelId, setActiveChannelId] = useState<number>(channels[0]?.id || 1);
  const [hoveredProgramId, setHoveredProgramId] = useState<string | null>(null);

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];
  const programs = activeChannel ? mockProgramsForChannel(activeChannel.id, activeChannel.category) : [];

  const handleReminderToggle = (p: Program) => {
    onSetReminder({
      id: p.id,
      title: p.title,
      time: p.time,
      channelName: activeChannel.name
    });
  };

  return (
    <div id="tv-guide-screen" className="flex flex-col gap-6">
      
      {/* 7-Day Header Selector */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#E50914]" />
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">7-Day TV Guide (EPG)</h2>
        </div>
        
        {/* Date Row */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {days.map((day, idx) => (
            <button
              key={idx}
              id={`guide-day-tab-${idx}`}
              onClick={() => setSelectedDay(idx)}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl border min-w-16 transition-all duration-300 cursor-pointer ${
                selectedDay === idx
                ? 'bg-[#E50914] border-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="text-[10px] font-mono tracking-widest uppercase">{day.name}</span>
              <span className="text-sm font-extrabold">{day.dateStr}</span>
              {day.isToday && <span className="text-[7px] font-black uppercase mt-0.5 opacity-80 bg-black/30 px-1 py-0.1 rounded">Today</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Channels on left, EPG grid on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[420px]">
        
        {/* Channels List (Left Column) */}
        <div className="md:col-span-4 flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Select Channel</span>
          {channels.map((channel) => {
            const isSelected = channel.id === activeChannelId;
            return (
              <button
                key={channel.id}
                id={`guide-channel-select-${channel.id}`}
                onClick={() => setActiveChannelId(channel.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                  ? 'bg-zinc-900/90 border-[#E50914] shadow-[inset_0_0_10px_rgba(229,9,20,0.1)]'
                  : 'bg-zinc-950/40 border-zinc-900/60 hover:bg-zinc-900/40'
                }`}
              >
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="w-8 h-8 rounded-full object-contain bg-zinc-900 p-1 border border-zinc-800"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = 'https://i.ibb.co/M5Yn41H/skhandalogo.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-xs text-white truncate">{channel.name}</div>
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">{channel.now_playing || 'Live Broadcast'}</div>
                </div>
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* EPG Timeline Grid (Right Column) */}
        <div className="md:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-900">
            <div className="flex items-center gap-2">
              <img
                src={activeChannel?.logo}
                alt={activeChannel?.name}
                className="w-5 h-5 object-contain rounded bg-zinc-900 p-0.5"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://i.ibb.co/M5Yn41H/skhandalogo.png';
                }}
              />
              <span className="font-extrabold text-xs text-white">{activeChannel?.name} Timeline</span>
            </div>
            <button
              id="guide-watch-live-btn"
              onClick={() => onSelectChannel(activeChannel)}
              className="px-3 py-1 bg-[#E50914] hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition"
            >
              Watch Live Feed
            </button>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[390px] overflow-y-auto pr-1">
            {programs.map((program) => {
              const isReminderSet = activeReminders.includes(program.id);
              const isHovered = hoveredProgramId === program.id;
              
              return (
                <div
                  key={program.id}
                  id={`guide-program-card-${program.id}`}
                  onMouseEnter={() => setHoveredProgramId(program.id)}
                  onMouseLeave={() => setHoveredProgramId(null)}
                  className={`glass-card p-4 rounded-xl flex items-center justify-between border-l-2 hover:border-l-4 border-l-[#E50914] transition-all relative group ${
                    isReminderSet 
                      ? 'bg-red-950/10 border-[#E50914]/20 ring-1 ring-[#E50914]/30 shadow-[0_0_15px_rgba(229,9,20,0.15)]' 
                      : ''
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-zinc-400 font-semibold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
                        {program.time}
                      </span>
                      {isReminderSet && (
                        <span id={`active-reminder-indicator-${program.id}`} className="inline-flex items-center gap-1 text-[9px] font-black text-white bg-[#E50914] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(229,9,20,0.4)]">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                          </span>
                          <Bell className="w-2.5 h-2.5 fill-white shrink-0" />
                          <span>Active Reminder</span>
                        </span>
                      )}
                    </div>
                    <h4 className={`font-extrabold text-xs mt-2 transition ${
                      isReminderSet ? 'text-[#E50914]' : 'text-white group-hover:text-[#E50914]'
                    }`}>
                      {program.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {program.description}
                    </p>
                  </div>

                  <button
                    id={`guide-reminder-toggle-${program.id}`}
                    onClick={() => handleReminderToggle(program)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isReminderSet
                      ? 'bg-[#E50914]/20 border-[#E50914] text-white'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white hover:border-[#E50914]'
                    }`}
                    title={isReminderSet ? "Remove Reminder" : "Set Reminder"}
                  >
                    {isReminderSet ? (
                      <div className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-[#E50914]" />
                        <span className="text-[8px] font-bold uppercase tracking-wider text-[#E50914]">Reminder Set</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Bell className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                        <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white">Remind Me</span>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
