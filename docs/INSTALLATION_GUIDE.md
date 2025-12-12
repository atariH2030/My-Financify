# 🛠️ Guia de Instalação Completo - My Financify

> Instruções para setup completo do ambiente de desenvolvimento em novo dispositivo

**Última Atualização**: 12 de dezembro de 2025  
**Versão do Projeto**: v3.16.0  
**Autor**: Rickson (DEV)

---

## 📋 Sumário

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação Base](#instalação-base)
3. [Dependências do Projeto](#dependências-do-projeto)
4. [Configuração do Supabase](#configuração-do-supabase)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Comandos Disponíveis](#comandos-disponíveis)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Pré-requisitos

### 1. **Node.js** (v18.0.0 ou superior)
```bash
# Verificar versão instalada
node --version
# Deve retornar: v18.x.x ou superior

# Download: https://nodejs.org/en/download/
# Recomendado: LTS (Long Term Support)
```

### 2. **Git** (v2.30.0 ou superior)
```bash
# Verificar versão instalada
git --version
# Deve retornar: git version 2.x.x

# Download: https://git-scm.com/downloads
```

### 3. **Visual Studio Code** (recomendado)
```bash
# Download: https://code.visualstudio.com/

# Extensões recomendadas:
- ESLint
- Prettier - Code formatter
- TypeScript and JavaScript Language Features
- GitLens
- Error Lens
- Auto Rename Tag
- Path Intellisense
```

### 4. **PowerShell** (Windows) ou **Terminal** (macOS/Linux)
- Windows: PowerShell 5.1+ ou PowerShell 7+
- macOS/Linux: Bash/Zsh

---

## 🚀 Instalação Base

### 1. **Clonar Repositório**
```bash
# HTTPS (recomendado)
git clone https://github.com/atariH2030/My-Financify.git

# SSH (se configurado)
git clone git@github.com:atariH2030/My-Financify.git

# Entrar no diretório
cd My-Financify
```

### 2. **Instalar Dependências Base**
```bash
# Instalar todas as dependências do package.json
npm install

# ⏱️ Tempo estimado: 2-5 minutos
# 📦 Pacotes instalados: ~735 packages
```

---

## 📦 Dependências do Projeto

### **Dependências Principais** (package.json)

#### **React & Core**
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "typescript": "^5.3.3"
}
```

#### **Build & Dev Tools**
```json
{
  "vite": "^7.2.7",
  "@vitejs/plugin-react": "^4.3.4",
  "vitest": "^2.1.8"
}
```

#### **Supabase (Backend)**
```json
{
  "@supabase/supabase-js": "^2.47.15"
}
```

#### **Database Local (IndexedDB)**
```json
{
  "dexie": "^4.0.10",
  "dexie-react-hooks": "^2.0.3"
}
```

#### **Charts & Visualization**
```json
{
  "chart.js": "^4.5.0",
  "recharts": "^2.15.0"
}
```

#### **UI & Icons**
```json
{
  "lucide-react": "^0.468.0",
  "framer-motion": "^11.15.0"
}
```

#### **PDF Export**
```json
{
  "html2canvas": "^1.4.1",
  "jspdf": "^2.5.2"
}
```

#### **Forms & Validation**
```json
{
  "zod": "^4.1.1"
}
```

#### **Testing**
```json
{
  "@playwright/test": "^1.50.1",
  "@testing-library/react": "^16.1.0",
  "@axe-core/playwright": "^4.10.2"
}
```

#### **PWA (Progressive Web App)**
```json
{
  "vite-plugin-pwa": "^0.21.2",
  "workbox-window": "^7.3.0"
}
```

---

## 🔧 Configuração do Supabase

### 1. **Criar Conta no Supabase**
```bash
# Acessar: https://supabase.com/
# Criar conta gratuita
# Criar novo projeto
```

### 2. **Obter Credenciais**
```bash
# No dashboard do Supabase:
# Settings > API

# Copiar:
- Project URL (SUPABASE_URL)
- anon/public key (SUPABASE_ANON_KEY)
```

### 3. **Executar Schema SQL**
```bash
# No Supabase Dashboard:
# SQL Editor > New Query

# Colar e executar conteúdo de:
# supabase/schema.sql
```

### 4. **Executar Migrations** (se houver)
```bash
# No SQL Editor, executar arquivos em ordem:
# supabase/migrations/20240101_initial.sql
# supabase/migrations/20240102_add_categories.sql
# etc.
```

### 5. **Configurar Row Level Security (RLS)**
```sql
-- Já está no schema.sql
-- Verificar se as policies foram criadas corretamente
```

---

## 🔐 Variáveis de Ambiente

### 1. **Criar arquivo `.env.local`**
```bash
# Na raiz do projeto, criar arquivo .env.local

# Colar as credenciais do Supabase:
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# Opcional (Analytics):
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxxxxxxxx@sentry.io/xxxxxxx
```

### 2. **Verificar .gitignore**
```bash
# .env.local deve estar no .gitignore (já está)
# NUNCA commitar credenciais para o repositório
```

---

## 🛠️ Comandos Disponíveis

### **Desenvolvimento**
```bash
# Rodar servidor de desenvolvimento
npm run dev
# Abre em: http://localhost:3000

# Rodar em porta específica
npm run dev -- --port 3001

# Rodar com host exposto (rede local)
npm run dev -- --host
```

### **Build**
```bash
# Build de produção
npm run build
# Gera pasta: dist/

# Preview do build
npm run preview
# Abre em: http://localhost:4173
```

### **Testes**
```bash
# Rodar todos os testes unitários
npm run test

# Rodar testes em watch mode
npm run test:watch

# Rodar testes E2E (Playwright)
npx playwright test

# Rodar testes com UI
npx playwright test --ui

# Gerar relatório de testes
npm run test:report
```

### **Lint & Format**
```bash
# Rodar ESLint
npm run lint

# Fix automático de erros ESLint
npm run lint:fix

# Formatar código com Prettier
npm run format

# Spell checker
npm run spell-check
```

### **Database**
```bash
# Rodar migrations
npm run migrate

# Seed (popular banco com dados de teste)
npm run seed

# Reset completo do banco
npm run db:reset
```

### **Análise**
```bash
# Analisar bundle size
npm run analyze

# Detectar traduções faltando
npm run detect-untranslated

# Análise de warnings
npm run analyze-warnings
```

---

## 📁 Estrutura do Projeto

```
My-Financify/
├── .github/                    # Workflows GitHub Actions
│   └── copilot-instructions.md # Instruções para Copilot
├── docs/                       # Documentação completa
│   ├── features/               # Guias de features
│   ├── guides/                 # Guias técnicos
│   ├── reports/                # Relatórios de qualidade
│   └── changelogs/             # Histórico de versões
├── public/                     # Assets estáticos
├── scripts/                    # Scripts de build/análise
├── src/                        # Código fonte
│   ├── components/             # Componentes React
│   ├── hooks/                  # Custom hooks
│   ├── services/               # Serviços (API, DB, etc)
│   ├── styles/                 # CSS global
│   ├── types/                  # Definições TypeScript
│   ├── utils/                  # Utilitários
│   └── main.tsx                # Entry point
├── supabase/                   # Schema e migrations
├── tests/                      # Testes E2E
├── .env.local                  # Variáveis de ambiente (NÃO COMMITAR)
├── package.json                # Dependências
├── tsconfig.json               # Config TypeScript
├── vite.config.ts              # Config Vite
└── vitest.config.ts            # Config Vitest
```

---

## 🔍 Verificação Pós-Instalação

### Checklist de Validação
```bash
# 1. Verificar se node_modules foi criado
ls node_modules/

# 2. Verificar se .env.local existe
ls .env.local

# 3. Testar build
npm run build

# 4. Testar dev server
npm run dev

# 5. Testar lint
npm run lint

# 6. Verificar testes
npm run test

# 7. Verificar Playwright
npx playwright install
npx playwright test --headed
```

---

## 🐛 Troubleshooting

### **Erro: "Cannot find module"**
```bash
# Solução: Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### **Erro: "Port 3000 is already in use"**
```bash
# Solução 1: Usar outra porta
npm run dev -- --port 3001

# Solução 2: Matar processo na porta 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **Erro: Supabase não conecta**
```bash
# Verificar .env.local
cat .env.local

# Verificar se credenciais estão corretas
# Verificar se projeto Supabase está ativo
# Verificar se RLS está configurado corretamente
```

### **Erro: TypeScript compilation errors**
```bash
# Limpar cache do TypeScript
rm -rf dist/ .vite/
npm run build
```

### **Erro: ESLint warnings excessivos**
```bash
# Ajustar max-warnings em package.json
# Ou desabilitar temporariamente
npm run lint -- --max-warnings 500
```

### **Erro: Playwright browsers not installed**
```bash
# Instalar browsers do Playwright
npx playwright install

# Ou apenas Chromium
npx playwright install chromium
```

---

## 📦 Dependências Adicionais Instaladas Recentemente

### **Dark Mode (v1.0.0)** - 12/12/2025
```bash
npm install lucide-react
# Versão: ^0.468.0
# Uso: Ícones Moon/Sun no ThemeToggle
```

### **Accessibility Testing** - Sprint 6
```bash
npm install @axe-core/playwright --save-dev
# Versão: ^4.10.2
# Uso: Testes automatizados de acessibilidade
```

---

## 🔄 Sincronização com Repositório

### **Configurar Git**
```bash
# Configurar nome e email
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Verificar configuração
git config --list
```

### **Primeira Sincronização**
```bash
# Verificar status
git status

# Pull das últimas mudanças
git pull origin main

# Criar branch de trabalho (opcional)
git checkout -b feature/minha-feature
```

### **Commit & Push**
```bash
# Adicionar arquivos
git add .

# Commit
git commit -m "feat: descrição das mudanças"

# Push
git push origin main

# Ou push da branch
git push origin feature/minha-feature
```

---

## 📊 Features Implementadas (Checklist)

### ✅ **Finalizadas**
- [x] Design System v3.17.0 (85% completo)
- [x] E2E Testing Suite (4 arquivos, 50+ testes)
- [x] Performance Optimization (code splitting, terser)
- [x] Dark Mode v1.0.0 (WCAG AAA compliant)
- [x] Loading Skeletons (GPU-accelerated)
- [x] Command Palette (Ctrl+K)
- [x] Keyboard Shortcuts (15+ atalhos)
- [x] i18n System (PT-BR/EN/ES)
- [x] Workspace Multi-tenancy
- [x] Authentication (Supabase)
- [x] Offline Mode (IndexedDB + Dexie)
- [x] PWA Support

### 🚧 **Em Progresso**
- [ ] Custom Categories System
- [ ] AI Insights Advanced
- [ ] Fix E2E tests (53% → 90%+ pass rate)

### 📋 **Planejadas**
- [ ] Storybook Documentation
- [ ] Video Tutorials
- [ ] Migration Guide
- [ ] Component Library

---

## 🔗 Links Úteis

### **Documentação do Projeto**
- [CHANGELOG Principal](../changelogs/CHANGELOG.md)
- [Dark Mode Guide](../features/DARK_MODE_GUIDE.md)
- [Testing Guide](../WORKSPACE_TESTING_GUIDE.md)
- [Database Migrations](../DATABASE_MIGRATIONS_GUIDE.md)
- [Auth System](../guides/AUTH_SYSTEM_COMPLETE.md)

### **Recursos Externos**
- [React 19 Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)

### **Ferramentas de Análise**
- [Bundle Analyzer](https://www.npmjs.com/package/vite-bundle-analyzer)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 📞 Suporte

### **Em caso de problemas:**
1. Verificar este guia primeiro
2. Consultar [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
3. Verificar issues no GitHub
4. Criar nova issue com detalhes do erro

### **Contato**
- **Projeto**: My Financify (Financy Life)
- **Repositório**: https://github.com/atariH2030/My-Financify
- **Autor**: Rickson (DEV)
- **Versão Atual**: v3.16.0

---

## ✅ Checklist Final de Setup

```bash
# Copie e cole este checklist no terminal:

echo "🔍 VERIFICANDO INSTALAÇÃO..."

# 1. Node.js
node --version && echo "✅ Node.js OK" || echo "❌ Node.js FALTANDO"

# 2. Git
git --version && echo "✅ Git OK" || echo "❌ Git FALTANDO"

# 3. Dependências
[ -d "node_modules" ] && echo "✅ node_modules OK" || echo "❌ Executar: npm install"

# 4. Variáveis de ambiente
[ -f ".env.local" ] && echo "✅ .env.local OK" || echo "❌ Criar .env.local"

# 5. Build
npm run build &> /dev/null && echo "✅ Build OK" || echo "❌ Build FALHOU"

# 6. Playwright
npx playwright --version && echo "✅ Playwright OK" || echo "❌ Executar: npx playwright install"

echo "🎉 VERIFICAÇÃO COMPLETA!"
```

---

**Última Atualização**: 12 de dezembro de 2025  
**Próxima Atualização**: Quando houver mudanças significativas de dependências
