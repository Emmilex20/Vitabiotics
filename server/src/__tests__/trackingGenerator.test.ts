import { describe, expect, it } from 'vitest';
import {
  generateRandomTracking,
  generateTrackingForCarrier,
  SUPPORTED_CARRIERS,
} from '../utils/trackingGenerator';

describe('Tracking Number Generator', () => {
  it('generates random tracking with valid carrier', () => {
    const tracking = generateRandomTracking();
    expect(tracking.trackingNumber).toBeDefined();
    expect(tracking.carrier).toBeDefined();
    expect(tracking.trackingUrl).toBeDefined();
    expect(SUPPORTED_CARRIERS).toContain(tracking.carrier);
  });

  it('generates FedEx tracking correctly', () => {
    const tracking = generateTrackingForCarrier('FedEx');
    expect(tracking.carrier).toBe('FedEx');
    expect(tracking.trackingNumber).toMatch(/^\d{12}$/);
    expect(tracking.trackingUrl).toContain('fedex.com');
  });

  it('generates UPS tracking correctly', () => {
    const tracking = generateTrackingForCarrier('UPS');
    expect(tracking.carrier).toBe('UPS');
    expect(tracking.trackingNumber).toMatch(/^1Z[A-Z0-9]{16}$/);
    expect(tracking.trackingUrl).toContain('ups.com');
  });

  it('generates DHL tracking correctly', () => {
    const tracking = generateTrackingForCarrier('DHL');
    expect(tracking.carrier).toBe('DHL');
    expect(tracking.trackingNumber).toMatch(/^\d{10,11}$/);
    expect(tracking.trackingUrl).toContain('dhl.com');
  });

  it('generates Royal Mail tracking correctly', () => {
    const tracking = generateTrackingForCarrier('Royal Mail');
    expect(tracking.carrier).toBe('Royal Mail');
    expect(tracking.trackingNumber).toMatch(/^[A-Z]{2}\d{9}GB$/);
    expect(tracking.trackingUrl).toContain('royalmail.post');
  });

  it('generates Parcelforce tracking correctly', () => {
    const tracking = generateTrackingForCarrier('Parcelforce');
    expect(tracking.carrier).toBe('Parcelforce');
    expect(tracking.trackingNumber).toMatch(/^RN\d{9}GB$/);
    expect(tracking.trackingUrl).toContain('parcelforce.com');
  });

  it('generates unique tracking numbers', () => {
    const tracking1 = generateRandomTracking();
    const tracking2 = generateRandomTracking();
    expect(tracking1.trackingNumber).not.toBe(tracking2.trackingNumber);
  });

  it('all tracking URLs are valid URLs', () => {
    for (const carrier of SUPPORTED_CARRIERS) {
      const tracking = generateTrackingForCarrier(carrier);
      expect(() => new URL(tracking.trackingUrl)).not.toThrow();
    }
  });
});