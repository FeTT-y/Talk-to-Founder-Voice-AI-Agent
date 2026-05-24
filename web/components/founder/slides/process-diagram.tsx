'use client';

import { motion } from 'motion/react';
import { PROCESS } from '../content';

export function ProcessDiagram() {
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 rounded-2xl border p-6 shadow-xl backdrop-blur">
      <div className="mb-5">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">How we work</p>
        <h2 className="text-2xl font-semibold">Process</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {PROCESS.map((phase, i) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.2 }}
            className="bg-card/50 relative rounded-lg border p-3"
          >
            <p className="text-muted-foreground font-mono text-[10px]">0{i + 1}</p>
            <p className="mt-1 text-sm font-medium">{phase.title}</p>
            <p className="text-muted-foreground mt-0.5 text-[11px]">{phase.duration}</p>
            <p className="mt-2 text-xs leading-snug">{phase.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
