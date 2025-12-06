import { useState } from 'react';
import { X, Check } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import FormField from './FormField';
import TextInput from '../form/TextInput';
import PasswordInput from '../form/PasswordInput';
import Captcha from '../icons/Captcha';

export default function TransferModal({ isOpen, onClose, user }) {
  const [transferData, setTransferData] = useState({
    amount: '100.00',
    username: '',
    password: '',
    isHuman: false,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = () => {
    // TODO: Add API call to transfer funds
    console.log('Transfer:', transferData);
    setShowSuccess(true);
  };

  const handleClose = () => {
    setShowSuccess(false);
    setTransferData({
      amount: '100.00',
      username: '',
      password: '',
      isHuman: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  // Success State
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[11px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] p-8 w-full max-w-sm flex flex-col items-center gap-6">
          <div className="w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center">
            <Check size={28} className="text-white" strokeWidth={3} />
          </div>
          <h2 className="text-xl font-semibold text-black">Done Transfer</h2>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
            <div className="bg-[#F3F3F5] px-4 py-3 rounded-md font-medium text-md text-black">
              {user?.walletId || '0x467A0a1a715EC0b48d043013e1e70ABe3d4B3c58'}
            </div>
          </div>

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

          {/* hCaptcha */}
          <div className="border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="human-check"
                checked={transferData.isHuman}
                onChange={(e) => setTransferData({ ...transferData, isHuman: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="human-check" className="text-base text-black cursor-pointer">
                I am human
              </label>
            </div>
            <div className="flex flex-col items-center">
              <Captcha />
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className="cursor-pointer hover:underline">Privacy</span>
                <span>-</span>
                <span className="cursor-pointer hover:underline">Terms</span>
              </div>
            </div>
          </div>

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
              disabled={!transferData.isHuman || !transferData.username || !transferData.password}
              className="flex-1 bg-[#4CAF50] text-white py-3 rounded-lg font-semibold hover:bg-[#45a049] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
