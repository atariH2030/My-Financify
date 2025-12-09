# ⚡ ROADMAP - Fase Crescimento (Mês 1-3)

**Período**: Janeiro - Março 2026  
**Objetivo**: Otimizar produto e crescer base de usuários  
**Status**: ⭐ **Importante**

---

## 🎯 MÊS 1: Performance & Polish

### 1. Performance Optimization
**Prioridade**: P1 (Alto)  
**Tempo Estimado**: 2-3 dias  
**Meta**: Bundle 649 KB → 150 KB

#### Code Splitting Agressivo
```typescript
// src/main.tsx - Lazy load TUDO
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Reports = lazy(() => import('./pages/Reports'));
const ReportsAdvanced = lazy(() => import('./pages/ReportsAdvanced'));
const Settings = lazy(() => import('./pages/Settings'));
const Goals = lazy(() => import('./pages/Goals'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Profile = lazy(() => import('./pages/Profile'));
const AIAnalytics = lazy(() => import('./pages/AIAnalytics'));

// Suspense com skeleton
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    {/* ... */}
  </Routes>
</Suspense>
```

#### Dynamic Imports para Libs Pesadas
```typescript
// Carregar Chart.js sob demanda
const loadChartJs = async () => {
  const Chart = await import('chart.js');
  return Chart;
};

// Recharts apenas quando necessário
const loadRecharts = async () => {
  const { LineChart, BarChart } = await import('recharts');
  return { LineChart, BarChart };
};

// PDF export apenas ao clicar
const exportPDF = async () => {
  const html2canvas = await import('html2canvas');
  const jsPDF = await import('jspdf');
  // ... lógica export
};
```

#### Route-Based Code Splitting
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['chart.js', 'recharts'],
          'vendor-utils': ['date-fns', 'zod'],
          'vendor-ui': ['framer-motion'],
        }
      }
    }
  }
});
```

**Métricas Alvo**:
- ✅ Bundle inicial: < 150 KB gzipped
- ✅ LCP (Largest Contentful Paint): < 2s mobile
- ✅ FCP (First Contentful Paint): < 1s desktop
- ✅ TTI (Time to Interactive): < 3s
- ✅ Lighthouse Performance: > 95

---

### 2. Traduções Completas
**Prioridade**: P1 (Alto)  
**Tempo Estimado**: 4-6 horas  
**Status Atual**: 12/67 (18%)

#### Priorização
```bash
# 1. Executar detector
npm run detect-untranslated

# 2. Focar em alta visibilidade
Priority 1 (16 strings): Dashboard.tsx
Priority 2 (11 strings): ReportsAdvanced.tsx
Priority 3 (4 strings cada): DashboardCustomizer, CommandPalette, ThemeCustomizer
```

#### Automatização
```typescript
// scripts/translate-batch.ts
import fs from 'fs';
import path from 'path';

const pendingTranslations = {
  'en-US': {
    'Total Balance': 'Saldo Total',
    'Add Transaction': 'Adicionar Transação',
    // ... 55 restantes
  }
};

// Aplicar em batch com validação
```

**Meta**: 100% traduzido até fim do Mês 1

---

### 3. Virtual Scrolling
**Prioridade**: P2 (Médio)  
**Tempo Estimado**: 1 dia  
**Objetivo**: Listas > 100 itens performáticas

#### Implementação
```bash
npm install react-window react-window-infinite-loader
```

```typescript
// src/components/transactions/TransactionList.tsx
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

export const TransactionList = ({ transactions }: Props) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <TransactionCard transaction={transactions[index]} />
    </div>
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          itemCount={transactions.length}
          itemSize={80} // altura cada row
          width={width}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
};
```

**Benefícios**:
- Renderiza apenas itens visíveis
- Scroll suave com 1000+ transações
- Reduz memória consumida

---

### 4. Image Optimization
**Prioridade**: P2 (Médio)  
**Tempo Estimado**: 2 horas

#### Converter para WebP
```bash
# Converter assets existentes
npm install --save-dev vite-plugin-imagemin

