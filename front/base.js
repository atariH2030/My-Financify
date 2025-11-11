// Global variables
let financialData = {
    income: [],
    fixedExpenses: [],
    variableExpenses: []
};

let currentEditingItem = null;
let currentAction = null;
let currentCategory = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initializeTheme();
    
    loadFinancialData();
    fetchMarketData();
    updateSummaryCards();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update market data every 5 minutes
    setInterval(fetchMarketData, 300000);
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Add cool transition effect
    document.body.style.transition = 'all 0.5s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 500);
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        themeToggle.title = 'Modo claro';
    } else {
        icon.className = 'fas fa-moon';
        themeToggle.title = 'Modo escuro';
    }
}

function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    // Close mobile menu when clicking on nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    });
    
    // Modal close events
    window.addEventListener('click', function(event) {
        const itemModal = document.getElementById('itemModal');
        const confirmModal = document.getElementById('confirmModal');
        
        if (event.target === itemModal) {
            closeModal();
        }
        if (event.target === confirmModal) {
            closeConfirmModal();
        }
    });
    
    // Form submission
    document.getElementById('itemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveItem();
    });
}

// Market Data Functions
async function fetchMarketData() {
    try {
        // Simulating API calls - Replace with real APIs
        await fetchUSDRate();
        await fetchSelicRate();
    } catch (error) {
        console.error('Erro ao buscar dados do mercado:', error);
    }
}

async function fetchUSDRate() {
    try {
        // Using a free API for USD/BRL rate
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const usdToBrl = data.rates.BRL;
        
        document.getElementById('usd-rate').textContent = `R$ ${usdToBrl.toFixed(2)}`;
        document.getElementById('usd-rate').classList.remove('loading');
    } catch (error) {
        document.getElementById('usd-rate').textContent = 'Erro';
        console.error('Erro ao buscar cotação USD:', error);
    }
}

async function fetchSelicRate() {
    try {
        // Simulating SELIC rate - replace with real API
        // You can integrate with Banco Central do Brasil API
        const selicRate = 11.75; // Example rate
        document.getElementById('selic-rate').textContent = `${selicRate}%`;
        document.getElementById('selic-rate').classList.remove('loading');
    } catch (error) {
        document.getElementById('selic-rate').textContent = 'Erro';
        console.error('Erro ao buscar taxa SELIC:', error);
    }
}

// Financial Data Management
function loadFinancialData() {
    const savedData = localStorage.getItem('financialData');
    if (savedData) {
        financialData = JSON.parse(savedData);
    }
    
    renderAllLists();
}

function saveFinancialData() {
    localStorage.setItem('financialData', JSON.stringify(financialData));
    updateSummaryCards();
}

function updateSummaryCards() {
    const totalIncome = financialData.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = [...financialData.fixedExpenses, ...financialData.variableExpenses]
        .reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpenses;
    
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('balance').textContent = formatCurrency(balance);
    
    // Update balance color based on positive/negative
    const balanceElement = document.getElementById('balance');
    if (balance >= 0) {
        balanceElement.style.color = '#059669';
    } else {
        balanceElement.style.color = '#dc2626';
    }
}

// Item Management Functions
function addIncomeItem() {
    currentCategory = 'income';
    currentEditingItem = null;
    openModal('Adicionar Receita');
}

function addFixedExpenseItem() {
    currentCategory = 'fixedExpenses';
    currentEditingItem = null;
    openModal('Adicionar Gasto Fixo');
}

function addVariableExpenseItem() {
    currentCategory = 'variableExpenses';
    currentEditingItem = null;
    openModal('Adicionar Gasto Variável');
}

function editItem(category, index) {
    currentCategory = category;
    currentEditingItem = index;
    const item = financialData[category][index];
    
    document.getElementById('item-title').value = item.title;
    document.getElementById('item-amount').value = item.amount;
    document.getElementById('item-date').value = item.date;
    document.getElementById('item-description').value = item.description || '';
    
    const modalTitle = category === 'income' ? 'Editar Receita' : 
                      category === 'fixedExpenses' ? 'Editar Gasto Fixo' : 'Editar Gasto Variável';
    openModal(modalTitle);
}

