import dotenv from 'dotenv';

dotenv.config();

const EASYPOST_API_KEY = process.env.EASYPOST_API_KEY || '';

let client: any = null;
if (EASYPOST_API_KEY) {
  // lazy require to avoid dev-time issues if package not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const EasyPost = require('@easypost/api');
  client = new EasyPost(EASYPOST_API_KEY);
}

export const createTracker = async (trackingCode: string, carrier?: string) => {
  if (!client) throw new Error('EasyPost API key not configured');
  // EasyPost expects { tracking_code, carrier } or only tracking_code
  const tracker = await client.Tracker.create({ tracking_code: trackingCode, carrier });
  return tracker;
};

export const getTracker = async (trackerIdOrCode: string) => {
  if (!client) throw new Error('EasyPost API key not configured');
  // Try fetching by id first
  try {
    const tracker = await client.Tracker.retrieve(trackerIdOrCode);
    return tracker;
  } catch (e) {
    // fallback: try listing trackers by tracking_code
    const trackers = await client.Tracker.all({ page_size: 10, tracking_code: trackerIdOrCode });
    return trackers.trackers && trackers.trackers[0];
  }
};

import crypto from 'crypto';

export const verifyWebhook = (rawBody: Buffer | string, signature: string) => {
  const secret = process.env.EASYPOST_WEBHOOK_SECRET;
  // If no secret configured, accept webhooks (useful for local/dev)
  if (!secret) return true;

  if (!signature) return false;

  // Normalize signature (allow formats like "sha256=..." or raw hex)
  let incoming = signature;
  if (incoming.startsWith('sha256=')) incoming = incoming.split('=')[1];

  const payload = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody));
  const computed = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    const incomingBuf = Buffer.from(incoming, 'hex');
    const computedBuf = Buffer.from(computed, 'hex');
    if (incomingBuf.length !== computedBuf.length) return false;
    return crypto.timingSafeEqual(incomingBuf, computedBuf);
  } catch (e) {
    // fallback simple comparison
    return incoming === computed;
  }
};
