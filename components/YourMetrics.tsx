"use client";

import React from "react";
import { useTimerContext } from "@/contexts/TimerContext";
import { motion } from "framer-motion";
import {
  Trophy,
  Clock,
  CheckCircle2,
  Zap,
  Timer,
  Coffee,
  Target,
  TrendingUp,
} from "lucide-react";

interface MetricItemProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
  delay?: number;
}

const MetricItem: React.FC<MetricItemProps> = ({
  label,
  value,
  icon,
  colorClass,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative group bg-slate-800/40 backdrop-blur-md border border-white/5 p-5 rounded-[2rem] overflow-hidden transition-all hover:border-white/10 hover:bg-slate-800/60"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl bg-white/5 ${colorClass} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <div className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-0.5">
          {label}
        </div>
        <div className=" text-sm sm:text-xl font-bold text-white tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </div>
    </div>
  </motion.div>
);

export const YourMetrics: React.FC = React.memo(() => {
  const { metrics } = useTimerContext();

  const calculateAverageFocusTime = () => {
    if (metrics.focusSessions === 0) return "0m";
    const average = Math.round(metrics.totalFocusTime / metrics.focusSessions);
    return `${average}m`;
  };

  // Daily goal progress (e.g., goal is 8 sessions)
  // const dailyGoal = 8;
  // const progress = Math.min((metrics.focusSessions / dailyGoal) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header & Goal Section */}
      <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-indigo-500" />
              Focus Analytics
            </h2>
            <p className="text-slate-500 text-sm mt-1">Real-time performance overview</p>
          </div>
          
          {/* <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-slate-400">Daily Intensity</span>
              <span className="text-indigo-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              />
            </div>
          </div> */}
{metrics.dailyStreak >= 0 && (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className=" p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3"
  >
    <div className="p-2 bg-indigo-500 rounded-lg">
      <Trophy className="w-4 h-4 text-white" />
    </div>
    <div>
      <p className="text-xs font-bold text-white uppercase tracking-tight">Focus Milestone</p>
      <p className="text-[11px] text-indigo-300">You&apos;ve maintained a {metrics.dailyStreak} day streak. Impressive consistency!</p>
    </div>
  </motion.div>
)}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricItem
            label="Focus Sessions"
            value={metrics.focusSessions}
            icon={<Target className="w-5 h-5" />}
            colorClass="text-blue-400"
            delay={0.1}
          />
          <MetricItem
            label="Focus Time"
            value={`${Math.round(metrics.totalFocusTime)}m`}
            icon={<Clock className="w-5 h-5" />}
            colorClass="text-emerald-400"
            delay={0.2}
          />
          <MetricItem
            label="Daily Streak"
            value={metrics.dailyStreak}
            icon={<Zap className="w-5 h-5" />}
            colorClass="text-amber-400"
            delay={0.3}
          />
          <MetricItem
            label="Done Tasks"
            value={metrics.totalTasksCompleted}
            icon={<CheckCircle2 className="w-5 h-5" />}
            colorClass="text-purple-400"
            delay={0.4}
          />
          <MetricItem
            label="Best Streak"
            value={metrics.bestFocusStreak}
            icon={<Trophy className="w-5 h-5" />}
            colorClass="text-red-400"
            delay={0.5}
          />
          <MetricItem
            label="Avg. Session"
            value={calculateAverageFocusTime()}
            icon={<Timer className="w-5 h-5" />}
            colorClass="text-indigo-400"
            delay={0.6}
          />
          <MetricItem
            label="Short Breaks"
            value={metrics.shortBreaks}
            icon={<Coffee className="w-5 h-5" />}
            colorClass="text-orange-400"
            delay={0.7}
          />
          <MetricItem
            label="Long Breaks"
            value={metrics.longBreaks}
            icon={<Zap className="w-5 h-5" />}
            colorClass="text-teal-400"
            delay={0.8}
          />
        </div>
      </div>
    </div>
  );
});
YourMetrics.displayName = 'YourMetrics';