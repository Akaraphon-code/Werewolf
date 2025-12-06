import { RoleType } from './types';

export interface GamePreset {
  id: string;
  name: string;
  description: string;
  roles: RoleType[];
  recommendedPlayers: string;
}

export const PRESETS: GamePreset[] = [
  {
    id: 'classic',
    name: 'Classic Setup',
    description: 'ความสมดุลแบบดั้งเดิม เหมาะสำหรับผู้เริ่มต้น',
    recommendedPlayers: '6-8 Players',
    roles: [
      RoleType.WEREWOLF,
      RoleType.WEREWOLF,
      RoleType.SEER,
      RoleType.BODYGUARD
    ]
  },
  {
    id: 'phase2',
    name: 'Phase 2: Mystic',
    description: 'เพิ่มบทบาทเวทมนตร์และหมาป่ากลายพันธุ์',
    recommendedPlayers: '8+ Players',
    roles: [
      RoleType.WOLF_MAN,
      RoleType.DIRE_WOLF,
      RoleType.WITCH,
      RoleType.SEER,
      RoleType.APPRENTICE_SEER
    ]
  },
  {
    id: 'chaos',
    name: 'Total Chaos',
    description: 'รวมตัวป่วนและฆาตกร สำหรับวงที่ชอบความวุ่นวาย',
    recommendedPlayers: '7+ Players',
    roles: [
      RoleType.WEREWOLF,
      RoleType.SERIAL_KILLER,
      RoleType.JESTER,
      RoleType.TROUBLEMAKER,
      RoleType.MEDIUM
    ]
  },
  {
    id: 'hunter_game',
    name: 'Hunter & Prey',
    description: 'เน้นการฆ่าและล้างแค้น',
    recommendedPlayers: '6+ Players',
    roles: [
      RoleType.WEREWOLF,
      RoleType.WEREWOLF,
      RoleType.HUNTER,
      RoleType.PRIEST,
      RoleType.BODYGUARD
    ]
  }
];