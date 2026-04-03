export interface Club {
  id: string;
  name: string;
  slug: string;
  country: string;
  timezone: string;
  currency: string;
  pricing_model: "per_session" | "free";
  session_prices: Record<string, number>;
  session_durations: { label: string; minutes: number }[];
  revenue_share: number;
  is_active: boolean;
  created_at: string;
}

export interface Cart {
  id: string;
  club_id: string;
  cart_number: string;
  qr_code: string;
  device_id: string | null;
  device_status: string;
  is_active: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  cart_id: string;
  club_id: string;
  plan_type: string;
  duration_minutes: number;
  price: number | null;
  currency: string;
  status: string;
  stripe_payment_intent_id: string | null;
  started_at: string | null;
  expires_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface DeviceEvent {
  id: string;
  cart_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}
