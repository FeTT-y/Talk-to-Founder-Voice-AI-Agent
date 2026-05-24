'use client';

import { SERVICES, type ServiceId } from '../content';
import { ServicesSlide } from './services-slide';

export function ServiceDetail({ serviceId }: { serviceId: ServiceId }) {
  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) return <ServicesSlide />;

  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 rounded-2xl border p-6 shadow-xl backdrop-blur">
      <p className="text-muted-foreground text-xs tracking-wide uppercase">Service</p>
      <h2 className="mt-1 text-2xl font-semibold">{service.title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{service.blurb}</p>
      <hr className="border-border my-4" />
      <p className="text-sm leading-relaxed">{service.detail}</p>
      <div className="bg-card/40 mt-4 rounded-lg border p-3">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">Best for</p>
        <p className="mt-1 text-sm">{service.bestFor}</p>
      </div>
    </div>
  );
}
