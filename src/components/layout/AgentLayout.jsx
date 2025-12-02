import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import Sidebar from './Sidebar';
import Header from './Header';
import { LayoutDashboard, FileText, Settings, Network } from 'lucide-react';

export default function AgentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  if (!user || user.role !== 'agent') {
    return <Navigate to="/login/agent" replace />;
  }

  const handleLogout = () => {
    authService.logout();
    navigate('/login/agent');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/agent' },
    { icon: Network, label: 'My Team', path: '/agent/team' },
    { icon: FileText, label: 'Transactions', path: '/agent/transactions' },
    { icon: Settings, label: 'Settings', path: '/agent/settings' },
  ];

  const currentTitle = navItems.find(i => i.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        title="NBN Agent"
        subtitle="Agent Portal"
        navItems={navItems}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={currentTitle} walletAddress="0xF3A...Agent" />
        <main className="flex-1 overflow-y-auto p-6 bg-secondary/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
