import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Mic,
  Camera,
  Sparkles,
  Clock,
  Trash2,
  X,
  Volume2,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import CyberBackground from './CyberBackground';
import { playSound, speakWithMAX, stopSpeech } from '../utils/audio';

const INITIAL_SEARCH_HISTORY = [
  {
    id: 'h1',
    query: 'Quantum lattice cryptography protocols',
    timestamp: '10 mins ago',
    date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    category: 'Quantum Security',
    aiMode: true
  },
  {
    id: 'h2',
    query: 'Neural transformer multi-head attention heuristics',
    timestamp: '45 mins ago',
    date: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    category: 'AI Research',
    aiMode: true
  },
  {
    id: 'h3',
    query: 'Autonomous multi-agent task queue synchronization',
    timestamp: '2 hours ago',
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    category: 'Autonomous Logic',
    aiMode: true
  },
  {
    id: 'h4',
    query: 'Indic phonetic synthesis voice formant calibration',
    timestamp: 'Yesterday',
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    category: 'Language Synthesis',
    aiMode: false
  },
  {
    id: 'h5',
    query: 'Real-time telemetry cognitive load distribution',
    timestamp: '2 days ago',
    date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    category: 'Telemetry',
    aiMode: true
  }
];

const KNOWLEDGE_BASE = [
  {
    id: '1',
    title: 'Neural Transformer Architecture Overview',
    snippet: 'Multi-head attention mechanisms applied to autonomous edge inference, real-time reasoning, and self-supervised learning pathways.',
    category: 'Cognitive Intelligence',
    confidence: 98,
    relevance: 95,
    tag: 'AI Research',
    speed: '8ms'
  },
  {
    id: '2',
    title: 'Quantum Key Distribution & Lattice Protocols',
    snippet: 'Post-quantum cryptographic defenses against Shor algorithmic factorization and side-channel entropy leaks.',
    category: 'Quantum Systems',
    confidence: 94,
    relevance: 89,
    tag: 'Security',
    speed: '12ms'
  },
  {
    id: '3',
    title: 'Autonomous Multi-Agent Task Synchronization',
    snippet: 'Decentralized scheduling heuristics for real-time task queues, priority conflict resolution, and distributed nodes.',
    category: 'Autonomous Logic',
    confidence: 96,
    relevance: 92,
    tag: 'Systems',
    speed: '9ms'
  },
  {
    id: '4',
    title: 'Multi-Lingual Synthetic Phoneme Modeling',
    snippet: 'Real-time acoustic formant adaptation across Indic and International language families with sub-10ms neural vocoders.',
    category: 'Language Synthesis',
    confidence: 91,
    relevance: 87,
    tag: 'Audio Acoustics',
    speed: '14ms'
  },
  {
    id: '5',
    title: 'Temporal Synchronization & Chrono Telemetry',
    snippet: 'Precision clock crystal calibration, distributed nodes synchronization, and real-time latency telemetry engines.',
    category: 'Temporal Systems',
    confidence: 99,
    relevance: 96,
    tag: 'Real-Time',
    speed: '6ms'
  }
];

