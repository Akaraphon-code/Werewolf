
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LobbyScreen from './components/LobbyScreen';
import RoleCard from './components/RoleCard';
import HostDashboard from './components/HostDashboard';
import VotingScreen from './components/VotingScreen';
import GameOverScreen from './components/GameOverScreen'; 
import Button from './components/Button';
import { GamePhase, RoleType, ActionType } from './types';
import { ArrowLeft, Skull, Crown, FlaskConical, Link2, LogOut, Target, Check, Zap, Volume2, VolumeX } from 'lucide-react';
import { useGame } from './context/GameContext';
import { useSound } from './context/SoundContext';

const Particles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-purple-500/20 rounded-full blur-xl"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.3,
          }}
          animate={{
            y: [null, Math.random() * -100],
            opacity: [null, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const { state, createRoom, joinRoom, performAction, resetGame, leaveRoom } = useGame();
  const { playBGM, playSFX, toggleMute, isMuted } = useSound();
  
  // Local state for Witch Action Mode (Heal vs Poison)
  const [witchMode, setWitchMode] = useState<ActionType.HEAL | ActionType.POISON>(ActionType.POISON);
  
  // UX: Local selection state for visual feedback
  const [localSelection, setLocalSelection] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const me = state.players.find(p => p.id === state.playerId);

  // Sound Integration: BGM Phase Management
  useEffect(() => {
    if (state.phase) {
      playBGM(state.phase);
    }
  }, [state.phase, playBGM]);

  // Sound Integration: Game Over SFX
  useEffect(() => {
    if (state.phase === GamePhase.GAME_OVER) {
      playSFX('WIN');
    }
  }, [state.phase, playSFX]);

  // Reset selection when phase changes or witch mode changes
  useEffect(() => {
    if (state.phase !== GamePhase.NIGHT) {
      setLocalSelection(null);
      setShowConfirmation(false);
    }
  }, [state.phase]);

  useEffect(() => {
    // When switching potions, reset selection to avoid confusion
    if (me?.role.type === RoleType.WITCH) {
      setLocalSelection(null);
    }
  }, [witchMode, me?.role.type]);

  const handleJoinGame = async (name: string, code: string) => {
    playSFX('CLICK');
    if (code === "NEW") {
       await createRoom(name);
    } else {
       await joinRoom(code, name);
    }
  };

  const handleAction = (targetId: string) => {
      playSFX('CLICK');
      // 1. Update Local Visual State immediately
      setLocalSelection(targetId);

      // 2. Perform Game Logic
      if (me?.role.type === RoleType.WITCH) {
        performAction(targetId, witchMode);
      } else {
        performAction(targetId);
      }

      // 3. Trigger Success Animation
      setShowConfirmation(true);
      // Hide toast after 2 seconds
      setTimeout(() => setShowConfirmation(false), 2000);
  };

  const getPhaseMessage = () => {
    if (state.phase === GamePhase.GAME_OVER) {
      if (state.winner === 'Jester') return 'ตัวตลกเป็นฝ่ายชนะ!';
      return state.winner === 'Good' ? 'ฝ่ายชาวบ้านชนะ!' : 'ฝ่ายหมาป่าชนะ!';
    }
    if (state.phase === GamePhase.LOBBY) return "Waiting for host...";
    if (state.phase === GamePhase.NIGHT) return "Night Phase (กลางคืน)";
    if (state.phase === GamePhase.DAY) return "Day Phase (กลางวัน)";
    if (state.phase === GamePhase.VOTING) return "Voting Phase (โหวตประหาร)";
    return "Loading...";
  };

  // Helper to determine if action is allowed
  const canAct = () => {
    if (!me?.isAlive || state.phase !== GamePhase.NIGHT) return false;
    
    // Check if ability already used (Persistent check)
    if (me.hasUsedAbility && me.role.type !== RoleType.WEREWOLF && me.role.type !== RoleType.WOLF_CUB) return false;

    if (me.role.type === RoleType.VILLAGER || me.role.type === RoleType.MASON || me.role.type === RoleType.INSOMNIAC || me.role.type === RoleType.MINION) return false;
    
    // One-time Night 1 Roles checks
    if (me.role.type === RoleType.DIRE_WOLF && me.attributes?.linkedPartnerId) return false;
    if (me.role.type === RoleType.CHANGELING && me.attributes?.changelingTargetId) return false;
    
    return true;
  };

  // Determine accent color for selection based on role/action
  const getActionColor = () => {
    if (me?.role.type === RoleType.WEREWOLF || me?.role.type === RoleType.SERIAL_KILLER) return 'red';
    if (me?.role.type === RoleType.WITCH && witchMode === ActionType.POISON) return 'red';
    if (me?.role.type === RoleType.WITCH && witchMode === ActionType.HEAL) return 'green';
    return 'purple';
  };

  const actionColor = getActionColor();

  // --- HOST VIEW ---
  if (state.isHost) {
      if (state.phase === GamePhase.GAME_OVER) {
          return (
             <div className="min-h-screen w-full bg-slate-900 text-slate-200">
               <GameOverScreen 
                 winner={state.winner || null} 
                 players={state.players} 
                 onReset={resetGame} 
                 isHost={true} 
               />
             </div>
          );
      }
      return <HostDashboard />;
  }

  // --- PLAYER VIEW ---
  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden font-header text-slate-200">
      <Particles />
      
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none z-0" />
      
      {/* Global Mute Button */}
      <button 
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 backdrop-blur-md shadow-lg border border-slate-700 transition-all"
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      <AnimatePresence mode="wait">
        {!state.roomCode && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            className="absolute inset-0 z-10 overflow-y-auto"
          >
            <LobbyScreen onJoin={handleJoinGame} />
          </motion.div>
        )}

        {state.roomCode && me && (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6"
          >
            {/* GAME OVER SCREEN FOR PLAYERS */}
            {state.phase === GamePhase.GAME_OVER ? (
               <GameOverScreen 
                 winner={state.winner || null} 
                 players={state.players} 
                 onReset={() => {}} 
                 isHost={false} 
               />
            ) : (
                <div className="w-full max-w-md mx-auto h-full flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4 pt-4 pr-12">
                    <Button 
                      variant="ghost"
                      className="!w-auto !py-2 !px-3"
                      onClick={() => {
                        playSFX('CLICK');
                        leaveRoom();
                      }}
                    >
                      <LogOut className="w-6 h-6" />
                      <span className="sr-only">Leave Room</span>
                    </Button>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 uppercase tracking-widest font-header">Room Code</div>
                      <div className="text-purple-400 font-mono font-bold tracking-widest text-xl">{state.roomCode}</div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  {!me.isAlive && (
                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg text-center mb-4 flex items-center justify-center gap-2 font-header animate-pulse">
                      <Skull className="w-5 h-5" />
                      <span className="font-bold">เสียชีวิต (DEAD)</span>
                    </div>
                  )}

                  {/* Lobby Wait */}
                  {state.phase === GamePhase.LOBBY && (
                      <div className="flex-grow flex flex-col items-center justify-center">
                          <h2 className="text-3xl font-display mb-4 font-header text-purple-400">Lobby (ห้องรอ)</h2>
                          <div className="space-y-2 w-full">
                              {state.players.map(p => (
                                  <div key={p.id} className="p-3 bg-slate-800/50 rounded-lg flex items-center gap-3 border border-white/5 font-header">
                                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                          {p.name.charAt(0)}
                                      </div>
                                      <span className="flex-grow">{p.name}</span>
                                      {p.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
                                  </div>
                              ))}
                          </div>
                          <p className="mt-8 text-slate-500 animate-pulse font-header">รอโฮสต์เริ่มเกม...</p>
                      </div>
                  )}

                  {/* MAIN GAME PHASES */}
                  {state.phase !== GamePhase.LOBBY && (
                    <>
                      {/* Voting Phase: Show Voting Screen */}
                      {state.phase === GamePhase.VOTING && me.isAlive ? (
                        <VotingScreen />
                      ) : (
                        /* Default/Night Phase: Show Role Card & Actions */
                        <div className="flex-grow flex flex-col items-center justify-center relative">
                          
                          {/* Role Card Container - Hide if Night Phase and Can Act to show controls better */}
                          <div className={`flex-grow flex items-center justify-center py-4 perspective-container w-full transition-all duration-500 ${state.phase === GamePhase.NIGHT && canAct() ? 'scale-90 opacity-80' : 'scale-100 opacity-100'}`}>
                            <RoleCard role={me.role} />
                          </div>
                          
                          {/* Private Results / Messages */}
                          {me.privateResult && state.phase === GamePhase.DAY && (
                             <motion.div 
                               initial={{ y: 20, opacity: 0 }}
                               animate={{ y: 0, opacity: 1 }}
                               className="mb-4 w-full bg-purple-900/20 border border-purple-500/50 p-4 rounded-xl text-sm text-purple-200 text-center font-header shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                             >
                                <div className="flex justify-center mb-2">
                                  <Zap className="w-5 h-5 text-purple-400" />
                                </div>
                                {me.privateResult}
                             </motion.div>
                          )}

                          {/* Night Actions Panel */}
                          {state.phase === GamePhase.NIGHT && (
                              <div className="w-full relative z-20">
                                  
                                  {/* 1. Ability Used State */}
                                  {me.hasUsedAbility && me.role.type !== RoleType.WEREWOLF && (
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center backdrop-blur-md"
                                    >
                                      <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                      <p className="text-slate-300 font-bold">ใช้ความสามารถแล้ว</p>
                                      <p className="text-slate-500 text-xs mt-1">รอผลลัพธ์ในตอนเช้า</p>
                                    </motion.div>
                                  )}

                                  {/* 2. Active Ability Controls */}
                                  {canAct() && (
                                    <motion.div 
                                      className="mb-4 w-full"
                                      initial={{ y: 50, opacity: 0 }}
                                      animate={{ y: 0, opacity: 1 }}
                                      transition={{ type: "spring", bounce: 0.3 }}
                                    >
                                        {/* Special Controls for Witch */}
                                        {me.role.type === RoleType.WITCH && (
                                          <div className="flex gap-3 mb-4 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                                            <button 
                                              onClick={() => {
                                                playSFX('CLICK');
                                                setWitchMode(ActionType.POISON);
                                              }}
                                              disabled={!me.attributes?.hasPoisonPotion}
                                              className={`flex-1 py-3 text-xs font-bold uppercase rounded-lg transition-all flex flex-col items-center gap-1 ${
                                                witchMode === ActionType.POISON 
                                                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] scale-105' 
                                                : 'text-slate-500 hover:text-red-400'
                                              } disabled:opacity-30 disabled:cursor-not-allowed`}
                                            >
                                              <Skull className="w-4 h-4" />
                                              Poison (ฆ่า)
                                            </button>
                                            <button 
                                              onClick={() => {
                                                playSFX('CLICK');
                                                setWitchMode(ActionType.HEAL);
                                              }}
                                              disabled={!me.attributes?.hasHealPotion}
                                              className={`flex-1 py-3 text-xs font-bold uppercase rounded-lg transition-all flex flex-col items-center gap-1 ${
                                                witchMode === ActionType.HEAL 
                                                ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)] scale-105' 
                                                : 'text-slate-500 hover:text-green-400'
                                              } disabled:opacity-30 disabled:cursor-not-allowed`}
                                            >
                                              <FlaskConical className="w-4 h-4" />
                                              Heal (ชุบ)
                                            </button>
                                          </div>
                                        )}

                                        <div className="flex items-center gap-2 mb-3 justify-center">
                                            <div className={`p-1.5 rounded-full bg-${actionColor}-500/20`}>
                                              {me.role.type === RoleType.WITCH ? (
                                                <FlaskConical className={`w-4 h-4 text-${actionColor}-500`} />
                                              ) : (
                                                <Target className={`w-4 h-4 text-${actionColor}-500`} />
                                              )}
                                            </div>
                                            
                                            <p className={`text-center text-sm font-bold uppercase tracking-wider font-header text-${actionColor}-400`}>
                                              {me.role.type === RoleType.DIRE_WOLF ? "เลือกคู่หู (Select Partner)" : 
                                              me.role.type === RoleType.CHANGELING ? "เลือกเหยื่อสวมรอย" : 
                                              "เลือกเป้าหมาย (Select Target)"}
                                            </p>
                                        </div>

                                        {/* Target Grid */}
                                        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                                            {state.players.filter(p => p.id !== me.id && p.isAlive).map(p => {
                                              const isSelected = localSelection === p.id;
                                              return (
                                                <motion.button 
                                                    key={p.id}
                                                    onClick={() => handleAction(p.id)}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    animate={{ 
                                                      scale: isSelected ? 1.05 : 1,
                                                      borderColor: isSelected 
                                                        ? (actionColor === 'red' ? '#ef4444' : actionColor === 'green' ? '#22c55e' : '#a855f7') 
                                                        : 'rgba(51, 65, 85, 0.5)' 
                                                    }}
                                                    className={`relative p-3 rounded-xl text-sm transition-all font-header border overflow-hidden ${
                                                      isSelected 
                                                        ? `bg-${actionColor}-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white font-bold` 
                                                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                                                    }`}
                                                >
                                                    {/* Selection Indicator */}
                                                    {isSelected && (
                                                      <motion.div 
                                                        layoutId="selection-glow"
                                                        className={`absolute inset-0 bg-${actionColor}-500/10 z-0`} 
                                                      />
                                                    )}
                                                    
                                                    <div className="relative z-10 flex items-center justify-between">
                                                      <span>{p.name}</span>
                                                      {isSelected && <Check className={`w-4 h-4 text-${actionColor}-400`} />}
                                                    </div>
                                                </motion.button>
                                              );
                                            })}
                                        </div>
                                    </motion.div>
                                  )}
                              </div>
                          )}
                          
                          {/* Messages for Night 1 roles that are done */}
                          {state.phase === GamePhase.NIGHT && me.isAlive && 
                             (me.role.type === RoleType.DIRE_WOLF && me.attributes?.linkedPartnerId) && (
                             <div className="text-center text-xs text-slate-500 mt-2 font-header bg-slate-900/50 p-2 rounded-lg">
                               พันธะสัญญาเสร็จสมบูรณ์
                             </div>
                          )}
                        </div>
                      )}

                      {/* Game Log */}
                      <div className="h-24 overflow-y-auto glass-panel rounded-lg p-2 mb-4 text-xs font-mono text-slate-400">
                        {state.log.map((entry, i) => (
                          <div key={i} className="mb-1 border-b border-white/5 pb-1">{entry}</div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="mt-2 mb-6 space-y-4">
                        <div className="text-center mb-4">
                          <p className="text-slate-400 text-sm animate-pulse font-header tracking-widest uppercase">
                            {getPhaseMessage()}
                          </p>
                        </div>
                        
                        <div className="flex justify-center gap-2 mt-4">
                          <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${state.phase === GamePhase.NIGHT ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-slate-700'}`} />
                          <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${state.phase === GamePhase.DAY ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-slate-700'}`} />
                          <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${state.phase === GamePhase.VOTING ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-slate-700'}`} />
                        </div>
                      </div>
                    </>
                  )}
                  
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS CONFIRMATION TOAST */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none"
          >
            <div className="bg-slate-900/90 border border-green-500/50 text-green-400 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] backdrop-blur-xl flex items-center gap-3">
              <div className="bg-green-500/20 p-1 rounded-full">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-bold font-header tracking-wide uppercase text-sm">Action Recorded</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
