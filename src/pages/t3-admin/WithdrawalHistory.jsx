import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader } from '../../components/ui';
import { filterAndPaginate } from '@/lib/pagination';
import { t3Service } from '@/services/t3Service';

const ITEMS_PER_PAGE = 10;
const SEARCH_KEYS = ['id', 'wallet', 'amount'];

const TABS = [
  { id: 'approved', label: 'Withdraw Approve' },
  { id: 'rejected', label: 'Withdraw Reject' }
];

const STATS = [
  { label: 'Total Withdraw Approve', value: '100', lastUpdate: '17-11-2025' },
  { label: 'Total Withdraw Reject', value: '20', lastUpdate: '17-11-2025' },
  { label: 'Total Withdraw Amount', value: '100,000.00 USDT', lastUpdate: '17-11-2025' },
];

const ALL_APPROVED_WITHDRAWALS = [
  { id: 'AP123455501', amount: '10,000.00 U', wallet: '0xF3A....12301', time: '25-10-2025 13:00', status: 'Approved' },
  { id: 'AP123455502', amount: '15,500.75 U', wallet: '0xF3A....12302', time: '26-10-2025 14:00', status: 'Approved' },
  { id: 'AP123455503', amount: '8,250.00 U', wallet: '0xF3A....12303', time: '27-10-2025 15:00', status: 'Approved' },
  { id: 'AP123455504', amount: '5,000.00 U', wallet: '0xF3A....12304', time: '28-10-2025 10:00', status: 'Approved' },
  { id: 'AP123455505', amount: '12,750.50 U', wallet: '0xF3A....12305', time: '29-10-2025 11:00', status: 'Approved' },
];

const ALL_REJECTED_WITHDRAWALS = [
  { id: 'AP123455601', amount: '20,000.00 U', wallet: '0xF3A....12401', time: '25-10-2025 16:00', status: 'Rejected' },
  { id: 'AP123455602', amount: '8,500.00 U', wallet: '0xF3A....12402', time: '26-10-2025 17:00', status: 'Rejected' },
  { id: 'AP123455603', amount: '3,250.00 U', wallet: '0xF3A....12403', time: '27-10-2025 18:00', status: 'Rejected' },
  { id: 'AP123455604', amount: '6,000.00 U', wallet: '0xF3A....12404', time: '28-10-2025 12:00', status: 'Rejected' },
  { id: 'AP123455605', amount: '9,750.00 U', wallet: '0xF3A....12405', time: '29-10-2025 13:00', status: 'Rejected' },
];

const WITHDRAWALS_BY_STATUS = {
  approved: ALL_APPROVED_WITHDRAWALS,
  rejected: ALL_REJECTED_WITHDRAWALS
};

export default function WithdrawalHistory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('approved');
  const [loading, setLoading] = useState(true);
  const [withdrawalsData, setWithdrawalsData] = useState({ approved: [], rejected: [] });
  const [statsData, setStatsData] = useState(null);

  // Fetch withdrawals history
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setLoading(true);
        // Fetch all history (no page param - using client-side pagination and search)
        const [approvedResult, rejectedResult] = await Promise.all([
          t3Service.getWithdrawalHistory({ page: 1, status: 'approved' }), // Fetch all, paginate client-side
          t3Service.getWithdrawalHistory({ page: 1, status: 'rejected' }) // Fetch all, paginate client-side
        ]);

        if (approvedResult.success) {
          const approved = approvedResult.data.map(w => ({
            id: w.application_id || w.id?.toString(),
            amount: `${(w.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
            wallet: w.wallet_address ? `${w.wallet_address.substring(0, 6)}....${w.wallet_address.substring(w.wallet_address.length - 5)}` : 'N/A',
            time: w.verified_at ? new Date(w.verified_at).toLocaleString('en-GB') : (w.created_at ? new Date(w.created_at).toLocaleString('en-GB') : 'N/A'),
            status: 'Approved'
          }));
          setWithdrawalsData(prev => ({ ...prev, approved }));
        }

        if (rejectedResult.success) {
          const rejected = rejectedResult.data.map(w => ({
            id: w.application_id || w.id?.toString(),
            amount: `${(w.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
            wallet: w.wallet_address ? `${w.wallet_address.substring(0, 6)}....${w.wallet_address.substring(w.wallet_address.length - 5)}` : 'N/A',
            time: w.verified_at ? new Date(w.verified_at).toLocaleString('en-GB') : (w.created_at ? new Date(w.created_at).toLocaleString('en-GB') : 'N/A'),
            status: 'Rejected'
          }));
          setWithdrawalsData(prev => ({ ...prev, rejected }));
        }

        // Calculate stats
        const totalApproved = approvedResult.success ? approvedResult.data.length : 0;
        const totalRejected = rejectedResult.success ? rejectedResult.data.length : 0;
        const totalAmount = [...(approvedResult.success ? approvedResult.data : []), ...(rejectedResult.success ? rejectedResult.data : [])]
          .reduce((sum, w) => sum + (w.amount || 0), 0);
        setStatsData({
          approved: totalApproved,
          rejected: totalRejected,
          totalAmount: totalAmount
        });
      } catch (error) {
        console.error('Failed to fetch withdrawal history:', error);
        setWithdrawalsData({ approved: [], rejected: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchWithdrawals();
  }, [currentPage, activeTab]);

  // Dynamic columns based on active tab
  const columns = useMemo(() => [
    { key: 'id', label: 'Transaction.ID' },
    { key: 'amount', label: 'Amount' },
    { key: 'wallet', label: 'Wallet Address' },
    { key: 'time', label: activeTab === 'approved' ? 'Approved Time' : 'Rejected Time' },
    { key: 'status', label: 'Status' },
  ], [activeTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const { data: withdrawals, totalPages } = useMemo(
    () => filterAndPaginate(withdrawalsData[activeTab] || [], searchTerm, SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [withdrawalsData, activeTab, searchTerm, currentPage]
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const actions = useMemo(() => [
    {
      icon: <Eye size={16} />,
      onClick: (row) => navigate(`/t3-admin/withdrawals/${row.id}`, { 
        state: { 
          fromHistory: true, 
          returnPath: '/t3-admin/withdrawal-history',
          withdrawalStatus: row.status
        } 
      }),
      tooltip: 'View Details',
    },
  ], [navigate]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdrawal History"
        description="View history of approved and rejected withdrawals"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Withdraw Approve" 
          value={statsData?.approved?.toString() || '0'} 
          lastUpdate={new Date().toLocaleDateString('en-GB')} 
        />
        <StatCard 
          label="Total Withdraw Reject" 
          value={statsData?.rejected?.toString() || '0'} 
          lastUpdate={new Date().toLocaleDateString('en-GB')} 
        />
        <StatCard 
          label="Total Withdraw Amount" 
          value={`${(statsData?.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`} 
          lastUpdate={new Date().toLocaleDateString('en-GB')} 
        />
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold">Withdrawal History List</h2>
            
            <div className="flex gap-2 bg-[#ECECF0] rounded-full px-2 py-1.5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-1.5 text-lg rounded-full flex-1 transition-colors ${
                    activeTab === tab.id ? 'bg-white text-black' : 'hover:bg-white/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <SearchBar
              placeholder="Search Transaction..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading withdrawal history...</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={withdrawals}
                actions={actions}
                pagination={{
                  currentPage,
                  totalPages,
                  onPageChange: setCurrentPage,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
