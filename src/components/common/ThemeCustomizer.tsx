/**
 * @file ThemeCustomizer.tsx
 * @description Interface para criar e aplicar temas personalizados
 * @version 3.13.0
 * @author DEV - Rickson (TQM)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeService, { Theme, ThemeColors } from '../../services/theme.service';
import './ThemeCustomizer.css';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(ThemeService.getCurrentTheme());
  const [presets] = useState<Theme[]>(ThemeService.getPresetThemes());
  const [customMode, setCustomMode] = useState<'light' | 'dark'>('light');
  const [customColors, setCustomColors] = useState<Partial<ThemeColors>>({});
  const [customName, setCustomName] = useState('Meu Tema');
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    setCurrentTheme(ThemeService.getCurrentTheme());
  }, [isOpen]);

  const handleApplyPreset = (themeId: string) => {
    ThemeService.applyTheme(themeId);
    setCurrentTheme(ThemeService.getCurrentTheme());
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setCustomColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateCustomTheme = () => {
    if (!customName.trim()) {
      alert('Por favor, insira um nome para o tema');
      return;
    }

    ThemeService.createCustomTheme(customName, customMode, customColors);
    setCurrentTheme(ThemeService.getCurrentTheme());
    setIsCustomizing(false);
    setCustomColors({});
  };

  const handleDeleteCustomTheme = () => {
    if (confirm('Deseja realmente deletar o tema customizado?')) {
      ThemeService.deleteCustomTheme();
      setCurrentTheme(ThemeService.getCurrentTheme());
    }
  };

  const handleExportTheme = () => {
    const themeJson = ThemeService.exportCustomTheme();
    if (themeJson) {
      const blob = new Blob([themeJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTheme.name.replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeJson = e.target?.result as string;
        ThemeService.importCustomTheme(themeJson);
        setCurrentTheme(ThemeService.getCurrentTheme());
        alert('Tema importado com sucesso!');
      } catch (error) {
        alert('Erro ao importar tema. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="theme-customizer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="theme-customizer-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="theme-customizer-header">
              <h2>
                <i className="fas fa-palette" /> Personalizar Tema
              </h2>
              <button className="close-button" onClick={onClose}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="theme-customizer-content">
              {/* Tema Atual */}
              <div className="current-theme-section">
                <h3>Tema Atual</h3>
                <div className="current-theme-card">
                  <div className="theme-preview">
                    <div
                      className="preview-box"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    />
                    <div
                      className="preview-box"
                      style={{ backgroundColor: currentTheme.colors.secondary }}
                    />
                    <div
                      className="preview-box"
                      style={{ backgroundColor: currentTheme.colors.success }}
                    />
                  </div>
                  <div className="theme-info">
                    <h4>{currentTheme.name}</h4>
                    <span className="theme-mode">{currentTheme.mode === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
                  </div>
                </div>
              </div>

              {!isCustomizing ? (
                <>
                  {/* Temas Presets */}
                  <div className="presets-section">
                    <h3>Temas Predefinidos</h3>
                    <div className="presets-grid">
                      {presets.map((theme) => (
                        <div
                          key={theme.id}
                          className={`preset-card ${currentTheme.id === theme.id ? 'active' : ''}`}
                          onClick={() => handleApplyPreset(theme.id)}
                        >
                          <div className="preset-preview">
                            <div style={{ backgroundColor: theme.colors.primary }} />
                            <div style={{ backgroundColor: theme.colors.secondary }} />
                            <div style={{ backgroundColor: theme.colors.success }} />
                          </div>
                          <span className="preset-name">{theme.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="actions-section">
                    <button className="action-button primary" onClick={() => setIsCustomizing(true)}>
                      <i className="fas fa-paint-brush" /> Criar Tema Customizado
                    </button>
                    {currentTheme.id === 'custom' && (
                      <>
                        <button className="action-button" onClick={handleExportTheme}>
                          <i className="fas fa-download" /> Exportar Tema
                        </button>
                        <button className="action-button danger" onClick={handleDeleteCustomTheme}>
                          <i className="fas fa-trash" /> Deletar Tema
                        </button>
                      </>
                    )}
                    <label className="action-button">
                      <i className="fas fa-upload" /> Importar Tema
                      <input
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleImportTheme}
                      />
                    </label>
                  </div>
                </>
              ) : (
                /* Criar Tema Customizado */
                <div className="custom-theme-section">
                  <h3>Criar Tema Personalizado</h3>
                  
                  <div className="custom-form">
                    <div className="form-group">
                      <label>Nome do Tema</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Ex: Meu Tema Azul"
                      />
                    </div>

                    <div className="form-group">
                      <label>Modo</label>
                      <div className="mode-selector">
                        <button
                          className={`mode-button ${customMode === 'light' ? 'active' : ''}`}
                          onClick={() => setCustomMode('light')}
                        >
                          ☀️ Light
                        </button>
                        <button
                          className={`mode-button ${customMode === 'dark' ? 'active' : ''}`}
                          onClick={() => setCustomMode('dark')}
                        >
                          🌙 Dark
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Cores Principais</label>
                      <div className="colors-grid">
                        {[
                          { key: 'primary', label: 'Primária' },
                          { key: 'secondary', label: 'Secundária' },
                          { key: 'success', label: 'Sucesso' },
                          { key: 'warning', label: 'Aviso' },
                          { key: 'error', label: 'Erro' },
                          { key: 'info', label: 'Info' },
                        ].map(({ key, label }) => (
                          <div key={key} className="color-input-group">
                            <label>{label}</label>
                            <input
                              type="color"
                              value={customColors[key as keyof ThemeColors] || '#3b82f6'}
                              onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="custom-actions">
                      <button className="action-button primary" onClick={handleCreateCustomTheme}>
                        <i className="fas fa-check" /> Criar Tema
                      </button>
                      <button className="action-button" onClick={() => setIsCustomizing(false)}>
                        <i className="fas fa-times" /> Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ThemeCustomizer;
