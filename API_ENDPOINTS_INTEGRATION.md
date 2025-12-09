# API Endpoints Integration Documentation

This document lists all API endpoints that have been integrated into the frontend codebase. All T3Admin and SystemAdmin endpoints have been standardized to use the base path `/api/t3systemadmin` for centralized management.

## Base Configuration

- **Base URL**: `/api` (configured in `vite.config.js`)
- **Proxy Target**: `https://nbn.iotareward.com`
- **Standardized Path**: All T3Admin and SystemAdmin endpoints use `/api/t3systemadmin`

---

## T3Admin & SystemAdmin Endpoints (Standardized to `/api/t3systemadmin`)

### Authentication Endpoints

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `POST` | `/api/t3systemadmin/auth/login` | T3Admin/SystemAdmin login | `api.t3admin.login()` / `api.systemadmin.login()` | `src/services/authService.js` |
| `GET` | `/api/t3systemadmin/auth/profile` | Get admin profile | `api.t3admin.getProfile()` / `api.systemadmin.getProfile()` | `src/services/authService.js` |

### Dashboard Endpoints

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/t3systemadmin/dashboard` | Get dashboard statistics | `api.t3admin.getDashboard()` / `api.systemadmin.getDashboard()` | `src/pages/t3-admin/Dashboard.jsx`, `src/pages/system-admin/Dashboard.jsx` |

### User Management Endpoints

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/t3systemadmin/users` | Get user list with pagination | `api.t3admin.getUsers()` / `api.systemadmin.getUsers()` | `src/pages/admin/UserDetails.jsx`, `src/pages/system-admin/UserManagement.jsx` |
| `GET` | `/api/t3systemadmin/users/:id` | Get user details | `api.t3admin.getUserDetails()` / `api.systemadmin.getUserDetails()` | `src/pages/admin/UserDetails.jsx` |

### Account Management Endpoints (T3Admin Only)

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/t3systemadmin/accounts` | Get list of finance accounts | `api.t3admin.getAccounts()` | `src/pages/admin/AccountManagement.jsx` |
| `POST` | `/api/t3systemadmin/accounts` | Create a new finance account | `api.t3admin.createAccount()` | `src/pages/admin/AccountManagement.jsx` |
| `GET` | `/api/t3systemadmin/accounts/:id` | Get account details | `api.t3admin.getAccountDetails()` | `src/pages/admin/AccountDetails.jsx` |

### Withdrawal Management Endpoints (T3Admin Only)

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/t3systemadmin/withdrawals/applications` | Get pending withdrawal applications | `api.t3admin.getWithdrawalApplications()` | `src/pages/t3-admin/WithdrawalManagement.jsx` |
| `GET` | `/api/t3systemadmin/withdrawals/history` | Get withdrawal history | `api.t3admin.getWithdrawalHistory()` | `src/pages/t3-admin/WithdrawalHistory.jsx` |
| `GET` | `/api/t3systemadmin/withdrawals/:id` | Get withdrawal details | `api.t3admin.getWithdrawalDetails()` | `src/pages/admin/WithdrawalDetails.jsx` |
| `POST` | `/api/t3systemadmin/withdrawals/:id/approve` | Approve a withdrawal | `api.t3admin.approveWithdrawal()` | `src/pages/t3-admin/WithdrawalManagement.jsx` |
| `POST` | `/api/t3systemadmin/withdrawals/:id/reject` | Reject a withdrawal | `api.t3admin.rejectWithdrawal()` | `src/pages/t3-admin/WithdrawalManagement.jsx` |

### API Keys & Logs Endpoints (T3Admin Only)

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/t3systemadmin/api-keys` | Get API keys list | `api.t3admin.getAPIKeys()` | `src/pages/admin/APISettings.jsx` |
| `POST` | `/api/t3systemadmin/api-keys` | Create a new API key | `api.t3admin.createAPIKey()` | `src/pages/admin/APISettings.jsx` |
| `GET` | `/api/t3systemadmin/api-logs` | Get API logs | `api.t3admin.getAPILogs()` | `src/pages/admin/APISettings.jsx` |
| `PUT` | `/api/t3systemadmin/callback-settings` | Update callback settings | `api.t3admin.updateCallbackSettings()` | `src/pages/admin/APISettings.jsx` |

### Merchant Management Endpoints (SystemAdmin Only)

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/t3systemadmin/merchants` | Get merchant list | `api.systemadmin.getMerchants()` | `src/pages/system-admin/MerchantManagement.jsx` |
| `POST` | `/api/t3systemadmin/merchants` | Create a new merchant | `api.systemadmin.createMerchant()` | `src/pages/system-admin/MerchantManagement.jsx` |
| `GET` | `/api/t3systemadmin/merchants/:id` | Get merchant details | `api.systemadmin.getMerchantDetails()` | `src/pages/admin/MerchantDetails.jsx` |