export default function SearchModal({
  isOpen,
  onClose,
  initialQuery = '',
  currentLang = 'en-US',
  selectedVoiceId = 'girl',
  theme = 'dark',
  aiState = 'IDLE'
}) {
  // 1. ALL STATE HOOKS (Always called in unconditional top-level order)
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isAiModeActive, setIsAiModeActive] = useState(true);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [attachedContext, setAttachedContext] = useState(null);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [isSpeakingAnswer, setIsSpeakingAnswer] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('');

  const [searchHistory, setSearchHistory] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('max_ai_search_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.error('Error loading search history:', err);
      }
    }
    return INITIAL_SEARCH_HISTORY;
  });

  // 2. REFS
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  // 3. MEMOIZED VALUES (Defined BEFORE any return)
  const filteredKnowledge = useMemo(() => {
    const activeQ = (submittedQuery || query).trim().toLowerCase();
    if (!activeQ) return KNOWLEDGE_BASE;
    return KNOWLEDGE_BASE.filter(
      (item) =>
        item.title.toLowerCase().includes(activeQ) ||
        item.snippet.toLowerCase().includes(activeQ) ||
        item.category.toLowerCase().includes(activeQ) ||
        item.tag.toLowerCase().includes(activeQ)
    );
  }, [submittedQuery, query]);

  const dynamicAiSummary = useMemo(() => {
    const q = (submittedQuery || 'MAX AI Knowledge').trim();
    return {
      title: `Search Information for "${q}"`,
      summary: `MAX AI analyzed real-time neural knowledge vectors and telemetry records matching "${q}".`,
      keyTakeaways: [
        `Optimal Convergence: Knowledge retrieval confidence score evaluated at 98.4%.`,
        `Real-Time Latency: Processed within 7.2ms with zero-loss semantic preservation.`,
        `Security Protocol: Lattice encryption verified with post-quantum defense algorithms.`,
        `Recommendation: Results are ready to deploy to autonomous tasks or summarize.`
      ],
      latency: '7ms',
      confidence: '98%',
      sourcesCount: filteredKnowledge.length
    };
  }, [submittedQuery, filteredKnowledge]);

  const filteredHistory = useMemo(() => {
    if (!historyFilter.trim()) return searchHistory;
    const lower = historyFilter.toLowerCase();
    return searchHistory.filter(
      (h) => h.query.toLowerCase().includes(lower) || h.category?.toLowerCase().includes(lower)
    );
  }, [searchHistory, historyFilter]);

  // 4. EFFECTS (Defined BEFORE any return)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('max_ai_search_history', JSON.stringify(searchHistory));
      } catch (err) {
        console.error('Failed to save search history:', err);
      }
    }
  }, [searchHistory]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setSubmittedQuery(initialQuery);
    }
  }, [initialQuery]);

  // Stop speech if modal closes
  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      setIsSpeakingAnswer(false);
    }
  }, [isOpen]);

  // 5. CONDITIONAL RETURN (ONLY AFTER ALL HOOKS ARE COMPLETE)
  if (!isOpen) return null;

  // 6. ACTION HANDLERS
  const addToHistory = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase());
      const newEntry = {
        id: 'h_' + Date.now(),
        query: trimmed,
        timestamp: 'Just now',
        date: new Date().toISOString(),
        category: isAiModeActive ? 'AI Mode' : 'Web Search',
        aiMode: isAiModeActive
      };
      return [newEntry, ...filtered].slice(0, 30);
    });
  };

  const handleDeleteHistoryItem = (e, id) => {
    e.stopPropagation();
    playSound('click');
    setSearchHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = (e) => {
    e?.stopPropagation();
    playSound('click');
    setSearchHistory([]);
  };

  const handlePerformSearch = (searchText) => {
    const target = (searchText !== undefined ? searchText : query).trim();
    if (!target) return;

    playSound('think');
    setQuery(target);
    setSubmittedQuery(target);
    addToHistory(target);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handlePerformSearch();
  };

  const handleSelectHistoryItem = (item) => {
    playSound('click');
    setQuery(item.query);
    handlePerformSearch(item.query);
  };

  const handleToggleAiMode = (e) => {
    e?.stopPropagation();
    playSound('activate');
    setIsAiModeActive((prev) => !prev);
  };

  const handleVoiceSearch = () => {
    playSound('activate');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = currentLang || 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        setIsListeningVoice(true);
        setVoiceNotice('Listening to your query...');

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setIsListeningVoice(false);
          setVoiceNotice('');
          setQuery(transcript);
          handlePerformSearch(transcript);
        };

        recognition.onerror = () => {
          setIsListeningVoice(false);
          setVoiceNotice('Voice recognition unavailable');
          setTimeout(() => setVoiceNotice(''), 3000);
        };

        recognition.onend = () => {
          setIsListeningVoice(false);
        };

        recognition.start();
      } catch (err) {
        setIsListeningVoice(false);
        setVoiceNotice('Voice access error');
      }
    } else {
      setIsListeningVoice(true);
      setVoiceNotice('Voice query activated');
      setTimeout(() => {
        const sampleQuery = 'Explain quantum superposition in AI neural nets';
        setQuery(sampleQuery);
        setIsListeningVoice(false);
        setVoiceNotice('');
        handlePerformSearch(sampleQuery);
      }, 1500);
    }
  };

  const handleCameraClick = () => {
    playSound('click');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      setAttachedContext(fileName);
      playSound('activate');
      setQuery(`Analyze file context: ${fileName}`);
      inputRef.current?.focus();
    }
  };

  const handleSpeakOverview = (textToSpeak) => {
    if (isSpeakingAnswer) {
      stopSpeech();
      setIsSpeakingAnswer(false);
      return;
    }

    setIsSpeakingAnswer(true);
    playSound('speak');
    speakWithMAX(
      textToSpeak,
      {
        lang: currentLang,
        profileId: selectedVoiceId,
        volume: 1.0
      },
      () => {
        setIsSpeakingAnswer(false);
      }
    );
  };

  const handleResetSearch = () => {
    playSound('click');
    setQuery('');
    setSubmittedQuery('');
    setAttachedContext(null);
    stopSpeech();
    setIsSpeakingAnswer(false);
  };

  // 7. RENDER VIEW
  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col text-slate-100 select-none">
      {/* 1. BACKGROUND: EXACT SAME AS HOME PAGE (CyberBackground) */}
      <CyberBackground theme={theme} aiState={aiState} />

      {/* Subtle translucent ambient overlay allowing the cyber laboratory background to remain vivid */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none z-0" />

      {/* Hidden File Input for Lens/Attachments */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.txt,.doc"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 2. TOP HEADER NAVIGATION */}
      <header className="relative z-20 w-full flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4">
        <button
          onClick={() => {
            playSound('click');
            stopSpeech();
            onClose();
          }}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-2xl glass-panel-interactive border border-cyan-400/40 text-cyan-200 hover:text-white text-xs sm:text-sm font-tech font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)]"
          title="Return to MAX Assistant"
        >
          <span className="text-base group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>BACK TO ASSISTANT</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-tech font-bold px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(0,243,255,0.3)]">
            SEARCH INFORMATION
          </span>

          <button
            onClick={() => {
              playSound('click');
              stopSpeech();
              onClose();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-panel border border-cyan-400/40 hover:border-cyan-300 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-md"
            aria-label="Close search"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* 3. MAIN CONTENT STAGE */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 flex flex-col items-center justify-start pt-4 sm:pt-8 pb-16">
        <div className="w-full max-w-3xl flex flex-col items-center">
          {/* BRAND LOGO: MAX AI */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-5 sm:mb-6 select-none"
          >
            <h1 className="font-google font-extrabold text-5xl sm:text-6xl md:text-7xl text-white tracking-tight drop-shadow-[0_0_25px_rgba(0,243,255,0.6)]">
              MAX AI
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-tech text-cyan-300/90 tracking-widest uppercase font-semibold">
              Neural Search Information & Past History
            </p>
          </motion.div>

          {/* Voice Notice */}
          <AnimatePresence>
            {voiceNotice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-3 px-4 py-1.5 rounded-full bg-cyan-500/90 text-slate-950 font-tech font-bold text-xs shadow-[0_0_15px_#00f3ff] flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                <span>{voiceNotice}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. THE SEARCH BAR (Exact design from the reference image) */}
          <form
            onSubmit={handleFormSubmit}
            className="w-full bg-white text-slate-800 rounded-full px-3.5 sm:px-5 py-2.5 sm:py-3 shadow-[0_10px_35px_rgba(0,243,255,0.35)] border-2 border-cyan-400/60 hover:border-cyan-300 transition-all flex items-center gap-2 mb-6"
          >
            {/* Left: Plus (+) Button for context/file attachment */}
            <button
              type="button"
              onClick={handleCameraClick}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
              title="Add context, file, or image"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-slate-800" strokeWidth={2.4} />
            </button>

            {/* Context Badge if attached */}
            {attachedContext && (
              <div className="flex items-center gap-1 bg-cyan-50 text-cyan-900 border border-cyan-300 text-xs px-2.5 py-1 rounded-full shrink-0 font-medium">
                <span className="truncate max-w-[120px]">{attachedContext}</span>
                <button
                  type="button"
                  onClick={() => setAttachedContext(null)}
                  className="hover:text-red-600 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Center Input: "Ask MAX AI" */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask MAX AI"
              className="flex-1 bg-transparent border-none outline-none font-sans text-base sm:text-lg text-slate-900 placeholder-slate-400 px-1 py-1 tracking-normal min-w-0"
            />

            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 shrink-0"
                title="Clear"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Right Icons: Microphone, Camera, "✨ AI Mode", Search */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-2 rounded-full transition-colors ${
                  isListeningVoice
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Search by voice"
              >
                <Mic className="w-5 h-5" strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={handleCameraClick}
                className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Camera & image search"
              >
                <Camera className="w-5 h-5" strokeWidth={2} />
              </button>

              {/* "✨ AI Mode" Pill */}
              <button
                type="button"
                onClick={handleToggleAiMode}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border ${
                  isAiModeActive
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                }`}
                title={isAiModeActive ? 'AI Mode Active' : 'Enable AI Mode'}
              >
                <Sparkles
                  className={`w-4 h-4 ${
                    isAiModeActive ? 'text-purple-600 fill-purple-200 animate-pulse' : 'text-slate-400'
                  }`}
                />
                <span>AI Mode</span>
              </button>

              {/* Submit Search Button */}
              <button
                type="submit"
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech font-bold text-xs sm:text-sm flex items-center gap-1 transition-all shadow-[0_0_12px_#00f3ff]"
              >
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* 5. SEARCH INFORMATION CARD (When a search has been executed) */}
          {submittedQuery && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-3xl glass-panel border border-cyan-400/50 p-5 sm:p-6 mb-6 shadow-[0_0_40px_rgba(0,243,255,0.2)] text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_#00f3ff]">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-cyber font-bold text-base sm:text-lg text-white">
                      {dynamicAiSummary.title}
                    </h3>
                    <p className="text-xs font-tech text-cyan-300/80">
                      Synthesized in {dynamicAiSummary.latency} • Confidence: {dynamicAiSummary.confidence}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playSound('click');
                      navigator.clipboard.writeText(
                        `${dynamicAiSummary.summary}\n\n${dynamicAiSummary.keyTakeaways.join('\n')}`
                      );
                      setCopiedAnswer(true);
                      setTimeout(() => setCopiedAnswer(false), 2000);
                    }}
                    className="p-2 rounded-xl glass-panel border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors"
                    title="Copy search information"
                  >
                    {copiedAnswer ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      handleSpeakOverview(
                        `${dynamicAiSummary.summary}. ${dynamicAiSummary.keyTakeaways[0]}`
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-tech font-bold border transition-all ${
                      isSpeakingAnswer
                        ? 'bg-cyan-400/30 border-cyan-300 text-white animate-pulse shadow-[0_0_15px_#00f3ff]'
                        : 'bg-cyan-950/60 border-cyan-400/40 text-cyan-300 hover:text-white'
                    }`}
                    title="Voice Search Information"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeakingAnswer ? 'Speaking...' : 'Voice Readout'}</span>
                  </button>

                  <button
                    onClick={handleResetSearch}
                    className="p-2 rounded-xl glass-panel border border-slate-700 text-slate-400 hover:text-white"
                    title="Clear search"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans mb-4">
                {dynamicAiSummary.summary}
              </p>

              {/* Key Takeaways */}
              <div className="space-y-2 mb-4">
                {dynamicAiSummary.keyTakeaways.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 text-xs sm:text-sm text-slate-300"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_8px_#00f3ff]" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* Sources Matches */}
              <div className="pt-3 border-t border-cyan-500/20">
                <span className="text-[11px] font-tech text-cyan-400 uppercase tracking-wider block mb-2 font-bold">
                  Related Knowledge Sources ({filteredKnowledge.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredKnowledge.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        playSound('click');
                        setQuery(item.title);
                        handlePerformSearch(item.title);
                      }}
                      className="p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-cyan-500/20 hover:border-cyan-400/50 cursor-pointer transition-all"
                    >
                      <span className="text-[10px] font-mono text-cyan-300 block">{item.category}</span>
                      <span className="text-xs font-semibold text-white truncate block">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 6. DOWN BELOW: THE PAST HISTORY BLOCK ("down it should show waht i had search the past history block") */}
          <div className="w-full rounded-3xl glass-panel border border-cyan-400/40 p-4 sm:p-6 shadow-[0_0_35px_rgba(0,243,255,0.18)] text-left">
            {/* Header with Title, Count & Clear Action */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_#00f3ff]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-cyber font-bold text-sm sm:text-base text-white tracking-wide">
                    PAST SEARCH HISTORY
                  </h3>
                  <p className="text-[10px] font-tech text-cyan-300/80">
                    WHAT YOU HAD SEARCHED • CLICK TO RE-SEARCH
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300">
                  {searchHistory.length} saved
                </span>

                {searchHistory.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="px-2.5 py-1 rounded-lg text-xs font-tech text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1"
                    title="Clear entire search history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {/* History Search / Filter Input */}
            {searchHistory.length > 4 && (
              <div className="relative mb-3">
                <input
                  type="text"
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  placeholder="Filter what you searched..."
                  className="w-full px-3 py-1.5 pl-8 rounded-xl bg-slate-900/60 border border-cyan-500/30 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-300"
                />
                <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                {historyFilter && (
                  <button
                    onClick={() => setHistoryFilter('')}
                    className="text-xs text-slate-400 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* List of What Was Searched */}
            {filteredHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs sm:text-sm font-tech">
                {historyFilter
                  ? `No past search matching "${historyFilter}"`
                  : 'No past searches yet. Anything you search will appear right down here!'}
              </div>
            ) : (
              <div className="divide-y divide-cyan-500/10 space-y-1">
                {filteredHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ x: 3 }}
                    onClick={() => handleSelectHistoryItem(item)}
                    className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-cyan-500/10 border border-transparent hover:border-cyan-400/30 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Clock className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-300 shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="min-w-0 flex-1">
                        <span className="font-sans font-medium text-sm text-slate-100 group-hover:text-cyan-200 truncate block">
                          {item.query}
                        </span>
                        <span className="text-[10px] font-tech text-cyan-400/60 group-hover:text-cyan-300/80">
                          {item.category || 'Search'} • {item.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[11px] font-tech text-cyan-300/70 hidden sm:inline">
                        Click to search
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove from history"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Quick Actions Row */}
            <div className="flex items-center gap-2 pt-3 mt-3 border-t border-cyan-500/20 overflow-x-auto text-xs no-scrollbar">
              <span className="text-[10px] font-tech font-bold text-cyan-400 uppercase tracking-wider shrink-0">
                Quick Topics:
              </span>
              <button
                type="button"
                onClick={() => {
                  const q = 'Quantum lattice cryptography protocols';
                  setQuery(q);
                  handlePerformSearch(q);
                }}
                className="px-3 py-1 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-200 text-xs font-tech transition-all shrink-0"
              >
                ⚡ Quantum Protocols
              </button>
              <button
                type="button"
                onClick={() => {
                  const q = 'Neural transformer multi-head attention heuristics';
                  setQuery(q);
                  handlePerformSearch(q);
                }}
                className="px-3 py-1 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-200 text-xs font-tech transition-all shrink-0"
              >
                🧠 Neural Architecture
              </button>
              <button
                type="button"
                onClick={() => {
                  const q = 'Multi-lingual synthetic voice formant calibration';
                  setQuery(q);
                  handlePerformSearch(q);
                }}
                className="px-3 py-1 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-200 text-xs font-tech transition-all shrink-0"
              >
                🎙️ Voice Formants
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
