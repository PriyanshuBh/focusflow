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
  isZenMode: boolean;
  setIsZenMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleZenMode: () => void;
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
  const [isZenMode, setIsZenMode] = useState(false);

  const toggleZenMode = () => {
    setIsZenMode((prev) => {
      const next = !prev;
      if (next) {
        if (typeof document !== "undefined" && document.documentElement.requestFullscreen && !document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return next;
    });
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsZenMode(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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

      if (
        type === "focusSessions" ||
        type === "totalFocusTime" ||
        type === "shortBreaks" ||
        type === "longBreaks" ||
        type === "totalTasksCompleted"
      ) {
        updated[type] = (prev[type] as number) + value;
      }

      if (type === "focusSessions" && value > 0) {
        const today = new Date();
        const lastDate = new Date(prev.lastUpdated);
        const isToday = today.toDateString() === lastDate.toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = yesterday.toDateString() === lastDate.toDateString();

        if (prev.dailyStreak === 0) {
          updated.dailyStreak = 1;
        } else if (!isToday) {
          if (isYesterday) {
            updated.dailyStreak = prev.dailyStreak + 1;
          } else {
            updated.dailyStreak = 1;
          }
        }

        if (updated.dailyStreak > prev.bestFocusStreak) {
          updated.bestFocusStreak = updated.dailyStreak;
        }
      }

      updated.lastUpdated = new Date();

      localStorage.setItem("timerMetrics", JSON.stringify(updated));
      return updated;
    });
  };

  const resetMetrics = () => {
    localStorage.setItem("timerMetrics", JSON.stringify(defaultMetrics));
    setMetrics(defaultMetrics);
  };

  return (
    <TimerContext.Provider
      value={{
        settings,
        updateSettings,
        metrics,
        updateMetrics,
        resetMetrics,
        isZenMode,
        setIsZenMode,
        toggleZenMode,
      }}
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
