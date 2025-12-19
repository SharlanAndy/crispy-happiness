import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import {
  getTokenBalance,
  getTokenName,
  getTokenSymbol,
  getTokenDecimals,
  transferTokens,
  approveTokens,
  getTokenAllowance,
  transferFromTokens,
} from '../services/erc20Service.js'

/**
 * Hook for ERC20 token operations
 */
export function useERC20(tokenAddress) {
  const { isConnected, address } = useAccount()
  const [balance, setBalance] = useState(null)
  const [tokenInfo, setTokenInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get token info (name, symbol, decimals)
  const fetchTokenInfo = useCallback(async () => {
    if (!tokenAddress || !isConnected) return

    try {
      setIsLoading(true)
      setError(null)
      const [name, symbol, decimals] = await Promise.all([
        getTokenName(tokenAddress),
        getTokenSymbol(tokenAddress),
        getTokenDecimals(tokenAddress),
      ])
      setTokenInfo({ name, symbol, decimals: Number(decimals) })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [tokenAddress, isConnected])

  // Get token balance
  const fetchBalance = useCallback(async (balanceAddress = address) => {
    if (!tokenAddress || !balanceAddress || !isConnected) return

    try {
      setIsLoading(true)
      setError(null)
      const balanceData = await getTokenBalance(tokenAddress, balanceAddress)
      setBalance(balanceData)
      return balanceData
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [tokenAddress, address, isConnected])

  // Transfer tokens
  const transfer = useCallback(async (to, amount, decimals = tokenInfo?.decimals || 18) => {
    if (!isConnected || !address) {
      const err = new Error('Please connect your wallet first')
      setError(err)
      throw err
    }

    try {
      setIsLoading(true)
      setError(null)
      const tx = await transferTokens(tokenAddress, to, amount, decimals)
      
      // Wait for confirmation
      await tx.wait()
      
      // Refresh balance after transfer
      await fetchBalance()
      
      return tx
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, tokenAddress, tokenInfo?.decimals, fetchBalance])

  // Approve tokens
  const approve = useCallback(async (spender, amount = 'max', decimals = tokenInfo?.decimals || 18) => {
    if (!isConnected || !address) {
      const err = new Error('Please connect your wallet first')
      setError(err)
      throw err
    }

    try {
      setIsLoading(true)
      setError(null)
      const tx = await approveTokens(tokenAddress, spender, amount, decimals)
      
      // Wait for confirmation
      await tx.wait()
      
      return tx
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, tokenAddress, tokenInfo?.decimals])

  // Get allowance
  const fetchAllowance = useCallback(async (owner, spender) => {
    if (!tokenAddress || !owner || !spender || !isConnected) return null

    try {
      setIsLoading(true)
      setError(null)
      const allowance = await getTokenAllowance(tokenAddress, owner, spender)
      return allowance
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [tokenAddress, isConnected])

  // Transfer from (requires approval)
  const transferFrom = useCallback(async (from, to, amount, decimals = tokenInfo?.decimals || 18) => {
    if (!isConnected || !address) {
      const err = new Error('Please connect your wallet first')
      setError(err)
      throw err
    }

    try {
      setIsLoading(true)
      setError(null)
      const tx = await transferFromTokens(tokenAddress, from, to, amount, decimals)
      
      // Wait for confirmation
      await tx.wait()
      
      return tx
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, tokenAddress, tokenInfo?.decimals])

  return {
    // Token info
    tokenInfo,
    fetchTokenInfo,
    
    // Balance
    balance,
    fetchBalance,
    
    // Operations
    transfer,
    approve,
    transferFrom,
    fetchAllowance,
    
    // State
    isLoading,
    error,
  }
}

