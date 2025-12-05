
import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { GamePhase, RoleType } from '../types';
import { Shield, Skull, Sword, Eye, Moon, Sun, HeartPulse, RefreshCw, Zap } from 'lucide-react';
import Button from './Button';

const HostDashboard: React.FC = () => {
  const { state, startGame, advancePhase, togglePlayerLife } = useGame();
  
  // Use hostPlayers (full data) if available, otherwise fallback to public players
  const players = state.hostPlayers && state.hostPlayers.length > 0 ? state.hostPlayers : state.players;

  const getRoleIcon = (type: RoleType) => {
    switch (type) {
      case RoleType.WEREWOLF: return <Moon className="w-4 h-4 text-red-500" />;
      case RoleType.SEER: return <Eye className="w-4 h-4 text-cyan-400" />;
      case RoleType.BODYGUARD: return <Shield className="w-4 h-4 text-green-400" />;
      case RoleType.SERIAL_KILLER: return <Sword className="w-4 h-4 text-purple-500" />;
      default: return <div className="w-4 h-4 rounded-full bg-slate-600" />;
    }
  };

  const getPhaseLabel = (phase: GamePhase) => {
    switch (phase) {
      case GamePhase.LOBBY: return 'ล็อบบี้ (รอผู้เล่น)';
      case GamePhase.NIGHT: return 'กลางคืน (Night)';
      case GamePhase.DAY: return 'กลางวัน (Day)';
      case GamePhase.VOTING: return 'ช่วงโหวต';
      case GamePhase.GAME_OVER: return 'จบเกม';
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

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 font-thai overflow-hidden">
      
      {/* Top Bar */}
      <div className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shadow-lg z-20">
        <div className="flex items-center gap-4">
          <div className="bg-purple-900/30 text-purple-400 px-3 py-1 rounded-md border border-purple-500/30 text-xs font-mono">
            ROOM: {state.roomCode}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">สถานะ:</span>
            <span className={`text-lg font-bold ${state.phase === GamePhase.NIGHT ? 'text-purple-400' : 'text-yellow-400'}`}>
              {getPhaseLabel(state.phase)}
            </span>
          </div>
        </div>
        <div className="text-xs text-slate-500 uppercase tracking-widest">
          แผงควบคุมผู้คุมเกม
        </div>
      </div>

      {/* Main Content: Player Grid */}
      <div className="flex-grow overflow-auto p-6">
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
                    player.role.team.includes('หมาป่า') || player.role.team.includes('ฆาตกร')
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {player.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{player.name}</h3>
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
                  title={player.isAlive ? "ฆ่า" : "ชุบชีวิต"}
                >
                  {player.isAlive ? <HeartPulse className="w-5 h-5" /> : <Skull className="w-5 h-5" />}
                </button>
              </div>

              {/* Status Indicators */}
              <div className="space-y-2 mt-4 bg-slate-900/50 p-3 rounded-lg text-xs">
                <div className="flex justify-between">
                   <span className="text-slate-500">สถานะชีพ:</span>
                   <span className={player.isAlive ? "text-green-400" : "text-red-500"}>
                     {player.isAlive ? "มีชีวิต" : "เสียชีวิต"}
                   </span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-500">เป้าหมายล่าสุด:</span>
                   <span className="text-purple-300 font-mono">
                     {getActionTargetName(player.id)}
                   </span>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-slate-900 border-t border-slate-800 p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">
          
          <Button 
            variant="secondary"
            onClick={startGame}
            disabled={state.phase !== GamePhase.LOBBY && state.phase !== GamePhase.GAME_OVER}
          >
            <div className="flex flex-col items-center leading-none py-1">
              <span className="text-lg font-thai">สุ่มบทบาท & เริ่มเกม</span>
              <span className="text-[10px] opacity-60">Random Roles & Start</span>
            </div>
          </Button>

          <Button 
            variant="primary"
            onClick={advancePhase}
            className={state.phase === GamePhase.NIGHT ? "!bg-yellow-600/20 !border-yellow-600/50 !text-yellow-500" : ""}
            disabled={state.phase === GamePhase.LOBBY}
          >
             <div className="flex flex-col items-center leading-none py-1">
              <span className="text-lg font-thai">
                {state.phase === GamePhase.NIGHT 
                  ? "ประมวลผล & เช้า" 
                  : state.phase === GamePhase.DAY 
                    ? "เข้าสู่กลางคืน" 
                    : "ถัดไป"}
              </span>
              <span className="text-[10px] opacity-60">Next Phase / Resolve</span>
            </div>
          </Button>

        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
