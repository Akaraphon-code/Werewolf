
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LobbyScreen from './components/LobbyScreen';
import RoleCard from './components/RoleCard';
import HostDashboard from './components/HostDashboard';
import Button from './components/Button';
import { GamePhase, RoleType } from './types';
import { ArrowLeft, Skull, Crown } from 'lucide-react';
import { useGame } from './context/GameContext';

// Background Particles Component
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
  const { state, createRoom, joinRoom, startGame, performAction, advancePhase } = useGame();
  
  // Local state for UI flow
  const me = state.players.find(p => p.id === state.playerId);

  const handleJoinGame = async (name: string, code: string) => {
    // Determine if creating or joining based on logic (simplified for UI)
    // For this demo, let's assume if code is "NEW", we create.
    if (code === "NEW") {
       await createRoom(name);
    } else {
       await joinRoom(code, name);
    }
  };

  const handleAction = (targetId: string) => {
      performAction(targetId);
  };

  const getPhaseMessage = () => {
    if (state.phase === GamePhase.GAME_OVER) {
      return state.winner === 'Good' ? 'The Village Survives!' : 'The Werewolves Feast!';
    }
    if (state.phase === GamePhase.LOBBY) return "Waiting for Host to start...";
    if (state.phase === GamePhase.NIGHT) return "It is Night. Silence falls.";
    if (state.phase === GamePhase.DAY) return "Day breaks. Who is guilty?";
    return "Loading...";
  };

  // --- HOST VIEW ---
  if (state.isHost) {
      return <HostDashboard />;
  }

  // --- PLAYER VIEW ---
  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden font-sans text-slate-200">
      <Particles />
      
      {/* Decorative Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none z-0" />

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
            <div className="w-full max-w-md mx-auto h-full flex flex-col">
              
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pt-4">
                <Button 
                  variant="ghost"
                  className="!w-auto !py-2 !px-3"
                  onClick={() => window.location.reload()}
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase tracking-widest">Room</div>
                  <div className="text-purple-400 font-mono font-bold tracking-widest text-xl">{state.roomCode}</div>
                </div>
              </div>

              {/* Status Banner */}
               {!me.isAlive && (
                <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg text-center mb-4 flex items-center justify-center gap-2">
                  <Skull className="w-5 h-5" />
                  <span className="font-display font-bold">YOU ARE DEAD</span>
                </div>
              )}

              {state.phase === GamePhase.LOBBY && (
                  <div className="flex-grow flex flex-col items-center justify-center">
                      <h2 className="text-2xl font-display mb-4">Lobby</h2>
                      <div className="space-y-2 w-full">
                          {state.players.map(p => (
                              <div key={p.id} className="p-3 bg-slate-800/50 rounded-lg flex items-center gap-3 border border-white/5">
                                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                      {p.name.charAt(0)}
                                  </div>
                                  <span className="flex-grow">{p.name}</span>
                                  {p.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
                              </div>
                          ))}
                      </div>
                      <p className="mt-8 text-slate-500 animate-pulse">Waiting for host to start...</p>
                  </div>
              )}

              {state.phase !== GamePhase.LOBBY && (
                <>
                  {/* Main Content Area */}
                  <div className="flex-grow flex items-center justify-center py-4 perspective-container">
                    <RoleCard role={me.role} />
                  </div>

                  {/* Action Targets (If Night) */}
                  {state.phase === GamePhase.NIGHT && me.isAlive && me.role.type !== RoleType.VILLAGER && (
                       <div className="mb-4 w-full">
                           <p className="text-center text-sm mb-2 text-purple-400">Select Target:</p>
                           <div className="grid grid-cols-2 gap-2">
                               {state.players.filter(p => p.id !== me.id && p.isAlive).map(p => (
                                   <button 
                                      key={p.id}
                                      onClick={() => handleAction(p.id)}
                                      className="p-2 bg-slate-800 hover:bg-purple-900/50 border border-slate-700 rounded text-xs transition-colors"
                                   >
                                       {p.name}
                                   </button>
                               ))}
                           </div>
                       </div>
                  )}

                  {/* Game Log (Small) */}
                  <div className="h-24 overflow-y-auto glass-panel rounded-lg p-2 mb-4 text-xs font-mono text-slate-400">
                    {state.log.map((entry, i) => (
                      <div key={i} className="mb-1 border-b border-white/5 pb-1">{entry}</div>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-2 mb-6 space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-slate-400 text-sm animate-pulse font-display tracking-widest uppercase">
                        {getPhaseMessage()}
                      </p>
                    </div>
                    
                    {/* Phase Indicator */}
                    <div className="flex justify-center gap-2 mt-4">
                      <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${state.phase === GamePhase.NIGHT ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-slate-700'}`} />
                      <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${state.phase === GamePhase.DAY ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-slate-700'}`} />
                    </div>
                  </div>
                </>
              )}
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
