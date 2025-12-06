
import { useState, useEffect, useRef } from 'react';
import { ref, set, onValue, update, get, child, remove } from 'firebase/database';
import { db, auth } from '../firebase.config';
import { GameState, Player, GamePhase, RoleType, NightAction, ActionType } from '../types';
import { ROLES } from '../constants';
import { resolveNightPhase, resolveVotingPhase } from '../engine/ResolutionEngine';
import { getRoleStrategy } from '../engine/RoleSystem';

export const useGameRoom = () => {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  
  // Refs to hold latest data for merging without dependency loops
  const latestPublicPlayers = useRef<Player[]>([]);
  const latestPrivateMap = useRef<Record<string, any>>({});

  const [syncedState, setSyncedState] = useState<GameState>({
    phase: GamePhase.LOBBY,
    players: [],
    currentTurn: 0,
    nightActions: [],
    log: [],
    winner: null,
    hostPlayers: [],
    actions: [],
    votes: {},
    executionCount: 1
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setPlayerId(user.uid);
      } else {
        auth.signInAnonymously().catch((error) => {
          console.error("Auth Error:", error);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const getRoomRef = (code: string) => ref(db, `rooms/${code}`);
  const getPublicStateRef = (code: string) => ref(db, `rooms/${code}/public`);
  const getPrivatePlayerRef = (code: string, pid: string) => ref(db, `rooms/${code}/private/${pid}`);
  const getPlayerActionRef = (code: string, pid: string) => ref(db, `rooms/${code}/actions/${pid}`);
  const getPlayerVoteRef = (code: string, pid: string) => ref(db, `rooms/${code}/votes/${pid}`);

  const createRoom = async (hostName: string) => {
    if (!playerId) return "";
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const initialPlayer: Player = {
      id: playerId,
      name: hostName,
      isAlive: true,
      isHost: true,
      role: ROLES[RoleType.UNKNOWN],
      flags: { 
        isProtected: false, 
        isRoleblocked: false, 
        isMarkedForDeath: false, 
        isRevealed: false, 
        isDoomed: false,
        isSilenced: false,
        isProtectedFromWolvesOnly: false
      }
    };
    const updates: any = {};
    updates[`rooms/${code}/public`] = {
      phase: GamePhase.LOBBY,
      currentTurn: 0,
      players: [initialPlayer],
      log: ['Room created. Waiting for players...'],
      executionCount: 1
    };
    updates[`rooms/${code}/hostId`] = playerId;
    await update(ref(db), updates);
    setRoomCode(code);
    setIsHost(true);
    return code;
  };

  const joinRoom = async (code: string, playerName: string) => {
    if (!playerId) return;
    const snapshot = await get(child(ref(db), `rooms/${code}/public`));
    if (!snapshot.exists()) throw new Error("Room not found");
    const currentPlayers = snapshot.val().players || [];
    const existingPlayer = currentPlayers.find((p: Player) => p.id === playerId);
    if (!existingPlayer) {
      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        isAlive: true,
        role: ROLES[RoleType.UNKNOWN],
        flags: { 
          isProtected: false, 
          isRoleblocked: false, 
          isMarkedForDeath: false, 
          isRevealed: false, 
          isDoomed: false,
          isSilenced: false,
          isProtectedFromWolvesOnly: false
        }
      };
      await update(ref(db), {
        [`rooms/${code}/public/players`]: [...currentPlayers, newPlayer]
      });
    }
    setRoomCode(code);
    const hostSnapshot = await get(child(ref(db), `rooms/${code}/hostId`));
    setIsHost(hostSnapshot.val() === playerId);
  };

  const leaveRoom = () => {
    setRoomCode(null);
    setIsHost(false);
    setSyncedState({
      phase: GamePhase.LOBBY,
      players: [],
      currentTurn: 0,
      nightActions: [],
      log: [],
      winner: null,
      hostPlayers: [],
      actions: [],
      votes: {},
      executionCount: 1
    });
  };

  const hostStartGame = async (customDeck?: RoleType[]) => {
    if (!isHost || !roomCode) return;
    const publicRef = getPublicStateRef(roomCode);
    const snapshot = await get(publicRef);
    const publicData = snapshot.val();
    let players: Player[] = publicData.players || [];
    
    let deck: RoleType[] = [];

    if (customDeck && customDeck.length > 0) {
      deck = [...customDeck];
      while (deck.length < players.length) {
        deck.push(RoleType.VILLAGER);
      }
      if (deck.length > players.length) {
        deck = deck.slice(0, players.length);
      }
    } else {
      const availableRoles = [
        RoleType.WEREWOLF, RoleType.SEER, RoleType.BODYGUARD, RoleType.SERIAL_KILLER, 
        RoleType.PRIEST, RoleType.TROUBLEMAKER, RoleType.APPRENTICE_SEER, RoleType.MINION,
        RoleType.WITCH, RoleType.DIRE_WOLF, RoleType.CHANGELING, RoleType.WOLF_MAN, RoleType.HUNTER
      ];
      deck = [...availableRoles];
      while (deck.length < players.length) deck.push(RoleType.VILLAGER);
      deck = deck.slice(0, players.length);
    }
    
    const shuffledRoles = deck.sort(() => 0.5 - Math.random());

    const updates: any = {};
    players = players.map((p, i) => {
      const assignedRole = ROLES[shuffledRoles[i]];
      
      const attributes: any = {};
      if (assignedRole.type === RoleType.WITCH) {
        attributes.hasHealPotion = true;
        attributes.hasPoisonPotion = true;
      }

      updates[`rooms/${roomCode}/private/${p.id}`] = { 
        role: assignedRole,
        attributes: attributes,
        hasUsedAbility: false
      };
      
      return { ...p, role: ROLES[RoleType.UNKNOWN], isAlive: true, executionCount: 1 };
    });

    updates[`rooms/${roomCode}/public/phase`] = GamePhase.NIGHT;
    updates[`rooms/${roomCode}/public/currentTurn`] = 1;
    updates[`rooms/${roomCode}/public/players`] = players;
    updates[`rooms/${roomCode}/public/log`] = [...(publicData.log || []), "Night falls. Roles have been assigned."];
    await update(ref(db), updates);
  };

  const resetGame = async () => {
    if (!isHost || !roomCode) return;
    const publicSnapshot = await get(child(ref(db), `rooms/${roomCode}/public/players`));
    const currentPlayers = publicSnapshot.val() || [];
    
    const resetPlayers = currentPlayers.map((p: Player) => ({
      ...p,
      isAlive: true,
      role: ROLES[RoleType.UNKNOWN],
      flags: { 
        isProtected: false, 
        isRoleblocked: false, 
        isMarkedForDeath: false, 
        isRevealed: false, 
        isDoomed: false,
        isSilenced: false,
        isProtectedFromWolvesOnly: false
      },
      hasUsedAbility: false,
      privateResult: '',
      attributes: {}
    }));

    const updates: any = {};
    updates[`rooms/${roomCode}/public`] = {
      phase: GamePhase.LOBBY,
      players: resetPlayers,
      currentTurn: 0,
      log: ["New game started. Waiting for host..."],
      winner: null,
      executionCount: 1
    };
    updates[`rooms/${roomCode}/private`] = null; 
    updates[`rooms/${roomCode}/actions`] = null;
    updates[`rooms/${roomCode}/votes`] = null;

    await update(ref(db), updates);
  };

  const queueAction = async (targetId: string, actionType?: ActionType) => {
    if (!roomCode || !playerId) return;
    const myRoleType = syncedState.players.find(p => p.id === playerId)?.role.type;
    if (!myRoleType || myRoleType === RoleType.UNKNOWN) return;
    const strategy = getRoleStrategy(myRoleType);
    
    const me = syncedState.players.find(p => p.id === playerId);
    if ((myRoleType === RoleType.APPRENTICE_SEER || myRoleType === RoleType.TROUBLEMAKER) && me?.hasUsedAbility) {
        return; 
    }

    const action = strategy.createAction(playerId, targetId, actionType);
    await set(getPlayerActionRef(roomCode, playerId), action);
  };

  const castVote = async (targetId: string) => {
    if (!roomCode || !playerId) return;
    await set(getPlayerVoteRef(roomCode, playerId), targetId);
  };

  const hostAdvancePhase = async () => {
    if (!isHost || !roomCode) return;
    const publicSnapshot = await get(getPublicStateRef(roomCode));
    const currentState = publicSnapshot.val();
    if (!currentState) return;

    if (currentState.phase === GamePhase.NIGHT) {
        const actionsSnapshot = await get(child(ref(db), `rooms/${roomCode}/actions`));
        const actionsMap = actionsSnapshot.val() || {};
        const nightActions: NightAction[] = Object.values(actionsMap);
        const privateSnapshot = await get(child(ref(db), `rooms/${roomCode}/private`));
        const privateData = privateSnapshot.val() || {};
        
        const fullPlayers: Player[] = (currentState.players || []).map((p: Player) => ({
          ...p,
          role: privateData[p.id]?.role || ROLES[RoleType.UNKNOWN],
          attributes: privateData[p.id]?.attributes || {},
          hasUsedAbility: privateData[p.id]?.hasUsedAbility || false
        }));
        
        const resolutionState: GameState = { ...currentState, players: fullPlayers, nightActions };
        const { updatedPlayers, events, winner, nextPhase, nextExecutionCount } = resolveNightPhase(resolutionState);

        const updates: any = {};
        
        updatedPlayers.forEach(p => {
             updates[`rooms/${roomCode}/private/${p.id}/role`] = p.role;
             updates[`rooms/${roomCode}/private/${p.id}/hasUsedAbility`] = p.hasUsedAbility ?? false;
             updates[`rooms/${roomCode}/private/${p.id}/privateResult`] = p.privateResult || '';
             updates[`rooms/${roomCode}/private/${p.id}/attributes`] = p.attributes || {};
        });

        if (nextPhase === GamePhase.GAME_OVER) {
             const revealedPlayers = updatedPlayers.map(p => ({
                ...p,
                role: p.role 
             }));
             updates[`rooms/${roomCode}/public/players`] = revealedPlayers;
        } else {
             updates[`rooms/${roomCode}/public/players`] = updatedPlayers.map(p => ({ 
               ...p, 
               role: ROLES[RoleType.UNKNOWN] 
             }));
        }

        updates[`rooms/${roomCode}/public/phase`] = nextPhase;
        updates[`rooms/${roomCode}/public/log`] = [...(currentState.log || []), ...events];
        updates[`rooms/${roomCode}/public/executionCount`] = nextExecutionCount;
        updates[`rooms/${roomCode}/actions`] = null; 
        if (winner) updates[`rooms/${roomCode}/public/winner`] = winner;

        await update(ref(db), updates);

    } else if (currentState.phase === GamePhase.DAY) {
        const updates: any = {};
        updates[`rooms/${roomCode}/public/phase`] = GamePhase.VOTING;
        updates[`rooms/${roomCode}/public/log`] = [...(currentState.log || []), "ถึงเวลาโหวตประหาร! (Voting Started)"];
        await update(ref(db), updates);

    } else if (currentState.phase === GamePhase.VOTING) {
        const votesSnapshot = await get(child(ref(db), `rooms/${roomCode}/votes`));
        const votes = votesSnapshot.val() || {};
        const privateSnapshot = await get(child(ref(db), `rooms/${roomCode}/private`));
        const privateData = privateSnapshot.val() || {};
        const fullPlayers: Player[] = (currentState.players || []).map((p: Player) => ({
            ...p,
            role: privateData[p.id]?.role || ROLES[RoleType.UNKNOWN],
            attributes: privateData[p.id]?.attributes || {},
            hasUsedAbility: privateData[p.id]?.hasUsedAbility || false
        }));

        const { updatedPlayers, events, nextPhase, winner } = resolveVotingPhase(fullPlayers, votes, currentState.executionCount || 1);

        const updates: any = {};
        
        updatedPlayers.forEach(p => {
             updates[`rooms/${roomCode}/private/${p.id}/role`] = p.role;
             updates[`rooms/${roomCode}/private/${p.id}/hasUsedAbility`] = p.hasUsedAbility ?? false;
             updates[`rooms/${roomCode}/private/${p.id}/attributes`] = p.attributes || {};
        });

        if (nextPhase === GamePhase.GAME_OVER) {
            const revealedPlayers = updatedPlayers.map(p => ({
               ...p,
               role: p.role
            }));
            updates[`rooms/${roomCode}/public/players`] = revealedPlayers;
       } else {
            updates[`rooms/${roomCode}/public/players`] = updatedPlayers.map(p => ({ ...p, role: ROLES[RoleType.UNKNOWN] }));
       }

        updates[`rooms/${roomCode}/public/phase`] = nextPhase;
        if (nextPhase === GamePhase.NIGHT) {
           updates[`rooms/${roomCode}/public/currentTurn`] = (currentState.currentTurn || 0) + 1;
           updates[`rooms/${roomCode}/public/executionCount`] = 1; 
        }
        updates[`rooms/${roomCode}/public/log`] = [...(currentState.log || []), ...events];
        updates[`rooms/${roomCode}/votes`] = null;
        if (winner) updates[`rooms/${roomCode}/public/winner`] = winner;

        await update(ref(db), updates);
    }
  };

  const togglePlayerLife = async (targetPlayerId: string, isAlive: boolean) => {
    if (!isHost || !roomCode) return;
    const publicSnapshot = await get(child(ref(db), `rooms/${roomCode}/public/players`));
    const players = publicSnapshot.val() || [];
    const updatedPlayers = players.map((p: Player) => p.id === targetPlayerId ? { ...p, isAlive } : p);
    await update(ref(db), { [`rooms/${roomCode}/public/players`]: updatedPlayers });
  };

  useEffect(() => {
    if (!roomCode || !playerId) return;

    const updateHostState = () => {
        if (!isHost) return;
        const merged = latestPublicPlayers.current.map(p => {
             const privateData = latestPrivateMap.current[p.id] || {};
             return {
                 ...p,
                 role: privateData.role || p.role,
                 hasUsedAbility: privateData.hasUsedAbility,
                 privateResult: privateData.privateResult,
                 attributes: privateData.attributes
             };
        });
        setSyncedState(prev => ({ ...prev, hostPlayers: merged }));
    };

    const publicUnsub = onValue(getPublicStateRef(roomCode), (snapshot) => {
      const publicData = snapshot.val();
      if (publicData) {
        latestPublicPlayers.current = publicData.players || [];
        
        setSyncedState(prev => {
          if (publicData.phase === GamePhase.GAME_OVER) {
              return { ...prev, ...publicData };
          }
          const mergedPlayers = (publicData.players || []).map((p: Player) => {
            if (p.id === playerId) {
               const existingRole = prev.players.find(old => old.id === playerId)?.role;
               if (existingRole && existingRole.type !== RoleType.UNKNOWN) return { ...p, role: existingRole };
            }
            return p;
          });
          return { ...prev, ...publicData, players: mergedPlayers };
        });

        // Trigger merge for host
        updateHostState();
      }
    });

    const privateUnsub = onValue(getPrivatePlayerRef(roomCode, playerId), (snapshot) => {
      const privateData = snapshot.val();
      if (privateData) {
        setSyncedState(prev => {
          if (prev.phase === GamePhase.GAME_OVER) return prev;
          
          const updatedPlayers = prev.players.map(p => p.id === playerId ? { 
              ...p, 
              role: privateData.role || p.role,
              hasUsedAbility: privateData.hasUsedAbility,
              privateResult: privateData.privateResult,
              attributes: privateData.attributes
          } : p);
          return { ...prev, players: updatedPlayers };
        });
      }
    });
    
    let hostActionUnsub: () => void = () => {};
    let hostVoteUnsub: () => void = () => {};
    let hostRoleUnsub: () => void = () => {};
    
    if (isHost) {
        hostActionUnsub = onValue(child(ref(db), `rooms/${roomCode}/actions`), (snapshot) => {
            setSyncedState(prev => ({ ...prev, actions: Object.values(snapshot.val() || {}) }));
        });
        
        hostVoteUnsub = onValue(child(ref(db), `rooms/${roomCode}/votes`), (snapshot) => {
            setSyncedState(prev => ({ ...prev, votes: snapshot.val() || {} }));
        });

        hostRoleUnsub = onValue(child(ref(db), `rooms/${roomCode}/private`), (snapshot) => {
            latestPrivateMap.current = snapshot.val() || {};
            updateHostState();
        });
    }

    return () => {
      publicUnsub();
      privateUnsub();
      hostActionUnsub();
      hostVoteUnsub();
      hostRoleUnsub();
    };
  }, [roomCode, playerId, isHost]);

  return {
    roomCode,
    playerId,
    isHost,
    state: { ...syncedState, roomCode, playerId, isHost },
    createRoom,
    joinRoom,
    leaveRoom,
    startGame: hostStartGame,
    resetGame,
    performAction: queueAction,
    castVote,
    advancePhase: hostAdvancePhase,
    togglePlayerLife
  };
};
