import { describe, expect, it } from 'vitest';
import { statusBadge } from '../pages/TrackingLookupPage';

describe('statusBadge helper', () => {
  it('returns green for delivered', () => {
    expect(statusBadge('Delivered')).toContain('green');
  });

  it('returns amber for transit', () => {
    expect(statusBadge('In Transit')).toContain('amber');
  });

  it('returns red for exception', () => {
    expect(statusBadge('Exception - Address issue')).toContain('red');
  });

  it('defaults to sky for others', () => {
    expect(statusBadge('Info Received')).toContain('sky');
  });
});