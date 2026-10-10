import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  Shield,
  Zap,
  Smartphone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../utils/audio';

// Official 4-color Google G SVG Icon
export const GoogleGIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
    />
  </svg>
);

export default function AuthModal({
  isOpen,
  onClose,
  initialView = 'login', // 'login' | 'register' | 'forgot' | 'google'
  onSuccess
}) {
  const { login, register, loginWithGoogle, resetPassword } = useAuth();
  const [view, setView] = useState(initialView); // 'login' | 'register' | 'forgot' | 'google'

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('teja');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  // Reset Password State
  const [resetEmail, setResetEmail] = useState('');

  // Custom Google Account Input State
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Status & UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync initial view when modal opens
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Switch View
  const handleSwitchView = (newView) => {
    playSound('click');
    clearMessages();
    setView(newView);
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
      playSound('activate');
      const user = await login(loginIdentifier, loginPassword, rememberMe);
      playSound('complete');
      setSuccessMessage(`Welcome back, ${user.fullName || user.username}!`);
      setTimeout(() => {
        onSuccess && onSuccess(user);
        onClose();
      }, 700);
    } catch (err) {
      playSound('error');
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);
    try {
      playSound('activate');
      const user = await register({
        fullName: regFullName,
        username: regUsername,
        email: regEmail,
        password: regPassword
      });
      playSound('complete');
      setSuccessMessage(`Account created successfully! Welcome, ${user.fullName}!`);
      setTimeout(() => {
        onSuccess && onSuccess(user);
        onClose();
      }, 800);
    } catch (err) {
      playSound('error');
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Submit
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
      playSound('think');
      const result = await resetPassword(resetEmail);
      playSound('complete');
      setSuccessMessage(result.message || 'Password reset link sent successfully.');
    } catch (err) {
      playSound('error');
      setErrorMessage(err.message || 'Failed to send password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-In Selection
  const handleGoogleAccountSelect = async (account) => {
    playSound('activate');
    setIsLoading(true);
    clearMessages();

    try {
      const user = await loginWithGoogle(account);
      playSound('complete');
      setSuccessMessage(`Signed in as ${user.fullName} (${user.email})`);
      setTimeout(() => {
        onSuccess && onSuccess(user);
        onClose();
      }, 700);
    } catch (err) {
      playSound('error');
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Main Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative w-full max-w-4xl rounded-3xl glass-panel border border-cyan-400/50 shadow-[0_0_60px_rgba(0,243,255,0.25)] z-10 overflow-hidden flex flex-col my-auto"
        >
          {/* Top Cyber Accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-md"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Alert Messages (Error / Success) */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-6 mt-4 p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2.5 shadow-lg"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================ */}
          {/* VIEW 1: WELCOME BACK (LOGIN) OR VIEW 2: CREATE YOUR ACCOUNT */}
          {/* ============================================================ */}
          {(view === 'login' || view === 'register') && (
            <div className="grid grid-cols-1 md:grid-cols-2 p-5 sm:p-8 gap-6 sm:gap-8 items-center">
              {/* LEFT COLUMN: 3D HOLOGRAPHIC MAX AI CORE (From Reference Image) */}
              <div className="hidden md:flex flex-col items-center justify-center relative p-6 rounded-3xl bg-[#030919]/60 border border-cyan-500/20 overflow-hidden h-full min-h-[460px]">
                {/* Top Left MAX AI Emblem */}
                <div className="absolute top-4 left-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[1px] shadow-[0_0_15px_rgba(0,243,255,0.5)]">
                    <div className="w-full h-full rounded-[11px] bg-[#050b1d] flex items-center justify-center text-cyan-300 font-cyber font-bold text-lg">
                      M
                    </div>
                  </div>
                  <div>
                    <h2 className="font-cyber font-bold text-sm text-white tracking-wider">MAX AI</h2>
                    <p className="font-tech text-[10px] text-cyan-300/80">Your Intelligent Assistant</p>
                  </div>
                </div>

                {/* 3D Glowing Core & Rings */}
                <div className="relative w-48 h-48 flex items-center justify-center my-auto">
                  {/* Outer Pulsing Aura */}
                  <div className="absolute inset-0 rounded-full bg-cyan-500/15 blur-2xl animate-pulse" />

                  {/* Holographic Orbiting Rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 border-dashed animate-spin-slow" />
                  <div className="absolute inset-4 rounded-full border border-blue-500/50 animate-spin-reverse" />

                  {/* Pedestal Beam Effect */}
                  <div className="absolute -bottom-8 w-28 h-14 bg-gradient-to-t from-cyan-400/30 to-transparent blur-md transform -skew-x-12" />

                  {/* Central Glowing Orb with "MAX AI" */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400/30 via-[#061836] to-[#020b1f] border-2 border-cyan-300 shadow-[0_0_35px_#00f3ff,inset_0_0_20px_#00f3ff] flex flex-col items-center justify-center"
                  >
                    <span className="font-cyber font-extrabold text-lg text-white drop-shadow-[0_0_8px_#00f3ff]">
                      MAX
                    </span>
                    <span className="font-cyber font-bold text-xs text-cyan-300 tracking-wider">
                      AI
                    </span>
                  </motion.div>
                </div>

                {/* Pedestal Base */}
                <div className="w-36 h-4 rounded-full bg-cyan-400/20 border border-cyan-400/50 shadow-[0_0_20px_#00f3ff] blur-[1px]" />
                <div className="text-[10px] font-tech text-cyan-400/70 tracking-widest mt-2 uppercase">
                  THINK • ASSIST • MAKE LIFE EASIER
                </div>
              </div>

              {/* RIGHT COLUMN: LOGIN FORM */}
              {view === 'login' && (
                <div className="flex flex-col text-left">
                  <div className="mb-5">
                    <h2 className="font-cyber font-bold text-2xl sm:text-3xl text-white tracking-wide">
                      Welcome Back
                    </h2>
                    <p className="font-tech text-xs sm:text-sm text-cyan-200/80 mt-1 tracking-wide">
                      Sign in to continue your journey with MAX AI
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Username or Email Input */}
                    <div>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/80">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="Username or Email"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/70 border border-cyan-500/30 focus:border-cyan-300 text-sm text-white placeholder-slate-400 outline-none shadow-inner transition-all"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/80">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-950/70 border border-cyan-500/30 focus:border-cyan-300 text-sm text-white placeholder-slate-400 outline-none shadow-inner transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password Row */}
                    <div className="flex items-center justify-between text-xs font-tech">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSwitchView('forgot')}
                        className="text-cyan-400 hover:text-cyan-200 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* Login Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-tech font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_#00f3ff] transition-all"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>Login</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>

                    {/* Divider OR */}
                    <div className="relative flex items-center justify-center my-3">
                      <div className="border-t border-slate-700/60 w-full" />
                      <span className="bg-slate-950/80 px-3 text-[10px] font-tech text-slate-400 uppercase tracking-widest shrink-0">
                        OR
                      </span>
                      <div className="border-t border-slate-700/60 w-full" />
                    </div>

                    {/* Google Sign-In Button (Official White Pill) */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSwitchView('google')}
                      className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-sans font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md border border-slate-200 transition-all"
                    >
                      <GoogleGIcon className="w-4 h-4" />
                      <span>Continue with Google</span>
                    </motion.button>

                    {/* Sign Up Switch Link */}
                    <div className="text-center text-xs font-tech text-slate-400 pt-1">
                      <span>Don't have an account? </span>
                      <button
                        type="button"
                        onClick={() => handleSwitchView('register')}
                        className="text-cyan-400 hover:text-cyan-200 font-bold transition-colors ml-1"
                      >
                        Sign Up
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* RIGHT COLUMN: REGISTRATION FORM */}
              {view === 'register' && (
                <div className="flex flex-col text-left">
                  <div className="mb-4">
                    <h2 className="font-cyber font-bold text-2xl sm:text-3xl text-white tracking-wide">
                      Create Your Account
                    </h2>
                    <p className="font-tech text-xs sm:text-sm text-cyan-200/80 mt-0.5 tracking-wide">
                      Join MAX AI and unlock your potential
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    {/* Full Name */}
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/80">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 focus:border-cyan-300 text-sm text-white placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    {/* Username */}
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/80">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 focus:border-cyan-300 text-sm text-white placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/80">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 focus:border-cyan-300 text-sm text-white placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/80">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 focus:border-cyan-300 text-sm text-white placeholder-slate-400 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/80">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegConfirm ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 focus:border-cyan-300 text-sm text-white placeholder-slate-400 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirm(!showRegConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300"
                      >
                        {showRegConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Create Account Submit */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-tech font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_#00f3ff] transition-all"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>

                    {/* Divider OR */}
                    <div className="relative flex items-center justify-center my-2">
                      <div className="border-t border-slate-700/60 w-full" />
                      <span className="bg-slate-950/80 px-3 text-[10px] font-tech text-slate-400 uppercase tracking-widest shrink-0">
                        OR
                      </span>
                      <div className="border-t border-slate-700/60 w-full" />
                    </div>

                    {/* Google Button */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSwitchView('google')}
                      className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-sans font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md border border-slate-200 transition-all"
                    >
                      <GoogleGIcon className="w-4 h-4" />
                      <span>Continue with Google</span>
                    </motion.button>

                    {/* Switch back to Login */}
                    <div className="text-center text-xs font-tech text-slate-400 pt-0.5">
                      <span>Already have an account? </span>
                      <button
                        type="button"
                        onClick={() => handleSwitchView('login')}
                        className="text-cyan-400 hover:text-cyan-200 font-bold transition-colors ml-1"
                      >
                        Login
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: RESET YOUR PASSWORD (FORGOT PASSWORD) */}
          {/* ============================================================ */}
          {view === 'forgot' && (
            <div className="max-w-md mx-auto p-6 sm:p-8 text-left w-full">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mx-auto mb-3 shadow-[0_0_20px_#00f3ff]">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="font-cyber font-bold text-2xl text-white">Reset Your Password</h2>
                <p className="font-tech text-xs sm:text-sm text-cyan-200/80 mt-1">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/80">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/70 border border-cyan-500/30 focus:border-cyan-300 text-sm text-white placeholder-slate-400 outline-none transition-all"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-tech font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_#00f3ff]"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchView('login')}
                    className="text-xs font-tech text-cyan-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 4: GOOGLE OAUTH MODAL (Sign in with Google Account Chooser) */}
          {/* ============================================================ */}
          {view === 'google' && (
            <div className="max-w-md mx-auto p-6 sm:p-8 text-left w-full">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <GoogleGIcon className="w-6 h-6" />
                  <span className="font-sans font-medium text-base text-white">Sign in with Google</span>
                </div>
                <button
                  onClick={() => handleSwitchView('login')}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title */}
              <div className="text-center mb-5">
                <h3 className="font-sans font-normal text-lg sm:text-xl text-white">
                  Choose an account
                </h3>
                <p className="text-xs font-sans text-slate-400 mt-0.5">
                  to continue to <span className="text-cyan-300 font-bold">MAX AI</span>
                </p>
              </div>

              {/* Account Options List (from Reference Image) */}
              <div className="space-y-2 mb-5">
                {/* Account 1: Dharma Teja */}
                <motion.div
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                  onClick={() =>
                    handleGoogleAccountSelect({
                      name: 'Dharma Teja',
                      email: 'dharmateja@gmail.com',
                      avatar: 'D'
                    })
                  }
                  className="p-3 rounded-2xl border border-slate-700/60 hover:border-cyan-400/60 flex items-center gap-3.5 cursor-pointer transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                    D
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-sans font-medium text-sm text-white truncate">Dharma Teja</div>
                    <div className="font-sans text-xs text-slate-400 truncate">dharmateja@gmail.com</div>
                  </div>
                </motion.div>

                {/* Account 2: Student Account */}
                <motion.div
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                  onClick={() =>
                    handleGoogleAccountSelect({
                      name: 'Student Account',
                      email: 'student123@gmail.com',
                      avatar: 'S'
                    })
                  }
                  className="p-3 rounded-2xl border border-slate-700/60 hover:border-cyan-400/60 flex items-center gap-3.5 cursor-pointer transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                    S
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-sans font-medium text-sm text-white truncate">Student Account</div>
                    <div className="font-sans text-xs text-slate-400 truncate">student123@gmail.com</div>
                  </div>
                </motion.div>

                {/* Option 3: Use another account */}
                {!showCustomGoogleInput ? (
                  <motion.div
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    onClick={() => setShowCustomGoogleInput(true)}
                    className="p-3 rounded-2xl border border-slate-700/60 hover:border-cyan-400/60 flex items-center gap-3.5 cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="font-sans font-medium text-sm text-white">Use another account</div>
                  </motion.div>
                ) : (
                  <div className="p-3 rounded-2xl border border-cyan-400/60 bg-slate-900/60 space-y-2">
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="Enter your Google email..."
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-cyan-400"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCustomGoogleInput(false)}
                        className="text-xs text-slate-400 hover:text-white px-2 py-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!customGoogleEmail.includes('@')}
                        onClick={() =>
                          handleGoogleAccountSelect({
                            name: customGoogleEmail.split('@')[0],
                            email: customGoogleEmail,
                            avatar: customGoogleEmail[0].toUpperCase()
                          })
                        }
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-sm"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] font-sans text-slate-400 leading-relaxed text-center">
                Before using this app, you can review MAX AI's{' '}
                <span className="text-cyan-400 hover:underline cursor-pointer">privacy policy</span> and{' '}
                <span className="text-cyan-400 hover:underline cursor-pointer">terms of service</span>.
              </p>

              {/* Back to regular login */}
              <div className="text-center pt-3 border-t border-slate-700/60 mt-4">
                <button
                  type="button"
                  onClick={() => handleSwitchView('login')}
                  className="text-xs font-tech text-slate-400 hover:text-white flex items-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Email Sign-In</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* BOTTOM FEATURE BADGES STRIP (From User's Reference Image) */}
          {/* ============================================================ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-3.5 bg-slate-950/70 border-t border-cyan-500/20 text-left">
            {/* Feature 1 */}
            <div className="flex items-center gap-2 p-1.5">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-tech font-bold text-white truncate">Secure Authentication</div>
                <div className="text-[9px] text-slate-400 truncate">Your data is protected</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-2 p-1.5">
              <div className="w-6 h-6 rounded-lg bg-white/20 border border-white/40 flex items-center justify-center shrink-0">
                <GoogleGIcon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-tech font-bold text-white truncate">Google Sign-In</div>
                <div className="text-[9px] text-slate-400 truncate">One tap access</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-2 p-1.5">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-tech font-bold text-white truncate">Fast & Easy</div>
                <div className="text-[9px] text-slate-400 truncate">Get started in seconds</div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-2 p-1.5">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-tech font-bold text-white truncate">Responsive Design</div>
                <div className="text-[9px] text-slate-400 truncate">Works on all devices</div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex items-center gap-2 p-1.5 col-span-2 sm:col-span-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-tech font-bold text-white truncate">Session Management</div>
                <div className="text-[9px] text-slate-400 truncate">Stay logged in securely</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
