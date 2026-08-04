import type { ReactNode } from 'react';

import type { AdSlotEligibility } from '@/lib/ads/ad-service';

type AdSlotProps = {
  children: ReactNode;
  eligibility: AdSlotEligibility;
  fallback?: ReactNode;
};

export function AdSlot({ children, eligibility, fallback = null }: AdSlotProps) {
  if (!eligibility.canRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