function deleteItem(category, index) {
    currentAction = () => {
        financialData[category].splice(index, 1);
        saveFinancialData();
        renderList(category);
    };
    
    showConfirmation('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.');
}

// Inline Editing Functions
function makeEditable(element, category, index, field) {
    const currentValue = element.textContent;
    const isAmount = field === 'amount';
    
    // Create input element
    const input = document.createElement('input');
    input.type = isAmount ? 'number' : 'text';
    input.value = isAmount ? financialData[category][index][field] : currentValue;
    input.className = 'editing-input';
    
    if (isAmount) {
        input.step = '0.01';
        input.min = '0';
    }
    
    // Replace element with input
    element.parentNode.replaceChild(input, element);
    input.focus();
    input.select();
    
    // Handle saving
    function saveEdit() {
        const newValue = isAmount ? parseFloat(input.value) : input.value.trim();
        
        if (!newValue || (isAmount && isNaN(newValue))) {
            cancelEdit();
            return;
        }
        
        currentAction = () => {
            financialData[category][index][field] = newValue;
            saveFinancialData();
            renderList(category);
        };
        
        showConfirmation(`Deseja alterar ${field === 'title' ? 'o título' : 'o valor'} para "${isAmount ? formatCurrency(newValue) : newValue}"?`);
    }
    
    function cancelEdit() {
        input.parentNode.replaceChild(element, input);
    }
    
    // Event listeners
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });
}

// Modal Functions
function openModal(title) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('itemModal').style.display = 'block';
    
    if (!currentEditingItem) {
        document.getElementById('itemForm').reset();
        document.getElementById('item-date').value = new Date().toISOString().split('T')[0];
    }
    
    document.getElementById('item-title').focus();
}

function closeModal() {
    document.getElementById('itemModal').style.display = 'none';
    currentEditingItem = null;
    currentCategory = null;
}

function saveItem() {
    const title = document.getElementById('item-title').value.trim();
    const amount = parseFloat(document.getElementById('item-amount').value);
    const date = document.getElementById('item-date').value;
    const description = document.getElementById('item-description').value.trim();
    
    if (!title || !amount || !date) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    const item = {
        id: currentEditingItem !== null ? financialData[currentCategory][currentEditingItem].id : Date.now(),
        title,
        amount,
        date,
        description
    };
    
    if (currentEditingItem !== null) {
        financialData[currentCategory][currentEditingItem] = item;
    } else {
        financialData[currentCategory].push(item);
    }
    
    saveFinancialData();
    renderList(currentCategory);
    closeModal();
    
    showNotification(`Item ${currentEditingItem !== null ? 'atualizado' : 'adicionado'} com sucesso!`);
}

// Confirmation Modal Functions
function showConfirmation(message) {
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirmModal').style.display = 'block';
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
    currentAction = null;
}

function confirmAction() {
    if (currentAction) {
        currentAction();
        currentAction = null;
    }
    closeConfirmModal();
}

// Rendering Functions
function renderAllLists() {
    renderList('income');
    renderList('fixedExpenses');
    renderList('variableExpenses');
}

