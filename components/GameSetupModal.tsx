import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoleType } from '../types';
import { ROLES } from '../constants';
import { PRESETS } from '../gamePresets';
import Button from './Button';
import { Plus, Minus, X, Info, Users, Crown } from 'lucide-react';

interface GameSetupModalProps {
  playerCount: number;
  onConfirm: (roles: RoleType[]) => void;
  onCancel: () => void;
}

const GameSetupModal: React.FC<GameSetupModalProps> = ({ playerCount, onConfirm, onCancel }) => {
  // Store roles as a flat array to allow duplicates (e.g., 2 Werewolves)
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([]);

  // Initialize with Classic preset if players >= 6, else empty
  useEffect(() => {
    if (playerCount >= 6) {
      setSelectedRoles(PRESETS[0].roles);
    }
  }, [playerCount]);

  const addRole = (type: RoleType) => {
    if (selectedRoles.length < playerCount) {
      setSelectedRoles([...selectedRoles, type]);
    }
  };

  const removeRole = (type: RoleType) => {
    const index = selectedRoles.indexOf(type);
    if (index > -1) {
      const newRoles = [...selectedRoles];
      newRoles.splice(index, 1);
      setSelectedRoles(newRoles);
    }
  };

  const getRoleCount = (type: RoleType) => selectedRoles.filter(r => r === type).length;

  const handlePresetSelect = (roles: RoleType[]) => {
    // Only take as many as fit
    setSelectedRoles(roles.slice(0, playerCount));
  };

  const remainingSlots = playerCount - selectedRoles.length;
  const isValid = remainingSlots >= 0;

  // Group roles for the picker (exclude Villager/Unknown)
  const availableRoles = Object.values(ROLES).filter(
    r => r.type !== RoleType.VILLAGER && r.type !== RoleType.UNKNOWN
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Crown className="text-yellow-500" /> Game Setup
            </h2>
            <p className="text-slate-400 text-sm font-thai">กำหนดบทบาทสำหรับผู้เล่น {playerCount} คน</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          
          {/* Presets Section */}
          <div>
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 font-thai">
              Quick Presets (ชุดที่แนะนำ)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.roles)}
                  className="text-left p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-purple-500 hover:bg-purple-900/20 transition-all group"
                >
                  <div className="font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                    {preset.name}
                  </div>
                  <div className="text-xs text-slate-500 mb-2">{preset.recommendedPlayers}</div>
                  <p className="text-xs text-slate-400 font-thai line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Selection Section */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest font-thai">
                Customize Deck (ปรับแต่งเอง)
              </h3>
              <div className={`text-sm font-bold px-3 py-1 rounded-full border ${
                remainingSlots < 0 ? 'bg-red-900/20 border-red-500 text-red-500' : 
                'bg-blue-900/20 border-blue-500 text-blue-400'
              }`}>
                {selectedRoles.length} / {playerCount} Roles
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableRoles.map(role => {
                const count = getRoleCount(role.type);
                return (
                  <div key={role.type} className={`flex items-center justify-between p-3 rounded-lg border ${count > 0 ? 'bg-slate-800 border-purple-500/50' : 'bg-slate-900/50 border-slate-800'}`}>
                    <div className="flex items-center gap-3">
                      <img src={role.imageUrl} alt={role.name} className="w-8 h-8 rounded-full object-cover opacity-80" />
                      <div>
                        <div className="font-bold text-sm text-slate-200 font-thai">{role.name}</div>
                        <div className={`text-[10px] uppercase tracking-wider ${role.alignment === 'Evil' ? 'text-red-500' : role.alignment === 'Neutral' ? 'text-pink-500' : 'text-blue-500'}`}>
                          {role.team}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => removeRole(role.type)}
                        disabled={count === 0}
                        className="w-6 h-6 rounded flex items-center justify-center bg-slate-700 hover:bg-red-900/50 text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className={`w-4 text-center font-mono font-bold ${count > 0 ? 'text-white' : 'text-slate-600'}`}>
                        {count}
                      </span>
                      <button 
                        onClick={() => addRole(role.type)}
                        disabled={selectedRoles.length >= playerCount}
                        className="w-6 h-6 rounded flex items-center justify-center bg-slate-700 hover:bg-green-900/50 text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer / Summary */}
        <div className="p-6 bg-slate-950 border-t border-slate-800">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
             <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Users className="w-5 h-5" />
                <span>
                  {remainingSlots > 0 
                    ? `Remaining ${remainingSlots} slots will be filled with Villagers.` 
                    : remainingSlots < 0 
                      ? `Too many roles selected! Remove ${Math.abs(remainingSlots)}.`
                      : 'Deck Full. No extra Villagers.'}
                </span>
             </div>
             
             <div className="flex gap-3 w-full md:w-auto">
                <Button variant="ghost" onClick={onCancel} className="!w-auto">
                   Cancel
                </Button>
                <Button 
                   variant="primary" 
                   onClick={() => onConfirm(selectedRoles)} 
                   disabled={!isValid || playerCount === 0}
                   className="!w-auto min-w-[150px]"
                >
                   Start Game
                </Button>
             </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default GameSetupModal;