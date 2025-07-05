// Chart Management
const charts = {
    instances: {},

    // Default chart colors
    colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#38a169',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        categories: ['#fd7f6f', '#7eb0d3', '#b2e061', '#bd7ebe', '#ffb55a', '#8ce99a', '#868e96']
    },

    // Destroy existing chart
    destroy(chartId) {
        if (this.instances[chartId]) {
            this.instances[chartId].destroy();
            delete this.instances[chartId];
        }
    },

    // Create category pie chart
    createCategoryChart(canvasId, data) {
        this.destroy(canvasId);
        
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        this.instances[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(item => item.category),
                datasets: [{
                    data: data.map(item => item.total),
                    backgroundColor: this.colors.categories,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${utils.formatCurrency(context.parsed)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    },

    // Create monthly trends chart
    createTrendsChart(canvasId, monthlyData) {
        this.destroy(canvasId);
        
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(item => item.month),
                datasets: [{
                    label: 'Monthly Expenses',
                    data: monthlyData.map(item => item.expenses),
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }, {
                    label: 'Monthly Income',
                    data: monthlyData.map(item => item.income),
                    borderColor: this.colors.success,
                    backgroundColor: this.colors.success + '20',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.success,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: this.colors.primary,
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${utils.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            callback: (value) => utils.formatCurrency(value, 'EUR').replace('€', '€')
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    },

    // Create savings progress chart
    createSavingsChart(canvasId, goals) {
        this.destroy(canvasId);
        
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        const data = goals.map(goal => ({
            label: goal.name,
            current: goal.currentAmount || 0,
            target: goal.targetAmount,
            percentage: ((goal.currentAmount || 0) / goal.targetAmount) * 100
        }));

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.label),
                datasets: [{
                    label: 'Current Amount',
                    data: data.map(item => item.current),
                    backgroundColor: this.colors.primary,
                    borderRadius: 6
                }, {
                    label: 'Target Amount',
                    data: data.map(item => item.target),
                    backgroundColor: this.colors.primary + '30',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const goal = data[context.dataIndex];
                                if (context.datasetIndex === 0) {
                                    return `Current: ${utils.formatCurrency(context.parsed.y)} (${goal.percentage.toFixed(1)}%)`;
                                } else {
                                    return `Target: ${utils.formatCurrency(context.parsed.y)}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => utils.formatCurrency(value)
                        }
                    }
                }
            }
        });
    },

    // Resize all charts (useful for responsive layouts)
    resizeAll() {
        Object.values(this.instances).forEach(chart => {
            chart.resize();
        });
    }
};