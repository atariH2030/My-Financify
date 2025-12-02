/**
 * @file CommandPalette.tsx
 * @description Busca global estilo VS Code/GitHub
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CommandPalette.css';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  category: 'navigation' | 'action' | 'transaction' | 'goal' | 'budget';
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Comandos disponíveis
  const commands: CommandItem[] = useMemo(() => [
    // Navegação
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      description: 'Visão geral das finanças',
      icon: '📊',
      category: 'navigation',
      action: () => {
        onNavigate('dashboard');
        onClose();
      },
      keywords: ['dashboard', 'painel', 'inicio', 'home'],
    },
    {
      id: 'nav-transactions',
      title: 'Transações',
      description: 'Receitas e despesas',
      icon: '💰',
      category: 'navigation',
      action: () => {
        onNavigate('transactions');
        onClose();
      },
      keywords: ['transacoes', 'receitas', 'despesas', 'lancamentos'],
    },
    {
      id: 'nav-goals',
      title: 'Metas e Objetivos',
      description: 'Acompanhe suas metas',
      icon: '🎯',
      category: 'navigation',
      action: () => {
        onNavigate('goals');
        onClose();
      },
      keywords: ['metas', 'objetivos', 'alvos', 'goals'],
    },
    {
      id: 'nav-budgets',
      title: 'Orçamentos',
      description: 'Planeje seus gastos',
      icon: '💼',
      category: 'navigation',
      action: () => {
        onNavigate('budgets');
        onClose();
      },
      keywords: ['orcamentos', 'planejamento', 'budgets'],
    },
    {
      id: 'nav-reports',
      title: 'Relatórios',
      description: 'Análises e gráficos',
      icon: '📈',
      category: 'navigation',
      action: () => {
        onNavigate('reports');
        onClose();
      },
      keywords: ['relatorios', 'graficos', 'analises', 'reports'],
    },
    {
      id: 'nav-accounts',
      title: 'Minhas Contas',
      description: 'Contas e carteiras',
      icon: '🏦',
      category: 'navigation',
      action: () => {
        onNavigate('accounts');
        onClose();
      },
      keywords: ['contas', 'carteiras', 'accounts', 'bancos'],
    },
    {
      id: 'nav-recurring',
      title: 'Contas Recorrentes',
      description: 'Gastos e receitas fixas',
      icon: '🔄',
      category: 'navigation',
      action: () => {
        onNavigate('recurring');
        onClose();
      },
      keywords: ['recorrentes', 'fixas', 'mensais', 'recurring'],
    },
    {
      id: 'nav-settings',
      title: 'Configurações',
      description: 'Personalize o sistema',
      icon: '⚙️',
      category: 'navigation',
      action: () => {
        onNavigate('settings');
        onClose();
      },
      keywords: ['configuracoes', 'preferencias', 'settings'],
    },
    // Ações rápidas
    {
      id: 'action-new-transaction',
      title: 'Nova Transação',
      description: 'Criar receita ou despesa',
      icon: '➕',
      category: 'action',
      action: () => {
        onNavigate('transactions');
        onClose();
        // Simular click no botão de nova transação após navegar
        setTimeout(() => {
          const addButton = document.querySelector('.add-transaction-btn') as HTMLElement;
          if (addButton) addButton.click();
        }, 100);
      },
      keywords: ['nova', 'criar', 'adicionar', 'transacao', 'lancamento'],
    },
    {
      id: 'action-new-goal',
      title: 'Nova Meta',
      description: 'Definir novo objetivo',
      icon: '🎯',
      category: 'action',
      action: () => {
        onNavigate('goals');
        onClose();
        setTimeout(() => {
          const addButton = document.querySelector('.add-goal-btn') as HTMLElement;
          if (addButton) addButton.click();
        }, 100);
      },
      keywords: ['nova', 'criar', 'meta', 'objetivo'],
    },
    {
      id: 'action-new-budget',
      title: 'Novo Orçamento',
      description: 'Criar planejamento',
      icon: '💼',
      category: 'action',
      action: () => {
        onNavigate('budgets');
        onClose();
        setTimeout(() => {
          const addButton = document.querySelector('.add-budget-btn') as HTMLElement;
          if (addButton) addButton.click();
        }, 100);
      },
      keywords: ['novo', 'criar', 'orcamento', 'planejar'],
    },
  ], [onNavigate, onClose]);

  // Busca fuzzy simples
  const fuzzyMatch = (text: string, search: string): boolean => {
    const textLower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const searchLower = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return textLower.includes(searchLower);
  };

  // Filtrar comandos baseado na busca
  const filteredCommands = useMemo(() => {
    if (!searchTerm.trim()) {
      return commands;
    }

    return commands.filter(cmd => {
      const matchTitle = fuzzyMatch(cmd.title, searchTerm);
      const matchDescription = cmd.description && fuzzyMatch(cmd.description, searchTerm);
      const matchKeywords = cmd.keywords?.some(kw => fuzzyMatch(kw, searchTerm));
      
      return matchTitle || matchDescription || matchKeywords;
    });
  }, [searchTerm, commands]);

  // Agrupar por categoria
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      action: [],
      transaction: [],
      goal: [],
      budget: [],
    };

    filteredCommands.forEach(cmd => {
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // Auto-focus no input quando abrir
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearchTerm('');
      setSelectedIndex(0);
      
      // Carregar buscas recentes
      const recent = localStorage.getItem('commandPaletteRecent');
      if (recent) {
        setRecentSearches(JSON.parse(recent));
      }
    }
  }, [isOpen]);

  // Executar comando e salvar histórico
  const executeCommand = useCallback((command: CommandItem) => {
    // Salvar nos recentes
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('commandPaletteRecent', JSON.stringify(updated));
    
    command.action();
  }, [searchTerm, recentSearches]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose, executeCommand]);

  // Scroll automático para item selecionado
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const categoryLabels: Record<string, string> = {
    navigation: '🧭 Navegação',
    action: '⚡ Ações Rápidas',
    transaction: '💰 Transações',
    goal: '🎯 Metas',
    budget: '💼 Orçamentos',
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="command-palette-overlay" onClick={onClose}>
        <motion.div
          className="command-palette"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', duration: 0.3 }}
        >
          {/* Search Input */}
          <div className="command-palette-header">
            <span className="command-palette-icon">🔍</span>
            <input
              ref={inputRef}
              type="text"
              className="command-palette-input"
              placeholder="Digite para buscar... (páginas, ações, transações)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <kbd className="command-palette-hint">Esc</kbd>
          </div>

          {/* Results */}
          <div className="command-palette-results" ref={resultsRef}>
            {filteredCommands.length === 0 ? (
              <div className="command-palette-empty">
                <span className="empty-icon">🔍</span>
                <p>Nenhum resultado encontrado</p>
                <small>Tente buscar por: Dashboard, Transações, Nova Meta...</small>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, items]) => {
                if (items.length === 0) return null;

                return (
                  <div key={category} className="command-palette-category">
                    <div className="category-label">{categoryLabels[category]}</div>
                    {items.map((command, _index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      return (
                        <div
                          key={command.id}
                          data-index={globalIndex}
                          className={`command-item ${globalIndex === selectedIndex ? 'selected' : ''}`}
                          onClick={() => executeCommand(command)}
                        >
                          <span className="command-icon">{command.icon}</span>
                          <div className="command-info">
                            <div className="command-title">{command.title}</div>
                            {command.description && (
                              <div className="command-description">{command.description}</div>
                            )}
                          </div>
                          <kbd className="command-shortcut">Enter</kbd>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="command-palette-footer">
            <div className="footer-hints">
              <span><kbd>↑</kbd> <kbd>↓</kbd> Navegar</span>
              <span><kbd>Enter</kbd> Selecionar</span>
              <span><kbd>Esc</kbd> Fechar</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
