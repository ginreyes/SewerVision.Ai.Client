'use client';

import { motion, AnimatePresence } from 'framer-motion';

/**
 * DrawerShell — slide-from-side drawer animation. Defaults to right-side
 * with a subtle spring. Used by the project chat drawer, project timeline
 * drawer, and any other right-rail surface.
 */
export default function DrawerShell({ open, side = 'right', children, className = '' }) {
  const initialX = side === 'right' ? 32 : -32;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: initialX }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: initialX }}
          transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.6 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
