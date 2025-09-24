import axios from 'axios';

// iyzico API configuration
const IYZICO_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.iyzipay.com' 
  : 'https://sandbox-api.iyzipay.com';

const IYZICO_OPTIONS = {
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  uri: IYZICO_BASE_URL,
};

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  items: Array<{
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: number;
  }>;
}

export interface PaymentResponse {
  status: string;
  paymentId: string;
  conversationId: string;
  price: string;
  paidPrice: string;
  installment: string;
  currency: string;
  paymentStatus: string;
  fraudStatus: string;
  merchantCommissionRate: string;
  merchantCommissionRateAmount: string;
  iyziCommissionRateAmount: string;
  iyziCommissionFee: string;
  cardType: string;
  cardAssociation: string;
  cardFamily: string;
  cardToken: string;
  cardUserKey: string;
  binNumber: string;
  lastFourDigits: string;
  basketId: string;
  locale: string;
  systemTime: number;
  authCode: string;
  phase: string;
  mdStatus: string;
  hostReference: string;
  token: string;
  callbackUrl: string;
  paymentPageUrl?: string;
}

// Create payment request
export async function createPaymentRequest(paymentData: PaymentRequest): Promise<PaymentResponse> {
  try {
    const requestData = {
      locale: 'tr',
      conversationId: paymentData.orderId,
      price: paymentData.amount.toFixed(2),
      paidPrice: paymentData.amount.toFixed(2),
      currency: paymentData.currency,
      installment: '1',
      basketId: paymentData.orderId,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/callback`,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: paymentData.customer.id,
        name: paymentData.customer.name,
        surname: paymentData.customer.surname,
        gsmNumber: paymentData.customer.phone,
        email: paymentData.customer.email,
        identityNumber: '11111111111', // In production, get from user
        lastLoginDate: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
        registrationAddress: paymentData.billingAddress.address,
        ip: '85.34.78.112', // In production, get real IP
        city: paymentData.billingAddress.city,
        country: paymentData.billingAddress.country,
        zipCode: '34732',
      },
      shippingAddress: {
        contactName: paymentData.billingAddress.contactName,
        city: paymentData.billingAddress.city,
        country: paymentData.billingAddress.country,
        address: paymentData.billingAddress.address,
        zipCode: '34732',
      },
      billingAddress: {
        contactName: paymentData.billingAddress.contactName,
        city: paymentData.billingAddress.city,
        country: paymentData.billingAddress.country,
        address: paymentData.billingAddress.address,
        zipCode: '34732',
      },
      basketItems: paymentData.items.map((item, index) => ({
        id: item.id,
        name: item.name,
        category1: item.category1,
        itemType: item.itemType,
        price: item.price.toFixed(2),
        subMerchantKey: '',
        subMerchantPrice: item.price.toFixed(2),
      })),
    };

    const response = await axios.post(
      `${IYZICO_BASE_URL}/payment/iyzipos/checkoutform/initialize/auth`,
      requestData,
      {
        headers: {
          'Authorization': `IYZWS ${IYZICO_OPTIONS.apiKey}:${generateAuthorizationString(requestData)}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('iyzico payment error:', error);
    throw new Error('Payment request failed');
  }
}

// Pre-authorization for sleeve payment
export async function createPreAuthRequest(paymentData: PaymentRequest): Promise<PaymentResponse> {
  try {
    const requestData = {
      locale: 'tr',
      conversationId: `${paymentData.orderId}_preauth`,
      price: paymentData.amount.toFixed(2),
      paidPrice: paymentData.amount.toFixed(2),
      currency: paymentData.currency,
      installment: '1',
      basketId: paymentData.orderId,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/callback`,
      buyer: {
        id: paymentData.customer.id,
        name: paymentData.customer.name,
        surname: paymentData.customer.surname,
        gsmNumber: paymentData.customer.phone,
        email: paymentData.customer.email,
        identityNumber: '11111111111',
        lastLoginDate: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
        registrationAddress: paymentData.billingAddress.address,
        ip: '85.34.78.112',
        city: paymentData.billingAddress.city,
        country: paymentData.billingAddress.country,
        zipCode: '34732',
      },
      shippingAddress: {
        contactName: paymentData.billingAddress.contactName,
        city: paymentData.billingAddress.city,
        country: paymentData.billingAddress.country,
        address: paymentData.billingAddress.address,
        zipCode: '34732',
      },
      billingAddress: {
        contactName: paymentData.billingAddress.contactName,
        city: paymentData.billingAddress.city,
        country: paymentData.billingAddress.country,
        address: paymentData.billingAddress.address,
        zipCode: '34732',
      },
      basketItems: paymentData.items.map((item, index) => ({
        id: item.id,
        name: item.name,
        category1: item.category1,
        itemType: item.itemType,
        price: item.price.toFixed(2),
        subMerchantKey: '',
        subMerchantPrice: item.price.toFixed(2),
      })),
    };

    const response = await axios.post(
      `${IYZICO_BASE_URL}/payment/iyzipos/checkoutform/initialize/preauth`,
      requestData,
      {
        headers: {
          'Authorization': `IYZWS ${IYZICO_OPTIONS.apiKey}:${generateAuthorizationString(requestData)}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('iyzico preauth error:', error);
    throw new Error('Pre-authorization request failed');
  }
}

// Post-authorization (capture pre-auth)
export async function postAuthRequest(paymentId: string): Promise<PaymentResponse> {
  try {
    const requestData = {
      locale: 'tr',
      conversationId: paymentId,
      paymentId: paymentId,
    };

    const response = await axios.post(
      `${IYZICO_BASE_URL}/payment/iyzipos/checkoutform/auth/post`,
      requestData,
      {
        headers: {
          'Authorization': `IYZWS ${IYZICO_OPTIONS.apiKey}:${generateAuthorizationString(requestData)}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('iyzico postauth error:', error);
    throw new Error('Post-authorization failed');
  }
}

// Cancel pre-authorization
export async function cancelPreAuthRequest(paymentId: string): Promise<PaymentResponse> {
  try {
    const requestData = {
      locale: 'tr',
      conversationId: paymentId,
      paymentId: paymentId,
    };

    const response = await axios.post(
      `${IYZICO_BASE_URL}/payment/iyzipos/checkoutform/auth/cancel`,
      requestData,
      {
        headers: {
          'Authorization': `IYZWS ${IYZICO_OPTIONS.apiKey}:${generateAuthorizationString(requestData)}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('iyzico cancel error:', error);
    throw new Error('Cancel pre-authorization failed');
  }
}

// Generate authorization string for iyzico
function generateAuthorizationString(data: any): string {
  const crypto = require('crypto');
  const randomString = Math.random().toString(36).substring(2, 15);
  const dataString = JSON.stringify(data);
  const hashString = IYZICO_OPTIONS.apiKey + randomString + IYZICO_OPTIONS.secretKey + dataString;
  const hash = crypto.createHash('sha1').update(hashString).digest('base64');
  return hash;
}
