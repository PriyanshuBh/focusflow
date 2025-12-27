"use client";

import { useState, useEffect } from "react";
import { Plus, GripVertical, Trash2,Eraser, CheckCircle2, Circle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTimerContext } from "@/contexts/TimerContext";
import React from "react";

interface Task {
  id: string;
  title: string;
  status: "To Do" | "In Progress" | "Done";
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Generate project idea",
    status: "To Do",
  },
  {
    id: "2",
    title: "Develop project",
    status: "In Progress",
  },
  {
    id: "3",
    title: "Deploy project",
    status: "Done",
  },
];

export const KanbanBoard=React.memo(()=> {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { updateMetrics } = useTimerContext();

  useEffect(() => {
    setIsClient(true);
    const savedTasks = localStorage.getItem("focusflow_tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    if (isClient) localStorage.setItem("focusflow_tasks", JSON.stringify(tasks));
  }, [tasks, isClient]);

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newTaskTitle.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now().toString(), title: newTaskTitle, status: "To Do" },
      ]);
      setNewTaskTitle("");
    }
  };

  // NEW: Function to clear the entire board
  const removeAllTasks = () => {
    if (tasks.length === 0) return;
    
    // Professional touch: Confirmation check
    const confirmed = window.confirm("Are you sure you want to clear all tasks? This action cannot be undone.");
    
    if (confirmed) {
      setTasks([]);
      localStorage.removeItem("focusflow_tasks");
    }
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const columns: Array<"To Do" | "In Progress" | "Done"> = ["To Do", "In Progress", "Done"];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Done": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "In Progress": return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Circle className="w-4 h-4 text-slate-500" />;
    }
  };

  // Drag and Drop Logic
  const onDragStart = (task: Task) => setDraggedTask(task);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    if (!draggedTask) return;

 // Logic: Only increment if moving TO Done from a different status
 if (status === "Done" && draggedTask.status !== "Done") {
  updateMetrics("totalTasksCompleted", 1);
}
// Optional: Decrement if moving OUT of Done
else if (status !== "Done" && draggedTask.status === "Done") {
  updateMetrics("totalTasksCompleted", -1);
}
    const updatedTasks = tasks.map(t => 
      t.id === draggedTask.id ? { ...t, status } : t
    );
    setTasks(updatedTasks);
    setDraggedTask(null);
  };

  if (!isClient) return <div className="min-h-[400px] animate-pulse bg-slate-900/20 rounded-3xl" />;

  return (
    <section className="space-y-8 ">
      {/* Search & Add Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        <form onSubmit={addTask} className="flex gap-2 w-full max-w-md">
          <Input
            placeholder="Focus on a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="bg-slate-800/50 border-white/5 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500/50"
          />
          <Button onClick={addTask} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4 mr-2" /> Add
          </Button>
        </form>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block border-r border-white/10 pr-4">
            {tasks.filter(t => t.status === "Done").length} / {tasks.length} Completed
          </div>
        {/* NEW: Reset Button */}
        <Button
            variant="ghost"
            size="sm"
            onClick={removeAllTasks}
            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 gap-2 px-3 rounded-xl transition-all"
          >
            <Eraser className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-tighter">Clear Board</span>
          </Button>
      </div>
    </div>
      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6  ">
        {columns.map((column) => (
          <div key={column} className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2 relative">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                {column}
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </h3>
              <span className="bg-slate-800/50 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-white/5">
                {tasks.filter((t) => t.status === column).length}
              </span>
            </div>

            <div
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, column)}
              className="bg-slate-900/30 border border-white/5 rounded-3xl p-3  sm:min-h-[450px] transition-all hover:bg-slate-900/50 hover:border-indigo-500/20 relative"
            >
              <AnimatePresence mode="popLayout">
                {tasks
                  .filter((task) => task.status === column)
                  .map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      draggable
                      onDragStart={() => onDragStart(task)}
                      className="group relative bg-slate-800/40 border border-white/5 p-4 rounded-2xl mb-3 cursor-grab active:cursor-grabbing hover:border-slate-600 transition-all shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <GripVertical className="w-4 h-4 text-slate-600 mt-0.5 shrink-0 group-hover:text-slate-400 transition-colors" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.status === "Done" ? "line-through text-slate-500" : "text-slate-200"}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            {getStatusIcon(task.status)}
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                              {task.status}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTask(task.id)}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
              
              {tasks.filter((t) => t.status === column).length === 0 && (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl py-12">
                  <p className="text-xs text-slate-500 font-medium italic">Empty</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
})

KanbanBoard.displayName = 'KanbanBoard';