import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

export function KeyboardHelp({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const shortcuts = [
    { key: "Space", desc: "Start / Pause Timer" },
    { key: "R", desc: "Reset Timer" },
    { key: "S", desc: "Skip to Next Session" },
    { key: "N", desc: "Focus New Task Input" },
    { key: "?", desc: "Show / Hide this menu" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card relative w-full max-w-md rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Keyboard className="text-indigo-400" size={24} />
                <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {shortcuts.map((s) => (
                <div key={s.key} className="flex items-center justify-between group">
                  <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{s.desc}</span>
                  <kbd className="px-2 py-1 min-w-[2.5rem] text-center bg-slate-800 border border-white/10 rounded text-xs font-mono text-indigo-300 shadow-lg">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}