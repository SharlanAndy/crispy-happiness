import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import Sidebar from './Sidebar';
import Header from './Header';
import { LayoutDashboard, Users, FileText, Settings, CreditCard } from 'lucide-react';

export default function MerchantLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  if (!user || user.role !== 'merchant') {
    return <Navigate to="/login/merchant" replace />;
  }

  const handleLogout = () => {
    authService.logout();
    navigate('/login/merchant');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/merchant' },
    { icon: FileText, label: 'Transactions', path: '/merchant/transactions' },
    { icon: Users, label: 'Invite', path: '/merchant/invite' },
    { icon: CreditCard, label: 'Withdraw', path: '/merchant/withdraw' },
    { icon: Settings, label: 'Settings', path: '/merchant/settings' },
  ];

  const currentTitle = navItems.find(i => i.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        title="NBN Merchant"
        subtitle="Merchant Portal"
        navItems={navItems}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={currentTitle} walletAddress="0xF3A...Merch" />
        <main className="flex-1 overflow-y-auto p-6 bg-secondary/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
