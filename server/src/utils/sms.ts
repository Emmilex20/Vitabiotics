import dotenv from 'dotenv';
import type { IOrder } from '../models/Order';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

export type SmsEntry = { to: string; body: string; timestamp: number };
export const sentSms: SmsEntry[] = [];

let client: any = null;
if (accountSid && authToken) {
  // Lazy require to avoid top-level dependency issues in environments without the package
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Twilio = require('twilio');
  client = new Twilio(accountSid, authToken);
}

export const setClient = (c: any) => { client = c; };
export const resetSentSms = () => { sentSms.length = 0; };

export const sendTrackingSms = async (to: string, orderId: string, entry: { status: string; location?: string; message?: string; timestamp?: Date }) => {
  const body = `Order ${orderId} update: ${entry.status}. ${entry.message ? entry.message : ''} ${entry.location ? 'Location: ' + entry.location : ''}`;

  // Test mode: capture the SMS in memory for assertions
  if (process.env.NODE_ENV === 'test' || process.env.SMS_MODE === 'test') {
    sentSms.push({ to, body, timestamp: Date.now() });
    return { sent: true, mocked: true };
  }

  if (!client || !fromNumber) {
    console.log('Twilio not configured; skipping SMS to', to);
    return { sent: false, skipped: true };
  }

  try {
    const resp = await client.messages.create({ from: fromNumber, to, body });
    console.log('SMS sent to', to);
    return { sent: true, info: resp };
  } catch (err) {
    console.error('Failed to send SMS to', to, err);
    return { sent: false, error: err };
  }
};
