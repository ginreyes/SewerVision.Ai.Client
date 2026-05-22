'use client';

import { motion } from 'framer-motion';

/**
 * ListItem — animated wrapper for list rows. Use inside <AnimatePresence>
 * to get stagger enter/exit on dashboard cards, project list rows, inbox
 * threads, etc.
 *
 * Pass `index` to stagger; entries become visible 25ms apart up to a
 * 200ms cap so a 50-row list still feels fast.
 */
export default function ListItem({ index = 0, children, className = '', ...rest }) {
  const delay = Math.min(index * 0.025, 0.2);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.1, delay, ease: 'easeOut' }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