### Agent Management Endpoints (SystemAdmin Only)

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/t3systemadmin/agents` | Get agent list | `api.systemadmin.getAgents()` | `src/pages/system-admin/AgentManagement.jsx` |
| `GET` | `/api/t3systemadmin/agents/:id` | Get agent details | `api.systemadmin.getAgentDetails()` | `src/pages/system-admin/AgentDetails.jsx` |

### Transaction Management Endpoints (SystemAdmin Only)

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/t3systemadmin/transactions/overview` | Get transaction overview/statistics | `api.systemadmin.getTransactionOverview()` | `src/pages/system-admin/TransactionManagement.jsx` |
| `GET` | `/api/t3systemadmin/transactions` | Get transaction list | `api.systemadmin.getTransactions()` | `src/pages/system-admin/TransactionManagement.jsx`, `src/pages/admin/UserDetails.jsx`, `src/pages/admin/MerchantDetails.jsx` |
| `GET` | `/api/t3systemadmin/transactions/:id` | Get transaction details | `api.systemadmin.getTransactionDetails()` | `src/pages/system-admin/TransactionDetails.jsx` |

### Bonus Management Endpoints (SystemAdmin Only)

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/t3systemadmin/bonus/claims` | Get bonus claims | `api.systemadmin.getBonusClaims()` | `src/pages/system-admin/BonusManagement.jsx` |
| `GET` | `/api/t3systemadmin/bonus/unclaims` | Get bonus unclaims | `api.systemadmin.getBonusUnclaims()` | `src/pages/system-admin/BonusManagement.jsx` |
| `GET` | `/api/t3systemadmin/bonus/monthly` | Get monthly bonus data | `api.systemadmin.getMonthlyBonus()` | `src/pages/system-admin/BonusManagement.jsx` |

### Fees Management Endpoints (SystemAdmin Only)

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/t3systemadmin/fees` | Get fees list | `api.systemadmin.getFees()` | `src/pages/system-admin/FeesManagement.jsx` |
| `GET` | `/api/t3systemadmin/fees/statistics` | Get fees statistics | `api.systemadmin.getFeesStatistics()` | `src/pages/system-admin/FeesManagement.jsx` |

### System Logs Endpoints (SystemAdmin Only)

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/t3systemadmin/logs` | Get system logs | `api.systemadmin.getLogs()` | `src/pages/system-admin/SystemLogs.jsx` |

---

## Other API Endpoints (Non-Admin)

### Authentication Module

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `POST` | `/api/auth/login` | User login | `api.auth.login()` | `src/pages/Login.jsx` |
| `POST` | `/api/auth/logout` | User logout | `api.auth.logout()` | Various components |
| `GET` | `/api/auth/me` | Get current user profile | `api.auth.me()` | Various components |

### Merchant Module

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/merchants` | Get merchant list | `api.merchant.list()` | Various pages |
| `GET` | `/api/merchants/:id` | Get merchant details | `api.merchant.get()` | Various pages |
| `POST` | `/api/merchants` | Create merchant | `api.merchant.create()` | Various pages |
| `GET` | `/api/merchants/stats` | Get merchant statistics | `api.merchant.stats()` | Various pages |

### Agent Module

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/agents` | Get agent list | `api.agent.list()` | Various pages |
| `GET` | `/api/agents/:id` | Get agent details | `api.agent.get()` | Various pages |
| `GET` | `/api/agents/stats` | Get agent statistics | `api.agent.stats()` | Various pages |

### User Module

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/users` | Get user list | `api.user.list()` | Various pages |
| `GET` | `/api/users/:id` | Get user details | `api.user.get()` | Various pages |
| `GET` | `/api/users/stats` | Get user statistics | `api.user.stats()` | Various pages |

