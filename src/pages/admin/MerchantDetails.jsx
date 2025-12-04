import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { StatCard, InfoSection, Card, DataTable, SearchBar, PageHeader, ProfitChart, TabButtons } from '../../components/ui';
import { filterAndPaginate } from '../../lib/pagination';
import {
  PROFIT_CHART_DATA,
  MERCHANT_STATS,
  MERCHANT_BUSINESS_INFO,
  MERCHANT_ADDRESS_INFO,
  MERCHANT_WALLET_INFO,
  MERCHANT_SPONSOR_INFO,
  MERCHANT_FEES_INFO,
  MERCHANT_CURRENCY_INFO,
  MOCK_TRANSACTIONS,
  TRANSACTION_COLUMNS,
  PROFIT_TABS,
} from '../../constant/mockData';

const ITEMS_PER_PAGE = 10;
const TRANSACTION_SEARCH_KEYS = ['id', 'type', 'status'];

export default function MerchantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('This Month');
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Get profit chart data for active tab
  const chartData = PROFIT_CHART_DATA[activeTab];

  // Filter and paginate transactions
  const { data: transactions, totalPages } = useMemo(
    () => filterAndPaginate(MOCK_TRANSACTIONS, searchTerm, TRANSACTION_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [searchTerm, currentPage]
  );

  // Handle search - reset to page 1
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Transaction table actions
  const transactionActions = useMemo(() => [
    {
      icon: <Eye size={16} />,
      onClick: (row) => {
        const basePath = window.location.pathname.includes('system-admin') ? '/system-admin' : '/t3-admin';
        navigate(`${basePath}/transactions/${row.id}`);
      },
      tooltip: 'View',
    },
  ], [navigate]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchant Details"
        description="Overview the Details of Merchant Information"
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {MERCHANT_STATS.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <InfoSection
          title="Merchant's Information"
          items={MERCHANT_BUSINESS_INFO}
          columns={1}
        />
        <div className="grid grid-cols-1 gap-6">
          <InfoSection
            title="Business Address"
            items={MERCHANT_ADDRESS_INFO}
            columns={1}
          />
          <InfoSection
            title="Wallet"
            items={MERCHANT_WALLET_INFO}
            columns={1}
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <InfoSection
            title="Sponsor"
            items={MERCHANT_SPONSOR_INFO}
            columns={1}
          />
          <InfoSection
            title="Fees"
            items={MERCHANT_FEES_INFO}
            columns={1}
          />
          <InfoSection
            title="Currencies"
            items={MERCHANT_CURRENCY_INFO}
            columns={1}
          />
        </div>
      </div>

      {/* Profit Chart Section */}
      <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-black">Total Profit</h3>
          <TabButtons 
            tabs={PROFIT_TABS} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>
        
        <div className="h-[300px]">
          <ProfitChart data={chartData} />
        </div>
      </div>

      {/* Transaction List Section */}
      <Card title="Transaction List">
        <div className="flex flex-col gap-5">
          <SearchBar
            placeholder="Search Transaction..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <DataTable
            columns={TRANSACTION_COLUMNS}
            data={transactions}
            actions={transactionActions}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </Card>
    </div>
  );
}
