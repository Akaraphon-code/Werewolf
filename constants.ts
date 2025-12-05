
import { Role, RoleType } from './types';

// The Role Codex (ฐานข้อมูลบทบาทฉบับภาษาไทย)
export const ROLES: Record<RoleType, Role> = {
  [RoleType.WEREWOLF]: {
    type: RoleType.WEREWOLF,
    name: 'มนุษย์หมาป่า',
    description: 'ตื่นขึ้นมาในตอนกลางคืนเพื่อเลือกเหยื่อที่ต้องการสังหาร 1 คน จงแนบเนียนไปกับฝูงชนในตอนกลางวันและปั่นหัวพวกชาวบ้าน',
    quote: 'คืนนี้... ใครจะเป็นรายต่อไป?',
    ability: 'สังหารเหยื่อ',
    imageUrl: 'https://images.unsplash.com/photo-1551106652-a5bcf4b2d759?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Evil',
    team: 'ทีมหมาป่า'
  },
  [RoleType.VILLAGER]: {
    type: RoleType.VILLAGER,
    name: 'ชาวบ้าน',
    description: 'ไม่มีพลังพิเศษใดๆ หน้าที่ของคุณคือใช้สติปัญญาและการสังเกต เพื่อจับผิดและโหวตประหารมนุษย์หมาป่าก่อนที่ทุกคนจะตายกันหมด',
    quote: 'ข้าก็แค่ชาวบ้านตาดำๆ คนนึง...',
    ability: 'โหวตหาคนผิด',
    imageUrl: 'https://images.unsplash.com/photo-1595231712325-9fdec6f6d9a3?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.SEER]: {
    type: RoleType.SEER,
    name: 'ผู้หยั่งรู้',
    description: 'ตื่นมาตอนกลางคืนเพื่อดูบทบาทของผู้เล่นอื่นได้ 1 คน ว่าเป็นฝ่ายดีหรือร้าย ข้อมูลของคุณคือกุญแจสำคัญที่จะพลิกเกม',
    quote: 'ความจริงมีเพียงหนึ่งเดียว...',
    ability: 'ส่องบทบาท',
    imageUrl: 'https://images.unsplash.com/photo-1620024870296-4c19075ee223?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.BODYGUARD]: {
    type: RoleType.BODYGUARD,
    name: 'ผู้พิทักษ์',
    description: 'เลือกปกป้องผู้เล่น 1 คนในตอนกลางคืน ผู้ที่ถูกปกป้องจะไม่ตายจากการโจมตีของหมาป่า แต่คุณปกป้องตัวเองไม่ได้',
    quote: 'ข้ามศพข้าไปก่อนเถอะ!',
    ability: 'ปกป้อง 1 คน',
    imageUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.HUNTER]: {
    type: RoleType.HUNTER,
    name: 'นายพราน',
    description: 'เลือกเป้าหมายไว้ทุกคืน หากคุณตายในคืนนั้นหรือถูกโหวตประหาร เป้าหมายที่คุณเลือกไว้จะถูกยิงตายตามคุณไป',
    quote: 'กระสุนนัดสุดท้าย... เพื่อแก!',
    ability: 'ลั่นไกเมื่อตาย',
    imageUrl: 'https://images.unsplash.com/photo-1559419610-1f3a28c3875e?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.MEDIUM]: {
    type: RoleType.MEDIUM,
    name: 'คนทรง',
    description: 'สามารถรู้ได้ว่าผู้เล่นที่ตายในคืนนั้น เป็นฝ่ายดีหรือฝ่ายร้าย หรือมีบทบาทอะไร (ขึ้นอยู่กับกติกา)',
    quote: 'คนตาย... ไม่เคยโกหก',
    ability: 'คุยกับศพ',
    imageUrl: 'https://images.unsplash.com/photo-1598556856230-e830f3f6e1e6?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.JESTER]: {
    type: RoleType.JESTER,
    name: 'ตัวตลก',
    description: 'เป้าหมายของคุณคือการทำให้ตัวเองถูกโหวตประหารในตอนกลางวัน หากทำสำเร็จคุณจะเป็นผู้ชนะเพียงผู้เดียว',
    quote: 'โลกนี้มันก็แค่ละครฉากหนึ่ง...',
    ability: 'ปั่นประสาท',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Neutral',
    team: 'ทีมตัวตลก'
  },
  [RoleType.SERIAL_KILLER]: {
    type: RoleType.SERIAL_KILLER,
    name: 'ฆาตกรต่อเนื่อง',
    description: 'ปีศาจในคราบมนุษย์ ฆ่าได้ทุกคืนและไม่มีใครหยุดคุณได้ การโจมตีของคุณทะลุการปกป้องของผู้พิทักษ์',
    quote: 'ความตายคือศิลปะ...',
    ability: 'ฆ่าทะลุเกราะ',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Evil',
    team: 'ทีมฆาตกร'
  },
  
  // --- PHASE 2 ROLES ---
  
  [RoleType.WOLF_MAN]: {
    type: RoleType.WOLF_MAN,
    name: 'หมาป่ามนุษย์',
    description: 'คุณคือหมาป่าที่มีร่างกายเป็นมนุษย์ ผู้หยั่งรู้จะเห็นคุณเป็น "ชาวบ้าน" (ฝ่ายดี) จงใช้ความไว้ใจนี้ทำลายพวกมันจากภายใน',
    quote: 'ข้าก็เหมือนพวกแกนั่นแหละ...',
    ability: 'อำพรางกาย',
    imageUrl: 'https://images.unsplash.com/photo-1560706834-bed18b14e365?q=80&w=600&auto=format&fit=crop',
    alignment: 'Evil',
    team: 'ทีมหมาป่า',
    investigationResult: RoleType.VILLAGER
  },
  [RoleType.WITCH]: {
    type: RoleType.WITCH,
    name: 'แม่มด',
    description: 'คุณมีขวดยา 2 ใบ: ยาแก้พิษ(ช่วยคนตาย) และยาพิษ(ฆ่าคนเป็น) คุณสามารถใช้ยาแต่ละขวดได้เพียงครั้งเดียวตลอดเกม',
    quote: 'ชีวิตและความตาย อยู่ในมือข้า',
    ability: 'ปรุงยา 2 ขนาน',
    imageUrl: 'https://images.unsplash.com/photo-1596700871966-26792da07981?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.DIRE_WOLF]: {
    type: RoleType.DIRE_WOLF,
    name: 'หมาป่าโลกันตร์',
    description: 'ในคืนแรก คุณต้องเลือก "คู่หู" หนึ่งคน หากคู่หูของคุณตาย คุณจะต้องตายตามไปด้วย จงปกป้องคู่หูของคุณให้ดี',
    quote: 'เราจะอยู่และตายไปด้วยกัน',
    ability: 'ผูกจิตคู่หู',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823528e?q=80&w=600&auto=format&fit=crop',
    alignment: 'Evil',
    team: 'ทีมหมาป่า'
  },
  [RoleType.CHANGELING]: {
    type: RoleType.CHANGELING,
    name: 'ภูตจำแลง',
    description: 'ในคืนแรก เลือกผู้เล่นต้นแบบหนึ่งคน หากผู้เล่นคนนั้นตาย คุณจะได้รับบทบาทและความสามารถของเขามาแทนที่',
    quote: 'ตัวตนของเจ้า... ข้าขอรับไว้ละนะ',
    ability: 'สวมรอยคนตาย',
    imageUrl: 'https://images.unsplash.com/photo-1542259681-d41a8a4eb4f9?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },

  // --- ADVANCED ROLES ---
  
  [RoleType.APPRENTICE_SEER]: {
    type: RoleType.APPRENTICE_SEER,
    name: 'ศิษย์เทพพยากรณ์',
    description: 'คุณคือผู้สืบทอด หากผู้หยั่งรู้ตัวจริงตาย คุณจะได้รับการเลื่อนขั้นเป็นผู้หยั่งรู้คนใหม่ในคืนถัดไป',
    quote: 'สักวันหนึ่ง... ข้าจะมองเห็นทุกสิ่ง',
    ability: 'สืบทอดพลัง',
    imageUrl: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.MINION]: {
    type: RoleType.MINION,
    name: 'สมุนรับใช้',
    description: 'ในคืนแรก คุณจะได้รู้ว่าใครเป็นหมาป่าบ้าง แต่หมาป่าจะไม่รู้ว่าคุณเป็นใคร',
    quote: 'ข้าคือกองหนุนที่ซื่อสัตย์',
    ability: 'รู้จักหมาป่า',
    imageUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=600&auto=format&fit=crop',
    alignment: 'Evil',
    team: 'ทีมหมาป่า'
  },
  [RoleType.DRUNK]: {
    type: RoleType.DRUNK,
    name: 'ขี้เมา',
    description: 'คุณเป็นชาวบ้านธรรมดาจนกระทั่งคืนที่ 3 ซึ่งเป็นเวลาที่คุณจะสร่างเมาและรับบทบาทแท้จริงของตัวเอง',
    quote: 'เอิ้ก... ข้าไม่เมานะ',
    ability: 'ไม่รู้ตัวตน',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.PRIEST]: {
    type: RoleType.PRIEST,
    name: 'ผู้เผยตัวตน',
    description: 'ในแต่ละคืนคุณสามารถเลือกชี้ผู้เล่นหนึ่งคน หากผู้เล่นคนนั้นเป็นหมาป่าจะถูกกำจัด แต่หากไม่ใช่ คุณจะถูกกำจัดแทน',
    quote: 'จงเผยธาตุแท้ออกมา!',
    ability: 'เดิมพันชีวิต',
    imageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.TROUBLEMAKER]: {
    type: RoleType.TROUBLEMAKER,
    name: 'ตัวป่วน',
    description: 'หนึ่งคืนต่อเกม คุณสามารถสร้างเรื่องให้ผู้เล่นต้องถูกโหวตกำจัด 2 คนในวันรุ่งขึ้น',
    quote: 'เรื่องวุ่นวายคืองานของข้า',
    ability: 'ปั่นให้ตายคู่ (1 ครั้ง)',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.INSOMNIAC]: {
    type: RoleType.INSOMNIAC,
    name: 'คนอดนอน',
    description: 'ในแต่ละคืน คุณจะได้รู้ว่ามีคนข้างๆ คุณอย่างน้อยหนึ่งคน ตื่นมาทำอะไรตอนกลางคืนหรือไม่',
    quote: 'นอนไม่หลับ... กระสับกระส่าย',
    ability: 'เฝ้าดูเพื่อนบ้าน',
    imageUrl: 'https://images.unsplash.com/photo-1517865288-978fcb780652?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.MASON]: {
    type: RoleType.MASON,
    name: 'ภราดรแห่งเมสัน',
    description: 'ในคืนแรก ลืมตาขึ้นมาเพื่อมองหาภราดรแห่งเมสันคนอื่นๆ',
    quote: 'เราคือพี่น้องกัน',
    ability: 'รู้จักเมสัน',
    imageUrl: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'ทีมชาวบ้าน'
  },
  [RoleType.UNKNOWN]: {
    type: RoleType.UNKNOWN,
    name: 'ไม่ระบุตัวตน',
    description: 'ยังไม่ทราบข้อมูล',
    quote: '...',
    ability: '???',
    imageUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=600&auto=format&fit=crop',
    alignment: 'Unknown',
    team: 'ไม่ระบุ'
  }
};
