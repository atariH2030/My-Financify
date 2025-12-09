# 🤝 Guia de Contribuição - Financy Life

Obrigado por contribuir! Este guia garante qualidade e consistência no projeto.

---

## 🚀 Setup Inicial

### Para Novos Desenvolvedores

```bash
# 1. Clone o repositório
git clone https://github.com/atariH2030/My-Financify.git
cd My-Financify

# 2. Setup automático (recomendado)
npm run setup:dev

# 3. Ou setup manual
npm install
npm run setup:hooks
cp .env.example .env  # Configure suas variáveis
```

### Requisitos

- **Node.js**: ≥ 18.0.0 (recomendado: 22.15.1)
- **npm**: ≥ 8.0.0
- **Git**: Configurado com hooks habilitados

---

## 📐 Padrões de Código

### TypeScript

```typescript
// ✅ BOM
interface UserData {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<UserData> {
  return api.get(`/users/${id}`);
}

// ❌ EVITAR
function getUser(id: any): any {  // Não use 'any'
  return api.get(`/users/${id}`);
}
```

### React Components

```typescript
// ✅ BOM - Componente funcional com tipos
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// ❌ EVITAR - Sem tipos
export function Button({ label, onClick, disabled }) {
  // ...
}
```

### Imports

```typescript
// ✅ BOM - Organizados e específicos
import { useState, useEffect } from 'react';
import { Logger } from '@/services/logger.service';
import { formatCurrency } from '@/utils/format';
import type { Transaction } from '@/types';

// ❌ EVITAR - Imports não usados ou duplicados
import { useState, useEffect, useMemo } from 'react';  // useMemo não usado
import * as React from 'react';  // Redundante
```

### Logging

```typescript
// ✅ BOM - Use Logger.service
import { Logger } from '@/services/logger.service';

try {
  const data = await fetchData();
  Logger.info('Data fetched successfully', { count: data.length });
} catch (error) {
  Logger.error('Failed to fetch data', error);
}

// ❌ EVITAR - console.log direto
console.log('Data:', data);  // Removido em produção
```

### Tratamento de Erros

```typescript
// ✅ BOM - Try/catch + Logger em backend/services
async function saveTransaction(data: TransactionData) {
  try {
    const result = await db.insert(data);
    Logger.info('Transaction saved', { id: result.id });
    return result;
  } catch (error) {
    Logger.error('Failed to save transaction', error);
    throw new Error('Unable to save transaction');
  }
}

// ❌ EVITAR - Sem tratamento
async function saveTransaction(data: TransactionData) {
  const result = await db.insert(data);  // Pode falhar silenciosamente
  return result;
}
```

---

## 🔄 Workflow de Desenvolvimento

### 1. Criar Branch

```bash
# Feature
git checkout -b feat/nome-da-feature

# Bugfix
git checkout -b fix/descricao-do-bug

# Refactor
git checkout -b refactor/nome-do-refactor
```

### 2. Desenvolver

```bash
# Rodar servidor de desenvolvimento
npm run dev

# Em outro terminal (opcional)
npm run test:watch  # Testes em watch mode
```

### 3. Antes de Commitar

```bash
# Análise e correção automática
npm run fix:all

# Validação manual
npm run lint        # Ver todos os warnings
npm run type-check  # Verificar TypeScript
npm run test:run    # Rodar todos os testes
```

### 4. Commitar

```bash
git add .
git commit -m "feat: adiciona funcionalidade X"

# O pre-commit hook vai rodar automaticamente:
# - Auto-fix de warnings
# - Validação TypeScript
# - ESLint
```

### 5. Push e PR

```bash
git push origin feat/nome-da-feature

# No GitHub:
# - Abrir Pull Request para 'main'
# - Aguardar CI/CD (GitHub Actions)
# - Revisar comentários automáticos
# - Solicitar code review
```

---

## 💬 Mensagens de Commit

### Formato

```
<tipo>: <descrição curta>

<detalhes opcionais>
<breaking changes se houver>
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `refactor`: Refatoração de código
- `style`: Mudanças de estilo/formatação
- `docs`: Documentação
- `test`: Adicionar/modificar testes
- `chore`: Tarefas de manutenção
- `perf`: Melhorias de performance

### Exemplos

```bash
# Feature
git commit -m "feat: adiciona filtro de transações por categoria"

# Bugfix
git commit -m "fix: corrige cálculo de saldo mensal"

# Refactor
git commit -m "refactor: centraliza lógica de formatação de moeda"

# Com detalhes
git commit -m "feat: adiciona Command Palette

