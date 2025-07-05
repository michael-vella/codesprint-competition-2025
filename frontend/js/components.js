// Reusable Components
const components = {
    // Render summary cards
    renderSummaryCards(expenses, income) {
        const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        const netSavings = totalIncome - totalExpenses;
        const monthlyAverage = totalExpenses / 3; // Assuming 3 months of data

        return `
            <div class="summary-cards">
                <div class="summary-card">
                    <h3>Total Income</h3>
                    <div class="amount" data-animate="${totalIncome}">${utils.formatCurrency(0)}</div>
                    <div class="subtitle">Last 3 months</div>
                </div>
                <div class="summary-card">
                    <h3>Total Expenses</h3>
                    <div class="amount" data-animate="${totalExpenses}">${utils.formatCurrency(0)}</div>
                    <div class="subtitle">Last 3 months</div>
                </div>
                <div class="summary-card">
                    <h3>Net Savings</h3>
                    <div class="amount" data-animate="${netSavings}">${utils.formatCurrency(0)}</div>
                    <div class="subtitle">Income - Expenses</div>
                </div>
                <div class="summary-card">
                    <h3>Monthly Average</h3>
                    <div class="amount" data-animate="${monthlyAverage}">${utils.formatCurrency(0)}</div>
                    <div class="subtitle">Spending per month</div>
                </div>
            </div>
        `;
    },

    // Render category breakdown
    renderCategoryBreakdown(categoryData) {
        const total = categoryData.reduce((sum, cat) => sum + cat.total, 0);
        
        return categoryData.map(item => {
            const percentage = utils.calculatePercentage(item.total, total);
            const categoryClass = utils.getCategoryClass(item.category);
            
            return `
                <div class="category-breakdown-item">
                    <div class="category-header">
                        <span class="category-badge ${categoryClass}">${item.category}</span>
                        <strong>${utils.formatCurrency(item.total)}</strong>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="category-stats">
                        ${percentage}% of total spending • ${item.count} transactions
                    </div>
                </div>
            `;
        }).join('');
    },

    // Render transactions table
    renderTransactionsTable(transactions) {
        const tableRows = transactions
            .sort((a, b) => b.date - a.date)
            .map(transaction => `
                <tr>
                    <td>${utils.formatDate(transaction.date, 'short')}</td>
                    <td>${transaction.description}</td>
                    <td>
                        <span class="category-badge ${utils.getCategoryClass(transaction.category)}">
                            ${transaction.category}
                        </span>
                    </td>
                    <td class="amount-negative">-${utils.formatCurrency(transaction.amount)}</td>
                </tr>
            `).join('');

        return `
            <table id="transactions-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;
    },

    // Render filter controls
    renderFilters(expenses) {
        const months = [...new Set(expenses.map(expense => 
            utils.getMonthKey(expense.date)
        ))].sort();
        
        const categories = [...new Set(expenses.map(expense => expense.category))].sort();

        const monthOptions = months.map(month => 
            `<option value="${month}">${utils.formatDate(month + '-01', 'monthYear')}</option>`
        ).join('');

        const categoryOptions = categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');

        return `
            <div class="filters">
                <div class="filter-group">
                    <label for="month-filter">Month</label>
                    <select id="month-filter">
                        <option value="">All Months</option>
                        ${monthOptions}
                    </select>
                </div>
                <div class="filter-group">
                    <label for="category-filter">Category</label>
                    <select id="category-filter">
                        <option value="">All Categories</option>
                        ${categoryOptions}
                    </select>
                </div>
                <div class="filter-group">
                    <label for="search-filter">Search</label>
                    <input type="text" id="search-filter" placeholder="Search transactions...">
                </div>
            </div>
        `;
    },

    // Render savings goals
    renderSavingsGoals(goals) {
        if (!goals || goals.length === 0) {
            return `
                <div class="text-center" style="padding: 40px;">
                    <h3>No savings goals yet</h3>
                    <p>Create your first savings goal to start tracking your progress!</p>
                    <button class="btn btn-primary mt-20" onclick="components.showAddGoalModal()">
                        Add Savings Goal
                    </button>
                </div>
            `;
        }

        return `
            <div class="savings-goals">
                ${goals.map(goal => this.renderSavingsGoal(goal)).join('')}
                <button class="btn btn-secondary" onclick="components.showAddGoalModal()">
                    Add New Goal
                </button>
            </div>
        `;
    },

    // Render individual savings goal
    renderSavingsGoal(goal) {
        const progress = ((goal.currentAmount || 0) / goal.targetAmount) * 100;
        const remaining = goal.targetAmount - (goal.currentAmount || 0);
        const deadline = new Date(goal.deadline);
        const monthsLeft = utils.monthsBetween(new Date(), deadline);
        
        return `
            <div class="goal-card">
                <div class="goal-header">
                    <div class="goal-title">${goal.name}</div>
                    <div class="goal-amount">${utils.formatCurrency(goal.currentAmount || 0)} / ${utils.formatCurrency(goal.targetAmount)}</div>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-text">
                        <span>${progress.toFixed(1)}% complete</span>
                        <span>${utils.formatCurrency(remaining)} remaining</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
                <div class="goal-deadline">
                    Target date: ${utils.formatDate(deadline, 'long')} (${monthsLeft} months left)
                </div>
                <div style="margin-top: 15px;">
                    <button class="btn btn-primary" onclick="components.showAddFundsModal('${goal.id}')">
                        Add Funds
                    </button>
                    <button class="btn btn-danger" onclick="components.deleteGoal('${goal.id}')">
                        Delete Goal
                    </button>
                </div>
            </div>
        `;
    },

    // Render recommendations
    renderRecommendations(expenses, goals) {
        const recommendations = this.generateRecommendations(expenses, goals);
        
        if (recommendations.length === 0) {
            return '<p>No recommendations available at this time.</p>';
        }

        return `
            <div class="recommendations">
                ${recommendations.map(rec => `
                    <div class="recommendation-card">
                        <div class="recommendation-title">${rec.title}</div>
                        <div class="recommendation-description">${rec.description}</div>
                        <div class="recommendation-impact">${rec.impact}</div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Generate smart recommendations
    generateRecommendations(expenses, goals) {
        const recommendations = [];
        
        // Analyze spending patterns
        const categoryTotals = utils.groupBy(expenses, 'category');
        const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0) / 3;

        // Food delivery recommendation
        const foodExpenses = expenses.filter(exp => 
            exp.description.toLowerCase().includes('domino') || 
            exp.description.toLowerCase().includes('mcdonald')
        );
        
        if (foodExpenses.length > 8) {
            const totalFood = foodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const potential = totalFood * 0.3;
            recommendations.push({
                title: 'Reduce Food Delivery',
                description: `You've ordered food delivery ${foodExpenses.length} times in the last 3 months.`,
                impact: `Reducing by 30% could save you ${utils.formatCurrency(potential)} per quarter.`
            });
        }

        // Subscription analysis
        const subscriptions = expenses.filter(exp => exp.category === 'Subscriptions');
        if (subscriptions.length > 0) {
            const duplicates = this.findDuplicateSubscriptions(subscriptions);
            if (duplicates.length > 0) {
                recommendations.push({
                    title: 'Duplicate Subscriptions Detected',
                    description: `You may have duplicate ${duplicates.join(', ')} subscriptions.`,
                    impact: 'Review and cancel duplicates to save money.'
                });
            }
        }

        // Savings goal recommendations
        if (goals && goals.length > 0) {
            const totalGoalAmount = goals.reduce((sum, goal) => sum + (goal.targetAmount - (goal.currentAmount || 0)), 0);
            const recommendedSavings = monthlyExpenses * 0.2;
            
            recommendations.push({
                title: 'Boost Your Savings',
                description: `Based on your spending, you could save ${utils.formatCurrency(recommendedSavings)} per month.`,
                impact: `This would help you reach your goals ${Math.floor(totalGoalAmount / recommendedSavings)} months sooner.`
            });
        }

        return recommendations;
    },

    // Find duplicate subscriptions
    findDuplicateSubscriptions(subscriptions) {
        const services = {};
        subscriptions.forEach(sub => {
            const service = sub.description.toLowerCase();
            if (service.includes('spotify')) services.spotify = (services.spotify || 0) + 1;
            if (service.includes('netflix')) services.netflix = (services.netflix || 0) + 1;
        });
        
        return Object.entries(services)
            .filter(([service, count]) => count > 3) // More than 1 per month
            .map(([service]) => service);
    },

    // Render alerts
    renderAlerts(expenses) {
        const alerts = this.generateAlerts(expenses);
        
        if (alerts.length === 0) return '';

        return `
            <div class="alerts">
                ${alerts.map(alert => `
                    <div class="alert alert-${alert.type}">
                        ${alert.message}
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Generate alerts based on spending patterns
    generateAlerts(expenses) {
        const alerts = [];
        const currentMonth = utils.getMonthKey(new Date());
        const currentMonthExpenses = expenses.filter(exp => 
            utils.getMonthKey(exp.date) === currentMonth
        );
        
        const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const averageMonthly = expenses.reduce((sum, exp) => sum + exp.amount, 0) / 3;
        
        // High spending alert
        if (currentMonthTotal > averageMonthly * 1.3) {
            alerts.push({
                type: 'warning',
                message: `You've spent ${utils.formatCurrency(currentMonthTotal)} this month, which is 30% higher than your average.`
            });
        }
        
        // Category-specific alerts
        const categorySpending = utils.groupBy(currentMonthExpenses, 'category');
        Object.entries(categorySpending).forEach(([category, transactions]) => {
            const total = transactions.reduce((sum, t) => sum + t.amount, 0);
            const avgForCategory = expenses
                .filter(exp => exp.category === category)
                .reduce((sum, exp) => sum + exp.amount, 0) / 3;
            
            if (total > avgForCategory * 1.5) {
                alerts.push({
                    type: 'info',
                    message: `Your ${category} spending is 50% higher than usual this month.`
                });
            }
        });

        return alerts;
    },

    // Modal for adding savings goal
    showAddGoalModal() {
        // This would typically show a modal - for now, we'll use a simple prompt
        const name = prompt('Goal name:');
        if (!name) {
            alert('Error: Goal name is required.');
            return;
        }
        
        const targetAmountInput = prompt('Target amount (€):');
        if (!targetAmountInput) {
            alert('Error: Target amount is required.');
            return;
        }

        const targetAmount = parseFloat(targetAmountInput);
        if (!targetAmount || targetAmount <= 0) {
            alert('Error: Target amount must be a positive number.');
            return;
        }
        
        const deadline = prompt('Target date (YYYY-MM-DD):');
        if (!deadline) {
            alert('Error: Target date is required.');
            return;
        }
        
        // Validate date format and check if it's in the future
        const deadlineDate = new Date(deadline);
        const today = new Date();
        
        // Check if date is valid
        if (isNaN(deadlineDate.getTime())) {
            alert('Error: Please enter a valid date in YYYY-MM-DD format.');
            return;
        }
        
        // Set today to start of day for comparison
        today.setHours(0, 0, 0, 0);
        deadlineDate.setHours(0, 0, 0, 0);
        
        // Check if deadline is in the future
        if (deadlineDate <= today) {
            alert('Error: Target date must be in the future.');
            return;
        }
        
        const goal = {
            name,
            targetAmount,
            deadline,
            currentAmount: 0,
            priority: 'medium'
        };
        
        this.saveGoal(goal);
    },

    // Save goal
    async saveGoal(goal) {
        try {
            await api.saveSavingsGoal(goal);
            router.refresh();
        } catch (error) {
            alert('Error saving goal: ' + error.message);
        }
    },

    // Modal for adding funds to goal
    showAddFundsModal(goalId) {
        const amount = parseFloat(prompt('Amount to add (€):'));
        if (!amount || amount <= 0) {
            alert('Error: Amount is required. Please enter positive number.');
            return;
        }
        
        api.updateGoalProgress(goalId, amount)
            .then(() => {
                router.refresh();
            })
            .catch(error => {
                alert('Error updating goal: ' + error.message);
            });
    },

    // Delete goal
    deleteGoal(goalId) {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        api.deleteSavingsGoal(goalId)
            .then(() => {
                router.refresh();
            })
            .catch(error => {
                alert('Error deleting goal: ' + error.message);
            });
    },

    // Animate summary cards
    animateSummaryCards() {
        document.querySelectorAll('[data-animate]').forEach(element => {
            const targetValue = parseFloat(element.getAttribute('data-animate'));
            utils.animateNumber(element, 0, targetValue);
        });
    }
};