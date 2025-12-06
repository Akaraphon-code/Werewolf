
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
    // Standard rule: Cannot target self unless specified
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

// --- ORIGINAL STRATEGIES ---

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
    targetFlags.isRevealed = true;
  }
}

export class PriestStrategy extends RoleStrategy {
  type = RoleType.PRIEST;
  priority = 4;
  getActionType() { return ActionType.CONDITIONAL_KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

export class ApprenticeSeerStrategy extends RoleStrategy {
  type = RoleType.APPRENTICE_SEER;
  priority = 10;
  getActionType() { return ActionType.INVESTIGATE; }
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
  priority = 99; 
  getActionType() { return ActionType.CONDITIONAL_KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

// --- PHASE 2 STRATEGIES ---

export class WitchStrategy extends RoleStrategy {
  type = RoleType.WITCH;
  priority = 0; 
  getActionType() { return ActionType.POISON; } 
  createAction(actorId: string, targetId: string, actionType?: ActionType): NightAction {
    return {
      id: crypto.randomUUID(),
      actorId,
      targetId,
      type: actionType || ActionType.POISON, 
      priority: 0
    };
  }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    if (action.type === ActionType.HEAL) {
      targetFlags.isProtected = true;
    } else if (action.type === ActionType.POISON) {
      targetFlags.isMarkedForDeath = true;
      targetFlags.isDoomed = true; 
    }
  }
}

export class DireWolfStrategy extends RoleStrategy {
  type = RoleType.DIRE_WOLF;
  priority = 0; 
  getActionType() { return ActionType.LINK; }
  canTarget(actor: Player, target: Player): boolean {
    return super.canTarget(actor, target) && !actor.attributes?.linkedPartnerId;
  }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

export class ChangelingStrategy extends RoleStrategy {
  type = RoleType.CHANGELING;
  priority = 0; 
  getActionType() { return ActionType.LINK; }
  canTarget(actor: Player, target: Player): boolean {
    return super.canTarget(actor, target) && !actor.attributes?.changelingTargetId;
  }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

// --- EXPANSION STRATEGIES ---

export class RevealerStrategy extends RoleStrategy {
  type = RoleType.REVEALER;
  priority = 5;
  getActionType() { return ActionType.CONDITIONAL_KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

export class SpellcasterStrategy extends RoleStrategy {
  type = RoleType.SPELLCASTER;
  priority = 2;
  getActionType() { return ActionType.SILENCE; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
     if (actorFlags.isRoleblocked) return;
     targetFlags.isSilenced = true;
  }
}

export class DoppelgangerStrategy extends RoleStrategy {
  type = RoleType.DOPPELGANGER;
  priority = 0;
  getActionType() { return ActionType.LINK; }
  canTarget(actor: Player, target: Player): boolean {
    return super.canTarget(actor, target) && !actor.attributes?.doppelgangerTargetId;
  }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

export class LoneWolfStrategy extends RoleStrategy {
    type = RoleType.LONE_WOLF;
    priority = 5;
    getActionType() { return ActionType.KILL; }
    execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
        if (actorFlags.isRoleblocked) return;
        targetFlags.isMarkedForDeath = true;
    }
}

export class WolfCubStrategy extends RoleStrategy {
    type = RoleType.WOLF_CUB;
    priority = 5;
    getActionType() { return ActionType.KILL; }
    execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
        if (actorFlags.isRoleblocked) return;
        targetFlags.isMarkedForDeath = true;
    }
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
  [RoleType.WOLF_MAN]: new WolfManStrategy(),
  [RoleType.SERIAL_KILLER]: new SerialKillerStrategy(),
  [RoleType.BODYGUARD]: new BodyguardStrategy(), 
  [RoleType.SEER]: new SeerStrategy(),
  [RoleType.PRIEST]: new PriestStrategy(),
  [RoleType.APPRENTICE_SEER]: new ApprenticeSeerStrategy(),
  [RoleType.TROUBLEMAKER]: new TroublemakerStrategy(),
  [RoleType.MINION]: new VillagerStrategy(), // Passive
  [RoleType.MASON]: new VillagerStrategy(), // Passive
  [RoleType.INSOMNIAC]: new VillagerStrategy(), // Passive
  [RoleType.VILLAGER]: new VillagerStrategy(),
  [RoleType.HUNTER]: new HunterStrategy(), 
  [RoleType.MEDIUM]: new VillagerStrategy(),
  [RoleType.JESTER]: new VillagerStrategy(),
  [RoleType.DRUNK]: new VillagerStrategy(),
  [RoleType.WITCH]: new WitchStrategy(),
  [RoleType.DIRE_WOLF]: new DireWolfStrategy(),
  [RoleType.CHANGELING]: new ChangelingStrategy(),

  // Expansion
  [RoleType.PRINCE]: new VillagerStrategy(), // Passive
  [RoleType.REVEALER]: new RevealerStrategy(),
  [RoleType.SPELLCASTER]: new SpellcasterStrategy(),
  [RoleType.TOUGH_GUY]: new VillagerStrategy(), // Passive
  [RoleType.VILLAGER_IDIOT]: new VillagerStrategy(), // Passive
  [RoleType.LYCAN]: new VillagerStrategy(), // Passive
  [RoleType.LONE_WOLF]: new LoneWolfStrategy(),
  [RoleType.TANNER]: new VillagerStrategy(), // Passive
  [RoleType.CURSED]: new VillagerStrategy(), // Passive
  [RoleType.DOPPELGANGER]: new DoppelgangerStrategy(),
  [RoleType.WOLF_CUB]: new WolfCubStrategy(),
};

export const getRoleStrategy = (roleType: RoleType): RoleStrategy => {
  return strategies[roleType] || new VillagerStrategy();
};
