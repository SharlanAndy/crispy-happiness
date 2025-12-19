import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { imgVector1, imgVector3 } from '../../constant/assets';
import { useAppKitWallet } from '@/web3/hooks/useAppKit';
import { supportedChains } from '@/web3/config/chains';

// Title is intentionally fixed so it cannot be changed by pages/components.
const Header = () => {
  const title = 'NBN Management System';
  const navigate = useNavigate();
  const {
    address,
    chainName,
    chainId,
    connector,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
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

  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const networkMenuRef = useRef(null);

  // Close network menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (networkMenuRef.current && !networkMenuRef.current.contains(event.target)) {
        setShowNetworkMenu(false);
      }
    };

    if (showNetworkMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNetworkMenu]);

  const handleSwitchNetwork = async (targetChainId) => {
    if (!targetChainId) {
      // Toggle network menu
      setShowNetworkMenu(!showNetworkMenu);
      return;
    }

    try {
      setShowNetworkMenu(false);
      await switchNetwork(targetChainId);
    } catch (err) {
      console.error('Failed to switch network:', err);
    }
  };

  // Filter networks based on environment (dev vs production)
  const availableNetworks = import.meta.env.DEV
    ? supportedChains.filter(c => [1, 11155111, 56, 97].includes(c.id)) // Ethereum Mainnet, Sepolia, BSC Mainnet, BSC Testnet
    : supportedChains.filter(c => [1, 56].includes(c.id)); // Ethereum Mainnet, BSC Mainnet only

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
                  <span>{formattedAddress || address}</span>
                </div>
                {chainName && (
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700">
                    {chainName}
                  </div>
                )}
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
                {/* Switch Network button - only available in development */}
                {import.meta.env.DEV && (
                  <div className="relative" ref={networkMenuRef}>
                    <button
                      onClick={() => handleSwitchNetwork()}
                      disabled={isConnecting}
                      className="border border-black flex items-center gap-1.5 px-2.5 py-2 rounded-full hover:bg-black hover:text-white transition-colors group disabled:opacity-50"
                      title="Switch network (Development only)"
                    >
                      <span className="font-bold text-xs group-hover:text-white">
                        Switch Network
                      </span>
                    </button>
                    {showNetworkMenu && (
                      <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                        <div className="py-2">
                          {availableNetworks.map((network) => (
                            <button
                              key={network.id}
                              onClick={() => handleSwitchNetwork(network.id)}
                              disabled={chainId === network.id}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center justify-between ${
                                chainId === network.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                              } ${chainId === network.id ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              <span>{network.name}</span>
                              {chainId === network.id && (
                                <span className="text-blue-600">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
