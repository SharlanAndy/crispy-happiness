import { useNavigate } from 'react-router-dom';
import { imgVector1, imgVector3 } from '../../constant/assets';
import { useAppKitWallet } from '@/web3/hooks/useAppKit';

// Title is intentionally fixed so it cannot be changed by pages/components.
const Header = () => {
  const title = 'NBN Management System';
  const navigate = useNavigate();
  const {
    address,
    chainName,
    connector,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    openModal
  } = useAppKitWallet();

  // Format address for display
  const formattedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  const walletName = connector || 'Wallet';
  const isAvailable = typeof window !== 'undefined' && (window.ethereum || true); // Reown handles wallet detection

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const handleSwitchAccount = () => {
    // Open Reown modal to switch account
    openModal();
  };

  return (
    <div className="fixed top-0 left-[274px] right-0 z-40 bg-white border-b border-neutral-200 flex items-center justify-between px-6 py-5">
      <div className="flex items-center gap-3.5">
        <img alt="System" className="size-8" src={imgVector1} />
        <h1 className="font-honor-sans font-semibold text-[21px]">{title}</h1>
      </div>
      
      <div className="flex items-center gap-5">
        {/* Web3 Connect Wallet button */}
        {isAvailable ? (
          <>
            {isConnected ? (
              <>
                <div className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium flex items-center gap-2">
                  {walletName && (
                    <span className="text-xs text-gray-500">({walletName})</span>
                  )}
                  <span>{formattedAddress || address}</span>
                </div>
                <button
                  onClick={handleSwitchAccount}
                  disabled={isConnecting}
                  className="border border-black flex items-center gap-1.5 px-2.5 py-2 rounded-full hover:bg-black hover:text-white transition-colors group disabled:opacity-50"
                  title="Switch wallet account (will show popup)"
                >
                  <span className="font-bold text-xs group-hover:text-white">
                    {isConnecting ? 'Switching...' : 'Switch Account'}
                  </span>
                </button>
                <button
                  onClick={disconnect}
                  className="border border-black flex items-center gap-1.5 px-2.5 py-2 rounded-full hover:bg-black hover:text-white transition-colors group"
                  title={`Disconnect ${walletName || 'Wallet'} (Note: You may need to disconnect in ${walletName || 'wallet'} settings)`}
                >
                  <span className="font-bold text-xs group-hover:text-white">Disconnect</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="border border-black flex items-center gap-1.5 px-2.5 py-2 rounded-full hover:bg-black hover:text-white transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img alt="" className="w-3.5 h-3.5" src={imgVector3} />
                <span className="font-bold text-xs group-hover:text-white">
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </span>
              </button>
            )}
          </>
        ) : null}
        
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
