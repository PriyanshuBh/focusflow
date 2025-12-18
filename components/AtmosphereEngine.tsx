"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Volume1, Wind, CloudRain, Trees, Focus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

const FOCUS_SOUNDS = [
  { id: "rain", name: "Deep Rain", icon: CloudRain, url: "https://orangefreesounds.com/wp-content/uploads/2023/06/Rain-storm-sound-effect.mp3" },
  { id: "forest", name: "Forest", icon: Trees, url: "https://orangefreesounds.com/wp-content/uploads/2025/02/Relaxing-spring-forest-sounds.mp3" },
  { id: "brown", name: "Brown Noise", icon: Wind, url: "https://www.orangefreesounds.com/wp-content/uploads/2018/12/Brown-noise-sleep.mp3" },
  { id: "focus", name: "Focus", icon: Focus, url: "https://orangefreesounds.com/wp-content/uploads/2025/07/Warm-relaxing-synthesizer-background-music-ambient-chillout-sound-for-meditation-and-focus.mp3" },
];

export function AtmosphereEngine() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState([50]);
  const [prevVolume, setPrevVolume] = useState([50]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const toggleMute = () => {
    if (volume[0] > 0) {
      setPrevVolume(volume);
      setVolume([0]);
    } else {
      setVolume(prevVolume);
    }
  };

  const toggleSound = (soundId: string, url: string) => {
    if (activeSound === soundId) {
      audioRef.current?.pause();
      setActiveSound(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.loop = true;
        audioRef.current.play();
      }
      setActiveSound(soundId);
    }
  };

  const getVolumeIcon = () => {
    const isPlaying = activeSound !== null && volume[0] > 0;
    if (volume[0] === 0) return <VolumeX className="w-4 h-4 text-red-400" />;
    if (volume[0] < 50) return <Volume1 className={`w-4 h-4 ${isPlaying ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} />;
    return <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} />;
  };

  return (
    <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl shadow-2xl">
      
      {/* Improved Volume Control Group */}
      <div className="flex items-center gap-3 px-3 border-r border-white/10 mr-1 group relative h-10">
        <button 
          onClick={toggleMute}
          className= " transition-transform active:scale-90 hover:opacity-80 shrink-0 "
        >
          {getVolumeIcon()}
        </button>
        
        <div className="relative flex items-center w-28 h-full">
          {/* Dynamic Percentage Label that moves with the circle */}
          <span 
            className="absolute -top-4 text-[10px] font-bold text-indigo-400 bg-slate-800 px-1.5 py-0.5 rounded border border-white/5 transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{ 
              left: `${volume[0]}%`, 
              transform: `translateX(-${volume[0]}%)` 
            }}
          >
            {volume[0]}%
          </span>

          <Slider 
            value={volume} 
            onValueChange={setVolume} 
            max={100} 
            step={1}
            /* Custom styling to ensure visibility of the line (track) */
            className="cursor-pointer  [&_.relative]:bg-slate-700/50 [&_[role=slider]]:border-indigo-500 [&_[role=slider]]:bg-white/90 [&_.bg-primary]:bg-indigo-500" 
          />
        </div>
      </div>

      <div className="flex gap-1">
        {FOCUS_SOUNDS.map((sound) => (
          <Button
            key={sound.id}
            variant="ghost"
            size="sm"
            onClick={() => toggleSound(sound.id, sound.url)}
            className={`relative flex items-center gap-2 rounded-xl h-9 px-4 transition-all ${
              activeSound === sound.id 
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)]" 
              : "text-slate-400 hover:bg-white/5 border border-transparent"
            }`}
          >
            <sound.icon className="w-4 h-4 z-10" />
            <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-widest z-10">
              {sound.name}
            </span>
          </Button>
        ))}
      </div>
      <audio ref={audioRef} preload="auto"/>
    </div>
  );
}