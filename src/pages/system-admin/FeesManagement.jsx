import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader } from '../../components/ui';
import { filterAndPaginate } from '@/lib/pagination';
import { api } from '@/lib/api';

const ITEMS_PER_PAGE = 10;
const TRANSACTION_SEARCH_KEYS = ['id', 'wallet', 'amount', 'fees', 'status'];

export default function FeesManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feesData, setFeesData] = useState([]);
  const [feesStats, setFeesStats] = useState(null);

  // Fetch fees data
  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const [feesResult, statsResult] = await Promise.all([
          api.systemadmin.getFees({ page: 1 }), // Fetch all, filter client-side
          api.systemadmin.getFeesStatistics()
        ]);

        if (feesResult && feesResult.success) {
          const transformed = feesResult.data.map(f => {
            // Use transaction_id if available, otherwise use fee id
            const transactionId = f.transaction_id || f.id;
            const numericId = transactionId;
            const formattedId = `T${String(numericId).padStart(6, '0')}`;
            
            return {
              id: formattedId, // Display ID with T prefix for consistency
              numericId: numericId, // Store numeric ID for API calls
              wallet: f.username ? `0x${f.username.slice(0, 5)}....${f.username.slice(-5)}` : 'N/A',
              amount: `${(f.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U`,
              fees: `${(f.fee_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
              time: f.created_at ? new Date(f.created_at).toLocaleString('en-GB') : 'N/A',
              status: f.status || 'Success',
              rawData: f // Store raw data for reference
            };
          });
          setFeesData(transformed);
        } else {
          setFeesData([]);
        }

        if (statsResult && statsResult.success) {
          setFeesStats(statsResult.data);
        }
      } catch (error) {
        console.error('Failed to fetch fees:', error);
        setFeesData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Apply search and pagination
  const { data: transactions, totalPages } = useMemo(
    () => filterAndPaginate(feesData, searchTerm, TRANSACTION_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [feesData, searchTerm, currentPage]
  );

  const stats = feesStats ? [
    { label: 'Total Fees Collect', value: `${(feesStats.total_fees || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, lastUpdate: new Date().toLocaleDateString('en-GB') },
    { label: 'Monthly Fees Collect', value: `${(feesStats.monthly_fees || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, lastUpdate: new Date().toLocaleDateString('en-GB') },
  ] : [
    { label: 'Total Fees Collect', value: '0.00 USDT', lastUpdate: 'No data' },
    { label: 'Monthly Fees Collect', value: '0.00 USDT', lastUpdate: 'No data' },
  ];

  const columns = [
    { key: 'id', label: 'Trans. ID' },
    { key: 'wallet', label: 'Wallet ID' },
    { key: 'amount', label: 'Amount' },
    { key: 'fees', label: 'Fees' },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status' },
  ];

  const actions = [{
    icon: <Eye size={16} />,
    onClick: (row) => {
      // Use formatted ID for display in URL, TransactionDetails will extract numeric ID
      const transactionId = row.id || row.numericId || row.rawData?.transaction_id || row.rawData?.id;
      navigate(`/system-admin/transactions/${transactionId}`);
    },
    tooltip: 'View Details',
  }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees Management"
        description="Overview the Details of Fees Information"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold">Fees Collect List</h2>
            <SearchBar
              placeholder="Search Transaction..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="max-w-sm"
            />

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading fees...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No fees found</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={transactions}
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
