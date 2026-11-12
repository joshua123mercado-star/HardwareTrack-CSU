-- ============================================================
-- HardWareTrack — Supabase Schema Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id              TEXT PRIMARY KEY,
  sku             TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  description     TEXT,
  unit_price      NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_price      NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock           INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  location        TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hw_users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  username    TEXT NOT NULL UNIQUE,
  email       TEXT NOT NULL,
  password    TEXT,
  role        TEXT NOT NULL CHECK (role IN ('owner','staff')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── SALES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hw_sales (
  id               TEXT PRIMARY KEY,
  receipt_number   TEXT NOT NULL UNIQUE,
  items            JSONB NOT NULL DEFAULT '[]',
  subtotal         NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax              NUMERIC(10,2) NOT NULL DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method   TEXT NOT NULL,
  amount_tendered  NUMERIC(10,2),
  change           NUMERIC(10,2),
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT now(),
  cashier_id       TEXT,
  cashier_name     TEXT
);

-- ── ACTIVITY LOGS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hw_activity_logs (
  id               TEXT PRIMARY KEY,
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT now(),
  product_id       TEXT,
  product_name     TEXT,
  sku              TEXT,
  action_type      TEXT NOT NULL,
  quantity_change  INTEGER NOT NULL DEFAULT 0,
  previous_stock   INTEGER NOT NULL DEFAULT 0,
  new_stock        INTEGER NOT NULL DEFAULT 0,
  reason           TEXT,
  user_id          TEXT,
  user_name        TEXT
);

-- ── ROW-LEVEL SECURITY (RLS) ─────────────────────────────────
-- Enable RLS on all tables (Supabase best practice)
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hw_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hw_sales        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hw_activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read-only access to products (anon key can SELECT)
CREATE POLICY "Public can read products"
  ON public.products FOR SELECT
  TO anon
  USING (true);

-- All writes (INSERT/UPDATE/DELETE) go through service-role key (API routes)
-- so we grant full access to authenticated (service role) only
CREATE POLICY "Service role full access to products"
  ON public.products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to hw_users"
  ON public.hw_users FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to hw_sales"
  ON public.hw_sales FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to hw_activity_logs"
  ON public.hw_activity_logs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

