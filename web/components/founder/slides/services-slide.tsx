'use client';

import { motion } from 'motion/react';
import { SERVICES } from '../content';

export function ServicesSlide() {
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 rounded-2xl border p-6 shadow-xl backdrop-blur">
      <div className="mb-4">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">What we do</p>
        <h2 className="text-2xl font-semibold">Services</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.18 }}
            className="bg-card/50 rounded-lg border p-3"
          >
            <p className="text-sm font-medium">{s.title}</p>
            <p className="text-muted-foreground mt-0.5 text-xs leading-snug">{s.blurb}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
