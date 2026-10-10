import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  X,
  Shield,
  Settings,
  LogOut,
  Calendar,
  CheckCircle2,
  Mail,
  KeyRound,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../utils/audio';

export default function ProfileModal({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenAuth
}) {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'settings' | 'security'

  useEffect(() => {
    if (isOpen) {
      setActiveTab('profile');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayName = currentUser?.fullName || currentUser?.username || 'Teja';
  const displayUsername = currentUser?.username || 'teja';
  const displayJoined = currentUser?.joined || '10 Oct 2025';
  const initialLetter = (displayName[0] || 'T').toUpperCase();

  const handleLogout = () => {
    playSound('activate');
    logout();
    onClose();
    onOpenAuth && onOpenAuth('login');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl rounded-3xl glass-panel border border-cyan-400/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,243,255,0.2)] z-10 flex flex-col text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_#00f3ff]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-cyber text-lg sm:text-xl font-bold tracking-wider text-white">
                  Profile
                </h2>
                <p className="font-tech text-xs tracking-wider text-cyan-300/80">
                  User Identification & Security Credentials
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-slate-900/60 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Body: Split View with Tabs & Details (Matching Reference Image) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Left Column: Navigation Tabs */}
            <div className="flex flex-row md:flex-col gap-2">
              <button
                onClick={() => {
                  playSound('click');
                  setActiveTab('profile');
                }}
                className={`flex-1 md:flex-initial flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-tech font-bold transition-all border ${
                  activeTab === 'profile'
                    ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/40'
                }`}
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  onClose();
                  onOpenSettings && onOpenSettings();
                }}
                className="flex-1 md:flex-initial flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-tech font-bold bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/40 transition-all"
              >
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  setActiveTab('security');
                }}
                className={`flex-1 md:flex-initial flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-tech font-bold transition-all border ${
                  activeTab === 'security'
                    ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/40'
                }`}
              >
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Security</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 md:flex-initial flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-tech font-bold bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/50 hover:text-white transition-all md:mt-auto"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Logout</span>
              </button>
            </div>

            {/* Right Column: Profile Content Card (From Reference Image) */}
            <div className="md:col-span-2 p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-cyan-500/20 flex flex-col justify-between">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Avatar & Display Name Header */}
                  <div className="flex items-center gap-4">
                    {/* Glowing Avatar Circle */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-[2px] shadow-[0_0_20px_#00f3ff] flex items-center justify-center shrink-0">
                      <div className="w-full h-full rounded-full bg-[#030d22] flex items-center justify-center font-cyber font-extrabold text-2xl text-cyan-300 drop-shadow-[0_0_8px_#00f3ff]">
                        {initialLetter}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-cyber font-bold text-xl sm:text-2xl text-white">
                        {displayName}
                      </h3>
                      <p className="font-tech text-xs text-cyan-300 font-semibold tracking-wider uppercase">
                        {currentUser?.role || 'User'}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid Table */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                    <div>
                      <span className="text-xs font-tech text-slate-400 block uppercase">Username</span>
                      <span className="font-mono text-sm text-cyan-200 font-semibold">{displayUsername}</span>
                    </div>

                    <div>
                      <span className="text-xs font-tech text-slate-400 block uppercase">Joined</span>
                      <span className="font-mono text-sm text-slate-200">{displayJoined}</span>
                    </div>

                    <div>
                      <span className="text-xs font-tech text-slate-400 block uppercase">Status</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                        Active
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-tech text-slate-400 block uppercase">Auth Method</span>
                      <span className="font-mono text-xs text-purple-300 font-semibold capitalize">
                        {currentUser?.provider === 'google' ? 'Google OAuth' : 'Encrypted Password'}
                      </span>
                    </div>
                  </div>

                  {currentUser?.email && (
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span>{currentUser.email}</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4">
                  <h3 className="font-cyber font-bold text-base text-white">Security & Encryption</h3>
                  
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-cyan-500/30 flex items-center justify-between">
                    <div>
                      <div className="font-tech font-bold text-sm text-white">SHA-256 Hashed Credentials</div>
                      <div className="text-xs text-slate-400">Zero plaintext storage in frontend storage</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-cyan-500/30 flex items-center justify-between">
                    <div>
                      <div className="font-tech font-bold text-sm text-white">Session Persistence</div>
                      <div className="text-xs text-slate-400">Secured through local encrypted storage token</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-cyan-500/30 flex items-center justify-between">
                    <div>
                      <div className="font-tech font-bold text-sm text-white">Google OAuth 2.0 Ready</div>
                      <div className="text-xs text-slate-400">Integrated with Firebase Identity Toolkit</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
