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
  Timer as TimerIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "./SettingsModal";
import { useTimerContext } from "@/contexts/TimerContext";
import { motion, AnimatePresence } from "framer-motion";
import { PomodoroMiniWidget } from "./PomodoroMiniWidget";

type TimerMode = "focus" | "shortBreak" | "longBreak";

export default function PomodoroTimer() {
  const { settings,metrics, updateMetrics } = useTimerContext();
  const [time, setTime] = useState(settings.focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [showSettings, setShowSettings] = useState(false);
  const [showMiniWidget, setShowMiniWidget] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const timerRef = useRef<HTMLDivElement>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    if (mode === "longBreak") updateMetrics("longBreaks", 1)
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


// Inside PomodoroTimer.tsx
useEffect(() => {
  const timeStr = formatTime(time);
  const status = mode === "focus" ? "Focus" : "Break";
  
  // Professional Tab Title: "14:59 | Focus"
  document.title = isActive ? `${timeStr} | ${status}` : "FocusFlow";

  // Cleanup: Reset title when component unmounts
  return () => {
    document.title = "FocusFlow";
  };
}, [time, mode, isActive]);




// 1. Add this useEffect to watch for setting changes
useEffect(() => {
  // This resets the time whenever the user saves new settings
  // We check 'mode' to ensure we apply the correct duration (Focus vs Break)
  const newTime = settings[`${mode}Time`] * 60;
  setTime(newTime);
  
  // Optional: Stop the timer when settings change to prevent logic conflicts
  setIsActive(false); 
}, [settings, mode]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = Math.max(prevTime - 1, 0);
  
          // TRIGGER METRICS CALCULATION AT ZERO
          if (newTime === 0) {
            setIsActive(false); // Stop the timer
            
            // Logic to record the data based on the mode
            if (mode === "focus") {
              // Record a focus session
              updateMetrics("focusSessions", 1);
              // Add the minutes from settings to total focus time
              updateMetrics("totalFocusTime", settings.focusTime);
              
              // Update streaks (Logic inside your Context)
              updateMetrics("dailyStreak", metrics.dailyStreak + 1);
            } else if (mode === "shortBreak") {
              updateMetrics("shortBreaks", 1);
            } else if (mode === "longBreak") {
              updateMetrics("longBreaks", 1);
            }
            
            // Move to the next mode (handled by your nextMode/switchMode function)
            setTimeout(() => handleTimerComplete(), 100);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, time, mode, settings,metrics, updateMetrics, handleTimerComplete]);

  return (
    <>
    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-9 shadow-2xl relative overflow-hidden"   ref={timerRef}>
     

      <div className="relative flex flex-col items-center">
        {/* Mode Toggles */}
        <div className="flex bg-slate-800/50 p-1 rounded-2xl mb-6 border border-white/5">
          {(["focus", "shortBreak", "longBreak"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
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
                // initial={{ opacity: 0, y: 5 }}
                // animate={{ opacity: 1, y: 0 }}
                className="text-6xl font-light tracking-tighter text-white font-mono"
              >
                {formatTime(time)}
              </motion.div>
            </AnimatePresence>
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-2 flex items-center justify-center gap-2">
              {mode === 'focus' ? <Zap className="w-3 h-3 text-amber-500" /> : <Coffee className="w-3 h-3 text-blue-400" />}
              {mode}
            </p>
            <div className="absolute bottom-4 right-21  p-6 opacity-10">
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
     
      <audio ref={audioRef} src="/bell2.wav"  preload="auto"   />
    </div>
     <PomodoroMiniWidget
     time={time}
     mode={mode}
     isVisible={showMiniWidget}
     onClick={ scrollToTimer }
   />
   </>
  );
}