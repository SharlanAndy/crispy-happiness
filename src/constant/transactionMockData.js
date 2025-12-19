// Mock data for transaction details page
export const MOCK_TRANSACTION_DETAIL = {
  id: 'tx-a1b2c3d4',
  type: 'Payment',
  time: '01-11-2025 13:00',
  status: 'Success',
  walletAddress: '0xF3A....12345',
  amount: '10,000.00 USDT',
  fees: '10.00 USDT',
  netAmount: '9,990.00 USDT',
};

export const MOCK_TRANSACTION_RECEIVER = {
  merchantId: 'Mer12341',
  companyName: 'Food Trading Sdn Bhd',
  receiverWalletAddress: 'F0x32Be3...d$C53',
};

export const MOCK_TRANSACTION_SENDER = {
  agentId: 'Agent56789',
  memberId: 'Mem98765',
  senderWalletAddress: 'S0x45Be3...d$C53',
};

export const MOCK_TRANSACTION_INFO = {
  amount: '10,000.00 USDT',
  platformFees: '5.00 USDT',
  processingFees: '5.00 USDT',
  netProfit: '10.00 USDT',
};

export const MOCK_TRANSACTION_REFERRAL = {
  referralFees: '2.00 USDT',
  receiverWalletAddress: 'F0x32Be3...d$C53',
};

export const MOCK_TRANSACTION_BONUS = {
  level1: '2.00 USDT',
  level2: '1.00 USDT',
  agentlevel1: '1.50 USDT',
  agentlevel2: '0.50 USDT',
};

export const MOCK_TRANSACTION_OTHERS = {
  merchantOrderNumber: 'MORD1234567890',
  reference: 'Ref20251101',
};

/**
 * Generate transaction info items for InfoSection
 * @param {string} id - Transaction ID
 * @param {Object} transaction - Transaction data object
 * @returns {Array} Array of info items
 */
export function getTransactionInfoItems(id, transaction = MOCK_TRANSACTION_DETAIL) {
  return [
    { label: 'Transaction ID', value: id || transaction.id },
    { label: 'Type of Transaction', value: transaction.type },
    { label: 'Time', value: transaction.time },
    { label: 'Status', value: transaction.status, badge: true },
  ];
}

export function getTransactionReceiver(id, transaction = MOCK_TRANSACTION_RECEIVER) {
  return [
    { label: 'Merchant ID', value: transaction.merchantId || 'N/A' },
    { label: 'Company Name', value: transaction.companyName || 'N/A' },
    { label: 'Receiver Wallet Address', value: transaction.receiverWalletAddress || 'N/A' },
  ];
}

export function getTransactionSender(id, transaction = MOCK_TRANSACTION_SENDER) {
  // Show both Agent ID and Member ID if available, or show the one that exists
  const agentMemberId = transaction.agentId && transaction.memberId 
    ? `${transaction.agentId} / ${transaction.memberId}`
    : transaction.agentId || transaction.memberId || 'N/A';
  
  return [
    { label: 'Agent/Member ID', value: agentMemberId },
    { label: 'Sender Wallet Address', value: transaction.senderWalletAddress || 'N/A' },
  ];
}

export function getTransactionInfo(id, transaction = MOCK_TRANSACTION_INFO) {
  return [
    { label: 'Amount', value: transaction.amount || '0 USDT' },
    { label: 'Platform Fees', value: transaction.platformFees || '0 USDT' },
    { label: 'Processing Fees', value: transaction.processingFees || '0 USDT' },
    { label: 'Net Profit', value: transaction.netProfit || '0 USDT' },
  ];
}

export function getTransactionReferral(transaction = MOCK_TRANSACTION_REFERRAL) {
  return [
    { label: 'Referral Fees', value: transaction.referralFees || '0 USDT' },
    { label: 'Receiver Wallet Address', value: transaction.receiverWalletAddress || 'N/A' },
  ];
}

export function getTransactionBonus(id, transaction = MOCK_TRANSACTION_BONUS) {
  return [
    { label: 'Level 1', value: transaction.level1 || '0 USDT' },
    { label: 'Level 2', value: transaction.level2 || '0 USDT' },
    { label: 'Agent Level 1', value: transaction.agentlevel1 || '0 USDT' },
    { label: 'Agent Level 2', value: transaction.agentlevel2 || '0 USDT' },
  ];
}

export function getTransactionOthers(id, transaction = MOCK_TRANSACTION_OTHERS) {
  return [
    { label: 'Merchant Order Number', value: id || transaction.merchantOrderNumber },
    { label: 'Reference', value: transaction.reference },
  ];
}