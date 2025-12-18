import { Request, Response } from 'express';
import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    status: string;
    customer: {
      email: string;
      id: number;
    };
    [key: string]: any;
  };
}

/**
 * Verify Paystack payment reference
 * POST /api/payments/verify-paystack
 */
export const verifyPaystackPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.body;
    const userId = (req as any).user.id;

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Reference is required' });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Paystack configuration missing' });
    }

    // Verify payment with Paystack
    const response = await axios.get<PaystackVerifyResponse>(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { data } = response;

    if (data.status && data.data.status === 'success') {
      // Payment successful
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        reference: data.data.reference,
        amount: data.data.amount,
        customerEmail: data.data.customer.email,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        status: data.data.status,
      });
    }
  } catch (error: any) {
    console.error('Paystack verification error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};

/**
 * Get Paystack initialization data
 * GET /api/payments/initialize
 */
export const getPaystackInitData = async (req: Request, res: Response) => {
  try {
    const publicKey = process.env.VITE_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || '';

    if (!publicKey) {
      return res.status(500).json({ success: false, message: 'Paystack public key not configured' });
    }

    return res.status(200).json({
      success: true,
      publicKey,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error getting Paystack configuration',
      error: error.message,
    });
  }
};

export const getPaystackStatus = async (req: Request, res: Response) => {
  try {
    // Log caller info for easier debugging (admin-only route)
    const caller = (req as any).user ? `${(req as any).user.email || (req as any).user.id}` : 'unknown';
    console.info(`Paystack status requested by admin: ${caller}`);

    const publicKey = process.env.VITE_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || '';
    const secretKey = process.env.PAYSTACK_SECRET_KEY || '';

    const hasPublic = !!publicKey;
    const hasSecret = !!secretKey;

    const maskedPublic = hasPublic ? `${publicKey.slice(0, 8)}...${publicKey.slice(-4)}` : null;
    const maskedSecret = hasSecret ? '****** (configured)' : null;

    return res.status(200).json({
      success: true,
      hasPublic,
      hasSecret,
      maskedPublic,
      maskedSecret,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error fetching Paystack status', error: error.message });
  }
};
