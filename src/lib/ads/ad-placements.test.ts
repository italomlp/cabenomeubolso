import { describe, expect, it } from '@jest/globals';

import { resolveAllowedAdPlacement } from './ad-placements';

describe('allowed ad placements', () => {
  it('allows only Home after list content and finalized Summary', () => {
    expect(resolveAllowedAdPlacement('home')).toBe('home-list-content');
    expect(resolveAllowedAdPlacement('summary', 'finalized')).toBe('finalized-summary');
  });

  it('keeps planning, active shopping, and non-finalized Summary ad-free', () => {
    expect(resolveAllowedAdPlacement('planning', 'draft')).toBeNull();
    expect(resolveAllowedAdPlacement('active-shopping', 'active')).toBeNull();
    expect(resolveAllowedAdPlacement('summary', 'active')).toBeNull();
    expect(resolveAllowedAdPlacement('summary', 'draft')).toBeNull();
  });
});
