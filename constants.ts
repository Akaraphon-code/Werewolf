
import { Role, RoleType } from './types';

// The Role Codex (ฐานข้อมูลบทบาทฉบับภาษาไทย)
export const ROLES: Record<RoleType, Role> = {
  [RoleType.WEREWOLF]: {
    type: RoleType.WEREWOLF,
    name: 'มนุษย์หมาป่า',
    description: 'ตื่นขึ้นมาในตอนกลางคืนเพื่อเลือกเหยื่อที่ต้องการสังหาร 1 คน จงแนบเนียนไปกับฝูงชนในตอนกลางวันและปั่นหัวพวกชาวบ้าน',
    quote: 'คืนนี้... ใครจะเป็นรายต่อไป?',
    ability: 'สังหารเหยื่อ',
    imageUrl: 'https://images.unsplash.com/photo-1551106652-a5bcf4b2d759?q=80&w=600&auto=format&fit=crop', // Dark wolf vibe
    alignment: 'Evil',
    team: 'ทีมหมาป่า'
  },
  [RoleType.VILLAGER]: {
    type: RoleType.VILLAGER,
    name: 'ชาวบ้าน',
    description: 'ไม่มีพลังพิเศษใดๆ หน้าที่ของคุณคือใช้สติปัญญาและการสังเกต เพื่อจับผิดและโหวตประหารมนุษย์หมาป่าก่อนที่ทุกคนจะตายกันหมด',
    quote: 'ข้าก็แค่ชาวบ้านตาดำๆ คนนึง...',
    ability: 'โหวตหาคนผิด',
    imageUrl: 'https://images.unsplash.com/photo-1595231712325-9fdec6f6d9a3?q=80&w=600&auto=format&fit=crop', // Village vibe
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.SEER]: {
    type: RoleType.SEER,
    name: 'ผู้หยั่งรู้',
    description: 'ตื่นมาตอนกลางคืนเพื่อดูบทบาทของผู้เล่นอื่นได้ 1 คน ว่าเป็นฝ่ายดีหรือร้าย ข้อมูลของคุณคือกุญแจสำคัญที่จะพลิกเกม',
    quote: 'ความจริงมีเพียงหนึ่งเดียว...',
    ability: 'ส่องบทบาท',
    imageUrl: 'https://images.unsplash.com/photo-1620024870296-4c19075ee223?q=80&w=600&auto=format&fit=crop', // Mystic eye
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.BODYGUARD]: {
    type: RoleType.BODYGUARD,
    name: 'ผู้พิทักษ์',
    description: 'เลือกปกป้องผู้เล่น 1 คนในตอนกลางคืน ผู้ที่ถูกปกป้องจะไม่ตายจากการโจมตีของหมาป่า แต่คุณปกป้องตัวเองไม่ได้',
    quote: 'ข้ามศพข้าไปก่อนเถอะ!',
    ability: 'ปกป้อง 1 คน',
    imageUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=600&auto=format&fit=crop', // Shield/Armor
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.HUNTER]: {
    type: RoleType.HUNTER,
    name: 'นายพราน',
    description: 'หากคุณถูกหมาป่าฆ่า หรือถูกโหวตประหาร คุณสามารถเลือกยิงผู้เล่นอีก 1 คนให้ตายตามคุณไปได้',
    quote: 'กระสุนนัดสุดท้าย... เพื่อแก!',
    ability: 'ยิงสวนเมื่อตาย',
    imageUrl: 'https://images.unsplash.com/photo-1559419610-1f3a28c3875e?q=80&w=600&auto=format&fit=crop', // Gun/Hunter
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.MEDIUM]: {
    type: RoleType.MEDIUM,
    name: 'คนทรง',
    description: 'สามารถรู้ได้ว่าผู้เล่นที่ตายในคืนนั้น เป็นฝ่ายดีหรือฝ่ายร้าย หรือมีบทบาทอะไร (ขึ้นอยู่กับกติกา)',
    quote: 'คนตาย... ไม่เคยโกหก',
    ability: 'คุยกับศพ',
    imageUrl: 'https://images.unsplash.com/photo-1598556856230-e830f3f6e1e6?q=80&w=600&auto=format&fit=crop', // Candles/Ritual
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.JESTER]: {
    type: RoleType.JESTER,
    name: 'ตัวตลก',
    description: 'เป้าหมายของคุณคือการทำให้ตัวเองถูกโหวตประหารในตอนกลางวัน หากทำสำเร็จคุณจะเป็นผู้ชนะเพียงผู้เดียว',
    quote: 'โลกนี้มันก็แค่ละครฉากหนึ่ง...',
    ability: 'ปั่นประสาท',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop', // Joker vibe
    alignment: 'Neutral',
    team: 'ทีมตัวตลก'
  },
  [RoleType.SERIAL_KILLER]: {
    type: RoleType.SERIAL_KILLER,
    name: 'ฆาตกรต่อเนื่อง',
    description: 'ปีศาจในคราบมนุษย์ ฆ่าได้ทุกคืนและไม่มีใครหยุดคุณได้ การโจมตีของคุณทะลุการปกป้องของผู้พิทักษ์',
    quote: 'ความตายคือศิลปะ...',
    ability: 'ฆ่าทะลุเกราะ',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&auto=format&fit=crop', // Killer vibe
    alignment: 'Evil',
    team: 'ทีมฆาตกร'
  },
  [RoleType.UNKNOWN]: {
    type: RoleType.UNKNOWN,
    name: 'ไม่ระบุตัวตน',
    description: 'ยังไม่ทราบข้อมูล',
    quote: '...',
    ability: '???',
    imageUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=600&auto=format&fit=crop', // Mystery
    alignment: 'Unknown',
    team: 'ไม่ระบุ'
  }
};
