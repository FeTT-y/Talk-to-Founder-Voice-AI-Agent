'use client';

import { useEffect } from 'react';
import { RoomEvent } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import type { LeadFieldId } from './content';
import { type ActiveView, useFounderState } from './state';

const TEXT_DECODER = new TextDecoder();

type VisualPayload =
  | { view: 'none' | 'services' | 'process' | 'pricing' }
  | { view: 'service_detail'; service: string };

type LeadPayload = { field: LeadFieldId; value: string };

function decodeVisual(payload: VisualPayload): ActiveView | null {
  switch (payload.view) {
    case 'none':
      return { kind: 'none' };
    case 'services':
      return { kind: 'services' };
    case 'process':
      return { kind: 'process' };
    case 'pricing':
      return { kind: 'pricing' };
    case 'service_detail':
      return {
        kind: 'service_detail',
        service: payload.service as ActiveView extends { kind: 'service_detail' }
          ? ActiveView['service']
          : never,
      };
    default:
      return null;
  }
}

export function useFounderDataChannel() {
  const room = useRoomContext();
  const { dispatch } = useFounderState();

  useEffect(() => {
    if (!room) return;

    const handle = (payload: Uint8Array, _participant: unknown, _kind: unknown, topic?: string) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(TEXT_DECODER.decode(payload));
      } catch (e) {
        console.warn('[founder] dropping malformed data message', e);
        return;
      }

      if (topic === 'visual') {
        const view = decodeVisual(parsed as VisualPayload);
        if (view) dispatch({ type: 'set_view', view });
        return;
      }

      if (topic === 'lead') {
        const { field, value } = parsed as LeadPayload;
        if (typeof field === 'string' && typeof value === 'string') {
          dispatch({ type: 'set_lead_field', field, value });
        }
        return;
      }
    };

    room.on(RoomEvent.DataReceived, handle);
    return () => {
      room.off(RoomEvent.DataReceived, handle);
    };
  }, [room, dispatch]);
}
