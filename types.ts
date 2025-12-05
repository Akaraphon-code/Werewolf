
export enum RoleType {
  WEREWOLF = 'Werewolf',
  VILLAGER = 'Villager',
  SEER = 'Seer',
  BODYGUARD = 'Bodyguard', 
  HUNTER = 'Hunter',
  MEDIUM = 'Medium',
  JESTER = 'Jester',
  SERIAL_KILLER = 'Serial Killer',
  // Advanced Roles
  APPRENTICE_SEER = 'Apprentice Seer',
  MINION = 'Minion',
  DRUNK = 'Drunk',
  PRIEST = 'Priest',
  TROUBLEMAKER = 'Troublemaker',
  INSOMNIAC = 'Insomniac',
  MASON = 'Mason',
  // Phase 2 Roles
  WOLF_MAN = 'Wolf Man',
  WITCH = 'Witch',
  DIRE_WOLF = 'Dire Wolf',
  CHANGELING = 'Changeling',
  
  UNKNOWN = 'Unknown'
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
  CONDITIONAL_KILL = 'CONDITIONAL_KILL', // Priest, Hunter
  TROUBLEMAKE = 'TROUBLEMAKE', // Troublemaker
  
  // Phase 2 Actions
  HEAL = 'HEAL',
  POISON = 'POISON',
  LINK = 'LINK', // Dire Wolf, Changeling
  
  NO_ACTION = 'NO_ACTION'
}

export interface NightAction {
  id: string;
  actorId: string;
  targetId: string;
  type: ActionType;
  priority: number;
}

export interface Vote {
  voterId: string;
  targetId: string;
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
  investigationResult?: RoleType; // What the Seer sees this role as (e.g. Wolf Man -> Villager)
}

export interface PlayerAttributes {
  hasHealPotion?: boolean;
  hasPoisonPotion?: boolean;
  linkedPartnerId?: string; // Dire Wolf's partner
  changelingTargetId?: string; // Changeling's target
  retributionTargetId?: string; // Hunter's target
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  flags: PlayerFlags; // Reset every night
  // Persistent State
  hasUsedAbility?: boolean; 
  privateResult?: string; 
  isHost?: boolean;
  attributes?: PlayerAttributes; // Phase 2 Attributes
}

export interface GameState {
  roomCode?: string;
  playerId?: string; // Me
  isHost?: boolean;
  phase: GamePhase;
  players: Player[];
  hostPlayers?: Player[]; // Full player data for host
  actions?: NightAction[]; // Real-time actions for host
  votes?: Record<string, string>; // Real-time votes (voterId -> targetId)
  currentTurn: number;
  executionCount: number; // Default 1. Troublemaker can set to 2.
  nightActions: NightAction[];
  log: string[]; 
  winner?: 'Good' | 'Evil' | 'Jester' | null;
}
