# 🔍 Relatório de Textos Não Traduzidos

**Data**: 2025-12-05
**Total de Issues**: 55

---

## 📊 Resumo por Arquivo

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\budgets\BudgetsForm.tsx` (1 issues)

#### 1. Linha 224
**Texto**: `"🟡 Alerta moderado - Balanceado"`

**Contexto**:
```typescript
{formData.alertThreshold > 70 && formData.alertThreshold <= 85 && '🟡 Alerta moderado - Balanceado'}
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.🟡alertamoderado-balanceado": "🟡 Alerta moderado - Balanceado"

// Usar no componente:
{t('componentName.🟡alertamoderado-balanceado')}
```

---

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\common\CommandPalette.tsx` (4 issues)

#### 1. Linha 52
**Texto**: `"Transações"`

**Contexto**:
```typescript
title: 'Transações',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.transações": "Transações"

// Usar no componente:
{t('componentName.transações')}
```

---

#### 2. Linha 53
**Texto**: `"Receitas e despesas"`

**Contexto**:
```typescript
description: 'Receitas e despesas',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.receitasedespesas": "Receitas e despesas"

// Usar no componente:
{t('componentName.receitasedespesas')}
```

---

#### 3. Linha 113
**Texto**: `"Gastos e receitas fixas"`

**Contexto**:
```typescript
description: 'Gastos e receitas fixas',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.gastosereceitasfixas": "Gastos e receitas fixas"

// Usar no componente:
{t('componentName.gastosereceitasfixas')}
```

---

#### 4. Linha 299
**Texto**: `"💰 Transações"`

**Contexto**:
```typescript
transaction: '💰 Transações',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.💰transações": "💰 Transações"

// Usar no componente:
{t('componentName.💰transações')}
```

---

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\common\Fase2Example.tsx` (2 issues)

#### 1. Linha 70
**Texto**: `"Atenção"`

**Contexto**:
```typescript
title: 'Atenção',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.atenção": "Atenção"

// Usar no componente:
{t('componentName.atenção')}
```

---

#### 2. Linha 115
**Texto**: `"Cancelar"`

**Contexto**:
```typescript
cancelText="Cancelar"
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.cancelar": "Cancelar"

// Usar no componente:
{t('componentName.cancelar')}
```

---

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\common\GlobalCommandPalette.tsx` (1 issues)

#### 1. Linha 53
**Texto**: `"Ir para Transações"`

**Contexto**:
```typescript
title: 'Ir para Transações',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.irparatransações": "Ir para Transações"

// Usar no componente:
{t('componentName.irparatransações')}
```

---

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\common\ThemeCustomizer.tsx` (4 issues)

#### 1. Linha 231
**Texto**: `"success"`

**Contexto**:
```typescript
{ key: 'success', label: 'Sucesso' },
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.success": "success"

// Usar no componente:
{t('componentName.success')}
```

---

#### 2. Linha 231
**Texto**: `"Sucesso"`

**Contexto**:
```typescript
{ key: 'success', label: 'Sucesso' },
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.sucesso": "Sucesso"

// Usar no componente:
{t('componentName.sucesso')}
```

---

#### 3. Linha 233
**Texto**: `"error"`

**Contexto**:
```typescript
{ key: 'error', label: 'Erro' },
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.error": "error"

// Usar no componente:
{t('componentName.error')}
```

---

#### 4. Linha 233
**Texto**: `"Erro"`

**Contexto**:
```typescript
{ key: 'error', label: 'Erro' },
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.erro": "Erro"

// Usar no componente:
{t('componentName.erro')}
```

---

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\dashboard\Dashboard.tsx` (16 issues)

#### 1. Linha 62
**Texto**: `"Erro"`

**Contexto**:
```typescript
usdRate: 'Erro',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.erro": "Erro"

// Usar no componente:
{t('componentName.erro')}
```

---

#### 2. Linha 63
**Texto**: `"Erro"`

**Contexto**:
```typescript
selicRate: 'Erro'
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.erro": "Erro"

// Usar no componente:
{t('componentName.erro')}
```

---

#### 3. Linha 230
**Texto**: `" as "`

