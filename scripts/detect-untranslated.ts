/**
 * Script de Detecção Automática de Textos Não Traduzidos
 * Escaneia arquivos .tsx e identifica strings hard-coded que devem usar t()
 * 
 * USO: npx tsx scripts/detect-untranslated.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Padrões que DEVEM ser ignorados
const IGNORE_PATTERNS = [
  /className=/,           // CSS classes
  /style=/,              // Estilos inline
  /import.*from/,        // Imports
  /console\.(log|error|warn)/,  // Console logs
  /Logger\./,            // Logger calls
  /\/\//,                // Comentários
  /\/\*/,                // Comentários multiline
  /\*\//,
  /^\s*\*/,              // Comentários JSDoc
  /interface\s+\w+/,     // Interfaces TypeScript
  /type\s+\w+/,          // Types TypeScript
  /const\s+\w+/,         // Declarações const
  /function\s+\w+/,      // Declarações function
  /export\s+(default|const|function|interface|type)/, // Exports
  /\w+\.\w+\(/,          // Chamadas de método
  /onClick|onChange|onSubmit|onClose|onSave/, // Event handlers
  /aria-/,               // Atributos ARIA
  /data-/,               // Data attributes
  /\d{4}-\d{2}-\d{2}/,  // Datas ISO
  /\d+px/,               // Pixels
  /https?:\/\//,         // URLs
  /\.tsx?$/,             // Extensões de arquivo
  /\.css$/,
  /\.json$/,
  /^\s*$/,               // Linhas vazias
];

