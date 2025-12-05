
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import Button from './Button';
import { User, CheckCircle2 } from 'lucide-react';

const VotingScreen: React.FC = () => {
  const { state, castVote } = useGame();
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Filter only alive players (including self, depending on rules, but usually you can vote anyone alive)
  const candidates = state.players.filter(p => p.isAlive);

  const handleVote = async () => {
    if (selectedTargetId) {
      castVote(selectedTargetId);
      setHasVoted(true);
    }
  };

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6 text-purple-400"
        >
          <CheckCircle2 className="w-20 h-20" />
        </motion.div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">Vote Cast</h2>
        <p className="text-slate-400 font-thai">รอดูกันว่า... ใครจะเป็นผู้โชคร้าย</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-display font-bold text-red-500 mb-1 neon-text-red">JUDGMENT</h2>
        <p className="text-slate-400 text-sm font-thai uppercase tracking-wider">โหวตเพื่อกำจัดผู้ต้องสงสัย</p>
      </div>

      <div className="flex-grow overflow-y-auto space-y-3 pb-4">
        {candidates.map(player => (
          <motion.button
            key={player.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedTargetId(player.id)}
            className={`w-full flex items-center p-4 rounded-xl border transition-all ${
              selectedTargetId === player.id 
                ? 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
               selectedTargetId === player.id ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className={`block font-bold text-lg font-thai ${selectedTargetId === player.id ? 'text-white' : 'text-slate-300'}`}>
                {player.name}
              </span>
            </div>
            {selectedTargetId === player.id && (
              <div className="ml-auto">
                 <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="pt-4">
        <Button 
          variant="secondary" 
          onClick={handleVote} 
          disabled={!selectedTargetId}
        >
          ยืนยันการโหวต (Confirm Vote)
        </Button>
      </div>
    </div>
  );
};

export default VotingScreen;
