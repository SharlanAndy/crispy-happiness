import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Settings, Trash2, ArrowDownToLine } from 'lucide-react';
import { StatCard, DataTable, SearchBar, PageHeader, ConfirmDialog, AddAgentModal } from '../../components/ui';
import { filterAndPaginate } from '../../lib/pagination';

const ITEMS_PER_PAGE = 10;
const AGENT_SEARCH_KEYS = ['id', 'status', 'bonus', 'l1', 'l2', 'join'];

export default function AgentManagement() {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const allAgents = [
    { id: 'T000001', type: 'Payment', orderno: 'M1234567890', amount: '500.00 U', netprofit: '50.00 U', bonus: '5.00 U', time: '01-11-2025 13:00', reference: 'Ref001', status: 'Success' },
    { id: 'T000002', type: 'Payment', orderno: 'M1234567890', amount: '500.00 U', netprofit: '50.00 U', bonus: '5.00 U', time: '01-11-2025 13:00', reference: 'Ref001', status: 'Pending' },
    { id: 'T000003', type: 'Payment', orderno: 'M1234567890', amount: '500.00 U', netprofit: '50.00 U', bonus: '5.00 U', time: '01-11-2025 13:00', reference: 'Ref001', status: 'Failed' },
  ];

  // Apply search and pagination
  const { data: agents, totalPages } = useMemo(
    () => filterAndPaginate(allAgents, searchTerm, AGENT_SEARCH_KEYS, currentPage, ITEMS_PER_PAGE),
    [searchTerm, currentPage]
  );

  const stats = [
    { label: 'Total Transaction', value: '1,000.00 USDT', lastUpdate: '17-11-2025' },
    { label: 'Today Transaction', value: '900.00 USDT', lastUpdate: '17-11-2025' },
  ];

  const columns = [
    { key: 'id', label: 'Trans. ID' },
    { key: 'type', label: 'Type' },
    { key: 'orderno', label: 'Merchant Order No.' },
    { key: 'amount', label: 'Amount' },
    { key: 'netprofit', label: 'Net Profit' },
    { key: 'bonus', label: 'Bonus' },
    { key: 'time', label: 'Time' },
    { key: 'reference', label: 'Reference' },
    { key: 'status', label: 'Status' },
  ];

  const handleDelete = (agent) => {
    console.log('Deleting agent:', agent.id);
    // TODO: api.agent.delete(agent.id);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const actions = [{
    icon: <Eye size={16} />,
    onClick: (row) => navigate(`/system-admin/transactions/${row.id}`),
    tooltip: 'View Details',
  }];

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Transaction"
          description="Overview the Transaction Information"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* New Agent Button */}
        <div className="flex">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowDownToLine size={20} />
            Export to CSV
          </button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold">Transaction List</h2>
              
              {/* Search */}
              <SearchBar
                placeholder="Search Transaction..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="max-w-sm"
              />

              {/* Data Table */}
              <DataTable
                columns={columns}
                data={agents}
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

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={() => handleDelete(deleteConfirm.item)}
        title="Delete Agent"
        message={`Are you sure you want to delete agent ${deleteConfirm.item?.id}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
