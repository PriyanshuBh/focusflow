"use client";

import React, { useState, useEffect } from "react";
import { usePlannerContext, TaskCategory, BlockCategory } from "@/contexts/PlannerContext";
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  Clock, 
  Layers, 
  Zap, 
  Repeat, 
  Sun,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export const TimeBlocker = React.memo(() => {
  const {
    tasks,
    timeBlocks,
    addTask,
    toggleTask,
    deleteTask,
    addTimeBlock,
    toggleTimeBlock,
    deleteTimeBlock,
    pushIncompleteToTomorrow,
  } = usePlannerContext();

  const [newTitle, setNewTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>("today");

  // Time block form state
  const [blockTitle, setBlockTitle] = useState("");
  const [blockStart, setBlockStart] = useState("09:00");
  const [blockEnd, setBlockEnd] = useState("10:00");
  const [blockType, setBlockType] = useState<BlockCategory>("deepWork");
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);

  // Current time line calculations
  const [currentTimeStr, setCurrentTimeStr] = useState("");
  
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const mins = now.getMinutes().toString().padStart(2, "0");
      setCurrentTimeStr(`${hours}:${mins}`);
    };
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      addTask(newTitle, selectedCategory);
      setNewTitle("");
    }
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (blockTitle.trim()) {
      addTimeBlock({
        title: blockTitle.trim(),
        startTime: blockStart,
        endTime: blockEnd,
        category: blockType,
      });
      setBlockTitle("");
      setShowAddBlockModal(false);
    }
  };

  // Calculate planned vs completed hours
  const calculatePlannedMinutes = () => {
    return timeBlocks.reduce((acc, b) => {
      const [sh, sm] = b.startTime.split(":").map(Number);
      const [eh, em] = b.endTime.split(":").map(Number);
      const dur = (eh * 60 + em) - (sh * 60 + sm);
      return acc + (dur > 0 ? dur : 0);
    }, 0);
  };

  const totalPlannedHours = (calculatePlannedMinutes() / 60).toFixed(1);

  const getCategoryBadge = (cat: TaskCategory) => {
    switch (cat) {
      case "routine": return { label: "Routine", bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: Repeat };
      case "quick": return { label: "Quick Win", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Zap };
      case "today": return { label: "Today Focus", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: Clock };
      case "later": return { label: "Someday", bg: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: Layers };
    }
  };

  const getBlockBadge = (cat: BlockCategory) => {
    switch (cat) {
      case "deepWork": return "border-l-4 border-l-indigo-500 bg-indigo-500/5";
      case "routine": return "border-l-4 border-l-purple-500 bg-purple-500/5";
      case "meeting": return "border-l-4 border-l-blue-500 bg-blue-500/5";
      case "break": return "border-l-4 border-l-emerald-500 bg-emerald-500/5";
    }
  };

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      {/* TIME-BLOCKING CANVAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" /> Daily Schedule Timeline
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-[11px] text-slate-400 font-mono hidden md:block">
              {currentTimeStr && <span>Now: <span className="text-emerald-400 font-bold mr-2">{currentTimeStr}</span>|</span>} Planned: <span className="text-indigo-400 font-bold">{totalPlannedHours}h</span>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddBlockModal(!showAddBlockModal)}
              className={`${showAddBlockModal ? "bg-slate-700 hover:bg-slate-600" : "bg-indigo-600 hover:bg-indigo-500"} text-white text-xs gap-2 rounded-xl shadow-lg w-[140px] justify-center transition-colors`}
            >
              {showAddBlockModal ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAddBlockModal ? "Cancel" : "Add Time Block"}
            </Button>
          </div>
        </div>

          {/* Time Blocks List (Modal inside to prevent layout shift) */}
          <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-3 space-y-2 h-[520px] overflow-y-auto no-scrollbar relative overflow-hidden">
            {/* Time Block Form Modal (Absolute Overlay) */}
            <AnimatePresence>
              {showAddBlockModal && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-2 left-2 right-2 z-30 bg-slate-800/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                    <h3 className="text-sm font-semibold text-white">Create New Time Block</h3>
                    <button onClick={() => setShowAddBlockModal(false)} className="text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddBlock} className="flex flex-col gap-3">
                    <Input
                      placeholder="Time Block Title (e.g. Deep Coding)"
                      value={blockTitle}
                      onChange={(e) => setBlockTitle(e.target.value)}
                      className="bg-slate-800/60 border-white/10 text-white placeholder:text-slate-500 text-xs w-full"
                      required
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={blockStart}
                        onChange={(e) => setBlockStart(e.target.value)}
                        className="bg-slate-800/60 border-white/10 text-white text-xs flex-1"
                      />
                      <span className="text-slate-500 text-xs">-</span>
                      <Input
                        type="time"
                        value={blockEnd}
                        onChange={(e) => setBlockEnd(e.target.value)}
                        className="bg-slate-800/60 border-white/10 text-white text-xs flex-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={blockType}
                        onChange={(e) => setBlockType(e.target.value as BlockCategory)}
                        className="bg-slate-800/60 border border-white/10 text-white text-xs rounded-xl px-2 py-2 flex-1 outline-none"
                      >
                        <option value="deepWork">Deep Work</option>
                        <option value="routine">Routine</option>
                        <option value="meeting">Meeting</option>
                        <option value="break">Break</option>
                      </select>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-xl px-6">
                        Save
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="popLayout">
              {timeBlocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-2">
                  <Clock className="w-8 h-8 opacity-40" />
                  <p className="text-xs font-medium">No time blocks scheduled yet for today.</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddBlockModal(true)}
                    className="text-indigo-400 hover:bg-indigo-500/10 text-xs"
                  >
                    Click to add your first block
                  </Button>
                </div>
              ) : (
                timeBlocks.map((block) => (
                  <motion.div
                    key={block.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border border-white/5 ${getBlockBadge(block.category)} hover:border-white/10 transition-all shadow-sm group gap-2`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <button onClick={() => toggleTimeBlock(block.id)} className="text-slate-500 hover:text-emerald-400 transition-colors shrink-0">
                        {block.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${block.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                          {block.title}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            {block.startTime} - {block.endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">


                      <button
                        onClick={() => deleteTimeBlock(block.id)}
                        className="text-slate-600 hover:text-red-400 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      {/* TASK BUCKETS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Task Buckets
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={pushIncompleteToTomorrow}
            title="Reset routines & push unfinished tasks to tomorrow"
            className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 gap-2 px-3 rounded-xl border border-amber-500/20 transition-all text-xs font-bold"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>End of Day Reset</span>
          </Button>
        </div>
          {/* Quick Add Task Form */}
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 bg-slate-900/40 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
            <Input
              placeholder="Add a new task..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-slate-800/50 border-white/5 text-slate-200 text-xs placeholder:text-slate-500 flex-1"
            />
            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TaskCategory)}
                className="bg-slate-800/50 border border-white/5 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none flex-1 sm:flex-none"
              >
              <option value="today">Today Focus</option>
              <option value="routine">Daily Routine</option>
              <option value="quick">Quick Win (&lt;15m)</option>
              <option value="later">Someday / Later</option>
              </select>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 rounded-xl">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </form>

          {/* 4 Task Buckets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["today", "routine", "quick", "later"] as TaskCategory[]).map((cat) => {
              const badge = getCategoryBadge(cat);
              const IconComp = badge.icon;
              const catTasks = tasks.filter((t) => t.category === cat);

              return (
                <div key={cat} className="bg-slate-900/30 border border-white/5 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl border ${badge.bg}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{badge.label}</h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-md border border-white/5">
                      {catTasks.length}
                    </span>
                  </div>

                  <div className="space-y-1.5 h-[145px] overflow-y-auto no-scrollbar pr-1">
                    {catTasks.length === 0 ? (
                      <div className="h-full flex items-center justify-center py-6 text-[11px] text-slate-600 italic">
                        Empty bucket
                      </div>
                    ) : (
                      catTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-white/5 hover:border-slate-700 transition-all text-xs group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <button onClick={() => toggleTask(task.id)} className="text-slate-500 hover:text-emerald-400">
                              {task.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                            <span className={`truncate font-medium ${task.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">

                            <button
                              onClick={() => deleteTask(task.id)}
                              title="Delete task"
                              className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </section>
  );
});

TimeBlocker.displayName = "TimeBlocker";
