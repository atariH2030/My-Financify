-- ====================================
-- ROLLBACK: Add Workspace RLS Policies
-- Reverts workspace support from existing tables
-- v3.15.0
-- ====================================

-- ============================================================================
-- STEP 1: Drop workspace-aware RLS policies
-- ============================================================================

-- Accounts policies
DROP POLICY IF EXISTS "Users can view workspace accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert workspace accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update workspace accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete workspace accounts" ON public.accounts;

-- Budgets policies
DROP POLICY IF EXISTS "Users can view workspace budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert workspace budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update workspace budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete workspace budgets" ON public.budgets;

-- Goals policies
DROP POLICY IF EXISTS "Users can view workspace goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert workspace goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update workspace goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete workspace goals" ON public.goals;

-- Recurring transactions policies
DROP POLICY IF EXISTS "Users can view workspace recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can insert workspace recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can update workspace recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can delete workspace recurring transactions" ON public.recurring_transactions;

-- ============================================================================
-- STEP 2: Recreate original RLS policies (user_id based)
-- ============================================================================

-- ========== ACCOUNTS POLICIES ==========
CREATE POLICY "Users can view own accounts"
ON public.accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
ON public.accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
ON public.accounts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
ON public.accounts FOR DELETE
USING (auth.uid() = user_id);

-- ========== BUDGETS POLICIES ==========
CREATE POLICY "Users can view own budgets"
ON public.budgets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
ON public.budgets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
ON public.budgets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
ON public.budgets FOR DELETE
USING (auth.uid() = user_id);

-- ========== GOALS POLICIES ==========
CREATE POLICY "Users can view own goals"
ON public.goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
ON public.goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
ON public.goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
ON public.goals FOR DELETE
USING (auth.uid() = user_id);

-- ========== RECURRING TRANSACTIONS POLICIES ==========
CREATE POLICY "Users can view own recurring transactions"
ON public.recurring_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring transactions"
ON public.recurring_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions"
ON public.recurring_transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring transactions"
ON public.recurring_transactions FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 3: Drop helper function
-- ============================================================================

DROP FUNCTION IF EXISTS public.is_workspace_member(UUID);

-- ============================================================================
-- STEP 4: Drop indexes
-- ============================================================================

DROP INDEX IF EXISTS public.idx_accounts_workspace_id;
DROP INDEX IF EXISTS public.idx_budgets_workspace_id;
DROP INDEX IF EXISTS public.idx_goals_workspace_id;
DROP INDEX IF EXISTS public.idx_recurring_workspace_id;

-- ============================================================================
-- STEP 5: Remove workspace_id columns
-- ============================================================================

-- ⚠️ WARNING: This will DELETE all workspace associations!
-- Make sure you have a backup before running this step.

ALTER TABLE public.accounts DROP COLUMN IF EXISTS workspace_id;
ALTER TABLE public.budgets DROP COLUMN IF EXISTS workspace_id;
ALTER TABLE public.goals DROP COLUMN IF EXISTS workspace_id;
ALTER TABLE public.recurring_transactions DROP COLUMN IF EXISTS workspace_id;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Workspace RLS policies rollback completed!';
  RAISE NOTICE '🔄 Original user_id based policies restored';
  RAISE NOTICE '⚠️ workspace_id columns removed from all tables';
  RAISE NOTICE '📊 Tables affected: accounts, budgets, goals, recurring_transactions';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ WARNING: All workspace associations have been removed!';
  RAISE NOTICE '⚠️ Personal accounts (user_id based) are now the only mode.';
END $$;
