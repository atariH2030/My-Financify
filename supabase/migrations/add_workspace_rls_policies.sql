-- ====================================
-- Add Workspace Support to RLS Policies
-- Multi-Tenant Workspace System
-- v3.15.0
-- ====================================

-- ============================================================================
-- STEP 1: Add workspace_id to existing tables
-- ============================================================================

-- Add workspace_id to accounts table
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Add workspace_id to budgets table
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Add workspace_id to goals table
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Add workspace_id to recurring_transactions table
ALTER TABLE public.recurring_transactions 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 2: Create helper function to check workspace membership
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is workspace owner
  IF EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id AND owner_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check if user is workspace member
  IF EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.workspace_id = is_workspace_member.workspace_id
    AND user_id = auth.uid()
    AND removed_at IS NULL
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: Drop old RLS policies (user_id based)
-- ============================================================================

-- Accounts policies
DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON public.accounts;

-- Budgets policies
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

-- Goals policies
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;

-- Recurring transactions policies
DROP POLICY IF EXISTS "Users can view own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can insert own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can update own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can delete own recurring transactions" ON public.recurring_transactions;

-- ============================================================================
-- STEP 4: Create new workspace-aware RLS policies
-- ============================================================================

-- ========== ACCOUNTS POLICIES ==========
CREATE POLICY "Users can view workspace accounts"
ON public.accounts FOR SELECT
USING (
  -- Personal accounts (no workspace_id)
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  -- Workspace accounts (user is member)
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

CREATE POLICY "Users can insert workspace accounts"
ON public.accounts FOR INSERT
WITH CHECK (
  -- Personal accounts
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  -- Workspace accounts (user is member)
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

CREATE POLICY "Users can update workspace accounts"
ON public.accounts FOR UPDATE
USING (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

CREATE POLICY "Users can delete workspace accounts"
ON public.accounts FOR DELETE
USING (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

-- ========== BUDGETS POLICIES ==========
CREATE POLICY "Users can view workspace budgets"
ON public.budgets FOR SELECT
USING (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

CREATE POLICY "Users can insert workspace budgets"
ON public.budgets FOR INSERT
WITH CHECK (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

CREATE POLICY "Users can update workspace budgets"
ON public.budgets FOR UPDATE
USING (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

CREATE POLICY "Users can delete workspace budgets"
ON public.budgets FOR DELETE
USING (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

-- ========== GOALS POLICIES ==========
CREATE POLICY "Users can view workspace goals"
ON public.goals FOR SELECT
USING (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

CREATE POLICY "Users can insert workspace goals"
ON public.goals FOR INSERT
WITH CHECK (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

CREATE POLICY "Users can update workspace goals"
ON public.goals FOR UPDATE
USING (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

CREATE POLICY "Users can delete workspace goals"
ON public.goals FOR DELETE
USING (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

-- ========== RECURRING TRANSACTIONS POLICIES ==========
CREATE POLICY "Users can view workspace recurring transactions"
ON public.recurring_transactions FOR SELECT
USING (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

CREATE POLICY "Users can insert workspace recurring transactions"
ON public.recurring_transactions FOR INSERT
WITH CHECK (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

CREATE POLICY "Users can update workspace recurring transactions"
ON public.recurring_transactions FOR UPDATE
USING (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

CREATE POLICY "Users can delete workspace recurring transactions"
ON public.recurring_transactions FOR DELETE
USING (
  (workspace_id IS NULL AND auth.uid() = user_id)
  OR
  (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);

-- ============================================================================
-- STEP 5: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_accounts_workspace_id ON public.accounts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_budgets_workspace_id ON public.budgets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_goals_workspace_id ON public.goals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_recurring_workspace_id ON public.recurring_transactions(workspace_id);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Workspace RLS policies applied successfully!';
  RAISE NOTICE '📊 Tables updated: accounts, budgets, goals, recurring_transactions';
  RAISE NOTICE '🔒 Multi-tenant workspace security enabled';
  RAISE NOTICE '🚀 Personal accounts (workspace_id = NULL) still work for backward compatibility';
END $$;
