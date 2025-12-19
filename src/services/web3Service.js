import { ethers } from 'ethers';

/**
 * Web3 Service - Handles wallet connection and interaction
 * Supports MetaMask, Trust Wallet, Token Pocket, imToken, and other EIP-1193 compatible wallets
 */

// Wallet detection - identify which wallet is being used
export const detectWallet = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const ethereum = window.ethereum;

  if (!ethereum) {
    console.log('No window.ethereum found');
    return null;
  }

  console.log('=== DETECTING WALLET ===');
  console.log('window.ethereum object:', ethereum);
  console.log('isMetaMask:', ethereum.isMetaMask);
  console.log('isTrust:', ethereum.isTrust);
  console.log('isTokenPocket:', ethereum.isTokenPocket);
  console.log('isImToken:', ethereum.isImToken);
  console.log('isCoinbaseWallet:', ethereum.isCoinbaseWallet);
  console.log('isBraveWallet:', ethereum.isBraveWallet);
  console.log('selectedAddress:', ethereum.selectedAddress);

  // Check for specific wallet providers
  // MetaMask
  if (ethereum.isMetaMask) {
    return {
      name: 'MetaMask',
      id: 'metamask',
      provider: ethereum
    };
  }

  // Trust Wallet
  if (ethereum.isTrust) {
    return {
      name: 'Trust Wallet',
      id: 'trustwallet',
      provider: ethereum
    };
  }

  // Token Pocket
  if (ethereum.isTokenPocket) {
    return {
      name: 'Token Pocket',
      id: 'tokenpocket',
      provider: ethereum
    };
  }

  // imToken
  if (ethereum.isImToken) {
    return {
      name: 'imToken',
      id: 'imtoken',
      provider: ethereum
    };
  }

  // Coinbase Wallet
  if (ethereum.isCoinbaseWallet) {
    return {
      name: 'Coinbase Wallet',
      id: 'coinbase',
      provider: ethereum
    };
  }

  // Brave Wallet
  if (ethereum.isBraveWallet) {
    return {
      name: 'Brave Wallet',
      id: 'brave',
      provider: ethereum
    };
  }

  // Generic EIP-1193 provider (fallback)
  return {
    name: 'Web3 Wallet',
    id: 'generic',
    provider: ethereum
  };
};

// Get all available wallets (when multiple are installed)
export const getAvailableWallets = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  const wallets = [];

  // Check if multiple providers are available (window.ethereum.providers)
  if (window.ethereum && Array.isArray(window.ethereum.providers)) {
    // Multiple providers - check each one
    window.ethereum.providers.forEach((provider, index) => {
      let walletName = 'Unknown Wallet';
      let walletId = 'unknown';
      
      if (provider.isMetaMask) {
        walletName = 'MetaMask';
        walletId = 'metamask';
      } else if (provider.isTrust) {
        walletName = 'Trust Wallet';
        walletId = 'trustwallet';
      } else if (provider.isTokenPocket) {
        walletName = 'Token Pocket';
        walletId = 'tokenpocket';
      } else if (provider.isImToken) {
        walletName = 'imToken';
        walletId = 'imtoken';
      } else if (provider.isCoinbaseWallet) {
        walletName = 'Coinbase Wallet';
        walletId = 'coinbase';
      } else if (provider.isBraveWallet) {
        walletName = 'Brave Wallet';
        walletId = 'brave';
      }
      
      wallets.push({
        name: walletName,
        id: walletId,
        provider: provider,
        index: index,
        selectedAddress: provider.selectedAddress
      });
    });
  } else if (window.ethereum) {
    // Single provider
    const detected = detectWallet();
    if (detected) {
      wallets.push({
        ...detected,
        selectedAddress: window.ethereum.selectedAddress
      });
    }
  }

  return wallets;
};

// Get the REAL MetaMask provider (not a test/mock one)
export const getRealMetaMaskProvider = () => {
  if (!window.ethereum) {
    return null;
  }

  // If there are multiple providers, find the real MetaMask
  if (Array.isArray(window.ethereum.providers)) {
    // Look for MetaMask in the providers array
    const metamaskProvider = window.ethereum.providers.find(p => p.isMetaMask);
    if (metamaskProvider) {
      console.log('Found MetaMask in providers array:', metamaskProvider.selectedAddress);
      return metamaskProvider;
    }
  }

  // If main window.ethereum is MetaMask, use it
  if (window.ethereum.isMetaMask) {
    console.log('Using main window.ethereum as MetaMask:', window.ethereum.selectedAddress);
    return window.ethereum;
  }

  return null;
};

// Check if any Web3 provider is available
export const isWeb3Available = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Get the Web3 provider (automatically detects which wallet is being used)
export const getWeb3Provider = (walletProvider = null) => {
  if (!isWeb3Available()) {
    throw new Error('No Web3 provider found. Please install MetaMask, Trust Wallet, Token Pocket, imToken, or another Web3 wallet.');
  }

  // Use provided provider or default to window.ethereum
  const provider = walletProvider || window.ethereum;
  return new ethers.BrowserProvider(provider);
};

