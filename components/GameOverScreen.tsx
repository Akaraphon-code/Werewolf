
import React from 'react';
import { motion } from 'framer-motion';
import { Player, RoleType } from '../types';
import Button from './Button';
import { Crown, Skull, RefreshCw, Trophy } from 'lucide-react';

interface GameOverScreenProps {
  winner: 'Good' | 'Evil' | 'Jester' | 'Tanner' | 'Lone Wolf' | null;
  players: Player[];
  onReset: () => void;
  isHost: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const GameOverScreen: React.FC<GameOverScreenProps> = ({ winner, players, onReset, isHost }) => {
  
  const getWinnerText = () => {
    switch (winner) {
      case 'Good': return { title: 'VICTORY', subtitle: 'ชาวบ้านเป็นฝ่ายชนะ', color: 'text-blue-400', glow: 'shadow-blue-500/50' };
      case 'Evil': return { title: 'DEFEAT', subtitle: 'หมาป่าครองเมือง', color: 'text-red-500', glow: 'shadow-red-500/50' };
      case 'Jester': return { title: 'JESTER WINS', subtitle: 'โดนต้มกันจนเปื่อย', color: 'text-pink-500', glow: 'shadow-pink-500/50' };
      case 'Tanner': return { title: 'TANNER WINS', subtitle: 'ความตายคือชัยชนะ', color: 'text-orange-500', glow: 'shadow-orange-500/50' };
      case 'Lone Wolf': return { title: 'LONE WOLF', subtitle: 'หมาป่าเดียวดาย', color: 'text-red-600', glow: 'shadow-red-600/50' };
      default: return { title: 'GAME OVER', subtitle: 'จบเกม', color: 'text-slate-200', glow: 'shadow-slate-500/50' };
    }
  };

  const theme = getWinnerText();

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-6 overflow-hidden">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="text-center mb-8 relative z-10"
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-10 blur-3xl ${theme.color}`} />
        <h1 className={`text-6xl md:text-8xl font-display font-bold tracking-tighter mb-2 ${theme.color} drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]`}>
          {theme.title}
        </h1>
        <p className="text-xl md:text-2xl font-thai text-slate-300 tracking-widest uppercase">
          {theme.subtitle}
        </p>
      </motion.div>

      {/* The Big Reveal Grid */}
      <div className="flex-grow overflow-y-auto mb-6 px-2">
        <div className="text-center mb-4">
          <span className="bg-slate-800/80 px-4 py-1 rounded-full text-xs text-slate-400 uppercase tracking-widest border border-slate-700">
            Identity Reveal (เปิดเผยตัวตน)
          </span>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-8"
        >
          {players.map((player) => (
            <motion.div 
              key={player.id}
              variants={item}
              className={`relative group overflow-hidden rounded-xl border ${
                player.role.alignment === 'Evil' ? 'bg-red-950/30 border-red-900/50' : 
                player.role.alignment === 'Neutral' ? 'bg-pink-950/30 border-pink-900/50' :
                'bg-slate-800/50 border-slate-700'
              }`}
            >
              {/* Card Content */}
              <div className="p-4 flex flex-col items-center text-center relative z-10">
                <div className={`w-16 h-16 rounded-full mb-3 border-2 p-1 ${
                   player.role.alignment === 'Evil' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 
                   player.role.alignment === 'Neutral' ? 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]' :
                   'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]'
                }`}>
                  <img 
                    src={player.role.imageUrl} 
                    alt={player.role.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <h3 className="text-white font-bold font-thai text-lg leading-tight mb-1">
                  {player.name}
                </h3>
                
                <div className={`text-xs font-thai font-bold uppercase tracking-wider mb-2 ${
                  player.role.alignment === 'Evil' ? 'text-red-400' : 
                  player.role.alignment === 'Neutral' ? 'text-pink-400' : 
                  'text-blue-400'
                }`}>
                  {player.role.name}
                </div>

                {!player.isAlive && (
                  <div className="absolute top-2 right-2 text-slate-500 opacity-50">
                    <Skull className="w-4 h-4" />
                  </div>
                )}
                
                {winner === 'Good' && player.role.alignment === 'Good' && (
                   <div className="absolute top-2 left-2 text-yellow-500 animate-pulse">
                     <Trophy className="w-4 h-4" />
                   </div>
                )}
                 {winner === 'Evil' && player.role.alignment === 'Evil' && (
                   <div className="absolute top-2 left-2 text-yellow-500 animate-pulse">
                     <Trophy className="w-4 h-4" />
                   </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Host Controls */}
      {isHost && (
        <div className="flex justify-center pt-4 border-t border-slate-800/50">
          <div className="w-full max-w-md">
            <Button onClick={onReset} variant="primary">
               <RefreshCw className="mr-2 w-5 h-5" />
               <span className="font-thai text-lg">เริ่มเกมใหม่ (Lobby)</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameOverScreen;
