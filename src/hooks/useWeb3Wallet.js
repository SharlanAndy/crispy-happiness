import { useState, useEffect, useCallback } from 'react';
import {
  isWeb3Available,
  connectWallet,
  getConnectedAccount,
  disconnectWallet,
  formatWalletAddress,
  onAccountsChanged,
  onChainChanged,
  detectWallet,
  getRealMetaMaskProvider
} from '@/services/web3Service';

/**
 * Custom hook for Web3 wallet connection
 * Manages wallet state and provides connection/disconnection functions
 * 
 * @returns {Object} Wallet connection state and functions
 */
export const useWeb3Wallet = () => {
  const [account, setAccount] = useState(null);
  const [address, setAddress] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [chainId, setChainId] = useState(null);
  const [walletName, setWalletName] = useState(null);
  const [walletId, setWalletId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  // Check if Web3 is available on mount
  useEffect(() => {
    // CLEAR ALL LOCALSTORAGE ON MOUNT - NO FAKE ADDRESSES
    localStorage.removeItem('web3_wallet_address');
    localStorage.removeItem('web3_wallet_name');
    
    const available = isWeb3Available();
    setIsAvailable(available);
    
    // Detect wallet type
    if (available) {
      const detected = detectWallet();
      if (detected) {
        setWalletName(detected.name);
        setWalletId(detected.id);
      }
    }
    
    // DON'T auto-check connection on mount - user must explicitly connect
    // This prevents showing fake addresses from previous sessions
    // Only check if user explicitly clicks "Connect Wallet"
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isAvailable) return;

    // Get the real MetaMask provider for event listeners
    const getProviderForEvents = () => {
      if (Array.isArray(window.ethereum?.providers)) {
        const realMetaMask = window.ethereum.providers.find(p => p.isMetaMask);
        if (realMetaMask) {
          return realMetaMask;
        }
      }
      return window.ethereum;
    };

    const provider = getProviderForEvents();

    const handleAccountsChanged = async (accounts) => {
      console.log('Account changed event:', accounts);
      if (accounts.length === 0) {
        // User disconnected wallet
        setAccount(null);
        setAddress(null);
        setFormattedAddress('');
        setChainId(null);
      } else {
        // Account changed
        try {
          const connectedAccount = await getConnectedAccount(provider);
          if (connectedAccount) {
            setAccount(connectedAccount);
            setAddress(connectedAccount.address);
            setFormattedAddress(formatWalletAddress(connectedAccount.address));
            setChainId(connectedAccount.chainId);
            setWalletName(connectedAccount.walletName);
            setWalletId(connectedAccount.walletId);
          }
        } catch (err) {
          console.error('Error handling account change:', err);
        }
      }
    };

    const handleChainChanged = async (chainId) => {
      // Reload page on chain change (MetaMask recommendation)
      window.location.reload();
    };

    const cleanupAccounts = onAccountsChanged(handleAccountsChanged, provider);
    const cleanupChain = onChainChanged(handleChainChanged, provider);

    return () => {
      cleanupAccounts();
      cleanupChain();
    };
  }, [isAvailable]);

  // Connect wallet function
  // This will ALWAYS try to show the MetaMask popup
  const connect = useCallback(async () => {
    if (!isAvailable) {
      setError('No Web3 provider found. Please install MetaMask or another Web3 wallet.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // ALWAYS call connectWallet - this will show popup if not connected
      // If already connected, it will return accounts without popup (MetaMask behavior)
      // But we still want to refresh the connection state
      console.log('Attempting to connect wallet - this should show MetaMask popup if not connected');
      const walletData = await connectWallet();
      
      // Only set state if we actually got a real address from the wallet
      if (walletData && walletData.address) {
        setAccount(walletData);
        setAddress(walletData.address);
        setFormattedAddress(formatWalletAddress(walletData.address));
        setChainId(walletData.chainId);
        setWalletName(walletData.walletName);
        setWalletId(walletData.walletId);
        
        // Store in localStorage for persistence
        localStorage.setItem('web3_wallet_address', walletData.address);
        localStorage.setItem('web3_wallet_name', walletData.walletName || '');
      } else {
        throw new Error('Failed to get wallet address');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      
      // Handle user rejection
      if (err.code === 4001 || err.message?.includes('rejected') || err.message?.includes('denied')) {
        setError('Wallet connection was rejected. Please try again and approve the connection.');
      } else {
        setError(err.message || 'Failed to connect wallet. Please make sure your wallet is unlocked.');
      }
      
      // Clear state on error
      setAccount(null);
      setAddress(null);
      setFormattedAddress('');
      setChainId(null);
      setWalletName(null);
      setWalletId(null);
      
      // Clear localStorage on error
      localStorage.removeItem('web3_wallet_address');
      localStorage.removeItem('web3_wallet_name');
    } finally {
      setIsConnecting(false);
    }
  }, [isAvailable]);

  // Switch wallet account - forces popup to show
  // This will disconnect current connection and show popup to reconnect/select wallet
  const switchAccount = useCallback(async () => {
    if (!isAvailable) {
      setError('No Web3 provider found.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log('=== SWITCHING ACCOUNT - This will show MetaMask popup ===');
      
      // First, clear current connection state
      setAccount(null);
      setAddress(null);
      setFormattedAddress('');
      setChainId(null);
      setWalletName(null);
      setWalletId(null);
      localStorage.removeItem('web3_wallet_address');
      localStorage.removeItem('web3_wallet_name');
      
      // Get the real MetaMask provider
      const realMetaMask = getRealMetaMaskProvider();
      const ethereumProvider = realMetaMask || window.ethereum;
      
      if (!ethereumProvider) {
        throw new Error('No wallet provider found');
      }
      
      console.log('Requesting wallet permissions to switch account...');
      console.log('This WILL show MetaMask popup to select account/wallet');
      
      // Use wallet_requestPermissions - this ALWAYS shows popup
      // This will show the MetaMask popup to select account or wallet
      try {
        await ethereumProvider.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
        console.log('Permissions updated, getting new accounts...');
      } catch (permError) {
        console.log('wallet_requestPermissions error, trying eth_requestAccounts:', permError);
        // Fallback to eth_requestAccounts
        await ethereumProvider.request({ method: 'eth_requestAccounts' });
      }
      
      // Get the new account after switch
      const accounts = await ethereumProvider.request({ method: 'eth_accounts' });
      console.log('New accounts after switch:', accounts);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned after switch');
      }
      
      // Get full account info with the new address
      const account = await getConnectedAccount(ethereumProvider);
      if (account && account.address) {
        console.log('Switched to account:', account.address);
        setAccount(account);
        setAddress(account.address);
        setFormattedAddress(formatWalletAddress(account.address));
        setChainId(account.chainId);
        setWalletName(account.walletName);
        setWalletId(account.walletId);
        
        localStorage.setItem('web3_wallet_address', account.address);
        localStorage.setItem('web3_wallet_name', account.walletName || '');
      } else {
        throw new Error('Failed to get account info after switch');
      }
    } catch (err) {
      console.error('Error switching account:', err);
      if (err.code === 4001) {
        setError('Account switch was rejected by user.');
      } else {
        setError(err.message || 'Failed to switch account. Please try again.');
      }
      
      // On error, try to restore previous connection
      try {
        const previousAccount = await getConnectedAccount();
        if (previousAccount) {
          setAccount(previousAccount);
          setAddress(previousAccount.address);
          setFormattedAddress(formatWalletAddress(previousAccount.address));
          setChainId(previousAccount.chainId);
          setWalletName(previousAccount.walletName);
          setWalletId(previousAccount.walletId);
        }
      } catch (restoreError) {
        console.error('Failed to restore previous connection:', restoreError);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isAvailable]);

  // Disconnect wallet function
  const disconnect = useCallback(() => {
    disconnectWallet();
    setAccount(null);
    setAddress(null);
    setFormattedAddress('');
    setChainId(null);
    setWalletName(null);
    setWalletId(null);
    setError(null);
    
    // Clear from localStorage
    localStorage.removeItem('web3_wallet_address');
    localStorage.removeItem('web3_wallet_name');
  }, []);

  // Don't restore from localStorage - always verify actual connection
  // This prevents showing fake/mock wallet addresses

  return {
    // State
    account,
    address,
    formattedAddress,
    chainId,
    walletName,
    walletId,
    isConnected: !!address,
    isConnecting,
    isAvailable,
    error,
    
    // Functions
    connect,
    disconnect,
    switchAccount
  };
};

