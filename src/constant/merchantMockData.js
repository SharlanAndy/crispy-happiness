// Mock data for merchant management page

export const MERCHANT_STATS = [
  { label: 'Total T1 Merchants', value: '60', lastUpdate: '17-11-2025' },
  { label: 'Total T2 Merchants', value: '30', lastUpdate: '17-11-2025' },
  { label: 'Total T3 Merchants', value: '10', lastUpdate: '17-11-2025' },
];

export const MERCHANT_COLUMNS = [
  { key: 'merchant_id', label: 'Mer. ID' },
  { key: 'name', label: 'Com. Name' },
  { key: 'type', label: 'Type' },
  { key: 'state', label: 'State' },
  { key: 'join', label: 'Join Date' },
  { key: 'status', label: 'Status' },
];

export const MERCHANT_TIERS = ['T1', 'T2', 'T3', 'Merchant'];

export const MERCHANT_SEARCH_KEYS = ['merchant_id', 'name', 'type', 'state'];

export const ALL_MERCHANTS = [
  // T1 Merchants
  { id: 'Mer12341', name: 'Food Merchant Sdn Bhd', type: 'F&B', state: 'Johor', join: '01-11-2025 13:00', status: 'Active', tier: 'T1' },
  { id: 'Mer12342', name: 'Grocery Store X', type: 'Retail', state: 'Selangor', join: '02-11-2025 10:30', status: 'Active', tier: 'T1' },
  { id: 'Mer12348', name: 'Coffee Shop A', type: 'F&B', state: 'Penang', join: '07-11-2025 13:00', status: 'Active', tier: 'T1' },
  { id: 'Mer12349', name: 'Mini Market B', type: 'Retail', state: 'Kuala Lumpur', join: '08-11-2025 10:30', status: 'Active', tier: 'T1' },
  { id: 'Mer12350', name: 'Restaurant C', type: 'F&B', state: 'Johor', join: '09-11-2025 09:00', status: 'Active', tier: 'T1' },
  { id: 'Mer12351', name: 'Convenience Store D', type: 'Retail', state: 'Selangor', join: '10-11-2025 15:45', status: 'Active', tier: 'T1' },
  { id: 'Mer12352', name: 'Bakery E', type: 'F&B', state: 'Penang', join: '11-11-2025 11:00', status: 'Active', tier: 'T1' },
  { id: 'Mer12353', name: 'Supermarket F', type: 'Retail', state: 'Kuala Lumpur', join: '12-11-2025 14:30', status: 'Active', tier: 'T1' },
  { id: 'Mer12354', name: 'Cafe G', type: 'F&B', state: 'Johor', join: '13-11-2025 13:00', status: 'Active', tier: 'T1' },
  { id: 'Mer12355', name: 'Pharmacy H', type: 'Healthcare', state: 'Selangor', join: '14-11-2025 10:30', status: 'Active', tier: 'T1' },
  { id: 'Mer12356', name: 'Fast Food I', type: 'F&B', state: 'Penang', join: '15-11-2025 09:00', status: 'Active', tier: 'T1' },
  { id: 'Mer12357', name: 'Bookstore J', type: 'Retail', state: 'Kuala Lumpur', join: '16-11-2025 15:45', status: 'Active', tier: 'T1' },
  
  // T2 Merchants
  { id: 'Mer12343', name: 'Bakery Delight', type: 'F&B', state: 'Penang', join: '03-11-2025 09:00', status: 'Active', tier: 'T2' },
  { id: 'Mer12344', name: 'Tech Gadgets Hub', type: 'Electronics', state: 'Kuala Lumpur', join: '04-11-2025 15:45', status: 'Active', tier: 'T2' },
  { id: 'Mer12358', name: 'Fashion Boutique K', type: 'Fashion', state: 'Johor', join: '17-11-2025 11:00', status: 'Active', tier: 'T2' },
  { id: 'Mer12359', name: 'Electronics Store L', type: 'Electronics', state: 'Selangor', join: '18-11-2025 14:30', status: 'Active', tier: 'T2' },
  { id: 'Mer12360', name: 'Spa Center M', type: 'Beauty & Wellness', state: 'Penang', join: '19-11-2025 13:00', status: 'Active', tier: 'T2' },
  { id: 'Mer12361', name: 'Gym Fitness N', type: 'Sports & Fitness', state: 'Kuala Lumpur', join: '20-11-2025 10:30', status: 'Active', tier: 'T2' },
  { id: 'Mer12362', name: 'Hotel O', type: 'Hospitality', state: 'Johor', join: '21-11-2025 09:00', status: 'Active', tier: 'T2' },
  { id: 'Mer12363', name: 'Mobile Shop P', type: 'Electronics', state: 'Selangor', join: '22-11-2025 15:45', status: 'Active', tier: 'T2' },
  { id: 'Mer12364', name: 'Salon Q', type: 'Beauty & Wellness', state: 'Penang', join: '23-11-2025 11:00', status: 'Active', tier: 'T2' },
  { id: 'Mer12365', name: 'Sports Store R', type: 'Sports & Fitness', state: 'Kuala Lumpur', join: '24-11-2025 14:30', status: 'Active', tier: 'T2' },
  
  // T3 Merchants
  { id: 'Mer12345', name: 'Premium Boutique', type: 'Fashion', state: 'Kuala Lumpur', join: '05-11-2025 11:00', status: 'Active', tier: 'T3' },
  { id: 'Mer12346', name: 'Luxury Cars Dealer', type: 'Automotive', state: 'Selangor', join: '06-11-2025 14:30', status: 'Active', tier: 'T3' },
  { id: 'Mer12347', name: 'Five Star Hotel S', type: 'Hospitality', state: 'Kuala Lumpur', join: '25-11-2025 13:00', status: 'Active', tier: 'T3' },
  { id: 'Mer12366', name: 'Luxury Watch Store T', type: 'Fashion', state: 'Selangor', join: '26-11-2025 10:30', status: 'Active', tier: 'T3' },
  { id: 'Mer12367', name: 'Premium Car Service U', type: 'Automotive', state: 'Kuala Lumpur', join: '27-11-2025 09:00', status: 'Active', tier: 'T3' },
  { id: 'Mer12368', name: 'High-end Restaurant V', type: 'F&B', state: 'Selangor', join: '28-11-2025 15:45', status: 'Active', tier: 'T3' },
  { id: 'Mer12369', name: 'Jewelry Store W', type: 'Fashion', state: 'Kuala Lumpur', join: '29-11-2025 11:00', status: 'Active', tier: 'T3' },
  { id: 'Mer12370', name: 'Luxury Resort X', type: 'Hospitality', state: 'Penang', join: '30-11-2025 14:30', status: 'Inactive', tier: 'T3' },
];
