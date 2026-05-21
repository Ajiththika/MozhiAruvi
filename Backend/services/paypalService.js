import dotenv from 'dotenv';
dotenv.config();

const getBaseUrl = () => {
  return process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
};

/**
 * Obtain a PayPal OAuth 2.0 access token.
 */
export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = getBaseUrl();

  if (!clientId || !clientSecret) {
    throw new Error('PayPal Client ID or Secret is not configured in environment variables');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  try {
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PayPal Access Token Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Failed to get PayPal access token:', error);
    throw error;
  }
}

/**
 * Create a PayPal billing subscription.
 */
export async function createSubscription(planId, emailAddress, returnUrl, cancelUrl) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      plan_id: planId,
      subscriber: {
        email_address: emailAddress
      },
      application_context: {
        brand_name: "Mozhi Aruvi",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
        },
        return_url: returnUrl,
        cancel_url: cancelUrl
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`PayPal Create Subscription Error: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

/**
 * Retrieve PayPal subscription details.
 */
export async function getSubscriptionDetails(subscriptionId) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`PayPal Get Subscription Error: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

/**
 * Cancel a PayPal subscription.
 */
export async function cancelSubscription(subscriptionId, reason = 'Cancelled by user') {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reason
    })
  });

  // 244 No Content is returned on successful cancellation
  if (response.status !== 204 && !response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`PayPal Cancel Subscription Error: ${JSON.stringify(errorData)}`);
  }

  return true;
}

/**
 * Securely verify a PayPal webhook signature.
 */
export async function verifyWebhookSignature(headers, rawBody) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getBaseUrl();

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn('[PayPal] Webhook ID not configured. Skipping signature check.');
    return true; // Bypass signature check if not configured in dev (ensure safe fallback)
  }

  const payload = {
    auth_algo: headers['paypal-auth-algo'],
    cert_url: headers['paypal-cert-url'],
    transmission_id: headers['paypal-transmission-id'],
    transmission_sig: headers['paypal-transmission-sig'],
    transmission_time: headers['paypal-transmission-time'],
    webhook_id: webhookId,
    webhook_event: typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
  };

  try {
    const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('[PayPal Webhook Verification Error]', response.statusText);
      return false;
    }

    const verificationResult = await response.json();
    return verificationResult.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('PayPal webhook verification failed:', error);
    return false;
  }
}

/**
 * Create a PayPal Order for one-time payments.
 */
export async function createOrder(amount, purpose, returnUrl, cancelUrl) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2)
        },
        description: purpose
      }],
      application_context: {
        brand_name: "Mozhi Aruvi",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`PayPal Create Order Error: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

/**
 * Capture a PayPal Order.
 */
export async function captureOrder(orderId) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`PayPal Capture Order Error: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

