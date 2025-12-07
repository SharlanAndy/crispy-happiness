// Configuration for API connection
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || '/api', // Use relative path to leverage Vite proxy
  useMock: false, // Set to false to test real API endpoints
  timeout: 10000,
  fallbackToMock: false, // Disable fallback to see real API errors
};

// Generic fetch wrapper with fallback to mock
async function request(endpoint, options = {}) {
  if (API_CONFIG.useMock) {
    console.warn(`[Mock API] Request to ${endpoint} intercepted.`);
    return null; // Mock services should handle data return before calling this if useMock is true
  }

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API Error' }));
      console.error(`API Error [${response.status}]:`, JSON.stringify(error, null, 2));
      throw new Error(error.message || error.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Failed:', error);
    
    // Fallback to mock if enabled
    if (API_CONFIG.fallbackToMock) {
      console.warn(`[Fallback] API request failed for ${endpoint}, will use mock data instead.`);
      return null; // Return null to let service handle mock fallback
    }
    
    throw error;
  }
}

export const api = {
  config: API_CONFIG,

  // ============================================================================
  // AUTHENTICATION MODULE
  // ============================================================================
  auth: {
    /**
     * Login to the system.
     * 
     * @param {Object} credentials - The login credentials.
     * @param {string} credentials.username - The user's username.
     * @param {string} credentials.password - The user's password.
     * 
     * @returns {Promise<Object>} The response containing the user and token.
     * @example
     * // Response Format:
     * // {
     * //   "token": "eyJhbGciOiJIUzI1NiIsIn...",
     * //   "user": {
     * //     "id": "u123",
     * //     "username": "admin",
     * //     "role": "system-admin",
     * //     "name": "System Admin"
     * //   }
     * // }
     */
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

    /**
     * Logout the current user.
     * Headers: Authorization: Bearer <token>
     * 
     * @returns {Promise<Object>} Success message.
     * @example
     * // Response Format:
     * // { "message": "Logged out successfully" }
     */
    logout: () => request('/auth/logout', { method: 'POST' }),

    /**
     * Get current user profile.
     * Headers: Authorization: Bearer <token>
     * 
     * @returns {Promise<Object>} The current user's profile.
     * @example
     * // Response Format:
     * // {
     * //   "id": "u123",
     * //   "username": "admin",
     * //   "role": "system-admin",
     * //   "email": "admin@example.com"
     * // }
     */
    me: () => request('/auth/me', { method: 'GET' }),
  },

  // ============================================================================
  // MERCHANT MODULE
  // ============================================================================
  merchant: {
    /**
     * Get a list of merchants with pagination and filtering.
     * Headers: Authorization: Bearer <token>
     * 
     * @param {Object} params - Query parameters.
     * @param {number} [params.page=1] - Page number.
     * @param {number} [params.limit=10] - Items per page.
     * @param {string} [params.search] - Search term (name, id).
     * @param {string} [params.type] - Filter by merchant type (e.g., 'F&B').
     * @param {string} [params.group] - Filter by group (T1, T2, T3).
     * 
     * @returns {Promise<Object>} List of merchants and pagination metadata.
     * @example
     * // Response Format:
     * // {
     * //   "data": [
     * //     { "id": "m1", "name": "Food Co", "type": "F&B", "group": "T1", "status": "Active", "joinDate": "2025-01-01" }
     * //   ],
     * //   "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
     * // }
     */
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/merchants?${query}`, { method: 'GET' });
    },

    /**
     * Get details of a specific merchant.
     * Headers: Authorization: Bearer <token>
     * 
     * @param {string} id - The merchant ID.
     * 
     * @returns {Promise<Object>} Detailed merchant information.
     * @example
     * // Response Format:
     * // {
     * //   "id": "m1",
     * //   "name": "Food Co",
     * //   "ssm": "123456-X",
     * //   "email": "contact@food.com",
     * //   "walletAddress": "0x123...",
     * //   "sponsorId": "u99",
     * //   "fees": { "markup": 1.2, "processing": 0.5 }
     * // }
     */
    get: (id) => request(`/merchants/${id}`, { method: 'GET' }),

    /**
     * Create a new merchant (System Admin only).
     * Headers: Authorization: Bearer <token>
     * 
     * @param {Object} data - Merchant data.
     * @param {string} data.name - Company name.
     * @param {string} data.ssm - SSM number.
     * @param {string} data.type - Business type.
     * @param {string} data.group - Group (T1/T2/T3).
     * @param {string} data.email - Contact email.
     * @param {string} data.password - Initial password.
     * @param {string} data.walletAddress - Wallet address.
     * @param {Object} data.fees - Fee structure.
     * 
     * @returns {Promise<Object>} The created merchant.
     */
    create: (data) => request('/merchants', { method: 'POST', body: JSON.stringify(data) }),

    /**
     * Get merchant statistics (counts by group).
     * Headers: Authorization: Bearer <token>
     * 
     * @returns {Promise<Object>} Statistics object.
     * @example
     * // Response Format:
     * // { "t1": 60, "t2": 30, "t3": 10, "total": 100 }
     */
    stats: () => request('/merchants/stats', { method: 'GET' }),
  },

  // ============================================================================
  // AGENT MODULE
  // ============================================================================
  agent: {
    /**
     * Get a list of agents.
     * Headers: Authorization: Bearer <token>
     * 
     * @param {Object} params - Query parameters (page, limit, search).
     * @returns {Promise<Object>} List of agents.
     * @example
     * // Response Format:
     * // {
     * //   "data": [ { "id": "a1", "bonus": "1000", "l1Count": 10, "l2Count": 50, "status": "Active" } ],
     * //   "meta": { ... }
     * // }
     */
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/agents?${query}`, { method: 'GET' });
    },

    /**
     * Get agent details.
     * Headers: Authorization: Bearer <token>
     * @param {string} id - Agent ID.
     */
    get: (id) => request(`/agents/${id}`, { method: 'GET' }),

    /**
     * Get agent dashboard statistics.
     * Headers: Authorization: Bearer <token>
     * @returns {Promise<Object>} { "totalActive": 23, "totalBonus": "10000.00" }
     */
    stats: () => request('/agents/stats', { method: 'GET' }),
  },

  // ============================================================================
  // USER MODULE
  // ============================================================================
  user: {
    /**
     * Get a list of users.
     * Headers: Authorization: Bearer <token>
     * @param {Object} params - Query parameters.
     */
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/users?${query}`, { method: 'GET' });
    },

    /**
     * Get user details.
     * Headers: Authorization: Bearer <token>
     * @param {string} id - User ID.
     */
    get: (id) => request(`/users/${id}`, { method: 'GET' }),

    /**
     * Get user dashboard statistics.
     * Headers: Authorization: Bearer <token>
     * @returns {Promise<Object>} { "totalActive": 50, "totalBonus": "5000.00", "totalSpending": "20000.00" }
     */
    stats: () => request('/users/stats', { method: 'GET' }),
  },

  // ============================================================================
  // TRANSACTION & BONUS MODULE
  // ============================================================================
  transaction: {
    /**
     * Get list of transactions (fees, bonuses, transfers).
     * Headers: Authorization: Bearer <token>
     * 
     * @param {Object} params - Query parameters.
     * @param {string} [params.type] - 'fee', 'bonus', 'transfer'.
     * @param {string} [params.status] - 'success', 'pending', 'failed'.
     */
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/transactions?${query}`, { method: 'GET' });
    },

    /**
     * Get transaction details.
     * Headers: Authorization: Bearer <token>
     * @param {string} id - Transaction ID.
     */
    get: (id) => request(`/transactions/${id}`, { method: 'GET' }),

    /**
     * Get fees collection statistics.
     * Headers: Authorization: Bearer <token>
     * @returns {Promise<Object>} { "totalFees": "100000.00", "monthlyFees": "5000.00" }
     */
    feesStats: () => request('/transactions/fees/stats', { method: 'GET' }),

    /**
     * Get bonus distribution statistics.
     * Headers: Authorization: Bearer <token>
     * @returns {Promise<Object>} { "totalDistributed": "50000.00", "totalClaimed": "40000.00", "totalUnclaimed": "10000.00" }
     */
    bonusStats: () => request('/transactions/bonus/stats', { method: 'GET' }),
  },

  // ============================================================================
  // WITHDRAWAL MODULE
  // ============================================================================
  withdrawal: {
    /**
     * Get list of withdrawals.
     * Headers: Authorization: Bearer <token>
     * @param {Object} params - Query parameters (status: 'pending'|'history').
     */
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/withdrawals?${query}`, { method: 'GET' });
    },

    /**
     * Get withdrawal details.
     * Headers: Authorization: Bearer <token>
     * @param {string} id - Withdrawal ID.
     */
    get: (id) => request(`/withdrawals/${id}`, { method: 'GET' }),

    /**
     * Request a new withdrawal (Merchant/Agent).
     * Headers: Authorization: Bearer <token>
     * @param {Object} data - { "amount": "100.00", "walletAddress": "0x..." }
     */
    create: (data) => request('/withdrawals', { method: 'POST', body: JSON.stringify(data) }),

    /**
     * Approve a withdrawal (T3 Admin).
     * Headers: Authorization: Bearer <token>
     * @param {string} id - Withdrawal ID.
     */
    approve: (id) => request(`/withdrawals/${id}/approve`, { method: 'POST' }),

    /**
     * Reject a withdrawal (T3 Admin).
     * Headers: Authorization: Bearer <token>
     * @param {string} id - Withdrawal ID.
     * @param {Object} data - { "reason": "Invalid wallet" }
     */
    reject: (id, data) => request(`/withdrawals/${id}/reject`, { method: 'POST', body: JSON.stringify(data) }),

    /**
     * Get withdrawal statistics.
     * Headers: Authorization: Bearer <token>
     * @returns {Promise<Object>} { "pendingCount": 10, "approvedCount": 100, "totalAmount": "10000.00" }
     */
    stats: () => request('/withdrawals/stats', { method: 'GET' }),
  },

  // ============================================================================
  // T3 ADMIN MODULE
  // ============================================================================
  t3admin: {
    // Authentication
    /**
     * T3Admin login.
     * @param {Object} credentials - { username, password }
     * @returns {Promise<Object>} { success, message, data: { token, token_expires_at, admin_type } }
     */
    login: (credentials) => request('/t3admin/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

    /**
     * Get T3Admin profile.
     * Headers: Authorization: Bearer <token>
     * @returns {Promise<Object>} Admin profile data
     */
    getProfile: () => request('/t3admin/auth/profile', { method: 'GET' }),

    // Dashboard
    /**
     * Get T3Admin dashboard statistics.
     * Headers: Authorization: Bearer <token>
     * @returns {Promise<Object>} { success, data: { total_incoming_funds, monthly_incoming_funds, total_outgoing_funds, monthly_outgoing_funds, total_users } }
     */
    getDashboard: () => request('/t3admin/dashboard', { method: 'GET' }),

    // User Management
    /**
     * Get user list.
     * Headers: Authorization: Bearer <token>
     * @param {Object} params - { page, search }
     * @returns {Promise<Object>} { success, data: [...], page, limit }
     */
    getUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/t3admin/users?${query}`, { method: 'GET' });
    },

    /**
     * Get user details.
     * Headers: Authorization: Bearer <token>
     * @param {string} id - User ID (with or without 'U' prefix)
     * @returns {Promise<Object>} { success, data: { id, username, wallet_address, status, created_at, total_incoming_funds, total_outgoing_funds, current_unclaim_funds, total_claimed_funds } }
     */
    getUserDetails: (id) => request(`/t3admin/users/${id}`, { method: 'GET' }),

    // Account Management (Finance Accounts)
    /**
     * Get list of T3 admin accounts.
     * Headers: Authorization: Bearer <token>
     * @param {Object} params - { page, search }
     * @returns {Promise<Object>} { success, data: [...], page, limit }
     */
    getAccounts: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/t3admin/accounts?${query}`, { method: 'GET' });
    },

    /**
     * Create a new finance account.
     * Headers: Authorization: Bearer <token>
     * @param {Object} data - { username, email, password, wallet_address }
     * @returns {Promise<Object>} { success, message, data: { id, username, email } }
     */
    createAccount: (data) => request('/t3admin/accounts', { method: 'POST', body: JSON.stringify(data) }),

    /**
     * Get account details.
     * Headers: Authorization: Bearer <token>
     * @param {string} id - Account ID
     * @returns {Promise<Object>} Account details
     */
    getAccountDetails: (id) => request(`/t3admin/accounts/${id}`, { method: 'GET' }),

    // Withdrawal Management
    /**
     * Get pending withdrawal applications.
     * Headers: Authorization: Bearer <token>
     * @param {Object} params - { page, search, status }
     * @returns {Promise<Object>} { success, data: [...], page, limit }
     */
    getWithdrawalApplications: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/t3admin/withdrawals/applications?${query}`, { method: 'GET' });
    },

    /**
     * Get withdrawal history.
     * Headers: Authorization: Bearer <token>
     * @param {Object} params - { page, status }
     * @returns {Promise<Object>} { success, data: [...], page, limit }
     */
    getWithdrawalHistory: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/t3admin/withdrawals/history?${query}`, { method: 'GET' });
    },

    /**
     * Get withdrawal details.
     * Headers: Authorization: Bearer <token>
     * @param {string} id - Withdrawal ID or application_id
     * @returns {Promise<Object>} Withdrawal details
     */
    getWithdrawalDetails: (id) => request(`/t3admin/withdrawals/${id}`, { method: 'GET' }),

    /**
     * Approve a withdrawal.
     * Headers: Authorization: Bearer <token>
     * @param {string} id - Withdrawal ID or application_id
     * @returns {Promise<Object>} { success, message }
     */
    approveWithdrawal: (id) => request(`/t3admin/withdrawals/${id}/approve`, { method: 'POST' }),

    /**
     * Reject a withdrawal.
     * Headers: Authorization: Bearer <token>
     * @param {string} id - Withdrawal ID or application_id
     * @returns {Promise<Object>} { success, message }
     */
    rejectWithdrawal: (id) => request(`/t3admin/withdrawals/${id}/reject`, { method: 'POST' }),

    // API Keys & Logs
    /**
     * Get API keys list.
     * Headers: Authorization: Bearer <token>
     * @returns {Promise<Object>} { success, data: [...] }
     */
    getAPIKeys: () => request('/t3admin/api-keys', { method: 'GET' }),

    /**
     * Create a new API key.
     * Headers: Authorization: Bearer <token>
     * @param {Object} data - { key_name, backend_url, merchant_key }
     * @returns {Promise<Object>} { success, message, data: { id, key_name, api_key, secret_key, merchant_key, backend_url } }
     */
    createAPIKey: (data) => request('/t3admin/api-keys', { method: 'POST', body: JSON.stringify(data) }),

    /**
     * Get API logs.
     * Headers: Authorization: Bearer <token>
     * @param {Object} params - { page, search }
     * @returns {Promise<Object>} { success, data: [...], page, limit }
     */
    getAPILogs: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/t3admin/api-logs?${query}`, { method: 'GET' });
    },

    /**
     * Update callback settings.
     * Headers: Authorization: Bearer <token>
     * @param {Object} data - { backend_url, key_id }
     * @returns {Promise<Object>} { success, message }
     */
    updateCallbackSettings: (data) => request('/t3admin/callback-settings', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // ============================================================================
  // ACCOUNT MODULE (T3 Admin) - Legacy, use t3admin.getAccounts instead
  // ============================================================================
  account: {
    /**
     * Get list of finance accounts.
     * Headers: Authorization: Bearer <token>
     * @deprecated Use api.t3admin.getAccounts instead
     */
    list: () => request('/admin-accounts', { method: 'GET' }),

    /**
     * Create a new finance account.
     * Headers: Authorization: Bearer <token>
     * @param {Object} data - { "username": "...", "password": "...", "email": "...", "walletAddress": "..." }
     * @deprecated Use api.t3admin.createAccount instead
     */
    create: (data) => request('/admin-accounts', { method: 'POST', body: JSON.stringify(data) }),

    /**
     * Get account details.
     * Headers: Authorization: Bearer <token>
     * @param {string} id - Account ID.
     * @deprecated Use api.t3admin.getAccountDetails instead
     */
    get: (id) => request(`/admin-accounts/${id}`, { method: 'GET' }),
  },

  // ============================================================================
  // SYSTEM LOGS MODULE
  // ============================================================================
  logs: {
    /**
     * Get system logs.
     * Headers: Authorization: Bearer <token>
     * @param {Object} params - { "level": "INFO", "dateRange": "24h", "status": "200" }
     */
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/logs?${query}`, { method: 'GET' });
    },
  },
};
