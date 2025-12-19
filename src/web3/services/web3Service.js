import { ethers } from 'ethers'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { useAccount } from 'wagmi'

/**
 * Web3 Service - Handles wallet connection and smart contract interactions
 * Uses Reown AppKit for wallet connection and ethers.js for contract interactions
 */

/**
 * Get the ethers provider from Reown/wagmi connection
 */
export const getEthersProvider = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Web3 provider found. Please install a Web3 wallet.')
  }

  // Use the connected wallet provider
  return new ethers.BrowserProvider(window.ethereum)
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

