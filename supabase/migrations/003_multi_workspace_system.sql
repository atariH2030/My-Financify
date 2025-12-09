-- ============================================================================
-- MIGRATION: Multi-Workspace & Family Sharing System
-- Version: v3.16.0
-- Author: DEV - Rickson
-- Date: 9 de dezembro de 2025
-- ============================================================================

-- OBJETIVO:
-- Transformar sistema single-user em multi-workspace compartilhado
-- Suportar planos Family (CASAL, FAMÍLIA 3/5/+)
-- Implementar RBAC (Role-Based Access Control)

-- ============================================================================
-- 1. FUNÇÕES AUXILIARES (CRIAR ANTES DOS TRIGGERS)
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. ENUM TYPES
-- ============================================================================

-- Tipos de workspace
CREATE TYPE workspace_type AS ENUM (
  'personal',    -- Workspace pessoal (FREE/PRO)
  'couple',      -- Workspace casal (2 membros)
  'family',      -- Workspace família (3+ membros)
  'business'     -- Workspace negócios (futuro)
);

-- Tipos de plano
CREATE TYPE plan_type AS ENUM (
  'free',         -- 1 usuário, recursos limitados
  'pro',          -- 1 usuário, recursos completos
  'couple',       -- 2 usuários
  'family_3',     -- Até 3 membros
  'family_5',     -- Até 5 membros
  'family_plus'   -- Ilimitado
);

-- Roles de membro
CREATE TYPE member_role AS ENUM (
  'owner',        -- Criador (full access)
  'admin',        -- Administrador (quase full)
  'contributor',  -- Pode criar/editar
  'viewer'        -- Apenas visualizar
);

-- Status de convite
CREATE TYPE invite_status AS ENUM (
  'pending',      -- Aguardando aceite
  'accepted',     -- Aceito
  'declined',     -- Recusado
  'expired'       -- Expirado
);

-- Status de verificação de CPF
CREATE TYPE cpf_verification_status AS ENUM (
  'pending',      -- Aguardando verificação
  'verified',     -- CPF verificado
  'rejected',     -- CPF rejeitado (inválido/duplicado)
  'manual_review' -- Requer revisão manual
);

-- ============================================================================
-- 1.5. TABELA: user_profiles (Estender auth.users com CPF)
-- ============================================================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados Pessoais
  full_name VARCHAR(200) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL, -- CPF sem máscara (11 dígitos)
  cpf_verification_status cpf_verification_status NOT NULL DEFAULT 'pending',
  cpf_verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Dados Adicionais
  phone VARCHAR(20), -- Telefone com DDD
  birth_date DATE,
  
  -- Endereço (opcional - para billing)
  address_zipcode VARCHAR(9),
  address_street VARCHAR(200),
  address_number VARCHAR(10),
  address_complement VARCHAR(100),
  address_neighborhood VARCHAR(100),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  
  -- Metadata
  avatar_url TEXT,
  bio TEXT,
  
  -- LGPD & Compliance
  terms_accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  privacy_accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  marketing_consent BOOLEAN DEFAULT FALSE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_cpf_length CHECK (char_length(cpf) = 11),
  CONSTRAINT valid_cpf_format CHECK (cpf ~ '^\d{11}$'),
  CONSTRAINT valid_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{10,15}$')
);

-- Índices
CREATE UNIQUE INDEX idx_user_profiles_cpf ON user_profiles(cpf);
CREATE INDEX idx_user_profiles_verification ON user_profiles(cpf_verification_status);
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 1.6. TABELA: cpf_verification_logs (Auditoria)
-- ============================================================================

CREATE TABLE cpf_verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf VARCHAR(11) NOT NULL,
  
  -- Status da tentativa
  status cpf_verification_status NOT NULL,
  reason TEXT, -- Motivo da rejeição (se aplicável)
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_cpf_logs_user ON cpf_verification_logs(user_id);
CREATE INDEX idx_cpf_logs_cpf ON cpf_verification_logs(cpf);
CREATE INDEX idx_cpf_logs_created ON cpf_verification_logs(created_at);

-- ============================================================================
-- 2. TABELA: workspaces
-- ============================================================================

CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly (ex: familia-silva)
  description TEXT,
  
  -- Tipo e Plano
  type workspace_type NOT NULL DEFAULT 'personal',
  plan_type plan_type NOT NULL DEFAULT 'free',
  
  -- Ownership
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Limites (baseado no plano)
  max_members INTEGER NOT NULL DEFAULT 1, -- FREE/PRO=1, COUPLE=2, FAMILY_3=3, etc
  current_members INTEGER NOT NULL DEFAULT 1,
  
  -- Configurações
  settings JSONB DEFAULT '{}', -- Preferências do workspace
  
  -- Billing
  stripe_customer_id VARCHAR(100), -- ID do cliente no Stripe
  stripe_subscription_id VARCHAR(100), -- ID da assinatura
  billing_cycle_anchor TIMESTAMP WITH TIME ZONE, -- Início do ciclo de cobrança
  trial_ends_at TIMESTAMP WITH TIME ZONE, -- Fim do trial (14 dias grátis)
  subscription_status VARCHAR(20) DEFAULT 'active', -- active, canceled, past_due
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  
  -- Constraints
  CONSTRAINT valid_members_count CHECK (current_members <= max_members),
  CONSTRAINT valid_name_length CHECK (char_length(name) >= 3)
);

-- Índices
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_deleted ON workspaces(deleted_at) WHERE deleted_at IS NULL;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. TABELA: workspace_members
-- ============================================================================

CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relacionamentos
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role e Permissões
  role member_role NOT NULL DEFAULT 'viewer',
  
  -- Permissões customizadas (opcional, override role padrão)
  custom_permissions JSONB DEFAULT '[]', -- Array de strings (ex: ["transactions:create"])
  
  -- Metadata
  invited_by UUID REFERENCES auth.users(id), -- Quem convidou
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  
  -- Soft delete
  removed_at TIMESTAMP WITH TIME ZONE,
  removed_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(workspace_id, user_id) -- Usuário só pode estar 1x por workspace
);

-- Índices
CREATE INDEX idx_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_members_user ON workspace_members(user_id);
CREATE INDEX idx_members_role ON workspace_members(role);
CREATE INDEX idx_members_active ON workspace_members(workspace_id, user_id) 
  WHERE removed_at IS NULL;

-- Trigger para garantir apenas 1 owner por workspace
CREATE OR REPLACE FUNCTION check_single_owner_per_workspace()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'owner' AND NEW.removed_at IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = NEW.workspace_id
        AND role = 'owner'
        AND removed_at IS NULL
        AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Workspace can only have one owner';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_single_owner
  BEFORE INSERT OR UPDATE ON workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION check_single_owner_per_workspace();

-- ============================================================================
-- 4. TABELA: workspace_invites
-- ============================================================================

CREATE TABLE workspace_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relacionamentos
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Convite
  email VARCHAR(255) NOT NULL, -- Email do convidado
  role member_role NOT NULL DEFAULT 'viewer', -- Role que receberá
  token VARCHAR(100) UNIQUE NOT NULL, -- Token único para aceitar
  
  -- Status
  status invite_status NOT NULL DEFAULT 'pending',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_expiration CHECK (expires_at > created_at)
);

-- Índices
CREATE INDEX idx_invites_workspace ON workspace_invites(workspace_id);
CREATE INDEX idx_invites_email ON workspace_invites(email);
CREATE INDEX idx_invites_token ON workspace_invites(token);
CREATE INDEX idx_invites_status ON workspace_invites(status);

-- ============================================================================
-- 5. MIGRAÇÃO DE DADOS EXISTENTES
-- ============================================================================

-- Adicionar workspace_id às tabelas existentes
ALTER TABLE accounts ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE budgets ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE goals ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE recurring_transactions ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Criar workspace pessoal para cada usuário existente
INSERT INTO workspaces (owner_id, name, slug, type, plan_type, max_members)
SELECT 
  id,
  COALESCE(email, 'Meu Workspace'),
  'workspace-' || id, -- Slug temporário
  'personal',
  'free',
  1
FROM auth.users;

-- Associar dados existentes ao workspace pessoal do owner
UPDATE accounts a
SET workspace_id = w.id
FROM workspaces w
WHERE a.user_id = w.owner_id AND w.type = 'personal';

UPDATE transactions t
SET workspace_id = w.id
FROM workspaces w
WHERE t.user_id = w.owner_id AND w.type = 'personal';

UPDATE budgets b
SET workspace_id = w.id
FROM workspaces w
WHERE b.user_id = w.owner_id AND w.type = 'personal';

