
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { GamePhase } from '../types';
import { User, KeyRound, Plus } from 'lucide-react';

interface LobbyScreenProps {
  onJoin: (name: string, code: string) => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'JOIN' | 'CREATE'>('JOIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'CREATE') {
         if (name) onJoin(name, 'NEW');
    } else {
         if (name && code) onJoin(name, code);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-6 relative z-10">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.h1 
            className="text-5xl md:text-6xl font-display font-bold text-white mb-2 tracking-tighter"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "reverse", 
              duration: 4,
              ease: "easeInOut" 
            }}
          >
            WEREWOLF
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 neon-text-purple text-4xl md:text-5xl mt-1 font-horror">
              EXTREME
            </span>
          </motion.h1>
          <p className="text-slate-400 font-light tracking-widest text-sm uppercase font-header">
            Lobby (ห้องรอผู้เล่น)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl space-y-6">
          <div className="flex bg-slate-900/50 p-1 rounded-xl mb-6 font-header">
              <button 
                type="button"
                onClick={() => setMode('JOIN')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${mode === 'JOIN' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  เข้าร่วมเกม
              </button>
              <button 
                type="button"
                onClick={() => setMode('CREATE')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${mode === 'CREATE' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  สร้างห้องใหม่
              </button>
          </div>

          <div className="space-y-2 font-header">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              ชื่อผู้เล่น (Name)
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรอกชื่อของคุณ"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-sans"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'JOIN' && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden font-header"
                >
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                    รหัสห้อง (Room Code)
                    </label>
                    <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="XXXXXX"
                        maxLength={6}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-sans tracking-[0.2em] uppercase"
                    />
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4 font-header">
            <Button type="submit" disabled={!name || (mode === 'JOIN' && !code)}>
              {mode === 'JOIN' ? 'เข้าสู่เกม' : 'สร้างห้อง'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LobbyScreen;
