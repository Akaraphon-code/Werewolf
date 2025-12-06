import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative w-full py-4 px-6 rounded-xl font-display font-bold text-lg tracking-wider uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    primary: "bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    secondary: "bg-secondary/20 text-secondary border border-secondary/50 hover:bg-secondary/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Glitch/Scanline effect overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full hover:translate-y-full transition-transform duration-1000 ease-in-out pointer-events-none" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : children}
      </span>
    </motion.button>
  );
};

export default Button;