**Contexto**:
```typescript
type: '' as 'income' | 'fixedExpenses' | 'variableExpenses' | '',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.as": " as "

// Usar no componente:
{t('componentName.as')}
```

---

#### 4. Linha 230
**Texto**: `" | "`

**Contexto**:
```typescript
type: '' as 'income' | 'fixedExpenses' | 'variableExpenses' | '',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.|": " | "

// Usar no componente:
{t('componentName.|')}
```

---

#### 5. Linha 230
**Texto**: `" | "`

**Contexto**:
```typescript
type: '' as 'income' | 'fixedExpenses' | 'variableExpenses' | '',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.|": " | "

// Usar no componente:
{t('componentName.|')}
```

---

#### 6. Linha 230
**Texto**: `" | "`

**Contexto**:
```typescript
type: '' as 'income' | 'fixedExpenses' | 'variableExpenses' | '',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.|": " | "

// Usar no componente:
{t('componentName.|')}
```

---

#### 7. Linha 351
**Texto**: `"Editar Gasto Fixo"`

**Contexto**:
```typescript
fixedExpenses: editingItem ? 'Editar Gasto Fixo' : 'Adicionar Gasto Fixo',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.editargastofixo": "Editar Gasto Fixo"

// Usar no componente:
{t('componentName.editargastofixo')}
```

---

#### 8. Linha 351
**Texto**: `"Adicionar Gasto Fixo"`

**Contexto**:
```typescript
fixedExpenses: editingItem ? 'Editar Gasto Fixo' : 'Adicionar Gasto Fixo',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.adicionargastofixo": "Adicionar Gasto Fixo"

// Usar no componente:
{t('componentName.adicionargastofixo')}
```

---

#### 9. Linha 352
**Texto**: `"Editar Gasto Variável"`

**Contexto**:
```typescript
variableExpenses: editingItem ? 'Editar Gasto Variável' : 'Adicionar Gasto Variável'
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.editargastovariável": "Editar Gasto Variável"

// Usar no componente:
{t('componentName.editargastovariável')}
```

---

#### 10. Linha 352
**Texto**: `"Adicionar Gasto Variável"`

**Contexto**:
```typescript
variableExpenses: editingItem ? 'Editar Gasto Variável' : 'Adicionar Gasto Variável'
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.adicionargastovariável": "Adicionar Gasto Variável"

// Usar no componente:
{t('componentName.adicionargastovariável')}
```

---

#### 11. Linha 447
**Texto**: `"total-income"`

**Contexto**:
```typescript
<h3 id="total-income">{formatCurrency(totalIncome)}</h3>
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.total-income": "total-income"

// Usar no componente:
{t('componentName.total-income')}
```

---

#### 12. Linha 456
**Texto**: `"total-expenses"`

**Contexto**:
```typescript
<h3 id="total-expenses">{formatCurrency(totalExpenses)}</h3>
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.total-expenses": "total-expenses"

// Usar no componente:
{t('componentName.total-expenses')}
```

---

#### 13. Linha 525
**Texto**: `"fixedExpenses"`

**Contexto**:
```typescript
onEdit={(item) => openModal('fixedExpenses', item)}
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.fixedexpenses": "fixedExpenses"

// Usar no componente:
{t('componentName.fixedexpenses')}
```

---

#### 14. Linha 526
**Texto**: `"fixedExpenses"`

**Contexto**:
```typescript
onDelete={(id) => deleteItem(id, 'fixedExpenses')}
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.fixedexpenses": "fixedExpenses"

// Usar no componente:
{t('componentName.fixedexpenses')}
```

---

#### 15. Linha 555
**Texto**: `"variableExpenses"`

**Contexto**:
```typescript
onEdit={(item) => openModal('variableExpenses', item)}
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.variableexpenses": "variableExpenses"

// Usar no componente:
{t('componentName.variableexpenses')}
```

---

#### 16. Linha 556
**Texto**: `"variableExpenses"`

**Contexto**:
```typescript
onDelete={(id) => deleteItem(id, 'variableExpenses')}
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.variableexpenses": "variableExpenses"

// Usar no componente:
{t('componentName.variableexpenses')}
```

