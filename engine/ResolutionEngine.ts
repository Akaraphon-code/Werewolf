
import { GameState, Player, NightAction, PlayerFlags, RoleType, GamePhase, ActionType } from '../types';
import { getRoleStrategy, getNeighbors } from './RoleSystem';
import { ROLES } from '../constants';

// --- WIN CONDITION CHECKER ---
export const checkWinCondition = (players: Player[]): { winner: string | null, reason: string | null } => {
  const alivePlayers = players.filter(p => p.isAlive);
  
  if (alivePlayers.length === 0) return { winner: null, reason: 'ทุกคนตายหมด! เสมอกัน' };

  // 1. Lone Wolf Win
  const wolves = alivePlayers.filter(p => p.role.alignment === 'Evil' || p.role.team.includes('Werewolf'));
  const villagers = alivePlayers.filter(p => p.role.alignment === 'Good' || p.role.alignment === 'Neutral');
  
  const loneWolf = wolves.find(p => p.role.type === RoleType.LONE_WOLF);
  if (wolves.length === 1 && loneWolf && villagers.length === 0) {
      return { winner: 'Lone Wolf', reason: 'หมาป่าเดียวดายยืนหยัดเป็นคนสุดท้าย!' };
  }

  // 2. Standard Conditions
  if (wolves.length >= villagers.length && wolves.length > 0) {
    return { winner: 'Evil', reason: 'หมาป่าครองเมือง! (จำนวนหมาป่ามากกว่าหรือเท่ากับชาวบ้าน)' };
  }
  if (wolves.length === 0) {
    return { winner: 'Good', reason: 'ชาวบ้านชนะ! (กำจัดหมาป่าได้หมดสิ้น)' };
  }
  return { winner: null, reason: null };
};

// --- INHERITANCE & TRANSFORMATION HELPER ---
const processTransformations = (players: Player[], deadIds: Set<string>): string[] => {
  const events: string[] = [];
  
  players.forEach(p => {
    if (!p.isAlive) return;

    // Apprentice Seer -> Seer
    if (p.role.type === RoleType.APPRENTICE_SEER) {
      const seers = players.filter(x => x.role.type === RoleType.SEER);
      const allSeersDead = seers.length > 0 && seers.every(s => !s.isAlive || deadIds.has(s.id));
      if (allSeersDead) {
        p.role = ROLES[RoleType.SEER];
        p.privateResult = (p.privateResult || '') + '\n[ข่าวลับ] คุณสืบทอดพลังเป็นผู้หยั่งรู้แล้ว!';
        events.push(`พลังลึกลับได้ถูกสืบทอด...`);
      }
    }

    // Doppelganger -> Target Role
    if (p.role.type === RoleType.DOPPELGANGER && p.attributes?.doppelgangerTargetId) {
        const targetId = p.attributes.doppelgangerTargetId;
        const target = players.find(x => x.id === targetId);
        if (target && (!target.isAlive || deadIds.has(targetId))) {
            p.role = target.role;
            p.hasUsedAbility = false; 
            p.privateResult = (p.privateResult || '') + `\n[ข่าวลับ] ${target.name} ตายแล้ว! คุณจึงสวมรอยเป็น ${target.role.name}`;
            delete p.attributes.doppelgangerTargetId;
            events.push(`เงาปริศนาได้เคลื่อนไหว...`);
        }
    }
    
    // Changeling -> Target Role (Legacy support)
    if (p.role.type === RoleType.CHANGELING && p.attributes?.changelingTargetId) {
       const targetId = p.attributes.changelingTargetId;
       const target = players.find(x => x.id === targetId);
       if (target && (!target.isAlive || deadIds.has(targetId))) {
          p.role = target.role;
          p.privateResult = (p.privateResult || '') + `\n[ข่าวลับ] ${target.name} ตายแล้ว! คุณสวมรอยเป็น ${target.role.name}`;
          delete p.attributes.changelingTargetId;
          events.push(`เงาปริศนาได้เคลื่อนไหว...`);
       }
    }
  });

  return events;
};

