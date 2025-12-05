
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, RoleType } from '../types';
import { Info, Shield, Skull, Eye, Moon, Quote, Ghost, HelpCircle } from 'lucide-react';

interface RoleCardProps {
  role: Role;
}

const RoleCard: React.FC<RoleCardProps> = ({ role }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const getRoleIcon = (type: RoleType) => {
    switch (type) {
      case RoleType.WEREWOLF: return <Moon className="w-8 h-8 text-red-500" />;
      case RoleType.SEER: return <Eye className="w-8 h-8 text-cyan-400" />;
      case RoleType.BODYGUARD: return <Shield className="w-8 h-8 text-green-400" />;
      case RoleType.HUNTER: return <Skull className="w-8 h-8 text-yellow-500" />;
      case RoleType.MEDIUM: return <Ghost className="w-8 h-8 text-purple-300" />;
      case RoleType.JESTER: return <HelpCircle className="w-8 h-8 text-pink-400" />;
      case RoleType.VILLAGER: return <Info className="w-8 h-8 text-blue-400" />;
      default: return <Info className="w-8 h-8 text-slate-400" />;
    }
  };

  return (
    // Defined @container for container queries
    <div className="relative w-full max-w-sm aspect-[3/5] mx-auto perspective-1000 @container">
      <motion.div
        className="w-full h-full relative transform-style-3d cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        onClick={handleFlip}
      >
        {/* Front of Card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl overflow-hidden glass-card shadow-2xl border border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900 z-10" />
          
          <img 
            src={role.imageUrl} 
            alt={role.name} 
            className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-80"
          />

          <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col items-center text-center">
            <div className="mb-4 p-4 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
               {getRoleIcon(role.type)}
            </div>
            
            {/* Container Query: Adjust text size based on card width */}
            <h2 className="text-3xl @[300px]:text-4xl font-display font-bold text-white mb-2 tracking-widest neon-text-purple uppercase font-thai">
              {role.name}
            </h2>
            <p className="text-xs @[300px]:text-sm text-slate-300 font-light tracking-widest uppercase opacity-80 font-thai">
              แตะเพื่อดูข้อมูล
            </p>
          </div>

          {/* Decorative Borders */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-purple-500/50 rounded-tl-lg z-20" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-purple-500/50 rounded-tr-lg z-20" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-purple-500/50 rounded-bl-lg z-20" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-purple-500/50 rounded-br-lg z-20" />
        </div>

        {/* Back of Card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-90" />
          
          <div className="relative z-10 h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl @[300px]:text-2xl font-display font-bold text-purple-400 font-thai">{role.name}</h3>
              <span className={`px-3 py-1 rounded-full text-[10px] @[300px]:text-xs font-bold uppercase tracking-wider font-thai ${role.alignment === 'Evil' ? 'bg-red-500/20 text-red-400' : role.alignment === 'Neutral' ? 'bg-pink-500/20 text-pink-400' : 'bg-green-500/20 text-green-400'}`}>
                {role.team}
              </span>
            </div>

            <div className="space-y-6 flex-grow">
              
              {/* Flavor Text / Quote */}
              <div className="relative p-4 bg-white/5 rounded-lg border-l-2 border-purple-500 italic text-purple-200/80">
                 <Quote className="absolute top-2 left-2 w-3 h-3 text-purple-500/50 -scale-x-100" />
                 <p className="text-sm font-thai text-center px-2">"{role.quote}"</p>
                 <Quote className="absolute bottom-2 right-2 w-3 h-3 text-purple-500/50" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-thai">เป้าหมาย</h4>
                <p className="text-sm @[300px]:text-base text-slate-200 leading-relaxed font-light font-thai">
                  {role.description}
                </p>
              </div>

              <div className="bg-purple-900/10 p-3 rounded-xl border border-purple-500/20">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-2 font-thai">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  ความสามารถ
                </h4>
                <p className="text-sm text-purple-100 font-medium font-thai">
                  {role.ability}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-4 text-center">
              <p className="text-[10px] @[300px]:text-xs text-slate-600 uppercase tracking-widest font-thai">
                แตะเพื่อซ่อน
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleCard;