---

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\dashboard\DashboardCustomizer.tsx` (4 issues)

#### 1. Linha 36
**Texto**: `"Saldo Total"`

**Contexto**:
```typescript
name: 'Saldo Total',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.saldototal": "Saldo Total"

// Usar no componente:
{t('componentName.saldototal')}
```

---

#### 2. Linha 42
**Texto**: `"Despesas do Mês"`

**Contexto**:
```typescript
name: 'Despesas do Mês',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.despesasdomês": "Despesas do Mês"

// Usar no componente:
{t('componentName.despesasdomês')}
```

---

#### 3. Linha 48
**Texto**: `"Receitas do Mês"`

**Contexto**:
```typescript
name: 'Receitas do Mês',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.receitasdomês": "Receitas do Mês"

// Usar no componente:
{t('componentName.receitasdomês')}
```

---

#### 4. Linha 72
**Texto**: `"Gastos por Categoria"`

**Contexto**:
```typescript
name: 'Gastos por Categoria',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.gastosporcategoria": "Gastos por Categoria"

// Usar no componente:
{t('componentName.gastosporcategoria')}
```

---

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\export\ExportModal.tsx` (1 issues)

#### 1. Linha 74
**Texto**: `"Transações"`

**Contexto**:
```typescript
transactions: 'Transações',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.transações": "Transações"

// Usar no componente:
{t('componentName.transações')}
```

---

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\recurring\RecurringForm.tsx` (1 issues)

#### 1. Linha 188
**Texto**: `"Ex: Despesas da Casa"`

**Contexto**:
```typescript
placeholder="Ex: Despesas da Casa"
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.ex:despesasdacasa": "Ex: Despesas da Casa"

// Usar no componente:
{t('componentName.ex:despesasdacasa')}
```

---

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\reports\Reports.tsx` (7 issues)

#### 1. Linha 69
**Texto**: `"Relatório de Transações"`

**Contexto**:
```typescript
title: 'Relatório de Transações',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.relatóriodetransações": "Relatório de Transações"

// Usar no componente:
{t('componentName.relatóriodetransações')}
```

---

#### 2. Linha 76
**Texto**: `"Total de Transações"`

**Contexto**:
```typescript
'Total de Transações': summary.transactionCount,
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.totaldetransações": "Total de Transações"

// Usar no componente:
{t('componentName.totaldetransações')}
```

---

#### 3. Linha 77
**Texto**: `"Total Receitas"`

**Contexto**:
```typescript
'Total Receitas': formatCurrency(summary.income),
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.totalreceitas": "Total Receitas"

// Usar no componente:
{t('componentName.totalreceitas')}
```

---

#### 4. Linha 78
**Texto**: `"Total Despesas"`

**Contexto**:
```typescript
'Total Despesas': formatCurrency(summary.expenses),
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.totaldespesas": "Total Despesas"

// Usar no componente:
{t('componentName.totaldespesas')}
```

---

#### 5. Linha 79
**Texto**: `"Saldo"`

**Contexto**:
```typescript
'Saldo': formatCurrency(summary.balance)
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.saldo": "Saldo"

// Usar no componente:
{t('componentName.saldo')}
```

---

#### 6. Linha 249
**Texto**: `"Positivo"`

**Contexto**:
```typescript
trend={summary.balance >= 0 ? 'Positivo' : 'Atenção'}
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.positivo": "Positivo"

// Usar no componente:
{t('componentName.positivo')}
```

---

#### 7. Linha 249
**Texto**: `"Atenção"`

**Contexto**:
```typescript
trend={summary.balance >= 0 ? 'Positivo' : 'Atenção'}
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.atenção": "Atenção"

// Usar no componente:
{t('componentName.atenção')}
```

---

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\reports\ReportsAdvanced.tsx` (11 issues)

#### 1. Linha 104
**Texto**: `"Total Gasto"`

**Contexto**:
```typescript
'Total Gasto': formatCurrency(t.total),
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.totalgasto": "Total Gasto"

// Usar no componente:
{t('componentName.totalgasto')}
```

---

#### 2. Linha 110
**Texto**: `"Total de Categorias"`

**Contexto**:
```typescript
'Total de Categorias': categoryTrends.length,
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.totaldecategorias": "Total de Categorias"

