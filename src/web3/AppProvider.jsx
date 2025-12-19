import { useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { web3Config } from './config/appkit.js'
import { logger } from '@/lib/logger'

// Web3 Provider component
export const Web3Provider = ({ children }) => {
  // Suppress SIWX errors since we're not using Sign-In with X
  useEffect(() => {
    // Suppress "Invalid App Configuration" UI alert from Reown AppKit
    const hideInvalidConfigAlert = () => {
      const alerts = document.querySelectorAll('[class*="alert"], [class*="error"], [class*="w3m"]');
      alerts.forEach((alert) => {
        const text = alert.textContent || '';
        if (text.includes('Invalid App Configuration') || text.includes('APKT002')) {
          (alert).style.display = 'none';
          alert.remove();
        }
      });
    };
    
    const observer = new MutationObserver(hideInvalidConfigAlert);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    
    const interval = setInterval(hideInvalidConfigAlert, 500);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      // Suppress "No ActiveCaipAddress found" errors from SIWX
      if (
        event.reason?.message?.includes('No ActiveCaipAddress found') ||
        event.reason?.message?.includes('ActiveCaipAddress') ||
        (event.reason?.stack && event.reason.stack.includes('SIWXUtil'))
      ) {
        logger.warn('[SIWX] Suppressed SIWX error (not using Sign-In with X):', event.reason?.message);
        event.preventDefault();
      }
      
      // Suppress APKT002 errors
      if (
        event.reason?.code === 'APKT002' ||
        (event.reason?.message && event.reason.message.includes('not in your allow list')) ||
        (event.reason?.message && event.reason.message.includes('Invalid App Configuration'))
      ) {
        event.preventDefault();
      }
      
      // Log wallet connection errors for debugging
      if (
        event.reason?.message?.includes('connection') ||
        event.reason?.message?.includes('declined') ||
        event.reason?.message?.includes('rejected') ||
        event.reason?.message?.includes('wallet') ||
        event.reason?.code === 'USER_REJECTED' ||
        event.reason?.code === 4001
      ) {
        logger.error('[Wallet Connection] Error detected:', {
          code: event.reason?.code,
          message: event.reason?.message,
          name: event.reason?.name,
        });
      }
    };

    // Suppress duplicate APKT002 console errors
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('not in your allow list') || errorMessage.includes('APKT002') || errorMessage.includes('Invalid App Configuration')) {
        return;
      }
      originalError.apply(console, args);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalError;
    };
  }, []);

  return (
    <WagmiProvider config={web3Config.wagmiConfig}>
      <QueryClientProvider client={web3Config.queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Export query client for use elsewhere
export const queryClient = web3Config.queryClient

