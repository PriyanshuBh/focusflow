"use client";

import { useEffect } from "react";

export function useKeyboardControls(
  toggleTimer: () => void,
  resetTimer: () => void,
  skipSession: () => void,
  toggleHelp: () => void 
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. IMPORTANT: Don't trigger if user is typing in an input or textarea
      const activeElement = document.activeElement;
      const isTyping = 
        activeElement instanceof HTMLInputElement || 
        activeElement instanceof HTMLTextAreaElement;

      if (isTyping) return;

      // Handle the '?' key (Shift + /)
      if (event.key === "?" || event.code === "Slash" && event.shiftKey) {
        event.preventDefault();
        toggleHelp();
      }

      switch (event.code) {
        case "Space":
          event.preventDefault(); // Prevent page scrolling
          toggleTimer();
          break;
        case "KeyR":
          resetTimer();
          break;
        case "KeyS":
          skipSession();
          break;
        case "KeyN":
          // Focus the "New Task" input
          const taskInput = document.querySelector('input[placeholder*="Focus on"]') as HTMLInputElement;
          if (taskInput) {
            event.preventDefault();
            taskInput.focus();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTimer, resetTimer, skipSession]);
}

