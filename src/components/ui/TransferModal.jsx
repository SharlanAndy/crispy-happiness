import { useState, useEffect } from 'react';
import { X, Check, Loader2, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import FormField from './FormField';
import TextInput from '../form/TextInput';
import PasswordInput from '../form/PasswordInput';
import CaptchaCheckbox from './CaptchaCheckbox';
import { useAppKitWallet } from '@/web3/hooks';
import { transferTokens } from '@/web3/services/erc20Service';
import { useToast } from '@/contexts/ToastContext';

// USDT (BEP-20) contract address on Binance Smart Chain
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const USDT_DECIMALS = 18; // USDT on BSC uses 18 decimals
const BSC_MAINNET_CHAIN_ID = 56; // Binance Smart Chain Mainnet chain ID

// TEMPORARY: Test address for verifying USDT transfer transaction
// TODO: Remove this after testing and use actual user wallet address
const TEST_RECIPIENT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'; // Valid BSC address format for testing (42 chars: 0x + 40 hex)

export default function TransferModal({ isOpen, onClose, user }) {
  const { showSuccess: showToastSuccess, showError } = useToast();
  const { isConnected, address, connect, chainId, switchNetwork } = useAppKitWallet();
  const [transferData, setTransferData] = useState({
    amount: '',
    username: '',
    password: '',
    isHuman: false,
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  // Get recipient address from user object, fallback to test address for testing
  // Ensure we use the actual address, not display values
  const getRecipientAddress = () => {
    const addr = user?.walletId || user?.wallet_address || TEST_RECIPIENT_ADDRESS;
    // If it's a display value (contains "..."), use test address
    if (addr && addr.includes('...')) {
      return TEST_RECIPIENT_ADDRESS;
    }
    // Ensure it's a valid hex address format
    if (addr && /^0x[a-fA-F0-9]{40}$/.test(addr)) {
      return addr;
    }
    // Fallback to test address
    return TEST_RECIPIENT_ADDRESS;
  };
  const recipientAddress = getRecipientAddress();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTransferData({
        amount: '',
        username: '',
        password: '',
        isHuman: false,
      });
      setCaptchaToken(null);
      setShowSuccessModal(false);
      setIsTransferring(false);
      setTxHash(null);
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    // Validate inputs
    if (!recipientAddress) {
      setError('Recipient address is required');
      return;
    }

    if (!transferData.amount || parseFloat(transferData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Validate captcha
    if (!transferData.isHuman || !captchaToken) {
      setError('Please complete the captcha verification');
      return;
    }

    // Check wallet connection
    if (!isConnected) {
      try {
        await connect();
        // Connection will be handled by Reown modal
        // User needs to approve in wallet, so we'll proceed and let the transfer fail if not connected
        // The error will be caught and shown to user
      } catch (err) {
        if (err.message?.includes('rejected') || err.message?.includes('denied')) {
          setError('Wallet connection was cancelled. Please connect your wallet to proceed.');
        } else {
          setError('Failed to connect wallet. Please try again.');
        }
        return;
      }
    }

    // TEMPORARY: Address format validation disabled for testing
    // TODO: Re-enable after testing
    // if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
    //   setError('Invalid recipient address format');
    //   return;
    // }

    // Validate network - must be on BSC Mainnet
    if (chainId !== BSC_MAINNET_CHAIN_ID) {
      setError(`Please switch to Binance Smart Chain Mainnet. Current network: ${chainId}`);
      try {
        // Attempt to switch network
        await switchNetwork(BSC_MAINNET_CHAIN_ID);
        // Wait a moment for network switch
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        setError(`Failed to switch network: ${err.message || 'Please manually switch to Binance Smart Chain Mainnet in your wallet.'}`);
        setIsTransferring(false);
        return;
      }
    }

    setIsTransferring(true);
    setError(null);

    try {
      // Ensure recipient address is valid and normalized
      const normalizedAddress = recipientAddress.toLowerCase();
      
      // Transfer USDT tokens (will use the current network from the provider)
      const tx = await transferTokens(
        USDT_CONTRACT_ADDRESS,
        normalizedAddress,
        transferData.amount,
        USDT_DECIMALS,
        chainId // Pass chain ID to ensure correct network
      );

      setTxHash(tx.hash);
      showToastSuccess(`Transaction submitted! Hash: ${tx.hash.slice(0, 10)}...`);

      // Wait for transaction confirmation
      await tx.wait();
      
      setShowSuccessModal(true);
      showToastSuccess(`USDT transfer successful! Transaction confirmed.`);
    } catch (err) {
      console.error('Transfer error:', err);
      
      // Extract revert reason from error
      let errorMessage = 'Failed to transfer USDT. Please try again.';
      
      // Check for revert reason in error object (ethers.js v6 format)
      if (err.reason) {
        // Direct revert reason (e.g., "BEP20: transfer amount exceeds balance")
        errorMessage = err.reason;
      } else if (err.revert && err.revert.args && err.revert.args.length > 0) {
        // Revert args array (first element is usually the message)
        errorMessage = err.revert.args[0];
      } else if (err.message) {
        // Fallback to error message
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClose = () => {
    setShowSuccessModal(false);
    setTransferData({
      amount: '',
      username: '',
      password: '',
      isHuman: false,
    });
    setCaptchaToken(null);
    setTxHash(null);
    setError(null);
    setIsTransferring(false);
    onClose();
  };

  if (!isOpen) return null;

  // Success State
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[11px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] p-8 w-full max-w-sm flex flex-col items-center gap-6">
          <div className="w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center">
            <Check size={28} className="text-white" strokeWidth={3} />
          </div>
          <h2 className="text-xl font-semibold text-black">Transfer Successful</h2>
          {txHash && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
              <a
                href={`https://bscscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline break-all"
              >
                {txHash}
              </a>
            </div>
          )}
          <button
            onClick={handleClose}
            className="w-full bg-[#4CAF50] text-white py-3 rounded-lg font-semibold hover:bg-[#45a049] transition-colors"
          >
            Ok, Close
          </button>
        </div>
      </div>
    );
  }

  // Transfer Form
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-[20px] shadow-[0px_16px_16px_0px_rgba(50,50,71,0.08),0px_24px_32px_0px_rgba(50,50,71,0.08)] p-8 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-black">Transfer USDT</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Transfer to */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Transfer to
            </label>
            <div className="bg-[#F3F3F5] px-4 py-3 rounded-md font-medium text-md text-black break-all">
              {recipientAddress || 'No address available'}
            </div>
          </div>

          {/* Wallet Connection Status */}
          {!isConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Please connect your wallet to proceed with the transfer.
              </p>
            </div>
          )}

          {isConnected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">
                Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={transferData.amount}
                onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                className="bg-[#F3F3F5] px-4 py-3 pr-16 rounded-md font-medium text-md text-black outline-none w-full"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-md font-medium text-black">
                USDT
              </span>
            </div>
          </div>

          {/* Username */}
          <FormField label="Username">
            <TextInput
              value={transferData.username}
              onChange={(e) => setTransferData({ ...transferData, username: e.target.value })}
              placeholder="Insert username here"
            />
          </FormField>

          {/* Password */}
          <FormField label="Password">
            <PasswordInput
              value={transferData.password}
              onChange={(e) => setTransferData({ ...transferData, password: e.target.value })}
              placeholder="Insert password here"
            />
          </FormField>

          {/* Captcha Checkbox */}
          <CaptchaCheckbox
            checked={transferData.isHuman}
            onChange={(checked) => setTransferData({ ...transferData, isHuman: checked })}
            onTokenChange={(token) => setCaptchaToken(token)}
            label="I am human"
          />

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 bg-white border border-gray-300 text-black py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                isTransferring || 
                !transferData.amount || 
                parseFloat(transferData.amount) <= 0 ||
                !recipientAddress ||
                !transferData.isHuman ||
                !captchaToken
              }
              className="flex-1 bg-[#4CAF50] text-white py-3 rounded-lg font-semibold hover:bg-[#45a049] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isTransferring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : !isConnected ? (
                'Connect Wallet & Transfer'
              ) : (
                'Confirm Transfer'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
