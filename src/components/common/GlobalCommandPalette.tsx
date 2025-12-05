/**
 * @file GlobalCommandPalette.tsx
 * @description Command Palette global para navegação rápida
 * @version 3.12.0
 * @author DEV - Rickson (TQM)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GlobalCommandPalette.css';
import AnalyticsService from '../../services/analytics.service';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'navigation' | 'action' | 'search' | 'settings';
  keywords: string[];
  action: () => void;
  shortcut?: string;
}

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Navegação
    {
      id: 'nav-dashboard',
      title: 'Ir para Dashboard',
      description: 'Visão geral financeira',
      icon: 'fas fa-home',
      category: 'navigation',
      keywords: ['dashboard', 'início', 'home', 'visão geral'],
      action: () => onNavigate('dashboard'),
      shortcut: 'Ctrl+D',
    },
    {
      id: 'nav-transactions',
      title: 'Ir para Transações',
      description: 'Gerenciar receitas e despesas',
      icon: 'fas fa-exchange-alt',
      category: 'navigation',
      keywords: ['transações', 'transacoes', 'lançamentos', 'lancamentos'],
      action: () => onNavigate('transactions'),
      shortcut: 'Ctrl+T',
    },
    {
      id: 'nav-accounts',
      title: 'Ir para Contas',
      description: 'Gerenciar contas bancárias',
      icon: 'fas fa-university',
      category: 'navigation',
      keywords: ['contas', 'bancos', 'cartões', 'cartoes'],
      action: () => onNavigate('accounts'),
      shortcut: 'Ctrl+A',
    },
    {
      id: 'nav-budgets',
      title: 'Ir para Orçamentos',
      description: 'Definir e acompanhar orçamentos',
      icon: 'fas fa-chart-pie',
      category: 'navigation',
      keywords: ['orçamentos', 'orcamentos', 'budget', 'metas gastos'],
      action: () => onNavigate('budgets'),
      shortcut: 'Ctrl+B',
    },
    {
      id: 'nav-goals',
      title: 'Ir para Metas',
      description: 'Definir objetivos financeiros',
      icon: 'fas fa-bullseye',
      category: 'navigation',
      keywords: ['metas', 'objetivos', 'goals', 'sonhos'],
      action: () => onNavigate('goals'),
      shortcut: 'Ctrl+G',
    },
    {
      id: 'nav-reports',
      title: 'Ir para Relatórios',
      description: 'Análises e gráficos',
      icon: 'fas fa-chart-bar',
      category: 'navigation',
      keywords: ['relatórios', 'relatorios', 'reports', 'análises', 'analises', 'gráficos', 'graficos'],
      action: () => onNavigate('reports'),
      shortcut: 'Ctrl+R',
    },
    {
      id: 'nav-settings',
      title: 'Ir para Configurações',
      description: 'Preferências do sistema',
      icon: 'fas fa-cog',
      category: 'navigation',
      keywords: ['configurações', 'configuracoes', 'settings', 'preferências', 'preferencias'],
      action: () => onNavigate('settings'),
      shortcut: 'Ctrl+,',
    },
    // Ações
    {
      id: 'action-new-transaction',
      title: 'Nova Transação',
      description: 'Adicionar receita ou despesa',
      icon: 'fas fa-plus-circle',
      category: 'action',
      keywords: ['nova', 'adicionar', 'criar', 'transação', 'transacao', 'lançamento', 'lancamento'],
      action: () => {
        onNavigate('transactions');
        setTimeout(() => {
          const addButton = document.querySelector('.btn-add-transaction') as HTMLButtonElement;
          addButton?.click();
        }, 300);
      },
    },
    {
      id: 'action-export-data',
      title: 'Exportar Dados',
      description: 'Backup em Excel/PDF',
      icon: 'fas fa-download',
      category: 'action',
      keywords: ['exportar', 'download', 'backup', 'excel', 'pdf'],
      action: () => onNavigate('settings'),
    },
    {
      id: 'action-open-ai',
      title: 'Abrir Assistente IA',
      description: 'Conversar com a IA financeira',
      icon: 'fas fa-robot',
      category: 'action',
      keywords: ['ia', 'ai', 'assistente', 'chatbot', 'ajuda'],
      action: () => {
        onClose();
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
      },
      shortcut: 'Ctrl+K',
    },
    // Configurações
    {
      id: 'settings-theme',
      title: 'Alternar Tema',
      description: 'Mudar entre claro e escuro',
      icon: 'fas fa-adjust',
      category: 'settings',
      keywords: ['tema', 'theme', 'dark', 'light', 'escuro', 'claro'],
      action: () => {
        document.querySelector<HTMLButtonElement>('.theme-toggle')?.click();
        onClose();
      },
      shortcut: 'Ctrl+Shift+T',
    },
    {
      id: 'settings-notifications',
      title: 'Notificações',
      description: 'Gerenciar alertas',
      icon: 'fas fa-bell',
      category: 'settings',
      keywords: ['notificações', 'notificacoes', 'alertas', 'avisos'],
      action: () => onNavigate('settings'),
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.description.toLowerCase().includes(searchLower) ||
      cmd.keywords.some((k) => k.toLowerCase().includes(searchLower))
    );
  });

  const handleSelect = useCallback(
    (command: Command) => {
      AnalyticsService.trackFeatureUsed(`command_palette_${command.id}`);
      command.action();
      onClose();
      setSearch('');
      setSelectedIndex(0);
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleSelect(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredCommands, selectedIndex, handleSelect, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const getCategoryIcon = (category: Command['category']) => {
    switch (category) {
      case 'navigation':
        return 'fas fa-compass';
      case 'action':
        return 'fas fa-bolt';
      case 'search':
        return 'fas fa-search';
      case 'settings':
        return 'fas fa-sliders-h';
    }
  };

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="command-palette-overlay" onClick={onClose}>
          <motion.div
            className="command-palette-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
          >
            <div className="command-palette-header">
              <i className="fas fa-terminal"></i>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite para buscar comandos..."
                className="command-search-input"
              />
              <kbd className="command-hint">Esc</kbd>
            </div>

            <div className="command-palette-body">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="command-group">
                  <div className="command-group-title">
                    <i className={getCategoryIcon(category as Command['category'])}></i>
                    {category === 'navigation' && 'Navegação'}
                    {category === 'action' && 'Ações'}
                    {category === 'search' && 'Busca'}
                    {category === 'settings' && 'Configurações'}
                  </div>
                  {cmds.map((cmd, index) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    return (
                      <motion.div
                        key={cmd.id}
                        className={`command-item ${
                          globalIndex === selectedIndex ? 'selected' : ''
                        }`}
                        onClick={() => handleSelect(cmd)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        whileHover={{ x: 4 }}
                      >
                        <i className={cmd.icon}></i>
                        <div className="command-info">
                          <div className="command-title">{cmd.title}</div>
                          <div className="command-description">{cmd.description}</div>
                        </div>
                        {cmd.shortcut && <kbd className="command-shortcut">{cmd.shortcut}</kbd>}
                      </motion.div>
                    );
                  })}
                </div>
              ))}

              {filteredCommands.length === 0 && (
                <div className="command-empty">
                  <i className="fas fa-search"></i>
                  <p>Nenhum comando encontrado</p>
                  <small>Tente outro termo de busca</small>
                </div>
              )}
            </div>

            <div className="command-palette-footer">
              <div className="command-tips">
                <span>
                  <kbd>↑</kbd> <kbd>↓</kbd> Navegar
                </span>
                <span>
                  <kbd>Enter</kbd> Selecionar
                </span>
                <span>
                  <kbd>Esc</kbd> Fechar
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalCommandPalette;
