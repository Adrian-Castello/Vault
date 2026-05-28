-- =====================================================================
-- Vault — Migración FASE 1
-- Pega en SQL Editor de Supabase y pulsa Run.
--
-- Añade columnas nuevas SIN borrar datos existentes:
--   subscriptions:
--     - category          (texto, default 'general')
--     - status            ('active' | 'trial' | 'paused' | 'cancelled')
--     - trial_end_date    (date, opcional — solo si status='trial')
--     - cancelled_at      (timestamptz, opcional — cuando se canceló)
--   financings:
--     - category          (texto, default 'general')
--
-- También extiende el CHECK de billing_cycle para incluir 'semiannual'.
-- =====================================================================

-- 1. SUBSCRIPTIONS
alter table public.subscriptions
    add column if not exists category text not null default 'general',
    add column if not exists status text not null default 'active',
    add column if not exists trial_end_date date,
    add column if not exists cancelled_at timestamptz;

-- Eliminar el check antiguo del billing_cycle (si existe) y poner uno nuevo
-- que incluya 'semiannual'.
do $$
declare
    cname text;
begin
    select conname into cname
    from pg_constraint
    where conrelid = 'public.subscriptions'::regclass
      and conname like '%billing_cycle%';
    if cname is not null then
        execute format('alter table public.subscriptions drop constraint %I', cname);
    end if;
end$$;

alter table public.subscriptions
    add constraint subscriptions_billing_cycle_check
    check (billing_cycle in ('monthly', 'quarterly', 'semiannual', 'yearly'));

-- Constraint sobre status
alter table public.subscriptions
    drop constraint if exists subscriptions_status_check;
alter table public.subscriptions
    add constraint subscriptions_status_check
    check (status in ('active', 'trial', 'paused', 'cancelled'));

-- Índice por categoría (útil para futuras consultas agrupadas)
create index if not exists subscriptions_category_idx on public.subscriptions (category);
create index if not exists subscriptions_status_idx on public.subscriptions (status);

-- 2. FINANCINGS
alter table public.financings
    add column if not exists category text not null default 'general';

create index if not exists financings_category_idx on public.financings (category);
