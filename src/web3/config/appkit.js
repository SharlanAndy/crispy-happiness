import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { QueryClient } from '@tanstack/react-query'
import { bscMainnet } from './chains.js'

// Create React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
})

// Reown AppKit Project ID
// Get yours at: https://cloud.reown.com/appkit
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID'

// Validate Project ID is set (only log error if not set)
if (projectId === 'YOUR_PROJECT_ID' && typeof window !== 'undefined') {
  console.error('[Reown AppKit] ⚠️ Project ID is not set! Set VITE_REOWN_PROJECT_ID in your .env file');
}

// Get current origin for domain whitelist validation
const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://nbnadmin.iotareward.com'
const originWithSlash = currentOrigin.endsWith('/') ? currentOrigin : `${currentOrigin}/`

// App metadata for Reown AppKit
// Icons must be accessible via HTTPS and match the whitelisted domain
export const appMetadata = {
  name: 'NBN Management System',
  description: 'NBN Decentralized Finance Platform - Professional Lending and Asset Management',
  url: originWithSlash,
  icons: [
    // Favicon from public directory - will be served at /favicon.svg
    // In production: https://nbnadmin.iotareward.com/favicon.svg
    // In development: http://localhost:5173/favicon.svg
    `${originWithSlash}favicon.svg`,
  ],
}

// Only show BSC Mainnet for compatibility
export const networks = [
  bscMainnet,
]

// Wagmi adapter configuration
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
})

// Wallet IDs for wallets that support BNB Smart Chain
const BNB_CHAIN_WALLET_IDS = {
  METAMASK: 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
  TRUST_WALLET: '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
  SAFEPAL: '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150',
  TOKEN_POCKET: '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66',
  OKX_WALLET: '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709',
  BINANCE_WEB3: '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
  BITGET: 'afbd95522f4041c71dd4f1a065f971a364f034b2452b2f893e20ec8f67a6b295',
  MATH_WALLET: '7674bb4e353bf52886768a3ddc2a4562ce2f4191c80831291218ebd90f5f5e26',
  COIN98: '2a3c89040ac3b723a1972a33a14b4482ccdaa10c5a84a1722aec990c8c4c6c17',
  BACKPACK: '4e6af4201629a5b5e56a9561ece762a9bc1a6096e88a706a7f0882a042de5c86',
}

// Create AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: appMetadata,
  themeMode: 'light',
  themeVariables: {
    '--apkt-z-index': 999999,
    '--apkt-accent': '#137FEC',
    '--apkt-color-mix': '#137FEC',
    '--apkt-color-mix-strength': 10,
    '--apkt-border-radius-master': '4px',
    '--apkt-font-family': "'Figtree', 'HONOR Sans CN', system-ui, -apple-system, sans-serif",
  },
  features: {
    analytics: true,
    connectMethodsOrder: ['wallet'],
  },
  enableWalletGuide: false,
  enableCoinbase: false,
  enableInjected: true,
  enableMobileFullScreen: false,
  enableReconnect: true,
  featuredWalletIds: [
    BNB_CHAIN_WALLET_IDS.METAMASK,
    BNB_CHAIN_WALLET_IDS.TRUST_WALLET,
    BNB_CHAIN_WALLET_IDS.BINANCE_WEB3,
    BNB_CHAIN_WALLET_IDS.OKX_WALLET,
    BNB_CHAIN_WALLET_IDS.BACKPACK,
    BNB_CHAIN_WALLET_IDS.SAFEPAL,
    BNB_CHAIN_WALLET_IDS.TOKEN_POCKET,
    BNB_CHAIN_WALLET_IDS.BITGET,
    BNB_CHAIN_WALLET_IDS.MATH_WALLET,
    BNB_CHAIN_WALLET_IDS.COIN98,
  ],
  includeWalletIds: [
    BNB_CHAIN_WALLET_IDS.METAMASK,
    BNB_CHAIN_WALLET_IDS.TRUST_WALLET,
    BNB_CHAIN_WALLET_IDS.SAFEPAL,
    BNB_CHAIN_WALLET_IDS.TOKEN_POCKET,
    BNB_CHAIN_WALLET_IDS.OKX_WALLET,
    BNB_CHAIN_WALLET_IDS.BINANCE_WEB3,
    BNB_CHAIN_WALLET_IDS.BITGET,
    BNB_CHAIN_WALLET_IDS.MATH_WALLET,
    BNB_CHAIN_WALLET_IDS.COIN98,
    BNB_CHAIN_WALLET_IDS.BACKPACK,
  ],
  allWallets: 'SHOW',
})

// Export config object
export const web3Config = {
  queryClient,
  wagmiAdapter,
  wagmiConfig: wagmiAdapter.wagmiConfig,
  appKit,
  projectId,
  networks,
  metadata: appMetadata,
}