// --- RESOLVE VOTING ---
export const resolveVotingPhase = (
  players: Player[],
  votes: Record<string, string>,
  executionCount: number = 1 
): { updatedPlayers: Player[], events: string[], nextPhase: GamePhase, winner: any } => {
  
  const events: string[] = [];
  const voteCounts: Record<string, number> = {};

  Object.values(votes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  });

  const sortedCandidates = Object.entries(voteCounts).sort(([, a], [, b]) => b - a);

  let executedPlayers: Player[] = [];
  const nextPlayers = players.map(p => ({ ...p })); 

  if (sortedCandidates.length > 0) {
    const maxVotes = sortedCandidates[0][1];
    let targetsToExecute: string[] = [];
    
    if (executionCount > 1) {
      targetsToExecute = sortedCandidates.slice(0, executionCount).map(c => c[0]);
      events.push(`วันนี้ต้องมีการประหาร ${executionCount} คน!`);
    } else {
      const winners = sortedCandidates.filter(c => c[1] === maxVotes);
      if (winners.length === 1) {
        targetsToExecute = [winners[0][0]];
      } else {
        events.push(`คะแนนโหวตเท่ากัน ไม่มีใครถูกประหาร`);
      }
    }

    targetsToExecute.forEach(targetId => {
      const pIndex = nextPlayers.findIndex(p => p.id === targetId);
      if (pIndex !== -1) {
        const p = nextPlayers[pIndex];
        
        // 1. Prince Check
        if (p.role.type === RoleType.PRINCE && !p.flags.isRevealed) {
            p.flags.isRevealed = true;
            events.push(`ผลโหวตคือ ${p.name}... แต่เขาแสดงตรา "เจ้าชาย"! จึงไม่สามารถประหารได้!`);
            return;
        }

        // 2. Tanner Check
        if (p.role.type === RoleType.TANNER) {
            p.isAlive = false;
            executedPlayers.push(p);
            events.push(`${p.name} ถูกประหาร... และเขาก็หัวเราะอย่างบ้าคลั่ง! (Tanner Wins)`);
            return;
        }

        p.isAlive = false;
        executedPlayers.push(p);
        events.push(`${p.name} ถูกประหารชีวิต! (${voteCounts[targetId]} คะแนน)`);
        
        // Hunter Retribution
        if (p.role.type === RoleType.HUNTER && p.attributes?.retributionTargetId) {
             const hunterTarget = nextPlayers.find(t => t.id === p.attributes?.retributionTargetId);
             if (hunterTarget && hunterTarget.isAlive) {
                 hunterTarget.isAlive = false;
                 events.push(`นายพราน ${p.name} ยิงสวนใส่ ${hunterTarget.name} ก่อนตาย!`);
                 executedPlayers.push(hunterTarget);
             }
        }
      }
    });
  } else {
    events.push(`ไม่มีใครโหวต...`);
  }

  // Handle Secondary Deaths (Dire Wolf)
  let deathLoop = true;
  while(deathLoop) {
      deathLoop = false;
      const currentlyDeadIds = executedPlayers.map(p => p.id);
      nextPlayers.forEach(p => {
          // Dire Wolf check
          if (p.isAlive && p.role.type === RoleType.DIRE_WOLF && p.attributes?.linkedPartnerId && currentlyDeadIds.includes(p.attributes.linkedPartnerId)) {
               p.isAlive = false;
               executedPlayers.push(p);
               events.push(`${p.name} ตายตามคู่หูที่ผูกวิญญาณไว้ (Dire Wolf)...`);
               deathLoop = true;
          }
      });
  }

  // Process Inheritance
  const deadIds = new Set(executedPlayers.map(p => p.id));
  const transEvents = processTransformations(nextPlayers, deadIds);
  events.push(...transEvents);

  // Check Immediate Wins (Tanner/Jester)
  const tanner = executedPlayers.find(p => p.role.type === RoleType.TANNER);
  if (tanner) {
      return { updatedPlayers: nextPlayers, events, nextPhase: GamePhase.GAME_OVER, winner: 'Tanner' };
  }
  const jester = executedPlayers.find(p => p.role.type === RoleType.JESTER);
  if (jester) {
    return { updatedPlayers: nextPlayers, events: [...events, `JESTER WIN! ${jester.name} หลอกให้พวกเจ้าฆ่าสำเร็จ!`], nextPhase: GamePhase.GAME_OVER, winner: 'Jester' };
  }

  const winState = checkWinCondition(nextPlayers);
  if (winState.winner) {
    return { updatedPlayers: nextPlayers, events: [...events, winState.reason!], nextPhase: GamePhase.GAME_OVER, winner: winState.winner };
  }

  return { updatedPlayers: nextPlayers, events, nextPhase: GamePhase.NIGHT, winner: null };
};

