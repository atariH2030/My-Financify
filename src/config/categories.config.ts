/**
 * Categories Configuration - Configuração de Sessões e Categorias
 * 
 * DECISÃO: Estrutura hierárquica Sessão → Categoria → Subcategoria
 * BENEFÍCIO: Organização clara, fácil manutenção, escalável
 * 
 * @version 3.0.0
 */

import type { SectionConfig } from '../types/financial.types';

/**
 * Configuração completa de sessões, categorias e subcategorias
 * 
 * ESTRUTURA:
 * - Sessão: Agrupamento principal (ex: "Despesas da Casa")
 * - Categoria: Tipo de gasto dentro da sessão (ex: "Moradia")
 * - Subcategoria: Especificação do gasto (ex: "Aluguel")
 */
export const SECTIONS_CONFIG: SectionConfig[] = [
  // ===== RECEITAS =====
  {
    id: 'income',
    name: 'Receitas',
    icon: '💰',
    color: '#10b981', // Verde
    description: 'Todas as entradas de dinheiro',
    categories: [
      {
        id: 'salary',
        name: 'Salário',
        icon: '💵',
        color: '#10b981',
        section: 'income',
        subcategories: ['Salário Principal', 'Bônus', 'Comissões', 'Horas Extras', '13º Salário']
      },
      {
        id: 'freelance',
        name: 'Freelance',
        icon: '💼',
        color: '#34d399',
        section: 'income',
        subcategories: ['Projetos', 'Consultoria', 'Serviços Pontuais']
      },
      {
        id: 'investments',
        name: 'Investimentos',
        icon: '📈',
        color: '#059669',
        section: 'income',
        subcategories: ['Dividendos', 'Juros', 'Rendimentos', 'Venda de Ativos']
      },
      {
        id: 'other-income',
        name: 'Outras Receitas',
        icon: '🎁',
        color: '#6ee7b7',
        section: 'income',
        subcategories: ['Presentes', 'Reembolsos', 'Vendas', 'Aluguéis Recebidos']
      }
    ]
  },

  // ===== DESPESAS DA CASA =====
  {
    id: 'home-expenses',
    name: 'Despesas da Casa',
    icon: '🏠',
    color: '#3b82f6', // Azul
    description: 'Gastos relacionados à moradia e manutenção da casa',
    categories: [
      {
        id: 'housing',
        name: 'Moradia',
        icon: '🏡',
        color: '#3b82f6',
        section: 'home-expenses',
        subcategories: [
          'Aluguel',
          'Condomínio',
          'IPTU',
          'Prestação da Casa',
          'Seguro Residencial',
          'Reforma',
          'Manutenção'
        ]
      },
      {
        id: 'utilities',
        name: 'Utilidades',
        icon: '💡',
        color: '#60a5fa',
        section: 'home-expenses',
        subcategories: [
          'Luz',
          'Água',
          'Gás',
          'Internet',
          'Telefone Fixo',
          'TV a Cabo',
          'Streaming'
        ]
      },
      {
        id: 'groceries',
        name: 'Mercado',
        icon: '🛒',
        color: '#93c5fd',
        section: 'home-expenses',
        subcategories: [
          'Supermercado',
          'Feira',
          'Açougue',
          'Padaria',
          'Produtos de Limpeza',
          'Higiene'
        ]
      }
    ]
  },

  // ===== DESPESAS PESSOAIS =====
  {
    id: 'personal-expenses',
    name: 'Despesas Pessoais',
    icon: '👤',
    color: '#8b5cf6', // Roxo
    description: 'Gastos individuais e cuidados pessoais',
    categories: [
      {
        id: 'food',
        name: 'Alimentação',
        icon: '🍔',
        color: '#8b5cf6',
        section: 'personal-expenses',
        subcategories: [
          'Restaurantes',
          'Delivery',
          'Lanche',
          'Café',
          'Bar/Balada',
          'Fast Food'
        ]
      },
      {
        id: 'transportation',
        name: 'Transporte',
        icon: '🚗',
        color: '#a78bfa',
        section: 'personal-expenses',
        subcategories: [
          'Combustível',
          'Uber/Taxi',
          'Ônibus',
          'Metrô',
          'Estacionamento',
          'Manutenção Veículo',
          'IPVA',
          'Seguro Auto'
        ]
      },
      {
        id: 'health',
        name: 'Saúde',
        icon: '⚕️',
        color: '#c4b5fd',
        section: 'personal-expenses',
        subcategories: [
          'Plano de Saúde',
          'Médicos',
          'Dentista',
          'Farmácia',
          'Exames',
          'Academia',
          'Terapia'
        ]
      },
      {
        id: 'personal-care',
        name: 'Cuidados Pessoais',
        icon: '💆',
        color: '#ddd6fe',
        section: 'personal-expenses',
        subcategories: [
          'Cabelo',
          'Estética',
          'Cosméticos',
          'Roupas',
          'Calçados',
          'Acessórios'
        ]
      }
    ]
  },

  // ===== EDUCAÇÃO E CULTURA =====
  {
    id: 'education-culture',
    name: 'Educação e Cultura',
    icon: '📚',
    color: '#f59e0b', // Laranja
    description: 'Investimentos em conhecimento e desenvolvimento',
    categories: [
      {
        id: 'education',
        name: 'Educação',
        icon: '🎓',
        color: '#f59e0b',
        section: 'education-culture',
        subcategories: [
          'Mensalidade Escolar',
          'Faculdade',
          'Cursos Online',
          'Livros',
          'Material Escolar',
          'Idiomas'
        ]
      },
      {
        id: 'leisure',
        name: 'Lazer',
        icon: '🎮',
        color: '#fbbf24',
        section: 'education-culture',
        subcategories: [
          'Cinema',
          'Teatro',
          'Shows',
          'Viagens',
          'Hobbies',
          'Jogos',
          'Assinaturas'
        ]
      }
    ]
  },

  // ===== INVESTIMENTOS E POUPANÇA =====
  {
    id: 'savings-investments',
    name: 'Investimentos e Poupança',
    icon: '💎',
    color: '#14b8a6', // Teal
    description: 'Aplicações financeiras e reservas',
    categories: [
      {
        id: 'savings',
        name: 'Poupança',
        icon: '🐷',
        color: '#14b8a6',
        section: 'savings-investments',
        subcategories: [
          'Poupança Automática',
          'Reserva de Emergência',
          'Objetivos de Curto Prazo'
        ]
      },
      {
        id: 'investments-category',
        name: 'Investimentos',
        icon: '📊',
        color: '#2dd4bf',
        section: 'savings-investments',
        subcategories: [
          'Renda Fixa',
          'Renda Variável',
          'Fundos',
          'Previdência Privada',
          'Criptomoedas',
          'Imóveis'
        ]
      }
    ]
  },

  // ===== DÍVIDAS E EMPRÉSTIMOS =====
  {
    id: 'debts',
    name: 'Dívidas e Empréstimos',
    icon: '💳',
    color: '#ef4444', // Vermelho
    description: 'Pagamentos de dívidas e financiamentos',
    categories: [
      {
        id: 'credit-cards',
        name: 'Cartões de Crédito',
        icon: '💳',
        color: '#ef4444',
        section: 'debts',
        subcategories: [
          'Fatura Integral',
          'Parcelas',
          'Juros'
        ]
      },
      {
        id: 'loans',
        name: 'Empréstimos',
        icon: '🏦',
        color: '#f87171',
        section: 'debts',
        subcategories: [
          'Empréstimo Pessoal',
          'Financiamento Veículo',
          'Financiamento Casa',
          'Empréstimo Consignado'
        ]
      }
    ]
  },

  // ===== FAMÍLIA E PETS =====
  {
    id: 'family-pets',
    name: 'Família e Pets',
    icon: '👨‍👩‍👧',
    color: '#ec4899', // Pink
    description: 'Gastos com família e animais de estimação',
    categories: [
      {
        id: 'children',
        name: 'Filhos',
        icon: '👶',
        color: '#ec4899',
        section: 'family-pets',
        subcategories: [
          'Creche',
          'Escola',
          'Roupas',
          'Brinquedos',
          'Pediatra',
          'Atividades Extras'
        ]
      },
      {
        id: 'pets',
        name: 'Pets',
        icon: '🐾',
        color: '#f472b6',
        section: 'family-pets',
        subcategories: [
          'Ração',
          'Veterinário',
          'Banho e Tosa',
          'Medicamentos',
          'Brinquedos',
          'Pet Shop'
        ]
      }
    ]
  },

  // ===== OUTROS =====
  {
    id: 'others',
    name: 'Outros',
    icon: '📦',
    color: '#6b7280', // Cinza
    description: 'Gastos diversos e não categorizados',
    categories: [
      {
        id: 'miscellaneous',
        name: 'Diversos',
        icon: '🔧',
        color: '#6b7280',
        section: 'others',
        subcategories: [
          'Presentes',
          'Doações',
          'Taxas',
          'Multas',
          'Imprevistos'
        ]
      }
    ]
  }
];

