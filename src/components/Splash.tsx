/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashProps {
  onComplete: () => void;
}

const logoImg = "/src/assets/images/skhanda_logo_1784228530356.jpg";

export default function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3200); // 3 seconds plus a tiny buffer for fade animation

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div id="splash-screen" className="fixed inset-0 bg-[#000000] flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Outer ambient glow */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#E50914] opacity-10 blur-[100px] animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center relative"
      >
        {/* Glowing Rings to simulate TV waves */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[180px] h-[180px] rounded-full border border-[#E50914]/20 animate-ping absolute"></div>
          <div className="w-[240px] h-[240px] rounded-full border border-[#E50914]/10 animate-pulse absolute" style={{ animationDuration: '3s' }}></div>
        </div>

        {/* The generated 3D logo with fallback styled 3D TV icon */}
        <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#E50914] bg-black p-1 flex items-center justify-center relative z-10 select-none">
          {logoImg ? (
            <img
              src={logoImg}
              alt="Skhanda TV Logo"
              className="w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // If path is missing, show high-fidelity CSS fallback
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('splash-logo-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            id="splash-logo-fallback"
            style={{ display: logoImg ? 'none' : 'flex' }}
            className="w-full h-full bg-gradient-to-br from-black to-zinc-950 flex flex-col items-center justify-center"
          >
            {/* 3D Glass TV structure */}
            <div className="text-6xl animate-bounce">📺</div>
          </div>
        </div>

        {/* Text Details with elegant tracking and typography */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-6 text-3xl font-extrabold tracking-widest text-white uppercase text-center"
        >
          SKHANDA <span className="text-[#E50914] text-shadow-glow">TV</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-2 text-xs font-mono text-zinc-400 tracking-[0.25em] text-center"
        >
          YOUR HOME OF FREE SA TV
        </motion.p>
      </motion.div>

      {/* Modern thin loading bar indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-zinc-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ left: '-100%' }}
          animate={{ left: '100%' }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#E50914] to-transparent"
        ></motion.div>
      </div>
    </div>
  );
}
