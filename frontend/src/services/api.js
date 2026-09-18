import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fraudService = {
  /**
   * Submit transaction for fraud prediction.
   * Backend expects a specific schema for ML model input.
   */
  async checkTransaction(transactionData) {
    try {
      // Convert boolean-like strings/checkboxes to 0 or 1 as expected by backend
      const payload = {
        ...transactionData,
        new_device: transactionData.new_device ? 1 : 0,
        new_recipient: transactionData.new_recipient ? 1 : 0,
        location_change: transactionData.location_change ? 1 : 0,
        amount: parseFloat(transactionData.amount),
        transaction_hour: parseInt(transactionData.transaction_hour),
        velocity: parseFloat(transactionData.velocity),
        account_age_days: parseInt(transactionData.account_age_days),
        avg_transaction_amount: parseFloat(transactionData.avg_transaction_amount),
      };

      const response = await api.post('/predict', payload);
      return response.data;
    } catch (error) {
      console.error('Error checking transaction:', error);
      throw error;
    }
  },

  /**
   * Verify a locked transaction.
   * Endpoint: POST /security/verify
   */
  async verifyTransaction(lockId) {
    try {
      const response = await api.post('/security/verify', { lock_id: lockId });
      return response.data;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      throw error;
    }
  },

  /**
   * Report a transaction as fraud.
   * Endpoint: POST /security/report-fraud
   */
  async reportFraud(lockId) {
    try {
      const response = await api.post('/security/report-fraud', { lock_id: lockId });
      return response.data;
    } catch (error) {
      console.error('Error reporting fraud:', error);
      throw error;
    }
  },

  /**
   * Fetch transaction history.
   * Endpoint: GET /transactions
   */
  async getTransactionHistory(filters = {}) {
    try {
      const response = await api.get('/transactions', { params: filters });
      return response.data;
    } catch (error) {
      console.warn('Real transaction history failed, using mock fallback');
      return [
        { id: 'TX1001', amount: 1200, recipient: 'John Doe', location: 'New York', status: 'Normal', riskLevel: 'LOW', date: '2026-09-15' },
        { id: 'TX1002', amount: 50000, recipient: 'Unknown', location: 'Unknown', status: 'Locked', riskLevel: 'HIGH', date: '2026-09-16' },
        { id: 'TX1003', amount: 800, recipient: 'Jane Smith', location: 'London', status: 'Normal', riskLevel: 'LOW', date: '2026-09-16' },
        { id: 'TX1004', amount: 15000, recipient: 'CryptoExchange', location: 'Singapore', status: 'High Risk', riskLevel: 'MEDIUM', date: '2026-09-17' },
      ];
    }
  },

  /**
   * Get admin dashboard stats.
   * Endpoint: GET /dashboard/stats
   */
  async getAdminStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.warn('Real stats failed, using mock fallback');
      return {
        totalTransactions: 12450,
        highRiskCount: 342,
        currentlyLocked: 89,
        securityIncidents: 12,
        fraudTrend: [
          { name: 'Mon', count: 12 }, { name: 'Tue', count: 19 }, { name: 'Wed', count: 15 },
          { name: 'Thu', count: 22 }, { name: 'Fri', count: 30 }, { name: 'Sat', count: 10 }, { name: 'Sun', count: 8 },
        ],
        riskDistribution: [
          { name: 'Low', value: 85 }, { name: 'Medium', value: 10 }, { name: 'High', value: 5 },
        ]
      };
    }
  },
};
