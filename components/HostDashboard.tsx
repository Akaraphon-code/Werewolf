
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useSound } from '../context/SoundContext';
import { GamePhase, RoleType } from '../types';
import { Shield, Skull, Sword, Eye, Moon, Sun, HeartPulse, RefreshCw, Zap, Vote as VoteIcon, LogOut, CloudLightning, Music, Bell, Timer, Mic, Square, Play, Volume2, VolumeX } from 'lucide-react';
import Button from './Button';
import GameSetupModal from './GameSetupModal';

const HostDashboard: React.FC = () => {
  const { state, startGame, advancePhase, togglePlayerLife, leaveRoom, updateTimer } = useGame();
  const { playSFX, toggleMute, isMuted } = useSound();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  const players = state.hostPlayers && state.hostPlayers.length > 0 ? state.hostPlayers : state.players;

  // Sync Timer Display
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStartClick = () => {
    playSFX('CLICK');
    setIsSetupOpen(true);
  };

  const handleSetupConfirm = (selectedRoles: RoleType[]) => {
    playSFX('CLICK');
    startGame(selectedRoles);
    setIsSetupOpen(false);
  };

  const handlePhaseChange = () => {
      playSFX('CLICK');
      advancePhase();
  };

  // --- NARRATOR SCRIPT LOGIC ---
  const getNarratorScript = () => {
    const log = state.log || [];
    const lastLog = log[log.length - 1] || "";
    
    // Check for deaths in log to change tone
    const deathsFound = log.slice(-3).some(l => l.includes('เสียชีวิต') || l.includes('ตาย') || l.includes('สังหาร'));

    switch (state.phase) {
      case GamePhase.LOBBY:
        return {
          title: "The Gathering",
          text: "Welcome travelers... Wait for everyone to join, then begin the nightmare. (ยินดีต้อนรับเหล่านักเดินทาง... รอให้ครบคน แล้วเริ่มฝันร้ายได้เลย)",
          tone: "text-slate-400"
        };
      case GamePhase.NIGHT:
        return {
          title: "The Witching Hour",
          text: "The village sleeps... But evil never rests. Werewolves, wake up and choose your prey. (ชาวบ้านหลับใหล... แต่ปีศาจตื่นขึ้น หมาป่าจงลืมตาและเลือกเหยื่อ)",
          tone: "text-purple-400"
        };
      case GamePhase.DAY:
        if (deathsFound) {
           return {
             title: "A Tragic Morning",
             text: "A scream breaks the silence! Tragedy has struck the village. Look at the log to see who has fallen... (เสียงกรีดร้องดังขึ้น! ความตายมาเยือนหมู่บ้าน ดูบันทึกว่าใครคือผู้โชคร้าย)",
             tone: "text-red-400"
           };
        }
        return {
          title: "A Peaceful Morning?",
          text: "The sun rises. Miraculously, everyone survived the night. Discuss and find the beast among you! (พระอาทิตย์ขึ้น... ปาฏิหาริย์! ไม่มีใครตายในคืนนี้ จงหาตัวคนร้ายให้เจอ!)",
          tone: "text-yellow-400"
        };
      case GamePhase.VOTING:
        return {
          title: "Judgment Time",
          text: "The time for talk is over. The village must decide... Who will die today? Cast your judgment! (หมดเวลาเจรจา... หมู่บ้านต้องตัดสินใจ ใครจะต้องตายในวันนี้? พิพากษาซะ!)",
          tone: "text-red-500"
        };
      case GamePhase.GAME_OVER:
        return {
            title: "The End",
            text: state.winner === 'Good' ? "The light prevails! The beasts are slain. (แสงสว่างนำชัย! สัตว์ร้ายถูกกำจัดสิ้น)" : "Darkness consumes all... The village is lost. (ความมืดกลืนกิน... หมู่บ้านล่มสลาย)",
            tone: state.winner === 'Good' ? "text-blue-400" : "text-red-500"
        };
      default:
        return { title: "Unknown", text: "...", tone: "text-slate-400" };
    }
  };

  const script = getNarratorScript();

  // --- TIMER LOGIC ---
  const timeLeft = state.timerEnd ? Math.max(0, Math.ceil((state.timerEnd - currentTime) / 1000)) : 0;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const getRoleIcon = (type: RoleType) => {
    switch (type) {
      case RoleType.WEREWOLF: return <Moon className="w-4 h-4 text-red-500" />;
      case RoleType.SEER: return <Eye className="w-4 h-4 text-cyan-400" />;
      case RoleType.BODYGUARD: return <Shield className="w-4 h-4 text-green-400" />;
      case RoleType.SERIAL_KILLER: return <Sword className="w-4 h-4 text-purple-500" />;
      case RoleType.JESTER: return <RefreshCw className="w-4 h-4 text-pink-400" />;
      default: return <div className="w-4 h-4 rounded-full bg-slate-600" />;
    }
  };

  const getActionTargetName = (actorId: string) => {
    if (!state.actions) return '-';
    const action = state.actions.find(a => a.actorId === actorId);
    if (!action) return '-';
    const target = players.find(p => p.id === action.targetId);
    return target ? target.name : 'Unknown';
  };

  const getVoteCounts = () => {
    const counts: Record<string, number> = {};
    if (state.votes) {
      Object.values(state.votes).forEach((targetId) => {
        const id = targetId as string;
        counts[id] = (counts[id] || 0) + 1;
      });
    }
    return counts;
  };
  const voteCounts = getVoteCounts();
  const maxVotes = Math.max(0, ...Object.values(voteCounts));

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-header overflow-hidden selection:bg-purple-500/30">
      
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shadow-xl z-30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-purple-900/40 to-slate-900 text-purple-400 px-3 py-1 rounded border border-purple-500/30 text-xs font-mono font-bold tracking-widest">
            ROOM: {state.roomCode}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold tracking-widest uppercase ${
                state.phase === GamePhase.NIGHT ? 'text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]' : 
                state.phase === GamePhase.VOTING ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 
                state.phase === GamePhase.DAY ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'text-slate-400'
            }`}>
              {state.phase}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {/* Timer Display */}
            {state.timerEnd && (
                <div className={`font-mono text-xl font-bold px-3 py-1 rounded bg-slate-800 border ${timeLeft <= 10 ? 'text-red-500 border-red-500 animate-pulse' : 'text-white border-slate-600'}`}>
                    {formatTime(timeLeft)}
                </div>
            )}
            
            <button 
                onClick={toggleMute}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Mute Sounds"
            >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button 
                onClick={leaveRoom}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-grow overflow-hidden">
        
        {/* Left Column: Player Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            
            {/* NARRATOR SCRIPT CARD */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                key={state.phase}
                className="mb-8 relative rounded-xl border border-amber-600/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 px-4 py-1 rounded border border-amber-600/30 text-amber-500 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg">
                    <Mic className="w-3 h-3" /> Narrator Script
                </div>
                
                <h2 className={`text-xl font-display font-bold mb-2 ${script.tone} neon-text-purple`}>
                    {script.title}
                </h2>
                <p className="text-lg md:text-xl font-horror leading-relaxed text-slate-200">
                    "{script.text}"
                </p>
                
                {/* Decorative Corners */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-amber-600/50" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-amber-600/50" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-amber-600/50" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-amber-600/50" />
            </motion.div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
                {players.map(player => (
                <motion.div 
                    key={player.id}
                    layoutId={player.id}
                    className={`relative rounded-xl border p-3 transition-all group ${
                    player.isAlive 
                        ? 'bg-slate-800/40 border-slate-700/50 hover:border-slate-500' 
                        : 'bg-red-950/10 border-red-900/20 grayscale opacity-60'
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${
                        player.role.team.includes('Werewolf') || player.role.team.includes('Evil')
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}>
                        {player.name.charAt(0)}
                        </div>
                        <div>
                        <h3 className="font-bold text-slate-200 text-base">{player.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-bold">
                            {getRoleIcon(player.role.type)}
                            <span>{player.role.name}</span>
                        </div>
                        </div>
                    </div>
                    <button
                        onClick={() => togglePlayerLife(player.id, !player.isAlive)}
                        className={`p-1.5 rounded-lg transition-colors border ${
                        player.isAlive 
                            ? 'bg-green-500/5 text-green-500 border-green-500/20 hover:bg-green-500/20' 
                            : 'bg-red-500/5 text-red-500 border-red-500/20 hover:bg-red-500/20'
                        }`}
                        title={player.isAlive ? "Kill Player" : "Revive Player"}
                    >
                        {player.isAlive ? <HeartPulse className="w-4 h-4" /> : <Skull className="w-4 h-4" />}
                    </button>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center gap-2 mt-2">
                        {state.phase === GamePhase.NIGHT && (
                            <div className="flex-1 bg-slate-900/50 rounded px-2 py-1 text-xs border border-white/5 flex justify-between items-center">
                                <span className="text-slate-600">Action</span>
                                <span className="text-purple-300 font-mono truncate ml-2">
                                    {getActionTargetName(player.id)}
                                </span>
                            </div>
                        )}
                        {state.phase === GamePhase.VOTING && player.isAlive && (
                             <div className="bg-slate-900/50 rounded px-2 py-1 text-xs border border-white/5 text-slate-400 font-mono">
                                 {voteCounts[player.id] || 0} Votes
                             </div>
                        )}
                    </div>
                </motion.div>
                ))}
            </div>
        </div>

        {/* Right Column: Control Deck (Fixed width on desktop, bottom sheet on mobile) */}
        <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-20 shadow-2xl">
            
            {/* 1. Timer Controls */}
            <div className="p-4 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Timer className="w-4 h-4" /> Pressure Timer
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => { playSFX('CLICK'); updateTimer(60); }} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded border border-slate-700 active:scale-95 transition-all">
                        1 MIN
                    </button>
                    <button onClick={() => { playSFX('CLICK'); updateTimer(180); }} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded border border-slate-700 active:scale-95 transition-all">
                        3 MIN
                    </button>
                    <button onClick={() => { playSFX('CLICK'); updateTimer(null); }} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs font-bold py-2 rounded border border-red-900/30 active:scale-95 transition-all">
                        STOP
                    </button>
                </div>
            </div>

            {/* 2. SFX Soundboard */}
            <div className="p-4 border-b border-slate-800 flex-grow">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4" /> DJ Soundboard
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => playSFX('THUNDER')}
                        className="flex flex-col items-center justify-center p-3 bg-slate-800/50 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/50 rounded-xl transition-all group active:scale-95 active:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    >
                        <CloudLightning className="w-6 h-6 text-slate-400 group-hover:text-amber-400 mb-1" />
                        <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-amber-200">Thunder</span>
                    </button>
                    <button 
                         onClick={() => playSFX('HOWL')}
                        className="flex flex-col items-center justify-center p-3 bg-slate-800/50 hover:bg-purple-500/10 border border-slate-700 hover:border-purple-500/50 rounded-xl transition-all group active:scale-95 active:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    >
                        <Moon className="w-6 h-6 text-slate-400 group-hover:text-purple-400 mb-1" />
                        <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-purple-200">Howl</span>
                    </button>
                     <button 
                         onClick={() => playSFX('BELL')}
                        className="flex flex-col items-center justify-center p-3 bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/50 rounded-xl transition-all group active:scale-95 active:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    >
                        <Bell className="w-6 h-6 text-slate-400 group-hover:text-red-400 mb-1" />
                        <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-red-200">Bell</span>
                    </button>
                    <button 
                         onClick={() => playSFX('DRUM')}
                        className="flex flex-col items-center justify-center p-3 bg-slate-800/50 hover:bg-blue-500/10 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-all group active:scale-95 active:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    >
                        <div className="w-6 h-6 rounded-full border-2 border-slate-400 group-hover:border-blue-400 mb-1" />
                        <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-blue-200">Drumroll</span>
                    </button>
                </div>
            </div>

            {/* 3. Main Game Controls */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
                <div className="grid grid-cols-1 gap-3">
                     <Button 
                        variant="primary"
                        onClick={handlePhaseChange}
                        disabled={state.phase === GamePhase.LOBBY || state.phase === GamePhase.GAME_OVER}
                        className={
                            state.phase === GamePhase.NIGHT ? "!bg-yellow-600/20 !border-yellow-600/50 !text-yellow-500" :
                            state.phase === GamePhase.DAY ? "!bg-red-600/20 !border-red-600/50 !text-red-500" :
                            state.phase === GamePhase.VOTING ? "!bg-purple-600/20 !border-purple-600/50 !text-purple-500" : ""
                        }
                    >
                         <div className="flex items-center justify-center gap-2">
                             <Play className="w-4 h-4 fill-current" />
                             <span>
                                {state.phase === GamePhase.NIGHT ? "Morning" : 
                                 state.phase === GamePhase.DAY ? "Voting" : 
                                 state.phase === GamePhase.VOTING ? "Execute" : "Next Phase"}
                             </span>
                         </div>
                    </Button>
                    
                    {state.phase === GamePhase.LOBBY && (
                        <Button variant="secondary" onClick={handleStartClick}>
                            Start Game
                        </Button>
                    )}
                    
                     {state.phase === GamePhase.GAME_OVER && (
                        <Button variant="secondary" onClick={handleStartClick}>
                           New Game
                        </Button>
                    )}
                </div>
            </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isSetupOpen && (
          <GameSetupModal 
            playerCount={players.length}
            onConfirm={handleSetupConfirm}
            onCancel={() => setIsSetupOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HostDashboard;
