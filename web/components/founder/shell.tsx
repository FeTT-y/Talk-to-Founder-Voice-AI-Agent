'use client';

import type { ReactNode } from 'react';
import { LeadPanel } from './lead-panel';
import { FounderOverlay } from './overlay';
import { FounderProvider } from './state';
import { useFounderDataChannel } from './use-data-channel';

function DataChannelBridge() {
  useFounderDataChannel();
  return null;
}

export function FounderShell({ children }: { children: ReactNode }) {
  return (
    <FounderProvider>
      <DataChannelBridge />
      {children}
      <FounderOverlay />
      <LeadPanel />
    </FounderProvider>
  );
}
