import { useState, useCallback, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { readContract as readContractService, writeContract as writeContractService, estimateGas as estimateGasService } from '../services/contractService.js'
import { waitForTransaction } from '../services/web3Service.js'

/**
 * Hook for reading contract data (view/pure functions)
 */
export function useContractRead(contractAddress, abi, functionName, args = [], options = {}) {
  const { isConnected, address } = useAccount()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const read = useCallback(async () => {
    if (!isConnected || !contractAddress || !abi || !functionName) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const result = await readContractService(contractAddress, abi, functionName, args)
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, contractAddress, abi, functionName, JSON.stringify(args)])

  // Auto-read on mount and when dependencies change
  useEffect(() => {
    if (options.enabled !== false && isConnected) {
      read()
    }
  }, [read, options.enabled, isConnected])

  return {
    data,
    isLoading,
    error,
    read,
    refetch: read,
  }
}

/**
 * Hook for writing to contracts (state-changing functions)
 */
export function useContractWrite(contractAddress, abi, functionName, args = [], options = {}) {
  const { isConnected, address } = useAccount()
  const [hash, setHash] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)

  const write = useCallback(async (writeArgs = args, writeOptions = options, callbacks = {}) => {
    if (!isConnected || !address) {
      const err = new Error('Please connect your wallet first')
      setError(err)
      callbacks.onError?.(err)
      throw err
    }

    try {
      setIsPending(true)
      setIsConfirming(false)
      setIsSuccess(false)
      setError(null)
      setHash(null)
      setReceipt(null)

      // Write to contract (this triggers wallet popup)
      const tx = await writeContractService(
        contractAddress,
        abi,
        functionName,
        writeArgs,
        writeOptions
      )

      setHash(tx.hash)
      callbacks.onSuccess?.(tx.hash)

      // Wait for confirmation
      setIsConfirming(true)
      const txReceipt = await tx.wait(options.confirmations || 1)

      setReceipt(txReceipt)
      setIsSuccess(true)
      setIsPending(false)
      setIsConfirming(false)
      callbacks.onConfirmed?.(txReceipt)

      return txReceipt
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setIsPending(false)
      setIsConfirming(false)
      callbacks.onError?.(error)
      throw error
    }
  }, [isConnected, address, contractAddress, abi, functionName, JSON.stringify(args), JSON.stringify(options)])

  const reset = useCallback(() => {
    setHash(null)
    setReceipt(null)
    setIsPending(false)
    setIsConfirming(false)
    setIsSuccess(false)
    setError(null)
  }, [])

  return {
    write,
    hash,
    receipt,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  }
}

/**
 * Hook for estimating gas
 */
export function useContractGasEstimate(contractAddress, abi, functionName, args = [], options = {}) {
  const { isConnected, address } = useAccount()
  const [gasEstimate, setGasEstimate] = useState(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [error, setError] = useState(null)

  const estimate = useCallback(async (estimateArgs = args, estimateOptions = options) => {
    if (!isConnected || !address) {
      return null
    }

    try {
      setIsEstimating(true)
      setError(null)
      const gas = await estimateGasService(
        contractAddress,
        abi,
        functionName,
        estimateArgs,
        estimateOptions
      )
      setGasEstimate(gas)
      return gas
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      return null
    } finally {
      setIsEstimating(false)
    }
  }, [isConnected, address, contractAddress, abi, functionName, JSON.stringify(args), JSON.stringify(options)])

  return {
    gasEstimate,
    isEstimating,
    error,
    estimate,
  }
}

