import { ethers } from 'ethers'
import { getSigner } from './web3Service.js'

/**
 * ERC20 Token Service - Handles ERC20 token operations
 */

// Standard ERC20 ABI (minimal interface)
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
]

/**
 * Get ERC20 contract instance
 */
export const getERC20Contract = async (tokenAddress) => {
  const signer = await getSigner()
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer)
}

/**
 * Get token name
 */
export const getTokenName = async (tokenAddress) => {
  try {
    const contract = await getERC20Contract(tokenAddress)
    return await contract.name()
  } catch (error) {
    console.error('Error getting token name:', error)
    throw error
  }
}

/**
 * Get token symbol
 */
export const getTokenSymbol = async (tokenAddress) => {
  try {
    const contract = await getERC20Contract(tokenAddress)
    return await contract.symbol()
  } catch (error) {
    console.error('Error getting token symbol:', error)
    throw error
  }
}

/**
 * Get token decimals
 */
export const getTokenDecimals = async (tokenAddress) => {
  try {
    const contract = await getERC20Contract(tokenAddress)
    return await contract.decimals()
  } catch (error) {
    console.error('Error getting token decimals:', error)
    throw error
  }
}

/**
 * Get token balance for an address
 */
export const getTokenBalance = async (tokenAddress, address) => {
  try {
    const contract = await getERC20Contract(tokenAddress)
    const balance = await contract.balanceOf(address)
    const decimals = await contract.decimals()
    return {
      raw: balance,
      formatted: ethers.formatUnits(balance, decimals),
      decimals: Number(decimals),
    }
  } catch (error) {
    console.error('Error getting token balance:', error)
    throw error
  }
}

/**
 * Transfer tokens
 * @param {string} tokenAddress - ERC20 token contract address
 * @param {string} to - Recipient address
 * @param {string} amount - Amount to transfer (human-readable, e.g., "100.5")
 * @param {number} decimals - Token decimals (default: 18)
 * @returns {Promise<object>} Transaction response
 */
export const transferTokens = async (tokenAddress, to, amount, decimals = 18) => {
  try {
    const contract = await getERC20Contract(tokenAddress)
    const amountWei = ethers.parseUnits(amount.toString(), decimals)
    
    // This will trigger the wallet popup
    const tx = await contract.transfer(to, amountWei)
    
    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    }
  } catch (error) {
    console.error('Error transferring tokens:', error)
    
    // Parse common errors
    if (error.code === 4001 || error.message?.includes('user rejected')) {
      throw new Error('Transaction cancelled. You rejected the transaction in your wallet.')
    }
    if (error.message?.includes('insufficient funds') || error.message?.includes('insufficient balance')) {
      throw new Error('Insufficient token balance.')
    }
    
    throw error
  }
}

/**
 * Transfer tokens from (requires approval first)
 * @param {string} tokenAddress - ERC20 token contract address
 * @param {string} from - Address to transfer from
 * @param {string} to - Recipient address
 * @param {string} amount - Amount to transfer (human-readable)
 * @param {number} decimals - Token decimals (default: 18)
 * @returns {Promise<object>} Transaction response
 */
export const transferFromTokens = async (tokenAddress, from, to, amount, decimals = 18) => {
  try {
    const contract = await getERC20Contract(tokenAddress)
    const amountWei = ethers.parseUnits(amount.toString(), decimals)
    
    const tx = await contract.transferFrom(from, to, amountWei)
    
    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    }
  } catch (error) {
    console.error('Error transferring tokens from:', error)
    
    if (error.code === 4001 || error.message?.includes('user rejected')) {
      throw new Error('Transaction cancelled. You rejected the transaction in your wallet.')
    }
    if (error.message?.includes('insufficient allowance')) {
      throw new Error('Insufficient allowance. Please approve more tokens first.')
    }
    
    throw error
  }
}

/**
 * Approve tokens for spender
 * @param {string} tokenAddress - ERC20 token contract address
 * @param {string} spender - Address to approve
 * @param {string} amount - Amount to approve (human-readable, use "max" for unlimited)
 * @param {number} decimals - Token decimals (default: 18)
 * @returns {Promise<object>} Transaction response
 */
export const approveTokens = async (tokenAddress, spender, amount, decimals = 18) => {
  try {
    const contract = await getERC20Contract(tokenAddress)
    
    let amountWei
    if (amount === 'max' || amount === 'unlimited') {
      // Approve maximum amount
      amountWei = ethers.MaxUint256
    } else {
      amountWei = ethers.parseUnits(amount.toString(), decimals)
    }
    
    // This will trigger the wallet popup
    const tx = await contract.approve(spender, amountWei)
    
    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    }
  } catch (error) {
    console.error('Error approving tokens:', error)
    
    if (error.code === 4001 || error.message?.includes('user rejected')) {
      throw new Error('Transaction cancelled. You rejected the transaction in your wallet.')
    }
    
    throw error
  }
}

/**
 * Get token allowance
 * @param {string} tokenAddress - ERC20 token contract address
 * @param {string} owner - Token owner address
 * @param {string} spender - Spender address
 * @returns {Promise<object>} Allowance info
 */
export const getTokenAllowance = async (tokenAddress, owner, spender) => {
  try {
    const contract = await getERC20Contract(tokenAddress)
    const allowance = await contract.allowance(owner, spender)
    const decimals = await contract.decimals()
    
    return {
      raw: allowance,
      formatted: ethers.formatUnits(allowance, decimals),
      decimals: Number(decimals),
    }
  } catch (error) {
    console.error('Error getting token allowance:', error)
    throw error
  }
}

/**
 * Check if token address is valid ERC20 contract
 */
export const isValidERC20 = async (tokenAddress) => {
  try {
    const contract = await getERC20Contract(tokenAddress)
    // Try to call standard ERC20 functions
    await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ])
    return true
  } catch {
    return false
  }
}

