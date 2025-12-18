# Testing & CI Guide

## Overview
This guide covers the test suites, CI workflows, and best practices for the Vitabiotics e-commerce platform.

## Running Tests Locally

### Backend Tests
```bash
cd server
npm install
npm test                  # Run all tests in watch mode
npm test -- --run       # Run tests once (CI mode)
```

**Test suites:**
- `src/__tests__/mailer.test.ts` — Email notification unit tests
- `src/__tests__/sms.test.ts` — SMS notification unit tests
- `src/__tests__/notifications.integration.test.ts` — Email + SMS workflow integration
- `src/__tests__/tracking.flow.test.ts` — End-to-end tracking flow simulations

**Key features tested:**
- ✅ Email notifications sent with correct order ID, status, and details
- ✅ SMS notifications capture tracking updates and customer info
- ✅ Multiple tracking updates don't lose notifications
- ✅ Multi-recipient notifications (shared orders)
- ✅ Notification timestamps recorded accurately

### Frontend Tests
```bash
cd client
npm install
npm test                  # Run tests in watch mode
npm test -- --run       # Run tests once (CI mode)
```

**Test suites:**
- `src/__tests__/tracking.test.tsx` — Tracking UI helper tests (statusBadge)

**Deferred tests (Vitest + React 19 compatibility pending):**
- `src/__tests__/Navbar.test.tsx`
- `src/__tests__/ProfilePage.test.tsx`

## Test Environment Variables

### Server
For tests, the following env vars are used (from `.env` or test defaults):
```
NODE_ENV=test
EMAIL_MODE=test           # Captures emails in memory instead of sending
SMS_MODE=test             # Captures SMS in memory instead of sending
```

When `NODE_ENV=test` or `*_MODE=test`, notification helpers capture messages in memory:
- `mailer.ts`: appends to `sentEmails[]` array
- `sms.ts`: appends to `sentSms[]` array

Tests access these arrays for assertions.

### Client
```
VITE_API_URL=http://localhost:5000
```

## CI/CD Pipeline

### GitHub Actions (Example)
Create `.github/workflows/test.yml`:
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install server dependencies
        run: cd server && npm ci
      
      - name: Run server tests
        run: cd server && npm test -- --run
        env:
          NODE_ENV: test
      
      - name: Install client dependencies
        run: cd client && npm ci
      
      - name: Run client tests
        run: cd client && npm test -- --run
        env:
          NODE_ENV: test
      
      - name: Build client
        run: cd client && npm run build
      
      - name: Build server
        run: cd server && npm run build
```

## Writing New Tests

### Backend (Vitest + Node)
```typescript
import { beforeEach, describe, expect, it } from 'vitest';
import { sentEmails, resetSentEmails, sendTrackingUpdateEmail } from '../utils/mailer';

describe('Feature Name', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    resetSentEmails();
  });

  it('should test behavior', async () => {
    const result = await sendTrackingUpdateEmail('user@example.com', 'order-123', {
      status: 'Shipped',
      timestamp: new Date(),
    });
    
    expect(result.sent).toBe(true);
    expect(sentEmails.length).toBe(1);
    expect(sentEmails[0].to).toBe('user@example.com');
  });
});
```

### Frontend (Vitest + React)
For simple utility tests:
```typescript
import { describe, expect, it } from 'vitest';
import { statusBadge } from '../pages/TrackingLookupPage';

describe('statusBadge', () => {
  it('returns green for delivered', () => {
    expect(statusBadge('Delivered')).toContain('green');
  });
});
```

For component integration tests (not yet supported due to React 19 compatibility):
- Use E2E testing framework like Playwright for full DOM/browser testing
- Or wait for Vitest + React 19 integration improvements

## Known Limitations

1. **Component Integration Tests**: Vitest + @testing-library/react requires additional setup for React 19.
   - **Workaround**: Use E2E tests (Playwright/Cypress) for full component testing.

2. **Database Tests**: Tests use in-memory mocks for notifications.
   - **For integration with DB**: Set up test MongoDB instance or use mocking libraries like `jest-mongodb`.

## Troubleshooting

### Tests hang or timeout
- Check that `NODE_ENV=test` is set for notification helpers
- Ensure `resetSentEmails()` and `resetSentSms()` are called in `beforeEach()`

### "No test suite found" error
- Check that test files have at least one `describe()` or `it()` block
- Ensure vitest.config.ts has correct include/exclude patterns

### Module resolution errors
- Run `npm install` in the appropriate directory (server or client)
- Check that tsconfig.json has correct rootDir and outDir settings

## Next Steps

1. **Add E2E tests** using Playwright for full user workflows
2. **Set up code coverage** reporting with Vitest + codecov
3. **Add API endpoint tests** for order, tracking, and user endpoints
4. **Improve component tests** when React 19 is better supported by testing libraries
5. **Add load testing** for tracking webhook performance
