// API Management
const api = {
    baseURL: 'http://localhost:5000',
    
    // Generic fetch wrapper
    async fetch(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },

    // Get all expenses
    async getExpenses() {
        try {
            const data = await this.fetch('/expenses');
            return data.expenses.map(expense => ({
                ...expense,
                date: new Date(expense.date_str),
                amount: Math.abs(expense.amount)
            }));
        } catch (error) {
            console.error('Error fetching expenses:', error);
            throw error;
        }
    },

    // Get all income
    async getIncome() {
        try {
            const data = await this.fetch('/income');
            return data.income.map(income => ({
                ...income,
                date: new Date(income.date_str),
                amount: Math.abs(income.amount)
            }));
        } catch (error) {
            console.error('Error fetching income:', error);
            throw error;
        }
    },

    // Get refunds
    async getRefunds() {
        try {
            const data = await this.fetch('/refunds');
            return data.refunds.map(refund => ({
                ...refund,
                date: new Date(refund.date_str),
                amount: Math.abs(refund.amount)
            }));
        } catch (error) {
            console.error('Error fetching refunds:', error);
            throw error;
        }
    },

    // Get all financial data
    async getAllData() {
        try {
            const [expenses, income, refunds] = await Promise.all([
                this.getExpenses(),
                this.getIncome(),
                this.getRefunds()
            ]);

            return {
                expenses,
                income,
                refunds
            };
        } catch (error) {
            console.error('Error fetching all data:', error);
            throw error;
        }
    },

    // Future endpoints for savings goals
    async getSavingsGoals() {
        return utils.storage.get('savingsGoals', []);
    },

    async saveSavingsGoal(goal) {
        const goals = await this.getSavingsGoals();

        const duplicateName = goals.find(g => 
            g.name.toLowerCase() === goal.name.toLowerCase() && 
            g.id !== goal.id
        );

        if (duplicateName) {
            throw new Error(`A goal with the name "${goal.name}" already exists. Please choose a different name.`);
        }

        const newGoal = {
            ...goal,
            id: goal.id || utils.generateId(),
            createdAt: new Date().toISOString()
        };
        
        goals.push(newGoal);
        utils.storage.set('savingsGoals', goals);
        return newGoal;
    },

    async deleteSavingsGoal(goalId) {
        const goals = await this.getSavingsGoals();
        const filteredGoals = goals.filter(g => g.id !== goalId);
        utils.storage.set('savingsGoals', filteredGoals);
        return true;
    },

    // Update savings goal progress
    async updateGoalProgress(goalId, amount) {
        const goals = await this.getSavingsGoals();
        const goalIndex = goals.findIndex(g => g.id === goalId);
        
        if (goalIndex >= 0) {
            goals[goalIndex].currentAmount = (goals[goalIndex].currentAmount || 0) + amount;
            goals[goalIndex].lastUpdated = new Date().toISOString();
            utils.storage.set('savingsGoals', goals);
            return goals[goalIndex];
        }
        
        throw new Error('Goal not found');
    },

    // WhatsApp integration
    async sendWhatsAppMessage(message) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        }
        
        try {
            const data = await this.fetch('/send-whatsapp', options);
            console.log('WhatsApp message sent successfully:', data);
            return data;
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            throw error;
        }
    }
};