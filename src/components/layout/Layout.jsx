import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';
import { LogOut, User, Wallet, LayoutDashboard, Users, FileText, Settings, CreditCard, Network } from 'lucide-react';
import { cn } from '@/lib/utils';

const SidebarItem = ({ icon: Icon, label, path, active }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(path)}
      className={cn(
        "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-lg mb-1",
        active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
  );
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    authService.logout();
  };

  const getNavItems = () => {
    switch (user.role) {
      case 'system-admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/system-admin' },
          { icon: Users, label: 'Merchants', path: '/system-admin/merchants' },
          { icon: Users, label: 'Agents', path: '/system-admin/agents' },
          { icon: Users, label: 'Users', path: '/system-admin/users' },
          { icon: CreditCard, label: 'Bonus', path: '/system-admin/bonus' },
          { icon: FileText, label: 'Logs', path: '/system-admin/logs' },
        ];
      case 't3-admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/t3-admin' },
          { icon: Users, label: 'Merchants', path: '/t3-admin/merchants' },
          { icon: Users, label: 'Users', path: '/t3-admin/users' },
          { icon: CreditCard, label: 'Withdrawals', path: '/t3-admin/withdrawals' },
          { icon: Settings, label: 'API Settings', path: '/t3-admin/api-settings' },
        ];
      case 'merchant':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/merchant' },
          { icon: FileText, label: 'Transactions', path: '/merchant/transactions' },
          { icon: Users, label: 'Invite', path: '/merchant/invite' },
          { icon: CreditCard, label: 'Withdraw', path: '/merchant/withdraw' },
          { icon: Settings, label: 'Settings', path: '/merchant/settings' },
        ];
      case 'agent':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/agent' },
          { icon: Network, label: 'My Team', path: '/agent/team' },
          { icon: FileText, label: 'Transactions', path: '/agent/transactions' },
          { icon: Settings, label: 'Settings', path: '/agent/settings' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">NBN System</h1>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{user.role.replace('-', ' ')} Portal</p>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {getNavItems().map((item) => (
            <SidebarItem
              key={item.path}
              {...item}
              active={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
            />
          ))}
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={16} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold">
            {getNavItems().find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full text-sm font-medium">
              <Wallet size={16} className="text-primary" />
              <span>0xF3A...12345</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-secondary/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
