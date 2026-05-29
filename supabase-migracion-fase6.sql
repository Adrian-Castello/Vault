-- =====================================================================
-- Vault — Migración FASE 6
-- Añade columna `payment_method` (texto libre, opcional) a:
--   - subscriptions
--   - financings
-- Para que el usuario pueda anotar dónde se carga el pago (BBVA, Revolut, etc.)
-- =====================================================================

alter table public.subscriptions
    add column if not exists payment_method text;

alter table public.financings
    add column if not exists payment_method text;