- Atalho: Ctrl+K
- Busca por comandos e páginas
- Navegação rápida
- Histórico de comandos recentes"
```

---

## ✅ Checklist de PR

Antes de abrir Pull Request:

### Código
- [ ] Código segue padrões TypeScript do projeto
- [ ] Sem erros TypeScript (`npm run type-check`)
- [ ] Warnings ESLint < 50 (ou justificados)
- [ ] Código formatado (`npm run format`)
- [ ] Imports organizados e sem não-usados

### Funcionalidade
- [ ] Feature funciona conforme esperado
- [ ] Testado em diferentes cenários
- [ ] Não quebra funcionalidades existentes
- [ ] Responsivo (mobile e desktop)

### Testes
- [ ] Testes unitários adicionados (se aplicável)
- [ ] Todos os testes passam (`npm run test:run`)
- [ ] Cobertura mantida ou aumentada

### Documentação
- [ ] README atualizado (se necessário)
- [ ] Comentários em código complexo
- [ ] CHANGELOG.md atualizado (features grandes)
- [ ] Tipos TypeScript documentados

### Performance
- [ ] Sem loops desnecessários
- [ ] Queries otimizadas
- [ ] Assets otimizados
- [ ] Lazy loading quando apropriado

---

## 🧪 Testes

### Escrever Testes

```typescript
// src/utils/__tests__/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../format';

describe('formatCurrency', () => {
  it('formata valor positivo corretamente', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
  });

  it('formata valor negativo corretamente', () => {
    expect(formatCurrency(-1234.56)).toBe('-R$ 1.234,56');
  });

  it('lida com zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00');
  });
});
```

### Rodar Testes

```bash
# Todos os testes
npm run test:run

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage

# Teste específico
npm run test:run format.test.ts
```

---

## 📊 Padrões de Qualidade

### Limites Aceitáveis

| Métrica | Limite | Ação se Ultrapassar |
|---------|--------|---------------------|
| TypeScript Errors | 0 | ❌ PR bloqueado |
| ESLint Errors | < 10 | ⚠️ Revisar urgente |
| ESLint Warnings | < 100 | ⚠️ Corrigir se possível |
| Test Coverage | > 70% | 💡 Adicionar testes |

### CI/CD

GitHub Actions valida automaticamente:
- ✅ TypeScript compilation
- ✅ ESLint validation
- ✅ Warning analysis
- ✅ Comentários em PR com relatório

**PRs só podem ser mergeados se:**
- 0 erros TypeScript
- CI passou sem falhas críticas
- Code review aprovado

---

## 🏗️ Estrutura de Arquivos

### Componentes

```
src/
└── components/
    └── TransactionList/
        ├── TransactionList.tsx       # Componente principal
        ├── TransactionList.test.tsx  # Testes
        ├── TransactionItem.tsx       # Sub-componente
        └── index.ts                  # Export barrel
```

### Services

```
src/
└── services/
    ├── transaction.service.ts        # Lógica de negócios
    ├── transaction.service.test.ts   # Testes
    └── logger.service.ts             # Logging centralizado
```

### Estilos

```
src/
└── styles/
    ├── globals.css                   # Estilos globais
    ├── variables.css                 # Variáveis CSS
    └── components/
        └── sidebar.css               # Estilos de componente
```

---

## 🐛 Debugging

### VS Code

Configuração em `.vscode/launch.json`:
```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Debug App",
  "url": "http://localhost:3000",
  "webRoot": "${workspaceFolder}/src"
}
```

### Browser DevTools

- React DevTools: Inspecionar componentes
- Network Tab: Ver requisições
- Console: Ver logs (Logger.service)
- Performance: Profiling

---

## 📚 Recursos

### Documentação do Projeto
- [Code Quality Guide](docs/guides/CODE_QUALITY_GUIDE.md)
- [Session History](docs/HISTORICO_SESSAO_DEZ_2025.md)
- [Copilot Instructions](.github/copilot-instructions.md)

### Tecnologias
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest](https://vitest.dev)

---

## ❓ FAQ

### Como corrigir muitos warnings?

```bash
npm run analyze:warnings  # Ver padrões
npm run fix:all          # Auto-fix
```

### Pre-commit hook está falhando?

```bash
# Ver erro específico
# Corrigir problema
# Tentar novamente

# Bypass (último recurso)
git commit --no-verify
```

### CI/CD falhou no meu PR?

1. Ver comentário automático no PR
2. Corrigir erros críticos apontados
3. `npm run fix:all` localmente
4. Push novamente

### Como adicionar nova dependência?

```bash
# Instalar
npm install nome-pacote

# Atualizar setup
npm run setup:dev  # Valida ambiente
```

---

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/atariH2030/My-Financify/issues)
- **Discussões**: [GitHub Discussions](https://github.com/atariH2030/My-Financify/discussions)
- **Email**: (adicionar se aplicável)

---

## 📝 Licença

Este projeto segue os termos definidos em [LICENSE](LICENSE).

---

**Obrigado por contribuir para o Financy Life! 🚀**

Última atualização: 9 de dezembro de 2025  
Versão: v3.15.1
