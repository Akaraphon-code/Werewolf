
import React, { createContext, useContext, ReactNode } from 'react';
import { GameState, Player, GamePhase, ActionType } from '../types';
import { useGameRoom } from '../hooks/useGameRoom';

// --- CONTEXT ---
interface GameContextType {
  state: GameState;
  createRoom: (name: string) => Promise<string>;
  joinRoom: (code: string, name: string) => Promise<void>;
  startGame: () => void;
  resetGame: () => void; 
  performAction: (targetId: string, actionType?: ActionType) => void;
  castVote: (targetId: string) => void; 
  advancePhase: () => void;
  togglePlayerLife: (playerId: string, isAlive: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { 
    state, 
    createRoom, 
    joinRoom, 
    startGame,
    resetGame, 
    performAction,
    castVote, 
    advancePhase,
    togglePlayerLife 
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
        resetGame,
        performAction,
        castVote,
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
