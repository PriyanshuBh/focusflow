"use client";

import PomodoroTimer from "@/components/PomodoroTimer";
import {KanbanBoard} from "@/components/KanbanBoard";
import { TimerProvider, useTimerContext } from "@/contexts/TimerContext";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { AtmosphereEngine } from "@/components/AtmosphereEngine";
import { YourMetrics } from "@/components/YourMetrics";

 function AppContent() {
  const { settings } = useTimerContext();
  return (
   <>
      <div className="min-h-screen bg-[#0a0c10] text-slate-200 selection:bg-indigo-500/30 ">
        {/* Subtle Background Glow */}
        
        <div className="fixed inset-0 overflow-hidden pointer-events-none mesh-gradient">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-10">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
                FOCUS<span className="text-indigo-500">FLOW</span>
              </h1>
              <p className="text-slate-500 text-sm">
                Elevate your deep work session.
              </p>
            </motion.div>

            <AtmosphereEngine />
          </header>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Timer Focus Zone */}
            <div className="lg:col-span-5 xl:col-span-4 ">
              <PomodoroTimer />
            </div>

            {/* Right: Task Management Zone */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              <KanbanBoard />
            </div>
           
          </div>
          {settings.betaFeatures.metrics && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="lg:col-span-12 mt-8"
              >
                <YourMetrics />
              </motion.div>
            )}
        </main>

        
      </div>
      <Footer />
      </>
  );
}

export default function Home() {
  return (
    <TimerProvider>
      <AppContent />
    </TimerProvider>
  );
}