# 🛠️ Scripts de Automação

## 📋 Scripts Disponíveis

### 🔧 `fix-warnings.ts` (NOVO!)

**Correção automática de warnings ESLint**

Corrige automaticamente os warnings mais comuns do projeto, economizando tempo e padronizando o código.

#### Como Usar:

```bash
# Corrigir warnings automaticamente
npm run fix:warnings

# Corrigir + formatar + verificar (recomendado)
npm run fix:all
```

#### O que corrige:

1. **Imports não usados** - Remove ou limpa imports
2. **Aspas em JSX** - Escapa `"` para `&quot;`
3. **Variáveis não usadas** - Prefixa com `_`
4. **setState em useEffect** - Adiciona TODO comment
5. **Await desnecessário** - Remove `return await`

#### Estatísticas:

```
📊 FIX STATISTICS
Files processed: 15
Total warnings fixed: 45
```

---

### 🔍 `detect-untranslated.ts`

**Detecta textos não traduzidos em componentes React**

Escaneia todos os arquivos `.tsx` e `.jsx` em `src/components/` e identifica strings hard-coded que devem usar o sistema i18n.

#### Como Usar:

```bash
# Executar detecção
npx tsx scripts/detect-untranslated.ts

# Ou adicionar no package.json:
npm run check:i18n
```

#### Saída:

- **Console**: Lista de textos suspeitos com arquivo, linha e contexto
- **Markdown**: Relatório detalhado em `docs/UNTRANSLATED_REPORT_YYYY-MM-DD.md`

#### Exemplo de Saída:

```
🔍 Textos Não Traduzidos Detectados: 3

📄 src/components/transactions/Transactions.tsx (2 issues)
────────────────────────────────────────────────────────────────────────────────
  Line 45: "Adicionar Nova Transação"
  Context: <button onClick={handleAdd}>Adicionar Nova Transação</button>

  Line 67: "Carregando..."
  Context: {loading && <p>Carregando...</p>}

💡 Sugestões:
  1. Adicionar keys aos arquivos de idioma (src/locales/)
  2. Substituir strings por t('key')
  3. Usar useTranslation() no componente
```

#### O que Detecta:

✅ Strings em português, inglês e espanhol  
✅ Textos de interface (botões, labels, mensagens)  
✅ Strings > 3 caracteres (ignora IDs, classes)

#### O que Ignora:

❌ `className`, `style`, `data-*`, `aria-*`  
❌ Imports, exports, tipos TypeScript  
❌ Console.log e Logger  
❌ Comentários  
❌ URLs, datas, números  
❌ Linhas que já usam `t()`

---

## 📦 Adicionar ao package.json

```json
{
  "scripts": {
    "check:i18n": "tsx scripts/detect-untranslated.ts",
    "check:i18n:report": "tsx scripts/detect-untranslated.ts && cat docs/UNTRANSLATED_REPORT_*.md"
  },
  "devDependencies": {
    "tsx": "^4.7.0"
  }
}
```

---

## 🎯 Workflow Recomendado

1. **Desenvolver componente** normalmente
2. **Rodar detecção**: `npm run check:i18n`
3. **Ver relatório**: Abrir `docs/UNTRANSLATED_REPORT_*.md`
4. **Adicionar traduções**:
   - Editar `src/locales/pt-BR.json`, `en-US.json`, `es-ES.json`
   - Adicionar keys sugeridas
5. **Refatorar componente**:
   - `import { useTranslation } from '../../contexts/LanguageContext';`
   - `const { t } = useTranslation();`
   - Substituir strings por `{t('key')}`
6. **Validar**: `npm run dev` (i18n-validator roda automaticamente)
7. **Commit**: Só após `npm run check:i18n` retornar 0 issues

---

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: i18n Check

on: [push, pull_request]

jobs:
  check-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run check:i18n
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
npm run check:i18n || {
  echo "❌ Textos não traduzidos detectados!"
  echo "📄 Veja: docs/UNTRANSLATED_REPORT_*.md"
  exit 1
}
```

---

## 📖 Documentação Relacionada

- **INTEGRATION_GUIDE.md**: Como usar sistema i18n
- **i18n-validator.ts**: Validação automática de keys
- **LanguageContext.tsx**: Context API de tradução

---

**Versão**: 1.0  
**Última Atualização**: 5 de dezembro de 2025