### Transaction Module

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/transactions` | Get transaction list | `api.transaction.list()` | Various pages |
| `GET` | `/api/transactions/:id` | Get transaction details | `api.transaction.get()` | Various pages |
| `GET` | `/api/transactions/fees/stats` | Get fees statistics | `api.transaction.feesStats()` | Various pages |
| `GET` | `/api/transactions/bonus/stats` | Get bonus statistics | `api.transaction.bonusStats()` | Various pages |

### Withdrawal Module

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/withdrawals` | Get withdrawal list | `api.withdrawal.list()` | Various pages |
| `GET` | `/api/withdrawals/:id` | Get withdrawal details | `api.withdrawal.get()` | Various pages |
| `POST` | `/api/withdrawals` | Create withdrawal request | `api.withdrawal.create()` | Various pages |
| `POST` | `/api/withdrawals/:id/approve` | Approve withdrawal | `api.withdrawal.approve()` | Various pages |
| `POST` | `/api/withdrawals/:id/reject` | Reject withdrawal | `api.withdrawal.reject()` | Various pages |
| `GET` | `/api/withdrawals/stats` | Get withdrawal statistics | `api.withdrawal.stats()` | Various pages |

### System Logs Module

| Method | Endpoint | Description | Module | Frontend Usage |
|--------|----------|-------------|--------|----------------|
| `GET` | `/api/logs` | Get system logs | `api.logs.list()` | Various pages |

---

## Summary Statistics

### T3Admin & SystemAdmin Endpoints (Standardized)
- **Total Endpoints**: 30
- **Authentication**: 2 endpoints
- **Dashboard**: 1 endpoint
- **User Management**: 2 endpoints
- **Account Management**: 3 endpoints (T3Admin only)
- **Withdrawal Management**: 5 endpoints (T3Admin only)
- **API Keys & Logs**: 4 endpoints (T3Admin only)
- **Merchant Management**: 3 endpoints (SystemAdmin only)
- **Agent Management**: 2 endpoints (SystemAdmin only)
- **Transaction Management**: 3 endpoints (SystemAdmin only)
- **Bonus Management**: 3 endpoints (SystemAdmin only)
- **Fees Management**: 2 endpoints (SystemAdmin only)
- **System Logs**: 1 endpoint (SystemAdmin only)

### Other Endpoints
- **Authentication**: 3 endpoints
- **Merchant**: 4 endpoints
- **Agent**: 3 endpoints
- **User**: 3 endpoints
- **Transaction**: 4 endpoints
- **Withdrawal**: 6 endpoints
- **System Logs**: 1 endpoint

**Total Integrated Endpoints**: 49 endpoints

---

## Implementation Notes

### Standardization
All T3Admin and SystemAdmin endpoints have been standardized to use `/api/t3systemadmin` as the base path. This provides:
- Centralized endpoint management
- Easier maintenance and updates
- Consistent API structure
- Simplified proxy configuration

### Frontend Integration
- All endpoints are accessed through the centralized `api` object in `src/lib/api.js`
- Service layer abstraction in `src/services/` provides additional error handling and mock data fallback
- Direct API calls using `api.request()` are minimized in favor of module methods

### Files Modified
1. `src/lib/api.js` - Updated all endpoint paths to `/t3systemadmin`
2. `src/services/t3Service.js` - Updated direct API calls
3. `src/pages/system-admin/TransactionManagement.jsx` - Updated endpoint paths
4. `src/pages/admin/UserDetails.jsx` - Updated endpoint paths
5. `src/pages/admin/MerchantDetails.jsx` - Updated endpoint paths

### Configuration
- Proxy configuration in `vite.config.js` routes `/api/*` to `https://nbn.iotareward.com`
- All requests automatically include authentication token from `localStorage`
- Base URL can be configured via `VITE_API_URL` environment variable

---

## Usage Examples

### T3Admin Login
```javascript
import { api } from '../lib/api';

const response = await api.t3admin.login({
  username: 't3_admin',
  password: 'password'
});
```

### SystemAdmin Dashboard
```javascript
import { api } from '../lib/api';

const dashboard = await api.systemadmin.getDashboard();
```

### Get Users with Pagination
```javascript
import { api } from '../lib/api';

const users = await api.t3admin.getUsers({
  page: 1,
  search: 'john'
});
```

### Create Merchant (SystemAdmin)
```javascript
import { api } from '../lib/api';

const merchant = await api.systemadmin.createMerchant({
  name: 'New Merchant',
  email: 'merchant@example.com',
  // ... other fields
});
```

---

## Maintenance

When adding new endpoints:
1. Add the endpoint to the appropriate module in `src/lib/api.js`
2. Use the standardized path `/api/t3systemadmin` for admin endpoints
3. Update this documentation file
4. Add appropriate JSDoc comments
5. Consider adding service layer abstraction if needed

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

