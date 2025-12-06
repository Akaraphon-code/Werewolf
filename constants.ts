
import { Role, RoleType } from './types';

// Standard Thai Role Codex (ฉบับสมบูรณ์)
export const ROLES: Record<RoleType, Role> = {
  // --- ORIGINAL ROLES ---
  [RoleType.WEREWOLF]: {
    type: RoleType.WEREWOLF,
    name: 'มนุษย์หมาป่า (Werewolf)',
    description: 'เลือกเหยื่อเพื่อสังหารในตอนกลางคืน ต้องแฝงตัวให้เนียนที่สุดในตอนกลางวัน',
    quote: 'คืนนี้... ใครจะเป็นรายต่อไป?',
    ability: 'สังหารเหยื่อ',
    imageUrl: 'https://img5.pic.in.th/file/secure-sv1/Gemini_Generated_Image_1hb9tx1hb9tx1hb9.png', 
    alignment: 'Evil',
    team: 'Team Werewolf'
  },
  [RoleType.VILLAGER]: {
    type: RoleType.VILLAGER,
    name: 'ชาวบ้าน (Villager)',
    description: 'ไม่มีพลังพิเศษ สิ่งเดียวที่มีคือไหวพริบในการจับผิดและโหวตคนร้าย',
    quote: 'เราต้องช่วยกันปกป้องหมู่บ้านนี้',
    ability: 'โหวตจับผิด',
    imageUrl: 'https://images.unsplash.com/photo-1595231712325-9fdec6f6d9a3?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.SEER]: {
    type: RoleType.SEER,
    name: 'ผู้หยั่งรู้ (Seer)',
    description: 'สามารถดูบทบาทของผู้เล่นอื่นได้คืนละ 1 คน ว่าเป็นฝ่ายดีหรือฝ่ายร้าย',
    quote: 'ความจริงมีเพียงหนึ่งเดียว',
    ability: 'ส่องดูบทบาท',
    imageUrl: 'https://images.unsplash.com/photo-1620024870296-4c19075ee223?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.BODYGUARD]: {
    type: RoleType.BODYGUARD,
    name: 'บอดี้การ์ด (Bodyguard)',
    description: 'เลือกปกป้องผู้เล่น 1 คนในตอนกลางคืน ให้รอดพ้นจากการถูกฆ่า (ห้ามซ้ำคนเดิม)',
    quote: 'ข้าจะปกป้องเจ้าเอง',
    ability: 'คุ้มกัน',
    imageUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.HUNTER]: {
    type: RoleType.HUNTER,
    name: 'นายพราน (Hunter)',
    description: 'หากคุณตาย คุณสามารถเลือกยิงผู้เล่นอื่นให้ตายตกไปตามกันได้ 1 คน',
    quote: 'ถ้าข้าตาย... เจ้าก็ต้องตายด้วย',
    ability: 'ยิงสวนก่อนตาย',
    imageUrl: 'https://images.unsplash.com/photo-1559419610-1f3a28c3875e?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.MEDIUM]: {
    type: RoleType.MEDIUM,
    name: 'คนทรง (Medium)',
    description: 'สามารถสื่อสารกับคนตาย หรือรู้บทบาทของคนที่ตายไปแล้ว',
    quote: 'เสียงกระซิบจากความตาย...',
    ability: 'สื่อสารวิญญาณ',
    imageUrl: 'https://images.unsplash.com/photo-1598556856230-e830f3f6e1e6?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.JESTER]: {
    type: RoleType.JESTER,
    name: 'ตัวตลก (Jester)',
    description: 'เป้าหมายคือการทำให้ตัวเองถูกโหวตประหารในตอนกลางวันเพื่อชนะเกม',
    quote: 'โหวตข้าสิ! ฆ่าข้าเลย!',
    ability: 'ยั่วโมโห',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Neutral',
    team: 'Solo'
  },
  [RoleType.SERIAL_KILLER]: {
    type: RoleType.SERIAL_KILLER,
    name: 'ฆาตกรต่อเนื่อง (Serial Killer)',
    description: 'ฆ่าใครก็ได้คืนละ 1 คน ชนะเมื่อเหลือรอดเป็นคนสุดท้าย',
    quote: 'ทุกคนคือเหยื่อ...',
    ability: 'ฆ่าไร้ปรานี',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Evil',
    team: 'Solo'
  },
  [RoleType.WOLF_MAN]: {
    type: RoleType.WOLF_MAN,
    name: 'มนุษย์หมาป่าจำแลง (Wolf Man)',
    description: 'เป็นหมาป่า แต่เมื่อถูกผู้หยั่งรู้ส่องจะเห็นเป็น "ชาวบ้าน"',
    quote: 'เจ้าแยกข้าไม่ออกหรอก',
    ability: 'อำพรางตัวตน',
    imageUrl: 'https://images.unsplash.com/photo-1560706834-bed18b14e365?q=80&w=600&auto=format&fit=crop',
    alignment: 'Evil',
    team: 'Team Werewolf',
    investigationResult: RoleType.VILLAGER
  },
  [RoleType.WITCH]: {
    type: RoleType.WITCH,
    name: 'แม่มด (Witch)',
    description: 'มีน้ำยา 2 ขวด: "ยาชุบชีวิต" และ "ยาพิษ" ใช้ได้อย่างละครั้งตลอดทั้งเกม',
    quote: 'จะอยู่หรือตาย... ขึ้นอยู่กับข้า',
    ability: 'ใช้ยา',
    imageUrl: 'https://images.unsplash.com/photo-1596700871966-26792da07981?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.DIRE_WOLF]: {
    type: RoleType.DIRE_WOLF,
    name: 'หมาป่าคู่ (Dire Wolf)',
    description: 'เลือกผูกวิญญาณกับผู้เล่น 1 คน หากคนนั้นตาย คุณจะตายด้วย',
    quote: 'เราจะอยู่และตายไปด้วยกัน',
    ability: 'ผูกวิญญาณ',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823528e?q=80&w=600&auto=format&fit=crop',
    alignment: 'Evil',
    team: 'Team Werewolf'
  },
  [RoleType.CHANGELING]: {
    type: RoleType.CHANGELING,
    name: 'จอมโจร (Changeling)',
    description: 'เลือกผู้เล่น 1 คน หากคนนั้นตาย คุณจะสวมรอยรับบทบาทของเขา',
    quote: 'ข้าคือเงาของเจ้า',
    ability: 'สวมรอย',
    imageUrl: 'https://images.unsplash.com/photo-1542259681-d41a8a4eb4f9?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.APPRENTICE_SEER]: {
    type: RoleType.APPRENTICE_SEER,
    name: 'ผู้หยั่งรู้ฝึกหัด (Apprentice Seer)',
    description: 'เป็นชาวบ้านธรรมดา จนกว่าผู้หยั่งรู้ตัวจริงจะตาย คุณถึงจะได้รับพลัง',
    quote: 'ข้ารอเวลาของข้า',
    ability: 'รับสืบทอด',
    imageUrl: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.MINION]: {
    type: RoleType.MINION,
    name: 'สมุนปีศาจ (Minion)',
    description: 'รู้ว่าใครเป็นหมาป่า แต่หมาป่าไม่รู้ว่าคุณคือใคร ช่วยปั่นป่วนให้หมาป่าชนะ',
    quote: 'เพื่อนายท่าน!',
    ability: 'รู้ตัวหมาป่า',
    imageUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=600&auto=format&fit=crop',
    alignment: 'Evil',
    team: 'Team Werewolf'
  },
  [RoleType.DRUNK]: {
    type: RoleType.DRUNK,
    name: 'ขี้เมา (Drunk)',
    description: 'ไม่รู้บทบาทจริงของตัวเอง จนกว่าจะถึงคืนที่ 3',
    quote: 'เอิ้ก... มึนไปหมด',
    ability: 'ไม่รู้ตัวตน',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.PRIEST]: {
    type: RoleType.PRIEST,
    name: 'นักบวช (Priest)',
    description: 'ตรวจสอบผู้เล่น 1 คน ถ้าเป็นหมาป่าจะฆ่าทิ้งทันที ถ้าไม่ใช่คุณจะตายเอง',
    quote: 'พระเจ้าจะตัดสินเจ้า',
    ability: 'ชำระบาป',
    imageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.TROUBLEMAKER]: {
    type: RoleType.TROUBLEMAKER,
    name: 'ตัวป่วน (Troublemaker)',
    description: 'เลือกก่อกวนในคืนใดก็ได้ 1 ครั้ง ทำให้วันรุ่งขึ้นมีการโหวตตาย 2 คน',
    quote: 'มาเล่นอะไรสนุกๆ กันดีกว่า',
    ability: 'ก่อกวน',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.INSOMNIAC]: {
    type: RoleType.INSOMNIAC,
    name: 'คนนอนไม่หลับ (Insomniac)',
    description: 'ตื่นขึ้นมาดูว่าผู้เล่นที่นั่งติดกันซ้ายขวา ลุกออกไปทำแอคชั่นหรือไม่',
    quote: 'ใครตื่นอยู่บ้างนะ?',
    ability: 'เฝ้าสังเกต',
    imageUrl: 'https://images.unsplash.com/photo-1517865288-978fcb780652?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.MASON]: {
    type: RoleType.MASON,
    name: 'สมาคมลับ (Mason)',
    description: 'ตื่นมาเจอเพื่อนที่เป็น Mason ด้วยกัน ทำให้มั่นใจว่าเพื่อนไม่ใช่หมาป่า',
    quote: 'เรารู้ไส้รู้พุงกันดี',
    ability: 'รู้จักพวกพ้อง',
    imageUrl: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },

  // --- NEW EXPANSION ROLES (Filtered) ---

  // Group A: Villager Team
  [RoleType.PRINCE]: {
    type: RoleType.PRINCE,
    name: 'เจ้าชาย (Prince)',
    description: 'หากถูกโหวตประหารในตอนกลางวัน จะไม่ตายและเปิดเผยตัวตนว่าเป็นเจ้าชาย (แต่ถ้าโดนฆ่ากลางคืนตายปกติ)',
    quote: 'พวกเจ้ากล้าดียังไง!',
    ability: 'ราชศักดิ์',
    imageUrl: 'https://images.unsplash.com/photo-1590529884988-cb946f48a9d1?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.REVEALER]: {
    type: RoleType.REVEALER,
    name: 'ผู้เปิดเผยตัวตน (Revealer)',
    description: 'เลือก 1 คน ถ้าเป็นหมาป่า หมาป่าตาย ถ้าไม่ใช่หมาป่า คุณตายเอง',
    quote: 'ข้าจะกระชากหน้ากากเจ้า',
    ability: 'เปิดโปง',
    imageUrl: 'https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.SPELLCASTER]: {
    type: RoleType.SPELLCASTER,
    name: 'ผู้ร่ายเวท (Spellcaster)',
    description: 'เลือกผู้เล่น 1 คน เป้าหมายจะถูก "ใบ้" ในวันถัดไป (พูดไม่ได้ โหวตไม่ได้)',
    quote: 'จงเงียบเสียงลง...',
    ability: 'ร่ายเวทใบ้',
    imageUrl: 'https://images.unsplash.com/photo-1549497552-320d77d70eb0?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.TOUGH_GUY]: {
    type: RoleType.TOUGH_GUY,
    name: 'หนุ่มบึ้ก (Tough Guy)',
    description: 'หากถูกหมาป่ากัด จะยังไม่ตายทันที แต่จะไปตายในคืนถัดไปแทน',
    quote: 'แค่นี้ไม่เจ็บหรอก',
    ability: 'อึดถึกทน',
    imageUrl: 'https://images.unsplash.com/photo-1570158268183-f29e7bbc7372?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.VILLAGER_IDIOT]: {
    type: RoleType.VILLAGER_IDIOT,
    name: 'ชาวบ้านผู้โง่เง่า (Villager Idiot)',
    description: 'คุณต้องโหวตประหารทุกวัน ห้ามงดออกเสียง',
    quote: 'เอ๊ะ? ต้องโหวตเหรอ? งั้นโหวตเจ้านั่น!',
    ability: 'บ้าบอ',
    imageUrl: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.LYCAN]: {
    type: RoleType.LYCAN,
    name: 'ลูกครึ่งหมา (Lycan)',
    description: 'เป็นฝ่ายชาวบ้าน แต่เมื่อผู้หยั่งรู้ส่องจะเห็นว่าเป็น "หมาป่า"',
    quote: 'ข้าไม่ใช่ปีศาจ... เชื่อข้าเถอะ',
    ability: 'เลือดผสม',
    imageUrl: 'https://images.unsplash.com/photo-1560706834-bed18b14e365?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager',
    investigationResult: RoleType.WEREWOLF
  },

  // Group B: Self/Neutral
  [RoleType.LONE_WOLF]: {
    type: RoleType.LONE_WOLF,
    name: 'หมาป่าเดียวดาย (Lone Wolf)',
    description: 'เหมือนหมาป่าปกติ แต่ชนะเมื่อเป็นหมาป่าตัวสุดท้ายที่เหลือรอด (หรือเหลือรอดคนเดียว)',
    quote: 'ข้าไม่ต้องการฝูง',
    ability: 'ทรยศ',
    imageUrl: 'https://images.unsplash.com/photo-1596796929949-a2e6f4244222?q=80&w=600&auto=format&fit=crop',
    alignment: 'Evil',
    team: 'Team Werewolf (Solo Win)'
  },
  [RoleType.TANNER]: {
    type: RoleType.TANNER,
    name: 'คนบ้า (Tanner)',
    description: 'ชนะเกมทันทีหากตัวเองตาย (ไม่ว่าจะโดนโหวตหรือโดนฆ่า)',
    quote: 'ความตายคือชัยชนะ',
    ability: 'อยากตาย',
    imageUrl: 'https://images.unsplash.com/photo-1589578527966-8178a3181841?q=80&w=600&auto=format&fit=crop',
    alignment: 'Neutral',
    team: 'Solo'
  },

  // Group C: Hybrid
  [RoleType.CURSED]: {
    type: RoleType.CURSED,
    name: 'ผู้โดนสาป (Cursed)',
    description: 'เริ่มต้นเป็นชาวบ้าน หากถูกหมาป่ากัดจะไม่ตาย แต่จะกลายเป็นหมาป่าแทน',
    quote: 'คำสาปในกายข้า... มันรอวันตื่น',
    ability: 'กลายพันธุ์',
    imageUrl: 'https://images.unsplash.com/photo-1601513445506-2ab0d4942d9c?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.DOPPELGANGER]: {
    type: RoleType.DOPPELGANGER,
    name: 'ด็อพเพิลเก็งเงอร์ (Doppelganger)',
    description: 'คืนแรกเลือกเป้าหมาย 1 คน หากคนนั้นตาย คุณจะได้รับบทบาทและความสามารถของเขามา',
    quote: 'ข้าจะเป็นเจ้า... ดีกว่าเจ้า',
    ability: 'เลียนแบบ',
    imageUrl: 'https://images.unsplash.com/photo-1550133730-69524bb8e48d?q=80&w=600&auto=format&fit=crop',
    alignment: 'Neutral',
    team: 'Unknown'
  },

  // Group D: Wolf Team
  [RoleType.WOLF_CUB]: {
    type: RoleType.WOLF_CUB,
    name: 'ลูกหมาป่า (Wolf Cub)',
    description: 'เป็นหมาป่า หากถูกฆ่าตาย คืนถัดไปหมาป่าจะฆ่าคนได้ 2 คน',
    quote: 'แม่จ๋า... ช่วยด้วย',
    ability: 'เรียกพวก',
    imageUrl: 'https://images.unsplash.com/photo-1582236528892-74c0a1f94a97?q=80&w=600&auto=format&fit=crop',
    alignment: 'Evil',
    team: 'Team Werewolf'
  },
  
  [RoleType.UNKNOWN]: {
    type: RoleType.UNKNOWN,
    name: 'ไม่ระบุตัวตน',
    description: 'รอดำเนินการ...',
    quote: '...',
    ability: '???',
    imageUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=600&auto=format&fit=crop',
    alignment: 'Unknown',
    team: 'Unknown'
  }
};