// Padrões de strings suspeitas (possíveis textos para usuário)
const SUSPICIOUS_PATTERNS = [
  // Português
  /["'](Adicionar|Editar|Excluir|Salvar|Cancelar|Fechar|Buscar|Filtrar)["']/,
  /["'](Carregando|Erro|Sucesso|Atenção|Confirmar)["']/,
  /["']Bem-vindo|Olá|Oi["']/,
  /["']Total|Saldo|Receitas|Despesas|Transações["']/,
  
  // Inglês
  /["'](Add|Edit|Delete|Save|Cancel|Close|Search|Filter)["']/,
  /["'](Loading|Error|Success|Warning|Confirm)["']/,
  /["']Welcome|Hello|Hi["']/,
  /["']Total|Balance|Income|Expenses|Transactions["']/,
  
  // Espanhol
  /["'](Añadir|Editar|Eliminar|Guardar|Cancelar|Cerrar|Buscar|Filtrar)["']/,
  /["'](Cargando|Error|Éxito|Advertencia|Confirmar)["']/,
  /["']Bienvenido|Hola["']/,
  /["']Total|Saldo|Ingresos|Gastos|Transacciones["']/,
];

interface UntranslatedText {
  file: string;
  line: number;
  text: string;
  context: string;
}

function shouldIgnore(line: string): boolean {
  return IGNORE_PATTERNS.some(pattern => pattern.test(line));
}

function isSuspicious(line: string): boolean {
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(line));
}

function extractStrings(content: string, filePath: string): UntranslatedText[] {
  const lines = content.split('\n');
  const results: UntranslatedText[] = [];
  
  // Regex para capturar strings entre aspas (simples ou duplas)
  const stringRegex = /["']([^"']{3,})["']/g;
  
  lines.forEach((line, index) => {
    // Ignorar linhas óbvias
    if (shouldIgnore(line)) return;
    
    // Verificar se linha já usa t()
    if (line.includes('t(')) return;
    
    // Buscar strings suspeitas
    let match;
    while ((match = stringRegex.exec(line)) !== null) {
      const text = match[1];
      
      // Ignorar strings muito curtas ou só números
      if (text.length < 3 || /^\d+$/.test(text)) continue;
      
      // Ignorar paths e imports
      if (text.includes('/') || text.includes('.')) continue;
      
      // Verificar se é suspeita
      if (isSuspicious(line)) {
        results.push({
          file: filePath,
          line: index + 1,
          text: text,
          context: line.trim()
        });
      }
    }
  });
  
  return results;
}

function scanDirectory(dir: string, results: UntranslatedText[] = []): UntranslatedText[] {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorar node_modules, dist, build, etc
      if (['node_modules', 'dist', 'build', '.git', 'coverage'].includes(file)) {
        return;
      }
      scanDirectory(filePath, results);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const found = extractStrings(content, filePath);
      results.push(...found);
    }
  });
  
  return results;
}

function generateReport(results: UntranslatedText[]): void {
  if (results.length === 0) {
    console.log('✅ Nenhum texto não traduzido detectado!');
    return;
  }
  
  console.log(`\n🔍 Textos Não Traduzidos Detectados: ${results.length}\n`);
  console.log('═'.repeat(80));
  
  // Agrupar por arquivo
  const byFile = results.reduce((acc, item) => {
    if (!acc[item.file]) acc[item.file] = [];
    acc[item.file].push(item);
    return acc;
  }, {} as Record<string, UntranslatedText[]>);
  
  Object.entries(byFile).forEach(([file, items]) => {
    console.log(`\n📄 ${file} (${items.length} issues)`);
    console.log('─'.repeat(80));
    
    items.forEach(item => {
      console.log(`  Line ${item.line}: "${item.text}"`);
      console.log(`  Context: ${item.context.substring(0, 100)}${item.context.length > 100 ? '...' : ''}`);
      console.log();
    });
  });
  
  console.log('═'.repeat(80));
  console.log('\n💡 Sugestões:');
  console.log('  1. Adicionar keys aos arquivos de idioma (src/locales/)');
  console.log('  2. Substituir strings por t(\'key\')');
  console.log('  3. Usar useTranslation() no componente');
  console.log('\n📖 Veja: docs/INTEGRATION_GUIDE.md\n');
}

function generateMarkdownReport(results: UntranslatedText[]): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join(process.cwd(), 'docs', `UNTRANSLATED_REPORT_${timestamp}.md`);
  
  let markdown = `# 🔍 Relatório de Textos Não Traduzidos\n\n`;
  markdown += `**Data**: ${timestamp}\n`;
  markdown += `**Total de Issues**: ${results.length}\n\n`;
  markdown += `---\n\n`;
  
  if (results.length === 0) {
    markdown += `✅ **Nenhum texto não traduzido detectado!**\n\n`;
    markdown += `Todos os componentes estão usando o sistema i18n corretamente.\n`;
  } else {
    // Agrupar por arquivo
    const byFile = results.reduce((acc, item) => {
      if (!acc[item.file]) acc[item.file] = [];
      acc[item.file].push(item);
      return acc;
    }, {} as Record<string, UntranslatedText[]>);
    
    markdown += `## 📊 Resumo por Arquivo\n\n`;
    Object.entries(byFile).forEach(([file, items]) => {
      markdown += `### \`${file}\` (${items.length} issues)\n\n`;
      
      items.forEach((item, index) => {
        markdown += `#### ${index + 1}. Linha ${item.line}\n`;
        markdown += `**Texto**: \`"${item.text}"\`\n\n`;
        markdown += `**Contexto**:\n\`\`\`typescript\n${item.context}\n\`\`\`\n\n`;
        markdown += `**Sugestão**:\n`;
        markdown += `\`\`\`typescript\n`;
        markdown += `// Adicionar em src/locales/*.json:\n`;
        markdown += `// "componentName.${item.text.toLowerCase().replace(/\s+/g, '')}": "${item.text}"\n\n`;
        markdown += `// Usar no componente:\n`;
        markdown += `{t('componentName.${item.text.toLowerCase().replace(/\s+/g, '')}')}\n`;
        markdown += `\`\`\`\n\n`;
        markdown += `---\n\n`;
      });
    });
    
    markdown += `## 🎯 Próximos Passos\n\n`;
    markdown += `1. **Adicionar keys** nos arquivos \`src/locales/*.json\`\n`;
    markdown += `2. **Importar hook**: \`import { useTranslation } from '../../contexts/LanguageContext';\`\n`;
    markdown += `3. **Declarar hook**: \`const { t } = useTranslation();\`\n`;
    markdown += `4. **Substituir strings** por \`{t('key')}\`\n`;
    markdown += `5. **Validar**: O i18n-validator detectará keys faltantes automaticamente\n\n`;
  }
  
  markdown += `---\n\n`;
  markdown += `**Gerado por**: scripts/detect-untranslated.ts\n`;
  markdown += `**Documentação**: docs/INTEGRATION_GUIDE.md\n`;
  
  fs.writeFileSync(reportPath, markdown, 'utf-8');
  console.log(`\n📝 Relatório Markdown gerado: ${reportPath}`);
}

// Main execution
const srcPath = path.join(process.cwd(), 'src', 'components');

console.log('🔍 Escaneando componentes em busca de textos não traduzidos...\n');
console.log(`📂 Diretório: ${srcPath}\n`);

const results = scanDirectory(srcPath);

generateReport(results);
generateMarkdownReport(results);

// Exit code baseado em resultados
process.exit(results.length > 0 ? 1 : 0);
