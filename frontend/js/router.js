// Router for navigation
const router = {
    currentRoute: null,
    data: null,

    // Initialize router
    init() {
        // Set default route
        this.navigate('smart_save');
    },

    // Navigate to a route
    async navigate(route) {
        try {
            // Update navigation active state
            this.updateNavigation(route);
            
            // Store current route
            this.currentRoute = route;
            
            // Load data if not already loaded
            if (!this.data) {
                await this.loadData();
            }
            
            // Render the requested page
            await this.renderPage(route);
            
        } catch (error) {
            console.error('Navigation error:', error);
            this.showError();
        }
    },

    // Load all financial data
    async loadData() {
        try {
            utils.show('loading');
            utils.hide('error');
            
            this.data = await api.getAllData();
            
            utils.hide('loading');
            utils.show('header');
            
        } catch (error) {
            console.error('Data loading error:', error);
            utils.hide('loading');
            utils.show('error');
            throw error;
        }
    },

    // Render the requested page
    async renderPage(route) {
        const app = document.getElementById('app');
        
        switch (route) {
            case 'smart_save':
                app.innerHTML = this.renderDashboardPage();
                this.initializeDashboard();
                break;
            case 'savings_goals':
                app.innerHTML = await this.renderSavingsGoalsPage();
                this.initializeSavingsGoals();
                break;
                
            default:
                app.innerHTML = this.renderDashboardPage();
                this.initializeDashboard();
        }
    },

    // Render dashboard page
    renderDashboardPage() {
        const { expenses, income } = this.data;

        // Calculate category data
        const categoryData = this.getCategoryData(expenses);

        return `
            ${components.renderSummaryCards(expenses, income)}
            
            <div class="dashboard-grid">
                <div class="dashboard-left">
                    <!-- Category Chart -->
                    <div class="card">
                        <h2>📊 Spending by Category</h2>
                        <div class="chart-container">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>

                    <!-- Monthly Trends Chart -->
                    <div class="card">
                        <h2>📈 Monthly Spending Trends</h2>
                        <div class="chart-container">
                            <canvas id="trendsChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="dashboard-right">
                    <!-- Category Breakdown -->
                    <div class="card">
                        <h2>🏷️ Category Breakdown</h2>
                        <div id="category-breakdown">
                            ${components.renderCategoryBreakdown(categoryData)}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transaction History -->
            <div class="card">
                <h2>📝 Transaction History</h2>
                
                ${components.renderFilters(expenses)}
                
                <div class="transactions-table">
                    ${components.renderTransactionsTable(expenses)}
                </div>
            </div>
        `;
    },

    // Render savings goals page
    async renderSavingsGoalsPage() {
        const goals = await api.getSavingsGoals();
        const { expenses } = this.data;

        return `
            <div class="card">
                <h2>🎯 Savings Goals</h2>
                <div id="savings-goals">
                    ${components.renderSavingsGoals(goals)}
                </div>
            </div>

            ${goals.length > 0 ? `
            <div class="card">
                <h2>📊 Goals Progress</h2>
                <div class="chart-container">
                    <canvas id="savingsChart"></canvas>
                </div>
            </div>
            ` : ''}

            <div class="dashboard-grid">
                <div class="card">
                    <h2>💰 Savings Potential Analysis</h2>
                    <div id="savings-analysis">
                        ${components.renderSavingsAnalysis(expenses)}
                    </div>
                </div>

                <div class="card">
                    <h2>💡 Savings Recommendations</h2>
                    <div id="savings-recommendations">
                        ${components.renderRecommendations(expenses, goals)}
                    </div>
                </div>
            </div>
        `;
    },

    // Initialize dashboard functionality
    initializeDashboard() {
        const { expenses, income } = this.data;
        
        // Create charts
        charts.createCategoryChart('categoryChart', this.getCategoryData(expenses));
        charts.createTrendsChart('trendsChart', this.getMonthlyData(expenses, income));
        
        // Setup filters
        this.setupFilters();
        
        // Animate summary cards
        setTimeout(() => {
            components.animateSummaryCards();
        }, 100);
    },

    // Initialize savings goals functionality
    async initializeSavingsGoals() {
        const goals = await api.getSavingsGoals();
        
        if (goals.length > 0) {
            charts.createSavingsChart('savingsChart', goals);
        }
    },

    // Setup transaction filters
    setupFilters() {
        const monthFilter = document.getElementById('month-filter');
        const categoryFilter = document.getElementById('category-filter');
        const searchFilter = document.getElementById('search-filter');

        if (monthFilter) monthFilter.addEventListener('change', () => this.applyFilters());
        if (categoryFilter) categoryFilter.addEventListener('change', () => this.applyFilters());
        if (searchFilter) searchFilter.addEventListener('input', utils.debounce(() => this.applyFilters(), 300));
    },

    // Apply transaction filters
    applyFilters() {
        const monthFilter = document.getElementById('month-filter')?.value;
        const categoryFilter = document.getElementById('category-filter')?.value;
        const searchFilter = document.getElementById('search-filter')?.value.toLowerCase();

        let filteredExpenses = this.data.expenses.filter(expense => {
            const monthMatch = !monthFilter || utils.getMonthKey(expense.date) === monthFilter;
            const categoryMatch = !categoryFilter || expense.category === categoryFilter;
            const searchMatch = !searchFilter || 
                expense.description.toLowerCase().includes(searchFilter) ||
                expense.category.toLowerCase().includes(searchFilter);

            return monthMatch && categoryMatch && searchMatch;
        });

        // Update transactions table
        const tableContainer = document.querySelector('.transactions-table');
        if (tableContainer) {
            tableContainer.innerHTML = components.renderTransactionsTable(filteredExpenses);
        }
    },

    // Get category data for charts
    getCategoryData(expenses) {
        const categories = {};
        expenses.forEach(expense => {
            if (!categories[expense.category]) {
                categories[expense.category] = { total: 0, count: 0 };
            }
            categories[expense.category].total += expense.amount;
            categories[expense.category].count += 1;
        });

        return Object.entries(categories)
            .map(([category, data]) => ({ category, ...data }))
            .sort((a, b) => b.total - a.total);
    },

    // Get monthly data for trends
    getMonthlyData(expenses, income) {
        const months = {};
        
        // Process expenses
        expenses.forEach(expense => {
            const month = utils.getMonthKey(expense.date);
            if (!months[month]) {
                months[month] = { expenses: 0, income: 0 };
            }
            months[month].expenses += expense.amount;
        });

        // Process income
        income.forEach(incomeItem => {
            const month = utils.getMonthKey(incomeItem.date);
            if (!months[month]) {
                months[month] = { expenses: 0, income: 0 };
            }
            months[month].income += incomeItem.amount;
        });

        return Object.entries(months)
            .map(([month, data]) => ({
                month: utils.formatDate(month + '-01', 'monthYear'),
                ...data
            }))
            .sort();
    },

    // Update navigation active state
    updateNavigation(route) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-nav') === route) {
                link.classList.add('active');
            }
        });
    },

    // Show error state
    showError() {
        utils.hide('loading');
        utils.show('error');
    },

    // Refresh current page
    async refresh() {
        this.data = null; // Force data reload
        await this.navigate(this.currentRoute);
    }
};