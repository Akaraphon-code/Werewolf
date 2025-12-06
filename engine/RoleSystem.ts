
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

// --- PRIORITY 0: Setup & Transformation ---

export class DoppelgangerStrategy extends RoleStrategy {
  type = RoleType.DOPPELGANGER;
  priority = 0;
  getActionType() { return ActionType.LINK; }
  canTarget(actor: Player, target: Player): boolean {
    return super.canTarget(actor, target) && !actor.attributes?.doppelgangerTargetId;
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

export class DireWolfStrategy extends RoleStrategy {
  type = RoleType.DIRE_WOLF;
  priority = 0; 
  getActionType() { return ActionType.LINK; }
  canTarget(actor: Player, target: Player): boolean {
    return super.canTarget(actor, target) && !actor.attributes?.linkedPartnerId;
  }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

export class MinionStrategy extends RoleStrategy {
  type = RoleType.MINION;
  priority = 0;
  getActionType() { return ActionType.NO_ACTION; }
  execute(): void {}
}

export class MasonStrategy extends RoleStrategy {
  type = RoleType.MASON;
  priority = 0;
  getActionType() { return ActionType.NO_ACTION; }
  execute(): void {}
}

// --- PRIORITY 1: Blocking & Status ---

export class SpellcasterStrategy extends RoleStrategy {
  type = RoleType.SPELLCASTER;
  priority = 1;
  getActionType() { return ActionType.SILENCE; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
     if (actorFlags.isRoleblocked) return;
     targetFlags.isSilenced = true;
  }
}

// --- PRIORITY 2: Protection ---

export class BodyguardStrategy extends RoleStrategy {
  type = RoleType.BODYGUARD;
  priority = 2;
  getActionType() { return ActionType.PROTECT; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    targetFlags.isProtected = true;
  }
}

export class PriestStrategy extends RoleStrategy {
  type = RoleType.PRIEST;
  priority = 2;
  getActionType() { return ActionType.CONDITIONAL_KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

export class WitchStrategy extends RoleStrategy {
  type = RoleType.WITCH;
  // Default priority, overridden in createAction
  priority = 2; 
  getActionType() { return ActionType.POISON; } 
  
  createAction(actorId: string, targetId: string, actionType?: ActionType): NightAction {
    const type = actionType || ActionType.POISON;
    // HEAL = Priority 2 (Protection)
    // POISON = Priority 3 (Killing)
    const dynamicPriority = type === ActionType.HEAL ? 2 : 3;

    return {
      id: crypto.randomUUID(),
      actorId,
      targetId,
      type: type, 
      priority: dynamicPriority
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

// --- PRIORITY 3: Killing & Attacks ---

export class WerewolfStrategy extends RoleStrategy {
  type = RoleType.WEREWOLF;
  priority = 3;
  getActionType() { return ActionType.KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    targetFlags.isMarkedForDeath = true;
  }
}

export class WolfManStrategy extends RoleStrategy {
  type = RoleType.WOLF_MAN;
  priority = 3;
  getActionType() { return ActionType.KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    targetFlags.isMarkedForDeath = true;
  }
}

export class WolfCubStrategy extends RoleStrategy {
    type = RoleType.WOLF_CUB;
    priority = 3;
    getActionType() { return ActionType.KILL; }
    execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
        if (actorFlags.isRoleblocked) return;
        targetFlags.isMarkedForDeath = true;
    }
}

export class LoneWolfStrategy extends RoleStrategy {
    type = RoleType.LONE_WOLF;
    priority = 3;
    getActionType() { return ActionType.KILL; }
    execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
        if (actorFlags.isRoleblocked) return;
        targetFlags.isMarkedForDeath = true;
    }
}

export class SerialKillerStrategy extends RoleStrategy {
  type = RoleType.SERIAL_KILLER;
  priority = 3;
  getActionType() { return ActionType.KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    targetFlags.isMarkedForDeath = true;
    targetFlags.isDoomed = true; 
  }
}

export class RevealerStrategy extends RoleStrategy {
  type = RoleType.REVEALER;
  priority = 3;
  getActionType() { return ActionType.CONDITIONAL_KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

export class HunterStrategy extends RoleStrategy {
  type = RoleType.HUNTER;
  priority = 3; 
  getActionType() { return ActionType.CONDITIONAL_KILL; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

// --- PRIORITY 4: Investigation & Mischief ---

export class SeerStrategy extends RoleStrategy {
  type = RoleType.SEER;
  priority = 4;
  getActionType() { return ActionType.INVESTIGATE; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {
    if (actorFlags.isRoleblocked) return;
    targetFlags.isRevealed = true;
  }
}

export class ApprenticeSeerStrategy extends RoleStrategy {
  type = RoleType.APPRENTICE_SEER;
  priority = 4;
  getActionType() { return ActionType.INVESTIGATE; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

export class TroublemakerStrategy extends RoleStrategy {
  type = RoleType.TROUBLEMAKER;
  priority = 4;
  getActionType() { return ActionType.TROUBLEMAKE; }
  canTarget(actor: Player, target: Player): boolean {
    return super.canTarget(actor, target) && !actor.hasUsedAbility;
  }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

// --- PRIORITY 5: Late Info ---

export class InsomniacStrategy extends RoleStrategy {
  type = RoleType.INSOMNIAC;
  priority = 5;
  getActionType() { return ActionType.NO_ACTION; }
  execute(action: NightAction, targetFlags: PlayerFlags, actorFlags: PlayerFlags): void {}
}

// --- OTHERS / PASSIVE ---

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
  // Priority 0
  [RoleType.DOPPELGANGER]: new DoppelgangerStrategy(),
  [RoleType.CHANGELING]: new ChangelingStrategy(),
  [RoleType.DIRE_WOLF]: new DireWolfStrategy(),
  [RoleType.MINION]: new MinionStrategy(),
  [RoleType.MASON]: new MasonStrategy(),

  // Priority 1
  [RoleType.SPELLCASTER]: new SpellcasterStrategy(),

  // Priority 2
  [RoleType.BODYGUARD]: new BodyguardStrategy(), 
  [RoleType.PRIEST]: new PriestStrategy(),
  [RoleType.WITCH]: new WitchStrategy(), // Mix 2 & 3

  // Priority 3
  [RoleType.WEREWOLF]: new WerewolfStrategy(),
  [RoleType.WOLF_MAN]: new WolfManStrategy(),
  [RoleType.WOLF_CUB]: new WolfCubStrategy(),
  [RoleType.LONE_WOLF]: new LoneWolfStrategy(),
  [RoleType.SERIAL_KILLER]: new SerialKillerStrategy(),
  [RoleType.REVEALER]: new RevealerStrategy(),
  [RoleType.HUNTER]: new HunterStrategy(), 

  // Priority 4
  [RoleType.SEER]: new SeerStrategy(),
  [RoleType.APPRENTICE_SEER]: new ApprenticeSeerStrategy(),
  [RoleType.TROUBLEMAKER]: new TroublemakerStrategy(),

  // Priority 5
  [RoleType.INSOMNIAC]: new InsomniacStrategy(),

  // Passive / Others
  [RoleType.VILLAGER]: new VillagerStrategy(),
  [RoleType.MEDIUM]: new VillagerStrategy(),
  [RoleType.JESTER]: new VillagerStrategy(),
  [RoleType.DRUNK]: new VillagerStrategy(),
  [RoleType.PRINCE]: new VillagerStrategy(), 
  [RoleType.TOUGH_GUY]: new VillagerStrategy(), 
  [RoleType.VILLAGER_IDIOT]: new VillagerStrategy(), 
  [RoleType.LYCAN]: new VillagerStrategy(), 
  [RoleType.TANNER]: new VillagerStrategy(), 
  [RoleType.CURSED]: new VillagerStrategy(), 
};

export const getRoleStrategy = (roleType: RoleType): RoleStrategy => {
  return strategies[roleType] || new VillagerStrategy();
};
