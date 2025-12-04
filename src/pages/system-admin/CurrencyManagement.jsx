import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Settings, Trash2, Plus } from 'lucide-react';
import { PageHeader, DataTable, ConfirmDialog, Pagination } from '../../components/ui';
import { filterAndPaginate } from '../../lib/pagination';

const ITEMS_PER_PAGE = 10;

const CURRENCIES = [
  { id: 1, country: 'Malaysia', code: 'RM', flag: '🇲🇾', rate: 4.1, updatedAt: '01-11-2025 14:00', status: 'Active' },
  { id: 2, country: 'Singapore', code: 'SGD', flag: '🇸🇬', rate: 3.5, updatedAt: '01-11-2025 14:00', status: 'Active' },
  { id: 3, country: 'Indonesia', code: 'IDR', flag: '🇮🇩', rate: 15000, updatedAt: '01-11-2025 14:00', status: 'Active' },
  { id: 4, country: 'Vietnam', code: 'VND', flag: '🇻🇳', rate: 23000, updatedAt: '01-11-2025 14:00', status: 'Active' },
  { id: 5, country: 'Thailand', code: 'THB', flag: '🇹🇭', rate: 32, updatedAt: '01-11-2025 14:00', status: 'Active' },
  { id: 6, country: 'Philippines', code: 'PHP', flag: '🇵🇭', rate: 50, updatedAt: '01-11-2025 14:00', status: 'Active' },
  { id: 7, country: 'Brunei', code: 'BND', flag: '🇧🇳', rate: 3.2, updatedAt: '01-11-2025 14:00', status: 'Inactive' },
];

export default function CurrencyManagement() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const columns = [
    {
      key: 'currencies',
      label: 'Currencies',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <span className="text-xl">{row.flag}</span>
          <span>{row.country} - {row.code}</span>
        </div>
      ),
    },
    {
      key: 'rate',
      label: 'Rate',
      render: (value) => `${value.toLocaleString()} : 1`,
    },
    { key: 'updatedAt', label: 'Update On' },
    { key: 'status', label: 'Status' },
  ];

  const actions = [
    {
      icon: <Eye size={16} />,
      onClick: (row) => navigate(`/system-admin/currency/${row.id}/view`),
      tooltip: 'View',
    },
    {
      icon: <Settings size={16} />,
      onClick: (row) => navigate(`/system-admin/currency/${row.id}/edit`),
      tooltip: 'Edit',
    },
    {
      icon: <Trash2 size={16} />,
      onClick: (row) => setDeleteDialog({ open: true, id: row.id }),
      variant: 'danger',
      tooltip: 'Delete',
    },
  ];

  const { data: paginatedData, totalPages } = useMemo(
    () => filterAndPaginate(CURRENCIES, '', [], currentPage, ITEMS_PER_PAGE),
    [currentPage]
  );

  const handleDelete = () => {
    console.log('Delete currency:', deleteDialog.id);
    setDeleteDialog({ open: false, id: null });
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Currencies Setting"
          description="Oversee currency management for various regions, ensuring accurate conversion rates to USD"
        />

        {/* New Currency Button */}
        <div className="flex">
          <button
            onClick={() => navigate('/system-admin/currency/add')}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            Add New Currencies Rate
          </button>
        </div>


        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold">Currencies List</h2>
              <DataTable
                columns={columns}
                data={paginatedData}
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
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Currency"
        message="Are you sure you want to delete this currency? This action cannot be undone."
      />
    </>
  );
}