// Usar no componente:
{t('componentName.totaldecategorias')}
```

---

#### 3. Linha 141
**Texto**: `"Total de Orçamentos"`

**Contexto**:
```typescript
'Total de Orçamentos': budgetPerf.totalBudgets,
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.totaldeorçamentos": "Total de Orçamentos"

// Usar no componente:
{t('componentName.totaldeorçamentos')}
```

---

#### 4. Linha 142
**Texto**: `"Total Orçado"`

**Contexto**:
```typescript
'Total Orçado': formatCurrency(budgetPerf.totalBudgeted),
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.totalorçado": "Total Orçado"

// Usar no componente:
{t('componentName.totalorçado')}
```

---

#### 5. Linha 143
**Texto**: `"Total Gasto"`

**Contexto**:
```typescript
'Total Gasto': formatCurrency(budgetPerf.totalSpent),
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.totalgasto": "Total Gasto"

// Usar no componente:
{t('componentName.totalgasto')}
```

---

#### 6. Linha 144
**Texto**: `"Saldo Restante"`

**Contexto**:
```typescript
'Saldo Restante': formatCurrency(budgetPerf.remaining),
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.saldorestante": "Saldo Restante"

// Usar no componente:
{t('componentName.saldorestante')}
```

---

#### 7. Linha 175
**Texto**: `"Total de Metas"`

**Contexto**:
```typescript
'Total de Metas': goalsProgress.totalGoals,
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.totaldemetas": "Total de Metas"

// Usar no componente:
{t('componentName.totaldemetas')}
```

---

#### 8. Linha 177
**Texto**: `"Total Economizado"`

**Contexto**:
```typescript
'Total Economizado': formatCurrency(goalsProgress.totalSaved),
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.totaleconomizado": "Total Economizado"

// Usar no componente:
{t('componentName.totaleconomizado')}
```

---

#### 9. Linha 330
**Texto**: `"Receitas"`

**Contexto**:
```typescript
label: 'Receitas',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.receitas": "Receitas"

// Usar no componente:
{t('componentName.receitas')}
```

---

#### 10. Linha 337
**Texto**: `"Despesas"`

**Contexto**:
```typescript
label: 'Despesas',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.despesas": "Despesas"

// Usar no componente:
{t('componentName.despesas')}
```

---

#### 11. Linha 350
**Texto**: `"Saldo"`

**Contexto**:
```typescript
label: 'Saldo',
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.saldo": "Saldo"

// Usar no componente:
{t('componentName.saldo')}
```

---

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\settings\Settings.tsx` (1 issues)

#### 1. Linha 749
**Texto**: `"Salvar"`

**Contexto**:
```typescript
<li>Cole no campo acima e clique em "Salvar"</li>
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.salvar": "Salvar"

// Usar no componente:
{t('componentName.salvar')}
```

---

### `C:\Users\healt_iwewx2y\Downloads\My-Financify\src\components\transactions\TransactionFormV3.tsx` (2 issues)

#### 1. Linha 518
**Texto**: `"Atualizar"`

**Contexto**:
```typescript
{isSubmitting ? 'Salvando...' : transaction ? 'Atualizar' : 'Adicionar'}
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.atualizar": "Atualizar"

// Usar no componente:
{t('componentName.atualizar')}
```

---

#### 2. Linha 518
**Texto**: `"Adicionar"`

**Contexto**:
```typescript
{isSubmitting ? 'Salvando...' : transaction ? 'Atualizar' : 'Adicionar'}
```

**Sugestão**:
```typescript
// Adicionar em src/locales/*.json:
// "componentName.adicionar": "Adicionar"

// Usar no componente:
{t('componentName.adicionar')}
```

---

## 🎯 Próximos Passos

1. **Adicionar keys** nos arquivos `src/locales/*.json`
2. **Importar hook**: `import { useTranslation } from '../../contexts/LanguageContext';`
3. **Declarar hook**: `const { t } = useTranslation();`
4. **Substituir strings** por `{t('key')}`
5. **Validar**: O i18n-validator detectará keys faltantes automaticamente

---

**Gerado por**: scripts/detect-untranslated.ts
**Documentação**: docs/INTEGRATION_GUIDE.md
