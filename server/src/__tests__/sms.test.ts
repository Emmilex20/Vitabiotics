import { beforeEach, describe, expect, it } from 'vitest';
import { sendTrackingSms, sentSms, resetSentSms } from '../utils/sms';

describe('sms helper (test mode)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    resetSentSms();
  });

  it('captures SMS in test mode', async () => {
    const res = await sendTrackingSms('+441234567890', 'order-456', { status: 'Delivered', message: 'Left at door' });
    expect(res).toEqual({ sent: true, mocked: true });
    expect(sentSms.length).toBe(1);
    expect(sentSms[0].to).toBe('+441234567890');
    expect(sentSms[0].body).toContain('order-456');
  });
});