// Connect to wallet and get signer
// THIS FUNCTION WILL TRIGGER THE WALLET POPUP
export const connectWallet = async (walletProvider = null) => {
  try {
    if (!isWeb3Available()) {
      throw new Error('No Web3 provider found. Please install MetaMask, Trust Wallet, Token Pocket, imToken, or another Web3 wallet.');
    }

    // DEBUG: Log all wallet providers
    console.log('=== WALLET DEBUG INFO ===');
    console.log('window.ethereum:', window.ethereum);
    console.log('window.ethereum.isMetaMask:', window.ethereum?.isMetaMask);
    console.log('window.ethereum.selectedAddress:', window.ethereum?.selectedAddress);
    console.log('window.ethereum.providers:', window.ethereum?.providers);
    
    // Check for multiple providers
    if (Array.isArray(window.ethereum?.providers)) {
      console.log('Multiple wallet providers detected:', window.ethereum.providers.length);
      window.ethereum.providers.forEach((provider, index) => {
        console.log(`Provider ${index}:`, {
          isMetaMask: provider.isMetaMask,
          isTrust: provider.isTrust,
          isTokenPocket: provider.isTokenPocket,
          selectedAddress: provider.selectedAddress
        });
      });
    }

    // IMPORTANT: Use the REAL MetaMask from providers array if available
    // This prevents using test/mock wallets that hijack window.ethereum
    let ethereumProvider = walletProvider;
    
    if (!ethereumProvider) {
      // Try to get the real MetaMask provider
      const realMetaMask = getRealMetaMaskProvider();
      if (realMetaMask) {
        console.log('Using REAL MetaMask from providers array');
        ethereumProvider = realMetaMask;
      } else {
        console.log('Using main window.ethereum (may be a test/mock wallet)');
        ethereumProvider = window.ethereum;
      }
    }
    
    console.log('Selected provider:', ethereumProvider);
    console.log('Provider selectedAddress:', ethereumProvider?.selectedAddress);
    
    // Detect which wallet is being used
    const detectedWallet = detectWallet();
    console.log('Detected wallet:', detectedWallet);

    console.log('Requesting wallet connection...', detectedWallet?.name || 'Web3 Wallet');
    console.log('Using provider with selectedAddress:', ethereumProvider?.selectedAddress);
    
    // IMPORTANT: MetaMask behavior:
    // - If site is NOT approved: eth_requestAccounts WILL show popup ✅
    // - If site IS approved: eth_requestAccounts returns accounts WITHOUT popup ❌
    // 
    // To ALWAYS show popup, we use wallet_requestPermissions
    // This will show popup even if site is already approved
    
    console.log('Requesting wallet connection - this WILL show MetaMask popup...');
    let accounts;
    
    try {
      // Use wallet_requestPermissions - this ALWAYS shows popup
      // Even if site is already approved, this will show the popup again
      console.log('Calling wallet_requestPermissions (forces popup)...');
      await ethereumProvider.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
      console.log('Permissions granted, fetching accounts...');
      // After permissions, get the accounts
      accounts = await ethereumProvider.request({ method: 'eth_accounts' });
    } catch (permError) {
      // If wallet_requestPermissions is not supported (older wallets), use eth_requestAccounts
      console.log('wallet_requestPermissions not supported, using eth_requestAccounts');
      console.log('Note: This may not show popup if site is already approved');
      // This will show popup ONLY if site is not approved
      accounts = await ethereumProvider.request({ 
        method: 'eth_requestAccounts' 
      });
    }
    
    console.log('=== ACCOUNTS RETURNED ===');
    console.log('Accounts from wallet:', accounts);
    console.log('Number of accounts:', accounts?.length);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from wallet');
    }
    
    console.log('Wallet connected, accounts:', accounts);
    
    // Get provider and signer
    const provider = getWeb3Provider(ethereumProvider);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const chainId = (await provider.getNetwork()).chainId.toString();

    console.log('=== FINAL WALLET INFO ===');
    console.log('Connected wallet address:', address);
    console.log('Wallet name:', detectedWallet?.name);
    console.log('Chain ID:', chainId);
    console.log('========================');

    return {
      address,
      provider,
      signer,
      chainId,
      walletName: detectedWallet?.name || 'Web3 Wallet',
      walletId: detectedWallet?.id || 'generic'
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    // Re-throw with more context
    if (error.code === 4001) {
      throw new Error('User rejected the connection request');
    }
    throw error;
  }
};

