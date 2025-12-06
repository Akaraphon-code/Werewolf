
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LobbyScreen from './components/LobbyScreen';
import RoleCard from './components/RoleCard';
import HostDashboard from './components/HostDashboard';
import VotingScreen from './components/VotingScreen';
import GameOverScreen from './components/GameOverScreen'; 
import Button from './components/Button';
import { GamePhase, RoleType, ActionType } from './types';
import { ArrowLeft, Skull, Crown, FlaskConical, Link2, LogOut } from 'lucide-react';
import { useGame } from './context/GameContext';

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
  
  // Local state for Witch Action Mode (Heal vs Poison)
  const [witchMode, setWitchMode] = useState<ActionType.HEAL | ActionType.POISON>(ActionType.POISON);

  const me = state.players.find(p => p.id === state.playerId);

  const handleJoinGame = async (name: string, code: string) => {
    if (code === "NEW") {
       await createRoom(name);
    } else {
       await joinRoom(code, name);
    }
  };

  const handleAction = (targetId: string) => {
      // Witch Custom Logic
      if (me?.role.type === RoleType.WITCH) {
        performAction(targetId, witchMode);
      } else {
        performAction(targetId);
      }
  };

  const getPhaseMessage = () => {
    if (state.phase === GamePhase.GAME_OVER) {
      if (state.winner === 'Jester') return 'The Madman Reigns! (ชัยชนะของตัวตลก)';
      return state.winner === 'Good' ? 'Light Prevails! (แสงสว่างขับไล่ความมืด)' : 'Eternal Darkness! (รัตติกาลนิรันดร์)';
    }
    if (state.phase === GamePhase.LOBBY) return "Awaiting the Coven...";
    if (state.phase === GamePhase.NIGHT) return "The Dead of Night (รัตติกาลอำมหิต)";
    if (state.phase === GamePhase.DAY) return "Daybreak Judgment (รุ่งสางแห่งการพิพากษา)";
    if (state.phase === GamePhase.VOTING) return "Execution Hour (ลานประหาร)";
    return "Loading...";
  };

  // Helper to determine if action is allowed
  const canAct = () => {
    if (!me?.isAlive || state.phase !== GamePhase.NIGHT) return false;
    if (me.role.type === RoleType.VILLAGER || me.role.type === RoleType.MASON || me.role.type === RoleType.INSOMNIAC || me.role.type === RoleType.MINION) return false;
    
    // One-time Night 1 Roles
    if (me.role.type === RoleType.DIRE_WOLF && me.attributes?.linkedPartnerId) return false;
    if (me.role.type === RoleType.CHANGELING && me.attributes?.changelingTargetId) return false;
    
    return true;
  };

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
                  <div className="flex justify-between items-center mb-6 pt-4">
                    <Button 
                      variant="ghost"
                      className="!w-auto !py-2 !px-3"
                      onClick={leaveRoom}
                    >
                      <LogOut className="w-6 h-6" />
                      <span className="sr-only">Leave Room</span>
                    </Button>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 uppercase tracking-widest font-header">Coven Code</div>
                      <div className="text-purple-400 font-mono font-bold tracking-widest text-xl">{state.roomCode}</div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  {!me.isAlive && (
                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg text-center mb-4 flex items-center justify-center gap-2 font-header">
                      <Skull className="w-5 h-5" />
                      <span className="font-bold">YOUR SOUL IS LOST (เสียชีวิต)</span>
                    </div>
                  )}

                  {/* Lobby Wait */}
                  {state.phase === GamePhase.LOBBY && (
                      <div className="flex-grow flex flex-col items-center justify-center">
                          <h2 className="text-3xl font-display mb-4 font-header text-purple-400">Gathering Shadows</h2>
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
                          <p className="mt-8 text-slate-500 animate-pulse font-header">Waiting for the ritual to begin...</p>
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
                        <div className="flex-grow flex flex-col items-center justify-center">
                          <div className="flex-grow flex items-center justify-center py-4 perspective-container w-full">
                            <RoleCard role={me.role} />
                          </div>
                          
                          {/* Private Results / Messages */}
                          {me.privateResult && state.phase === GamePhase.DAY && (
                             <div className="mb-4 w-full bg-purple-900/20 border border-purple-500/50 p-3 rounded text-sm text-purple-200 text-center font-header">
                                {me.privateResult}
                             </div>
                          )}

                          {/* Night Actions */}
                          {state.phase === GamePhase.NIGHT && canAct() && (
                              <div className="mb-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                                  
                                  {/* Special Controls for Witch */}
                                  {me.role.type === RoleType.WITCH && (
                                    <div className="flex gap-2 mb-3 bg-slate-800 p-1 rounded-lg">
                                       <button 
                                         onClick={() => setWitchMode(ActionType.POISON)}
                                         disabled={!me.attributes?.hasPoisonPotion}
                                         className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-all ${witchMode === ActionType.POISON ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-red-400'} disabled:opacity-30 disabled:cursor-not-allowed`}
                                       >
                                         Poison (สังหาร)
                                       </button>
                                       <button 
                                         onClick={() => setWitchMode(ActionType.HEAL)}
                                         disabled={!me.attributes?.hasHealPotion}
                                         className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-all ${witchMode === ActionType.HEAL ? 'bg-green-500 text-white shadow-lg' : 'text-slate-500 hover:text-green-400'} disabled:opacity-30 disabled:cursor-not-allowed`}
                                       >
                                         Heal (ชุบชีวิต)
                                       </button>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 mb-2 justify-center">
                                      {me.role.type === RoleType.WITCH ? (
                                         <FlaskConical className={`w-4 h-4 ${witchMode === ActionType.POISON ? 'text-red-500' : 'text-green-500'}`} />
                                      ) : me.role.type === RoleType.DIRE_WOLF || me.role.type === RoleType.CHANGELING ? (
                                         <Link2 className="w-4 h-4 text-blue-400" />
                                      ) : null}
                                      
                                      <p className="text-center text-sm text-purple-400 font-bold uppercase tracking-wider font-header">
                                        {me.role.type === RoleType.DIRE_WOLF ? "Select Soulbound" : 
                                         me.role.type === RoleType.CHANGELING ? "Select Host" : 
                                         "Select Victim/Target"}
                                      </p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                      {state.players.filter(p => p.id !== me.id && p.isAlive).map(p => (
                                          <button 
                                              key={p.id}
                                              onClick={() => handleAction(p.id)}
                                              className="p-3 bg-slate-800 hover:bg-purple-900/50 border border-slate-700 hover:border-purple-500/50 rounded text-sm transition-all font-header"
                                          >
                                              {p.name}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          )}
                          
                          {/* Messages for Night 1 roles that are done */}
                          {state.phase === GamePhase.NIGHT && me.isAlive && 
                             (me.role.type === RoleType.DIRE_WOLF && me.attributes?.linkedPartnerId) && (
                             <div className="text-center text-xs text-slate-500 mt-2 font-header">Soulbound active. The pact is sealed.</div>
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
    </div>
  );
}
