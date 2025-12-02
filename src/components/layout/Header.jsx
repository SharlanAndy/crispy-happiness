import { useNavigate } from 'react-router-dom';
import { imgVector1, imgVector3 } from '../../constant/assets';

// Title is intentionally fixed so it cannot be changed by pages/components.
const Header = ({ walletAddress }) => {
  const title = 'NBN Management System';
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-[274px] right-0 z-40 bg-white border-b border-neutral-200 flex items-center justify-between px-6 py-5">
      <div className="flex items-center gap-3.5">
        <img alt="System" className="w-6 h-6" src={imgVector1} />
        <h1 className="font-honor-sans font-semibold text-[21px]">{title}</h1>
      </div>
      
      <div className="flex items-center gap-5">
        <button className="border border-black flex items-center gap-1.5 px-2.5 py-2 rounded-full hover:bg-black hover:text-white transition-colors group">
          <img alt="" className="w-3.5 h-3.5" src={imgVector3} />
          <span className="font-bold text-xs group-hover:text-white">Connect Wallet</span>
        </button>
        
        {walletAddress && (
          <div className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium">
            {walletAddress}
          </div>
        )}
        
        <button 
          onClick={handleLogout}
          className="border border-black flex items-center gap-1.5 px-2.5 py-2 rounded-full hover:bg-black hover:text-white transition-colors group"
        >
          <span className="font-bold text-xs group-hover:text-white">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
