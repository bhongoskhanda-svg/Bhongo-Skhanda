/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Edit2, Lock, Users, LineChart, Radio, Send, Bell, ListFilter, Check, Activity, Loader2 } from 'lucide-react';
import { Channel, AdminStats } from '../types';

interface AdminPanelProps {
  channels: Channel[];
  onUpdateChannels: (updatedChannels: Channel[]) => void;
  adminStats: AdminStats;
  onUpdateStats: (updates: Partial<AdminStats>) => void;
}

export default function AdminPanel({
  channels,
  onUpdateChannels,
  adminStats,
  onUpdateStats,
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Channel Form States
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formType, setFormType] = useState<'youtube' | 'm3u8'>('youtube');
  const [formCategory, setFormCategory] = useState<string>('news');
  const [formNowPlaying, setFormNowPlaying] = useState('');

  // Push notification states
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushSuccess, setPushSuccess] = useState(false);

  // Stream Health Check States
  const [isChecking, setIsChecking] = useState(false);
  const [checkingProgress, setCheckingProgress] = useState(0);
  const [checkResults, setCheckResults] = useState<Record<number, { status: 'online' | 'offline'; statusCode: number; error?: string; checkedAt: number }>>({});

  // Core health checker runner
  const runHealthCheck = async () => {
    if (isChecking) return;
    setIsChecking(true);
    setCheckingProgress(0);

    const updatedResults = { ...checkResults };

    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      try {
        const response = await fetch('/api/check-health', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: channel.url }),
        });

        if (response.ok) {
          const data = await response.json();
          updatedResults[channel.id] = {
            status: data.status,
            statusCode: data.statusCode,
            error: data.error,
            checkedAt: Date.now(),
          };
        } else {
          updatedResults[channel.id] = {
            status: 'offline',
            statusCode: response.status,
            error: `Server status: ${response.status}`,
            checkedAt: Date.now(),
          };
        }
      } catch (err: any) {
        updatedResults[channel.id] = {
          status: 'offline',
          statusCode: 500,
          error: err.message || 'Connection failed',
          checkedAt: Date.now(),
        };
      }
      setCheckingProgress(i + 1);
      setCheckResults({ ...updatedResults });
    }

    setIsChecking(false);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'bhongoskhanda@gmail.com' && password === 'BhongomanG@$#90') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Administrator Email or Password. Hint: bhongoskhanda@gmail.com / BhongomanG@$#90');
    }
  };

  // Add/Edit Channel Submission
  const handleChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingChannelId !== null) {
      // Edit mode
      const updated = channels.map(ch => {
        if (ch.id === editingChannelId) {
          return {
            ...ch,
            name: formName,
            logo: formLogo || 'https://i.ibb.co/M5Yn41H/skhandalogo.png',
            url: formUrl,
            type: formType,
            category: [formCategory],
            now_playing: formNowPlaying || 'General Broadcast'
          };
        }
        return ch;
      });
      onUpdateChannels(updated);
    } else {
      // Create mode
      const newId = Math.max(0, ...channels.map(c => c.id)) + 1;
      const newChan: Channel = {
        id: newId,
        name: formName,
        logo: formLogo || 'https://i.ibb.co/M5Yn41H/skhandalogo.png',
        url: formUrl,
        type: formType,
        category: [formCategory],
        now_playing: formNowPlaying || 'General Broadcast',
        views: '1.0K'
      };
      onUpdateChannels([newChan, ...channels]);
    }

    // Reset Form
    resetChannelForm();
  };

  const resetChannelForm = () => {
    setShowChannelForm(false);
    setEditingChannelId(null);
    setFormName('');
    setFormLogo('');
    setFormUrl('');
    setFormType('youtube');
    setFormCategory('news');
    setFormNowPlaying('');
  };

  const handleEditClick = (ch: Channel) => {
    setEditingChannelId(ch.id);
    setFormName(ch.name);
    setFormLogo(ch.logo);
    setFormUrl(ch.url);
    setFormType(ch.type);
    setFormCategory(ch.category[0] || 'news');
    setFormNowPlaying(ch.now_playing || '');
    setShowChannelForm(true);
  };

  const handleDeleteChannel = (id: number) => {
    if (confirm('Are you sure you want to delete this channel from Skhanda TV listings?')) {
      onUpdateChannels(channels.filter(c => c.id !== id));
    }
  };

  // Push notification dispatch
  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle || !pushBody) return;

    const newPush = {
      id: Math.random().toString(36).substring(7),
      title: pushTitle,
      body: pushBody,
      timestamp: Date.now()
    };

    onUpdateStats({
      pushSent: [newPush, ...adminStats.pushSent]
    });

    setPushTitle('');
    setPushBody('');
    setPushSuccess(true);
    setTimeout(() => setPushSuccess(false), 2000);
  };

  if (!isAuthenticated) {
    /* Screen 10 Password Lock Login */
    return (
      <div id="admin-login-panel" className="max-w-md mx-auto my-12 glass-card p-8 rounded-3xl border border-[#E50914]/40 relative overflow-hidden">
        {/* Glowing background */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-[#E50914]/10 rounded-full blur-2xl"></div>

        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#E50914]/15 border border-[#E50914] rounded-2xl flex items-center justify-center text-[#E50914]">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">Skhanda TV Admin</h2>
          <p className="text-[10px] text-zinc-500 max-w-xs">
            Restricted access. Please sign in with administrator credentials.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Email Address</label>
            <input
              id="admin-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bhongoskhanda@gmail.com"
              className="bg-zinc-900 border border-zinc-850 text-white text-xs p-3.5 rounded-xl focus:outline-none focus:border-[#E50914]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Security Password</label>
            <input
              id="admin-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-900 border border-zinc-850 text-white text-xs p-3.5 rounded-xl focus:outline-none focus:border-[#E50914]"
            />
          </div>

          {loginError && (
            <div id="admin-login-error" className="p-2.5 bg-red-600/10 border border-red-500/30 text-[#E50914] text-[10px] font-semibold rounded-lg text-center leading-normal">
              {loginError}
            </div>
          )}

          <div className="bg-zinc-900/60 p-2.5 rounded-xl text-[9px] text-zinc-500 leading-normal border border-zinc-850">
            💡 <span className="font-bold text-zinc-400">Preview Credentials:</span><br />
            Email: <span className="font-mono text-zinc-300 select-all">bhongoskhanda@gmail.com</span><br />
            Password: <span className="font-mono text-zinc-300 select-all">BhongomanG@$#90</span>
          </div>

          <button
            id="admin-login-submit"
            type="submit"
            className="w-full py-3.5 bg-[#E50914] hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/30 transition cursor-pointer"
          >
            Authenticate Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-panel" className="flex flex-col gap-8">
      
      {/* Header Admin Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#E50914] rounded-lg flex items-center justify-center text-white text-base">🛡️</div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Control Panel v2.0</h2>
            <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-zinc-400 font-medium">
              <p>
                <span className="text-zinc-500 font-bold uppercase mr-1">Admin:</span>
                <span className="text-white font-bold">Bongani Nkosi</span>
              </p>
              <p>
                <span className="text-zinc-500 font-bold uppercase mr-1">Email:</span>
                <span className="text-zinc-300 font-mono">{email}</span>
              </p>
              <p>
                <span className="text-zinc-500 font-bold uppercase mr-1">Cell:</span>
                <span className="text-zinc-300">0672988485</span>
                <span className="text-zinc-600 mx-2">|</span>
                <span className="text-zinc-500 font-bold uppercase mr-1">ID No:</span>
                <span className="text-zinc-300 font-mono text-[9px]">0401145825089</span>
              </p>
            </div>
          </div>
        </div>
        <button
          id="admin-logout-btn"
          onClick={() => setIsAuthenticated(false)}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-[10px] font-bold rounded-lg cursor-pointer"
        >
          Lock Console
        </button>
      </div>

      {/* Dashboard Analytics grid (Total Users, Revenue, Active Now) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Users */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider block">Total Users</span>
            <span className="text-2xl font-black text-white font-mono">{adminStats.totalUsers.toLocaleString()}</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider block">Revenue (ZAR)</span>
            <span className="text-2xl font-black text-white font-mono">R{adminStats.revenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Active Now */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider block">Active Now</span>
            <span className="text-2xl font-black text-red-500 font-mono flex items-center gap-1.5">
              <span>{adminStats.activeNow}</span>
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping"></span>
            </span>
          </div>
        </div>

      </div>

      {/* Tools Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Channel Manager (8/12 layout) */}
        <div className="md:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[#E50914]" />
              <span>Channel Manager ({channels.length} Listed)</span>
            </h3>

            {!showChannelForm && (
              <button
                id="admin-add-channel-btn"
                onClick={() => {
                  resetChannelForm();
                  setShowChannelForm(true);
                }}
                className="px-3 py-1.5 bg-[#E50914] hover:bg-red-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3 h-3" />
                <span>Add Channel</span>
              </button>
            )}
          </div>

          {/* New / Edit Channel Form */}
          {showChannelForm && (
            <form onSubmit={handleChannelSubmit} className="glass-card p-5 rounded-2xl border border-[#E50914]/30 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-white flex items-center justify-between">
                <span>{editingChannelId !== null ? 'Modify Channel Parameters' : 'Add New Stream to Skhanda TV'}</span>
                <button type="button" onClick={resetChannelForm} className="text-[10px] text-zinc-400 hover:text-white">
                  Cancel
                </button>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase">Channel Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. SABC 4 Prime"
                    className="bg-zinc-900 border border-zinc-850 text-white text-xs p-2.5 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase">Logo Image URL</label>
                  <input
                    type="text"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    placeholder="https://i.ibb.co/... (Leave blank for default)"
                    className="bg-zinc-900 border border-zinc-850 text-white text-xs p-2.5 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-zinc-400 font-bold uppercase">Streaming Stream URL (YouTube or m3u8 playlist URL)</label>
                <input
                  type="text"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/... OR https://.../*.m3u8"
                  className="bg-zinc-900 border border-zinc-850 text-white text-xs p-2.5 rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase">Stream Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="bg-zinc-900 border border-zinc-850 text-white text-xs p-2.5 rounded-xl focus:outline-none font-semibold"
                  >
                    <option value="youtube">YouTube (embed iframe)</option>
                    <option value="m3u8">m3u8 (HLS live video player)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase">Primary Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="bg-zinc-900 border border-zinc-850 text-white text-xs p-2.5 rounded-xl focus:outline-none font-semibold"
                  >
                    <option value="news">News</option>
                    <option value="music">Music</option>
                    <option value="sport">Sport</option>
                    <option value="kids">Kids</option>
                    <option value="church">Church</option>
                    <option value="skhanda">Skhanda Originals</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase">Now Playing Program Name</label>
                  <input
                    type="text"
                    value={formNowPlaying}
                    onChange={(e) => setFormNowPlaying(e.target.value)}
                    placeholder="e.g. Uzalo Ep 40 Live"
                    className="bg-zinc-900 border border-zinc-850 text-white text-xs p-2.5 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <button
                id="admin-save-channel-btn"
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {editingChannelId !== null ? 'Apply Channel Updates' : 'Publish Channel Live'}
              </button>
            </form>
          )}

          {/* Live list of channels with simple actions */}
          <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
            {channels.map((ch) => (
              <div key={ch.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={ch.logo}
                    alt={ch.name}
                    className="w-8 h-8 rounded-full object-contain bg-zinc-900 border border-zinc-850 p-0.5"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://i.ibb.co/M5Yn41H/skhandalogo.png';
                    }}
                  />
                  <div>
                    <h5 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                      <span>{ch.name}</span>
                      {checkResults[ch.id] && (
                        <span 
                          className={`w-2 h-2 rounded-full inline-block ${
                            checkResults[ch.id].status === 'online' 
                              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
                              : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse'
                          }`} 
                          title={checkResults[ch.id].status === 'online' ? 'Online' : `Offline: ${checkResults[ch.id].error}`} 
                        />
                      )}
                    </h5>
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">
                      {ch.type} • {ch.category[0]}
                      {checkResults[ch.id] && (
                        <span className={`ml-2 font-semibold ${checkResults[ch.id].status === 'online' ? 'text-emerald-500' : 'text-red-500'}`}>
                          ({checkResults[ch.id].status === 'online' ? '200 OK' : checkResults[ch.id].error})
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`admin-edit-channel-${ch.id}`}
                    onClick={() => handleEditClick(ch)}
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition cursor-pointer"
                    title="Edit Properties"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`admin-delete-channel-${ch.id}`}
                    onClick={() => handleDeleteChannel(ch.id)}
                    className="p-1.5 bg-zinc-900 hover:bg-red-950/20 rounded text-zinc-500 hover:text-red-500 transition cursor-pointer animate-pulse"
                    title="Delete Channel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Send Push Notification & payment reports (4/12 layout) */}
        <div className="md:col-span-4 flex flex-col gap-6">

          {/* Stream Health Check Utility */}
          <div id="admin-health-check-card" className="glass-card p-5 rounded-2xl border border-zinc-900/60">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#E50914]" />
                <span>Stream Health Check</span>
              </span>
              {isChecking && (
                <span className="text-[9px] font-bold text-red-500 animate-pulse font-mono">
                  Checking {checkingProgress}/{channels.length}
                </span>
              )}
            </h3>

            <div className="flex flex-col gap-3">
              <p className="text-[10px] text-zinc-500 leading-normal">
                Verify whether your live IPTV streaming links are actively serving data, or are returning timeouts or CORS/404 errors.
              </p>

              {/* Progress Bar */}
              {isChecking && (
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-850">
                  <div 
                    className="bg-red-600 h-full transition-all duration-300" 
                    style={{ width: `${(checkingProgress / channels.length) * 100}%` }}
                  ></div>
                </div>
              )}

              {/* Summary Stats */}
              {!isChecking && Object.keys(checkResults).length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-center my-1 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900/60">
                  <div>
                    <span className="text-[18px] font-black font-mono text-emerald-400">
                      {Object.keys(checkResults).map(id => checkResults[Number(id)]).filter(r => r && r.status === 'online').length}
                    </span>
                    <span className="text-[8px] uppercase font-bold text-zinc-500 block">Online</span>
                  </div>
                  <div>
                    <span className="text-[18px] font-black font-mono text-red-500">
                      {Object.keys(checkResults).map(id => checkResults[Number(id)]).filter(r => r && r.status === 'offline').length}
                    </span>
                    <span className="text-[8px] uppercase font-bold text-zinc-500 block">Offline</span>
                  </div>
                </div>
              )}

              {/* Dead / Offline Stream Alerts list */}
              {!isChecking && Object.keys(checkResults).length > 0 && (
                <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {channels.map(ch => {
                    const res = checkResults[ch.id];
                    if (!res) return null;
                    return (
                      <div key={ch.id} className="bg-zinc-950/70 p-2 rounded-lg border border-zinc-900 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`w-1.5 h-1.5 rounded-full ${res.status === 'online' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                          <span className="text-zinc-200 font-bold truncate">{ch.name}</span>
                        </div>
                        <span className={`font-mono text-[9px] font-bold ${res.status === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {res.status === 'online' ? `OK` : res.error || 'Offline'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                id="admin-run-healthcheck-btn"
                onClick={runHealthCheck}
                disabled={isChecking}
                className={`w-full py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isChecking 
                    ? 'bg-zinc-900 border border-zinc-850 text-zinc-500 cursor-not-allowed' 
                    : 'bg-[#E50914] hover:bg-red-600 text-white font-extrabold shadow-md'
                }`}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                    <span>Checking {checkingProgress}/{channels.length}...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5 text-white" />
                    <span>Run Stream Health Check</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Send Push Notification */}
          <div className="glass-card p-5 rounded-2xl border border-zinc-900/60">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-2 mb-3">
              <Send className="w-4 h-4 text-[#E50914]" />
              <span>Broadcast Push</span>
            </h3>

            <form onSubmit={handleSendPush} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-zinc-500 font-bold uppercase">Notification Title</label>
                <input
                  type="text"
                  required
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  placeholder="e.g. Amapiano Live Now"
                  className="bg-zinc-900 border border-zinc-850 text-white text-xs p-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-zinc-500 font-bold uppercase">Message Body</label>
                <textarea
                  required
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  placeholder="e.g. Tune in to watch Kabza De Small live set..."
                  rows={2}
                  className="bg-zinc-900 border border-zinc-850 text-white text-xs p-2.5 rounded-xl focus:outline-none resize-none"
                />
              </div>

              {pushSuccess && (
                <div id="admin-push-success" className="p-2 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-lg text-center flex items-center justify-center gap-1 animate-pulse">
                  <Check className="w-3 h-3" />
                  <span>Notification Sent successfully!</span>
                </div>
              )}

              <button
                id="admin-send-push-submit"
                type="submit"
                className="w-full py-2.5 bg-[#E50914] hover:bg-red-600 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Send Push Alert</span>
              </button>
            </form>
          </div>

          {/* Payment Reports ledger */}
          <div className="glass-card p-5 rounded-2xl border border-zinc-900/60 flex-1">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#E50914]" />
              <span>Merchant Ledger</span>
            </h3>

            <div className="flex flex-col gap-2.5 max-h-[190px] overflow-y-auto pr-1">
              {adminStats.paymentReports.map((report) => (
                <div key={report.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 flex justify-between items-center text-[10px]">
                  <div>
                    <span className="text-white font-extrabold block">{report.user}</span>
                    <span className="text-zinc-500 font-mono text-[8px] mt-0.5 block">{report.id} • {report.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold block">R {report.amount}</span>
                    <span className="text-emerald-500 bg-emerald-950 px-1 py-0.1 rounded text-[7px] font-black uppercase tracking-wider inline-block mt-0.5">
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
