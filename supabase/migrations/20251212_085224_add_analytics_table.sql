-- ====================================
-- Migration: add_analytics_table
-- Version: 20251212_085224
-- Description: Adiciona tabela de analytics para tracking de eventos do usuário
-- Author: DEV - Rickson
-- Created: 2025-12-12T11:52:24.578Z
-- ====================================

-- ============================================================================
-- MIGRATION UP
-- ============================================================================

-- Criar tabela de analytics
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT analytics_event_type_check CHECK (
    event_type IN (
      'page_view',
      'button_click',
      'transaction_created',
      'transaction_updated',
      'transaction_deleted',
      'goal_achieved',
      'budget_exceeded',
      'export_data',
      'settings_changed'
    )
  )
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_analytics_user_id 
  ON public.analytics(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type 
  ON public.analytics(event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at 
  ON public.analytics(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Criar policies de acesso
CREATE POLICY "Users can view own analytics"
  ON public.analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON public.analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comentários úteis para documentação
COMMENT ON TABLE public.analytics IS 'Tabela para tracking de eventos e analytics do usuário';
COMMENT ON COLUMN public.analytics.event_type IS 'Tipo de evento rastreado (page_view, button_click, etc)';
COMMENT ON COLUMN public.analytics.event_data IS 'Dados adicionais do evento em formato JSON';

-- ============================================================================
-- VERIFICAÇÃO DE SUCESSO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 20251212_085224 applied successfully!';
  RAISE NOTICE '📊 Created table: analytics';
  RAISE NOTICE '🔒 RLS enabled with SELECT and INSERT policies';
  RAISE NOTICE '📈 Created 3 performance indexes';
END $$;