// --- RESOLVE NIGHT ---
export const resolveNightPhase = (
  currentState: GameState
): { updatedPlayers: Player[]; events: string[]; winner?: any; nextPhase: GamePhase; nextExecutionCount: number; wolvesDisabled: boolean; wolfExtraKills: number } => {
  
  const playersMap = new Map<string, Player>(
    currentState.players.map(p => [
      p.id, 
      { 
        ...p, 
        flags: { 
          isProtected: false, isRoleblocked: false, isMarkedForDeath: false, isRevealed: false, isDoomed: false,
          isSilenced: false, isProtectedFromWolvesOnly: false
        },
        privateResult: ''
      }
    ])
  );

  // CRITICAL: SORT ACTIONS BY PRIORITY (Lower = Earlier)
  const actions = [...currentState.nightActions].sort((a, b) => a.priority - b.priority);
  
  let nextExecutionCount = 1;
  let wolfExtraKillsNextTurn = 0;
  
  // 1. ACTION PROCESSING
  for (const action of actions) {
    const actor = playersMap.get(action.actorId);
    const target = playersMap.get(action.targetId);
    if (!actor || !target || !actor.isAlive) continue;

    // A. STATUS EFFECTS
    if (action.type === ActionType.SILENCE && actor.role.type === RoleType.SPELLCASTER) {
        target.flags.isSilenced = true;
        actor.privateResult = `คุณร่ายเวทใบ้ใส่ ${target.name}`;
        continue;
    }
    
    // B. KILLING ROLES (Handle Immunities)
    if (action.type === ActionType.KILL) {
        
        // Protection Check
        if (target.flags.isProtected) {
             actor.privateResult = `การโจมตี ${target.name} ล้มเหลว!`;
             continue;
        }
        
        // Wolf Attack Logic
        if (actor.role.type === RoleType.WEREWOLF || actor.role.type === RoleType.WOLF_MAN || actor.role.type === RoleType.WOLF_CUB) {
             
             // Cursed Logic
             if (target.role.type === RoleType.CURSED) {
                 target.role = ROLES[RoleType.WEREWOLF];
                 target.privateResult = "คุณถูกหมาป่ากัด! เชื้อร้ายได้เปลี่ยนคุณเป็นมนุษย์หมาป่า";
                 actor.privateResult = `คุณกัด ${target.name}... แต่เขาไม่ตาย กลับกลายร่างเป็นพวกเดียวกัน!`;
                 continue; 
             }
             
             // Tough Guy Logic
             if (target.role.type === RoleType.TOUGH_GUY) {
                 target.attributes = { ...target.attributes, toughGuyDeathTurn: currentState.currentTurn + 1 };
                 actor.privateResult = `คุณกัด ${target.name} เต็มเขี้ยว แต่เขายังยืนอยู่ได้!`;
                 target.privateResult = `คุณถูกกัด! แผลฉกรรจ์มาก... คุณรู้ตัวว่าจะไม่รอดในคืนพรุ่งนี้`;
                 continue;
             }
        }
        
        // Mark for death
        target.flags.isMarkedForDeath = true;
    }
    
    // Standard Strategy Execute
    const strategy = getRoleStrategy(actor.role.type);
    strategy.execute(action, target.flags, actor.flags);
  }

  // 2. PASSIVE INFORMATION
  playersMap.forEach(p => {
      // Tough Guy Delayed Death Check
      if (p.attributes?.toughGuyDeathTurn === currentState.currentTurn) {
          p.flags.isMarkedForDeath = true;
          p.flags.isDoomed = true; // Cannot save delayed death
      }
  });

  // 3. RESOLVE DEATHS
  const events: string[] = [];
  const deadThisTurn = new Set<string>();
  let newDeathFound = true;

  const markDead = (p: Player, reason: string) => {
      if (p.isAlive && !deadThisTurn.has(p.id)) {
          p.isAlive = false;
          deadThisTurn.add(p.id);
          events.push(`${p.name} ${reason}`);
          
          // Wolf Cub Death Trigger
          if (p.role.type === RoleType.WOLF_CUB) {
              wolfExtraKillsNextTurn = 2; // Simple implementation flag
              events.push("ลูกหมาป่าตายแล้ว! ฝูงหมาป่ากำลังบ้าคลั่ง (คืนหน้าฆ่าได้ 2 ศพ)");
          }
          return true;
      }
      return false;
  };

  // Initial Sweep
  playersMap.forEach(player => {
      if (!player.isAlive) return;
      if (player.flags.isDoomed) {
          markDead(player, "เสียชีวิต (บาดแผล/ยาพิษ)");
      } else if (player.flags.isMarkedForDeath && !player.flags.isProtected) {
          markDead(player, "ถูกสังหาร");
      }
  });

  // Chain Reactions (Dire Wolf)
  while (newDeathFound) {
      newDeathFound = false;
      playersMap.forEach(actor => {
           if (!actor.isAlive && !deadThisTurn.has(actor.id)) return; // Already processed dead
           if (actor.isAlive) {
               // Dire Wolf Check
               if (actor.role.type === RoleType.DIRE_WOLF && actor.attributes?.linkedPartnerId && deadThisTurn.has(actor.attributes.linkedPartnerId)) {
                   if(markDead(actor, "ตายตามคู่หูที่ผูกวิญญาณไว้")) newDeathFound = true;
               }
           }
      });
  }

  // Process Inheritance
  const allPlayers = Array.from(playersMap.values());
  const transEvents = processTransformations(allPlayers, deadThisTurn);
  events.push(...transEvents);
  
  if (deadThisTurn.size === 0) events.push("เช้าวันใหม่... ไม่มีใครเสียชีวิต");

  const finalPlayers = Array.from(playersMap.values());
  const winState = checkWinCondition(finalPlayers);

  if (winState.winner) {
      events.push(winState.reason!);
      return { 
          updatedPlayers: finalPlayers, events, nextPhase: GamePhase.GAME_OVER, winner: winState.winner, nextExecutionCount, wolvesDisabled: false, wolfExtraKills: 0 
      };
  }

  return {
    updatedPlayers: finalPlayers,
    events,
    nextPhase: GamePhase.DAY,
    nextExecutionCount,
    wolvesDisabled: false,
    wolfExtraKills: wolfExtraKillsNextTurn
  };
};
