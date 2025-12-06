import { Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from '../pages/Login';

// Layouts
import AdminLayout from '../components/layout/AdminLayout';
import MerchantLayout from '../components/layout/MerchantLayout';
import AgentLayout from '../components/layout/AgentLayout';

// System Admin Pages
import SystemAdminDashboard from '../pages/system-admin/Dashboard';
import MerchantManagement from '../pages/system-admin/MerchantManagement';
import AgentManagement from '../pages/system-admin/AgentManagement';
import UserManagement from '../pages/system-admin/UserManagement';
import TransactionManagement from '../pages/system-admin/TransactionManagement';
import FeesManagement from '../pages/system-admin/FeesManagement';
import SystemLogs from '../pages/system-admin/SystemLogs';
import BonusManagement from '../pages/system-admin/BonusManagement';
import BonusClaimDetails from '../pages/system-admin/BonusClaimDetails';
import AgentDetails from '../pages/system-admin/AgentDetails';
import TransactionDetails from '../pages/system-admin/TransactionDetails';
import CurrencyManagement from '../pages/system-admin/CurrencyManagement';
import CurrencyForm from '../pages/admin/CurrencyForm';

// T3 Admin Pages
import T3AdminDashboard from '../pages/t3-admin/Dashboard';
import WithdrawalManagement from '../pages/t3-admin/WithdrawalManagement';
import WithdrawalHistory from '../pages/t3-admin/WithdrawalHistory';

// Admin Shared Pages
import MerchantDetails from '../pages/admin/MerchantDetails';
import UserDetails from '../pages/admin/UserDetails';
import AccountManagement from '../pages/admin/AccountManagement';
import AccountDetails from '../pages/admin/AccountDetails';
import APISettings from '../pages/admin/APISettings';
import WithdrawalDetails from '../pages/admin/WithdrawalDetails';

// Shared Pages
import UnifiedSettings from '../pages/shared/UnifiedSettings';

// Merchant Pages
import MerchantDashboard from '../pages/merchant/Dashboard';
import MerchantInvite from '../pages/merchant/Invite';
import MerchantTransactionHistory from '../pages/merchant/TransactionHistory';
import MerchantWithdraw from '../pages/merchant/Withdraw';

// Agent Pages
import AgentDashboard from '../pages/agent/Dashboard';
import MyTeam from '../pages/agent/MyTeam';
import AgentTransactionHistory from '../pages/agent/TransactionHistory';

// 404 Page
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Single Centralized Login */}
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* System Admin & T3 Admin Routes (Protected by AdminLayout) */}
      <Route element={<AdminLayout />}>
        <Route path="system-admin">
          <Route index element={<SystemAdminDashboard />} />
          <Route path="merchants" element={<MerchantManagement />} />
          <Route path="merchants/:id" element={<MerchantDetails />} />
          <Route path="merchants/:id/settings" element={<UnifiedSettings />} />
          <Route path="agents" element={<AgentManagement />} />
          <Route path="agents/:id" element={<AgentDetails />} />
          <Route path="agents/:id/settings" element={<UnifiedSettings />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="users/:id/settings" element={<UnifiedSettings />} />
          <Route path="bonus" element={<BonusManagement />} />
          <Route path="bonus/:id" element={<BonusClaimDetails />} />
          <Route path="fees" element={<FeesManagement />} />
          <Route path="logs" element={<SystemLogs />} />
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="transactions/:id" element={<TransactionDetails />} />
          <Route path="currency" element={<CurrencyManagement />} />
          <Route path="currency/add" element={<CurrencyForm />} />
          <Route path="currency/:id/view" element={<CurrencyForm />} />
          <Route path="currency/:id/edit" element={<CurrencyForm />} />
        </Route>

        <Route path="t3-admin">
          <Route index element={<T3AdminDashboard />} />
          <Route path="merchant-details" element={<MerchantDetails />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="users/:id/settings" element={<UnifiedSettings />} />
          <Route path="withdrawals" element={<WithdrawalManagement />} />
          <Route path="withdrawals/:id" element={<WithdrawalDetails />} />
          <Route path="withdrawal-history" element={<WithdrawalHistory />} />
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="transactions/:id" element={<TransactionDetails />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="accounts/:id" element={<AccountDetails />} />
          <Route path="api-settings" element={<APISettings />} />
        </Route>
      </Route>

      {/* Merchant Routes (Protected by MerchantLayout) */}
      <Route path="merchant" element={<MerchantLayout />}>
        <Route index element={<MerchantDashboard />} />
        <Route path="transactions" element={<MerchantTransactionHistory />} />
        <Route path="invite" element={<MerchantInvite />} />
        <Route path="withdraw" element={<MerchantWithdraw />} />
        <Route path="settings" element={<UnifiedSettings />} />
      </Route>

      {/* Agent Routes (Protected by AgentLayout) */}
      <Route path="agent" element={<AgentLayout />}>
        <Route index element={<AgentDashboard />} />
        <Route path="team" element={<MyTeam />} />
        <Route path="transactions" element={<AgentTransactionHistory />} />
        <Route path="settings" element={<UnifiedSettings />} />
      </Route>

      {/* 404 Catch-all Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
