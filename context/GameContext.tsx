
import React, { createContext, useContext, ReactNode } from 'react';
import { GameState, Player, GamePhase } from '../types';
import { useGameRoom } from '../hooks/useGameRoom';

// --- CONTEXT ---
interface GameContextType {
  state: GameState;
  createRoom: (name: string) => Promise<string>;
  joinRoom: (code: string, name: string) => Promise<void>;
  startGame: () => void;
  performAction: (targetId: string) => void;
  advancePhase: () => void;
  togglePlayerLife: (playerId: string, isAlive: boolean) => void; // New
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { 
    state, 
    createRoom, 
    joinRoom, 
    startGame, 
    performAction, 
    advancePhase,
    togglePlayerLife // New
  } = useGameRoom();

  const handleCreate = async (name: string) => {
    return await createRoom(name);
  };

  const handleJoin = async (code: string, name: string) => {
    await joinRoom(code, name);
  };

  return (
    <GameContext.Provider 
      value={{ 
        state, 
        createRoom: handleCreate, 
        joinRoom: handleJoin, 
        startGame, 
        performAction, 
        advancePhase,
        togglePlayerLife
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
