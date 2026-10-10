import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  Globe,
  User,
  ChevronDown,
  LogOut,
  Settings,
  LogIn
} from 'lucide-react';
import { getLanguageByCode } from '../utils/languages';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../utils/audio';

export default function HeaderBadge({
  onVoiceDateTime = () => {},
  currentLang = 'en-US',
  onOpenLanguageModal = null,
  onOpenProfile = null,
  onOpenSettings = null,
  onOpenAuth = null
}) {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const langObj = getLanguageByCode(currentLang);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    playSound('activate');
    setIsDropdownOpen(false);
    logout();
    onOpenAuth && onOpenAuth('login');
  };

  const displayName = currentUser?.fullName?.split(' ')[0] || currentUser?.username || 'Teja';

  return (
    <header className="w-full flex flex-col sm:flex-row items-center sm:items-start justify-between px-6 sm:px-10 pt-6 z-20 pointer-events-auto gap-4">
      {/* Top Left: Futuristic MAX AI Emblem Badge */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative group p-3.5 sm:p-4 rounded-2xl glass-panel border border-cyan-400/40 shadow-[0_0_25px_rgba(0,243,255,0.2)] flex items-center gap-3.5 max-w-sm w-full sm:w-auto"
      >
        {/* Chamfered Cyber Corner Accent */}
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* 3D Faceted Crystal "M" Logo */}
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 p-[1.5px] shadow-[0_0_15px_rgba(0,243,255,0.6)] flex items-center justify-center shrink-0">
          <div className="w-full h-full rounded-[10px] bg-[#050b1d] flex items-center justify-center relative overflow-hidden">
            <svg
              className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_8px_#00f3ff]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19V5l8 8 8-8v14" fill="url(#mGrad)" fillOpacity="0.3" />
              <defs>
                <linearGradient id="mGrad" x1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f3ff" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Text details */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <h1 className="font-cyber font-extrabold text-lg sm:text-xl tracking-wider text-white drop-shadow-[0_0_10px_rgba(0,243,255,0.6)]">
              MAX AI
            </h1>
          </div>
          <p className="font-tech text-xs sm:text-sm text-cyan-200/90 tracking-wide font-medium">
            Your Intelligent Assistant
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] font-tech text-cyan-400/80 tracking-wider uppercase font-semibold">
            <span>Think</span>
            <span className="text-cyan-500/40">|</span>
            <span>Assist</span>
            <span className="text-cyan-500/40">|</span>
            <span>Make Life Easier</span>
          </div>
        </div>
      </motion.div>

      {/* Top Right: Header Actions + User Profile Menu */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center sm:justify-end"
      >
        {/* Voice Date & Time Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onVoiceDateTime}
          className="px-3.5 py-2 rounded-2xl glass-panel-interactive border border-cyan-400/50 hover:border-cyan-300 shadow-[0_0_20px_rgba(0,243,255,0.25)] flex items-center gap-2.5 group transition-all"
          title="Click to have MAX AI voice the real date and time aloud"
        >
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:text-white group-hover:bg-cyan-400/30 transition-all">
            <Volume2 className="w-4 h-4 animate-pulse text-cyan-300" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-cyber text-xs font-bold text-white group-hover:text-cyan-200 tracking-wide">
              Voice Date & Time
            </span>
            <span className="text-[9px] font-tech text-cyan-300/80 font-semibold uppercase tracking-wider">
              Speak Aloud
            </span>
          </div>
        </motion.button>

        {/* Quick Language Switcher Capsule */}
        {onOpenLanguageModal && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenLanguageModal}
            className="px-3 py-2 rounded-2xl glass-panel-interactive border border-cyan-400/35 hover:border-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.15)] flex items-center gap-2 group transition-all"
            title="Select Voice Language"
          >
            <Globe className="w-4 h-4 text-cyan-300 group-hover:rotate-45 transition-transform" />
            <span className="font-tech text-xs font-semibold text-slate-100 flex items-center gap-1">
              <span>{langObj.flag}</span>
              <span className="hidden sm:inline">{langObj.name}</span>
            </span>
          </motion.button>
        )}

        {/* ======================================================== */}
        {/* USER PROFILE DROPDOWN MENU (From Reference Image)       */}
        {/* ======================================================== */}
        {isAuthenticated && currentUser ? (
          <div ref={dropdownRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                playSound('click');
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="px-3.5 py-2 rounded-2xl glass-panel-interactive border border-cyan-400/50 hover:border-cyan-300 shadow-[0_0_20px_rgba(0,243,255,0.25)] flex items-center gap-2.5 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_#00f3ff]">
                <User className="w-4 h-4" />
              </div>
              <span className="font-tech font-bold text-sm text-white tracking-wide">
                {displayName}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-cyan-300 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </motion.button>

            {/* Dropdown Menu (Matching Reference Image) */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-2xl glass-panel border border-cyan-400/40 shadow-[0_10px_35px_rgba(0,243,255,0.25)] py-2 z-50 text-left overflow-hidden"
                >
                  {/* Dropdown Item 1: Profile */}
                  <button
                    onClick={() => {
                      playSound('click');
                      setIsDropdownOpen(false);
                      onOpenProfile && onOpenProfile();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-tech font-bold text-slate-200 hover:text-white hover:bg-cyan-500/15 transition-colors"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Profile</span>
                  </button>

                  {/* Dropdown Item 2: Settings */}
                  <button
                    onClick={() => {
                      playSound('click');
                      setIsDropdownOpen(false);
                      onOpenSettings && onOpenSettings();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-tech font-bold text-slate-200 hover:text-white hover:bg-cyan-500/15 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-cyan-400" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-slate-700/60 my-1" />

                  {/* Dropdown Item 3: Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-tech font-bold text-red-300 hover:text-red-200 hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Sign In Button for unauthenticated state */
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              playSound('click');
              onOpenAuth && onOpenAuth('login');
            }}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-tech font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_#00f3ff] transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </motion.button>
        )}

        {/* Online Status Badge */}
        <div className="px-3.5 py-2 rounded-2xl glass-panel border border-cyan-400/35 shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
          <span className="font-tech text-xs sm:text-sm font-semibold tracking-wider text-slate-100">
            Online
          </span>
        </div>
      </motion.div>
    </header>
  );
}
