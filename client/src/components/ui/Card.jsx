import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -5, scale: 1.01 } : {}}
      className={`
        bg-white/90 backdrop-blur-xl border border-black/5 rounded-[24px] 
        shadow-sm transition-all duration-400
        ${hover ? 'hover:shadow-xl hover:shadow-success/10 hover:border-success/20' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
