import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40',
    outline: 'border-2 border-primary/20 hover:border-primary/50 text-primary bg-transparent',
    ghost: 'hover:bg-primary/10 text-text-muted hover:text-primary'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center px-8 py-3 rounded-xl 
        font-semibold cursor-pointer transition-all duration-300 gap-2 text-base border-none
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
