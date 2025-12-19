/**
 * Simple logger utility for web3 components
 */
export const logger = {
  log: (...args) => {
    if (import.meta.env.DEV) {
      console.log('[Web3]', ...args);
    }
  },
  warn: (...args) => {
    console.warn('[Web3]', ...args);
  },
  error: (...args) => {
    console.error('[Web3]', ...args);
  },
  info: (...args) => {
    console.info('[Web3]', ...args);
  },
};