function renderList(category) {
    const listId = category === 'income' ? 'income-list' : 
                   category === 'fixedExpenses' ? 'fixed-expenses-list' : 'variable-expenses-list';
    const list = document.getElementById(listId);
    
    if (!list) {
        console.error(`Elemento com ID '${listId}' não encontrado`);
        return;
    }
    
    const items = financialData[category] || [];
    
    if (items.length === 0) {
        const emptyMessage = category === 'income' ? 'Nenhuma receita cadastrada. Clique em "Adicionar Receita" para começar.' :
                            category === 'fixedExpenses' ? 'Nenhum gasto fixo cadastrado. Clique em "Adicionar Gasto Fixo" para começar.' :
                            'Nenhum gasto variável cadastrado. Clique em "Adicionar Gasto Variável" para começar.';
        
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>${emptyMessage}</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = items.map((item, index) => {
        const truncatedTitle = item.title && item.title.length > 25 ? item.title.substring(0, 25) + '...' : item.title || 'Sem título';
        const truncatedDescription = item.description && item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description;
        
        return `
        <div class="financial-item">
            <div class="item-header">
                <div class="item-title" 
                     onclick="makeEditable(this, '${category}', ${index}, 'title')"
                     ${item.title && item.title.length > 25 ? `data-original-title="${item.title}"` : ''}
                     title="${item.title || 'Sem título'}">
                    ${truncatedTitle}
                </div>
                <div class="item-amount ${category === 'income' ? 'income' : 'expense'}" 
                     onclick="makeEditable(this, '${category}', ${index}, 'amount')"
                     title="${formatCurrency(item.amount || 0)}">
                    ${formatCurrency(item.amount || 0)}
                </div>
            </div>
            <div class="item-details">
                <div class="item-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(item.date)}
                </div>
                ${truncatedDescription ? `<div class="item-description" 
                    ${item.description && item.description.length > 30 ? `data-original-title="${item.description}"` : ''}
                    title="${item.description}">${truncatedDescription}</div>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editItem('${category}', ${index})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="deleteItem('${category}', ${index})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
        `;
    }).join('');
    
    // Setup tooltips for truncated elements
    setTimeout(() => {
        const titlesWithTooltips = list.querySelectorAll('[data-original-title]');
        titlesWithTooltips.forEach(element => {
            setupTooltipForElement(element);
        });
    }, 50);
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    try {
        return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
    } catch (error) {
        return 'Data inválida';
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// User Functions
function logout() {
    currentAction = () => {
        // Clear data and redirect to login
        localStorage.removeItem('financialData');
        alert('Sessão encerrada com sucesso!');
        // In a real app, redirect to login page
        location.reload();
    };
    
    showConfirmation('Deseja realmente encerrar a sessão?');
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
    }
`;
document.head.appendChild(style);

// Sample data for demonstration (remove in production)
function loadSampleData() {
    if (financialData.income.length === 0) {
        financialData = {
            income: [
                {
                    id: 1,
                    title: 'Salário',
                    amount: 5000,
                    date: '2025-11-01',
                    description: 'Salário mensal'
                },
                {
                    id: 2,
                    title: 'Freelance',
                    amount: 1200,
                    date: '2025-11-15',
                    description: 'Projeto de consultoria'
                }
            ],
            fixedExpenses: [
                {
                    id: 3,
                    title: 'Aluguel',
                    amount: 1500,
                    date: '2025-11-05',
                    description: 'Aluguel mensal do apartamento'
                },
                {
                    id: 4,
                    title: 'Internet',
                    amount: 120,
                    date: '2025-11-10',
                    description: 'Plano de internet fibra'
                }
            ],
            variableExpenses: [
                {
                    id: 5,
                    title: 'Supermercado',
                    amount: 450,
                    date: '2025-11-08',
                    description: 'Compras do mês'
                },
                {
                    id: 6,
                    title: 'Combustível',
                    amount: 200,
                    date: '2025-11-12',
                    description: 'Gasolina para o carro'
                }
            ]
        };
        
        saveFinancialData();
        renderAllLists();
    }
}

// Load sample data on first visit
setTimeout(() => {
    if (!localStorage.getItem('financialData')) {
        loadSampleData();
    }
}, 1000);

// Tooltip management functions
function createTooltip(text, element) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    // Ensure tooltip stays within viewport
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
        tooltip.style.left = window.innerWidth - tooltip.offsetWidth - 10 + 'px';
    }
    if (tooltipRect.left < 0) {
        tooltip.style.left = '10px';
    }
    if (tooltipRect.top < 0) {
        tooltip.style.top = rect.bottom + 10 + 'px';
    }
    
    setTimeout(() => tooltip.classList.add('show'), 10);
    return tooltip;
}

function removeTooltip(tooltip) {
    if (tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 200);
    }
}

function setupTooltipForElement(element) {
    if (!element) return;
    
    let tooltip = null;
    
    element.addEventListener('mouseenter', function() {
        const originalTitle = this.getAttribute('data-original-title');
        if (originalTitle && originalTitle !== this.textContent.trim()) {
            tooltip = createTooltip(originalTitle, this);
        }
    });
    
    element.addEventListener('mouseleave', function() {
        if (tooltip) {
            removeTooltip(tooltip);
            tooltip = null;
        }
    });
}

// Utility function to show notifications
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Enhanced Sidebar Management for Responsive Design
let sidebarState = {
    isOpen: false,
    autoHideTimer: null,
    lastWidth: window.innerWidth,
    lastHeight: window.innerHeight
};

function initializeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    // Set initial state based on screen size
    updateSidebarVisibility();
    
    // Listen for resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            handleResponsiveChange();
        }, 100);
    });
    
    // Mobile toggle functionality
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleSidebar);
    }
    
    // Overlay click to close
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    // Auto-hide functionality for split screens
    setupAutoHide();
}

