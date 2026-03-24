/**
 * Dev Auth Utilities
 * Only active when NEXT_PUBLIC_SKIP_AUTH=true AND NODE_ENV !== 'production'
 * Never ships real auth bypass to production.
 */

export const DEV_AUTH_ENABLED =
  process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' &&
  process.env.NODE_ENV !== 'production';

export const DEV_SELLER = {
  seller_id: process.env.NEXT_PUBLIC_DEV_SELLER_ID || 'dev-seller-001',
  seller_name: process.env.NEXT_PUBLIC_DEV_SELLER_NAME || 'Dev Seller',
  phone_number: process.env.NEXT_PUBLIC_DEV_PHONE || '9999999999',
  business_type: 'Development',
  city: 'Localhost',
  active: true,
};
