# Vitabiotics - Naira & Paystack Setup Guide

## Summary of Changes

This document covers the complete setup for:
1. **Nigerian Naira (₦) Currency** - All product prices now display in NGN
2. **Paystack Payment Integration** - Full payment processing with Paystack

---

## 1. Currency Setup (₦ Nigerian Naira)

### Changes Made:
- **Created `/client/src/utils/currency.ts`** - Currency conversion utilities
  - `formatNaira()` - Formats numbers as Nigerian Naira
  - `getNairaPrice()` - Converts USD prices to NGN (1 USD = 1500 NGN)
  - `convertUSDToNGN()` - Raw conversion function

### Updated Files:
- `ProductCard.tsx` - Displays product prices in Naira
- `AdminProductList.tsx` - Admin dashboard shows prices in Naira
- `AdminProductForm.tsx` - Price input label changed to "₦ Naira"
- `CartPage.tsx` - Cart displays all prices in Naira
- `CheckoutPage.tsx` - Checkout summary in Naira
- `ProductDetailPage.tsx` - Product detail page shows Naira prices
- `HomePage.tsx` - Featured products updated to Naira prices

### Exchange Rate:
```typescript
const USD_TO_NGN_RATE = 1500; // 1 USD = ₦1500
```

**To adjust**: Edit `/client/src/utils/currency.ts` line 5

---

## 2. Paystack Payment Integration

### What You Need:
1. **Paystack Account** - Sign up at https://paystack.com
2. **API Keys** - Get from https://dashboard.paystack.com/#/settings/developer
   - Public Key: `pk_live_...` or `pk_test_...`
   - Secret Key: `sk_live_...` or `sk_test_...`

### Client Setup:

#### Step 1: Add Environment Variables
Create/update `/client/.env`:
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_API_URL=http://localhost:5000
```

#### Step 2: Files Created/Updated
- **`/client/src/utils/paystack.ts`** - Paystack payment handling
  - `initializePaystack()` - Loads Paystack script
  - `handlePaystackPayment()` - Opens Paystack modal
  - `verifyPaystackPayment()` - Verifies payment with backend

- **`CheckoutPage.tsx`** - Updated with Paystack support
  - Payment method radio buttons updated to show "Paystack" and "Bank Transfer"
  - Countries changed to Nigeria, Ghana, Kenya
  - Full Paystack integration flow

### Server Setup:

#### Step 1: Add Environment Variables
Create/update `/server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/vitabiotics
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
PORT=5000
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

#### Step 2: Files Created
- **`/server/src/controllers/paymentController.ts`** - Paystack verification
  - `verifyPaystackPayment()` - Verifies payment reference with Paystack API
  - `getPaystackInitData()` - Returns Paystack public key

- **`/server/src/routes/paymentRoutes.ts`** - Payment endpoints
  - `POST /api/payments/verify-paystack` - Verify payment (protected)
  - `GET /api/payments/initialize` - Get Paystack config

#### Step 3: Server Updated
- **`/server/src/server.ts`** - Added payment routes
  ```typescript
  import paymentRoutes from './routes/paymentRoutes';
  app.use('/api/payments', paymentRoutes);
  ```

---

## 3. Payment Flow

### Customer Checkout Process:
1. Add items to cart
2. Go to checkout page
3. Enter shipping address (Nigeria, Ghana, or Kenya)
4. Select payment method:
   - **Paystack** (Debit/Credit Card) - ⭐ Recommended
   - **Bank Transfer** (Future feature)
5. Click "Place Order"
6. Paystack modal opens
7. Enter card details and verify
8. Payment confirmed, order created
9. Redirected to success page

### Backend Verification:
1. Frontend calls `verifyPaystackPayment()` with reference
2. Backend validates reference with Paystack API
3. If valid, order is created in database
4. Response sent back to frontend

---

## 4. Testing Paystack

### Test Cards (Use in Paystack Test Mode):
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
OTP: 123456 (when prompted)
```

### Enable Test Mode:
1. Use `pk_test_...` and `sk_test_...` keys in development
2. Switch to `pk_live_...` and `sk_live_...` for production

---

## 5. Installation & Running

### Install Dependencies:
```bash
# Client
cd client
npm install

# Server
cd ../server
npm install
```

### Setup Environment Files:
```bash
# Copy examples to actual .env files
cp client/.env.example client/.env
cp server/.env.example server/.env

# Edit both files with your actual keys
```

### Start Development:
```bash
# Terminal 1 - Backend (from server folder)
npm run dev

# Terminal 2 - Frontend (from client folder)
npm run dev
```

---

## 6. Important Notes

### Currency Display:
- All prices stored in database are now in Naira (₦)
- When creating products via admin, enter price in NGN
- Conversion utility is for reference only during migration

### Paystack Security:
- **Never** commit `.env` files with real keys
- Public key can be shared, secret key must be private
- Always use HTTPS in production
- Store secret key securely on server only

### Migration from USD:
If you have existing products in USD:
1. Multiply by 1500 to get NGN price
2. Update in database
3. Or use `getNairaPrice()` temporarily during migration

### WebHooks (Future):
For production, consider implementing Paystack webhooks:
```typescript
POST /api/payments/webhook
// Verify payment status
// Update order status in database
// Send confirmation email
```

---

## 7. Troubleshooting

### Paystack modal doesn't open:
- Check `VITE_PAYSTACK_PUBLIC_KEY` is set correctly
- Verify Paystack script loaded in browser console
- Check network tab for failed requests

### Payment verification fails:
- Ensure `PAYSTACK_SECRET_KEY` is correct on server
- Check order data is being sent correctly
- Review server logs for errors

### Prices show incorrectly:
- Verify `formatNaira()` is imported in components
- Check `USD_TO_NGN_RATE` constant
- Clear browser cache and restart

---

## 8. Next Steps

1. ✅ Get Paystack API keys
2. ✅ Add keys to `.env` files
3. ✅ Test payment flow in development
4. ✅ Test with real Paystack test cards
5. ✅ Set up production keys when ready
6. ⚠️ Implement email notifications (optional)
7. ⚠️ Set up Paystack webhooks for reliability (optional)

---

## Contact & Support

For Paystack support: https://support.paystack.com
For integration help: https://paystack.com/docs/payments/accept-payments/

---

**Last Updated:** December 13, 2025
**Currency:** Nigerian Naira (₦)
**Exchange Rate:** 1 USD = ₦1500 (configurable)
