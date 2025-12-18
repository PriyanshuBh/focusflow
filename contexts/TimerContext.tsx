"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface TimerSettings {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  cyclesBeforeLongBreak: number;
  breakType: "short" | "long";
  betaFeatures: {
    metrics: boolean;
  };
}

interface TimerMetrics {
  focusSessions: number;
  shortBreaks: number;
  longBreaks: number;
  totalFocusTime: number;
  totalBreakTime: number;
  lastUpdated: Date;
  dailyStreak: number;
  totalTasksCompleted: number;
  bestFocusStreak: number;
}

interface TimerContextType {
  settings: TimerSettings;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  metrics: TimerMetrics;
  updateMetrics: (type: keyof TimerMetrics, value: number) => void;
  resetMetrics: () => void;
}

export const defaultSettings: TimerSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  cyclesBeforeLongBreak: 4,
  breakType: "short",
  betaFeatures: {
    metrics: false,
  },
};

const defaultMetrics: TimerMetrics = {
  focusSessions: 0,
  shortBreaks: 0,
  longBreaks: 0,
  totalFocusTime: 0,
  totalBreakTime: 0,
  lastUpdated: new Date(),
  dailyStreak: 0,
  totalTasksCompleted: 0,
  bestFocusStreak: 0,
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [metrics, setMetrics] = useState<TimerMetrics>(defaultMetrics);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("timerSettings");
    const savedMetrics = localStorage.getItem("timerMetrics");

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (err) {
        console.error("Failed to parse timerSettings from localStorage", err);
      }
    }

    if (savedMetrics) {
      try {
        const parsed = JSON.parse(savedMetrics);
        parsed.lastUpdated = new Date(parsed.lastUpdated); // convert back to Date
        setMetrics(parsed);
      } catch (err) {
        console.error("Failed to parse timerMetrics from localStorage", err);
      }
    }

    setIsLoaded(true);
  }, []);

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("timerSettings", JSON.stringify(updated));
      return updated;
    });
  };

  const updateMetrics = (type: keyof TimerMetrics, value: number) => {
    setMetrics((prev) => {
      let updated = { ...prev };

      // Handle standard additive metrics (Focus sessions, time, breaks)
      if (
        type === "focusSessions" ||
        type === "totalFocusTime" ||
        type === "shortBreaks" ||
        type === "longBreaks" ||
        type === "totalTasksCompleted"
      ) {
        updated[type] = (prev[type] as number) + value;
      }

      // 🛡️ STREAK LOGIC: Triggered when a focus session is recorded
      if (type === "focusSessions" && value > 0) {

        const today = new Date();
        const lastDate = new Date(prev.lastUpdated);
        
        // Reset time parts to compare only the calendar date
        const isToday = today.toDateString() === lastDate.toDateString();
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = yesterday.toDateString() === lastDate.toDateString();

       // IF IT IS THE FIRST SESSION EVER (Streak is 0)
      if (prev.dailyStreak === 0) {
        updated.dailyStreak = 1;
      } 
      // IF IT IS A NEW DAY (Not today)
      else if (!isToday) {
        if (isYesterday) {
          updated.dailyStreak = prev.dailyStreak + 1; // Continued streak
        } else {
          updated.dailyStreak = 1; // Broke streak, starting over
        }
      }
        
        // Update Best Streak if current daily streak is higher
        if (updated.dailyStreak > prev.bestFocusStreak) {
          updated.bestFocusStreak = updated.dailyStreak;
        }
      }

      // Always update the timestamp
      updated.lastUpdated = new Date();

      localStorage.setItem("timerMetrics", JSON.stringify(updated));
      return updated;
    });
  };

  const resetMetrics = () => {
    localStorage.setItem("timerMetrics", JSON.stringify(defaultMetrics));
    setMetrics(defaultMetrics);
  };

  if (!isLoaded) return null; // Prevent hydration mismatch

  return (
    <TimerContext.Provider
      value={{ settings, updateSettings, metrics, updateMetrics, resetMetrics }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimerContext must be used within a TimerProvider");
  }
  return context;
}
