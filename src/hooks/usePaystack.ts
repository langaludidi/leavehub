'use client';

import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: Record<string, any>;
  onSuccess: (response: PaystackResponse) => void;
  onClose: () => void;
}

interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
  trxref: string;
}

export interface PaymentConfig {
  email: string;
  amount: number;
  planName: string;
  planId: string;
  billingCycle: 'monthly' | 'annually';
  userId: string;
  companyName?: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

export function usePaystack() {
  useEffect(() => {
    // Load Paystack inline script
    if (!document.getElementById('paystack-inline-script')) {
      const script = document.createElement('script');
      script.id = 'paystack-inline-script';
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const initializePayment = useCallback((config: PaymentConfig) => {
    if (!window.PaystackPop) {
      console.error('Paystack SDK not loaded');
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      console.error('Paystack public key not configured');
      return;
    }

    // Generate unique reference
    const reference = `lh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Amount in kobo (multiply by 100 for ZAR)
    const amountInKobo = config.amount * 100;

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: config.email,
      amount: amountInKobo,
      currency: 'ZAR',
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: 'Plan',
            variable_name: 'plan_name',
            value: config.planName,
          },
          {
            display_name: 'Plan ID',
            variable_name: 'plan_id',
            value: config.planId,
          },
          {
            display_name: 'Billing Cycle',
            variable_name: 'billing_cycle',
            value: config.billingCycle,
          },
          {
            display_name: 'User ID',
            variable_name: 'user_id',
            value: config.userId,
          },
          {
            display_name: 'Company Name',
            variable_name: 'company_name',
            value: config.companyName || 'N/A',
          },
        ],
      },
      onSuccess: (response: PaystackResponse) => {
        config.onSuccess(response.reference);
      },
      onClose: () => {
        config.onClose();
      },
    });

    handler.openIframe();
  }, []);

  return { initializePayment };
}
