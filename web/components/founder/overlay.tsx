'use client';

import { AnimatePresence, motion } from 'motion/react';
import { PricingCard } from './slides/pricing-card';
import { ProcessDiagram } from './slides/process-diagram';
import { ServiceDetail } from './slides/service-detail';
import { ServicesSlide } from './slides/services-slide';
import { useFounderState } from './state';

const MOTION_PROPS = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

export function FounderOverlay() {
  const { state } = useFounderState();
  const { activeView } = state;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[12svh] z-30 flex justify-center px-4">
      <AnimatePresence mode="wait">
        {activeView.kind !== 'none' && (
          <motion.div
            key={
              activeView.kind === 'service_detail'
                ? `service_detail:${activeView.service}`
                : activeView.kind
            }
            {...MOTION_PROPS}
            className="pointer-events-auto w-full max-w-3xl"
          >
            {activeView.kind === 'services' && <ServicesSlide />}
            {activeView.kind === 'service_detail' && (
              <ServiceDetail serviceId={activeView.service} />
            )}
            {activeView.kind === 'process' && <ProcessDiagram />}
            {activeView.kind === 'pricing' && <PricingCard />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
