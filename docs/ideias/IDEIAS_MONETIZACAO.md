# 💰 Estratégias de Monetização

**Status**: Planejamento  
**Objetivo**: Sustentabilidade e crescimento

---

## 🎯 MODELO ATUAL: FREEMIUM

### Free Plan (Gratuito)
**Objetivo**: Aquisição em massa, validação produto

**Inclui**:
- ✅ Transações ilimitadas
- ✅ 3 contas bancárias
- ✅ Relatórios básicos (mês atual)
- ✅ Categorias padrão
- ✅ Exportação PDF
- ✅ Chat IA modo demo
- ✅ PWA mobile web
- ✅ Suporte comunidade (fórum)

**Limitações**:
- ❌ Transações recorrentes (max 5)
- ❌ Metas financeiras (max 2)
- ❌ Exportação Excel/CSV
- ❌ Relatórios avançados
- ❌ Chat IA completo
- ❌ Suporte prioritário
- ❌ Open Banking
- ❌ Multi-moedas

---

### Plus Plan (R$ 9,90/mês ou R$ 99/ano)
**Objetivo**: Usuários engajados, uso regular

**Economia Anual**: R$ 19,80 (16.6% desconto)

**Inclui Tudo do Free +**:
- ✅ 10 contas bancárias
- ✅ Transações recorrentes ilimitadas
- ✅ Metas financeiras ilimitadas
- ✅ Relatórios avançados (12 meses histórico)
- ✅ Exportação Excel/CSV
- ✅ Chat IA completo (Gemini Pro API)
- ✅ Categorias customizadas ilimitadas
- ✅ Suporte prioritário (email 24h)
- ✅ Tags customizáveis
- ✅ Notas e anexos transações
- ✅ Filtros salvos ilimitados
- ✅ Sem anúncios (se houver no free)

**Perfil Ideal**:
- Usa regularmente (3x+ por semana)
- Tem múltiplas contas
- Quer insights IA
- Precisa histórico longo

---

### Premium Plan (R$ 19,90/mês ou R$ 199/ano)
**Objetivo**: Power users, profissionais, MEI

**Economia Anual**: R$ 39,80 (16.6% desconto)

**Inclui Tudo do Plus +**:
- ✅ Contas bancárias ilimitadas
- ✅ Relatórios histórico completo (ilimitado)
- ✅ Análise preditiva (Machine Learning)
- ✅ Open Banking integração (Pluggy)
- ✅ Multi-moedas (150+ moedas)
- ✅ Consolidação família (5 usuários)
- ✅ API REST access (1000 req/mês)
- ✅ White-label (adicional)
- ✅ Consultoria financeira mensal (30min call)
- ✅ Suporte prioritário (chat 2h)
- ✅ Importação extrato bancário ilimitada
- ✅ Investimentos tracking
- ✅ Empréstimos e dívidas avançado
- ✅ Dashboards customizados

**Perfil Ideal**:
- MEI ou pequeno empresário
- Múltiplas fontes renda
- Investidor ativo
- Família compartilhada
- Precisa integrações

---

## 💵 PROJEÇÕES FINANCEIRAS

### Cenário Conservador (Ano 1)

**Premissas**:
- 10.000 usuários free (crescimento orgânico)
- Conversão 10% → Plus (1.000 usuários)
- Conversão 2% → Premium (200 usuários)
- Churn 5%/mês

**Receita Mensal**:
```
Plus: 1.000 × R$ 9,90 = R$ 9.900
Premium: 200 × R$ 19,90 = R$ 3.980
MRR Total: R$ 13.880

Anual Pago (20% escolhem anual):
Plus: 200 × R$ 99 = R$ 19.800 (÷12 = R$ 1.650/mês)
Premium: 40 × R$ 199 = R$ 7.960 (÷12 = R$ 663/mês)

MRR Real: R$ 16.193
ARR: R$ 194.316
```

**Custos Mensais**:
```
Supabase Pro: R$ 150
Vercel Pro: R$ 100
SendGrid: R$ 25
Monitoring (Sentry): R$ 50
Domain + SSL: R$ 20
Pluggy (200 users): R$ 100
Total Custos: R$ 445/mês = R$ 5.340/ano

Lucro Líquido Ano 1: R$ 188.976 (97.2% margem)
```

---

### Cenário Otimista (Ano 2)

**Premissas**:
- 50.000 usuários free (marketing ativo)
- Conversão 12% → Plus (6.000 usuários)
- Conversão 3% → Premium (1.500 usuários)
- Churn 4%/mês (melhor onboarding)

