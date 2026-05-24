export type ServiceId =
  | 'ai_product_strategy'
  | 'voice_agents'
  | 'ai_features'
  | 'prototype_sprints'
  | 'fractional_cto';

export interface Service {
  id: ServiceId;
  title: string;
  blurb: string;
  detail: string;
  bestFor: string;
}

export const SERVICES: Service[] = [
  {
    id: 'ai_product_strategy',
    title: 'AI product strategy',
    blurb: 'Two-week sprint to figure out what to build.',
    detail:
      'Output: a product spec, a risk register, and a wireframe-grade prototype where it helps. We define the bet and the single constraint most likely to kill it.',
    bestFor: 'Teams under "we should be doing AI" pressure with no sharp thesis yet.',
  },
  {
    id: 'voice_agents',
    title: 'Voice AI agents',
    blurb: 'End-to-end voice agent builds.',
    detail:
      'Discovery, scheduling, support, sales qualification, intake. We handle design, the realtime pipeline, evals, ops, and telephony integration.',
    bestFor: 'Companies replacing a phone workflow with a voice AI experience.',
  },
  {
    id: 'ai_features',
    title: 'AI features in existing products',
    blurb: 'Drop-in RAG, agents, and copilots inside your app.',
    detail:
      'We embed with your engineering team and ship in-tree, not over the wall. Outcome: production AI features running in your codebase by week six.',
    bestFor: 'SaaS teams whose roadmap requires AI but whose team needs senior help.',
  },
  {
    id: 'prototype_sprints',
    title: 'Prototype sprints',
    blurb: 'One-week sprint to ship a working demo.',
    detail:
      'Real code, not Figma. Used most often by founders who need to derisk a thesis before raising, or by product leaders defending a roadmap to their board.',
    bestFor: 'Pre-Series-A teams that need a demo this month, not next quarter.',
  },
  {
    id: 'fractional_cto',
    title: 'Fractional CTO',
    blurb: 'Senior product-engineering judgment without the full-time hire.',
    detail:
      'Four-month minimum. Architecture decisions, hiring help, vendor selection, scoping calls — whatever the team needs from a senior partner.',
    bestFor: 'Early-stage teams that aren’t yet ready for a full-time CTO.',
  },
];

export interface ProcessPhase {
  id: string;
  title: string;
  duration: string;
  description: string;
}

export const PROCESS: ProcessPhase[] = [
  {
    id: 'discovery',
    title: 'Discovery',
    duration: '1 week',
    description:
      'Define the problem, the success metric, and the single constraint most likely to kill the project. End with a written go/no-go.',
  },
  {
    id: 'design',
    title: 'Design',
    duration: '2 weeks',
    description:
      'Build the smallest thing that proves the bet. End with a working prototype plus a build spec.',
  },
  {
    id: 'build',
    title: 'Build',
    duration: '4–8 weeks',
    description:
      'Engineering and design ship the production version with your team in the loop the whole way.',
  },
  {
    id: 'handoff',
    title: 'Handoff',
    duration: '90 days on-call',
    description:
      'Documentation, a one-week pairing with your team, and 90 days of retained on-call so issues hit us before you.',
  },
];

export interface PriceLine {
  label: string;
  price: string;
  note?: string;
}

export const PRICING: PriceLine[] = [
  { label: 'Discovery deep-dive', price: '$15k', note: 'one week' },
  { label: 'Prototype sprint', price: '$35k', note: 'one week' },
  { label: 'Build', price: '$50k–$200k', note: 'scoped after Design' },
  { label: 'Fractional CTO', price: '$12k/mo', note: 'four-month minimum' },
];

export type LeadFieldId =
  | 'name'
  | 'company'
  | 'role'
  | 'email'
  | 'problem'
  | 'current_solution'
  | 'timeline'
  | 'budget'
  | 'decision_process'
  | 'notes';

export const LEAD_FIELDS: { id: LeadFieldId; label: string }[] = [
  { id: 'name', label: 'Name' },
  { id: 'company', label: 'Company' },
  { id: 'role', label: 'Role' },
  { id: 'email', label: 'Email' },
  { id: 'problem', label: 'Problem' },
  { id: 'current_solution', label: 'Currently using' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'budget', label: 'Budget' },
  { id: 'decision_process', label: 'Decision process' },
  { id: 'notes', label: 'Notes' },
];
