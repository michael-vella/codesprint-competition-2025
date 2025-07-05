// Financial Bot Management
const bot = {
    messages: [],
    isTyping: false,
    
    // Initialize the bot
    init() {
        this.loadChatHistory();
        this.setupEventListeners();
    },
    
    // Setup event listeners
    setupEventListeners() {
        const input = document.getElementById('bot-input');
        const sendButton = document.getElementById('send-button');
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }
    },
    
    // Send message
    async sendMessage(message = null) {
        const input = document.getElementById('bot-input');
        const text = message || input?.value.trim();
        
        if (!text || this.isTyping) return;
        
        // Clear input
        if (input) input.value = '';
        
        // Add user message
        this.addMessage('user', text);
        
        // Show typing indicator
        this.showTyping();
        
        try {
            // Get bot response
            const response = await this.getBotResponse(text);
            this.hideTyping();
            this.addMessage('bot', response);
        } catch (error) {
            this.hideTyping();
            this.addMessage('bot', 'Sorry, I encountered an error processing your request. Please re-check your OPEN API KEY and make sure that your OPEN AI version accepts API requests.');
            console.error('Bot error:', error);
        }
    },
    
    // Get bot response from API
    async getBotResponse(userMessage) {
        const apiKey = utils.storage.get('openai_api_key');
        
        if (!apiKey) {
            throw new Error('API key not found');
        }
        
        // Prepare financial context
        const context = this.prepareFinancialContext();
        
        const prompt = `You are a helpful financial assistant analyzing the user's spending data. Here's their financial summary:

${context}

User question: ${userMessage}

Please provide a helpful, specific answer based on their actual financial data. Use exact amounts and be conversational. If referring to amounts, format them as €X.XX. Keep responses concise but informative.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful financial assistant. Provide specific, actionable advice based on the user\'s actual spending data. If the user asks a non finance-related question, politely redirect them to financial topics.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        console.log(response)
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    },
    
    // Prepare financial context for the AI
    prepareFinancialContext() {
        if (!router.data) return 'No financial data available.';
        
        const { expenses, income } = router.data;
        
        // Calculate totals
        const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        const netSavings = totalIncome - totalExpenses;
        
        // Category breakdown
        const categories = {};
        expenses.forEach(expense => {
            if (!categories[expense.category]) {
                categories[expense.category] = { total: 0, count: 0 };
            }
            categories[expense.category].total += expense.amount;
            categories[expense.category].count += 1;
        });
        
        const categoryBreakdown = Object.entries(categories)
            .map(([category, data]) => `${category}: €${data.total.toFixed(2)} (${data.count} transactions)`)
            .join('\n');
        
        // Monthly averages
        const monthlyIncome = totalIncome / 3;
        const monthlyExpenses = totalExpenses / 3;
        
        return `
FINANCIAL SUMMARY (Last 3 months):
- Total Income: €${totalIncome.toFixed(2)}
- Total Expenses: €${totalExpenses.toFixed(2)}
- Net Savings: €${netSavings.toFixed(2)}
- Monthly Average Income: €${monthlyIncome.toFixed(2)}
- Monthly Average Expenses: €${monthlyExpenses.toFixed(2)}

SPENDING BY CATEGORY:
${categoryBreakdown}

RECENT TRANSACTIONS: ${expenses.slice(0, 30).map(exp => 
    `${exp.description} (${exp.category}): €${exp.amount.toFixed(2)}`
).join(', ')}
        `;
    },
    
    // Add message to chat
    addMessage(sender, text) {
        const message = { sender, text, timestamp: new Date() };
        this.messages.push(message);
        this.renderMessage(message);
        this.saveChatHistory();
        this.scrollToBottom();
    },
    
    // Render message in chat
    renderMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender}`;
        
        let formattedText = message.text;
        
        messageDiv.innerHTML = formattedText;
        messagesContainer.appendChild(messageDiv);
    },
    
    // Show typing indicator
    showTyping() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
        
        // Disable send button
        const sendButton = document.getElementById('send-button');
        if (sendButton) sendButton.disabled = true;
    },
    
    // Hide typing indicator
    hideTyping() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.remove();
        
        // Enable send button
        const sendButton = document.getElementById('send-button');
        if (sendButton) sendButton.disabled = false;
    },
    
    // Scroll to bottom of chat
    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    },
    
    // Save chat history
    saveChatHistory() {
        utils.storage.set('bot_chat_history', this.messages);
    },
    
    // Load chat history
    loadChatHistory() {
        this.messages = utils.storage.get('bot_chat_history', []);
        this.renderChatHistory();
    },
    
    // Render chat history
    renderChatHistory() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';
        this.messages.forEach(message => this.renderMessage(message));
        
        // Add welcome message if no history
        if (this.messages.length === 0) {
            this.addMessage('bot', 'Hello! I\'m your financial assistant. I can help you understand your spending patterns, find savings opportunities, and answer questions about your finances. What would you like to know?');
        }
    },
    
    // Clear chat history
    clearHistory() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.messages = [];
            utils.storage.remove('bot_chat_history');
            this.renderChatHistory();
        }
    },
    
    // Get quick question suggestions
    getQuickQuestions() {
        return [
            "What is my biggest spending category?",
            "Give me details on my last 5 transactions",
            "What are my top 3 expense categories?",
            "How can I save more money?",
        ];
    }
};