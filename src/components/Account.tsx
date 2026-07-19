/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, ShieldAlert, Settings, HelpCircle, PhoneCall, Key, Layers, LogOut, Check, ChevronRight, Tv, Wifi } from 'lucide-react';
import { UserState } from '../types';

interface AccountProps {
  userState: UserState;
  onUpdateState: (updates: Partial<UserState>) => void;
  onResetApp: () => void;
  email: string;
}

export default function Account({ userState, onUpdateState, onResetApp, email }: AccountProps) {
  const [pinInput, setPinInput] = useState('');
  const [showPinForm, setShowPinForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Interactive Smart TV FTA Tuning Guide State
  const [selectedBrand, setSelectedBrand] = useState<'samsung' | 'lg' | 'hisense' | 'other'>('hisense');
  const [selectedSource, setSelectedSource] = useState<'apps' | 'antenna' | 'decoder'>('antenna');

  // Calculate days left
  const daysUsed = Math.floor((Date.now() - userState.trialStart) / (1000 * 60 * 60 * 24));
  const trialDaysLeft = Math.max(0, 7 - daysUsed);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length === 4 && /^\d+$/.test(pinInput)) {
      onUpdateState({ parentalPin: pinInput });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowPinForm(false);
      }, 1500);
    } else {
      alert('Please enter a valid 4-digit PIN (numbers only)');
    }
  };

  const handleRemovePin = () => {
    onUpdateState({ parentalPin: null });
    setPinInput('');
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateState({ videoQuality: e.target.value as any });
  };

  return (
    <div id="account-screen" className="flex flex-col gap-6 max-w-xl mx-auto">
      
      {/* Profile Header Block */}
      <div className="glass-card p-6 rounded-3xl border border-zinc-900/60 relative overflow-hidden flex items-center gap-4">
        {/* Glowing circle background */}
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#E50914]/5 rounded-full blur-2xl"></div>

        <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-[#E50914] text-xl font-bold">
          {email ? email.substring(0, 2).toUpperCase() : 'ST'}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-sm text-white truncate">{email || 'bhongoskhanda@gmail.com'}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
              userState.isPremium
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/20'
            }`}>
              {userState.isPremium ? 'Premium Plan (Active)' : 'Free Trial Active'}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">ID: {email.split('@')[0] || 'device'}</span>
          </div>
        </div>
      </div>

      {/* Trial Countdown Indicator */}
      <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex justify-between items-center">
        <div>
          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest block">Account Status</span>
          <span className="text-sm font-extrabold text-white mt-1 block">
            {userState.isPremium ? 'Lifetime SA Streaming Access Unlocked' : '7 Days Free Streaming Trial'}
          </span>
          <p className="text-[10px] text-zinc-400 mt-1 max-w-xs">
            {userState.isPremium 
              ? 'Thank you for supporting Skhanda TV! Streaming unlocked.' 
              : `Your account has active trial days left. Upgrading opens standard SABC feeds and originals.`}
          </p>
        </div>
        <div className="text-center bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-850">
          {userState.isPremium ? (
            <>
              <div className="text-xl font-black text-emerald-500">PAID</div>
              <div className="text-[8px] text-zinc-400 font-bold uppercase tracking-wide mt-1">Premium</div>
            </>
          ) : (
            <>
              <div className="text-2xl font-black text-[#E50914]">{trialDaysLeft}</div>
              <div className="text-[8px] text-zinc-400 font-bold uppercase tracking-wide mt-0.5">Days Left</div>
            </>
          )}
        </div>
      </div>

      {/* Parental PIN & settings */}
      <div className="flex flex-col gap-4">
        <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
          <Settings className="w-3.5 h-3.5 text-[#E50914]" />
          <span>Security & Streaming Controls</span>
        </h4>

        <div className="flex flex-col gap-3">
          
          {/* Parental PIN Config */}
          <div className="glass-card p-4 rounded-xl flex flex-col gap-3 border border-zinc-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Key className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="font-extrabold text-xs text-white block">Parental Lock PIN</span>
                  <span className="text-[10px] text-zinc-400">Lock adult channels (Church or Skhanda) behind a 4-digit code.</span>
                </div>
              </div>

              {userState.parentalPin ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                    PIN ACTIVE ({userState.parentalPin})
                  </span>
                  <button
                    id="remove-parental-pin-btn"
                    onClick={handleRemovePin}
                    className="text-[9px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  id="toggle-pin-form-btn"
                  onClick={() => setShowPinForm(!showPinForm)}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-white rounded-lg hover:bg-zinc-850 cursor-pointer"
                >
                  {showPinForm ? 'Collapse' : 'Setup PIN'}
                </button>
              )}
            </div>

            {showPinForm && !userState.parentalPin && (
              <form onSubmit={handleSavePin} className="flex gap-2 items-center bg-zinc-950 p-2 rounded-xl mt-1 border border-zinc-900">
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="Enter 4-Digit PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  className="bg-zinc-900 border border-zinc-850 text-white p-2 text-center rounded-lg text-xs font-mono w-28 focus:outline-none focus:border-[#E50914]"
                />
                <button
                  id="save-pin-btn"
                  type="submit"
                  className="px-3.5 py-2 bg-red-600 hover:bg-[#E50914] text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer flex-1 flex items-center justify-center gap-1"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved PIN</span>
                    </>
                  ) : (
                    <span>Save PIN Code</span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Video Stream Quality selector */}
          <div className="glass-card p-4 rounded-xl flex items-center justify-between border border-zinc-900/40">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="font-extrabold text-xs text-white block">Default Playback Quality</span>
                <span className="text-[10px] text-zinc-400">Forces specific resolution when streaming.</span>
              </div>
            </div>

            <select
              id="account-quality-select"
              value={userState.videoQuality}
              onChange={handleQualityChange}
              className="bg-zinc-900 border border-zinc-800 text-white rounded-lg text-[10px] px-2.5 py-1.5 font-bold uppercase"
            >
              <option value="auto">Auto Selection</option>
              <option value="1080p">Full HD (1080p)</option>
              <option value="720p">High (720p)</option>
              <option value="480p">Medium (480p)</option>
            </select>
          </div>

        </div>
      </div>

      {/* 📺 Interactive Smart TV & FTA Tuning Guide */}
      <div className="glass-card p-5 rounded-2xl border border-zinc-900/60 relative overflow-hidden flex flex-col gap-4">
        {/* Glow accent */}
        <div className="absolute left-[-20px] top-[-20px] w-28 h-28 bg-[#E50914]/5 rounded-full blur-2xl pointer-events-none"></div>

        <div>
          <span className="text-[9px] text-[#E50914] uppercase font-black tracking-widest block">Local Setup Assistant</span>
          <span className="text-sm font-extrabold text-white mt-1 flex items-center gap-1.5">
            <Tv className="w-4 h-4 text-[#E50914]" />
            Smart TV Tuning & FTA Setup Guide
          </span>
          <p className="text-[10px] text-zinc-400 mt-1">
            Choose your Smart TV brand and connection type to view tailored, step-by-step instructions for scanning free local channels.
          </p>
        </div>

        {/* Brand Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">1. Your TV Brand</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'samsung' as const, label: 'Samsung' },
              { id: 'lg' as const, label: 'LG' },
              { id: 'hisense' as const, label: 'Hisense' },
              { id: 'other' as const, label: 'Other' }
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                id={`brand-select-${b.id}`}
                onClick={() => setSelectedBrand(b.id)}
                className={`py-2 px-1 text-center rounded-xl border text-[11px] font-bold transition duration-200 cursor-pointer ${
                  selectedBrand === b.id
                  ? 'bg-[#E50914]/10 border-[#E50914]/50 text-white shadow-[0_0_15px_rgba(229,9,20,0.2)]'
                  : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Source Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">2. Connection Source</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'apps' as const, label: 'Wi-Fi / Apps' },
              { id: 'antenna' as const, label: 'TV Antenna' },
              { id: 'decoder' as const, label: 'Decoder Setup' }
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                id={`source-select-${s.id}`}
                onClick={() => setSelectedSource(s.id)}
                className={`py-2 px-1 text-center rounded-xl border text-[10px] font-bold uppercase transition duration-200 cursor-pointer ${
                  selectedSource === s.id
                  ? 'bg-[#E50914]/10 border-[#E50914]/50 text-white shadow-[0_0_15px_rgba(229,9,20,0.2)]'
                  : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Step-by-Step Instructions Panel */}
        {(() => {
          const brandLabel = selectedBrand === 'samsung' ? 'Samsung Smart TV' 
            : selectedBrand === 'lg' ? 'LG webOS TV' 
            : selectedBrand === 'hisense' ? 'Hisense Google TV' 
            : 'Smart TV';

          let guideTitle = '';
          let guideBadge = '';
          let guideSteps: string[] = [];
          let guideExtra = '';
          let showVideoHint = false;

          if (selectedSource === 'apps') {
            guideTitle = `Using Live-Streaming Apps on your ${brandLabel}`;
            guideBadge = 'Wi-Fi Streaming';
            guideSteps = [
              `Turn on your ${brandLabel} and ensure it is connected to a stable Wi-Fi network.`,
              `Navigate to the App Store (Google Play Store on Hisense, Content Store on LG, or Smart Hub on Samsung).`,
              `Search for and install free streaming apps like Pluto TV or Tubi to stream hundreds of free-to-air channels.`,
              `For local South African public broadcasts, download SABC+ directly from the app store to watch SABC channels and radio feeds.`,
              selectedBrand === 'hisense' 
                ? `Since you are using a Hisense Google TV, you can access Google TV Freeplay for 800+ free channels on a single integrated guide.`
                : `Enjoy instant free-to-air content over Wi-Fi without needing a physical antenna!`
            ];
            guideExtra = `Tip: SABC+ and Tubi require no subscription fee, just a free account setup on your TV.`;
          } else if (selectedSource === 'antenna') {
            guideTitle = `Running a Channel Scan on your ${brandLabel}`;
            guideBadge = 'Digital Antenna';
            
            let menuSteps = "";
            if (selectedBrand === 'samsung') {
              menuSteps = "Navigate to Settings > Broadcasting > Auto Program or Channel Scan.";
            } else if (selectedBrand === 'lg') {
              menuSteps = "Navigate to Settings > All Settings > Channels > Channel Tuning > select Auto Tuning.";
            } else if (selectedBrand === 'hisense') {
              menuSteps = "Go to Settings > Channels & Inputs > Channels > and select Auto Scan.";
              showVideoHint = true;
            } else {
              menuSteps = "Navigate to Settings > Broadcasting, Live TV, or Channels menu, then select Auto-Tune or Auto Setup.";
            }

            guideSteps = [
              `Connect your indoor or outdoor digital antenna cable to the "ANT/IN" or "Coaxial" port on the back of your TV.`,
              `Open your TV Settings menu.`,
              menuSteps,
              `Set your tuning source to "Antenna" or "Air" (do not select Cable).`,
              `Let the auto-scan complete. This usually takes 5 to 20 minutes. It will scan and register standard local FTA channels (like SABC 1, 2, 3, and e.tv) for free.`
            ];
            guideExtra = `Tip: If channels are pixelated or missing, adjust your antenna's physical placement (near a window or higher up) and run the scan again.`;
          } else {
            guideTitle = `Connecting an External Decoder to your ${brandLabel}`;
            guideBadge = 'Decoder Input';
            guideSteps = [
              `Connect your decoder (Openview or DStv) to your ${brandLabel} using an HDMI cable.`,
              `Switch your TV input source to the corresponding HDMI port using your remote.`,
              `Openview: South Africa's popular free-to-air satellite service. Buy the decoder once, and get e.tv, eMovies, and SABC channels for free with zero monthly fees.`,
              `DStv public channels: Even with no active subscription, you can pick up public FTA channels by tuning your decoder to the IS20 satellite and setting the frequency to 12,522 V.`,
              `Perform a channel search on your decoder's menu settings to scan and load the free feeds.`
            ];
            guideExtra = `Tip: Make sure your satellite dish is securely aligned to the IS20 satellite for stable South African public broadcasts.`;
          }

          return (
            <div id="tuning-guide-content" className="bg-zinc-950 rounded-xl p-4 border border-zinc-900 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[11px] font-extrabold text-white">{guideTitle}</span>
                <span className="text-[8px] bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider shrink-0">
                  {guideBadge}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {guideSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <span className="w-4 h-4 rounded bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-[10px] text-zinc-300 leading-normal">{step}</p>
                  </div>
                ))}
              </div>

              {showVideoHint && (
                <div className="mt-1 bg-red-600/10 border border-[#E50914]/20 rounded-lg p-2.5 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">📺 Recommended Video Guide</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                      "How to Run a Channel Scan on Hisense Google Smart TV" (by Antenna Man)
                    </span>
                  </div>
                  <a
                    href="https://www.youtube.com/results?search_query=How+to+Run+a+Channel+Scan+on+Hisense+Google+Smart+TV+Antenna+Man"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-extrabold uppercase bg-[#E50914] hover:bg-red-600 text-white px-2.5 py-1.5 rounded transition whitespace-nowrap shrink-0"
                  >
                    Search YouTube
                  </a>
                </div>
              )}

              <div className="text-[9px] text-zinc-500 italic border-t border-white/5 pt-2">
                {guideExtra}
              </div>
            </div>
          );
        })()}

      </div>

      {/* Support Helpline & Privacy */}
      <div className="flex flex-col gap-3 mt-1">
        <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Support & Policy</h4>
        
        {/* Contact WhatsApp */}
        <a
          id="contact-whatsapp-link"
          href="https://wa.me/27110000000?text=Hi%20Skhanda%20TV%20Support%20I%20need%20help%20with%20my%20subscription"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card p-4 rounded-xl flex items-center justify-between border border-zinc-900/40 hover:bg-[#E50914]/5 hover:border-[#E50914]/40 transition group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <PhoneCall className="w-4 h-4 text-emerald-500" />
            <div>
              <span className="font-extrabold text-xs text-white block group-hover:text-[#E50914] transition">Contact WhatsApp Support</span>
              <span className="text-[10px] text-zinc-400">Direct query lines with our Johannesburg Support Team.</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </a>

        {/* Privacy Terms Document */}
        <div className="glass-card p-4 rounded-xl border border-zinc-900/40 text-[10px] text-zinc-400 leading-relaxed flex flex-col gap-2">
          <div>
            <span className="font-extrabold text-white block mb-1">Privacy & Play Store Licensing</span>
            Skhanda TV 2.0 uses secure, sandboxed device IDs to track free trials and comply with South African broadcasting licenses. SABC and e.tv stream links are fetched from open, public distribution networks.
          </div>
          <div className="border-t border-white/5 pt-2 mt-1">
            <span className="text-[#E50914] font-bold block mb-0.5">Broadcasting Disclaimer</span>
            <span className="text-zinc-300 font-medium">"All streams are sourced from official public Free To Air broadcasts"</span>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <div className="pt-4 border-t border-zinc-900 mt-2">
        <button
          id="logout-reset-btn"
          onClick={onResetApp}
          className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-red-500/30 text-zinc-400 hover:text-red-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout & Reset Trial</span>
        </button>
      </div>

    </div>
  );
}
