"use client";

import { useEffect, useState } from "react";
import { Download, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("PWA Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.error("PWA Service Worker registration failed:", err);
        });
    }

    // Monitor Online/Offline state
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Listen for PWA Install Prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if app is already running in standalone mode (desktop/mobile/iOS)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <>
      {/* Offline Status Badge */}
      {isOffline && (
        <div className="fixed top-4 right-4 z-[200] bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl text-amber-300 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 shadow-xl animate-pulse">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span>Offline Mode Active</span>
        </div>
      )}

      {/* PWA Install Button */}
      {installPrompt && !isInstalled && (
        <div className="fixed bottom-6 left-6 z-[90]">
          <Button
            onClick={handleInstallClick}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 border border-indigo-400/20 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Install FocusFlow App</span>
          </Button>
        </div>
      )}
    </>
  );
}
