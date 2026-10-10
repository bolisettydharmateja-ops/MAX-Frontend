import React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  MessageSquare,
  Search,
  ClipboardList,
  ChevronRight,
  User
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { useAuth } from '../context/AuthContext';

export default function SideMenu({ onSelect, taskCount = 3 }) {
  const { currentUser, isAuthenticated } = useAuth();
  const displayName = currentUser?.fullName || currentUser?.username || 'Dharma Teja';

  const menuItems = [
    {
      id: 'home',
      title: 'Home',
      subtitle: 'Main Dashboard',
      icon: Home,
      badge: null,
    },
    {
      id: 'chat',
      title: 'Chat',
      subtitle: 'Ask anything',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: 'search',
      title: 'Search',
      subtitle: 'Find information',
      icon: Search,
      badge: null,
    },
    {
      id: 'tasks',
      title: 'Tasks',
      subtitle: 'Get things done',
      icon: ClipboardList,
      badge: taskCount,
    }
  ];

  const handleClick = (id) => {
    playSound('click');
    onSelect(id);
  };

  return (
    <aside className="flex flex-col gap-2.5 sm:gap-3 w-full max-w-[260px] sm:max-w-[280px] z-20 select-none">
      {/* User Greeting Card (Above Home Dashboard - Matches Reference Design) */}
      <motion.button
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        whileHover={{ scale: 1.03, x: 4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleClick(isAuthenticated ? 'profile' : 'auth')}
        className="group relative w-full px-3.5 py-2.5 sm:py-3 rounded-2xl glass-panel-interactive border border-cyan-400/40 hover:border-cyan-300 shadow-[0_0_20px_rgba(0,243,255,0.2)] hover:shadow-[0_0_30px_rgba(0,243,255,0.35)] flex items-center justify-between transition-all duration-300 overflow-hidden text-left mb-1 side-card"
        title="View User Profile"
      >
        {/* Top specular highlight edge */}
        <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3 min-w-0">
          {/* Circular Cyan/Blue Avatar Profile Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#00c2ff] shadow-[0_0_15px_rgba(0,194,255,0.6)] shrink-0 flex items-center justify-center p-1 border border-cyan-300/40">
            <User className="w-6 h-6 text-[#05325e] fill-[#05325e]" />
          </div>

          {/* Text: Hello, + User Full Name (NO EMAIL) */}
          <div className="flex flex-col min-w-0 text-left">
            <span className="font-tech text-xs text-cyan-200/90 font-semibold tracking-wide">
              Hello,
            </span>
            <span className="font-cyber font-bold text-sm sm:text-[15px] text-white group-hover:text-cyan-200 transition-colors truncate">
              {displayName}
            </span>
          </div>
        </div>

        {/* Sleek Cyan Right Chevron */}
        <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:text-cyan-200 group-hover:translate-x-1 transition-all shrink-0 ml-1" />
      </motion.button>
      {menuItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * idx }}
            whileHover={{ scale: 1.03, x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleClick(item.id)}
            className="group relative w-full px-3.5 py-2.5 sm:py-3 rounded-2xl glass-panel-interactive border border-cyan-400/35 hover:border-cyan-300 shadow-[0_0_20px_rgba(0,243,255,0.15)] hover:shadow-[0_0_30px_rgba(0,243,255,0.35)] flex items-center justify-between transition-all duration-300 overflow-hidden text-left side-card"
          >
            {/* Top specular highlight edge */}
            <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

            {/* Left Content */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Circular Icon Container */}
              <div className="side-icon-box relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 group-hover:border-cyan-300 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,243,255,0.3)]">
                <Icon className="side-icon w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 group-hover:text-white transition-colors" />
                {item.badge !== null && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-[10px] font-bold text-slate-950 flex items-center justify-center shadow-[0_0_8px_#00f3ff]">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Text Info */}
              <div className="flex flex-col min-w-0">
                <span className="side-title font-cyber font-bold text-xs sm:text-sm text-white group-hover:text-cyan-200 transition-colors tracking-wide">
                  {item.title}
                </span>
                <span className="side-subtitle font-tech text-[11px] text-cyan-200/80 group-hover:text-cyan-100 transition-colors truncate">
                  {item.subtitle}
                </span>
              </div>
            </div>

            {/* Right Chevron */}
            <ChevronRight className="side-icon w-4 h-4 text-cyan-400/70 group-hover:text-cyan-200 group-hover:translate-x-1 transition-all shrink-0 ml-1" />
          </motion.button>
        );
      })}
    </aside>
  );
}