**Receita Mensal**:
```
Plus: 6.000 × R$ 9,90 = R$ 59.400
Premium: 1.500 × R$ 19,90 = R$ 29.850
MRR Total: R$ 89.250

Anual Pago (30% escolhem anual):
Plus: 1.800 × R$ 99 = R$ 178.200 (÷12 = R$ 14.850/mês)
Premium: 450 × R$ 199 = R$ 89.550 (÷12 = R$ 7.462/mês)

MRR Real: R$ 111.562
ARR: R$ 1.338.744
```

**Custos Mensais**:
```
Supabase Scale: R$ 800
Vercel Enterprise: R$ 600
SendGrid Pro: R$ 100
Monitoring: R$ 100
Domain + CDN: R$ 50
Pluggy (1500 users): R$ 750
Marketing: R$ 4.000
Suporte (2 freelancers): R$ 2.500
Total Custos: R$ 8.900/mês = R$ 106.800/ano

Lucro Líquido Ano 2: R$ 1.231.944 (92% margem)
```

---

### Cenário Agressivo (Ano 3)

**Premissas**:
- 100.000 usuários free
- Conversão 15% → Plus (15.000 usuários)
- Conversão 5% → Premium (5.000 usuários)
- Churn 3%/mês (produto maduro)

**ARR**: ~R$ 4.000.000  
**Lucro Líquido**: ~R$ 3.200.000 (80% margem - custos team)

---

## 🎁 ESTRATÉGIAS AUMENTAR CONVERSÃO

### 1. Trial Virtual (Free → Plus)
**Não é trial real, mas "degustação" features premium**

**Implementação**:
```typescript
// Após 7 dias de uso
const unlockPremiumFeature = () => {
  // Desbloquear por 24h:
  // - Chat IA completo (5 perguntas)
  // - Relatório avançado (preview)
  // - Exportação Excel (1x)
  
  showBanner("Experimente Plus por 24h - Grátis!");
};

// Após 24h
const showUpgradePrompt = () => {
  modal("Gostou? Continue com Plus por R$ 9,90/mês");
};
```

**Taxa Conversão Esperada**: +3-5%

---

### 2. Upgrade Prompts Contextuais

**Timing Estratégico**:
```typescript
// Ao atingir limite
const onLimitReached = (feature: string) => {
  if (feature === 'accounts' && accountsCount >= 3) {
    showUpgradePrompt({
      title: "Você atingiu 3 contas (limite Free)",
      feature: "Até 10 contas no Plus",
      cta: "Upgrade por R$ 9,90/mês"
    });
  }
};

// Após usar feature várias vezes
const onFrequentUse = (feature: string, count: number) => {
  if (feature === 'ai-chat-demo' && count >= 5) {
    showUpgradePrompt({
      title: "Você ama o Chat IA!",
      feature: "Insights ilimitados no Plus",
      social_proof: "87% dos usuários Plus usam diariamente"
    });
  }
};
```

**Taxa Conversão Esperada**: +2-4%

---

### 3. Seasonal Promotions

**Black Friday** (Novembro):
```
Plus: R$ 9,90 → R$ 7,90 (20% off)
Premium: R$ 19,90 → R$ 14,90 (25% off)
Anual: 30% off (em vez de 16%)

Duração: 7 dias
Banner: "Black Friday: Economize até 30%"
```

**Ano Novo** (Janeiro):
```
"Comece 2026 organizado"
30 dias Plus grátis (trial real)
```

**Páscoa / Dia dos Pais / Natal**:
Similar, 15-20% off

**Taxa Conversão Esperada**: +5-10% durante promo

---

### 4. Referral Program (Indicação)

```typescript
interface ReferralProgram {
  referrer: {
    reward: "1 mês Plus grátis" | "R$ 10 crédito";
    condition: "Amigo assina Plus ou Premium";
  };
  
  referred: {
    reward: "20% desconto primeiro mês";
  };
}
```

**Viralidade**: K-factor ~1.2 (cada usuário traz 1.2 novos)

**Taxa Conversão Esperada**: +10-15% usuários pagantes

---

### 5. Annual Plan Discount

**Estratégia**: Aumentar desconto anual progressivamente

```
Atual: 16.6% desconto (R$ 99 vs R$ 118.80)
Meta: 25% desconto (R$ 89 vs R$ 118.80)

Benefício:
- Cash flow melhor (receita adiantada)
- Churn menor (commitment 12 meses)
- LTV maior
```

**Taxa Conversão Annual**: 30-40% dos pagantes

---

### 6. Feature Flags Graduais

**Liberar features premium temporariamente**:

```typescript
// Beta features para Free users (feedback)
const betaFeatures = {
  'recurring-transactions': {
    freeLimit: 5,
    unlockDate: '2026-03-01', // 3 meses beta
    plusLimit: Infinity,
  },
  'goals': {
    freeLimit: 2,
    unlockDate: '2026-02-01',
    plusLimit: Infinity,
  }
};
```

