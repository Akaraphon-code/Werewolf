
import { GameState, Player, NightAction, PlayerFlags, RoleType, GamePhase, ActionType } from '../types';
import { getRoleStrategy, getNeighbors } from './RoleSystem';
import { ROLES } from '../constants';

export const checkWinCondition = (players: Player[]): { winner: 'Good' | 'Evil' | null, reason: string | null } => {
  const alivePlayers = players.filter(p => p.isAlive);
  const wolves = alivePlayers.filter(p => p.role.alignment === 'Evil');
  const villagers = alivePlayers.filter(p => p.role.alignment === 'Good' || p.role.alignment === 'Neutral');

  if (wolves.length >= villagers.length && wolves.length > 0) {
    return { winner: 'Evil', reason: 'หมาป่าครองเมือง! (จำนวนหมาป่ามากกว่าหรือเท่ากับชาวบ้าน)' };
  }
  if (wolves.length === 0) {
    return { winner: 'Good', reason: 'ชาวบ้านชนะ! (กำจัดหมาป่าได้หมดสิ้น)' };
  }
  return { winner: null, reason: null };
};

// HELPER: Check and process inheritance (Apprentice -> Seer, Changeling -> Target)
const processInheritance = (players: Player[], deadIds: Set<string>): string[] => {
  const events: string[] = [];
  
  players.forEach(p => {
    if (!p.isAlive) return;

    // Apprentice Seer -> Seer
    if (p.role.type === RoleType.APPRENTICE_SEER) {
      // Check if ALL Seers are dead
      const seers = players.filter(x => x.role.type === RoleType.SEER);
      const allSeersDead = seers.length > 0 && seers.every(s => !s.isAlive || deadIds.has(s.id));
      
      if (allSeersDead) {
        p.role = ROLES[RoleType.SEER];
        p.privateResult = (p.privateResult || '') + '\n[ข่าวลับ] ผู้หยั่งรู้สิ้นชีพแล้ว! คุณได้รับสืบทอดพลังเป็นผู้หยั่งรู้คนใหม่';
        events.push(`พลังลึกลับได้ถูกสืบทอด... (Apprentice Promoted)`);
      }
    }

    // Changeling -> Target
    if (p.role.type === RoleType.CHANGELING && p.attributes?.changelingTargetId) {
       const targetId = p.attributes.changelingTargetId;
       const target = players.find(x => x.id === targetId);
       
       if (target && (!target.isAlive || deadIds.has(targetId))) {
          p.role = target.role;
          // Reset one-time abilities if necessary, or keep standard state
          p.hasUsedAbility = false; 
          p.privateResult = (p.privateResult || '') + `\n[ข่าวลับ] เป้าหมายของคุณ (${target.name}) ตายแล้ว! คุณสวมรอยเป็น ${target.role.name} แทน`;
          delete p.attributes.changelingTargetId; // Stop checking
          events.push(`เงาปริศนาได้เคลื่อนไหว... (Changeling Transform)`);
       }
    }
  });

  return events;
};

