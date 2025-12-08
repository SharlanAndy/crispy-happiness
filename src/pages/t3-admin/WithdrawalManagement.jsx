import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Check, X } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, ConfirmDialog, VerificationModal } from '../../components/ui';
import { filterAndPaginate } from '../../lib/pagination';
import { t3Service } from '../../services/t3Service';

const ITEMS_PER_PAGE = 10;
const SEARCH_KEYS = ['id', 'merchant', 'wallet', 'ref'];

const STATS = [
  { label: 'Current Withdraw Application', value: '10', lastUpdate: '17-11-2025' },
  { label: 'Total Withdraw Approve', value: '100', lastUpdate: '17-11-2025' },
  { label: 'Total Withdraw Amount', value: '10,000.00 USDT', lastUpdate: '17-11-2025' },
];

const ALL_WITHDRAWALS = [
  { id: 'AP123455551', merchant: 'mo12345', amount: '10,000.00 U', wallet: '0xF3A....12345', time: '01-11-2025 13:00', ref: 'Test123', status: 'Pending' },
  { id: 'AP123455552', merchant: 'mo12346', amount: '15,500.75 U', wallet: '0xF3A....12346', time: '02-11-2025 14:00', ref: 'Test456', status: 'Pending' },
  { id: 'AP123455553', merchant: 'mo12347', amount: '8,250.00 U', wallet: '0xF3A....12347', time: '03-11-2025 15:00', ref: 'Test789', status: 'Pending' },
  { id: 'AP123455554', merchant: 'mo12348', amount: '5,000.00 U', wallet: '0xF3A....12348', time: '04-11-2025 10:00', ref: 'Test101', status: 'Pending' },
  { id: 'AP123455555', merchant: 'mo12349', amount: '12,750.50 U', wallet: '0xF3A....12349', time: '05-11-2025 11:00', ref: 'Test202', status: 'Pending' },
];

const COLUMNS = [
  { key: 'id', label: 'Application ID' },
  { key: 'merchant', label: 'Merchant Order No.' },
  { key: 'amount', label: 'Amount' },
  { key: 'wallet', label: 'Wallet Address' },
  { key: 'time', label: 'Application Time' },
  { key: 'ref', label: 'Reference' },
  { key: 'status', label: 'Status' },
];

