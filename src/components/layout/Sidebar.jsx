import { useNavigate, useLocation } from 'react-router-dom';
import Agent from '../icons/Agent';
import Bonus from '../icons/Bonus';
import Dashboard from '../icons/Dashboard';
import Fees from '../icons/Fees';
import Log from '../icons/Log';
import Merchant from '../icons/Merchant';
import Settings from '../icons/Settings';
import Currency from '../icons/Currency';
import Transaction from '../icons/Transaction';
import User from '../icons/User';

const Sidebar = ({ sections }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const icons = { Agent, Bonus, Dashboard, Fees, Log, Merchant, Settings, Currency, Transaction, User };

  const NavItem = ({ path, icon, label }) => {
    const Icon = icons[icon];
    return (
      <button
        onClick={() => navigate(path)}
        className={`flex gap-2.5 items-center w-full hover:opacity-80 transition-opacity ${
          pathname === path || pathname.startsWith(path + '/system-admin') || pathname.startsWith(path + '/t3-admin') ? 'opacity-100' : 'opacity-60'
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
