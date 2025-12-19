import { ethers } from 'ethers'
import { getAccount, getConnectorClient } from '@wagmi/core'
import { web3Config } from '../config/appkit.js'

/**
 * Web3 Service - Handles wallet connection and smart contract interactions
 * Uses Reown AppKit for wallet connection and ethers.js for contract interactions
 */

/**
 * Get the ethers provider from Reown/wagmi connection
 * This ensures we use the wallet that was actually connected via Reown, not window.ethereum
 * The issue: window.ethereum can be hijacked by other wallet extensions (like Phantom)
 * Solution: Get the provider from the wagmi connector that was actually used for connection
 */
export const getEthersProvider = async () => {
  try {
    // Get wagmi config
    const wagmiConfig = web3Config.wagmiConfig
    
    if (!wagmiConfig) {
      throw new Error('Wagmi config not found')
    }

    // Get the current account from wagmi
    const account = getAccount(wagmiConfig)
    
    if (!account.isConnected || !account.connector) {
      throw new Error('No wallet connected. Please connect your wallet first.')
    }

    // Get the provider from the connector
    // This is the actual provider that was used for connection (e.g., MetaMask)
    // The connector.getProvider() method returns the EIP-1193 provider for the connected wallet
    const connector = account.connector
    
    if (connector && typeof connector.getProvider === 'function') {
      try {
        const walletProvider = await connector.getProvider({ chainId: account.chainId })
        if (walletProvider) {
          // Use the provider from the connected connector (not window.ethereum)
          // This ensures we use MetaMask if MetaMask was connected, not Phantom
          return new ethers.BrowserProvider(walletProvider)
        }
      } catch (providerError) {
        console.warn('[web3Service] Failed to get provider from connector:', providerError)
      }
    }

    // Fallback: Try to get provider from connector client
    try {
      const connectorClient = await getConnectorClient(wagmiConfig, {
        chainId: account.chainId,
      })
      
      // Some connectors expose the provider in the transport
      if (connectorClient?.transport?.value) {
        const transportProvider = connectorClient.transport.value
        if (transportProvider && typeof transportProvider.request === 'function') {
          return new ethers.BrowserProvider(transportProvider)
        }
      }
    } catch (clientError) {
      console.warn('[web3Service] Failed to get connector client:', clientError)
    }

    // Last resort: use window.ethereum but try to find the correct one
    if (typeof window !== 'undefined' && window.ethereum) {
      console.warn('[web3Service] Using window.ethereum as fallback')
      console.warn('[web3Service] Connected connector ID:', connector?.id)
      console.warn('[web3Service] Connected connector name:', connector?.name)
      
      // If multiple providers, try to find the one matching the connector
      if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
        // Try to find MetaMask if that's what was connected
        if (connector?.id === 'io.metamask' || connector?.name?.toLowerCase().includes('metamask')) {
          const metaMaskProvider = window.ethereum.providers.find(p => p.isMetaMask)
          if (metaMaskProvider) {
            return new ethers.BrowserProvider(metaMaskProvider)
          }
        }
        // Try to find the provider that matches the connector
        // Most connectors have an id that matches the wallet
        for (const provider of window.ethereum.providers) {
          if (provider.isMetaMask && connector?.id?.includes('metamask')) {
            return new ethers.BrowserProvider(provider)
          }
        }
      }
      
      return new ethers.BrowserProvider(window.ethereum)
    }

    throw new Error('Unable to get provider from connected wallet.')
  } catch (error) {
    console.error('[web3Service] Error getting ethers provider:', error)
    throw new Error(`Failed to get wallet provider: ${error.message}`)
  }
}

/**
 * Get the signer for the connected wallet
 */
export const getSigner = async () => {
  const provider = await getEthersProvider()
  return await provider.getSigner()
}

/**
 * Get the connected wallet address
 */
export const getConnectedAddress = async () => {
  try {
    const signer = await getSigner()
    return await signer.getAddress()
  } catch (error) {
    console.error('Error getting connected address:', error)
    return null
  }
}

/**
 * Get the current chain ID
 */
export const getChainId = async () => {
  try {
    const provider = await getEthersProvider()
    const network = await provider.getNetwork()
    return Number(network.chainId)
  } catch (error) {
    console.error('Error getting chain ID:', error)
    return null
  }
}

/**
 * Format wallet address for display
 */
export const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return ''
  if (address.length <= startLength + endLength) return address
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * Check if address is valid
 */
export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address)
  } catch {
    return false
  }
}

/**
 * Parse units (convert human-readable amount to wei)
 */
export const parseUnits = (amount, decimals = 18) => {
  return ethers.parseUnits(amount.toString(), decimals)
}

/**
 * Format units (convert wei to human-readable amount)
 */
export const formatUnits = (amount, decimals = 18) => {
  return ethers.formatUnits(amount, decimals)
}

/**
 * Get network name from chain ID
 */
export const getNetworkName = (chainId) => {
  const networks = {
    1: 'Ethereum Mainnet',
    3: 'Ropsten',
    4: 'Rinkeby',
    5: 'Goerli',
    56: 'BNB Smart Chain',
    97: 'BNB Smart Chain Testnet',
    137: 'Polygon',
    80001: 'Mumbai',
    42161: 'Arbitrum',
    43114: 'Avalanche',
  }
  return networks[chainId] || `Chain ${chainId}`
}

/**
 * Wait for transaction confirmation
 */
export const waitForTransaction = async (txHash, confirmations = 1) => {
  const provider = await getEthersProvider()
  return await provider.waitForTransaction(txHash, confirmations)
}

/**
 * Get transaction receipt
 */
export const getTransactionReceipt = async (txHash) => {
  const provider = await getEthersProvider()
  return await provider.getTransactionReceipt(txHash)
}

/**
 * Get transaction by hash
 */
export const getTransaction = async (txHash) => {
  const provider = await getEthersProvider()
  return await provider.getTransaction(txHash)
}

/**
 * Get block number
 */
export const getBlockNumber = async () => {
  const provider = await getEthersProvider()
  return await provider.getBlockNumber()
}

/**
 * Get balance of an address (native token)
 */
export const getBalance = async (address) => {
  const provider = await getEthersProvider()
  return await provider.getBalance(address)
}

/**
 * Get formatted balance (human-readable)
 */
export const getFormattedBalance = async (address) => {
  const balance = await getBalance(address)
  return ethers.formatEther(balance)
}

