'use client';

import { motion, AnimatePresence } from 'framer-motion';

/**
 * ModalShell — drop-in wrapper for modal contents. Scales up + fades in
 * over 100ms. Pair with whatever overlay/portal the modal already uses.
 *
 * Usage:
 *   <ModalShell open={open}>{modalContent}</ModalShell>
 */
export default function ModalShell({ open, children, className = '' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