**Objetivo**: Hooks usuários em features, depois paywall

---

### 7. Gamification & Achievements

**Unlock Temporário por Conquistas**:

```
🏆 "Mestre do Orçamento"
  - Registre 30 transações em 30 dias
  - Recompensa: 7 dias Plus grátis

🎯 "Poupador Comprometido"
  - Alcance primeira meta
  - Recompensa: 1 relatório avançado grátis

💪 "Usuário VIP"
  - Use app 90 dias consecutivos
  - Recompensa: 50% desconto Plus (1 mês)
```

**Taxa Conversão Esperada**: +2-3%

---

## 💳 MÉTODOS PAGAMENTO

### Stripe (Principal)
- Cartão crédito/débito
- Boleto (brasileiro)
- PIX (brasileiro)
- Google Pay / Apple Pay

### PayPal (Alternativo)
- Popular internacional
- PayPal Credit

### PagSeguro (Alternativo BR)
- Boleto
- PIX
- Cartão

---

## 📊 MÉTRICAS ACOMPANHAR

### Aquisição
- CAC (Customer Acquisition Cost)
- Sign-ups/dia
- Sources tráfego
- Conversion funnel (visit → signup)

### Ativação
- Time to first transaction
- Onboarding completion rate
- Feature adoption rate

### Receita
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- ARPU (Average Revenue Per User)
- Expansion MRR (upgrades)

### Retenção
- Churn rate mensal
- Retention cohorts (D1, D7, D30, D90)
- Net Revenue Retention (NRR)

### Conversão
- Free → Plus: meta 10-15%
- Free → Premium: meta 2-5%
- Plus → Premium: meta 10-20%

### Economia
- LTV (Lifetime Value)
- LTV/CAC ratio (meta > 3)
- Payback period (meta < 6 meses)

---

## 🎯 METAS ANO 1

**Mês 3** (Fim Beta):
- 500 usuários free
- 50 Plus (10% conversão)
- 10 Premium (2% conversão)
- MRR: R$ 695

**Mês 6** (Product-Market Fit):
- 2.000 usuários free
- 200 Plus
- 40 Premium
- MRR: R$ 2.776

**Mês 12** (Ano 1 Completo):
- 10.000 usuários free
- 1.000 Plus
- 200 Premium
- MRR: R$ 16.193
- ARR: R$ 194.316

---

## 🚀 EXPANSÃO RECEITA (Futuro)

### Plano Enterprise (B2B)
**R$ 199/mês + R$ 9,90/usuário extra**

**Para**:
- Empresas 10+ funcionários
- White-label
- API ilimitada
- Suporte dedicado
- SLA garantido
- Onboarding personalizado

---

### Marketplace Add-ons

**Templates Premium** (R$ 19-49 únicos):
- Dashboards especializados
- Relatórios customizados
- Categorias específicas (freelancer, e-commerce)

**Consultoria Financeira** (R$ 149/sessão):
- 1h com especialista
- Análise personalizada
- Plano ação

**Cursos** (R$ 97-297):
- "Organize Suas Finanças em 30 Dias"
- "Investimentos para Iniciantes"
- Certificado

---

### Affiliate Program (20% comissão)

```
Influencers ganham:
Plus: R$ 1,98/mês por referral
Premium: R$ 3,98/mês por referral

Vitalício (enquanto usuário permanecer)

Top Affiliate: R$ 5.000+/mês possível
```

---

### Patrocínios & Sponsored Content

**Plataforma Educacional**:
- Bancos patrocinarem conteúdo
- Fintechs ads (não intrusivos)
- Cursos afiliados

**Receita Estimada**: R$ 5.000-20.000/mês (Ano 2+)

---

## ⚠️ RISCOS MONETIZAÇÃO

| Risco | Mitigação |
|-------|-----------|
| Churn alto | Onboarding excelente, suporte rápido |
| Conversão baixa | A/B testing pricing, trials, prompts |
| Competição preço | Diferenciação features, UX superior |
| Pirataria/sharing contas | Device limits, IP tracking |
| Fraude pagamento | Stripe Radar, validações |

---

## 📈 PRICING EXPERIMENTS (A/B Testing)

### Teste 1: Preço Plus
- Variante A: R$ 9,90/mês
- Variante B: R$ 12,90/mês
- Métrica: Conversion rate × Revenue

### Teste 2: Annual Discount
- Variante A: 16% desconto
- Variante B: 25% desconto
- Métrica: % escolhem anual

### Teste 3: Trial Real
- Variante A: Sem trial
- Variante B: 14 dias Plus grátis
- Métrica: Trial → Paid conversion

---

**Revisão Pricing**: Trimestral  
**Owner**: DEV - Rickson  
**Última Atualização**: 8 de dezembro de 2025
