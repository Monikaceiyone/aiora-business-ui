import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  _supabase = createClient(url, key);
  return _supabase;
}

// Lazy proxy — only initializes when first accessed at runtime
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export interface Conversation {
  id: string;
  appointment_id?: string;
  seller_id?: string;
  client_phone?: string;
  recording_url?: string;
  duration_seconds?: number;
  started_at?: string;
  created_at?: string;
}

export interface Appointment {
  appointment_id: string;
  seller_id?: string;
  client_name: string;
  client_phone: string;
  start_time: string;
  end_time?: string;
  status: string;
  notes?: string;
  created_at?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  field_of_interest: string;
  message?: string;
  voice_url?: string;
  image_url?: string;
  status: string;
  created_at: string;
}

export interface Seller {
  id: string;
  seller_id: string;
  seller_name: string;
  phone_number: string;
  city: string;
  business_type: string;
  active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  category_id: string;
  category_name: string;
  seller_id: string;
}

export interface Product {
  id: string;
  product_id: string;
  product_name: string;
  category_id: string;
  seller_id: string;
  price: number;
  stock: number;
  description: string;
  image_url: string;
}

export interface Order {
  id: string;
  order_id: string;
  user_phone: string;
  user_name: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  address: string;
  pincode: string;
  status: string;
  status_code: number;
  subtotal: number;
  tax: number;
  delivery_charge: number;
  total_amount: number;
  payment_link: string;
  razorpay_link_id: string;
  payment_id: string;
  courier_name: string;
  awb_number: string;
  tracking_url: string;
  order_date: string;
  created_at: string;
  payment_captured_at: string;
  shipped_at: string;
  delivered_at: string;
  last_updated: string;
  order_source: string;
}
