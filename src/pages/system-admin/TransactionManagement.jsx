import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, ArrowDownToLine } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader } from '@/components/ui';
import { filterAndPaginate } from '@/lib/pagination';
import { t3Service } from '@/services/t3Service';
import { api, T3SYSTEMADMIN_BASE } from '@/lib/api';

const ITEMS_PER_PAGE = 10;
const TRANSACTION_SEARCH_KEYS = ['id', 'type', 'orderno', 'status', 'reference'];

const STATS = [
  { label: 'Total Transaction', value: '1,000.00 USDT', lastUpdate: '17-11-2025' },
  { label: 'Today Transaction', value: '900.00 USDT', lastUpdate: '17-11-2025' },
];

const COLUMNS = [
  { key: 'id', label: 'Trans. ID' },
  { key: 'type', label: 'Type' },
  { key: 'merchantOrderNo', label: 'Merchant Order No.' },
  { key: 'amount', label: 'Amount' },
  { key: 'net', label: 'Net Profit', render: (value) => <span className="font-bold">{value}</span> },
  { key: 'bonus', label: 'Bonus' },
  { key: 'referralFees', label: 'Referral Fees' },
  { key: 'time', label: 'Time' },
  { key: 'reference', label: 'Reference' },
  { key: 'status', label: 'Status' },
];

const ALL_TRANSACTIONS = [
  { id: 'T000001', type: 'Payment', merchantOrderNo: 'M1234567890', amount: '500.00 U', net: '50.00 U', bonus: '5.00 U', referralFees: '2.00 U', time: '01-11-2025 13:00', reference: 'Ref001', status: 'Success' },
  { id: 'T000002', type: 'Payment', merchantOrderNo: 'M1234567890', amount: '500.00 U', net: '50.00 U', bonus: '5.00 U', referralFees: '2.00 U', time: '01-11-2025 13:00', reference: 'Ref001', status: 'Pending' },
  { id: 'T000003', type: 'Payment', merchantOrderNo: 'M1234567890', amount: '500.00 U', net: '50.00 U', bonus: '5.00 U', referralFees: '2.00 U', time: '01-11-2025 13:00', reference: 'Ref001', status: 'Failed' },
];

export default function TransactionManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [transactionsData, setTransactionsData] = useState([]);
  const [statsData, setStatsData] = useState(null);

  // Detect if accessed from T3 Admin or System Admin
  const isT3Admin = location.pathname.startsWith('/t3-admin');
  const basePath = isT3Admin ? '/t3-admin' : '/system-admin';

  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Fetch all transactions (no search param - using client-side fuzzy search)
        const [transactionsResult, overviewResult] = await Promise.all([
          isT3Admin 
            ? t3Service.getTransactions({ page: 1, search: '' }) // Fetch all, filter client-side
            : api.request(`${T3SYSTEMADMIN_BASE}/transactions?page=${currentPage}&search=${encodeURIComponent(searchTerm || '')}`, { method: 'GET' }),
          isT3Admin
            ? t3Service.getTransactionOverview()
            : api.request(`${T3SYSTEMADMIN_BASE}/transactions/overview`, { method: 'GET' })
        ]);

        if (transactionsResult.success) {
          const transformed = transactionsResult.data.map(t => ({
            id: `T${String(t.id || t.transaction_id || '').padStart(6, '0')}`,
            type: t.type || 'Payment',
            merchantOrderNo: t.merchant_order_no || t.description || 'N/A',
            amount: `${(t.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t.currency || 'U'}`,
            net: `${((t.amount || 0) * 0.1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t.currency || 'U'}`,
            bonus: `${((t.amount || 0) * 0.01).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t.currency || 'U'}`,
            referralFees: `${((t.amount || 0) * 0.004).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t.currency || 'U'}`,
            time: t.created_at ? new Date(t.created_at).toLocaleString('en-GB') : 'N/A',
            reference: t.description || t.reference || 'N/A',
            status: t.status === 'completed' ? 'Success' : t.status === 'pending' ? 'Pending' : t.status === 'failed' ? 'Failed' : t.status || 'Success',
            rawData: t
          }));
          setTransactionsData(transformed);
        }

        if (overviewResult.success) {
          setStatsData(overviewResult.data);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setTransactionsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [currentPage, searchTerm, isT3Admin]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Apply search and pagination
  const { data: transactions, totalPages } = useMemo(
    () => filterAndPaginate(transactionsData, searchTerm, TRANSACTION_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [transactionsData, searchTerm, currentPage]
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    // CSV headers from column labels
    const headers = COLUMNS.map(col => col.label).join(',');
    
    // CSV rows from transaction data
    const rows = transactionsData.map(transaction => 
      COLUMNS.map(col => {
        const value = transaction[col.key] || '';
        // Escape values containing commas or quotes
        return value.includes(',') || value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    );
    
    // Combine headers and rows
    const csv = [headers, ...rows].join('\n');
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${date}_${randomNum}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actions = useMemo(() => [{
    icon: <Eye size={16} />,
    onClick: (row) => navigate(`${basePath}/transactions/${row.id}`),
    tooltip: 'View Details',
  }], [navigate, basePath]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction"
        description="Overview the Transaction Information"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          label="Total Transaction" 
          value={statsData ? `${(statsData.total_volume || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT` : '0.00 USDT'} 
          lastUpdate={new Date().toLocaleDateString('en-GB')} 
        />
        <StatCard 
          label="Today Transaction" 
          value={statsData ? `${(statsData.today_volume || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT` : '0.00 USDT'} 
          lastUpdate={new Date().toLocaleDateString('en-GB')} 
        />
      </div>

      <button
        onClick={handleExportCSV}
        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        <ArrowDownToLine size={20} />
        Export to CSV
      </button>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold">Transaction List</h2>
            
            <SearchBar
              placeholder="Search Transaction..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="max-w-sm"
            />

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            ) : (
              <DataTable
                columns={COLUMNS}
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
