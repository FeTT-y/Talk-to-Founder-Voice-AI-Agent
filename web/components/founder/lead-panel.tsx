'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LEAD_FIELDS, type LeadFieldId } from './content';
import { useFounderState } from './state';

function hasAnyField(lead: ReturnType<typeof useFounderState>['state']['lead']) {
  return LEAD_FIELDS.some((f) => {
    if (f.id === 'notes') return (lead.notes?.length ?? 0) > 0;
    return Boolean(lead[f.id]);
  });
}

export function LeadPanel() {
  const { state } = useFounderState();
  const { lead, lastUpdatedField } = state;
  const visible = hasAnyField(lead);

  const [flash, setFlash] = useState<LeadFieldId | null>(null);
  useEffect(() => {
    if (!lastUpdatedField) return;
    setFlash(lastUpdatedField);
    const t = setTimeout(() => setFlash(null), 1500);
    return () => clearTimeout(t);
  }, [lastUpdatedField, lead]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          key="lead-panel"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed top-1/2 right-4 z-40 hidden w-72 -translate-y-1/2 rounded-xl border p-4 shadow-xl backdrop-blur md:block"
          aria-label="Captured lead details"
        >
          <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
            What I&apos;m hearing
          </p>
          <p className="text-sm font-semibold">Live lead</p>
          <ul className="mt-3 space-y-2">
            {LEAD_FIELDS.map((f) => {
              const value =
                f.id === 'notes' ? (lead.notes ?? []).join(' · ') || undefined : lead[f.id];
              if (!value) return null;
              const isFlashing = flash === f.id;
              return (
                <li key={f.id} className="text-xs">
                  <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                    {f.label}
                  </p>
                  <motion.p
                    animate={{
                      backgroundColor: isFlashing
                        ? 'rgba(120, 200, 255, 0.18)'
                        : 'rgba(120, 200, 255, 0)',
                    }}
                    transition={{ duration: 0.4 }}
                    className="-mx-1 rounded px-1 text-sm leading-snug"
                  >
                    {value}
                  </motion.p>
                </li>
              );
            })}
          </ul>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
