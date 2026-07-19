/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tv, Sparkles, Calendar, ChevronRight, Play } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "10 Premium Live Channels",
      description: "Watch verified live broadcasts including Soweto TV, Cape Town TV, 1 KZN TV, TBN Africa, Al Jazeera, France 24, DW English, WildEarth, and NASA TV 24/7.",
      icon: <Tv className="w-12 h-12 text-[#E50914]" />,
      badge: "LIVE SA TV",
      visual: (
        <div className="relative w-full h-56 flex items-center justify-center bg-gradient-to-br from-zinc-950 to-black rounded-2xl border border-zinc-900 overflow-hidden">
          {/* SABC/eTV logo simulation cluster */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-40"></div>
          
          <div className="grid grid-cols-2 gap-4 max-w-xs relative z-10 p-4">
            <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-lg transform -rotate-6 hover:rotate-0 transition-all duration-300">
              <span className="text-sm font-black text-white">SABC</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">News Live</span>
              <div className="w-2 h-2 rounded-full bg-[#E50914] mt-2 animate-pulse"></div>
            </div>
            
            <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-lg transform rotate-6 hover:rotate-0 transition-all duration-300">
              <span className="text-sm font-black text-red-500">e<span className="text-white font-normal">NCA</span></span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Channel 403</span>
              <div className="w-2 h-2 rounded-full bg-[#E50914] mt-2 animate-pulse"></div>
            </div>

            <div className="glass-card p-4 rounded-xl col-span-2 flex items-center justify-center gap-2 shadow-lg transform translate-y-2 hover:translate-y-0 transition-all duration-300">
              <span className="text-xs font-black text-zinc-300">SKHANDA ORIGINALS</span>
              <div className="px-1.5 py-0.5 bg-[#E50914] text-[8px] font-bold text-white rounded">3D GLASS</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3D Glass Interface",
      description: "Experience a luxury responsive design built with real-time blur layers, high-contrast red neon accents, and adaptive video stream controls.",
      icon: <Sparkles className="w-12 h-12 text-[#E50914]" />,
      badge: "PREMIUM UI",
      visual: (
        <div className="relative w-full h-56 flex items-center justify-center bg-gradient-to-tr from-black via-zinc-950 to-zinc-900 rounded-2xl border border-zinc-900 overflow-hidden">
          {/* Mini App UI glass overlay mockup */}
          <div className="absolute top-4 left-4 w-36 glass-card rounded-lg p-2 shadow-xl border border-white/10 text-[9px] pointer-events-none">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#E50914]"></div>
              <div className="font-bold text-white uppercase tracking-tight scale-90">Now Streaming</div>
            </div>
            <div className="h-12 bg-zinc-900/80 rounded flex items-center justify-center text-zinc-500 font-mono text-[8px]">
              [ m3u8_stream ]
            </div>
            <div className="mt-1 font-bold text-white truncate">Skhanda Amapiano</div>
            <div className="text-[8px] text-zinc-400">34.1K Watching</div>
          </div>

          <div className="absolute bottom-6 right-4 w-40 glass-card rounded-lg p-2.5 shadow-2xl border border-[#E50914]/30 text-[9px] pointer-events-none transform scale-105">
            <div className="text-white font-extrabold flex items-center gap-1">
              <span>Uzalo Live</span>
              <span className="bg-[#E50914] text-[6px] text-white px-1 py-0.1 rounded uppercase animate-pulse">Epg Guide</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="w-3/4 h-full bg-[#E50914]"></div>
            </div>
            <div className="flex justify-between items-center mt-1 text-[7px] text-zinc-400 font-mono">
              <span>14:00</span>
              <span>15:30</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "7 Days Free Trial",
      description: "Start streaming completely free for 7 days. Keep watching after for just R150/month with secure, convenient local SA payments via PayFast.",
      icon: <Calendar className="w-12 h-12 text-[#E50914]" />,
      badge: "NO OBLIGATION",
      visual: (
        <div className="relative w-full h-56 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 to-black rounded-2xl border border-zinc-900 overflow-hidden px-4 text-center">
          <div className="absolute top-2 right-2 px-2.5 py-1 bg-red-600/15 border border-[#E50914]/40 text-[#E50914] text-[9px] font-bold rounded-full tracking-wide">
            OFFER ACTIVE
          </div>

          <div className="glass-card p-6 rounded-2xl border border-[#E50914] max-w-xs shadow-[0_0_30px_rgba(229,9,20,0.15)] flex flex-col items-center">
            <div className="text-3xl font-extrabold text-white">R0.00</div>
            <div className="text-xs font-bold text-[#E50914] uppercase tracking-widest mt-1">First 7 Days Free</div>
            <p className="text-[10px] text-zinc-400 mt-2">Unlimited Live TV, HD Quality, No Ads, Cancel anytime online.</p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div id="onboarding-screen" className="fixed inset-0 bg-[#000000] flex flex-col items-center justify-center z-40 overflow-y-auto px-4 py-8">
      {/* Background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-[#E50914]/5 blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md flex flex-col justify-between min-h-[580px] bg-zinc-950/40 p-6 rounded-3xl border border-zinc-900/60 relative z-10 backdrop-blur-md">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-[#E50914] rounded flex items-center justify-center text-xs text-white font-extrabold">📺</div>
            <span className="font-extrabold text-white text-sm tracking-widest">SKHANDA <span className="text-[#E50914]">TV</span></span>
          </div>
          <button 
            id="skip-onboarding-btn"
            onClick={onComplete}
            className="text-xs text-zinc-500 hover:text-white font-semibold transition"
          >
            Skip
          </button>
        </div>

        {/* Dynamic Slide Area */}
        <div className="my-6 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col gap-4"
            >
              {/* Image Visual */}
              {slides[currentSlide].visual}

              {/* Title & Badge */}
              <div className="mt-2">
                <span className="inline-block px-2.5 py-0.5 bg-[#E50914]/10 text-xs font-bold text-[#E50914] rounded-full uppercase tracking-wider mb-2">
                  {slides[currentSlide].badge}
                </span>
                <h2 className="text-2xl font-extrabold text-white leading-tight">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation controls */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-900 mt-auto">
          {/* Progress Indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                id={`onboarding-indicator-${index}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-6 bg-[#E50914]' : 'w-2 bg-zinc-800'
                }`}
              ></button>
            ))}
          </div>

          {/* Action Button */}
          {currentSlide === slides.length - 1 ? (
            <motion.button
              id="get-started-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-6 py-3 bg-[#E50914] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:bg-red-600 transition"
            >
              <span>Get Started</span>
              <Play className="w-3.5 h-3.5 fill-white" />
            </motion.button>
          ) : (
            <motion.button
              id="next-slide-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 border border-zinc-800 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>

      </div>
    </div>
  );
}
