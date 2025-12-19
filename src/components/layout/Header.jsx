import { useNavigate } from 'react-router-dom';
import { imgVector1, imgVector3 } from '../../constant/assets';
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet';

// Title is intentionally fixed so it cannot be changed by pages/components.
const Header = () => {
  const title = 'NBN Management System';
  const navigate = useNavigate();
  const {
    address,
    formattedAddress,
    walletName,
    isConnected,
    isConnecting,
    isAvailable,
    error,
    connect,
    disconnect,
    switchAccount
  } = useWeb3Wallet();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleConnectWallet = async () => {
    try {
      // Debug: Log all available wallet providers before connecting
      console.log('=== CHECKING ALL WALLET PROVIDERS ===');
      if (window.ethereum) {
        console.log('window.ethereum:', window.ethereum);
        console.log('Is MetaMask?', window.ethereum.isMetaMask);
        console.log('Selected address:', window.ethereum.selectedAddress);
        
        if (Array.isArray(window.ethereum.providers)) {
          console.log('Multiple providers found:', window.ethereum.providers.length);
          window.ethereum.providers.forEach((p, i) => {
            console.log(`Provider ${i}:`, {
              isMetaMask: p.isMetaMask,
              isTrust: p.isTrust,
              isTokenPocket: p.isTokenPocket,
              selectedAddress: p.selectedAddress
            });
          });
        }
      } else {
        console.log('No window.ethereum found!');
      }
      console.log('=====================================');
      
      await connect();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
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
                  onClick={switchAccount}
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

        {error && (
          <div className="text-xs text-red-500 max-w-xs truncate" title={error}>
            {error}
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