export default function WithdrawalManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [approveModal, setApproveModal] = useState({ isOpen: false, item: null });
  const [rejectConfirm, setRejectConfirm] = useState({ isOpen: false, item: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [withdrawalsData, setWithdrawalsData] = useState([]);
  const [statsData, setStatsData] = useState(null);

  // Fetch withdrawals data
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setLoading(true);
        // Fetch all applications (no search param - using client-side fuzzy search)
        const result = await t3Service.getWithdrawalApplications({ 
          page: 1, 
          search: '', // Fetch all, filter client-side
          status: 'pending'
        });
        
        if (result.success) {
          const transformed = result.data.map(w => ({
            id: w.application_id || w.id?.toString(),
            merchant: w.merchant_order_no || 'N/A',
            amount: `${(w.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
            wallet: w.wallet_address ? `${w.wallet_address.substring(0, 6)}....${w.wallet_address.substring(w.wallet_address.length - 5)}` : 'N/A',
            time: w.created_at ? new Date(w.created_at).toLocaleString('en-GB') : 'N/A',
            ref: w.reference || 'N/A',
            status: w.status || 'Pending',
            rawData: w // Keep raw data for API calls
          }));
          setWithdrawalsData(transformed);
          
          // Calculate stats
          const totalPending = result.data.length;
          const totalAmount = result.data.reduce((sum, w) => sum + (w.amount || 0), 0);
          setStatsData({
            pending: totalPending,
            totalAmount: totalAmount
          });
        }
      } catch (error) {
        console.error('Failed to fetch withdrawals:', error);
        setWithdrawalsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWithdrawals();
  }, [currentPage, searchTerm]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const { data: withdrawals, totalPages } = useMemo(
    () => filterAndPaginate(withdrawalsData, searchTerm, SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [withdrawalsData, searchTerm, currentPage]
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleApproveWithVerification = async (credentials) => {
    const withdrawalId = approveModal.item?.rawData?.application_id || approveModal.item?.id;
    if (!withdrawalId) return;

    try {
      const result = await t3Service.approveWithdrawal(withdrawalId);
      if (result.success) {
        alert('Withdrawal approved successfully!');
        // Refresh the list
        const refreshResult = await t3Service.getWithdrawalApplications({ 
          page: currentPage, 
          search: searchTerm,
          status: 'pending'
        });
        if (refreshResult.success) {
          const transformed = refreshResult.data.map(w => ({
            id: w.application_id || w.id?.toString(),
            merchant: w.merchant_order_no || 'N/A',
            amount: `${(w.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
            wallet: w.wallet_address ? `${w.wallet_address.substring(0, 6)}....${w.wallet_address.substring(w.wallet_address.length - 5)}` : 'N/A',
            time: w.created_at ? new Date(w.created_at).toLocaleString('en-GB') : 'N/A',
            ref: w.reference || 'N/A',
            status: w.status || 'Pending',
            rawData: w
          }));
          setWithdrawalsData(transformed);
        }
      } else {
        alert('Failed to approve withdrawal. Please try again.');
      }
    } catch (error) {
      console.error('Failed to approve withdrawal:', error);
      alert('Failed to approve withdrawal. Please try again.');
    } finally {
      setApproveModal({ isOpen: false, item: null });
    }
  };

  const handleReject = async () => {
    const withdrawalId = rejectConfirm.item?.rawData?.application_id || rejectConfirm.item?.id;
    if (!withdrawalId) return;

    try {
      const result = await t3Service.rejectWithdrawal(withdrawalId);
      if (result.success) {
        alert('Withdrawal rejected successfully!');
        // Refresh the list
        const refreshResult = await t3Service.getWithdrawalApplications({ 
          page: currentPage, 
          search: searchTerm,
          status: 'pending'
        });
        if (refreshResult.success) {
          const transformed = refreshResult.data.map(w => ({
            id: w.application_id || w.id?.toString(),
            merchant: w.merchant_order_no || 'N/A',
            amount: `${(w.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
            wallet: w.wallet_address ? `${w.wallet_address.substring(0, 6)}....${w.wallet_address.substring(w.wallet_address.length - 5)}` : 'N/A',
            time: w.created_at ? new Date(w.created_at).toLocaleString('en-GB') : 'N/A',
            ref: w.reference || 'N/A',
            status: w.status || 'Pending',
            rawData: w
          }));
          setWithdrawalsData(transformed);
        }
      } else {
        alert('Failed to reject withdrawal. Please try again.');
      }
    } catch (error) {
      console.error('Failed to reject withdrawal:', error);
      alert('Failed to reject withdrawal. Please try again.');
    } finally {
      setRejectConfirm({ isOpen: false, item: null });
    }
  };

  const actions = useMemo(() => [
    {
      icon: <Eye size={16} />,
      onClick: (row) => navigate(`/t3-admin/withdrawals/${row.id}`, { 
        state: { returnPath: '/t3-admin/withdrawals' } 
      }),
      tooltip: 'View Details',
    },
    {
      icon: <Check size={16} />,
      onClick: (row) => setApproveModal({ isOpen: true, item: row }),
      tooltip: 'Approve',
      variant: 'success',
    },
    {
      icon: <X size={16} />,
      onClick: (row) => setRejectConfirm({ isOpen: true, item: row }),
      tooltip: 'Reject',
      variant: 'danger',
    },
  ], [navigate]);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Withdrawal Management"
          description="Overview the Details of Withdraw Information"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Current Withdraw Application" 
            value={statsData?.pending?.toString() || '0'} 
            lastUpdate={new Date().toLocaleDateString('en-GB')} 
          />
          <StatCard 
            label="Total Withdraw Approve" 
            value="N/A" 
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
              <h2 className="text-lg font-semibold">Withdrawal Applications List</h2>
              <SearchBar
                placeholder="Search Application..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="max-w-sm"
              />
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading withdrawals...</p>
                </div>
              ) : (
                <DataTable
                  columns={COLUMNS}
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

      {/* Approval Verification Modal */}
      <VerificationModal
        isOpen={approveModal.isOpen}
        onClose={() => setApproveModal({ isOpen: false, item: null })}
        onConfirm={handleApproveWithVerification}
        title="Verification"
        message={`Please verify your credentials to approve withdrawal ${approveModal.item?.id}`}
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={rejectConfirm.isOpen}
        onClose={() => setRejectConfirm({ isOpen: false, item: null })}
        onConfirm={handleReject}
        title="Reject Withdrawal"
        message={`Are you sure you want to reject withdrawal ${rejectConfirm.item?.id}?`}
        confirmText="Reject"
        variant="danger"
      />
    </>
  );
}
