/* src/components/CircularProgress.jsx */
import React from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({ percent, size = 100, strokeWidth = 8, color = 'var(--primary)', label = '' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--divider)"
          strokeWidth={strokeWidth}
        />
        {/* Animated Foreground Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <span style={{ fontSize: size * 0.18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{percent}%</span>
        {label && <span style={{ fontSize: size * 0.08, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: 2, fontWeight: 600 }}>{label}</span>}
      </div>
    </div>
  );
};

export default CircularProgress;