/**
 * Helper: Buscar sessão por ID
 */
export const getSectionById = (id: string): SectionConfig | undefined => {
  return SECTIONS_CONFIG.find(section => section.id === id);
};

/**
 * Helper: Buscar categoria por ID dentro de uma sessão
 */
export const _getCategoryById = (sectionId: string, categoryId: string) => {
  const section = getSectionById(sectionId);
  return section?.categories.find(cat => cat.id === categoryId);
};

/**
 * Helper: Listar todas as categorias de uma sessão
 */
export const getCategoriesBySection = (sectionId: string) => {
  const section = getSectionById(sectionId);
  return section?.categories || [];
};

/**
 * Helper: Listar todas as sessões de despesas (excluindo receitas)
 */
export const getExpenseSections = (): SectionConfig[] => {
  return SECTIONS_CONFIG.filter(section => section.id !== 'income');
};

/**
 * Helper: Listar sessão de receitas
 */
export const getIncomeSection = (): SectionConfig | undefined => {
  return SECTIONS_CONFIG.find(section => section.id === 'income');
};

/**
 * Cores para tipos de despesa
 */
export const EXPENSE_TYPE_COLORS = {
  fixed: '#3b82f6',    // Azul - Previsível, estável
  variable: '#f59e0b'  // Laranja - Requer atenção
};

export const EXPENSE_TYPE_LABELS = {
  fixed: 'Gasto Fixo',
  variable: 'Gasto Variável'
};
