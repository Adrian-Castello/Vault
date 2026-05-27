-- =====================================================================
-- Subscriptions & Financings Dashboard — Supabase schema
-- Paste into the Supabase SQL editor.
--
-- IMPORTANT: This first revision uses *permissive* RLS policies for the
-- anonymous role because the app is single-user and has no auth yet.
-- When you add authentication, replace these policies with ones that
-- check `auth.uid()` and add a `user_id uuid` column to both tables.
-- =====================================================================

-- pgcrypto for gen_random_uuid (usually already enabled on Supabase)
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Subscriptions
-- ---------------------------------------------------------------------
create table if not exists public.subscriptions (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    emoji text not null default '✨',
    price numeric(10, 2) not null check (price >= 0),
    billing_cycle text not null check (billing_cycle in ('monthly', 'quarterly', 'yearly')),
    next_charge_date date not null,
    created_at timestamptz not null default now()
);

create index if not exists subscriptions_next_charge_idx
    on public.subscriptions (next_charge_date);

-- ---------------------------------------------------------------------
-- Financings
-- ---------------------------------------------------------------------
create table if not exists public.financings (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    emoji text not null default '💳',
    total_amount numeric(10, 2) not null check (total_amount >= 0),
    monthly_payment numeric(10, 2) not null check (monthly_payment >= 0),
    total_installments int not null check (total_installments > 0),
    paid_installments int not null default 0 check (paid_installments >= 0),
    next_charge_date date not null,
    end_date date not null,
    created_at timestamptz not null default now(),
    constraint paid_le_total check (paid_installments <= total_installments)
);

create index if not exists financings_next_charge_idx
    on public.financings (next_charge_date);

-- ---------------------------------------------------------------------
-- Row Level Security
--
-- Single-user app for now → enable RLS but allow the anon role full
-- access. Replace with proper auth-based policies when you add login.
-- ---------------------------------------------------------------------
alter table public.subscriptions enable row level security;
alter table public.financings   enable row level security;

-- TODO: Replace these permissive policies when auth is added.
drop policy if exists "anon_all_subscriptions" on public.subscriptions;
create policy "anon_all_subscriptions"
    on public.subscriptions
    for all
    to anon
    using (true)
    with check (true);

drop policy if exists "anon_all_financings" on public.financings;
create policy "anon_all_financings"
    on public.financings
    for all
    to anon
    using (true)
    with check (true);