# vite.config.ts
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    imagemin({
      webp: { quality: 75 }
    })
  ]
});
```

#### Lazy Load Images
```typescript
// src/components/common/LazyImage.tsx
export const LazyImage = ({ src, alt, ...props }: ImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};
```

---

## 🎨 MÊS 2: Polish & UX

### 5. Onboarding Wizard
**Prioridade**: P1 (Alto)  
**Tempo Estimado**: 3-4 dias  
**Referência**: Fase 2 já planejada

#### Fluxo (5 passos)
```
1. Welcome Screen
   - "Bem-vindo ao My-Financify"
   - Ilustração animada
   - CTA "Começar"

2. Setup Primeira Conta
   - Nome da conta
   - Saldo inicial
   - Tipo (corrente, poupança, investimento)

3. Categorias Personalizadas
   - Sugestões padrão
   - Adicionar customizadas
   - Cores e ícones

4. Meta Financeira Inicial (Opcional)
   - Criar primeira meta
   - Exemplo: "Economizar R$ 5.000"
   - Prazo sugerido

5. Tour Guiado
   - Highlight de features principais
   - Tooltips interativos
   - Atalhos de teclado
```

#### Implementação
```typescript
// src/components/onboarding/OnboardingWizard.tsx
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
  validation?: (data: any) => boolean;
}

const steps: OnboardingStep[] = [
  { id: 'welcome', title: 'Bem-vindo', component: WelcomeStep },
  { id: 'account', title: 'Primeira Conta', component: AccountSetupStep },
  { id: 'categories', title: 'Categorias', component: CategoriesStep },
  { id: 'goal', title: 'Meta', component: GoalStep, optional: true },
  { id: 'tour', title: 'Tour', component: TourStep },
];
```

**Gamification**:
- 🏆 Badge "Primeiros Passos"
- 🎯 Badge "Primeira Meta Criada"
- 💰 Badge "10 Transações Registradas"

---

### 6. PWA Enhancements
**Prioridade**: P2 (Médio)  
**Tempo Estimado**: 2 dias

#### Push Notifications
```typescript
// src/services/notification-push.service.ts
export class PushNotificationService {
  async requestPermission(): Promise<boolean> {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async scheduleRecurring(transaction: RecurringTransaction): Promise<void> {
    // Notificar 1 dia antes de transação recorrente
    const notification = new Notification('Transação Recorrente', {
      body: `${transaction.description}: R$ ${transaction.amount}`,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: `recurring-${transaction.id}`,
    });
  }
}
```

#### Offline Mode Robusto
```typescript
// src/services/sync-queue.service.ts
export class SyncQueueService {
  private queue: PendingOperation[] = [];

  async queueOperation(operation: Operation): Promise<void> {
    this.queue.push(operation);
    await this.saveQueue();
    
    // Tentar sync quando online
    if (navigator.onLine) {
      await this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    while (this.queue.length > 0 && navigator.onLine) {
      const op = this.queue[0];
      try {
        await this.executeOperation(op);
        this.queue.shift();
      } catch (error) {
        // Retry com exponential backoff
        await this.scheduleRetry(op);
        break;
      }
    }
  }
}
```

#### Install Prompt Customizado
```typescript
// src/components/common/InstallPrompt.tsx
export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      // Analytics
      gtag('event', 'pwa_install', { method: 'custom_prompt' });
    }
  };

  return (
    <Banner>
      <Text>Instale o app para acesso offline!</Text>
      <Button onClick={handleInstall}>Instalar</Button>
    </Banner>
  );
};
```

#### App Shortcuts (Android)
```json
// public/manifest.json
{
  "shortcuts": [
    {
      "name": "Nova Transação",
      "short_name": "Transação",
      "description": "Adicionar nova transação rapidamente",
      "url": "/transactions/new",
      "icons": [{ "src": "/icons/transaction-96.png", "sizes": "96x96" }]
    },
    {
      "name": "Relatórios",
      "short_name": "Relatórios",
      "url": "/reports",
      "icons": [{ "src": "/icons/reports-96.png", "sizes": "96x96" }]
    }
  ]
}
```

---

### 7. Accessibility Audit Final
**Prioridade**: P2 (Médio)  
**Tempo Estimado**: 1 dia

#### Screen Reader Testing
```bash
# Instalar NVDA (Windows)
# Ou VoiceOver (Mac)

# Testar fluxos críticos:
- Login
- Criar transação
- Navegar relatórios
- Alterar configurações
```

#### Keyboard Navigation Completa
```typescript
// Verificar todas páginas:
- Tab navigation lógica
- Enter/Space ativam ações
- Esc fecha modais
- Arrow keys em listas
- / para busca rápida
```

#### ARIA Labels Review
```typescript
// Audit automático
npm install --save-dev axe-core @axe-core/react

