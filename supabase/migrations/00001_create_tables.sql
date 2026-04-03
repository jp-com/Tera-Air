-- Create clubs table
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country text not null,
  timezone text not null default 'UTC',
  currency text not null default 'USD',
  pricing_model text not null default 'per_session' check (pricing_model in ('per_session', 'free')),
  session_prices jsonb not null default '{}',
  session_durations jsonb not null default '[]',
  revenue_share decimal not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Create carts table
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  cart_number text not null,
  qr_code text not null unique,
  device_id text,
  device_status text not null default 'offline',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (club_id, cart_number)
);

-- Create sessions table
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,
  plan_type text not null,
  duration_minutes integer not null,
  price decimal,
  currency text not null default 'USD',
  status text not null default 'pending',
  stripe_payment_intent_id text,
  started_at timestamptz,
  expires_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- Create device_events table
create table public.device_events (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_clubs_slug on public.clubs(slug);
create index idx_carts_club_id on public.carts(club_id);
create index idx_carts_qr_code on public.carts(qr_code);
create index idx_sessions_cart_id on public.sessions(cart_id);
create index idx_sessions_club_id on public.sessions(club_id);
create index idx_sessions_status on public.sessions(status);
create index idx_sessions_stripe_payment_intent_id on public.sessions(stripe_payment_intent_id);
create index idx_device_events_cart_id on public.device_events(cart_id);
create index idx_device_events_event_type on public.device_events(event_type);
