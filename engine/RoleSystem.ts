
import { ActionType, NightAction, Player, PlayerFlags, RoleType } from '../types';

/**
 * HELPER: Get Neighbors (Circular)
 */
export const getNeighbors = (players: Player[], targetId: string): Player[] => {
  const alivePlayers = players.filter(p => p.isAlive);
  const idx = alivePlayers.findIndex(p => p.id === targetId);
  
  if (idx === -1 || alivePlayers.length < 3) return []; 

  const left = alivePlayers[(idx - 1 + alivePlayers.length) % alivePlayers.length];
  const right = alivePlayers[(idx + 1) % alivePlayers.length];
  
  if (left.id === right.id) return [left];
  return [left, right];
};

/**
 * Strategy Pattern Base Class
 */
export abstract class RoleStrategy {
  abstract type: RoleType;
  abstract priority: number;

  canTarget(actor: Player, target: Player): boolean {
    if (!target.isAlive) return false;
    if (actor.id === target.id) return false;
    return true;
  }

  createAction(actorId: string, targetId: string, actionType?: ActionType): NightAction {
    return {
      id: crypto.randomUUID(),
      actorId,
      targetId,
      type: actionType || this.getActionType(),
      priority: this.priority
    };
  }

  abstract getActionType(): ActionType;
  abstract execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void;
}

// --- CONCRETE STRATEGIES ---

export class BodyguardStrategy extends RoleStrategy {
  type = RoleType.BODYGUARD;
  priority = 1;
  getActionType() { return ActionType.PROTECT; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    targetFlags.isProtected = true;
  }
}

export class WerewolfStrategy extends RoleStrategy {
  type = RoleType.WEREWOLF;
  priority = 5;
  getActionType() { return ActionType.KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    targetFlags.isMarkedForDeath = true;
  }
}

// Phase 2: Wolf Man shares Werewolf Strategy for killing (if group vote), 
// but usually Wolf Man acts as a regular wolf or just passive. 
// We assign WerewolfStrategy to them for simplicity if they lead the kill.
export class WolfManStrategy extends RoleStrategy {
  type = RoleType.WOLF_MAN;
  priority = 5;
  getActionType() { return ActionType.KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    targetFlags.isMarkedForDeath = true;
  }
}

export class SerialKillerStrategy extends RoleStrategy {
  type = RoleType.SERIAL_KILLER;
  priority = 5;
  getActionType() { return ActionType.KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    targetFlags.isMarkedForDeath = true;
    targetFlags.isDoomed = true; 
  }
}

export class SeerStrategy extends RoleStrategy {
  type = RoleType.SEER;
  priority = 10;
  getActionType() { return ActionType.INVESTIGATE; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    // Logic handled in ResolutionEngine, but basically reveals info.
    // Flagging as revealed for internal tracking
    targetFlags.isRevealed = true;
  }
}

export class PriestStrategy extends RoleStrategy {
  type = RoleType.PRIEST;
  priority = 4;
  getActionType() { return ActionType.CONDITIONAL_KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    // Logic handled in ResolutionEngine due to "Suicide" mechanics
  }
}

export class ApprenticeSeerStrategy extends RoleStrategy {
  type = RoleType.APPRENTICE_SEER;
  priority = 10;
  getActionType() { return ActionType.INVESTIGATE; }
  canTarget(actor: Player, target: Player): boolean {
    // Apprentice only active if promoted (which changes RoleType to SEER) 
    // OR if using one-time ability (old mechanic). 
    // Phase 2 mechanic: "Inherits". If inherited, role changes to SEER, so this strat might not run.
    return super.canTarget(actor, target);
  }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

export class TroublemakerStrategy extends RoleStrategy {
  type = RoleType.TROUBLEMAKER;
  priority = 2;
  getActionType() { return ActionType.TROUBLEMAKE; }
  canTarget(actor: Player, target: Player): boolean {
    return super.canTarget(actor, target) && !actor.hasUsedAbility;
  }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

export class HunterStrategy extends RoleStrategy {
  type = RoleType.HUNTER;
  priority = 99; // Pre-select mechanism
  getActionType() { return ActionType.CONDITIONAL_KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    // Just marks the target as the potential victim of retribution
    // Execution happens in ResolutionEngine if Hunter dies.
  }
}

// --- PHASE 2 STRATEGIES ---

export class WitchStrategy extends RoleStrategy {
  type = RoleType.WITCH;
  priority = 0; // Potions are fast
  getActionType() { return ActionType.POISON; } // Default if unspecified
  
