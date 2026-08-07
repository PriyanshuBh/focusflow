"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type TaskCategory = "routine" | "quick" | "today" | "later";
export type BlockCategory = "deepWork" | "routine" | "meeting" | "break";

export interface PlannerTask {
  id: string;
  title: string;
  category: TaskCategory;
  estimatedMinutes?: number;
  completed: boolean;
}

export interface TimeBlock {
  id: string;
  taskId?: string;
  title: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  category: BlockCategory;
  completed: boolean;
}

interface PlannerContextType {
  tasks: PlannerTask[];
  timeBlocks: TimeBlock[];
  activeTaskTitle: string | null;
  setActiveTaskTitle: (title: string | null) => void;
  addTask: (title: string, category: TaskCategory, estimatedMinutes?: number) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  moveTaskCategory: (id: string, category: TaskCategory) => void;
  addTimeBlock: (block: Omit<TimeBlock, "id" | "completed">) => void;
  toggleTimeBlock: (id: string) => void;
  deleteTimeBlock: (id: string) => void;
  clearCompleted: () => void;
  pushIncompleteToTomorrow: () => void;
}

const defaultTasks: PlannerTask[] = [
  { id: "1", title: "Morning Planning & Coffee", category: "routine", estimatedMinutes: 15, completed: false },
  { id: "2", title: "Core Feature Deep Work", category: "today", estimatedMinutes: 90, completed: false },
  { id: "3", title: "Reply to Urgent Emails", category: "quick", estimatedMinutes: 10, completed: false },
  { id: "4", title: "Research Web API Improvements", category: "later", estimatedMinutes: 60, completed: false },
];

const defaultBlocks: TimeBlock[] = [
  { id: "b1", title: "Morning Routine & Setup", startTime: "08:30", endTime: "09:00", category: "routine", completed: false },
  { id: "b2", title: "Deep Work: Main Project Focus", startTime: "09:00", endTime: "11:00", category: "deepWork", completed: false },
  { id: "b3", title: "Quick Email & Message Triage", startTime: "11:15", endTime: "11:45", category: "quick" as BlockCategory, completed: false },
];

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<PlannerTask[]>(defaultTasks);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(defaultBlocks);
  const [activeTaskTitle, setActiveTaskTitle] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem("focusflow_planner_tasks");
    const savedBlocks = localStorage.getItem("focusflow_planner_blocks");

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse planner tasks", e);
      }
    }

    if (savedBlocks) {
      try {
        setTimeBlocks(JSON.parse(savedBlocks));
      } catch (e) {
        console.error("Failed to parse planner blocks", e);
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("focusflow_planner_tasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("focusflow_planner_blocks", JSON.stringify(timeBlocks));
    }
  }, [timeBlocks, isLoaded]);

  const addTask = (title: string, category: TaskCategory, estimatedMinutes = 30) => {
    if (!title.trim()) return;
    const newTask: PlannerTask = {
      id: Date.now().toString(),
      title: title.trim(),
      category,
      estimatedMinutes,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const moveTaskCategory = (id: string, category: TaskCategory) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, category } : t))
    );
  };

  const addTimeBlock = (block: Omit<TimeBlock, "id" | "completed">) => {
    const newBlock: TimeBlock = {
      ...block,
      id: Date.now().toString(),
      completed: false,
    };
    setTimeBlocks((prev) => [...prev, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime)));
  };

  const toggleTimeBlock = (id: string) => {
    setTimeBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b))
    );
  };

  const deleteTimeBlock = (id: string) => {
    setTimeBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
    setTimeBlocks((prev) => prev.filter((b) => !b.completed));
  };

  const pushIncompleteToTomorrow = () => {
    // Move incomplete 'today' tasks to 'later' or reset routines
    setTasks((prev) =>
      prev.map((t) => {
        if (t.category === "routine") return { ...t, completed: false };
        if (!t.completed && t.category === "today") return { ...t, category: "later" };
        return t;
      })
    );
    setTimeBlocks((prev) => prev.map((b) => ({ ...b, completed: false })));
  };

  return (
    <PlannerContext.Provider
      value={{
        tasks,
        timeBlocks,
        activeTaskTitle,
        setActiveTaskTitle,
        addTask,
        toggleTask,
        deleteTask,
        moveTaskCategory,
        addTimeBlock,
        toggleTimeBlock,
        deleteTimeBlock,
        clearCompleted,
        pushIncompleteToTomorrow,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlannerContext() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error("usePlannerContext must be used within a PlannerProvider");
  }
  return context;
}
