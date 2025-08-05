# Digio Integration for Payment Verification

## Overview
This integration adds Digio digital signature verification as step 1 of the payment flow in the cart page.

## Files Created/Modified

### New Files:
- `services/digio.service.ts` - Digio API service with Web SDK integration
- `components/digio-verification-modal.tsx` - Modal for signature verification
- `app/api/digio/create-sign-request/route.ts` - API route for creating sign requests
- `app/api/digio/check-status/route.ts` - API route for checking document status

### Modified Files:
- `components/cart.tsx` - Integrated Digio verification into checkout flow

## Setup Instructions

1. **Environment Variables**
   Add to your `.env` file:
   ```
   DIGIO_API_KEY=your-digio-api-key
   DIGIO_BASE_URL=https://app.digio.in
   ```

2. **Get Digio API Key**
   - Sign up at https://app.digio.in
   - Get your API key from the dashboard
   - For testing, use sandbox URL: https://ext-gateway.digio.in

## Flow

1. User clicks "Verify & Checkout" in cart
2. Auth modal appears (if not authenticated)
3. After auth success, Digio verification modal opens
4. Document is created and Digio SDK popup opens
5. User completes Aadhaar-based signature
6. On success, payment flow continues
7. On failure, user can retry

## Features

- **Web SDK Integration**: Uses Digio's Web SDK for seamless popup experience
- **Aadhaar Signature**: Secure OTP-based Aadhaar signing
- **Real-time Status**: Immediate callback on signature completion
- **Error Handling**: Retry mechanism for failed signatures
- **Responsive UI**: Works on mobile and desktop

## API Endpoints

- `POST /api/digio/create-sign-request` - Creates signature request
- `POST /api/digio/check-status` - Checks document status

## Testing

1. Set `DIGIO_BASE_URL=https://ext-gateway.digio.in` for sandbox
2. Use test Aadhaar numbers provided by Digio
3. Complete the signature flow in popup
4. Verify payment proceeds after successful signature