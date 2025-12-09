/**
 * Landing Page - My-Financify
 * Página inicial com animações, gráficos demonstrativos e chatbot integrado
 * 
 * @version 3.15.1
 * @author DEV - Rickson
 */

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './LandingPage.css';

// Registrar componentes Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ============================================================================
// INTERFACES
// ============================================================================

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  social: {
    linkedin?: string;
    github?: string;
  };
}

// ============================================================================
// DADOS MOCKADOS
// ============================================================================

const faqData: FAQItem[] = [
  {
    question: 'O que é o My-Financify?',
    answer: 'My-Financify é uma plataforma completa de gestão financeira pessoal que ajuda você a organizar suas finanças, definir metas, controlar gastos e alcançar a liberdade financeira. Com interface intuitiva, gráficos em tempo real e inteligência artificial integrada.',
    category: 'geral'
  },
  {
    question: 'Quais são os planos disponíveis?',
    answer: 'Oferecemos 3 planos: FREE (gratuito com recursos básicos), PRO (R$ 19,90/mês com recursos avançados) e PREMIUM (R$ 39,90/mês com IA, análises preditivas e suporte prioritário).',
    category: 'planos'
  },
  {
    question: 'Como funciona? Preciso baixar algo?',
    answer: 'Não precisa baixar nada! My-Financify é um PWA (Progressive Web App) que funciona direto no navegador. Você pode acessar de qualquer dispositivo e ainda instalar como app no celular para uso offline.',
    category: 'funcionamento'
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Sim! Utilizamos criptografia de ponta a ponta, autenticação segura via Supabase, e seus dados financeiros ficam protegidos com os mais altos padrões de segurança (ISO 27001).',
    category: 'seguranca'
  },
  {
    question: 'Posso sincronizar com meu banco?',
    answer: 'Em breve! Estamos desenvolvendo integrações com os principais bancos brasileiros via Open Banking. Por enquanto, você pode importar extratos em CSV/Excel.',
    category: 'integracao'
  },
  {
    question: 'Tem suporte mobile?',
    answer: 'Sim! Nossa plataforma é 100% responsiva e funciona perfeitamente em smartphones e tablets. Você pode instalar como app nativo através do PWA.',
    category: 'mobile'
  }
];

const teamMembers: TeamMember[] = [
  {
    name: 'Rickson (Rick)',
    role: 'Full-Stack Developer & Founder',
    avatar: '👨‍💻',
    bio: 'Engenheiro de software apaixonado por criar soluções que transformam a vida financeira das pessoas.',
    social: {
      github: 'https://github.com/atariH2030'
    }
  },
  {
    name: 'DEV AI Assistant',
    role: 'AI Development Partner',
    avatar: '🤖',
    bio: 'Assistente de IA especializado em arquitetura de software, TQM e desenvolvimento ágil.',
    social: {}
  }
];

const features = [
  {
    icon: '📊',
    title: 'Dashboard Inteligente',
    description: 'Visualize suas finanças em tempo real com gráficos interativos e KPIs personalizados'
  },
  {
    icon: '🎯',
    title: 'Metas Financeiras',
    description: 'Defina objetivos e acompanhe o progresso com alertas e dicas personalizadas'
  },
  {
    icon: '💳',
    title: 'Controle de Gastos',
    description: 'Categorize transações automaticamente e identifique oportunidades de economia'
  },
  {
    icon: '📈',
    title: 'Análises Avançadas',
    description: 'Relatórios detalhados com insights sobre padrões de consumo e projeções futuras'
  },
  {
    icon: '🤖',
    title: 'IA Integrada',
    description: 'Assistente inteligente que aprende seus hábitos e sugere melhorias'
  },
  {
    icon: '🔒',
    title: 'Segurança Total',
    description: 'Criptografia de ponta a ponta e autenticação de dois fatores'
  }
];

