import { beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { sentEmails, resetSentEmails } from '../utils/mailer';
import { sentSms, resetSentSms } from '../utils/sms';

/**
 * E2E Tracking Flow Tests (unit-level mocks)
 * 
 * These tests simulate order tracking workflows:
 * 1. Admin creates/links a tracker (simulated)
 * 2. Webhook updates tracking status (simulated)
 * 3. Customer notifications are sent (email + SMS)
 * 
 * In production, connect to real MongoDB and API endpoints.
 */

describe('Order Tracking Flows (E2E simulation)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    resetSentEmails();
    resetSentSms();
  });

  it('simulates complete tracking workflow: created -> in-transit -> delivered', async () => {
    const orderId = 'order-' + Date.now();
    const trackingNumber = 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Step 1: Admin creates tracker (simulated)
    const tracker = {
      orderId,
      trackingNumber,
      carrier: 'EasyPost',
      status: 'created',
    };
    expect(tracker.orderId).toBe(orderId);

    // Step 2: Simulate tracking updates via webhook
    const trackingUpdates = [
      { status: 'Info Received', location: 'Processing', message: 'Shipment info created' },
      { status: 'In Transit', location: 'UK Distribution Center', message: 'Package in transit' },
      { status: 'Out for Delivery', location: 'Local Delivery Hub', message: 'Out with driver' },
      { status: 'Delivered', location: 'Delivered to customer', message: 'Left at door' },
    ];

    // Simulate notifications for each update
    const { sendTrackingUpdateEmail } = await import('../utils/mailer');
    const { sendTrackingSms } = await import('../utils/sms');

    for (const update of trackingUpdates) {
      await sendTrackingUpdateEmail('customer@vitabiotics.com', orderId, { ...update, timestamp: new Date() });
      await sendTrackingSms('+442071838750', orderId, { ...update, timestamp: new Date() });
    }

    // Step 3: Verify workflow state
    expect(sentEmails.length).toBe(trackingUpdates.length);
    expect(sentSms.length).toBe(trackingUpdates.length);

    // Verify email notifications
    expect(sentEmails[0].html).toContain('Info Received');
    expect(sentEmails[sentEmails.length - 1].html).toContain('Delivered');

    // Verify SMS notifications
    expect(sentSms[0].body).toContain('Info Received');
    expect(sentSms[sentSms.length - 1].body).toContain('Delivered');

    console.log(`✓ Tracking workflow complete for order ${orderId}`);
  });

  it('handles parallel tracking updates without losing notifications', async () => {
    const orderId = 'parallel-order-' + Date.now();
    
    const { sendTrackingUpdateEmail } = await import('../utils/mailer');
    const { sendTrackingSms } = await import('../utils/sms');

    // Simulate rapid updates
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        sendTrackingUpdateEmail('customer@vitabiotics.com', orderId, {
          status: `Update ${i}`,
          message: `Batch update ${i}`,
          timestamp: new Date(),
        })
      );
      promises.push(
        sendTrackingSms('+442071838750', orderId, {
          status: `Update ${i}`,
          message: `Batch update ${i}`,
          timestamp: new Date(),
        })
      );
    }

    await Promise.all(promises);

    expect(sentEmails.length).toBe(5);
    expect(sentSms.length).toBe(5);
  });

  it('notifies multiple recipients if order has shared access', async () => {
    const orderId = 'shared-order-' + Date.now();
    const recipients = [
      { email: 'owner@vitabiotics.com', phone: '+442071838750' },
      { email: 'family@vitabiotics.com', phone: '+441234567890' },
    ];

    const { sendTrackingUpdateEmail } = await import('../utils/mailer');
    const { sendTrackingSms } = await import('../utils/sms');

    for (const recipient of recipients) {
      await sendTrackingUpdateEmail(recipient.email, orderId, {
        status: 'In Transit',
        location: 'UK',
        timestamp: new Date(),
      });
      await sendTrackingSms(recipient.phone, orderId, {
        status: 'In Transit',
        location: 'UK',
        timestamp: new Date(),
      });
    }

    expect(sentEmails.length).toBe(2);
    expect(sentSms.length).toBe(2);

    expect(sentEmails[0].to).toBe('owner@vitabiotics.com');
    expect(sentEmails[1].to).toBe('family@vitabiotics.com');
  });
});