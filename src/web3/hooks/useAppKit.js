import { useAppKit, useAppKitAccount, useAppKitProvider, useAppKitState } from '@reown/appkit/react'
import { useDisconnect, useSwitchChain, useBalance, useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { supportedChains, chainMetadata } from '../config/chains.js'
import { formatUnits } from 'viem'

// Main wallet connection hook
export function useAppKitWallet() {
  const { open, close } = useAppKit()
  const { isConnected, address } = useAppKitAccount()
  useAppKitState() // Track state for reactivity
  const { chainId: wagmiChainId, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  
  // Use wagmi's chainId which is more reliable
  const currentChainId = wagmiChainId
  const currentChain = supportedChains.find(c => c.id === currentChainId)
  
  const { data: balance } = useBalance({
    address: address,
    chainId: currentChainId,
  })
  const [isConnecting, setIsConnecting] = useState(false)

  // Get wallet connector info
  const { walletProvider } = useAppKitProvider('eip155')
  
  const walletInfo = {
    isConnected,
    address: address || undefined,
    chainId: currentChainId,
    chainName: currentChain?.name,
    balance: balance ? formatUnits(balance.value, balance.decimals) : '0',
    symbol: balance?.symbol,
    connector: walletProvider?.name || 'Unknown',
    isConnecting,
  }

  const connect = async () => {
    try {
      setIsConnecting(true)
      await open()
    } catch (error) {
      console.error('[useAppKitWallet] Wallet connection failed:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await disconnect()
      await close()
    } catch (error) {
      console.error('Disconnect failed:', error)
      throw error
    }
  }

  const switchNetwork = async (chainId) => {
    try {
      await switchChain({ chainId })
    } catch (error) {
      console.error('Switch network failed:', error)
      throw error
    }
  }

  return {
    ...walletInfo,
    connect,
    disconnect: disconnectWallet,
    switchNetwork,
    openModal: open,
    closeModal: close,
  }
}

// Network info hook
export function useNetworks() {
  const { chainId: accountChainId } = useAccount()
  const currentChainId = accountChainId

  const networks = supportedChains.map((chain) => {
    const metadata = chainMetadata[chain.id]
    return {
      id: chain.id,
      name: chain.name,
      symbol: metadata?.symbol || 'ETH',
      color: metadata?.color || '#627EEA',
      isCurrent: chain.id === currentChainId,
    }
  })

  return {
    networks,
    currentNetwork: networks.find(n => n.isCurrent),
  }
}

// Token balance hook
export function useTokenBalance(address, tokenAddress) {
  const { data: nativeBalance } = useBalance({
    address,
    query: {
      enabled: !!address && !tokenAddress,
    },
  })

  const { data: tokenBalance } = useBalance({
    address,
    token: tokenAddress,
    query: {
      enabled: !!address && !!tokenAddress,
    },
  })

  return {
    nativeBalance,
    tokenBalance,
    balance: tokenBalance || nativeBalance,
  }
}

// Format balance display
export function formatBalance(balance, decimals = 18) {
  if (!balance) return '0.00'
  const formatted = formatUnits(balance, decimals)
  const num = parseFloat(formatted)
  if (num === 0) return '0.00'
  if (num < 0.0001) return '< 0.0001'
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.min(6, Math.max(2, Math.ceil(-Math.log10(num)) + 2)),
  })
}

// Wallet state listener hook
export function useWalletEvents() {
  const [event, setEvent] = useState(null)
  const { address } = useAppKitAccount()
  const { chainId } = useAccount()

  useEffect(() => {
    if (address) {
      setEvent('accountChanged')
    }
  }, [address])

  useEffect(() => {
    if (chainId) {
      setEvent('chainChanged')
    }
  }, [chainId])

  return { event, clearEvent: () => setEvent(null) }
}

