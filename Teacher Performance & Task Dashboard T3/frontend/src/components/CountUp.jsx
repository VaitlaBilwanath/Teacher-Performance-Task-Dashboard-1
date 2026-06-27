/* src/components/CountUp.jsx */
import React, { useState, useEffect } from 'react';

const CountUp = ({ value, end, duration = 1200, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    
    // Support both 'end' and 'value' props, defaulting to 0
    const rawValue = end !== undefined ? end : value;
    const target = Number.isFinite(Number(rawValue)) ? Number(rawValue) : 0;
    
    if (target === 0 && (rawValue === undefined || rawValue === null)) {
      setCount(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      // Handle edge case where duration might be 0
      const safeDuration = duration > 0 ? duration : 1200;
      const progress = Math.min((timestamp - startTimestamp) / safeDuration, 1);
      
      // Easing function: easeOutQuad
      const easedProgress = progress * (2 - progress);
      
      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, end, duration]);

  const safeCount = Number.isFinite(Number(count)) ? Number(count) : 0;
  return <span>{safeCount.toLocaleString()}{suffix}</span>;
};

export default CountUp;
