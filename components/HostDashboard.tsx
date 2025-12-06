
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { GamePhase, RoleType } from '../types';
import { Shield, Skull, Sword, Eye, Moon, Sun, HeartPulse, RefreshCw, Zap, Vote as VoteIcon, LogOut } from 'lucide-react';
import Button from './Button';
import GameSetupModal from './GameSetupModal';

const HostDashboard: React.FC = () => {
  const { state, startGame, advancePhase, togglePlayerLife, leaveRoom } = useGame();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  
  const players = state.hostPlayers && state.hostPlayers.length > 0 ? state.hostPlayers : state.players;

  const handleStartClick = () => {
    setIsSetupOpen(true);
  };

  const handleSetupConfirm = (selectedRoles: RoleType[]) => {
    startGame(selectedRoles);
    setIsSetupOpen(false);
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

  const getPhaseLabel = (phase: GamePhase) => {
    switch (phase) {
      case GamePhase.LOBBY: return 'Lobby (รอเริ่มเกม)';
      case GamePhase.NIGHT: return 'Night (กลางคืน)';
      case GamePhase.DAY: return 'Day (กลางวัน)';
      case GamePhase.VOTING: return 'Voting (โหวต)';
      case GamePhase.GAME_OVER: return 'Game Over (จบเกม)';
      default: return phase;
    }
  };

  const getActionTargetName = (actorId: string) => {
    if (!state.actions) return '-';
    const action = state.actions.find(a => a.actorId === actorId);
    if (!action) return '-';
    const target = players.find(p => p.id === action.targetId);
    return target ? target.name : 'Unknown';
  };

  // Vote Tally Logic
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
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 font-header overflow-hidden">
      
      {/* Top Bar */}
      <div className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shadow-lg z-20">
        <div className="flex items-center gap-4">
          <div className="bg-purple-900/30 text-purple-400 px-3 py-1 rounded-md border border-purple-500/30 text-xs font-mono">
            CODE: {state.roomCode}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Phase:</span>
            <span className={`text-lg font-bold font-header ${state.phase === GamePhase.NIGHT ? 'text-purple-400' : state.phase === GamePhase.VOTING ? 'text-red-500' : 'text-yellow-400'}`}>
              {getPhaseLabel(state.phase)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 uppercase tracking-widest hidden sm:block font-header">
            Host Control
          </div>
          <button 
             onClick={leaveRoom}
             className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
             title="ออกจากห้อง (Leave Room)"
          >
             <LogOut className="w-4 h-4" />
             <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        
        {/* Left: Player Grid */}
        <div className={`flex-1 overflow-auto p-6 transition-all ${state.phase === GamePhase.VOTING ? 'w-2/3' : 'w-full'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {players.map(player => (
              <motion.div 
                key={player.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative rounded-xl border p-4 transition-all ${
                  player.isAlive 
                    ? 'bg-slate-800/50 border-slate-700' 
                    : 'bg-red-900/10 border-red-900/30 grayscale opacity-75'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      player.role.team.includes('Werewolf') || player.role.team.includes('Evil')
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {player.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg font-header">{player.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {getRoleIcon(player.role.type)}
                        <span>{player.role.name}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePlayerLife(player.id, !player.isAlive)}
                    className={`p-2 rounded-full transition-colors ${
                      player.isAlive 
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    }`}
                  >
                    {player.isAlive ? <HeartPulse className="w-5 h-5" /> : <Skull className="w-5 h-5" />}
                  </button>
                </div>

                <div className="space-y-2 mt-4 bg-slate-900/50 p-3 rounded-lg text-xs font-header">
                  <div className="flex justify-between">
                     <span className="text-slate-500">Status:</span>
                     <span className={player.isAlive ? "text-green-400" : "text-red-500"}>
                       {player.isAlive ? "Alive" : "Dead"}
                     </span>
                  </div>
                  {state.phase === GamePhase.NIGHT && (
                    <div className="flex justify-between">
                       <span className="text-slate-500">Action:</span>
                       <span className="text-purple-300 font-mono">
                         {getActionTargetName(player.id)}
                       </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Voting Panel (Only visible during Voting) */}
        {state.phase === GamePhase.VOTING && (
          <div className="w-1/3 bg-slate-950/80 border-l border-slate-800 p-6 overflow-auto">
             <h2 className="text-xl font-display font-bold text-red-500 mb-6 flex items-center gap-2 font-header">
               <VoteIcon /> Execution Votes
             </h2>
             <div className="space-y-4">
                {players.filter(p => p.isAlive).map(player => {
                   const count = voteCounts[player.id] || 0;
                   const percentage = maxVotes > 0 ? (count / Object.keys(state.votes || {}).length) * 100 : 0;
                   
                   return (
                     <div key={player.id} className="relative font-header">
                        <div className="flex justify-between mb-1 text-sm">
                           <span>{player.name}</span>
                           <span className="font-mono text-red-400">{count} Votes</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${percentage}%` }}
                             className="h-full bg-red-500"
                           />
                        </div>
                     </div>
                   )
                })}
             </div>
             <div className="mt-8 p-4 bg-slate-900 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-header">Total Votes</p>
                <p className="text-3xl font-mono text-white">{Object.keys(state.votes || {}).length} / {players.filter(p=>p.isAlive).length}</p>
             </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="bg-slate-900 border-t border-slate-800 p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">
          
          <Button 
            variant="secondary"
            onClick={handleStartClick}
            disabled={state.phase !== GamePhase.LOBBY && state.phase !== GamePhase.GAME_OVER}
          >
            <div className="flex flex-col items-center leading-none py-1">
              <span className="text-lg font-header">Start Game (เริ่มเกม)</span>
            </div>
          </Button>

          <Button 
            variant="primary"
            onClick={advancePhase}
            className={
              state.phase === GamePhase.NIGHT ? "!bg-yellow-600/20 !border-yellow-600/50 !text-yellow-500" :
              state.phase === GamePhase.DAY ? "!bg-red-600/20 !border-red-600/50 !text-red-500" :
              state.phase === GamePhase.VOTING ? "!bg-purple-600/20 !border-purple-600/50 !text-purple-500" : ""
            }
            disabled={state.phase === GamePhase.LOBBY}
          >
             <div className="flex flex-col items-center leading-none py-1">
              <span className="text-lg font-header">
                {state.phase === GamePhase.NIGHT 
                  ? "Go to Morning (ไปตอนเช้า)" 
                  : state.phase === GamePhase.DAY 
                    ? "Start Voting (เริ่มโหวต)" 
                    : state.phase === GamePhase.VOTING
                    ? "Execute (ประหาร)"
                    : "Next Phase"}
              </span>
            </div>
          </Button>

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
