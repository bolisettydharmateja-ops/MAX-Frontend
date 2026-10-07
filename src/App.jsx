import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, Clock, Bell } from 'lucide-react';
import CyberBackground from './components/CyberBackground';
import HeaderBadge from './components/HeaderBadge';
import SideMenu from './components/SideMenu';
import AIOrb from './components/AIOrb';
import AIVariations from './components/AIVariations';
import SpeechBubble from './components/SpeechBubble';
import CommandBar from './components/CommandBar';
import TaskModal from './components/TaskModal';
import SettingsModal from './components/SettingsModal';
import SearchModal from './components/SearchModal';
import VoiceModal from './components/VoiceModal';
import {
  playSound,
  speakWithMAX,
  stopSpeech,
  getVoiceVolume,
  setVoiceVolume,
  VOICE_PROFILES,
  getSelectedVoiceProfileId,
  setSelectedVoiceProfileId,
  getVoiceProfile
} from './utils/audio';
import { checkTimeDateQuery, formatTime, formatDate } from './utils/dateTime';
import {
  SUPPORTED_LANGUAGES,
  getDefaultLanguage,
  saveLanguage,
  getLanguageByCode,
  getLocalizedDateTimeSpeech
} from './utils/languages';

export default function App() {
  const [aiState, setAiState] = useState('IDLE'); // IDLE, LISTENING, THINKING, SPEAKING
  const [activeModal, setActiveModal] = useState(null); // 'chat' | 'search' | 'tasks' | 'settings' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [completedTaskNotification, setCompletedTaskNotification] = useState(null);

  // Multilingual State (Indian & International languages)
  const [currentLang, setCurrentLangState] = useState(() => {
    return getDefaultLanguage();
  });

  const activeLangObj = getLanguageByCode(currentLang);
  const [bubbleMessage, setBubbleMessage] = useState(activeLangObj.greeting);

  // Appearance Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('max_theme') || 'dark';
    }
    return 'dark';
  });

  // Selected Realistic Voice Profile ('girl' or 'boy')
  const [selectedVoiceId, setSelectedVoiceId] = useState(() => {
    return getSelectedVoiceProfileId();
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('max_theme', theme);
      document.documentElement.className = theme;
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleVoiceSelect = (profileId) => {
    const normalized = profileId?.startsWith('boy') ? 'boy' : 'girl';
    setSelectedVoiceId(normalized);
    setSelectedVoiceProfileId(normalized);
  };

  const handleSetLanguage = (langCode) => {
    setCurrentLangState(langCode);
    saveLanguage(langCode);
    const langObj = getLanguageByCode(langCode);
    setBubbleMessage(langObj.greeting);

    // Speak native greeting confirmation with amplified volume
    speakWithMAX(langObj.readyResponse || langObj.greeting, {
      lang: langCode,
      profileId: selectedVoiceId,
      volume: 1.0
    });
  };

  // Dynamic real date for task management
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  // Task management
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Neural Architecture Presentation Review',
      date: todayStr,
      time: '16:30',
      priority: 'High',
      hasReminder: true,
      completed: false,
      subtasks: [
        { id: 's1', title: 'Compile benchmark loss metrics', completed: false },
        { id: 's2', title: 'Verify neural latency', completed: false },
      ],
    },
    {
      id: '2',
      title: 'Calibrate Quantum Lattice Keys',
      date: todayStr,
      time: '17:15',
      priority: 'Medium',
      hasReminder: true,
      completed: false,
      subtasks: [
        { id: 's3', title: 'Calibrate key resonance frequency', completed: false },
      ],
    },
    {
      id: '3',
      title: 'Validate Autonomous Perception Pipeline',
      date: todayStr,
      time: '18:45',
      priority: 'High',
      hasReminder: true,
      completed: false,
      subtasks: [],
    },
  ]);

  const pendingTaskCount = tasks.filter((t) => !t.completed).length;

  const handleAddTask = (newTask) => {
    setTasks((prev) => [
      {
        subtasks: [],
        ...newTask,
      },
      ...prev,
    ]);
  };

  const handleToggleTask = (id) => {
    const targetTask = tasks.find((t) => t.id === id);
    if (!targetTask) return;

    const willComplete = !targetTask.completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: willComplete } : t))
    );

    if (willComplete) {
      const completionMsg = `Task "${targetTask.title}" has been completed`;
      setCompletedTaskNotification({
        id: targetTask.id,
        title: targetTask.title,
        text: completionMsg,
      });
      setBubbleMessage(completionMsg);
      setAiState('SPEAKING');
      playSound('complete');

      speakWithMAX(
        completionMsg,
        {
          lang: currentLang,
          profileId: selectedVoiceId,
          volume: 1.0,
        },
        () => {
          setAiState('IDLE');
        }
      );
    } else {
      playSound('click');
    }
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...updatedTask, autoCompleted: false } : t))
    );
    // Allow auto-notification to trigger again when new time arrives
    autoNotifiedTaskIdsRef.current.delete(updatedTask.id);
    playSound('activate');
  };

  // Set of task IDs that have already triggered their auto-completion notification
  const autoNotifiedTaskIdsRef = useRef(new Set());

  // Request browser Notification permission on mount if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      try {
        Notification.requestPermission().catch(() => {});
      } catch (e) {}
    }
  }, []);

  // Time-based automatic task completion scheduler:
  // Monitors clock every 2 seconds. When a task reaches its scheduled time, it automatically completes
  // and triggers the completion notification, alarm sound, mobile vibration, speech bubble, and spoken voice!
  useEffect(() => {
    const checkScheduledTimeTasks = () => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const curDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const curTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      tasks.forEach((t) => {
        if (!t.completed && !autoNotifiedTaskIdsRef.current.has(t.id)) {
          // Compare dates and times: trigger when date is past or date is today and time is reached
          const isPastDate = t.date < curDateStr;
          const isDateMatch = t.date === curDateStr;
          const isTimeDue = t.time <= curTimeStr;

          if (isPastDate || (isDateMatch && isTimeDue)) {
            autoNotifiedTaskIdsRef.current.add(t.id);

            // 1. Automatically complete the task
            setTasks((prev) =>
              prev.map((item) =>
                item.id === t.id ? { ...item, completed: true, autoCompleted: true } : item
              )
            );

            // 2. Audio alarm & mobile vibration
            playSound('complete');
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              try {
                navigator.vibrate([300, 150, 300, 150, 400]);
              } catch (e) {}
            }

            // 3. Exact completion message: Task "${t.title}" has been completed
            const completionMsg = `Task "${t.title}" has been completed`;
            setCompletedTaskNotification({
              id: t.id,
              title: t.title,
              text: completionMsg,
              autoTriggered: true,
              time: curTimeStr,
            });
            setBubbleMessage(completionMsg);
            setAiState('SPEAKING');

            // 4. Browser OS notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('MAX AI - Task Completed', {
                  body: completionMsg,
                  icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23050b1a" stroke="%2310b981" stroke-width="6"/><circle cx="50" cy="50" r="20" fill="%2310b981"/></svg>',
                });
              } catch (e) {}
            }

            // 5. Spoken voice announcement
            speakWithMAX(
              completionMsg,
              {
                lang: currentLang,
                profileId: selectedVoiceId,
                volume: 1.0,
              },
              () => {
                setAiState('IDLE');
              }
            );
          }
        }
      });
    };

    const timer = setInterval(checkScheduledTimeTasks, 2000);
    checkScheduledTimeTasks();
    return () => clearInterval(timer);
  }, [tasks, currentLang, selectedVoiceId]);

  // Quick 5-second auto-alarm test simulator for testing from mobile or desktop
  const handleTestAutoComplete = (taskId, delaySeconds = 5) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    playSound('activate');
    autoNotifiedTaskIdsRef.current.delete(taskId);

    // Set time to current minute
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dueTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setTasks((prev) =>
      prev.map((item) =>
        item.id === taskId
          ? { ...item, completed: false, time: dueTime }
          : item
      )
    );

    setTimeout(() => {
      if (!autoNotifiedTaskIdsRef.current.has(taskId)) {
        autoNotifiedTaskIdsRef.current.add(taskId);
        setTasks((prev) =>
          prev.map((item) =>
            item.id === taskId ? { ...item, completed: true, autoCompleted: true } : item
          )
        );

        playSound('complete');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([300, 150, 300]);
          } catch (e) {}
        }

        const completionMsg = `Task "${target.title}" has been completed`;
        setCompletedTaskNotification({
          id: target.id,
          title: target.title,
          text: completionMsg,
          autoTriggered: true,
          time: dueTime,
        });
        setBubbleMessage(completionMsg);
        setAiState('SPEAKING');

        speakWithMAX(
          completionMsg,
          {
            lang: currentLang,
            profileId: selectedVoiceId,
            volume: 1.0,
          },
          () => {
            setAiState('IDLE');
          }
        );
      }
    }, delaySeconds * 1000);
  };

  // Voice Date and Time Trigger: Accurate native phonetics and localized phrasing
  const handleVoiceDateTime = () => {
    playSound('activate');
    setAiState('SPEAKING');

    const now = new Date();
    const timeObj = formatTime(now, false, false);
    const dateObj = formatDate(now);
    const langObj = getLanguageByCode(currentLang);

    // Accurate native speech generated for the selected language
    const spokenText = getLocalizedDateTimeSpeech(now, currentLang);

    setBubbleMessage(`${timeObj.formatted} • ${dateObj.headerDisplay}`);
    speakWithMAX(
      spokenText,
      {
        profileId: selectedVoiceId,
        lang: currentLang,
        volume: 1.0
      },
      () => {
        setAiState('IDLE');
        setBubbleMessage(langObj.greeting);
      }
    );
  };

  // State Variations switcher (Thinking, Speaking, Listening, Idle)
  const handleSelectVariation = (stateId) => {
    if (stateId === 'IDLE') {
      stopSpeech();
      setAiState('IDLE');
      setBubbleMessage(activeLangObj.greeting);
      playSound('click');
    } else if (stateId === 'LISTENING') {
      stopSpeech();
      setAiState('LISTENING');
      setBubbleMessage(activeLangObj.listeningStatus || 'Listening...');
      playSound('activate');
    } else if (stateId === 'THINKING') {
      stopSpeech();
      setAiState('THINKING');
      setBubbleMessage(activeLangObj.thinkingStatus || 'Analyzing...');
      playSound('think');
    } else if (stateId === 'SPEAKING') {
      setAiState('SPEAKING');
      setBubbleMessage(activeLangObj.speakingStatus || 'Speaking...');
      playSound('speak');
      speakWithMAX(
        activeLangObj.variationSpeakingMsg,
        {
          profileId: selectedVoiceId,
          lang: currentLang,
          volume: 1.0
        },
        () => {
          setAiState('IDLE');
          setBubbleMessage(activeLangObj.greeting);
        }
      );
    }
  };

  // Trigger conversational interaction
  const triggerAIResponse = (userPrompt) => {
    setAiState('LISTENING');
    setBubbleMessage(activeLangObj.listeningStatus || 'Listening...');
    playSound('activate');

    setTimeout(() => {
      setAiState('THINKING');
      setBubbleMessage(activeLangObj.thinkingStatus || 'Processing...');
      playSound('think');

      setTimeout(() => {
        let answer = activeLangObj.readyResponse;
        const lower = (userPrompt || '').toLowerCase();

        // 1. Language switch directives
        if (lower.includes('hindi') || lower.includes('हिन्दी')) {
          handleSetLanguage('hi-IN');
          return;
        } else if (lower.includes('telugu') || lower.includes('తెలుగు')) {
          handleSetLanguage('te-IN');
          return;
        } else if (lower.includes('tamil') || lower.includes('தமிழ்')) {
          handleSetLanguage('ta-IN');
          return;
        } else if (lower.includes('bengali') || lower.includes('বাংলা')) {
          handleSetLanguage('bn-IN');
          return;
        } else if (lower.includes('kannada') || lower.includes('ಕನ್ನಡ')) {
          handleSetLanguage('kn-IN');
          return;
        } else if (lower.includes('malayalam') || lower.includes('മലയാളം')) {
          handleSetLanguage('ml-IN');
          return;
        } else if (lower.includes('marathi') || lower.includes('मराठी')) {
          handleSetLanguage('mr-IN');
          return;
        } else if (lower.includes('spanish') || lower.includes('español')) {
          handleSetLanguage('es-ES');
          return;
        } else if (lower.includes('french') || lower.includes('français')) {
          handleSetLanguage('fr-FR');
          return;
        }

        // 2. Realistic Voice persona directives (One Girl AI and One Boy AI)
        if (lower.includes('girl voice') || lower.includes('female voice')) {
          handleVoiceSelect('girl');
          answer = activeLangObj.girlVoiceMsg;
        } else if (lower.includes('boy voice') || lower.includes('male voice') || lower.includes('boy ai')) {
          handleVoiceSelect('boy');
          answer = activeLangObj.boyVoiceMsg;
        } else if (lower.includes('light mode') || lower.includes('light appearance')) {
          setTheme('light');
          answer = activeLangObj.defaultDirectiveMsg('Light Appearance');
        } else if (lower.includes('dark mode') || lower.includes('dark appearance')) {
          setTheme('dark');
          answer = activeLangObj.defaultDirectiveMsg('Dark Appearance');
        } else if (
          lower.startsWith('search ') ||
          lower.startsWith('find ') ||
          lower.includes('chart') ||
          lower.includes('show chart')
        ) {
          // 3. Search and Chart Board trigger
          const queryText = userPrompt
            .replace(/^(search for|search|find|show chart for|show chart)\s*/i, '')
            .trim();
          setSearchQuery(queryText || 'Data');
          setActiveModal('search');
          answer = activeLangObj.searchMsg(queryText || 'Data');
        } else {
          // 4. Real Time and Date queries using accurate localized phonetics
          const temporalCheck = checkTimeDateQuery(userPrompt);
          if (temporalCheck) {
            answer = getLocalizedDateTimeSpeech(new Date(), currentLang);
          } else if (
            lower.startsWith('complete task') ||
            lower.startsWith('finish task') ||
            lower.startsWith('done task') ||
            lower.startsWith('mark task')
          ) {
            const cleanTitle = userPrompt
              .replace(/^(complete task|finish task|done task|mark task)\s*/i, '')
              .replace(/\s*(as completed|completed|as done|done)$/i, '')
              .trim();
            const matchingTask =
              tasks.find((t) => !t.completed && cleanTitle && t.title.toLowerCase().includes(cleanTitle.toLowerCase())) ||
              tasks.find((t) => !t.completed);
            if (matchingTask) {
              setTasks((prev) =>
                prev.map((t) => (t.id === matchingTask.id ? { ...t, completed: true } : t))
              );
              const completionMsg = `Task "${matchingTask.title}" has been completed`;
              setCompletedTaskNotification({
                id: matchingTask.id,
                title: matchingTask.title,
                text: completionMsg,
              });
              answer = completionMsg;
              playSound('complete');
            } else {
              answer = `No pending task found matching "${cleanTitle}".`;
            }
          } else if (
            lower.startsWith('add task') ||
            lower.startsWith('create task') ||
            lower.startsWith('new task') ||
            lower.startsWith('remind me to') ||
            (lower.startsWith('task ') && !lower.includes('count'))
          ) {
            const cleanTitle = userPrompt
              .replace(/^(add task|create task|new task|remind me to|task)\s*/i, '')
              .trim();
            if (cleanTitle) {
              const newTask = {
                id: Date.now().toString(),
                title: cleanTitle,
                date: todayStr,
                time: '18:00',
                priority: 'High',
                hasReminder: true,
                completed: false,
              };
              setTasks((prev) => [newTask, ...prev]);
              answer = `Task "${cleanTitle}" has been added to your schedule.`;
              playSound('activate');
            } else {
              answer = activeLangObj.tasksMsg(pendingTaskCount);
            }
          } else if (lower.includes('task') || lower.includes('todo')) {
            answer = activeLangObj.tasksMsg(pendingTaskCount);
          } else if (lower.includes('who are you') || lower.includes('name')) {
            answer = activeLangObj.whoMsg;
          } else if (userPrompt) {
            answer = activeLangObj.defaultDirectiveMsg(userPrompt);
          }
        }

        setAiState('SPEAKING');
        setBubbleMessage(answer);
        playSound('speak');

        // Speak aloud with amplified volume and active language voice
        speakWithMAX(
          answer,
          {
            profileId: selectedVoiceId,
            lang: currentLang,
            volume: 1.0 // Maximum loud volume
          },
          () => {
            setAiState('IDLE');
            setBubbleMessage(activeLangObj.greeting);
          }
        );
      }, 1200);
    }, 1400);
  };

  // Toggle voice button
  const handleToggleVoice = () => {
    if (aiState === 'IDLE') {
      triggerAIResponse();
    } else {
      stopSpeech();
      setAiState('IDLE');
      setBubbleMessage(activeLangObj.greeting);
    }
  };

  const handleSideMenuSelect = (actionId) => {
    if (actionId === 'chat') {
      setActiveModal('chat');
    } else if (actionId === 'search') {
      setSearchQuery('');
      setActiveModal('search');
    } else if (actionId === 'tasks') {
      setActiveModal('tasks');
    } else if (actionId === 'settings') {
      setActiveModal('settings');
    }
  };

  const stateDarkBgs = {
    IDLE: 'bg-[#020b1e]',
    LISTENING: 'bg-[#011a11]',
    THINKING: 'bg-[#170529]',
    SPEAKING: 'bg-[#261203]',
  };
  const stateLightBgs = {
    IDLE: 'bg-[#e0ecfc]',
    LISTENING: 'bg-[#dafbe8]',
    THINKING: 'bg-[#f3e8ff]',
    SPEAKING: 'bg-[#fef3c7]',
  };
  const activeBgClass =
    theme === 'dark'
      ? stateDarkBgs[aiState] || stateDarkBgs.IDLE
      : stateLightBgs[aiState] || stateLightBgs.IDLE;

  return (
    <div
      className={`relative min-h-screen w-full transition-colors duration-700 flex flex-col justify-between overflow-x-hidden select-none ${activeBgClass} ${
        theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* 1. Atmospheric Cyber Laboratory Backdrop with Dynamic State Colors */}
      <CyberBackground theme={theme} aiState={aiState} />

      {/* 1.5 Floating Task Completion Notification Banner */}
      <AnimatePresence>
        {completedTaskNotification && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl glass-panel border border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)] bg-[#031c12]/95 text-white flex items-center gap-3.5 pointer-events-auto"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/80 flex items-center justify-center shrink-0 shadow-[0_0_15px_#10b981]">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-cyber font-bold tracking-wider text-emerald-300 uppercase flex items-center gap-1.5">
                {completedTaskNotification.autoTriggered ? (
                  <>
                    <Clock className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>TIME DUE • AUTO COMPLETED</span>
                  </>
                ) : (
                  <span>TASK COMPLETED</span>
                )}
              </span>
              <span className="text-xs sm:text-sm font-tech font-bold text-white tracking-wide">
                Task "{completedTaskNotification.title}" has been completed
              </span>
            </div>
            <button
              onClick={() => setCompletedTaskNotification(null)}
              className="ml-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top Header Bar: Upward corner has Voice Date & Time button and Online status */}
      <HeaderBadge
        onVoiceDateTime={handleVoiceDateTime}
        currentLang={currentLang}
        onOpenLanguageModal={() => setActiveModal('settings')}
      />

      {/* 3. Main Stage: Strict 3-Column Grid ensuring MAX AI is in Dead Center */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-3 items-center justify-items-center px-4 sm:px-8 lg:px-12 py-3 max-w-7xl mx-auto w-full gap-6 my-auto">
        {/* Left Column: SideMenu aligned to left */}
        <div className="w-full flex justify-center lg:justify-start">
          <SideMenu
            onSelect={handleSideMenuSelect}
            taskCount={pendingTaskCount}
          />
        </div>

        {/* Center Column: 3D AI Orb + Variations Toolbar strictly centered */}
        <div className="w-full flex flex-col items-center justify-center my-2 sm:my-0">
          <AIOrb state={aiState} onClick={handleToggleVoice} />
          {/* AI Variations Toolbar: Idle, Listening, Thinking, Speaking */}
          <AIVariations
            currentState={aiState}
            onSelectState={handleSelectVariation}
          />
        </div>

        {/* Right Column: Floating Speech Bubble aligned to right */}
        <div className="w-full flex justify-center lg:justify-end">
          <SpeechBubble
            state={aiState}
            message={bubbleMessage}
            currentLang={currentLang}
          />
        </div>
      </main>

      {/* 4. Bottom Command Bar: Floating Capsule with Mic, Input, and Send */}
      <footer className="relative z-30 pb-6 sm:pb-8 pt-2">
        <CommandBar
          state={aiState}
          onVoiceToggle={handleToggleVoice}
          onSubmitMessage={triggerAIResponse}
        />
      </footer>

      {/* 5. Interactive Modals */}
      <TaskModal
        isOpen={activeModal === 'tasks'}
        onClose={() => setActiveModal(null)}
        tasks={tasks}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
        lastCompletedTaskTitle={completedTaskNotification?.title}
        onTestAutoComplete={handleTestAutoComplete}
        onUpdateTask={handleUpdateTask}
      />

      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
        theme={theme}
        onThemeChange={setTheme}
        selectedVoiceId={selectedVoiceId}
        onVoiceSelect={handleVoiceSelect}
        currentLang={currentLang}
        onLanguageChange={handleSetLanguage}
      />

      {/* 6. Neural Search & Chart Board */}
      <SearchModal
        isOpen={activeModal === 'search'}
        onClose={() => setActiveModal(null)}
        initialQuery={searchQuery}
        currentLang={currentLang}
        selectedVoiceId={selectedVoiceId}
      />

      <VoiceModal
        isOpen={activeModal === 'chat'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
