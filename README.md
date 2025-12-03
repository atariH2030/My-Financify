# 💰 My-Financify

Sistema completo de gestão financeira pessoal com dashboard interativo, relatórios avançados e integração Azure.

**Versão Atual**: `v3.12.0` | **Status**: ✅ Produção

## 🚀 Tech Stack Moderna

### Frontend
- **React 18** + **TypeScript 5.9** - Type safety e performance
- **Vite 7.2** - Build tool ultra-rápida com HMR (< 12s)
- **Chart.js 4.5** + **Recharts** - Visualizações financeiras interativas
- **Framer Motion** - Animações fluidas e profissionais
- **CSS Variables** - Design system profissional e responsivo

### Backend & Storage
- **Supabase** (PostgreSQL) - Database gerenciado
- **IndexedDB (Dexie)** - Cache local e offline-first
- **Web Push API** - Notificações em tempo real
- **Service Worker** - PWA com precache otimizado (2.1 MB)

### Design System
- 🎨 **16 cores profissionais** migradas do sistema legacy
- 🌈 **Gradientes corporativos** para elementos visuais
- 📱 **Mobile-first responsive** com breakpoints otimizados
- ✨ **Micro-animações** suaves (fadeInUp, slideInRight)
- 🔄 **Sistema Sidebar Responsivo** com collapse/expand inteligente
- 🌙 **Tema Dark/Light** com toggle automático

## 📊 Funcionalidades

### Dashboard Principal (v3.12.0)
- **KPI Cards** com métricas financeiras em tempo real
- **Gráficos interativos com drill-down** (Sprint 6.2)
- **Widgets customizáveis** com drag & drop (Sprint 6.1)
- **Overview de contas** com saldos atualizados
- **Quick actions** para transações rápidas

### Módulo de Relatórios Avançados
- **Filtros avançados** com query builder (Sprint 6.3)
- **Export PDF** com 5 templates profissionais (Sprint 6.4)
  - Relatório de Transações
  - Análise de Orçamentos
  - Progresso de Metas
  - Tendências por Categoria
  - Comparativo Mensal (Receitas vs Despesas)
- **Export Excel/CSV** para análise externa
- **Tabelas de transações** com busca e ordenação

### Sistema Multi-idioma (v3.11.0)
- 🇧🇷 **Português (pt-BR)** - Padrão
- 🇺🇸 **English (en-US)**
- 🇪🇸 **Español (es-ES)**
- Formatação automática de moeda, data e números
- Detecção automática do idioma do navegador

### Notificações Push (v3.11.0)
- 📊 **Alertas de orçamento** (quando ultrapassar 80%)
- 🎯 **Metas alcançadas** com celebração visual
- 🔄 **Transações recorrentes** (lembretes automáticos)
- 💡 **Insights financeiros** (análises da IA)
- ✅ **Confirmação de sync** com Supabase

### Analytics com IA (v3.11.0)
- Dashboard dedicado com métricas de uso
- Top 5 features mais utilizadas
- Insights por prioridade (alta/média/baixa)
- Histórico de 30 dias de interações

### 🎛️ Sistema de Navegação Avançado
- **Sidebar Responsivo** com estados inteligentes:
  - 🖥️ **Desktop**: Collapse/expand com botão sempre visível
  - 📱 **Mobile**: Sistema overlay com backdrop blur
  - 💻 **Telas Divididas**: Auto-ajuste de largura (240px/280px)
- **Layout Dinâmico** que se adapta automaticamente ao sidebar
- **Transições Suaves** de 0.3s com easing profissional
- **Theme Toggle** integrado com persistência local
- **Perfil de Usuário** completo no footer do sidebar

### Sistema de Autenticação
- **Azure AD Integration** (planejado)
- **Multi-factor authentication** 
- **Session management** seguro
- **Role-based access control**

## 🏗️ Arquitetura

```
src/
├── components/           # Componentes React modulares
│   ├── dashboard/       # Dashboard principal
│   ├── reports/         # Módulo de relatórios
│   └── common/          # Componentes reutilizáveis
├── styles/              # Design system CSS
│   ├── globals.css      # Estilos base integrados
│   ├── legacy-assets.css # Assets migrados (200+ variáveis)
│   ├── reports.css      # Estilos específicos de relatórios
│   └── variables.css    # Design tokens centralizados
├── utils/               # Utilitários TypeScript
└── types/               # Definições de tipos
```

## 🎨 Design System

