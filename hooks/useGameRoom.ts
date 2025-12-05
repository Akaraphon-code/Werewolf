
import { useState, useEffect } from 'react';
import { ref, set, onValue, update, get, child } from 'firebase/database';
import { db, auth } from '../firebase.config';
import { GameState, Player, GamePhase, RoleType, NightAction } from '../types';
import { ROLES } from '../constants';
import { resolveNightPhase } from '../engine/ResolutionEngine';
import { getRoleStrategy } from '../engine/RoleSystem';

/**
 * Hook to manage Firebase Realtime Database connection for Werewolf Extreme.
 * Implements "Client-Side Authoritative Host" pattern with Secure Auth.
 */
export const useGameRoom = () => {
  // Local state to track connection info
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  
  // The synced game state
  const [syncedState, setSyncedState] = useState<GameState>({
    phase: GamePhase.LOBBY,
    players: [],
    currentTurn: 0,
    nightActions: [],
    log: [],
    winner: null,
    hostPlayers: [], // For Host Dashboard
    actions: [] // Real-time actions for Host
  });

  // --- AUTHENTICATION ---
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

  // --- FIREBASE REFS HELPERS ---
  const getRoomRef = (code: string) => ref(db, `rooms/${code}`);
  const getPublicStateRef = (code: string) => ref(db, `rooms/${code}/public`);
  const getPrivatePlayerRef = (code: string, pid: string) => ref(db, `rooms/${code}/private/${pid}`);
  const getPlayerActionRef = (code: string, pid: string) => ref(db, `rooms/${code}/actions/${pid}`);

  /**
   * 1. CREATE ROOM
   */
  const createRoom = async (hostName: string) => {
    if (!playerId) {
      console.warn("Attempted to create room before Auth was ready.");
      return "";
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const initialPlayer: Player = {
      id: playerId,
      name: hostName,
      isAlive: true,
      isHost: true,
      role: ROLES[RoleType.UNKNOWN], // Role assigned on start
      flags: { isProtected: false, isRoleblocked: false, isMarkedForDeath: false, isRevealed: false, isDoomed: false }
    };

    // Initial DB Structure
    const updates: any = {};
    updates[`rooms/${code}/public`] = {
      phase: GamePhase.LOBBY,
      currentTurn: 0,
      players: [initialPlayer],
      log: ['Room created. Waiting for players...']
    };
    updates[`rooms/${code}/hostId`] = playerId; // Used for Security Rules

    await update(ref(db), updates);

    setRoomCode(code);
    setIsHost(true);
    return code;
  };

  /**
   * 2. JOIN ROOM
   */
  const joinRoom = async (code: string, playerName: string) => {
    if (!playerId) {
      console.warn("Attempted to join room before Auth was ready.");
      return;
    }

    const snapshot = await get(child(ref(db), `rooms/${code}/public`));

    if (!snapshot.exists()) {
      throw new Error("Room not found");
    }

    const currentPlayers = snapshot.val().players || [];
    
    // Check if already joined to prevent duplicates (simple check)
    const existingPlayer = currentPlayers.find((p: Player) => p.id === playerId);
    
    if (!existingPlayer) {
      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        isAlive: true,
        role: ROLES[RoleType.UNKNOWN],
        flags: { isProtected: false, isRoleblocked: false, isMarkedForDeath: false, isRevealed: false, isDoomed: false }
      };

      await update(ref(db), {
        [`rooms/${code}/public/players`]: [...currentPlayers, newPlayer]
      });
    }

    setRoomCode(code);
    // Check if I am the host (in case of re-join logic)
    const hostSnapshot = await get(child(ref(db), `rooms/${code}/hostId`));
    if (hostSnapshot.val() === playerId) {
        setIsHost(true);
    } else {
        setIsHost(false);
    }
  };

  /**
   * 3. START GAME (Host Only)
   */
  const hostStartGame = async () => {
    if (!isHost || !roomCode) return;

    // 1. Get current players
    const publicRef = getPublicStateRef(roomCode);
    const snapshot = await get(publicRef);
    const publicData = snapshot.val();
    let players: Player[] = publicData.players || [];

    // 2. Assign Roles (Random Shuffle)
    // Add Serial Killer into the mix
    const availableRoles = [RoleType.WEREWOLF, RoleType.SEER, RoleType.BODYGUARD, RoleType.SERIAL_KILLER, RoleType.VILLAGER];
    // Ensure enough roles for players
    while (availableRoles.length < players.length) availableRoles.push(RoleType.VILLAGER);
    
    const shuffledRoles = availableRoles
      .sort(() => 0.5 - Math.random())
      .slice(0, players.length);

    const updates: any = {};

    players = players.map((p, i) => {
      const assignedRoleType = shuffledRoles[i];
      const assignedRole = ROLES[assignedRoleType];

      // Update PRIVATE data (Only accessible by that player via security rules)
      updates[`rooms/${roomCode}/private/${p.id}`] = {
        role: assignedRole
      };

      // Keep PUBLIC data sanitized (Role is Unknown)
      return {
        ...p,
        role: ROLES[RoleType.UNKNOWN],
        isAlive: true // Reset life on start
      };
    });

    // Update Phase and Public List
    updates[`rooms/${roomCode}/public/phase`] = GamePhase.NIGHT;
    updates[`rooms/${roomCode}/public/currentTurn`] = 1;
    updates[`rooms/${roomCode}/public/players`] = players;
    updates[`rooms/${roomCode}/public/log`] = [...(publicData.log || []), "Night falls. Roles have been assigned."];

    await update(ref(db), updates);
  };

  /**
   * 4. QUEUE ACTION
   */
  const queueAction = async (targetId: string) => {
    if (!roomCode || !playerId) return;

    // Get my real role from local state
    const myRoleType = syncedState.players.find(p => p.id === playerId)?.role.type;
    if (!myRoleType || myRoleType === RoleType.UNKNOWN) return;

    const strategy = getRoleStrategy(myRoleType);
    const action = strategy.createAction(playerId, targetId);

    await set(getPlayerActionRef(roomCode, playerId), action);
  };

  /**
   * 5. RESOLVE PHASE (Host Only)
   */
  const hostAdvancePhase = async () => {
    if (!isHost || !roomCode) return;

    const publicSnapshot = await get(getPublicStateRef(roomCode));
    const currentState = publicSnapshot.val();
    if (!currentState) return;

    // If currently NIGHT, resolve actions and go to DAY
    if (currentState.phase === GamePhase.NIGHT) {
        
        // Fetch Actions
        const actionsSnapshot = await get(child(ref(db), `rooms/${roomCode}/actions`));
        const actionsMap = actionsSnapshot.val() || {};
        const nightActions: NightAction[] = Object.values(actionsMap);

        // Fetch Private Roles (Needed for logic)
        const privateSnapshot = await get(child(ref(db), `rooms/${roomCode}/private`));
        const privateData = privateSnapshot.val() || {};

        // Merge Public + Private for calculation
        const fullPlayers: Player[] = (currentState.players || []).map((p: Player) => ({
          ...p,
          role: privateData[p.id]?.role || ROLES[RoleType.UNKNOWN]
        }));

        const resolutionState: GameState = {
          ...currentState,
          players: fullPlayers,
          nightActions
        };

        // --- RUN GAME LOGIC ---
        const { updatedPlayers, events } = resolveNightPhase(resolutionState);

        // Prepare Firebase Updates
        const updates: any = {};
        
        // 1. Update Public Players (Sanitize Role back to Unknown for public view)
        const sanitizedPlayers = updatedPlayers.map(p => ({
          ...p,
          role: ROLES[RoleType.UNKNOWN] // Hide roles again
        }));
        updates[`rooms/${roomCode}/public/players`] = sanitizedPlayers;
        
        // 2. Update Phase -> DAY
        updates[`rooms/${roomCode}/public/phase`] = GamePhase.DAY;
        
        // 3. Append Logs
        updates[`rooms/${roomCode}/public/log`] = [...(currentState.log || []), ...events];
        
        // 4. RESET ACTIONS (Crucial: Start fresh for next turn)
        updates[`rooms/${roomCode}/actions`] = null;

        await update(ref(db), updates);

    } else if (currentState.phase === GamePhase.DAY) {
        // Switch to NIGHT
        const updates: any = {};
        updates[`rooms/${roomCode}/public/phase`] = GamePhase.NIGHT;
        updates[`rooms/${roomCode}/public/currentTurn`] = (currentState.currentTurn || 0) + 1;
        updates[`rooms/${roomCode}/public/log`] = [...(currentState.log || []), "Night falls again..."];
        
        await update(ref(db), updates);
    }
  };

  /**
   * 6. TOGGLE PLAYER LIFE (Host Manual Override)
   */
  const togglePlayerLife = async (targetPlayerId: string, isAlive: boolean) => {
    if (!isHost || !roomCode) return;
    
    // We need to find the index of the player in the array or read the whole array
    // Reading whole array is safer for consistency
    const publicSnapshot = await get(child(ref(db), `rooms/${roomCode}/public/players`));
    const players = publicSnapshot.val() || [];
    
    const updatedPlayers = players.map((p: Player) => {
        if (p.id === targetPlayerId) {
            return { ...p, isAlive };
        }
        return p;
    });

    await update(ref(db), {
        [`rooms/${roomCode}/public/players`]: updatedPlayers
    });
  };

  /**
   * SYNC EFFECT
   */
  useEffect(() => {
    if (!roomCode || !playerId) return;

    // 1. Listen to PUBLIC State
    const publicUnsub = onValue(getPublicStateRef(roomCode), (snapshot) => {
      const publicData = snapshot.val();
      if (publicData) {
        setSyncedState(prev => {
          // Merge logic for MY role
          const mergedPlayers = (publicData.players || []).map((p: Player) => {
            if (p.id === playerId) {
               const existingRole = prev.players.find(old => old.id === playerId)?.role;
               if (existingRole && existingRole.type !== RoleType.UNKNOWN) {
                 return { ...p, role: existingRole };
               }
            }
            return p;
          });

          return {
            ...prev,
            ...publicData,
            players: mergedPlayers
          };
        });
      }
    });

    // 2. Listen to PRIVATE State (My Role)
    const privateUnsub = onValue(getPrivatePlayerRef(roomCode, playerId), (snapshot) => {
      const privateData = snapshot.val();
      if (privateData && privateData.role) {
        setSyncedState(prev => {
          const updatedPlayers = prev.players.map(p => 
            p.id === playerId ? { ...p, role: privateData.role } : p
          );
          return { ...prev, players: updatedPlayers };
        });
      }
    });
    
    // 3. HOST ONLY SYNC (Actions + Full Roles)
    let hostActionUnsub: () => void = () => {};
    let hostRoleUnsub: () => void = () => {};
    
    if (isHost) {
        // Listen to Actions
        hostActionUnsub = onValue(child(ref(db), `rooms/${roomCode}/actions`), (snapshot) => {
            const actionsMap = snapshot.val() || {};
            setSyncedState(prev => ({ ...prev, actions: Object.values(actionsMap) }));
        });

        // Listen to All Private Roles to build Host View
        hostRoleUnsub = onValue(child(ref(db), `rooms/${roomCode}/private`), (snapshot) => {
            const privateMap = snapshot.val() || {};
            setSyncedState(prev => {
                const hostPlayers = prev.players.map(p => ({
                    ...p,
                    role: privateMap[p.id]?.role || p.role // Use private role if available
                }));
                return { ...prev, hostPlayers };
            });
        });
    }

    return () => {
      publicUnsub();
      privateUnsub();
      hostActionUnsub();
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
    startGame: hostStartGame,
    performAction: queueAction,
    advancePhase: hostAdvancePhase,
    togglePlayerLife
  };
};
