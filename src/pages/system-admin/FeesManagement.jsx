import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader } from '../../components/ui';
import { api } from '@/lib/api';

export default function FeesManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feesData, setFeesData] = useState([]);
  const [feesStats, setFeesStats] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [paginationMeta, setPaginationMeta] = useState({ limit: 20, page: 1, total: null });

  // Fetch fees data
  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const params = { page: currentPage };
        if (searchTerm && searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        
        const [feesResult, statsResult] = await Promise.all([
          api.systemadmin.getFees(params),
          api.systemadmin.getFeesStatistics()
        ]);

        if (feesResult && feesResult.success) {
          const dataArray = feesResult.data || [];
          const limit = feesResult.limit || 20;
          const page = feesResult.page || currentPage;
          const total = feesResult.total || null;
          
          setPaginationMeta({ limit, page, total });
          
          const transformed = dataArray.map(f => {
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

          // Determine if there's a next page
          if (total !== null) {
            setHasNextPage(page * limit < total);
          } else if (dataArray.length < limit) {
            setHasNextPage(false);
          } else if (dataArray.length === limit && page === 1) {
            // Check page 2
            const checkNextPage = async () => {
              try {
                const nextPageParams = { page: 2 };
                if (searchTerm && searchTerm.trim()) {
                  nextPageParams.search = searchTerm.trim();
                }
                const nextPageResult = await api.systemadmin.getFees(nextPageParams);
                if (nextPageResult && nextPageResult.success) {
                  const nextPageData = nextPageResult.data || [];
                  setHasNextPage(nextPageData.length > 0);
                } else {
                  setHasNextPage(false);
                }
              } catch (error) {
                console.error('Failed to check next page:', error);
                setHasNextPage(false);
              }
            };
            checkNextPage();
          } else if (dataArray.length === limit && page > 1) {
            // Check next page
            const checkNextPage = async () => {
              try {
                const nextPageParams = { page: page + 1 };
                if (searchTerm && searchTerm.trim()) {
                  nextPageParams.search = searchTerm.trim();
                }
                const nextPageResult = await api.systemadmin.getFees(nextPageParams);
                if (nextPageResult && nextPageResult.success) {
                  const nextPageData = nextPageResult.data || [];
                  setHasNextPage(nextPageData.length > 0);
                } else {
                  setHasNextPage(false);
                }
              } catch (error) {
                console.error('Failed to check next page:', error);
                setHasNextPage(false);
              }
            };
            checkNextPage();
          }
        } else {
          setFeesData([]);
          setHasNextPage(false);
        }

        if (statsResult && statsResult.success) {
          setFeesStats(statsResult.data);
        }
      } catch (error) {
        console.error('Failed to fetch fees:', error);
        setFeesData([]);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [currentPage, searchTerm]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Calculate total pages based on API response
  const totalPages = useMemo(() => {
    if (paginationMeta.total !== null && paginationMeta.total !== undefined) {
      return Math.ceil(paginationMeta.total / paginationMeta.limit);
    }
    if (feesData.length < paginationMeta.limit) {
      return paginationMeta.page;
    }
    if (feesData.length === paginationMeta.limit) {
      return hasNextPage ? paginationMeta.page + 1 : paginationMeta.page;
    }
    return 1;
  }, [paginationMeta, feesData.length, hasNextPage]);

  // Use fees data directly from API (no client-side pagination)
  const transactions = feesData;

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
              onChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1);
                setHasNextPage(false); // Reset next page check when search changes
              }}
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
