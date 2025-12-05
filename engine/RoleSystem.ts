
import { ActionType, NightAction, Player, PlayerFlags, RoleType } from '../types';

/**
 * Strategy Pattern Base Class
 * Defines the contract for all roles.
 */
export abstract class RoleStrategy {
  abstract type: RoleType;
  abstract priority: number; // Lower number = executes earlier (0 = first)

  /**
   * Determines if the action is valid.
   */
  canTarget(actor: Player, target: Player): boolean {
    if (!target.isAlive) return false;
    if (actor.id === target.id) return false; // Default: cannot target self
    return true;
  }

  /**
   * Generates the action object to be queued.
   */
  createAction(actorId: string, targetId: string): NightAction {
    return {
      id: crypto.randomUUID(),
      actorId,
      targetId,
      type: this.getActionType(),
      priority: this.priority
    };
  }

  abstract getActionType(): ActionType;

  /**
   * Executes the logic of the role against the target's flags.
   * This mutates the flags object for the resolution phase.
   */
  abstract execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void;
}

// --- CONCRETE STRATEGIES ---

/**
 * BODYGUARD (Protector)
 * Priority: 1 (Very High) - Must apply protection before attacks are resolved
 * Prevents death from normal attacks.
 */
export class BodyguardStrategy extends RoleStrategy {
  type = RoleType.BODYGUARD;
  priority = 1;

  getActionType() { return ActionType.PROTECT; }

  canTarget(actor: Player, target: Player): boolean {
    return target.isAlive && actor.id !== target.id; // Cannot protect self usually
  }

  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    targetFlags.isProtected = true;
  }
}

/**
 * WEREWOLF (Killer)
 * Priority: 5 (Mid)
 * Kills unless protected.
 */
export class WerewolfStrategy extends RoleStrategy {
  type = RoleType.WEREWOLF;
  priority = 5;

  getActionType() { return ActionType.KILL; }

  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    targetFlags.isMarkedForDeath = true;
  }
}

/**
 * SERIAL KILLER (Unstoppable Killer)
 * Priority: 5 (Mid)
 * Kills IGNORING protection.
 */
export class SerialKillerStrategy extends RoleStrategy {
  type = RoleType.SERIAL_KILLER;
  priority = 5;

  getActionType() { return ActionType.KILL; }

  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    
    targetFlags.isMarkedForDeath = true;
    // The "Doomed" flag tells the Resolution Engine to ignore protection
    targetFlags.isDoomed = true; 
  }
}

/**
 * SEER (Investigator)
 * Priority: 10 (Low)
 * Gathers info.
 */
export class SeerStrategy extends RoleStrategy {
  type = RoleType.SEER;
  priority = 10;

  getActionType() { return ActionType.INVESTIGATE; }

  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    targetFlags.isRevealed = true;
  }
}

/**
 * VILLAGER (Passive)
 */
export class VillagerStrategy extends RoleStrategy {
  type = RoleType.VILLAGER;
  priority = 99;

  getActionType() { return ActionType.NO_ACTION; }
  
  createAction(actorId: string, targetId: string): NightAction {
    return {
        id: 'noop',
        actorId,
        targetId,
        type: ActionType.NO_ACTION,
        priority: 99
    }
  }

  execute(): void {
    // Villagers do nothing at night
  }
}

// --- FACTORY / REGISTRY ---

const strategies: Record<string, RoleStrategy> = {
  [RoleType.WEREWOLF]: new WerewolfStrategy(),
  [RoleType.SERIAL_KILLER]: new SerialKillerStrategy(),
  [RoleType.BODYGUARD]: new BodyguardStrategy(), 
  [RoleType.SEER]: new SeerStrategy(),
  [RoleType.VILLAGER]: new VillagerStrategy(),
  [RoleType.HUNTER]: new VillagerStrategy(), 
  [RoleType.MEDIUM]: new VillagerStrategy(),
  [RoleType.JESTER]: new VillagerStrategy(),
};

export const getRoleStrategy = (roleType: RoleType): RoleStrategy => {
  return strategies[roleType] || new VillagerStrategy();
};