// src/main.tsx (apenas dev)
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

**Checklist Final**:
- [ ] WCAG 2.1 AAA mantido
- [ ] Screen reader friendly
- [ ] Keyboard navigation 100%
- [ ] Color contrast > 7:1
- [ ] Focus indicators visíveis
- [ ] Error messages claras

---

## 📈 MÊS 3: Crescimento

### 8. SEO & Content Marketing
**Prioridade**: P1 (Alto)  
**Tempo Estimado**: Contínuo

#### Blog Posts Semanais
```
Semana 1: "Como organizar suas finanças em 2026"
Semana 2: "5 erros comuns ao controlar gastos"
Semana 3: "Orçamento familiar: guia completo"
Semana 4: "Investir vs Poupar: qual a diferença?"
```

**SEO On-Page**:
- Titles otimizados (< 60 chars)
- Meta descriptions (< 160 chars)
- Headers hierárquicos (H1 → H6)
- Alt text em imagens
- Schema markup (Organization, SoftwareApplication)

#### Guest Posts
```
Parceiros Potenciais:
- Blog do Nubank
- Vérios (Canal do Primo Rico)
- InfoMoney
- Seu Crédito Digital
- Me Poupe! (Nathalia Arcuri)
```

#### YouTube Channel
```
Conteúdo Sugerido:
- Tutorial completo (15min)
- Dicas rápidas (60s shorts)
- Comparação com concorrentes
- Behind the scenes (desenvolvimento)
- User success stories
```

---

### 9. Parcerias & Integrações
**Prioridade**: P2 (Médio)  
**Tempo Estimado**: 2-3 semanas cada

#### Open Banking Brasil
```bash
# Opção 1: Pluggy (mais fácil)
npm install pluggy-sdk

# Opção 2: Belvo (mais completo)
npm install belvo-js
```

**Benefícios**:
- Sincronização automática transações
- Saldo atualizado em tempo real
- Suporte 100+ instituições BR
- Segurança regulada Banco Central

**Implementação**:
```typescript
// src/services/open-banking.service.ts
import { PluggyClient } from 'pluggy-sdk';

export class OpenBankingService {
  private client: PluggyClient;

  async connectBank(bankId: string): Promise<void> {
    // Criar item (conexão)
    const item = await this.client.createItem({
      connectorId: bankId,
      credentials: { /* user input */ }
    });

    // Buscar contas
    const accounts = await this.client.fetchAccounts(item.id);
    
    // Sincronizar transações
    const transactions = await this.client.fetchTransactions(item.id);
  }
}
```

#### Integração Bancos Digitais
- Nubank API (se disponível)
- Inter Banking API
- C6 Bank API
- Mercado Pago SDK
- PicPay API

#### APIs Contabilidade
- Conta Azul (MEI/Empresas)
- Omie (ERP)
- Bling (e-commerce)

---

### 10. Email Marketing
**Prioridade**: P2 (Médio)  
**Tempo Estimado**: 1 semana setup

#### Drip Campaign (14 dias)
```
Dia 1: Boas-vindas + Setup inicial
Dia 2: Como adicionar primeira transação
Dia 4: Dica: Use categorias personalizadas
Dia 7: Relatórios mensais (feature highlight)
Dia 10: Metas financeiras (case study)
Dia 14: Feedback request + upgrade prompt
```

**Plataforma Sugerida**:
- Mailchimp (free até 500 contatos)
- SendGrid (free 100 emails/dia)
- Resend (dev-friendly, bom pricing)

---

## 🎯 METAS MÊS 1-3

### Quantitativas
- [ ] 500 usuários cadastrados
- [ ] 250 usuários ativos semanais
- [ ] 5.000 transações registradas
- [ ] 100 feedbacks coletados
- [ ] Bundle < 150 KB
- [ ] Lighthouse > 95

### Qualitativas
- [ ] Product-market fit validado
- [ ] Roadmap trimestre definido
- [ ] Parcerias iniciadas
- [ ] Content marketing ativo
- [ ] SEO ranqueando top 10 (palavras-chave)

---

**Próximo**: [ROADMAP_FASE_ESCALA.md](./ROADMAP_FASE_ESCALA.md)
