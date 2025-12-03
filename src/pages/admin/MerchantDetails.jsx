import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { StatCard, InfoSection, Card, DataTable, SearchBar, Button, PageHeader, ProfitChart } from '../../components/ui';

export default function MerchantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('This Month');
  const tabs = ['Today', 'This Week', 'This Month', 'This Year'];

  const tabData = {
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

  const data = tabData[activeTab];

  const stats = [
    { label: 'Total Transaction', value: '1,000.00 USDT', lastUpdate: '17-11-2025' },
    { label: 'Total Net Profit', value: '900.00 USDT', lastUpdate: '17-11-2025' },
    { label: 'Total Fees Contributed', value: '88.10 USDT', lastUpdate: '17-11-2025' },
  ];

  const businessInfo = [
    { label: "Merchant's Group", value: 'T3' },
    { label: 'Email', value: 'f&b@gmail.com' },
    { label: 'Password', value: '********' },
    { label: 'Company Name', value: 'Food Merchant Sdn Bhd' },
    { label: 'SSM Number', value: '202591231345' },
    { label: "Merchant's Type", value: 'F&B' },
    { label: 'Status', value: <span className="px-3 py-1 rounded-md bg-green-100 text-green-700 text-sm font-medium">Active</span> },
  ];

  const addressInfo = [
    { label: 'Address Line 1', value: '11, Pusat Bandar Puchong, IOI Boulevard' },
    { label: 'Address Line 2', value: '' },
    { label: 'City', value: 'Puchong' },
    { label: 'Postcode', value: '47100' },
    { label: 'State', value: 'Selangor' },
    { label: 'Country', value: 'Malaysia' },
  ];

  const walletInfo = [
    { label: 'Wallet Address', value: '0x123456789abcdef' },
  ];

  const sponsorInfo = [
    { label: 'Sponsor By', value: 'Sponsor Name' },
    { label: 'Fees', value: '1234' },
  ];

  const feesInfo = [
    { label: 'Markup Fees', value: '10%' },
    { label: 'Processing Fees', value: '10%' },
  ];

  const currencyInfo = [
    { label: 'Currency', value: '🇲🇾 Malaysia - RM' },
  ];

  const allTransactions = [
    { id: 'tx-a1b2c3d4', type: 'Payment', amount: '100.00 U', net: '99.00 U', bonus: '0.5 U', time: '01-11-2025 13:00', status: 'Success' },
    { id: 'tx-e5f6g7h8', type: 'Payment', amount: '250.00 U', net: '245.00 U', bonus: '5.0 U', time: '02-12-2025 09:30', status: 'Pending' },
    { id: 'tx-i9j0k1l2', type: 'Payment', amount: '150.00 U', net: '148.00 U', bonus: '2.0 U', time: '03-01-2026 15:45', status: 'Failed' },
    { id: 'tx-m3n4o5p6', type: 'Payment', amount: '300.00 U', net: '295.00 U', bonus: '5.0 U', time: '04-02-2026 10:15', status: 'Success' },
  ];

  // Filter transactions based on search term
  const transactions = allTransactions.filter(t => {
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    return t.id.toLowerCase().includes(searchLower) ||
      t.type.toLowerCase().includes(searchLower) ||
      t.status.toLowerCase().includes(searchLower);
  });

  const columns = [
    { key: 'id', label: 'Trans. ID' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'net', label: 'Net Profit' },
    { key: 'bonus', label: 'Bonus' },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status' },
  ];

  const actions = [
    {
      icon: <Eye size={16} />,
      onClick: (row) => {
        const path = window.location.pathname;
        const basePath = path.includes('system-admin') ? '/system-admin' : '/t3-admin';
        navigate(`${basePath}/transactions/${row.id}`);
      },
      tooltip: 'View',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchant Details"
        description="Overview the Details of Merchant Information"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <InfoSection
          title="Merchant's Information"
          items={businessInfo}
          columns={1}
        />
        <div className="grid grid-cols-1 gap-6">
          <InfoSection
            title="Business Address"
            items={addressInfo}
            columns={1}
          />
          <InfoSection
            title="Wallet"
            items={walletInfo}
            columns={1}
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <InfoSection
            title="Sponsor"
            items={sponsorInfo}
            columns={1}
          />
          <InfoSection
            title="Fees"
            items={feesInfo}
            columns={1}
          />
          <InfoSection
            title="Currencies"
            items={currencyInfo}
            columns={1}
          />
        </div>
      </div>

      <div className="bg-white rounded-[20px] border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-black">Total Profit</h3>
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-base font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-[#3B82F6]'
                    : 'text-black hover:text-[#3B82F6]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-[300px]">
          <ProfitChart data={data} />
        </div>
      </div>

      <Card title="Transaction List">
        <div className="mb-4">
          <SearchBar
            placeholder="Search Transaction..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-sm"
          />
        </div>
        <DataTable
          columns={columns}
          data={transactions}
          actions={actions}
        />
      </Card>
    </div>
  );
}
