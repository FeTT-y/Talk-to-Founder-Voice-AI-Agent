'use client';

import { motion } from 'motion/react';
import { PRICING } from '../content';

export function PricingCard() {
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 rounded-2xl border p-6 shadow-xl backdrop-blur">
      <div className="mb-4">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">Engagement model</p>
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Fixed scope, not hourly. No RFPs, no competitive bids.
        </p>
      </div>
      <ul className="divide-y">
        {PRICING.map((line, i) => (
          <motion.li
            key={line.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.18 }}
            className="flex items-baseline justify-between py-3"
          >
            <div>
              <p className="text-sm font-medium">{line.label}</p>
              {line.note && <p className="text-muted-foreground text-[11px]">{line.note}</p>}
            </div>
            <p className="font-mono text-base">{line.price}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
