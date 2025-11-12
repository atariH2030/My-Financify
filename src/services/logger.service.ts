/**
 * Logger Service - Sistema robusto de logs seguindo TQM
 * Facilita debug e monitoramento de erros em produção
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  source: string;
}

class LoggerService {
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Performance: Limita logs em memória

  /**
   * Configura nível mínimo de log
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Log de debug - desenvolvimento
   */
  debug(message: string, data?: any, source = 'APP'): void {
    this.log(LogLevel.DEBUG, message, data, source);
  }

  /**
   * Log informativo - operações normais
   */
  info(message: string, data?: any, source = 'APP'): void {
    this.log(LogLevel.INFO, message, data, source);
  }

  /**
   * Log de aviso - situações suspeitas
   */
  warn(message: string, data?: any, source = 'APP'): void {
    this.log(LogLevel.WARN, message, data, source);
  }

  /**
   * Log de erro - falhas críticas
   */
  error(message: string, error?: Error, source = 'APP'): void {
    const errorData = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : undefined;
    
    this.log(LogLevel.ERROR, message, errorData, source);
  }

  /**
   * Método principal de log
   */
  private log(level: LogLevel, message: string, data?: any, source = 'APP'): void {
    if (level < this.logLevel) return;

    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source
    };

    // Console output com cores
    this.outputToConsole(logEntry);
    
    // Armazena em memória (para debug)
    this.storeLogs(logEntry);
  }

  /**
   * Output colorido no console
   */
  private outputToConsole(entry: LogEntry): void {
    const colors = {
      [LogLevel.DEBUG]: 'color: #666; font-style: italic;',
      [LogLevel.INFO]: 'color: #2196F3;',
      [LogLevel.WARN]: 'color: #FF9800; font-weight: bold;',
      [LogLevel.ERROR]: 'color: #F44336; font-weight: bold; background: #ffebee;'
    };

    const levelNames = {
      [LogLevel.DEBUG]: 'DEBUG',
      [LogLevel.INFO]: 'INFO',
      [LogLevel.WARN]: 'WARN',
      [LogLevel.ERROR]: 'ERROR'
    };

    console.log(
      `%c[${levelNames[entry.level]}] ${entry.source}: ${entry.message}`,
      colors[entry.level]
    );

    if (entry.data) {
      console.log('📊 Data:', entry.data);
    }
  }

  /**
   * Armazena logs em memória (Performance: com limite)
   */
  private storeLogs(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Performance: Remove logs antigos se exceder limite
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Retorna logs para análise
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level === undefined) return [...this.logs];
    return this.logs.filter(log => log.level >= level);
  }

  /**
   * Exporta logs como JSON para análise
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Limpa logs (útil para testes)
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Singleton pattern para uso global
export const Logger = new LoggerService();

// Configuração para desenvolvimento
const isDevelopment = typeof window !== 'undefined' && 
  (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1');

if (isDevelopment) {
  Logger.setLogLevel(LogLevel.DEBUG);
}

export default Logger;