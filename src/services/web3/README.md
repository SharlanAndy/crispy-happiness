# Web3 Module

This module provides Web3 wallet connectivity functionality for the application.

## Overview

The Web3 module consists of:
- **Service Layer** (`../web3Service.js`): Core Web3 functionality for wallet connections
- **React Hook** (`../../hooks/useWeb3Wallet.js`): Custom hook for React components

## Features

- ✅ Connect to MetaMask, Trust Wallet, Token Pocket, imToken, and other EIP-1193 compatible wallets
- ✅ Automatic wallet detection (identifies which wallet is being used)
- ✅ Display formatted wallet addresses with wallet name
- ✅ Listen for account and chain changes
- ✅ Persistent wallet connection (localStorage)
- ✅ Error handling and user feedback
- ✅ Support for multiple networks
- ✅ Support for multiple wallets installed simultaneously

## Usage

### In a React Component

```jsx
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet';

function MyComponent() {
  const {
    address,
    formattedAddress,
    walletName,  // e.g., "MetaMask", "Trust Wallet", "Token Pocket", "imToken"
    walletId,    // e.g., "metamask", "trustwallet", "tokenpocket", "imtoken"
    isConnected,
    isConnecting,
    isAvailable,
    connect,
    disconnect
  } = useWeb3Wallet();

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected with {walletName}: {formattedAddress}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
```

### Direct Service Usage

```javascript
import {
  connectWallet,
  getConnectedAccount,
  formatWalletAddress,
  isWeb3Available
} from '@/services/web3Service';

// Check if Web3 is available
if (isWeb3Available()) {
  // Connect wallet
  const wallet = await connectWallet();
  console.log('Connected:', wallet.address);
  
  // Format address for display
  const formatted = formatWalletAddress(wallet.address);
  console.log('Formatted:', formatted); // "0x1234...5678"
}
```

## Dependencies

- `ethers` (v6.x): Ethereum library for wallet interactions

## Browser Support

Requires a Web3 wallet browser extension. The module automatically detects:
- **MetaMask** - Most popular Ethereum wallet
- **Trust Wallet** - Multi-chain wallet
- **Token Pocket** - Popular in Asia
- **imToken** - Popular in China
- **Coinbase Wallet** - Coinbase's wallet
- **Brave Wallet** - Built into Brave browser
- **Other EIP-1193 compatible wallets** - Any wallet following the standard

The module will automatically detect which wallet you're using and display the wallet name along with the address.

## Network Support

The module supports all EVM-compatible networks:
- Ethereum Mainnet (Chain ID: 1)
- BSC (Chain ID: 56)
- Polygon (Chain ID: 137)
- Arbitrum (Chain ID: 42161)
- Avalanche (Chain ID: 43114)
- And more...

## Error Handling

The module handles common errors:
- No Web3 provider found
- User rejection of connection request
- Network/chain changes
- Account switching

## Storage

Wallet addresses are stored in `localStorage` with the key `web3_wallet_address` for persistence across page reloads.

