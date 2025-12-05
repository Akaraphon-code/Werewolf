
import { GameState, Player, NightAction, PlayerFlags } from '../types';
import { getRoleStrategy } from './RoleSystem';

/**
 * GAME LOGIC ARCHITECT
 * Core function to resolve the "Night Phase" into "Day Phase".
 * 
 * Logic Flow:
 * 1. Reset all player flags (clean slate).
 * 2. Apply Actions based on Priority (Bodyguard < Wolf < Killer).
 * 3. Resolve Death:
 *    - Unstoppable (Doom) -> Die (Ignore Protect).
 *    - Standard (Mark) -> Die (Unless Protected).
 * 4. Generate Logs in Thai.
 */
export const resolveNightPhase = (
  currentState: GameState
): { updatedPlayers: Player[]; events: string[] } => {
  
  // 1. Setup: Deep copy players to map for O(1) lookup & mutation
  // Reset flags for the new calculation
  const playersMap = new Map<string, Player>(
    currentState.players.map(p => [
      p.id, 
      { 
        ...p, 
        flags: { 
          isProtected: false, 
          isRoleblocked: false, 
          isMarkedForDeath: false, 
          isRevealed: false, 
          isDoomed: false 
        } 
      }
    ])
  );

  const actions = [...currentState.nightActions];

  // 2. Sort Actions by Priority
  // Lower Priority # runs FIRST (e.g. Block=0, Protect=1, Kill=5)
  // This ensures Bodyguard applies protection BEFORE Werewolf checks it.
  actions.sort((a, b) => a.priority - b.priority);

  // 3. Execute Strategies (Apply Flags)
  for (const action of actions) {
    const actor = playersMap.get(action.actorId);
    const target = playersMap.get(action.targetId);

    if (!actor || !target || !actor.isAlive) continue;

    const strategy = getRoleStrategy(actor.role.type);
    
    // The strategy modifies the 'target.flags' directly
    strategy.execute(action, target.flags, actor.flags);
  }

  // 4. Resolve Death & Generate Logs
  const finalPlayers: Player[] = [];
  const events: string[] = [];
  const deadThisTurn: string[] = [];
  
  playersMap.forEach(player => {
    if (!player.isAlive) {
      finalPlayers.push(player);
      return;
    }

    let isDead = false;
    let deathReason = "";

    // PRIORITY 1: UNSTOPPABLE ATTACK (Serial Killer)
    if (player.flags.isDoomed) {
      isDead = true;
      deathReason = "ถูกฆาตกรต่อเนื่องสังหาร (ทะลุเกราะ)";
    } 
    // PRIORITY 2: STANDARD ATTACK (Werewolf)
    else if (player.flags.isMarkedForDeath) {
      if (player.flags.isProtected) {
        // SURVIVES: Protected by Bodyguard
        // events.push(`${player.name} รอดตายเพราะมีคนปกป้อง`); // Optional: Reveal saves?
      } else {
        // DIES: Not protected
        isDead = true;
        deathReason = "ถูกหมาป่าสังหาร";
      }
    }

    // Apply State Change
    if (isDead) {
      player.isAlive = false;
      deadThisTurn.push(player.name);
      events.push(`${player.name} ${deathReason}`);
    }
    
    finalPlayers.push(player);
  });

  // 5. Final Summary Log
  if (deadThisTurn.length > 0) {
    events.push(`สรุปผู้เสียชีวิตเมื่อคืน: ${deadThisTurn.join(', ')}`);
  } else {
    events.push(`เช้าวันใหม่มาถึง... เป็นคืนที่เงียบสงบ ไม่มีใครเสียชีวิต`);
  }

  return {
    updatedPlayers: finalPlayers,
    events
  };
};
