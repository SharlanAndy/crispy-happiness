import { useNavigate, useLocation } from 'react-router-dom';
import Admin from '../icons/Admin';
import Agent from '../icons/Agent';
import Bonus from '../icons/Bonus';
import Currency from '../icons/Currency';
import Dashboard from '../icons/Dashboard';
import Fees from '../icons/Fees';
import History from '../icons/History';
import Log from '../icons/Log';
import Manage from '../icons/Manage';
import Merchant from '../icons/Merchant';
import Settings from '../icons/Settings';
import Transaction from '../icons/Transaction';
import User from '../icons/User';

const Sidebar = ({ sections }) => {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();

  const icons = { Admin, Agent, Bonus, Currency, Dashboard, Fees, History, Log, Manage, Merchant, Settings, Transaction, User};

  const NavItem = ({ path, icon, label }) => {
    const Icon = icons[icon];
    // Check if we have a returnPath from location state (for details pages)
    const returnPath = location.state?.returnPath;
    
    // For dashboard routes, only match exactly. For others, match path and sub-paths
    const isDashboard = path === '/system-admin' || path === '/t3-admin';
    
    let isActive;
    if (returnPath) {
      // If there's a returnPath, use it to determine active state
      isActive = path === returnPath || returnPath.startsWith(path + '/');
    } else {
      // Normal matching logic
      isActive = isDashboard 
        ? pathname === path 
        : pathname === path || pathname.startsWith(path + '/');
    }
    
    return (
      <button
        onClick={() => navigate(path)}
        className={`flex gap-2.5 items-center w-full hover:opacity-80 transition-opacity ${
          isActive ? 'opacity-100' : 'opacity-60'
        }`}
      >
        <Icon />
        <p className="font-honor-sans font-semibold text-base text-black text-start">{label}</p>
      </button>
    );
  };

  const Section = ({ title, items }) => (
    <div className="flex flex-col gap-5 w-full">
      <p className="font-honor-sans font-semibold text-[#676b6b] text-base">{title}</p>
      {items.map(item => <NavItem key={item.path} {...item} />)}
    </div>
  );

  return (
    <div className="fixed bg-neutral-50 border-r border-neutral-200 h-screen left-0 top-0 w-[274px] z-50 overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-[35px] px-[23px] py-[17px]">
        {sections.map(section => <Section key={section.title} {...section} />)}
      </div>
    </div>
  );
};

export default Sidebar;
