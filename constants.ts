
import { Role, RoleType } from './types';

// The Dark Role Codex (คัมภีร์ทมิฬฉบับสมบูรณ์)
export const ROLES: Record<RoleType, Role> = {
  [RoleType.WEREWOLF]: {
    type: RoleType.WEREWOLF,
    name: 'The Beast (อสูรกายรัตติกาล)',
    description: 'ภายใต้เงามืด คุณคือเพชฌฆาตที่กระหายเลือด จงเลือกเหยื่อสังเวยในยามค่ำคืนและแฝงตัวเป็นมนุษย์ผู้บริสุทธิ์ในยามทิวา',
    quote: 'กลิ่นความกลัวของเจ้า... มันช่างหอมหวานเหลือเกิน',
    ability: 'ฉีกกระชากวิญญาณ',
    imageUrl: 'https://images.unsplash.com/photo-1551106652-a5bcf4b2d759?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Evil',
    team: 'The Pack (เผ่าพันธุ์ทมิฬ)'
  },
  [RoleType.VILLAGER]: {
    type: RoleType.VILLAGER,
    name: 'The Forsaken (ผู้ถูกทอดทิ้ง)',
    description: 'ไร้ซึ่งพลัง ไร้ซึ่งคมเขี้ยว มีเพียงสติปัญญาและศรัทธาที่จะนำพาแสงสว่างมาสู่หมู่บ้านต้องสาปแห่งนี้',
    quote: 'พระเจ้า... ได้โปรดเมตตาพวกเราด้วย',
    ability: 'พิพากษาด้วยวาจา',
    imageUrl: 'https://images.unsplash.com/photo-1595231712325-9fdec6f6d9a3?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },
  [RoleType.SEER]: {
    type: RoleType.SEER,
    name: 'The Oracle (ผู้หยั่งรู้ชะตา)',
    description: 'ดวงตาที่สามของคุณมองเห็นธาตุแท้ของวิญญาณ จงใช้ญาณทิพย์เปิดเผยปีศาจที่แฝงกายก่อนที่ความมืดจะกลืนกินทุกสิ่ง',
    quote: 'ความจริง... ไม่อาจซ่อนเร้นจากดวงตาข้า',
    ability: 'เนตรทิพย์',
    imageUrl: 'https://images.unsplash.com/photo-1620024870296-4c19075ee223?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },
  [RoleType.BODYGUARD]: {
    type: RoleType.BODYGUARD,
    name: 'The Sentinel (ผู้พิทักษ์วิญญาณ)',
    description: 'โล่แห่งศรัทธาที่ปกป้องผู้บริสุทธิ์จากคมเขี้ยวปีศาจ เลือกปกป้องหนึ่งชีวิตในแต่ละคืน แต่ไม่อาจปกป้องตนเองได้',
    quote: 'ตราบที่ข้ายืนหยัด... เจ้าจะไม่ตาย',
    ability: 'โล่แห่งศรัทธา',
    imageUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },
  [RoleType.HUNTER]: {
    type: RoleType.HUNTER,
    name: 'The Avenger (ผู้ล้างแค้น)',
    description: 'ความตายไม่ใช่จุดจบ แต่เป็นสัญญาณแห่งการแก้แค้น หากลมหายใจสุดท้ายมาถึง จงลากวิญญาณศัตรูลงนรกไปพร้อมกับคุณ',
    quote: 'หากข้าต้องลงนรก... ข้าจะลากเจ้าไปด้วย!',
    ability: 'กระสุนนัดสุดท้าย',
    imageUrl: 'https://images.unsplash.com/photo-1559419610-1f3a28c3875e?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },
  [RoleType.MEDIUM]: {
    type: RoleType.MEDIUM,
    name: 'The Spirit Walker (คนทรงเจ้า)',
    description: 'เสียงกระซิบจากหลุมศพบอกความจริงแก่คุณ สามารถสื่อสารกับวิญญาณผู้ล่วงลับเพื่อล่วงรู้ธาตุแท้ของพวกเขา',
    quote: 'คนตาย... ไม่เคยโกหก',
    ability: 'เสียงกระซิบจากความตาย',
    imageUrl: 'https://images.unsplash.com/photo-1598556856230-e830f3f6e1e6?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },
  [RoleType.JESTER]: {
    type: RoleType.JESTER,
    name: 'The Madman (ตัวตลกวิปลาส)',
    description: 'ความตายคือมุกตลกที่ยิ่งใหญ่ที่สุด จงปั่นหัวทุกคนให้มอบความตายแก่คุณ แล้วคุณจะเป็นผู้ชนะเพียงหนึ่งเดียว',
    quote: 'ฮ่าๆๆ... ความตายมันน่าขำจะตายไป!',
    ability: 'การแสดงมรณะ',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Neutral',
    team: 'Solo (ตัวคนเดียว)'
  },
  [RoleType.SERIAL_KILLER]: {
    type: RoleType.SERIAL_KILLER,
    name: 'The Butcher (ฆาตกรวิปริต)',
    description: 'ปีศาจในคราบมนุษย์ที่โหดเหี้ยมยิ่งกว่าอสูร การฆ่าคือศิลปะ และไม่มีเกราะใดป้องกันคมมีดของคุณได้',
    quote: 'เลือดสีแดงสด... ช่างงดงามเหลือเกิน',
    ability: 'คมมีดทะลวงเกราะ',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&auto=format&fit=crop', 
    alignment: 'Evil',
    team: 'Solo (ตัวคนเดียว)'
  },
  
  // --- PHASE 2 ROLES ---
  
  [RoleType.WOLF_MAN]: {
    type: RoleType.WOLF_MAN,
    name: 'The Deceiver (หมาป่าจำแลง)',
    description: 'อสูรที่แนบเนียนที่สุด แม้แต่เนตรทิพย์ก็มองเห็นคุณเป็นเพียงมนุษย์ธรรมดา จงใช้ความไว้ใจนี้บดขยี้พวกมัน',
    quote: 'ข้าคือฝันร้ายที่เจ้ามองไม่เห็น',
    ability: 'อำพรางจิตสังหาร',
    imageUrl: 'https://images.unsplash.com/photo-1560706834-bed18b14e365?q=80&w=600&auto=format&fit=crop',
    alignment: 'Evil',
    team: 'The Pack (เผ่าพันธุ์ทมิฬ)',
    investigationResult: RoleType.VILLAGER
  },
  [RoleType.WITCH]: {
    type: RoleType.WITCH,
    name: 'The Alchemist (แม่มดดำ)',
    description: 'ผู้ครอบครองขวดยาแห่งชีวิตและความตาย คุณมีสิทธิ์เลือกที่จะยื้อลมหายใจใครสักคน หรือดับมันลงตลอดกาล',
    quote: 'ชะตาชีวิตของพวกเจ้า... อยู่ในกำมือข้า',
    ability: 'โอสถสั่งตาย / ยาชุบชีวิต',
    imageUrl: 'https://images.unsplash.com/photo-1596700871966-26792da07981?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },
  [RoleType.DIRE_WOLF]: {
    type: RoleType.DIRE_WOLF,
    name: 'The Soulbound (หมาป่าโลกันตร์)',
    description: 'อสูรผู้ผูกจิตวิญญาณ เลือกคู่หูหนึ่งคนในคืนแรก หากเขาตาย... คุณก็มิอาจอยู่รอด จงปกป้องเขาด้วยชีวิต',
    quote: 'วิญญาณเราผูกกัน... จนกว่าความตายจะพราก',
    ability: 'พันธะสัญญาเลือด',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823528e?q=80&w=600&auto=format&fit=crop',
    alignment: 'Evil',
    team: 'The Pack (เผ่าพันธุ์ทมิฬ)'
  },
  [RoleType.CHANGELING]: {
    type: RoleType.CHANGELING,
    name: 'The Faceless (ภูตไร้หน้า)',
    description: 'ผู้ไร้ตัวตนที่แท้จริง เลือกต้นแบบหนึ่งคน หากเขาตาย คุณจะสวมรอยรับบทบาทและพลังของเขามาเป็นของตน',
    quote: 'ตัวตนของเจ้า... ข้าขอยืมหน่อยนะ',
    ability: 'ขโมยอัตลักษณ์',
    imageUrl: 'https://images.unsplash.com/photo-1542259681-d41a8a4eb4f9?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },

  // --- ADVANCED ROLES ---
  
  [RoleType.APPRENTICE_SEER]: {
    type: RoleType.APPRENTICE_SEER,
    name: 'The Acolyte (ศิษย์พยากรณ์)',
    description: 'ผู้สืบทอดเจตจำนงแห่งดวงตาที่สาม เมื่อผู้หยั่งรู้ตัวจริงสิ้นชีพ พลังนั้นจะตื่นขึ้นในตัวคุณ',
    quote: 'ข้ารอคอยวันที่ดวงตาจะเบิกโพลง...',
    ability: 'รับมรดกเนตรทิพย์',
    imageUrl: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },
  [RoleType.MINION]: {
    type: RoleType.MINION,
    name: 'The Servant (สมุนรับใช้)',
    description: 'ทาสผู้ซื่อสัตย์ของเหล่าอสูร คุณรู้ว่าใครคือหมาป่า แต่พวกเขาไม่รู้ว่าคุณคือใคร จงปั่นป่วนชาวบ้านเพื่อนายท่าน',
    quote: 'เพื่อนายท่าน... ข้ายอมทำทุกอย่าง',
    ability: 'รับรู้อสูร',
    imageUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=600&auto=format&fit=crop',
    alignment: 'Evil',
    team: 'The Pack (เผ่าพันธุ์ทมิฬ)'
  },
  [RoleType.DRUNK]: {
    type: RoleType.DRUNK,
    name: 'The Drunkard (ขี้เมา)',
    description: 'สติที่เลือนรางทำให้คุณไม่รู้ตัวตนที่แท้จริง จนกว่าจะถึงคืนที่ 3 ความจริงจึงจะกระจ่าง',
    quote: 'เอิ้ก... โลกนี้มันหมุนติ้วไปหมด',
    ability: 'ลืมเลือนตัวตน',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },
  [RoleType.PRIEST]: {
    type: RoleType.PRIEST,
    name: 'The Inquisitor (ผู้ไต่สวน)',
    description: 'ศรัทธาอันแรงกล้าคืออาวุธ ชี้ตัวปีศาจเพื่อชำระล้าง หากผิดพลาด... ชีวิตของคุณคือเครื่องสังเวย',
    quote: 'จงเผยธาตุแท้... หรือมอดไหม้ไปซะ!',
    ability: 'พิพากษาศักดิ์สิทธิ์',
    imageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },
  [RoleType.TROUBLEMAKER]: {
    type: RoleType.TROUBLEMAKER,
    name: 'The Trickster (ตัวป่วน)',
    description: 'ความวุ่นวายคือความบันเทิง สร้างสถานการณ์ให้ชาวบ้านต้องประหารชีวิตคนเพิ่มเป็นสองเท่าในวันรุ่งขึ้น',
    quote: 'มาทำให้เรื่องมันสนุกขึ้นดีกว่า...',
    ability: 'ยุยงปลุกปั่น',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },
  [RoleType.INSOMNIAC]: {
    type: RoleType.INSOMNIAC,
    name: 'The Sleepless (คนตื่นตระหนก)',
    description: 'ความหวาดระแวงทำให้คุณข่มตาไม่ลง คอยเฝ้าดูเพื่อนข้างกายว่าใครลุกออกไปทำอะไรในความมืด',
    quote: 'พวกมัน... อยู่รอบตัวเรา',
    ability: 'เฝ้ายามราตรี',
    imageUrl: 'https://images.unsplash.com/photo-1517865288-978fcb780652?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },
  [RoleType.MASON]: {
    type: RoleType.MASON,
    name: 'The Brotherhood (ภราดรภาพ)',
    description: 'สมาคมลับที่รู้ตัวตนของกันและกัน ความสามัคคีคืออาวุธเดียวที่จะต่อกรกับความมืด',
    quote: 'เราจะไม่ทิ้งกัน',
    ability: 'สายใยพี่น้อง',
    imageUrl: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?q=80&w=600&auto=format&fit=crop',
    alignment: 'Good',
    team: 'The Village (ผู้รอดชีวิต)'
  },
  [RoleType.UNKNOWN]: {
    type: RoleType.UNKNOWN,
    name: 'Unknown Entity',
    description: 'ตัวตนที่ยังไม่ถูกเปิดเผย',
    quote: '...',
    ability: '???',
    imageUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=600&auto=format&fit=crop',
    alignment: 'Unknown',
    team: 'Unknown'
  }
};
