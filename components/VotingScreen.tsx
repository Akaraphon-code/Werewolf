
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import Button from './Button';
import { User, CheckCircle2, Ban, MicOff } from 'lucide-react';
import { RoleType } from '../types';

const VotingScreen: React.FC = () => {
  const { state, castVote } = useGame();
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const me = state.players.find(p => p.id === state.playerId);
  const isPacifist = me?.role.type === RoleType.PACIFIST;
  const isSilenced = me?.flags.isSilenced;
  const isBanished = me?.flags.isBanished;
  
  const canVote = !isPacifist && !isSilenced && !isBanished;

  const candidates = state.players.filter(p => p.isAlive);

  const handleVote = async () => {
    if (selectedTargetId && canVote) {
      castVote(selectedTargetId);
      setHasVoted(true);
    }
  };

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6 text-purple-400">
          <CheckCircle2 className="w-20 h-20" />
        </motion.div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">Judgment Cast</h2>
        <p className="text-slate-400 font-header">The spirits await the outcome...</p>
      </div>
    );
  }

  if (!canVote) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
             <div className="mb-6 text-red-500 bg-red-900/20 p-6 rounded-full">
                {isPacifist ? <Ban className="w-16 h-16" /> : <MicOff className="w-16 h-16" />}
             </div>
             <h2 className="text-2xl font-bold text-white mb-2 font-header">
                 {isPacifist ? "Pacifist Vow" : "Silenced / Banished"}
             </h2>
             <p className="text-slate-400 max-w-xs mx-auto font-header">
                 {isPacifist 
                    ? "คุณเป็นผู้รักสงบ จึงไม่สามารถโหวตประหารใครได้" 
                    : "คุณถูกเวทมนตร์ใบ้ หรือถูกขับไล่ จึงไม่มีสิทธิ์ออกเสียงในวันนี้"}
             </p>
        </div>
      )
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-display font-bold text-red-500 mb-1 neon-text-red">EXECUTION HOUR</h2>
        <p className="text-slate-400 text-sm font-header uppercase tracking-wider">Choose who shall perish</p>
      </div>

      <div className="flex-grow overflow-y-auto space-y-3 pb-4">
        {candidates.map(player => (
          <motion.button
            key={player.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedTargetId(player.id)}
            disabled={player.flags.isBanished}
            className={`w-full flex items-center p-4 rounded-xl border transition-all ${
              selectedTargetId === player.id 
                ? 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
            } ${player.flags.isBanished ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
               selectedTargetId === player.id ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className={`block font-bold text-lg font-header ${selectedTargetId === player.id ? 'text-white' : 'text-slate-300'}`}>
                {player.name}
              </span>
              {player.flags.isBanished && <span className="text-xs text-red-400 font-bold">(Banished)</span>}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="pt-4">
        <Button variant="secondary" onClick={handleVote} disabled={!selectedTargetId}>
          Condemn (พิพากษา)
        </Button>
      </div>
    </div>
  );
};

export default VotingScreen;
