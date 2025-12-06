
import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Role, RoleType } from '../types';
import { Info, Shield, Skull, Eye, Moon, Quote, Ghost, HelpCircle, Smartphone } from 'lucide-react';

interface RoleCardProps {
  role: Role;
}

const RoleCard: React.FC<RoleCardProps> = ({ role }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPermissionBtn, setShowPermissionBtn] = useState(false);

  // --- TILT EFFECT LOGIC ---
  // Input range: -1 to 1 (Normalized position)
  const inputX = useMotionValue(0);
  const inputY = useMotionValue(0);

  // Spring physics for smooth movement
  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  
  // Calculate rotation based on input
  // Max tilt: +/- 15 degrees
  const rotateX = useSpring(useTransform(inputY, [-1, 1], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(inputX, [-1, 1], [-15, 15]), springConfig);

  // Glare position calculation
  // Moves the gradient highlight opposite to the tilt to simulate a static light source
  const glareX = useSpring(useTransform(inputX, [-1, 1], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(inputY, [-1, 1], [0, 100]), springConfig);

  useEffect(() => {
    // Check if iOS 13+ permission is needed
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      setShowPermissionBtn(true);
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position from center of screen (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      inputX.set(x);
      inputY.set(y);
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // Gamma: Left/Right tilt (-90 to 90)
        // Clamp to +/- 45 degrees for usable range
        const gamma = Math.max(-45, Math.min(45, e.gamma));
        
        // Beta: Front/Back tilt (-180 to 180)
        // Assume holding phone at ~45 degree angle is "neutral"
        const beta = Math.max(0, Math.min(90, e.beta)) - 45;

        // Normalize to -1 to 1 range
        inputX.set(gamma / 45);
        inputY.set(beta / 45);
      }
    };

    // Listeners
    window.addEventListener('mousemove', handleMouseMove);
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (window.DeviceOrientationEvent) {
         window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [inputX, inputY]);

  const requestAccess = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setShowPermissionBtn(false);
        }
      } catch (error) {
        console.error('Permission request failed', error);
      }
    }
  };
  // -------------------------

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const getRoleIcon = (type: RoleType) => {
    switch (type) {
      case RoleType.WEREWOLF: return <Moon className="w-8 h-8 text-red-500" />;
      case RoleType.SEER: return <Eye className="w-8 h-8 text-cyan-400" />;
      case RoleType.BODYGUARD: return <Shield className="w-8 h-8 text-green-400" />;
      case RoleType.HUNTER: return <Skull className="w-8 h-8 text-yellow-500" />;
      case RoleType.MEDIUM: return <Ghost className="w-8 h-8 text-purple-300" />;
      case RoleType.JESTER: return <HelpCircle className="w-8 h-8 text-pink-400" />;
      case RoleType.VILLAGER: return <Info className="w-8 h-8 text-blue-400" />;
      default: return <Info className="w-8 h-8 text-slate-400" />;
    }
  };

  return (
    // Defined @container for container queries
    <div className="relative w-full max-w-sm aspect-[3/5] mx-auto perspective-1000 @container">
      
      {/* iOS Permission Button */}
      {showPermissionBtn && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={requestAccess}
          className="absolute -top-12 right-0 z-50 flex items-center gap-2 bg-purple-500/20 backdrop-blur-md border border-purple-500/50 px-4 py-2 rounded-full text-purple-300 shadow-lg hover:bg-purple-500/30 transition-colors font-header text-xs uppercase tracking-wider"
        >
          <Smartphone className="w-4 h-4" />
          <span>Enable 3D</span>
        </motion.button>
      )}

      {/* TILT CONTAINER: Handles 3D rotation from input */}
      <motion.div
        style={{ rotateX, rotateY }}
        className="w-full h-full relative transform-style-3d transition-transform duration-75 ease-out"
      >
        {/* FLIP CONTAINER: Handles the card flipping mechanic */}
        <motion.div
          className="w-full h-full relative transform-style-3d cursor-pointer"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={handleFlip}
        >
          {/* Front of Card */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl overflow-hidden glass-card shadow-2xl border border-slate-700/50">
            {/* GLARE EFFECT LAYER */}
            <motion.div 
              className="absolute inset-0 z-30 pointer-events-none opacity-40 mix-blend-overlay"
              style={{
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`,
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900 z-10" />
            
            <img 
              src={role.imageUrl} 
              alt={role.name} 
              className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-80"
            />

            <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col items-center text-center">
              <div className="mb-4 p-4 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                 {getRoleIcon(role.type)}
              </div>
              
              {/* Font Header (Fahkwang) for Name */}
              <h2 className="text-3xl @[300px]:text-4xl font-header font-bold text-white mb-2 tracking-widest neon-text-purple uppercase">
                {role.name}
              </h2>
              <p className="text-xs @[300px]:text-sm text-slate-300 font-light tracking-widest uppercase opacity-80 font-header">
                แตะเพื่อดูข้อมูล
              </p>
            </div>

            {/* Decorative Borders */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-purple-500/50 rounded-tl-lg z-20" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-purple-500/50 rounded-tr-lg z-20" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-purple-500/50 rounded-bl-lg z-20" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-purple-500/50 rounded-br-lg z-20" />
          </div>

          {/* Back of Card */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl">
             {/* GLARE EFFECT LAYER (Back) */}
             <motion.div 
              className="absolute inset-0 z-30 pointer-events-none opacity-30 mix-blend-overlay"
              style={{
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%)`,
              }}
            />

            {/* Use the new Gothic Back Image if available, or fallback to gradient */}
            <div className="absolute inset-0 z-0">
               <img 
                 src="https://img5.pic.in.th/file/secure-sv1/Gemini_Generated_Image_1hb9tx1hb9tx1hb9.png" 
                 alt="Card Back" 
                 className="w-full h-full object-cover opacity-60"
               />
               <div className="absolute inset-0 bg-slate-950/80 mix-blend-multiply" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col p-6">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <h3 className="text-xl @[300px]:text-2xl font-header font-bold text-purple-400">{role.name}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] @[300px]:text-xs font-bold uppercase tracking-wider font-header ${role.alignment === 'Evil' ? 'bg-red-500/20 text-red-400' : role.alignment === 'Neutral' ? 'bg-pink-500/20 text-pink-400' : 'bg-green-500/20 text-green-400'}`}>
                  {role.team}
                </span>
              </div>

              <div className="space-y-6 flex-grow">
                
                {/* Flavor Text / Quote - Uses Charmonman (font-horror) */}
                <div className="relative p-4 bg-white/5 rounded-lg border-l-2 border-purple-500 italic">
                   <Quote className="absolute top-2 left-2 w-3 h-3 text-purple-500/50 -scale-x-100" />
                   <p className="text-lg font-horror text-center px-2 leading-relaxed text-purple-200 neon-text-purple">
                     "{role.quote}"
                   </p>
                   <Quote className="absolute bottom-2 right-2 w-3 h-3 text-purple-500/50" />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-header">เป้าหมาย</h4>
                  <p className="text-sm @[300px]:text-base text-slate-200 leading-relaxed font-light font-header">
                    {role.description}
                  </p>
                </div>

                <div className="bg-purple-900/10 p-3 rounded-xl border border-purple-500/20">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-2 font-header">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    ความสามารถ
                  </h4>
                  <p className="text-sm text-purple-100 font-medium font-header">
                    {role.ability}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-4 text-center">
                <p className="text-[10px] @[300px]:text-xs text-slate-600 uppercase tracking-widest font-header">
                  แตะเพื่อซ่อน
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RoleCard;
