# Notifications Setup (Email & SMS)

This document explains how to configure email and SMS notifications for tracking updates.

## Email (SMTP)

Required env vars:
- `EMAIL_HOST` - SMTP host (e.g., `smtp.sendgrid.net`)
- `EMAIL_PORT` - SMTP port (e.g., `587`)
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password
- `EMAIL_FROM` - Sender address shown in emails (default: `no-reply@vitabiotics.com`)
- `APP_BASE_URL` - Optional, to build links in emails (default `http://localhost:5173`)

Notes:
- We use `nodemailer` in `server/src/utils/mailer.ts` to send emails.
- If you prefer a transactional email provider (SendGrid, Mailgun), use their SMTP creds or native API.

## SMS (Twilio)

Required env vars:
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_FROM_NUMBER` - Sender phone number (E.164 format) to send SMS from

## EasyPost (Optional - Courier API)

Required env vars:
- `EASYPOST_API_KEY` - Your EasyPost API key
- `EASYPOST_WEBHOOK_SECRET` - (Optional) webhook signing secret for verification

Notes:
- We provide a simple EasyPost service wrapper in `server/src/services/easypostService.ts` and two endpoints:
  - POST `/api/shipping/create` (admin only) to create/link a tracker to an order
  - POST `/api/shipping/webhook` (public) to receive webhook events from EasyPost
- To enable real-time updates, set up a webhook in EasyPost that points to `/api/shipping/webhook` on your server, and configure `EASYPOST_WEBHOOK_SECRET` with your webhook signing secret for verification.
- The webhook handler verifies the HMAC-SHA256 signature of the raw request body against `EASYPOST_WEBHOOK_SECRET`. If `EASYPOST_WEBHOOK_SECRET` is not set, the handler will accept events (useful for local/dev testing only).
Notes:
- SMS is sent via `server/src/utils/sms.ts` (Twilio SDK). If Twilio is not configured, SMS calls are skipped and logged.
- Make sure the `phone` field is present on the User (e.g., `+2348000000000`).

## Testing notifications locally

1. Configure env vars in `.env` (do not commit secrets).
2. Start the server.
3. As admin, update tracking via PUT `/api/orders/:id/tracking` with tracking details; mail and SMS will be attempted.
4. The poller will also send notifications as it advances statuses.

## Security & Best Practices

- Use environment variables, never commit secrets.
- Prefer transactional providers (SendGrid/Twilio) for reliability.
- Consider rate-limiting notification sends and retry strategies for failed deliveries.
