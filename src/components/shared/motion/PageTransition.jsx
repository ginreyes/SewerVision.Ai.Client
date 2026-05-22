'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * PageTransition — fade + tiny y-translate on route changes.
 *
 * Uses mode="popLayout" rather than "wait". App Router prefetches the next
 * page's RSC payload before the exit animation finishes; "wait" causes a
 * visible stall there. popLayout overlaps in/out and feels snappier.
 *
 * Keep transitions ≤120ms — anything longer feels stuck under prefetch.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
