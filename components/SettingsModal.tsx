"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { defaultSettings, useTimerContext } from "@/contexts/TimerContext";
import { useState, useEffect } from "react";
import { VisuallyHidden } from "@/components/visually-hidden";
import { Switch } from "./ui/switch";
import { Settings2, Zap, Coffee, BarChart3 } from "lucide-react";


interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, updateSettings } = useTimerContext();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleReset = () => {
    // Reset the local state to initial defaults
    setLocalSettings(defaultSettings);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle asChild>
        <VisuallyHidden>FocusFlow Configuration</VisuallyHidden>
      </DialogTitle>
      <DialogContent className="max-w-md !bg-slate-900/90 backdrop-blur-2xl border-white/5 text-slate-100 p-0 rounded-[2rem] shadow-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-white/5 bg-white/5">
          <Settings2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-semibold tracking-tight">Configuration</h2>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[80vh]">
          {/* Timer Durations Section */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Durations (Minutes)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="focusTime" className="text-xs text-slate-400 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-500" /> Focus
                </Label>
                <Input
                  id="focusTime"
                  type="number"
                  value={localSettings.focusTime}
                  onChange={(e) => setLocalSettings({ ...localSettings, focusTime: Number(e.target.value) })}
                  className="bg-slate-800/50 border-white/5 text-slate-100 focus:ring-indigo-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortBreakTime" className="text-xs text-slate-400 flex items-center gap-2">
                  <Coffee className="w-3 h-3 text-blue-400" /> Short Break
                </Label>
                <Input
                  id="shortBreakTime"
                  type="number"
                  value={localSettings.shortBreakTime}
                  onChange={(e) => setLocalSettings({ ...localSettings, shortBreakTime: Number(e.target.value) })}
                  className="bg-slate-800/50 border-white/5 text-slate-100 focus:ring-indigo-500/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="longBreakTime" className="text-xs text-slate-400">Long Break Duration</Label>
              <Input
                id="longBreakTime"
                type="number"
                value={localSettings.longBreakTime}
                onChange={(e) => setLocalSettings({ ...localSettings, longBreakTime: Number(e.target.value) })}
                className="bg-slate-800/50 border-white/5 text-slate-100 focus:ring-indigo-500/50"
              />
            </div>
          </section>

          {/* Sequence Section */}
          <section className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Flow Sequence</h3>
            <div className="space-y-3">
              <Label className="text-xs text-slate-400">Default Break Type</Label>
              <RadioGroup
                value={localSettings.breakType}
                onValueChange={(value) => setLocalSettings({ ...localSettings, breakType: value as "short" | "long" })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short" id="short-break" className="border-slate-600 text-indigo-500" />
                  <Label htmlFor="short-break" className="text-sm cursor-pointer">Short</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="long" id="long-break" className="border-slate-600 text-indigo-500" />
                  <Label htmlFor="long-break" className="text-sm cursor-pointer">Long</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="cyclesBeforeLongBreak" className="text-xs text-slate-400">
                Sessions until Long Break
              </Label>
              <Input
                id="cyclesBeforeLongBreak"
                type="number"
                min="1"
                max="10"
                value={localSettings.cyclesBeforeLongBreak}
                onChange={(e) => setLocalSettings({ ...localSettings, cyclesBeforeLongBreak: Number(e.target.value) })}
                className="bg-slate-800/50 border-white/10 text-slate-100 focus:ring-indigo-500/50"
              />
            </div>
          </section>

          {/* Features Section */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Advanced</h3>
            <div className="flex items-center justify-between p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
              <div className="flex gap-3">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-slate-200">Productivity Metrics</label>
                  <p className="text-[10px] text-slate-500">Visual charts and daily streaks</p>
                </div>
              </div>
              <Switch
              className="bg-indigo-600 data-[state=checked]:bg-indigo-500"
                checked={localSettings.betaFeatures.metrics}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    betaFeatures: { ...localSettings.betaFeatures, metrics: checked },
                  })
                }
              />
            </div>
          </section>

          {/* Action Button */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
          <Button
              variant="ghost"
              onClick={handleReset}
              className="flex-1 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 border border-white/5 rounded-xl transition-all"
            >
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSave}
              className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}