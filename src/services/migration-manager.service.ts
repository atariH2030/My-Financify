/**
 * Migration Manager Service
 * Sistema profissional de gerenciamento de migrations do banco de dados
 * 
 * Features:
 * - Versionamento automático
 * - Rollback seguro
 * - Validação antes de aplicar
 * - Logs detalhados
 * - Suporte a múltiplos ambientes (dev/staging/prod)
 * 
 * @version 1.0.0
 * @author DEV - Rickson
 */

import { supabase } from '../config/supabase.config';
import LoggerService from './logger.service';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Migration {
  id: string;
  version: string;
  name: string;
  description: string;
  sql: string;
  rollbackSql?: string;
  appliedAt?: Date;
  status: 'pending' | 'applied' | 'failed' | 'rolled_back';
  checksum: string;
  environment: 'development' | 'staging' | 'production';
}

export interface MigrationResult {
  success: boolean;
  migration: Migration;
  error?: string;
  executionTime?: number;
}

export interface MigrationHistory {
  id: string;
  version: string;
  name: string;
  appliedAt: Date;
  checksum: string;
  executionTime: number;
  environment: string;
}

// ============================================================================
// MIGRATION MANAGER CLASS
// ============================================================================

class MigrationManagerService {
  private readonly logger = LoggerService;
  private readonly tableName = 'migration_history';
  
  /**
   * Inicializa tabela de histórico de migrations
   */
  async initialize(): Promise<void> {
    try {
      const { error } = await supabase.rpc('create_migration_history_table');
      
      if (error && !error.message.includes('already exists')) {
        throw error;
      }
      
      this.logger.info('MIGRATION_MANAGER', 'Migration history table initialized');
    } catch (error) {
      this.logger.error('MIGRATION_MANAGER', error as Error);
      
      // Fallback: criar tabela manualmente
      await this.createMigrationHistoryTable();
    }
  }

