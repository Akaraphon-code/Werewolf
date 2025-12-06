
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Howl, Howler } from 'howler';
import { GamePhase } from '../types';

// Public CDN URLs for audio assets
const AUDIO_ASSETS = {
  BGM: {
    // Dark Ambience / Suspense
    LOBBY: 'https://firebasestorage.googleapis.com/v0/b/werewolf-2c523.firebasestorage.app/o/Sound%2F%E0%B8%8B%E0%B8%B2%E0%B8%A7%E0%B8%94%E0%B9%8C%E0%B8%A5%E0%B9%87%E0%B8%AD%E0%B8%9A%E0%B8%9A%E0%B8%B5%E0%B9%89.mp3?alt=media&token=3f36931f-3fc5-4d8d-a439-69c08d455f0c', 
    // Crickets and subtle wind
    NIGHT: 'https://firebasestorage.googleapis.com/v0/b/werewolf-2c523.firebasestorage.app/o/Sound%2F%E0%B8%8B%E0%B8%B2%E0%B8%A7%E0%B8%94%E0%B9%8C%E0%B8%95%E0%B8%AD%E0%B8%99%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B8%B7%E0%B8%99.mp3?alt=media&token=e391a014-8789-42f1-ac5f-f8c63cf478b7', 
    // Tense cinematic drone
    DAY: 'https://firebasestorage.googleapis.com/v0/b/werewolf-2c523.firebasestorage.app/o/Sound%2F%E0%B8%8B%E0%B8%B2%E0%B8%A7%E0%B8%94%E0%B9%8C%E0%B8%95%E0%B8%AD%E0%B8%99%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%87%E0%B8%A7%E0%B8%B1%E0%B8%99.mp3?alt=media&token=219cfd73-06e2-4dc4-8dde-eab530119ce2', 
    // Heartbeat / Time running out
    VOTING: 'https://firebasestorage.googleapis.com/v0/b/werewolf-2c523.firebasestorage.app/o/Sound%2F%E0%B8%8B%E0%B8%B2%E0%B8%A7%E0%B8%94%E0%B9%8C%E0%B8%95%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%AB%E0%B8%A7%E0%B8%95.mp3?alt=media&token=0c606b23-6518-4a35-b78c-93d73704df49', 
  },
  SFX: {
    CLICK: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_73685e839e.mp3', // Simple Click
    HOWL: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_a46b5e0766.mp3', // Wolf Howl
    KILL: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c29c8646b5.mp3', // Slash
    VOTE: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_16b8c4c795.mp3', // Impact
    WIN: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c153e1.mp3', // Fanfare
    THUNDER: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_c6ccf3232f.mp3', // Thunder
    BELL: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_00832bb578.mp3', // Church Bell
    DRUM: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_b333c5a610.mp3', // Drumroll
  }
};

type SFXKey = keyof typeof AUDIO_ASSETS.SFX;

interface SoundContextType {
  playBGM: (phase: GamePhase) => void;
  playSFX: (key: SFXKey) => void;
  toggleMute: () => void;
  isMuted: boolean;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  
  // Refs to manage Howl instances directly
  const currentBgmRef = useRef<Howl | null>(null);
  const fadingBgmRef = useRef<Howl | null>(null);
  const currentPhaseRef = useRef<GamePhase | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Global Volume
  useEffect(() => {
    Howler.volume(0.5);
    
    // Cleanup on unmount
    return () => {
      Howler.unload();
    };
  }, []);

  const toggleMute = () => {
    if (isMuted) {
      Howler.mute(false);
      setIsMuted(false);
    } else {
      Howler.mute(true);
      setIsMuted(true);
    }
  };

  const playSFX = (key: SFXKey) => {
    if (isMuted) return;
    const url = AUDIO_ASSETS.SFX[key];
    if (!url) return;

    // For SFX, we do NOT use html5: true to avoid the audio pool limit issue
    const sound = new Howl({
      src: [url],
      volume: 0.7,
      html5: false 
    });
    sound.play();
  };

  const playBGM = (phase: GamePhase) => {
    if (currentPhaseRef.current === phase) return;
    currentPhaseRef.current = phase;

    // Determine track
    let src = AUDIO_ASSETS.BGM.LOBBY;
    let volume = 0.3;

    switch (phase) {
      case GamePhase.NIGHT:
        src = AUDIO_ASSETS.BGM.NIGHT;
        volume = 0.4;
        break;
      case GamePhase.DAY:
        src = AUDIO_ASSETS.BGM.DAY;
        volume = 0.2;
        break;
      case GamePhase.VOTING:
        src = AUDIO_ASSETS.BGM.VOTING;
        volume = 0.3;
        break;
      case GamePhase.GAME_OVER:
        src = AUDIO_ASSETS.BGM.LOBBY;
        break;
      default:
        src = AUDIO_ASSETS.BGM.LOBBY;
    }

    // 1. Cleanup any previous pending fades immediately to free up Audio Pool
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
    if (fadingBgmRef.current) {
      fadingBgmRef.current.unload();
      fadingBgmRef.current = null;
    }

    // 2. Move current BGM to fading state
    if (currentBgmRef.current) {
      fadingBgmRef.current = currentBgmRef.current;
      const oldSound = fadingBgmRef.current;
      
      // Start fade out
      if (oldSound.playing()) {
         oldSound.fade(oldSound.volume(), 0, 1000);
         // Schedule unload
         fadeTimeoutRef.current = setTimeout(() => {
           oldSound.stop();
           oldSound.unload();
           if (fadingBgmRef.current === oldSound) {
             fadingBgmRef.current = null;
           }
         }, 1000);
      } else {
         oldSound.unload();
         fadingBgmRef.current = null;
      }
    }

    // 3. Create new BGM
    const newBgm = new Howl({
      src: [src],
      html5: true, // Keep true for streaming BGM
      loop: true,
      volume: 0, // Start silent
      onload: () => {
        // Only play if this is still the active BGM (prevent race conditions)
        if (currentBgmRef.current === newBgm) {
           newBgm.play();
           newBgm.fade(0, volume, 1500);
        } else {
           // If phase changed again while loading, unload this immediately
           newBgm.unload();
        }
      },
      onloaderror: () => {
        console.error("Failed to load BGM:", src);
      }
    });

    currentBgmRef.current = newBgm;
  };

  return (
    <SoundContext.Provider value={{ playBGM, playSFX, toggleMute, isMuted }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
