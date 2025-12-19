"use client";

import { motion } from "framer-motion";
import { Zap, Coffee, Timer } from "lucide-react";
import { useTimerContext } from "@/contexts/TimerContext";

interface PomodoroMiniWidgetProps {
  time: number;
  mode: "focus" | "shortBreak" | "longBreak";
  isVisible: boolean;
  onClick: () => void;
}

export function PomodoroMiniWidget({
  time,
  mode,
  isVisible,
  onClick,
}: PomodoroMiniWidgetProps) {
  const { settings } = useTimerContext();

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Dynamically calculate progress based on current settings
  const totalSeconds = settings[`${mode}Time`] * 60;
  const progress = 1 - time / totalSeconds;
  
  // Dynamic color palette
  const accentColor = mode === "focus" ? "rgb(99, 102, 241)" : "rgb(245, 158, 11)"; // Indigo vs Amber

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 100 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        scale: isVisible ? 1 : 0.8, 
        y: isVisible ? 0 : 100 
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`fixed bottom-6 right-6 z-[100] cursor-pointer group transform-gpu will-change-transform`}
      onClick={onClick}
    >
      <div className="relative w-20 h-20 bg-slate-900/80 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
        
        {/* Animated Progress Ring */}
        <svg className="absolute inset-0 transform -rotate-90 w-full h-full p-1">
          <circle
            cx="36"
            cy="36"
            r="34"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="3"
          />
          <motion.circle
            cx="36"
            cy="36"
            r="34"
            fill="none"
            stroke={accentColor}
            strokeWidth="3"
            strokeDasharray={2 * Math.PI * 34}
            animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - progress) }}
            strokeLinecap="round"
            className="transition-all duration-500 ease-linear"
          />
        </svg>

        {/* Content Area */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 mb-0.5">
            {mode === "focus" ? (
              <Zap className="w-3 h-3 text-indigo-400" />
            ) : (
              <Coffee className="w-3 h-3 text-amber-400" />
            )}
          </div>
          <span className="text-[13px] font-mono font-bold text-white tracking-tighter">
            {formatTime(time)}
          </span>
          
          {/* Subtle Hover Label */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Back to Timer
          </div>
        </div>
      </div>
    </motion.div>
  );
}