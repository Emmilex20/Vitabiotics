import { beforeEach, describe, expect, it } from 'vitest';
import { sendTrackingUpdateEmail, sentEmails, resetSentEmails } from '../utils/mailer';

describe('mailer (test mode)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    resetSentEmails();
  });

  it('captures sent email in test mode', async () => {
    const res = await sendTrackingUpdateEmail('user@example.com', 'order-123', { status: 'Shipped', message: 'On the way' });
    expect(res).toEqual({ sent: true, mocked: true });
    expect(sentEmails.length).toBe(1);
    expect(sentEmails[0].to).toBe('user@example.com');
    expect(sentEmails[0].subject).toContain('order-123');
  });
});