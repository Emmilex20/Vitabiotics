# Admin Tracking Setup Guide

## Overview
Admins can automatically assign realistic tracking numbers to orders, which generates carrier-specific tracking numbers, tracking URLs, and notifies customers via email/SMS.

## Features

### Auto-Generate Realistic Tracking Numbers
Supports 5 major carriers with realistic tracking formats:
- **FedEx**: 12-digit format (e.g., `384298402930`)
- **UPS**: 1Z + 16 alphanumeric (e.g., `1ZA8B4C3D2E1F0G9H`)
- **DHL**: 10-11 digits (e.g., `7382910453`)
- **Royal Mail**: 2 letters + 9 digits + GB (e.g., `RA123456789GB`)
- **Parcelforce**: RN + 9 digits + GB (e.g., `RN987654321GB`)

### Automatic Tracking URLs
Each carrier-specific tracking number generates a real carrier URL:
- FedEx: `https://tracking.fedex.com/en/tracking/{trackingNumber}`
- UPS: `https://www.ups.com/track?tracknum={trackingNumber}`
- DHL: `https://www.dhl.com/en/en/home/tracking.html?tracking-id={trackingNumber}`
- Royal Mail: `https://tracking.royalmail.post/en/tracking?number={trackingNumber}`
- Parcelforce: `https://www.parcelforce.com/tracking?number={trackingNumber}`

### Customer Notifications
When a tracking number is assigned:
- Email notification sent (if customer has email)
- SMS notification sent (if customer has phone)
- Initial tracking status: "Label Created"
- Customer can immediately view tracking in their order

## Usage

### Option 1: Quick Assign (Recommended)

From the Order Detail page (admin only), use the **"Auto-Assign Tracking"** section:

1. **Select Carrier** (optional): Dropdown to choose specific carrier or leave blank for random
2. **Click "Assign"**: System instantly generates tracking number, URL, and notifies customer

**Result**: Order now has realistic tracking number that links to real carrier tracking page.

### Option 2: Bulk Assign

Assign tracking to multiple orders at once:

```bash
POST /api/admin/orders/bulk-assign-tracking
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderIds": ["order-id-1", "order-id-2", "order-id-3"],
  "carrier": "FedEx"  // optional; omit for random carrier
}
```

**Response**:
```json
{
  "message": "Bulk tracking assignment complete",
  "results": [
    {
      "orderId": "order-id-1",
      "success": true,
      "tracking": {
        "number": "384298402930",
        "carrier": "FedEx"
      }
    },
    ...
  ]
}
```

### Option 3: Single Assign (API)

Assign tracking to a single order:

```bash
POST /api/admin/orders/{orderId}/auto-assign-tracking?carrier=DHL
Authorization: Bearer {token}
```

**Parameters**:
- `orderId`: (path) Order ID
- `carrier` (query, optional): One of `FedEx`, `UPS`, `DHL`, `Royal Mail`, `Parcelforce`. If omitted, random carrier is selected.

**Response**:
```json
{
  "message": "Tracking assigned successfully",
  "order": {
    "_id": "order-id",
    "trackingNumber": "7382910453",
    "carrier": "DHL",
    "trackingUrl": "https://www.dhl.com/en/en/home/tracking.html?tracking-id=7382910453",
    "trackingStatus": "Label Created"
  }
}
```

## Customer Experience

After tracking is assigned, customers:
1. Receive email: "Order {orderId} — Tracking update: Label Created"
2. Receive SMS: "Order {orderId} update: Label Created. Tracking label generated for {Carrier}"
3. Can view order in **My Orders** → **View Tracking**
4. Can click "Track on carrier site" to view real carrier tracking page
5. Can look up tracking via **Public Tracking Lookup** (/track) without logging in

## Testing

### Unit Tests
```bash
cd server
npm test -- --run

# Output includes:
# ✓ generates random tracking with valid carrier
# ✓ generates FedEx tracking correctly
# ✓ generates UPS tracking correctly
# ✓ generates DHL tracking correctly
# ✓ generates Royal Mail tracking correctly
# ✓ generates Parcelforce tracking correctly
# ✓ generates unique tracking numbers
# ✓ all tracking URLs are valid URLs
```

### Manual Testing

1. **Login as admin**
2. **Go to Orders page** → Click "Details" on an order
3. **Admin section**: "Auto-Assign Tracking"
4. **Select carrier** (e.g., "FedEx") or leave blank for random
5. **Click "Assign"**
6. **Verify**:
   - Toast notification: "✓ Tracking assigned: {number}"
   - Order now shows tracking number and carrier
   - "Track on carrier site" link works
   - Customer receives email/SMS (if notifications configured)

## Environment Variables

For notifications to work, configure:

```env
# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@vitabiotics.com
APP_BASE_URL=https://vitabiotics.com

# SMS (Twilio, optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+1234567890
```

If not configured, system logs warnings and skips notifications gracefully.

## Advanced: Manual Tracking Updates

For real-time carrier integration (future), use **"Update Tracking (Manual)"** form to:
- Manually update tracking status (In Transit, Out for Delivery, Delivered, etc.)
- Add location and message
- Notify customer of progress

## Next Steps

1. **Real Carrier Integration**: Connect to EasyPost/Shippo webhooks for automatic tracking updates
2. **Scheduled Updates**: Add demo poller to auto-advance tracking statuses for testing
3. **Tracking History**: View full tracking history with timestamps
4. **Admin Analytics**: Dashboard showing order status distribution and average delivery time

## Troubleshooting

**"Tracking assignment failed"**
- Check admin role is set correctly
- Verify auth token is valid
- Check server logs for details

**"Customer didn't receive email/SMS"**
- Configure SMTP/Twilio env vars
- Check customer email/phone in user profile
- Set `NODE_ENV` to non-test mode

**"Tracking URL doesn't work"**
- URL is generated correctly; carrier site may need time to index tracking
- This is normal; tracking data propagates within 24 hours
