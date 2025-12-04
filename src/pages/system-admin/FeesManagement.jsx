import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader } from '../../components/ui';
import { filterAndPaginate } from '../../lib/pagination';

const ITEMS_PER_PAGE = 10;
const TRANSACTION_SEARCH_KEYS = ['id', 'type', 'orderno', 'status', 'reference'];

export default function FeesManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const allTransactions = [
    { id: 'tx-a1b2c3d4', wallet: '0xF3A....12345', amount: '10,000.00 U', fees: '10.00 USDT', time: '01-11-2025 13:00', status: 'Success' },
    { id: 'tx-e5f6g7h8', wallet: '0xF4B....67890', amount: '15,500.00 U', fees: '20.00 USDT', time: '02-12-2025 14:30', status: 'Success' },
    { id: 'tx-i9j0k1l2', wallet: '0xF5C....13579', amount: '25,750.00 U', fees: '50.00 USDT', time: '03-13-2025 15:45', status: 'Success' },
    { id: 'tx-m3n4o5p6', wallet: '0xF6D....24680', amount: '30,000.00 U', fees: '100.00 USDT', time: '04-14-2025 10:15', status: 'Success' },
    { id: 'tx-q7r8s9t0', wallet: '0xF7E....35791', amount: '5,000.00 U', fees: '5.00 USDT', time: '05-15-2025 11:00', status: 'Success' },
  ];

  // Apply search and pagination
  const { data: transactions, totalPages } = useMemo(
    () => filterAndPaginate(allTransactions, searchTerm, TRANSACTION_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [searchTerm, currentPage]
  );

  const stats = [
    { label: 'Total Fees Collect', value: '100,000.00 USDT', lastUpdate: '17-11-2025' },
    { label: 'Monthly Fees Collect', value: '100,000.00 USDT', lastUpdate: '17-11-2025' },
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
    onClick: (row) => navigate(`/system-admin/transactions/${row.id}`),
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
          </div>
        </div>
      </div>
    </div>
  );
}