const pricingPlans = [
  {
    name: 'FREE',
    price: 'R$ 0',
    period: '/mês',
    features: [
      'Até 50 transações/mês',
      '3 contas bancárias',
      'Dashboard básico',
      'Relatórios mensais',
      'Suporte por email'
    ],
    cta: 'Começar Grátis',
    highlighted: false
  },
  {
    name: 'PRO',
    price: 'R$ 19,90',
    period: '/mês',
    features: [
      'Transações ilimitadas',
      'Contas ilimitadas',
      'Dashboard avançado',
      'Relatórios personalizados',
      'Exportação PDF/Excel',
      'Metas e orçamentos',
      'Suporte prioritário'
    ],
    cta: 'Assinar PRO',
    highlighted: true
  },
  {
    name: 'PREMIUM',
    price: 'R$ 39,90',
    period: '/mês',
    features: [
      'Tudo do PRO +',
      'IA Financeira completa',
      'Análises preditivas',
      'Alertas inteligentes',
      'Integração com bancos*',
      'API de terceiros',
      'Suporte 24/7',
      'Consultoria mensal'
    ],
    cta: 'Assinar PREMIUM',
    highlighted: false
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const LandingPage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const [activeSection, setActiveSection] = useState('hero');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Olá! 👋 Sou o assistente do My-Financify. Como posso ajudar?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  // Navegação via hash routing
  const handleNavigate = (path: string) => {
    if ((window as any).navigateTo) {
      (window as any).navigateTo(path);
    } else {
      window.location.hash = path;
    }
  };

  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // ============================================================================
  // CHATBOT LOGIC
  // ============================================================================

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Gerar ID único usando crypto API (mais seguro e puro)
    const generateMessageId = () => {
      return `${crypto.randomUUID()}-${chatMessages.length}`;
    };

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      text: userInput,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Simular resposta do bot
    setTimeout(() => {
      const botResponse = getBotResponse(userInput.toLowerCase());
      const botMessage: ChatMessage = {
        id: generateMessageId(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 500);

    setUserInput('');
  };

  const getBotResponse = (input: string): string => {
    // Palavras-chave e respostas automáticas
    if (input.includes('o que é') || input.includes('oque é')) {
      return faqData[0].answer;
    }
    if (input.includes('plano') || input.includes('preço') || input.includes('custo')) {
      return faqData[1].answer;
    }
    if (input.includes('como funciona') || input.includes('baixar') || input.includes('instalar')) {
      return faqData[2].answer;
    }
    if (input.includes('segur') || input.includes('dado')) {
      return faqData[3].answer;
    }
    if (input.includes('banco') || input.includes('sincronizar') || input.includes('integr')) {
      return faqData[4].answer;
    }
    if (input.includes('mobile') || input.includes('celular') || input.includes('app')) {
      return faqData[5].answer;
    }
    if (input.includes('contato') || input.includes('suporte')) {
      return 'Você pode entrar em contato conosco por email: suporte@financify.com.br ou pelo GitHub do projeto. Nosso time responde em até 24h! 📧';
    }
    if (input.includes('grátis') || input.includes('gratuito') || input.includes('free')) {
      return 'Sim! Temos um plano FREE 100% gratuito com recursos básicos para você começar. Sem taxas escondidas! 🎉';
    }

    // Resposta padrão
    return 'Desculpe, não entendi sua pergunta. 😅 Você pode tentar perguntar sobre: planos, funcionamento, segurança, recursos, ou dizer "ajuda" para ver todas as opções!';
  };

  const quickQuestions = [
    'O que é?',
    'Quanto custa?',
    'Como funciona?',
    'É seguro?'
  ];

  // ============================================================================
  // SCROLL OBSERVER
  // ============================================================================

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'demo', 'pricing', 'faq', 'team'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="landing-page">
      {/* ========== FLOATING NAVBAR ========== */}
      <motion.nav 
        className="landing-nav"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">💰</span>
            <span className="logo-text">My-Financify</span>
          </div>
          
          <div className="nav-links">
            <a href="#hero" className={activeSection === 'hero' ? 'active' : ''}>Início</a>
            <a href="#features" className={activeSection === 'features' ? 'active' : ''}>Recursos</a>
            <a href="#demo" className={activeSection === 'demo' ? 'active' : ''}>Demo</a>
            <a href="#pricing" className={activeSection === 'pricing' ? 'active' : ''}>Planos</a>
            <a href="#faq" className={activeSection === 'faq' ? 'active' : ''}>FAQ</a>
            <a href="#team" className={activeSection === 'team' ? 'active' : ''}>Equipe</a>
          </div>

          <div className="nav-actions">
            <motion.button 
              className="btn-secondary"
              onClick={() => handleNavigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Entrar
            </motion.button>
            <motion.button 
              className="btn-primary"
              onClick={() => handleNavigate('/register')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Começar Grátis
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ========== HERO SECTION ========== */}
      <motion.section 
        id="hero" 
        className="hero-section"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="hero-container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Transforme sua Vida Financeira com
              <span className="gradient-text"> Inteligência Artificial</span>
            </motion.h1>

            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Gerencie gastos, alcance metas e tome decisões inteligentes com a plataforma
              de gestão financeira mais completa do Brasil 🇧🇷
            </motion.p>

            <motion.div 
              className="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.button
                className="btn-hero-primary"
                onClick={() => handleNavigate('/register')}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 Começar Gratuitamente
              </motion.button>
              <motion.button
                className="btn-hero-secondary"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📺 Ver Demo
              </motion.button>
            </motion.div>

            <motion.div 
              className="hero-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Usuários Ativos</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">R$ 50M+</span>
                <span className="stat-label">Gerenciados</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Avaliação</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="hero-mockup">
              <div className="mockup-window">
                <div className="mockup-header">
                  <span></span><span></span><span></span>
                </div>
                <div className="mockup-content">
                  <motion.div
                    className="mockup-card"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="card-icon">💰</div>
                    <div className="card-label">Saldo Total</div>
                    <div className="card-value">R$ 12.450,00</div>
                    <div className="card-trend positive">+15% este mês</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <div className="hero-bg-elements">
          <motion.div 
            className="bg-circle circle-1"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div 
            className="bg-circle circle-2"
            animate={{ scale: [1, 1.3, 1], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
          />
        </div>
      </motion.section>

      {/* ========== FEATURES SECTION ========== */}
      <section id="features" className="features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Recursos que Transformam</h2>
            <p className="section-subtitle">
              Tudo que você precisa para ter controle total das suas finanças
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              >
                <motion.div 
                  className="feature-icon"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== DEMO SECTION WITH CHARTS ========== */}
      <section id="demo" className="demo-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Veja em Ação</h2>
            <p className="section-subtitle">
              Gráficos interativos e visualizações em tempo real
            </p>
          </motion.div>

          <div className="demo-grid">
            <motion.div 
              className="demo-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="demo-card-title">📈 Evolução Financeira</h3>
              <div className="chart-container">
                <Line 
                  data={{
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [
                      {
                        label: 'Receitas',
                        data: [4500, 5200, 4800, 6100, 5900, 6500],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                      },
                      {
                        label: 'Despesas',
                        data: [3200, 3500, 3100, 3800, 3600, 3900],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: 'top' }
                    }
                  }}
                />
              </div>
            </motion.div>

            <motion.div 
              className="demo-card"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="demo-card-title">💳 Gastos por Categoria</h3>
              <div className="chart-container">
                <Doughnut 
                  data={{
                    labels: ['Alimentação', 'Transporte', 'Lazer', 'Moradia', 'Saúde', 'Outros'],
                    datasets: [{
                      data: [1200, 450, 800, 2500, 350, 600],
                      backgroundColor: [
                        '#f59e0b',
                        '#3b82f6',
                        '#8b5cf6',
                        '#10b981',
                        '#ef4444',
                        '#6b7280'
                      ]
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: 'right' }
                    }
                  }}
                />
              </div>
            </motion.div>

            <motion.div 
              className="demo-card demo-card-wide"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="demo-card-title">🎯 Performance de Metas</h3>
              <div className="chart-container">
                <Bar 
                  data={{
                    labels: ['Meta Emergência', 'Viagem', 'Carro Novo', 'Investimentos', 'Reforma'],
                    datasets: [{
                      label: 'Progresso (%)',
                      data: [85, 60, 40, 95, 25],
                      backgroundColor: [
                        '#10b981',
                        '#3b82f6',
                        '#f59e0b',
                        '#8b5cf6',
                        '#ef4444'
                      ]
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true, max: 100 }
                    }
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== PRICING SECTION ========== */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Planos para Todos</h2>
            <p className="section-subtitle">
              Escolha o plano ideal para suas necessidades
            </p>
          </motion.div>

          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {plan.highlighted && (
                  <div className="pricing-badge">Mais Popular</div>
                )}
                <h3 className="pricing-name">{plan.name}</h3>
                <div className="pricing-price">
                  <span className="price-value">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>
                <ul className="pricing-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
                <motion.button
                  className={`pricing-cta ${plan.highlighted ? 'primary' : 'secondary'}`}
                  onClick={() => handleNavigate('/register')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section id="faq" className="faq-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Perguntas Frequentes</h2>
            <p className="section-subtitle">
              Tire suas dúvidas sobre o My-Financify
            </p>
          </motion.div>

          <div className="faq-container">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                className="faq-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <motion.button
                  className={`faq-question ${activeFAQ === index ? 'active' : ''}`}
                  onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                  whileHover={{ x: 10 }}
                >
                  <span>{faq.question}</span>
                  <motion.span 
                    className="faq-icon"
                    animate={{ rotate: activeFAQ === index ? 180 : 0 }}
                  >
                    ▼
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {activeFAQ === index && (
                    <motion.div
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TEAM SECTION ========== */}
      <section id="team" className="team-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Nossa Equipe</h2>
            <p className="section-subtitle">
              Conheça quem está por trás do My-Financify
            </p>
          </motion.div>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="team-card"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <div className="team-avatar">{member.avatar}</div>
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
                <div className="team-social">
                  {member.social.github && (
                    <a href={member.social.github} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                  {member.social.linkedin && (
                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-col">
              <h4>💰 My-Financify</h4>
              <p>Transformando vidas através da educação e gestão financeira inteligente.</p>
            </div>
            <div className="footer-col">
              <h4>Produto</h4>
              <a href="#features">Recursos</a>
              <a href="#pricing">Planos</a>
              <a href="#demo">Demo</a>
            </div>
            <div className="footer-col">
              <h4>Suporte</h4>
              <a href="#faq">FAQ</a>
              <a href="mailto:suporte@financify.com.br">Contato</a>
              <a href="/docs">Documentação</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="/privacy">Privacidade</a>
              <a href="/terms">Termos de Uso</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 My-Financify. Todos os direitos reservados.</p>
            <p>Desenvolvido com ❤️ por Rickson (Rick)</p>
          </div>
        </div>
      </footer>

      {/* ========== FLOATING CHATBOT ========== */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="chatbot-window"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="chatbot-header">
              <div className="chatbot-title">
                <span className="chatbot-icon">🤖</span>
                <span>Assistente My-Financify</span>
              </div>
              <button 
                className="chatbot-close"
                onClick={() => setIsChatOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="chatbot-messages">
              {chatMessages.map(message => (
                <motion.div
                  key={message.id}
                  className={`chat-message ${message.sender}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="message-content">{message.text}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="chatbot-quick-questions">
              {quickQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  className="quick-question-btn"
                  onClick={() => {
                    setUserInput(question);
                    handleChatSubmit(new Event('submit') as any);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {question}
                </motion.button>
              ))}
            </div>

            <form className="chatbot-input" onSubmit={handleChatSubmit}>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Digite sua dúvida..."
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ➤
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="chatbot-fab"
        onClick={() => setIsChatOpen(!isChatOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: isChatOpen 
            ? '0 0 0 0 rgba(59, 130, 246, 0)' 
            : ['0 0 0 0 rgba(59, 130, 246, 0.7)', '0 0 0 20px rgba(59, 130, 246, 0)']
        }}
        transition={{ 
          boxShadow: { duration: 2, repeat: Infinity }
        }}
      >
        {isChatOpen ? '✕' : '💬'}
      </motion.button>
    </div>
  );
};

export default LandingPage;
