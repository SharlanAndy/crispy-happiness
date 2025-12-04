// Mock data for transaction details page

export const MOCK_TRANSACTION_DETAIL = {
  id: 'tx-a1b2c3d4',
  walletAddress: '0xF3A....12345',
  amount: '10,000.00 USDT',
  fees: '10.00 USDT',
  netAmount: '9,990.00 USDT',
  time: '01-11-2025 13:00',
  status: 'Success',
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
    { label: 'Wallet Address', value: transaction.walletAddress },
    { label: 'Amount', value: transaction.amount },
    { label: 'Fees', value: transaction.fees },
    { label: 'Net Amount', value: transaction.netAmount },
    { label: 'Time', value: transaction.time },
    { label: 'Status', value: transaction.status, badge: true },
  ];
}
