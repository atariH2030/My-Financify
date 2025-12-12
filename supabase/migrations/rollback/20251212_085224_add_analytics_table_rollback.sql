-- ====================================
-- Rollback: add_analytics_table
-- Version: 20251212_085224
-- Author: DEV - Rickson
-- Created: 2025-12-12T11:52:24.580Z
-- ====================================

-- ============================================================================
-- MIGRATION ROLLBACK
-- ============================================================================

-- ATENÇÃO: Este rollback remove TODOS os dados da tabela analytics!
-- Certifique-se de fazer backup antes se necessário.

-- Remover policies (ordem importa: policies antes da tabela)
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics;
DROP POLICY IF EXISTS "Users can insert own analytics" ON public.analytics;

-- Remover índices (se existirem)
DROP INDEX IF EXISTS public.idx_analytics_user_id;
DROP INDEX IF EXISTS public.idx_analytics_event_type;
DROP INDEX IF EXISTS public.idx_analytics_created_at;

-- Remover tabela (CASCADE remove dependências automaticamente)
DROP TABLE IF EXISTS public.analytics CASCADE;

-- ============================================================================
-- VERIFICAÇÃO DE SUCESSO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 20251212_085224 rolled back successfully!';
  RAISE NOTICE '🗑️ Removed table: analytics';
  RAISE NOTICE '🗑️ Removed 2 RLS policies';
  RAISE NOTICE '🗑️ Removed 3 indexes';
END $$;
