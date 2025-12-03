// Mock data for merchant details page

export const PROFIT_CHART_DATA = {
  Today: [
    { time: '00:00', profit: 45 },
    { time: '04:00', profit: 120 },
    { time: '08:00', profit: 280 },
    { time: '12:00', profit: 520 },
    { time: '16:00', profit: 410 },
    { time: '20:00', profit: 180 },
    { time: '23:59', profit: 95 },
  ],
  'This Week': [
    { time: 'Mon', profit: 320 },
    { time: 'Tue', profit: 580 },
    { time: 'Wed', profit: 920 },
    { time: 'Thu', profit: 750 },
    { time: 'Fri', profit: 1100 },
    { time: 'Sat', profit: 680 },
    { time: 'Sun', profit: 450 },
  ],
  'This Month': [
    { time: '7.1', profit: 120 },
    { time: '7.2', profit: 620 },
    { time: '7.3', profit: 950 },
    { time: '7.4', profit: 1020 },
    { time: '7.5', profit: 320 },
    { time: '7.6', profit: 180 },
    { time: '7.7', profit: 85 },
  ],
  'This Year': [
    { time: 'Jan', profit: 2500 },
    { time: 'Feb', profit: 3200 },
    { time: 'Mar', profit: 4100 },
    { time: 'Apr', profit: 3800 },
    { time: 'May', profit: 5200 },
    { time: 'Jun', profit: 4900 },
    { time: 'Jul', profit: 6100 },
    { time: 'Aug', profit: 5800 },
    { time: 'Sep', profit: 4500 },
    { time: 'Oct', profit: 5900 },
    { time: 'Nov', profit: 6400 },
    { time: 'Dec', profit: 7200 },
  ],
};

export const MERCHANT_STATS = [
  { label: 'Total Transaction', value: '1,000.00 USDT', lastUpdate: '17-11-2025' },
  { label: 'Total Net Profit', value: '900.00 USDT', lastUpdate: '17-11-2025' },
  { label: 'Total Fees Contributed', value: '88.10 USDT', lastUpdate: '17-11-2025' },
];

export const MERCHANT_BUSINESS_INFO = [
  { label: "Merchant's Group", value: 'T3' },
  { label: 'Email', value: 'f&b@gmail.com' },
  { label: 'Password', value: '********' },
  { label: 'Company Name', value: 'Food Merchant Sdn Bhd' },
  { label: 'SSM Number', value: '202591231345' },
  { label: "Merchant's Type", value: 'F&B' },
  { label: 'Status', value: <span className="px-3 py-1 rounded-md bg-green-100 text-green-700 text-sm font-medium">Active</span> },
];

export const MERCHANT_ADDRESS_INFO = [
  { label: 'Address Line 1', value: '11, Pusat Bandar Puchong, IOI Boulevard' },
  { label: 'Address Line 2', value: '' },
  { label: 'City', value: 'Puchong' },
  { label: 'Postcode', value: '47100' },
  { label: 'State', value: 'Selangor' },
  { label: 'Country', value: 'Malaysia' },
];

export const MERCHANT_WALLET_INFO = [
  { label: 'Wallet Address', value: '0x123456789abcdef' },
];

export const MERCHANT_SPONSOR_INFO = [
  { label: 'Sponsor By', value: 'Sponsor Name' },
  { label: 'Fees', value: '1234' },
];

export const MERCHANT_FEES_INFO = [
  { label: 'Markup Fees', value: '10%' },
  { label: 'Processing Fees', value: '10%' },
];

export const MERCHANT_CURRENCY_INFO = [
  { label: 'Currency', value: '🇲🇾 Malaysia - RM' },
];

export const MOCK_TRANSACTIONS = [
  { id: 'tx-a1b2c3d4', type: 'Payment', amount: '100.00 U', net: '99.00 U', bonus: '0.5 U', time: '01-11-2025 13:00', status: 'Success' },
  { id: 'tx-e5f6g7h8', type: 'Payment', amount: '250.00 U', net: '245.00 U', bonus: '5.0 U', time: '02-11-2025 09:30', status: 'Pending' },
  { id: 'tx-i9j0k1l2', type: 'Payment', amount: '150.00 U', net: '148.00 U', bonus: '2.0 U', time: '03-11-2025 15:45', status: 'Failed' },
  { id: 'tx-m3n4o5p6', type: 'Payment', amount: '300.00 U', net: '295.00 U', bonus: '5.0 U', time: '04-11-2025 10:15', status: 'Success' },
  { id: 'tx-q7r8s9t0', type: 'Payment', amount: '180.00 U', net: '177.00 U', bonus: '3.0 U', time: '05-11-2025 14:20', status: 'Success' },
  { id: 'tx-u1v2w3x4', type: 'Payment', amount: '420.00 U', net: '412.00 U', bonus: '8.0 U', time: '06-11-2025 16:35', status: 'Success' },
  { id: 'tx-y5z6a7b8', type: 'Payment', amount: '95.00 U', net: '93.00 U', bonus: '2.0 U', time: '07-11-2025 11:50', status: 'Pending' },
  { id: 'tx-c9d0e1f2', type: 'Payment', amount: '275.00 U', net: '270.00 U', bonus: '5.0 U', time: '08-11-2025 09:15', status: 'Success' },
  { id: 'tx-g3h4i5j6', type: 'Payment', amount: '330.00 U', net: '324.00 U', bonus: '6.0 U', time: '09-11-2025 13:40', status: 'Failed' },
  { id: 'tx-k7l8m9n0', type: 'Payment', amount: '210.00 U', net: '206.00 U', bonus: '4.0 U', time: '10-11-2025 15:25', status: 'Success' },
  { id: 'tx-o1p2q3r4', type: 'Payment', amount: '145.00 U', net: '142.00 U', bonus: '3.0 U', time: '11-11-2025 10:55', status: 'Success' },
  { id: 'tx-s5t6u7v8', type: 'Payment', amount: '380.00 U', net: '373.00 U', bonus: '7.0 U', time: '12-11-2025 14:10', status: 'Pending' },
  { id: 'tx-w9x0y1z2', type: 'Payment', amount: '125.00 U', net: '122.00 U', bonus: '3.0 U', time: '13-11-2025 16:45', status: 'Success' },
  { id: 'tx-a3b4c5d6', type: 'Payment', amount: '295.00 U', net: '289.00 U', bonus: '6.0 U', time: '14-11-2025 11:30', status: 'Success' },
  { id: 'tx-e7f8g9h0', type: 'Payment', amount: '175.00 U', net: '172.00 U', bonus: '3.0 U', time: '15-11-2025 13:20', status: 'Failed' },
];

export const TRANSACTION_COLUMNS = [
  { key: 'id', label: 'Trans. ID' },
  { key: 'type', label: 'Type' },
  { key: 'amount', label: 'Amount' },
  { key: 'net', label: 'Net Profit' },
  { key: 'bonus', label: 'Bonus' },
  { key: 'time', label: 'Time' },
  { key: 'status', label: 'Status' },
];

export const PROFIT_TABS = ['Today', 'This Week', 'This Month', 'This Year'];
