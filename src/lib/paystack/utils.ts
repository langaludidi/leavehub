import { paystack, paystackConfig, SUBSCRIPTION_PLANS, SubscriptionPlanCode } from './config';

/**
 * Initialize a payment transaction
 */
export async function initializeTransaction(params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, any>;
  callbackUrl?: string;
}) {
  try {
    const response = await paystack.transaction.initialize({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      callback_url: params.callbackUrl || paystackConfig.callbackUrl,
      metadata: params.metadata || {},
      currency: 'ZAR',
    });

    return {
      success: true,
      data: response.body.data,
    };
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    return {
      success: false,
      error: error.message || 'Failed to initialize payment',
    };
  }
}

/**
 * Verify a transaction
 */
export async function verifyTransaction(reference: string) {
  try {
    const response = await paystack.transaction.verify(reference);

    return {
      success: true,
      data: response.body.data,
    };
  } catch (error: any) {
    console.error('Paystack verification error:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify payment',
    };
  }
}

/**
 * Create a subscription
 */
export async function createSubscription(params: {
  customer: string; // Paystack customer code
  plan: SubscriptionPlanCode;
  authorization: string; // Authorization code from previous transaction
}) {
  try {
    const planConfig = SUBSCRIPTION_PLANS[params.plan];

    const response = await paystack.subscription.create({
      customer: params.customer,
      plan: planConfig.code,
      authorization: params.authorization,
    });

    return {
      success: true,
      data: response.body.data,
    };
  } catch (error: any) {
    console.error('Paystack subscription error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create subscription',
    };
  }
}

/**
 * Create or fetch a customer
 */
export async function createCustomer(params: {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}) {
  try {
    const response = await paystack.customer.create(params);

    return {
      success: true,
      data: response.body.data,
    };
  } catch (error: any) {
    console.error('Paystack customer creation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create customer',
    };
  }
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string) {
  try {
    const response = await paystack.customer.list({ email });

    if (response.body.data && response.body.data.length > 0) {
      return {
        success: true,
        data: response.body.data[0],
      };
    }

    return {
      success: false,
      error: 'Customer not found',
    };
  } catch (error: any) {
    console.error('Paystack customer fetch error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch customer',
    };
  }
}

/**
 * Verify Paystack webhook signature
 */
export function verifyWebhookSignature(signature: string, body: string): boolean {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', paystackConfig.secretKey)
    .update(body)
    .digest('hex');

  return hash === signature;
}

/**
 * Format amount from kobo/cents to Rands
 */
export function formatAmount(amount: number): string {
  return `R${(amount / 100).toFixed(2)}`;
}

/**
 * Generate unique payment reference
 */
export function generateReference(prefix: string = 'LH'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}_${timestamp}_${random}`;
}