export const resolveVotingPhase = (
  players: Player[],
  votes: Record<string, string>,
  executionCount: number = 1 
): { updatedPlayers: Player[], events: string[], nextPhase: GamePhase, winner: 'Good' | 'Evil' | 'Jester' | null } => {
  
  const events: string[] = [];
  const voteCounts: Record<string, number> = {};

  Object.values(votes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  });

  const sortedCandidates = Object.entries(voteCounts)
    .sort(([, a], [, b]) => b - a);

  let executedPlayers: Player[] = [];
  const nextPlayers = players.map(p => ({ ...p })); 

  if (sortedCandidates.length > 0) {
    const maxVotes = sortedCandidates[0][1];
    let targetsToExecute: string[] = [];
    
    if (executionCount > 1) {
      targetsToExecute = sortedCandidates.slice(0, executionCount).map(c => c[0]);
      events.push(`ผลจากความวุ่นวายของ "ตัวป่วน" ทำให้วันนี้ต้องมีการประหาร ${executionCount} คน!`);
    } else {
      const winners = sortedCandidates.filter(c => c[1] === maxVotes);
      if (winners.length === 1) {
        targetsToExecute = [winners[0][0]];
      } else {
        events.push(`คะแนนโหวตเท่ากัน (${maxVotes} คะแนน) ไม่มีใครถูกประหารในวันนี้`);
      }
    }

    targetsToExecute.forEach(targetId => {
      const pIndex = nextPlayers.findIndex(p => p.id === targetId);
      if (pIndex !== -1) {
        const p = nextPlayers[pIndex];
        p.isAlive = false;
        executedPlayers.push(p);
        events.push(`ผลโหวตตัดสิน... ${p.name} ถูกประหารชีวิต! (${voteCounts[targetId]} คะแนน)`);
        
        // Handle Hunter Voting Death
        if (p.role.type === RoleType.HUNTER && p.attributes?.retributionTargetId) {
             const hunterTargetIndex = nextPlayers.findIndex(t => t.id === p.attributes?.retributionTargetId);
             if (hunterTargetIndex !== -1 && nextPlayers[hunterTargetIndex].isAlive) {
                 nextPlayers[hunterTargetIndex].isAlive = false;
                 events.push(`นายพราน ${p.name} ก่อนตายได้ลั่นไกใส่ ${nextPlayers[hunterTargetIndex].name} ตายตกไปตามกัน!`);
                 executedPlayers.push(nextPlayers[hunterTargetIndex]);
             }
        }
      }
    });
  } else {
    events.push(`ไม่มีใครโหวต... แยกย้ายกันไปนอน`);
  }

  // Check Inheritance after Day Deaths
  const deadIds = new Set(executedPlayers.map(p => p.id));
  const inheritanceEvents = processInheritance(nextPlayers, deadIds);
  events.push(...inheritanceEvents);

  // Jester Check
  const jester = executedPlayers.find(p => p.role.type === RoleType.JESTER);
  if (jester) {
    return {
      updatedPlayers: nextPlayers,
      events: [...events, `JESTER WIN! ${jester.name} คือตัวตลกที่หลอกให้พวกเจ้าฆ่าเขาสำเร็จ!`],
      nextPhase: GamePhase.GAME_OVER,
      winner: 'Jester'
    };
  }

  const winState = checkWinCondition(nextPlayers);
  if (winState.winner) {
    return {
      updatedPlayers: nextPlayers,
      events: [...events, winState.reason!],
      nextPhase: GamePhase.GAME_OVER,
      winner: winState.winner as 'Good' | 'Evil'
    };
  }

  return {
    updatedPlayers: nextPlayers,
    events,
    nextPhase: GamePhase.NIGHT,
    winner: null
  };
};

