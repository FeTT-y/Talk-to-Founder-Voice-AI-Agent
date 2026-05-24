'use client';

import {
  type Dispatch,
  type ReactNode,
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import type { LeadFieldId, ServiceId } from './content';

export type ActiveView =
  | { kind: 'none' }
  | { kind: 'services' }
  | { kind: 'service_detail'; service: ServiceId }
  | { kind: 'process' }
  | { kind: 'pricing' };

export type LeadDraft = Partial<Record<Exclude<LeadFieldId, 'notes'>, string>> & {
  notes?: string[];
};

interface FounderState {
  activeView: ActiveView;
  lead: LeadDraft;
  lastUpdatedField: LeadFieldId | null;
}

type Action =
  | { type: 'set_view'; view: ActiveView }
  | { type: 'set_lead_field'; field: LeadFieldId; value: string };

const initialState: FounderState = {
  activeView: { kind: 'none' },
  lead: {},
  lastUpdatedField: null,
};

function reducer(state: FounderState, action: Action): FounderState {
  switch (action.type) {
    case 'set_view':
      return { ...state, activeView: action.view };
    case 'set_lead_field': {
      const { field, value } = action;
      if (field === 'notes') {
        const notes = state.lead.notes ?? [];
        return {
          ...state,
          lead: { ...state.lead, notes: [...notes, value] },
          lastUpdatedField: 'notes',
        };
      }
      return {
        ...state,
        lead: { ...state.lead, [field]: value },
        lastUpdatedField: field,
      };
    }
  }
}

const FounderContext = createContext<{
  state: FounderState;
  dispatch: Dispatch<Action>;
} | null>(null);

export function FounderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <FounderContext.Provider value={value}>{children}</FounderContext.Provider>;
}

export function useFounderState() {
  const ctx = useContext(FounderContext);
  if (!ctx) {
    throw new Error('useFounderState must be used inside <FounderProvider>');
  }
  return ctx;
}