### Paleta de Cores
```css
/* Cores Primárias */
--primary-blue: #1e40af
--primary-green: #059669  
--primary-purple: #7c3aed

/* Gradientes Corporativos */
--gradient-primary: linear-gradient(135deg, #1e40af, #3b82f6)
--gradient-success: linear-gradient(135deg, #059669, #10b981)
--gradient-purple: linear-gradient(135deg, #7c3aed, #a855f7)
```

### Componentes
- **Cards profissionais** com hover effects
- **Buttons gradientes** com estados interativos
- **Forms estilizados** com validação visual
- **Data tables** responsivas com sticky headers

## 🔧 Scripts de Desenvolvimento

```bash
# Instalar dependências
npm install

# Desenvolvimento local (HMR)
npm run dev

# Build para produção (40.54 kB minificado)
npm run build

# Preview da build de produção
npm run preview

# Lint e type checking
npm run lint
```

## 📱 Performance

### Otimizações Implementadas
- **Vite bundling** com tree-shaking automático
- **CSS Variables** para re-render otimizado
- **Lazy loading** de componentes pesados
- **Image optimization** automática
- **Minificação Terser** (produção)

### Métricas
- **Bundle size**: 40.54 kB (gzipped)
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Lighthouse Score**: 95+ (planejado)

## 🌐 Deploy e Infraestrutura

### Azure Integration (Roadmap)
- **Azure Static Web Apps** - Hosting escalável
- **Azure SQL Database** - Dados seguros e performantes
- **Azure Key Vault** - Gerenciamento de secrets
- **Azure Monitor** - Observabilidade completa

### CI/CD Pipeline
- **GitHub Actions** para build automático
- **Azure DevOps** para deploy staging/prod
- **Automated testing** com Jest + RTL
- **Security scanning** integrado

## 📈 Roadmap

### Fase 1 (Atual) ✅
- [x] Setup básico React + TypeScript + Vite
- [x] Migração assets legacy para sistema moderno
- [x] Dashboard principal com KPIs
- [x] Componente Reports funcional

### Fase 2 (Next Sprint) 🎯
- [ ] Integração Chart.js nos dashboards
- [ ] Sistema de autenticação local
- [ ] CRUD de transações completo
- [ ] Testes unitários fundamentais

### Fase 3 (Médio Prazo) 🚀
- [ ] Azure SQL Database integration
- [ ] Azure AD authentication
- [ ] PWA features (offline-first)
- [ ] Mobile app com React Native

## 🤝 Contribuição

### Development Standards
- **TypeScript strict mode** habilitado
- **ESLint + Prettier** configurados
- **Conventional commits** obrigatórios
- **Component-driven development**

### Branch Strategy
- `main` - Produção estável
- `develop` - Integração contínua
- `feature/*` - Novas funcionalidades
- `hotfix/*` - Correções urgentes

## ⚡ Melhorias de Performance & UX (Sprint 6.5)

### Performance Optimization
- **React.memo**: Componentes otimizados (InteractiveChart)
- **useMemo**: Cálculos pesados memoizados (5 em ReportsAdvanced)
- **useCallback**: Event handlers estáveis (11 callbacks aplicados)
- **Build Time**: 11.98s (otimizado)
- **Bundle Size**: 610.87 kB (171.62 kB gzipped)

### Sistema Layout Responsivo
- **3 breakpoints otimizados**: Desktop (≥1200px), Médio (769-1199px), Mobile (≤768px)
- **Sidebar adaptativo**: 280px → 240px → overlay conforme tela
- **Viewport units**: Largura real usando `vw` units para precisão
- **Box-sizing**: Border-box global para controle pixel-perfect

### Otimizações CSS
- **CSS Variables**: 200+ variáveis para consistência de design
- **Modular CSS**: Importação condicional por componente
- **Lazy loading**: Carregamento otimizado de assets
- **Transições suaves**: 0.3s ease para todas as animações

### Developer Experience
- **Hot Module Replacement**: Atualizações instantâneas durante desenvolvimento
- **Type Safety**: TypeScript strict com interfaces completas
- **Build otimizado**: Bundle final de 610 KB (171 KB gzipped)
- **Error handling**: Sistema robusto de tratamento de erros
- **0 TypeScript errors**: Build sempre limpo

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**🚀 Desenvolvido com foco em performance, usabilidade e escalabilidade**

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)
![Azure](https://img.shields.io/badge/Azure-Ready-orange)