// Get current connected account
// IMPORTANT: This only returns an address if the wallet is ACTUALLY connected
// It checks window.ethereum.selectedAddress which is only set after user approval
export const getConnectedAccount = async (walletProvider = null) => {
  try {
    if (!isWeb3Available()) {
      return null;
    }

    // Use the REAL MetaMask provider if not specified
    let ethereumProvider = walletProvider;
    if (!ethereumProvider) {
      const realMetaMask = getRealMetaMaskProvider();
      if (realMetaMask) {
        console.log('getConnectedAccount: Using REAL MetaMask from providers array');
        ethereumProvider = realMetaMask;
      } else {
        console.log('getConnectedAccount: Using main window.ethereum');
        ethereumProvider = window.ethereum;
      }
    }
    
    console.log('getConnectedAccount: Checking provider with selectedAddress:', ethereumProvider?.selectedAddress);
    
    // Check if wallet has selectedAddress (means user has approved connection)
    // This is the ONLY way to know if wallet is actually connected
    if (!ethereumProvider.selectedAddress) {
      console.log('getConnectedAccount: No selectedAddress, not connected');
      return null;
    }
    
    // Double-check by requesting accounts (won't show popup if already connected)
    const accounts = await ethereumProvider.request({ method: 'eth_accounts' });
    
    console.log('getConnectedAccount: Accounts returned:', accounts);
    
    if (!accounts || accounts.length === 0) {
      console.log('getConnectedAccount: No accounts returned');
      return null;
    }

    const provider = getWeb3Provider(ethereumProvider);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const chainId = (await provider.getNetwork()).chainId.toString();
    
    // Detect wallet from the provider we're using
    let walletName = 'Web3 Wallet';
    let walletId = 'generic';
    if (ethereumProvider.isMetaMask) {
      walletName = 'MetaMask';
      walletId = 'metamask';
    }

    console.log('getConnectedAccount: Returning account:', { address, walletName });

    return {
      address,
      chainId,
      walletName,
      walletId
    };
  } catch (error) {
    console.error('Error getting connected account:', error);
    return null;
  }
};

// Disconnect wallet (clear local state and MetaMask connection)
export const disconnectWallet = async () => {
  try {
    if (isWeb3Available() && window.ethereum) {
      // Try to disconnect from MetaMask (if supported)
      // MetaMask doesn't have a standard disconnect, but we can clear the connection
      // by removing the site from MetaMask's approved sites
      // User will need to manually disconnect in MetaMask settings
      
      // Clear any cached connection state
      if (window.ethereum.removeAllListeners) {
        window.ethereum.removeAllListeners();
      }
    }
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
  return true;
};

// Get list of all available wallets for user selection
export const getAllAvailableWallets = () => {
  const wallets = [];
  
  if (!window.ethereum) {
    return wallets;
  }
  
  // If multiple providers, list them all
  if (Array.isArray(window.ethereum.providers)) {
    window.ethereum.providers.forEach((provider, index) => {
      let name = 'Unknown Wallet';
      if (provider.isMetaMask) name = 'MetaMask';
      else if (provider.isTrust) name = 'Trust Wallet';
      else if (provider.isTokenPocket) name = 'Token Pocket';
      else if (provider.isImToken) name = 'imToken';
      else if (provider.isCoinbaseWallet) name = 'Coinbase Wallet';
      else if (provider.isBraveWallet) name = 'Brave Wallet';
      
      wallets.push({
        name,
        provider,
        index,
        selectedAddress: provider.selectedAddress
      });
    });
  } else if (window.ethereum) {
    // Single provider
    let name = 'Web3 Wallet';
    if (window.ethereum.isMetaMask) name = 'MetaMask';
    else if (window.ethereum.isTrust) name = 'Trust Wallet';
    else if (window.ethereum.isTokenPocket) name = 'Token Pocket';
    else if (window.ethereum.isImToken) name = 'imToken';
    
    wallets.push({
      name,
      provider: window.ethereum,
      selectedAddress: window.ethereum.selectedAddress
    });
  }
  
  return wallets;
};

// Format wallet address for display (truncate middle)
export const formatWalletAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

// Listen for account changes
export const onAccountsChanged = (callback, walletProvider = null) => {
  if (!isWeb3Available()) {
    return () => {};
  }

  const ethereumProvider = walletProvider || window.ethereum;
  ethereumProvider.on('accountsChanged', callback);

  // Return cleanup function
  return () => {
    if (ethereumProvider.removeListener) {
      ethereumProvider.removeListener('accountsChanged', callback);
    }
  };
};

// Listen for chain changes
export const onChainChanged = (callback, walletProvider = null) => {
  if (!isWeb3Available()) {
    return () => {};
  }

  const ethereumProvider = walletProvider || window.ethereum;
  ethereumProvider.on('chainChanged', callback);

  // Return cleanup function
  return () => {
    if (ethereumProvider.removeListener) {
      ethereumProvider.removeListener('chainChanged', callback);
    }
  };
};

// Get network name from chain ID
export const getNetworkName = (chainId) => {
  const networks = {
    '1': 'Ethereum Mainnet',
    '3': 'Ropsten',
    '4': 'Rinkeby',
    '5': 'Goerli',
    '56': 'BSC',
    '97': 'BSC Testnet',
    '137': 'Polygon',
    '80001': 'Mumbai',
    '42161': 'Arbitrum',
    '43114': 'Avalanche'
  };
  return networks[chainId] || `Chain ${chainId}`;
};

