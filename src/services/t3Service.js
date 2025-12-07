import { api } from '../lib/api';

/**
 * T3Admin Service
 * Handles all T3Admin related API calls with fallback to mock data
 */
export const t3Service = {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats
   */
  getDashboard: async () => {
    // Mock data fallback
    const mockData = {
      success: true,
      data: {
        total_incoming_funds: 6000,
        monthly_incoming_funds: 4000,
        total_outgoing_funds: 4000,
        monthly_outgoing_funds: 4000,
        total_users: 23
      }
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.getDashboard();
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Get user list with pagination and search
   * @param {Object} params - { page, search }
   * @returns {Promise<Object>} User list
   */
  getUsers: async (params = {}) => {
    const mockData = {
      success: true,
      data: [
        { id: 'U1234567890', wallet_id: '0x1234...5678', amount: 10000, join_time: '2025-11-01 13:00:00', status: 'Active' },
        { id: 'U1234567891', wallet_id: '0x2345...6789', amount: 5000, join_time: '2025-11-02 14:00:00', status: 'Active' },
        { id: 'U1234567892', wallet_id: '0x3456...7890', amount: 2500, join_time: '2025-11-03 15:00:00', status: 'Active' },
        { id: 'U1234567893', wallet_id: '0x4567...8901', amount: 15000, join_time: '2025-11-04 16:00:00', status: 'Active' },
        { id: 'U1234567894', wallet_id: '0x5678...9012', amount: 7500, join_time: '2025-11-05 17:00:00', status: 'Active' },
      ],
      page: params.page || 1,
      limit: 20
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.getUsers(params);
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Get user details
   * @param {string} id - User ID
   * @returns {Promise<Object>} User details
   */
  getUserDetails: async (id) => {
    const mockData = {
      success: true,
      data: {
        id: id.replace('U', ''),
        username: 'user123',
        wallet_address: '0xF3A1B2C3D4E5F67890123456789ABCDEF012345',
        status: 'Active',
        created_at: '2025-11-01 13:00:00',
        total_incoming_funds: 1100,
        total_outgoing_funds: 100,
        current_unclaim_funds: 100,
        total_claimed_funds: 1000
      }
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.getUserDetails(id);
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Get accounts list
   * @param {Object} params - { page, search }
   * @returns {Promise<Object>} Accounts list
   */
  getAccounts: async (params = {}) => {
    const mockData = {
      success: true,
      data: [
        { id: 1, username: 'finance1', email: 'finance1@nbn.com', first_name: 'finance1', last_name: 'finance1', admin_type: 't3', status: 'Active', last_login: '2025-11-17 10:00:00', created_at: '2025-11-01 13:00:00' },
        { id: 2, username: 'finance2', email: 'finance2@nbn.com', first_name: 'finance2', last_name: 'finance2', admin_type: 't3', status: 'Active', last_login: '2025-11-17 09:00:00', created_at: '2025-11-01 14:00:00' },
        { id: 3, username: 'finance3', email: 'finance3@nbn.com', first_name: 'finance3', last_name: 'finance3', admin_type: 't3', status: 'Inactive', last_login: '2025-11-17 08:00:00', created_at: '2025-11-01 15:00:00' },
      ],
      page: params.page || 1,
      limit: 20
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.getAccounts(params);
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Create a new finance account
   * @param {Object} data - { username, email, password, wallet_address }
   * @returns {Promise<Object>} Created account
   */
  createAccount: async (data) => {
    const mockData = {
      success: true,
      message: 'Account created successfully',
      data: {
        id: Date.now(),
        username: data.username,
        email: data.email
      }
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.createAccount(data);
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Get account details
   * @param {string} id - Account ID
   * @returns {Promise<Object>} Account details
   */
  getAccountDetails: async (id) => {
    const mockData = {
      success: true,
      data: {
        id: parseInt(id),
        username: 'finance1',
        email: 'finance1@nbn.com',
        first_name: 'finance1',
        last_name: 'finance1',
        phone: null,
        admin_type: 't3',
        character: 'Finance',
        wallet_address: '0x1234...5678',
        status: 'Active',
        last_login: '2025-11-17 10:00:00',
        created_at: '2025-11-01 13:00:00',
        updated_at: '2025-11-01 13:00:00'
      }
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.getAccountDetails(id);
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Get pending withdrawal applications
   * @param {Object} params - { page, search, status }
   * @returns {Promise<Object>} Withdrawal applications
   */
  getWithdrawalApplications: async (params = {}) => {
    const mockData = {
      success: true,
      data: [
        { id: 1, application_id: 'ap123455551', user_id: 1, username: 'user1', referral_id: 'R001', merchant_order_no: 'mo12345', amount: 10000, wallet_address: '0xF3A....12345', reference: 'Test123', status: 'Pending', verified_by: null, verified_at: null, created_at: '2025-11-01 13:00:00' },
        { id: 2, application_id: 'ap123455552', user_id: 2, username: 'user2', referral_id: 'R002', merchant_order_no: 'mo12346', amount: 15500.75, wallet_address: '0xF3A....12346', reference: 'Test456', status: 'Pending', verified_by: null, verified_at: null, created_at: '2025-11-02 14:00:00' },
        { id: 3, application_id: 'ap123455553', user_id: 3, username: 'user3', referral_id: 'R003', merchant_order_no: 'mo12347', amount: 8250, wallet_address: '0xF3A....12347', reference: 'Test789', status: 'Pending', verified_by: null, verified_at: null, created_at: '2025-11-03 15:00:00' },
      ],
      page: params.page || 1,
      limit: 20
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.getWithdrawalApplications(params);
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Get withdrawal history
   * @param {Object} params - { page, status }
   * @returns {Promise<Object>} Withdrawal history
   */
  getWithdrawalHistory: async (params = {}) => {
    const mockData = {
      success: true,
      data: [
        { id: 1, application_id: 'ap123455551', user_id: 1, username: 'user1', referral_id: 'R001', merchant_order_no: 'mo12345', amount: 10000, wallet_address: '0xF3A....12345', reference: 'Test123', status: 'Approved', verified_by: 1, verifier_username: 'admin1', verified_at: '2025-11-01 14:00:00', created_at: '2025-11-01 13:00:00' },
        { id: 2, application_id: 'ap123455552', user_id: 2, username: 'user2', referral_id: 'R002', merchant_order_no: 'mo12346', amount: 5500, wallet_address: '0xA1B....67890', reference: 'Test456', status: 'Approved', verified_by: 1, verifier_username: 'admin1', verified_at: '2025-12-01 09:30:00', created_at: '2025-12-01 09:00:00' },
        { id: 3, application_id: 'ap123455553', user_id: 3, username: 'user3', referral_id: 'R003', merchant_order_no: 'mo12347', amount: 15750, wallet_address: '0xE2C....23456', reference: 'Test789', status: 'Rejected', verified_by: 1, verifier_username: 'admin1', verified_at: '2025-11-13 11:15:00', created_at: '2025-11-13 11:00:00' },
      ],
      page: params.page || 1,
      limit: 20
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.getWithdrawalHistory(params);
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Get withdrawal details
   * @param {string} id - Withdrawal ID or application_id
   * @returns {Promise<Object>} Withdrawal details
   */
  getWithdrawalDetails: async (id) => {
    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        data: {
          id: 1,
          application_id: id,
          user_id: 1,
          username: 'user1',
          referral_id: 'R001',
          merchant_order_no: 'mo12345',
          amount: 10000,
          wallet_address: '0xF3A1B2C3D4E5F67890123456789ABCDEF012345',
          reference: 'Test123',
          status: 'Pending',
          verified_by: null,
          verifier_username: null,
          verified_at: null,
          created_at: '2025-11-01 13:00:00',
          updated_at: '2025-11-01 13:00:00'
        }
      };
    }
    return api.t3admin.getWithdrawalDetails(id);
  },

  /**
   * Approve a withdrawal
   * @param {string} id - Withdrawal ID or application_id
   * @returns {Promise<Object>} Success response
   */
  approveWithdrawal: async (id) => {
    const mockData = {
      success: true,
      message: 'Withdrawal approved successfully'
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.approveWithdrawal(id);
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Reject a withdrawal
   * @param {string} id - Withdrawal ID or application_id
   * @returns {Promise<Object>} Success response
   */
  rejectWithdrawal: async (id) => {
    const mockData = {
      success: true,
      message: 'Withdrawal rejected successfully'
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.rejectWithdrawal(id);
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Get API keys list
   * @returns {Promise<Object>} API keys list
   */
  getAPIKeys: async () => {
    const mockData = {
      success: true,
      data: [
        { id: 1, key_name: 'Production Key', api_key: 'prod_1234...ab12', api_key_full: 'prod_1234567890abcdef1234567890abcdef', merchant_key: 'merchant123', backend_url: 'https://example.com/callback', status: 'Active', created_at: '2025-11-01 13:00:00', updated_at: '2025-11-01 13:00:00' }
      ]
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.getAPIKeys();
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Create a new API key
   * @param {Object} data - { key_name, backend_url, merchant_key }
   * @returns {Promise<Object>} Created API key (with secret_key shown only once)
   */
  createAPIKey: async (data) => {
    const mockData = {
      success: true,
      message: 'API key created successfully',
      data: {
        id: Date.now(),
        key_name: data.key_name,
        api_key: 'prod_' + Math.random().toString(36).substr(2, 32),
        secret_key: Math.random().toString(36).substr(2, 32),
        merchant_key: data.merchant_key,
        backend_url: data.backend_url
      }
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.createAPIKey(data);
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Get API logs
   * @param {Object} params - { page, search }
   * @returns {Promise<Object>} API logs
   */
  getAPILogs: async (params = {}) => {
    const mockData = {
      success: true,
      data: [
        { id: 1, admin_id: 1, level: 'INFO', source: 'API', event_endpoint: 'POST /api/v1/transactions', status: '200', ip_address: '192.168.1.1', details: 'Transaction created', created_at: '2025-11-01 13:00:00' },
        { id: 2, admin_id: 1, level: 'INFO', source: 'API', event_endpoint: 'POST /api/v1/users', status: '201', ip_address: '192.168.1.2', details: 'User created', created_at: '2025-11-01 13:05:00' },
        { id: 3, admin_id: 1, level: 'ERROR', source: 'API', event_endpoint: 'GET /api/v1/orders', status: '404', ip_address: '192.168.1.3', details: 'Order not found', created_at: '2025-11-01 13:10:00' },
      ],
      page: params.page || 1,
      limit: 50
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.getAPILogs(params);
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  /**
   * Update callback settings
   * @param {Object} data - { backend_url, key_id }
   * @returns {Promise<Object>} Success response
   */
  updateCallbackSettings: async (data) => {
    const mockData = {
      success: true,
      message: 'Callback settings updated successfully'
    };

    if (api.config.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockData;
    }
    
    try {
      const result = await api.t3admin.updateCallbackSettings(data);
      return result || mockData;
    } catch (error) {
      console.warn('[T3Service] API failed, using mock data:', error);
      return mockData;
    }
  },

  // Legacy methods for backward compatibility
  getStats: async () => {
    const dashboard = await t3Service.getDashboard();
    if (dashboard.success) {
      return {
        incoming: dashboard.data.total_incoming_funds,
        outgoing: dashboard.data.total_outgoing_funds,
        monthlyIncoming: dashboard.data.monthly_incoming_funds,
        monthlyOutgoing: dashboard.data.monthly_outgoing_funds
      };
    }
    throw new Error('Failed to fetch dashboard stats');
  },

  getWithdrawals: async () => {
    const applications = await t3Service.getWithdrawalApplications();
    if (applications.success) {
      return applications.data.map(w => ({
        id: w.application_id,
        merchant: w.merchant_order_no || w.username,
        amount: w.amount,
        date: w.created_at.split(' ')[0],
        status: w.status
      }));
    }
    throw new Error('Failed to fetch withdrawals');
  }
};