  /**
   * Cria tabela de histórico de migrations (fallback)
   */
  private async createMigrationHistoryTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS public.migration_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        version TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        execution_time INTEGER, -- em ms
        environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
        status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'rolled_back')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Index para performance
      CREATE INDEX IF NOT EXISTS idx_migration_history_version ON public.migration_history(version);
      CREATE INDEX IF NOT EXISTS idx_migration_history_environment ON public.migration_history(environment);
      CREATE INDEX IF NOT EXISTS idx_migration_history_status ON public.migration_history(status);

      -- Enable RLS
      ALTER TABLE public.migration_history ENABLE ROW LEVEL SECURITY;

      -- Policy: Apenas admins podem ver histórico
      CREATE POLICY "Only admins can view migration history"
      ON public.migration_history FOR SELECT
      USING (auth.jwt() ->> 'role' = 'admin');
    `;

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      this.logger.error('MIGRATION_MANAGER', error as Error);
      throw new Error('Failed to create migration_history table');
    }
  }

  /**
   * Gera checksum SHA-256 do SQL
   */
  private async generateChecksum(sql: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(sql);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifica se migration já foi aplicada
   */
  async isMigrationApplied(version: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('version')
      .eq('version', version)
      .eq('status', 'applied')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      this.logger.error('MIGRATION_MANAGER', error as Error);
    }

    return !!data;
  }

  /**
   * Obtém histórico de migrations aplicadas
   */
  async getHistory(environment?: string): Promise<MigrationHistory[]> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .order('applied_at', { ascending: false });

    if (environment) {
      query = query.eq('environment', environment);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('MIGRATION_MANAGER', error as Error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      version: row.version,
      name: row.name,
      appliedAt: new Date(row.applied_at),
      checksum: row.checksum,
      executionTime: row.execution_time,
      environment: row.environment
    }));
  }

  /**
   * Aplica migration com validação e logs
   */
  async applyMigration(migration: Migration): Promise<MigrationResult> {
    const startTime = Date.now();

    try {
      // 1. Verificar se já foi aplicada
      const alreadyApplied = await this.isMigrationApplied(migration.version);
      if (alreadyApplied) {
        this.logger.info('MIGRATION_MANAGER', `Migration ${migration.version} already applied - skipping`);
        return {
          success: true,
          migration: { ...migration, status: 'applied' }
        };
      }

      // 2. Gerar checksum
      const checksum = await this.generateChecksum(migration.sql);

      // 3. Validar SQL (dry-run básico)
      const validationError = this.validateSQL(migration.sql);
      if (validationError) {
        throw new Error(`SQL validation failed: ${validationError}`);
      }

      // 4. Executar migration em transação
      this.logger.info('MIGRATION_MANAGER', `Applying migration ${migration.version}: ${migration.name}`);
      
      const { error: execError } = await supabase.rpc('exec_sql', { 
        sql_query: migration.sql 
      });

      if (execError) {
        throw execError;
      }

      // 5. Registrar no histórico
      const executionTime = Date.now() - startTime;
      
      const { error: historyError } = await supabase
        .from(this.tableName)
        .insert({
          version: migration.version,
          name: migration.name,
          description: migration.description,
          checksum,
          execution_time: executionTime,
          environment: migration.environment,
          status: 'applied'
        });

      if (historyError) {
        this.logger.error('MIGRATION_MANAGER', historyError as Error);
        // Não falhar aqui - migration foi aplicada com sucesso
      }

      this.logger.info('MIGRATION_MANAGER', `✅ Migration ${migration.version} applied successfully (${executionTime}ms)`);

      return {
        success: true,
        migration: { ...migration, status: 'applied', appliedAt: new Date() },
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.logger.error('MIGRATION_MANAGER', error as Error);

      // Registrar falha no histórico
      try {
        await supabase.from(this.tableName).insert({
          version: migration.version,
          name: migration.name,
          description: migration.description,
          checksum: await this.generateChecksum(migration.sql),
          execution_time: executionTime,
          environment: migration.environment,
          status: 'failed'
        });
      } catch (historyError) {
        this.logger.error('MIGRATION_MANAGER', historyError as Error);
      }

      return {
        success: false,
        migration: { ...migration, status: 'failed' },
        error: errorMessage,
        executionTime
      };
    }
  }

  /**
   * Rollback de migration
   */
  async rollbackMigration(version: string, rollbackSql: string): Promise<MigrationResult> {
    const startTime = Date.now();

    try {
      this.logger.info('MIGRATION_MANAGER', `Rolling back migration ${version}`);

      // 1. Executar rollback SQL
      const { error: execError } = await supabase.rpc('exec_sql', {
        sql_query: rollbackSql
      });

      if (execError) {
        throw execError;
      }

      // 2. Atualizar histórico
      const executionTime = Date.now() - startTime;

      await supabase
        .from(this.tableName)
        .update({ 
          status: 'rolled_back',
          execution_time: executionTime 
        })
        .eq('version', version);

      this.logger.info('MIGRATION_MANAGER', `✅ Migration ${version} rolled back successfully (${executionTime}ms)`);

      return {
        success: true,
        migration: {
          id: version,
          version,
          name: '',
          description: '',
          sql: '',
          rollbackSql,
          status: 'rolled_back',
          checksum: '',
          environment: 'development'
        },
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error('MIGRATION_MANAGER', error as Error);

      return {
        success: false,
        migration: {
          id: version,
          version,
          name: '',
          description: '',
          sql: '',
          rollbackSql,
          status: 'failed',
          checksum: '',
          environment: 'development'
        },
        error: errorMessage,
        executionTime
      };
    }
  }

  /**
   * Valida SQL antes de executar (regras básicas)
   */
  private validateSQL(sql: string): string | null {
    const lowerSql = sql.toLowerCase().trim();

    // Regra 1: Não permitir DROP DATABASE/SCHEMA
    if (lowerSql.includes('drop database') || lowerSql.includes('drop schema')) {
      return 'DROP DATABASE/SCHEMA não permitido em migrations';
    }

    // Regra 2: Migrations devem usar IF EXISTS/IF NOT EXISTS
    if (lowerSql.includes('create table') && !lowerSql.includes('if not exists')) {
      return 'CREATE TABLE deve usar IF NOT EXISTS';
    }

    if (lowerSql.includes('drop table') && !lowerSql.includes('if exists')) {
      return 'DROP TABLE deve usar IF EXISTS';
    }

    // Regra 3: Evitar DELETE/TRUNCATE sem WHERE em produção
    if ((lowerSql.includes('delete from') && !lowerSql.includes('where')) ||
        lowerSql.includes('truncate')) {
      return 'DELETE sem WHERE ou TRUNCATE deve ser evitado - use migrations de seed separadas';
    }

    // Validação OK
    return null;
  }

  /**
   * Obtém ambiente atual baseado em URL
   */
  getEnvironment(): 'development' | 'staging' | 'production' {
    const url = window.location.hostname;

    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return 'development';
    }
    
    if (url.includes('staging') || url.includes('preview')) {
      return 'staging';
    }

    return 'production';
  }

  /**
   * Aplica múltiplas migrations em ordem
   */
  async applyMigrations(migrations: Migration[]): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];

    // Ordenar por versão
    const sortedMigrations = migrations.sort((a, b) => 
      a.version.localeCompare(b.version)
    );

    for (const migration of sortedMigrations) {
      const result = await this.applyMigration(migration);
      results.push(result);

      // Parar se alguma migration falhar
      if (!result.success) {
        this.logger.error('MIGRATION_MANAGER', new Error(`Migration ${migration.version} failed - stopping pipeline`));
        break;
      }
    }

    return results;
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

const MigrationManager = new MigrationManagerService();
export default MigrationManager;
