/**
 * Paystack Payment Integration
 * Initialize and handle Paystack payments
 */

interface PaystackConfig {
  email: string;
  amount: number; // Amount in Naira
  firstName?: string;
  lastName?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

// Local store for public key
let PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

// Initialize Paystack script and ensure public key is available
export const initializePaystack = async () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // if we don't have a key from env, fetch from server endpoint
  if (!PAYSTACK_PUBLIC_KEY) {
    try {
      const res = await fetch(`${baseUrl}/api/payments/initialize`);
      const body = await res.json();
      if (body?.success && body.publicKey) {
        PAYSTACK_PUBLIC_KEY = body.publicKey;
      }
    } catch (err) {
      // ignore; we'll still try to load script and validation will catch missing key
      console.warn('Failed to load Paystack public key from server');
    }
  }

  const loadedScript = await new Promise<boolean>((resolve) => {
    // Avoid double-loading script
    if ((window as any).PaystackPop) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const key = PAYSTACK_PUBLIC_KEY || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
  const keyOk = /^pk_(test|live)_[A-Za-z0-9]+/.test(key);
  return { loadedScript, keyExists: !!key, keyOk, key };
};

// Open Paystack modal
export const handlePaystackPayment = (config: PaystackConfig): Promise<{ status: string; reference: string }> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure we have a public key
      if (!PAYSTACK_PUBLIC_KEY) {
        // Try server endpoint once more
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payments/initialize`);
          const body = await res.json();
          if (body?.success && body.publicKey) PAYSTACK_PUBLIC_KEY = body.publicKey;
        } catch (err) {
          // ignore
        }
      }

      const key = PAYSTACK_PUBLIC_KEY || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

      if (!key) {
        reject(new Error('Paystack public key not found. Please configure VITE_PAYSTACK_PUBLIC_KEY.'));
        return;
      }

      // quick validation for key format
      if (!/^pk_(test|live)_[A-Za-z0-9]+/.test(key)) {
        reject(new Error('Invalid Paystack public key format. Please check your VITE_PAYSTACK_PUBLIC_KEY value.'));
        return;
      }

      // Debug helper (mask public key)
      try {
        const masked = `${key.slice(0, 12)}...${key.slice(-4)}`;
        console.debug('Using Paystack public key:', masked);
      } catch (e) {}

      

      const handler = (window as any).PaystackPop.setup({
        key,
        email: config.email,
        amount: Math.round(config.amount) * 100, // Paystack expects amount in kobo (multiply by 100)
        firstName: config.firstName || '',
        lastName: config.lastName || '',
        phone: config.phone || '',
        metadata: {
          custom_fields: [
            {
              display_name: 'Order',
              variable_name: 'order',
              value: 'Vitabiotics Order',
            },
          ],
          ...config.metadata,
        },
        onClose: () => {
          reject(new Error('Payment window closed'));
        },
        callback: (response: { status: string; reference: string }) => {
          resolve(response);
        },
      });

      handler.openIframe();
    } catch (err) {
      reject(err);
    }
  });
};

// Verify payment with backend
export const getPaystackPublicKey = () => PAYSTACK_PUBLIC_KEY;

export const verifyPaystackPayment = async (reference: string, token: string) => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/payments/verify-paystack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reference }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};
