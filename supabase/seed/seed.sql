-- Seed: Demo Golf Club with 5 carts

insert into public.clubs (id, name, slug, country, timezone, currency, pricing_model, session_prices, session_durations, revenue_share, is_active)
values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Demo Golf Club',
  'demo-golf-club',
  'US',
  'America/New_York',
  'USD',
  'per_session',
  '{"9_holes": 1500, "18_holes": 2500}',
  '[{"label": "9 Holes", "minutes": 120}, {"label": "18 Holes", "minutes": 240}]',
  15.0,
  true
);

insert into public.carts (club_id, cart_number, qr_code, device_status, is_active) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '001', 'demo-golf-club-cart-001', 'offline', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '002', 'demo-golf-club-cart-002', 'offline', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '003', 'demo-golf-club-cart-003', 'offline', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '004', 'demo-golf-club-cart-004', 'offline', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '005', 'demo-golf-club-cart-005', 'offline', true);