export const resolveNightPhase = (
  currentState: GameState
): { updatedPlayers: Player[]; events: string[]; winner?: 'Good' | 'Evil' | null; nextPhase: GamePhase; nextExecutionCount: number } => {
  
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
        },
        privateResult: '' // Reset private logs
      }
    ])
  );

  const actions = [...currentState.nightActions];
  // Sort actions: Protect/Heal first, then Investigate, then Kill
  // Strategies define priority, so sort descending (Higher priority executes last? No, priority numbers in RoleSystem are a bit mixed)
  // Let's standardise:
  // 1. Witch Heal / Bodyguard (Protection)
  // 2. Wolf / Killer / Witch Poison (Attacks)
  // 3. Seer / Info (Investigation - needs to see alive/dead state? Actually Seer just sees role)
  // Let's stick to the priority in RoleSystem, assuming lower number = earlier execution?
  // Current RoleSystem: Seer=10, Wolf=5, Bodyguard=1.
  // We want Protect (1) -> Kill (5) -> Seer (10). So Sort by Priority Ascending.
  actions.sort((a, b) => a.priority - b.priority);
  
  let nextExecutionCount = 1;

  // 1. EXECUTE ACTIONS
  for (const action of actions) {
    const actor = playersMap.get(action.actorId);
    const target = playersMap.get(action.targetId);
    if (!actor || !target || !actor.isAlive) continue;

    // --- Special Action Handlers ---
    
    // Hunter: Stores target for potential death trigger
    if ((action.type === ActionType.CONDITIONAL_KILL || action.type === ActionType.NO_ACTION) && actor.role.type === RoleType.HUNTER) {
         if (action.type === ActionType.CONDITIONAL_KILL) {
             if (!actor.attributes) actor.attributes = {};
             actor.attributes.retributionTargetId = target.id;
             actor.privateResult = `คุณเล็งเป้าไปที่ ${target.name} หากคืนนี้คุณตาย เขาจะตายด้วย`;
         }
         continue;
    }

    // Dire Wolf: Night 1 Link
    if (action.type === ActionType.LINK && actor.role.type === RoleType.DIRE_WOLF) {
        if (!actor.attributes?.linkedPartnerId) {
            if (!actor.attributes) actor.attributes = {};
            actor.attributes.linkedPartnerId = target.id;
            actor.privateResult = `คุณผูกจิตวิญญาณกับ ${target.name} แล้ว`;
        }
        continue;
    }

    // Changeling: Night 1 Target
    if (action.type === ActionType.LINK && actor.role.type === RoleType.CHANGELING) {
        if (!actor.attributes?.changelingTargetId) {
            if (!actor.attributes) actor.attributes = {};
            actor.attributes.changelingTargetId = target.id;
            actor.privateResult = `คุณจับตาดู ${target.name} หากเขาตาย คุณจะสวมรอยแทน`;
        }
        continue;
    }

    // Witch: Heal/Poison
    if (actor.role.type === RoleType.WITCH) {
         if (!actor.attributes) actor.attributes = { hasHealPotion: true, hasPoisonPotion: true };
         
         if (action.type === ActionType.HEAL && actor.attributes.hasHealPotion) {
             target.flags.isProtected = true;
             actor.attributes.hasHealPotion = false; // Consume Potion
             actor.privateResult = `คุณใช้ยาแก้พิษช่วยชีวิต ${target.name}`;
         } else if (action.type === ActionType.POISON && actor.attributes.hasPoisonPotion) {
             target.flags.isMarkedForDeath = true;
             target.flags.isDoomed = true;
             actor.attributes.hasPoisonPotion = false; // Consume Potion
             actor.privateResult = `คุณใช้ยาพิษสังหาร ${target.name}`;
         }
         continue;
    }
    
    // Priest
    if (action.type === ActionType.CONDITIONAL_KILL && actor.role.type === RoleType.PRIEST) {
        if (target.role.type === RoleType.WEREWOLF || target.role.type === RoleType.WOLF_MAN) {
             target.flags.isMarkedForDeath = true; 
             target.flags.isDoomed = true;
             actor.privateResult = `คุณสังหาร ${target.name} (หมาป่า) สำเร็จ!`;
        } else {
             actor.flags.isMarkedForDeath = true; 
             actor.flags.isDoomed = true;
             actor.privateResult = `คุณพลาด! ${target.name} ไม่ใช่หมาป่า คุณต้องรับผิดชอบด้วยชีวิต`;
        }
        continue;
    }

    // Troublemaker
    if (action.type === ActionType.TROUBLEMAKE) { 
         if (!actor.hasUsedAbility) {
             nextExecutionCount = 2;
             actor.hasUsedAbility = true;
             actor.privateResult = `คุณสร้างความวุ่นวายสำเร็จ! พรุ่งนี้จะมีการประหาร 2 คน`;
         }
         continue;
    }

    // Seer (Check for Wolf Man / Investigation Result)
    if (action.type === ActionType.INVESTIGATE && actor.role.type === RoleType.SEER) {
         target.flags.isRevealed = true;
         // Wolf Man -> investigationResult = Villager. Regular Wolf -> undefined (default to type).
         const seenRoleType = target.role.investigationResult || target.role.type; 
         const seenRoleData = ROLES[seenRoleType];
         const team = seenRoleData.alignment === 'Evil' ? 'ฝ่ายร้าย' : 'ฝ่ายดี';
         actor.privateResult = `นิมิตของคุณเห็นว่า ${target.name} คือ... ${team} (${seenRoleData.name})`;
         continue;
    }

    // Apprentice Seer (Action)
    // If they haven't promoted yet, they shouldn't have INVESTIGATE action usually, but if they do, ignore or handle.
    if (action.type === ActionType.INVESTIGATE && actor.role.type === RoleType.APPRENTICE_SEER) {
         // Should not happen unless logic elsewhere allows Apprentice to investigate before promotion.
         // Just in case:
         actor.privateResult = "คุณยังเป็นแค่ศิษย์ พลังยังไม่ตื่นขึ้น...";
         continue;
    }
    // --- เพิ่ม LOGIC ใหม่ตรงนี้ ---

    // 1. Minion (สมุนรับใช้): คืนแรก เห็นหมาป่า
    if (actor.role.type === RoleType.MINION && currentState.currentTurn === 1) {
         const wolves = Array.from(playersMap.values()).filter(p => 
             p.role.team === 'ทีมหมาป่า' && p.id !== actor.id
         );
         const wolfNames = wolves.map(w => w.name).join(', ');
         actor.privateResult = wolves.length > 0 
            ? `นายท่านของคุณคือ: ${wolfNames}`
            : `คืนนี้คุณไม่พบหมาป่าเลย (คุณอาจจะโดดเดี่ยว)`;
         continue;
    }

    // 2. Mason (ภราดรแห่งเมสัน): คืนแรก เห็นเพื่อน
    if (actor.role.type === RoleType.MASON && currentState.currentTurn === 1) {
         const otherMasons = Array.from(playersMap.values()).filter(p => 
             p.role.type === RoleType.MASON && p.id !== actor.id
         );
         const masonNames = otherMasons.map(m => m.name).join(', ');
         actor.privateResult = otherMasons.length > 0
            ? `คุณพบภราดรคนอื่น: ${masonNames}`
            : `คุณไม่พบภราดรคนอื่นเลย`;
         continue;
    }

    // 3. Insomniac (คนอดนอน): ทุกคืน เช็คคนข้างๆ
    if (actor.role.type === RoleType.INSOMNIAC) {
         const neighbors = getNeighbors(Array.from(playersMap.values()), actor.id);
         // เช็คว่าคนข้างๆ มี Action ในคืนนี้ไหม (ดูจาก actions list)
         const neighborIds = neighbors.map(n => n.id);
         const awakeNeighbors = actions.filter(a => neighborIds.includes(a.actorId));
         
         actor.privateResult = awakeNeighbors.length > 0
            ? `คุณสะดุ้งตื่น... และเห็นว่าคนข้างๆ ${awakeNeighbors.length} คน ลุกออกไปทำอะไรบางอย่าง!`
            : `คืนนี้เงียบสงบ... คนข้างๆ คุณหลับสนิทดี`;
         continue;
    }

    // 4. Drunk (ขี้เมา): คืนที่ 3 สร่างเมา
    if (actor.role.type === RoleType.DRUNK && currentState.currentTurn === 3) {
        // Logic นี้ขึ้นอยู่กับว่าคุณอยากให้ Drunk เป็นอะไร
        // แบบง่าย: บอกว่าเป็นชาวบ้านธรรมดา
        actor.privateResult = "คุณสร่างเมาแล้ว! และพบว่าตัวเองเป็นแค่... ชาวบ้านธรรมดาคนหนึ่ง";
        // หรือถ้าจะเปลี่ยน Role ก็ทำได้ตรงนี้ครับ
    }
    
    // --- STANDARD STRATEGIES ---
    const strategy = getRoleStrategy(actor.role.type);
    strategy.execute(action, target.flags, actor.flags);
  }

  // 2. RESOLVE DEATHS (Iterative Loop for Chain Reactions)
  const events: string[] = [];
  const deadThisTurn = new Set<string>();
  let newDeathFound = true;

  // Helper to mark dead
  const markDead = (p: Player, reason: string) => {
      if (p.isAlive && !deadThisTurn.has(p.id)) {
          p.isAlive = false;
          deadThisTurn.add(p.id);
          events.push(`${p.name} ${reason}`);
          return true;
      }
      return false;
  };

  // Initial Death Sweep (Attacks)
  playersMap.forEach(player => {
      if (!player.isAlive) return;
      if (player.flags.isDoomed) {
          markDead(player, "ถูกสังหาร (รุนแรง/ยาพิษ)");
      } else if (player.flags.isMarkedForDeath && !player.flags.isProtected) {
          markDead(player, "ถูกหมาป่าสังหาร");
      }
  });

  // Chain Reaction Loop
  while (newDeathFound) {
      newDeathFound = false;
      
      // Check for triggers based on currently dead people
      playersMap.forEach(actor => {
           // A. Hunter Retribution
           // Trigger only if Hunter dies THIS turn
           if (actor.role.type === RoleType.HUNTER && deadThisTurn.has(actor.id)) {
               if (actor.attributes?.retributionTargetId) {
                   const victim = playersMap.get(actor.attributes.retributionTargetId);
                   if (victim && victim.isAlive && !deadThisTurn.has(victim.id)) {
                       markDead(victim, `ถูกนายพราน ${actor.name} ยิงสวนตายตกตามกัน`);
                       newDeathFound = true;
                   }
               }
           }

           // B. Dire Wolf Partner Link
           if (actor.role.type === RoleType.DIRE_WOLF && actor.isAlive) {
               if (actor.attributes?.linkedPartnerId && (deadThisTurn.has(actor.attributes.linkedPartnerId) || !playersMap.get(actor.attributes.linkedPartnerId)?.isAlive)) {
                   // Die if partner dies (either this turn or was already dead - check consistency)
                   // The prompt implies "If Partner dies". If Partner died previous day, Dire Wolf should have died then?
                   // Assuming instant reaction. If partner is in deadThisTurn, we die.
                   if (deadThisTurn.has(actor.attributes.linkedPartnerId)) {
                       markDead(actor, `ตรอมใจตายตามคู่หู (${playersMap.get(actor.attributes.linkedPartnerId)?.name})`);
                       newDeathFound = true;
                   }
               }
           }
      });
  }

  // 3. Process Inheritance (Apprentice / Changeling) based on Final Deaths
  const allPlayers = Array.from(playersMap.values());
  const inheritanceEvents = processInheritance(allPlayers, deadThisTurn);
  // No public events for inheritance usually, unless specified, but we can add vague hints
  // events.push(...inheritanceEvents); // Keep private? or Vague? Prompt says "The Seer sees..." is tech.
  // Let's not push public events for inheritance to keep mystery, but log hints if needed.
  // Actually, Changeling inheriting is usually secret.
  
  if (deadThisTurn.size === 0) {
    events.push(`เช้าวันใหม่มาถึง... เป็นคืนที่เงียบสงบ ไม่มีใครเสียชีวิต`);
  }

  const finalPlayers = Array.from(playersMap.values());
  const winState = checkWinCondition(finalPlayers);
  if (winState.winner) {
    events.push(winState.reason!);
    return {
        updatedPlayers: finalPlayers,
        events,
        winner: winState.winner as 'Good' | 'Evil',
        nextPhase: GamePhase.GAME_OVER,
        nextExecutionCount
    };
  }

  return {
    updatedPlayers: finalPlayers,
    events,
    nextPhase: GamePhase.DAY,
    nextExecutionCount
  };
};
