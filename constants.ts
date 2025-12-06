
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
    imageUrl: 'https://i.postimg.cc/3wr3gxw4/hmap-a.png', 
    alignment: 'Evil',
    team: 'Team Werewolf'
  },
  [RoleType.VILLAGER]: {
    type: RoleType.VILLAGER,
    name: 'ชาวบ้าน (Villager)',
    description: 'ไม่มีพลังพิเศษ สิ่งเดียวที่มีคือไหวพริบในการจับผิดและโหวตคนร้าย',
    quote: 'เราต้องช่วยกันปกป้องหมู่บ้านนี้',
    ability: 'โหวตจับผิด',
    imageUrl: 'https://i.postimg.cc/rF7ZLn4b/ชาวบ_าน.png', 
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.SEER]: {
    type: RoleType.SEER,
    name: 'ผู้หยั่งรู้ (Seer)',
    description: 'สามารถดูบทบาทของผู้เล่นอื่นได้คืนละ 1 คน ว่าเป็นฝ่ายดีหรือฝ่ายร้าย',
    quote: 'ความจริงมีเพียงหนึ่งเดียว',
    ability: 'ส่องดูบทบาท',
    imageUrl: 'https://i.postimg.cc/hjCMZpgr/ผ_หย_งร_(seer).png', 
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.BODYGUARD]: {
    type: RoleType.BODYGUARD,
    name: 'บอดี้การ์ด (Bodyguard)',
    description: 'เลือกปกป้องผู้เล่น 1 คนในตอนกลางคืน ให้รอดพ้นจากการถูกฆ่า (ห้ามซ้ำคนเดิม)',
    quote: 'ข้าจะปกป้องเจ้าเอง',
    ability: 'คุ้มกัน',
    imageUrl: 'https://i.postimg.cc/pXmc4bmc/บอด_การ_ด.png', 
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.HUNTER]: {
    type: RoleType.HUNTER,
    name: 'นายพราน (Hunter)',
    description: 'หากคุณตาย คุณสามารถเลือกยิงผู้เล่นอื่นให้ตายตกไปตามกันได้ 1 คน',
    quote: 'ถ้าข้าตาย... เจ้าก็ต้องตายด้วย',
    ability: 'ยิงสวนก่อนตาย',
    imageUrl: 'https://i.postimg.cc/rmhgZQct/นายพราน.png', 
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.MEDIUM]: {
    type: RoleType.MEDIUM,
    name: 'คนทรง (Medium)',
    description: 'สามารถสื่อสารกับคนตาย หรือรู้บทบาทของคนที่ตายไปแล้ว',
    quote: 'เสียงกระซิบจากความตาย...',
    ability: 'สื่อสารวิญญาณ',
    imageUrl: 'https://i.postimg.cc/Jn7PQ9wc/คนทรง.png', 
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.JESTER]: {
    type: RoleType.JESTER,
    name: 'ตัวตลก (Jester)',
    description: 'เป้าหมายคือการทำให้ตัวเองถูกโหวตประหารในตอนกลางวันเพื่อชนะเกม',
    quote: 'โหวตข้าสิ! ฆ่าข้าเลย!',
    ability: 'ยั่วโมโห',
    imageUrl: 'https://i.postimg.cc/V6sDF3yn/ต_วตลก.png', 
    alignment: 'Neutral',
    team: 'Solo'
  },
  [RoleType.SERIAL_KILLER]: {
    type: RoleType.SERIAL_KILLER,
    name: 'ฆาตกรต่อเนื่อง (Serial Killer)',
    description: 'ฆ่าใครก็ได้คืนละ 1 คน ชนะเมื่อเหลือรอดเป็นคนสุดท้าย',
    quote: 'ทุกคนคือเหยื่อ...',
    ability: 'ฆ่าไร้ปรานี',
    imageUrl: 'https://i.postimg.cc/zBD0k9mR/ฆาตกรต_อเน_อง_(Serial_Killer).png', 
    alignment: 'Evil',
    team: 'Solo'
  },
  [RoleType.WOLF_MAN]: {
    type: RoleType.WOLF_MAN,
    name: 'มนุษย์หมาป่าจำแลง (Wolf Man)',
    description: 'เป็นหมาป่า แต่เมื่อถูกผู้หยั่งรู้ส่องจะเห็นเป็น "ชาวบ้าน"',
    quote: 'เจ้าแยกข้าไม่ออกหรอก',
    ability: 'อำพรางตัวตน',
    imageUrl: 'https://i.postimg.cc/Jn7PQ9wG/หมาป_าจำแลง.png',
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
    imageUrl: 'https://i.postimg.cc/C1Mm4Wy1/แม_มด.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.DIRE_WOLF]: {
    type: RoleType.DIRE_WOLF,
    name: 'หมาป่าคู่ (Dire Wolf)',
    description: 'เลือกผูกวิญญาณกับผู้เล่น 1 คน หากคนนั้นตาย คุณจะตายด้วย',
    quote: 'เราจะอยู่และตายไปด้วยกัน',
    ability: 'ผูกวิญญาณ',
    imageUrl: 'https://i.postimg.cc/vmt0fGKT/หมาป_าค.png',
    alignment: 'Evil',
    team: 'Team Werewolf'
  },
  [RoleType.CHANGELING]: {
    type: RoleType.CHANGELING,
    name: 'จอมโจร (Changeling)',
    description: 'เลือกผู้เล่น 1 คน หากคนนั้นตาย คุณจะสวมรอยรับบทบาทของเขา',
    quote: 'ข้าคือเงาของเจ้า',
    ability: 'สวมรอย',
    imageUrl: 'https://i.postimg.cc/tgNBW9cy/จอมโจร.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.APPRENTICE_SEER]: {
    type: RoleType.APPRENTICE_SEER,
    name: 'ผู้หยั่งรู้ฝึกหัด (Apprentice Seer)',
    description: 'เป็นชาวบ้านธรรมดา จนกว่าผู้หยั่งรู้ตัวจริงจะตาย คุณถึงจะได้รับพลัง',
    quote: 'ข้ารอเวลาของข้า',
    ability: 'รับสืบทอด',
    imageUrl: 'https://i.postimg.cc/9fYLZck5/ผ_หย_งร_ฝ_กห_ด.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.MINION]: {
    type: RoleType.MINION,
    name: 'สมุนปีศาจ (Minion)',
    description: 'รู้ว่าใครเป็นหมาป่า แต่หมาป่าไม่รู้ว่าคุณคือใคร ช่วยปั่นป่วนให้หมาป่าชนะ',
    quote: 'เพื่อนายท่าน!',
    ability: 'รู้ตัวหมาป่า',
    imageUrl: 'https://i.postimg.cc/d0j5rJxg/ล_กสม_น.png',
    alignment: 'Evil',
    team: 'Team Werewolf'
  },
  [RoleType.DRUNK]: {
    type: RoleType.DRUNK,
    name: 'ขี้เมา (Drunk)',
    description: 'ไม่รู้บทบาทจริงของตัวเอง จนกว่าจะถึงคืนที่ 3',
    quote: 'เอิ้ก... มึนไปหมด',
    ability: 'ไม่รู้ตัวตน',
    imageUrl: 'https://i.postimg.cc/zfFxKqc0/ข_เมา.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.PRIEST]: {
    type: RoleType.PRIEST,
    name: 'นักบวช (Priest)',
    description: 'ตรวจสอบผู้เล่น 1 คน ถ้าเป็นหมาป่าจะฆ่าทิ้งทันที ถ้าไม่ใช่คุณจะตายเอง',
    quote: 'พระเจ้าจะตัดสินเจ้า',
    ability: 'ชำระบาป',
    imageUrl: 'https://i.postimg.cc/5tVPXXnT/น_กบวช.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.TROUBLEMAKER]: {
    type: RoleType.TROUBLEMAKER,
    name: 'ตัวป่วน (Troublemaker)',
    description: 'เลือกก่อกวนในคืนใดก็ได้ 1 ครั้ง ทำให้วันรุ่งขึ้นมีการโหวตตาย 2 คน',
    quote: 'มาเล่นอะไรสนุกๆ กันดีกว่า',
    ability: 'ก่อกวน',
    imageUrl: 'https://i.postimg.cc/fbNHVVB7/ต_วป_วน.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.INSOMNIAC]: {
    type: RoleType.INSOMNIAC,
    name: 'คนนอนไม่หลับ (Insomniac)',
    description: 'ตื่นขึ้นมาดูว่าผู้เล่นที่นั่งติดกันซ้ายขวา ลุกออกไปทำแอคชั่นหรือไม่',
    quote: 'ใครตื่นอยู่บ้างนะ?',
    ability: 'เฝ้าสังเกต',
    imageUrl: 'https://i.postimg.cc/pdH0mmqD/คนนอนไม_หล_บ.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.MASON]: {
    type: RoleType.MASON,
    name: 'สมาคมลับ (Mason)',
    description: 'ตื่นมาเจอเพื่อนที่เป็น Mason ด้วยกัน ทำให้มั่นใจว่าเพื่อนไม่ใช่หมาป่า',
    quote: 'เรารู้ไส้รู้พุงกันดี',
    ability: 'รู้จักพวกพ้อง',
    imageUrl: 'https://i.postimg.cc/CKgvRRmR/สมาคม_Mason.png',
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
    imageUrl: 'https://i.postimg.cc/1zQW88JV/เจ_าชาย.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.REVEALER]: {
    type: RoleType.REVEALER,
    name: 'ผู้เปิดเผยตัวตน (Revealer)',
    description: 'เลือก 1 คน ถ้าเป็นหมาป่า หมาป่าตาย ถ้าไม่ใช่หมาป่า คุณตายเอง',
    quote: 'ข้าจะกระชากหน้ากากเจ้า',
    ability: 'เปิดโปง',
    imageUrl: 'https://i.postimg.cc/8zWKkRBP/ผ_เป_ดเผยตน.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.SPELLCASTER]: {
    type: RoleType.SPELLCASTER,
    name: 'ผู้ร่ายเวท (Spellcaster)',
    description: 'เลือกผู้เล่น 1 คน เป้าหมายจะถูก "ใบ้" ในวันถัดไป (พูดไม่ได้ โหวตไม่ได้)',
    quote: 'จงเงียบเสียงลง...',
    ability: 'ร่ายเวทใบ้',
    imageUrl: 'https://i.postimg.cc/RV2pzsfC/ผ_ร_ายเวท.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.TOUGH_GUY]: {
    type: RoleType.TOUGH_GUY,
    name: 'หนุ่มบึ้ก (Tough Guy)',
    description: 'หากถูกหมาป่ากัด จะยังไม่ตายทันที แต่จะไปตายในคืนถัดไปแทน',
    quote: 'แค่นี้ไม่เจ็บหรอก',
    ability: 'อึดถึกทน',
    imageUrl: 'https://i.postimg.cc/MKg38PRw/หน_มบ_ก.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.VILLAGER_IDIOT]: {
    type: RoleType.VILLAGER_IDIOT,
    name: 'ชาวบ้านผู้โง่เง่า (Villager Idiot)',
    description: 'คุณต้องโหวตประหารทุกวัน ห้ามงดออกเสียง',
    quote: 'เอ๊ะ? ต้องโหวตเหรอ? งั้นโหวตเจ้านั่น!',
    ability: 'บ้าบอ',
    imageUrl: 'https://i.postimg.cc/3JzfHSp5/ชาวบ_านโง.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.LYCAN]: {
    type: RoleType.LYCAN,
    name: 'ลูกครึ่งหมา (Lycan)',
    description: 'เป็นฝ่ายชาวบ้าน แต่เมื่อผู้หยั่งรู้ส่องจะเห็นว่าเป็น "หมาป่า"',
    quote: 'ข้าไม่ใช่ปีศาจ... เชื่อข้าเถอะ',
    ability: 'เลือดผสม',
    imageUrl: 'https://i.postimg.cc/L6GQMCPx/ล_กคร_งหมา.png',
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
    imageUrl: 'https://i.postimg.cc/MKn3N2nY/หมาป_าเด_ยวดาย.png',
    alignment: 'Evil',
    team: 'Team Werewolf (Solo Win)'
  },
  [RoleType.TANNER]: {
    type: RoleType.TANNER,
    name: 'คนบ้า (Tanner)',
    description: 'ชนะเกมทันทีหากตัวเองตาย (ต้องโดยโหวตออกเท่านั้น)',
    quote: 'ความตายคือชัยชนะ',
    ability: 'อยากตาย',
    imageUrl: 'https://i.postimg.cc/NfKCSqKK/คนบ_า.png',
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
    imageUrl: 'https://i.postimg.cc/KvCpyqTd/ผ_โดนสาบ.png',
    alignment: 'Good',
    team: 'Team Villager'
  },
  [RoleType.DOPPELGANGER]: {
    type: RoleType.DOPPELGANGER,
    name: 'ด็อพเพิลเก็งเงอร์ (Doppelganger)',
    description: 'คืนแรกเลือกเป้าหมาย 1 คน หากคนนั้นตาย คุณจะได้รับบทบาทและความสามารถของเขามา',
    quote: 'ข้าจะเป็นเจ้า... ดีกว่าเจ้า',
    ability: 'เลียนแบบ',
    imageUrl: 'https://i.postimg.cc/gkxtQFxH/ด_อพเพ_ลเก_งเงอร.png',
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
    imageUrl: 'https://i.postimg.cc/J76dp4z4/ล_กหมาป_า.png',
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
