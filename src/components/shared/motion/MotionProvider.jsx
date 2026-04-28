'use client';

import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';

/**
 * MotionProvider — wraps the app with framer-motion's MotionConfig and
 * also initializes a hard prefers-reduced-motion check on first paint
 * (some browsers don't honor MotionConfig's reducedMotion="user" until
 * the second render, which causes a single visible animation flash).
 */
export default function MotionProvider({ children }) {
  const [reducedMotion, setReducedMotion] = useState('user');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches ? 'always' : 'user');
    const onChange = () => setReducedMotion(mq.matches ? 'always' : 'user');
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return (
    <MotionConfig reducedMotion={reducedMotion} transition={{ duration: 0.1 }}>
      {children}
    </MotionConfig>
  );
}
