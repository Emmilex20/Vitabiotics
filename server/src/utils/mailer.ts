/* eslint-disable @typescript-eslint/no-var-requires */
const nodemailer = require('nodemailer');
import dotenv from 'dotenv';
import { IOrder } from '../models/Order';

dotenv.config();

const host = process.env.EMAIL_HOST;
const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : undefined;
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const from = process.env.EMAIL_FROM || 'no-reply@vitabiotics.com';

/**
 * Test helpers: when running with NODE_ENV=test or EMAIL_MODE=test
 * we store sent messages in memory so tests can assert on them.
 */
export type MailEntry = { to: string; subject: string; html: string; timestamp: number };
export const sentEmails: MailEntry[] = [];

let transporter: any = null;
if (host && port && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export const setTransporter = (t: any) => { transporter = t; };
export const resetSentEmails = () => { sentEmails.length = 0; };

export const sendTrackingUpdateEmail = async (to: string, orderId: string, entry: { status: string; location?: string; message?: string; timestamp?: Date }) => {
  const subject = `Order ${orderId} — Tracking update: ${entry.status}`;
  const html = `
    <p>Hi,</p>
    <p>Your order <strong>${orderId}</strong> has a new tracking update:</p>
    <ul>
      <li><strong>Status:</strong> ${entry.status}</li>
      ${entry.location ? `<li><strong>Location:</strong> ${entry.location}</li>` : ''}
      ${entry.message ? `<li><strong>Note:</strong> ${entry.message}</li>` : ''}
      <li><strong>Time:</strong> ${new Date(entry.timestamp || Date.now()).toLocaleString()}</li>
    </ul>
    <p>You can view details in your order page: ${process.env.APP_BASE_URL || 'http://localhost:5173'}/orders/${orderId}</p>
    <p>Thanks,<br/>Vitabiotics Team</p>
  `;

  // Test mode: capture email in memory for assertions
  if (process.env.NODE_ENV === 'test' || process.env.EMAIL_MODE === 'test') {
    sentEmails.push({ to, subject, html, timestamp: Date.now() });
    return { sent: true, mocked: true };
  }

  if (!transporter) {
    console.log('Mailer not configured; skipping email to', to);
    return { sent: false, skipped: true };
  }

  try {
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log('Tracking email sent to', to);
    return { sent: true, info };
  } catch (err) {
    console.error('Failed to send tracking email', err);
    return { sent: false, error: err };
  }
};

// Simple admin message sender
export const sendAdminMessageEmail = async (to: string, subject: string, message: string) => {
  const html = `
    <p>Hi,</p>
    <div>${message}</div>
    <p>Regards,<br/>Vitabiotics Team</p>
  `;

  if (process.env.NODE_ENV === 'test' || process.env.EMAIL_MODE === 'test') {
    sentEmails.push({ to, subject, html, timestamp: Date.now() });
    return { sent: true, mocked: true };
  }

  if (!transporter) {
    console.log('Mailer not configured; skipping email to', to);
    return { sent: false, skipped: true };
  }

  try {
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log('Admin email sent to', to);
    return { sent: true, info };
  } catch (err) {
    console.error('Failed to send admin email', err);
    return { sent: false, error: err };
  }
};
