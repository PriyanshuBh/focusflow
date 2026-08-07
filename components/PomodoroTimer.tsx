"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Settings2, 
  Zap, 
  Coffee,
  Timer as TimerIcon,
  HelpCircle,
  Maximize2,
  Minimize2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "./SettingsModal";
import { useTimerContext } from "@/contexts/TimerContext";
import { motion, AnimatePresence } from "framer-motion";
import { PomodoroMiniWidget } from "./PomodoroMiniWidget";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { KeyboardHelp } from "./KeyboardHelp";

type TimerMode = "focus" | "shortBreak" | "longBreak";

export default function PomodoroTimer() {
  const { settings, metrics, updateMetrics, isZenMode, toggleZenMode } = useTimerContext();
  const [time, setTime] = useState(settings.focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [showSettings, setShowSettings] = useState(false);
  const [showMiniWidget, setShowMiniWidget] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const timerRef = useRef<HTMLDivElement>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const toggleHelp = () => setIsHelpOpen((prev) => !prev);
  
  // 1. Define the actions the keyboard will trigger
  const toggleTimer = () => setIsActive(!isActive);
    
  const resetTimer = () => {
    setIsActive(false);
    setTime(settings[`${mode}Time`] * 60);
  };

  const skipSession = () => {
    if (mode !== "focus") {
      handleTimerComplete(); 
    }
  };

  // Pass toggleHelp and toggleZenMode to the keyboard hook
  useKeyboardControls(toggleTimer, resetTimer, skipSession, toggleHelp, toggleZenMode);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = 1 - time / (settings[`${mode}Time`] * 60);

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTime(settings[`${newMode}Time`] * 60);
  }, [settings]);

  const handleTimerComplete = useCallback(() => {
    if (audioRef.current) audioRef.current.play();
    
    if (mode === "focus") {
      const nextCycle = (cycleCount + 1) % settings.cyclesBeforeLongBreak;
      setCycleCount(nextCycle);
      const isLongBreak = nextCycle === 0;
      switchMode(isLongBreak ? "longBreak" : "shortBreak");
      updateMetrics("focusSessions", 1); // Increments session count
      updateMetrics("totalFocusTime", settings.focusTime); // Adds minutes to total
    } else {
      // Record break metrics
      if (mode === "shortBreak") updateMetrics("shortBreaks", 1);
      if (mode === "longBreak") updateMetrics("longBreaks", 1);
      switchMode("focus");
    }
  }, [mode, cycleCount, settings, switchMode, updateMetrics]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMiniWidget(!entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    const currentRef = timerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);
  
  const scrollToTimer = () => {
    timerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timeStr = formatTime(time);
    const status = mode === "focus" ? "Focus" : "Break";
    
    document.title = isActive ? `${timeStr} | ${status}` : "FocusFlow";

    return () => {
      document.title = "FocusFlow";
    };
  }, [time, mode, isActive]);

  useEffect(() => {
    const newTime = settings[`${mode}Time`] * 60;
    setTime(newTime);
    setIsActive(false); 
  }, [settings, mode]);

  useEffect(() => {
    if (isZenMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isZenMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = Math.max(prevTime - 1, 0);
  
          if (newTime === 0) {
            setIsActive(false);
            
            if (mode === "focus") {
              updateMetrics("focusSessions", 1);
              updateMetrics("totalFocusTime", settings.focusTime);
              updateMetrics("dailyStreak", metrics.dailyStreak + 1);
            } else if (mode === "shortBreak") {
              updateMetrics("shortBreaks", 1);
            } else if (mode === "longBreak") {
              updateMetrics("longBreaks", 1);
            }
            
            setTimeout(() => handleTimerComplete(), 100);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, time, mode, settings, metrics, updateMetrics, handleTimerComplete]);

  return (
    <>
    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-9 shadow-2xl relative overflow-hidden" ref={timerRef}>
      {/* Action buttons on card bottom-right: Zen Mode & Help */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleZenMode}
          className="rounded-full w-8 h-8 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all group relative"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="absolute bottom-9 right-0 scale-0 group-hover:scale-100 transition-all text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 whitespace-nowrap border border-white/5 pointer-events-none">
            Zen Mode (F)
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleHelp}
          className="rounded-full w-8 h-8 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all group relative"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="absolute bottom-9 right-0 scale-0 group-hover:scale-100 transition-all text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 whitespace-nowrap border border-white/5 pointer-events-none">
            Shortcuts (?)
          </span>
        </Button>
      </div>

      <div className="relative flex flex-col items-center">

        {/* Mode Toggles */}
        <div className="flex bg-slate-800/50 p-1 rounded-2xl mb-6 border border-white/5">
          {(["focus", "shortBreak", "longBreak"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              disabled={isActive || (time !== settings[`${mode}Time`] * 60 )}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                mode === m ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {m.replace("Break", " Break")}
            </button>
          ))}
        </div>

        {/* Circular Progress + Time */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-800/50"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 120}
              initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress) }}
              className="text-indigo-500"
              strokeLinecap="round"
            />
          </svg>
          
          <div className="text-center z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={time}
                className="text-6xl font-light tracking-tighter text-white font-mono"
              >
                {formatTime(time)}
              </motion.div>
            </AnimatePresence>
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-2 flex items-center justify-center gap-2">
              {mode === 'focus' ? <Zap className="w-3 h-3 text-amber-500" /> : <Coffee className="w-3 h-3 text-blue-400" />}
              {mode}
            </p>
            <div className="absolute bottom-4 right-21 p-6 opacity-10">
              <TimerIcon className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-6 mt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTime(settings[`${mode}Time`] * 60)}
            className="rounded-full hover:bg-white/5 text-slate-500"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>

          <Button
            onClick={() => setIsActive(!isActive)}
            className={`w-20 h-20 rounded-full transition-all duration-500 ${
              isActive 
                ? "bg-slate-800 text-white hover:bg-slate-700" 
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)]"
            }`}
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleTimerComplete}
            className="rounded-full hover:bg-white/5 text-slate-500"
            disabled={mode === "focus"}
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Sessions Counter */}
        <div className="mt-6 flex gap-2">
          {[...Array(settings.cyclesBeforeLongBreak)].map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-8 rounded-full transition-colors ${i < cycleCount ? "bg-indigo-500" : "bg-slate-800"}`} 
            />
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={() => setShowSettings(true)}
          className="mt-6 text-slate-500 hover:text-white text-xs gap-2"
        >
          <Settings2 className="w-4 h-4" />
          Customize Session
        </Button>
      </div>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
     
      <audio ref={audioRef} src="/bell2.wav" preload="auto" />
    </div>

    {/* ZEN / FULLSCREEN FOCUS OVERLAY */}
    <AnimatePresence>
      {isZenMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed inset-0 z-[150] h-screen h-dvh w-screen w-dvh bg-[#0a0c10]/95 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-10 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden selection:bg-indigo-500/30"
        >
          {/* Ambient Mesh Background Glow */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] ${mode === 'focus' ? 'bg-indigo-600/15' : 'bg-emerald-600/15'} blur-[160px] rounded-full transition-colors duration-1000`} />
          </div>

          {/* Zen Mode Top Bar Header */}
          <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tighter text-white">
                  FOCUS<span className="text-indigo-500">FLOW</span>
                </h1>
                <p className="text-[10px] font-mono text-indigo-400/80 uppercase tracking-widest">
                  Zen Sanctuary Mode
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={toggleZenMode}
              className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 px-4 py-2 rounded-2xl transition-all shadow-lg"
            >
              <Minimize2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium">Exit Zen (Esc)</span>
            </Button>
          </div>

          {/* Zen Center Timer Focus Zone */}
          <div className="flex flex-col items-center justify-center my-auto py-8">
            {/* Mode Toggles */}
            <div className="flex bg-slate-800/60 p-1.5 rounded-2xl mb-10 border border-white/10 shadow-xl">
              {(["focus", "shortBreak", "longBreak"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  disabled={isActive || (time !== settings[`${mode}Time`] * 60)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    mode === m ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m.replace("Break", " Break")}
                </button>
              ))}
            </div>

            {/* Expanded SVG Circular Progress Ring */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
              <svg className="absolute w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-slate-800/40"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 170}
                  initial={{ strokeDashoffset: 2 * Math.PI * 170 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 170 * (1 - progress) }}
                  className={mode === "focus" ? "text-indigo-500" : "text-emerald-400"}
                  strokeLinecap="round"
                />
              </svg>

              <div className="text-center z-10 flex flex-col items-center">
                <motion.div
                  key={time}
                  className="text-7xl sm:text-8xl font-light tracking-tighter text-white font-mono drop-shadow-2xl"
                >
                  {formatTime(time)}
                </motion.div>

                <p className="text-xs font-bold text-slate-400 tracking-[0.3em] uppercase mt-4 flex items-center justify-center gap-2">
                  {mode === 'focus' ? <Zap className="w-4 h-4 text-amber-400" /> : <Coffee className="w-4 h-4 text-blue-400" />}
                  {mode}
                </p>
              </div>
            </div>

            {/* Primary Controls */}
            <div className="flex items-center gap-8 mt-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTime(settings[`${mode}Time`] * 60)}
                className="w-12 h-12 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <RotateCcw className="w-6 h-6" />
              </Button>

              <Button
                onClick={() => setIsActive(!isActive)}
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full transition-all duration-500 shadow-2xl ${
                  isActive 
                    ? "bg-slate-800 text-white hover:bg-slate-700 border border-white/10" 
                    : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.5)] scale-105"
                }`}
              >
                {isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1.5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleTimerComplete}
                className="w-12 h-12 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                disabled={mode === "focus"}
              >
                <SkipForward className="w-6 h-6" />
              </Button>
            </div>

            {/* Sessions Counter */}
            <div className="mt-8 flex gap-2.5">
              {[...Array(settings.cyclesBeforeLongBreak)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 w-10 rounded-full transition-colors ${i < cycleCount ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-slate-800"}`} 
                />
              ))}
            </div>
          </div>

          {/* Zen Bottom Bar Hints */}
          <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl mx-auto text-slate-500 text-xs pt-4 border-t border-white/5 gap-2">
            <div className="flex gap-4 items-center">
              <span><kbd className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-white/10">Space</kbd> Play/Pause</span>
              <span><kbd className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-white/10">R</kbd> Reset</span>
              <span><kbd className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-white/10">F</kbd> / <kbd className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-white/10">Esc</kbd> Exit Zen</span>
            </div>
            <p className="text-slate-500 font-mono text-[11px]">Deep Work Sanctuary</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <KeyboardHelp isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    <PomodoroMiniWidget
      time={time}
      mode={mode}
      isVisible={showMiniWidget && !isZenMode}
      onClick={scrollToTimer}
    />
    </>
  );
}