// Utility Functions
const utils = {
    // Format currency
    formatCurrency(amount, currency = 'EUR') {
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format date
    formatDate(date, format = 'short') {
        const options = {
            short: { month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric' },
            monthYear: { year: 'numeric', month: 'long' }
        };
        
        return new Intl.DateTimeFormat('en-US', options[format]).format(new Date(date));
    },

    // Get category class for styling
    getCategoryClass(category) {
        const classMap = {
            'Food & Groceries': 'category-food',
            'Entertainment': 'category-entertainment',
            'Subscriptions': 'category-subscriptions',
            'Rent & Utilities': 'category-rent',
            'Shopping': 'category-shopping',
            'Transport': 'category-transport',
            'Other': 'category-other'
        };
        return classMap[category] || 'category-other';
    },

    // Group array by key
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = (groups[item[key]] = groups[item[key]] || []);
            group.push(item);
            return groups;
        }, {});
    },

    // Calculate percentage
    calculatePercentage(value, total) {
        return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show/hide elements
    show(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.classList.remove('hidden');
    },

    hide(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.classList.add('hidden');
    },

    // Generate random ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    // Calculate months between dates
    monthsBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    },

    // Get month key from date
    getMonthKey(date) {
        return new Date(date).toISOString().substring(0, 7);
    },

    // Calculate trend
    calculateTrend(current, previous) {
        if (previous === 0) return { direction: 'neutral', percentage: 0 };
        
        const change = ((current - previous) / previous) * 100;
        return {
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
            percentage: Math.abs(change).toFixed(1)
        };
    },

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Animate number counting
    animateNumber(element, start, end, duration = 1000) {
        const range = end - start;
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (range * easeOutQuart);
            
            element.textContent = utils.formatCurrency(current);
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        requestAnimationFrame(updateNumber);
    },

    // Storage utilities
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn('localStorage not available');
            }
        },
        
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn('localStorage not available');
            }
        }
    }
};