// Main Application
class SmartSaveApp {
    constructor() {
        this.initialized = false;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    // Initialize the application
    async init() {
        try {
            console.log('Initializing SmartSave App...');
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize router
            await router.init();
            
            this.initialized = true;
            console.log('SmartSave App initialized successfully');
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.handleInitError(error);
        }
    }

    // Setup global event listeners
    setupEventListeners() {
        // Handle window resize for charts
        window.addEventListener('resize', utils.debounce(() => {
            charts.resizeAll();
        }, 250));

        // Handle offline/online states
        window.addEventListener('offline', () => {
            this.showOfflineMessage();
        });

        window.addEventListener('online', () => {
            this.hideOfflineMessage();
            if (this.initialized) {
                router.refresh();
            }
        });

        // Prevent form submissions that might cause page reloads
        document.addEventListener('submit', (e) => {
            e.preventDefault();
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Alt + 1: Dashboard
        if (e.altKey && e.key === '1') {
            e.preventDefault();
            router.navigate('smart_save');
        }
        
        // Alt + 2: Savings Engine
        if (e.altKey && e.key === '2') {
            e.preventDefault();
            router.navigate('savings_goals');
        }
    }

    // Handle initialization errors
    handleInitError(error) {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`Retrying initialization (${this.retryCount}/${this.maxRetries})...`);
            
            setTimeout(() => {
                this.init();
            }, 2000 * this.retryCount); // Exponential backoff
        } else {
            this.showFatalError(error);
        }
    }

    // Show fatal error
    showFatalError(error) {
        utils.hide('loading');
        
        const errorDiv = document.getElementById('error');
        if (errorDiv) {
            errorDiv.innerHTML = `
                <h3>Application Error</h3>
                <p>Failed to initialize SmartSave after ${this.maxRetries} attempts.</p>
                <p>Please check your internet connection and ensure the backend server is running.</p>
                <details style="margin-top: 15px;">
                    <summary>Technical Details</summary>
                    <pre style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px; font-size: 0.8rem;">${error.stack || error.message}</pre>
                </details>
                <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 15px;">
                    Retry
                </button>
            `;
            utils.show('error');
        }
    }

    // Show offline message
    showOfflineMessage() {
        const offlineDiv = document.createElement('div');
        offlineDiv.id = 'offline-message';
        offlineDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f59e0b;
            color: white;
            text-align: center;
            padding: 10px;
            z-index: 1001;
            font-weight: 500;
        `;
        offlineDiv.textContent = 'You are currently offline. Some features may not work.';
        
        document.body.appendChild(offlineDiv);
    }

    // Hide offline message
    hideOfflineMessage() {
        const offlineDiv = document.getElementById('offline-message');
        if (offlineDiv) {
            offlineDiv.remove();
        }
    }

    // Get app status
    getStatus() {
        return {
            initialized: this.initialized,
            retryCount: this.retryCount,
            online: navigator.onLine,
            currentRoute: router.currentRoute,
            dataLoaded: !!router.data
        };
    }

    // Restart the application
    async restart() {
        this.initialized = false;
        this.retryCount = 0;
        
        // Clear any existing data
        router.data = null;
        
        // Clear charts
        Object.keys(charts.instances).forEach(chartId => {
            charts.destroy(chartId);
        });
        
        // Reinitialize
        await this.init();
    }
}

// Global app instance
const app = new SmartSaveApp();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    
    // Only show error UI if app is not initialized
    if (!app.initialized) {
        app.handleInitError(e.error);
    }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    
    // Prevent the default browser behavior
    e.preventDefault();
    
    // Only show error UI if app is not initialized
    if (!app.initialized) {
        app.handleInitError(e.reason);
    }
});

// Expose app instance globally for debugging
window.smartSaveApp = app;
window.router = router;
window.api = api;
window.utils = utils;
window.charts = charts;
window.components = components;

// Development helpers
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development mode utilities
    window.dev = {
        // Get current app state
        getState: () => ({
            app: app.getStatus(),
            router: {
                currentRoute: router.currentRoute,
                hasData: !!router.data
            },
            charts: Object.keys(charts.instances),
            storage: {
                savingsGoals: utils.storage.get('savingsGoals', [])
            }
        }),
        
        // Clear all data
        clearData: () => {
            utils.storage.remove('savingsGoals');
            router.data = null;
            console.log('All data cleared');
        },
        
        // Simulate offline
        goOffline: () => {
            app.showOfflineMessage();
        },
        
        // Simulate online
        goOnline: () => {
            app.hideOfflineMessage();
        }
    };
    
    console.log('SmartSave App - Development mode');
    console.log('Available dev tools: window.dev');
}