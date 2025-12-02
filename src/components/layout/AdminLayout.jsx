import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  if (!user || (user.role !== 'system-admin' && user.role !== 't3-admin')) {
    return <Navigate to="/login" replace />;
  }

  // system-admin
  const systemSections = [
    { title: 'Preview', items: [{ path: '/system-admin', icon: 'Dashboard', label: 'Dashboard' }] },
    { 
      title: 'Account User', 
      items: [
        { path: '/system-admin/merchants', icon: 'Merchant', label: 'Merchant Management' },
        { path: '/system-admin/agents', icon: 'Agent', label: 'Agent Management' },
        { path: '/system-admin/users', icon: 'User', label: 'User Management' }
      ]
    },
    { 
      title: 'Transaction', 
      items: [
        { path: '/system-admin/transactions', icon: 'Transaction', label: 'Transaction' },
        { path: '/system-admin/fees', icon: 'Fees', label: 'Fees' },
        { path: '/system-admin/bonus', icon: 'Bonus', label: 'Bonus' }
      ]
    },
    { title: 'Log', items: [{ path: '/system-admin/logs', icon: 'Log', label: 'Log' }] },
    { title: 'Setting', items: [{ path: '/system-admin/currency', icon: 'Currency', label: 'Currencies Setting' }] }
  ];

  // t3-admin
  const t3Sections = [
    { title: 'Preview', items: [{ path: '/t3-admin', icon: 'Dashboard', label: 'Dashboard' }] },
    { 
      title: 'Account User', 
      items: [
        { path: '/t3-admin/users', icon: 'User', label: 'User Management' }
      ]
    },
    { 
      title: 'Transaction', 
      items: [
        { path: '/t3-admin/transactions', icon: 'Transaction', label: 'Transaction' },
        { path: '/t3-admin/withdrawals', icon: 'Fees', label: 'Withdraw Management' },
        { path: '/t3-admin/withdraw-history', icon: 'Bonus', label: 'Withdraw History' }
      ]
    },
    { title: 'Setting', items: [
      { path: '/t3-admin/accounts', icon: 'Settings', label: 'Admin Management' },
      { path: '/t3-admin/merchant-details', icon: 'Settings', label: 'Merchant Details' },
      { path: '/t3-admin/api-settings', icon: 'Settings', label: 'API Setting & Log Setting' },
    ] }
  ];

  const sections = user.role === 'system-admin' ? systemSections : t3Sections;
  const allItems = sections.flatMap(section => section.items);
  const currentTitle = allItems.find(i => i.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="bg-white min-h-screen">
      <Sidebar sections={sections} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={currentTitle} walletAddress={user.role === 'system-admin' ? "0xSys...Admin" : "0xT3...Admin"} />
        <main className="ml-[274px] mt-[80px] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
