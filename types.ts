
export enum RoleType {
  WEREWOLF = 'Werewolf',
  VILLAGER = 'Villager',
  SEER = 'Seer',
  BODYGUARD = 'Bodyguard', 
  HUNTER = 'Hunter',
  MEDIUM = 'Medium',
  JESTER = 'Jester',
  SERIAL_KILLER = 'Serial Killer',
  
  // Advanced Roles (Original)
  APPRENTICE_SEER = 'Apprentice Seer',
  MINION = 'Minion',
  DRUNK = 'Drunk',
  PRIEST = 'Priest',
  TROUBLEMAKER = 'Troublemaker',
  INSOMNIAC = 'Insomniac',
  MASON = 'Mason',
  
  // Phase 2 Roles (Original)
  WOLF_MAN = 'Wolf Man',
  WITCH = 'Witch',
  DIRE_WOLF = 'Dire Wolf',
  CHANGELING = 'Changeling',

  // --- NEW EXPANSION ROLES (Filtered) ---
  
  // Group A: Villager Team
  PRINCE = 'Prince',
  REVEALER = 'Revealer',
  SPELLCASTER = 'Spellcaster',
  TOUGH_GUY = 'Tough Guy',
  VILLAGER_IDIOT = 'Villager Idiot',
  LYCAN = 'Lycan',

  // Group B: Self/Neutral
  LONE_WOLF = 'Lone Wolf',
  TANNER = 'Tanner',

  // Group C: Hybrid
  CURSED = 'Cursed',
  DOPPELGANGER = 'Doppelganger',

  // Group D: Wolf Team
  WOLF_CUB = 'Wolf Cub',
  
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
  CONDITIONAL_KILL = 'CONDITIONAL_KILL', // Priest, Hunter, Revealer
  TROUBLEMAKE = 'TROUBLEMAKE', // Troublemaker
  
  // Phase 2 Actions
  HEAL = 'HEAL',
  POISON = 'POISON',
  LINK = 'LINK', // Dire Wolf, Changeling
  
  // Expansion Actions
  SILENCE = 'SILENCE', // Spellcaster
  
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
  
  // Expansion Flags
  isSilenced: boolean; // Spellcaster effect
  isProtectedFromWolvesOnly: boolean; // Specific protection
}

export interface Role {
  type: RoleType;
  name: string; // Localized Name
  description: string; // Localized Description
  quote: string; // Flavor text
  ability: string; // Short ability description
  imageUrl: string;
  alignment: 'Good' | 'Evil' | 'Neutral' | 'Unknown';
  team: string; // Display team name
  investigationResult?: RoleType; // What the Seer sees this role as
}

export interface PlayerAttributes {
  hasHealPotion?: boolean;
  hasPoisonPotion?: boolean;
  linkedPartnerId?: string; // Dire Wolf
  changelingTargetId?: string; // Changeling
  retributionTargetId?: string; // Hunter
  
  // Expansion Attributes
  toughGuyDeathTurn?: number; // Tough Guy delayed death
  doppelgangerTargetId?: string; // Doppelganger
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
  attributes?: PlayerAttributes; 
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
  executionCount: number; 
  nightActions: NightAction[];
  log: string[]; 
  winner?: 'Good' | 'Evil' | 'Jester' | 'Tanner' | 'Lone Wolf' | null;
  timerEnd?: number; // Timestamp (ms) when timer ends. Null if no timer.
  
  // Global Effects
  wolvesDisabled?: boolean; // (Legacy flag, kept if needed later)
  wolfExtraKills?: number; // Wolf Cub effect
}