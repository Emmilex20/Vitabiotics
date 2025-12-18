import { beforeEach, describe, expect, it } from 'vitest';
import { sentEmails, resetSentEmails, sendTrackingUpdateEmail } from '../utils/mailer';
import { sentSms, resetSentSms, sendTrackingSms } from '../utils/sms';

describe('Notifications Integration (Mailer + SMS + Tracking)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    resetSentEmails();
    resetSentSms();
  });

  it('sends tracking update email when order status changes', async () => {
    const entry = { status: 'Shipped', location: 'Distribution Center, UK', message: 'Package left facility', timestamp: new Date() };
    const result = await sendTrackingUpdateEmail('customer@example.com', 'order-789', entry);
    
    expect(result.sent).toBe(true);
    expect(result.mocked).toBe(true);
    expect(sentEmails.length).toBe(1);
    expect(sentEmails[0].to).toBe('customer@example.com');
    expect(sentEmails[0].subject).toContain('order-789');
    expect(sentEmails[0].html).toContain('Shipped');
    expect(sentEmails[0].html).toContain('Distribution Center');
  });

  it('sends tracking SMS when order status changes', async () => {
    const entry = { status: 'Out for Delivery', message: 'Expected delivery today', timestamp: new Date() };
    const result = await sendTrackingSms('+442071838750', 'order-789', entry);
    
    expect(result.sent).toBe(true);
    expect(result.mocked).toBe(true);
    expect(sentSms.length).toBe(1);
    expect(sentSms[0].to).toBe('+442071838750');
    expect(sentSms[0].body).toContain('order-789');
    expect(sentSms[0].body).toContain('Out for Delivery');
  });

  it('handles multiple tracking updates with emails and SMS', async () => {
    const updates = [
      { status: 'Info Received', message: 'Shipment info received' },
      { status: 'In Transit', location: 'UK', message: 'Package in transit' },
      { status: 'Out for Delivery', message: 'With delivery driver' },
      { status: 'Delivered', location: 'Delivered to address', message: 'Signed for' },
    ];

    for (const update of updates) {
      const entry = { ...update, timestamp: new Date() };
      await sendTrackingUpdateEmail('customer@example.com', 'order-integration-test', entry);
      await sendTrackingSms('+442071838750', 'order-integration-test', entry);
    }

    // Verify all emails and SMS were captured
    expect(sentEmails.length).toBe(4);
    expect(sentSms.length).toBe(4);

    // Verify last email is delivery confirmation
    expect(sentEmails[3].html).toContain('Delivered');
    expect(sentSms[3].body).toContain('Delivered');
  });

  it('tracks timestamp for each notification', async () => {
    const entry = { status: 'Pending', timestamp: new Date() };
    await sendTrackingUpdateEmail('customer@example.com', 'order-123', entry);
    await sendTrackingSms('+441234567890', 'order-123', entry);

    const emailTime = sentEmails[0].timestamp;
    const smsTime = sentSms[0].timestamp;

    expect(emailTime).toBeLessThanOrEqual(Date.now());
    expect(smsTime).toBeLessThanOrEqual(Date.now());
  });
});