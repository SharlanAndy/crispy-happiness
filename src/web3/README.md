# Web3 Module

This module provides Web3 wallet connection and smart contract interaction capabilities using **Reown AppKit** for wallet management and **ethers.js** for contract operations.

## Architecture

- **Wallet Connection**: Reown AppKit (formerly WalletConnect) - handles wallet detection, connection, and account management
- **Contract Interactions**: ethers.js - provides contract read/write operations
- **ERC20 Support**: Full ERC20 token operations (transfer, approve, balance, etc.)

## Structure

```
src/web3/
├── AppProvider.jsx          # Web3 provider wrapper (Wagmi + React Query)
├── config/
│   ├── appkit.js           # Reown AppKit configuration
│   └── chains.js           # Supported blockchain networks
├── hooks/
│   ├── useAppKit.js        # Wallet connection hook (Reown)
│   ├── useContract.js      # Generic contract read/write hooks
│   ├── useERC20.js         # ERC20 token operations hook
│   └── index.js            # Export all hooks
└── services/
    ├── web3Service.js      # Core Web3 utilities (provider, signer, etc.)
    ├── erc20Service.js     # ERC20 token service
    └── contractService.js   # Generic smart contract service
```

## Usage

### 1. Wallet Connection

```javascript
import { useAppKitWallet } from '@/web3/hooks'

function MyComponent() {
  const {
    isConnected,
    address,
    connect,
    disconnect,
    switchNetwork
  } = useAppKitWallet()

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  )
}
```

### 2. ERC20 Token Operations

```javascript
import { useERC20 } from '@/web3/hooks'

function TokenTransfer() {
  const tokenAddress = '0x...' // ERC20 token address
  const {
    balance,
    tokenInfo,
    transfer,
    approve,
    fetchBalance,
    isLoading
  } = useERC20(tokenAddress)

  const handleTransfer = async () => {
    try {
      const tx = await transfer('0x...', '100.5') // to, amount
      console.log('Transaction hash:', tx.hash)
      await tx.wait() // Wait for confirmation
      await fetchBalance() // Refresh balance
    } catch (error) {
      console.error('Transfer failed:', error)
    }
  }

  return (
    <div>
      <p>Balance: {balance?.formatted} {tokenInfo?.symbol}</p>
      <button onClick={handleTransfer} disabled={isLoading}>
        Transfer Tokens
      </button>
    </div>
  )
}
```

### 3. Generic Contract Interactions

```javascript
import { useContractRead, useContractWrite } from '@/web3/hooks'

const CONTRACT_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address, uint256) returns (bool)',
]

function ContractInteraction() {
  const contractAddress = '0x...'
  
  // Read contract data
  const { data: balance, isLoading } = useContractRead(
    contractAddress,
    CONTRACT_ABI,
    'balanceOf',
    ['0x...'] // args
  )

  // Write to contract
  const { write, isPending, hash } = useContractWrite(
    contractAddress,
    CONTRACT_ABI,
    'transfer'
  )

  const handleTransfer = async () => {
    try {
      await write(['0x...', '1000000000000000000']) // args
    } catch (error) {
      console.error('Transfer failed:', error)
    }
  }

  return (
    <div>
      <p>Balance: {balance?.toString()}</p>
      <button onClick={handleTransfer} disabled={isPending}>
        Transfer
      </button>
    </div>
  )
}
```

### 4. Direct Service Usage

```javascript
import {
  transferTokens,
  approveTokens,
  getTokenBalance,
  readContract,
  writeContract
} from '@/web3/hooks'

// ERC20 operations
const tx = await transferTokens(tokenAddress, to, amount, decimals)
await tx.wait()

// Contract operations
const result = await readContract(address, abi, 'functionName', args)
const tx = await writeContract(address, abi, 'functionName', args, options)
```

## Supported Networks

- BNB Smart Chain (Mainnet) - Chain ID: 56
- BNB Smart Chain Testnet - Chain ID: 97
- Hardhat Local (Development) - Chain ID: 31337

## Supported Wallets

- MetaMask
- Trust Wallet
- Binance Web3 Wallet
- Token Pocket
- OKX Wallet
- SafePal
- Bitget
- Math Wallet
- Coin98
- Backpack

## Environment Variables

```env
VITE_REOWN_PROJECT_ID=your_project_id_here
```

Get your project ID from: https://cloud.reown.com/appkit

## Error Handling

All functions throw errors that can be caught and handled:

```javascript
try {
  await transferTokens(tokenAddress, to, amount)
} catch (error) {
  if (error.message.includes('user rejected')) {
    // User cancelled transaction
  } else if (error.message.includes('insufficient')) {
    // Insufficient balance
  } else {
    // Other error
  }
}
```

## Migration Notes

All old Web3 implementations have been removed. Use the Reown-based implementation:

```javascript
import { useAppKitWallet } from '@/web3/hooks'
```

This implementation provides better wallet support with Reown's modal system and full ERC20/smart contract capabilities.

