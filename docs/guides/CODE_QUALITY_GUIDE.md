# 🔧 Guia de Qualidade de Código

Ferramentas e práticas para manter alta qualidade no projeto.

---

## 🎯 Objetivos

- **0 erros TypeScript** em produção
- **< 100 warnings ESLint** como meta
- **Correções automáticas** sempre que possível
- **CI/CD** validando qualidade automaticamente

---

## 🛠️ Ferramentas Disponíveis

### 1. Análise de Warnings

```bash
npm run analyze:warnings
```

**O que faz:**
- 📊 Agrupa warnings por tipo e arquivo
- 🔝 Mostra top 10 problemas mais comuns
- 💾 Gera relatório em `docs/warnings-analysis.json`
- 💡 Sugere correções automáticas

**Quando usar:**
- Antes de começar correções
- Para entender padrões de problemas
- Em code reviews

### 2. Correção Automática

```bash
npm run fix:specific
```

**O que corrige:**
- ✅ Imports não usados
- ✅ Variáveis não usadas (prefixo `_`)
- ✅ Aspas duplas → simples
- ✅ Expressões booleanas redundantes
- ✅ `console.log` → TODO comments
- ✅ Diretivas eslint-disable não usadas

**Safe:** Não quebra código, apenas adiciona TODOs quando incerto.

### 3. Pipeline Completo

```bash
npm run fix:all
```

**Executa:**
1. `fix:specific` - Correções automáticas
2. `format` - Prettier
3. `lint` - Validação

**Use antes de:** Commits, PRs, releases

---

## 🚀 CI/CD Automático

### GitHub Actions

Arquivo: `.github/workflows/code-quality.yml`

**Executa em:**
- ✅ Todo push na `main`
- ✅ Todo PR para `main`

**O que faz:**
1. Executa análise de warnings
2. Verifica erros TypeScript
3. Roda ESLint
4. Gera relatório no PR
5. Falha apenas se houver erros críticos

**Configuração:**
- ⚠️ Warnings não bloqueiam merge
- ❌ Erros TypeScript bloqueiam
- 💬 Comenta automaticamente em PRs

### Ler Relatórios CI/CD

No PR, você verá:
```markdown
## 🤖 Automated Code Quality Report

### 📊 Summary
- Total Warnings: 74

### 🔝 Top 5 Issues
- no-await-in-loop: 47x
- @typescript-eslint/no-unused-vars: 6x
- renders: 4x

💡 Run `npm run fix:all` to auto-fix common issues.
```

---

## 🪝 Git Hooks

### Pre-commit Hook

Arquivo: `.husky/pre-commit`

**Executa automaticamente antes de cada commit:**
1. Detecta arquivos `.ts` e `.tsx` staged
2. Roda `fix:specific` nos arquivos
3. Valida TypeScript (bloqueia se erro)
4. Roda ESLint (não bloqueia)

**Setup:**
```bash
npm run setup:hooks
```

**Bypass (usar com cautela):**
```bash
git commit --no-verify
```

---

## 📋 Regras de Qualidade

### Obrigatórias (bloqueiam commit)
- ❌ **0 erros TypeScript**
- ❌ **0 erros ESLint críticos**

### Recomendadas (não bloqueiam)
- ⚠️ **< 100 warnings ESLint**
- ⚠️ **< 50 warnings por arquivo**

### Boas Práticas
- ✅ Código formatado (Prettier)
- ✅ Imports organizados
- ✅ Comentários TODO para refatoração
- ✅ Logger ao invés de console.log

---

## 🔄 Workflow Recomendado

### Para Desenvolvimento Diário

```bash
# 1. Antes de começar
git pull
npm run analyze:warnings  # Ver estado atual

# 2. Durante desenvolvimento
npm run dev  # Desenvolver

# 3. Antes de commitar
npm run fix:all  # Auto-fix + lint
git add .
git commit -m "feat: ..."  # Hook roda automaticamente
```

### Para Code Review

```bash
# 1. Antes de abrir PR
npm run analyze:warnings  # Ver problemas
npm run fix:all           # Corrigir o que puder
npm run test:run          # Garantir testes ok

# 2. Após feedback do CI
# Ver comentário automático no PR
# Corrigir problemas críticos apontados
```

### Para Release

```bash
# 1. Validação completa
npm run lint:strict  # 0 warnings permitidos
npm run build        # Build de produção
npm run test:run     # Todos os testes

# 2. Se tudo ok
git tag v3.15.2
git push --tags
```

---

## 📊 Métricas de Qualidade

### Estado Atual (v3.15.1)
- TypeScript Errors: **0** ✅
- ESLint Warnings: **74** ⚠️
- ESLint Errors: **49** ❌

### Metas
- TypeScript Errors: **0** (mantido)
- ESLint Warnings: **< 50** 🎯
- ESLint Errors: **< 20** 🎯

### Progresso
- Redução de warnings: **139 → 74** (-47%)
- Correções automáticas: **65 warnings**

---

## 🐛 Tipos Comuns de Warnings

### 1. `no-await-in-loop` (47x)

**Problema:**
```typescript
for (const item of items) {
  await processItem(item);  // ❌ Sequencial
}
```

**Solução:**
```typescript
await Promise.all(
  items.map(item => processItem(item))  // ✅ Paralelo
);
```

### 2. `@typescript-eslint/no-unused-vars` (6x)

**Problema:**
```typescript
import { useEffect, useState } from 'react';  // useEffect não usado
```

**Solução Automática:**
```typescript
import { useState } from 'react';  // ✅ Removido
```

### 3. `react-hooks/set-state-in-effect` (4x)

**Problema:**
```typescript
useEffect(() => {
  setState(value);  // ❌ Causa re-renders
}, []);
```

**Solução:**
```typescript
// Mover para event handler ou usar callback
const [state] = useState(initialValue);  // ✅
```

---

## 🆘 Troubleshooting

### "Too many warnings"

```bash
# Ver quais são
npm run analyze:warnings

# Corrigir automaticamente
npm run fix:all

# Se persistir, corrigir manualmente top 5 arquivos
```

### "CI failing on TypeScript"

```bash
# Rodar localmente
npx tsc --noEmit

# Corrigir erros mostrados
# Não usar @ts-ignore sem justificativa
```

### "Pre-commit hook falhou"

```bash
# Ver erro específico
# Corrigir problema apontado
# Tentar commit novamente

# Bypass (último recurso)
git commit --no-verify
```

---

## 📚 Recursos

- [ESLint Rules](https://eslint.org/docs/rules/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Prettier Config](https://prettier.io/docs/en/options.html)

---

## 🤝 Contribuindo

Ao contribuir:
1. ✅ Rode `npm run fix:all` antes de commitar
2. ✅ Não ignore warnings sem razão documentada
3. ✅ Adicione tests para código novo
4. ✅ Siga convenções do projeto

---

**Última atualização**: 9 de dezembro de 2025  
**Versão**: v3.15.1
