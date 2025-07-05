// Reusable Components
const components = {
    // Render summary cards
    renderSummaryCards(expenses, income) {
        const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        const netSavings = totalIncome - totalExpenses;
        const monthlyAverage = totalExpenses / 3;

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
            <div class="goals">
                ${goals.map(goal => this.renderSavingsGoal(goal)).join('')}
                <button class="btn btn-secondary" onclick="components.showAddGoalModal()">
                    Add New Goal
                </button>
            </div>
        `;
    },

    // Render savings analysis
    renderSavingsAnalysis(expenses) {
        const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0) / 3;
        const discretionarySpendingCategories = ['Entertainment', 'Shopping'];
        const discretionarySpending = this.calculateDiscretionarySpending(expenses, discretionarySpendingCategories);
        
        const conservative = discretionarySpending * 0.15;
        const moderate = discretionarySpending * 0.25;
        const aggressive = discretionarySpending * 0.35;

        return `
            <div class="savings-scenarios">
                <p style="margin-bottom: 20px; color: #4a5568;">
                    Based on your spending patterns, here's how much you could potentially save each month by reducing discretionary spending (non-essential categories which include ${discretionarySpendingCategories.join(', ')}):
                </p>
                
                <div class="scenario-card" style="background: #f0fff4; border-left: 4px solid #38a169; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                    <h4 style="color: #2f855a; margin-bottom: 8px;">Conservative Approach</h4>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #2f855a;">${utils.formatCurrency(conservative)}/month</div>
                    <p style="font-size: 0.9rem; color: #4a5568; margin-top: 5px;">Reduce discretionary spending by 15%</p>
                </div>

                <div class="scenario-card" style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                    <h4 style="color: #d69e2e; margin-bottom: 8px;">Moderate Approach</h4>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #d69e2e;">${utils.formatCurrency(moderate)}/month</div>
                    <p style="font-size: 0.9rem; color: #4a5568; margin-top: 5px;">Reduce discretionary spending by 25%</p>
                </div>

                <div class="scenario-card" style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                    <h4 style="color: #dc2626; margin-bottom: 8px;">Aggressive Approach</h4>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #dc2626;">${utils.formatCurrency(aggressive)}/month</div>
                    <p style="font-size: 0.9rem; color: #4a5568; margin-top: 5px;">Reduce discretionary spending by 35%</p>
                </div>

                <div style="background: #e6fffa; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <h4 style="color: #2c7a7b; margin-bottom: 10px;">Your Current Spending Breakdown:</h4>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Monthly Expenses:</span>
                        <strong>${utils.formatCurrency(monthlyExpenses)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Discretionary Spending:</span>
                        <strong>${utils.formatCurrency(discretionarySpending)}</strong>
                    </div>
                </div>
            </div>
        `;
    },

    // Calculate discretionary spending (non-essential categories)
    calculateDiscretionarySpending(expenses, discretionaryCategories) {
        return expenses
            .filter(exp => discretionaryCategories.includes(exp.category))
            .reduce((sum, exp) => sum + exp.amount, 0) / 3; // Monthly average
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
                    ${
                        goal.currentAmount < goal.targetAmount
                            ? `<button class="btn btn-primary" onclick="components.showAddFundsModal('${goal.id}')">Add Funds</button>`
                            : ''
                    }
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
    async showAddFundsModal(goalId) {
        const amount = parseFloat(prompt('Amount to add (€):'));
        if (!amount || amount <= 0) {
            alert('Error: Amount is required. Please enter positive number.');
            return;
        }

        const goal = await api.updateGoalProgress(goalId, amount);
        
        if ((goal.currentAmount / goal.targetAmount) > 1) {
            message = `Congratulations! You've reached your savings goal of €${goal.targetAmount.toFixed(2)}!`;
            api.sendWhatsAppMessage(message);
            alert(message);
        } else if ((goal.currentAmount / goal.targetAmount) > 0.8) {
            message = `You're more than 80% of the way to your goal of €${goal.targetAmount.toFixed(2)}! Keep it up!`;
            api.sendWhatsAppMessage(message);
            alert(message);
        }

        router.refresh();
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