// API communication with Python backend
class API {
    constructor() {
        this.baseURL = window.location.origin; // Adjust this for your Python server
        this.apiPrefix = '/api/v1';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${this.apiPrefix}${endpoint}`;
        
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
            console.error('API request failed:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET'
        });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // Specific API methods for your application
    async performOperation(operation, operands) {
        try {
            const result = await this.post('/calculate', {
                operation: operation,
                operands: operands
            });
            return result;
        } catch (error) {
            console.error('Calculation failed:', error);
            // Fallback for offline functionality
            return this.offlineCalculation(operation, operands);
        }
    }

    // Simple offline fallback for basic operations
    offlineCalculation(operation, operands) {
        switch (operation) {
            case 'add':
                return { result: operands.reduce((a, b) => a + b, 0) };
            case 'subtract':
                return { result: operands.reduce((a, b) => a - b) };
            case 'multiply':
                return { result: operands.reduce((a, b) => a * b, 1) };
            case 'divide':
                return { result: operands.reduce((a, b) => a / b) };
            default:
                throw new Error('Unsupported operation');
        }
    }

    async getHistory() {
        return this.get('/history');
    }

    async saveCalculation(calculation) {
        return this.post('/history', calculation);
    }
}

// Make API available globally
window.API = new API();