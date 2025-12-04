// Mock data for settings pages

export const MERCHANT_TYPES = [
  'F&B',
  'Retail',
  'Healthcare',
  'Electronics',
  'Fashion',
  'Beauty & Wellness',
  'Sports & Fitness',
  'Hospitality',
  'Automotive',
  'Others'
];

export const MERCHANT_GROUPS = ['T1', 'T2', 'T3'];

export const CURRENCIES = [
  '🇲🇾 Malaysia - RM',
  '🇸🇬 Singapore - SGD',
  '🇺🇸 USA - USD',
  '🇬🇧 UK - GBP',
  '🇪🇺 Europe - EUR'
];

export const ACCOUNT_STATUSES = [
  'Active',
  'Inactive',
  'Suspended',
  'Pending Verification',
  'Deactivated'
];

export const PERMISSIONS = [
  {
    id: 'create_transactions',
    label: 'Can Create Transactions',
    description: 'Allow this user to create new transactions'
  },
  {
    id: 'manage_team',
    label: 'Can Manage Team',
    description: 'Allow this user to manage their team members'
  },
  {
    id: 'withdraw_funds',
    label: 'Can Withdraw Funds',
    description: 'Allow this user to withdraw funds'
  }
];

// Initial form data
export const INITIAL_FORM_DATA = {
  // Business info
  merchantGroup: 'T1',
  companyName: '',
  ssmNumber: '',
  merchantType: '',
  merchantTypeOther: '',
  // Address
  addressLine1: '',
  addressLine2: '',
  city: '',
  postcode: '',
  state: '',
  country: 'Malaysia',
  // Wallet
  walletAddress: '',
  // Sponsor
  sponsorBy: '',
  fees: '',
  // Fees
  markupFees: '',
  processingFees: '',
  // Currency
  currencies: '',
  // Bonus
  initialBonus: '',
  bonusCurrency: 'USDT',
  // Permissions
  permissions: {
    create_transactions: true,
    manage_team: true,
    withdraw_funds: true
  },
  // Account status
  accountStatus: 'Active',
  // Profile
  email: '',
  password: ''
};