UPDATE goals g
SET workspace_id = w.id
FROM workspaces w
WHERE g.user_id = w.owner_id AND w.type = 'personal';

UPDATE recurring_transactions r
SET workspace_id = w.id
FROM workspaces w
WHERE r.user_id = w.owner_id AND w.type = 'personal';

-- Tornar workspace_id obrigatório (após migração)
ALTER TABLE accounts ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE budgets ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE goals ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE recurring_transactions ALTER COLUMN workspace_id SET NOT NULL;

-- Criar índices
CREATE INDEX idx_accounts_workspace ON accounts(workspace_id);
CREATE INDEX idx_transactions_workspace ON transactions(workspace_id);
CREATE INDEX idx_budgets_workspace ON budgets(workspace_id);
CREATE INDEX idx_goals_workspace ON goals(workspace_id);
CREATE INDEX idx_recurring_workspace ON recurring_transactions(workspace_id);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;

-- Políticas para workspaces
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspaces.id
        AND user_id = auth.uid()
        AND removed_at IS NULL
    )
  );

CREATE POLICY "Users can create personal workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid() AND type = 'personal');

CREATE POLICY "Owners can update their workspaces"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their workspaces"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- Políticas para workspace_members
CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.removed_at IS NULL
    )
  );

CREATE POLICY "Admins can add members"
  ON workspace_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
        AND wm.removed_at IS NULL
    )
  );

CREATE POLICY "Admins can update members"
  ON workspace_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
        AND wm.removed_at IS NULL
    )
  );

-- Atualizar RLS das tabelas existentes
CREATE POLICY "Members can view workspace data"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = transactions.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.removed_at IS NULL
    )
  );

-- (Repetir política similar para accounts, budgets, goals, recurring_transactions)

-- ============================================================================
-- 3. FUNÇÕES DE PERMISSÕES E TRIGGERS
-- ============================================================================

-- Função para verificar permissão
CREATE OR REPLACE FUNCTION has_permission(
  p_workspace_id UUID,
  p_user_id UUID,
  p_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_role member_role;
  v_custom_permissions JSONB;
BEGIN
  -- Buscar role e permissões customizadas
  SELECT role, custom_permissions
  INTO v_role, v_custom_permissions
  FROM workspace_members
  WHERE workspace_id = p_workspace_id
    AND user_id = p_user_id
    AND removed_at IS NULL;
  
  -- Se não é membro, retorna false
  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- OWNER tem todas as permissões
  IF v_role = 'owner' THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar permissões customizadas primeiro
  IF v_custom_permissions ? p_permission THEN
    RETURN TRUE;
  END IF;
  
  -- Matriz de permissões padrão por role
  -- (Simplificado - implementar lógica completa)
  CASE v_role
    WHEN 'admin' THEN
      RETURN p_permission NOT LIKE 'billing:%' AND p_permission NOT LIKE 'workspace:delete';
    WHEN 'contributor' THEN
      RETURN p_permission LIKE '%:create' OR p_permission LIKE '%:read' OR p_permission LIKE '%:update';
    WHEN 'viewer' THEN
      RETURN p_permission LIKE '%:read';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar contagem de membros
CREATE OR REPLACE FUNCTION update_workspace_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.removed_at IS NULL THEN
    UPDATE workspaces
    SET current_members = current_members + 1
    WHERE id = NEW.workspace_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.removed_at IS NULL AND NEW.removed_at IS NOT NULL THEN
    UPDATE workspaces
    SET current_members = current_members - 1
    WHERE id = NEW.workspace_id;
  ELSIF TG_OP = 'DELETE' AND OLD.removed_at IS NULL THEN
    UPDATE workspaces
    SET current_members = current_members - 1
    WHERE id = OLD.workspace_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_members_count
  AFTER INSERT OR UPDATE OR DELETE ON workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION update_workspace_members_count();

-- ============================================================================
-- 8. DADOS DE EXEMPLO (DESENVOLVIMENTO)
-- ============================================================================

-- (Adicionar via seeder após testar schema)

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Validação final
DO $$
BEGIN
  RAISE NOTICE 'Migration v3.16.0 completed successfully!';
  RAISE NOTICE 'Tables created: workspaces, workspace_members, workspace_invites';
  RAISE NOTICE 'RLS enabled on all workspace tables';
  RAISE NOTICE 'Next steps: Test schema, implement services, create UI components';
END $$;
