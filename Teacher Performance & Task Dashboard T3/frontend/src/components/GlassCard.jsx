/* src/components/GlassCard.jsx */
import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = true, delay = 0, onClick }) => {
  const isClickable = typeof onClick === 'function';

  return (
    <motion.div
      onClick={onClick}
      className={`glass-card ${hoverEffect ? 'glass-card-hover' : ''} ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1.0]
      }}
      whileHover={hoverEffect ? { y: -6, scale: 1.01 } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