  createAction(actorId: string, targetId: string, actionType?: ActionType): NightAction {
    return {
      id: crypto.randomUUID(),
      actorId,
      targetId,
      type: actionType || ActionType.POISON, // Witch can HEAL or POISON
      priority: 0
    };
  }

  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    if (action.type === ActionType.HEAL) {
      targetFlags.isProtected = true;
    } else if (action.type === ActionType.POISON) {
      targetFlags.isMarkedForDeath = true;
      targetFlags.isDoomed = true; // Magic poison usually kills (doomed)
    }
  }
}

export class DireWolfStrategy extends RoleStrategy {
  type = RoleType.DIRE_WOLF;
  priority = 0; // Setup
  getActionType() { return ActionType.LINK; }
  
  canTarget(actor: Player, target: Player): boolean {
    // Only Night 1 (ResolutionEngine enforces this, strategy just allows creation)
    return super.canTarget(actor, target) && !actor.attributes?.linkedPartnerId;
  }

  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
     // Sets attribute in ResolutionEngine
  }
}

export class ChangelingStrategy extends RoleStrategy {
  type = RoleType.CHANGELING;
  priority = 0; // Setup
  getActionType() { return ActionType.LINK; }
  
  canTarget(actor: Player, target: Player): boolean {
    return super.canTarget(actor, target) && !actor.attributes?.changelingTargetId;
  }

  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

// --- PASSIVE / INFO ROLES ---

export class MinionStrategy extends RoleStrategy {
  type = RoleType.MINION;
  priority = 0;
  getActionType() { return ActionType.INVESTIGATE; }
  execute() {}
}

export class MasonStrategy extends RoleStrategy {
  type = RoleType.MASON;
  priority = 0;
  getActionType() { return ActionType.INVESTIGATE; }
  execute() {}
}

export class InsomniacStrategy extends RoleStrategy {
  type = RoleType.INSOMNIAC;
  priority = 100;
  getActionType() { return ActionType.INVESTIGATE; }
  execute() {}
}

export class VillagerStrategy extends RoleStrategy {
  type = RoleType.VILLAGER;
  priority = 99;
  getActionType() { return ActionType.NO_ACTION; }
  createAction(actorId: string, targetId: string): NightAction {
    return { id: 'noop', actorId, targetId, type: ActionType.NO_ACTION, priority: 99 }
  }
  execute(): void {}
}

// --- FACTORY ---

const strategies: Record<string, RoleStrategy> = {
  [RoleType.WEREWOLF]: new WerewolfStrategy(),
  [RoleType.WOLF_MAN]: new WolfManStrategy(), // Shares basic killer logic
  [RoleType.SERIAL_KILLER]: new SerialKillerStrategy(),
  [RoleType.BODYGUARD]: new BodyguardStrategy(), 
  [RoleType.SEER]: new SeerStrategy(),
  [RoleType.PRIEST]: new PriestStrategy(),
  [RoleType.APPRENTICE_SEER]: new ApprenticeSeerStrategy(),
  [RoleType.TROUBLEMAKER]: new TroublemakerStrategy(),
  [RoleType.MINION]: new MinionStrategy(),
  [RoleType.MASON]: new MasonStrategy(),
  [RoleType.INSOMNIAC]: new InsomniacStrategy(),
  [RoleType.VILLAGER]: new VillagerStrategy(),
  [RoleType.HUNTER]: new HunterStrategy(), 
  [RoleType.MEDIUM]: new VillagerStrategy(),
  [RoleType.JESTER]: new VillagerStrategy(),
  [RoleType.DRUNK]: new VillagerStrategy(),
  
  // Phase 2
  [RoleType.WITCH]: new WitchStrategy(),
  [RoleType.DIRE_WOLF]: new DireWolfStrategy(),
  [RoleType.CHANGELING]: new ChangelingStrategy(),
};

export const getRoleStrategy = (roleType: RoleType): RoleStrategy => {
  return strategies[roleType] || new VillagerStrategy();
};