function updateSidebarVisibility() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    // Detect if likely in split screen mode
    const isSplitScreen = width < 900 && width > 600;
    const isNarrowWindow = width < 1200;
    const isUltrawide = aspectRatio > 2.1;
    
    if (width >= 1200 && !isSplitScreen) {
        // Desktop: Always show sidebar
        sidebar.classList.remove('active');
        sidebar.style.transform = 'translateX(0)';
        if (mobileToggle) mobileToggle.style.display = 'none';
        sidebarState.isOpen = true;
    } else if (isSplitScreen || (isNarrowWindow && width >= 600)) {
        // Split screen or narrow desktop: Toggle sidebar with smart behavior
        if (mobileToggle) mobileToggle.style.display = 'block';
        if (!sidebarState.isOpen) {
            sidebar.style.transform = 'translateX(-100%)';
        }
    } else {
        // Mobile: Hide by default, show toggle
        if (mobileToggle) mobileToggle.style.display = 'block';
        sidebar.style.transform = 'translateX(-100%)';
        sidebarState.isOpen = false;
    }
    
    // Adjust main content margin
    if (width >= 1200 && !isSplitScreen) {
        const sidebarWidth = isUltrawide ? '350px' : width >= 1440 ? '300px' : '280px';
        if (mainContent) mainContent.style.marginLeft = sidebarWidth;
    } else {
        if (mainContent) mainContent.style.marginLeft = '0';
    }
}

function handleResponsiveChange() {
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;
    
    // Detect significant changes that might indicate split screen
    const widthChange = Math.abs(currentWidth - sidebarState.lastWidth);
    const heightChange = Math.abs(currentHeight - sidebarState.lastHeight);
    
    if (widthChange > 100 || heightChange > 100) {
        updateSidebarVisibility();
        sidebarState.lastWidth = currentWidth;
        sidebarState.lastHeight = currentHeight;
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebarState.isOpen = !sidebarState.isOpen;
    
    if (sidebarState.isOpen) {
        sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        sidebar.style.transform = 'translateX(0)';
    } else {
        closeSidebar();
    }
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    sidebar.style.transform = 'translateX(-100%)';
    sidebarState.isOpen = false;
}

function setupAutoHide() {
    const sidebar = document.querySelector('.sidebar');
    
    // Auto-hide for split screen scenarios
    sidebar.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 600 && window.innerWidth < 900) {
            clearTimeout(sidebarState.autoHideTimer);
            sidebar.style.transform = 'translateX(0)';
        }
    });
    
    sidebar.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 600 && window.innerWidth < 900 && !sidebarState.isOpen) {
            sidebarState.autoHideTimer = setTimeout(() => {
                sidebar.style.transform = 'translateX(-240px)';
            }, 2000);
        }
    });
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeSidebar, 100);
});