
import { GameState, Player, NightAction, PlayerFlags, RoleType, GamePhase, ActionType } from '../types';
import { getRoleStrategy, getNeighbors } from './RoleSystem';
import { ROLES } from '../constants';

// --- WIN CONDITION CHECKER ---
export const checkWinCondition = (players: Player[], extraState?: { hoodlumTargets?: string[] }): { winner: string | null, reason: string | null } => {
  const alivePlayers = players.filter(p => p.isAlive);
  
  if (alivePlayers.length === 0) return { winner: null, reason: 'ทุกคนตายหมด! เสมอกัน' };

  // 1. Cult Leader Win
  const cultLeader = alivePlayers.find(p => p.role.type === RoleType.CULT_LEADER);
  if (cultLeader) {
     const allCult = alivePlayers.every(p => p.role.type === RoleType.CULT_LEADER || p.attributes?.isCultMember);
     if (allCult) return { winner: 'Cult', reason: 'ลัทธิครอบงำหมู่บ้านสำเร็จ! (Cult Leader Wins)' };
  }

  // 2. Hoodlum Win (Check if all targets dead)
  // Note: Hoodlum must be alive.
  const hoodlum = alivePlayers.find(p => p.role.type === RoleType.HOODLUM);
  if (hoodlum && hoodlum.attributes?.hoodlumTargets) {
     const targets = hoodlum.attributes.hoodlumTargets;
     const targetsDead = targets.every(tid => !players.find(p => p.id === tid)?.isAlive);
     if (targetsDead) return { winner: 'Hoodlum', reason: 'อันธพาลเก็บกวาดเป้าหมายเรียบ! (Hoodlum Wins)' };
  }

  // 3. Lovers / Third Party Win
  // If only Lovers remain (and they are on different teams initially or standard Lovers win condition)
  // Simply: If alive count == 2 and they are lovers.
  if (alivePlayers.length === 2) {
      const p1 = alivePlayers[0];
      const p2 = alivePlayers[1];
      if (p1.attributes?.loversId === p2.id) {
          return { winner: 'Lovers', reason: 'ความรักชนะทุกสิ่ง! คู่รักรอดชีวิตเป็นคู่สุดท้าย' };
      }
  }

  // 4. Lone Wolf Win
  const wolves = alivePlayers.filter(p => p.role.alignment === 'Evil' || p.role.team.includes('Werewolf'));
  const villagers = alivePlayers.filter(p => p.role.alignment === 'Good' || p.role.alignment === 'Neutral');
  
  const loneWolf = wolves.find(p => p.role.type === RoleType.LONE_WOLF);
  if (wolves.length === 1 && loneWolf && villagers.length === 0) {
      return { winner: 'Lone Wolf', reason: 'หมาป่าเดียวดายยืนหยัดเป็นคนสุดท้าย!' };
  }

  // 5. Chupacabra Win
  const chupacabra = alivePlayers.find(p => p.role.type === RoleType.CHUPACABRA);
  if (alivePlayers.length === 1 && chupacabra) {
      return { winner: 'Chupacabra', reason: 'ชูปากาบรัสสังหารทุกคน!' };
  }

  // 6. Standard Conditions
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

        // 2. Vampire Bite Check (Delayed Death)
        // Implemented: If vampire selected victim, victim dies ONLY if voted.
        // Actually standard voting kills anyway. Vampire skill says "Victim dies ONLY if voted".
        // This implies they die normally if voted. No special logic needed unless mechanism protects them otherwise.
        
        // 3. Tanner Check
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

  // Handle Lovers Death Loop (Day)
  let deathLoop = true;
  while(deathLoop) {
      deathLoop = false;
      const currentlyDeadIds = executedPlayers.map(p => p.id);
      nextPlayers.forEach(p => {
          if (p.isAlive && p.attributes?.loversId && currentlyDeadIds.includes(p.attributes.loversId)) {
               p.isAlive = false;
               executedPlayers.push(p);
               events.push(`${p.name} ตรอมใจตายตามคู่รัก...`);
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
          isBanished: false, isSilenced: false, isVampireBit: false, isProtectedFromWolvesOnly: false
        },
        privateResult: ''
      }
    ])
  );

  const actions = [...currentState.nightActions].sort((a, b) => a.priority - b.priority);
  
  let nextExecutionCount = 1;
  let wolvesDisabledNextTurn = false;
  let wolfExtraKillsNextTurn = 0;
  
  // 1. ACTION PROCESSING
  for (const action of actions) {
    const actor = playersMap.get(action.actorId);
    const target = playersMap.get(action.targetId);
    if (!actor || !target || !actor.isAlive) continue;

    // A. BLOCKERS (Spellcaster/Old Woman technically day effects, but if block roles existed, handle here)
    // Assuming Roleblocker role exists? (Not in list, but Spellcaster silences NEXT day). 
    
    // B. SPECIAL SETUP (Night 1)
    if (action.type === ActionType.LINK && actor.role.type === RoleType.CUPID) {
        // Cupid sends targetId (1st lover). Need UI to send additionalTargetId or 2 actions.
        // Assuming simplistic implementation: Cupid links Actor + Target if self not excluded, 
        // OR better: In this engine, let's assume Cupid links Target and 'additionalTargetId' if provided.
        // If simplistic: Cupid selects Target. Who is the second?
        // Let's rely on attribute logic:
        // Cupid Logic: Target 1 is `target`. Target 2?
        // Let's skip complex UI for now and assume Cupid links THEMSELVES to Target if single selection.
        if (!actor.hasUsedAbility) {
            actor.hasUsedAbility = true;
            actor.attributes = { ...actor.attributes, loversId: target.id };
            target.attributes = { ...target.attributes, loversId: actor.id };
            actor.privateResult = `คุณผูกด้ายแดงกับ ${target.name} แล้ว`;
            target.privateResult = `คุณรู้สึกถึงความรัก... คุณคือคู่รักของ ${actor.name}`;
        }
        continue;
    }
    
    if (action.type === ActionType.LINK && actor.role.type === RoleType.HOODLUM) {
        if (!actor.attributes) actor.attributes = { hoodlumTargets: [] };
        if (!actor.attributes.hoodlumTargets?.includes(target.id)) {
            actor.attributes.hoodlumTargets = [...(actor.attributes.hoodlumTargets || []), target.id];
            actor.privateResult = `คุณหมายหัว ${target.name}`;
        }
        continue;
    }

    // C. INFORMATION ROLES
    if (action.type === ActionType.CHECK_AURA && actor.role.type === RoleType.AURA_SEER) {
         const isSpecial = target.role.type !== RoleType.VILLAGER && target.role.type !== RoleType.WEREWOLF;
         actor.privateResult = isSpecial ? `${target.name}: THUMB UP (Special)` : `${target.name}: THUMB DOWN (Normal)`;
         continue;
    }

    if (action.type === ActionType.CHECK_PARANORMAL && actor.role.type === RoleType.PARANORMAL_INVESTIGATOR) {
         const neighbors = getNeighbors(Array.from(playersMap.values()), target.id);
         const subjects = [target, ...neighbors];
         const hasWolf = subjects.some(s => s.role.team === 'Team Werewolf' || s.role.alignment === 'Evil'); // Simplified
         actor.privateResult = hasWolf ? "YES (พบกลิ่นอายหมาป่า)" : "NO (ไม่พบสิ่งผิดปกติ)";
         continue;
    }
    
    if (action.type === ActionType.INVESTIGATE && actor.role.type === RoleType.SORCERESS) {
         const isSeer = target.role.type === RoleType.SEER;
         actor.privateResult = isSeer ? `เจอแล้ว! ${target.name} คือผู้หยั่งรู้!` : `${target.name} ไม่ใช่ผู้หยั่งรู้`;
         continue;
    }

    // D. CONVERSION
    if (action.type === ActionType.CONVERT && actor.role.type === RoleType.CULT_LEADER) {
        // Can convert? 
        target.attributes = { ...target.attributes, isCultMember: true };
        actor.privateResult = `${target.name} ได้เข้าร่วมลัทธิแล้ว`;
        target.privateResult = `คุณถูกชักชวนเข้าลัทธิ! ตอนนี้คุณเป็นสาวกของ ${actor.name}`;
        continue;
    }

    // E. STATUS EFFECTS
    if (action.type === ActionType.SILENCE && actor.role.type === RoleType.SPELLCASTER) {
        target.flags.isSilenced = true;
        actor.privateResult = `คุณร่ายเวทใบ้ใส่ ${target.name}`;
        continue;
    }
    
    if (action.type === ActionType.BANISH && actor.role.type === RoleType.OLD_WOMAN) {
        target.flags.isBanished = true;
        // Banished cannot be killed tonight? Prompt says "Not killed during the DAY". 
        // Assuming effect applies to Day Phase.
        actor.privateResult = `คุณขับไล่ ${target.name}`;
        continue;
    }

    // F. KILLING ROLES (Handle Immunities)
    if (action.type === ActionType.KILL) {
        // Diseased Check: If wolves kill diseased, set global flag for NEXT turn.
        // Wait, disabling happens NEXT turn.
        // Protection Check
        if (target.flags.isProtected) {
             actor.privateResult = `การโจมตี ${target.name} ล้มเหลว!`;
             continue;
        }
        
        // Diseased Logic (Wolf Attack)
        if (actor.role.type === RoleType.WEREWOLF || actor.role.type === RoleType.WOLF_MAN || actor.role.type === RoleType.WOLF_CUB) {
             if (currentState.wolvesDisabled) {
                 actor.privateResult = "ฝูงหมาป่าติดโรค! ไม่สามารถล่าได้ในคืนนี้";
                 continue;
             }
             
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
             
             // Diseased Trigger (If kill succeeds)
             if (target.role.type === RoleType.DISEASED) {
                 wolvesDisabledNextTurn = true;
             }
        }
        
        // Mark for death
        target.flags.isMarkedForDeath = true;
        
        // Wolf Cub Trigger
        if (target.role.type === RoleType.WOLF_CUB) {
             // If Wolf Cub dies (by Hunter/Witch/Chupacabra), wolves get +kills.
             // Actually, Wolf Cub creates benefit if HE dies.
             // This logic block handles ATTACKING.
        }
    }
    
    // Standard Strategy Execute
    const strategy = getRoleStrategy(actor.role.type);
    strategy.execute(action, target.flags, actor.flags);
  }

  // 2. PASSIVE INFORMATION (Beholder, etc)
  playersMap.forEach(p => {
      if (p.role.type === RoleType.BEHOLDER && currentState.currentTurn === 1) {
          const seer = Array.from(playersMap.values()).find(x => x.role.type === RoleType.SEER);
          p.privateResult = seer ? `ผู้หยั่งรู้ตัวจริงคือ: ${seer.name}` : `ไม่พบผู้หยั่งรู้ในหมู่บ้าน`;
      }
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

  // Chain Reactions (Lovers, Hunter, Dire Wolf)
  while (newDeathFound) {
      newDeathFound = false;
      playersMap.forEach(actor => {
           if (!actor.isAlive && !deadThisTurn.has(actor.id)) return; // Already processed dead
           if (actor.isAlive) {
               // Lovers Check
               if (actor.attributes?.loversId && deadThisTurn.has(actor.attributes.loversId)) {
                   if(markDead(actor, "ตรอมใจตายตามคู่รัก")) newDeathFound = true;
               }
               // Dire Wolf Check
               if (actor.role.type === RoleType.DIRE_WOLF && actor.attributes?.linkedPartnerId && deadThisTurn.has(actor.attributes.linkedPartnerId)) {
                   if(markDead(actor, "ตายตามคู่หูที่ผูกวิญญาณไว้")) newDeathFound = true;
               }
           }
           // Revealer Check (If target wasn't wolf, Revealer dies. Logic usually in Strategy/Action processing, but simpler here if action stored target)
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
    wolvesDisabled: wolvesDisabledNextTurn,
    wolfExtraKills: wolfExtraKillsNextTurn
  };
};
