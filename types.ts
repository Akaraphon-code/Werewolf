
export enum RoleType {
  WEREWOLF = 'Werewolf',
  VILLAGER = 'Villager',
  SEER = 'Seer',
  BODYGUARD = 'Bodyguard', 
  HUNTER = 'Hunter',
  MEDIUM = 'Medium',
  JESTER = 'Jester',
  SERIAL_KILLER = 'Serial Killer',
  UNKNOWN = 'Unknown' // Added for masking other players
}

export enum GamePhase {
  LOBBY = 'LOBBY',
  NIGHT = 'NIGHT',
  DAY = 'DAY',
  VOTING = 'VOTING',
  GAME_OVER = 'GAME_OVER'
}

export enum ActionType {
  KILL = 'KILL',
  PROTECT = 'PROTECT',
  INVESTIGATE = 'INVESTIGATE',
  BLOCK = 'BLOCK',
  NO_ACTION = 'NO_ACTION'
}

export interface NightAction {
  id: string;
  actorId: string;
  targetId: string;
  type: ActionType;
  priority: number;
}

export interface PlayerFlags {
  isProtected: boolean;
  isRoleblocked: boolean;
  isMarkedForDeath: boolean;
  isDoomed: boolean; // Cannot be saved
  isRevealed: boolean;
}

export interface Role {
  type: RoleType;
  name: string; // Localized Name
  description: string; // Localized Description
  quote: string; // Flavor text
  ability: string; // Short ability description
  imageUrl: string;
  alignment: 'Good' | 'Evil' | 'Neutral' | 'Unknown';
  team: string; // Display team name (e.g., 'Villager Team')
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  flags: PlayerFlags; // Reset every night
  isHost?: boolean;
}

export interface GameState {
  roomCode?: string;
  playerId?: string; // Me
  isHost?: boolean;
  phase: GamePhase;
  players: Player[];
  hostPlayers?: Player[]; // Full player data for host
  actions?: NightAction[]; // Real-time actions for host
  currentTurn: number;
  nightActions: NightAction[];
  log: string[]; 
  winner?: 'Good' | 'Evil' | null;
}
